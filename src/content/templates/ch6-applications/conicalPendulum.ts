import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD, tanD, withParts } from "../helpers";

/** Conical pendulum: T cos θ = mg, T sin θ = m a_c → T = mg/cos θ, a_c = g tan θ (θ from vertical). SI Q27: 2.00 kg, 80° from vertical → T ≈ 113 N, a_c ≈ 55.6 m/s². */
export function solve(p: { m: number; thetaFromVertical: number }): { T: number; ac: number } {
  return { T: (p.m * g) / cosD(p.thetaFromVertical), ac: g * tanD(p.thetaFromVertical) };
}

type Variant = "from-vertical" | "from-horizontal";
const SKINS = ["A ball", "A tetherball", "A conical-pendulum bob", "A toy airplane on a string"];

export const template: QuestionTemplate = {
  id: "ch6.conical-pendulum.tension-ac",
  topicId: "ch6.conical-pendulum",
  title: "Conical pendulum: tension and centripetal acceleration (multi-part)",
  source: "SI Exam 1 Review — Q27 (2.00 kg, string 80° from vertical → T ≈ 113 N, a_c ≈ 55.6 m/s²)",
  kind: "numeric",
  difficulty: 2,
  variants: ["from-vertical", "from-horizontal"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const p = rejectUntil(
      () => ({ m: nice(rng, 0.2, 5, 0.05), thetaFromVertical: rng.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]) }),
      () => true,
    );
    const s = solve(p);
    const thetaShown = variant === "from-vertical" ? p.thetaFromVertical : 90 - p.thetaFromVertical;
    const refText = variant === "from-vertical" ? "with the vertical" : "with the horizontal";
    const mg = p.m * g;
    const swapped = solve({ m: p.m, thetaFromVertical: 90 - p.thetaFromVertical });
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the tension in the string?",
        target: { symbol: "T", unit: "N", label: "tension" },
        answer: toSigFigs(s.T, 4),
        choices: buildNumericChoices(rng, s.T, [
          { errorId: variant === "from-vertical" ? "sin-cos-swap" : "angle-complement", value: swapped.T },
          { errorId: "tension-equals-weight", value: mg },
          { errorId: "sin-cos-swap", value: mg * cosD(p.thetaFromVertical) },
          { errorId: "mass-not-weight", value: p.m / cosD(p.thetaFromVertical) },
        ]),
        solution: [
          ...(variant === "from-horizontal" ? [{ text: "Convert to the angle from the vertical.", latex: `\\theta = 90^\\circ - ${thetaShown}^\\circ = ${p.thetaFromVertical}^\\circ`, value: p.thetaFromVertical }] : []),
          { text: "No vertical acceleration: the vertical component of T balances the weight.", latex: `T\\cos\\theta = mg \;\\Rightarrow\; T = \\frac{mg}{\\cos\\theta} = \\frac{(${p.m})(9.80)}{\\cos${p.thetaFromVertical}^\\circ} = ${fx(s.T)}\\ \\text{N}`, equationId: "conical-pendulum", value: toSigFigs(s.T, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is the centripetal acceleration of the object?",
        target: { symbol: "a_c", unit: "m/s²", label: "centripetal acceleration" },
        answer: toSigFigs(s.ac, 4),
        choices: buildNumericChoices(rng, s.ac, [
          { errorId: variant === "from-vertical" ? "sin-cos-swap" : "angle-complement", value: swapped.ac },
          { errorId: "sin-cos-swap", value: g * sinD(p.thetaFromVertical) },
          { errorId: "mass-not-weight", value: s.T / p.m },
          { errorId: "arithmetic-slip", value: g },
        ]),
        solution: [
          { text: "The horizontal component of T is the only horizontal force, so it equals m a_c.", latex: `T\\sin\\theta = m a_c \;\\Rightarrow\; a_c = \\frac{T\\sin\\theta}{m} = g\\tan\\theta = (9.80)\\tan${p.thetaFromVertical}^\\circ = ${fx(s.ac)}\\ \\text{m/s}^2`, equationId: "conical-pendulum", value: toSigFigs(s.ac, 4) },
        ],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} of mass ${q(p.m, "kg")} on a string swings in a horizontal circle at constant speed. The string makes an angle of $${thetaShown}^\\circ$ ${refText}.`,
        diagram: { kind: "conical", angleDeg: p.thetaFromVertical, fromHorizontal: variant === "from-horizontal" },
        givens: [
          { symbol: "m", value: p.m, unit: "kg" },
          { symbol: "\\theta", value: thetaShown, unit: "°", note: refText },
        ],
        equations: ["newton-2", "sum-fc", "conical-pendulum"],
        recipe: [
          variant === "from-horizontal" ? "Convert: angle from vertical = 90° − angle from horizontal" : "θ is from the vertical",
          "Vertical: T cos θ = mg → T",
          "Horizontal (toward center): T sin θ = m a_c → a_c = g tan θ",
        ],
        hints: [
          "Only two forces act: the tension (along the string) and gravity. The object does not move vertically.",
          variant === "from-horizontal" ? "Careful: the angle is from the HORIZONTAL. The vertical component of T uses sin of that angle, equivalently cos of the angle from the vertical." : "Resolve T: T cos θ vertical, T sin θ horizontal (θ from vertical).",
          `mg = ${toSigFigs(mg, 3)} N; angle from vertical = ${p.thetaFromVertical}°.`,
        ],
      },
      parts,
    );
  },
};
