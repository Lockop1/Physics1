import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { G, M_E, R_E } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** F = G m1 m2 / r². */
export function solve(p: { m1: number; m2: number; r: number }): { F: number } {
  return { F: (G * p.m1 * p.m2) / (p.r * p.r) };
}

type Variant = "two-objects" | "earth-object" | "find-r";

export const template: QuestionTemplate = {
  id: "ch13.universal.force",
  topicId: "ch13.universal",
  title: "Gravitational force between two masses",
  source: "Ch 6b lecture — 13.1 Newton's law of universal gravitation",
  kind: "numeric",
  difficulty: 1,
  variants: ["two-objects", "earth-object", "find-r"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    if (variant === "two-objects") {
      const skin = rng.pick([
        { a: "two bowling balls", m1: [5, 8, 0.5], m2: [5, 8, 0.5], r: [0.3, 2, 0.1] },
        { a: "two people", m1: [50, 90, 1], m2: [50, 90, 1], r: [0.5, 3, 0.1] },
        { a: "two asteroids", m1: [1e9, 9e9, 1e8], m2: [1e9, 9e9, 1e8], r: [1000, 9000, 100] },
        { a: "a truck and a car", m1: [5000, 20000, 500], m2: [800, 2000, 50], r: [2, 10, 0.5] },
      ]);
      const m1 = nice(rng, skin.m1[0]!, skin.m1[1]!, skin.m1[2]!);
      const m2 = nice(rng, skin.m2[0]!, skin.m2[1]!, skin.m2[2]!);
      const r = nice(rng, skin.r[0]!, skin.r[1]!, skin.r[2]!);
      const { F } = solve({ m1, m2, r });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `What is the gravitational force between ${skin.a} with masses ${q(m1, "kg")} and ${q(m2, "kg")} whose centers are ${q(r, "m")} apart?`,
        givens: [
          { symbol: "m_1", value: m1, unit: "kg" },
          { symbol: "m_2", value: m2, unit: "kg" },
          { symbol: "r", value: r, unit: "m" },
        ],
        target: { symbol: "F", unit: "N", label: "gravitational force" },
        answer: toSigFigs(F, 4),
        choices: buildNumericChoices(rng, F, [
          { errorId: "forgot-square", value: (G * m1 * m2) / r },
          { errorId: "arithmetic-slip", value: F * 100 },
          { errorId: "inverse-not-inverse-square", value: (G * m1 * m2) / r / 10 },
          { errorId: "arithmetic-slip", value: (m1 * m2) / (r * r) },
        ]),
        equations: ["grav-force"],
        recipe: ["F = G m₁ m₂ / r²"],
        hints: ["Newton's law of universal gravitation.", "F = G m₁m₂/r² with G = 6.674 × 10⁻¹¹.", "Square the distance!"],
        solution: [{ text: "Direct substitution.", latex: `F = \\frac{G m_1 m_2}{r^2} = \\frac{(6.674\\times10^{-11})(${fx(m1)})(${fx(m2)})}{(${r})^2} = ${fx(F)}\\ \\text{N}`, equationId: "grav-force", value: toSigFigs(F, 4) }],
        note: "Everyday objects attract each other with absurdly small forces — gravity only matters when at least one mass is planet-sized.",
      };
    }
    if (variant === "earth-object") {
      const m = nice(rng, 10, 2000, 10);
      const { F } = solve({ m1: M_E, m2: m, r: R_E });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `Using Newton's law of universal gravitation (not W = mg), find the gravitational force Earth exerts on a ${q(m, "kg")} object at the surface. $M_E = 5.97\\times10^{24}\\ \\text{kg}$, $R_E = 6.37\\times10^{6}\\ \\text{m}$.`,
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "M_E", value: M_E, unit: "kg" },
          { symbol: "R_E", value: R_E, unit: "m" },
        ],
        target: { symbol: "F", unit: "N", label: "gravitational force" },
        answer: toSigFigs(F, 4),
        choices: buildNumericChoices(rng, F, [
          { errorId: "forgot-square", value: (G * M_E * m) / R_E },
          { errorId: "mass-not-weight", value: m },
          { errorId: "arithmetic-slip", value: F / 2 },
          { errorId: "arithmetic-slip", value: F * 10 },
        ]),
        equations: ["grav-force", "weight"],
        recipe: ["F = G M_E m / R_E²", "Compare with mg"],
        hints: ["Treat Earth as a point mass at its center: r = R_E.", "F = G M_E m / R_E².", "The answer should be close to mg."],
        solution: [
          { text: "Substitute with r = R_E (distance to Earth's center).", latex: `F = \\frac{G M_E m}{R_E^2} = \\frac{(6.674\\times10^{-11})(5.97\\times10^{24})(${m})}{(6.37\\times10^{6})^2} = ${fx(F)}\\ \\text{N}`, equationId: "grav-force", value: toSigFigs(F, 4) },
        ],
        note: `Check: mg = ${fx(m * 9.8)} N — the same to within the rounding of the constants. That is where g = GM_E/R_E² comes from.`,
      };
    }
    // find-r
    const m1 = nice(rng, 1e3, 9e3, 100);
    const m2 = nice(rng, 1e3, 9e3, 100);
    const r = nice(rng, 1, 20, 0.5);
    const F = toSigFigs((G * m1 * m2) / (r * r), 3);
    const rAns = Math.sqrt((G * m1 * m2) / F);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `Two objects of masses ${q(m1, "kg")} and ${q(m2, "kg")} attract each other gravitationally with a force of ${q(F, "N")}. How far apart are their centers?`,
      givens: [
        { symbol: "m_1", value: m1, unit: "kg" },
        { symbol: "m_2", value: m2, unit: "kg" },
        { symbol: "F", value: F, unit: "N" },
      ],
      target: { symbol: "r", unit: "m", label: "separation" },
      answer: toSigFigs(rAns, 4),
      choices: buildNumericChoices(rng, rAns, [
        { errorId: "forgot-sqrt", value: (G * m1 * m2) / F },
        { errorId: "arithmetic-slip", value: rAns * 2 },
        { errorId: "forgot-square", value: Math.sqrt((G * m1 * m2) / F) / 3 },
        { errorId: "arithmetic-slip", value: rAns / 2 },
      ]),
      equations: ["grav-force"],
      recipe: ["r² = G m₁ m₂ / F", "r = √(…)"],
      hints: ["Solve F = Gm₁m₂/r² for r.", "r² = Gm₁m₂/F; then square root.", `r² = ${fx((G * m1 * m2) / F)} m².`],
      solution: [{ text: "Solve for r and take the square root.", latex: `r = \\sqrt{\\frac{G m_1 m_2}{F}} = \\sqrt{\\frac{(6.674\\times10^{-11})(${m1})(${m2})}{${F}}} = ${fx(rAns)}\\ \\text{m}`, equationId: "grav-force", value: toSigFigs(rAns, 4) }],
    };
  },
};
