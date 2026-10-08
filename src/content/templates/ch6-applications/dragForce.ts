import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";
import { RHO_AIR } from "./terminalSpeed";

/** Drag force F_D = ½CρAv², and the acceleration of a falling object before terminal speed: a = g − F_D/m. */
export function solve(p: { C: number; A: number; v: number; m: number }): { FD: number; a: number } {
  const FD = 0.5 * p.C * RHO_AIR * p.A * p.v * p.v;
  return { FD, a: g - FD / p.m };
}

type Variant = "force" | "accel";

export const template: QuestionTemplate = {
  id: "ch6.drag.force",
  topicId: "ch6.drag",
  title: "Drag force at a given speed; net acceleration while still speeding up",
  source: "Ch 6b lecture — drag force definition (F_D = ½CρAv²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["force", "accel"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const SKINS = [
      { who: "a cyclist", C: 0.9, A: [0.4, 0.6, 0.05], v: [5, 15, 0.5], m: [60, 90, 1] },
      { who: "a car", C: 0.3, A: [1.8, 2.5, 0.1], v: [15, 35, 1], m: [1000, 1800, 50] },
      { who: "a skydiver", C: 1.0, A: [0.5, 0.9, 0.05], v: [10, 40, 1], m: [60, 95, 1] },
    ];
    const skin = variant === "accel" ? SKINS[2]! : rng.pick(SKINS);
    const C = skin.C;
    const A = nice(rng, skin.A[0]!, skin.A[1]!, skin.A[2]!);
    const v = nice(rng, skin.v[0]!, skin.v[1]!, skin.v[2]!);
    const m = nice(rng, skin.m[0]!, skin.m[1]!, skin.m[2]!);
    const s = solve({ C, A, v, m });
    if (variant === "force" || skin.who !== "a skydiver") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant: "force",
        prompt: `What is the drag force on ${skin.who} moving at ${q(v, "m/s")} through air of density ${q(RHO_AIR, "kg/m³")}? Drag coefficient $C = ${C}$, frontal area ${q(A, "m²")}.`,
        givens: [
          { symbol: "C", value: C, unit: "" },
          { symbol: "\\rho", value: RHO_AIR, unit: "kg/m³" },
          { symbol: "A", value: A, unit: "m²" },
          { symbol: "v", value: v, unit: "m/s" },
        ],
        target: { symbol: "F_D", unit: "N", label: "drag force" },
        answer: toSigFigs(s.FD, 4),
        choices: buildNumericChoices(rng, s.FD, [
          { errorId: "kinematics-missing-half", value: 2 * s.FD },
          { errorId: "forgot-square", value: 0.5 * C * RHO_AIR * A * v },
          { errorId: "arithmetic-slip", value: s.FD / 10 },
          { errorId: "arithmetic-slip", value: s.FD * 4 },
        ]),
        equations: ["drag-force"],
        recipe: ["F_D = ½ C ρ A v²"],
        hints: ["Direct substitution — watch the ½ and the v².", "Doubling the speed quadruples the drag.", `½ × ${C} × ${RHO_AIR} × ${A} × ${v}².`],
        solution: [{ text: "Drag formula.", latex: `F_D = \\tfrac12 C\\rho A v^2 = \\tfrac12(${C})(${RHO_AIR})(${A})(${v})^2 = ${fx(s.FD)}\\ \\text{N}`, equationId: "drag-force", value: toSigFigs(s.FD, 4) }],
      };
    }
    return {
      templateId: this.id,
      seed: rng.seed,
      variant: "accel",
      prompt: `A skydiver of mass ${q(m, "kg")} is falling at ${q(v, "m/s")}, below terminal speed. With $C = ${C}$, frontal area ${q(A, "m²")} and air density ${q(RHO_AIR, "kg/m³")}, what is the skydiver's acceleration at this instant?`,
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "v", value: v, unit: "m/s" },
        { symbol: "C", value: C, unit: "" },
        { symbol: "A", value: A, unit: "m²" },
        { symbol: "\\rho", value: RHO_AIR, unit: "kg/m³" },
      ],
      target: { symbol: "a", unit: "m/s²", label: "acceleration (downward)" },
      answer: toSigFigs(s.a, 4),
      choices: buildNumericChoices(rng, s.a, [
        { errorId: "forgot-friction", value: g },
        { errorId: "terminal-not-equilibrium", value: 0.001 },
        { errorId: "kinematics-missing-half", value: g - (2 * s.FD) / m },
        { errorId: "arithmetic-slip", value: s.FD / m },
      ]),
      equations: ["drag-force", "newton-2", "weight"],
      recipe: ["F_D = ½CρAv² (upward)", "ΣF = mg − F_D = ma", "a = g − F_D/m"],
      hints: ["Two forces: weight down, drag up. Below terminal speed, weight wins.", "a = (mg − F_D)/m.", `F_D = ${fx(s.FD)} N vs mg = ${fx(m * g)} N.`],
      solution: [
        { text: "Drag at this speed.", latex: `F_D = \\tfrac12(${C})(${RHO_AIR})(${A})(${v})^2 = ${fx(s.FD)}\\ \\text{N}`, equationId: "drag-force", value: s.FD },
        { text: "Newton's second law, down positive.", latex: `a = \\frac{mg - F_D}{m} = \\frac{(${m})(9.80) - ${fx(s.FD)}}{${m}} = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: "newton-2", value: toSigFigs(s.a, 4) },
      ],
      note: "As v grows, F_D grows until a = 0 — that is terminal speed.",
    };
  },
};
