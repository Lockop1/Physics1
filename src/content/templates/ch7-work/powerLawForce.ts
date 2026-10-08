import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx } from "../helpers";

/** W = ∫ a xⁿ dx = a (x_f^{n+1} − x_i^{n+1})/(n+1). */
export function solve(p: { a: number; n: number; xi: number; xf: number }): { W: number } {
  return { W: (p.a * (Math.pow(p.xf, p.n + 1) - Math.pow(p.xi, p.n + 1))) / (p.n + 1) };
}

export const template: QuestionTemplate = {
  id: "ch7.varying-force.power-law",
  topicId: "ch7.varying-force",
  title: "Work by F = a xⁿ (integrate)",
  source: "Ch 7 lecture — 7.3 Work done by a varying force (W = ∫F dx)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ a: nice(rng, -6, 8, 0.5), n: rng.pick([1, 2, 3]), xi: nice(rng, 0, 3, 0.5), xf: nice(rng, 1, 6, 0.5) }),
      (c) => c.a !== 0 && c.xf > c.xi && Math.abs(solve(c).W) > 1 && Math.abs(solve(c).W) < 2000,
    );
    const { W } = solve(p);
    const Fend = p.a * Math.pow(p.xf, p.n);
    const unitA = p.n === 1 ? "N/m" : `N/m^{${p.n}}`;
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `A force $F(x) = ${p.a}\\,x^{${p.n}}$ N (with $x$ in meters) acts on a particle along the $x$-axis. How much work does it do as the particle moves from $x = ${p.xi}$ m to $x = ${p.xf}$ m?`,
      givens: [
        { symbol: "a", value: p.a, unit: unitA },
        { symbol: "n", value: p.n, unit: "" },
        { symbol: "x_i", value: p.xi, unit: "m" },
        { symbol: "x_f", value: p.xf, unit: "m" },
      ],
      target: { symbol: "W", unit: "J", label: "work" },
      answer: toSigFigs(W, 4),
      choices: buildNumericChoices(rng, W, [
        { errorId: "area-as-F-times-d", value: Fend * (p.xf - p.xi) },
        { errorId: "integrated-wrong-power", value: p.a * (Math.pow(p.xf, p.n) - Math.pow(p.xi, p.n)) },
        { errorId: "integrated-wrong-power", value: p.a * (Math.pow(p.xf, p.n + 1) - Math.pow(p.xi, p.n + 1)) },
        { errorId: "work-sign-flip", value: -W },
      ]),
      equations: ["work-integral"],
      recipe: ["Varying force → W = ∫F dx (NOT F·Δx)", `∫ a xⁿ dx = a xⁿ⁺¹/(n+1)`, "Evaluate between the limits"],
      hints: ["The force changes with x, so W = Fd cos θ does not apply. Integrate.", `∫ x^${p.n} dx = x^${p.n + 1}/${p.n + 1}.`, `W = ${p.a}(${p.xf}^${p.n + 1} − ${p.xi}^${p.n + 1})/${p.n + 1}.`],
      solution: [
        { text: "Set up the work integral.", latex: `W = \\int_{${p.xi}}^{${p.xf}} ${p.a}\\,x^{${p.n}}\\,dx = ${p.a}\\left[\\frac{x^{${p.n + 1}}}{${p.n + 1}}\\right]_{${p.xi}}^{${p.xf}}`, equationId: "work-integral" },
        { text: "Evaluate.", latex: `W = \\frac{${p.a}}{${p.n + 1}}\\left(${p.xf}^{${p.n + 1}} - ${p.xi}^{${p.n + 1}}\\right) = ${fx(W)}\\ \\text{J}`, equationId: "work-integral", value: toSigFigs(W, 4) },
      ],
      note: W < 0 ? "Negative: the force opposes the motion over this interval." : undefined,
    };
  },
};
