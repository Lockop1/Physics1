import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, fx, withParts } from "../helpers";

/** Add or subtract two vectors given in components → magnitude + direction. Lecture: (2,2)+(2,−4) → 4.5 at −27.0° (333°). */
export interface AddParams {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  op: "add" | "sub";
}
export function solve(p: AddParams): { rx: number; ry: number; R: number; thetaDeg: number } {
  const rx = p.op === "add" ? p.ax + p.bx : p.ax - p.bx;
  const ry = p.op === "add" ? p.ay + p.by : p.ay - p.by;
  return { rx, ry, R: Math.hypot(rx, ry), thetaDeg: angleFrom(rx, ry) };
}
/** Angle from +x in [0, 360), correctly placed in its quadrant. */
export function angleFrom(x: number, y: number): number {
  const a = toDeg(Math.atan2(y, x));
  return a < 0 ? a + 360 : a;
}
function vec(x: number, y: number): string {
  return `${x}\\hat{i} ${y < 0 ? "-" : "+"} ${Math.abs(y)}\\hat{j}`;
}

export const template: QuestionTemplate = {
  id: "e1.vectors.add-subtract",
  topicId: "e1.vectors",
  title: "Add / subtract two vectors → magnitude and direction",
  source: "Ch 1–2 lecture — Example 1 (A = 2i + 2j, B = 2i − 4j → 4.5 units at −27°); ABCD card (3i + 2j) + (−5i + 4j)",
  kind: "numeric",
  difficulty: 2,
  variants: ["add", "sub"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const op = chooseVariant(rng, this.variants!, opts?.variant) as "add" | "sub";
    const p = rejectUntil(
      () => ({ ax: nice(rng, -8, 8, 0.5), ay: nice(rng, -8, 8, 0.5), bx: nice(rng, -8, 8, 0.5), by: nice(rng, -8, 8, 0.5), op }),
      (c) => {
        const s = solve(c);
        return Math.abs(s.rx) >= 1 && Math.abs(s.ry) >= 1 && s.R > 2 && c.ax !== 0 && c.ay !== 0 && c.bx !== 0 && c.by !== 0;
      },
    );
    const s = solve(p);
    const calcAngle = toDeg(Math.atan(s.ry / s.rx)); // raw calculator value, no quadrant fix
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `What is the magnitude of $\\vec R$?`,
        target: { symbol: "R", unit: "units", label: "magnitude of the result" },
        answer: toSigFigs(s.R, 4),
        choices: buildNumericChoices(rng, s.R, [
          { errorId: "vector-magnitudes-added", value: Math.hypot(p.ax, p.ay) + Math.hypot(p.bx, p.by) },
          { errorId: "arithmetic-slip", value: Math.abs(s.rx) + Math.abs(s.ry) },
          { errorId: "forgot-sqrt", value: s.rx * s.rx + s.ry * s.ry },
          { errorId: "arithmetic-slip", value: Math.hypot(p.ax - p.bx, p.ay - p.by) === s.R ? s.R * 2 : Math.hypot(op === "add" ? p.ax - p.bx : p.ax + p.bx, op === "add" ? p.ay - p.by : p.ay + p.by) },
        ]),
        solution: [
          { text: `${op === "add" ? "Add" : "Subtract"} the components.`, latex: `R_x = ${p.ax} ${op === "add" ? "+" : "-"} (${p.bx}) = ${fx(s.rx)},\\qquad R_y = ${p.ay} ${op === "add" ? "+" : "-"} (${p.by}) = ${fx(s.ry)}`, equationId: "vec-components" },
          { text: "Magnitude.", latex: `R = \\sqrt{R_x^2 + R_y^2} = \\sqrt{(${fx(s.rx)})^2 + (${fx(s.ry)})^2} = ${fx(s.R)}`, equationId: "vec-magnitude", value: toSigFigs(s.R, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What angle does $\\vec R$ make with the +x axis (measured counter-clockwise, 0–360°)?",
        target: { symbol: "\\theta", unit: "°", label: "direction from +x" },
        answer: toSigFigs(s.thetaDeg, 4),
        choices: buildNumericChoices(rng, s.thetaDeg, [
          { errorId: "arctan-quadrant", value: calcAngle < 0 ? calcAngle + 360 : calcAngle },
          { errorId: "arctan-inverted", value: angleFrom(s.ry, s.rx) },
          { errorId: "arctan-quadrant", value: Math.abs(calcAngle) },
          { errorId: "arithmetic-slip", value: (s.thetaDeg + 180) % 360 },
        ]),
        solution: [
          { text: `tan⁻¹(R_y/R_x) = ${fx(calcAngle)}°. Check the quadrant: R_x ${s.rx > 0 ? ">" : "<"} 0 and R_y ${s.ry > 0 ? ">" : "<"} 0, so the vector is in quadrant ${s.rx > 0 ? (s.ry > 0 ? "I" : "IV") : s.ry > 0 ? "II" : "III"}${s.rx < 0 ? " — add 180° to the calculator value" : s.ry < 0 ? " — add 360° for a positive angle" : ""}.`, latex: `\\theta = \\tan^{-1}\\!\\left(\\frac{${fx(s.ry)}}{${fx(s.rx)}}\\right) \;\\to\; ${fx(s.thetaDeg)}^\\circ`, equationId: "vec-direction", value: toSigFigs(s.thetaDeg, 4) },
        ],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant: op,
        prompt: `Two vectors are $\\vec A = ${vec(p.ax, p.ay)}$ and $\\vec B = ${vec(p.bx, p.by)}$ (units). Let $\\vec R = \\vec A ${op === "add" ? "+" : "-"} \\vec B$.`,
        diagram: { kind: "vectors", vectors: [{ label: "A", magnitude: Math.hypot(p.ax, p.ay), angleDeg: angleFrom(p.ax, p.ay) }, { label: op === "add" ? "B" : "−B", magnitude: Math.hypot(p.bx, p.by), angleDeg: op === "add" ? angleFrom(p.bx, p.by) : angleFrom(-p.bx, -p.by) }], showResultant: true },
        givens: [
          { symbol: "A_x", value: p.ax, unit: "" },
          { symbol: "A_y", value: p.ay, unit: "" },
          { symbol: "B_x", value: p.bx, unit: "" },
          { symbol: "B_y", value: p.by, unit: "" },
        ],
        equations: ["vec-components", "vec-magnitude", "vec-direction"],
        recipe: [`R_x = A_x ${op === "add" ? "+" : "−"} B_x, R_y = A_y ${op === "add" ? "+" : "−"} B_y`, "R = √(R_x² + R_y²)", "θ = tan⁻¹(R_y/R_x), then fix the quadrant from the signs of R_x, R_y"],
        hints: ["Vectors add component by component — never magnitude to magnitude.", "Magnitude by Pythagoras; direction by tan⁻¹(R_y/R_x).", `R = (${fx(s.rx)}, ${fx(s.ry)}). Which quadrant is that?`],
      },
      parts,
    );
  },
};
