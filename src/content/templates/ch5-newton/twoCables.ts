import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD, tanD, withParts } from "../helpers";

/**
 * Object hangs from a knot supported by two cables. Angles θ1 (left) and θ2
 * (right) are measured from the HORIZONTAL (the ceiling).
 *   ΣF_x: T2 cos θ2 − T1 cos θ1 = 0
 *   ΣF_y: T1 sin θ1 + T2 sin θ2 − W = 0
 * Lecture: 122 N, 37°/53° → T1 = 73.4 N, T2 = 97.4 N.  SI Q21: 50.0 kg, 41°/73° → 157 N, 405 N.
 * One-horizontal variant (θ1 = 0): T2 = W / sin θ2, T1 = T2 cos θ2.  Lecture: 100 N, 30° → 200 N.
 */
export interface CablesParams {
  W: number; // weight, N
  theta1: number; // deg from horizontal, left cable
  theta2: number; // deg from horizontal, right cable
}
export function solve(p: CablesParams): { T1: number; T2: number; T3: number } {
  const T1 = p.W / (sinD(p.theta1) + cosD(p.theta1) * tanD(p.theta2));
  const T2 = (T1 * cosD(p.theta1)) / cosD(p.theta2);
  return { T1, T2, T3: p.W };
}

type Variant = "both-angled" | "from-vertical" | "one-horizontal";
const SKINS = ["A traffic light", "A sign", "A lantern", "A loudspeaker", "A potted plant"];

export const template: QuestionTemplate = {
  id: "ch5.tension.two-cables",
  topicId: "ch5.tension",
  title: "Two cables at angles → all tensions (multi-part)",
  source: "Ch 6a lecture — traffic light (122 N, 37°/53° → 73.4 N, 97.4 N); SI Q21",
  kind: "numeric",
  difficulty: 3,
  variants: ["both-angled", "from-vertical", "one-horizontal"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const giveMass = rng.chance(0.6);
    const m = nice(rng, 5, 60, 0.5);
    const W = giveMass ? m * g : nice(rng, 50, 600, 10);
    const Wtext = giveMass ? `of mass ${q(m, "kg")}` : `weighing ${q(W, "N")}`;

    if (variant === "one-horizontal") {
      const theta2 = rng.pick([20, 25, 30, 35, 40, 45, 50, 60]);
      const { T1, T2 } = solve({ W, theta1: 0, theta2 });
      const parts: QuestionPart[] = [
        {
          label: "(a)",
          prompt: "What is the tension in the angled (right) cable?",
          target: { symbol: "T_2", unit: "N", label: "tension in the angled cable" },
          answer: toSigFigs(T2, 4),
          choices: buildNumericChoices(rng, T2, [
            { errorId: "sin-cos-swap", value: W / cosD(theta2) },
            { errorId: "tension-equals-weight", value: W },
            { errorId: "arithmetic-slip", value: W * sinD(theta2) },
            ...(giveMass ? [{ errorId: "mass-not-weight", value: m / sinD(theta2) }] : []),
          ]),
          solution: [
            { text: "Only the angled cable has a vertical component, so it alone supports the weight.", latex: `T_2\\sin\\theta = W \;\\Rightarrow\; T_2 = \\frac{${fx(W)}}{\\sin${theta2}^\\circ} = ${fx(T2)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(T2, 4) },
          ],
        },
        {
          label: "(b)",
          prompt: "What is the tension in the horizontal (left) cable?",
          target: { symbol: "T_1", unit: "N", label: "tension in the horizontal cable" },
          answer: toSigFigs(T1, 4),
          choices: buildNumericChoices(rng, T1, [
            { errorId: "sin-cos-swap", value: T2 * sinD(theta2) },
            { errorId: "tension-equals-weight", value: W },
            { errorId: "arithmetic-slip", value: T1 / 2 },
          ]),
          solution: [{ text: "Horizontal balance.", latex: `T_1 = T_2\\cos\\theta = (${fx(T2)})\\cos${theta2}^\\circ = ${fx(T1)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(T1, 4) }],
        },
      ];
      return withParts(
        {
          templateId: this.id,
          seed: rng.seed,
          variant,
          prompt: `${skin} ${Wtext} hangs from a knot. One cable runs horizontally to a wall on the left; the other runs to the ceiling on the right, making $${theta2}^\\circ$ with the horizontal.`,
          diagram: { kind: "cables", leftAngleDeg: 0, rightAngleDeg: theta2, leftLabel: "T₁", rightLabel: "T₂", loadLabel: giveMass ? `${m} kg` : `${W} N` },
          givens: [giveMass ? { symbol: "m", value: m, unit: "kg" } : { symbol: "W", value: W, unit: "N" }, { symbol: "\\theta", value: theta2, unit: "°", note: "from horizontal" }],
          equations: ["weight", "vec-components", "newton-2"],
          recipe: ["FBD of the knot: T₁ (left, horizontal), T₂ (up-right at θ), W down", "ΣF_y = 0: T₂ sin θ = W", "ΣF_x = 0: T₁ = T₂ cos θ"],
          hints: [
            "Draw the free-body diagram of the knot — three forces, equilibrium.",
            "The horizontal cable has no vertical component, so the angled cable's vertical component carries ALL the weight.",
            `T₂ = W / sin ${theta2}°.`,
          ],
        },
        parts,
      );
    }

    // both-angled / from-vertical
    const fromVertical = variant === "from-vertical";
    const p = rejectUntil(
      () => ({ W, theta1: rng.pick([25, 30, 35, 37, 40, 41, 45, 50, 53, 55, 60]), theta2: rng.pick([25, 30, 35, 37, 40, 45, 50, 53, 55, 60, 65, 70, 73]) }),
      (c) => c.theta1 !== c.theta2,
    );
    const { T1, T2, T3 } = solve(p);
    const a1 = fromVertical ? 90 - p.theta1 : p.theta1;
    const a2 = fromVertical ? 90 - p.theta2 : p.theta2;
    const ref = fromVertical ? "from the vertical" : "with the horizontal (the ceiling)";
    const thetaText = (name: string, a: number) => `${name} makes $${a}^\\circ$ ${ref}`;
    const swapped = solve({ W, theta1: 90 - p.theta1, theta2: 90 - p.theta2 });

    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the tension in the vertical cable holding the object?",
        target: { symbol: "T_3", unit: "N", label: "tension in the vertical cable" },
        answer: toSigFigs(T3, 4),
        choices: buildNumericChoices(rng, T3, [
          ...(giveMass ? [{ errorId: "mass-not-weight", value: m }] : []),
          { errorId: "arithmetic-slip", value: T3 / 2 },
          { errorId: "sin-cos-swap", value: T3 * cosD(p.theta1) },
          { errorId: "arithmetic-slip", value: T3 * 2 },
        ]),
        solution: [{ text: "The object itself is in equilibrium: the vertical cable carries its full weight.", latex: `T_3 = W = ${giveMass ? `(${m})(9.80) = ` : ""}${fx(T3)}\\ \\text{N}`, equationId: "weight", value: toSigFigs(T3, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is the tension in the left cable?",
        target: { symbol: "T_1", unit: "N", label: "tension in the left cable" },
        answer: toSigFigs(T1, 4),
        choices: buildNumericChoices(rng, T1, [
          { errorId: fromVertical ? "angle-complement" : "sin-cos-swap", value: swapped.T1 },
          { errorId: "tension-equals-weight", value: W },
          { errorId: "arithmetic-slip", value: W / 2 },
          { errorId: "added-magnitudes-no-components", value: W / (sinD(p.theta1) + sinD(p.theta2)) },
        ]),
        solution: [
          { text: "Horizontal balance at the knot gives T₂ in terms of T₁.", latex: `-T_1\\cos\\theta_1 + T_2\\cos\\theta_2 = 0 \;\\Rightarrow\; T_2 = T_1\\frac{\\cos\\theta_1}{\\cos\\theta_2}`, equationId: "newton-2" },
          {
            text: "Substitute into the vertical balance and solve for T₁.",
            latex: `T_1\\sin\\theta_1 + T_1\\frac{\\cos\\theta_1}{\\cos\\theta_2}\\sin\\theta_2 = W \;\\Rightarrow\; T_1 = \\frac{W}{\\sin\\theta_1 + \\cos\\theta_1\\tan\\theta_2} = \\frac{${fx(W)}}{\\sin${p.theta1}^\\circ + \\cos${p.theta1}^\\circ\\tan${p.theta2}^\\circ} = ${fx(T1)}\\ \\text{N}`,
            equationId: "newton-2",
            value: toSigFigs(T1, 4),
          },
        ],
      },
      {
        label: "(c)",
        prompt: "What is the tension in the right cable?",
        target: { symbol: "T_2", unit: "N", label: "tension in the right cable" },
        answer: toSigFigs(T2, 4),
        choices: buildNumericChoices(rng, T2, [
          { errorId: fromVertical ? "angle-complement" : "sin-cos-swap", value: swapped.T2 },
          { errorId: "tension-equals-weight", value: W },
          { errorId: "arithmetic-slip", value: T1 },
          { errorId: "sin-cos-swap", value: (T1 * sinD(p.theta1)) / sinD(p.theta2) },
        ]),
        solution: [{ text: "Back-substitute into the horizontal equation.", latex: `T_2 = T_1\\frac{\\cos\\theta_1}{\\cos\\theta_2} = (${fx(T1)})\\frac{\\cos${p.theta1}^\\circ}{\\cos${p.theta2}^\\circ} = ${fx(T2)}\\ \\text{N}`, equationId: "newton-2", value: toSigFigs(T2, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} ${Wtext} hangs from a vertical cable tied to a knot. Two more cables run from the knot up to the ceiling: ${thetaText("the left cable", a1)} and ${thetaText("the right cable", a2)}.`,
        diagram: { kind: "cables", leftAngleDeg: p.theta1, rightAngleDeg: p.theta2, leftLabel: "T₁", rightLabel: "T₂", loadLabel: giveMass ? `${m} kg` : `${W} N`, anglesFromVertical: fromVertical },
        givens: [
          giveMass ? { symbol: "m", value: m, unit: "kg" } : { symbol: "W", value: W, unit: "N" },
          { symbol: "\\theta_1", value: a1, unit: "°", note: fromVertical ? "from vertical" : "from horizontal" },
          { symbol: "\\theta_2", value: a2, unit: "°", note: fromVertical ? "from vertical" : "from horizontal" },
        ],
        equations: ["weight", "vec-components", "newton-2"],
        recipe: [
          "T₃ = W from the hanging object's FBD",
          fromVertical ? "Convert angles: from horizontal = 90° − (from vertical)" : "Angles are from the horizontal: x-components use cos, y-components use sin",
          "Knot FBD: ΣF_x = 0 and ΣF_y = 0 — two equations, two unknowns",
          "Solve for T₁, then T₂",
        ],
        hints: [
          "Treat the knot as the object: three tensions act on it and it is in equilibrium.",
          fromVertical ? "The angles are from the VERTICAL — a cable at φ from vertical is at 90° − φ from the horizontal. Components: horizontal = T sin φ, vertical = T cos φ." : "With angles from the horizontal: horizontal component T cos θ, vertical T sin θ.",
          `ΣF_x: T₂ cos ${p.theta2}° = T₁ cos ${p.theta1}°;  ΣF_y: T₁ sin ${p.theta1}° + T₂ sin ${p.theta2}° = ${toSigFigs(W, 3)} N (angles from horizontal).`,
        ],
      },
      parts,
    );
  },
};
