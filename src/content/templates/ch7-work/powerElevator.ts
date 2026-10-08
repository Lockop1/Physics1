import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Elevator motor power: P = T v with T = Mg + f (constant speed) or T = M(g + a) + f. Lecture: 1800 kg, f = 4000 N, 3.00 m/s → 6.49 × 10⁴ W; with a = 1.00 → 7.02 × 10⁴ W. */
export function solve(p: { M: number; f: number; v: number; a: number }): { T0: number; P0: number; Ta: number; Pa: number } {
  const T0 = p.M * g + p.f;
  const Ta = p.M * (g + p.a) + p.f;
  return { T0, P0: T0 * p.v, Ta, Pa: Ta * p.v };
}

export const template: QuestionTemplate = {
  id: "ch7.power.elevator",
  topicId: "ch7.power",
  title: "Motor power to lift an elevator: constant speed, then accelerating (multi-part)",
  source: "Ch 7 lecture — 'Power delivered by elevator motor' (1800 kg, 4000 N friction, 3.00 m/s → 6.49 × 10⁴ W; a = 1.00 → 7.02 × 10⁴ W)",
  kind: "numeric",
  difficulty: 3,
  generate(rng: Rng): GeneratedQuestion {
    const car = nice(rng, 800, 2000, 50);
    const people = nice(rng, 100, 600, 50);
    const p = { M: car + people, f: nice(rng, 500, 5000, 100), v: nice(rng, 1, 5, 0.1), a: nice(rng, 0.5, 2, 0.1) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `How much power must the motor deliver to lift the car and passengers at a constant speed of ${q(p.v, "m/s")}?`,
        target: { symbol: "P", unit: "W", label: "motor power at constant speed" },
        answer: toSigFigs(s.P0, 4),
        choices: buildNumericChoices(rng, s.P0, [
          { errorId: "power-forgot-friction", value: p.M * g * p.v },
          { errorId: "mass-not-weight", value: (p.M + p.f) * p.v },
          { errorId: "vertical-component-sign", value: (p.M * g - p.f) * p.v },
          { errorId: "arithmetic-slip", value: s.T0 },
        ]),
        solution: [
          { text: "Constant speed → ΣF_y = 0: the cable tension balances weight plus friction.", latex: `T = Mg + f = (${p.M})(9.80) + ${p.f} = ${fx(s.T0)}\\ \\text{N}`, equationId: "newton-2", value: s.T0 },
          { text: "Power = force × velocity (parallel).", latex: `P = Tv = (${fx(s.T0)})(${p.v}) = ${fx(s.P0)}\\ \\text{W}`, equationId: "power", value: toSigFigs(s.P0, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: `What power must the motor deliver at the instant the speed is ${q(p.v, "m/s")} if the elevator is accelerating upward at ${q(p.a, "m/s²")}?`,
        target: { symbol: "P", unit: "W", label: "motor power while accelerating" },
        answer: toSigFigs(s.Pa, 4),
        choices: buildNumericChoices(rng, s.Pa, [
          { errorId: "elevator-sign", value: (p.M * (g - p.a) + p.f) * p.v },
          { errorId: "power-forgot-friction", value: p.M * (g + p.a) * p.v },
          { errorId: "tension-equals-weight", value: s.P0 },
          { errorId: "arithmetic-slip", value: s.Ta },
        ]),
        solution: [
          { text: "Now ΣF_y = Ma.", latex: `T - f - Mg = Ma \;\\Rightarrow\; T = M(g + a) + f = (${p.M})(9.80 + ${p.a}) + ${p.f} = ${fx(s.Ta)}\\ \\text{N}`, equationId: "newton-2", value: s.Ta },
          { text: "Instantaneous power at that speed.", latex: `P = Tv = (${fx(s.Ta)})(${p.v}) = ${fx(s.Pa)}\\ \\text{W}`, equationId: "power", value: toSigFigs(s.Pa, 4) },
        ],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `An elevator car has a mass of ${q(car, "kg")} and carries passengers with a combined mass of ${q(people, "kg")}. A constant friction force of ${q(p.f, "N")} retards its motion.`,
        diagram: { kind: "vertical-box", mode: "hanging", massLabel: `${p.M} kg`, forceLabel: "T", accel: "up" },
        givens: [
          { symbol: "M", value: p.M, unit: "kg", note: "car + passengers" },
          { symbol: "f", value: p.f, unit: "N" },
          { symbol: "v", value: p.v, unit: "m/s" },
          { symbol: "a", value: p.a, unit: "m/s²", note: "part (b)" },
        ],
        equations: ["newton-2", "power"],
        recipe: ["Find the cable tension from ΣF_y = Ma (a = 0 in part a)", "P = T·v since T is parallel to v"],
        hints: ["Power delivered by a force is F·v. First find the force the cable must exert.", "Constant speed: T = Mg + f. Accelerating: T = M(g + a) + f.", `Mg = ${fx(p.M * g)} N.`],
      },
      parts,
    );
  },
};
