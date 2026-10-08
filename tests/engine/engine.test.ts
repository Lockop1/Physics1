import { describe, it, expect, beforeEach } from "vitest";
import { createRng } from "../../src/engine/rng";
import { toSigFigs, nice, fmt, fmtTex, fmtDisplay, rejectUntil } from "../../src/engine/params";
import { checkNumeric, parseNumber } from "../../src/engine/check";
import { buildNumericChoices, buildStringChoices } from "../../src/engine/distractors";
import { weightFor, pickWeighted } from "../../src/engine/selection";
import * as storage from "../../src/lib/storage";
import { ERRORS } from "../../src/content/errors";
import { EQUATIONS } from "../../src/content/equations";

describe("rng", () => {
  it("is deterministic and in range", () => {
    const a = createRng(123);
    const b = createRng(123);
    for (let i = 0; i < 50; i++) {
      const x = a.next();
      expect(x).toBe(b.next());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    const r = createRng(9);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });
  it("shuffle is a permutation", () => {
    const r = createRng(5);
    const s = r.shuffle([1, 2, 3, 4, 5]);
    expect([...s].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("params", () => {
  it("rounds to sig figs", () => {
    expect(toSigFigs(34.8713, 3)).toBe(34.9);
    expect(toSigFigs(0.0012345, 3)).toBe(0.00123);
    expect(toSigFigs(123456, 2)).toBe(120000);
  });
  it("nice values land on the grid", () => {
    const r = createRng(1);
    for (let i = 0; i < 100; i++) {
      const v = nice(r, 20, 60, 5);
      expect(v % 5).toBe(0);
      expect(v).toBeGreaterThanOrEqual(20);
      expect(v).toBeLessThanOrEqual(60);
    }
  });
  it("formats", () => {
    expect(fmt(142.3)).toBe("142");
    expect(fmt(0.000123)).toBe("1.23e-4");
    expect(fmtTex(5.97e24)).toBe("5.97 \\times 10^{24}");
    expect(fmt(2.5)).toBe("2.5");
    expect(fmt(1430)).toBe("1430");
    expect(fmt(123456)).toBe("1.23e5");
    expect(fmt(35)).toBe("35");
    expect(fmt(0.0706)).toBe("0.0706");
    expect(fmtDisplay(1430)).toBe("1430");
    expect(fmtDisplay(143000)).toBe("$1.43 \\times 10^{5}$");
  });
  it("rejectUntil retries", () => {
    let n = 0;
    const v = rejectUntil(() => n++, (x) => x >= 3);
    expect(v).toBe(3);
  });
});

describe("check", () => {
  it("parses many number formats", () => {
    expect(parseNumber(" 1,234.5 ")).toBe(1234.5);
    expect(parseNumber("1.2e3")).toBe(1200);
    expect(parseNumber("1.2×10^3")).toBe(1200);
    expect(parseNumber("1.2x10^-2")).toBeCloseTo(0.012);
    expect(parseNumber("−3.5 m/s")).toBe(-3.5);
    expect(parseNumber("abc")).toBeNull();
  });
  it("accepts within ±2%", () => {
    expect(checkNumeric("142", 141.8).correct).toBe(true);
    expect(checkNumeric("145", 141.8).correct).toBe(false);
    expect(checkNumeric("0", 0).correct).toBe(true);
    expect(checkNumeric("0.01", 0).correct).toBe(true);
  });
});

describe("distractors", () => {
  it("dedupes within 3% and fills to 4 with arithmetic-slip", () => {
    const r = createRng(2);
    const choices = buildNumericChoices(r, 100, [
      { errorId: "forgot-square", value: 101 }, // too close → dropped
      { errorId: "diameter-as-radius", value: 200 },
    ]);
    expect(choices.length).toBe(4);
    expect(choices.filter((c) => c.correct).length).toBe(1);
    expect(choices.some((c) => c.errorId === "forgot-square")).toBe(false);
    expect(choices.some((c) => c.errorId === "diameter-as-radius")).toBe(true);
    expect(choices.filter((c) => c.errorId === "arithmetic-slip").length).toBe(2);
  });
  it("string choices dedupe", () => {
    const r = createRng(2);
    const c = buildStringChoices(r, "Up", [{ value: "Down" }, { value: "Up" }, { value: "Left", errorId: "cw-ccw-swap" }]);
    expect(c.length).toBe(3);
  });
});

describe("selection", () => {
  it("weights weak templates higher", () => {
    const strong = { attempts: 10, correct: 10, recent: Array(10).fill(true), lastSeen: Date.now() };
    const weak = { attempts: 10, correct: 2, recent: [true, false, false, false, false], lastSeen: Date.now() };
    expect(weightFor(weak)).toBeGreaterThan(weightFor(strong));
    expect(weightFor(undefined)).toBeGreaterThan(weightFor(strong));
    const r = createRng(3);
    const picks = { a: 0, b: 0 };
    for (let i = 0; i < 1000; i++) picks[pickWeighted(r, ["a", "b"] as const, (k) => (k === "a" ? 3 : 1))]++;
    expect(picks.a).toBeGreaterThan(picks.b * 2);
  });
});

describe("storage (no window → in-memory fallback)", () => {
  beforeEach(() => storage.resetCache());
  it("records attempts and errors", () => {
    storage.recordAttempt("t1", false, "forgot-square");
    storage.recordAttempt("t1", true);
    const s = storage.getTemplateStats("t1")!;
    expect(s.attempts).toBe(2);
    expect(s.correct).toBe(1);
    expect(s.recent).toEqual([false, true]);
    expect(storage.load().errors["forgot-square"]).toBe(1);
  });
  it("keeps only the last 10 results", () => {
    for (let i = 0; i < 15; i++) storage.recordAttempt("t2", i % 2 === 0);
    expect(storage.getTemplateStats("t2")!.recent.length).toBe(10);
  });
  it("export/import round-trips and migrate tolerates junk", () => {
    storage.recordAttempt("t3", true);
    storage.updateSettings({ examDate: "2026-11-01" });
    const json = storage.exportJson();
    storage.resetCache();
    expect(storage.importJson(json)).toBeNull();
    expect(storage.getTemplateStats("t3")!.attempts).toBe(1);
    expect(storage.getSettings().examDate).toBe("2026-11-01");
    expect(storage.importJson("not json")).not.toBeNull();
    expect(storage.migrate(null)).toBeNull();
    expect(storage.migrate({ templates: "bad" })!.templates).toEqual({});
  });
  it("mastery", () => {
    storage.recordAttempt("m1", true);
    storage.recordAttempt("m1", true);
    const m = storage.masteryFor(["m1", "m2"]);
    expect(m.mastery).toBe(0.5);
    expect(m.attempts).toBe(2);
    expect(storage.masteryFor(["zzz"]).mastery).toBeNull();
  });
});

describe("content integrity", () => {
  it("error ids are unique and equations have unique ids with all fields", () => {
    expect(new Set(ERRORS.map((e) => e.id)).size).toBe(ERRORS.length);
    expect(new Set(EQUATIONS.map((e) => e.id)).size).toBe(EQUATIONS.length);
    const ids = new Set(EQUATIONS.map((e) => e.id));
    for (const e of EQUATIONS) {
      expect(e.useWhen.length).toBeGreaterThan(0);
      expect(e.dontUseWhen.length).toBeGreaterThan(0);
      expect(e.triggers.length).toBeGreaterThan(0);
      expect(e.variables.length).toBeGreaterThan(0);
      for (const d of e.derivedFrom ?? []) expect(ids.has(d), `derivedFrom ${d}`).toBe(true);
      if (!e.onSheet) expect(e.derivedFrom?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
