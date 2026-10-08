import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Flat (unbanked) curve: v_max = √(μ_s g r). Rotate v_max / μ_s / r. Lecture: r = 35.0, μ = 0.523 → 13.4 m/s; wet: 8.00 m/s → 0.187. */
export function solve(p: { mu: number; r: number }): { vmax: number } {
  return { vmax: Math.sqrt(p.mu * g * p.r) };
}

type Variant = "vmax" | "mu" | "r";
const SKINS = ["A car", "A motorcycle", "A delivery van", "A cyclist", "A go-kart"];

export const template: QuestionTemplate = {
  id: "ch6.flat-curve.vmax-mu-r",
  topicId: "ch6.flat-curve",
  title: "Flat curve: v_max ↔ μ_s ↔ r",
  source: "Ch 6b lecture — Example 2 (35.0 m, μ_s 0.523 → 13.4 m/s; skids at 8.00 m/s → 0.187)",
  kind: "numeric",
  difficulty: 2,
  variants: ["vmax", "mu", "r"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const giveMass = rng.chance(0.6);
    const m = nice(rng, 100, 2500, 50);
    const massText = giveMass ? ` of mass ${q(m, "kg")}` : "";
    const massGiven = giveMass ? [{ symbol: "m", value: m, unit: "kg", note: "not needed" }] : [];
    const massCand = giveMass ? [{ errorId: "mass-not-weight", value: NaN }] : [];
    void massCand;
    const mu = nice(rng, 0.15, 0.9, 0.01);
    const r = nice(rng, 20, 200, 1);
    const { vmax } = solve({ mu, r });
    const base = { templateId: this.id, seed: rng.seed, variant, diagram: { kind: "flat-curve" as const, radiusLabel: `r = ${variant === "r" ? "?" : r + " m"}` }, equations: ["sum-fc", "friction-static", "newton-2", "vmax-flat-curve"] };
    const recipe = ["ΣF_y = 0 → N = mg", "Friction supplies the centripetal force: f_s = mv²/r", "At the maximum speed f_s = μ_s N = μ_s mg", "μ_s mg = mv²_max/r → v_max = √(μ_s g r)"];
    if (variant === "vmax") {
      return {
        ...base,
        prompt: `${skin}${massText} rounds a flat (unbanked) curve of radius ${q(r, "m")}. The coefficient of static friction between the tires and the road is ${q(mu, "")}. What is the maximum speed at which it can take the curve without skidding?`,
        givens: [...massGiven, { symbol: "r", value: r, unit: "m" }, { symbol: "\\mu_s", value: mu, unit: "" }],
        target: { symbol: "v_{\\max}", unit: "m/s", label: "maximum speed" },
        answer: toSigFigs(vmax, 4),
        choices: buildNumericChoices(rng, vmax, [
          { errorId: "forgot-sqrt", value: mu * g * r },
          { errorId: "static-vs-kinetic", value: Math.sqrt(Math.max(0.05, mu - 0.15) * g * r) },
          ...(giveMass ? [{ errorId: "mass-not-weight", value: Math.sqrt(mu * m * r) }] : [{ errorId: "arithmetic-slip", value: Math.sqrt(mu * r) }]),
          { errorId: "diameter-as-radius", value: Math.sqrt(mu * g * r * 2) },
        ]),
        recipe,
        hints: [
          "On a flat curve, only static friction can point toward the center.",
          "Set f_s,max = μ_s N with N = mg equal to the required centripetal force mv²/r.",
          `v_max = √(${mu} × 9.80 × ${r}).`,
        ],
        solution: [
          { text: "No vertical acceleration, so N = mg. Static friction (maximum, since this is the fastest safe speed) is the centripetal force.", latex: `\\mu_s mg = \\frac{m v_{\\max}^2}{r}`, equationId: "sum-fc" },
          { text: "The mass cancels.", latex: `v_{\\max} = \\sqrt{\\mu_s g r} = \\sqrt{(${mu})(9.80)(${r})} = ${fx(vmax)}\\ \\text{m/s}`, equationId: "vmax-flat-curve", value: toSigFigs(vmax, 4) },
        ],
        note: giveMass ? "The mass was not needed — it cancels." : undefined,
      };
    }
    if (variant === "mu") {
      const v = toSigFigs(vmax, 3);
      const muAns = (v * v) / (g * r);
      return {
        ...base,
        prompt: `${skin}${massText} begins to skid on a flat curve of radius ${q(r, "m")} when its speed reaches ${q(v, "m/s")}. What is the coefficient of static friction between the tires and the road?`,
        givens: [...massGiven, { symbol: "r", value: r, unit: "m" }, { symbol: "v", value: v, unit: "m/s" }],
        target: { symbol: "\\mu_s", unit: "", label: "coefficient of static friction" },
        answer: toSigFigs(muAns, 4),
        choices: buildNumericChoices(rng, muAns, [
          { errorId: "forgot-square", value: v / (g * r) },
          { errorId: "diameter-as-radius", value: (v * v) / (g * r * 2) },
          ...(giveMass ? [{ errorId: "mass-not-weight", value: (v * v) / (m * r) }] : [{ errorId: "arithmetic-slip", value: (v * v) / r }]),
          { errorId: "ratio-inverted", value: (g * r) / (v * v) },
        ]),
        recipe: [...recipe.slice(0, 3), "μ_s = v²/(g r)"],
        hints: ["'Begins to skid' means static friction is at its maximum at that speed.", "μ_s mg = mv²/r → μ_s = v²/(gr).", `${v}² / (9.80 × ${r}).`],
        solution: [{ text: "At the skid speed, maximum static friction equals the required centripetal force.", latex: `\\mu_s = \\frac{v^2}{g r} = \\frac{(${v})^2}{(9.80)(${r})} = ${fx(muAns)}`, equationId: "vmax-flat-curve", value: toSigFigs(muAns, 4) }],
      };
    }
    const v = toSigFigs(vmax, 3);
    const rAns = (v * v) / (mu * g);
    return {
      ...base,
      prompt: `${skin}${massText} can round a flat curve at a maximum speed of ${q(v, "m/s")} without skidding. The coefficient of static friction is ${q(mu, "")}. What is the radius of the curve?`,
      givens: [...massGiven, { symbol: "v_{\\max}", value: v, unit: "m/s" }, { symbol: "\\mu_s", value: mu, unit: "" }],
      target: { symbol: "r", unit: "m", label: "radius of the curve" },
      answer: toSigFigs(rAns, 4),
      choices: buildNumericChoices(rng, rAns, [
        { errorId: "forgot-square", value: v / (mu * g) },
        { errorId: "ratio-inverted", value: (mu * g) / (v * v) },
        ...(giveMass ? [{ errorId: "mass-not-weight", value: (v * v) / (mu * m) }] : [{ errorId: "arithmetic-slip", value: (v * v) / mu }]),
        { errorId: "diameter-as-radius", value: rAns / 2 },
      ]),
      recipe: [...recipe.slice(0, 3), "r = v²/(μ_s g)"],
      hints: ["Same physics: μ_s mg = mv²/r.", "Solve for r.", `${v}² / (${mu} × 9.80).`],
      solution: [{ text: "Solve the flat-curve condition for r.", latex: `r = \\frac{v_{\\max}^2}{\\mu_s g} = \\frac{(${v})^2}{(${mu})(9.80)} = ${fx(rAns)}\\ \\text{m}`, equationId: "vmax-flat-curve", value: toSigFigs(rAns, 4) }],
    };
  },
};
