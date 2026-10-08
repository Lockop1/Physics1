import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Energy in kWh and cost: E(kWh) = P(kW) × hours; cost = E × price. 1 kWh = 3.6 × 10⁶ J. */
export function solve(p: { watts: number; hours: number; price: number }): { kwh: number; cost: number; joules: number } {
  const kwh = (p.watts / 1000) * p.hours;
  return { kwh, cost: kwh * p.price, joules: kwh * 3.6e6 };
}

type Variant = "cost" | "joules";
const DEVICES = [
  { name: "a space heater", w: [1000, 1500, 50] },
  { name: "a refrigerator", w: [100, 250, 10] },
  { name: "a desktop computer", w: [150, 400, 10] },
  { name: "an LED TV", w: [50, 150, 5] },
  { name: "a clothes dryer", w: [2000, 5000, 100] },
];

export const template: QuestionTemplate = {
  id: "ch7.power.kwh",
  topicId: "ch7.power",
  title: "Kilowatt-hours: energy used and its cost",
  source: "Ch 7 lecture — 'Kilowatt hours (kW·h)' slide (1 kWh = 3.60 × 10⁶ J)",
  kind: "numeric",
  difficulty: 1,
  variants: ["cost", "joules"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const dev = rng.pick(DEVICES);
    const watts = nice(rng, dev.w[0]!, dev.w[1]!, dev.w[2]!);
    const hours = nice(rng, 1, 24, 0.5);
    const price = nice(rng, 0.1, 0.3, 0.01);
    const s = solve({ watts, hours, price });
    if (variant === "cost") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${cap(dev.name)} rated at ${q(watts, "W")} runs for ${q(hours, "h")}. If electricity costs $${price.toFixed(2)} per kW·h, what does this cost?`,
        givens: [
          { symbol: "P", value: watts, unit: "W" },
          { symbol: "t", value: hours, unit: "h" },
          { symbol: "\\text{price}", value: price, unit: "$/kWh" },
        ],
        target: { symbol: "\\text{cost}", unit: "$", label: "cost" },
        answer: toSigFigs(s.cost, 4),
        choices: buildNumericChoices(rng, s.cost, [
          { errorId: "kwh-units", value: watts * hours * price },
          { errorId: "kwh-units", value: (watts / 1000) * price },
          { errorId: "arithmetic-slip", value: s.cost * 60 },
          { errorId: "ratio-inverted", value: s.kwh / price },
        ]),
        equations: ["power"],
        recipe: ["Convert W → kW (÷1000)", "Energy (kWh) = kW × hours", "Cost = kWh × price"],
        hints: ["A kilowatt-hour is an energy unit: 1 kW running for 1 h.", "kWh = (W/1000) × hours.", `${s.kwh.toFixed(3)} kWh.`],
        solution: [
          { text: "Energy in kilowatt-hours.", latex: `E = \\left(\\frac{${watts}}{1000}\\ \\text{kW}\\right)(${hours}\\ \\text{h}) = ${fx(s.kwh)}\\ \\text{kWh}`, equationId: "power", value: s.kwh },
          { text: "Multiply by the price.", latex: `\\text{cost} = (${fx(s.kwh)})(\\$${price.toFixed(2)}) = \\$${fx(s.cost)}`, value: toSigFigs(s.cost, 4) },
        ],
      };
    }
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${cap(dev.name)} rated at ${q(watts, "W")} runs for ${q(hours, "h")}. How much energy does it use, in joules?`,
      givens: [
        { symbol: "P", value: watts, unit: "W" },
        { symbol: "t", value: hours, unit: "h" },
      ],
      target: { symbol: "E", unit: "J", label: "energy used" },
      answer: toSigFigs(s.joules, 4),
      choices: buildNumericChoices(rng, s.joules, [
        { errorId: "minutes-not-converted", value: watts * hours },
        { errorId: "minutes-not-converted", value: watts * hours * 60 },
        { errorId: "kwh-units", value: s.kwh },
        { errorId: "arithmetic-slip", value: s.joules / 10 },
      ]),
      equations: ["power"],
      recipe: ["E = P Δt", "Convert hours → seconds (×3600)"],
      hints: ["Energy = power × time.", "A watt is a joule per second, so the time must be in seconds.", `Δt = ${hours * 3600} s.`],
      solution: [{ text: "Energy with time in seconds (equivalently kWh × 3.6 × 10⁶ J/kWh).", latex: `E = P\\,\\Delta t = (${watts})(${hours}\\times3600) = ${fx(s.joules)}\\ \\text{J}`, equationId: "power", value: toSigFigs(s.joules, 4) }],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
