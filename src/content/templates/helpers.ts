import type { Rng } from "../../engine/rng";
import type { GeneratedQuestion, QuestionPart } from "../../engine/types";
import { fmt, fmtTex } from "../../engine/params";

/** `3.14 \text{ m/s}` — number with LaTeX unit, for prompts. */
export function q(value: number, unit: string, sigFigs = 3): string {
  const u = unit ? `\\ \\text{${unit}}` : "";
  return `$${fmtTex(value, sigFigs)}${u}$`;
}

/** Plain-text number with unit, for choice labels / solution text. */
export function qs(value: number, unit: string, sigFigs = 3): string {
  return unit ? `${fmt(value, sigFigs)} ${unit}` : fmt(value, sigFigs);
}

export const fx = fmtTex;

/** Pick a variant: the requested one if valid, else random. */
export function chooseVariant(rng: Rng, variants: readonly string[], requested?: string): string {
  if (requested && variants.includes(requested)) return requested;
  return rng.pick(variants);
}

/** Degrees → radians. */
export const rad = (deg: number): number => (deg * Math.PI) / 180;
export const sinD = (deg: number): number => Math.sin(rad(deg));
export const cosD = (deg: number): number => Math.cos(rad(deg));
export const tanD = (deg: number): number => Math.tan(rad(deg));

/**
 * Assemble a multi-part question. The top-level target/answer/choices/solution
 * mirror parts[0] so single-answer consumers keep working.
 */
export function withParts(
  base: Omit<GeneratedQuestion, "target" | "answer" | "choices" | "solution" | "parts">,
  parts: QuestionPart[],
): GeneratedQuestion {
  const first = parts[0];
  if (!first) throw new Error("withParts: need at least one part");
  return {
    ...base,
    target: first.target,
    answer: first.answer,
    choices: first.choices,
    solution: parts.flatMap((p) => p.solution),
    parts,
  };
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Conceptual-MCQ factory: a list of hand-written cases, one drawn per seed.
// ---------------------------------------------------------------------------
import type { QuestionTemplate } from "../../engine/types";
import { buildStringChoices } from "../../engine/distractors";

export interface ConceptCase {
  prompt: string;
  answer: string;
  wrong: { value: string; errorId: string }[];
  /** Explanation shown as the worked solution. */
  explanation: string;
  latex?: string;
  equationId?: string;
  /** Optional per-case hints (else the template's). */
  hints?: string[];
}

export interface ConceptMeta {
  id: string;
  topicId: string;
  title: string;
  source?: string;
  difficulty?: 1 | 2 | 3;
  equations: string[];
  recipe: string[];
  hints: string[];
}

export function conceptTemplate(meta: ConceptMeta, cases: ConceptCase[]): QuestionTemplate {
  const base: QuestionTemplate = {
    id: meta.id,
    topicId: meta.topicId,
    title: meta.title,
    kind: "conceptual",
    difficulty: meta.difficulty ?? 1,
    generate(rng: Rng): GeneratedQuestion {
      const c = rng.pick(cases);
      const step: GeneratedQuestion["solution"][number] = { text: c.explanation };
      if (c.latex) step.latex = c.latex;
      if (c.equationId) step.equationId = c.equationId;
      return {
        templateId: meta.id,
        seed: rng.seed,
        prompt: c.prompt,
        givens: [],
        target: { symbol: "", unit: "", label: "the correct statement" },
        answer: c.answer,
        choices: buildStringChoices(rng, c.answer, c.wrong),
        equations: meta.equations,
        recipe: meta.recipe,
        hints: c.hints ?? meta.hints,
        solution: [step],
      };
    },
  };
  if (meta.source) base.source = meta.source;
  return base;
}
