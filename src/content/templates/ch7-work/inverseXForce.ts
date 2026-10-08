import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx } from "../helpers";

/** W = ∫ (−a/x) dx = −a ln(x_f/x_i). Lecture #36: F = −2.0/x, 2.0 → 5.0 m → −1.83 J (slides round to −1.81). */
export function solve(p: { a: number; xi: number; xf: number }): { W: number } {
  return { W: -p.a * Math.log(p.xf / p.xi) };
}

export const template: QuestionTemplate = {
  id: "ch7.varying-force.inverse-x",
  topicId: "ch7.varying-force",
  title: "Work by F = −a/x (logarithm)",
  source: "Ch 7 lecture — Problem #36 (F = −2.0/x N, 2.0 → 5.0 m → −1.8 J)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ a: nice(rng, 0.5, 8, 0.5) * (rng.chance(0.75) ? 1 : -1), xi: nice(rng, 0.5, 4, 0.5), xf: nice(rng, 1, 10, 0.5) }),
      (c) => c.xf > 1.4 * c.xi && Math.abs(solve(c).W) > 0.3,
    );
    const { W } = solve(p);
    const sign = p.a > 0 ? "-" : "+";
    const mag = Math.abs(p.a);
    const Fstart = -p.a / p.xi;
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `How much work does the force $F(x) = ${sign}\\dfrac{${mag}}{x}$ N (with $x$ in meters) do on a particle as it moves from $x = ${p.xi}$ m to $x = ${p.xf}$ m?`,
      givens: [
        { symbol: "a", value: -p.a, unit: "N·m", note: "F = a/x" },
        { symbol: "x_i", value: p.xi, unit: "m" },
        { symbol: "x_f", value: p.xf, unit: "m" },
      ],
      target: { symbol: "W", unit: "J", label: "work" },
      answer: toSigFigs(W, 4),
      choices: buildNumericChoices(rng, W, [
        { errorId: "work-sign-flip", value: -W },
        { errorId: "area-as-F-times-d", value: Fstart * (p.xf - p.xi) },
        { errorId: "log-of-difference", value: -p.a * Math.log(p.xf - p.xi) },
        { errorId: "integrated-wrong-power", value: -p.a * (1 / p.xf - 1 / p.xi) },
      ]),
      equations: ["work-integral"],
      recipe: ["W = ∫F dx", "∫ dx/x = ln x", "W = −a[ln x_f − ln x_i] = −a ln(x_f/x_i)"],
      hints: ["The force varies with x — integrate, don't multiply.", "The antiderivative of 1/x is ln x.", `ln(${p.xf}/${p.xi}) = ${toSigFigs(Math.log(p.xf / p.xi), 3)}.`],
      solution: [
        { text: "Integrate 1/x.", latex: `W = \\int_{${p.xi}}^{${p.xf}} \\left(${sign}\\frac{${mag}}{x}\\right)dx = ${sign}${mag}\\,\\big[\\ln x\\big]_{${p.xi}}^{${p.xf}} = ${sign}${mag}\\ln\\!\\frac{${p.xf}}{${p.xi}}`, equationId: "work-integral" },
        { text: "Evaluate.", latex: `W = ${sign}${mag}(${fx(Math.log(p.xf / p.xi))}) = ${fx(W)}\\ \\text{J}`, equationId: "work-integral", value: toSigFigs(W, 4) },
      ],
      note: W < 0 ? "Negative: the force points toward −x while the particle moves toward +x." : undefined,
    };
  },
};
