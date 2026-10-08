import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { q, fx, withParts } from "../helpers";

/** Stone thrown straight up at v0 from a building of height H. Lecture Example 6: 20.0 m/s from 50.0 m → t_top 2.04 s, h_max 20.4 m, v back at launch −20.0, at t = 5: v = −29.0, y = −22.5; ground at 5.83 s. */
export function solve(p: { v0: number; H: number; t: number }): { tTop: number; hMax: number; vAt: number; yAt: number; tGround: number; vGround: number } {
  const tTop = p.v0 / g;
  const hMax = (p.v0 * p.v0) / (2 * g);
  const tGround = (p.v0 + Math.sqrt(p.v0 * p.v0 + 2 * g * p.H)) / g;
  return { tTop, hMax, vAt: p.v0 - g * p.t, yAt: p.v0 * p.t - 0.5 * g * p.t * p.t, tGround, vGround: -Math.sqrt(p.v0 * p.v0 + 2 * g * p.H) };
}

export const template: QuestionTemplate = {
  id: "e1.freefall.thrown-up",
  topicId: "e1.freefall",
  title: "Thrown straight up from a building: time to top, max height, v and y later, impact (multi-part)",
  source: "Ch 3 lecture — Example 6 stone throw (2.04 s, 20.4 m, −20.0 m/s, −29.0 m/s and −22.5 m at 5.00 s)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const v0 = nice(rng, 8, 30, 0.5);
    const H = nice(rng, 10, 80, 1);
    const tTopRaw = v0 / g;
    const t = nice(rng, tTopRaw + 0.5, Math.min(tTopRaw * 2 + 2, (v0 + Math.sqrt(v0 * v0 + 2 * g * H)) / g - 0.2), 0.5);
    const s = solve({ v0, H, t });
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "How long does it take to reach its maximum height?",
        target: { symbol: "t_{\\text{top}}", unit: "s", label: "time to the top" },
        answer: toSigFigs(s.tTop, 4),
        choices: buildNumericChoices(rng, s.tTop, [
          { errorId: "range-missing-factor-2", value: 2 * s.tTop },
          { errorId: "kinematics-missing-half", value: s.tTop / 2 },
          { errorId: "arithmetic-slip", value: v0 * g },
        ]),
        solution: [{ text: "At the top v_y = 0.", latex: `0 = v_0 - g t \;\\Rightarrow\; t_{\\text{top}} = \\frac{v_0}{g} = \\frac{${v0}}{9.80} = ${fx(s.tTop)}\\ \\text{s}`, equationId: "kin-v", value: toSigFigs(s.tTop, 4) }],
      },
      {
        label: "(b)",
        prompt: "What is the maximum height above the launch point?",
        target: { symbol: "h_{\\max}", unit: "m", label: "maximum height above launch" },
        answer: toSigFigs(s.hMax, 4),
        choices: buildNumericChoices(rng, s.hMax, [
          { errorId: "kinematics-missing-half", value: (v0 * v0) / g },
          { errorId: "forgot-square", value: v0 / (2 * g) },
          { errorId: "arithmetic-slip", value: s.hMax + H },
          { errorId: "free-fall-sign", value: v0 * s.tTop + 0.5 * g * s.tTop * s.tTop },
        ]),
        solution: [{ text: "Time-free equation with v = 0 at the top.", latex: `0 = v_0^2 - 2g\\,h_{\\max} \;\\Rightarrow\; h_{\\max} = \\frac{v_0^2}{2g} = \\frac{(${v0})^2}{2(9.80)} = ${fx(s.hMax)}\\ \\text{m}`, equationId: "kin-v2", value: toSigFigs(s.hMax, 4) }],
      },
      {
        label: "(c)",
        prompt: `What are the velocity and position (relative to the launch point, up = +) at $t = ${t}$ s? Give the velocity.`,
        target: { symbol: "v_y", unit: "m/s", label: `velocity at t = ${t} s` },
        answer: toSigFigs(s.vAt, 4),
        choices: buildNumericChoices(rng, s.vAt, [
          { errorId: "free-fall-sign", value: v0 + g * t },
          { errorId: "arithmetic-slip", value: -s.vAt },
          { errorId: "vy-nonzero-at-top", value: 0.001 },
          { errorId: "arithmetic-slip", value: s.yAt },
        ]),
        solution: [{ text: "Velocity–time with a = −g.", latex: `v_y = v_0 - g t = ${v0} - (9.80)(${t}) = ${fx(s.vAt)}\\ \\text{m/s}`, equationId: "kin-v", value: toSigFigs(s.vAt, 4) }],
      },
      {
        label: "(d)",
        prompt: `And the position at $t = ${t}$ s (relative to the launch point, up = +)?`,
        target: { symbol: "y", unit: "m", label: `position at t = ${t} s` },
        answer: toSigFigs(s.yAt, 4),
        choices: buildNumericChoices(rng, s.yAt, [
          { errorId: "free-fall-sign", value: v0 * t + 0.5 * g * t * t },
          { errorId: "kinematics-missing-half", value: v0 * t - g * t * t },
          { errorId: "arithmetic-slip", value: s.yAt - H },
          { errorId: "arithmetic-slip", value: v0 * t },
        ]),
        solution: [{ text: "Position–time with a = −g.", latex: `y = v_0 t - \\tfrac12 g t^2 = (${v0})(${t}) - \\tfrac12(9.80)(${t})^2 = ${fx(s.yAt)}\\ \\text{m}`, equationId: "kin-x", value: toSigFigs(s.yAt, 4) }],
      },
      {
        label: "(e)",
        prompt: "What is its velocity when it hits the ground?",
        target: { symbol: "v_{\\text{ground}}", unit: "m/s", label: "impact velocity (up = +)" },
        answer: toSigFigs(s.vGround, 4),
        choices: buildNumericChoices(rng, s.vGround, [
          { errorId: "free-fall-sign", value: -s.vGround },
          { errorId: "arithmetic-slip", value: -v0 },
          { errorId: "arithmetic-slip", value: -Math.sqrt(2 * g * H) },
          { errorId: "forgot-sqrt", value: -(v0 * v0 + 2 * g * H) },
        ]),
        solution: [{ text: "Time-free equation from launch (y₀ = 0) to the ground (y = −H); take the negative root (moving down).", latex: `v^2 = v_0^2 + 2(-g)(-H) \;\\Rightarrow\; v = -\\sqrt{(${v0})^2 + 2(9.80)(${H})} = ${fx(s.vGround)}\\ \\text{m/s}`, equationId: "kin-v2", value: toSigFigs(s.vGround, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `A stone is thrown straight upward at ${q(v0, "m/s")} from the top of a building ${q(H, "m")} tall. It just misses the edge of the roof on the way down. Take up as positive and $y = 0$ at the launch point.`,
        givens: [
          { symbol: "v_0", value: v0, unit: "m/s" },
          { symbol: "H", value: H, unit: "m" },
          { symbol: "t", value: t, unit: "s" },
        ],
        equations: ["kin-v", "kin-x", "kin-v2"],
        recipe: ["a_y = −9.80 m/s² throughout (up +)", "Top: v = 0 → t = v₀/g, h = v₀²/(2g)", "Any later time: v = v₀ − gt, y = v₀t − ½gt²", "Ground: y = −H in v² = v₀² − 2gΔy"],
        hints: ["One acceleration (−g) for the whole flight — the stone doesn't 'know' it was thrown up.", "At the highest point only v_y is zero; g is still 9.80 m/s².", `t_top = ${fx(s.tTop)} s.`],
      },
      parts,
    );
  },
};
