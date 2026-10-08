import type { Rng } from "./rng";
import type { QuestionTemplate } from "./types";
import type { TemplateStats } from "../lib/storage";

/**
 * Weighted random pick. Weights default to 1; low recent accuracy and
 * "not seen recently" raise a template's weight so weak spots come up more.
 * (Session 5 will extend this with error-committed weighting.)
 */
export function weightFor(stats: TemplateStats | undefined, now = Date.now()): number {
  if (!stats || stats.attempts === 0) return 1.5; // never seen → slightly favoured
  const recent = stats.recent;
  const acc = recent.length ? recent.filter(Boolean).length / recent.length : 0.5;
  const days = (now - stats.lastSeen) / 86_400_000;
  const staleness = Math.min(days / 3, 1); // up to +1 after 3 days
  return 0.5 + (1 - acc) * 2 + staleness;
}

export function pickWeighted<T>(rng: Rng, items: readonly T[], weight: (t: T) => number): T {
  if (items.length === 0) throw new Error("pickWeighted: empty");
  const weights = items.map((it) => Math.max(0, weight(it)));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return rng.pick(items);
  let r = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i] as number;
    if (r <= 0) return items[i] as T;
  }
  return items[items.length - 1] as T;
}

export function pickTemplate(
  rng: Rng,
  templates: readonly QuestionTemplate[],
  statsFor: (id: string) => TemplateStats | undefined,
): QuestionTemplate {
  return pickWeighted(rng, templates, (t) => weightFor(statsFor(t.id)));
}
