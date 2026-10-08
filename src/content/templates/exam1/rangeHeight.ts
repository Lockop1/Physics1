import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/** Level-ground projectile. Lecture Example 2 long jumper: 11.0 m/s at 20.0° → R = 7.94 m, h = 0.722 m. Firework 70.0 m/s at 75.0° → h = 233 m, t_top = 6.90 s. */
export function solve(p: { v0: number; theta: number; gLocal: number }): { R: number; h: number; tTop: number; tFlight: number } {
  const tTop = (p.v0 * sinD(p.theta)) / p.gLocal;
  return { R: (p.v0 * p.v0 * sinD(2 * p.theta)) / p.gLocal, h: (p.v0 * sinD(p.theta)) ** 2 / (2 * p.gLocal), tTop, tFlight: 2 * tTop };
}

type Variant = "range" | "height" | "speed-from-range" | "time";
const SKINS = [
  { who: "A long jumper", obj: "leaves the ground" },
  { who: "A soccer ball", obj: "is kicked" },
  { who: "A golf ball", obj: "is struck" },
  { who: "A firework shell", obj: "is launched" },
  { who: "A cannonball", obj: "is fired" },
];
const PLANETS = [
  { name: "Earth", g },
  { name: "the Moon", g: 1.62 },
  { name: "Mars", g: 3.71 },
];

export const template: QuestionTemplate = {
  id: "e1.projectiles.range-height",
  topicId: "e1.projectiles",
  title: "Level ground: range, max height, flight time, launch speed from range",
  source: "Ch 4 lecture — Example 2 long jumper (7.94 m, 0.722 m); Example 4.7 firework (233 m, 6.90 s)",
  kind: "numeric",
  difficulty: 2,
  variants: ["range", "height", "speed-from-range", "time"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const planet = rng.chance(0.2) ? rng.pick(PLANETS.slice(1)) : PLANETS[0]!;
    const gL = planet.g;
    const v0 = nice(rng, 8, 70, 0.5);
    const theta = rng.pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]);
    const s = solve({ v0, theta, gLocal: gL });
    const gText = planet.name === "Earth" ? "" : ` on ${planet.name} ($g = ${gL}$ m/s²)`;
    const base = {
      templateId: this.id,
      seed: rng.seed,
      variant,
      diagram: { kind: "projectile" as const, launchHeight: 0, angleDeg: theta, angleLabel: `${theta}°`, rangeLabel: "R" },
      equations: ["projectile-components", "projectile-range"],
    };
    const wrongG = planet.name !== "Earth" ? [{ errorId: "wrong-g", value: solve({ v0, theta, gLocal: g }).R }] : [];
    if (variant === "range") {
      return {
        ...base,
        prompt: `${skin.who} ${skin.obj} at ${q(v0, "m/s")} at an angle of $${theta}^\\circ$ above the horizontal${gText}. How far away does it land on level ground?`,
        givens: [{ symbol: "v_0", value: v0, unit: "m/s" }, { symbol: "\\theta_0", value: theta, unit: "°" }, { symbol: "g", value: gL, unit: "m/s²" }],
        target: { symbol: "R", unit: "m", label: "horizontal range" },
        answer: toSigFigs(s.R, 4),
        choices: buildNumericChoices(rng, s.R, [
          { errorId: "range-missing-factor-2", value: s.R / 2 },
          { errorId: "height-vs-range", value: s.h },
          { errorId: "used-full-speed-as-component", value: v0 * s.tFlight },
          ...wrongG,
          { errorId: "sin-cos-swap", value: (v0 * v0 * sinD(theta)) / gL },
        ]),
        recipe: ["v₀x = v₀ cos θ, v₀y = v₀ sin θ", "Flight time from y: t = 2v₀ sin θ / g", "R = v₀x · t = v₀² sin 2θ / g"],
        hints: ["Range = horizontal speed × total flight time.", "The flight time is TWICE the time to the top: 2v₀ sin θ/g.", `R = ${v0}² sin(${2 * theta}°) / ${gL}.`],
        solution: [
          { text: "Flight time from the vertical motion (back to y = 0).", latex: `t_{\\text{flight}} = \\frac{2 v_0\\sin\\theta_0}{g} = \\frac{2(${v0})\\sin${theta}^\\circ}{${gL}} = ${fx(s.tFlight)}\\ \\text{s}`, equationId: "projectile-components", value: s.tFlight },
          { text: "Horizontal distance at constant v₀x (equivalently R = v₀² sin 2θ / g).", latex: `R = v_0\\cos\\theta_0\\, t = (${v0})\\cos${theta}^\\circ(${fx(s.tFlight)}) = ${fx(s.R)}\\ \\text{m}`, equationId: "projectile-range", value: toSigFigs(s.R, 4) },
        ],
      };
    }
    if (variant === "height") {
      return {
        ...base,
        prompt: `${skin.who} ${skin.obj} at ${q(v0, "m/s")} at $${theta}^\\circ$ above the horizontal${gText}. What maximum height does it reach?`,
        givens: [{ symbol: "v_0", value: v0, unit: "m/s" }, { symbol: "\\theta_0", value: theta, unit: "°" }, { symbol: "g", value: gL, unit: "m/s²" }],
        target: { symbol: "h_{\\max}", unit: "m", label: "maximum height" },
        answer: toSigFigs(s.h, 4),
        choices: buildNumericChoices(rng, s.h, [
          { errorId: "height-vs-range", value: s.R },
          { errorId: "used-full-speed-as-component", value: (v0 * v0) / (2 * gL) },
          { errorId: "kinematics-missing-half", value: (v0 * sinD(theta)) ** 2 / gL },
          { errorId: "sin-cos-swap", value: (v0 * cosD(theta)) ** 2 / (2 * gL) },
          ...(planet.name !== "Earth" ? [{ errorId: "wrong-g", value: (v0 * sinD(theta)) ** 2 / (2 * g) }] : []),
        ]),
        recipe: ["v₀y = v₀ sin θ", "At the top v_y = 0: v₀y² = 2g h", "h = (v₀ sin θ)²/(2g)"],
        hints: ["Only the vertical motion matters for the height.", "v_y = 0 at the top; use the time-free equation.", `h = (${v0} sin ${theta}°)² / (2 × ${gL}).`],
        solution: [{ text: "Vertical component, then the time-free equation with v_y = 0 at the top.", latex: `h_{\\max} = \\frac{(v_0\\sin\\theta_0)^2}{2g} = \\frac{(${v0}\\sin${theta}^\\circ)^2}{2(${gL})} = ${fx(s.h)}\\ \\text{m}`, equationId: "projectile-range", value: toSigFigs(s.h, 4) }],
      };
    }
    if (variant === "time") {
      return {
        ...base,
        prompt: `${skin.who} ${skin.obj} at ${q(v0, "m/s")} at $${theta}^\\circ$ above the horizontal${gText}. How long is it in the air before returning to its launch height?`,
        givens: [{ symbol: "v_0", value: v0, unit: "m/s" }, { symbol: "\\theta_0", value: theta, unit: "°" }, { symbol: "g", value: gL, unit: "m/s²" }],
        target: { symbol: "t_{\\text{flight}}", unit: "s", label: "total flight time" },
        answer: toSigFigs(s.tFlight, 4),
        choices: buildNumericChoices(rng, s.tFlight, [
          { errorId: "range-missing-factor-2", value: s.tTop },
          { errorId: "used-full-speed-as-component", value: (2 * v0) / gL },
          { errorId: "sin-cos-swap", value: (2 * v0 * cosD(theta)) / gL },
          ...(planet.name !== "Earth" ? [{ errorId: "wrong-g", value: (2 * v0 * sinD(theta)) / g }] : [{ errorId: "arithmetic-slip", value: s.tFlight * 2 }]),
        ]),
        recipe: ["v₀y = v₀ sin θ", "Time to top: v₀y/g", "Flight time = 2 × time to top"],
        hints: ["Vertical motion only. Up and down take equal times.", "t_top = v₀ sin θ / g, and the flight is twice that.", `2 × ${v0} sin ${theta}° / ${gL}.`],
        solution: [{ text: "Twice the time to the top (symmetric flight on level ground).", latex: `t_{\\text{flight}} = \\frac{2v_0\\sin\\theta_0}{g} = \\frac{2(${v0})\\sin${theta}^\\circ}{${gL}} = ${fx(s.tFlight)}\\ \\text{s}`, equationId: "projectile-range", value: toSigFigs(s.tFlight, 4) }],
      };
    }
    const R = toSigFigs(s.R, 3);
    const vAns = Math.sqrt((R * gL) / sinD(2 * theta));
    return {
      ...base,
      prompt: `${skin.who} ${skin.obj} at $${theta}^\\circ$ above the horizontal and lands ${q(R, "m")} away on level ground${gText}. What was the launch speed?`,
      givens: [{ symbol: "R", value: R, unit: "m" }, { symbol: "\\theta_0", value: theta, unit: "°" }, { symbol: "g", value: gL, unit: "m/s²" }],
      target: { symbol: "v_0", unit: "m/s", label: "launch speed" },
      answer: toSigFigs(vAns, 4),
      choices: buildNumericChoices(rng, vAns, [
        { errorId: "forgot-sqrt", value: (R * gL) / sinD(2 * theta) },
        { errorId: "range-missing-factor-2", value: Math.sqrt((R * gL) / (sinD(theta) * cosD(theta))) },
        { errorId: "sin-cos-swap", value: Math.sqrt((R * gL) / sinD(theta)) },
        ...(planet.name !== "Earth" ? [{ errorId: "wrong-g", value: Math.sqrt((R * g) / sinD(2 * theta)) }] : [{ errorId: "arithmetic-slip", value: vAns * 2 }]),
      ]),
      recipe: ["R = v₀² sin 2θ / g", "v₀ = √(R g / sin 2θ)"],
      hints: ["Invert the range formula.", "v₀² = R g / sin 2θ.", `√(${R} × ${gL} / sin ${2 * theta}°).`],
      solution: [{ text: "Solve the range formula for v₀.", latex: `v_0 = \\sqrt{\\frac{R g}{\\sin 2\\theta_0}} = \\sqrt{\\frac{(${R})(${gL})}{\\sin${2 * theta}^\\circ}} = ${fx(vAns)}\\ \\text{m/s}`, equationId: "projectile-range", value: toSigFigs(vAns, 4) }],
    };
  },
};
