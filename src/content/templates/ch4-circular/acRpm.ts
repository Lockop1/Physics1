import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, sig, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/**
 * Centripetal acceleration of a point on a rotating object.
 * Rotation rate given as rev/min (or as a period T); radius in cm (sometimes as a diameter).
 * Distractors: rpm-not-converted, cm-not-converted, diameter-as-radius, forgot-square.
 */

export interface AcParams {
  /** radius in METERS */
  r: number;
  /** angular velocity in rad/s */
  omega: number;
}

export function solve(p: AcParams): { ac: number; v: number } {
  return { ac: p.r * p.omega * p.omega, v: p.r * p.omega };
}

export function omegaFromRpm(rpm: number): number {
  return (rpm * 2 * Math.PI) / 60;
}
export function omegaFromPeriod(T: number): number {
  return (2 * Math.PI) / T;
}

type Variant = "rpm" | "period";

const SKINS = [
  { thing: "ceiling fan", point: "the tip of a blade", rMin: 30, rMax: 60, rpmMin: 120, rpmMax: 400, TMin: 0.15, TMax: 0.5 },
  { thing: "desk fan", point: "the tip of a blade", rMin: 8, rMax: 20, rpmMin: 600, rpmMax: 1500, TMin: 0.04, TMax: 0.1 },
  { thing: "washing-machine drum", point: "a sock stuck to the drum wall", rMin: 20, rMax: 30, rpmMin: 400, rpmMax: 1200, TMin: 0.05, TMax: 0.15 },
  { thing: "CD", point: "a speck of dust on the outer edge", rMin: 4, rMax: 6, rpmMin: 200, rpmMax: 500, TMin: 0.12, TMax: 0.3 },
  { thing: "centrifuge", point: "a sample at the end of the arm", rMin: 10, rMax: 15, rpmMin: 1000, rpmMax: 3000, TMin: 0.02, TMax: 0.06 },
];

export const template: QuestionTemplate = {
  id: "ch4.ucm.ac-rpm",
  topicId: "ch4.ucm",
  title: "Centripetal acceleration from rev/min and radius in cm",
  source: "Exam 2 Review — Ch 4 fan (360 rev/min, r = 10.0 cm → 142 m/s²); SI Q25",
  kind: "numeric",
  difficulty: 2,
  variants: ["rpm", "period"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const giveDiameter = rng.chance(0.35);
    const rCm = nice(rng, skin.rMin, skin.rMax, 0.5);
    const r = rCm / 100;
    const dCm = toSigFigs(rCm * 2, 3);

    const rpm = variant === "rpm" ? nice(rng, skin.rpmMin, skin.rpmMax, 10) : 0;
    const T = variant === "period" ? sig(rng, skin.TMin, skin.TMax, 3) : 0;
    const omega = variant === "rpm" ? omegaFromRpm(rpm) : omegaFromPeriod(T);
    const { ac } = solve({ r, omega });

    const lengthText = giveDiameter ? `a diameter of ${q(dCm, "cm")}` : `a radius of ${q(rCm, "cm")}`;
    const rateText = variant === "rpm" ? `rotates at ${q(rpm, "rev/min")}` : `completes one revolution every ${q(T, "s")}`;

    const candidates = [
      ...(variant === "rpm"
        ? [{ errorId: "rpm-not-converted", value: r * rpm * rpm }]
        : [{ errorId: "revolutions-not-converted", value: r / (T * T) }]),
      { errorId: "cm-not-converted", value: rCm * omega * omega },
      ...(giveDiameter ? [{ errorId: "diameter-as-radius", value: 2 * r * omega * omega }] : []),
      { errorId: "forgot-square", value: r * omega },
      ...(variant === "rpm" ? [{ errorId: "arithmetic-slip", value: r * ((rpm * 2 * Math.PI) / 60 / 60) ** 2 }] : []),
    ];

    const omegaStep =
      variant === "rpm"
        ? { text: "Convert rev/min to rad/s: multiply by 2π rad/rev and divide by 60 s/min.", latex: `\\omega = ${rpm}\\,\\frac{\\text{rev}}{\\text{min}}\\cdot\\frac{2\\pi\\ \\text{rad}}{1\\ \\text{rev}}\\cdot\\frac{1\\ \\text{min}}{60\\ \\text{s}} = ${fx(omega)}\\ \\text{rad/s}`, equationId: "omega-def", value: omega }
        : { text: "Angular velocity from the period.", latex: `\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{${T}} = ${fx(omega)}\\ \\text{rad/s}`, equationId: "omega-def", value: omega };

    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A ${skin.thing} ${rateText}. Its blades sweep a circle with ${lengthText}. What is the magnitude of the centripetal acceleration of ${skin.point}?`,
      diagram: { kind: "circle", radiusLabel: giveDiameter ? `d = ${dCm} cm` : `r = ${rCm} cm`, showDiameter: giveDiameter, direction: "cw", markAngleDeg: 30, showCentripetal: true, markLabel: "P" },
      givens: [
        giveDiameter ? { symbol: "d", value: dCm, unit: "cm", note: "diameter" } : { symbol: "r", value: rCm, unit: "cm" },
        variant === "rpm" ? { symbol: "f", value: rpm, unit: "rev/min" } : { symbol: "T", value: T, unit: "s" },
      ],
      target: { symbol: "a_c", unit: "m/s²", label: "centripetal acceleration" },
      answer: toSigFigs(ac, 4),
      choices: buildNumericChoices(rng, ac, candidates),
      equations: ["rad-conv", "omega-def", "ac-v2-over-r"],
      recipe: [
        variant === "rpm" ? "Convert rev/min → rad/s (×2π, ÷60)" : "ω = 2π/T",
        giveDiameter ? "r = d/2, convert cm → m" : "Convert r from cm → m",
        "a_c = rω²",
      ],
      hints: [
        "A point on a rotating object moves in a circle at constant speed — this is uniform circular motion.",
        `You need ω in rad/s and r in meters, then a_c = rω² (or find v = rω first and use v²/r).`,
        `ω = ${toSigFigs(omega, 3)} rad/s, r = ${r} m${giveDiameter ? " (half the diameter)" : ""}.`,
      ],
      solution: [
        omegaStep,
        {
          text: giveDiameter ? "Halve the diameter to get the radius, and convert to meters." : "Convert the radius to meters.",
          latex: giveDiameter ? `r = \\frac{d}{2} = \\frac{${dCm}\\ \\text{cm}}{2} = ${rCm}\\ \\text{cm} = ${r}\\ \\text{m}` : `r = ${rCm}\\ \\text{cm} = ${r}\\ \\text{m}`,
          equationId: "rad-conv",
          value: r,
        },
        {
          text: "Centripetal acceleration from ω and r.",
          latex: `a_c = r\\omega^2 = (${r})(${fx(omega)})^2 = ${fx(ac)}\\ \\text{m/s}^2`,
          equationId: "ac-v2-over-r",
          value: toSigFigs(ac, 4),
        },
      ],
    };
  },
};
