import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Sliding to a stop on a rough floor: −μ_k mg d = 0 − ½mv² → d = v²/(2μ_k g); or μ_k from d. */
export function solve(p: { v: number; muk: number }): { d: number } {
  return { d: (p.v * p.v) / (2 * p.muk * g) };
}

type Variant = "d" | "mu";
const SKINS = ["A hockey puck", "A sliding book", "A curling stone", "A car with locked brakes", "A box"];

export const template: QuestionTemplate = {
  id: "ch7.work-energy.friction-stop",
  topicId: "ch7.work-energy",
  title: "Sliding to a stop: distance ↔ μ_k via work–energy",
  source: "Ch 7 lecture — work done by friction + work–energy theorem",
  kind: "numeric",
  difficulty: 2,
  variants: ["d", "mu"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const m = skin.includes("car") ? nice(rng, 800, 1500, 50) : nice(rng, 0.5, 50, 0.5);
    const v = nice(rng, 2, 30, 0.5);
    const muk = nice(rng, 0.05, 0.6, 0.01);
    const { d } = solve({ v, muk });
    if (variant === "d") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} of mass ${q(m, "kg")} slides across a horizontal surface with an initial speed of ${q(v, "m/s")}. The coefficient of kinetic friction is ${q(muk, "")}. How far does it slide before stopping?`,
        givens: [
          { symbol: "m", value: m, unit: "kg", note: "not needed" },
          { symbol: "v_i", value: v, unit: "m/s" },
          { symbol: "\\mu_k", value: muk, unit: "" },
        ],
        target: { symbol: "d", unit: "m", label: "stopping distance" },
        answer: toSigFigs(d, 4),
        choices: buildNumericChoices(rng, d, [
          { errorId: "kinematics-missing-half", value: (v * v) / (muk * g) },
          { errorId: "forgot-square", value: v / (2 * muk * g) },
          { errorId: "mass-not-weight", value: (v * v) / (2 * muk * m) },
          { errorId: "arithmetic-slip", value: d / 2 },
        ]),
        equations: ["friction-kinetic", "work-friction", "work-energy"],
        recipe: ["f_k = μ_k mg (N = mg)", "W_f = −μ_k mg d", "W_net = ΔK: −μ_k mg d = 0 − ½mv²", "d = v²/(2μ_k g)"],
        hints: ["Friction is the only force doing work; it removes all the kinetic energy.", "−μ_k mg d = −½mv². The mass cancels.", `d = ${v}²/(2 × ${muk} × 9.80).`],
        solution: [
          { text: "Friction's work equals the loss of kinetic energy.", latex: `-\\mu_k m g\\, d = 0 - \\tfrac12 m v^2`, equationId: "work-energy" },
          { text: "Solve (mass cancels).", latex: `d = \\frac{v^2}{2\\mu_k g} = \\frac{(${v})^2}{2(${muk})(9.80)} = ${fx(d)}\\ \\text{m}`, equationId: "work-friction", value: toSigFigs(d, 4) },
        ],
        note: "Stopping distance grows with v² — doubling the speed quadruples it.",
      };
    }
    const dGiven = toSigFigs(d, 3);
    const muAns = (v * v) / (2 * g * dGiven);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${skin} of mass ${q(m, "kg")} slides ${q(dGiven, "m")} across a horizontal floor before coming to rest from an initial speed of ${q(v, "m/s")}. What is the coefficient of kinetic friction?`,
      givens: [
        { symbol: "m", value: m, unit: "kg", note: "not needed" },
        { symbol: "v_i", value: v, unit: "m/s" },
        { symbol: "d", value: dGiven, unit: "m" },
      ],
      target: { symbol: "\\mu_k", unit: "", label: "coefficient of kinetic friction" },
      answer: toSigFigs(muAns, 4),
      choices: buildNumericChoices(rng, muAns, [
        { errorId: "kinematics-missing-half", value: (v * v) / (g * dGiven) },
        { errorId: "forgot-square", value: v / (2 * g * dGiven) },
        { errorId: "ratio-inverted", value: 1 / muAns },
        { errorId: "arithmetic-slip", value: muAns / 2 },
      ]),
      equations: ["work-friction", "work-energy"],
      recipe: ["−μ_k mg d = −½mv²", "μ_k = v²/(2gd)"],
      hints: ["Same energy balance as the stopping-distance problem.", "Solve for μ_k.", `${v}²/(2 × 9.80 × ${dGiven}).`],
      solution: [{ text: "Energy balance solved for μ_k.", latex: `\\mu_k = \\frac{v^2}{2 g d} = \\frac{(${v})^2}{2(9.80)(${dGiven})} = ${fx(muAns)}`, equationId: "work-energy", value: toSigFigs(muAns, 4) }],
    };
  },
};
