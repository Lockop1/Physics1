import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/** v_min = √(gr) at the top of a loop (N = 0). Lecture: r = 7.00 m → 8.28 m/s. */
export function solve(p: { r: number }): { vmin: number } {
  return { vmin: Math.sqrt(g * p.r) };
}

type Variant = "v" | "r";
const SKINS = [
  { thing: "a roller-coaster car", keep: "stay on the track (seat force ≥ 0)" },
  { thing: "a bucket of water swung in a vertical circle", keep: "keep the water from falling out" },
  { thing: "a ball on a string swung in a vertical circle", keep: "keep the string taut" },
  { thing: "a motorcycle in a 'globe of death'", keep: "stay in contact with the cage" },
];

export const template: QuestionTemplate = {
  id: "ch6.vertical-circle.min-speed",
  topicId: "ch6.vertical-circle",
  title: "Minimum speed at the top of a loop",
  source: "Ch 6b lecture — roller coaster #73(c): r = 7.00 m → v_min = 8.28 m/s",
  kind: "numeric",
  difficulty: 2,
  variants: ["v", "r"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const giveDiameter = rng.chance(0.3);
    const m = nice(rng, 0.5, 500, 0.5);
    if (variant === "v") {
      const r = nice(rng, 0.8, 15, 0.1);
      const { vmin } = solve({ r });
      const d = toSigFigs(2 * r, 3);
      return {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `What is the minimum speed ${skin.thing} (mass ${q(m, "kg")}) must have at the top of a vertical circle of ${giveDiameter ? `diameter ${q(d, "m")}` : `radius ${q(r, "m")}`} in order to ${skin.keep}?`,
        diagram: { kind: "loop", point: "top", radiusLabel: giveDiameter ? `d = ${d} m` : `r = ${r} m`, caption: "at v_min the contact force is zero" },
        givens: [
          { symbol: "m", value: m, unit: "kg", note: "not needed" },
          giveDiameter ? { symbol: "d", value: d, unit: "m", note: "diameter" } : { symbol: "r", value: r, unit: "m" },
        ],
        target: { symbol: "v_{\\min}", unit: "m/s", label: "minimum speed at the top" },
        answer: toSigFigs(vmin, 4),
        choices: buildNumericChoices(rng, vmin, [
          { errorId: "forgot-sqrt", value: g * r },
          ...(giveDiameter ? [{ errorId: "diameter-as-radius", value: Math.sqrt(g * d) }] : [{ errorId: "arithmetic-slip", value: Math.sqrt(2 * g * r) }]),
          { errorId: "top-bottom-loop-sign", value: Math.sqrt(2 * g * r) },
          { errorId: "mass-not-weight", value: Math.sqrt(m * r) },
        ]),
        equations: ["vertical-circle", "vmin-loop"],
        recipe: ["At the top: N + mg = mv²/r", "Minimum speed ⇔ N = 0 (about to lose contact)", "mg = mv²/r → v_min = √(gr)"],
        hints: [
          "'Minimum speed' means the contact force (seat / string / cage) just drops to zero.",
          "With N = 0 at the top, gravity alone supplies the centripetal force: mg = mv²/r.",
          `v = √(9.80 × ${r}).`,
        ],
        solution: [
          ...(giveDiameter ? [{ text: "Radius from the diameter.", latex: `r = \\frac{d}{2} = ${r}\\ \\text{m}`, value: r }] : []),
          { text: "At the top with the contact force zero, gravity is the only centripetal force.", latex: `mg = \\frac{mv_{\\min}^2}{r} \;\\Rightarrow\; v_{\\min} = \\sqrt{gr} = \\sqrt{(9.80)(${r})} = ${fx(vmin)}\\ \\text{m/s}`, equationId: "vmin-loop", value: toSigFigs(vmin, 4) },
        ],
        note: "The mass cancels — the minimum speed is the same for any rider.",
      };
    }
    const vmin = nice(rng, 3, 14, 0.1);
    const r = (vmin * vmin) / g;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${cap(skin.thing)} (mass ${q(m, "kg")}) is found to just barely ${skin.keep} at the top of a vertical loop when its speed there is ${q(vmin, "m/s")}. What is the radius of the loop?`,
      diagram: { kind: "loop", point: "top", radiusLabel: "r = ?" },
      givens: [
        { symbol: "m", value: m, unit: "kg", note: "not needed" },
        { symbol: "v_{\\min}", value: vmin, unit: "m/s" },
      ],
      target: { symbol: "r", unit: "m", label: "radius of the loop" },
      answer: toSigFigs(r, 4),
      choices: buildNumericChoices(rng, r, [
        { errorId: "forgot-square", value: vmin / g },
        { errorId: "top-bottom-loop-sign", value: (vmin * vmin) / (2 * g) },
        { errorId: "mass-not-weight", value: (vmin * vmin) / m },
        { errorId: "arithmetic-slip", value: r * 2 },
      ]),
      equations: ["vertical-circle", "vmin-loop"],
      recipe: ["'Just barely' ⇔ N = 0 at the top", "mg = mv²/r → r = v²/g"],
      hints: ["Just barely staying in contact means the contact force is zero at the top.", "Then gravity alone provides mv²/r.", `r = ${vmin}²/9.80.`],
      solution: [{ text: "Invert v_min = √(gr).", latex: `r = \\frac{v_{\\min}^2}{g} = \\frac{(${vmin})^2}{9.80} = ${fx(r)}\\ \\text{m}`, equationId: "vmin-loop", value: toSigFigs(r, 4) }],
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
