import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, withParts } from "../helpers";
import { angleFrom } from "./vectorAdd";

/** 2D constant acceleration. Lecture Example 1: v0 = (20, −15), a = (4, 0), t = 5 → v = (40, −15), 43 m/s, −21°; #28 boat: v0 = (2, 1), a = (2, 0), t = 10 → v = (22, 1), r = (120, 10). */
export interface P2D {
  v0x: number;
  v0y: number;
  ax: number;
  ay: number;
  t: number;
}
export function solve(p: P2D): { vx: number; vy: number; speed: number; thetaDeg: number; x: number; y: number } {
  const vx = p.v0x + p.ax * p.t;
  const vy = p.v0y + p.ay * p.t;
  return { vx, vy, speed: Math.hypot(vx, vy), thetaDeg: angleFrom(vx, vy), x: p.v0x * p.t + 0.5 * p.ax * p.t * p.t, y: p.v0y * p.t + 0.5 * p.ay * p.t * p.t };
}
const sv = (x: number, y: number) => `${x}\\hat i ${y < 0 ? "-" : "+"} ${Math.abs(y)}\\hat j`;

export const template: QuestionTemplate = {
  id: "e1.kin2d.constant-accel",
  topicId: "e1.kin2d",
  title: "2D constant acceleration: velocity, speed & angle, position at time t (multi-part)",
  source: "Ch 4 lecture — Example 1 'motion in a plane' (43 m/s at −21°); Problem #28 boat (v = 22i + 1j, r = 120i + 10j)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(["A particle", "A boat on a lake", "A hockey puck on ice", "A drone"]);
    const p = rejectUntil(
      () => ({ v0x: nice(rng, -5, 25, 1), v0y: nice(rng, -15, 15, 1), ax: nice(rng, -3, 5, 0.5), ay: rng.chance(0.5) ? 0 : nice(rng, -3, 3, 0.5), t: nice(rng, 2, 10, 1) }),
      (c) => {
        const s = solve(c);
        return (c.ax !== 0 || c.ay !== 0) && Math.abs(s.vx) > 1 && Math.abs(s.vy) > 1 && s.speed > 3;
      },
    );
    const s = solve(p);
    const rawAngle = toDeg(Math.atan(s.vy / s.vx));
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `What is the speed at $t = ${p.t}$ s?`,
        target: { symbol: "|\\vec v|", unit: "m/s", label: "speed" },
        answer: toSigFigs(s.speed, 4),
        choices: buildNumericChoices(rng, s.speed, [
          { errorId: "vector-magnitudes-added", value: Math.abs(s.vx) + Math.abs(s.vy) },
          { errorId: "arithmetic-slip", value: Math.hypot(p.v0x, p.v0y) },
          { errorId: "forgot-sqrt", value: s.vx * s.vx + s.vy * s.vy },
          { errorId: "arithmetic-slip", value: Math.abs(s.vx) },
        ]),
        solution: [
          { text: "Each component evolves independently with its own constant acceleration.", latex: `v_x = v_{0x} + a_x t = ${p.v0x} + (${p.ax})(${p.t}) = ${fx(s.vx)},\\qquad v_y = v_{0y} + a_y t = ${p.v0y} + (${p.ay})(${p.t}) = ${fx(s.vy)}`, equationId: "kin-v" },
          { text: "Speed is the magnitude.", latex: `|\\vec v| = \\sqrt{(${fx(s.vx)})^2 + (${fx(s.vy)})^2} = ${fx(s.speed)}\\ \\text{m/s}`, equationId: "vec-magnitude", value: toSigFigs(s.speed, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What angle does the velocity make with the +x axis (counter-clockwise, 0–360°)?",
        target: { symbol: "\\theta", unit: "°", label: "direction of the velocity" },
        answer: toSigFigs(s.thetaDeg, 4),
        choices: buildNumericChoices(rng, s.thetaDeg, [
          { errorId: "arctan-quadrant", value: rawAngle < 0 ? rawAngle + 360 : rawAngle },
          { errorId: "arctan-inverted", value: angleFrom(s.vy, s.vx) },
          { errorId: "arctan-quadrant", value: Math.abs(rawAngle) },
          { errorId: "arithmetic-slip", value: angleFrom(p.v0x, p.v0y) },
        ]),
        solution: [{ text: "Direction from the components, quadrant-checked.", latex: `\\theta = \\tan^{-1}\\!\\left(\\frac{${fx(s.vy)}}{${fx(s.vx)}}\\right) \;\\to\; ${fx(s.thetaDeg)}^\\circ`, equationId: "vec-direction", value: toSigFigs(s.thetaDeg, 4) }],
      },
      {
        label: "(c)",
        prompt: `What is the x-coordinate at $t = ${p.t}$ s (starting from the origin)?`,
        target: { symbol: "x", unit: "m", label: "x-position" },
        answer: toSigFigs(s.x, 4),
        choices: buildNumericChoices(rng, s.x, [
          { errorId: "kinematics-missing-half", value: p.v0x * p.t + p.ax * p.t * p.t },
          { errorId: "arithmetic-slip", value: s.vx * p.t },
          { errorId: "arithmetic-slip", value: p.v0x * p.t },
          { errorId: "arithmetic-slip", value: s.y },
          { errorId: "forgot-square", value: p.v0x * p.t + 0.5 * p.ax * p.t },
          { errorId: "arithmetic-slip", value: Math.hypot(s.x, s.y) },
        ]),
        solution: [{ text: "Position from the x-kinematics equation.", latex: `x = v_{0x}t + \\tfrac12 a_x t^2 = (${p.v0x})(${p.t}) + \\tfrac12(${p.ax})(${p.t})^2 = ${fx(s.x)}\\ \\text{m}`, equationId: "kin-x", value: toSigFigs(s.x, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `${skin} starts at the origin at $t = 0$ with velocity $\\vec v_0 = (${sv(p.v0x, p.v0y)})$ m/s and has a constant acceleration $\\vec a = (${sv(p.ax, p.ay)})$ m/s².`,
        givens: [
          { symbol: "v_{0x}", value: p.v0x, unit: "m/s" },
          { symbol: "v_{0y}", value: p.v0y, unit: "m/s" },
          { symbol: "a_x", value: p.ax, unit: "m/s²" },
          { symbol: "a_y", value: p.ay, unit: "m/s²" },
          { symbol: "t", value: p.t, unit: "s" },
        ],
        equations: ["kin-v", "kin-x", "vec-magnitude", "vec-direction"],
        recipe: ["Treat x and y separately: v_x = v₀x + a_x t, v_y = v₀y + a_y t", "Speed and angle from the components", "x = v₀x t + ½a_x t²"],
        hints: ["Perpendicular motions are independent — write the 1D kinematics equations for each axis.", "Combine components only at the end for magnitude and direction.", `v(${p.t}) = (${fx(s.vx)}, ${fx(s.vy)}).`],
      },
      parts,
    );
  },
};
