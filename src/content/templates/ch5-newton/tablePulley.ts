import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Block m1 on a frictionless table, rope over a pulley to hanging m2. a = m2 g/(m1+m2), T = m1 a, v after falling h = √(2ah). Lecture: 4.00/1.00 kg, 1.00 m → 1.96, 7.84, 1.98. */
export interface TablePulleyParams {
  m1: number;
  m2: number;
  h: number;
}
export function solve(p: TablePulleyParams): { a: number; T: number; v: number } {
  const a = (p.m2 * g) / (p.m1 + p.m2);
  return { a, T: p.m1 * a, v: Math.sqrt(2 * a * p.h) };
}

export const template: QuestionTemplate = {
  id: "ch5.pulleys.table-frictionless",
  topicId: "ch5.pulleys",
  title: "Table + hanging mass (frictionless): a, T, speed after falling h",
  source: "Ch 6a lecture — Problem i (4.00 kg / 1.00 kg → 1.96 m/s², 7.84 N, 1.98 m/s)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = { m1: nice(rng, 1, 12, 0.5), m2: nice(rng, 0.5, 6, 0.25), h: nice(rng, 0.4, 2.5, 0.1) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "Find the acceleration of the system.",
        target: { symbol: "a", unit: "m/s²", label: "acceleration" },
        answer: toSigFigs(s.a, 4),
        choices: buildNumericChoices(rng, s.a, [
          { errorId: "treated-as-free-fall", value: g },
          { errorId: "pulley-single-mass", value: (p.m2 * g) / p.m1 },
          { errorId: "mass-not-weight", value: p.m2 / (p.m1 + p.m2) },
          { errorId: "pulley-single-mass", value: (p.m2 * g) / p.m2 / 2 },
        ]),
        solution: [
          { text: "FBD of each block. Table block: T = m₁a. Hanging block: m₂g − T = m₂a.", latex: `T = m_1 a,\\qquad m_2 g - T = m_2 a`, equationId: "newton-2" },
          { text: "Add the equations: the tension cancels and the whole system's mass appears.", latex: `a = \\frac{m_2 g}{m_1 + m_2} = \\frac{(${p.m2})(9.80)}{${p.m1} + ${p.m2}} = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(s.a, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "Find the tension in the rope.",
        target: { symbol: "T", unit: "N", label: "tension" },
        answer: toSigFigs(s.T, 4),
        choices: buildNumericChoices(rng, s.T, [
          { errorId: "tension-equals-weight", value: p.m2 * g },
          { errorId: "pulley-single-mass", value: p.m2 * s.a },
          { errorId: "mass-not-weight", value: p.m1 * s.a / g },
          { errorId: "arithmetic-slip", value: (p.m1 + p.m2) * s.a },
        ]),
        solution: [{ text: "Use the table block's equation.", latex: `T = m_1 a = (${p.m1})(${fx(s.a)}) = ${fx(s.T)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(s.T, 4) }],
      },
      {
        label: "(c)",
        prompt: `The hanging mass starts from rest ${q(p.h, "m")} above the floor. How fast is it moving when it hits the floor?`,
        target: { symbol: "v", unit: "m/s", label: "speed at the floor" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "treated-as-free-fall", value: Math.sqrt(2 * g * p.h) },
          { errorId: "forgot-sqrt", value: 2 * s.a * p.h },
          { errorId: "kinematics-missing-half", value: Math.sqrt(s.a * p.h) },
        ]),
        solution: [{ text: "Constant acceleration a (not g!) over the drop height.", latex: `v^2 = v_0^2 + 2a\\,\\Delta y \;\\Rightarrow\; v = \\sqrt{2(${fx(s.a)})(${p.h})} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "kin-v2", value: toSigFigs(s.v, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `Two blocks are connected by a massless rope over a frictionless pulley. The block on the frictionless table has mass ${q(p.m1, "kg")} and the hanging block has mass ${q(p.m2, "kg")}.`,
        diagram: { kind: "pulley", m1Label: `${p.m1} kg`, m2Label: `${p.m2} kg`, heightLabel: `h = ${p.h} m` },
        givens: [
          { symbol: "m_1", value: p.m1, unit: "kg" },
          { symbol: "m_2", value: p.m2, unit: "kg" },
          { symbol: "h", value: p.h, unit: "m" },
        ],
        equations: ["newton-2", "weight", "kin-v2"],
        recipe: ["FBD for each block; same |a|, same T", "Table block: T = m₁a", "Hanging block: m₂g − T = m₂a", "Add → a = m₂g/(m₁ + m₂); then T; then v² = 2ah"],
        hints: [
          "Treat each block separately with Newton's 2nd law — they share the same rope tension and the same acceleration magnitude.",
          "Only m₂g drives the system, but it must accelerate BOTH masses.",
          `a = ${p.m2}(9.80)/(${p.m1} + ${p.m2}).`,
        ],
      },
      parts,
    );
  },
};
