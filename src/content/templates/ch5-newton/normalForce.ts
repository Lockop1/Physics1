import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import type { DiagramSpec } from "../../../diagrams/types";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/**
 * Normal force in five situations. Distractor normal-equals-mg every time.
 */
export type NormalCase = "push-down" | "pull-up" | "incline" | "elevator-up" | "elevator-down";
export interface NormalParams {
  kind: NormalCase;
  m: number;
  F?: number; // applied force (push/pull cases)
  theta?: number; // deg: angle of applied force from horizontal, or incline angle
  a?: number; // elevator acceleration magnitude
}
export function solve(p: NormalParams): { N: number } {
  switch (p.kind) {
    case "push-down":
      return { N: p.m * g + (p.F ?? 0) * sinD(p.theta ?? 0) };
    case "pull-up":
      return { N: p.m * g - (p.F ?? 0) * sinD(p.theta ?? 0) };
    case "incline":
      return { N: p.m * g * cosD(p.theta ?? 0) };
    case "elevator-up":
      return { N: p.m * (g + (p.a ?? 0)) };
    case "elevator-down":
      return { N: p.m * (g - (p.a ?? 0)) };
  }
}

export const template: QuestionTemplate = {
  id: "ch5.normal.cases",
  topicId: "ch5.normal",
  title: "Normal force: angled push / pull, incline, elevator",
  source: "Ch 5 lecture — 'When is N ≠ mg' slides; Exam 2 review Ch 5",
  kind: "numeric",
  difficulty: 2,
  variants: ["push-down", "pull-up", "incline", "elevator-up", "elevator-down"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const kind = chooseVariant(rng, this.variants!, opts?.variant) as NormalCase;
    const m = nice(rng, 2, 40, 0.5);
    const mg = m * g;
    const obj = rng.pick(["a crate", "a box", "a lawn mower", "a sled", "a suitcase"]);

    if (kind === "push-down" || kind === "pull-up") {
      const p = rejectUntil(
        () => ({ kind, m, F: nice(rng, 10, 120, 5), theta: rng.pick([20, 25, 30, 35, 40, 45, 50, 60]) }),
        (c) => solve(c).N > 0.15 * mg && Math.abs(solve(c).N - mg) > 0.06 * mg,
      );
      const { N } = solve(p);
      const push = kind === "push-down";
      const diagram: DiagramSpec = { kind: "block-force", forces: [{ label: "F", angleDeg: push ? -p.theta : p.theta }], massLabel: `${m} kg`, showNW: true };
      return {
        templateId: this.id,
        seed: rng.seed,
        variant: kind,
        prompt: push
          ? `You push ${obj} of mass ${q(m, "kg")} across a horizontal floor with a force of ${q(p.F, "N")} directed $${p.theta}^\\circ$ below the horizontal. What is the normal force from the floor?`
          : `You pull ${obj} of mass ${q(m, "kg")} across a horizontal floor by a rope with a force of ${q(p.F, "N")} directed $${p.theta}^\\circ$ above the horizontal. What is the normal force from the floor?`,
        diagram,
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "F", value: p.F, unit: "N" },
          { symbol: "\\theta", value: p.theta, unit: "°", note: push ? "below horizontal" : "above horizontal" },
        ],
        target: { symbol: "N", unit: "N", label: "normal force" },
        answer: toSigFigs(N, 4),
        choices: buildNumericChoices(rng, N, [
          { errorId: "normal-equals-mg", value: mg },
          { errorId: "vertical-component-sign", value: push ? mg - p.F * sinD(p.theta) : mg + p.F * sinD(p.theta) },
          { errorId: "sin-cos-swap", value: push ? mg + p.F * cosD(p.theta) : mg - p.F * cosD(p.theta) },
          { errorId: "mass-not-weight", value: push ? m + p.F * sinD(p.theta) : m - p.F * sinD(p.theta) },
        ]),
        equations: ["vec-components", "weight", "newton-2"],
        recipe: ["Vertical forces: N up, mg down, F sin θ " + (push ? "down" : "up"), "ΣF_y = 0 (no vertical motion)", push ? "N = mg + F sin θ" : "N = mg − F sin θ"],
        hints: [
          "The applied force has a vertical component, so N is not simply mg.",
          `Write ΣF_y = 0: N − mg ${push ? "−" : "+"} F sin θ = 0.`,
          `F sin θ = ${p.F} sin ${p.theta}° = ${toSigFigs(p.F * sinD(p.theta), 3)} N; mg = ${toSigFigs(mg, 3)} N.`,
        ],
        solution: [
          { text: "Vertical component of the applied force.", latex: `F_y = F\\sin\\theta = (${p.F})\\sin${p.theta}^\\circ = ${fx(p.F * sinD(p.theta))}\\ \\text{N}\\ (${push ? "\\text{downward}" : "\\text{upward}"})`, equationId: "vec-components", value: p.F * sinD(p.theta) },
          {
            text: push ? "ΣF_y = 0 with the push adding to the weight." : "ΣF_y = 0 with the pull supporting part of the weight.",
            latex: push ? `N = mg + F\\sin\\theta = ${fx(mg)} + ${fx(p.F * sinD(p.theta))} = ${fx(N)}\\ \\text{N}` : `N = mg - F\\sin\\theta = ${fx(mg)} - ${fx(p.F * sinD(p.theta))} = ${fx(N)}\\ \\text{N}`,
            equationId: "newton-2",
            value: toSigFigs(N, 4),
          },
        ],
      };
    }

    if (kind === "incline") {
      const theta = rng.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]);
      const { N } = solve({ kind, m, theta });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant: kind,
        prompt: `${cap(obj)} of mass ${q(m, "kg")} rests on a ramp inclined at $${theta}^\\circ$ above the horizontal. What is the normal force exerted by the ramp?`,
        diagram: { kind: "incline", angleDeg: theta, massLabel: `${m} kg` },
        givens: [
          { symbol: "m", value: m, unit: "kg" },
          { symbol: "\\theta", value: theta, unit: "°" },
        ],
        target: { symbol: "N", unit: "N", label: "normal force" },
        answer: toSigFigs(N, 4),
        choices: buildNumericChoices(rng, N, [
          { errorId: "normal-equals-mg", value: mg },
          { errorId: "incline-sin-cos-swap", value: mg * sinD(theta) },
          { errorId: "mass-not-weight", value: m * cosD(theta) },
          { errorId: "arithmetic-slip", value: mg / cosD(theta) },
        ]),
        equations: ["vec-components", "weight", "newton-2"],
        recipe: ["Axes along and perpendicular to the incline", "Gravity component into the incline: mg cos θ", "ΣF_⊥ = 0 → N = mg cos θ"],
        hints: [
          "On an incline the normal force is perpendicular to the surface — not vertical.",
          "Resolve gravity: mg sin θ along the slope, mg cos θ into it. N balances the 'into' part.",
          `N = ${toSigFigs(mg, 3)} × cos ${theta}°.`,
        ],
        solution: [
          { text: "Perpendicular to the incline there is no acceleration, so N balances the perpendicular component of gravity.", latex: `N = mg\\cos\\theta = (${m})(9.80)\\cos${theta}^\\circ = ${fx(N)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(N, 4) },
        ],
        note: "N < mg on any incline; it only equals mg when θ = 0.",
      };
    }

    // elevator
    const a = nice(rng, 0.5, 4, 0.1);
    const up = kind === "elevator-up";
    const { N } = solve({ kind, m, a });
    const slowing = rng.chance(0.4); // "moving down but slowing" = accelerating up, etc.
    const motionText = up
      ? slowing
        ? `moving downward and slowing down at ${q(a, "m/s²")}`
        : `accelerating upward at ${q(a, "m/s²")}`
      : slowing
        ? `moving upward and slowing down at ${q(a, "m/s²")}`
        : `accelerating downward at ${q(a, "m/s²")}`;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant: kind,
      prompt: `${cap(obj)} of mass ${q(m, "kg")} sits on the floor of an elevator that is ${motionText}. What is the normal force the floor exerts on it?`,
      diagram: { kind: "vertical-box", mode: "elevator", massLabel: `${m} kg`, forceLabel: "N", accel: up ? "up" : "down" },
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        { symbol: "a", value: a, unit: "m/s²", note: up ? "acceleration upward" : "acceleration downward" },
      ],
      target: { symbol: "N", unit: "N", label: "normal force" },
      answer: toSigFigs(N, 4),
      choices: buildNumericChoices(rng, N, [
        { errorId: "normal-equals-mg", value: mg },
        { errorId: "elevator-sign", value: m * (up ? g - a : g + a) },
        { errorId: "mass-not-weight", value: m * a },
        { errorId: "arithmetic-slip", value: m * a + m },
      ]),
      equations: ["weight", "newton-2"],
      recipe: ["Forces: N up, mg down", `ΣF_y = N − mg = m a_y with a_y = ${up ? "+" : "−"}a`, `N = m(g ${up ? "+" : "−"} a)`],
      hints: [
        slowing ? "Careful: the direction of the acceleration is opposite to the velocity when slowing down." : "The elevator (and the object) accelerate, so N ≠ mg.",
        `The acceleration is ${up ? "upward" : "downward"}: ΣF_y = N − mg = ${up ? "+" : "−"}ma.`,
        `N = ${m}(9.80 ${up ? "+" : "−"} ${a}).`,
      ],
      solution: [
        {
          text: `${slowing ? (up ? "Moving down while slowing means the acceleration points UP. " : "Moving up while slowing means the acceleration points DOWN. ") : ""}Apply ΣF_y = ma_y.`,
          latex: `N - mg = m a_y \;\\Rightarrow\; N = m(g ${up ? "+" : "-"} a) = (${m})(9.80 ${up ? "+" : "-"} ${a}) = ${fx(N)}\\ \\text{N}`,
          equationId: "newton-2",
          value: toSigFigs(N, 4),
        },
      ],
      note: up ? "The object 'feels heavier' — apparent weight exceeds mg." : "The object 'feels lighter' — apparent weight is less than mg.",
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
