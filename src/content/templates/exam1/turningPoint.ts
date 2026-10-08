import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, withParts } from "../helpers";

/** x(t) = c₀ + c₁t − c₂t²: when is v = 0, what is x there, when does it cross the origin. Lecture: 3.0t − 3t² → v = 0 at 0.50 s, x = 0.75 m; x = 4 − 2t crosses at t = 2. */
export interface TPParams {
  c0: number;
  c1: number;
  c2: number; // x = c0 + c1 t − c2 t², c2 > 0
}
export function solve(p: TPParams): { tStop: number; xMax: number; tCross: number } {
  const tStop = p.c1 / (2 * p.c2);
  const xMax = p.c0 + p.c1 * tStop - p.c2 * tStop * tStop;
  // crossing: −c2 t² + c1 t + c0 = 0 → positive root
  const disc = p.c1 * p.c1 + 4 * p.c2 * p.c0;
  const tCross = (p.c1 + Math.sqrt(disc)) / (2 * p.c2);
  return { tStop, xMax, tCross };
}

export const template: QuestionTemplate = {
  id: "e1.calculus.turning-point",
  topicId: "e1.calculus",
  title: "From x(t): when is the particle momentarily at rest, where is it, when does it pass the origin (multi-part)",
  source: "Ch 3 lecture — Example 3.4 (x = 3.0t − 3t²: v = 0 at 0.50 s); Problem #27 (crosses origin)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ c0: nice(rng, 0, 6, 1), c1: nice(rng, 2, 12, 1), c2: nice(rng, 0.5, 4, 0.5) }),
      (c) => {
        const s = solve(c);
        return s.tStop > 0.4 && s.tStop < 8 && s.tCross > s.tStop + 0.3 && s.xMax > 0.5;
      },
    );
    const s = solve(p);
    const xText = `${p.c0 !== 0 ? `${p.c0} + ` : ""}${p.c1}t - ${p.c2}t^{2}`;
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "At what time is the particle momentarily at rest?",
        target: { symbol: "t", unit: "s", label: "time when v = 0" },
        answer: toSigFigs(s.tStop, 4),
        choices: buildNumericChoices(rng, s.tStop, [
          { errorId: "derivative-not-taken", value: s.tCross },
          { errorId: "arithmetic-slip", value: p.c1 / p.c2 },
          { errorId: "arithmetic-slip", value: s.tStop / 2 },
          { errorId: "forgot-sqrt", value: Math.sqrt(p.c1 / p.c2) },
        ]),
        solution: [{ text: "At rest means v = dx/dt = 0 (not x = 0).", latex: `v(t) = ${p.c1} - ${2 * p.c2}t = 0 \;\\Rightarrow\; t = \\frac{${p.c1}}{${2 * p.c2}} = ${fx(s.tStop)}\\ \\text{s}`, equationId: "velocity-derivative", value: toSigFigs(s.tStop, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is its position at that instant (its maximum position)?",
        target: { symbol: "x_{\\max}", unit: "m", label: "position when v = 0" },
        answer: toSigFigs(s.xMax, 4),
        choices: buildNumericChoices(rng, s.xMax, [
          { errorId: "derivative-not-taken", value: p.c1 * s.tStop },
          { errorId: "arithmetic-slip", value: s.xMax * 2 },
          { errorId: "arithmetic-slip", value: p.c0 + p.c1 * s.tStop },
          { errorId: "arithmetic-slip", value: s.xMax / 2 },
        ]),
        solution: [{ text: "Plug the turning-point time into x(t).", latex: `x(${fx(s.tStop)}) = ${xText.replace(/t/g, `(${fx(s.tStop)})`)} = ${fx(s.xMax)}\\ \\text{m}`, equationId: "velocity-derivative", value: toSigFigs(s.xMax, 4) }],
      },
      {
        label: "(c)",
        prompt: "At what time (after t = 0) does the particle pass through the origin?",
        target: { symbol: "t", unit: "s", label: "time when x = 0" },
        answer: toSigFigs(s.tCross, 4),
        choices: buildNumericChoices(rng, s.tCross, [
          { errorId: "derivative-not-taken", value: s.tStop },
          { errorId: "quadratic-wrong-root", value: Math.abs((p.c1 - Math.sqrt(p.c1 * p.c1 + 4 * p.c2 * p.c0)) / (2 * p.c2)) || s.tCross / 3 },
          { errorId: "arithmetic-slip", value: 2 * s.tStop === s.tCross ? s.tCross * 1.5 : 2 * s.tStop },
          { errorId: "arithmetic-slip", value: p.c1 / p.c2 === s.tCross ? s.tCross / 2 : p.c1 / p.c2 },
        ]),
        solution: [{ text: "Set x(t) = 0 and take the positive root.", latex: `${xText} = 0 \;\\Rightarrow\; t = ${fx(s.tCross)}\\ \\text{s}`, equationId: "velocity-derivative", value: toSigFigs(s.tCross, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A particle moves along the $x$-axis with $x(t) = ${xText}$ (meters, $t$ in seconds), for $t \\ge 0$.`,
        givens: [],
        equations: ["velocity-derivative"],
        recipe: ["v(t) = dx/dt; 'at rest' ⇔ v = 0", "Plug that t back into x(t)", "'Passes the origin' ⇔ x = 0: solve the quadratic"],
        hints: ["'Momentarily at rest' is about VELOCITY, not position.", "Differentiate, set to zero, solve for t.", `v(t) = ${p.c1} − ${2 * p.c2}t.`],
      },
      parts,
    );
  },
};
