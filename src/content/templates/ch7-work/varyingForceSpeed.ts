import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, q } from "../helpers";

/** The lecture follow-up: F = −a/x does work −a ln(x_f/x_i); find v_f from W = ΔK. */
export function solve(p: { a: number; xi: number; xf: number; m: number; vi: number }): { W: number; vf: number } {
  const W = -p.a * Math.log(p.xf / p.xi);
  return { W, vf: Math.sqrt(Math.max(0, p.vi * p.vi + (2 * W) / p.m)) };
}

export const template: QuestionTemplate = {
  id: "ch7.work-energy.varying-force-speed",
  topicId: "ch7.work-energy",
  title: "Speed after a varying force (F = −a/x) does work",
  source: "Exam 2 Review — F = −2.0/x follow-up: find the final speed",
  kind: "numeric",
  difficulty: 3,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ a: nice(rng, 0.5, 6, 0.5), xi: nice(rng, 0.5, 3, 0.5), xf: nice(rng, 2, 8, 0.5), m: nice(rng, 0.2, 5, 0.1), vi: nice(rng, 1, 8, 0.5) }),
      (c) => {
        if (c.xf <= 1.4 * c.xi) return false;
        const s = solve(c);
        return c.vi * c.vi + (2 * s.W) / c.m > 0.3 * c.vi * c.vi && s.vf < 0.95 * c.vi;
      },
    );
    const s = solve(p);
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `A ${q(p.m, "kg")} particle moving along the $x$-axis is acted on by the force $F(x) = -\\dfrac{${p.a}}{x}$ N (with $x$ in meters). Its speed at $x = ${p.xi}$ m is ${q(p.vi, "m/s")}. What is its speed when it reaches $x = ${p.xf}$ m?`,
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "a", value: p.a, unit: "N·m", note: "F = −a/x" },
        { symbol: "x_i", value: p.xi, unit: "m" },
        { symbol: "x_f", value: p.xf, unit: "m" },
        { symbol: "v_i", value: p.vi, unit: "m/s" },
      ],
      target: { symbol: "v_f", unit: "m/s", label: "final speed" },
      answer: toSigFigs(s.vf, 4),
      choices: buildNumericChoices(rng, s.vf, [
        { errorId: "work-sign-flip", value: Math.sqrt(p.vi * p.vi - (2 * s.W) / p.m) },
        { errorId: "area-as-F-times-d", value: Math.sqrt(Math.max(0.01, p.vi * p.vi + (2 * (-p.a / p.xi) * (p.xf - p.xi)) / p.m)) },
        { errorId: "forgot-sqrt", value: p.vi * p.vi + (2 * s.W) / p.m },
        { errorId: "log-of-difference", value: Math.sqrt(Math.max(0.01, p.vi * p.vi + (2 * -p.a * Math.log(p.xf - p.xi)) / p.m)) },
      ]),
      equations: ["work-integral", "kinetic-energy", "work-energy"],
      recipe: ["W = ∫F dx = −a ln(x_f/x_i) (negative)", "W = ½mv_f² − ½mv_i²", "v_f = √(v_i² + 2W/m)"],
      hints: ["The force varies, so first find its work by integrating.", "Then apply the work–energy theorem: the (negative) work reduces K.", `W = ${toSigFigs(s.W, 3)} J.`],
      solution: [
        { text: "Work by the varying force.", latex: `W = \\int_{${p.xi}}^{${p.xf}} \\left(-\\frac{${p.a}}{x}\\right)dx = -${p.a}\\ln\\frac{${p.xf}}{${p.xi}} = ${fx(s.W)}\\ \\text{J}`, equationId: "work-integral", value: s.W },
        { text: "Work–energy theorem.", latex: `v_f = \\sqrt{v_i^2 + \\frac{2W}{m}} = \\sqrt{(${p.vi})^2 + \\frac{2(${fx(s.W)})}{${p.m}}} = ${fx(s.vf)}\\ \\text{m/s}`, equationId: "work-energy", value: toSigFigs(s.vf, 4) },
      ],
    };
  },
};
