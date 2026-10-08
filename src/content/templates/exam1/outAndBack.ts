import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { q, fx, withParts } from "../helpers";

/** 1D out-and-back: d1 forward in t1, then d2 back in t2 → average velocity vs average speed. Lecture Example 1: 100 m (45 s) then 25 m back (10 s) → +1.36 m/s, 2.27 m/s. */
export function solve(p: { d1: number; t1: number; d2: number; t2: number }): { disp: number; dist: number; vAvg: number; speedAvg: number } {
  const disp = p.d1 - p.d2;
  const dist = p.d1 + p.d2;
  const T = p.t1 + p.t2;
  return { disp, dist, vAvg: disp / T, speedAvg: dist / T };
}

export const template: QuestionTemplate = {
  id: "e1.kin1d.out-and-back",
  topicId: "e1.kin1d",
  title: "Out and back on a line: average velocity vs average speed (multi-part)",
  source: "Ch 3 lecture — Example 1 (100 m in 45 s, then 25 m back in 10 s → v̄ = +1.36 m/s, average speed 2.27 m/s)",
  kind: "numeric",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const who = rng.pick(["A jogger", "A dog", "A delivery robot", "A student"]);
    const p = { d1: nice(rng, 40, 200, 5), t1: nice(rng, 20, 90, 1), d2: nice(rng, 10, 100, 5), t2: nice(rng, 5, 40, 1) };
    const s = solve(p);
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: "What is the average velocity for the whole trip (take the initial direction as positive)?",
        target: { symbol: "\\bar v", unit: "m/s", label: "average velocity" },
        answer: toSigFigs(s.vAvg, 4),
        choices: buildNumericChoices(rng, s.vAvg, [
          { errorId: "avg-speed-vs-velocity", value: s.speedAvg },
          { errorId: "displacement-vs-distance", value: s.dist / (p.t1 + p.t2) === s.speedAvg ? s.dist / p.t1 : s.dist / (p.t1 + p.t2) },
          { errorId: "arithmetic-slip", value: (p.d1 / p.t1 + -p.d2 / p.t2) / 2 },
          { errorId: "arithmetic-slip", value: p.d1 / p.t1 },
        ]),
        solution: [
          { text: "Displacement is the net change in position.", latex: `\\Delta x = ${p.d1} - ${p.d2} = ${fx(s.disp)}\\ \\text{m}`, equationId: "avg-velocity", value: s.disp },
          { text: "Divide by the TOTAL time.", latex: `\\bar v = \\frac{\\Delta x}{\\Delta t} = \\frac{${fx(s.disp)}}{${p.t1} + ${p.t2}} = ${fx(s.vAvg)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(s.vAvg, 4) },
        ],
      },
      {
        label: "(b)",
        prompt: "What is the average speed for the whole trip?",
        target: { symbol: "\\text{avg speed}", unit: "m/s", label: "average speed" },
        answer: toSigFigs(s.speedAvg, 4),
        choices: buildNumericChoices(rng, s.speedAvg, [
          { errorId: "avg-speed-vs-velocity", value: s.vAvg },
          { errorId: "arithmetic-slip", value: (p.d1 / p.t1 + p.d2 / p.t2) / 2 },
          { errorId: "displacement-vs-distance", value: Math.abs(s.disp) / (p.t1 + p.t2) === Math.abs(s.vAvg) ? s.dist / p.t1 : Math.abs(s.disp) / (p.t1 + p.t2) },
          { errorId: "arithmetic-slip", value: s.speedAvg * 2 },
        ]),
        solution: [{ text: "Total distance over total time.", latex: `\\text{avg speed} = \\frac{${p.d1} + ${p.d2}}{${p.t1} + ${p.t2}} = ${fx(s.speedAvg)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(s.speedAvg, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `${who} moves ${q(p.d1, "m")} along a straight path in ${q(p.t1, "s")}, then turns around and comes back ${q(p.d2, "m")} in ${q(p.t2, "s")}.`,
        givens: [
          { symbol: "d_1", value: p.d1, unit: "m" },
          { symbol: "t_1", value: p.t1, unit: "s" },
          { symbol: "d_2", value: p.d2, unit: "m", note: "back" },
          { symbol: "t_2", value: p.t2, unit: "s" },
        ],
        equations: ["avg-velocity"],
        recipe: ["Displacement = d₁ − d₂ (signed); distance = d₁ + d₂", "Average velocity = displacement / total time", "Average speed = distance / total time"],
        hints: ["Velocity cares about where you end up; speed cares about how far you went.", "Both use the TOTAL time, not the time of one leg.", `Δx = ${fx(s.disp)} m, distance = ${fx(s.dist)} m, Δt = ${p.t1 + p.t2} s.`],
      },
      parts,
    );
  },
};
