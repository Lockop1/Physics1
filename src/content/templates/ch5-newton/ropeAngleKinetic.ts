import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/** Block already sliding, pulled by a rope at angle θ above horizontal with kinetic friction: a = (T cos θ − μ_k(mg − T sin θ))/m. */
export interface RopeKineticParams {
  m: number;
  T: number;
  theta: number; // 0 allowed
  muk: number;
}
export function solve(p: RopeKineticParams): { N: number; fk: number; a: number } {
  const N = p.m * g - p.T * sinD(p.theta);
  const fk = p.muk * N;
  return { N, fk, a: (p.T * cosD(p.theta) - fk) / p.m };
}

type Variant = "a" | "T";
const SKINS = ["a sled", "a crate", "a wagon", "a box", "a trunk"];

export const template: QuestionTemplate = {
  id: "ch5.friction.rope-angle",
  topicId: "ch5.friction",
  title: "Rope at an angle with kinetic friction → acceleration (N = mg − T sin θ)",
  source: "Ch 6a lecture — 'Find the acceleration' (T cos θ − f_k = ma, N = F_g − T sin θ)",
  kind: "numeric",
  difficulty: 2,
  variants: ["a", "T"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const horizontal = rng.chance(0.25);
    const p = rejectUntil(
      () => ({ m: nice(rng, 4, 40, 0.5), T: nice(rng, 20, 200, 5), theta: horizontal ? 0 : rng.pick([15, 20, 25, 30, 35, 40, 45]), muk: nice(rng, 0.1, 0.5, 0.05) }),
      (c) => {
        const s = solve(c);
        return s.N > 0.2 * c.m * g && s.a > 0.3 && s.a < 10;
      },
    );
    const s = solve(p);
    const angleText = horizontal ? "horizontally" : `at $${p.theta}^\\circ$ above the horizontal`;
    const base = {
      templateId: this.id,
      seed: rng.seed,
      variant,
      diagram: { kind: "block-force" as const, forces: [{ label: "T", angleDeg: p.theta }], rough: true, massLabel: `${p.m} kg`, showNW: true },
      equations: ["vec-components", "newton-2", "friction-kinetic"],
    };
    if (variant === "a") {
      return {
        ...base,
        prompt: `${cap(skin)} of mass ${q(p.m, "kg")} is sliding across a horizontal floor, pulled by a rope with tension ${q(p.T, "N")} ${angleText}. The coefficient of kinetic friction is $\\mu_k = ${p.muk}$. What is the acceleration?`,
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "T", value: p.T, unit: "N" },
          { symbol: "\\theta", value: p.theta, unit: "°" },
          { symbol: "\\mu_k", value: p.muk, unit: "" },
        ],
        target: { symbol: "a", unit: "m/s²", label: "acceleration" },
        answer: toSigFigs(s.a, 4),
        choices: buildNumericChoices(rng, s.a, [
          { errorId: "normal-equals-mg", value: (p.T * cosD(p.theta) - p.muk * p.m * g) / p.m },
          { errorId: "vertical-component-sign", value: (p.T * cosD(p.theta) - p.muk * (p.m * g + p.T * sinD(p.theta))) / p.m },
          { errorId: "forgot-friction", value: (p.T * cosD(p.theta)) / p.m },
          { errorId: "sin-cos-swap", value: (p.T * sinD(p.theta) - p.muk * (p.m * g - p.T * cosD(p.theta))) / p.m },
          { errorId: "ignored-force-angle", value: (p.T - p.muk * s.N) / p.m },
        ]),
        recipe: ["ΣF_y = 0: N = mg − T sin θ", "f_k = μ_k N", "ΣF_x: T cos θ − f_k = ma"],
        hints: [
          "The block is already moving, so friction is kinetic: f_k = μ_k N.",
          horizontal ? "Horizontal pull: N = mg here." : "The rope's upward component reduces the normal force: N = mg − T sin θ.",
          `N = ${toSigFigs(s.N, 3)} N → f_k = ${toSigFigs(s.fk, 3)} N.`,
        ],
        solution: [
          { text: "Normal force from the vertical balance.", latex: `N = mg - T\\sin\\theta = (${p.m})(9.80) - (${p.T})\\sin${p.theta}^\\circ = ${fx(s.N)}\\ \\text{N}`, equationId: "newton-2", value: s.N },
          { text: "Kinetic friction.", latex: `f_k = \\mu_k N = (${p.muk})(${fx(s.N)}) = ${fx(s.fk)}\\ \\text{N}`, equationId: "friction-kinetic", value: s.fk },
          { text: "Newton's second law along the floor.", latex: `a = \\frac{T\\cos\\theta - f_k}{m} = \\frac{(${p.T})\\cos${p.theta}^\\circ - ${fx(s.fk)}}{${p.m}} = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(s.a, 4) },
        ],
      };
    }
    // T: tension needed for a given acceleration (or constant velocity)
    const constV = rng.chance(0.35);
    const aWanted = constV ? 0 : toSigFigs(s.a, 2);
    const Tneeded = (p.m * aWanted + p.muk * p.m * g) / (cosD(p.theta) + p.muk * sinD(p.theta));
    return {
      ...base,
      prompt: `${cap(skin)} of mass ${q(p.m, "kg")} is pulled across a horizontal floor by a rope ${angleText}. The coefficient of kinetic friction is $\\mu_k = ${p.muk}$. What tension is needed so that it ${constV ? "moves at constant velocity" : `accelerates at ${q(aWanted, "m/s²")}`}?`,
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "\\theta", value: p.theta, unit: "°" },
        { symbol: "\\mu_k", value: p.muk, unit: "" },
        { symbol: "a", value: aWanted, unit: "m/s²" },
      ],
      target: { symbol: "T", unit: "N", label: "tension" },
      answer: toSigFigs(Tneeded, 4),
      choices: buildNumericChoices(rng, Tneeded, [
        { errorId: "normal-equals-mg", value: (p.m * aWanted + p.muk * p.m * g) / cosD(p.theta) },
        { errorId: "forgot-friction", value: (p.m * aWanted) / cosD(p.theta) || p.muk * p.m * g * 0.5 },
        { errorId: "vertical-component-sign", value: (p.m * aWanted + p.muk * p.m * g) / (cosD(p.theta) - p.muk * sinD(p.theta)) },
        { errorId: "ignored-force-angle", value: p.m * aWanted + p.muk * p.m * g },
      ]),
      recipe: ["N = mg − T sin θ (T unknown!)", "f_k = μ_k N", "T cos θ − μ_k(mg − T sin θ) = ma → solve for T"],
      hints: [
        constV ? "Constant velocity → a = 0, but friction still acts." : "Both the normal force and friction depend on the unknown T.",
        "Write ΣF_x = ma with N expressed in terms of T, then collect the T terms.",
        `T(cos θ + μ_k sin θ) = ma + μ_k mg.`,
      ],
      solution: [
        { text: "Set up both axes with T unknown.", latex: `N = mg - T\\sin\\theta,\\qquad T\\cos\\theta - \\mu_k N = ma`, equationId: "newton-2" },
        { text: "Substitute N and solve for T.", latex: `T = \\frac{ma + \\mu_k mg}{\\cos\\theta + \\mu_k\\sin\\theta} = \\frac{(${p.m})(${aWanted}) + (${p.muk})(${p.m})(9.80)}{\\cos${p.theta}^\\circ + (${p.muk})\\sin${p.theta}^\\circ} = ${fx(Tneeded)}\\ \\text{N}`, equationId: "friction-kinetic", value: toSigFigs(Tneeded, 4) },
      ],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
