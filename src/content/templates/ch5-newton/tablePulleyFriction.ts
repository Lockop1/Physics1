import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, withParts } from "../helpers";

/**
 * Table + hanging mass with friction on the table.
 *  - μ_s needed to keep it at rest: m2 g = μ_s m1 g → μ_s = m2/m1  (SI Q24: 1.50/5.00 → 0.300)
 *  - sliding with μ_k: a = (m2 g − μ_k m1 g)/(m1+m2), T = m2(g − a)  (SI Q24: μ_k 0.10 → 1.51 m/s², 12.4 N; lecture ii: 4/1 kg, 0.2 → 0.392)
 */
export interface TableFrictionParams {
  m1: number;
  m2: number;
  muk: number;
}
export function solve(p: TableFrictionParams): { a: number; T: number; musMin: number } {
  const a = (p.m2 * g - p.muk * p.m1 * g) / (p.m1 + p.m2);
  return { a, T: p.m2 * (g - a), musMin: p.m2 / p.m1 };
}

type Variant = "mu-s" | "a-T";

export const template: QuestionTemplate = {
  id: "ch5.pulleys.table-friction",
  topicId: "ch5.pulleys",
  title: "Table + hanging mass with friction: μ_s to hold, or a and T with μ_k",
  source: "SI Exam 1 Review — Q24 (5.00/1.50 kg → μ_s 0.300; μ_k 0.10 → 1.51 m/s², 12.4 N); Ch 6a lecture Problem ii",
  kind: "numeric",
  difficulty: 3,
  variants: ["mu-s", "a-T"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const p = rejectUntil(
      () => ({ m1: nice(rng, 2, 12, 0.5), m2: nice(rng, 0.5, 5, 0.25), muk: nice(rng, 0.05, 0.4, 0.05) }),
      (c) => {
        const s = solve(c);
        return c.m2 < c.m1 && s.musMin < 0.9 && s.a > 0.3;
      },
    );
    const s = solve(p);
    const base = {
      templateId: this.id,
      seed: rng.seed,
      variant,
      diagram: { kind: "pulley" as const, m1Label: `${p.m1} kg`, m2Label: `${p.m2} kg`, rough: true },
    };
    if (variant === "mu-s") {
      return {
        ...base,
        prompt: `A block of mass ${q(p.m1, "kg")} on a rough horizontal table is connected by a rope over a frictionless pulley to a hanging block of mass ${q(p.m2, "kg")}. What minimum coefficient of static friction between the block and the table keeps the system at rest?`,
        givens: [
          { symbol: "m_1", value: p.m1, unit: "kg" },
          { symbol: "m_2", value: p.m2, unit: "kg" },
        ],
        target: { symbol: "\\mu_s", unit: "", label: "minimum coefficient of static friction" },
        answer: toSigFigs(s.musMin, 4),
        choices: buildNumericChoices(rng, s.musMin, [
          { errorId: "pulley-single-mass", value: p.m2 / (p.m1 + p.m2) },
          { errorId: "arithmetic-slip", value: p.m1 / p.m2 },
          { errorId: "mass-not-weight", value: (p.m2 * g) / p.m1 },
          { errorId: "arithmetic-slip", value: s.musMin / 2 },
        ]),
        equations: ["newton-2", "weight", "friction-static"],
        recipe: ["At rest: T = m₂g (hanging block)", "Table block: T = f_s ≤ μ_s N with N = m₁g", "μ_s,min = m₂/m₁"],
        hints: [
          "At rest, the tension equals the hanging weight, and static friction must supply that same force on the table block.",
          "f_s,max = μ_s m₁g must be at least m₂g.",
          `μ_s = ${p.m2}/${p.m1}.`,
        ],
        solution: [
          { text: "Hanging block at rest.", latex: `T = m_2 g`, equationId: "newton-2" },
          { text: "Table block at rest: friction balances T, and at the minimum μ_s it is at its maximum.", latex: `\\mu_s N = \\mu_s m_1 g = m_2 g \;\\Rightarrow\; \\mu_s = \\frac{m_2}{m_1} = \\frac{${p.m2}}{${p.m1}} = ${fx(s.musMin)}`, equationId: "friction-static", value: toSigFigs(s.musMin, 4) },
        ],
      };
    }
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "Find the acceleration of the system.",
        target: { symbol: "a", unit: "m/s²", label: "acceleration" },
        answer: toSigFigs(s.a, 4),
        choices: buildNumericChoices(rng, s.a, [
          { errorId: "forgot-friction", value: (p.m2 * g) / (p.m1 + p.m2) },
          { errorId: "pulley-single-mass", value: (p.m2 * g - p.muk * p.m1 * g) / p.m1 },
          { errorId: "treated-as-free-fall", value: g },
          { errorId: "pulley-single-mass", value: (p.m2 * g - p.muk * p.m1 * g) / p.m2 },
        ]),
        solution: [
          { text: "Table block: T − f_k = m₁a with f_k = μ_k N = μ_k m₁g. Hanging block: m₂g − T = m₂a.", latex: `T - \\mu_k m_1 g = m_1 a,\\qquad m_2 g - T = m_2 a`, equationId: "friction-kinetic" },
          { text: "Add to eliminate T.", latex: `a = \\frac{m_2 g - \\mu_k m_1 g}{m_1 + m_2} = \\frac{(${p.m2})(9.80) - (${p.muk})(${p.m1})(9.80)}{${p.m1} + ${p.m2}} = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(s.a, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "Find the tension in the rope.",
        target: { symbol: "T", unit: "N", label: "tension" },
        answer: toSigFigs(s.T, 4),
        choices: buildNumericChoices(rng, s.T, [
          { errorId: "tension-equals-weight", value: p.m2 * g },
          { errorId: "forgot-friction", value: p.m1 * s.a },
          { errorId: "elevator-sign", value: p.m2 * (g + s.a) },
          { errorId: "pulley-single-mass", value: p.m2 * s.a },
        ]),
        solution: [{ text: "Hanging block's equation (or the table block's: T = m₁a + μ_k m₁g).", latex: `T = m_2(g - a) = (${p.m2})(9.80 - ${fx(s.a)}) = ${fx(s.T)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(s.T, 4) }],
      },
    ];
    return withParts(
      {
        ...base,
        prompt: `A block of mass ${q(p.m1, "kg")} slides on a rough horizontal table, connected by a rope over a frictionless pulley to a hanging block of mass ${q(p.m2, "kg")}. The coefficient of kinetic friction between the block and the table is $\\mu_k = ${p.muk}$.`,
        givens: [
          { symbol: "m_1", value: p.m1, unit: "kg" },
          { symbol: "m_2", value: p.m2, unit: "kg" },
          { symbol: "\\mu_k", value: p.muk, unit: "" },
        ],
        equations: ["newton-2", "friction-kinetic", "weight"],
        recipe: ["FBD each block; N = m₁g on the table", "Table: T − μ_k m₁g = m₁a", "Hanging: m₂g − T = m₂a", "Add → a; then T"],
        hints: ["Same as the frictionless case, but friction μ_k m₁g now opposes the table block.", "Add the two second-law equations; T cancels.", `f_k = ${toSigFigs(p.muk * p.m1 * g, 3)} N.`],
      },
      parts,
    );
  },
};
