/**
 * Exam simulation builder. Pure: given a seed and settings, returns the list of
 * (templateId, seed) pairs — so an exam can be rebuilt from its seed.
 */
import { createRng } from "./rng";
import type { QuestionTemplate } from "./types";
import { TEMPLATES } from "../content/templates";
import { CHAPTERS, type ExamId } from "../content/topics";

export type ExamChoice = ExamId | "mixed";

export interface ExamSettings {
  exam: ExamChoice;
  count: number;
  /** Fraction of conceptual questions to aim for (default 0.25). */
  conceptualShare?: number;
}

export interface ExamItem {
  templateId: string;
  seed: number;
}

function templatesForExam(exam: ExamId): QuestionTemplate[] {
  const topicIds = new Set(CHAPTERS.filter((c) => c.exam === exam).flatMap((c) => c.topics.map((t) => t.id)));
  return TEMPLATES.filter((t) => topicIds.has(t.topicId));
}

/**
 * Build an exam. Topics are weighted by their number of templates (i.e. the
 * draw is uniform over templates), ~25% conceptual, no repeated template unless
 * there are fewer templates than questions. "mixed" draws ~70% from Exam 2.
 */
export function buildExam(examSeed: number, settings: ExamSettings): ExamItem[] {
  const rng = createRng(examSeed);
  const share = settings.conceptualShare ?? 0.25;
  const count = Math.max(1, Math.floor(settings.count));
  let pool: QuestionTemplate[];
  if (settings.exam === "mixed") {
    const e2 = templatesForExam("exam2");
    const e1 = templatesForExam("exam1");
    pool = e1.length === 0 ? e2 : [...e2, ...e1];
  } else {
    pool = templatesForExam(settings.exam);
    if (pool.length === 0) pool = templatesForExam("exam2");
  }
  const conceptual = pool.filter((t) => t.kind === "conceptual");
  const numeric = pool.filter((t) => t.kind === "numeric");
  const wantConceptual = Math.min(conceptual.length, Math.round(count * share));
  const wantNumeric = count - wantConceptual;

  const drawFrom = (list: QuestionTemplate[], n: number, weight: (t: QuestionTemplate) => number): QuestionTemplate[] => {
    const out: QuestionTemplate[] = [];
    let remaining = [...list];
    for (let i = 0; i < n; i++) {
      if (remaining.length === 0) remaining = [...list]; // allow repeats only when exhausted
      const w = remaining.map(weight);
      const total = w.reduce((a, b) => a + b, 0);
      let r = rng.next() * total;
      let idx = remaining.length - 1;
      for (let j = 0; j < remaining.length; j++) {
        r -= w[j]!;
        if (r <= 0) {
          idx = j;
          break;
        }
      }
      out.push(remaining[idx]!);
      remaining.splice(idx, 1);
    }
    return out;
  };
  const isExam2 = (t: QuestionTemplate) => CHAPTERS.find((c) => c.topics.some((x) => x.id === t.topicId))?.exam === "exam2";
  const weight = settings.exam === "mixed" ? (t: QuestionTemplate) => (isExam2(t) ? 2.3 : 1) : () => 1;

  const picked = rng.shuffle([...drawFrom(conceptual, wantConceptual, weight), ...drawFrom(numeric.length ? numeric : pool, wantNumeric, weight)]);
  return picked.map((t) => ({ templateId: t.id, seed: rng.int(1, 2147483646) }));
}
