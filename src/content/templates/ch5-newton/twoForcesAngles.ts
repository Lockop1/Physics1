import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, cosD, sinD } from "../helpers";

/**
 * Block on a frictionless horizontal surface with two applied forces at angles
 * above the horizontal → horizontal acceleration.
 * Lecture Q40: 30.0 kg, two 30.0 N forces (one horizontal, one at 30°) → 1.87 m/s².
 */
export interface TwoForcesParams {
  m: number;
  F1: number;
  theta1: number; // deg above horizontal
  F2: number;
  theta2: number;
}
export function solve(p: TwoForcesParams): { Fx: number; a: number; N: number } {
  const Fx = p.F1 * cosD(p.theta1) + p.F2 * cosD(p.theta2);
  const N = p.m * g - p.F1 * sinD(p.theta1) - p.F2 * sinD(p.theta2);
  return { Fx, a: Fx / p.m, N };
}

const SKINS = ["a block", "a crate", "a sled", "a shopping cart", "a toolbox"];

export const template: QuestionTemplate = {
  id: "ch5.net-force.two-forces",
  topicId: "ch5.net-force",
  title: "Two forces at angles on a frictionless surface → acceleration",
  source: "Ch 5 lecture — Problem 40 (30.0 kg, two 30.0 N forces → 1.87 m/s²)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(SKINS);
    const bothAngled = rng.chance(0.4);
    const p = rejectUntil(
      () => ({
        m: nice(rng, 5, 60, 1),
        F1: nice(rng, 10, 80, 5),
        theta1: bothAngled ? rng.pick([15, 20, 25, 30, 35, 40, 45]) : 0,
        F2: nice(rng, 10, 80, 5),
        theta2: rng.pick([15, 20, 25, 30, 35, 40, 45, 50, 60]),
      }),
      (c) => {
        const { N, a } = solve(c);
        return N > 0 && a > 0.3 && a < 15;
      },
    );
    const { Fx, a } = solve(p);
    const f1Text = p.theta1 === 0 ? `${q(p.F1, "N")} pulls horizontally` : `${q(p.F1, "N")} pulls at $${p.theta1}^\\circ$ above the horizontal`;
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `Two forces act on ${skin} of mass ${q(p.m, "kg")} resting on a frictionless horizontal surface, both pulling toward the right: one of ${f1Text}, and another of ${q(p.F2, "N")} at $${p.theta2}^\\circ$ above the horizontal. What is the magnitude of the resulting acceleration?`,
      diagram: {
        kind: "block-force",
        forces: [
          { label: "F_1", angleDeg: p.theta1, scale: 0.9 },
          { label: "F_2", angleDeg: p.theta2, scale: 1.1 },
        ],
        massLabel: `${p.m} kg`,
        caption: "frictionless",
      },
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "F_1", value: p.F1, unit: "N" },
        { symbol: "\\theta_1", value: p.theta1, unit: "°" },
        { symbol: "F_2", value: p.F2, unit: "N" },
        { symbol: "\\theta_2", value: p.theta2, unit: "°" },
      ],
      target: { symbol: "a", unit: "m/s²", label: "acceleration" },
      answer: toSigFigs(a, 4),
      choices: buildNumericChoices(rng, a, [
        { errorId: "added-magnitudes-no-components", value: (p.F1 + p.F2) / p.m },
        { errorId: "sin-cos-swap", value: (p.F1 * (p.theta1 === 0 ? 1 : sinD(p.theta1)) + p.F2 * sinD(p.theta2)) / p.m },
        { errorId: "mass-not-weight", value: Fx / (p.m * g) },
        { errorId: "arithmetic-slip", value: (p.F2 * cosD(p.theta2)) / p.m },
      ]),
      equations: ["vec-components", "newton-2"],
      recipe: ["Resolve each force into x (along surface) and y", "ΣF_x = F₁ cos θ₁ + F₂ cos θ₂ = m a_x", "The surface stops vertical motion, so a_y = 0"],
      hints: [
        "The block can only accelerate along the surface. Only the horizontal components of the forces matter for that.",
        "ΣF_x = F₁ cos θ₁ + F₂ cos θ₂, then a = ΣF_x / m.",
        `ΣF_x = ${p.F1}cos${p.theta1}° + ${p.F2}cos${p.theta2}° = ${toSigFigs(Fx, 3)} N.`,
      ],
      solution: [
        {
          text: "Sum the horizontal components (the vertical ones are balanced by the normal force since a_y = 0).",
          latex: `\\sum F_x = F_1\\cos\\theta_1 + F_2\\cos\\theta_2 = (${p.F1})\\cos${p.theta1}^\\circ + (${p.F2})\\cos${p.theta2}^\\circ = ${fx(Fx)}\\ \\text{N}`,
          equationId: "vec-components",
          value: Fx,
        },
        { text: "Newton's second law along x.", latex: `a = \\frac{\\sum F_x}{m} = \\frac{${fx(Fx)}}{${p.m}} = ${fx(a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(a, 4) },
      ],
    };
  },
};
