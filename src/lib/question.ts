import { createRng, randomSeed } from "../engine/rng";
import type { GeneratedQuestion, QuestionTemplate } from "../engine/types";
import { templateById, templatesForTopic } from "../content/templates";
import { pickTemplate, pickWeighted, weakSpotWeight, errorsProducedBy, templatesProducing } from "../engine/selection";
import { getTemplateStats, getErrorCounts } from "./storage";
import { TEMPLATES } from "../content/templates";

/** Build the question for (templateId, seed). Returns null if the template id is unknown. */
export function buildQuestion(templateId: string, seed: number, variant?: string): GeneratedQuestion | null {
  const t = templateById(templateId);
  if (!t) return null;
  return t.generate(createRng(seed), variant ? { variant } : undefined);
}

/** Pick a template for a topic (weighted toward weak spots) and a fresh seed. */
export function nextForTopic(topicId: string): { template: QuestionTemplate; seed: number } | null {
  const temps = templatesForTopic(topicId);
  if (temps.length === 0) return null;
  const rng = createRng(randomSeed());
  const template = pickTemplate(rng, temps, getTemplateStats);
  return { template, seed: randomSeed() };
}

/** Weak-spot drill: weighted over ALL templates by accuracy, staleness and committed errors. */
export function nextWeakSpot(): { template: QuestionTemplate; seed: number } {
  const rng = createRng(randomSeed());
  const errorCounts = getErrorCounts();
  const template = pickWeighted(rng, TEMPLATES, (t) => weakSpotWeight({ stats: getTemplateStats(t.id), errorIds: errorsProducedBy(t), errorCounts }));
  return { template, seed: randomSeed() };
}

/** Drill a specific named error: templates that can produce it, weighted by weakness. */
export function nextForError(errorId: string): { template: QuestionTemplate; seed: number } | null {
  const pool = templatesProducing(errorId, TEMPLATES);
  if (pool.length === 0) return null;
  const rng = createRng(randomSeed());
  const template = pickWeighted(rng, pool, (t) => weakSpotWeight({ stats: getTemplateStats(t.id) }));
  return { template, seed: randomSeed() };
}
