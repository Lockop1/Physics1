import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx, withParts } from "../helpers";

/**
 * Two-body pursuit.
 *  "time-head-start": car at constant v passes a trooper; trooper starts after t_d with acceleration a from rest.
 *     ½a t² = v (t + t_d)  →  lecture: 45.0 m/s, 1.00 s, 3.00 m/s² → 31.0 s
 *  "distance-head-start": both at the same speed v, pursuer d behind, accelerates at a.
 *     ½a t² = d  →  lecture #96: 50 m, 0.050 m/s² → 44.7 s (≈45 s); x_J = 184 m; v_J = 5.2 m/s
 */
export interface ChaseParams {
  kind: "time-head-start" | "distance-head-start";
  v: number;
  a: number;
  headStart: number; // seconds or meters
}
export function solve(p: ChaseParams): { t: number; x: number; vf: number } {
  if (p.kind === "time-head-start") {
    // ½a t² − v t − v t_d = 0
    const A = 0.5 * p.a;
    const B = -p.v;
    const C = -p.v * p.headStart;
    const t = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    return { t, x: 0.5 * p.a * t * t, vf: p.a * t };
  }
  const t = Math.sqrt((2 * p.headStart) / p.a);
  return { t, x: p.v * t + 0.5 * p.a * t * t, vf: p.v + p.a * t };
}

export const template: QuestionTemplate = {
  id: "e1.kin1d.chase",
  topicId: "e1.kin1d",
  title: "Chase problems: head start in time or in distance (multi-part)",
  source: "Ch 3 lecture — trooper Example 3 (31.0 s); Problem #96 Pablo & Jacob (45 s, 184 m, 5.2 m/s)",
  kind: "numeric",
  difficulty: 3,
  variants: ["time-head-start", "distance-head-start"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const kind = chooseVariant(rng, this.variants!, opts?.variant) as ChaseParams["kind"];
    if (kind === "time-head-start") {
      const p = rejectUntil(
        () => ({ kind, v: nice(rng, 20, 45, 1), a: nice(rng, 2, 5, 0.1), headStart: nice(rng, 0.5, 4, 0.5) }),
        (c) => solve(c).t > 8 && solve(c).t < 60,
      );
      const s = solve(p);
      const parts: QuestionPart[] = [
        {
          label: "(a)",
          prompt: "How long after the trooper starts does it take to overtake the car?",
          target: { symbol: "t", unit: "s", label: "time to overtake" },
          answer: toSigFigs(s.t, 4),
          choices: buildNumericChoices(rng, s.t, [
            { errorId: "head-start-ignored", value: (2 * p.v) / p.a },
            { errorId: "arithmetic-slip", value: p.v / p.a },
            { errorId: "kinematics-missing-half", value: (p.v + Math.sqrt(p.v * p.v + 4 * p.a * p.v * p.headStart)) / (2 * p.a) },
            { errorId: "quadratic-wrong-root", value: Math.abs((p.v - Math.sqrt(p.v * p.v + 2 * p.a * p.v * p.headStart)) / p.a) },
          ]),
          solution: [
            { text: "Same origin (the billboard), same clock (t = 0 when the trooper starts). The car is already v·t_d ahead.", latex: `x_{\\text{car}} = v t_d + v t,\\qquad x_{\\text{trooper}} = \\tfrac12 a t^2`, equationId: "kin-x" },
            { text: "Set them equal and solve the quadratic (positive root).", latex: `\\tfrac12(${p.a})t^2 - ${p.v}t - ${fx(p.v * p.headStart)} = 0 \;\\Rightarrow\; t = ${fx(s.t)}\\ \\text{s}`, equationId: "kin-x", value: toSigFigs(s.t, 4) },
          ],
        },
        {
          label: "(b)",
          prompt: "How fast is the trooper going at that moment?",
          target: { symbol: "v_{\\text{trooper}}", unit: "m/s", label: "trooper's speed" },
          answer: toSigFigs(s.vf, 4),
          choices: buildNumericChoices(rng, s.vf, [
            { errorId: "arithmetic-slip", value: p.v },
            { errorId: "arithmetic-slip", value: s.vf / 2 },
            { errorId: "forgot-sqrt", value: 2 * p.a * s.x },
          ]),
          solution: [{ text: "Constant acceleration from rest.", latex: `v = at = (${p.a})(${fx(s.t)}) = ${fx(s.vf)}\\ \\text{m/s}`, equationId: "kin-v", value: toSigFigs(s.vf, 4) }],
        },
      ];
      return withParts(
        {
          templateId: this.id,
          seed: rng.seed,
          variant: kind,
          prompt: `You drive at a constant ${q(p.v, "m/s")} past a trooper hidden behind a billboard. ${q(p.headStart, "s")} after you pass, the trooper sets out from rest, accelerating at a constant ${q(p.a, "m/s²")}.`,
          givens: [
            { symbol: "v_{\\text{car}}", value: p.v, unit: "m/s" },
            { symbol: "t_d", value: p.headStart, unit: "s", note: "head start" },
            { symbol: "a", value: p.a, unit: "m/s²" },
          ],
          equations: ["kin-x", "kin-v"],
          recipe: ["Write x(t) for both from the same origin and clock", "Car: x = v(t + t_d); trooper: x = ½at²", "Set equal → quadratic → positive root"],
          hints: ["Two position functions, one unknown time. Overtaking means equal positions.", "Don't forget the car's head start: when the trooper's clock starts, the car is already v·t_d down the road.", `Quadratic: ½(${p.a})t² − ${p.v}t − ${fx(p.v * p.headStart)} = 0.`],
        },
        parts,
      );
    }
    const p = rejectUntil(
      () => ({ kind, v: nice(rng, 2, 6, 0.5), a: nice(rng, 0.03, 0.3, 0.01), headStart: nice(rng, 20, 100, 5) }),
      (c) => solve(c).t > 10 && solve(c).t < 90,
    );
    const s = solve(p);
    const names = rng.pick([["Pablo", "Jacob"], ["Maria", "Chen"], ["Aisha", "Tom"]]);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `How long does it take ${names[1]} to catch ${names[0]}?`,
        target: { symbol: "t", unit: "s", label: "time to catch up" },
        answer: toSigFigs(s.t, 4),
        choices: buildNumericChoices(rng, s.t, [
          { errorId: "kinematics-missing-half", value: Math.sqrt(p.headStart / p.a) },
          { errorId: "head-start-ignored", value: p.v / p.a },
          { errorId: "arithmetic-slip", value: p.headStart / p.v },
          { errorId: "forgot-sqrt", value: (2 * p.headStart) / p.a },
        ]),
        solution: [
          { text: "Both start at the same speed, so the constant-velocity parts cancel: the gap closes only because of the acceleration.", latex: `x_{${names[0]![0]}} = d + vt,\\qquad x_{${names[1]![0]}} = vt + \\tfrac12 a t^2`, equationId: "kin-x" },
          { text: "Equal positions.", latex: `\\tfrac12 a t^2 = d \;\\Rightarrow\; t = \\sqrt{\\frac{2(${p.headStart})}{${p.a}}} = ${fx(s.t)}\\ \\text{s}`, equationId: "kin-x", value: toSigFigs(s.t, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: `What distance does ${names[1]} cover in that time?`,
        target: { symbol: "x", unit: "m", label: "distance covered by the pursuer" },
        answer: toSigFigs(s.x, 4),
        choices: buildNumericChoices(rng, s.x, [
          { errorId: "head-start-ignored", value: s.x - p.headStart },
          { errorId: "kinematics-missing-half", value: p.v * s.t + p.a * s.t * s.t },
          { errorId: "arithmetic-slip", value: p.v * s.t },
        ]),
        solution: [{ text: "Pursuer's displacement.", latex: `x = vt + \\tfrac12 a t^2 = (${p.v})(${fx(s.t)}) + \\tfrac12(${p.a})(${fx(s.t)})^2 = ${fx(s.x)}\\ \\text{m}`, equationId: "kin-x", value: toSigFigs(s.x, 4) }],
      },
      {
        label: "(c)",
        prompt: `What is ${names[1]}'s velocity at that moment?`,
        target: { symbol: "v_f", unit: "m/s", label: "pursuer's final velocity" },
        answer: toSigFigs(s.vf, 4),
        choices: buildNumericChoices(rng, s.vf, [
          { errorId: "arithmetic-slip", value: p.a * s.t },
          { errorId: "arithmetic-slip", value: p.v },
          { errorId: "kinematics-missing-half", value: p.v + 0.5 * p.a * s.t },
        ]),
        solution: [{ text: "Velocity after accelerating for time t.", latex: `v_f = v + at = ${p.v} + (${p.a})(${fx(s.t)}) = ${fx(s.vf)}\\ \\text{m/s}`, equationId: "kin-v", value: toSigFigs(s.vf, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant: kind,
        prompt: `${names[0]} is running at ${q(p.v, "m/s")}. ${names[1]} is ${q(p.headStart, "m")} behind, running at the same velocity, and begins to accelerate at a constant ${q(p.a, "m/s²")}.`,
        givens: [
          { symbol: "v", value: p.v, unit: "m/s" },
          { symbol: "d", value: p.headStart, unit: "m", note: "head start" },
          { symbol: "a", value: p.a, unit: "m/s²" },
        ],
        equations: ["kin-x", "kin-v"],
        recipe: ["x for each runner from the same origin", "Set equal: the vt terms cancel, ½at² = d", "Then x and v of the pursuer at that t"],
        hints: ["Write both positions from the same starting line.", "Since they start at the same speed, only the ½at² term closes the gap.", `t = √(2 × ${p.headStart} / ${p.a}).`],
      },
      parts,
    );
  },
};
