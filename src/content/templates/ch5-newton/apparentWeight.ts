import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** Scale reading (apparent weight) of a person in an elevator. */
export interface ApparentWeightParams {
  m: number;
  ay: number; // signed, up positive (0 for constant velocity, -g for free fall)
}
export function solve(p: ApparentWeightParams): { N: number } {
  return { N: Math.max(0, p.m * (g + p.ay)) };
}

type Variant = "up" | "down" | "constant" | "free-fall";

export const template: QuestionTemplate = {
  id: "ch5.normal.apparent-weight",
  topicId: "ch5.normal",
  title: "Apparent weight on a scale in an elevator",
  source: "Ch 5 lecture — 'Apparent weight' slide",
  kind: "numeric",
  difficulty: 2,
  variants: ["up", "down", "constant", "free-fall"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const m = nice(rng, 45, 95, 1);
    const a = nice(rng, 0.5, 3.5, 0.1);
    const ay = variant === "up" ? a : variant === "down" ? -a : variant === "free-fall" ? -g : 0;
    const { N } = solve({ m, ay });
    const mg = m * g;
    const desc =
      variant === "up"
        ? `accelerates upward at ${q(a, "m/s²")}`
        : variant === "down"
          ? `accelerates downward at ${q(a, "m/s²")}`
          : variant === "constant"
            ? `moves ${rng.chance() ? "upward" : "downward"} at a constant ${q(nice(rng, 1, 4, 0.5), "m/s")}`
            : "is in free fall after its cable snaps";
    const candidates =
      variant === "constant"
        ? [
            { errorId: "force-required-for-motion", value: m * (g + 1.5) },
            { errorId: "mass-not-weight", value: m },
            { errorId: "arithmetic-slip", value: mg / 2 },
          ]
        : variant === "free-fall"
          ? [
              { errorId: "normal-equals-mg", value: mg },
              { errorId: "elevator-sign", value: 2 * mg },
              { errorId: "mass-not-weight", value: m },
            ]
          : [
              { errorId: "normal-equals-mg", value: mg },
              { errorId: "elevator-sign", value: m * (g - ay) },
              { errorId: "mass-not-weight", value: m * Math.abs(ay) },
              { errorId: "arithmetic-slip", value: m * Math.abs(ay) + m },
            ];
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A person of mass ${q(m, "kg")} stands on a bathroom scale in an elevator that ${desc}. What does the scale read (in newtons)?`,
      diagram: { kind: "vertical-box", mode: "elevator", massLabel: `${m} kg`, forceLabel: "N", accel: ay > 0 ? "up" : ay < 0 ? "down" : "none" },
      givens: [
        { symbol: "m", value: m, unit: "kg" },
        ...(variant === "up" || variant === "down" ? [{ symbol: "a", value: a, unit: "m/s²" }] : []),
      ],
      target: { symbol: "N", unit: "N", label: "scale reading (normal force)" },
      answer: toSigFigs(N, 4),
      choices: buildNumericChoices(rng, N, candidates),
      equations: ["weight", "newton-2"],
      recipe: ["Scale reading = normal force N", "ΣF_y = N − mg = m a_y", "N = m(g + a_y) with a_y signed (up +)"],
      hints: [
        "A scale reads the normal force it exerts, not mg.",
        "ΣF_y = N − mg = m a_y. Decide the sign of a_y.",
        variant === "constant" ? "Constant velocity → a_y = 0 → N = mg." : variant === "free-fall" ? "Free fall → a_y = −g → N = 0." : `a_y = ${ay > 0 ? "+" : ""}${toSigFigs(ay, 3)} m/s².`,
      ],
      solution: [
        {
          text:
            variant === "constant"
              ? "Constant velocity means zero acceleration, so the scale reads the true weight."
              : variant === "free-fall"
                ? "In free fall the elevator and person both accelerate at g; the scale exerts no force — apparent weightlessness."
                : "Newton's second law in the vertical direction, up positive.",
          latex: `N = m(g + a_y) = (${m})(9.80 ${ay >= 0 ? "+" : "-"} ${fx(Math.abs(ay))}) = ${fx(N)}\\ \\text{N}`,
          equationId: "newton-2",
          value: toSigFigs(N, 4),
        },
      ],
      note: `True weight mg = ${fx(mg)} N.`,
    };
  },
};
