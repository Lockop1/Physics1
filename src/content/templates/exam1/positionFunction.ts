import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, withParts } from "../helpers";

/** x(t) = c₀ + c₁t + c₂t² (+ c₃t³). Lecture #35: x = 10t − 2t²: v(2) = 2, v(4) = −6, speeds 2 and 6, v̄(2→4) = −2. */
export interface PolyParams {
  c: number[]; // c[0] + c[1] t + c[2] t² + c[3] t³
  t1: number;
  t2: number;
}
export function x(c: number[], t: number): number {
  return c.reduce((a, ci, i) => a + ci * Math.pow(t, i), 0);
}
export function v(c: number[], t: number): number {
  return c.reduce((a, ci, i) => (i === 0 ? a : a + i * ci * Math.pow(t, i - 1)), 0);
}
export function accel(c: number[], t: number): number {
  return c.reduce((a, ci, i) => (i < 2 ? a : a + i * (i - 1) * ci * Math.pow(t, i - 2)), 0);
}
export function solve(p: PolyParams) {
  return { x1: x(p.c, p.t1), x2: x(p.c, p.t2), v1: v(p.c, p.t1), v2: v(p.c, p.t2), a1: accel(p.c, p.t1), vAvg: (x(p.c, p.t2) - x(p.c, p.t1)) / (p.t2 - p.t1) };
}
function polyText(c: number[]): string {
  const terms: string[] = [];
  c.forEach((ci, i) => {
    if (ci === 0) return;
    const mag = Math.abs(ci);
    const sign = ci < 0 ? "-" : "+";
    const body = i === 0 ? `${mag}` : i === 1 ? `${mag === 1 ? "" : mag}t` : `${mag === 1 ? "" : mag}t^{${i}}`;
    terms.push(`${sign} ${body}`);
  });
  return terms.join(" ").replace(/^\+ /, "");
}

export const template: QuestionTemplate = {
  id: "e1.calculus.position-polynomial",
  topicId: "e1.calculus",
  title: "x(t) polynomial → position, velocity, average velocity, acceleration (multi-part)",
  source: "Ch 3 lecture — Problem #35 (x = 10t − 2t²); Example 3.4 (x = 3.0t − 3t²); Problem #27 (x = 4.0 − 2.0t)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => {
        const cubic = rng.chance(0.3);
        const c = [nice(rng, -5, 5, 1), nice(rng, -10, 12, 1), nice(rng, -4, 4, 0.5), cubic ? nice(rng, -1, 1, 0.5) : 0];
        const t1 = nice(rng, 1, 3, 0.5);
        return { c, t1, t2: t1 + nice(rng, 1, 3, 0.5) };
      },
      (cand) => {
        const s = solve(cand);
        return (cand.c[2] !== 0 || cand.c[3] !== 0) && Math.abs(s.v1) > 0.5 && Math.abs(s.v2) > 0.5 && Math.abs(s.vAvg) > 0.3 && Math.abs(s.a1) > 0.3 && Math.abs(s.v1 - s.v2) > 0.5;
      },
    );
    const s = solve(p);
    const dText = polyText([p.c[1]!, 2 * p.c[2]!, 3 * p.c[3]!]);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `What is the instantaneous velocity at $t = ${p.t1}$ s?`,
        target: { symbol: "v", unit: "m/s", label: `velocity at t = ${p.t1} s` },
        answer: toSigFigs(s.v1, 4),
        choices: buildNumericChoices(rng, s.v1, [
          { errorId: "derivative-not-taken", value: s.x1 },
          { errorId: "avg-speed-vs-velocity", value: s.x1 / p.t1 },
          { errorId: "arithmetic-slip", value: s.a1 },
          { errorId: "arithmetic-slip", value: -s.v1 },
        ]),
        solution: [
          { text: "Differentiate the position function.", latex: `v(t) = \\frac{dx}{dt} = ${dText}`, equationId: "velocity-derivative" },
          { text: `Evaluate at t = ${p.t1} s.`, latex: `v(${p.t1}) = ${fx(s.v1)}\\ \\text{m/s}`, equationId: "velocity-derivative", value: toSigFigs(s.v1, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: `What is the displacement between $t = ${p.t1}$ s and $t = ${p.t2}$ s?`,
        target: { symbol: "\\Delta x", unit: "m", label: "displacement" },
        answer: toSigFigs(s.x2 - s.x1, 4),
        choices: buildNumericChoices(rng, s.x2 - s.x1, [
          { errorId: "displacement-vs-distance", value: Math.abs(s.x2) + Math.abs(s.x1) },
          { errorId: "arithmetic-slip", value: s.x2 },
          { errorId: "arithmetic-slip", value: s.x1 - s.x2 },
          { errorId: "derivative-not-taken", value: s.v2 - s.v1 },
        ]),
        solution: [{ text: "Displacement is final position minus initial position.", latex: `\\Delta x = x(${p.t2}) - x(${p.t1}) = ${fx(s.x2)} - (${fx(s.x1)}) = ${fx(s.x2 - s.x1)}\\ \\text{m}`, equationId: "avg-velocity", value: toSigFigs(s.x2 - s.x1, 4) }],
      },
      {
        label: "(c)",
        prompt: `What is the average velocity between $t = ${p.t1}$ s and $t = ${p.t2}$ s?`,
        target: { symbol: "\\bar v", unit: "m/s", label: "average velocity" },
        answer: toSigFigs(s.vAvg, 4),
        choices: buildNumericChoices(rng, s.vAvg, [
          { errorId: "avg-speed-vs-velocity", value: (s.v1 + s.v2) / 2 === s.vAvg ? s.vAvg * 2 : (s.v1 + s.v2) / 2 },
          { errorId: "derivative-not-taken", value: s.x2 / p.t2 },
          { errorId: "arithmetic-slip", value: s.v2 },
          { errorId: "arithmetic-slip", value: -s.vAvg },
        ]),
        solution: [{ text: "Average velocity is Δx/Δt — not the average of the two instantaneous velocities unless a is constant.", latex: `\\bar v = \\frac{\\Delta x}{\\Delta t} = \\frac{${fx(s.x2 - s.x1)}}{${p.t2} - ${p.t1}} = ${fx(s.vAvg)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(s.vAvg, 4) }],
      },
      {
        label: "(d)",
        prompt: `What is the acceleration at $t = ${p.t1}$ s?`,
        target: { symbol: "a", unit: "m/s²", label: `acceleration at t = ${p.t1} s` },
        answer: toSigFigs(s.a1, 4),
        choices: buildNumericChoices(rng, s.a1, [
          { errorId: "derivative-not-taken", value: s.v1 },
          { errorId: "arithmetic-slip", value: s.a1 / 2 },
          { errorId: "arithmetic-slip", value: -s.a1 },
          { errorId: "derivative-not-taken", value: s.v1 / p.t1 },
        ]),
        solution: [{ text: "Differentiate the velocity.", latex: `a(t) = \\frac{dv}{dt} = ${polyText([2 * p.c[2]!, 6 * p.c[3]!])} \;\\Rightarrow\; a(${p.t1}) = ${fx(s.a1)}\\ \\text{m/s}^2`, equationId: "velocity-derivative", value: toSigFigs(s.a1, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A particle moves along the $x$-axis with position $x(t) = ${polyText(p.c)}$ (meters, $t$ in seconds).`,
        givens: [
          { symbol: "t_1", value: p.t1, unit: "s" },
          { symbol: "t_2", value: p.t2, unit: "s" },
        ],
        equations: ["velocity-derivative", "avg-velocity"],
        recipe: ["v(t) = dx/dt, a(t) = dv/dt", "Instantaneous values: plug t into the derivative", "Averages over an interval: Δx/Δt (not the derivative)"],
        hints: ["Instantaneous → differentiate. Average → difference quotient.", `v(t) = ${dText}.`, `x(${p.t1}) = ${fx(s.x1)} m, x(${p.t2}) = ${fx(s.x2)} m.`],
      },
      parts,
    );
  },
};
