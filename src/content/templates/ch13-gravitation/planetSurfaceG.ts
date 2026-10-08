import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { sig, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { G } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** g on a planet's surface: g = GM/R²; or M from g and R. */
export function solve(p: { M: number; R: number }): { g: number } {
  return { g: (G * p.M) / (p.R * p.R) };
}

type Variant = "g" | "M";
const PLANETS = [
  { name: "Mars", M: 6.42e23, R: 3.39e6 },
  { name: "Venus", M: 4.87e24, R: 6.05e6 },
  { name: "the Moon", M: 7.35e22, R: 1.74e6 },
  { name: "Jupiter", M: 1.9e27, R: 7.15e7 },
  { name: "Mercury", M: 3.3e23, R: 2.44e6 },
  { name: "planet Zorg", M: 0, R: 0 }, // random
];

export const template: QuestionTemplate = {
  id: "ch13.g-altitude.planet-surface",
  topicId: "ch13.g-altitude",
  title: "Surface gravity of another planet (g = GM/R²)",
  source: "Ch 6b lecture — 13.2 Gravitation near the surface (g = GM_E/R_E²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["g", "M"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const pl = rng.pick(PLANETS);
    const M = pl.M || sig(rng, 1e23, 9e25, 2);
    const R = pl.R || sig(rng, 2e6, 2e7, 2);
    const { g: gp } = solve({ M, R });
    if (variant === "g") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${cap(pl.name)} has mass ${q(M, "kg")} and radius ${q(R, "m")}. What is the acceleration due to gravity at its surface?`,
        givens: [
          { symbol: "M", value: M, unit: "kg" },
          { symbol: "R", value: R, unit: "m" },
        ],
        target: { symbol: "g", unit: "m/s²", label: "surface gravity" },
        answer: toSigFigs(gp, 4),
        choices: buildNumericChoices(rng, gp, [
          { errorId: "forgot-square", value: (G * M) / R },
          { errorId: "wrong-g", value: 9.8 },
          { errorId: "arithmetic-slip", value: gp * 10 },
          { errorId: "arithmetic-slip", value: gp / 10 },
        ]),
        equations: ["g-altitude"],
        recipe: ["g = GM/R²"],
        hints: ["Same formula as Earth's g, with the planet's own M and R.", "g = GM/R².", "Square the radius."],
        solution: [{ text: "Gravitational field at the surface.", latex: `g = \\frac{GM}{R^2} = \\frac{(6.674\\times10^{-11})(${fx(M)})}{(${fx(R)})^2} = ${fx(gp)}\\ \\text{m/s}^2`, equationId: "g-altitude", value: toSigFigs(gp, 4) }],
      };
    }
    const gGiven = toSigFigs(gp, 3);
    const MAns = (gGiven * R * R) / G;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A probe landing on ${pl.name} measures a surface gravitational acceleration of ${q(gGiven, "m/s²")}. The planet's radius is ${q(R, "m")}. What is its mass?`,
      givens: [
        { symbol: "g", value: gGiven, unit: "m/s²" },
        { symbol: "R", value: R, unit: "m" },
      ],
      target: { symbol: "M", unit: "kg", label: "planet mass" },
      answer: toSigFigs(MAns, 4),
      choices: buildNumericChoices(rng, MAns, [
        { errorId: "forgot-square", value: (gGiven * R) / G },
        { errorId: "ratio-inverted", value: G / (gGiven * R * R) },
        { errorId: "arithmetic-slip", value: MAns / 10 },
        { errorId: "arithmetic-slip", value: MAns * 10 },
      ]),
      equations: ["g-altitude"],
      recipe: ["g = GM/R² → M = gR²/G"],
      hints: ["Rearrange g = GM/R².", "M = g R² / G.", "Don't forget to square R."],
      solution: [{ text: "Solve for M.", latex: `M = \\frac{g R^2}{G} = \\frac{(${gGiven})(${fx(R)})^2}{6.674\\times10^{-11}} = ${fx(MAns)}\\ \\text{kg}`, equationId: "g-altitude", value: toSigFigs(MAns, 4) }],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
