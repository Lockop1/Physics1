import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** P = W/Δt with W = F d. Lecture: 75 N, 42 m, 3.0 min → 18 W. */
export function solve(p: { F: number; d: number; tSec: number }): { W: number; P: number } {
  const W = p.F * p.d;
  return { W, P: W / p.tSec };
}

type Variant = "P" | "t" | "W";

export const template: QuestionTemplate = {
  id: "ch7.power.average",
  topicId: "ch7.power",
  title: "Average power P = W/Δt (time in minutes)",
  source: "Ch 7 lecture — 'Problem solving (Power)': child pulls a wagon (75 N, 42 m, 3.0 min → 18 W)",
  kind: "numeric",
  difficulty: 1,
  variants: ["P", "t", "W"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(["A child pulls a wagon", "A worker drags a crate", "A dog pulls a sled", "A cyclist pushes a stalled car"]);
    const F = nice(rng, 20, 400, 5);
    const d = nice(rng, 10, 200, 1);
    const tMin = nice(rng, 0.5, 10, 0.5);
    const tSec = tMin * 60;
    const { W, P } = solve({ F, d, tSec });
    if (variant === "P") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} with a horizontal force of ${q(F, "N")}. It moves horizontally a total of ${q(d, "m")} in ${q(tMin, "min")}. What average power does this force deliver?`,
        givens: [
          { symbol: "F", value: F, unit: "N" },
          { symbol: "d", value: d, unit: "m" },
          { symbol: "\\Delta t", value: tMin, unit: "min" },
        ],
        target: { symbol: "P", unit: "W", label: "average power" },
        answer: toSigFigs(P, 4),
        choices: buildNumericChoices(rng, P, [
          { errorId: "minutes-not-converted", value: W / tMin },
          { errorId: "arithmetic-slip", value: F / tSec },
          { errorId: "ratio-inverted", value: tSec / W },
          { errorId: "arithmetic-slip", value: P * 10 },
        ]),
        equations: ["work-const", "power"],
        recipe: ["W = F d (force along the motion)", "Convert minutes → seconds", "P = W/Δt"],
        hints: ["Power is work per unit time, in J/s = W.", "Compute the work first, then divide by the time in SECONDS.", `W = ${fx(W)} J, Δt = ${tSec} s.`],
        solution: [
          { text: "Work done.", latex: `W = Fd = (${F})(${d}) = ${fx(W)}\\ \\text{J}`, equationId: "work-const", value: W },
          { text: "Average power with the time in seconds.", latex: `P = \\frac{W}{\\Delta t} = \\frac{${fx(W)}}{${tMin}\\times60} = ${fx(P)}\\ \\text{W}`, equationId: "power", value: toSigFigs(P, 4) },
        ],
      };
    }
    if (variant === "t") {
      const Pg = toSigFigs(P, 3);
      const tAns = W / Pg;
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A motor delivering an average power of ${q(Pg, "W")} pulls a load with a force of ${q(F, "N")} over a distance of ${q(d, "m")}. How long does this take, in seconds?`,
        givens: [
          { symbol: "P", value: Pg, unit: "W" },
          { symbol: "F", value: F, unit: "N" },
          { symbol: "d", value: d, unit: "m" },
        ],
        target: { symbol: "\\Delta t", unit: "s", label: "time" },
        answer: toSigFigs(tAns, 4),
        choices: buildNumericChoices(rng, tAns, [
          { errorId: "ratio-inverted", value: Pg / W },
          { errorId: "arithmetic-slip", value: tAns / 60 },
          { errorId: "arithmetic-slip", value: d / Pg },
          { errorId: "arithmetic-slip", value: tAns * 2 },
        ]),
        equations: ["work-const", "power"],
        recipe: ["W = F d", "Δt = W/P"],
        hints: ["Rearrange P = W/Δt.", "Δt = Fd/P.", `W = ${fx(W)} J.`],
        solution: [{ text: "Time from work and power.", latex: `\\Delta t = \\frac{W}{P} = \\frac{(${F})(${d})}{${Pg}} = ${fx(tAns)}\\ \\text{s}`, equationId: "power", value: toSigFigs(tAns, 4) }],
      };
    }
    const Pg = toSigFigs(P, 3);
    const Wans = Pg * tSec;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A machine runs at an average power of ${q(Pg, "W")} for ${q(tMin, "min")}. How much work does it do?`,
      givens: [
        { symbol: "P", value: Pg, unit: "W" },
        { symbol: "\\Delta t", value: tMin, unit: "min" },
      ],
      target: { symbol: "W", unit: "J", label: "work" },
      answer: toSigFigs(Wans, 4),
      choices: buildNumericChoices(rng, Wans, [
        { errorId: "minutes-not-converted", value: Pg * tMin },
        { errorId: "ratio-inverted", value: Pg / tSec },
        { errorId: "arithmetic-slip", value: Wans / 10 },
        { errorId: "arithmetic-slip", value: Wans * 2 },
      ]),
      equations: ["power"],
      recipe: ["Convert minutes → seconds", "W = P Δt"],
      hints: ["W = P × Δt.", "Seconds, not minutes.", `Δt = ${tSec} s.`],
      solution: [{ text: "Work from power and time.", latex: `W = P\\,\\Delta t = (${Pg})(${tMin}\\times60) = ${fx(Wans)}\\ \\text{J}`, equationId: "power", value: toSigFigs(Wans, 4) }],
    };
  },
};
