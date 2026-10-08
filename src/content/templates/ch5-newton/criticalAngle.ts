import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx, tanD, sinD } from "../helpers";

/** μ_s = tan θ_c. Lecture ABCD: θ_c = 20.0° → 0.364. SI Q22: μ_s = 0.35 → 19.3°. */
export function muFromAngle(thetaDeg: number): number {
  return tanD(thetaDeg);
}
export function angleFromMu(mu: number): number {
  return toDeg(Math.atan(mu));
}

type Variant = "mu" | "angle";

export const template: QuestionTemplate = {
  id: "ch5.inclines.critical-angle",
  topicId: "ch5.inclines",
  title: "Critical angle ↔ μ_s (μ_s = tan θ_c)",
  source: "Ch 6a lecture — experimental determination of μ_s (20.0° → 0.364); SI Q22",
  kind: "numeric",
  difficulty: 2,
  variants: ["mu", "angle"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const obj = rng.pick(["a box", "a book", "a coin", "a block", "a phone"]);
    const m = nice(rng, 0.2, 20, 0.1);
    if (variant === "mu") {
      const theta = nice(rng, 10, 40, 0.5);
      const mu = muFromAngle(theta);
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${cap(obj)} of mass ${q(m, "kg")} sits on a board. One end of the board is slowly raised; the object just starts to slip when the board makes $${theta}^\\circ$ with the horizontal. What is the coefficient of static friction?`,
        diagram: { kind: "incline", angleDeg: theta, rough: true, massLabel: `${m} kg`, caption: "just about to slip" },
        givens: [
          { symbol: "m", value: m, unit: "kg", note: "not needed" },
          { symbol: "\\theta_c", value: theta, unit: "°" },
        ],
        target: { symbol: "\\mu_s", unit: "", label: "coefficient of static friction" },
        answer: toSigFigs(mu, 4),
        choices: buildNumericChoices(rng, mu, [
          { errorId: "critical-angle-sin-not-tan", value: sinD(theta) },
          { errorId: "degrees-in-radian-formula", value: Math.tan(theta) },
          { errorId: "arithmetic-slip", value: 1 / tanD(theta) },
          { errorId: "mass-not-weight", value: m * tanD(theta) },
        ]),
        equations: ["vec-components", "newton-2", "friction-static"],
        recipe: ["Along slope: mg sin θ = f_s (at rest)", "Perpendicular: N = mg cos θ", "At the critical angle f_s = μ_s N → μ_s = tan θ_c"],
        hints: [
          "At the critical angle static friction is at its maximum and the block is still in equilibrium.",
          "Along the incline: mg sin θ = μ_s N, and N = mg cos θ. The mass cancels.",
          `μ_s = tan ${theta}°.`,
        ],
        solution: [
          { text: "Set up both axes at the verge of slipping.", latex: `mg\\sin\\theta_c = \\mu_s N,\\qquad N = mg\\cos\\theta_c`, equationId: "newton-2" },
          { text: "Divide: the mass and g cancel.", latex: `\\mu_s = \\frac{mg\\sin\\theta_c}{mg\\cos\\theta_c} = \\tan\\theta_c = \\tan${theta}^\\circ = ${fx(mu)}`, equationId: "friction-static", value: toSigFigs(mu, 4) },
        ],
        note: "μ_s is dimensionless and independent of the mass.",
      };
    }
    const mu = nice(rng, 0.15, 0.8, 0.01);
    const theta = angleFromMu(mu);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `The coefficient of static friction between ${obj} (mass ${q(m, "kg")}) and a board is $\\mu_s = ${mu}$. To what angle can the board be tilted before the object starts to slide?`,
      diagram: { kind: "incline", angleDeg: Math.round(theta), rough: true, massLabel: `${m} kg` },
      givens: [
        { symbol: "m", value: m, unit: "kg", note: "not needed" },
        { symbol: "\\mu_s", value: mu, unit: "" },
      ],
      target: { symbol: "\\theta_c", unit: "°", label: "critical angle" },
      answer: toSigFigs(theta, 4),
      choices: buildNumericChoices(rng, theta, [
        { errorId: "critical-angle-sin-not-tan", value: toDeg(Math.asin(Math.min(mu, 1))) },
        { errorId: "degrees-in-radian-formula", value: Math.atan(mu) },
        { errorId: "arithmetic-slip", value: toDeg(Math.atan(1 / mu)) },
        { errorId: "arithmetic-slip", value: theta * 2 },
      ]),
      equations: ["vec-components", "newton-2", "friction-static"],
      recipe: ["mg sin θ = μ_s mg cos θ at the verge", "tan θ_c = μ_s → θ_c = tan⁻¹ μ_s"],
      hints: ["Same setup as finding μ_s from the angle, solved the other way.", "tan θ_c = μ_s.", `θ_c = tan⁻¹(${mu}).`],
      solution: [{ text: "Invert μ_s = tan θ_c.", latex: `\\theta_c = \\tan^{-1}(\\mu_s) = \\tan^{-1}(${mu}) = ${fx(theta)}^\\circ`, equationId: "friction-static", value: toSigFigs(theta, 4) }],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
