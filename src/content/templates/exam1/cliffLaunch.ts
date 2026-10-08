import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD, withParts } from "../helpers";

/**
 * Launched from a cliff of height H at angle θ (above, or below, the horizontal).
 * Lecture Example 3: 20.0 m/s at 30° above from 45.0 m → 4.22 s, 35.8 m/s.
 * Kilauea: 25 m/s at 35° from 20 m → 3.96 s, 31.9 m/s at −50°.
 * #46 secret agent: 16.68 m/s at 30° BELOW, drop 100 m → 3.75 s, 54 m (< 60 m gorge).
 */
export function solve(p: { v0: number; theta: number; H: number }): { v0x: number; v0y: number; t: number; x: number; vy: number; v: number; angleBelow: number } {
  const v0x = p.v0 * cosD(p.theta);
  const v0y = p.v0 * sinD(p.theta);
  // -H = v0y t - ½ g t²  →  ½g t² - v0y t - H = 0
  const t = (v0y + Math.sqrt(v0y * v0y + 2 * g * p.H)) / g;
  const vy = v0y - g * t;
  return { v0x, v0y, t, x: v0x * t, vy, v: Math.hypot(v0x, vy), angleBelow: toDeg(Math.atan2(-vy, v0x)) };
}

type Variant = "above" | "below" | "from-vertical";

export const template: QuestionTemplate = {
  id: "e1.projectiles.cliff-launch",
  topicId: "e1.projectiles",
  title: "Launched from a cliff at an angle (above, below, or from the vertical; speed sometimes in km/h) — multi-part",
  source: "Ch 4 lecture — Example 3 stone from a building (4.22 s, 35.8 m/s); Kilauea rock (3.96 s, 31.9 m/s at −50°); #46 ski jump (gorge)",
  kind: "numeric",
  difficulty: 3,
  variants: ["above", "below", "from-vertical"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const useKmh = rng.chance(0.3);
    const vShown = useKmh ? nice(rng, 40, 120, 5) : nice(rng, 10, 30, 0.5);
    const v0 = useKmh ? toSigFigs(vShown / 3.6, 4) : vShown;
    const H = nice(rng, 15, 100, 1);
    const angAbove = rng.pick([20, 25, 30, 35, 40, 45, 50, 60]);
    const theta = variant === "below" ? -angAbove : angAbove;
    const s = solve({ v0, theta, H });
    const angleShown = variant === "from-vertical" ? 90 - angAbove : angAbove;
    const angleText = variant === "from-vertical" ? `$${angleShown}^\\circ$ from the VERTICAL` : variant === "below" ? `$${angAbove}^\\circ$ BELOW the horizontal` : `$${angAbove}^\\circ$ above the horizontal`;
    const skin = rng.pick(["A stone is thrown", "A rock is ejected from a volcano", "A skier launches", "A ball is kicked"]);
    const swapped = solve({ v0, theta: Math.sign(theta) * (90 - Math.abs(theta)), H });
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "How long does it take to reach the ground?",
        target: { symbol: "t", unit: "s", label: "time to the ground" },
        answer: toSigFigs(s.t, 4),
        choices: buildNumericChoices(rng, s.t, [
          { errorId: variant === "from-vertical" ? "angle-complement" : "sin-cos-swap", value: swapped.t },
          { errorId: "quadratic-wrong-root", value: Math.abs((s.v0y - Math.sqrt(s.v0y * s.v0y + 2 * g * H)) / g) || s.t / 3 },
          { errorId: "range-missing-factor-2", value: Math.abs(s.v0y) / g || s.t / 2 },
          ...(useKmh ? [{ errorId: "kmh-not-converted", value: solve({ v0: vShown, theta, H }).t }] : [{ errorId: "arithmetic-slip", value: Math.sqrt((2 * H) / g) }]),
        ]),
        solution: [
          ...(useKmh ? [{ text: "Convert the speed.", latex: `v_0 = \\frac{${vShown}}{3.6} = ${fx(v0)}\\ \\text{m/s}`, equationId: "unit-conversion", value: v0 }] : []),
          { text: `Components (angle from the horizontal = ${theta}°).`, latex: `v_{0x} = v_0\\cos\\theta = ${fx(s.v0x)},\\qquad v_{0y} = v_0\\sin\\theta = ${fx(s.v0y)}\\ \\text{m/s}`, equationId: "projectile-components" },
          { text: "Vertical motion from y₀ = 0 to y = −H; solve the quadratic and keep the positive root.", latex: `-${H} = ${fx(s.v0y)}\\,t - 4.90\\,t^2 \;\\Rightarrow\; t = ${fx(s.t)}\\ \\text{s}`, equationId: "kin-x", value: toSigFigs(s.t, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "How far from the base of the cliff does it land?",
        target: { symbol: "x", unit: "m", label: "horizontal distance" },
        answer: toSigFigs(s.x, 4),
        choices: buildNumericChoices(rng, s.x, [
          { errorId: "used-full-speed-as-component", value: v0 * s.t },
          { errorId: variant === "from-vertical" ? "angle-complement" : "sin-cos-swap", value: swapped.x },
          { errorId: "arithmetic-slip", value: s.x / 2 },
          { errorId: "height-vs-range", value: H },
        ]),
        solution: [{ text: "Constant horizontal velocity for the whole flight.", latex: `x = v_{0x} t = (${fx(s.v0x)})(${fx(s.t)}) = ${fx(s.x)}\\ \\text{m}`, equationId: "projectile-components", value: toSigFigs(s.x, 4) }],
      },
      {
        label: "(c)",
        prompt: "What is its speed just before it hits the ground?",
        target: { symbol: "v", unit: "m/s", label: "impact speed" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "vector-magnitudes-added", value: s.v0x + Math.abs(s.vy) },
          { errorId: "arithmetic-slip", value: Math.abs(s.vy) },
          { errorId: "vy-nonzero-at-top", value: s.v0x },
          { errorId: "forgot-sqrt", value: s.v0x * s.v0x + s.vy * s.vy },
        ]),
        solution: [
          { text: "Vertical velocity at impact.", latex: `v_y = v_{0y} - g t = ${fx(s.v0y)} - (9.80)(${fx(s.t)}) = ${fx(s.vy)}\\ \\text{m/s}`, equationId: "kin-v", value: s.vy },
          { text: "Combine with v_x = v₀x.", latex: `v = \\sqrt{v_x^2 + v_y^2} = \\sqrt{(${fx(s.v0x)})^2 + (${fx(s.vy)})^2} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "vec-magnitude", value: toSigFigs(s.v, 4) },
        ],
        hints: [`The direction is ${fx(s.angleBelow)}° below the horizontal.`],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `${skin} from the top of a cliff ${q(H, "m")} high with an initial speed of ${q(vShown, useKmh ? "km/h" : "m/s")} directed ${angleText}. Neglect air resistance.`,
        diagram: { kind: "projectile", launchHeight: 1, angleDeg: theta, angleLabel: `${angleShown}°`, angleFromVertical: variant === "from-vertical", heightLabel: `H = ${H} m`, rangeLabel: "x" },
        givens: [
          { symbol: "v_0", value: vShown, unit: useKmh ? "km/h" : "m/s" },
          { symbol: "\\theta", value: angleShown, unit: "°", note: variant === "from-vertical" ? "from vertical" : variant === "below" ? "below horizontal" : "above horizontal" },
          { symbol: "H", value: H, unit: "m" },
        ],
        equations: [...(useKmh ? ["unit-conversion"] : []), "projectile-components", "kin-x", "kin-v", "vec-magnitude"],
        recipe: [
          ...(useKmh ? ["km/h → m/s"] : []),
          variant === "from-vertical" ? "Angle from horizontal = 90° − angle from vertical" : variant === "below" ? "Downward launch: v₀y is NEGATIVE" : "v₀x = v₀ cos θ, v₀y = v₀ sin θ",
          "y: −H = v₀y t − ½gt² → quadratic → positive t",
          "x = v₀x t; impact v from v_x and v_y = v₀y − gt",
        ],
        hints: [
          "Split into x (constant velocity) and y (free fall). Time comes from y.",
          variant === "from-vertical" ? "The angle is from the VERTICAL: v₀y = v₀ cos(angle), v₀x = v₀ sin(angle)." : variant === "below" ? "Launched downward: the initial vertical velocity is negative." : "Set y = −H (below the launch point) and solve the quadratic for t.",
          `v₀x = ${fx(s.v0x)} m/s, v₀y = ${fx(s.v0y)} m/s.`,
        ],
      },
      parts,
    );
  },
};
