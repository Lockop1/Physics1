import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** SI Q28: r = 85 m, v = 25 m/s → μ_s = 0.750 on a flat road; frictionless bank angle 36.9°. */
export function solve(p: { r: number; v: number }): { mu: number; thetaDeg: number } {
  const x = (p.v * p.v) / (g * p.r);
  return { mu: x, thetaDeg: toDeg(Math.atan(x)) };
}

export const template: QuestionTemplate = {
  id: "ch6.banked-curve.flat-vs-banked",
  topicId: "ch6.banked-curve",
  title: "Same curve: μ_s needed if flat vs bank angle if frictionless (multi-part)",
  source: "SI Exam 1 Review — Q28 (85 m, 25 m/s → μ_s 0.750; bank 36.9°)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = { r: nice(rng, 40, 250, 5), v: nice(rng, 10, 32, 0.5) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "If the road is flat (unbanked), what minimum coefficient of static friction is needed?",
        target: { symbol: "\\mu_s", unit: "", label: "minimum coefficient of static friction" },
        answer: toSigFigs(s.mu, 4),
        choices: buildNumericChoices(rng, s.mu, [
          { errorId: "forgot-square", value: p.v / (g * p.r) },
          { errorId: "ratio-inverted", value: 1 / s.mu },
          { errorId: "diameter-as-radius", value: s.mu / 2 },
          { errorId: "arithmetic-slip", value: s.mu * 2 },
        ]),
        solution: [{ text: "Friction supplies mv²/r with N = mg.", latex: `\\mu_s = \\frac{v^2}{g r} = \\frac{(${p.v})^2}{(9.80)(${p.r})} = ${fx(s.mu)}`, equationId: "vmax-flat-curve", value: toSigFigs(s.mu, 4) }],
      },
      {
        label: "(b)",
        prompt: "Instead, at what angle should the road be banked so that NO friction is needed at this speed?",
        target: { symbol: "\\theta", unit: "°", label: "bank angle" },
        answer: toSigFigs(s.thetaDeg, 4),
        choices: buildNumericChoices(rng, s.thetaDeg, [
          { errorId: "degrees-in-radian-formula", value: Math.atan(s.mu) },
          { errorId: "critical-angle-sin-not-tan", value: toDeg(Math.asin(Math.min(s.mu, 1))) },
          { errorId: "forgot-square", value: toDeg(Math.atan(p.v / (g * p.r))) },
          { errorId: "arithmetic-slip", value: s.thetaDeg / 2 },
        ]),
        solution: [{ text: "On a frictionless bank, tan θ = v²/(rg) — the same ratio as in part (a).", latex: `\\theta = \\tan^{-1}\\!\\left(\\frac{v^2}{rg}\\right) = \\tan^{-1}(${fx(s.mu)}) = ${fx(s.thetaDeg)}^\\circ`, equationId: "banked-angle", value: toSigFigs(s.thetaDeg, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A car rounds a curve of radius ${q(p.r, "m")} at ${q(p.v, "m/s")}.`,
        diagram: { kind: "banked", angleDeg: Math.round(s.thetaDeg), showForces: true },
        givens: [
          { symbol: "r", value: p.r, unit: "m" },
          { symbol: "v", value: p.v, unit: "m/s" },
        ],
        equations: ["sum-fc", "vmax-flat-curve", "banked-angle"],
        recipe: ["Flat: μ_s mg = mv²/r → μ_s = v²/(gr)", "Banked, no friction: tan θ = v²/(rg)", "Notice μ_s = tan θ: the same number"],
        hints: ["Both parts come from ΣF_c = mv²/r with a different inward force.", "Flat: friction; banked: the horizontal component of N.", `v²/(gr) = ${toSigFigs(s.mu, 3)}.`],
      },
      parts,
    );
  },
};
