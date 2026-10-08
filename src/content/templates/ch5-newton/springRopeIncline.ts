import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx, sinD, cosD } from "../helpers";

/**
 * Block at rest on a frictionless incline, spring at the top, rope at the bottom.
 * Rope pulls down-slope: kx = mg sin θ + T  (lecture: 10.0 kg, 30°, 330 N/m, 50.0 N → 0.30 m; SI Q23: 17.5 kg, 25°, 450, 75.0 → 0.328 m)
 * Rope pulls up-slope:   kx = mg sin θ − T
 */
export interface SpringRopeParams {
  m: number;
  theta: number;
  k: number;
  T: number;
  ropeDown: boolean;
}
export function solve(p: SpringRopeParams): { x: number; Fs: number } {
  const Fs = p.m * g * sinD(p.theta) + (p.ropeDown ? 1 : -1) * p.T;
  return { Fs, x: Fs / p.k };
}

type Variant = "rope-down" | "rope-up";

export const template: QuestionTemplate = {
  id: "ch5.springs.rope-incline",
  topicId: "ch5.springs",
  title: "Spring + rope on an incline → stretch (rope direction matters)",
  source: "Ch 6a lecture — Problem #6 (10.0 kg, 30°, 330 N/m, 50.0 N → 0.30 m); SI Q23",
  kind: "numeric",
  difficulty: 3,
  variants: ["rope-down", "rope-up"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const ropeDown = variant === "rope-down";
    const p = rejectUntil(
      () => ({ m: nice(rng, 2, 30, 0.5), theta: rng.pick([15, 20, 25, 30, 35, 40, 45]), k: nice(rng, 100, 900, 10), T: nice(rng, 10, 120, 5), ropeDown }),
      (c) => {
        const s = solve(c);
        return s.Fs > 5 && s.x > 0.03 && s.x < 1.5 && (ropeDown || c.T < 0.8 * c.m * g * sinD(c.theta));
      },
    );
    const s = solve(p);
    const mgSin = p.m * g * sinD(p.theta);
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A block of mass ${q(p.m, "kg")} is at rest on a frictionless incline of angle $${p.theta}^\\circ$. A spring of spring constant ${q(p.k, "N/m")} attached at the top of the incline holds it, while a taut rope at the ${ropeDown ? "bottom" : "top"} pulls on the block ${ropeDown ? "down" : "up"} the slope with tension ${q(p.T, "N")}. How far is the spring extended from its relaxed length?`,
      diagram: { kind: "incline", angleDeg: p.theta, spring: true, rope: ropeDown ? "down" : "up", massLabel: `${p.m} kg`, caption: "frictionless" },
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "\\theta", value: p.theta, unit: "°" },
        { symbol: "k", value: p.k, unit: "N/m" },
        { symbol: "T", value: p.T, unit: "N", note: ropeDown ? "pulls down-slope" : "pulls up-slope" },
      ],
      target: { symbol: "x", unit: "m", label: "spring extension" },
      answer: toSigFigs(s.x, 4),
      choices: buildNumericChoices(rng, s.x, [
        { errorId: "rope-direction-flip", value: Math.abs(mgSin - (ropeDown ? 1 : -1) * p.T) / p.k },
        { errorId: "incline-sin-cos-swap", value: (p.m * g * cosD(p.theta) + (ropeDown ? 1 : -1) * p.T) / p.k },
        { errorId: "forgot-gravity-component", value: p.T / p.k },
        { errorId: "normal-equals-mg", value: (p.m * g + (ropeDown ? 1 : -1) * p.T) / p.k },
      ]),
      equations: ["vec-components", "newton-2", "hooke"],
      recipe: ["Along the slope: spring force (up-slope) balances mg sin θ " + (ropeDown ? "+ T (both down-slope)" : "− T (rope helps the spring)"), `kx = mg sin θ ${ropeDown ? "+" : "−"} T`, "x = (…)/k"],
      hints: [
        "Three forces act along the slope: the spring (up), gravity's component mg sin θ (down), and the rope.",
        ropeDown ? "The rope pulls down-slope, so it ADDS to the gravity component the spring must hold." : "The rope pulls up-slope, so it helps the spring: the spring holds less.",
        `mg sin θ = ${toSigFigs(mgSin, 3)} N; spring force = ${toSigFigs(s.Fs, 3)} N.`,
      ],
      solution: [
        { text: "Gravity component along the slope.", latex: `mg\\sin\\theta = (${p.m})(9.80)\\sin${p.theta}^\\circ = ${fx(mgSin)}\\ \\text{N}`, equationId: "vec-components", value: mgSin },
        { text: `Equilibrium along the slope (up-slope positive): F_s − mg sin θ ${ropeDown ? "− T" : "+ T"} = 0.`, latex: `F_s = kx = mg\\sin\\theta ${ropeDown ? "+" : "-"} T = ${fx(mgSin)} ${ropeDown ? "+" : "-"} ${p.T} = ${fx(s.Fs)}\\ \\text{N}`, equationId: "newton-2", value: s.Fs },
        { text: "Hooke's law.", latex: `x = \\frac{F_s}{k} = \\frac{${fx(s.Fs)}}{${p.k}} = ${fx(s.x)}\\ \\text{m}`, equationId: "hooke", value: toSigFigs(s.x, 4) },
      ],
      note: "The normal force N = mg cos θ is perpendicular to the slope and doesn't enter the along-slope equation.",
    };
  },
};
