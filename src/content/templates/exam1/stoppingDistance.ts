import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Stopping distance ↔ required deceleration ↔ stopping time. */
export function solve(p: { v: number; a: number }): { d: number; t: number } {
  return { d: (p.v * p.v) / (2 * p.a), t: p.v / p.a };
}

type Variant = "distance" | "decel" | "time";

export const template: QuestionTemplate = {
  id: "e1.kin1d.stopping",
  topicId: "e1.kin1d",
  title: "Stopping distance ↔ required deceleration ↔ time",
  source: "Ch 3 lecture — constant-acceleration kinematics",
  kind: "numeric",
  difficulty: 1,
  variants: ["distance", "decel", "time"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(["A car", "A motorcycle", "A bus", "A runner", "A bicycle"]);
    const useKmh = rng.chance(0.35);
    const vKmh = nice(rng, 30, 120, 5);
    const v = useKmh ? toSigFigs(vKmh / 3.6, 3) : nice(rng, 5, 35, 0.5);
    const a = nice(rng, 1, 9, 0.1);
    const s = solve({ v, a });
    const vText = useKmh ? q(vKmh, "km/h") : q(v, "m/s");
    const convStep = useKmh ? [{ text: "Convert km/h → m/s.", latex: `v = \\frac{${vKmh}}{3.6} = ${fx(v)}\\ \\text{m/s}`, equationId: "unit-conversion", value: v }] : [];
    const kmhCand = useKmh ? [{ errorId: "kmh-not-converted", value: (vKmh * vKmh) / (2 * a) }] : [];
    const base = { templateId: this.id, seed: rng.seed, variant, equations: [...(useKmh ? ["unit-conversion"] : []), "kin-v2", "kin-v"] };
    if (variant === "distance") {
      return {
        ...base,
        prompt: `${skin} travelling at ${vText} brakes with a constant deceleration of ${q(a, "m/s²")}. How far does it travel before stopping?`,
        givens: [useKmh ? { symbol: "v_0", value: vKmh, unit: "km/h" } : { symbol: "v_0", value: v, unit: "m/s" }, { symbol: "a", value: a, unit: "m/s²", note: "deceleration" }],
        target: { symbol: "\\Delta x", unit: "m", label: "stopping distance" },
        answer: toSigFigs(s.d, 4),
        choices: buildNumericChoices(rng, s.d, [...kmhCand, { errorId: "kinematics-missing-half", value: (v * v) / a }, { errorId: "forgot-square", value: v / (2 * a) }, { errorId: "arithmetic-slip", value: v * s.t }]),
        recipe: [...(useKmh ? ["km/h → m/s"] : []), "v² = v₀² + 2aΔx with v = 0, a = −|a|", "Δx = v₀²/(2a)"],
        hints: ["No time is given or asked — use the time-free equation.", "0 = v₀² − 2aΔx.", `${fx(v)}² / (2 × ${a}).`],
        solution: [...convStep, { text: "Time-free kinematics with v = 0 and a negative.", latex: `\\Delta x = \\frac{v_0^2}{2a} = \\frac{(${fx(v)})^2}{2(${a})} = ${fx(s.d)}\\ \\text{m}`, equationId: "kin-v2", value: toSigFigs(s.d, 4) }],
      };
    }
    if (variant === "decel") {
      const d = toSigFigs(s.d, 3);
      const aAns = (v * v) / (2 * d);
      return {
        ...base,
        prompt: `${skin} travelling at ${vText} must stop within ${q(d, "m")}. What constant deceleration is required?`,
        givens: [useKmh ? { symbol: "v_0", value: vKmh, unit: "km/h" } : { symbol: "v_0", value: v, unit: "m/s" }, { symbol: "\\Delta x", value: d, unit: "m" }],
        target: { symbol: "a", unit: "m/s²", label: "required deceleration (magnitude)" },
        answer: toSigFigs(aAns, 4),
        choices: buildNumericChoices(rng, aAns, [...(useKmh ? [{ errorId: "kmh-not-converted", value: (vKmh * vKmh) / (2 * d) }] : []), { errorId: "kinematics-missing-half", value: (v * v) / d }, { errorId: "forgot-square", value: v / (2 * d) }, { errorId: "arithmetic-slip", value: v / d }]),
        recipe: [...(useKmh ? ["km/h → m/s"] : []), "v² = v₀² + 2aΔx → a = v₀²/(2Δx)"],
        hints: ["Same equation, solved for a.", "|a| = v₀²/(2Δx).", `${fx(v)}² / (2 × ${d}).`],
        solution: [...convStep, { text: "Solve the time-free equation for the deceleration.", latex: `a = \\frac{v_0^2}{2\\Delta x} = \\frac{(${fx(v)})^2}{2(${d})} = ${fx(aAns)}\\ \\text{m/s}^2`, equationId: "kin-v2", value: toSigFigs(aAns, 4) }],
      };
    }
    return {
      ...base,
      prompt: `${skin} travelling at ${vText} brakes at ${q(a, "m/s²")}. How long does it take to stop?`,
      givens: [useKmh ? { symbol: "v_0", value: vKmh, unit: "km/h" } : { symbol: "v_0", value: v, unit: "m/s" }, { symbol: "a", value: a, unit: "m/s²", note: "deceleration" }],
      target: { symbol: "t", unit: "s", label: "stopping time" },
      answer: toSigFigs(s.t, 4),
      choices: buildNumericChoices(rng, s.t, [...(useKmh ? [{ errorId: "kmh-not-converted", value: vKmh / a }] : []), { errorId: "arithmetic-slip", value: v * a }, { errorId: "kinematics-missing-half", value: s.t / 2 }, { errorId: "arithmetic-slip", value: s.d }]),
      recipe: [...(useKmh ? ["km/h → m/s"] : []), "v = v₀ + at with v = 0 → t = v₀/a"],
      hints: ["Use the velocity–time equation.", "0 = v₀ − at.", `${fx(v)} / ${a}.`],
      solution: [...convStep, { text: "Velocity–time equation.", latex: `t = \\frac{v_0}{a} = \\frac{${fx(v)}}{${a}} = ${fx(s.t)}\\ \\text{s}`, equationId: "kin-v", value: toSigFigs(s.t, 4) }],
    };
  },
};
