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
