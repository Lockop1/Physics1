import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Atwood machine: a = (m1 − m2)g/(m1 + m2), T = 2 m1 m2 g/(m1 + m2). */
export interface AtwoodParams {
  m1: number; // heavier
  m2: number;
}
export function solve(p: AtwoodParams): { a: number; T: number } {
  const a = ((p.m1 - p.m2) * g) / (p.m1 + p.m2);
  return { a, T: p.m2 * (g + a) };
}

export const template: QuestionTemplate = {
  id: "ch5.pulleys.atwood",
  topicId: "ch5.pulleys",
  title: "Atwood machine (two hanging masses): a and T",
  source: "Ch 6a lecture — 'Two connected object problems' summary",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ m1: nice(rng, 1, 12, 0.5), m2: nice(rng, 1, 12, 0.5) }),
      (c) => c.m1 > c.m2 && solve(c).a > 0.5,
    );
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the magnitude of the acceleration of the masses?",
        target: { symbol: "a", unit: "m/s²", label: "acceleration" },
        answer: toSigFigs(s.a, 4),
        choices: buildNumericChoices(rng, s.a, [
          { errorId: "pulley-single-mass", value: ((p.m1 - p.m2) * g) / p.m1 },
          { errorId: "treated-as-free-fall", value: g },
          { errorId: "arithmetic-slip", value: (p.m1 * g) / (p.m1 + p.m2) },
          { errorId: "pulley-single-mass", value: ((p.m1 - p.m2) * g) / p.m2 },
        ]),
        solution: [
          { text: "Heavier mass goes down: m₁g − T = m₁a. Lighter goes up: T − m₂g = m₂a.", latex: `m_1 g - T = m_1 a,\\qquad T - m_2 g = m_2 a`, equationId: "newton-2" },
          { text: "Add the equations.", latex: `a = \\frac{(m_1 - m_2)g}{m_1 + m_2} = \\frac{(${p.m1} - ${p.m2})(9.80)}{${p.m1} + ${p.m2}} = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(s.a, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is the tension in the rope?",
        target: { symbol: "T", unit: "N", label: "tension" },
        answer: toSigFigs(s.T, 4),
        choices: buildNumericChoices(rng, s.T, [
          { errorId: "tension-equals-weight", value: p.m1 * g },
          { errorId: "tension-equals-weight", value: p.m2 * g },
          { errorId: "elevator-sign", value: p.m2 * (g - s.a) },
          { errorId: "arithmetic-slip", value: (p.m1 + p.m2) * g },
        ]),
        solution: [{ text: "From the lighter mass's equation.", latex: `T = m_2(g + a) = (${p.m2})(9.80 + ${fx(s.a)}) = ${fx(s.T)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(s.T, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `Two masses, ${q(p.m1, "kg")} and ${q(p.m2, "kg")}, hang on either side of a massless, frictionless pulley (an Atwood machine) and are released from rest.`,
        diagram: { kind: "pulley", atwood: true, m1Label: `${p.m1} kg`, m2Label: `${p.m2} kg` },
        givens: [
          { symbol: "m_1", value: p.m1, unit: "kg" },
          { symbol: "m_2", value: p.m2, unit: "kg" },
        ],
        equations: ["newton-2", "weight"],
        recipe: ["FBD each mass: T up, mg down", "Heavier: m₁g − T = m₁a; lighter: T − m₂g = m₂a", "Add → a; back-substitute → T"],
        hints: ["Both masses share the same T and the same |a| (one up, one down).", "Write ΣF = ma for each with the positive direction along the motion.", `Net driving force = (${p.m1} − ${p.m2})g on total mass ${p.m1 + p.m2} kg.`],
      },
      parts,
    );
  },
};
