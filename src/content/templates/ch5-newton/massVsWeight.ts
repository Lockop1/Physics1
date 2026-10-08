import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g, g_MOON } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

export interface MassWeightParams {
  m: number;
  gLocal: number;
}
export function solve(p: MassWeightParams): { W: number } {
  return { W: p.m * p.gLocal };
}

type Variant = "weight" | "mass" | "moon";
const THINGS = ["a textbook", "a bowling ball", "a backpack", "a toolbox", "a dog", "a suitcase", "a bag of cement"];

export const template: QuestionTemplate = {
  id: "ch5.concepts.mass-vs-weight",
  topicId: "ch5.concepts",
  title: "Mass (kg) vs weight (N)",
  source: "Ch 5 lecture — Fg = mg, g_Moon ≈ 1.6 m/s²",
  kind: "numeric",
  difficulty: 1,
  variants: ["weight", "mass", "moon"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const thing = rng.pick(THINGS);
    const m = nice(rng, 2, 60, 0.5);
    if (variant === "weight") {
      const { W } = solve({ m, gLocal: g });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `The mass of ${thing} is ${q(m, "kg")}. What is its weight on Earth?`,
        givens: [{ symbol: "m", value: m, unit: "kg" }],
        target: { symbol: "W", unit: "N", label: "weight" },
        answer: toSigFigs(W, 4),
        choices: buildNumericChoices(rng, W, [
          { errorId: "mass-not-weight", value: m },
          { errorId: "arithmetic-slip", value: m / g },
          { errorId: "arithmetic-slip", value: m * g * g },
        ]),
        equations: ["weight"],
        recipe: ["W = mg"],
        hints: ["Weight is a force; mass is not.", "W = mg with g = 9.80 m/s².", `${m} × 9.80.`],
        solution: [{ text: "Weight is the gravitational force, mass times g.", latex: `W = mg = (${m})(9.80) = ${fx(W)}\\ \\text{N}`, equationId: "weight", value: toSigFigs(W, 4) }],
      };
    }
    if (variant === "mass") {
      const W = toSigFigs(m * g, 3);
      const mAns = W / g;
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${cap(thing)} weighs ${q(W, "N")} on Earth. What is its mass?`,
        givens: [{ symbol: "W", value: W, unit: "N" }],
        target: { symbol: "m", unit: "kg", label: "mass" },
        answer: toSigFigs(mAns, 4),
        choices: buildNumericChoices(rng, mAns, [
          { errorId: "mass-not-weight", value: W },
          { errorId: "arithmetic-slip", value: W * g },
          { errorId: "arithmetic-slip", value: W / g / 2 },
        ]),
        equations: ["weight"],
        recipe: ["m = W / g"],
        hints: ["Newtons measure force, not mass.", "W = mg → m = W/g.", `${W} / 9.80.`],
        solution: [{ text: "Divide the weight by g.", latex: `m = \\frac{W}{g} = \\frac{${W}}{9.80} = ${fx(mAns)}\\ \\text{kg}`, equationId: "weight", value: toSigFigs(mAns, 4) }],
      };
    }
    // moon
    const { W } = solve({ m, gLocal: g_MOON });
    const WEarth = m * g;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `An astronaut carries ${thing} of mass ${q(m, "kg")} to the Moon, where $g_{\\text{Moon}} = ${g_MOON}\\ \\text{m/s}^2$. What are its mass and weight on the Moon? (Give the weight.)`,
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "g_{\\text{Moon}}", value: g_MOON, unit: "m/s²" },
      ],
      target: { symbol: "W", unit: "N", label: "weight on the Moon" },
      answer: toSigFigs(W, 4),
      choices: buildNumericChoices(rng, W, [
        { errorId: "wrong-g", value: WEarth },
        { errorId: "mass-not-weight", value: m },
        { errorId: "arithmetic-slip", value: WEarth / 2 },
      ]),
      equations: ["weight"],
      recipe: ["Mass is unchanged", "W_Moon = m g_Moon"],
      hints: ["Mass is a property of the object; weight depends on where you are.", "Use the Moon's g in W = mg.", `${m} × ${g_MOON}.`],
      solution: [
        { text: "The mass is the same everywhere. Weight uses the local g.", latex: `W_{\\text{Moon}} = m\\,g_{\\text{Moon}} = (${m})(${g_MOON}) = ${fx(W)}\\ \\text{N}`, equationId: "weight", value: toSigFigs(W, 4) },
      ],
      note: `On Earth the same object weighs ${fx(WEarth)} N — about 6 times more — but its mass is still ${m} kg.`,
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
