import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/**
 * Block slides down a curved path of height h, reaching the bottom at speed v:
 * W_gravity + W_friction = ΔK → W_f = ½mv² − mgh.
 * Lecture #64: 100 g, v = 4.0 m/s → W_f = −1.2 J (figure gives h ≈ 2.0 m).
 */
export function solve(p: { m: number; h: number; v: number }): { Wg: number; K: number; Wf: number } {
  const Wg = p.m * g * p.h;
  const K = 0.5 * p.m * p.v * p.v;
  return { Wg, K, Wf: K - Wg };
}

type Variant = "Wf" | "v";

export const template: QuestionTemplate = {
  id: "ch7.work-energy.friction-path",
  topicId: "ch7.work-energy",
  title: "Sliding down a curved path: work done by friction from the final speed",
  source: "Ch 7 lecture — Problem #64 (100 g block, reaches bottom at 4.0 m/s → W_f = −1.2 J)",
  kind: "numeric",
  difficulty: 3,
  variants: ["Wf", "v"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const useGrams = rng.chance(0.5);
    const p = rejectUntil(
      () => ({ m: useGrams ? nice(rng, 50, 900, 10) / 1000 : nice(rng, 1, 20, 0.5), h: nice(rng, 0.5, 6, 0.1), v: nice(rng, 1, 9, 0.1) }),
      (c) => {
        const s = solve(c);
        return s.Wf < -0.15 * s.Wg && s.K > 0.2 * s.Wg;
      },
    );
    const s = solve(p);
    const mShown = useGrams ? toSigFigs(p.m * 1000, 3) : p.m;
    const mUnit = useGrams ? "g" : "kg";
    if (variant === "Wf") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A ${q(mShown, mUnit)} block is released from rest and slides down a curved track that drops ${q(p.h, "m")} in height, reaching the bottom with a speed of ${q(p.v, "m/s")}. How much work does friction do on the block?`,
        givens: [
          { symbol: "m", value: mShown, unit: mUnit },
          { symbol: "h", value: p.h, unit: "m" },
          { symbol: "v", value: p.v, unit: "m/s" },
        ],
        target: { symbol: "W_f", unit: "J", label: "work done by friction" },
        answer: toSigFigs(s.Wf, 4),
        choices: buildNumericChoices(rng, s.Wf, [
          { errorId: "work-sign-flip", value: -s.Wf },
          { errorId: "gravity-work-sign", value: s.K + s.Wg },
          ...(useGrams ? [{ errorId: "unit-conversion-direction", value: s.Wf * 1000 }] : [{ errorId: "forgot-square", value: 0.5 * p.m * p.v - s.Wg }]),
          { errorId: "forgot-friction", value: s.K },
        ]),
        equations: ["work-const", "kinetic-energy", "work-energy"],
        recipe: [...(useGrams ? ["Convert g → kg"] : []), "W_gravity = +mgh (path-independent)", "W_net = W_g + W_f = ΔK = ½mv² − 0", "W_f = ½mv² − mgh"],
        hints: ["The path is curved, so Newton's laws are hard — but energy doesn't care about the path.", "Two forces do work: gravity (+mgh) and friction (unknown). The normal force does none.", `mgh = ${toSigFigs(s.Wg, 3)} J, K = ${toSigFigs(s.K, 3)} J.`],
        solution: [
          { text: "Work by gravity depends only on the height change.", latex: `W_g = mgh = (${p.m})(9.80)(${p.h}) = ${fx(s.Wg)}\\ \\text{J}`, equationId: "work-const", value: s.Wg },
          { text: "Kinetic energy at the bottom.", latex: `K = \\tfrac12 m v^2 = \\tfrac12(${p.m})(${p.v})^2 = ${fx(s.K)}\\ \\text{J}`, equationId: "kinetic-energy", value: s.K },
          { text: "Work–energy theorem: W_g + W_f = ΔK.", latex: `W_f = K - W_g = ${fx(s.K)} - ${fx(s.Wg)} = ${fx(s.Wf)}\\ \\text{J}`, equationId: "work-energy", value: toSigFigs(s.Wf, 4) },
        ],
        note: "Negative, as friction's work must be. Without friction the block would arrive at √(2gh) = " + fx(Math.sqrt(2 * g * p.h)) + " m/s.",
      };
    }
    const Wf = toSigFigs(s.Wf, 3);
    const vAns = Math.sqrt((2 * (s.Wg + Wf)) / p.m);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A ${q(mShown, mUnit)} block is released from rest at the top of a curved track that drops ${q(p.h, "m")}. Friction does ${q(Wf, "J")} of work on it on the way down. How fast is it moving at the bottom?`,
      givens: [
        { symbol: "m", value: mShown, unit: mUnit },
        { symbol: "h", value: p.h, unit: "m" },
        { symbol: "W_f", value: Wf, unit: "J" },
      ],
      target: { symbol: "v", unit: "m/s", label: "speed at the bottom" },
      answer: toSigFigs(vAns, 4),
      choices: buildNumericChoices(rng, vAns, [
        { errorId: "forgot-friction", value: Math.sqrt(2 * g * p.h) },
        { errorId: "work-sign-flip", value: Math.sqrt((2 * (s.Wg - Wf)) / p.m) },
        { errorId: "forgot-sqrt", value: (2 * (s.Wg + Wf)) / p.m },
        { errorId: "kinematics-missing-half", value: Math.sqrt((s.Wg + Wf) / p.m) },
      ]),
      equations: ["work-const", "work-energy"],
      recipe: ["W_net = mgh + W_f (W_f negative)", "½mv² = W_net"],
      hints: ["Add the work of every force; the normal force does none on a track.", "½mv² = mgh + W_f with W_f < 0.", `W_net = ${toSigFigs(s.Wg + Wf, 3)} J.`],
      solution: [{ text: "Work–energy theorem from rest.", latex: `\\tfrac12 m v^2 = mgh + W_f \;\\Rightarrow\; v = \\sqrt{\\frac{2(${fx(s.Wg)} + (${Wf}))}{${p.m}}} = ${fx(vAns)}\\ \\text{m/s}`, equationId: "work-energy", value: toSigFigs(vAns, 4) }],
    };
  },
};
