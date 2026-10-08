import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, sinD, cosD, withParts } from "../helpers";
import { angleFrom } from "./vectorAdd";

/** Resultant of three vectors given as magnitude + direction (degrees from +x, or compass style). */
export interface ThreeParams {
  v: { mag: number; deg: number }[];
}
export function solve(p: ThreeParams): { rx: number; ry: number; R: number; thetaDeg: number } {
  const rx = p.v.reduce((a, x) => a + x.mag * cosD(x.deg), 0);
  const ry = p.v.reduce((a, x) => a + x.mag * sinD(x.deg), 0);
  return { rx, ry, R: Math.hypot(rx, ry), thetaDeg: angleFrom(rx, ry) };
}

export const template: QuestionTemplate = {
  id: "e1.vectors.three-resultant",
  topicId: "e1.vectors",
  title: "Resultant of three vectors (magnitudes + angles)",
  source: "Ch 1–2 lecture — 'Find the resultant' (A = 5.00, B = 7.00, C = 8.50 units); net force 'approximately along A'",
  kind: "numeric",
  difficulty: 3,
  generate(rng: Rng): GeneratedQuestion {
    const isForce = rng.chance(0.5);
    const unit = isForce ? "N" : "units";
    const p = rejectUntil(
      () => ({ v: [0, 1, 2].map(() => ({ mag: nice(rng, 3, 60, 0.5), deg: rng.pick([0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]) })) }),
      (c) => {
        const s = solve(c);
        return s.R > 3 && Math.abs(s.rx) > 0.8 && Math.abs(s.ry) > 0.8 && new Set(c.v.map((x) => x.deg)).size === 3;
      },
    );
    const s = solve(p);
    const calcAngle = toDeg(Math.atan(s.ry / s.rx));
    const labels = ["A", "B", "C"];
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the magnitude of the resultant?",
        target: { symbol: "R", unit, label: "magnitude of the resultant" },
        answer: toSigFigs(s.R, 4),
        choices: buildNumericChoices(rng, s.R, [
          { errorId: "vector-magnitudes-added", value: p.v.reduce((a, x) => a + x.mag, 0) },
          { errorId: "sin-cos-swap", value: Math.hypot(p.v.reduce((a, x) => a + x.mag * sinD(x.deg), 0), p.v.reduce((a, x) => a + x.mag * cosD(x.deg), 0)) === s.R ? s.R * 1.5 : Math.hypot(p.v.reduce((a, x) => a + x.mag * sinD(x.deg), 0), p.v.reduce((a, x) => a + x.mag * cosD(x.deg), 0)) },
          { errorId: "forgot-sqrt", value: s.rx * s.rx + s.ry * s.ry },
          { errorId: "arithmetic-slip", value: Math.abs(s.rx) + Math.abs(s.ry) },
        ]),
        solution: [
          { text: "Resolve every vector and sum each axis.", latex: `R_x = ${p.v.map((x) => `${x.mag}\\cos${x.deg}^\\circ`).join(" + ")} = ${fx(s.rx)},\\qquad R_y = ${p.v.map((x) => `${x.mag}\\sin${x.deg}^\\circ`).join(" + ")} = ${fx(s.ry)}`, equationId: "vec-components" },
          { text: "Magnitude.", latex: `R = \\sqrt{(${fx(s.rx)})^2 + (${fx(s.ry)})^2} = ${fx(s.R)}\\ \\text{${unit}}`, equationId: "vec-magnitude", value: toSigFigs(s.R, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is its direction, measured counter-clockwise from the +x axis?",
        target: { symbol: "\\theta", unit: "°", label: "direction of the resultant" },
        answer: toSigFigs(s.thetaDeg, 4),
        choices: buildNumericChoices(rng, s.thetaDeg, [
          { errorId: "arctan-quadrant", value: calcAngle < 0 ? calcAngle + 360 : calcAngle },
          { errorId: "arctan-inverted", value: angleFrom(s.ry, s.rx) },
          { errorId: "arctan-quadrant", value: Math.abs(calcAngle) },
          { errorId: "arithmetic-slip", value: (s.thetaDeg + 90) % 360 },
        ]),
        solution: [{ text: "Direction with the quadrant checked from the signs of R_x and R_y.", latex: `\\theta = \\tan^{-1}\\!\\left(\\frac{${fx(s.ry)}}{${fx(s.rx)}}\\right) \;\\to\; ${fx(s.thetaDeg)}^\\circ`, equationId: "vec-direction", value: toSigFigs(s.thetaDeg, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `Three ${isForce ? "forces act on an object" : "displacement vectors are added"}: ${p.v.map((x, i) => `$\\vec ${labels[i]}$ = ${x.mag} ${unit} at ${x.deg}°`).join(", ")} (angles counter-clockwise from +x). Find the ${isForce ? "net force" : "resultant"}.`,
        diagram: { kind: "vectors", vectors: p.v.map((x, i) => ({ label: labels[i]!, magnitude: x.mag, angleDeg: x.deg })), showResultant: true },
        givens: p.v.flatMap((x, i) => [
          { symbol: labels[i]!, value: x.mag, unit },
          { symbol: `\\theta_{${labels[i]}}`, value: x.deg, unit: "°" },
        ]),
        equations: ["vec-components", "vec-magnitude", "vec-direction"],
        recipe: ["Components of each vector (cos for x, sin for y, angle from +x)", "Sum the x's and the y's separately", "Magnitude and direction of the sum, quadrant-checked"],
        hints: ["Three vectors: components, then add. Never add magnitudes.", "Angles are all from +x, so A_x = A cos θ, A_y = A sin θ with signs automatic.", `R = (${fx(s.rx)}, ${fx(s.ry)}).`],
      },
      parts,
    );
  },
};
