import type { QuestionTemplate, GeneratedQuestion } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx } from "../helpers";

export interface Pt {
  x: number;
  F: number;
}

/** Signed area under a piecewise-linear graph between x = from and x = to (exact trapezoid sum). */
export function areaUnder(points: Pt[], from: number, to: number): number {
  const f = (x: number): number => {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]!;
      const b = points[i + 1]!;
      if (x >= a.x && x <= b.x) return b.x === a.x ? a.F : a.F + ((b.F - a.F) * (x - a.x)) / (b.x - a.x);
    }
    return 0;
  };
  const xs = Array.from(new Set([from, to, ...points.map((p) => p.x).filter((x) => x > from && x < to)])).sort((a, b) => a - b);
  // On each sub-interval the function is linear, so the exact area is f(midpoint) × width.
  // (Evaluating at the midpoint also sidesteps the ambiguity at vertical jumps.)
  let area = 0;
  for (let i = 0; i < xs.length - 1; i++) {
    const x1 = xs[i]!;
    const x2 = xs[i + 1]!;
    area += f((x1 + x2) / 2) * (x2 - x1);
  }
  return area;
}

/** Positive-only version of the area (ignores the sign of regions below the axis). */
function absArea(points: Pt[], from: number, to: number): number {
  // subdivide finely across zero crossings
  let total = 0;
  const n = 400;
  const fAt = (x: number): number => {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]!;
      const b = points[i + 1]!;
      if (x >= a.x && x <= b.x) return b.x === a.x ? a.F : a.F + ((b.F - a.F) * (x - a.x)) / (b.x - a.x);
    }
    return 0;
  };
  const h = (to - from) / n;
  for (let i = 0; i < n; i++) {
    const x1 = from + i * h;
    const x2 = x1 + h;
    total += (Math.abs(fAt(x1)) + Math.abs(fAt(x2))) * 0.5 * h;
  }
  return total;
}

/** Generate a random piecewise-linear F–x graph: rectangles, triangles, sometimes a negative region. */
export function generateGraph(rng: Rng): { points: Pt[]; from: number; to: number } {
  const segments = rng.int(3, 5);
  const points: Pt[] = [{ x: 0, F: 0 }];
  let x = 0;
  let F = 0;
  let hasNegative = false;
  for (let i = 0; i < segments; i++) {
    const dx = nice(rng, 1, 4, 1);
    const shape = rng.pick(["flat", "flat", "rise", "fall", "jump"]);
    if (shape === "jump") {
      // vertical jump then flat
      const newF = nice(rng, -6, 10, 1);
      points.push({ x, F: newF });
      F = newF;
      x += dx;
      points.push({ x, F });
    } else if (shape === "flat") {
      if (F === 0) {
        F = nice(rng, -6, 10, 1);
        points.push({ x, F });
      }
      x += dx;
      points.push({ x, F });
    } else {
      const newF = shape === "rise" ? nice(rng, F + 2, 10, 1) : nice(rng, -6, F - 2, 1);
      x += dx;
      F = newF;
      points.push({ x, F });
    }
    if (F < 0) hasNegative = true;
  }
  // close back to zero
  x += nice(rng, 1, 3, 1);
  points.push({ x, F: 0 });
  // interval: whole thing or a sub-interval at integer x
  const xs = points.map((p) => p.x);
  const xmax = xs[xs.length - 1]!;
  let from = 0;
  let to = xmax;
  if (rng.chance(0.5)) {
    from = rng.int(0, Math.max(0, xmax - 3));
    to = rng.int(from + 2, xmax);
  }
  void hasNegative;
  return { points, from, to };
}

export const template: QuestionTemplate = {
  id: "ch7.graphs.area",
  topicId: "ch7.graphs",
  title: "Work from an F–x graph = signed area",
  source: "Ch 7 lecture — F–x graph examples (rectangle + triangle → 25 J; 2 m → 8 m → 30 J)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const gph = rejectUntil(
      () => generateGraph(rng),
      (gq) => {
        const W = areaUnder(gq.points, gq.from, gq.to);
        const abs = absArea(gq.points, gq.from, gq.to);
        return Math.abs(W) >= 2 && Math.abs(W) < 400 && (Math.abs(abs - Math.abs(W)) < 1e-9 || Math.abs(abs - Math.abs(W)) / Math.abs(W) > 0.08);
      },
    );
    const W = areaUnder(gph.points, gph.from, gph.to);
    const abs = absArea(gph.points, gph.from, gph.to);
    const Fmax = Math.max(...gph.points.map((p) => Math.abs(p.F)));
    const hasNeg = gph.points.some((p) => p.F < 0);
    return {
      templateId: this.id,
      seed: rng.seed,
      prompt: `The graph shows the force $F_x$ acting on an object as a function of its position. How much work does this force do as the object moves from $x = ${gph.from}$ m to $x = ${gph.to}$ m?`,
      diagram: { kind: "fx-graph", points: gph.points, from: gph.from, to: gph.to },
      givens: [
        { symbol: "x_i", value: gph.from, unit: "m" },
        { symbol: "x_f", value: gph.to, unit: "m" },
      ],
      target: { symbol: "W", unit: "J", label: "work (area under the curve)" },
      answer: toSigFigs(W, 4),
      choices: buildNumericChoices(rng, W, [
        { errorId: "area-as-F-times-d", value: Fmax * (gph.to - gph.from) },
        { errorId: "ignored-negative-area", value: abs },
        { errorId: "work-sign-flip", value: -W },
        { errorId: "kinematics-missing-half", value: W * 2 },
      ]),
      equations: ["work-integral"],
      recipe: ["Work = area between the F–x curve and the x-axis over the interval", "Split into rectangles and triangles", "Area below the axis counts NEGATIVE"],
      hints: ["For a varying force, work is the area under the F–x graph (the integral).", "Break the shaded region into rectangles (F·Δx) and triangles (½·F·Δx).", hasNeg ? "Regions below the axis subtract." : "All regions here are above the axis."],
      solution: [
        { text: "Work is the signed area under the curve between the limits. Add rectangle and triangle areas, counting parts below the axis as negative.", latex: `W = \\int_{${gph.from}}^{${gph.to}} F_x\\,dx = \\text{(signed area)} = ${fx(W)}\\ \\text{J}`, equationId: "work-integral", value: toSigFigs(W, 4) },
      ],
    };
  },
};
