import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx, sinD, cosD, withParts } from "../helpers";

/**
 * Components of a vector whose angle is measured from +x, from the +y axis, or from the −y axis.
 * Lecture: C = 12.0 at 60° below +x → Cx = 6.00, Cy = −10.4.
 */
export type Ref = "+x" | "+y" | "-y" | "-x";
export interface CompParams {
  A: number;
  /** angle in degrees measured from `ref`, counter-clockwise positive */
  theta: number;
  ref: Ref;
}
/** Convert (ref, theta) to the standard angle from +x (CCW). */
export function standardAngle(theta: number, ref: Ref): number {
  const base = ref === "+x" ? 0 : ref === "+y" ? 90 : ref === "-x" ? 180 : 270;
  return ((base + theta) % 360 + 360) % 360;
}
export function solve(p: CompParams): { Ax: number; Ay: number; phi: number } {
  const phi = standardAngle(p.theta, p.ref);
  return { Ax: p.A * cosD(phi), Ay: p.A * sinD(phi), phi };
}

const REF_TEXT: Record<Ref, string> = { "+x": "counter-clockwise from the +x axis", "+y": "counter-clockwise from the +y axis (toward −x)", "-y": "counter-clockwise from the −y axis (toward +x)", "-x": "counter-clockwise from the −x axis (toward −y)" };

export const template: QuestionTemplate = {
  id: "e1.vectors.components",
  topicId: "e1.vectors",
  title: "Components from magnitude + angle (angle from +x, +y, or −y axis)",
  source: "Ch 1–2 lecture — 'Write the vector in component form' (12.0 units, 60° below +x → 6.00, −10.4); SI Q1",
  kind: "numeric",
  difficulty: 2,
  variants: ["+x", "+y", "-y", "-x"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const ref = chooseVariant(rng, this.variants!, opts?.variant) as Ref;
    const A = nice(rng, 5, 60, 0.5);
    const theta = rng.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]) * (rng.chance(0.3) ? -1 : 1);
    const p: CompParams = { A, theta, ref };
    const s = solve(p);
    const swapped = { Ax: p.A * sinD(s.phi), Ay: p.A * cosD(s.phi) };
    const naive = { Ax: p.A * cosD(theta), Ay: p.A * sinD(theta) }; // treated the angle as if from +x
    const sign = theta < 0 ? "clockwise" : "counter-clockwise";
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the x-component?",
        target: { symbol: "A_x", unit: "units", label: "x-component" },
        answer: toSigFigs(s.Ax, 4),
        choices: buildNumericChoices(rng, s.Ax, [
          { errorId: "sin-cos-swap", value: swapped.Ax },
          { errorId: "angle-from-wrong-axis", value: naive.Ax },
          { errorId: "arctan-quadrant", value: -s.Ax },
          { errorId: "arithmetic-slip", value: s.Ax / 2 },
        ]),
        solution: [
          { text: `Convert to the standard angle from +x: ${ref === "+x" ? "already there" : `the ${ref} axis is at ${standardAngle(0, ref)}°, so φ = ${standardAngle(0, ref)}° ${theta >= 0 ? "+" : "−"} ${Math.abs(theta)}° = ${fx(s.phi)}°`}.`, latex: `\\phi = ${fx(s.phi)}^\\circ`, equationId: "vec-components" },
          { text: "x-component.", latex: `A_x = A\\cos\\phi = (${A})\\cos${fx(s.phi)}^\\circ = ${fx(s.Ax)}`, equationId: "vec-components", value: toSigFigs(s.Ax, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is the y-component?",
        target: { symbol: "A_y", unit: "units", label: "y-component" },
        answer: toSigFigs(s.Ay, 4),
        choices: buildNumericChoices(rng, s.Ay, [
          { errorId: "sin-cos-swap", value: swapped.Ay },
          { errorId: "angle-from-wrong-axis", value: naive.Ay },
          { errorId: "arctan-quadrant", value: -s.Ay },
          { errorId: "arithmetic-slip", value: s.Ay / 2 },
        ]),
        solution: [{ text: "y-component with the same standard angle (sign comes out automatically).", latex: `A_y = A\\sin\\phi = (${A})\\sin${fx(s.phi)}^\\circ = ${fx(s.Ay)}`, equationId: "vec-components", value: toSigFigs(s.Ay, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant: ref,
        prompt: `A vector $\\vec A$ has magnitude ${q(A, "units")} and points at $${Math.abs(theta)}^\\circ$ ${sign} ${REF_TEXT[ref].replace("counter-clockwise ", "")}. Find its components.`,
        diagram: { kind: "vectors", vectors: [{ label: "A", magnitude: A, angleDeg: s.phi, ref, angleLabel: `${Math.abs(theta)}°` }] },
        givens: [
          { symbol: "A", value: A, unit: "units" },
          { symbol: "\\theta", value: Math.abs(theta), unit: "°", note: `${sign} from ${ref}` },
        ],
        equations: ["vec-components"],
        recipe: ["Find the angle from the +x axis (draw it!)", "A_x = A cos φ, A_y = A sin φ with φ from +x", "Check the signs against the quadrant"],
        hints: [
          "Always draw the vector. Decide which quadrant it lands in — that fixes the signs.",
          ref === "+x" ? "The angle is already from +x: cos for x, sin for y." : `The angle is from the ${ref} axis. Either convert to the angle from +x, or note that cos/sin swap roles relative to the y-axis.`,
          `φ (from +x) = ${fx(s.phi)}°.`,
        ],
      },
      parts,
    );
  },
};
