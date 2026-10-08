import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Speed conversions. Lecture: 120 km/h → 33.3 m/s; 85.0 mi/h → 137 km/h; 33.0 m/s → 73.8 mi/h. */
export const MI = 1609; // m
export function toMs(value: number, unit: "km/h" | "mi/h" | "km/min" | "ft/s"): number {
  switch (unit) {
    case "km/h":
      return (value * 1000) / 3600;
    case "mi/h":
      return (value * MI) / 3600;
    case "km/min":
      return (value * 1000) / 60;
    case "ft/s":
      return value * 0.3048;
  }
}

type Variant = "kmh-to-ms" | "mph-to-ms" | "kmmin-to-ms" | "ms-to-mph" | "mph-to-kmh";

export const template: QuestionTemplate = {
  id: "e1.units.speed",
  topicId: "e1.units",
  title: "Speed conversions (km/h, mi/h, km/min ↔ m/s)",
  source: "Ch 1–2 lecture — 'Is he speeding?' (85.0 mi/h → 137 km/h; 33.0 m/s → 73.8 mi/h); Problem 1 (120 km/h → 33.3 m/s)",
  kind: "numeric",
  difficulty: 1,
  variants: ["kmh-to-ms", "mph-to-ms", "kmmin-to-ms", "ms-to-mph", "mph-to-kmh"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const thing = rng.pick(["A car", "A train", "A cyclist", "A cheetah", "A drone"]);
    const base = { templateId: this.id, seed: rng.seed, variant, equations: ["unit-conversion"] };
    if (variant === "kmh-to-ms" || variant === "mph-to-ms" || variant === "kmmin-to-ms") {
      const unit = variant === "kmh-to-ms" ? "km/h" : variant === "mph-to-ms" ? "mi/h" : "km/min";
      const v = unit === "km/min" ? nice(rng, 0.5, 3, 0.1) : nice(rng, 30, 150, 5);
      const ans = toMs(v, unit);
      const chain = unit === "km/h" ? `\\frac{1000\\ \\text{m}}{1\\ \\text{km}}\\cdot\\frac{1\\ \\text{h}}{3600\\ \\text{s}}` : unit === "mi/h" ? `\\frac{1609\\ \\text{m}}{1\\ \\text{mi}}\\cdot\\frac{1\\ \\text{h}}{3600\\ \\text{s}}` : `\\frac{1000\\ \\text{m}}{1\\ \\text{km}}\\cdot\\frac{1\\ \\text{min}}{60\\ \\text{s}}`;
      return {
        ...base,
        prompt: `${thing} travels at ${q(v, unit)}. What is its speed in m/s?${unit === "mi/h" ? " (1 mi = 1609 m)" : ""}`,
        givens: [{ symbol: "v", value: v, unit }],
        target: { symbol: "v", unit: "m/s", label: "speed in m/s" },
        answer: toSigFigs(ans, 4),
        choices: buildNumericChoices(rng, ans, [
          { errorId: "unit-conversion-direction", value: unit === "km/h" ? (v * 3600) / 1000 : unit === "mi/h" ? (v * 3600) / MI : (v * 60) / 1000 },
          { errorId: "minutes-not-converted", value: unit === "km/min" ? v * 1000 : (v * 1000) / 60 },
          { errorId: "arithmetic-slip", value: unit === "mi/h" ? (v * 1000) / 3600 : ans * 10 },
          { errorId: "arithmetic-slip", value: v },
        ]),
        recipe: ["Write the chain of ratios equal to 1", "Cancel units: distance unit → m, time unit → s"],
        hints: ["Multiply by fractions equal to 1 that cancel the old units.", `1 ${unit.split("/")[0]} = ${unit.startsWith("km") ? "1000 m" : "1609 m"}; 1 ${unit.split("/")[1]} = ${unit.endsWith("h") ? "3600 s" : "60 s"}.`, unit === "km/h" ? "Shortcut: km/h ÷ 3.6 = m/s." : `${v} × ${unit.startsWith("km") ? 1000 : 1609} / ${unit.endsWith("h") ? 3600 : 60}.`],
        solution: [{ text: "Chain the conversion ratios so the old units cancel.", latex: `v = ${v}\\,\\frac{\\text{${unit.split("/")[0]}}}{\\text{${unit.split("/")[1]}}}\\cdot${chain} = ${fx(ans)}\\ \\text{m/s}`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
      };
    }
    if (variant === "ms-to-mph") {
      const v = nice(rng, 5, 60, 0.5);
      const ans = (v * 3600) / MI;
      return {
        ...base,
        prompt: `${thing} is moving at ${q(v, "m/s")}. What is this in miles per hour? (1 mi = 1609 m)`,
        givens: [{ symbol: "v", value: v, unit: "m/s" }],
        target: { symbol: "v", unit: "mi/h", label: "speed in mi/h" },
        answer: toSigFigs(ans, 4),
        choices: buildNumericChoices(rng, ans, [
          { errorId: "unit-conversion-direction", value: (v * MI) / 3600 },
          { errorId: "minutes-not-converted", value: (v * 60) / MI },
          { errorId: "arithmetic-slip", value: (v * 3600) / 1000 },
          { errorId: "arithmetic-slip", value: ans / 10 },
        ]),
        recipe: ["m → mi (÷1609)", "s → h (×3600)"],
        hints: ["Flip the ratios: meters cancel on the bottom, seconds on the top.", "m/s × (1 mi / 1609 m) × (3600 s / 1 h).", `${v} × 3600 / 1609.`],
        solution: [{ text: "Chain the ratios.", latex: `v = ${v}\\,\\frac{\\text{m}}{\\text{s}}\\cdot\\frac{1\\ \\text{mi}}{1609\\ \\text{m}}\\cdot\\frac{3600\\ \\text{s}}{1\\ \\text{h}} = ${fx(ans)}\\ \\text{mi/h}`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
      };
    }
    const v = nice(rng, 30, 100, 5);
    const ans = v * 1.609;
    return {
      ...base,
      prompt: `A speedometer reads ${q(v, "mi/h")}. What is this in km/h? (1 mi = 1.609 km)`,
      givens: [{ symbol: "v", value: v, unit: "mi/h" }],
      target: { symbol: "v", unit: "km/h", label: "speed in km/h" },
      answer: toSigFigs(ans, 4),
      choices: buildNumericChoices(rng, ans, [
        { errorId: "unit-conversion-direction", value: v / 1.609 },
        { errorId: "arithmetic-slip", value: (v * MI) / 3600 },
        { errorId: "arithmetic-slip", value: v * 1.609 * 1.609 },
        { errorId: "arithmetic-slip", value: ans / 10 },
      ]),
      recipe: ["Only the distance unit changes: mi → km (×1.609)"],
      hints: ["Hours stay hours; only miles become km.", "Multiply by 1.609 km / 1 mi.", `${v} × 1.609.`],
      solution: [{ text: "One ratio, since the time unit is unchanged.", latex: `v = ${v}\\,\\frac{\\text{mi}}{\\text{h}}\\cdot\\frac{1.609\\ \\text{km}}{1\\ \\text{mi}} = ${fx(ans)}\\ \\text{km/h}`, equationId: "unit-conversion", value: toSigFigs(ans, 4) }],
    };
  },
};
