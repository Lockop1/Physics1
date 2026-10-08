import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { q, fx, sinD, cosD, withParts } from "../helpers";

/** Straight flight at an angle for a distance and time → displacement components and average velocity. Lecture #20: bird 95.0 km at 45° above east for 3.0 h → 67.2i + 67.2j km; 8.80 m/s. */
export function solve(p: { d: number; deg: number; hours: number }): { x: number; y: number; vavg: number } {
  return { x: p.d * cosD(p.deg) * 1000, y: p.d * sinD(p.deg) * 1000, vavg: (p.d * 1000) / (p.hours * 3600) };
}

export const template: QuestionTemplate = {
  id: "e1.kin2d.displacement-vector",
  topicId: "e1.kin2d",
  title: "Straight-line trip at an angle: displacement in unit-vector form and average velocity (multi-part)",
  source: "Ch 4 lecture — Problem #20 bird (95.0 km at 45° above east for 3.0 h)",
  kind: "numeric",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(["A bird", "A plane", "A ship", "A migrating whale"]);
    const p = { d: nice(rng, 20, 300, 5), deg: rng.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]), hours: nice(rng, 0.5, 6, 0.5) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the x (east) component of the displacement, in meters?",
        target: { symbol: "\\Delta x", unit: "m", label: "east component" },
        answer: toSigFigs(s.x, 4),
        choices: buildNumericChoices(rng, s.x, [
          { errorId: "sin-cos-swap", value: s.y === s.x ? s.x * 1.5 : s.y },
          { errorId: "km-not-converted", value: s.x / 1000 },
          { errorId: "used-full-speed-as-component", value: p.d * 1000 },
          { errorId: "arithmetic-slip", value: s.x / 2 },
        ]),
        solution: [{ text: "Component along east (cos of the angle from east), converted to meters.", latex: `\\Delta x = d\\cos\\theta = (${p.d}\\ \\text{km})\\cos${p.deg}^\\circ = ${fx(s.x / 1000)}\\ \\text{km} = ${fx(s.x)}\\ \\text{m}`, equationId: "vec-components", value: toSigFigs(s.x, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is the y (north) component of the displacement, in meters?",
        target: { symbol: "\\Delta y", unit: "m", label: "north component" },
        answer: toSigFigs(s.y, 4),
        choices: buildNumericChoices(rng, s.y, [
          { errorId: "sin-cos-swap", value: s.y === s.x ? s.y * 0.6 : s.x },
          { errorId: "km-not-converted", value: s.y / 1000 },
          { errorId: "used-full-speed-as-component", value: p.d * 1000 === s.y ? s.y * 1.3 : p.d * 1000 },
          { errorId: "arithmetic-slip", value: s.y * 2 },
        ]),
        solution: [{ text: "Component along north.", latex: `\\Delta y = d\\sin\\theta = (${p.d}\\ \\text{km})\\sin${p.deg}^\\circ = ${fx(s.y)}\\ \\text{m}`, equationId: "vec-components", value: toSigFigs(s.y, 4) }],
      },
      {
        label: "(c)",
        prompt: "What is the magnitude of the average velocity for the trip?",
        target: { symbol: "|\\bar{\\vec v}|", unit: "m/s", label: "average velocity" },
        answer: toSigFigs(s.vavg, 4),
        choices: buildNumericChoices(rng, s.vavg, [
          { errorId: "km-not-converted", value: s.vavg / 1000 },
          { errorId: "minutes-not-converted", value: (p.d * 1000) / (p.hours * 60) },
          { errorId: "arithmetic-slip", value: (p.d * 1000) / p.hours },
          { errorId: "arithmetic-slip", value: s.vavg / 2 },
        ]),
        solution: [{ text: "Straight path: displacement magnitude is the distance; divide by the time in seconds.", latex: `|\\bar{\\vec v}| = \\frac{${p.d}\\times10^{3}\\ \\text{m}}{${p.hours}\\times3600\\ \\text{s}} = ${fx(s.vavg)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(s.vavg, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `${skin} flies in a straight line at $${p.deg}^\\circ$ north of east for a distance of ${q(p.d, "km")}, taking ${q(p.hours, "h")}. Take +x east and +y north.`,
        diagram: { kind: "vectors", vectors: [{ label: "Δr", magnitude: p.d, angleDeg: p.deg, angleLabel: `${p.deg}°` }] },
        givens: [
          { symbol: "d", value: p.d, unit: "km" },
          { symbol: "\\theta", value: p.deg, unit: "°", note: "north of east" },
          { symbol: "t", value: p.hours, unit: "h" },
        ],
        equations: ["vec-components", "avg-velocity", "unit-conversion"],
        recipe: ["Δx = d cos θ, Δy = d sin θ (θ from east = +x)", "Convert km → m, h → s", "|v̄| = |Δr|/Δt"],
        hints: ["'North of east' is measured from the +x (east) axis.", "Components: cos for east, sin for north.", `Δt = ${p.hours * 3600} s.`],
      },
      parts,
    );
  },
};
