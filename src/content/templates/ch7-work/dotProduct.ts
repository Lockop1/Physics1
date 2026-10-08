import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { toSigFigs, toDeg, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, withParts } from "../helpers";

/** A·B = AxBx + AyBy; cos θ = A·B/(AB). Lecture: A = 2i + 3j, B = −i + 2j → 4, 60.3°. */
export function solve(p: { ax: number; ay: number; bx: number; by: number }): { dot: number; A: number; B: number; thetaDeg: number } {
  const dot = p.ax * p.bx + p.ay * p.by;
  const A = Math.hypot(p.ax, p.ay);
  const B = Math.hypot(p.bx, p.by);
  return { dot, A, B, thetaDeg: toDeg(Math.acos(Math.max(-1, Math.min(1, dot / (A * B))))) };
}

function vec(x: number, y: number): string {
  const sx = `${x}\\hat{i}`;
  const sy = y < 0 ? `- ${-y}\\hat{j}` : `+ ${y}\\hat{j}`;
  return `${sx} ${sy}`;
}

export const template: QuestionTemplate = {
  id: "ch7.constant-force.dot-product",
  topicId: "ch7.constant-force",
  title: "Scalar product and the angle between two vectors (multi-part)",
  source: "Ch 7 lecture — Example 1 scalar product (A = 2i + 3j, B = −i + 2j → 4, 60.3°)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const p = rejectUntil(
      () => ({ ax: rng.int(-5, 5), ay: rng.int(-5, 5), bx: rng.int(-5, 5), by: rng.int(-5, 5) }),
      (c) => {
        const s = solve(c);
        return c.ax !== 0 && c.ay !== 0 && c.bx !== 0 && c.by !== 0 && s.dot !== 0 && s.thetaDeg > 8 && s.thetaDeg < 172;
      },
    );
    const s = solve(p);
    const isForce = rng.chance(0.4);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: isForce ? "How much work does the force do (W = F · Δr)?" : "Determine the scalar product A · B.",
        target: { symbol: isForce ? "W" : "\\vec A\\cdot\\vec B", unit: isForce ? "J" : "", label: isForce ? "work" : "scalar product" },
        answer: s.dot,
        choices: buildNumericChoices(rng, s.dot, [
          { errorId: "added-magnitudes-no-components", value: s.A * s.B },
          { errorId: "arithmetic-slip", value: p.ax * p.by + p.ay * p.bx },
          { errorId: "work-sign-flip", value: -s.dot },
          { errorId: "arithmetic-slip", value: p.ax * p.bx - p.ay * p.by },
        ]),
        solution: [{ text: "Multiply matching components and add (î·î = ĵ·ĵ = 1, î·ĵ = 0).", latex: `\\vec A\\cdot\\vec B = A_xB_x + A_yB_y = (${p.ax})(${p.bx}) + (${p.ay})(${p.by}) = ${s.dot}`, equationId: "dot-product", value: s.dot }],
      },
      {
        label: "(b)",
        prompt: "Find the angle between the two vectors.",
        target: { symbol: "\\theta", unit: "°", label: "angle between the vectors" },
        answer: toSigFigs(s.thetaDeg, 4),
        choices: buildNumericChoices(rng, s.thetaDeg, [
          { errorId: "degrees-in-radian-formula", value: Math.acos(s.dot / (s.A * s.B)) },
          { errorId: "arithmetic-slip", value: 180 - s.thetaDeg },
          { errorId: "sin-cos-swap", value: toDeg(Math.asin(Math.max(-1, Math.min(1, s.dot / (s.A * s.B))))) },
          { errorId: "forgot-sqrt", value: toDeg(Math.acos(Math.max(-1, Math.min(1, s.dot / (s.A * s.A * s.B * s.B))))) },
        ]),
        solution: [
          { text: "Magnitudes.", latex: `A = \\sqrt{${p.ax}^2 + ${p.ay}^2} = ${fx(s.A)},\\qquad B = \\sqrt{${p.bx}^2 + ${p.by}^2} = ${fx(s.B)}`, equationId: "vec-magnitude" },
          { text: "Use A·B = AB cos θ.", latex: `\\cos\\theta = \\frac{\\vec A\\cdot\\vec B}{AB} = \\frac{${s.dot}}{(${fx(s.A)})(${fx(s.B)})} \;\\Rightarrow\; \\theta = ${fx(s.thetaDeg)}^\\circ`, equationId: "dot-product", value: toSigFigs(s.thetaDeg, 4) },
        ],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: isForce
          ? `A constant force $\\vec F = (${vec(p.ax, p.ay)})\\ \\text{N}$ acts on an object that undergoes a displacement $\\Delta\\vec r = (${vec(p.bx, p.by)})\\ \\text{m}$.`
          : `The vectors $\\vec A = ${vec(p.ax, p.ay)}$ and $\\vec B = ${vec(p.bx, p.by)}$ are given.`,
        givens: [
          { symbol: isForce ? "F_x" : "A_x", value: p.ax, unit: "" },
          { symbol: isForce ? "F_y" : "A_y", value: p.ay, unit: "" },
          { symbol: isForce ? "\\Delta x" : "B_x", value: p.bx, unit: "" },
          { symbol: isForce ? "\\Delta y" : "B_y", value: p.by, unit: "" },
        ],
        equations: ["dot-product", "vec-magnitude", ...(isForce ? ["work-const"] : [])],
        recipe: ["A·B = AxBx + AyBy", "A = √(Ax² + Ay²), same for B", "cos θ = A·B/(AB)"],
        hints: ["The dot product can be computed from components without knowing the angle.", "Then the SAME dot product equals AB cos θ — use it to find θ.", `A·B = ${s.dot}.`],
      },
      parts,
    );
  },
};
