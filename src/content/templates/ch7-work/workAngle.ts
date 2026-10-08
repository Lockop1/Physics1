import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx, cosD, sinD } from "../helpers";

/** W = F d cos θ. Lecture: 50.0 N, 30.0°, 3.00 m → 130 J; concrete block: 40 N, 7.0 m, 247 J → 28°. */
export function solve(p: { F: number; d: number; theta: number }): { W: number } {
  return { W: p.F * p.d * cosD(p.theta) };
}

type Variant = "W" | "theta" | "F";
const SKINS = [
  { who: "A man cleaning a floor", obj: "a vacuum cleaner", verb: "pulls" },
  { who: "A worker", obj: "a crate", verb: "drags" },
  { who: "A child", obj: "a sled", verb: "pulls" },
  { who: "A gardener", obj: "a lawn mower", verb: "pushes" },
];

export const template: QuestionTemplate = {
  id: "ch7.constant-force.fd-cos",
  topicId: "ch7.constant-force",
  title: "Work by a constant force at an angle: W = Fd cos θ",
  source: "Ch 7 lecture — Example 2 'Mr. Clean' (50.0 N, 30.0°, 3.00 m → 130 J); Example 3 concrete block (→ 28°)",
  kind: "numeric",
  difficulty: 1,
  variants: ["W", "theta", "F"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const obtuse = variant === "W" && rng.chance(0.2);
    const F = nice(rng, 10, 200, 5);
    const d = nice(rng, 1, 20, 0.5);
    const theta = obtuse ? rng.pick([120, 135, 150]) : rng.pick([...(variant === "W" ? [0] : []), 15, 20, 25, 30, 35, 37, 40, 45, 50, 60]);
    const { W } = solve({ F, d, theta });
    const dirText = theta === 0 ? "horizontally" : theta > 90 ? `at $${theta}^\\circ$ to the displacement (i.e. partly opposing the motion)` : `at $${theta}^\\circ$ above the horizontal`;
    const base = { templateId: this.id, seed: rng.seed, variant, equations: ["work-const"], diagram: { kind: "work-angle" as const, angleDeg: theta } };
    if (variant === "W") {
      return {
        ...base,
        prompt: `${skin.who} ${skin.verb} ${skin.obj} with a force of ${q(F, "N")} directed ${dirText}. How much work does this force do as ${skin.obj} moves ${q(d, "m")} horizontally?`,
        givens: [
          { symbol: "F", value: F, unit: "N" },
          { symbol: "\\theta", value: theta, unit: "°" },
          { symbol: "d", value: d, unit: "m" },
        ],
        target: { symbol: "W", unit: "J", label: "work done by the force" },
        answer: toSigFigs(W, 4),
        choices: buildNumericChoices(rng, W, [
          { errorId: "work-ignores-angle", value: F * d },
          { errorId: "sin-cos-swap", value: F * d * sinD(theta) },
          { errorId: "work-sign-flip", value: -W },
          { errorId: "degrees-in-radian-formula", value: F * d * Math.cos(theta) },
        ]),
        recipe: ["θ = angle between F and the displacement", "W = F d cos θ"],
        hints: ["Only the component of the force along the displacement does work.", "W = F d cos θ with θ between F and d.", `${F} × ${d} × cos ${theta}°.`],
        solution: [{ text: theta > 90 ? "cos θ is negative here: the force has a component against the motion." : "Work is the force component along the displacement times the distance.", latex: `W = Fd\\cos\\theta = (${F})(${d})\\cos${theta}^\\circ = ${fx(W)}\\ \\text{J}`, equationId: "work-const", value: toSigFigs(W, 4) }],
      };
    }
    if (variant === "theta") {
      const Wgiven = toSigFigs(W, 3);
      const thetaAns = toDeg(Math.acos(Math.min(1, Wgiven / (F * d))));
      return {
        ...base,
        diagram: { kind: "work-angle", angleDeg: Math.round(thetaAns) },
        prompt: `${skin.obj.charAt(0).toUpperCase() + skin.obj.slice(1)} is pulled ${q(d, "m")} across a frictionless surface by a rope with tension ${q(F, "N")}. The work done by the rope is ${q(Wgiven, "J")}. What angle does the rope make with the horizontal?`,
        givens: [
          { symbol: "F", value: F, unit: "N" },
          { symbol: "d", value: d, unit: "m" },
          { symbol: "W", value: Wgiven, unit: "J" },
        ],
        target: { symbol: "\\theta", unit: "°", label: "angle of the rope" },
        answer: toSigFigs(thetaAns, 4),
        choices: buildNumericChoices(rng, thetaAns, [
          { errorId: "sin-cos-swap", value: toDeg(Math.asin(Math.min(1, Wgiven / (F * d)))) },
          { errorId: "degrees-in-radian-formula", value: Math.acos(Math.min(1, Wgiven / (F * d))) },
          { errorId: "arithmetic-slip", value: thetaAns * 2 },
          { errorId: "arithmetic-slip", value: 90 - thetaAns },
        ]),
        recipe: ["cos θ = W / (F d)", "θ = cos⁻¹(…)"],
        hints: ["Invert W = F d cos θ.", "cos θ = W/(Fd).", `cos θ = ${Wgiven}/(${F} × ${d}).`],
        solution: [{ text: "Solve for the angle.", latex: `\\cos\\theta = \\frac{W}{Fd} = \\frac{${Wgiven}}{(${F})(${d})} \;\\Rightarrow\; \\theta = ${fx(thetaAns)}^\\circ`, equationId: "work-const", value: toSigFigs(thetaAns, 4) }],
      };
    }
    const Wgiven = toSigFigs(W, 3);
    const Fans = Wgiven / (d * cosD(theta));
    return {
      ...base,
      prompt: `A rope at $${theta}^\\circ$ above the horizontal does ${q(Wgiven, "J")} of work on ${skin.obj} while dragging it ${q(d, "m")}. What is the tension in the rope?`,
      givens: [
        { symbol: "W", value: Wgiven, unit: "J" },
        { symbol: "d", value: d, unit: "m" },
        { symbol: "\\theta", value: theta, unit: "°" },
      ],
      target: { symbol: "F", unit: "N", label: "tension" },
      answer: toSigFigs(Fans, 4),
      choices: buildNumericChoices(rng, Fans, [
        { errorId: "work-ignores-angle", value: Wgiven / d },
        { errorId: "sin-cos-swap", value: Wgiven / (d * sinD(theta)) },
        { errorId: "arithmetic-slip", value: Wgiven * cosD(theta) / d },
        { errorId: "arithmetic-slip", value: Fans / 2 },
      ]),
      recipe: ["F = W / (d cos θ)"],
      hints: ["Rearrange W = F d cos θ.", "F = W/(d cos θ).", `${Wgiven}/(${d} × cos ${theta}°).`],
      solution: [{ text: "Solve for F.", latex: `F = \\frac{W}{d\\cos\\theta} = \\frac{${Wgiven}}{(${d})\\cos${theta}^\\circ} = ${fx(Fans)}\\ \\text{N}`, equationId: "work-const", value: toSigFigs(Fans, 4) }],
    };
  },
};
