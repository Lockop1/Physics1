import { describe, it, expect, beforeEach } from "vitest";
import { buildExam } from "../../src/engine/exam";
import { weakSpotWeight, errorsProducedBy, templatesProducing, topErrors } from "../../src/engine/selection";
import { TEMPLATES, templateById } from "../../src/content/templates";
import { CHAPTERS } from "../../src/content/topics";
import { createRng } from "../../src/engine/rng";
import * as storage from "../../src/lib/storage";

describe("exam builder", () => {
  it("20-question Exam 2 sim: no duplicate templates, ~25% conceptual, deterministic from its seed, all buildable", () => {
    const items = buildExam(12345, { exam: "exam2", count: 20 });
    expect(items.length).toBe(20);
    expect(new Set(items.map((i) => i.templateId)).size).toBe(20);
    const conceptual = items.filter((i) => templateById(i.templateId)!.kind === "conceptual").length;
    expect(conceptual).toBe(5);
    const exam2Topics = new Set(CHAPTERS.filter((c) => c.exam === "exam2").flatMap((c) => c.topics.map((t) => t.id)));
    for (const it of items) {
      const t = templateById(it.templateId)!;
      expect(exam2Topics.has(t.topicId)).toBe(true);
      const q = t.generate(createRng(it.seed));
      expect(q.choices.filter((c) => c.correct).length).toBe(1);
    }
    expect(buildExam(12345, { exam: "exam2", count: 20 })).toEqual(items);
    expect(buildExam(54321, { exam: "exam2", count: 20 })).not.toEqual(items);
  });
  it("repeats templates only when the pool is smaller than the request", () => {
    const n = TEMPLATES.length + 10;
    const items = buildExam(7, { exam: "mixed", count: n });
    expect(items.length).toBe(n);
  });
  it("topics are weighted by template count: over many exams, draw frequency ∝ templates per topic", () => {
    const counts = new Map<string, number>();
    for (let s = 1; s <= 200; s++) for (const it of buildExam(s, { exam: "exam2", count: 20 })) counts.set(templateById(it.templateId)!.topicId, (counts.get(templateById(it.templateId)!.topicId) ?? 0) + 1);
    const ch7 = CHAPTERS.find((c) => c.id === "ch7")!;
    const perTopic = ch7.topics.map((t) => ({ n: TEMPLATES.filter((x) => x.topicId === t.id).length, drawn: counts.get(t.id) ?? 0 }));
    // the topic with the most templates should be drawn more than the one with the fewest
    const most = perTopic.reduce((a, b) => (a.n > b.n ? a : b));
    const least = perTopic.reduce((a, b) => (a.n < b.n ? a : b));
    if (most.n > least.n) expect(most.drawn).toBeGreaterThan(least.drawn);
  });
});

describe("weak-spot weights", () => {
  const now = 1_000_000_000_000;
  it("low accuracy, staleness and committed errors each raise the weight", () => {
    const strong = { attempts: 10, correct: 10, recent: Array(10).fill(true), lastSeen: now };
    const weak = { attempts: 10, correct: 2, recent: [false, false, true, false, false], lastSeen: now };
    const stale = { ...strong, lastSeen: now - 10 * 86_400_000 };
    expect(weakSpotWeight({ stats: weak, now })).toBeGreaterThan(weakSpotWeight({ stats: strong, now }) * 2);
    expect(weakSpotWeight({ stats: stale, now })).toBeGreaterThan(weakSpotWeight({ stats: strong, now }));
    expect(weakSpotWeight({ stats: undefined, now })).toBeGreaterThan(weakSpotWeight({ stats: strong, now }));
    const withErr = weakSpotWeight({ stats: strong, errorIds: ["forgot-square"], errorCounts: { "forgot-square": 8, "cm-not-converted": 2 }, now });
    const without = weakSpotWeight({ stats: strong, errorIds: ["rpm-not-converted"], errorCounts: { "forgot-square": 8, "cm-not-converted": 2 }, now });
    expect(withErr).toBeGreaterThan(without);
  });
  it("templatesProducing finds the ac-rpm template for rpm-not-converted and topErrors sorts", () => {
    const ids = templatesProducing("rpm-not-converted", TEMPLATES).map((t) => t.id);
    expect(ids).toContain("ch4.ucm.ac-rpm");
    expect(errorsProducedBy(templateById("ch5.pulleys.table-frictionless")!)).toContain("pulley-single-mass");
    expect(topErrors({ a: 1, b: 5, c: 3 }, 2)).toEqual([
      { errorId: "b", count: 5 },
      { errorId: "c", count: 3 },
    ]);
  });
});

describe("exam history storage (v3)", () => {
  beforeEach(() => storage.resetCache());
  it("migrates v2 data and records exams into template/error stats", () => {
    const v2 = { version: 2, templates: { x: { attempts: 1, correct: 1, recent: [true], lastSeen: 1 } }, errors: {}, equations: {}, settings: {}, detective: { modes: {}, traps: {}, flashcards: {} } };
    const m = storage.migrate(v2)!;
    expect(m.version).toBe(3);
    expect(m.exams).toEqual([]);
    expect(m.templates["x"]!.attempts).toBe(1);
    storage.importJson(JSON.stringify(v2));
    storage.recordExam({ id: "1-2", examSeed: 1, exam: "exam2", count: 2, timerSec: 0, startedAt: 1, finishedAt: 2, score: 1, items: [{ templateId: "x", seed: 1, picked: 0, correct: true }, { templateId: "y", seed: 2, picked: 1, correct: false, errorId: "forgot-square" }] });
    expect(storage.getExams().length).toBe(1);
    expect(storage.getTemplateStats("x")!.attempts).toBe(2);
    expect(storage.getTemplateStats("y")!.recent).toEqual([false]);
    expect(storage.getErrorCounts()["forgot-square"]).toBe(1);
  });
});
