import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, toDeg } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, withParts } from "../helpers";

/**
 * Horizontal launch from height h.
 *  "distance": given v0 (maybe km/h) and h → t and landing distance. Lecture #36: 500 km/h at 800 m → 1779 m (≈1775 with g = 9.80).
 *  "speed-from-landing": given h and landing distance → t, v0, impact speed & angle. Waymo: 20.0 m, 30.0 m → 2.02 s, 14.8 m/s, 24.8 m/s.
 */
export function solve(p: { v0: number; h: number }): { t: number; x: number; vy: number; v: number; angleBelow: number } {
  const t = Math.sqrt((2 * p.h) / g);
  const vy = g * t;
  return { t, x: p.v0 * t, vy, v: Math.hypot(p.v0, vy), angleBelow: toDeg(Math.atan2(vy, p.v0)) };
}

type Variant = "distance" | "speed-from-landing";

export const template: QuestionTemplate = {
  id: "e1.projectiles.horizontal-launch",
  topicId: "e1.projectiles",
  title: "Horizontal launch off a table / cliff / plane (multi-part)",
  source: "Ch 4 lecture — Problem #36 crate from a plane (1779 m); Example 4 Waymo (2.02 s, 14.8 m/s, 24.8 m/s)",
  kind: "numeric",
  difficulty: 2,
  variants: ["distance", "speed-from-landing"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    if (variant === "distance") {
      const skin = rng.pick([
        { text: "An airplane flying horizontally", obj: "drops a crate", kmh: true, vMin: 150, vMax: 700, hMin: 200, hMax: 2000 },
        { text: "A ball rolls off a table", obj: "and leaves the edge horizontally", kmh: false, vMin: 1, vMax: 5, hMin: 0.6, hMax: 1.5 },
        { text: "A stunt car drives off a cliff", obj: "horizontally", kmh: true, vMin: 40, vMax: 120, hMin: 10, hMax: 80 },
        { text: "A skier leaves a horizontal ramp", obj: "", kmh: false, vMin: 8, vMax: 25, hMin: 3, hMax: 20 },
      ]);
      const vShown = skin.kmh ? nice(rng, skin.vMin, skin.vMax, 10) : nice(rng, skin.vMin, skin.vMax, 0.1);
      const v0 = skin.kmh ? vShown / 3.6 : vShown;
      const h = nice(rng, skin.hMin, skin.hMax, skin.hMax > 100 ? 10 : 0.1);
      const s = solve({ v0, h });
      const parts: QuestionPart[] = [
        {
          label: "(a)",
          prompt: "How long is it in the air?",
          target: { symbol: "t", unit: "s", label: "time in the air" },
          answer: toSigFigs(s.t, 4),
          choices: buildNumericChoices(rng, s.t, [
            { errorId: "kinematics-missing-half", value: Math.sqrt(h / g) },
            { errorId: "forgot-sqrt", value: (2 * h) / g },
            { errorId: "arithmetic-slip", value: h / v0 },
            { errorId: "arithmetic-slip", value: s.t * 2 },
          ]),
          solution: [{ text: "Vertical motion starts with v₀y = 0, so the fall time is the same as for a dropped object.", latex: `h = \\tfrac12 g t^2 \;\\Rightarrow\; t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${h})}{9.80}} = ${fx(s.t)}\\ \\text{s}`, equationId: "projectile-components", value: toSigFigs(s.t, 4) }],
        },
        {
          label: "(b)",
          prompt: "How far horizontally from the launch point does it land?",
          target: { symbol: "x", unit: "m", label: "horizontal distance" },
          answer: toSigFigs(s.x, 4),
          choices: buildNumericChoices(rng, s.x, [
            ...(skin.kmh ? [{ errorId: "kmh-not-converted", value: vShown * s.t }] : [{ errorId: "kinematics-missing-half", value: v0 * Math.sqrt(h / g) }]),
            { errorId: "arithmetic-slip", value: 0.5 * v0 * s.t },
            { errorId: "arithmetic-slip", value: v0 * s.t * s.t },
            { errorId: "height-vs-range", value: h },
          ]),
          solution: [
            ...(skin.kmh ? [{ text: "Convert the speed.", latex: `v_0 = \\frac{${vShown}}{3.6} = ${fx(v0)}\\ \\text{m/s}`, equationId: "unit-conversion", value: v0 }] : []),
            { text: "Horizontal velocity is constant.", latex: `x = v_0 t = (${fx(v0)})(${fx(s.t)}) = ${fx(s.x)}\\ \\text{m}`, equationId: "projectile-components", value: toSigFigs(s.x, 4) },
          ],
        },
      ];
      return withParts(
        {
          templateId: this.id,
          seed: rng.seed,
          variant,
          prompt: `${skin.text} at ${q(vShown, skin.kmh ? "km/h" : "m/s")} ${skin.obj} from a height of ${q(h, "m")}. Neglect air resistance.`,
          diagram: { kind: "projectile", launchHeight: 1, angleDeg: 0, heightLabel: `h = ${h} m`, rangeLabel: "x = ?" },
          givens: [
            { symbol: "v_0", value: vShown, unit: skin.kmh ? "km/h" : "m/s", note: "horizontal" },
            { symbol: "h", value: h, unit: "m" },
          ],
          equations: [...(skin.kmh ? ["unit-conversion"] : []), "projectile-components", "kin-x"],
          recipe: [...(skin.kmh ? ["km/h → m/s"] : []), "v₀y = 0: time from h = ½gt²", "x = v₀ t (a_x = 0)"],
          hints: ["Horizontal launch: the initial velocity is entirely horizontal, so v₀y = 0.", "Vertical motion gives the time; horizontal motion gives the distance.", `t = √(2 × ${h} / 9.80).`],
        },
        parts,
      );
    }
    const h = nice(rng, 5, 60, 0.5);
    const x = nice(rng, 5, 120, 0.5);
    const t = Math.sqrt((2 * h) / g);
    const v0 = x / t;
    const s = solve({ v0, h });
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "How long was it in the air?",
        target: { symbol: "t", unit: "s", label: "time in the air" },
        answer: toSigFigs(t, 4),
        choices: buildNumericChoices(rng, t, [
          { errorId: "kinematics-missing-half", value: Math.sqrt(h / g) },
          { errorId: "forgot-sqrt", value: (2 * h) / g },
          { errorId: "arithmetic-slip", value: Math.sqrt((2 * x) / g) },
        ]),
        solution: [{ text: "Vertical fall from rest.", latex: `t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${h})}{9.80}} = ${fx(t)}\\ \\text{s}`, equationId: "projectile-components", value: toSigFigs(t, 4) }],
      },
      {
        label: "(b)",
        prompt: "What was its speed when it left the edge?",
        target: { symbol: "v_0", unit: "m/s", label: "launch speed" },
        answer: toSigFigs(v0, 4),
        choices: buildNumericChoices(rng, v0, [
          { errorId: "kinematics-missing-half", value: x / Math.sqrt(h / g) },
          { errorId: "arithmetic-slip", value: x / (t * t) },
          { errorId: "arithmetic-slip", value: s.v },
        ]),
        solution: [{ text: "Constant horizontal velocity.", latex: `v_0 = \\frac{x}{t} = \\frac{${x}}{${fx(t)}} = ${fx(v0)}\\ \\text{m/s}`, equationId: "projectile-components", value: toSigFigs(v0, 4) }],
      },
      {
        label: "(c)",
        prompt: "What was its speed just before impact?",
        target: { symbol: "v", unit: "m/s", label: "impact speed" },
        answer: toSigFigs(s.v, 4),
        choices: buildNumericChoices(rng, s.v, [
          { errorId: "vector-magnitudes-added", value: v0 + s.vy },
          { errorId: "vy-nonzero-at-top", value: v0 },
          { errorId: "arithmetic-slip", value: s.vy },
          { errorId: "forgot-sqrt", value: v0 * v0 + s.vy * s.vy },
        ]),
        solution: [
          { text: "Vertical velocity at impact.", latex: `v_y = g t = (9.80)(${fx(t)}) = ${fx(s.vy)}\\ \\text{m/s (down)}`, equationId: "kin-v", value: s.vy },
          { text: "Combine with the unchanged horizontal velocity.", latex: `v = \\sqrt{v_0^2 + v_y^2} = \\sqrt{(${fx(v0)})^2 + (${fx(s.vy)})^2} = ${fx(s.v)}\\ \\text{m/s}`, equationId: "vec-magnitude", value: toSigFigs(s.v, 4) },
        ],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        variant,
        prompt: `A car drives horizontally off a cliff ${q(h, "m")} high and lands ${q(x, "m")} from the base of the cliff.`,
        diagram: { kind: "projectile", launchHeight: 1, angleDeg: 0, heightLabel: `h = ${h} m`, rangeLabel: `x = ${x} m` },
        givens: [
          { symbol: "h", value: h, unit: "m" },
          { symbol: "x", value: x, unit: "m" },
        ],
        equations: ["projectile-components", "kin-v", "vec-magnitude"],
        recipe: ["Time from the vertical drop: t = √(2h/g)", "v₀ = x/t", "Impact: v_y = gt, v = √(v₀² + v_y²)"],
        hints: ["The vertical motion knows nothing about the horizontal speed — get t from h alone.", "Then the horizontal distance gives v₀.", `t = ${fx(t)} s.`],
      },
      parts,
    );
  },
};
