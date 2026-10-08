import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { chooseVariant, q, fx } from "../helpers";

/** Acceleration (slope) from two points on a v–t graph, or velocity from two points on an x–t graph. */
export function slope(p: { t1: number; y1: number; t2: number; y2: number }): number {
  return (p.y2 - p.y1) / (p.t2 - p.t1);
}

type Variant = "a-from-vt" | "v-from-xt";

export const template: QuestionTemplate = {
  id: "e1.graphs.slope",
  topicId: "e1.graphs",
  title: "Slope of a motion graph: a from v–t, v from x–t",
  source: "Ch 3 lecture — 'Slope of the tangent line in the velocity–time graph → acceleration'",
  kind: "numeric",
  difficulty: 1,
  variants: ["a-from-vt", "v-from-xt"],
  generate(rng: Rng, opts): GeneratedQuestion {
    const variant = chooseVariant(rng, this.variants!, opts?.variant) as Variant;
    const p = rejectUntil(
      () => ({ t1: nice(rng, 0, 6, 1), dt: nice(rng, 2, 8, 1), y1: nice(rng, -10, 20, 1), y2: nice(rng, -10, 20, 1) }),
      (c) => c.y1 !== c.y2 && Math.abs(c.y2 - c.y1) / c.dt >= 0.5,
    );
    const t2 = p.t1 + p.dt;
    const s = slope({ t1: p.t1, y1: p.y1, t2, y2: p.y2 });
    const isA = variant === "a-from-vt";
    const yName = isA ? "v" : "x";
    const yUnit = isA ? "m/s" : "m";
    const outName = isA ? "a" : "v";
    const outUnit = isA ? "m/s²" : "m/s";
    const area = ((p.y1 + p.y2) / 2) * p.dt;
    return {
      templateId: this.id,
      seed: rng.seed,
      variant,
      prompt: `A straight-line segment of a ${isA ? "velocity–time" : "position–time"} graph runs from $(${p.t1}\\ \\text{s},\\ ${p.y1}\\ \\text{${yUnit}})$ to $(${t2}\\ \\text{s},\\ ${p.y2}\\ \\text{${yUnit}})$. What is the ${isA ? "acceleration" : "velocity"} during this interval?`,
      diagram: { kind: "fx-graph", points: [{ x: p.t1, F: p.y1 }, { x: t2, F: p.y2 }], xLabel: "t", xUnit: "s", yLabel: yName, fUnit: yUnit, from: p.t1, to: t2 },
      givens: [
        { symbol: "t_1", value: p.t1, unit: "s" },
        { symbol: `${yName}_1`, value: p.y1, unit: yUnit },
        { symbol: "t_2", value: t2, unit: "s" },
        { symbol: `${yName}_2`, value: p.y2, unit: yUnit },
      ],
      target: { symbol: outName, unit: outUnit, label: isA ? "acceleration" : "velocity" },
      answer: toSigFigs(s, 4),
      choices: buildNumericChoices(rng, s, [
        { errorId: "slope-vs-area", value: area },
        { errorId: "arithmetic-slip", value: -s },
        { errorId: "slope-vs-area", value: p.y2 },
        { errorId: "arithmetic-slip", value: (p.y2 - p.y1) / t2 },
      ]),
      equations: ["graph-slope-area", "velocity-derivative"],
      recipe: [`${isA ? "a" : "v"} = slope = rise / run = Δ${yName} / Δt`],
      hints: ["A straight segment has one slope everywhere.", `Slope = (${yName}₂ − ${yName}₁)/(t₂ − t₁) — use the CHANGE in t, not t₂ alone.`, `(${p.y2} − ${p.y1}) / ${p.dt}.`],
      solution: [{ text: "Rise over run.", latex: `${outName} = \\frac{\\Delta ${yName}}{\\Delta t} = \\frac{${p.y2} - (${p.y1})}{${t2} - ${p.t1}} = ${fx(s)}\\ \\text{${outUnit}}`, equationId: "graph-slope-area", value: toSigFigs(s, 4) }],
      note: q(area, isA ? "m" : "m·s") + (isA ? " is the area under this segment — that would be the displacement, not the acceleration." : ""),
    };
  },
};
