import type { Rng } from "./rng";
import type { DiagramSpec } from "../diagrams/types";

export type TopicId = string;
export type EquationId = string;
export type ErrorId = string;

export interface Given {
  symbol: string; // LaTeX-ish, e.g. "r", "\\omega"
  value: number;
  unit: string;
  /** Optional note like "diameter" to make the trap visible in the givens list. */
  note?: string;
}

export interface Target {
  symbol: string;
  unit: string;
  label: string; // "centripetal acceleration"
}

export interface Choice {
  value: number | string;
  correct: boolean;
  /** For distractors: which named mistake produces it. */
  errorId?: ErrorId;
  /** Optional pre-rendered label (LaTeX allowed); defaults to formatted value + unit. */
  label?: string;
}

export interface SolutionStep {
  text: string; // plain-English description of the step
  latex?: string; // display-math LaTeX for the step
  equationId?: EquationId; // sheet equation used in this step
  /** Numeric value produced by this step (the last step's value must equal the answer). */
  value?: number;
}

export interface GeneratedQuestion {
  templateId: string;
  seed: number;
  /** Which unknown was chosen, if the template has variants. */
  variant?: string;
  prompt: string; // inline $...$ KaTeX allowed
  diagram?: DiagramSpec;
  givens: Given[];
  target: Target;
  answer: number | string;
  choices: Choice[];
  equations: EquationId[];
  recipe: string[];
  hints: string[];
  solution: SolutionStep[];
  /** Short note shown with the solution, e.g. "The mass was not needed." */
  note?: string;
}

export interface QuestionTemplate {
  id: string;
  topicId: TopicId;
  title: string;
  source?: string;
  kind: "numeric" | "conceptual";
  difficulty: 1 | 2 | 3;
  variants?: string[];
  generate(rng: Rng, opts?: { variant?: string }): GeneratedQuestion;
}
