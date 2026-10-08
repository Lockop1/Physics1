import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

/** Conceptual ratio questions on F = G m1 m2 / r². */
interface Case {
  change: string;
  factor: number; // new/old
}
const CASES: Case[] = [
  { change: "the distance between them is doubled", factor: 1 / 4 },
  { change: "the distance between them is tripled", factor: 1 / 9 },
  { change: "the distance between them is halved", factor: 4 },
  { change: "the distance between them is quadrupled", factor: 1 / 16 },
  { change: "one of the masses is doubled", factor: 2 },
  { change: "both masses are doubled", factor: 4 },
  { change: "one mass is doubled and the distance is doubled", factor: 1 / 2 },
  { change: "both masses are doubled and the distance is doubled", factor: 1 },
  { change: "one mass is tripled and the distance is tripled", factor: 1 / 3 },
  { change: "the distance is reduced to one third", factor: 9 },
];

export function factorLabel(f: number): string {
  if (f === 1) return "unchanged (×1)";
  if (f > 1) return `${Number.isInteger(f) ? f : f.toFixed(2)} times as large`;
  const inv = Math.round(1 / f);
  return `1/${inv} as large`;
}

export const template: QuestionTemplate = {
  id: "ch13.universal.ratio",
  topicId: "ch13.universal",
  title: "Scaling F = Gm₁m₂/r² (distance ×2, mass ×2, …)",
  source: "Exam 2 Review — Ch 13 ratio questions (distance doubled → force ÷ 4)",
  kind: "conceptual",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const c = rng.pick(CASES);
    const pair = rng.pick(["two asteroids", "Earth and a satellite", "two bowling balls", "the Sun and a planet", "two people"]);
    const answer = factorLabel(c.factor);
    const linear = ratioLinear(c);
    const candidates: { f: number; errorId: string }[] = [
      { f: linear, errorId: "inverse-not-inverse-square" },
      { f: 1 / c.factor, errorId: "ratio-inverted" },
      { f: c.factor * 2, errorId: "arithmetic-slip" },
      { f: c.factor / 2, errorId: "arithmetic-slip" },
      { f: c.factor * 4, errorId: "arithmetic-slip" },
      { f: c.factor / 4, errorId: "arithmetic-slip" },
      { f: 2, errorId: "arithmetic-slip" },
      { f: 0.5, errorId: "arithmetic-slip" },
    ];
    const seen = new Set<string>([answer]);
    const wrong: { value: string; errorId: string }[] = [];
    for (const cand of candidates) {
      const label = factorLabel(cand.f);
      if (seen.has(label)) continue;
      seen.add(label);
      wrong.push({ value: label, errorId: cand.errorId });
      if (wrong.length === 4) break;
    }
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `The gravitational force between ${pair} is F. If ${c.change}, the new force is`,
      givens: [],
      target: { symbol: "F'/F", unit: "", label: "factor by which the force changes" },
      answer,
      choices: buildStringChoices(rng, answer, wrong),
      equations: ["grav-force"],
      recipe: ["Write F' = G(m₁')(m₂')/(r')²", "Substitute the multiples", "Divide by F"],
      hints: ["Gravity is proportional to each mass and INVERSELY proportional to the SQUARE of the distance.", "Doubling r divides F by 2² = 4; doubling a mass doubles F.", `Apply each change in turn: ${c.change}.`],
      solution: [
        {
          text: `F ∝ m₁m₂/r². ${c.change.charAt(0).toUpperCase() + c.change.slice(1)}, so the force becomes ${answer}.`,
          latex: "F' = \\frac{G(m_1')(m_2')}{(r')^2}",
          equationId: "grav-force",
        },
      ],
    };
  },
};

/** What a 1/r (instead of 1/r²) scaling would give for the same change. */
function ratioLinear(c: Case): number {
  const m = /distance[^0-9]*(doubled|tripled|halved|quadrupled|one third)/.exec(c.change);
  const massFactor = c.change.includes("both masses are doubled") ? 4 : c.change.includes("mass is doubled") ? 2 : c.change.includes("mass is tripled") ? 3 : 1;
  const rFactor = !m ? 1 : m[1] === "doubled" ? 2 : m[1] === "tripled" ? 3 : m[1] === "halved" ? 0.5 : m[1] === "quadrupled" ? 4 : 1 / 3;
  return massFactor / rFactor;
}
