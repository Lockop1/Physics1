import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Object pushed straight up by a vertical force → acceleration (sign matters). Lecture: 2.00 kg, 25.0 N → 2.70 m/s². */
export interface PushedUpParams {
  m: number;
  F: number;
}
export function solve(p: PushedUpParams): { a: number } {
  return { a: (p.F - p.m * g) / p.m };
}

type Variant = "a" | "F";
const SKINS = ["A body", "A box", "A toolbox", "A package", "A lantern"];

export const template: QuestionTemplate = {
  id: "ch5.net-force.pushed-up",
  topicId: "ch5.net-force",
  title: "Pushed straight up → acceleration (sign matters)",
  source: "Ch 5 lecture — 2.00 kg pushed up by 25.0 N → 2.70 m/s²",
  kind: "numeric",
  difficulty: 1,
  variants: ["a", "F"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    if (variant === "a") {
      const p = rejectUntil(
        () => ({ m: nice(rng, 1, 12, 0.5), F: nice(rng, 5, 150, 1) }),
        (c) => {
          const a = solve(c).a;
          return Math.abs(a) > 0.4 && Math.abs(a) < 12 && Math.abs(Math.abs(a) - g) > 0.6;
        },
      );
      const { a } = solve(p);
      const down = a < 0;
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} of mass ${q(p.m, "kg")} is pushed straight upward by a ${q(p.F, "N")} vertical force. What is its acceleration? (Take up as positive; ignore air resistance.)`,
        diagram: { kind: "vertical-box", mode: "pushed-up", massLabel: `${p.m} kg`, forceLabel: "F", accel: down ? "down" : "up" },
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "F", value: p.F, unit: "N" },
        ],
        target: { symbol: "a_y", unit: "m/s²", label: "acceleration (up = +)" },
        answer: toSigFigs(a, 4),
        choices: buildNumericChoices(rng, a, [
          { errorId: "pushed-up-forgot-gravity", value: p.F / p.m },
          { errorId: "elevator-sign", value: -a },
          { errorId: "mass-not-weight", value: (p.F - p.m) / p.m },
          { errorId: "elevator-sign", value: (p.F + p.m * g) / p.m },
        ]),
        equations: ["weight", "newton-2"],
        recipe: ["Forces: F up, mg down", "ΣF_y = F − mg = m a_y", "a_y = (F − mg)/m — negative means it accelerates downward"],
        hints: [
          "Two vertical forces act: the push and the weight.",
          "ΣF_y = F − mg = m a. The sign of the result tells you the direction.",
          `mg = ${toSigFigs(p.m * g, 3)} N, so ΣF = ${p.F} − ${toSigFigs(p.m * g, 3)}.`,
        ],
        solution: [
          { text: "Weight of the object.", latex: `mg = (${p.m})(9.80) = ${fx(p.m * g)}\\ \\text{N}`, equationId: "weight", value: p.m * g },
          {
            text: down ? "Net force is downward (the push is smaller than the weight), so the acceleration is negative." : "Net force is upward, so the acceleration is positive (upward).",
            latex: `a_y = \\frac{F - mg}{m} = \\frac{${p.F} - ${fx(p.m * g)}}{${p.m}} = ${fx(a)}\\ \\text{m/s}^2`,
            equationId: "newton-2",
            value: toSigFigs(a, 4),
          },
        ],
        note: down ? "A push smaller than the weight still produces a downward acceleration smaller than g — the object is 'falling, but slowed'." : undefined,
      };
    }
    // F: force needed for a given upward acceleration
    const m = nice(rng, 1, 40, 0.5);
    const a = nice(rng, 0.5, 6, 0.1);
    const F = m * (g + a);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${skin} of mass ${q(m, "kg")} must be lifted straight up with an upward acceleration of ${q(a, "m/s²")}. What vertical force is required?`,
      diagram: { kind: "vertical-box", mode: "pushed-up", massLabel: `${m} kg`, forceLabel: "F", accel: "up" },
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "a", value: a, unit: "m/s²" },
      ],
      target: { symbol: "F", unit: "N", label: "required force" },
      answer: toSigFigs(F, 4),
      choices: buildNumericChoices(rng, F, [
        { errorId: "pushed-up-forgot-gravity", value: m * a },
        { errorId: "elevator-sign", value: m * (g - a) },
        { errorId: "tension-equals-weight", value: m * g },
        { errorId: "mass-not-weight", value: m + a },
      ]),
      equations: ["weight", "newton-2"],
      recipe: ["ΣF_y = F − mg = ma", "F = m(g + a)"],
      hints: ["The force must beat gravity AND provide the acceleration.", "F − mg = ma → F = m(g + a).", `${m}(9.80 + ${a}).`],
      solution: [{ text: "Solve ΣF_y = ma for F.", latex: `F = m(g + a) = (${m})(9.80 + ${a}) = ${fx(F)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(F, 4) }],
    };
  },
};
