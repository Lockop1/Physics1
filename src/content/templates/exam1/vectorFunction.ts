import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, fx, withParts } from "../helpers";

/**
 * Vector functions. r(t) = (a₁t² + a₀) î + (b₁t + b₀) ĵ → v(t), speed at t, average velocity.
 * Lecture Example 4.3: r = 2t² î + (2 + 3t) ĵ + 5t k̂ → v(2) = 8î + 3ĵ + 5k̂, |v| = 9.9 m/s.
 * Example 4.4: v = 5t î + t² ĵ − 2t³ k̂ → a = 5 î + 2t ĵ − 6t² k̂; a(2) = (5, 4, −24), |a| = 24.8.
 */
export interface RParams {
  rx: [number, number, number]; // x = rx0 + rx1 t + rx2 t²
  ry: [number, number, number];
  t: number;
}
export function solveR(p: RParams): { vx: number; vy: number; speed: number; ax: number; ay: number; amag: number } {
  const vx = p.rx[1] + 2 * p.rx[2] * p.t;
  const vy = p.ry[1] + 2 * p.ry[2] * p.t;
  const ax = 2 * p.rx[2];
  const ay = 2 * p.ry[2];
  return { vx, vy, speed: Math.hypot(vx, vy), ax, ay, amag: Math.hypot(ax, ay) };
}
export interface VParams {
  vx: [number, number, number]; // vx = c0 + c1 t + c2 t²
  vy: [number, number, number];
  t: number;
}
export function solveV(p: VParams): { ax: number; ay: number; amag: number } {
  const ax = p.vx[1] + 2 * p.vx[2] * p.t;
  const ay = p.vy[1] + 2 * p.vy[2] * p.t;
  return { ax, ay, amag: Math.hypot(ax, ay) };
}
function poly(c: [number, number, number]): string {
  const terms: string[] = [];
  c.forEach((ci, i) => {
    if (ci === 0) return;
    const mag = Math.abs(ci);
    const body = i === 0 ? `${mag}` : i === 1 ? `${mag === 1 ? "" : mag}t` : `${mag === 1 ? "" : mag}t^{2}`;
    terms.push(`${ci < 0 ? "-" : "+"} ${body}`);
  });
  return (terms.join(" ").replace(/^\+ /, "") || "0").trim();
}
const wrap = (s: string) => (s.includes(" ") ? `(${s})` : s);

export const template: QuestionTemplate = {
  id: "e1.calculus.vector-function",
  topicId: "e1.calculus",
  title: "Vector r(t) → v(t) and speed; v(t) → a(t) (multi-part)",
  source: "Ch 4 lecture — Example 4.3 (r(t) → v, speed 9.9 m/s) and Example 4.4 (v(t) → a, |a| = 24.8 m/s²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["r-to-v", "v-to-a"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as "r-to-v" | "v-to-a";
    if (variant === "r-to-v") {
      const p = rejectUntil(
        () => ({ rx: [nice(rng, -3, 3, 1), nice(rng, -4, 4, 1), nice(rng, -3, 3, 0.5)] as [number, number, number], ry: [nice(rng, -3, 3, 1), nice(rng, -4, 4, 1), nice(rng, -3, 3, 0.5)] as [number, number, number], t: nice(rng, 1, 4, 0.5) }),
        (c) => {
          const s = solveR(c);
          return Math.abs(s.vx) > 0.5 && Math.abs(s.vy) > 0.5 && (c.rx[2] !== 0 || c.ry[2] !== 0) && s.amag > 0.5;
        },
      );
      const s = solveR(p);
      const xAt = p.rx[0] + p.rx[1] * p.t + p.rx[2] * p.t * p.t;
      const yAt = p.ry[0] + p.ry[1] * p.t + p.ry[2] * p.t * p.t;
      const parts: QuestionPart[] = [
        {
          label: "(a)",
          prompt: `What is the x-component of the velocity at $t = ${p.t}$ s?`,
          target: { symbol: "v_x", unit: "m/s", label: "x-velocity" },
          answer: toSigFigs(s.vx, 4),
          choices: buildNumericChoices(rng, s.vx, [
            { errorId: "derivative-not-taken", value: xAt },
            { errorId: "avg-speed-vs-velocity", value: xAt / p.t },
            { errorId: "arithmetic-slip", value: p.rx[1] + p.rx[2] * p.t },
            { errorId: "arithmetic-slip", value: s.vy },
          ]),
          solution: [{ text: "Differentiate each component.", latex: `\\vec v(t) = \\frac{d\\vec r}{dt} = ${wrap(poly([p.rx[1], 2 * p.rx[2], 0]))}\\hat i + ${wrap(poly([p.ry[1], 2 * p.ry[2], 0]))}\\hat j \;\\Rightarrow\; v_x(${p.t}) = ${fx(s.vx)}\\ \\text{m/s}`, equationId: "velocity-derivative", value: toSigFigs(s.vx, 4) }],
        },
        {
          label: "(b)",
          prompt: `What is the speed at $t = ${p.t}$ s?`,
          target: { symbol: "|\\vec v|", unit: "m/s", label: "speed" },
          answer: toSigFigs(s.speed, 4),
          choices: buildNumericChoices(rng, s.speed, [
            { errorId: "vector-magnitudes-added", value: Math.abs(s.vx) + Math.abs(s.vy) },
            { errorId: "derivative-not-taken", value: Math.hypot(xAt, yAt) },
            { errorId: "forgot-sqrt", value: s.vx * s.vx + s.vy * s.vy },
            { errorId: "arithmetic-slip", value: Math.abs(s.vx) },
          ]),
          solution: [{ text: "Speed is the magnitude of the velocity vector.", latex: `|\\vec v| = \\sqrt{v_x^2 + v_y^2} = \\sqrt{(${fx(s.vx)})^2 + (${fx(s.vy)})^2} = ${fx(s.speed)}\\ \\text{m/s}`, equationId: "vec-magnitude", value: toSigFigs(s.speed, 4) }],
        },
        {
          label: "(c)",
          prompt: "What is the magnitude of the acceleration?",
          target: { symbol: "|\\vec a|", unit: "m/s²", label: "acceleration magnitude" },
          answer: toSigFigs(s.amag, 4),
          choices: buildNumericChoices(rng, s.amag, [
            { errorId: "derivative-not-taken", value: s.speed },
            { errorId: "arithmetic-slip", value: Math.hypot(p.rx[2], p.ry[2]) },
            { errorId: "vector-magnitudes-added", value: Math.abs(s.ax) + Math.abs(s.ay) },
            { errorId: "arithmetic-slip", value: s.amag * 2 },
          ]),
          solution: [{ text: "Differentiate again; for a quadratic r(t) the acceleration is constant.", latex: `\\vec a = \\frac{d\\vec v}{dt} = ${fx(s.ax)}\\hat i + ${fx(s.ay)}\\hat j \;\\Rightarrow\; |\\vec a| = ${fx(s.amag)}\\ \\text{m/s}^2`, equationId: "velocity-derivative", value: toSigFigs(s.amag, 4) }],
        },
      ];
      return withParts(
        {
          templateId: this.id,
          seed: rng.seed,
          variant,
          prompt: `The position of a particle is $\\vec r(t) = ${wrap(poly(p.rx))}\\,\\hat i + ${wrap(poly(p.ry))}\\,\\hat j$ (meters, $t$ in seconds).`,
          givens: [{ symbol: "t", value: p.t, unit: "s" }],
          equations: ["velocity-derivative", "vec-magnitude"],
          recipe: ["Differentiate each component for v(t)", "Speed = √(v_x² + v_y²)", "Differentiate again for a"],
          hints: ["Vectors differentiate component by component.", "Speed is the magnitude of v, not v_x + v_y.", `v(${p.t}) = (${fx(s.vx)}, ${fx(s.vy)}).`],
        },
        parts,
      );
    }
    const p = rejectUntil(
      () => ({ vx: [nice(rng, -4, 4, 1), nice(rng, -5, 5, 1), nice(rng, -2, 2, 0.5)] as [number, number, number], vy: [nice(rng, -4, 4, 1), nice(rng, -5, 5, 1), nice(rng, -2, 2, 0.5)] as [number, number, number], t: nice(rng, 1, 4, 0.5) }),
      (c) => {
        const s = solveV(c);
        return Math.abs(s.ax) > 0.5 && Math.abs(s.ay) > 0.5 && (c.vx[1] !== 0 || c.vx[2] !== 0) && (c.vy[1] !== 0 || c.vy[2] !== 0);
      },
    );
    const s = solveV(p);
    const vxAt = p.vx[0] + p.vx[1] * p.t + p.vx[2] * p.t * p.t;
    const vyAt = p.vy[0] + p.vy[1] * p.t + p.vy[2] * p.t * p.t;
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `What is the x-component of the acceleration at $t = ${p.t}$ s?`,
        target: { symbol: "a_x", unit: "m/s²", label: "x-acceleration" },
        answer: toSigFigs(s.ax, 4),
        choices: buildNumericChoices(rng, s.ax, [
          { errorId: "derivative-not-taken", value: vxAt },
          { errorId: "avg-speed-vs-velocity", value: vxAt / p.t },
          { errorId: "arithmetic-slip", value: p.vx[1] + p.vx[2] * p.t },
          { errorId: "arithmetic-slip", value: s.ay },
        ]),
        solution: [{ text: "Differentiate each velocity component.", latex: `\\vec a(t) = ${wrap(poly([p.vx[1], 2 * p.vx[2], 0]))}\\hat i + ${wrap(poly([p.vy[1], 2 * p.vy[2], 0]))}\\hat j \;\\Rightarrow\; a_x(${p.t}) = ${fx(s.ax)}\\ \\text{m/s}^2`, equationId: "velocity-derivative", value: toSigFigs(s.ax, 4) }],
      },
      {
        label: "(b)",
        prompt: `What is the magnitude of the acceleration at $t = ${p.t}$ s?`,
        target: { symbol: "|\\vec a|", unit: "m/s²", label: "acceleration magnitude" },
        answer: toSigFigs(s.amag, 4),
        choices: buildNumericChoices(rng, s.amag, [
          { errorId: "derivative-not-taken", value: Math.hypot(vxAt, vyAt) },
          { errorId: "vector-magnitudes-added", value: Math.abs(s.ax) + Math.abs(s.ay) },
          { errorId: "forgot-sqrt", value: s.ax * s.ax + s.ay * s.ay },
          { errorId: "arithmetic-slip", value: Math.abs(s.ax) },
        ]),
        solution: [{ text: "Magnitude of the acceleration vector.", latex: `|\\vec a| = \\sqrt{(${fx(s.ax)})^2 + (${fx(s.ay)})^2} = ${fx(s.amag)}\\ \\text{m/s}^2`, equationId: "vec-magnitude", value: toSigFigs(s.amag, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A particle's velocity is $\\vec v(t) = ${wrap(poly(p.vx))}\\,\\hat i + ${wrap(poly(p.vy))}\\,\\hat j$ (m/s, $t$ in seconds).`,
        givens: [{ symbol: "t", value: p.t, unit: "s" }],
        equations: ["velocity-derivative", "vec-magnitude"],
        recipe: ["a(t) = dv/dt component by component", "Evaluate at t", "Magnitude by Pythagoras"],
        hints: ["Acceleration is the time derivative of velocity.", "Differentiate each component separately.", `a(${p.t}) = (${fx(s.ax)}, ${fx(s.ay)}).`],
      },
      parts,
    );
  },
};
