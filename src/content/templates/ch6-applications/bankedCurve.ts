import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, tanD, sinD } from "../helpers";

/** Frictionless banked curve: tan θ = v²/(rg). Lecture: 13.4 m/s, 35.0 m → 27.6°; review: r = 100 m, 31.0° → 24.3 m/s. */
export function solve(p: { v: number; r: number }): { thetaDeg: number } {
  return { thetaDeg: toDeg(Math.atan((p.v * p.v) / (p.r * g))) };
}
export function speedFor(p: { thetaDeg: number; r: number }): number {
  return Math.sqrt(p.r * g * tanD(p.thetaDeg));
}

type Variant = "theta" | "v" | "r";

export const template: QuestionTemplate = {
  id: "ch6.banked-curve.theta-v-r",
  topicId: "ch6.banked-curve",
  title: "Banked curve (no friction): θ ↔ v ↔ r",
  source: "Ch 6b lecture — Example 3 (13.4 m/s, 35.0 m → 27.6°); Exam 2 review MCQ (100 m, 31.0° → 24.3 m/s)",
  kind: "numeric",
  difficulty: 2,
  variants: ["theta", "v", "r"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const giveMass = rng.chance(0.5);
    const m = nice(rng, 500, 2500, 50);
    const massGiven = giveMass ? [{ symbol: "m", value: m, unit: "kg", note: "not needed" }] : [];
    const massText = giveMass ? ` of mass ${q(m, "kg")}` : "";
    const useKmh = rng.chance(0.3);
    const recipe = ["FBD: only N (perpendicular to the road) and mg", "ΣF_y = 0: N cos θ = mg", "ΣF_c: N sin θ = mv²/r", "Divide: tan θ = v²/(rg)"];
    const base = { templateId: this.id, seed: rng.seed, variant, equations: ["sum-fc", "newton-2", "banked-angle"] };
    if (variant === "theta") {
      const r = nice(rng, 30, 300, 5);
      const v = nice(rng, 8, 35, 0.5);
      const vKmh = toSigFigs(v * 3.6, 3);
      const { thetaDeg } = solve({ v, r });
      return {
        ...base,
        prompt: `A curve of radius ${q(r, "m")} is to be banked so that a car${massText} can round it at ${useKmh ? q(vKmh, "km/h") : q(v, "m/s")} even on ice (no friction). At what angle should the road be banked?`,
        diagram: { kind: "banked", angleDeg: Math.round(thetaDeg) },
        givens: [...massGiven, { symbol: "r", value: r, unit: "m" }, useKmh ? { symbol: "v", value: vKmh, unit: "km/h" } : { symbol: "v", value: v, unit: "m/s" }],
        target: { symbol: "\\theta", unit: "°", label: "bank angle" },
        answer: toSigFigs(thetaDeg, 4),
        choices: buildNumericChoices(rng, thetaDeg, [
          { errorId: "forgot-square", value: toDeg(Math.atan(v / (r * g))) },
          { errorId: "degrees-in-radian-formula", value: Math.atan((v * v) / (r * g)) },
          { errorId: "arctan-inverted", value: toDeg(Math.atan((r * g) / (v * v))) },
          ...(useKmh ? [{ errorId: "unit-conversion-direction", value: toDeg(Math.atan((vKmh * vKmh) / (r * g))) }] : [{ errorId: "arithmetic-slip", value: thetaDeg * 2 }]),
        ]),
        recipe,
        hints: [
          "Without friction only N and mg act. N is tilted, so its horizontal part can point toward the center.",
          "Vertical: N cos θ = mg. Horizontal: N sin θ = mv²/r. Divide them.",
          `tan θ = ${v}² / (${r} × 9.80).`,
        ],
        solution: [
          ...(useKmh ? [{ text: "Convert the speed to m/s.", latex: `v = ${vKmh}\\ \\text{km/h} = ${fx(v)}\\ \\text{m/s}`, value: v }] : []),
          { text: "Set up both directions with only N and mg.", latex: `N\\sin\\theta = \\frac{mv^2}{r},\\qquad N\\cos\\theta = mg`, equationId: "sum-fc" },
          { text: "Divide to eliminate N and m.", latex: `\\tan\\theta = \\frac{v^2}{rg} = \\frac{(${v})^2}{(${r})(9.80)} \;\\Rightarrow\; \\theta = ${fx(thetaDeg)}^\\circ`, equationId: "banked-angle", value: toSigFigs(thetaDeg, 4) },
        ],
        note: giveMass ? "The car's mass was not needed — it cancels." : undefined,
      };
    }
    if (variant === "v") {
      const r = nice(rng, 30, 300, 5);
      const thetaDeg = nice(rng, 8, 40, 0.5);
      const v = speedFor({ thetaDeg, r });
      return {
        ...base,
        prompt: `A curve of radius ${q(r, "m")} is banked at $${thetaDeg}^\\circ$. At what speed can a car${massText} round it with NO reliance on friction?`,
        diagram: { kind: "banked", angleDeg: thetaDeg },
        givens: [...massGiven, { symbol: "r", value: r, unit: "m" }, { symbol: "\\theta", value: thetaDeg, unit: "°" }],
        target: { symbol: "v", unit: "m/s", label: "design speed" },
        answer: toSigFigs(v, 4),
        choices: buildNumericChoices(rng, v, [
          { errorId: "forgot-sqrt", value: r * g * tanD(thetaDeg) },
          { errorId: "sin-cos-swap", value: Math.sqrt(r * g * sinD(thetaDeg)) },
          { errorId: "degrees-in-radian-formula", value: Math.sqrt(Math.abs(r * g * Math.tan(thetaDeg))) },
          ...(giveMass ? [{ errorId: "mass-not-weight", value: Math.sqrt(r * m * tanD(thetaDeg)) }] : [{ errorId: "arithmetic-slip", value: v / 2 }]),
        ]),
        recipe: [...recipe, "v = √(r g tan θ)"],
        hints: ["Frictionless bank: tan θ = v²/(rg).", "Solve for v.", `v = √(${r} × 9.80 × tan ${thetaDeg}°).`],
        solution: [{ text: "Rearrange tan θ = v²/(rg).", latex: `v = \\sqrt{r g\\tan\\theta} = \\sqrt{(${r})(9.80)\\tan${thetaDeg}^\\circ} = ${fx(v)}\\ \\text{m/s}`, equationId: "banked-angle", value: toSigFigs(v, 4) }],
      };
    }
    const thetaDeg = nice(rng, 8, 40, 0.5);
    const v = nice(rng, 8, 35, 0.5);
    const r = (v * v) / (g * tanD(thetaDeg));
    return {
      ...base,
      prompt: `A frictionless curve is banked at $${thetaDeg}^\\circ$ for a design speed of ${q(v, "m/s")}. What is the radius of the curve?`,
      diagram: { kind: "banked", angleDeg: thetaDeg },
      givens: [...massGiven, { symbol: "\\theta", value: thetaDeg, unit: "°" }, { symbol: "v", value: v, unit: "m/s" }],
      target: { symbol: "r", unit: "m", label: "radius" },
      answer: toSigFigs(r, 4),
      choices: buildNumericChoices(rng, r, [
        { errorId: "forgot-square", value: v / (g * tanD(thetaDeg)) },
        { errorId: "ratio-inverted", value: (g * tanD(thetaDeg)) / (v * v) },
        { errorId: "sin-cos-swap", value: (v * v) / (g * sinD(thetaDeg)) },
        { errorId: "arithmetic-slip", value: r * 2 },
      ]),
      recipe: [...recipe, "r = v²/(g tan θ)"],
      hints: ["tan θ = v²/(rg).", "Solve for r.", `r = ${v}² / (9.80 × tan ${thetaDeg}°).`],
      solution: [{ text: "Rearrange the banked-curve relation.", latex: `r = \\frac{v^2}{g\\tan\\theta} = \\frac{(${v})^2}{(9.80)\\tan${thetaDeg}^\\circ} = ${fx(r)}\\ \\text{m}`, equationId: "banked-angle", value: toSigFigs(r, 4) }],
    };
  },
};
