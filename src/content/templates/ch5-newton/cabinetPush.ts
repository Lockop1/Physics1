import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/**
 * Friend pulls at θ above horizontal with F_pull; what horizontal push just
 * starts the cabinet moving? F_push = μ_s(mg − F_pull sin θ) − F_pull cos θ.
 * Lecture iii: 75.0 kg, 200 N at 25°, μ_s = 0.40 → 79.0 N.
 */
export interface CabinetParams {
  m: number;
  Fpull: number;
  theta: number;
  mus: number;
}
export function solve(p: CabinetParams): { N: number; fsMax: number; Fpush: number } {
  const N = p.m * g - p.Fpull * sinD(p.theta);
  const fsMax = p.mus * N;
  return { N, fsMax, Fpush: fsMax - p.Fpull * cosD(p.theta) };
}

type Variant = "push" | "mu";

export const template: QuestionTemplate = {
  id: "ch5.friction.cabinet-push",
  topicId: "ch5.friction",
  title: "Pull at an angle + push: force to just start moving (μ_s)",
  source: "Ch 6a lecture — Problem iii (75.0 kg, 200 N at 25°, μ_s 0.40 → 79.0 N)",
  kind: "numeric",
  difficulty: 3,
  variants: ["push", "mu"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const obj = rng.pick(["cabinet", "couch", "refrigerator", "dresser", "piano"]);
    const p = rejectUntil(
      () => ({ m: nice(rng, 40, 150, 5), Fpull: nice(rng, 100, 400, 10), theta: rng.pick([15, 20, 25, 30, 35, 40]), mus: nice(rng, 0.3, 0.7, 0.05) }),
      (c) => {
        const s = solve(c);
        return s.N > 0 && s.Fpush > 20 && s.Fpush < 600;
      },
    );
    const s = solve(p);
    const muk = toSigFigs(p.mus - 0.15, 2);
    const base = {
      templateId: this.id,
      seed: rng.seed,
      variant,
      diagram: { kind: "block-force" as const, forces: [{ label: "F_pull", angleDeg: p.theta }, { label: "F_push", angleDeg: 0, scale: 0.6 }], rough: true, massLabel: `${p.m} kg`, showNW: true },
      equations: ["vec-components", "newton-2", "friction-static"],
    };
    if (variant === "push") {
      return {
        ...base,
        prompt: `A friend is trying to pull a ${obj} of mass ${q(p.m, "kg")} across the floor but can't get it to budge. She pulls with ${q(p.Fpull, "N")} at $${p.theta}^\\circ$ above the horizontal. You help by pushing horizontally in the same direction. The coefficients of friction are $\\mu_s = ${p.mus}$ and $\\mu_k = ${muk}$. What force must you exert to just get it moving?`,
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "F_{\\text{pull}}", value: p.Fpull, unit: "N" },
          { symbol: "\\theta", value: p.theta, unit: "°" },
          { symbol: "\\mu_s", value: p.mus, unit: "" },
          { symbol: "\\mu_k", value: muk, unit: "", note: "not needed" },
        ],
        target: { symbol: "F_{\\text{push}}", unit: "N", label: "push needed" },
        answer: toSigFigs(s.Fpush, 4),
        choices: buildNumericChoices(rng, s.Fpush, [
          { errorId: "normal-equals-mg", value: p.mus * p.m * g - p.Fpull * cosD(p.theta) },
          { errorId: "static-vs-kinetic", value: muk * s.N - p.Fpull * cosD(p.theta) },
          { errorId: "vertical-component-sign", value: p.mus * (p.m * g + p.Fpull * sinD(p.theta)) - p.Fpull * cosD(p.theta) },
          { errorId: "ignored-force-angle", value: s.fsMax - p.Fpull },
          { errorId: "sin-cos-swap", value: p.mus * (p.m * g - p.Fpull * cosD(p.theta)) - p.Fpull * sinD(p.theta) },
        ]),
        recipe: ["ΣF_y = 0: N = mg − F_pull sin θ", "On the verge of moving: f_s = f_s,max = μ_s N", "ΣF_x = 0: F_push + F_pull cos θ − μ_s N = 0"],
        hints: [
          "'Just get it moving' means static friction is at its maximum, μ_s N — and the object is still in equilibrium.",
          "The pull's upward component reduces N, which reduces the friction you must overcome.",
          `N = ${toSigFigs(s.N, 3)} N, f_s,max = ${toSigFigs(s.fsMax, 3)} N, pull's horizontal part = ${toSigFigs(p.Fpull * cosD(p.theta), 3)} N.`,
        ],
        solution: [
          { text: "Normal force (the pull lifts a little).", latex: `N = mg - F_{\\text{pull}}\\sin\\theta = (${p.m})(9.80) - (${p.Fpull})\\sin${p.theta}^\\circ = ${fx(s.N)}\\ \\text{N}`, equationId: "newton-2", value: s.N },
          { text: "Maximum static friction (on the verge of slipping).", latex: `f_{s,\\max} = \\mu_s N = (${p.mus})(${fx(s.N)}) = ${fx(s.fsMax)}\\ \\text{N}`, equationId: "friction-static", value: s.fsMax },
          { text: "Horizontal balance just before it moves.", latex: `F_{\\text{push}} = f_{s,\\max} - F_{\\text{pull}}\\cos\\theta = ${fx(s.fsMax)} - (${p.Fpull})\\cos${p.theta}^\\circ = ${fx(s.Fpush)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(s.Fpush, 4) },
        ],
        note: "μ_k was not needed — the question is about the instant it starts to move.",
      };
    }
    // mu: given the push that just moves it, find μ_s
    const Fpush = toSigFigs(s.Fpush, 3);
    const muAns = (Fpush + p.Fpull * cosD(p.theta)) / s.N;
    return {
      ...base,
      prompt: `A friend pulls a ${obj} of mass ${q(p.m, "kg")} with ${q(p.Fpull, "N")} at $${p.theta}^\\circ$ above the horizontal while you push horizontally with ${q(Fpush, "N")}. Together you find this is exactly enough to get it moving. What is the coefficient of static friction?`,
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "F_{\\text{pull}}", value: p.Fpull, unit: "N" },
        { symbol: "\\theta", value: p.theta, unit: "°" },
        { symbol: "F_{\\text{push}}", value: Fpush, unit: "N" },
      ],
      target: { symbol: "\\mu_s", unit: "", label: "coefficient of static friction" },
      answer: toSigFigs(muAns, 4),
      choices: buildNumericChoices(rng, muAns, [
        { errorId: "normal-equals-mg", value: (Fpush + p.Fpull * cosD(p.theta)) / (p.m * g) },
        { errorId: "vertical-component-sign", value: (Fpush + p.Fpull * cosD(p.theta)) / (p.m * g + p.Fpull * sinD(p.theta)) },
        { errorId: "ignored-force-angle", value: (Fpush + p.Fpull) / s.N },
        { errorId: "sin-cos-swap", value: (Fpush + p.Fpull * sinD(p.theta)) / (p.m * g - p.Fpull * cosD(p.theta)) },
      ]),
      recipe: ["N = mg − F_pull sin θ", "At the verge: F_push + F_pull cos θ = μ_s N", "μ_s = (F_push + F_pull cos θ)/N"],
      hints: ["'Exactly enough to get it moving' → f_s = μ_s N.", "Total horizontal push = μ_s N, with N reduced by the pull's vertical part.", `N = ${toSigFigs(s.N, 3)} N.`],
      solution: [
        { text: "Normal force.", latex: `N = mg - F_{\\text{pull}}\\sin\\theta = ${fx(s.N)}\\ \\text{N}`, equationId: "newton-2", value: s.N },
        { text: "Horizontal forces just balance maximum static friction.", latex: `\\mu_s = \\frac{F_{\\text{push}} + F_{\\text{pull}}\\cos\\theta}{N} = \\frac{${Fpush} + (${p.Fpull})\\cos${p.theta}^\\circ}{${fx(s.N)}} = ${fx(muAns)}`, equationId: "friction-static", value: toSigFigs(muAns, 4) },
      ],
    };
  },
};
