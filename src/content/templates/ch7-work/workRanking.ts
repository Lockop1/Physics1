import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";
import { cosD } from "../helpers";

/** Rank the work done by a force of fixed magnitude at four generated angles to a rightward displacement. */
export function rank(angles: number[]): number[] {
  return angles.map((a, i) => ({ i, c: cosD(a) })).sort((x, y) => y.c - x.c).map((o) => o.i);
}

const LABELS = ["A", "B", "C", "D"];

export const template: QuestionTemplate = {
  id: "ch7.constant-force.ranking",
  topicId: "ch7.constant-force",
  title: "Rank the work done for four force directions",
  source: "Ch 7 lecture — 'Rank the work done in the following' (four situations)",
  kind: "conceptual",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    // pick 4 distinct angles with distinct cosines, spanning positive, zero-ish and negative
    const pool = [0, 30, 45, 60, 90, 120, 135, 150, 180];
    let angles: number[] = [];
    for (let tries = 0; tries < 50; tries++) {
      angles = rng.shuffle(pool).slice(0, 4);
      const cs = angles.map((a) => Math.round(cosD(a) * 1000));
      if (new Set(cs).size === 4) break;
    }
    const order = rank(angles);
    const join = (o: number[]) => o.map((i) => LABELS[i]).join(" > ");
    const answer = join(order);
    const reversed = join([...order].reverse());
    const byAngle = join(angles.map((a, i) => ({ i, a })).sort((x, y) => x.a - y.a).map((o) => o.i));
    const byAbs = join(angles.map((a, i) => ({ i, c: Math.abs(cosD(a)) })).sort((x, y) => y.c - x.c).map((o) => o.i));
    const swapFirst = join([order[1]!, order[0]!, order[2]!, order[3]!]);
    const swapLast = join([order[0]!, order[1]!, order[3]!, order[2]!]);
    const allEqual = "All equal — the force magnitude and displacement are the same";
    const candidates = [
      { value: reversed, errorId: "work-sign-flip" },
      { value: byAbs, errorId: "ignored-negative-area" },
      { value: allEqual, errorId: "work-ignores-angle" },
      { value: byAngle, errorId: "arithmetic-slip" },
      { value: swapFirst, errorId: "arithmetic-slip" },
      { value: swapLast, errorId: "arithmetic-slip" },
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
      prompt: `In each of the four situations shown, a force of the same magnitude acts on a box that is displaced the same distance to the right. The force makes angles of ${angles.map((a, i) => `${LABELS[i]}: ${a}°`).join(", ")} with the displacement. Rank the situations by the work done by the force, from most positive to most negative.`,
      diagram: { kind: "work-rank", panels: angles.map((a, i) => ({ label: LABELS[i]!, angleDeg: a })) },
      givens: [],
      target: { symbol: "", unit: "", label: "ranking (most positive → most negative)" },
      answer,
      choices: buildStringChoices(rng, answer, wrong),
      equations: ["work-const"],
      recipe: ["W = F d cos θ, with F and d the same in every case", "Rank by cos θ: largest (θ = 0) is most positive; θ > 90° gives negative work"],
      hints: ["Since F and d are equal, only cos θ differs.", "cos θ is +1 at 0°, 0 at 90°, −1 at 180°.", `cos values: ${angles.map((a, i) => `${LABELS[i]} ${cosD(a).toFixed(2)}`).join(", ")}.`],
      solution: [
        { text: `With F and d equal, W ∝ cos θ. Ordering the cosines (${angles.map((a, i) => `${LABELS[i]}: cos ${a}° = ${cosD(a).toFixed(2)}`).join("; ")}) gives ${answer}.`, latex: "W = Fd\\cos\\theta", equationId: "work-const" },
      ],
    };
  },
};
