import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/** W_f = −μ_k N d. Lecture: 1.00 kg, 1.60 m, μ_k 0.25 → −3.92 J; 3.0 kg, 16 N at 37°, μ_k 0.25, 5.0 m → −25 J. */
export function solve(p: { m: number; muk: number; d: number; F: number; theta: number }): { N: number; fk: number; W: number } {
  const N = p.m * g - p.F * sinD(p.theta);
  const fk = p.muk * N;
  return { N, fk, W: -fk * p.d };
}

type Variant = "flat" | "angled-pull";

export const template: QuestionTemplate = {
  id: "ch7.constant-force.friction-work",
  topicId: "ch7.constant-force",
  title: "Work done by kinetic friction (flat drag, or with an angled pull)",
  source: "Ch 7 lecture — friction examples (1.00 kg, 1.60 m, μ_k 0.25 → −3.92 J; 3.0 kg, 16 N at 37°, 5.0 m → −25 J)",
  kind: "numeric",
  difficulty: 2,
  variants: ["flat", "angled-pull"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const obj = rng.pick(["a crate", "a block", "a sled", "a suitcase"]);
    const p = rejectUntil(
      () => ({ m: nice(rng, 1, 30, 0.5), muk: nice(rng, 0.1, 0.5, 0.05), d: nice(rng, 1, 12, 0.1), F: variant === "flat" ? 0 : nice(rng, 10, 120, 1), theta: variant === "flat" ? 0 : rng.pick([20, 25, 30, 35, 37, 40, 45]) }),
      (c) => solve(c).N > 0.25 * c.m * g,
    );
    const s = solve(p);
    const angledText = variant === "flat" ? "" : ` by a constant force of ${q(p.F, "N")} acting at $${p.theta}^\\circ$ above the horizontal`;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${cap(obj)} of mass ${q(p.m, "kg")} is dragged ${q(p.d, "m")} in a straight line across a horizontal surface${angledText}. The coefficient of kinetic friction is $\\mu_k = ${p.muk}$. How much work does friction do on ${obj} during this displacement?`,
      diagram: { kind: "block-force", forces: variant === "flat" ? [{ label: "F", angleDeg: 0 }] : [{ label: "F", angleDeg: p.theta }], rough: true, massLabel: `${p.m} kg`, showNW: variant !== "flat" },
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "d", value: p.d, unit: "m" },
        { symbol: "\\mu_k", value: p.muk, unit: "" },
        ...(variant === "flat" ? [] : [{ symbol: "F", value: p.F, unit: "N" }, { symbol: "\\theta", value: p.theta, unit: "°" }]),
      ],
      target: { symbol: "W_f", unit: "J", label: "work done by friction" },
      answer: toSigFigs(s.W, 4),
      choices: buildNumericChoices(rng, s.W, [
        { errorId: "work-sign-flip", value: -s.W },
        ...(variant === "flat" ? [{ errorId: "mass-not-weight", value: -p.muk * p.m * p.d }] : [{ errorId: "normal-equals-mg", value: -p.muk * p.m * g * p.d }, { errorId: "vertical-component-sign", value: -p.muk * (p.m * g + p.F * sinD(p.theta)) * p.d }]),
        { errorId: "arithmetic-slip", value: -s.fk },
        ...(variant === "flat" ? [{ errorId: "arithmetic-slip", value: s.W * 2 }] : [{ errorId: "sin-cos-swap", value: -p.muk * (p.m * g - p.F * cosD(p.theta)) * p.d }]),
      ]),
      equations: ["newton-2", "friction-kinetic", "work-const", "work-friction"],
      recipe: [variant === "flat" ? "N = mg" : "N = mg − F sin θ", "f_k = μ_k N", "Friction opposes motion: θ = 180° → W_f = −f_k d"],
      hints: [
        "Friction acts opposite to the displacement, so its work is negative.",
        variant === "flat" ? "N = mg on a flat surface with no other vertical forces." : "The pull's upward component reduces N, so N ≠ mg.",
        `N = ${toSigFigs(s.N, 3)} N → f_k = ${toSigFigs(s.fk, 3)} N.`,
      ],
      solution: [
        { text: variant === "flat" ? "Normal force." : "Normal force, reduced by the pull's vertical component.", latex: variant === "flat" ? `N = mg = (${p.m})(9.80) = ${fx(s.N)}\\ \\text{N}` : `N = mg - F\\sin\\theta = (${p.m})(9.80) - (${p.F})\\sin${p.theta}^\\circ = ${fx(s.N)}\\ \\text{N}`, equationId: "newton-2", value: s.N },
        { text: "Kinetic friction.", latex: `f_k = \\mu_k N = (${p.muk})(${fx(s.N)}) = ${fx(s.fk)}\\ \\text{N}`, equationId: "friction-kinetic", value: s.fk },
        { text: "Friction is directed opposite the displacement (cos 180° = −1).", latex: `W_f = f_k d\\cos180^\\circ = -(${fx(s.fk)})(${p.d}) = ${fx(s.W)}\\ \\text{J}`, equationId: "work-friction", value: toSigFigs(s.W, 4) },
      ],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
