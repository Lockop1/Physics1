import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { G, M_E, R_E } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** ω of a satellite: ω = v/r (ISS: v = 7.67 × 10³, h = 400 km → 1.13 × 10⁻³ rad/s) or ω = 2π/T. */
export function solve(p: { v: number; hKm: number }): { r: number; omega: number } {
  const r = R_E + p.hKm * 1000;
  return { r, omega: p.v / r };
}

type Variant = "from-v" | "from-T";

export const template: QuestionTemplate = {
  id: "ch13.orbits.angular-speed",
  topicId: "ch13.orbits",
  title: "Angular speed of a satellite",
  source: "Exam 2 Review — ISS angular speed (v = 7.67 × 10³ m/s, h = 400 km → 1.13 × 10⁻³ rad/s)",
  kind: "numeric",
  difficulty: 2,
  variants: ["from-v", "from-T"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const hKm = rng.pick([300, 400, 500, 600, 800, 1000, 2000, 5000, 20200, 35800]);
    const r = R_E + hKm * 1000;
    const vTrue = Math.sqrt((G * M_E) / r);
    const v = toSigFigs(vTrue, 3);
    const h = hKm * 1000;
    if (variant === "from-v") {
      const { omega } = solve({ v, hKm });
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A satellite orbits ${q(hKm, "km")} above Earth's surface at a speed of ${q(v, "m/s")}. What is its angular speed?`,
        diagram: { kind: "orbit", altitudeLabel: `h = ${hKm} km` },
        givens: [
          { symbol: "h", value: hKm, unit: "km" },
          { symbol: "v", value: v, unit: "m/s" },
        ],
        target: { symbol: "\\omega", unit: "rad/s", label: "angular speed" },
        answer: toSigFigs(omega, 4),
        choices: buildNumericChoices(rng, omega, [
          { errorId: "altitude-not-plus-radius", value: v / h },
          { errorId: "km-not-converted", value: v / (R_E + hKm) },
          { errorId: "arithmetic-slip", value: v * r },
          { errorId: "degrees-in-radian-formula", value: ((v / r) * 180) / Math.PI },
        ]),
        equations: ["v-r-omega"],
        recipe: ["r = R_E + h", "ω = v / r"],
        hints: ["v = rω links the linear and angular speeds.", "r is measured from Earth's center.", `r = ${fx(r)} m.`],
        solution: [
          { text: "Orbit radius.", latex: `r = R_E + h = ${fx(r)}\\ \\text{m}`, value: r },
          { text: "Angular speed.", latex: `\\omega = \\frac{v}{r} = \\frac{${v}}{${fx(r)}} = ${fx(omega)}\\ \\text{rad/s}`, equationId: "v-r-omega", value: toSigFigs(omega, 4) },
        ],
      };
    }
    const T = toSigFigs((2 * Math.PI * r) / vTrue, 3);
    const Tmin = toSigFigs(T / 60, 3);
    const omega = (2 * Math.PI) / T;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A satellite completes one orbit of Earth every ${q(Tmin, "min")}. What is its angular speed in rad/s?`,
      diagram: { kind: "orbit" },
      givens: [{ symbol: "T", value: Tmin, unit: "min" }],
      target: { symbol: "\\omega", unit: "rad/s", label: "angular speed" },
      answer: toSigFigs(omega, 4),
      choices: buildNumericChoices(rng, omega, [
        { errorId: "minutes-not-converted", value: (2 * Math.PI) / Tmin },
        { errorId: "revolutions-not-converted", value: 1 / T },
        { errorId: "degrees-in-radian-formula", value: 360 / T },
        { errorId: "period-frequency-swap", value: 2 * Math.PI * T },
      ]),
      equations: ["omega-def"],
      recipe: ["Convert minutes → seconds", "ω = 2π/T"],
      hints: ["One revolution is 2π radians.", "ω = 2π/T with T in seconds.", `T = ${fx(T)} s.`],
      solution: [
        { text: "Period in seconds.", latex: `T = ${Tmin}\\ \\text{min} \\times 60 = ${fx(T)}\\ \\text{s}`, value: T },
        { text: "Angular speed.", latex: `\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{${fx(T)}} = ${fx(omega)}\\ \\text{rad/s}`, equationId: "omega-def", value: toSigFigs(omega, 4) },
      ],
    };
  },
};
