import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { sig, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Density unit conversions. Lecture: lead 11.35 g/cm³ → 11 350 kg/m³. */
export function toKgM3(value: number, unit: "g/cm3" | "g/mm3" | "Mg/km3" | "kg/L"): number {
  switch (unit) {
    case "g/cm3":
      return value * 1000; // (1e-3 kg)/(1e-6 m³)
    case "g/mm3":
      return value * 1e6; // (1e-3)/(1e-9)
    case "Mg/km3":
      return value * 1e3 / 1e9; // (1e3 kg)/(1e9 m³)
    case "kg/L":
      return value * 1000;
  }
}

type Variant = "g/cm3" | "g/mm3" | "Mg/km3" | "kg/L";
const MATERIALS = [
  { name: "lead", gcm3: 11.35 },
  { name: "aluminum", gcm3: 2.70 },
  { name: "gold", gcm3: 19.3 },
  { name: "water", gcm3: 1.0 },
  { name: "ice", gcm3: 0.917 },
  { name: "iron", gcm3: 7.87 },
  { name: "styrofoam", gcm3: 0.05 },
];

export const template: QuestionTemplate = {
  id: "e1.units.density",
  topicId: "e1.units",
  title: "Density conversions (g/cm³, g/mm³, Mg/km³ → kg/m³)",
  source: "Ch 1–2 lecture — 'Convert the density of lead 11.35 g/cm³ into kg/m³'",
  kind: "numeric",
  difficulty: 2,
  variants: ["g/cm3", "g/mm3", "Mg/km3", "kg/L"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const mat = rng.pick(MATERIALS);
    // express the material's density in the chosen unit
    const trueKg = mat.gcm3 * 1000;
    const shown = variant === "g/cm3" ? mat.gcm3 : variant === "g/mm3" ? toSigFigs(mat.gcm3 / 1000, 3) : variant === "Mg/km3" ? toSigFigs(trueKg * 1e9 / 1e3, 3) : mat.gcm3;
    const value = variant === "Mg/km3" ? sig(rng, shown * 0.9, shown * 1.1, 3) : shown;
    const ans = toKgM3(value, variant);
    const label = variant === "g/cm3" ? "g/cm³" : variant === "g/mm3" ? "g/mm³" : variant === "Mg/km3" ? "Mg/km³" : "kg/L";
    const linear = variant === "g/cm3" ? value * (1 / 1000) * 100 : variant === "g/mm3" ? value * (1 / 1000) * 1000 : variant === "Mg/km3" ? value * 1000 / 1000 : value * 10;
    const massOnly = variant === "g/cm3" || variant === "g/mm3" ? value / 1000 : variant === "Mg/km3" ? value * 1000 : value;
    const lengthCubedOnly = variant === "g/cm3" ? value * 1e6 : variant === "g/mm3" ? value * 1e9 : variant === "Mg/km3" ? value / 1e9 : value * 1000;
    const chain =
      variant === "g/cm3"
        ? `\\frac{1\\ \\text{kg}}{1000\\ \\text{g}}\\cdot\\left(\\frac{100\\ \\text{cm}}{1\\ \\text{m}}\\right)^{3}`
        : variant === "g/mm3"
          ? `\\frac{1\\ \\text{kg}}{1000\\ \\text{g}}\\cdot\\left(\\frac{1000\\ \\text{mm}}{1\\ \\text{m}}\\right)^{3}`
          : variant === "Mg/km3"
            ? `\\frac{1000\\ \\text{kg}}{1\\ \\text{Mg}}\\cdot\\left(\\frac{1\\ \\text{km}}{1000\\ \\text{m}}\\right)^{3}`
            : `\\frac{1000\\ \\text{L}}{1\\ \\text{m}^3}`;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `The density of ${mat.name} is ${q(value, label)}. Express it in kg/m³.`,
      givens: [{ symbol: "\\rho", value, unit: label }],
      target: { symbol: "\\rho", unit: "kg/m³", label: "density in SI units" },
      answer: toSigFigs(ans, 4),
      choices: buildNumericChoices(rng, ans, [
        { errorId: "linear-conversion-on-area-volume", value: linear },
        { errorId: "arithmetic-slip", value: massOnly },
        { errorId: "unit-conversion-direction", value: lengthCubedOnly },
        { errorId: "unit-conversion-direction", value: ans === 0 ? 1 : 1 / ans },
      ]),
      equations: ["unit-conversion", "density"],
      recipe: ["Convert the mass unit → kg", "Convert the length unit → m, then CUBE the ratio for the volume", "Multiply"],
      hints: ["Two conversions: mass and volume. The volume one must be cubed.", `1 ${label.split("/")[1]} is (length ratio)³ m³ — e.g. 1 cm³ = (10⁻² m)³ = 10⁻⁶ m³.`, `Factor = ${fx(ans / value)}.`],
      solution: [{ text: "Chain the ratios; the length ratio is cubed because the unit is a volume.", latex: `\\rho = ${value}\\,\\frac{\\text{${label.split("/")[0]}}}{\\text{${label.split("/")[1]}}}\\cdot${chain} = ${fx(ans)}\\ \\text{kg/m}^3`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
      note: variant === "g/cm3" ? "Handy: g/cm³ × 1000 = kg/m³ (water is 1000 kg/m³)." : undefined,
    };
  },
};
