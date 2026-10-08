import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toRad } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** s = rθ with θ given in degrees or revolutions; unknown rotates among s, r, θ. */

export interface ArcParams {
  r: number; // m
  thetaRad: number; // rad
}

export function solve(p: ArcParams): { s: number } {
  return { s: p.r * p.thetaRad };
}

type Variant = "s" | "r" | "theta";
type AngleUnit = "deg" | "rev";

const SKINS = [
  { thing: "a point on the rim of a bicycle wheel", rMin: 0.25, rMax: 0.4, step: 0.01 },
  { thing: "the tip of a clock's minute hand", rMin: 0.1, rMax: 0.3, step: 0.01 },
  { thing: "a child on a merry-go-round", rMin: 1.5, rMax: 3.5, step: 0.1 },
  { thing: "a car on a circular track", rMin: 40, rMax: 120, step: 5 },
  { thing: "a satellite in a circular orbit", rMin: 7000, rMax: 9000, step: 100 },
];

export const template: QuestionTemplate = {
  id: "ch4.ucm.arc-length",
  topicId: "ch4.ucm",
  title: "Arc length s = rθ",
  source: "Exam 2 Review — Ch 4 (half revolution → πr)",
  kind: "numeric",
  difficulty: 1,
  variants: ["s", "r", "theta"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const angleUnit: AngleUnit = rng.chance(0.6) ? "deg" : "rev";
    const r = nice(rng, skin.rMin, skin.rMax, skin.step);
    const deg = angleUnit === "deg" ? rng.pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 330]) : 0;
    const rev = angleUnit === "rev" ? rng.pick([0.25, 0.5, 0.75, 1.25, 1.5, 2, 2.5, 3]) : 0;
    const thetaRad = angleUnit === "deg" ? toRad(deg) : rev * 2 * Math.PI;
    const { s } = solve({ r, thetaRad });
    const rUnit = r < 1 ? "cm" : "m";
    const rShown = r < 1 ? r * 100 : r;

    const angleText = angleUnit === "deg" ? `${deg}^\\circ` : `${rev}\\ \\text{rev}`;
    const angleWrongValue = angleUnit === "deg" ? deg : rev;
    const angleErrorId = angleUnit === "deg" ? "degrees-in-radian-formula" : "revolutions-not-converted";
    const convStep =
      angleUnit === "deg"
        ? `\\theta = ${deg}^\\circ\\cdot\\frac{\\pi}{180^\\circ} = ${fx(thetaRad)}\\ \\text{rad}`
        : `\\theta = ${rev}\\ \\text{rev}\\cdot 2\\pi = ${fx(thetaRad)}\\ \\text{rad}`;

    const common = {
      templateId: this.id,
      seed: rng.seed,
      variant,
      equations: ["rad-conv", "arc-length"],
      diagram: { kind: "circle" as const, radiusLabel: `r = ${rShown} ${rUnit}`, arcDeg: angleUnit === "deg" ? deg : Math.min(rev * 360, 350), arcLabel: "θ", caption: `θ = ${angleUnit === "deg" ? deg + "°" : rev + " rev"}` },
    };

    if (variant === "s") {
      const candidates = [
        { errorId: angleErrorId, value: r * angleWrongValue },
        { errorId: "diameter-as-radius", value: 2 * r * thetaRad },
        ...(rUnit === "cm" ? [{ errorId: "cm-not-converted", value: rShown * thetaRad }] : []),
        { errorId: "arithmetic-slip", value: s / 2 },
      ];
      return {
        ...common,
        prompt: `${cap(skin.thing)} moves on a circle of radius ${q(rShown, rUnit)}. It sweeps through an angle of $${angleText}$. How far does it travel along the arc?`,
        givens: [
          { symbol: "r", value: rShown, unit: rUnit },
          { symbol: "\\theta", value: angleWrongValue, unit: angleUnit === "deg" ? "°" : "rev" },
        ],
        target: { symbol: "s", unit: "m", label: "arc length" },
        answer: toSigFigs(s, 4),
        choices: buildNumericChoices(rng, s, candidates),
        recipe: ["Convert θ to radians", "s = rθ"],
        hints: [
          "The distance along a circular path depends on the radius and the angle swept.",
          "Use s = rθ — but θ must be in radians (and r in meters).",
          `Convert: ${angleUnit === "deg" ? `${deg}° × π/180` : `${rev} rev × 2π`} = ${toSigFigs(thetaRad, 3)} rad${rUnit === "cm" ? `, and r = ${r} m` : ""}.`,
        ],
        solution: [
          { text: "Convert the angle to radians.", latex: convStep, equationId: "rad-conv", value: thetaRad },
          ...(rUnit === "cm" ? [{ text: "Convert the radius to meters.", latex: `r = ${rShown}\\ \\text{cm} = ${r}\\ \\text{m}` }] : []),
          { text: "Arc length is radius times angle.", latex: `s = r\\theta = (${r})(${fx(thetaRad)}) = ${fx(s)}\\ \\text{m}`, equationId: "arc-length", value: toSigFigs(s, 4) },
        ],
      };
    }

    if (variant === "r") {
      const sShown = toSigFigs(s, 3);
      const candidates = [
        { errorId: angleErrorId, value: sShown / angleWrongValue },
        { errorId: "arithmetic-slip", value: sShown * thetaRad },
        { errorId: "diameter-as-radius", value: (sShown / thetaRad) * 2 },
        { errorId: "arithmetic-slip", value: sShown / thetaRad / 2 },
      ];
      return {
        ...common,
        prompt: `${cap(skin.thing)} travels ${q(sShown, "m")} along a circular path while sweeping through $${angleText}$. What is the radius of the circle?`,
        givens: [
          { symbol: "s", value: sShown, unit: "m" },
          { symbol: "\\theta", value: angleWrongValue, unit: angleUnit === "deg" ? "°" : "rev" },
        ],
        target: { symbol: "r", unit: "m", label: "radius" },
        answer: toSigFigs(sShown / thetaRad, 4),
        choices: buildNumericChoices(rng, sShown / thetaRad, candidates),
        recipe: ["Convert θ to radians", "r = s/θ"],
        hints: ["Arc length, radius and angle are linked by one equation.", "s = rθ with θ in radians → r = s/θ.", `θ = ${toSigFigs(thetaRad, 3)} rad; divide.`],
        solution: [
          { text: "Convert the angle to radians.", latex: convStep, equationId: "rad-conv", value: thetaRad },
          { text: "Solve s = rθ for r.", latex: `r = \\frac{s}{\\theta} = \\frac{${sShown}}{${fx(thetaRad)}} = ${fx(sShown / thetaRad)}\\ \\text{m}`, equationId: "arc-length", value: toSigFigs(sShown / thetaRad, 4) },
        ],
      };
    }

    // theta (answer in degrees)
    const sShown = toSigFigs(s, 3);
    const thetaAns = (sShown / r) * (180 / Math.PI);
    const candidates = [
      { errorId: "degrees-in-radian-formula", value: sShown / r }, // reported radians as degrees
      { errorId: "diameter-as-radius", value: (sShown / (2 * r)) * (180 / Math.PI) },
      ...(rUnit === "cm" ? [{ errorId: "cm-not-converted", value: (sShown / rShown) * (180 / Math.PI) }] : []),
      { errorId: "arithmetic-slip", value: thetaAns * 2 },
    ];
    return {
      ...common,
      diagram: { ...common.diagram, arcDeg: Math.min(thetaAns, 350), caption: undefined },
      prompt: `${cap(skin.thing)} moves on a circle of radius ${q(rShown, rUnit)} and travels ${q(sShown, "m")} along the arc. Through what angle, in degrees, has it turned?`,
      givens: [
        { symbol: "r", value: rShown, unit: rUnit },
        { symbol: "s", value: sShown, unit: "m" },
      ],
      target: { symbol: "\\theta", unit: "°", label: "angle swept" },
      answer: toSigFigs(thetaAns, 4),
      choices: buildNumericChoices(rng, thetaAns, candidates),
      recipe: ["θ = s/r (radians)", "Convert radians to degrees"],
      hints: ["s = rθ gives the angle in radians.", "θ_rad = s/r, then multiply by 180/π.", `θ = ${sShown}/${r} = ${toSigFigs(sShown / r, 3)} rad.`],
      solution: [
        ...(rUnit === "cm" ? [{ text: "Convert the radius to meters.", latex: `r = ${rShown}\\ \\text{cm} = ${r}\\ \\text{m}` }] : []),
        { text: "Solve s = rθ for θ (radians).", latex: `\\theta = \\frac{s}{r} = \\frac{${sShown}}{${r}} = ${fx(sShown / r)}\\ \\text{rad}`, equationId: "arc-length", value: sShown / r },
        { text: "Convert to degrees.", latex: `\\theta = ${fx(sShown / r)}\\cdot\\frac{180^\\circ}{\\pi} = ${fx(thetaAns)}^\\circ`, equationId: "rad-conv", value: toSigFigs(thetaAns, 4) },
      ],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
