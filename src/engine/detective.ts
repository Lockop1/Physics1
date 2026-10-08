/**
 * Equation Detective engine: decoy selection, set grading, number hiding,
 * givens tagging and recipe ordering. Pure functions, no UI.
 */
import type { Rng } from "./rng";
import type { GeneratedQuestion, Given } from "./types";
import { EQUATIONS, CHAPTER_ORDER, equationById, type Equation } from "../content/equations";

// ---------- Mode A: pick the equations ----------

/**
 * Pick decoy equations for a question: never one of the correct ids, preferring
 * the same chapter(s), then neighbouring chapters. Returns `count` decoys.
 */
export function selectDecoys(rng: Rng, correctIds: readonly string[], count: number): Equation[] {
  const correct = new Set(correctIds);
  const chapters = new Set(correctIds.map((id) => equationById(id)?.chapter).filter(Boolean) as string[]);
  const chapterIdx = (c: string) => CHAPTER_ORDER.indexOf(c);
  const distance = (eq: Equation): number => {
    let best = 99;
    for (const c of chapters) best = Math.min(best, Math.abs(chapterIdx(eq.chapter) - chapterIdx(c)));
    return best;
  };
  const pool = EQUATIONS.filter((e) => !correct.has(e.id));
  // bucket by distance; shuffle within buckets; take in order
  const buckets = new Map<number, Equation[]>();
  for (const e of pool) {
    const d = distance(e);
    if (!buckets.has(d)) buckets.set(d, []);
    buckets.get(d)!.push(e);
  }
  const out: Equation[] = [];
  for (const d of Array.from(buckets.keys()).sort((a, b) => a - b)) {
    for (const e of rng.shuffle(buckets.get(d)!)) {
      if (out.length >= count) return out;
      out.push(e);
    }
  }
  return out;
}

export interface EquationOptions {
  options: Equation[]; // shuffled, 6–8
  correct: Set<string>;
}

/** Build the option list for mode A: the question's equations + decoys, shuffled. */
export function buildEquationOptions(rng: Rng, q: GeneratedQuestion, total?: number): EquationOptions {
  const correctIds = Array.from(new Set(q.equations)).filter((id) => equationById(id));
  const n = total ?? Math.min(8, Math.max(6, correctIds.length + 4));
  const decoys = selectDecoys(rng, correctIds, Math.max(0, n - correctIds.length));
  const options = rng.shuffle([...correctIds.map((id) => equationById(id)!), ...decoys]);
  return { options, correct: new Set(correctIds) };
}

export interface SetGrade {
  correct: boolean;
  missing: string[]; // correct ids not selected
  extra: string[]; // selected decoys
}

export function gradeEquationPick(selected: Iterable<string>, correct: Set<string>): SetGrade {
  const sel = new Set(selected);
  const missing = Array.from(correct).filter((id) => !sel.has(id));
  const extra = Array.from(sel).filter((id) => !correct.has(id));
  return { correct: missing.length === 0 && extra.length === 0, missing, extra };
}

// ---------- Hide numbers ----------

const NUM_IN_MATH = /(-?\d+(?:\.\d+)?)(\s*\\times\s*10\^\{[-\d]+\})?/g;
const NUM_IN_TEXT = /-?\d+(?:\.\d+)?(?:e-?\d+)?/g;

/** Replace every number in a prompt (inside and outside $…$) with a blank box. */
export function hideNumbers(prompt: string): string {
  let out = "";
  let i = 0;
  while (i < prompt.length) {
    const start = prompt.indexOf("$", i);
    if (start === -1) {
      out += prompt.slice(i).replace(NUM_IN_TEXT, "▢");
      break;
    }
    const end = prompt.indexOf("$", start + 1);
    if (end === -1) {
      out += prompt.slice(i).replace(NUM_IN_TEXT, "▢");
      break;
    }
    out += prompt.slice(i, start).replace(NUM_IN_TEXT, "▢");
    const math = prompt.slice(start + 1, end);
    // protect subscripts / exponents like v^2, x_1, 10^{-11} inside commands: only hide standalone numbers
    const hidden = math.replace(/(^|[^\^_{\w])(-?\d+(?:\.\d+)?)(\s*\\times\s*10\^\{[-\d]+\})?/g, (_m, pre: string) => `${pre}\\square`);
    void NUM_IN_MATH;
    out += "$" + hidden + "$";
    i = end + 1;
  }
  return out;
}

// ---------- Mode B: givens & target ----------

export interface TaggingSetup {
  /** Each given with its correct tag (symbol, or "not needed"). */
  items: { given: Given; correctTag: string }[];
  /** Symbol choices offered for every item (includes "not needed"). */
  tagOptions: string[];
  /** Candidate target symbols (includes the real one). */
  targetOptions: string[];
  correctTarget: string;
}

export const NOT_NEEDED = "not needed";

export function buildTagging(rng: Rng, q: GeneratedQuestion): TaggingSetup {
  const items = q.givens.map((given) => ({ given, correctTag: /not needed/i.test(given.note ?? "") ? NOT_NEEDED : given.symbol }));
  const givenSymbols = Array.from(new Set(q.givens.map((g) => g.symbol)));
  // decoy symbols from the question's equations
  const eqSymbols = q.equations.flatMap((id) => equationById(id)?.variables.map((v) => v.symbol) ?? []);
  const decoys = rng.shuffle(Array.from(new Set(eqSymbols)).filter((s) => !givenSymbols.includes(s) && s !== q.target.symbol && s.length <= 12)).slice(0, 3);
  const tagOptions = [...rng.shuffle([...givenSymbols, ...decoys]), NOT_NEEDED];
  const targetDecoys = rng.shuffle(Array.from(new Set([...givenSymbols, ...eqSymbols])).filter((s) => s !== q.target.symbol && s.length <= 12)).slice(0, 4);
  const targetOptions = rng.shuffle([q.target.symbol, ...targetDecoys]);
  return { items, tagOptions, targetOptions, correctTarget: q.target.symbol };
}

export interface TaggingGrade {
  correctTags: number;
  total: number;
  targetCorrect: boolean;
  /** Indices of givens that were irrelevant and were correctly tagged "not needed". */
  irrelevantSpotted: number;
  irrelevantTotal: number;
  allCorrect: boolean;
}

export function gradeTagging(setup: TaggingSetup, tags: (string | null)[], target: string | null): TaggingGrade {
  let correctTags = 0;
  let irrelevantSpotted = 0;
  let irrelevantTotal = 0;
  setup.items.forEach((it, i) => {
    if (tags[i] === it.correctTag) correctTags++;
    if (it.correctTag === NOT_NEEDED) {
      irrelevantTotal++;
      if (tags[i] === NOT_NEEDED) irrelevantSpotted++;
    }
  });
  const targetCorrect = target === setup.correctTarget;
  return { correctTags, total: setup.items.length, targetCorrect, irrelevantSpotted, irrelevantTotal, allCorrect: correctTags === setup.items.length && targetCorrect };
}

// ---------- Mode C: build the recipe ----------

/** Shuffle recipe steps, guaranteeing the shuffled order differs from the original when possible. */
export function shuffleRecipe(rng: Rng, recipe: readonly string[]): { order: number[] } {
  const idx = recipe.map((_, i) => i);
  if (idx.length < 2) return { order: idx };
  for (let tries = 0; tries < 20; tries++) {
    const s = rng.shuffle(idx);
    if (s.some((v, i) => v !== i)) return { order: s };
  }
  return { order: [...idx.slice(1), idx[0]!] };
}

export function gradeRecipe(order: readonly number[]): { correct: boolean; firstWrong: number } {
  for (let i = 0; i < order.length; i++) if (order[i] !== i) return { correct: false, firstWrong: i };
  return { correct: true, firstWrong: -1 };
}
