import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { q, fx, withParts } from "../helpers";

/** Accelerate for a time, then brake to a stop. Lecture #58: a = 0.0500 m/s² for 8.00 min from 4.00 m/s → 28.0 m/s; brake at 0.550 → 50.9 s; distances 7680 m and 713 m. */
export interface MultiPhaseParams {
  v0: number;
  a1: number;
  tMin: number; // minutes
  a2: number; // magnitude of deceleration
}
export function solve(p: MultiPhaseParams): { t1: number; v: number; t2: number; x1: number; x2: number } {
  const t1 = p.tMin * 60;
  const v = p.v0 + p.a1 * t1;
  const t2 = v / p.a2;
  return { t1, v, t2, x1: p.v0 * t1 + 0.5 * p.a1 * t1 * t1, x2: (v * v) / (2 * p.a2) };
}

export const template: QuestionTemplate = {
  id: "e1.kin1d.multi-phase",
  topicId: "e1.kin1d",
  title: "Accelerate, then brake to a stop (multi-part)",
  source: "Ch 3 lecture — Problem #58 freight train (28.0 m/s; 50.9 s; 7680 m and 713 m)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(["A freight train", "A tram", "A cargo ship", "An airport shuttle"]);
    const p = { v0: nice(rng, 0, 8, 0.5), a1: nice(rng, 0.02, 0.4, 0.01), tMin: nice(rng, 1, 10, 0.5), a2: nice(rng, 0.2, 1.5, 0.05) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `What is its velocity after the ${q(p.tMin, "min")} of acceleration?`,
        target: { symbol: "v", unit: "m/s", label: "final velocity of phase 1" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "minutes-not-converted", value: p.v0 + p.a1 * p.tMin },
          { errorId: "arithmetic-slip", value: p.a1 * s.t1 },
          { errorId: "kinematics-missing-half", value: p.v0 + 0.5 * p.a1 * s.t1 },
        ]),
        solution: [
          { text: "Convert the time to seconds.", latex: `t_1 = ${p.tMin}\\ \\text{min} = ${fx(s.t1)}\\ \\text{s}`, value: s.t1 },
          { text: "Constant acceleration.", latex: `v = v_0 + a_1 t_1 = ${p.v0} + (${p.a1})(${fx(s.t1)}) = ${fx(s.v)}\\ \\text{m/s}`, equationId: "kin-v", value: toSigFigs(s.v, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: `It then brakes at ${q(p.a2, "m/s²")}. How long does it take to stop?`,
        target: { symbol: "t_2", unit: "s", label: "time to stop" },
        answer: toSigFigs(s.t2, 4),
        choices: buildNumericChoices(rng, s.t2, [
          { errorId: "arithmetic-slip", value: s.v * p.a2 },
          { errorId: "arithmetic-slip", value: s.t2 / 60 },
          { errorId: "kinematics-missing-half", value: s.t2 / 2 },
        ]),
        solution: [{ text: "From v to 0 with a = −a₂.", latex: `0 = v - a_2 t_2 \;\\Rightarrow\; t_2 = \\frac{v}{a_2} = \\frac{${fx(s.v)}}{${p.a2}} = ${fx(s.t2)}\\ \\text{s}`, equationId: "kin-v", value: toSigFigs(s.t2, 4) }],
      },
      {
        label: "(c)",
        prompt: "How far does it travel while accelerating?",
        target: { symbol: "x_1", unit: "m", label: "distance in phase 1" },
        answer: toSigFigs(s.x1, 4),
        choices: buildNumericChoices(rng, s.x1, [
          { errorId: "kinematics-missing-half", value: p.v0 * s.t1 + p.a1 * s.t1 * s.t1 },
          { errorId: "minutes-not-converted", value: p.v0 * p.tMin + 0.5 * p.a1 * p.tMin * p.tMin },
          { errorId: "arithmetic-slip", value: s.v * s.t1 },
        ]),
        solution: [{ text: "Displacement with constant acceleration.", latex: `x_1 = v_0 t_1 + \\tfrac12 a_1 t_1^2 = (${p.v0})(${fx(s.t1)}) + \\tfrac12(${p.a1})(${fx(s.t1)})^2 = ${fx(s.x1)}\\ \\text{m}`, equationId: "kin-x", value: toSigFigs(s.x1, 4) }],
      },
      {
        label: "(d)",
        prompt: "How far does it travel while braking?",
        target: { symbol: "x_2", unit: "m", label: "stopping distance" },
        answer: toSigFigs(s.x2, 4),
        choices: buildNumericChoices(rng, s.x2, [
          { errorId: "kinematics-missing-half", value: (s.v * s.v) / p.a2 },
          { errorId: "arithmetic-slip", value: s.v * s.t2 },
          { errorId: "forgot-square", value: s.v / (2 * p.a2) },
        ]),
        solution: [{ text: "No time needed: v² = v₀² + 2aΔx with v = 0.", latex: `x_2 = \\frac{v^2}{2a_2} = \\frac{(${fx(s.v)})^2}{2(${p.a2})} = ${fx(s.x2)}\\ \\text{m}`, equationId: "kin-v2", value: toSigFigs(s.x2, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `${skin} moving at ${q(p.v0, "m/s")} accelerates at ${q(p.a1, "m/s²")} for ${q(p.tMin, "min")}.`,
        givens: [
          { symbol: "v_0", value: p.v0, unit: "m/s" },
          { symbol: "a_1", value: p.a1, unit: "m/s²" },
          { symbol: "t_1", value: p.tMin, unit: "min" },
          { symbol: "a_2", value: p.a2, unit: "m/s²", note: "braking" },
        ],
        equations: ["kin-v", "kin-x", "kin-v2"],
        recipe: ["Minutes → seconds", "Phase 1: v = v₀ + at, x = v₀t + ½at²", "Phase 2 (a negative, ends at v = 0): t = v/a₂, x = v²/(2a₂)"],
        hints: ["Treat the two phases separately; the final velocity of phase 1 is the initial velocity of phase 2.", "Convert minutes to seconds first.", `t₁ = ${fx(s.t1)} s.`],
      },
      parts,
    );
  },
};
