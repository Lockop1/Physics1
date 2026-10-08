import type { QuestionTemplate, GeneratedQuestion, Choice } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { toSigFigs } from "../../../engine/params";
import { within } from "../../../engine/check";
import { chooseVariant } from "../helpers";

/**
 * Radians ↔ degrees ↔ revolutions conversion. Choices are shown as multiples of
 * π where that is natural; values are stored numerically so checking is uniform.
 */

export type RadDegVariant = "to-rad" | "to-deg" | "rev-to-rad";

export interface RadDegParams {
  variant: RadDegVariant;
  /** Input angle in the source unit (deg, rad or rev). */
  input: number;
}

export function solve(p: RadDegParams): number {
  switch (p.variant) {
    case "to-rad":
      return (p.input * Math.PI) / 180;
    case "to-deg":
      return (p.input * 180) / Math.PI;
    case "rev-to-rad":
      return p.input * 2 * Math.PI;
  }
}

// Nice angles: degrees that are simple fractions of π.
const DEG_CHOICES = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, 720];
// rad inputs as (numerator, denominator) multiples of π
const RAD_CHOICES: [number, number][] = [
  [1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [7, 6], [5, 4], [4, 3], [3, 2], [5, 3], [7, 4], [2, 1], [3, 1],
];
const REV_CHOICES = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 5, 10];

/** Render a multiple of π as LaTeX, e.g. 0.25 → "\\pi/4". */
function piLabel(num: number, den: number): string {
  if (den === 1) return num === 1 ? "\\pi" : `${num}\\pi`;
  return num === 1 ? `\\frac{\\pi}{${den}}` : `\\frac{${num}\\pi}{${den}}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function piLabelFromDeg(deg: number): string {
  // deg/180 = num/den
  const g = gcd(deg, 180);
  return piLabel(deg / g, 180 / g);
}

export const template: QuestionTemplate = {
  id: "ch4.ucm.rad-deg",
  topicId: "ch4.ucm",
  title: "Radians ↔ degrees ↔ revolutions",
  source: "Exam 2 Review — Ch 4 warm-up (45° = π/4)",
  kind: "conceptual",
  difficulty: 1,
  variants: ["to-rad", "to-deg", "rev-to-rad"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as RadDegVariant;

    if (variant === "to-rad") {
      const deg = rng.pick(DEG_CHOICES);
      const answer = solve({ variant, input: deg });
      const correctLabel = `$${piLabelFromDeg(deg)}\\ \\text{rad}$ ≈ ${toSigFigs(answer, 3)} rad`;
      const wrong: { value: number; errorId: string; label: string }[] = [
        { value: deg, errorId: "degrees-in-radian-formula", label: `$${deg}\\ \\text{rad}$ (no conversion)` },
        { value: (deg * 180) / Math.PI, errorId: "unit-conversion-direction", label: `$${toSigFigs((deg * 180) / Math.PI, 3)}\\ \\text{rad}$` },
        { value: answer / 2, errorId: "arithmetic-slip", label: `$${toSigFigs(answer / 2, 3)}\\ \\text{rad}$` },
        { value: answer * 2, errorId: "arithmetic-slip", label: `$${toSigFigs(answer * 2, 3)}\\ \\text{rad}$` },
      ];
      const choices = assemble(rng, answer, correctLabel, wrong);
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `Convert $${deg}^\\circ$ to radians.`,
        givens: [{ symbol: "\\theta", value: deg, unit: "°" }],
        target: { symbol: "\\theta", unit: "rad", label: "angle in radians" },
        answer: toSigFigs(answer, 4),
        choices,
        equations: ["rad-conv"],
        recipe: ["Multiply degrees by π/180"],
        hints: [
          "A full circle is 360° and also 2π rad.",
          "Use θ_rad = θ_deg × π/180.",
          `${deg}/180 = ${simplify(deg, 180)} → multiply by π.`,
        ],
        solution: [
          {
            text: "Convert with the ratio π rad / 180°.",
            latex: `\\theta = ${deg}^\\circ \\cdot \\frac{\\pi}{180^\\circ} = ${piLabelFromDeg(deg)}\\ \\text{rad} \\approx ${toSigFigs(answer, 3)}\\ \\text{rad}`,
            equationId: "rad-conv",
            value: toSigFigs(answer, 4),
          },
        ],
      };
    }

    if (variant === "to-deg") {
      const [num, den] = rng.pick(RAD_CHOICES);
      const rad = (num * Math.PI) / den;
      const answer = solve({ variant, input: rad });
      const label = piLabel(num, den);
      const correctLabel = `$${toSigFigs(answer, 4)}^\\circ$`;
      const wrong = [
        { value: rad, errorId: "degrees-in-radian-formula", label: `$${toSigFigs(rad, 3)}^\\circ$ (no conversion)` },
        { value: (rad * Math.PI) / 180, errorId: "unit-conversion-direction", label: `$${toSigFigs((rad * Math.PI) / 180, 3)}^\\circ$` },
        { value: answer / 2, errorId: "arithmetic-slip", label: `$${toSigFigs(answer / 2, 4)}^\\circ$` },
        { value: answer * 2, errorId: "arithmetic-slip", label: `$${toSigFigs(answer * 2, 4)}^\\circ$` },
      ];
      const choices = assemble(rng, answer, correctLabel, wrong);
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `Convert $${label}\\ \\text{rad}$ to degrees.`,
        givens: [{ symbol: "\\theta", value: toSigFigs(rad, 4), unit: "rad" }],
        target: { symbol: "\\theta", unit: "°", label: "angle in degrees" },
        answer: toSigFigs(answer, 4),
        choices,
        equations: ["rad-conv"],
        recipe: ["Multiply radians by 180/π"],
        hints: ["π rad is a half turn = 180°.", "Use θ_deg = θ_rad × 180/π.", `${label} × 180/π: the π cancels.`],
        solution: [
          {
            text: "Convert with the ratio 180° / π rad — the π cancels.",
            latex: `\\theta = ${label} \\cdot \\frac{180^\\circ}{\\pi} = ${toSigFigs(answer, 4)}^\\circ`,
            equationId: "rad-conv",
            value: toSigFigs(answer, 4),
          },
        ],
      };
    }

    // rev-to-rad
    const rev = rng.pick(REV_CHOICES);
    const answer = solve({ variant, input: rev });
    const revLabel = revPiLabel(rev);
    const correctLabel = `$${revLabel}\\ \\text{rad}$ ≈ ${toSigFigs(answer, 3)} rad`;
    const wrong = [
      { value: rev, errorId: "revolutions-not-converted", label: `$${rev}\\ \\text{rad}$ (no conversion)` },
      { value: rev * Math.PI, errorId: "arithmetic-slip", label: `$${toSigFigs(rev * Math.PI, 3)}\\ \\text{rad}$` },
      { value: rev * 360, errorId: "degrees-in-radian-formula", label: `$${rev * 360}\\ \\text{rad}$` },
      { value: answer * 2, errorId: "arithmetic-slip", label: `$${toSigFigs(answer * 2, 3)}\\ \\text{rad}$` },
    ];
    const choices = assemble(rng, answer, correctLabel, wrong);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A wheel turns through ${rev} revolution${rev === 1 ? "" : "s"}. Through what angle, in radians, has it turned?`,
      givens: [{ symbol: "N", value: rev, unit: "rev" }],
      target: { symbol: "\\theta", unit: "rad", label: "angle in radians" },
      answer: toSigFigs(answer, 4),
      choices,
      equations: ["rad-conv"],
      recipe: ["Multiply revolutions by 2π"],
      hints: ["One revolution is a full circle.", "A full circle is 2π radians.", `θ = ${rev} × 2π.`],
      solution: [
        {
          text: "Each revolution is 2π rad.",
          latex: `\\theta = ${rev}\\ \\text{rev} \\cdot \\frac{2\\pi\\ \\text{rad}}{1\\ \\text{rev}} = ${revLabel} \\approx ${toSigFigs(answer, 3)}\\ \\text{rad}`,
          equationId: "rad-conv",
          value: toSigFigs(answer, 4),
        },
      ],
    };
  },
};

function revPiLabel(rev: number): string {
  const twoRev = rev * 2; // multiples of π
  if (Number.isInteger(twoRev)) return twoRev === 1 ? "\\pi" : `${twoRev}\\pi`;
  // 0.25 rev → π/2, 0.75 → 3π/2, 2.5 → 5π ... handle quarters
  const quarters = Math.round(rev * 4);
  const g = gcd(quarters, 2);
  const num = quarters / g;
  const den = 2 / g;
  return piLabel(num, den);
}

function simplify(a: number, b: number): string {
  const g = gcd(a, b);
  return b / g === 1 ? `${a / g}` : `${a / g}/${b / g}`;
}

function assemble(
  rng: Rng,
  answer: number,
  correctLabel: string,
  wrong: { value: number; errorId: string; label: string }[],
): Choice[] {
  const out: Choice[] = [{ value: toSigFigs(answer, 4), correct: true, label: correctLabel }];
  for (const w of wrong) {
    if (out.length >= 4) break;
    if (!Number.isFinite(w.value)) continue;
    if (out.some((c) => within(c.value as number, w.value, 0.03))) continue;
    out.push({ value: toSigFigs(w.value, 4), correct: false, errorId: w.errorId, label: w.label });
  }
  return rng.shuffle(out);
}
