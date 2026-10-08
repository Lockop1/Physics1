import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Terminal speed: mg = ½CρAv² → v_t = √(2mg/(CρA)). */
export const RHO_AIR = 1.2;
export function solve(p: { m: number; C: number; A: number; rho?: number }): { vt: number } {
  return { vt: Math.sqrt((2 * p.m * g) / (p.C * (p.rho ?? RHO_AIR) * p.A)) };
}

type Variant = "vt" | "area";
const SKINS = [
  { who: "a skydiver (spread-eagle)", m: [60, 95, 1], C: 1.0, A: [0.6, 1.0, 0.05] },
  { who: "a skydiver (head-down)", m: [60, 95, 1], C: 0.7, A: [0.1, 0.2, 0.01] },
  { who: "a baseball", m: [0.14, 0.15, 0.005], C: 0.35, A: [0.0042, 0.0045, 0.0001] },
  { who: "a raindrop", m: [0.00003, 0.0001, 0.00001], C: 0.5, A: [0.000005, 0.00002, 0.000001] },
];

export const template: QuestionTemplate = {
  id: "ch6.drag.terminal-speed",
  topicId: "ch6.drag",
  title: "Terminal speed from drag = weight",
  source: "Ch 6b lecture — 6.4 Drag force and terminal speed (F_D = ½CρAv²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["vt", "area"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const m = toSigFigs(nice(rng, skin.m[0]!, skin.m[1]!, skin.m[2]!), 3);
    const A = toSigFigs(nice(rng, skin.A[0]!, skin.A[1]!, skin.A[2]!), 3);
    const C = skin.C;
    const { vt } = solve({ m, C, A });
    if (variant === "vt") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `Estimate the terminal speed of ${skin.who} of mass ${q(m, "kg")} with drag coefficient $C = ${C}$ and cross-sectional area ${q(A, "m²")}. Take the density of air as ${q(RHO_AIR, "kg/m³")}.`,
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "C", value: C, unit: "" },
          { symbol: "A", value: A, unit: "m²" },
          { symbol: "\\rho", value: RHO_AIR, unit: "kg/m³" },
        ],
        target: { symbol: "v_t", unit: "m/s", label: "terminal speed" },
        answer: toSigFigs(vt, 4),
        choices: buildNumericChoices(rng, vt, [
          { errorId: "forgot-sqrt", value: (2 * m * g) / (C * RHO_AIR * A) },
          { errorId: "mass-not-weight", value: Math.sqrt((2 * m) / (C * RHO_AIR * A)) },
          { errorId: "terminal-not-equilibrium", value: Math.sqrt((m * g) / (C * RHO_AIR * A)) },
          { errorId: "arithmetic-slip", value: vt * 2 },
        ]),
        equations: ["drag-force", "newton-2", "weight", "terminal-speed"],
        recipe: ["At terminal speed a = 0: F_D = mg", "½CρA v_t² = mg", "v_t = √(2mg/(CρA))"],
        hints: ["'Terminal' means the velocity has stopped changing — the forces balance.", "Set the drag force equal to the weight and solve for v.", `2mg/(CρA) = ${fx((2 * m * g) / (C * RHO_AIR * A))} m²/s².`],
        solution: [
          { text: "Equilibrium between drag (up) and weight (down).", latex: `\\tfrac12 C\\rho A v_t^2 = mg`, equationId: "newton-2" },
          { text: "Solve for v_t.", latex: `v_t = \\sqrt{\\frac{2mg}{C\\rho A}} = \\sqrt{\\frac{2(${m})(9.80)}{(${C})(${RHO_AIR})(${A})}} = ${fx(vt)}\\ \\text{m/s}`, equationId: "terminal-speed", value: toSigFigs(vt, 4) },
        ],
      };
    }
    const vtGiven = toSigFigs(vt, 3);
    const AAns = (2 * m * g) / (C * RHO_AIR * vtGiven * vtGiven);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${skin.who.charAt(0).toUpperCase() + skin.who.slice(1)} of mass ${q(m, "kg")} falls at a terminal speed of ${q(vtGiven, "m/s")} with drag coefficient $C = ${C}$ in air of density ${q(RHO_AIR, "kg/m³")}. What is the cross-sectional area presented to the air?`,
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "v_t", value: vtGiven, unit: "m/s" },
        { symbol: "C", value: C, unit: "" },
        { symbol: "\\rho", value: RHO_AIR, unit: "kg/m³" },
      ],
      target: { symbol: "A", unit: "m²", label: "cross-sectional area" },
      answer: toSigFigs(AAns, 4),
      choices: buildNumericChoices(rng, AAns, [
        { errorId: "forgot-square", value: (2 * m * g) / (C * RHO_AIR * vtGiven) },
        { errorId: "mass-not-weight", value: (2 * m) / (C * RHO_AIR * vtGiven * vtGiven) },
        { errorId: "terminal-not-equilibrium", value: (m * g) / (C * RHO_AIR * vtGiven * vtGiven) },
        { errorId: "arithmetic-slip", value: AAns * 10 },
      ]),
      equations: ["drag-force", "terminal-speed"],
      recipe: ["mg = ½CρA v_t²", "A = 2mg/(Cρ v_t²)"],
      hints: ["Same balance, solved for A.", "A = 2mg/(Cρv_t²).", `2mg = ${fx(2 * m * g)} N.`],
      solution: [{ text: "Solve the terminal-speed balance for the area.", latex: `A = \\frac{2mg}{C\\rho v_t^2} = \\frac{2(${m})(9.80)}{(${C})(${RHO_AIR})(${vtGiven})^2} = ${fx(AAns)}\\ \\text{m}^2`, equationId: "terminal-speed", value: toSigFigs(AAns, 4) }],
    };
  },
};
