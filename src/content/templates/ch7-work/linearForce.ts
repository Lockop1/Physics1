import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx } from "../helpers";

/** F = a + b x (linear) → W = a Δx + b (x_f² − x_i²)/2  (the trapezoid area). */
export function solve(p: { a: number; b: number; xi: number; xf: number }): { W: number } {
  return { W: p.a * (p.xf - p.xi) + (p.b * (p.xf * p.xf - p.xi * p.xi)) / 2 };
}

export const template: QuestionTemplate = {
  id: "ch7.varying-force.linear",
  topicId: "ch7.varying-force",
  title: "Work by a linearly varying force F = a + bx (trapezoid / integral)",
  source: "Ch 7 lecture — 7.3 varying force; F–x graph examples",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ a: nice(rng, -10, 20, 1), b: nice(rng, -5, 8, 0.5), xi: nice(rng, 0, 4, 0.5), xf: nice(rng, 2, 10, 0.5) }),
      (c) => c.b !== 0 && c.xf > c.xi && Math.abs(solve(c).W) > 2,
    );
    const { W } = solve(p);
    const Fi = p.a + p.b * p.xi;
    const Ff = p.a + p.b * p.xf;
    const bText = p.b < 0 ? `- ${-p.b}` : `+ ${p.b}`;
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `A force $F(x) = ${p.a} ${bText}\\,x$ N (with $x$ in meters) acts along the $x$-axis. Find the work it does as the object moves from $x = ${p.xi}$ m to $x = ${p.xf}$ m.`,
      diagram: { kind: "fx-graph", points: [{ x: Math.min(0, p.xi), F: p.a + p.b * Math.min(0, p.xi) }, { x: p.xf + 1, F: p.a + p.b * (p.xf + 1) }], from: p.xi, to: p.xf },
      givens: [
        { symbol: "F(x_i)", value: toSigFigs(Fi, 3), unit: "N" },
        { symbol: "F(x_f)", value: toSigFigs(Ff, 3), unit: "N" },
        { symbol: "x_i", value: p.xi, unit: "m" },
        { symbol: "x_f", value: p.xf, unit: "m" },
      ],
      target: { symbol: "W", unit: "J", label: "work" },
      answer: toSigFigs(W, 4),
      choices: buildNumericChoices(rng, W, [
        { errorId: "area-as-F-times-d", value: Ff * (p.xf - p.xi) },
        { errorId: "area-as-F-times-d", value: Fi * (p.xf - p.xi) },
        { errorId: "integrated-wrong-power", value: p.a * (p.xf - p.xi) + p.b * (p.xf * p.xf - p.xi * p.xi) },
        { errorId: "work-sign-flip", value: -W },
      ]),
      equations: ["work-integral"],
      recipe: ["W = ∫(a + bx) dx = a x + b x²/2 between the limits", "Equivalently: area of the trapezoid under the F–x line = ½(F_i + F_f)Δx"],
      hints: ["The force is not constant, so take the area under the F–x graph (a trapezoid) or integrate.", "Average force × displacement works ONLY because F is linear: W = ½(F_i + F_f)(x_f − x_i).", `F_i = ${toSigFigs(Fi, 3)} N, F_f = ${toSigFigs(Ff, 3)} N.`],
      solution: [
        { text: "Integrate the linear force.", latex: `W = \\int_{${p.xi}}^{${p.xf}} (${p.a} ${bText}x)\\,dx = \\left[${p.a}x ${bText}\\frac{x^2}{2}\\right]_{${p.xi}}^{${p.xf}}`, equationId: "work-integral" },
        { text: "Evaluate (same as the trapezoid area ½(F_i + F_f)Δx).", latex: `W = ${fx(W)}\\ \\text{J}`, equationId: "work-integral", value: toSigFigs(W, 4) },
      ],
    };
  },
};
