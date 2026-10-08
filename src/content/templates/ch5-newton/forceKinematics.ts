import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Net horizontal force on a block from rest (frictionless) → a, then v after t, then distance. */
export interface ForceKinParams {
  m: number;
  F: number;
  t: number;
}
export function solve(p: ForceKinParams): { a: number; v: number; x: number } {
  const a = p.F / p.m;
  return { a, v: a * p.t, x: 0.5 * a * p.t * p.t };
}

const SKINS = ["a hockey puck on frictionless ice", "a cart on a frictionless track", "a sled on smooth ice", "a crate on a frictionless floor"];

export const template: QuestionTemplate = {
  id: "ch5.net-force.force-kinematics",
  topicId: "ch5.net-force",
  title: "Constant net force from rest → a, v, distance (multi-part)",
  source: "Ch 5 lecture — summary: ΣF = ma + kinematics equations",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(SKINS);
    const p = { m: nice(rng, 0.5, 20, 0.5), F: nice(rng, 2, 60, 1), t: nice(rng, 1, 8, 0.5) };
    const { a, v, x } = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the acceleration?",
        target: { symbol: "a", unit: "m/s²", label: "acceleration" },
        answer: toSigFigs(a, 4),
        choices: buildNumericChoices(rng, a, [
          { errorId: "mass-not-weight", value: p.F / (p.m * g) },
          { errorId: "arithmetic-slip", value: p.F * p.m },
          { errorId: "arithmetic-slip", value: a / 2 },
        ]),
        solution: [{ text: "The only horizontal force is F, so it is the net force.", latex: `a = \\frac{F}{m} = \\frac{${p.F}}{${p.m}} = ${fx(a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(a, 4) }],
      },
      {
        label: "(b)",
        prompt: `What is its speed after ${q(p.t, "s")}?`,
        target: { symbol: "v", unit: "m/s", label: "speed" },
        answer: toSigFigs(v, 4),
        choices: buildNumericChoices(rng, v, [
          { errorId: "kinematics-missing-half", value: a * p.t * p.t },
          { errorId: "arithmetic-slip", value: a / p.t },
          { errorId: "arithmetic-slip", value: v * 2 },
        ]),
        solution: [{ text: "Constant acceleration from rest.", latex: `v = v_0 + at = 0 + (${fx(a)})(${p.t}) = ${fx(v)}\\ \\text{m/s}`, equationId: "kin-v", value: toSigFigs(v, 4) }],
      },
      {
        label: "(c)",
        prompt: `How far has it moved in those ${q(p.t, "s")}?`,
        target: { symbol: "\\Delta x", unit: "m", label: "distance" },
        answer: toSigFigs(x, 4),
        choices: buildNumericChoices(rng, x, [
          { errorId: "kinematics-missing-half", value: a * p.t * p.t },
          { errorId: "arithmetic-slip", value: v * p.t },
          { errorId: "arithmetic-slip", value: a * p.t },
        ]),
        solution: [{ text: "Displacement from rest under constant acceleration.", latex: `\\Delta x = \\tfrac12 a t^2 = \\tfrac12(${fx(a)})(${p.t})^2 = ${fx(x)}\\ \\text{m}`, equationId: "kin-x", value: toSigFigs(x, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A constant horizontal force of ${q(p.F, "N")} is applied to ${skin}, mass ${q(p.m, "kg")}, starting from rest.`,
        diagram: { kind: "block-force", forces: [{ label: "F", angleDeg: 0 }], massLabel: `${p.m} kg`, caption: "frictionless, starts from rest" },
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "F", value: p.F, unit: "N" },
          { symbol: "t", value: p.t, unit: "s" },
        ],
        equations: ["newton-2", "kin-v", "kin-x"],
        recipe: ["a = F/m (dynamics)", "v = at (kinematics)", "Δx = ½at²"],
        hints: ["Dynamics first (find a from the force), then kinematics.", "a = F/m; then v = v₀ + at and Δx = v₀t + ½at² with v₀ = 0.", `a = ${toSigFigs(a, 3)} m/s².`],
      },
      parts,
    );
  },
};
