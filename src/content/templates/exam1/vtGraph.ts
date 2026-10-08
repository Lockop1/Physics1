import type { QuestionTemplate, GeneratedQuestion, QuestionPart } from "../../../engine/types";
import type { Rng } from "../../../engine/rng";
import { nice, toSigFigs, rejectUntil } from "../../../engine/params";
import { buildNumericChoices } from "../../../engine/distractors";
import { fx, withParts } from "../helpers";

export interface Pt {
  t: number;
  v: number;
}

/** Generate a piecewise-linear v–t graph (3–5 segments), sometimes dipping negative. */
export function generateVt(rng: Rng): Pt[] {
  const n = rng.int(3, 5);
  const pts: Pt[] = [{ t: 0, v: rng.pick([0, 0, 2, 4, -2]) }];
  let t = 0;
  for (let i = 0; i < n; i++) {
    const dt = nice(rng, 1, 4, 1);
    t += dt;
    const shape = rng.pick(["flat", "rise", "fall", "fall"]);
    const prev = pts[pts.length - 1]!.v;
    const v = shape === "flat" ? prev : shape === "rise" ? Math.min(prev + nice(rng, 2, 6, 1), 10) : Math.max(prev - nice(rng, 2, 6, 1), -6);
    pts.push({ t, v });
  }
  return pts;
}

export function vAt(pts: Pt[], t: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (t >= a.t && t <= b.t) return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t);
  }
  return pts[pts.length - 1]!.v;
}

/** Signed area (displacement) and unsigned area (distance) between t1 and t2. Exact for piecewise-linear. */
export function integrate(pts: Pt[], t1: number, t2: number): { displacement: number; distance: number } {
  // breakpoints: segment ends and zero crossings
  const xs = new Set<number>([t1, t2]);
  for (const p of pts) if (p.t > t1 && p.t < t2) xs.add(p.t);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (a.v * b.v < 0) {
      const tz = a.t + ((0 - a.v) * (b.t - a.t)) / (b.v - a.v);
      if (tz > t1 && tz < t2) xs.add(tz);
    }
  }
  const sorted = Array.from(xs).sort((a, b) => a - b);
  let disp = 0;
  let dist = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    const area = ((vAt(pts, a) + vAt(pts, b)) / 2) * (b - a); // linear on this sub-interval, no sign change
    disp += area;
    dist += Math.abs(area);
  }
  return { displacement: disp, distance: dist };
}

export function slopeAt(pts: Pt[], t: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (t > a.t && t < b.t) return (b.v - a.v) / (b.t - a.t);
  }
  return 0;
}

export const template: QuestionTemplate = {
  id: "e1.graphs.vt-graph",
  topicId: "e1.graphs",
  title: "v–t graph → displacement, distance, average velocity & speed, acceleration (multi-part)",
  source: "Ch 3 lecture — graphical analysis (slope of v–t = a; area = Δx); Example 1 (average velocity 1.36 m/s vs average speed 2.27 m/s)",
  kind: "numeric",
  difficulty: 2,
  generate(rng: Rng): GeneratedQuestion {
    const g = rejectUntil(
      () => {
        const pts = generateVt(rng);
        const tEnd = pts[pts.length - 1]!.t;
        const hasNeg = pts.some((p) => p.v < 0);
        return { pts, tEnd, hasNeg };
      },
      (c) => {
        const { displacement, distance } = integrate(c.pts, 0, c.tEnd);
        // want a sloped segment to ask about acceleration, and a visible difference between distance and |displacement| when negative
        const sloped = c.pts.some((p, i) => i > 0 && p.v !== c.pts[i - 1]!.v);
        return sloped && Math.abs(displacement) > 2 && (!c.hasNeg || distance - Math.abs(displacement) > 2);
      },
    );
    const { pts, tEnd } = g;
    const { displacement, distance } = integrate(pts, 0, tEnd);
    // pick a sloped segment midpoint for the acceleration question
    const slopedIdx = pts.findIndex((p, i) => i > 0 && p.v !== pts[i - 1]!.v);
    const tMid = (pts[slopedIdx - 1]!.t + pts[slopedIdx]!.t) / 2;
    const a = slopeAt(pts, tMid);
    const vMax = Math.max(...pts.map((p) => Math.abs(p.v)));
    const parts: QuestionPart[] = [
      {
        label: "(a)",
        prompt: `What is the object's displacement from $t = 0$ to $t = ${tEnd}$ s?`,
        target: { symbol: "\\Delta x", unit: "m", label: "displacement" },
        answer: toSigFigs(displacement, 4),
        choices: buildNumericChoices(rng, displacement, [
          { errorId: "displacement-vs-distance", value: distance },
          { errorId: "slope-vs-area", value: vMax * tEnd },
          { errorId: "slope-vs-area", value: vAt(pts, tEnd) },
          { errorId: "arithmetic-slip", value: displacement / 2 },
        ]),
        solution: [{ text: "Displacement is the SIGNED area under the v–t graph (regions below the axis count negative). Add rectangles and triangles segment by segment.", latex: `\\Delta x = \\int_0^{${tEnd}} v\\,dt = ${fx(displacement)}\\ \\text{m}`, equationId: "graph-slope-area", value: toSigFigs(displacement, 4) }],
      },
      {
        label: "(b)",
        prompt: "What total distance does it travel in that time?",
        target: { symbol: "d", unit: "m", label: "distance travelled" },
        answer: toSigFigs(distance, 4),
        choices: buildNumericChoices(rng, distance, [
          { errorId: "displacement-vs-distance", value: displacement },
          { errorId: "slope-vs-area", value: vMax * tEnd },
          { errorId: "arithmetic-slip", value: distance / 2 },
          { errorId: "displacement-vs-distance", value: Math.abs(displacement) === distance ? distance * 2 : Math.abs(displacement) },
        ]),
        solution: [{ text: "Distance counts every area as positive (the object moving backward still covers ground).", latex: `d = \\int_0^{${tEnd}} |v|\\,dt = ${fx(distance)}\\ \\text{m}`, equationId: "graph-slope-area", value: toSigFigs(distance, 4) }],
      },
      {
        label: "(c)",
        prompt: `What is the average velocity over the ${tEnd} s?`,
        target: { symbol: "\\bar v", unit: "m/s", label: "average velocity" },
        answer: toSigFigs(displacement / tEnd, 4),
        choices: buildNumericChoices(rng, displacement / tEnd, [
          { errorId: "avg-speed-vs-velocity", value: distance / tEnd },
          { errorId: "arithmetic-slip", value: pts.reduce((s, p) => s + p.v, 0) / pts.length },
          { errorId: "slope-vs-area", value: vAt(pts, tEnd) },
          { errorId: "arithmetic-slip", value: (2 * displacement) / tEnd },
        ]),
        solution: [{ text: "Average velocity is displacement over time (NOT the average of the plotted values).", latex: `\\bar v = \\frac{\\Delta x}{\\Delta t} = \\frac{${fx(displacement)}}{${tEnd}} = ${fx(displacement / tEnd)}\\ \\text{m/s}`, equationId: "avg-velocity", value: toSigFigs(displacement / tEnd, 4) }],
      },
      {
        label: "(d)",
        prompt: `What is the instantaneous acceleration at $t = ${tMid}$ s?`,
        target: { symbol: "a", unit: "m/s²", label: `acceleration at t = ${tMid} s` },
        answer: toSigFigs(a, 4),
        choices: buildNumericChoices(rng, a, [
          { errorId: "slope-vs-area", value: vAt(pts, tMid) },
          { errorId: "arithmetic-slip", value: -a },
          { errorId: "slope-vs-area", value: integrate(pts, 0, tMid).displacement },
          { errorId: "arithmetic-slip", value: a / 2 },
        ]),
        solution: [{ text: "Acceleration is the SLOPE of the v–t graph on that segment.", latex: `a = \\frac{\\Delta v}{\\Delta t} = \\frac{${pts[slopedIdx]!.v} - (${pts[slopedIdx - 1]!.v})}{${pts[slopedIdx]!.t} - ${pts[slopedIdx - 1]!.t}} = ${fx(a)}\\ \\text{m/s}^2`, equationId: "graph-slope-area", value: toSigFigs(a, 4) }],
      },
    ];
    return withParts(
      {
        templateId: this.id,
        seed: rng.seed,
        prompt: `The graph shows the velocity of an object moving along a straight line as a function of time.`,
        diagram: { kind: "fx-graph", points: pts.map((p) => ({ x: p.t, F: p.v })), xLabel: "t", xUnit: "s", yLabel: "v", fUnit: "m/s" },
        givens: [{ symbol: "t_{\\text{end}}", value: tEnd, unit: "s" }],
        equations: ["graph-slope-area", "avg-velocity"],
        recipe: ["Area under v–t = displacement (signed); total |area| = distance", "Average velocity = Δx/Δt; average speed = distance/Δt", "Slope of v–t = acceleration"],
        hints: ["Slope ↔ acceleration. Area ↔ displacement. Don't mix them up.", "Break the area into rectangles and triangles; area below the axis is negative for displacement, positive for distance.", `Segment endpoints: ${pts.map((p) => `(${p.t} s, ${p.v} m/s)`).join(", ")}.`],
      },
      parts,
    );
  },
};
