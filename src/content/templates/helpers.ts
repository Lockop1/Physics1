import type { Rng } from "../../engine/rng";
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
