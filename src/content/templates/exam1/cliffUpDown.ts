import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Ball thrown from a cliff of height H at speed v0 straight up vs straight down: same landing speed √(v0² + 2gH); times differ by 2v0/g. */
export function solve(p: { v0: number; H: number }): { vLand: number; tUp: number; tDown: number } {
  const vLand = Math.sqrt(p.v0 * p.v0 + 2 * g * p.H);
  return { vLand, tUp: (p.v0 + vLand) / g, tDown: (-p.v0 + vLand) / g };
}

type Variant = "speed" | "time-difference";

export const template: QuestionTemplate = {
  id: "e1.freefall.cliff-up-vs-down",
  topicId: "e1.freefall",
  title: "Thrown up vs thrown down from a cliff: landing speed and time",
  source: "Ch 3 lecture — Example 6 part (C): velocity returning to the launch height is −v₀",
  kind: "numeric",
  difficulty: 2,
  variants: ["speed", "time-difference"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const v0 = nice(rng, 5, 25, 0.5);
    const H = nice(rng, 10, 100, 1);
    const s = solve({ v0, H });
    if (variant === "speed") {
      const which = rng.pick(["upward", "downward"]);
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A ball is thrown straight ${which} at ${q(v0, "m/s")} from the edge of a cliff ${q(H, "m")} high. With what speed does it hit the ground below? (Neglect air resistance.)`,
        givens: [
          { symbol: "v_0", value: v0, unit: "m/s", note: which },
          { symbol: "H", value: H, unit: "m" },
        ],
        target: { symbol: "v", unit: "m/s", label: "landing speed" },
        answer: toSigFigs(s.vLand, 4),
        choices: buildNumericChoices(rng, s.vLand, [
          { errorId: "forgot-sqrt", value: v0 * v0 + 2 * g * H },
          { errorId: "free-fall-sign", value: Math.sqrt(Math.abs(v0 * v0 - 2 * g * H)) || v0 },
          { errorId: "arithmetic-slip", value: Math.sqrt(2 * g * H) },
          { errorId: "vector-magnitudes-added", value: v0 + Math.sqrt(2 * g * H) },
        ]),
        equations: ["kin-v2"],
        recipe: ["v² = v₀² + 2a_yΔy with a_y = −g, Δy = −H", "v₀ enters squared, so up vs down gives the same speed"],
        hints: ["Use the time-free equation between launch and ground.", "Δy = −H and a = −g, so −2g·(−H) = +2gH regardless of the throw direction.", `√(${v0}² + 2·9.80·${H}).`],
        solution: [{ text: `Thrown ${which}, the sign of v₀ doesn't matter because it is squared. (A ball thrown up returns to the launch height at −v₀, then falls exactly like one thrown down.)`, latex: `v = \\sqrt{v_0^2 + 2gH} = \\sqrt{(${v0})^2 + 2(9.80)(${H})} = ${fx(s.vLand)}\\ \\text{m/s}`, equationId: "kin-v2", value: toSigFigs(s.vLand, 4) }],
        note: "Same landing speed either way; the ball thrown upward just takes longer.",
      };
    }
    const diff = s.tUp - s.tDown;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `Two identical balls are thrown from the edge of a cliff ${q(H, "m")} high at ${q(v0, "m/s")}: one straight up, one straight down. How much LONGER does the ball thrown upward take to reach the ground?`,
      givens: [
        { symbol: "v_0", value: v0, unit: "m/s" },
        { symbol: "H", value: H, unit: "m" },
      ],
      target: { symbol: "\\Delta t", unit: "s", label: "extra time for the upward throw" },
      answer: toSigFigs(diff, 4),
      choices: buildNumericChoices(rng, diff, [
        { errorId: "range-missing-factor-2", value: v0 / g },
        { errorId: "arithmetic-slip", value: s.tUp },
        { errorId: "arithmetic-slip", value: s.tDown },
        { errorId: "arithmetic-slip", value: diff * 2 },
      ]),
      equations: ["kin-v", "kin-v2"],
      recipe: ["The upward ball returns to the launch height at −v₀ after 2v₀/g", "From then on it is identical to the downward throw", "Δt = 2v₀/g"],
      hints: ["Think about where the upward ball is when it comes back past the cliff edge.", "It passes the edge moving DOWN at v₀ — exactly the downward throw's start — after time 2v₀/g.", `2 × ${v0} / 9.80.`],
      solution: [{ text: "Up-and-back takes 2v₀/g; after that the two motions coincide.", latex: `\\Delta t = \\frac{2v_0}{g} = \\frac{2(${v0})}{9.80} = ${fx(diff)}\\ \\text{s}`, equationId: "kin-v", value: toSigFigs(diff, 4) }],
      note: `Full times: upward throw ${fx(s.tUp)} s, downward throw ${fx(s.tDown)} s; both land at ${fx(s.vLand)} m/s.`,
    };
  },
};
