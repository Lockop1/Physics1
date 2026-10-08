import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Hooke's law F = kx with x given in cm. Lecture: k = 50 N/m, x = 1 cm → 0.5 N. */
export function solve(p: { k: number; xM: number }): { F: number } {
  return { F: p.k * p.xM };
}

type Variant = "F" | "k" | "x";

export const template: QuestionTemplate = {
  id: "ch5.springs.hooke",
  topicId: "ch5.springs",
  title: "Hooke's law basics (cm → m trap)",
  source: "Ch 5 lecture — spring slide (k = 50 N/m, x = 1 cm → 0.5 N)",
  kind: "numeric",
  difficulty: 1,
  variants: ["F", "k", "x"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const k = nice(rng, 20, 800, 10);
    const xCm = nice(rng, 0.5, 25, 0.5);
    const xM = xCm / 100;
    const { F } = solve({ k, xM });
    const action = rng.pick(["stretched", "compressed"]);
    if (variant === "F") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A spring with spring constant ${q(k, "N/m")} is ${action} by ${q(xCm, "cm")} from its natural length. What is the magnitude of the spring force?`,
        givens: [
          { symbol: "k", value: k, unit: "N/m" },
          { symbol: "x", value: xCm, unit: "cm" },
        ],
        target: { symbol: "F_s", unit: "N", label: "spring force" },
        answer: toSigFigs(F, 4),
        choices: buildNumericChoices(rng, F, [
          { errorId: "cm-not-converted", value: k * xCm },
          { errorId: "arithmetic-slip", value: k / xM },
          { errorId: "unit-conversion-direction", value: k * xCm * 100 },
        ]),
        equations: ["hooke"],
        recipe: ["Convert x to meters", "|F_s| = kx"],
        hints: ["Hooke's law relates force, spring constant and displacement.", "k is in N/m, so x must be in meters.", `x = ${xM} m.`],
        solution: [
          { text: "Convert the displacement.", latex: `x = ${xCm}\\ \\text{cm} = ${xM}\\ \\text{m}` },
          { text: "Hooke's law (magnitude; the force points back toward equilibrium).", latex: `|F_s| = kx = (${k})(${xM}) = ${fx(F)}\\ \\text{N}`, equationId: "hooke", value: toSigFigs(F, 4) },
        ],
      };
    }
    if (variant === "k") {
      const Fs = toSigFigs(F, 3);
      const kAns = Fs / xM;
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A force of ${q(Fs, "N")} ${action === "stretched" ? "stretches" : "compresses"} a spring by ${q(xCm, "cm")}. What is the spring constant?`,
        givens: [
          { symbol: "F", value: Fs, unit: "N" },
          { symbol: "x", value: xCm, unit: "cm" },
        ],
        target: { symbol: "k", unit: "N/m", label: "spring constant" },
        answer: toSigFigs(kAns, 4),
        choices: buildNumericChoices(rng, kAns, [
          { errorId: "cm-not-converted", value: Fs / xCm },
          { errorId: "arithmetic-slip", value: Fs * xM },
          { errorId: "unit-conversion-direction", value: Fs / (xCm * 100) },
        ]),
        equations: ["hooke"],
        recipe: ["Convert x to meters", "k = F/x"],
        hints: ["k is force per unit stretch.", "k = F/x with x in meters.", `${Fs} / ${xM}.`],
        solution: [{ text: "Rearrange Hooke's law.", latex: `k = \\frac{F}{x} = \\frac{${Fs}}{${xM}} = ${fx(kAns)}\\ \\text{N/m}`, equationId: "hooke", value: toSigFigs(kAns, 4) }],
      };
    }
    const Fs = toSigFigs(F, 3);
    const xAnsCm = (Fs / k) * 100;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A spring with spring constant ${q(k, "N/m")} is pulled with a force of ${q(Fs, "N")}. How far does it stretch, in centimeters?`,
      givens: [
        { symbol: "k", value: k, unit: "N/m" },
        { symbol: "F", value: Fs, unit: "N" },
      ],
      target: { symbol: "x", unit: "cm", label: "stretch" },
      answer: toSigFigs(xAnsCm, 4),
      choices: buildNumericChoices(rng, xAnsCm, [
        { errorId: "cm-not-converted", value: Fs / k },
        { errorId: "arithmetic-slip", value: (k / Fs) * 100 },
        { errorId: "unit-conversion-direction", value: (Fs / k) / 100 },
      ]),
      equations: ["hooke"],
      recipe: ["x = F/k (meters)", "Convert to cm"],
      hints: ["Solve Hooke's law for x.", "x = F/k gives meters; the question wants cm.", `${Fs}/${k} m × 100.`],
      solution: [
        { text: "Stretch in meters.", latex: `x = \\frac{F}{k} = \\frac{${Fs}}{${k}} = ${fx(Fs / k)}\\ \\text{m}`, equationId: "hooke", value: Fs / k },
        { text: "Convert to centimeters.", latex: `x = ${fx(xAnsCm)}\\ \\text{cm}`, value: toSigFigs(xAnsCm, 4) },
      ],
    };
  },
};
