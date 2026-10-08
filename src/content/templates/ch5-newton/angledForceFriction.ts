import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, sinD, cosD } from "../helpers";

/**
 * Angled force on a block at rest on a rough floor, with μ_s and μ_k. Check
 * static friction FIRST: if F cos θ ≤ μ_s N the block stays put (a = 0).
 * SI Q20: 7.0 kg, 18 N at 25° below horizontal, μ_s 0.55, μ_k 0.15 → a = 0.
 */
export interface AngledFrictionParams {
  m: number;
  F: number;
  theta: number; // deg
  below: boolean; // force angled below horizontal (push) vs above (pull)
  mus: number;
  muk: number;
}
export function solve(p: AngledFrictionParams): { N: number; fsMax: number; Fpar: number; holds: boolean; a: number } {
  const N = p.m * g + (p.below ? 1 : -1) * p.F * sinD(p.theta);
  const fsMax = p.mus * N;
  const Fpar = p.F * cosD(p.theta);
  const holds = Fpar <= fsMax;
  const a = holds ? 0 : (Fpar - p.muk * N) / p.m;
  return { N, fsMax, Fpar, holds, a };
}

const SKINS = ["a crate", "a box", "a filing cabinet", "a washing machine", "a toolbox"];

export const template: QuestionTemplate = {
  id: "ch5.friction.angled-force",
  topicId: "ch5.friction",
  title: "Angled force with μ_s and μ_k → does it move? acceleration",
  source: "SI Exam 1 Review — Q20 (7.0 kg, 18 N at 25° below, μ_s 0.55, μ_k 0.15 → a = 0)",
  kind: "numeric",
  difficulty: 3,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(SKINS);
    const wantStatic = rng.chance(0.45);
    const p = rejectUntil(
      () => {
        const mus = nice(rng, 0.3, 0.7, 0.05);
        return {
          m: nice(rng, 3, 30, 0.5),
          F: nice(rng, 10, 200, 1),
          theta: rng.pick([15, 20, 25, 30, 35, 40, 45]),
          below: rng.chance(0.5),
          mus,
          muk: nice(rng, 0.1, mus - 0.1, 0.05),
        };
      },
      (c) => {
        const s = solve(c);
        if (s.N <= 0 || c.muk <= 0) return false;
        if (s.holds !== wantStatic) return false;
        if (s.holds) return s.Fpar < 0.9 * s.fsMax; // clearly static, not borderline
        return s.a > 0.3 && s.a < 12;
      },
    );
    const s = solve(p);
    const dir = p.below ? "below" : "above";
    const candidates = s.holds
      ? [
          { errorId: "didnt-check-static", value: Math.abs(s.Fpar - p.muk * s.N) / p.m },
          { errorId: "normal-equals-mg", value: Math.abs(s.Fpar - p.muk * p.m * g) / p.m },
          { errorId: "forgot-friction", value: s.Fpar / p.m },
          { errorId: "ignored-force-angle", value: Math.abs(p.F - p.muk * s.N) / p.m },
          { errorId: "static-vs-kinetic", value: Math.abs(s.Fpar - p.mus * s.N) / p.m },
        ]
      : [
          { errorId: "normal-equals-mg", value: (s.Fpar - p.muk * p.m * g) / p.m },
          { errorId: "static-vs-kinetic", value: (s.Fpar - p.mus * s.N) / p.m },
          { errorId: "forgot-friction", value: s.Fpar / p.m },
          { errorId: "ignored-force-angle", value: (p.F - p.muk * s.N) / p.m },
          { errorId: "vertical-component-sign", value: (s.Fpar - p.muk * (p.m * g - (p.below ? 1 : -1) * p.F * sinD(p.theta))) / p.m },
        ];
    return {
      templateId: this.id,
      seed: rng.seed,
      variant: s.holds ? "static-holds" : "slides",
      prompt: `${cap(skin)} of mass ${q(p.m, "kg")} rests on a horizontal floor. The coefficients of friction are $\\mu_s = ${p.mus}$ and $\\mu_k = ${p.muk}$. A force of ${q(p.F, "N")} is applied at $${p.theta}^\\circ$ ${dir} the horizontal. What is the magnitude of the block's acceleration?`,
      diagram: { kind: "block-force", forces: [{ label: "F", angleDeg: p.below ? -p.theta : p.theta }], rough: true, massLabel: `${p.m} kg`, showNW: true },
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "F", value: p.F, unit: "N" },
        { symbol: "\\theta", value: p.theta, unit: "°", note: `${dir} horizontal` },
        { symbol: "\\mu_s", value: p.mus, unit: "" },
        { symbol: "\\mu_k", value: p.muk, unit: "" },
      ],
      target: { symbol: "a", unit: "m/s²", label: "acceleration" },
      answer: toSigFigs(s.a, 4),
      choices: buildNumericChoices(rng, s.a, candidates),
      equations: ["vec-components", "newton-2", "friction-static", "friction-kinetic"],
      recipe: [
        `ΣF_y = 0 → N = mg ${p.below ? "+" : "−"} F sin θ`,
        "f_s,max = μ_s N",
        "Compare F cos θ with f_s,max: if smaller → a = 0",
        "If it moves: ΣF_x = F cos θ − μ_k N = ma",
      ],
      hints: [
        "The block starts at rest — before computing an acceleration, check whether static friction can hold it.",
        `N is not mg here: the force's vertical component ${p.below ? "pushes down (adds)" : "lifts (subtracts)"}. Then f_s,max = μ_s N vs F cos θ.`,
        `N = ${toSigFigs(s.N, 3)} N, f_s,max = ${toSigFigs(s.fsMax, 3)} N, F cos θ = ${toSigFigs(s.Fpar, 3)} N.`,
      ],
      solution: [
        { text: `Normal force from ΣF_y = 0 (the vertical component of F ${p.below ? "adds to" : "subtracts from"} the weight).`, latex: `N = mg ${p.below ? "+" : "-"} F\\sin\\theta = (${p.m})(9.80) ${p.below ? "+" : "-"} (${p.F})\\sin${p.theta}^\\circ = ${fx(s.N)}\\ \\text{N}`, equationId: "newton-2", value: s.N },
        { text: "Maximum static friction.", latex: `f_{s,\\max} = \\mu_s N = (${p.mus})(${fx(s.N)}) = ${fx(s.fsMax)}\\ \\text{N}`, equationId: "friction-static", value: s.fsMax },
        { text: "Component of the applied force along the floor.", latex: `F_x = F\\cos\\theta = (${p.F})\\cos${p.theta}^\\circ = ${fx(s.Fpar)}\\ \\text{N}`, equationId: "vec-components", value: s.Fpar },
        s.holds
          ? { text: "F_x is less than f_s,max, so static friction holds the block: it does not move.", latex: `${fx(s.Fpar)}\\ \\text{N} < ${fx(s.fsMax)}\\ \\text{N} \;\\Rightarrow\; a = 0`, equationId: "friction-static", value: 0 }
          : { text: "F_x exceeds f_s,max, so the block slides and kinetic friction applies.", latex: `a = \\frac{F\\cos\\theta - \\mu_k N}{m} = \\frac{${fx(s.Fpar)} - (${p.muk})(${fx(s.N)})}{${p.m}} = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: "friction-kinetic", value: toSigFigs(s.a, 4) },
      ],
      note: s.holds ? "Static friction here equals F cos θ (whatever is needed), NOT μ_s N." : undefined,
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
