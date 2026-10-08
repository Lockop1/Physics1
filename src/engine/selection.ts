import type { Rng } from "./rng";
import type { QuestionTemplate } from "./types";
import type { TemplateStats } from "../lib/storage";
import { createRng } from "./rng";

/**
 * Weak-spot weighting. Three signals, all additive on top of a floor:
 *  - low recent accuracy (last 10 results)
 *  - not seen recently (up to +1 after 3 days)
 *  - errors this template can produce that the student commits often
 */
export interface WeightInputs {
  stats: TemplateStats | undefined;
  /** Error ids this template's distractors can carry. */
  errorIds?: readonly string[];
  /** Student's error counts (errorId → times committed). */
  errorCounts?: Record<string, number>;
  now?: number;
}

export function weakSpotWeight(inp: WeightInputs): number {
  const now = inp.now ?? Date.now();
  let w = 0.5;
  if (!inp.stats || inp.stats.attempts === 0) {
    w += 1.0; // never seen → favoured
  } else {
    const recent = inp.stats.recent;
    const acc = recent.length ? recent.filter(Boolean).length / recent.length : 0.5;
    w += (1 - acc) * 2.5;
    const days = (now - inp.stats.lastSeen) / 86_400_000;
    w += Math.min(days / 3, 1);
  }
  if (inp.errorIds && inp.errorCounts) {
    const total = Object.values(inp.errorCounts).reduce((a, b) => a + b, 0);
    if (total > 0) {
      const mine = inp.errorIds.reduce((a, id) => a + (inp.errorCounts![id] ?? 0), 0);
      w += (mine / total) * 2; // share of the student's mistakes this template exercises
    }
  }
  return w;
}

/** Backwards-compatible simple weight (accuracy + staleness only). */
export function weightFor(stats: TemplateStats | undefined, now = Date.now()): number {
  return weakSpotWeight({ stats, now });
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

export function pickTemplate(rng: Rng, templates: readonly QuestionTemplate[], statsFor: (id: string) => TemplateStats | undefined): QuestionTemplate {
  return pickWeighted(rng, templates, (t) => weightFor(statsFor(t.id)));
}

/** Error ids a template can produce, found by sampling a few seeds (cached). */
const errorCache = new Map<string, string[]>();
export function errorsProducedBy(t: QuestionTemplate): string[] {
  const hit = errorCache.get(t.id);
  if (hit) return hit;
  const ids = new Set<string>();
  const variants = t.variants ?? [undefined];
  for (const v of variants) {
    for (const seed of [1, 2, 3, 4]) {
      const q = t.generate(createRng(seed), v ? { variant: v } : undefined);
      const all = q.parts ? q.parts.flatMap((p) => p.choices) : q.choices;
      for (const c of all) if (c.errorId) ids.add(c.errorId);
    }
  }
  const out = Array.from(ids);
  errorCache.set(t.id, out);
  return out;
}

/** Templates that can produce a given error, most-often-producing first. */
export function templatesProducing(errorId: string, templates: readonly QuestionTemplate[]): QuestionTemplate[] {
  return templates.filter((t) => errorsProducedBy(t).includes(errorId));
}

/** Top-N most committed errors. */
export function topErrors(errorCounts: Record<string, number>, n = 3): { errorId: string; count: number }[] {
  return Object.entries(errorCounts)
    .map(([errorId, count]) => ({ errorId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}
