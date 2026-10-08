/**
 * Property test: every registered template, over many seeds, produces a
 * structurally valid question whose answer is consistent with its solution.
 */
import { describe, it, expect } from "vitest";
import { TEMPLATES } from "../../src/content/templates";
import { ERROR_IDS } from "../../src/content/errors";
import { EQUATION_IDS } from "../../src/content/equations";
import { TOPICS } from "../../src/content/topics";
import { createRng } from "../../src/engine/rng";
import { within } from "../../src/engine/check";
import { MIN_SEPARATION } from "../../src/engine/distractors";

const SEEDS = 300;
const topicIds = new Set(TOPICS.map((t) => t.id));

describe.each(TEMPLATES.map((t) => [t.id, t] as const))("template %s", (_id, t) => {
  it("belongs to a known topic", () => {
    expect(topicIds.has(t.topicId)).toBe(true);
  });

  it(`generates valid questions over ${SEEDS} seeds`, () => {
    const seenVariants = new Set<string>();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const q = t.generate(createRng(seed));
      expect(q.templateId).toBe(t.id);
      expect(q.seed).toBe(seed);
      if (q.variant) seenVariants.add(q.variant);

      // answer finite (numeric) or non-empty (string)
      if (typeof q.answer === "number") expect(Number.isFinite(q.answer)).toBe(true);
      else expect(q.answer.length).toBeGreaterThan(0);

      // exactly one correct choice, 4–5 choices
      expect(q.choices.length).toBeGreaterThanOrEqual(4);
      expect(q.choices.length).toBeLessThanOrEqual(5);
      const correct = q.choices.filter((c) => c.correct);
      expect(correct.length).toBe(1);

      // correct choice equals the answer
      const cv = correct[0]!.value;
      if (typeof q.answer === "number") {
        expect(typeof cv).toBe("number");
        expect(within(cv as number, q.answer, 0.005)).toBe(true);
      } else {
        expect(cv).toBe(q.answer);
      }

      // distractors: separated, each has a known errorId
      const numericValues = q.choices.filter((c) => typeof c.value === "number").map((c) => c.value as number);
      for (let i = 0; i < numericValues.length; i++) {
        for (let j = i + 1; j < numericValues.length; j++) {
          expect(within(numericValues[i]!, numericValues[j]!, MIN_SEPARATION)).toBe(false);
        }
      }
      const stringValues = q.choices.filter((c) => typeof c.value === "string").map((c) => c.value as string);
      expect(new Set(stringValues).size).toBe(stringValues.length);
      for (const c of q.choices) {
        if (c.correct) continue;
        expect(c.errorId, `distractor ${String(c.value)} needs an errorId`).toBeDefined();
        expect(ERROR_IDS.has(c.errorId!), `unknown errorId ${c.errorId}`).toBe(true);
      }

      // equations exist
      expect(q.equations.length).toBeGreaterThan(0);
      for (const e of q.equations) expect(EQUATION_IDS.has(e), `unknown equation ${e}`).toBe(true);
      for (const s of q.solution) if (s.equationId) expect(EQUATION_IDS.has(s.equationId)).toBe(true);

      // hints / recipe / solution present
      expect(q.hints.length).toBeGreaterThanOrEqual(1);
      expect(q.recipe.length).toBeGreaterThanOrEqual(1);
      expect(q.solution.length).toBeGreaterThanOrEqual(1);

      // last solution step's value matches the numeric answer
      if (typeof q.answer === "number") {
        const last = q.solution[q.solution.length - 1]!;
        expect(last.value, "last solution step must carry a value").toBeDefined();
        expect(within(last.value!, q.answer, 0.005)).toBe(true);
      }

      // "nice" numbers: every given has ≤ 4 significant figures
      for (const g of q.givens) {
        const sf = sigFigsOf(g.value);
        expect(sf, `given ${g.symbol}=${g.value} has ${sf} sig figs`).toBeLessThanOrEqual(4);
      }
    }
    // every declared variant actually appears
    if (t.variants) for (const v of t.variants) expect(seenVariants.has(v), `variant ${v} never generated`).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    const a = t.generate(createRng(4242));
    const b = t.generate(createRng(4242));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("honours a requested variant", () => {
    if (!t.variants) return;
    for (const v of t.variants) {
      const q = t.generate(createRng(7), { variant: v });
      expect(q.variant).toBe(v);
    }
  });
});

function sigFigsOf(x: number): number {
  if (x === 0) return 1;
  const s = Math.abs(x).toExponential(12).split("e")[0]!.replace(".", "").replace(/0+$/, "");
  return s.length;
}
