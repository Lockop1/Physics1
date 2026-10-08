import type { Rng } from "./rng";
import type { Choice, ErrorId } from "./types";
import { within } from "./check";
import { toSigFigs } from "./params";

export interface DistractorCandidate {
  errorId: ErrorId;
  value: number;
}

/** Minimum relative separation between any two MCQ choices. */
export const MIN_SEPARATION = 0.03;

export interface BuildChoicesOptions {
  /** Number of choices to produce (4 or 5). Default 4. */
  count?: number;
  /** Sig figs to round displayed values to. Default 3. */
  sigFigs?: number;
}

/**
 * Build a shuffled MCQ choice list from the correct value plus named-error
 * candidates. Candidates within 3% of the answer or of an already-accepted
 * choice are dropped. If there aren't enough distinct candidates, the list is
 * filled with ×2 / ÷2 / ×10 / ÷10 slips labelled `arithmetic-slip`.
 */
export function buildNumericChoices(
  rng: Rng,
  correct: number,
  candidates: DistractorCandidate[],
  opts: BuildChoicesOptions = {},
): Choice[] {
  const count = opts.count ?? 4;
  const sf = opts.sigFigs ?? 3;
  const accepted: Choice[] = [{ value: toSigFigs(correct, sf), correct: true }];

  const tooClose = (v: number): boolean =>
    accepted.some((c) => within(c.value as number, v, MIN_SEPARATION));

  for (const cand of candidates) {
    if (accepted.length >= count) break;
    if (!Number.isFinite(cand.value)) continue;
    const v = toSigFigs(cand.value, sf);
    if (tooClose(v)) continue;
    accepted.push({ value: v, correct: false, errorId: cand.errorId });
  }

  // Fallback fillers: simple slips that are always far enough away.
  const fillers = [2, 0.5, 10, 0.1, 4, 0.25, 3, 1 / 3];
  for (const f of fillers) {
    if (accepted.length >= count) break;
    const v = toSigFigs(correct * f, sf);
    if (tooClose(v)) continue;
    accepted.push({ value: v, correct: false, errorId: "arithmetic-slip" });
  }

  return rng.shuffle(accepted);
}

/**
 * Build a shuffled list of string (conceptual) choices. `correct` must be in
 * `options`. Each wrong option may carry an errorId.
 */
export function buildStringChoices(
  rng: Rng,
  correct: string,
  wrong: { value: string; errorId?: ErrorId }[],
): Choice[] {
  const seen = new Set<string>([correct]);
  const choices: Choice[] = [{ value: correct, correct: true }];
  for (const w of wrong) {
    if (seen.has(w.value)) continue;
    seen.add(w.value);
    const c: Choice = { value: w.value, correct: false };
    if (w.errorId) c.errorId = w.errorId;
    choices.push(c);
  }
  return rng.shuffle(choices);
}
