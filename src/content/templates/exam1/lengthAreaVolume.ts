import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Length, area, volume and time conversions. Lecture: 15.0 in → 38.1 cm; 38 km → 38 000 m; 60 000 ms in a minute; 12.71 m × 3.46 m → 44.0 m². */
type Variant = "length" | "area" | "volume" | "time";

export function convertLength(v: number, from: "in" | "ft" | "km" | "mm" | "mi"): number {
  const f: Record<string, number> = { in: 0.0254, ft: 0.3048, km: 1000, mm: 0.001, mi: 1609 };
  return v * f[from]!;
}

export const template: QuestionTemplate = {
  id: "e1.units.length-area-volume",
  topicId: "e1.units",
  title: "Length, area, volume and time conversions (the squared/cubed trap)",
  source: "Ch 1–2 lecture — CQ #1 (38 km), ABCD (ms in a minute), 15.0 in → 38.1 cm",
  kind: "numeric",
  difficulty: 1,
  variants: ["length", "area", "volume", "time"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const base = { templateId: this.id, seed: rng.seed, variant, equations: ["unit-conversion"] };
    if (variant === "length") {
      const from = rng.pick(["in", "ft", "km", "mm", "mi"] as const);
      const v = from === "km" || from === "mi" ? nice(rng, 1, 120, 0.5) : nice(rng, 2, 200, 0.5);
      const toCm = from === "in" || from === "ft";
      const ans = toCm ? convertLength(v, from) * 100 : convertLength(v, from);
      const unitOut = toCm ? "cm" : "m";
      const factor = toCm ? (from === "in" ? 2.54 : 30.48) : from === "km" ? 1000 : from === "mm" ? 0.001 : 1609;
      return {
        ...base,
        prompt: `Convert ${q(v, from)} to ${unitOut}. (1 in = 2.54 cm, 1 ft = 30.48 cm, 1 mi = 1609 m)`,
        givens: [{ symbol: "L", value: v, unit: from }],
        target: { symbol: "L", unit: unitOut, label: `length in ${unitOut}` },
        answer: toSigFigs(ans, 4),
        choices: buildNumericChoices(rng, ans, [
          { errorId: "unit-conversion-direction", value: v / factor },
          { errorId: "arithmetic-slip", value: ans * 10 },
          { errorId: "arithmetic-slip", value: ans / 10 },
          { errorId: "arithmetic-slip", value: v },
        ]),
        recipe: [`Multiply by (${factor} ${unitOut} / 1 ${from})`],
        hints: ["Multiply by a ratio equal to 1 whose bottom cancels the old unit.", `1 ${from} = ${factor} ${unitOut}.`, `${v} × ${factor}.`],
        solution: [{ text: "One ratio.", latex: `L = ${v}\\ \\text{${from}}\\cdot\\frac{${factor}\\ \\text{${unitOut}}}{1\\ \\text{${from}}} = ${fx(ans)}\\ \\text{${unitOut}}`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
      };
    }
    if (variant === "area") {
      const from = rng.pick(["cm", "mm", "km", "in"] as const);
      const v = nice(rng, 2, 500, 0.5);
      const lin: Record<string, number> = { cm: 0.01, mm: 0.001, km: 1000, in: 0.0254 };
      const ans = v * lin[from]! * lin[from]!;
      return {
        ...base,
        prompt: `A rectangle has an area of ${q(v, from + "²")}. What is its area in m²?`,
        givens: [{ symbol: "A", value: v, unit: from + "²" }],
        target: { symbol: "A", unit: "m²", label: "area in m²" },
        answer: toSigFigs(ans, 4),
        choices: buildNumericChoices(rng, ans, [
          { errorId: "linear-conversion-on-area-volume", value: v * lin[from]! },
          { errorId: "unit-conversion-direction", value: v / (lin[from]! * lin[from]!) },
          { errorId: "arithmetic-slip", value: v * lin[from]! * lin[from]! * lin[from]! },
          { errorId: "arithmetic-slip", value: ans * 10 },
        ]),
        recipe: ["Square the length ratio: (1 m / 100 cm)²"],
        hints: ["Area has length², so the conversion ratio is squared.", `1 ${from}² = (${lin[from]} m)².`, `${v} × (${lin[from]})².`],
        solution: [{ text: "Square the ratio because the unit is squared.", latex: `A = ${v}\\ \\text{${from}}^2\\cdot\\left(\\frac{${lin[from]}\\ \\text{m}}{1\\ \\text{${from}}}\\right)^{2} = ${fx(ans)}\\ \\text{m}^2`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
      };
    }
    if (variant === "volume") {
      const from = rng.pick(["cm", "mm", "L", "in"] as const);
      const v = nice(rng, 2, 900, 0.5);
      const cube: Record<string, number> = { cm: 1e-6, mm: 1e-9, L: 1e-3, in: 0.0254 ** 3 };
      const lin: Record<string, number> = { cm: 0.01, mm: 0.001, L: 0.1, in: 0.0254 };
      const ans = v * cube[from]!;
      const unitIn = from === "L" ? "L" : from + "³";
      return {
        ...base,
        prompt: `A container holds ${q(v, unitIn)}. What is its volume in m³?${from === "L" ? " (1 L = 1000 cm³)" : ""}`,
        givens: [{ symbol: "V", value: v, unit: unitIn }],
        target: { symbol: "V", unit: "m³", label: "volume in m³" },
        answer: toSigFigs(ans, 4),
        choices: buildNumericChoices(rng, ans, [
          { errorId: "linear-conversion-on-area-volume", value: v * lin[from]! },
          { errorId: "linear-conversion-on-area-volume", value: v * lin[from]! * lin[from]! },
          { errorId: "unit-conversion-direction", value: v / cube[from]! },
          { errorId: "arithmetic-slip", value: ans * 1000 },
        ]),
        recipe: ["Cube the length ratio: (1 m / 100 cm)³"],
        hints: ["Volume has length³, so the ratio is cubed.", from === "L" ? "1 L = 1000 cm³ = 10⁻³ m³." : `1 ${from}³ = (${lin[from]} m)³ = ${cube[from]} m³.`, `${v} × ${cube[from]}.`],
        solution: [{ text: "Cube the ratio because the unit is cubed.", latex: `V = ${v}\\ \\text{${unitIn}} \\cdot ${from === "L" ? "\\frac{10^{-3}\\ \\text{m}^3}{1\\ \\text{L}}" : `\\left(\\frac{${lin[from]}\\ \\text{m}}{1\\ \\text{${from}}}\\right)^{3}`} = ${fx(ans)}\\ \\text{m}^3`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
      };
    }
    const kind = rng.pick(["ms-in-min", "min-to-s", "h-to-s", "day-to-s"] as const);
    const n = kind === "ms-in-min" ? nice(rng, 1, 10, 1) : kind === "min-to-s" ? nice(rng, 1.5, 45, 0.5) : kind === "h-to-s" ? nice(rng, 0.5, 12, 0.25) : nice(rng, 1, 7, 1);
    const ans = kind === "ms-in-min" ? n * 60000 : kind === "min-to-s" ? n * 60 : kind === "h-to-s" ? n * 3600 : n * 86400;
    const text = kind === "ms-in-min" ? `How many milliseconds are in ${q(n, "min")}?` : kind === "min-to-s" ? `Convert ${q(n, "min")} to seconds.` : kind === "h-to-s" ? `Convert ${q(n, "h")} to seconds.` : `How many seconds are in ${q(n, "day")}${n > 1 ? "s" : ""}?`;
    const unitOut = kind === "ms-in-min" ? "ms" : "s";
    return {
      ...base,
      prompt: text,
      givens: [{ symbol: "t", value: n, unit: kind === "ms-in-min" || kind === "min-to-s" ? "min" : kind === "h-to-s" ? "h" : "day" }],
      target: { symbol: "t", unit: unitOut, label: `time in ${unitOut}` },
      answer: toSigFigs(ans, 4),
      choices: buildNumericChoices(rng, ans, [
        { errorId: "minutes-not-converted", value: kind === "ms-in-min" ? n * 1000 : kind === "h-to-s" ? n * 60 : kind === "day-to-s" ? n * 3600 : n },
        { errorId: "unit-conversion-direction", value: kind === "ms-in-min" ? n / 60000 : ans / (kind === "min-to-s" ? 3600 : 1000) },
        { errorId: "arithmetic-slip", value: ans * 10 },
        { errorId: "arithmetic-slip", value: ans / 10 },
      ]),
      recipe: ["Chain the time ratios (60 s/min, 60 min/h, 24 h/day, 1000 ms/s)"],
      hints: ["Convert step by step through the units you know.", kind === "ms-in-min" ? "1 min = 60 s and 1 s = 1000 ms." : kind === "h-to-s" ? "1 h = 60 min = 3600 s." : kind === "day-to-s" ? "1 day = 24 h = 86 400 s." : "1 min = 60 s.", `${n} × ${ans / n}.`],
      solution: [{ text: "Chain the ratios.", latex: `t = ${n} \\times ${ans / n} = ${fx(ans)}\\ \\text{${unitOut}}`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
    };
  },
};
