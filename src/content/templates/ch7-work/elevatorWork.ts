import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Elevator lifted at constant speed with friction f: W_cable = (mg + f)h, W_gravity = −mgh, W_net = 0. Lecture #25: 1500 kg, 40.0 m, 100 N → 592 kJ, −588 kJ, 0. */
export function solve(p: { m: number; h: number; f: number }): { Wcable: number; Wg: number; Wnet: number } {
  const Wcable = (p.m * g + p.f) * p.h;
  const Wg = -p.m * g * p.h;
  return { Wcable, Wg, Wnet: Wcable + Wg - p.f * p.h };
}

export const template: QuestionTemplate = {
  id: "ch7.constant-force.elevator",
  topicId: "ch7.constant-force",
  title: "Work by cable, gravity, and net work on a lifted elevator (multi-part)",
  source: "Ch 7 lecture — Problem #25 (1500 kg, 40.0 m, friction 100 N → 592 kJ, −588 kJ, 0)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = { m: nice(rng, 400, 2500, 50), h: nice(rng, 5, 80, 1), f: nice(rng, 50, 500, 10) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "How much work is done on the elevator by the cable?",
        target: { symbol: "W_{\\text{cable}}", unit: "J", label: "work by the cable" },
        answer: toSigFigs(s.Wcable, 4),
        choices: buildNumericChoices(rng, s.Wcable, [
          { errorId: "forgot-friction", value: p.m * g * p.h },
          { errorId: "mass-not-weight", value: (p.m + p.f) * p.h },
          { errorId: "work-sign-flip", value: -s.Wcable },
          { errorId: "vertical-component-sign", value: (p.m * g - p.f) * p.h },
        ]),
        solution: [
          { text: "Constant speed → ΣF = 0: the cable must balance weight AND friction.", latex: `T = mg + f = (${p.m})(9.80) + ${p.f} = ${fx(p.m * g + p.f)}\\ \\text{N}`, equationId: "newton-2" },
          { text: "T is along the displacement (θ = 0).", latex: `W_{\\text{cable}} = T h\\cos0^\\circ = (${fx(p.m * g + p.f)})(${p.h}) = ${fx(s.Wcable)}\\ \\text{J}`, equationId: "work-const", value: toSigFigs(s.Wcable, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "How much work is done on the elevator by gravity?",
        target: { symbol: "W_g", unit: "J", label: "work by gravity" },
        answer: toSigFigs(s.Wg, 4),
        choices: buildNumericChoices(rng, s.Wg, [
          { errorId: "gravity-work-sign", value: -s.Wg },
          { errorId: "mass-not-weight", value: -p.m * p.h },
          { errorId: "arithmetic-slip", value: 0.001 * s.Wg },
          { errorId: "forgot-friction", value: s.Wg - p.f * p.h },
        ]),
        solution: [{ text: "Gravity points down while the displacement is up: θ = 180°, cos 180° = −1.", latex: `W_g = mgh\\cos180^\\circ = -(${p.m})(9.80)(${p.h}) = ${fx(s.Wg)}\\ \\text{J}`, equationId: "work-const", value: toSigFigs(s.Wg, 4) }],
      },
      {
        label: "(c)",
        prompt: "What is the total (net) work done on the elevator?",
        target: { symbol: "W_{\\text{net}}", unit: "J", label: "net work" },
        answer: 0,
        choices: buildNumericChoices(rng, 0, [
          { errorId: "forgot-friction", value: p.f * p.h },
          { errorId: "gravity-work-sign", value: s.Wcable - s.Wg },
          { errorId: "work-sign-flip", value: -p.f * p.h },
          { errorId: "arithmetic-slip", value: s.Wcable },
        ]),
        solution: [{ text: "Add the work by every force: cable, gravity, and friction (−f h). Equivalently, constant speed means ΔK = 0, so W_net = 0.", latex: `W_{\\text{net}} = ${fx(s.Wcable)} + (${fx(s.Wg)}) + (${fx(-p.f * p.h)}) = 0`, equationId: "work-energy", value: 0 }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A ${q(p.m, "kg")} elevator car is lifted ${q(p.h, "m")} by its cable at constant speed. Friction in the shaft averages ${q(p.f, "N")}.`,
        diagram: { kind: "vertical-box", mode: "hanging", massLabel: `${p.m} kg`, forceLabel: "T", accel: "none", caption: "constant speed upward" },
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "h", value: p.h, unit: "m" },
          { symbol: "f", value: p.f, unit: "N" },
        ],
        equations: ["newton-2", "work-const", "work-energy"],
        recipe: ["Constant speed → T = mg + f", "W_cable = T h (θ = 0)", "W_gravity = −mgh (θ = 180°)", "W_net = ΔK = 0"],
        hints: ["First find the tension from ΣF = 0 (constant speed).", "Each force's work is F d cos θ with its own angle to the (upward) displacement.", `T = ${fx(p.m * g + p.f)} N.`],
      },
      parts,
    );
  },
};
