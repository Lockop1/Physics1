import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Dropped from rest from height h → time and impact velocity. Lecture Example 5: 13.5 m → 1.66 s, −16.3 m/s. */
export function solve(p: { h: number; gLocal: number }): { t: number; v: number } {
  return { t: Math.sqrt((2 * p.h) / p.gLocal), v: -Math.sqrt(2 * p.gLocal * p.h) };
}

const PLANETS = [
  { name: "Earth", g },
  { name: "the Moon", g: 1.62 },
  { name: "Mars", g: 3.71 },
];

export const template: QuestionTemplate = {
  id: "e1.freefall.drop",
  topicId: "e1.freefall",
  title: "Dropped from rest: fall time and impact velocity (multi-part)",
  source: "Ch 3 lecture — Example 5 (13.5 m → 1.66 s; −16.3 m/s)",
  kind: "numeric",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const planet = rng.chance(0.25) ? rng.pick(PLANETS.slice(1)) : PLANETS[0]!;
    const h = nice(rng, 2, 80, 0.5);
    const s = solve({ h, gLocal: planet.g });
    const obj = rng.pick(["a ball", "a brick", "a wrench", "a phone"]);
    const gText = planet.name === "Earth" ? "" : ` on ${planet.name}, where $g = ${planet.g}$ m/s²`;
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "How long does it take to reach the ground?",
        target: { symbol: "t", unit: "s", label: "fall time" },
        answer: toSigFigs(s.t, 4),
        choices: buildNumericChoices(rng, s.t, [
          { errorId: "kinematics-missing-half", value: Math.sqrt(h / planet.g) },
          { errorId: "forgot-sqrt", value: (2 * h) / planet.g },
          ...(planet.name !== "Earth" ? [{ errorId: "wrong-g", value: Math.sqrt((2 * h) / g) }] : [{ errorId: "arithmetic-slip", value: h / planet.g }]),
          { errorId: "arithmetic-slip", value: s.t * 2 },
        ]),
        solution: [{ text: "Up positive: y = y₀ + v₀t − ½gt² with v₀ = 0 and Δy = −h.", latex: `-h = -\\tfrac12 g t^2 \;\\Rightarrow\; t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${h})}{${planet.g}}} = ${fx(s.t)}\\ \\text{s}`, equationId: "kin-x", value: toSigFigs(s.t, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is its velocity just before it hits (up = positive)?",
        target: { symbol: "v_y", unit: "m/s", label: "impact velocity (up = +)" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "free-fall-sign", value: -s.v },
          { errorId: "forgot-sqrt", value: -2 * planet.g * h },
          { errorId: "kinematics-missing-half", value: -Math.sqrt(planet.g * h) },
          ...(planet.name !== "Earth" ? [{ errorId: "wrong-g", value: -Math.sqrt(2 * g * h) }] : [{ errorId: "arithmetic-slip", value: s.v / 2 }]),
        ]),
        solution: [{ text: "Time-free equation (or v = −gt). Downward, so negative with up positive.", latex: `v_y^2 = 0 + 2(-g)(-h) \;\\Rightarrow\; v_y = -\\sqrt{2gh} = -\\sqrt{2(${planet.g})(${h})} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "kin-v2", value: toSigFigs(s.v, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A student drops ${obj} from rest from a height of ${q(h, "m")}${gText}. Neglect air resistance.`,
        diagram: { kind: "vertical-box", mode: "pushed-up", massLabel: "", forceLabel: "", caption: `dropped from h = ${h} m`, accel: "down" },
        givens: [
          { symbol: "h", value: h, unit: "m" },
          { symbol: "g", value: planet.g, unit: "m/s²" },
          { symbol: "v_0", value: 0, unit: "m/s" },
        ],
        equations: ["kin-x", "kin-v2"],
        recipe: ["Choose up = +: a_y = −g, Δy = −h, v₀ = 0", "Δy = −½gt² → t", "v² = 2gh → v (negative: downward)"],
        hints: ["Free fall is constant acceleration a = −g (up positive).", "From rest: h = ½gt² for the time, v² = 2gh for the speed.", `g = ${planet.g} m/s².`],
      },
      parts,
    );
  },
};
