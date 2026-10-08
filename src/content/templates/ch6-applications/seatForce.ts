import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { g } from "../../constants";
import { chooseVariant, q, fx } from "../helpers";

/**
 * Normal (seat) force or string tension at the top/bottom of a vertical circle.
 *   bottom (all cases):             N − mg = mv²/r → N = m(v²/r + g)
 *   top, contact force TOWARD center (inside a loop, ball on string, bucket):
 *                                   N + mg = mv²/r → N = m(v²/r − g)   (needs v² ≥ gr)
 *   top, contact force AWAY from center (seat under the rider: Ferris wheel):
 *                                   mg − N = mv²/r → N = m(g − v²/r)   (needs v² ≤ gr)
 * Lecture: 40.0 kg, r = 7.00 m, v = 10.0 at top → 179 N; v = 10.5 at bottom → 290 N.
 * Ferris wheel: r = 10.0 m, v = 3.00 m/s → N_bot = 1.09 mg, N_top = 0.907 mg.
 */
export interface SeatForceParams {
  m: number;
  r: number;
  v: number;
  at: "top" | "bottom";
  /** At the top, does the contact force point toward the center (inside loop / string) or away (seat under rider)? Default "toward". */
  topContact?: "toward" | "away";
}
export function solve(p: SeatForceParams): { N: number; ratio: number; ac: number } {
  const ac = (p.v * p.v) / p.r;
  const away = (p.topContact ?? "toward") === "away";
  const N = p.at === "bottom" ? p.m * (ac + g) : away ? p.m * (g - ac) : p.m * (ac - g);
  return { N, ratio: N / (p.m * g), ac };
}

type Variant = "top-N" | "bottom-N" | "top-ratio" | "bottom-ratio";
const SKINS: { who: string; force: string; F: string; r: number[]; v: number[]; topContact: "toward" | "away" }[] = [
  { who: "a child in a roller-coaster car going around the inside of a vertical loop", force: "the car seat on the child", F: "N", r: [5, 12], v: [8, 16], topContact: "toward" },
  { who: "a rider sitting on a Ferris-wheel seat", force: "the seat on the rider", F: "N", r: [8, 20], v: [2, 6], topContact: "away" },
  { who: "a bucket of water swung on a rope", force: "the rope (its tension)", F: "T", r: [0.8, 1.5], v: [3, 7], topContact: "toward" },
  { who: "a ball on a string", force: "the string (its tension)", F: "T", r: [0.5, 1.2], v: [3, 6], topContact: "toward" },
];

export const template: QuestionTemplate = {
  id: "ch6.vertical-circle.seat-force",
  topicId: "ch6.vertical-circle",
  title: "Seat force / tension at the top or bottom of a vertical circle",
  source: "Ch 6b lecture — roller coaster #73 (179 N top, 290 N bottom); Ferris wheel (1.09 mg, 0.907 mg)",
  kind: "numeric",
  difficulty: 2,
  variants: ["top-N", "bottom-N", "top-ratio", "bottom-ratio"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const skin = rng.pick(SKINS);
    const at: "top" | "bottom" = variant.startsWith("top") ? "top" : "bottom";
    const ratioMode = variant.endsWith("ratio");
    const away = skin.topContact === "away";
    const p = rejectUntil(
      () => ({ m: nice(rng, 0.5, 80, 0.5), r: nice(rng, skin.r[0]!, skin.r[1]!, 0.1), v: nice(rng, skin.v[0]!, skin.v[1]!, 0.1), at, topContact: skin.topContact }),
      (c) => {
        const s = solve(c);
        return s.N > 0.05 * c.m * g && Math.abs(s.ratio - 1) > 0.04; // stays in contact, and clearly ≠ mg
      },
    );
    const s = solve(p);
    const mg = p.m * g;
    // the sign-error distractor: flip the relative sign of mg
    const wrongSign = p.at === "bottom" ? p.m * (s.ac - g) : away ? p.m * (s.ac + g) : p.m * (s.ac + g);
    const topLatexSetup = away ? `mg - ${skin.F} = m\\frac{v^2}{r} \\;\\Rightarrow\\; ${skin.F} = m\\left(g - \\frac{v^2}{r}\\right) = (${p.m})(9.80 - ${fx(s.ac)}) = ${fx(s.N)}\\ \\text{N}` : `${skin.F} + mg = m\\frac{v^2}{r} \\;\\Rightarrow\\; ${skin.F} = m\\left(\\frac{v^2}{r} - g\\right) = (${p.m})(${fx(s.ac)} - 9.80) = ${fx(s.N)}\\ \\text{N}`;
    const ratioText = ratioMode ? " Express your answer as a multiple of the weight mg." : "";
    const answer = ratioMode ? s.ratio : s.N;
    const unit = ratioMode ? "mg" : "N";
    const cands = ratioMode
      ? [
          { errorId: "top-bottom-loop-sign", value: wrongSign / mg },
          { errorId: "normal-equals-mg", value: 1 },
          { errorId: "centripetal-only", value: s.ac / g },
          { errorId: "forgot-square", value: p.at === "bottom" ? p.v / p.r / g + 1 : away ? 1 - p.v / p.r / g : p.v / p.r / g - 1 },
        ]
      : [
          { errorId: "top-bottom-loop-sign", value: Math.abs(wrongSign) },
          { errorId: "normal-equals-mg", value: mg },
          { errorId: "centripetal-only", value: p.m * s.ac },
          { errorId: "forgot-square", value: p.m * Math.abs(p.v / p.r + (p.at === "bottom" ? g : away ? -g : -g)) },
          { errorId: "mass-not-weight", value: Math.abs(p.at === "bottom" ? s.ac + g : away ? g - s.ac : s.ac - g) },
        ];
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `${cap(skin.who)} (mass ${q(p.m, "kg")}) moves in a vertical circle of radius ${q(p.r, "m")}. At the ${p.at} of the circle the speed is ${q(p.v, "m/s")}. What is the magnitude of the force exerted by ${skin.force} at that point?${ratioText}`,
      diagram: { kind: "loop", point: p.at, radiusLabel: `r = ${p.r} m`, forceLabel: skin.F, topContactUp: away },
      givens: [
        { symbol: "m", value: p.m, unit: "kg" },
        { symbol: "r", value: p.r, unit: "m" },
        { symbol: "v", value: p.v, unit: "m/s" },
      ],
      target: { symbol: skin.F, unit, label: `${skin.F === "N" ? "seat force" : "tension"} at the ${p.at}` + (ratioMode ? " (as a multiple of mg)" : "") },
      answer: toSigFigs(answer, 4),
      choices: buildNumericChoices(rng, answer, cands),
      equations: ["ac-v2-over-r", "sum-fc", "vertical-circle"],
      recipe: [
        "Draw the FBD at that point: contact force + weight, both vertical",
        p.at === "bottom" ? "Bottom: N up (toward center), mg down → N − mg = mv²/r" : away ? "Top of a Ferris wheel: the seat pushes UP (away from center), mg down → mg − N = mv²/r" : "Top inside a loop: both forces point toward the center → N + mg = mv²/r",
        p.at === "bottom" ? "N = m(v²/r + g)" : away ? "N = m(g − v²/r)" : "N = m(v²/r − g)",
        ...(ratioMode ? ["Divide by mg"] : []),
      ],
      hints: [
        "The net force toward the center must be mv²/r. Which of the two forces (contact, weight) point toward the center here?",
        p.at === "bottom" ? "At the bottom the center is ABOVE: the seat force points up (toward the center) and gravity points down." : away ? "At the top of a Ferris wheel the seat is UNDER the rider, so it pushes up (away from the center) while gravity points down toward the center." : "At the top the center is BELOW: both the contact force and gravity point down (toward the center).",
        `v²/r = ${toSigFigs(s.ac, 3)} m/s², g = 9.80 m/s².`,
      ],
      solution: [
        { text: "Centripetal acceleration at that point.", latex: `a_c = \\frac{v^2}{r} = \\frac{(${p.v})^2}{${p.r}} = ${fx(s.ac)}\\ \\text{m/s}^2`, equationId: "ac-v2-over-r", value: s.ac },
        {
          text: p.at === "bottom" ? "At the bottom, the contact force points toward the center and the weight away from it." : away ? "At the top of a Ferris wheel the seat force points UP (away from the center) and the weight points down (toward it): the net inward force is mg − N." : "At the top inside the loop, both the contact force and the weight point toward the center.",
          latex: p.at === "bottom" ? `${skin.F} - mg = m\\frac{v^2}{r} \\;\\Rightarrow\\; ${skin.F} = m\\left(\\frac{v^2}{r} + g\\right) = (${p.m})(${fx(s.ac)} + 9.80) = ${fx(s.N)}\\ \\text{N}` : topLatexSetup,
          equationId: "vertical-circle",
          value: ratioMode ? undefined : toSigFigs(s.N, 4),
        },
        ...(ratioMode ? [{ text: "As a multiple of the weight.", latex: `\\frac{${skin.F}}{mg} = ${p.at === "bottom" ? "1 + \\frac{v^2}{rg}" : away ? "1 - \\frac{v^2}{rg}" : "\\frac{v^2}{rg} - 1"} = ${fx(s.ratio)}`, equationId: "vertical-circle", value: toSigFigs(s.ratio, 4) }] : []),
      ],
      note: p.at === "bottom" ? "The rider feels heavier at the bottom." : away ? "The rider feels lighter at the top; at v = √(gr) the seat force would vanish and the rider would lift off." : "At v = √(gr) the contact force drops to zero — the minimum speed to stay on the track.",
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
