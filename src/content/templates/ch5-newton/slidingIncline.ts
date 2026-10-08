import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD, tanD } from "../helpers";

/**
 * Block slides down an incline: a = g(sin θ − μ_k cos θ) (μ_k = 0 for the icy "Runway" example).
 * Variants: acceleration (rough / frictionless), speed at the bottom after distance d, time to the bottom.
 */
export interface SlidingParams {
  theta: number;
  muk: number; // 0 = frictionless
  d: number; // distance along slope, m
}
export function solve(p: SlidingParams): { a: number; v: number; t: number } {
  const a = g * (sinD(p.theta) - p.muk * cosD(p.theta));
  return { a, v: Math.sqrt(2 * a * p.d), t: Math.sqrt((2 * p.d) / a) };
}

type Variant = "a-rough" | "a-ice" | "v" | "t";
const SKINS = ["A car on an icy driveway", "A skier", "A crate on a loading ramp", "A sled on a snowy hill", "A toboggan"];

export const template: QuestionTemplate = {
  id: "ch5.inclines.sliding",
  topicId: "ch5.inclines",
  title: "Sliding down an incline → a, speed, time (with or without μ_k)",
  source: "Ch 5 lecture — 'The Runway' (a = g sin θ, t = √(2d/a), v = √(2gd sin θ))",
  kind: "numeric",
  difficulty: 2,
  variants: ["a-rough", "a-ice", "v", "t"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const icy = variant === "a-ice" || (variant !== "a-rough" && rng.chance(0.5));
    const p = rejectUntil(
      () => ({ theta: rng.pick([10, 15, 20, 25, 30, 35, 40, 45]), muk: icy ? 0 : nice(rng, 0.1, 0.4, 0.05), d: nice(rng, 5, 60, 1) }),
      (c) => {
        if (icy) return true;
        return tanD(c.theta) > c.muk * 1.6; // clearly slides
      },
    );
    const s = solve(p);
    const m = nice(rng, 5, 1500, 5);
    const roughText = icy ? "frictionless (icy)" : `rough, with $\\mu_k = ${p.muk}$`;
    const givens = [
      { symbol: "m", value: m, unit: "kg", note: "not needed" },
      { symbol: "\\theta", value: p.theta, unit: "°" },
      ...(icy ? [] : [{ symbol: "\\mu_k", value: p.muk, unit: "" }]),
    ];
    const diagram = { kind: "incline" as const, angleDeg: p.theta, rough: !icy, massLabel: `${m} kg`, motion: "down" as const };
    const aSolution = [
      { text: "Along the slope, gravity's component mg sin θ drives the motion" + (icy ? "." : "; kinetic friction μ_k N opposes it, with N = mg cos θ."), latex: icy ? `mg\\sin\\theta = ma \;\\Rightarrow\; a = g\\sin\\theta` : `mg\\sin\\theta - \\mu_k mg\\cos\\theta = ma`, equationId: "newton-2" },
      { text: "The mass cancels.", latex: icy ? `a = (9.80)\\sin${p.theta}^\\circ = ${fx(s.a)}\\ \\text{m/s}^2` : `a = g(\\sin\\theta - \\mu_k\\cos\\theta) = 9.80(\\sin${p.theta}^\\circ - ${p.muk}\\cos${p.theta}^\\circ) = ${fx(s.a)}\\ \\text{m/s}^2`, equationId: icy ? "newton-2" : "friction-kinetic", value: s.a },
    ];
    const aCandidates = [
      { errorId: "incline-sin-cos-swap", value: g * (cosD(p.theta) - p.muk * sinD(p.theta)) },
      ...(icy ? [{ errorId: "arithmetic-slip", value: g }] : [{ errorId: "forgot-friction", value: g * sinD(p.theta) }, { errorId: "normal-equals-mg", value: g * (sinD(p.theta) - p.muk) }]),
      { errorId: "degrees-in-radian-formula", value: g * (Math.sin(p.theta) - p.muk * Math.cos(p.theta)) },
    ];
    if (variant === "a-rough" || variant === "a-ice") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} of mass ${q(m, "kg")} slides down a slope inclined at $${p.theta}^\\circ$. The surface is ${roughText}. What is the acceleration?`,
        diagram,
        givens,
        target: { symbol: "a", unit: "m/s²", label: "acceleration down the slope" },
        answer: toSigFigs(s.a, 4),
        choices: buildNumericChoices(rng, s.a, aCandidates),
        equations: ["vec-components", "newton-2", ...(icy ? [] : ["friction-kinetic"])],
        recipe: ["Axes along / perpendicular to the slope", "Perpendicular: N = mg cos θ", icy ? "Along: mg sin θ = ma" : "Along: mg sin θ − μ_k N = ma", "a = g(sin θ − μ_k cos θ)"],
        hints: ["Tilt the axes so x runs along the slope.", "Gravity splits into mg sin θ (along) and mg cos θ (into the slope)." + (icy ? "" : " Friction is μ_k N with N = mg cos θ."), `a = 9.80(sin ${p.theta}°${icy ? "" : ` − ${p.muk} cos ${p.theta}°`}).`],
        solution: [...aSolution.slice(0, 1), { ...aSolution[1]!, value: toSigFigs(s.a, 4) }],
        note: "The mass was not needed: it cancels.",
      };
    }
    if (variant === "v") {
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} of mass ${q(m, "kg")} is released from rest at the top of a slope inclined at $${p.theta}^\\circ$. The surface is ${roughText}, and the slope is ${q(p.d, "m")} long. How fast is it moving at the bottom?`,
        diagram,
        givens: [...givens, { symbol: "d", value: p.d, unit: "m" }],
        target: { symbol: "v", unit: "m/s", label: "speed at the bottom" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "forgot-sqrt", value: 2 * s.a * p.d },
          { errorId: "incline-sin-cos-swap", value: Math.sqrt(Math.max(0, 2 * g * (cosD(p.theta) - p.muk * sinD(p.theta)) * p.d)) },
          { errorId: "treated-as-free-fall", value: Math.sqrt(2 * g * p.d) },
          ...(icy ? [] : [{ errorId: "forgot-friction", value: Math.sqrt(2 * g * sinD(p.theta) * p.d) }]),
        ]),
        equations: ["newton-2", ...(icy ? [] : ["friction-kinetic"]), "kin-v2"],
        recipe: ["Find a along the slope (dynamics)", "v² = v₀² + 2ad with v₀ = 0 (kinematics)"],
        hints: ["Two steps: dynamics gives a, kinematics gives v.", "a = g(sin θ − μ_k cos θ), then v = √(2ad).", `a = ${toSigFigs(s.a, 3)} m/s².`],
        solution: [...aSolution, { text: "Constant acceleration from rest over distance d.", latex: `v = \\sqrt{2ad} = \\sqrt{2(${fx(s.a)})(${p.d})} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "kin-v2", value: toSigFigs(s.v, 4) }],
      };
    }
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${skin} of mass ${q(m, "kg")} is released from rest at the top of a slope inclined at $${p.theta}^\\circ$. The surface is ${roughText}, and the slope is ${q(p.d, "m")} long. How long does it take to reach the bottom?`,
      diagram,
      givens: [...givens, { symbol: "d", value: p.d, unit: "m" }],
      target: { symbol: "t", unit: "s", label: "time to the bottom" },
      answer: toSigFigs(s.t, 4),
      choices: buildNumericChoices(rng, s.t, [
        { errorId: "forgot-sqrt", value: (2 * p.d) / s.a },
        { errorId: "kinematics-missing-half", value: Math.sqrt(p.d / s.a) },
        { errorId: "treated-as-free-fall", value: Math.sqrt((2 * p.d) / g) },
        { errorId: "incline-sin-cos-swap", value: Math.sqrt((2 * p.d) / (g * (cosD(p.theta) - p.muk * sinD(p.theta)))) },
      ]),
      equations: ["newton-2", ...(icy ? [] : ["friction-kinetic"]), "kin-x"],
      recipe: ["Find a along the slope", "d = ½at² → t = √(2d/a)"],
      hints: ["Dynamics for a, then x = ½at².", "t = √(2d/a).", `a = ${toSigFigs(s.a, 3)} m/s².`],
      solution: [...aSolution, { text: "Displacement from rest under constant acceleration.", latex: `d = \\tfrac12 a t^2 \;\\Rightarrow\; t = \\sqrt{\\frac{2d}{a}} = \\sqrt{\\frac{2(${p.d})}{${fx(s.a)}}} = ${fx(s.t)}\\ \\text{s}`, equationId: "kin-x", value: toSigFigs(s.t, 4) }],
    };
  },
};
