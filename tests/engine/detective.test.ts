import { describe, it, expect, beforeEach } from "vitest";
import { TEMPLATES } from "../../src/content/templates";
import { EQUATION_IDS, equationById } from "../../src/content/equations";
import { ERROR_IDS } from "../../src/content/errors";
import { createRng } from "../../src/engine/rng";
import { buildEquationOptions, gradeEquationPick, hideNumbers, buildTagging, gradeTagging, shuffleRecipe, gradeRecipe, selectDecoys, NOT_NEEDED } from "../../src/engine/detective";
import { TRAPS } from "../../src/content/detective/traps";
import { FLASHCARDS } from "../../src/content/detective/flashcards";
import * as storage from "../../src/lib/storage";

describe("decoy selection", () => {
  it("decoys never overlap the template's equations, 6–8 options, over every template and 50 seeds", () => {
    for (const t of TEMPLATES) {
      for (let seed = 1; seed <= 50; seed++) {
        const q = t.generate(createRng(seed));
        const { options, correct } = buildEquationOptions(createRng(seed), q);
        const decoys = options.filter((e) => !correct.has(e.id));
        for (const d of decoys) expect(q.equations.includes(d.id), `${t.id}#${seed}: decoy ${d.id} is also correct`).toBe(false);
        expect(options.length).toBeGreaterThanOrEqual(6);
        expect(options.length).toBeLessThanOrEqual(8);
        expect(new Set(options.map((o) => o.id)).size).toBe(options.length);
        for (const id of correct) expect(options.some((o) => o.id === id)).toBe(true);
      }
    }
  });
  it("prefers the same chapter", () => {
    const decoys = selectDecoys(createRng(1), ["ac-v2-over-r"], 4);
    expect(decoys.filter((d) => d.chapter === "Ch 4").length).toBeGreaterThanOrEqual(3);
  });
});

describe("grading", () => {
  it("set equality", () => {
    const correct = new Set(["a", "b"]);
    expect(gradeEquationPick(["a", "b"], correct).correct).toBe(true);
    expect(gradeEquationPick(["b", "a"], correct).correct).toBe(true);
    const g = gradeEquationPick(["a", "c"], correct);
    expect(g.correct).toBe(false);
    expect(g.missing).toEqual(["b"]);
    expect(g.extra).toEqual(["c"]);
  });
  it("recipe ordering", () => {
    expect(gradeRecipe([0, 1, 2]).correct).toBe(true);
    expect(gradeRecipe([1, 0, 2])).toEqual({ correct: false, firstWrong: 0 });
    const s = shuffleRecipe(createRng(3), ["a", "b", "c", "d"]);
    expect([...s.order].sort()).toEqual([0, 1, 2, 3]);
    expect(s.order.some((v, i) => v !== i)).toBe(true);
  });
  it("tagging grades symbols, target and irrelevant givens", () => {
    const t = TEMPLATES.find((x) => x.id === "ch5.friction.cabinet-push")!;
    const q = t.generate(createRng(2), { variant: "push" });
    const setup = buildTagging(createRng(2), q);
    expect(setup.items.some((i) => i.correctTag === NOT_NEEDED)).toBe(true); // μ_k is marked "not needed"
    const perfect = gradeTagging(setup, setup.items.map((i) => i.correctTag), setup.correctTarget);
    expect(perfect.allCorrect).toBe(true);
    expect(perfect.irrelevantSpotted).toBe(perfect.irrelevantTotal);
    const bad = gradeTagging(setup, setup.items.map(() => "zzz"), "zzz");
    expect(bad.correctTags).toBe(0);
    expect(bad.targetCorrect).toBe(false);
    expect(setup.targetOptions).toContain(setup.correctTarget);
    expect(setup.tagOptions).toContain(NOT_NEEDED);
  });
});

describe("hideNumbers", () => {
  it("blanks numbers in text and math but keeps exponents/subscripts", () => {
    const h = hideNumbers("A $12.5\\ \\text{kg}$ block moves at $3.0\\ \\text{m/s}$ for 4 s; $v^2$ and $x_1$ and $6.67 \\times 10^{-11}$.");
    expect(h).not.toMatch(/12\.5|3\.0|6\.67/);
    expect(h).toContain("v^2");
    expect(h).toContain("x_1");
    expect(h).toContain("\\square");
    expect(h).toContain("▢ s");
  });
});

describe("trap scenarios", () => {
  it("has ≥ 25, each with a valid correct index, explanation, equations and errorId", () => {
    expect(TRAPS.length).toBeGreaterThanOrEqual(25);
    expect(new Set(TRAPS.map((t) => t.id)).size).toBe(TRAPS.length);
    for (const t of TRAPS) {
      expect(t.options.length).toBeGreaterThanOrEqual(3);
      expect(t.options.length).toBeLessThanOrEqual(4);
      expect(t.correct).toBeGreaterThanOrEqual(0);
      expect(t.correct).toBeLessThan(t.options.length);
      expect(t.explanation.length).toBeGreaterThan(20);
      expect(new Set(t.options).size).toBe(t.options.length);
      for (const e of t.equations) expect(EQUATION_IDS.has(e), `${t.id}: ${e}`).toBe(true);
      if (t.errorId) expect(ERROR_IDS.has(t.errorId), `${t.id}: ${t.errorId}`).toBe(true);
    }
  });
});

describe("flashcards", () => {
  it("reference valid equations and have unique ids", () => {
    expect(new Set(FLASHCARDS.map((c) => c.id)).size).toBe(FLASHCARDS.length);
    for (const c of FLASHCARDS) {
      expect(c.equationIds.length).toBeGreaterThan(0);
      for (const e of c.equationIds) expect(equationById(e), `${c.id}: ${e}`).toBeDefined();
      expect(c.front.length).toBeGreaterThan(3);
    }
  });
});

describe("storage v1 → v2 migration", () => {
  beforeEach(() => storage.resetCache());
  it("keeps v1 data and adds the detective block", () => {
    const v1 = {
      version: 1,
      templates: { "ch4.ucm.ac-rpm": { attempts: 3, correct: 2, recent: [true, false, true], lastSeen: 123 } },
      errors: { "forgot-square": 2 },
      equations: { "ac-v2-over-r": { attempts: 4, correct: 3 } },
      settings: { examDate: "2026-11-01", defaultMode: "free", theme: "dark" },
      lastQuestion: "ch4.ucm.ac-rpm/55",
    };
    const m = storage.migrate(v1)!;
    expect(m.version).toBe(2);
    expect(m.templates["ch4.ucm.ac-rpm"]!.attempts).toBe(3);
    expect(m.errors["forgot-square"]).toBe(2);
    expect(m.equations["ac-v2-over-r"]!.correct).toBe(3);
    expect(m.settings.examDate).toBe("2026-11-01");
    expect(m.lastQuestion).toBe("ch4.ucm.ac-rpm/55");
    expect(m.detective).toEqual({ modes: {}, traps: {}, flashcards: {} });
    // round trip through import
    expect(storage.importJson(JSON.stringify(v1))).toBeNull();
    expect(storage.getTemplateStats("ch4.ucm.ac-rpm")!.correct).toBe(2);
    storage.recordTrap("n-incline", true);
    storage.recordFlashcard("sit-flat-curve-vmax", false);
    expect(storage.getDetective().traps["n-incline"]!.correct).toBe(1);
    expect(storage.getDetective().modes["trap"]!.attempts).toBe(1);
    expect(storage.getDetective().flashcards["sit-flat-curve-vmax"]!.missed).toBe(1);
  });
});
