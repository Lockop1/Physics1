import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Tension in a rope/scale holding an object: at rest (T = mg) or accelerating. Lecture: 20 kg chandelier → 196 N; 40.0 N fish, a = ±2.00 → 48.2 / 31.8 N. */
export interface HangingParams {
  m: number;
  ay: number; // signed, up positive
}
export function solve(p: HangingParams): { T: number } {
  return { T: p.m * (g + p.ay) };
}

type Variant = "rest" | "up" | "down";
const SKINS = [
  { obj: "a chandelier", holder: "the wire holding it up" },
  { obj: "a fish on a spring scale", holder: "the scale (its reading)" },
  { obj: "a crate on a crane cable", holder: "the cable" },
  { obj: "a lamp", holder: "the cord" },
  { obj: "a bucket", holder: "the rope" },
];

export const template: QuestionTemplate = {
  id: "ch5.tension.hanging",
  topicId: "ch5.tension",
  title: "Tension in a rope holding an object (at rest or accelerating)",
  source: "Ch 5 lecture — chandelier (20 kg → 196 N); fish in elevator (40.0 N, ±2.00 m/s² → 48.2 N / 31.8 N)",
  kind: "numeric",
  difficulty: 1,
  variants: ["rest", "up", "down"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const giveWeight = variant !== "rest" && rng.chance(0.4);
    const m = nice(rng, 2, 60, 0.5);
    const W = giveWeight ? nice(rng, 20, 500, 5) : m * g;
    const mass = giveWeight ? W / g : m;
    const a = nice(rng, 0.5, 4, 0.1);
    const ay = variant === "up" ? a : variant === "down" ? -a : 0;
    const { T } = solve({ m: mass, ay });
    const objText = giveWeight ? `${skin.obj} weighing ${q(W, "N")}` : `${skin.obj} of mass ${q(m, "kg")}`;
    const situation =
      variant === "rest"
        ? rng.pick(["hangs at rest from the ceiling", "is lifted at constant velocity", "hangs in an elevator moving at constant velocity"])
        : variant === "up"
          ? `hangs in an elevator accelerating upward at ${q(a, "m/s²")}`
          : `hangs in an elevator accelerating downward at ${q(a, "m/s²")}`;
    const candidates =
      variant === "rest"
        ? [
            { errorId: "mass-not-weight", value: m },
            { errorId: "arithmetic-slip", value: W / 2 },
            { errorId: "arithmetic-slip", value: W * 2 },
          ]
        : [
            { errorId: "tension-equals-weight", value: W },
            { errorId: "elevator-sign", value: mass * (g - ay) },
            { errorId: "mass-not-weight", value: giveWeight ? W * (1 + ay) : m * a },
            { errorId: "arithmetic-slip", value: mass * Math.abs(ay) },
          ];
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${cap(objText)} ${situation}. What is the tension in ${skin.holder}?`,
      diagram: { kind: "vertical-box", mode: "hanging", massLabel: giveWeight ? `${W} N` : `${m} kg`, forceLabel: "T", accel: ay > 0 ? "up" : ay < 0 ? "down" : "none" },
      givens: [giveWeight ? { symbol: "W", value: W, unit: "N" } : { symbol: "m", value: m, unit: "kg" }, ...(variant !== "rest" ? [{ symbol: "a", value: a, unit: "m/s²", note: variant === "up" ? "upward" : "downward" }] : [])],
      target: { symbol: "T", unit: "N", label: "tension" },
      answer: toSigFigs(T, 4),
      choices: buildNumericChoices(rng, T, candidates),
      equations: ["weight", "newton-2"],
      recipe: ["Forces: T up, mg down", variant === "rest" ? "ΣF_y = 0 → T = mg" : `ΣF_y = T − mg = m a_y, a_y = ${variant === "up" ? "+" : "−"}a`, ...(giveWeight ? ["m = W/g"] : [])],
      hints: [
        variant === "rest" ? "No acceleration (at rest or constant velocity) → equilibrium." : "The object accelerates with the elevator, so T ≠ mg.",
        variant === "rest" ? "T − mg = 0." : `T − mg = m a_y with a_y ${variant === "up" ? "positive" : "negative"}.`,
        giveWeight ? `m = ${W}/9.80 = ${toSigFigs(mass, 3)} kg.` : `mg = ${toSigFigs(m * g, 3)} N.`,
      ],
      solution: [
        ...(giveWeight ? [{ text: "Find the mass from the weight.", latex: `m = \\frac{W}{g} = \\frac{${W}}{9.80} = ${fx(mass)}\\ \\text{kg}`, equationId: "weight", value: mass }] : []),
        variant === "rest"
          ? { text: "Equilibrium: tension balances weight.", latex: `T = mg = (${m})(9.80) = ${fx(T)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(T, 4) }
          : { text: `Newton's second law with a_y = ${variant === "up" ? "+" : "−"}${a} m/s².`, latex: `T = m(g + a_y) = (${fx(mass)})(9.80 ${ay > 0 ? "+" : "-"} ${a}) = ${fx(T)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(T, 4) },
      ],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
