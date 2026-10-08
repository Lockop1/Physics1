import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { q, fx, withParts } from "../helpers";

/** Boat trip: d1 north then d2 east in time T → displacement, average speed, average velocity, direction. Lecture Example 2: 80 km N, 60 km E, 1 h → 1.00e5 m; 38.9 m/s; 27.8 m/s; 53.1° N of E. */
export interface TripParams {
  dNorth: number; // km
  dEast: number; // km
  hours: number;
}
export function solve(p: TripParams): { disp: number; distance: number; avgSpeed: number; avgVel: number; angleNofE: number } {
  const disp = Math.hypot(p.dNorth, p.dEast) * 1000;
  const distance = (p.dNorth + p.dEast) * 1000;
  const T = p.hours * 3600;
  return { disp, distance, avgSpeed: distance / T, avgVel: disp / T, angleNofE: toDeg(Math.atan2(p.dNorth, p.dEast)) };
}

export const template: QuestionTemplate = {
  id: "e1.kin2d.trip",
  topicId: "e1.kin2d",
  title: "Two-leg trip: displacement, average speed vs average velocity, direction (multi-part)",
  source: "Ch 3 lecture — Example 2 boat (80.0 km N then 60.0 km E in 1 h → 1.00 × 10⁵ m, 39.0 m/s, 28.0 m/s, 53.1° N of E)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(["A small boat", "A hiker", "A delivery drone", "A car"]);
    const p = { dNorth: nice(rng, 10, 120, 5), dEast: nice(rng, 10, 120, 5), hours: nice(rng, 0.5, 4, 0.25) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the magnitude of the displacement for the trip (in meters)?",
        target: { symbol: "|\\Delta\\vec r|", unit: "m", label: "displacement" },
        answer: toSigFigs(s.disp, 4),
        choices: buildNumericChoices(rng, s.disp, [
          { errorId: "displacement-vs-distance", value: s.distance },
          { errorId: "km-not-converted", value: s.disp / 1000 },
          { errorId: "forgot-sqrt", value: (p.dNorth * p.dNorth + p.dEast * p.dEast) * 1000 },
          { errorId: "arithmetic-slip", value: Math.abs(p.dNorth - p.dEast) * 1000 },
        ]),
        solution: [{ text: "The two legs are perpendicular: Pythagoras, then km → m.", latex: `|\\Delta\\vec r| = \\sqrt{(${p.dNorth})^2 + (${p.dEast})^2}\\ \\text{km} = ${fx(s.disp / 1000)}\\ \\text{km} = ${fx(s.disp)}\\ \\text{m}`, equationId: "vec-magnitude", value: toSigFigs(s.disp, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is the average speed for the trip?",
        target: { symbol: "\\text{avg speed}", unit: "m/s", label: "average speed" },
        answer: toSigFigs(s.avgSpeed, 4),
        choices: buildNumericChoices(rng, s.avgSpeed, [
          { errorId: "avg-speed-vs-velocity", value: s.avgVel },
          { errorId: "minutes-not-converted", value: s.distance / (p.hours * 60) },
          { errorId: "km-not-converted", value: s.avgSpeed / 1000 },
          { errorId: "arithmetic-slip", value: s.avgSpeed / 2 },
        ]),
        solution: [{ text: "Total DISTANCE over total time (seconds).", latex: `\\text{avg speed} = \\frac{${fx(s.distance)}\\ \\text{m}}{${p.hours}\\times3600\\ \\text{s}} = ${fx(s.avgSpeed)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(s.avgSpeed, 4) }],
      },
      {
        label: "(c)",
        prompt: "What is the magnitude of the average velocity?",
        target: { symbol: "|\\bar{\\vec v}|", unit: "m/s", label: "average velocity" },
        answer: toSigFigs(s.avgVel, 4),
        choices: buildNumericChoices(rng, s.avgVel, [
          { errorId: "avg-speed-vs-velocity", value: s.avgSpeed },
          { errorId: "minutes-not-converted", value: s.disp / (p.hours * 60) },
          { errorId: "km-not-converted", value: s.avgVel / 1000 },
          { errorId: "arithmetic-slip", value: s.avgVel * 2 },
        ]),
        solution: [{ text: "DISPLACEMENT over time.", latex: `|\\bar{\\vec v}| = \\frac{${fx(s.disp)}\\ \\text{m}}{${p.hours}\\times3600\\ \\text{s}} = ${fx(s.avgVel)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(s.avgVel, 4) }],
      },
      {
        label: "(d)",
        prompt: "What is the direction of the average velocity, as an angle north of east?",
        target: { symbol: "\\theta", unit: "°", label: "angle north of east" },
        answer: toSigFigs(s.angleNofE, 4),
        choices: buildNumericChoices(rng, s.angleNofE, [
          { errorId: "arctan-inverted", value: toDeg(Math.atan2(p.dEast, p.dNorth)) },
          { errorId: "angle-from-wrong-axis", value: 90 - s.angleNofE === s.angleNofE ? s.angleNofE / 2 : 90 - s.angleNofE },
          { errorId: "degrees-in-radian-formula", value: Math.atan2(p.dNorth, p.dEast) },
          { errorId: "arithmetic-slip", value: s.angleNofE * 2 },
        ]),
        solution: [{ text: "The average velocity points along the displacement: north component over east component.", latex: `\\theta = \\tan^{-1}\\!\\left(\\frac{${p.dNorth}}{${p.dEast}}\\right) = ${fx(s.angleNofE)}^\\circ \\text{ north of east}`, equationId: "vec-direction", value: toSigFigs(s.angleNofE, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `During a ${q(p.hours, "h")} trip, ${skin.toLowerCase()} travels ${q(p.dNorth, "km")} north and then ${q(p.dEast, "km")} east.`,
        diagram: { kind: "vectors", vectors: [{ label: "N leg", magnitude: p.dNorth, angleDeg: 90 }, { label: "E leg", magnitude: p.dEast, angleDeg: 0 }], showResultant: true, caption: "legs drawn from the origin; R = displacement" },
        givens: [
          { symbol: "d_N", value: p.dNorth, unit: "km" },
          { symbol: "d_E", value: p.dEast, unit: "km" },
          { symbol: "t", value: p.hours, unit: "h" },
        ],
        equations: ["vec-magnitude", "vec-direction", "avg-velocity", "unit-conversion"],
        recipe: ["Displacement = straight line start → end (Pythagoras)", "Distance = sum of legs", "Average speed = distance/t; average velocity = displacement/t (convert km → m, h → s)", "Direction = tan⁻¹(north/east)"],
        hints: ["Speed uses the path length; velocity uses the straight-line displacement.", "Convert km to m and hours to seconds before dividing.", `Displacement = ${fx(s.disp / 1000)} km; distance = ${fx(s.distance / 1000)} km.`],
      },
      parts,
    );
  },
};
