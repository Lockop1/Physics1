import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Work an external agent must do to stretch/compress a spring from natural length: +½kx²; variants solve for W, k, or x. */
export function solve(p: { k: number; x: number }): { W: number } {
  return { W: 0.5 * p.k * p.x * p.x };
}

type Variant = "W" | "k" | "x";

export const template: QuestionTemplate = {
  id: "ch7.spring-work.by-agent",
  topicId: "ch7.spring-work",
  title: "Work needed to stretch or compress a spring (½kx²)",
  source: "Ch 7 lecture — spring force graph (area of triangle ½kx²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["W", "k", "x"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const k = nice(rng, 50, 2000, 10);
    const xCm = nice(rng, 2, 40, 0.5);
    const x = xCm / 100;
    const { W } = solve({ k, x });
    const action = rng.pick(["stretch", "compress"]);
    if (variant === "W") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `How much work must you do to ${action} a spring of spring constant ${q(k, "N/m")} by ${q(xCm, "cm")} from its natural length?`,
        givens: [
          { symbol: "k", value: k, unit: "N/m" },
          { symbol: "x", value: xCm, unit: "cm" },
        ],
        target: { symbol: "W", unit: "J", label: "work done on the spring" },
        answer: toSigFigs(W, 4),
        choices: buildNumericChoices(rng, W, [
          { errorId: "spring-work-missing-half", value: k * x * x },
          { errorId: "cm-not-converted", value: 0.5 * k * xCm * xCm },
          { errorId: "forgot-square", value: 0.5 * k * x },
          { errorId: "work-by-vs-on-spring", value: -W },
        ]),
        equations: ["hooke", "work-spring"],
        recipe: ["Convert x to m", "The force grows from 0 to kx: W = ½kx² (triangle area)", "Work by you is positive; work by the spring is −½kx²"],
        hints: ["The force you apply grows from 0 to kx as you stretch it — average force ½kx.", "W = ½kx², with x in meters.", `x = ${x} m.`],
        solution: [{ text: "Area under the F = kx line from 0 to x (equal and opposite to the spring's own work).", latex: `W = \\tfrac12 k x^2 = \\tfrac12(${k})(${x})^2 = ${fx(W)}\\ \\text{J}`, equationId: "work-spring", value: toSigFigs(W, 4) }],
      };
    }
    if (variant === "k") {
      const Wg = toSigFigs(W, 3);
      const kAns = (2 * Wg) / (x * x);
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `It takes ${q(Wg, "J")} of work to ${action} a spring by ${q(xCm, "cm")}. What is the spring constant?`,
        givens: [
          { symbol: "W", value: Wg, unit: "J" },
          { symbol: "x", value: xCm, unit: "cm" },
        ],
        target: { symbol: "k", unit: "N/m", label: "spring constant" },
        answer: toSigFigs(kAns, 4),
        choices: buildNumericChoices(rng, kAns, [
          { errorId: "spring-work-missing-half", value: Wg / (x * x) },
          { errorId: "cm-not-converted", value: (2 * Wg) / (xCm * xCm) },
          { errorId: "forgot-square", value: (2 * Wg) / x },
          { errorId: "arithmetic-slip", value: kAns / 10 },
        ]),
        equations: ["work-spring"],
        recipe: ["W = ½kx² → k = 2W/x²"],
        hints: ["Invert ½kx².", "k = 2W/x² with x in meters.", `x² = ${toSigFigs(x * x, 3)} m².`],
        solution: [{ text: "Solve for k.", latex: `k = \\frac{2W}{x^2} = \\frac{2(${Wg})}{(${x})^2} = ${fx(kAns)}\\ \\text{N/m}`, equationId: "work-spring", value: toSigFigs(kAns, 4) }],
      };
    }
    const Wg = toSigFigs(W, 3);
    const xAnsCm = Math.sqrt((2 * Wg) / k) * 100;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${q(Wg, "J")} of work is done to ${action} a spring of spring constant ${q(k, "N/m")}. By how much (in cm) was it ${action}ed?`,
      givens: [
        { symbol: "W", value: Wg, unit: "J" },
        { symbol: "k", value: k, unit: "N/m" },
      ],
      target: { symbol: "x", unit: "cm", label: "displacement from natural length" },
      answer: toSigFigs(xAnsCm, 4),
      choices: buildNumericChoices(rng, xAnsCm, [
        { errorId: "forgot-sqrt", value: ((2 * Wg) / k) * 100 },
        { errorId: "cm-not-converted", value: Math.sqrt((2 * Wg) / k) },
        { errorId: "spring-work-missing-half", value: Math.sqrt(Wg / k) * 100 },
        { errorId: "arithmetic-slip", value: xAnsCm * 2 },
      ]),
      equations: ["work-spring"],
      recipe: ["x² = 2W/k", "x = √(2W/k), convert to cm"],
      hints: ["Invert ½kx² for x.", "x = √(2W/k) gives meters.", `2W/k = ${toSigFigs((2 * Wg) / k, 3)} m².`],
      solution: [
        { text: "Solve for x.", latex: `x = \\sqrt{\\frac{2W}{k}} = \\sqrt{\\frac{2(${Wg})}{${k}}} = ${fx(Math.sqrt((2 * Wg) / k))}\\ \\text{m}`, equationId: "work-spring", value: Math.sqrt((2 * Wg) / k) },
        { text: "Convert to cm.", latex: `x = ${fx(xAnsCm)}\\ \\text{cm}`, value: toSigFigs(xAnsCm, 4) },
      ],
    };
  },
};
