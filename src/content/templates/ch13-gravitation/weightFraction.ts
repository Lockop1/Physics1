import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";

/** ABCD card: capsule at height = R_E → weight ≈ ¼. Generalised to h = n R_E and r = n R_E. */
const CASES = [
  { text: "at a height above the surface equal to Earth's radius (h = R_E)", n: 2 },
  { text: "at a height above the surface equal to twice Earth's radius (h = 2R_E)", n: 3 },
  { text: "at a height above the surface equal to three times Earth's radius (h = 3R_E)", n: 4 },
  { text: "at a distance of 2R_E from Earth's center", n: 2 },
  { text: "at a distance of 3R_E from Earth's center", n: 3 },
  { text: "at a distance of 4R_E from Earth's center", n: 4 },
];

export const template: QuestionTemplate = {
  id: "ch13.g-altitude.weight-fraction",
  topicId: "ch13.g-altitude",
  title: "Weight at h = R_E (and other multiples) — conceptual",
  source: "Ch 6b lecture — ABCD card (capsule at height = R_E → one-fourth)",
  kind: "conceptual",
  difficulty: 1,
  generate(rng: Rng): GeneratedQuestion {
    const c = rng.pick(CASES);
    const n = c.n;
    const sq = n * n;
    const frac = (d: number) => `one-${ordinal(d)} (1/${d}) of her weight on the surface`;
    const answer = frac(sq);
    const atHeight = c.text.startsWith("at a height");
    const candidates: { value: string; errorId: string }[] = [
      { value: frac(n), errorId: "inverse-not-inverse-square" },
      { value: "zero — she is weightless in orbit", errorId: "weightless-means-no-gravity" },
      atHeight ? { value: n - 1 === 1 ? "the same as on the surface" : frac((n - 1) * (n - 1)), errorId: "altitude-not-plus-radius" } : { value: `${sq} times her weight on the surface`, errorId: "ratio-inverted" },
      { value: frac(2 * n), errorId: "arithmetic-slip" },
      { value: frac(sq * 2), errorId: "arithmetic-slip" },
      { value: `${n} times her weight on the surface`, errorId: "ratio-inverted" },
    ];
    const seen = new Set<string>([answer]);
    const wrong: { value: string; errorId: string }[] = [];
    for (const w of candidates) {
      if (seen.has(w.value)) continue;
      seen.add(w.value);
      wrong.push(w);
      if (wrong.length === 4) break;
    }
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `An astronaut orbits Earth in a capsule ${c.text}. How does her weight in the capsule compare with her weight on Earth's surface?`,
      givens: [],
      target: { symbol: "W/W_0", unit: "", label: "fraction of surface weight" },
      answer,
      choices: buildStringChoices(rng, answer, wrong),
      equations: ["g-altitude", "grav-force"],
      recipe: ["Find the distance from Earth's CENTER as a multiple of R_E", "Weight ∝ 1/r²"],
      hints: ["Weight is the gravitational force, which depends on the distance from the center of Earth.", `Here r = ${n}R_E.`, `F ∝ 1/r² → 1/${n}² = 1/${sq}.`],
      solution: [
        { text: `The distance from Earth's center is r = ${n}R_E. Since F ∝ 1/r², the weight is 1/${n}² = 1/${sq} of the surface value. It is NOT zero — 'weightlessness' in orbit is free fall, not the absence of gravity.`, latex: `\\frac{W}{W_0} = \\left(\\frac{R_E}{${n}R_E}\\right)^2 = \\frac{1}{${sq}}`, equationId: "g-altitude" },
      ],
    };
  },
};

function ordinal(n: number): string {
  const names: Record<number, string> = { 1: "first", 2: "half", 3: "third", 4: "fourth", 6: "sixth", 8: "eighth", 9: "ninth", 12: "twelfth", 16: "sixteenth", 18: "eighteenth", 32: "thirty-second" };
  return names[n] ?? `${n}th`;
}
