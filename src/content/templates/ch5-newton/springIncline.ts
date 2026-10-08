import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/** Spring holds a block on a frictionless incline: kx = mg sin θ. Lecture: 30.0 kg, 60°, 5.0 cm → k ≈ 5092 N/m. */
export interface SpringInclineParams {
  m: number;
  theta: number;
  xM: number;
}
export function solve(p: SpringInclineParams): { k: number; Fs: number } {
  const Fs = p.m * g * sinD(p.theta);
  return { Fs, k: Fs / p.xM };
}

type Variant = "k" | "x";

export const template: QuestionTemplate = {
  id: "ch5.springs.incline",
  topicId: "ch5.springs",
  title: "Spring holding a block on a frictionless incline → k or x",
  source: "Ch 6a lecture — textbook problem (30.0 kg, 60°, 5.0 cm → 5.09 × 10³ N/m)",
  kind: "numeric",
  difficulty: 2,
  variants: ["k", "x"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const m = nice(rng, 2, 50, 0.5);
    const theta = rng.pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60]);
    const xCm = nice(rng, 2, 20, 0.5);
    const xM = xCm / 100;
    const { k, Fs } = solve({ m, theta, xM });
    if (variant === "k") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A ${q(m, "kg")} block rests on a frictionless ramp inclined at $${theta}^\\circ$ to the horizontal. It is held in place by a spring attached to the top of the ramp, which is stretched by ${q(xCm, "cm")}. What is the spring constant?`,
        diagram: { kind: "incline", angleDeg: theta, spring: true, massLabel: `${m} kg`, caption: "frictionless" },
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "\\theta", value: theta, unit: "°" },
          { symbol: "x", value: xCm, unit: "cm" },
        ],
        target: { symbol: "k", unit: "N/m", label: "spring constant" },
        answer: toSigFigs(k, 4),
        choices: buildNumericChoices(rng, k, [
          { errorId: "incline-sin-cos-swap", value: (m * g * cosD(theta)) / xM },
          { errorId: "cm-not-converted", value: Fs / xCm },
          { errorId: "normal-equals-mg", value: (m * g) / xM },
          { errorId: "mass-not-weight", value: (m * sinD(theta)) / xM },
        ]),
        equations: ["vec-components", "newton-2", "hooke"],
        recipe: ["Along the slope: spring force up-slope balances mg sin θ", "kx = mg sin θ", "k = mg sin θ / x (x in m)"],
        hints: ["Along the ramp, only two forces matter: the spring (up-slope) and gravity's component mg sin θ (down-slope).", "Equilibrium: kx = mg sin θ.", `mg sin θ = ${toSigFigs(Fs, 3)} N, x = ${xM} m.`],
        solution: [
          { text: "Gravity component along the slope.", latex: `mg\\sin\\theta = (${m})(9.80)\\sin${theta}^\\circ = ${fx(Fs)}\\ \\text{N}`, equationId: "vec-components", value: Fs },
          { text: "Equilibrium along the slope with Hooke's law.", latex: `kx = mg\\sin\\theta \;\\Rightarrow\; k = \\frac{${fx(Fs)}}{${xM}} = ${fx(k)}\\ \\text{N/m}`, equationId: "hooke", value: toSigFigs(k, 4) },
        ],
      };
    }
    const kGiven = nice(rng, 200, 3000, 50);
    const xAns = Fs / kGiven;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A ${q(m, "kg")} block rests on a frictionless ramp inclined at $${theta}^\\circ$. It is held by a spring of spring constant ${q(kGiven, "N/m")} attached to the top of the ramp. How far is the spring stretched?`,
      diagram: { kind: "incline", angleDeg: theta, spring: true, massLabel: `${m} kg`, caption: "frictionless" },
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "\\theta", value: theta, unit: "°" },
        { symbol: "k", value: kGiven, unit: "N/m" },
      ],
      target: { symbol: "x", unit: "m", label: "stretch" },
      answer: toSigFigs(xAns, 4),
      choices: buildNumericChoices(rng, xAns, [
        { errorId: "incline-sin-cos-swap", value: (m * g * cosD(theta)) / kGiven },
        { errorId: "normal-equals-mg", value: (m * g) / kGiven },
        { errorId: "mass-not-weight", value: (m * sinD(theta)) / kGiven },
        { errorId: "arithmetic-slip", value: xAns * 2 },
      ]),
      equations: ["vec-components", "newton-2", "hooke"],
      recipe: ["kx = mg sin θ", "x = mg sin θ / k"],
      hints: ["Spring force balances the down-slope gravity component.", "x = mg sin θ / k.", `${toSigFigs(Fs, 3)} / ${kGiven}.`],
      solution: [{ text: "Equilibrium along the slope.", latex: `x = \\frac{mg\\sin\\theta}{k} = \\frac{(${m})(9.80)\\sin${theta}^\\circ}{${kGiven}} = ${fx(xAns)}\\ \\text{m}`, equationId: "hooke", value: toSigFigs(xAns, 4) }],
    };
  },
};
