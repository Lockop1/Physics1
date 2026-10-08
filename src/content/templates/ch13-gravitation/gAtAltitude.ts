import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { G, M_E, R_E, g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** g = GM/(R_E + h)². Lecture: h = 400 km → 8.67 m/s² (8.68 with our constants). */
export function solve(p: { hKm: number }): { r: number; g: number } {
  const r = R_E + p.hKm * 1000;
  return { r, g: (G * M_E) / (r * r) };
}

type Variant = "g" | "weight" | "fraction";
const SKINS = ["the International Space Station", "a weather satellite", "a GPS satellite", "a high-altitude balloon", "a spy satellite"];

export const template: QuestionTemplate = {
  id: "ch13.g-altitude.g-at-h",
  topicId: "ch13.g-altitude",
  title: "g (or weight) at altitude h above Earth",
  source: "Ch 6b lecture — Example 13.4 (ISS, h = 400 km → g = 8.67 m/s²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["g", "weight", "fraction"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const hKm = rng.pick([200, 300, 350, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 35800]);
    const s = solve({ hKm });
    const h = hKm * 1000;
    const m = nice(rng, 50, 500, 10);
    const base = {
      templateId: this.id,
      seed: rng.seed,
      variant,
      diagram: { kind: "orbit" as const, altitudeLabel: `h = ${hKm} km` },
      equations: ["g-altitude", ...(variant === "weight" ? ["weight"] : [])],
    };
    const gSolution = [
      { text: "Distance from Earth's CENTER (convert km → m).", latex: `r = R_E + h = 6.37\\times10^{6} + ${fx(h)} = ${fx(s.r)}\\ \\text{m}`, value: s.r },
      { text: "Gravitational field at that distance.", latex: `g = \\frac{G M_E}{r^2} = \\frac{(6.674\\times10^{-11})(5.97\\times10^{24})}{(${fx(s.r)})^2} = ${fx(s.g)}\\ \\text{m/s}^2`, equationId: "g-altitude", value: toSigFigs(s.g, 4) },
    ];
    const gCands = (scale: number) => [
      { errorId: "altitude-not-plus-radius", value: ((G * M_E) / (h * h)) * scale },
      { errorId: "forgot-square", value: ((G * M_E) / s.r) * scale },
      { errorId: "km-not-converted", value: ((G * M_E) / ((R_E + hKm) * (R_E + hKm))) * scale },
      { errorId: "inverse-not-inverse-square", value: g * (R_E / s.r) * scale },
    ];
    if (variant === "g") {
      return {
        ...base,
        prompt: `What is the acceleration due to gravity at the altitude of ${skin}, ${q(hKm, "km")} above Earth's surface?`,
        givens: [{ symbol: "h", value: hKm, unit: "km" }],
        target: { symbol: "g", unit: "m/s²", label: "gravitational acceleration at altitude" },
        answer: toSigFigs(s.g, 4),
        choices: buildNumericChoices(rng, s.g, gCands(1)),
        recipe: ["r = R_E + h (convert km → m)", "g = GM_E / r²"],
        hints: ["g = GM/r² with r measured from Earth's center.", "r = R_E + h — don't use h alone, and convert km to m.", `r = ${fx(s.r)} m.`],
        solution: gSolution,
        note: "Gravity at the ISS is still ~88% of its surface value — astronauts are 'weightless' only because they are in free fall.",
      };
    }
    if (variant === "weight") {
      const W = m * s.g;
      return {
        ...base,
        prompt: `An astronaut of mass ${q(m, "kg")} is aboard ${skin} at an altitude of ${q(hKm, "km")}. What is the gravitational force on the astronaut there?`,
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "h", value: hKm, unit: "km" },
        ],
        target: { symbol: "W", unit: "N", label: "weight at altitude" },
        answer: toSigFigs(W, 4),
        choices: buildNumericChoices(rng, W, [...gCands(m), { errorId: "wrong-g", value: m * g }, { errorId: "weightless-means-no-gravity", value: 0.001 * m }]),
        recipe: ["r = R_E + h", "g_h = GM_E / r²", "W = m g_h"],
        hints: ["Weight is m times the LOCAL g.", "Find g at r = R_E + h first.", `g_h = ${toSigFigs(s.g, 3)} m/s².`],
        solution: [...gSolution, { text: "Weight at that altitude.", latex: `W = m g_h = (${m})(${fx(s.g)}) = ${fx(W)}\\ \\text{N}`, equationId: "weight", value: toSigFigs(W, 4) }],
        note: `On the surface the astronaut weighs ${fx(m * g)} N. Not zero up there — just in free fall.`,
      };
    }
    const frac = s.g / g;
    return {
      ...base,
      prompt: `At the altitude of ${skin}, ${q(hKm, "km")} above the surface, what fraction of its surface weight does an object have?`,
      givens: [{ symbol: "h", value: hKm, unit: "km" }],
      target: { symbol: "W_h / W_0", unit: "", label: "fraction of surface weight" },
      answer: toSigFigs(frac, 4),
      choices: buildNumericChoices(rng, frac, [
        { errorId: "inverse-not-inverse-square", value: R_E / s.r },
        { errorId: "altitude-not-plus-radius", value: (R_E * R_E) / (h * h) },
        { errorId: "ratio-inverted", value: 1 / frac },
        { errorId: "forgot-square", value: Math.sqrt(frac) },
      ]),
      recipe: ["g ∝ 1/r²", "W_h/W_0 = (R_E / (R_E + h))²"],
      hints: ["Weight scales like g, which scales like 1/r².", "Ratio = (R_E / r)² with r = R_E + h.", `R_E/r = ${toSigFigs(R_E / s.r, 3)}.`],
      solution: [
        { text: "Only the distance changes, so take the ratio of the inverse squares.", latex: `\\frac{W_h}{W_0} = \\frac{g_h}{g} = \\left(\\frac{R_E}{R_E + h}\\right)^2 = \\left(\\frac{6.37\\times10^6}{${fx(s.r)}}\\right)^2 = ${fx(frac)}`, equationId: "g-altitude", value: toSigFigs(frac, 4) },
      ],
    };
  },
};
