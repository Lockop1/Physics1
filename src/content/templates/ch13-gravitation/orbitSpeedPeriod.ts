import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { G, M_E, R_E } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Orbital speed and period at altitude h. ISS (400 km): v = 7.67 × 10³ m/s, T = 5.55 × 10³ s. */
export function solve(p: { hKm: number }): { r: number; v: number; T: number } {
  const r = R_E + p.hKm * 1000;
  const v = Math.sqrt((G * M_E) / r);
  return { r, v, T: (2 * Math.PI * r) / v };
}

const SKINS = ["the International Space Station", "a reconnaissance satellite", "a communications satellite", "a weather satellite", "the Hubble Space Telescope"];

export const template: QuestionTemplate = {
  id: "ch13.orbits.speed-period",
  topicId: "ch13.orbits",
  title: "Orbital speed and period at altitude h (multi-part)",
  source: "Ch 6b lecture — Example 13.9 (ISS at 400 km → 7.67 × 10³ m/s, 5.55 × 10³ s)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(SKINS);
    const hKm = rng.pick([300, 350, 400, 420, 500, 550, 600, 700, 800, 1000, 1200, 2000, 5000, 20200, 35800]);
    const s = solve({ hKm });
    const h = hKm * 1000;
    const m = rng.pick([420000, 1500, 2300, 11000, 5000]);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is its orbital speed?",
        target: { symbol: "v", unit: "m/s", label: "orbital speed" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "altitude-not-plus-radius", value: Math.sqrt((G * M_E) / h) },
          { errorId: "forgot-sqrt", value: (G * M_E) / s.r },
          { errorId: "km-not-converted", value: Math.sqrt((G * M_E) / (R_E + hKm)) },
          { errorId: "orbit-mass-matters", value: Math.sqrt((G * M_E * m) / s.r) / 1000 },
        ]),
        solution: [
          { text: "Orbit radius from Earth's center.", latex: `r = R_E + h = 6.37\\times10^{6} + ${fx(h)} = ${fx(s.r)}\\ \\text{m}`, value: s.r },
          { text: "Gravity is the centripetal force; the satellite mass cancels.", latex: `\\frac{G M_E m}{r^2} = \\frac{m v^2}{r} \;\\Rightarrow\; v = \\sqrt{\\frac{G M_E}{r}} = \\sqrt{\\frac{(6.674\\times10^{-11})(5.97\\times10^{24})}{${fx(s.r)}}} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "v-orbit", value: toSigFigs(s.v, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is its orbital period?",
        target: { symbol: "T", unit: "s", label: "orbital period" },
        answer: toSigFigs(s.T, 4),
        choices: buildNumericChoices(rng, s.T, [
          { errorId: "altitude-not-plus-radius", value: (2 * Math.PI * h) / s.v },
          { errorId: "period-frequency-swap", value: s.v / (2 * Math.PI * s.r) },
          { errorId: "revolutions-not-converted", value: s.r / s.v },
          { errorId: "arithmetic-slip", value: s.T / 60 },
        ]),
        solution: [{ text: "One circumference at the orbital speed (equivalently T = 2π√(r³/GM)).", latex: `T = \\frac{2\\pi r}{v} = \\frac{2\\pi(${fx(s.r)})}{${fx(s.v)}} = ${fx(s.T)}\\ \\text{s} \\approx ${fx(s.T / 60)}\\ \\text{min}`, equationId: "T-orbit", value: toSigFigs(s.T, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `${cap(skin)} (mass ${q(m, "kg")}) is in a circular orbit ${q(hKm, "km")} above Earth's surface.`,
        diagram: { kind: "orbit", altitudeLabel: `h = ${hKm} km` },
        givens: [
          { symbol: "m", value: m, unit: "kg", note: "not needed" },
          { symbol: "h", value: hKm, unit: "km" },
        ],
        equations: ["grav-force", "sum-fc", "v-orbit", "T-orbit"],
        recipe: ["r = R_E + h", "GMm/r² = mv²/r → v = √(GM/r)", "T = 2πr/v"],
        hints: ["The only force is gravity, and it must equal mv²/r.", "Use r = R_E + h from the center; the satellite's mass cancels.", `r = ${fx(s.r)} m.`],
      },
      parts,
    );
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
