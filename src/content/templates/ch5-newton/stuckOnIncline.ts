import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, sinD, cosD, tanD, withParts } from "../helpers";

/** Block at rest on a rough incline: f_s = mg sin θ (NOT μ_s N), N = mg cos θ. */
export interface StuckParams {
  m: number;
  theta: number;
  mus: number;
}
export function solve(p: StuckParams): { fs: number; N: number; fsMax: number } {
  const N = p.m * g * cosD(p.theta);
  return { fs: p.m * g * sinD(p.theta), N, fsMax: p.mus * N };
}

export const template: QuestionTemplate = {
  id: "ch5.inclines.stuck",
  topicId: "ch5.inclines",
  title: "Block at rest on a rough incline → f_s and N (multi-part)",
  source: "Ch 6a lecture — static friction 'as long as it does not move, f_s = F'",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const obj = rng.pick(["A crate", "A block", "A skier", "A box", "A car"]);
    const p = rejectUntil(
      () => ({ m: nice(rng, 2, 80, 0.5), theta: rng.pick([10, 12, 15, 18, 20, 22, 25, 28, 30]), mus: nice(rng, 0.4, 0.9, 0.05) }),
      (c) => tanD(c.theta) < 0.85 * c.mus,
    );
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the magnitude of the static friction force on it?",
        target: { symbol: "f_s", unit: "N", label: "static friction force" },
        answer: toSigFigs(s.fs, 4),
        choices: buildNumericChoices(rng, s.fs, [
          { errorId: "static-max-not-needed", value: s.fsMax },
          { errorId: "incline-sin-cos-swap", value: p.m * g * cosD(p.theta) },
          { errorId: "normal-equals-mg", value: p.mus * p.m * g },
          { errorId: "mass-not-weight", value: p.m * sinD(p.theta) },
        ]),
        solution: [
          { text: "First confirm it can stay at rest: the maximum static friction exceeds the gravity component along the slope.", latex: `f_{s,\\max} = \\mu_s mg\\cos\\theta = ${fx(s.fsMax)}\\ \\text{N} > mg\\sin\\theta = ${fx(s.fs)}\\ \\text{N}`, equationId: "friction-static", value: s.fsMax },
          { text: "At rest, friction exactly balances the gravity component along the slope — it is NOT μ_s N unless the block is on the verge of slipping.", latex: `f_s = mg\\sin\\theta = (${p.m})(9.80)\\sin${p.theta}^\\circ = ${fx(s.fs)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(s.fs, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is the normal force from the incline?",
        target: { symbol: "N", unit: "N", label: "normal force" },
        answer: toSigFigs(s.N, 4),
        choices: buildNumericChoices(rng, s.N, [
          { errorId: "normal-equals-mg", value: p.m * g },
          { errorId: "incline-sin-cos-swap", value: p.m * g * sinD(p.theta) },
          { errorId: "mass-not-weight", value: p.m * cosD(p.theta) },
        ]),
        solution: [{ text: "Perpendicular to the incline.", latex: `N = mg\\cos\\theta = (${p.m})(9.80)\\cos${p.theta}^\\circ = ${fx(s.N)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(s.N, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `${obj} of mass ${q(p.m, "kg")} rests motionless on a rough ramp inclined at $${p.theta}^\\circ$. The coefficient of static friction is $\\mu_s = ${p.mus}$.`,
        diagram: { kind: "incline", angleDeg: p.theta, rough: true, massLabel: `${p.m} kg`, caption: "at rest" },
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "\\theta", value: p.theta, unit: "°" },
          { symbol: "\\mu_s", value: p.mus, unit: "", note: "only needed to check it stays put" },
        ],
        equations: ["vec-components", "newton-2", "friction-static"],
        recipe: ["Axes along / perpendicular to the slope", "Along: f_s − mg sin θ = 0", "Perpendicular: N − mg cos θ = 0", "Check f_s ≤ μ_s N"],
        hints: [
          "The block is at rest, so ΣF = 0 along both axes.",
          "Static friction supplies whatever is needed (up to μ_s N). Here it just balances mg sin θ.",
          `mg sin θ = ${toSigFigs(s.fs, 3)} N; μ_s N = ${toSigFigs(s.fsMax, 3)} N.`,
        ],
      },
      parts,
    );
  },
};
