import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, sinD, cosD, tanD, withParts } from "../helpers";

/** Conical pendulum with string length L at angle θ from vertical: r = L sin θ, v = √(g r tan θ), period T = 2πr/v. */
export function solve(p: { L: number; theta: number }): { r: number; v: number; period: number } {
  const r = p.L * sinD(p.theta);
  const v = Math.sqrt(g * r * tanD(p.theta));
  return { r, v, period: (2 * Math.PI * r) / v };
}

export const template: QuestionTemplate = {
  id: "ch6.conical-pendulum.speed-period",
  topicId: "ch6.conical-pendulum",
  title: "Conical pendulum: radius, speed, period from string length and angle (multi-part)",
  source: "Ch 6b lecture — conical-pendulum setup (derived from T cos θ = mg, T sin θ = mv²/r)",
  kind: "numeric",
  difficulty: 3,
  generate(rng: Rng): GeneratedQuestion {
    const p = { L: nice(rng, 0.5, 3, 0.05), theta: rng.pick([15, 20, 25, 30, 35, 40, 45, 50, 60]) };
    const m = nice(rng, 0.1, 3, 0.05);
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the radius of the circle?",
        target: { symbol: "r", unit: "m", label: "radius of the circular path" },
        answer: toSigFigs(s.r, 4),
        choices: buildNumericChoices(rng, s.r, [
          { errorId: "sin-cos-swap", value: p.L * cosD(p.theta) },
          { errorId: "arithmetic-slip", value: p.L },
          { errorId: "angle-complement", value: p.L * tanD(p.theta) },
        ]),
        solution: [{ text: "Geometry: the string is the hypotenuse; the radius is the horizontal leg.", latex: `r = L\\sin\\theta = (${p.L})\\sin${p.theta}^\\circ = ${fx(s.r)}\\ \\text{m}`, value: toSigFigs(s.r, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is the speed of the object?",
        target: { symbol: "v", unit: "m/s", label: "speed" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "forgot-sqrt", value: g * s.r * tanD(p.theta) },
          { errorId: "sin-cos-swap", value: Math.sqrt(g * s.r / tanD(p.theta)) },
          { errorId: "mass-not-weight", value: Math.sqrt(m * s.r * tanD(p.theta)) },
          { errorId: "arithmetic-slip", value: Math.sqrt(g * s.r) },
        ]),
        solution: [
          { text: "Vertical: T cos θ = mg. Horizontal: T sin θ = mv²/r. Divide.", latex: `\\tan\\theta = \\frac{v^2}{rg} \;\\Rightarrow\; v = \\sqrt{g r\\tan\\theta}`, equationId: "conical-pendulum" },
          { text: "Substitute.", latex: `v = \\sqrt{(9.80)(${fx(s.r)})\\tan${p.theta}^\\circ} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "conical-pendulum", value: toSigFigs(s.v, 4) },
        ],
      },
      {
        label: "(c)",
        prompt: "How long does one revolution take?",
        target: { symbol: "T_{\\text{period}}", unit: "s", label: "period" },
        answer: toSigFigs(s.period, 4),
        choices: buildNumericChoices(rng, s.period, [
          { errorId: "period-frequency-swap", value: s.v / (2 * Math.PI * s.r) },
          { errorId: "revolutions-not-converted", value: s.r / s.v },
          { errorId: "arithmetic-slip", value: (2 * Math.PI * p.L) / s.v },
        ]),
        solution: [{ text: "One circumference at speed v.", latex: `T_{\\text{period}} = \\frac{2\\pi r}{v} = \\frac{2\\pi(${fx(s.r)})}{${fx(s.v)}} = ${fx(s.period)}\\ \\text{s}`, equationId: "v-2pir-over-T", value: toSigFigs(s.period, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A ${q(m, "kg")} ball hangs from a ${q(p.L, "m")} string and swings in a horizontal circle, with the string making a constant angle of $${p.theta}^\\circ$ with the vertical.`,
        diagram: { kind: "conical", angleDeg: p.theta, lengthLabel: `L = ${p.L} m` },
        givens: [
          { symbol: "m", value: m, unit: "kg", note: "not needed" },
          { symbol: "L", value: p.L, unit: "m" },
          { symbol: "\\theta", value: p.theta, unit: "°", note: "from vertical" },
        ],
        equations: ["newton-2", "sum-fc", "conical-pendulum", "v-2pir-over-T"],
        recipe: ["r = L sin θ", "T cos θ = mg and T sin θ = mv²/r → tan θ = v²/(rg)", "v = √(g r tan θ)", "Period = 2πr/v"],
        hints: ["First find the radius of the circle from the geometry of the string.", "The two force equations divide to tan θ = v²/(rg) — mass cancels.", `r = ${toSigFigs(s.r, 3)} m.`],
      },
      parts,
    );
  },
};
