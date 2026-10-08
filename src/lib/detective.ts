/** UI-side helpers for the detective modes (template selection, equation index). */
import { createRng, randomSeed } from "../engine/rng";
import type { GeneratedQuestion, QuestionTemplate } from "../engine/types";
import { TEMPLATES, templateById } from "../content/templates";
import { CHAPTERS } from "../content/topics";
import { getDetective, type FlashcardStats } from "./storage";
import { FLASHCARDS, type Flashcard } from "../content/detective/flashcards";

export interface ChapterFilter {
  id: string; // chapter id or "all" / "exam2" / "exam1"
  label: string;
}

export const CHAPTER_FILTERS: ChapterFilter[] = [
  { id: "exam2", label: "Exam 2 (all)" },
  ...CHAPTERS.filter((c) => c.exam === "exam2").map((c) => ({ id: c.id, label: c.title })),
  { id: "exam1", label: "Exam 1 (all)" },
  { id: "all", label: "Everything" },
];

export function templatesForFilter(filter: string, opts?: { minRecipe?: number; numericOnly?: boolean }): QuestionTemplate[] {
  const topicIds = new Set(
    CHAPTERS.filter((c) => filter === "all" || c.id === filter || c.exam === filter)
      .flatMap((c) => c.topics)
      .map((t) => t.id),
  );
  return TEMPLATES.filter((t) => topicIds.has(t.topicId) && (!opts?.numericOnly || t.kind === "numeric")).filter((t) => {
    if (!opts?.minRecipe) return true;
    // probe one seed for recipe length
    return t.generate(createRng(1)).recipe.length >= opts.minRecipe;
  });
}

export function randomQuestionFor(filter: string, opts?: { minRecipe?: number; numericOnly?: boolean }): { templateId: string; seed: number } | null {
  const pool = templatesForFilter(filter, opts);
  if (pool.length === 0) return null;
  const rng = createRng(randomSeed());
  const t = rng.pick(pool);
  return { templateId: t.id, seed: randomSeed() };
}

export function buildFor(templateId: string, seed: number): GeneratedQuestion | null {
  const t = templateById(templateId);
  return t ? t.generate(createRng(seed)) : null;
}

/** Map equation id → template ids whose questions use it (union over a few seeds / variants). */
let eqIndex: Map<string, string[]> | null = null;
export function templatesUsingEquation(equationId: string): string[] {
  if (!eqIndex) {
    eqIndex = new Map();
    for (const t of TEMPLATES) {
      const ids = new Set<string>();
      const variants = t.variants ?? [undefined];
      for (const v of variants) {
        for (const seed of [1, 2, 3]) {
          const q = t.generate(createRng(seed), v ? { variant: v } : undefined);
          for (const e of q.equations) ids.add(e);
        }
      }
      for (const e of ids) {
        if (!eqIndex.has(e)) eqIndex.set(e, []);
        eqIndex.get(e)!.push(t.id);
      }
    }
  }
  return eqIndex.get(equationId) ?? [];
}

/** Flashcard weighting: misses and unseen cards come up more often. */
export function flashcardWeight(stats: FlashcardStats | undefined, now = Date.now()): number {
  if (!stats || stats.seen === 0) return 2;
  const missRate = stats.missed / stats.seen;
  const days = (now - stats.lastSeen) / 86_400_000;
  return 0.4 + missRate * 3 + Math.min(days, 3) * 0.3;
}

export function pickFlashcard(exclude?: string): Flashcard {
  const det = getDetective();
  const rng = createRng(randomSeed());
  const pool = FLASHCARDS.filter((c) => c.id !== exclude);
  const weights = pool.map((c) => flashcardWeight(det.flashcards[c.id]));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}
