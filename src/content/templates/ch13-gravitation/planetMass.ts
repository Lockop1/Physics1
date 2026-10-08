import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { sig, nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { G } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Planet mass from a satellite's orbit: M = 4π²r³/(GT²). Lecture: T = 84 s, r = 8.0 × 10⁶ m → 4.3 × 10²⁸ kg. */
export function solve(p: { T: number; r: number }): { M: number; v: number } {
  const v = (2 * Math.PI * p.r) / p.T;
  return { v, M: (v * v * p.r) / G };
}

type Variant = "M" | "T";
const NAMES = ["Nutron", "Kepler-22b", "Zorg", "planet X", "Gliese 581g", "Arrakis"];

export const template: QuestionTemplate = {
  id: "ch13.orbits.planet-mass",
  topicId: "ch13.orbits",
  title: "Planet mass from an observed orbit (T, r)",
  source: "Ch 6b lecture — Example 3, planet Nutron (T = 84 s, r = 8.0 × 10⁶ m → 4.3 × 10²⁸ kg)",
  kind: "numeric",
  difficulty: 3,
  variants: ["M", "T"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const name = rng.pick(NAMES);
    const r = sig(rng, 2e6, 9e8, 2);
    if (variant === "M") {
      const useHours = rng.chance(0.4);
      const T = useHours ? nice(rng, 1, 48, 0.5) * 3600 : nice(rng, 60, 9000, 10);
      const { M, v } = solve({ T, r });
      const Tshown = useHours ? T / 3600 : T;
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A satellite circles planet ${name} with a period of ${q(Tshown, useHours ? "h" : "s")} in a circular orbit of radius ${q(r, "m")}. What is the mass of the planet?`,
        diagram: { kind: "orbit", radiusLabel: "r" },
        givens: [
          { symbol: "T", value: Tshown, unit: useHours ? "h" : "s" },
          { symbol: "r", value: r, unit: "m" },
        ],
        target: { symbol: "M", unit: "kg", label: "planet mass" },
        answer: toSigFigs(M, 4),
        choices: buildNumericChoices(rng, M, [
          { errorId: "forgot-square", value: (4 * Math.PI * Math.PI * r * r) / (G * T * T) },
          ...(useHours ? [{ errorId: "minutes-not-converted", value: (4 * Math.PI * Math.PI * r ** 3) / (G * Tshown * Tshown) }] : [{ errorId: "arithmetic-slip", value: M / 10 }]),
          { errorId: "forgot-sqrt", value: (2 * Math.PI * r ** 3) / (G * T * T) },
          { errorId: "arithmetic-slip", value: M * 4 },
        ]),
        equations: ["v-2pir-over-T", "grav-force", "sum-fc", "T-orbit"],
        recipe: [...(useHours ? ["Convert hours → seconds"] : []), "v = 2πr/T", "Gravity = centripetal: GMm/r² = mv²/r", "M = v²r/G  (equivalently M = 4π²r³/(GT²))"],
        hints: ["Gravitational force = centripetal force; the satellite's mass cancels.", "Get v from the period: v = 2πr/T. Then GM/r = v².", `v = ${fx(v)} m/s.`],
        solution: [
          ...(useHours ? [{ text: "Period in seconds.", latex: `T = ${Tshown}\\ \\text{h} \\times 3600 = ${fx(T)}\\ \\text{s}`, value: T }] : []),
          { text: "Orbital speed from the period.", latex: `v = \\frac{2\\pi r}{T} = \\frac{2\\pi(${fx(r)})}{${fx(T)}} = ${fx(v)}\\ \\text{m/s}`, equationId: "v-2pir-over-T", value: v },
          { text: "Set gravity equal to the centripetal force and solve for M.", latex: `\\frac{GMm}{r^2} = \\frac{mv^2}{r} \;\\Rightarrow\; M = \\frac{v^2 r}{G} = \\frac{(${fx(v)})^2(${fx(r)})}{6.674\\times10^{-11}} = ${fx(M)}\\ \\text{kg}`, equationId: "T-orbit", value: toSigFigs(M, 4) },
        ],
      };
    }
    const M = sig(rng, 1e23, 9e27, 2);
    const T = 2 * Math.PI * Math.sqrt(r ** 3 / (G * M));
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `Planet ${name} has mass ${q(M, "kg")}. What is the period of a satellite in a circular orbit of radius ${q(r, "m")} around it?`,
      diagram: { kind: "orbit", radiusLabel: "r" },
      givens: [
        { symbol: "M", value: M, unit: "kg" },
        { symbol: "r", value: r, unit: "m" },
      ],
      target: { symbol: "T", unit: "s", label: "orbital period" },
      answer: toSigFigs(T, 4),
      choices: buildNumericChoices(rng, T, [
        { errorId: "forgot-sqrt", value: (4 * Math.PI * Math.PI * r ** 3) / (G * M) },
        { errorId: "forgot-square", value: 2 * Math.PI * Math.sqrt((r * r) / (G * M)) },
        { errorId: "revolutions-not-converted", value: Math.sqrt(r ** 3 / (G * M)) },
        { errorId: "arithmetic-slip", value: T / 60 },
      ]),
      equations: ["v-orbit", "v-2pir-over-T", "T-orbit"],
      recipe: ["v = √(GM/r)", "T = 2πr/v = 2π√(r³/GM)"],
      hints: ["Find the orbital speed first, or use Kepler's third law directly.", "T = 2π√(r³/(GM)).", `GM/r → v = ${fx(Math.sqrt((G * M) / r))} m/s.`],
      solution: [{ text: "Kepler's third law for a circular orbit.", latex: `T = 2\\pi\\sqrt{\\frac{r^3}{GM}} = 2\\pi\\sqrt{\\frac{(${fx(r)})^3}{(6.674\\times10^{-11})(${fx(M)})}} = ${fx(T)}\\ \\text{s}`, equationId: "T-orbit", value: toSigFigs(T, 4) }],
    };
  },
};
