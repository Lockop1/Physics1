import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { buildStringChoices } from "../../../engine/distractors";
import { areaUnder, type Pt } from "./fxGraphArea";

/** Given a graph with labelled intervals, which interval has the greatest / least / zero work. */
export const template: QuestionTemplate = {
  id: "ch7.graphs.which-interval",
  topicId: "ch7.graphs",
  title: "F–x graph: which interval has the most / least work?",
  source: "Ch 7 lecture — F–x graph reading",
  kind: "conceptual",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    // four 2-m intervals with distinct shapes
    const shapes = rng.shuffle(["rect-pos", "tri-pos", "rect-neg", "tri-neg", "zero", "rect-pos-big"]).slice(0, 4);
    const points: Pt[] = [];
    let x = 0;
    const labels = ["A", "B", "C", "D"];
    const intervals: { label: string; from: number; to: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const s = shapes[i]!;
      const from = x;
      const to = x + 2;
      const h = s === "rect-pos-big" ? 8 : 4;
      if (s === "rect-pos" || s === "rect-pos-big") points.push({ x: from, F: h }, { x: to, F: h });
      else if (s === "tri-pos") points.push({ x: from, F: 0 }, { x: from + 1, F: h }, { x: to, F: 0 });
      else if (s === "rect-neg") points.push({ x: from, F: -h }, { x: to, F: -h });
      else if (s === "tri-neg") points.push({ x: from, F: 0 }, { x: from + 1, F: -h }, { x: to, F: 0 });
      else points.push({ x: from, F: 0 }, { x: to, F: 0 });
      intervals.push({ label: labels[i]!, from, to });
      x = to;
    }
    const works = intervals.map((iv) => ({ ...iv, W: areaUnder(points, iv.from, iv.to) }));
    const mode = rng.pick(["most", "least"] as const);
    const sorted = [...works].sort((a, b) => (mode === "most" ? b.W - a.W : a.W - b.W));
    const best = sorted[0]!;
    const answer = `${best.label} (x = ${best.from} to ${best.to} m)`;
    const byAbs = [...works].sort((a, b) => Math.abs(b.W) - Math.abs(a.W))[0]!;
    const opposite = sorted[sorted.length - 1]!;
    const wrong = works
      .filter((w) => w.label !== best.label)
      .map((w) => ({
        value: `${w.label} (x = ${w.from} to ${w.to} m)`,
        errorId: w.label === opposite.label ? "work-sign-flip" : w.label === byAbs.label ? "ignored-negative-area" : "arithmetic-slip",
      }));
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `The graph shows $F_x$ versus $x$ for an object moving in the +x direction. Over which 2-meter interval does the force do the ${mode === "most" ? "MOST positive" : "MOST negative (least)"} work?`,
      diagram: { kind: "fx-graph", points },
      givens: [],
      target: { symbol: "", unit: "", label: "the interval" },
      answer,
      choices: buildStringChoices(rng, answer, wrong),
      equations: ["work-integral"],
      recipe: ["Work on each interval = signed area under the curve", "Compare the areas, with sign"],
      hints: ["Work is the area under the graph — rectangles are F·Δx, triangles are half that.", "Negative F means negative area (negative work).", `Areas: ${works.map((w) => `${w.label} = ${w.W} J`).join(", ")}.`],
      solution: [{ text: `Compute each signed area: ${works.map((w) => `${w.label}: ${w.W} J`).join("; ")}. The ${mode === "most" ? "largest" : "most negative"} is ${best.label}.`, latex: "W = \\int F_x\\,dx = \\text{signed area}", equationId: "work-integral" }],
    };
  },
};
