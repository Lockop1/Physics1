import type { QuestionTemplate, GeneratedQuestion, Given, SolutionStep } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, sig, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/**
 * Uniform circular motion: T, v, ω, r are linked by v = 2πr/T, ω = 2π/T, v = rω.
 * Two are given, one is asked. Unknown rotates among T, v, ω, r.
 */

export interface UcmParams {
  r: number; // m
  T: number; // s
}

export function solve(p: UcmParams): { v: number; omega: number; f: number } {
  const omega = (2 * Math.PI) / p.T;
  return { v: p.r * omega, omega, f: 1 / p.T };
}

type Variant = "T" | "v" | "omega" | "r";

const SKINS = [
  { thing: "A fan blade tip", rMin: 0.2, rMax: 0.6, step: 0.01, TMin: 0.1, TMax: 0.5 },
  { thing: "A point on the rim of a spinning bicycle wheel", rMin: 0.3, rMax: 0.4, step: 0.01, TMin: 0.2, TMax: 0.8 },
  { thing: "A child on a merry-go-round", rMin: 1.5, rMax: 4, step: 0.1, TMin: 3, TMax: 10 },
  { thing: "A car on a circular test track", rMin: 50, rMax: 200, step: 5, TMin: 20, TMax: 60 },
  { thing: "A seat on a Ferris wheel", rMin: 8, rMax: 30, step: 0.5, TMin: 20, TMax: 90 },
];

export const template: QuestionTemplate = {
  id: "ch4.ucm.period-speed-omega",
  topicId: "ch4.ucm",
  title: "Period, speed, angular velocity, radius",
  source: "SI Exam 1 Review — Q25 (fan: r = 36.0 cm, T = 0.221 s → ω = 28.4 rad/s)",
  kind: "numeric",
  difficulty: 1,
  variants: ["T", "v", "omega", "r"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const r = nice(rng, skin.rMin, skin.rMax, skin.step);
    const T = sig(rng, skin.TMin, skin.TMax, 3);
    const { v, omega } = solve({ r, T });
    const useCm = r < 1;
    const rShown = useCm ? toSigFigs(r * 100, 3) : r;
    const rUnit = useCm ? "cm" : "m";
    const rText = q(rShown, rUnit);
    const vS = toSigFigs(v, 3);
    const omegaS = toSigFigs(omega, 3);

    // Givens the question shows (depends on which one is hidden)
    const givenR: Given = { symbol: "r", value: rShown, unit: rUnit };
    const givenT: Given = { symbol: "T", value: T, unit: "s" };
    const givenV: Given = { symbol: "v", value: vS, unit: "m/s" };
    const givenOmega: Given = { symbol: "\\omega", value: omegaS, unit: "rad/s" };
    const cmStep: SolutionStep[] = useCm ? [{ text: "Convert the radius to meters.", latex: `r = ${rShown}\\ \\text{cm} = ${r}\\ \\text{m}` }] : [];
    const cmCand = (val: number) => (useCm ? [{ errorId: "cm-not-converted", value: val }] : []);

    const base = { templateId: this.id, seed: rng.seed, variant, diagram: { kind: "circle" as const, radiusLabel: `r = ${rShown} ${rUnit}`, direction: "ccw" as const, markAngleDeg: 40, showVelocity: true } };

    switch (variant) {
      case "v": {
        // given r, T → v
        return {
          ...base,
          prompt: `${skin.thing} moves in a circle of radius ${rText}, completing one revolution every ${q(T, "s")}. What is its speed?`,
          givens: [givenR, givenT],
          target: { symbol: "v", unit: "m/s", label: "tangential speed" },
          answer: toSigFigs(v, 4),
          choices: buildNumericChoices(rng, v, [
            ...cmCand((rShown * 2 * Math.PI) / T),
            { errorId: "revolutions-not-converted", value: r / T },
            { errorId: "diameter-as-radius", value: (2 * r * 2 * Math.PI) / T },
            { errorId: "period-frequency-swap", value: 2 * Math.PI * r * T },
          ]),
          equations: ["v-2pir-over-T"],
          recipe: ["One revolution = circumference 2πr", "v = 2πr / T"],
          hints: ["In one period the object travels one full circumference.", "v = distance / time = 2πr / T.", `2π(${r}) / ${T}.`],
          solution: [...cmStep, { text: "Speed is circumference over period.", latex: `v = \\frac{2\\pi r}{T} = \\frac{2\\pi(${r})}{${T}} = ${fx(v)}\\ \\text{m/s}`, equationId: "v-2pir-over-T", value: toSigFigs(v, 4) }],
        };
      }
      case "omega": {
        // given r, T → ω  (r is an irrelevant given)
        return {
          ...base,
          prompt: `${skin.thing} is ${rText} from the axis of rotation and takes ${q(T, "s")} to complete one revolution. What is its angular velocity in rad/s?`,
          givens: [givenR, givenT],
          target: { symbol: "\\omega", unit: "rad/s", label: "angular velocity" },
          answer: toSigFigs(omega, 4),
          choices: buildNumericChoices(rng, omega, [
            { errorId: "revolutions-not-converted", value: 1 / T },
            { errorId: "period-frequency-swap", value: 2 * Math.PI * T },
            { errorId: "degrees-in-radian-formula", value: 360 / T },
            { errorId: "arithmetic-slip", value: Math.PI / T },
          ]),
          equations: ["omega-def"],
          recipe: ["One revolution = 2π rad", "ω = 2π / T"],
          hints: ["Angular velocity is angle per time.", "One revolution is 2π rad, so ω = 2π/T. The radius is not needed.", `2π / ${T}.`],
          solution: [{ text: "ω is 2π radians per period. The radius isn't needed.", latex: `\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{${T}} = ${fx(omega)}\\ \\text{rad/s}`, equationId: "omega-def", value: toSigFigs(omega, 4) }],
          note: "The radius was an irrelevant given — ω depends only on the period.",
        };
      }
      case "T": {
        // given r, v → T
        const Tans = (2 * Math.PI * r) / vS;
        return {
          ...base,
          prompt: `${skin.thing} moves at a constant ${q(vS, "m/s")} around a circle of radius ${rText}. How long does one revolution take?`,
          givens: [givenR, givenV],
          target: { symbol: "T", unit: "s", label: "period" },
          answer: toSigFigs(Tans, 4),
          choices: buildNumericChoices(rng, Tans, [
            ...cmCand((2 * Math.PI * rShown) / vS),
            { errorId: "revolutions-not-converted", value: r / vS },
            { errorId: "diameter-as-radius", value: (2 * Math.PI * 2 * r) / vS },
            { errorId: "period-frequency-swap", value: vS / (2 * Math.PI * r) },
          ]),
          equations: ["v-2pir-over-T"],
          recipe: ["Circumference = 2πr", "T = 2πr / v"],
          hints: ["The period is the time for one full circle.", "Distance for one revolution is 2πr; time = distance / speed.", `2π(${r}) / ${vS}.`],
          solution: [...cmStep, { text: "Rearrange v = 2πr/T.", latex: `T = \\frac{2\\pi r}{v} = \\frac{2\\pi(${r})}{${vS}} = ${fx(Tans)}\\ \\text{s}`, equationId: "v-2pir-over-T", value: toSigFigs(Tans, 4) }],
        };
      }
      case "r": {
        // given v, ω → r
        const rAns = vS / omegaS;
        return {
          ...base,
          diagram: { kind: "circle", radiusLabel: "r = ?", direction: "ccw", markAngleDeg: 40, showVelocity: true },
          prompt: `${skin.thing} moves at ${q(vS, "m/s")} with an angular velocity of ${q(omegaS, "rad/s")}. What is the radius of its circular path?`,
          givens: [givenV, givenOmega],
          target: { symbol: "r", unit: "m", label: "radius" },
          answer: toSigFigs(rAns, 4),
          choices: buildNumericChoices(rng, rAns, [
            { errorId: "arithmetic-slip", value: vS * omegaS },
            { errorId: "diameter-as-radius", value: rAns / 2 },
            { errorId: "revolutions-not-converted", value: (vS / omegaS) * 2 * Math.PI },
            { errorId: "forgot-square", value: vS / (omegaS * omegaS) },
          ]),
          equations: ["v-r-omega"],
          recipe: ["v = rω → r = v/ω"],
          hints: ["Linear speed and angular speed differ by the radius.", "v = rω, so r = v/ω.", `${vS} / ${omegaS}.`],
          solution: [{ text: "Rearrange v = rω.", latex: `r = \\frac{v}{\\omega} = \\frac{${vS}}{${omegaS}} = ${fx(rAns)}\\ \\text{m}`, equationId: "v-r-omega", value: toSigFigs(rAns, 4) }],
        };
      }
    }
  },
};
