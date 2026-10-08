import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** F_c = mv²/r on a car in a flat turn, then μ_s,min = v²/(gr). Lecture ABCD: 900 kg, 500 m, 25.0 m/s → 1125 N; μ_s = 0.128 (slides round to 0.13). */
export function solve(p: { m: number; r: number; v: number }): { Fc: number; mu: number } {
  const Fc = (p.m * p.v * p.v) / p.r;
  return { Fc, mu: Fc / (p.m * g) };
}

export const template: QuestionTemplate = {
  id: "ch6.flat-curve.centripetal-force",
  topicId: "ch6.flat-curve",
  title: "Centripetal force on a car, then the minimum μ_s (multi-part)",
  source: "Ch 6b lecture — ABCD card (900 kg, 500 m, 25.0 m/s → 1125 N; μ_s,min ≈ 0.13); SI Q28",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = { m: nice(rng, 600, 2500, 50), r: nice(rng, 40, 600, 5), v: nice(rng, 8, 35, 0.5) };
    const s = solve(p);
    const useKmh = rng.chance(0.3);
    const vKmh = toSigFigs(p.v * 3.6, 3);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What centripetal force is required to keep the car on the curve?",
        target: { symbol: "F_c", unit: "N", label: "centripetal force" },
        answer: toSigFigs(s.Fc, 4),
        choices: buildNumericChoices(rng, s.Fc, [
          { errorId: "forgot-square", value: (p.m * p.v) / p.r },
          { errorId: "arithmetic-slip", value: s.Fc / 10 },
          ...(useKmh ? [{ errorId: "unit-conversion-direction", value: (p.m * vKmh * vKmh) / p.r }] : [{ errorId: "arithmetic-slip", value: s.Fc * 10 }]),
          { errorId: "mass-not-weight", value: (p.m * g * p.v * p.v) / p.r },
        ]),
        solution: [
          ...(useKmh ? [{ text: "Convert the speed to m/s.", latex: `v = ${vKmh}\\ \\text{km/h} \\cdot \\frac{1000\\ \\text{m}}{3600\\ \\text{s}} = ${fx(p.v)}\\ \\text{m/s}`, value: p.v }] : []),
          { text: "The net inward force must be mv²/r. On a flat road, static friction provides it.", latex: `F_c = \\frac{mv^2}{r} = \\frac{(${p.m})(${p.v})^2}{${p.r}} = ${fx(s.Fc)}\\ \\text{N}`, equationId: "sum-fc", value: toSigFigs(s.Fc, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What minimum coefficient of static friction between the tires and the road keeps the car from slipping?",
        target: { symbol: "\\mu_s", unit: "", label: "minimum coefficient of static friction" },
        answer: toSigFigs(s.mu, 4),
        choices: buildNumericChoices(rng, s.mu, [
          { errorId: "forgot-square", value: p.v / (g * p.r) },
          { errorId: "mass-not-weight", value: s.Fc / p.m },
          { errorId: "ratio-inverted", value: 1 / s.mu },
          { errorId: "arithmetic-slip", value: s.mu / 2 },
        ]),
        solution: [
          { text: "N = mg on a flat road; the friction needed is F_c, and it must not exceed μ_s N.", latex: `\\mu_s mg \\ge \\frac{mv^2}{r} \;\\Rightarrow\; \\mu_{s,\\min} = \\frac{v^2}{g r} = \\frac{(${p.v})^2}{(9.80)(${p.r})} = ${fx(s.mu)}`, equationId: "vmax-flat-curve", value: toSigFigs(s.mu, 4) },
        ],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A ${q(p.m, "kg")} car negotiates a flat (unbanked) curve of radius ${q(p.r, "m")} at a speed of ${useKmh ? q(vKmh, "km/h") : q(p.v, "m/s")}.`,
        diagram: { kind: "flat-curve", radiusLabel: `r = ${p.r} m` },
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "r", value: p.r, unit: "m" },
          useKmh ? { symbol: "v", value: vKmh, unit: "km/h" } : { symbol: "v", value: p.v, unit: "m/s" },
        ],
        equations: ["ac-v2-over-r", "sum-fc", "friction-static", "vmax-flat-curve"],
        recipe: ["F_c = mv²/r (this is what friction must supply)", "N = mg on a flat road", "μ_s,min = F_c/N = v²/(gr)"],
        hints: ["The car moves in a circle, so there must be a net inward force mv²/r.", "On a flat road the only inward force available is static friction, with N = mg.", `v²/r = ${toSigFigs((p.v * p.v) / p.r, 3)} m/s².`],
      },
      parts,
    );
  },
};
