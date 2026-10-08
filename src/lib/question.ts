import { createRng, randomSeed } from "../engine/rng";
import type { GeneratedQuestion, QuestionTemplate } from "../engine/types";
import { templateById, templatesForTopic } from "../content/templates";
import { pickTemplate } from "../engine/selection";
import { getTemplateStats } from "./storage";

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
