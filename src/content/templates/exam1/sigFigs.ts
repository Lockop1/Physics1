import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

/** Significant figures: counting, multiplication (fewest sig figs), addition (fewest decimal places). Lecture: 12.71 × 3.46 → 44.0 m²; 23.2 + 5.174 → 28.4; r = 6.0 cm → A = 1.1 × 10² cm². */
export function sigFigsOf(s: string): number {
  const m = s.replace(/^-/, "").split(/\s*(?:e|×\s*10\^)/i)[0]!.trim();
  if (m.includes(".")) return m.replace(".", "").replace(/^0+/, "").length;
  return m.replace(/^0+/, "").replace(/0+$/, "").length || 1;
}
export function decimalsOf(s: string): number {
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}
/** Round a number to n significant figures, returned as a string (keeps trailing zeros). */
export function roundSig(x: number, n: number): string {
  return Number(x.toPrecision(n)).toPrecision(n).replace(/e\+?/, "e");
}

type Kind = "count" | "multiply" | "add";

export const template: QuestionTemplate = {
  id: "e1.units.sig-figs",
  topicId: "e1.units",
  title: "Significant figures: counting, products, sums",
  source: "Ch 1–2 lecture — significant-figure slides (1500 g; 12.71 m × 3.46 m = 44.0 m²; 23.2 + 5.174 = 28.4)",
  kind: "conceptual",
  difficulty: 1,
  variants: ["count", "multiply", "add"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const kind = (opts?.variant && this.variants!.includes(opts.variant) ? opts.variant : rng.pick(this.variants!)) as Kind;
    if (kind === "count") {
      const choicesPool = ["1500", "1.500 × 10^3", "1.50 × 10^3", "0.00023", "2.30 × 10^-4", "0.0405", "120.0", "7.00", "3.0 × 10^2", "100", "0.50"];
      const pick = rng.pick(choicesPool);
      const n = sigFigsOf(pick);
      const ambiguous = pick === "1500" || pick === "100";
      const answer = ambiguous ? `${n} (trailing zeros without a decimal point are ambiguous — write it in scientific notation to be clear)` : `${n}`;
      const wrong = Array.from(new Set([n + 1, n - 1, n + 2, pick.replace(/[^0-9]/g, "").length, n + 3, n - 2, n + 4].filter((k) => k >= 1 && k !== n))).map((k) => ({ value: `${k}`, errorId: "sig-figs-rule" }));
      return {
        templateId: this.id,
        seed: rng.seed,
        variant: kind,
        prompt: `How many significant figures are in $${pick.replace("× 10^", "\\times 10^{").replace(/(\{-?\d+)$/, "$1}")}$?`,
        givens: [],
        target: { symbol: "", unit: "", label: "number of significant figures" },
        answer,
        choices: buildStringChoices(rng, answer, Array.from(new Map(wrong.map((w) => [w.value, w])).values()).slice(0, 3)),
        equations: ["unit-conversion"],
        recipe: ["Leading zeros never count", "Zeros between digits always count", "Trailing zeros count only if there is a decimal point (or in scientific notation)"],
        hints: ["Leading zeros are placeholders, not significant.", "In scientific notation every digit of the mantissa is significant.", `${pick} → ${n}.`],
        solution: [{ text: `${pick} has ${n} significant figure${n === 1 ? "" : "s"}. ${ambiguous ? "Trailing zeros with no decimal point are ambiguous; 1.5 × 10³ has 2, 1.50 × 10³ has 3, 1.500 × 10³ has 4." : "Leading zeros don't count; digits in a scientific-notation mantissa and trailing zeros after a decimal point do."}` }],
      };
    }
    if (kind === "multiply") {
      const a = rng.pick(["12.71", "3.46", "2.5", "8.00", "0.045", "1.2", "15.0", "6.0"]);
      const b = rng.pick(["3.46", "2.0", "7.25", "0.80", "12.0", "4.5", "1.75"]);
      const prod = Number(a) * Number(b);
      const n = Math.min(sigFigsOf(a), sigFigsOf(b));
      const answer = roundSig(prod, n);
      const wrongs = [roundSig(prod, n + 1), roundSig(prod, Math.max(1, n - 1)), String(Number(prod.toFixed(4))), roundSig(prod, Math.max(sigFigsOf(a), sigFigsOf(b))), roundSig(prod, n + 2), roundSig(prod * 10, n), roundSig(prod / 10, n)].filter((w) => w !== answer).map((w) => ({ value: w, errorId: "sig-figs-rule" }));
      return {
        templateId: this.id,
        seed: rng.seed,
        variant: kind,
        prompt: `A rectangular room measures ${a} m by ${b} m. Reported to the correct number of significant figures, its area is`,
        givens: [],
        target: { symbol: "A", unit: "m²", label: "area with correct sig figs" },
        answer,
        choices: buildStringChoices(rng, answer, Array.from(new Map(wrongs.map((w) => [w.value, w])).values()).slice(0, 3)),
        equations: ["unit-conversion"],
        recipe: ["Multiply", "Round to the number of SIGNIFICANT FIGURES of the least precise factor"],
        hints: ["Products and quotients: the answer can't be more precise than the least precise factor.", `${a} has ${sigFigsOf(a)} sig figs, ${b} has ${sigFigsOf(b)}.`, `Calculator: ${prod.toPrecision(6)} → ${n} sig figs.`],
        solution: [{ text: `Calculator gives ${prod.toPrecision(6)}. The factor with the fewest significant figures has ${n}, so the answer is reported with ${n}: ${answer} m².`, latex: `${a} \\times ${b} \\to ${answer}\\ \\text{m}^2` }],
      };
    }
    const a = rng.pick(["23.2", "5.174", "100.0", "0.45", "12", "7.25", "3.1"]);
    const b = rng.pick(["5.174", "0.03", "2.5", "14", "0.008", "1.25"]);
    const sum = Number(a) + Number(b);
    const d = Math.min(decimalsOf(a), decimalsOf(b));
    const answer = sum.toFixed(d);
    const wrongs = [sum.toFixed(d + 1), sum.toFixed(Math.max(0, d - 1)), sum.toFixed(Math.max(decimalsOf(a), decimalsOf(b))), roundSig(sum, Math.min(sigFigsOf(a), sigFigsOf(b))), sum.toFixed(d + 2), (sum * 10).toFixed(d), (sum / 10).toFixed(d + 1)].filter((w) => w !== answer).map((w) => ({ value: w, errorId: "sig-figs-rule" }));
    return {
      templateId: this.id,
      seed: rng.seed,
      variant: kind,
      prompt: `Add ${a} and ${b}, reporting the result to the correct number of significant figures.`,
      givens: [],
      target: { symbol: "", unit: "", label: "sum with correct precision" },
      answer,
      choices: buildStringChoices(rng, answer, Array.from(new Map(wrongs.map((w) => [w.value, w])).values()).slice(0, 3)),
      equations: ["unit-conversion"],
      recipe: ["Add", "Round to the number of DECIMAL PLACES of the least precise term"],
      hints: ["Sums and differences are limited by decimal places, not sig figs.", `${a} has ${decimalsOf(a)} decimal place(s), ${b} has ${decimalsOf(b)}.`, `Calculator: ${sum} → ${d} decimal place(s).`],
      solution: [{ text: `Calculator gives ${sum}. The term with the fewest decimal places has ${d}, so the sum is ${answer}.`, latex: `${a} + ${b} \\to ${answer}` }],
    };
  },
};
