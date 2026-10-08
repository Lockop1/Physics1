import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { within } from "../../../engine/check";
import { q, fx } from "../helpers";

/**
 * Non-uniform circular motion: a vehicle slows (or speeds up) while on a circular
 * path of given DIAMETER. Total acceleration = √(a_c² + a_t²).
 * Distractors: diameter-as-radius, tangential-only, centripetal-only.
 */

export interface NonUniformParams {
  /** diameter, m */
  d: number;
  /** speed at the instant, m/s */
  v: number;
  /** magnitude of tangential acceleration, m/s² */
  at: number;
}

export function solve(p: NonUniformParams): { r: number; ac: number; a: number } {
  const r = p.d / 2;
  const ac = (p.v * p.v) / r;
  return { r, ac, a: Math.hypot(ac, p.at) };
}

const SKINS = [
  { who: "A car", path: "a U-turn on a road of diameter", dMin: 40, dMax: 200, dStep: 10, vMin: 6, vMax: 20, atMin: 1, atMax: 4 },
  { who: "A cyclist", path: "a circular roundabout of diameter", dMin: 20, dMax: 60, dStep: 2, vMin: 4, vMax: 10, atMin: 0.5, atMax: 2.5 },
  { who: "A sprinter", path: "the curved end of a track, a semicircle of diameter", dMin: 60, dMax: 90, dStep: 2, vMin: 6, vMax: 10, atMin: 0.5, atMax: 2 },
  { who: "A motorcycle", path: "a circular test loop of diameter", dMin: 80, dMax: 300, dStep: 10, vMin: 10, vMax: 25, atMin: 1.5, atMax: 5 },
];

export const template: QuestionTemplate = {
  id: "ch4.ucm.nonuniform",
  topicId: "ch4.ucm",
  title: "Total acceleration while braking in a turn (diameter given)",
  source: "SI Exam 1 Review — Q26 (d = 200 m, v = 6.20 m/s, a_t = 2.20 m/s² → a = 2.23 m/s²)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const skin = rng.pick(SKINS);
    const slowing = rng.chance(0.7);
    const p = rejectUntil(
      () => ({
        d: nice(rng, skin.dMin, skin.dMax, skin.dStep),
        v: nice(rng, skin.vMin, skin.vMax, 0.1),
        at: nice(rng, skin.atMin, skin.atMax, 0.1),
      }),
      (c) => {
        const { ac, a } = solve(c);
        // Keep a_c and a_t comparable so each named distractor is visibly different.
        const ratio = ac / c.at;
        if (ratio < 0.4 || ratio > 2.5) return false;
        const diamWrong = Math.hypot((c.v * c.v) / c.d, c.at);
        return !within(diamWrong, a, 0.03) && !within(ac, a, 0.03) && !within(c.at, a, 0.03);
      },
    );
    const { r, ac, a } = solve(p);

    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `${skin.who} is going through ${skin.path} ${q(p.d, "m")}. At the instant its speed is ${q(p.v, "m/s")}, it is ${slowing ? "braking" : "speeding up"} so that its speed is changing at a rate of ${q(p.at, "m/s²")}. What is the magnitude of its total acceleration at that instant?`,
      diagram: { kind: "circle", radiusLabel: `d = ${p.d} m`, showDiameter: true, direction: "ccw", markAngleDeg: 300, markLabel: "P", showVelocity: true, showCentripetal: true, tangential: slowing ? "opposing" : "along" },
      givens: [
        { symbol: "d", value: p.d, unit: "m", note: "diameter" },
        { symbol: "v", value: p.v, unit: "m/s" },
        { symbol: "a_t", value: p.at, unit: "m/s²" },
      ],
      target: { symbol: "a", unit: "m/s²", label: "total acceleration" },
      answer: toSigFigs(a, 4),
      choices: buildNumericChoices(rng, a, [
        { errorId: "diameter-as-radius", value: Math.hypot((p.v * p.v) / p.d, p.at) },
        { errorId: "tangential-only", value: p.at },
        { errorId: "centripetal-only", value: ac },
        { errorId: "arithmetic-slip", value: ac + p.at },
      ]),
      equations: ["ac-v2-over-r", "a-total-circular"],
      recipe: ["r = d/2", "a_c = v²/r (toward center)", "a_t is given (along the path)", "a = √(a_c² + a_t²)"],
      hints: [
        "The speed is changing AND the path is curved — so there are two perpendicular acceleration components.",
        "Centripetal a_c = v²/r uses the RADIUS; the rate of change of speed is the tangential a_t. Combine with the Pythagorean theorem.",
        `r = ${r} m, a_c = ${toSigFigs(ac, 3)} m/s², then √(a_c² + ${p.at}²).`,
      ],
      solution: [
        { text: "The problem gives a diameter; the radius is half.", latex: `r = \\frac{d}{2} = \\frac{${p.d}}{2} = ${r}\\ \\text{m}`, value: r },
        { text: "Centripetal component from the speed and radius.", latex: `a_c = \\frac{v^2}{r} = \\frac{(${p.v})^2}{${r}} = ${fx(ac)}\\ \\text{m/s}^2`, equationId: "ac-v2-over-r", value: ac },
        { text: "The tangential component is the rate of change of speed, perpendicular to a_c.", latex: `a_t = ${p.at}\\ \\text{m/s}^2`, value: p.at },
        { text: "Combine the perpendicular components.", latex: `a = \\sqrt{a_c^2 + a_t^2} = \\sqrt{(${fx(ac)})^2 + (${p.at})^2} = ${fx(a)}\\ \\text{m/s}^2`, equationId: "a-total-circular", value: toSigFigs(a, 4) },
      ],
    };
  },
};
