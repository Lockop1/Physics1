import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch7.graphs.concept",
    topicId: "ch7.graphs",
    title: "F–x graph concepts",
    source: "Ch 7 lecture — 'Calculating work from an F–x graph'",
    equations: ["work-integral", "work-const"],
    recipe: ["Work = area between the curve and the x-axis", "Sign follows the sign of F (for motion in +x)", "Constant F is just a rectangle: F·Δx"],
    hints: ["The integral of F dx is the area under the graph.", "Below the axis → negative area.", "A straight sloped line gives a triangle or trapezoid."],
  },
  [
    {
      prompt: "On a graph of F_x versus x, the work done by the force over an interval equals",
      answer: "the signed area between the curve and the x-axis over that interval",
      wrong: [
        { value: "the slope of the curve", errorId: "arithmetic-slip" },
        { value: "the maximum force times the displacement", errorId: "area-as-F-times-d" },
        { value: "the change in F over the interval", errorId: "arithmetic-slip" },
      ],
      explanation: "W = ∫F_x dx, and a definite integral is the area under the curve (negative where F_x < 0).",
      latex: "W = \\int_{x_i}^{x_f} F_x\\,dx",
      equationId: "work-integral",
    },
    {
      prompt: "An F_x–x graph dips below the x-axis for part of the interval while the object moves in the +x direction. The contribution of that part to the work is",
      answer: "negative — the force opposes the motion there",
      wrong: [
        { value: "positive, since area is always positive", errorId: "ignored-negative-area" },
        { value: "zero", errorId: "arithmetic-slip" },
        { value: "undefined", errorId: "arithmetic-slip" },
      ],
      explanation: "F_x < 0 with dx > 0 makes F_x dx negative. Geometrically, area below the axis is subtracted.",
      latex: "F_x < 0 \\Rightarrow dW = F_x\\,dx < 0",
      equationId: "work-integral",
    },
    {
      prompt: "Over some interval an F_x–x graph has equal areas above and below the axis. The net work on that interval is",
      answer: "zero",
      wrong: [
        { value: "twice the area above the axis", errorId: "ignored-negative-area" },
        { value: "equal to the area above the axis", errorId: "ignored-negative-area" },
        { value: "negative", errorId: "work-sign-flip" },
      ],
      explanation: "Positive and negative areas cancel: the force gives energy on one part and takes it back on the other.",
      latex: "W = A_{\\text{above}} - A_{\\text{below}} = 0",
      equationId: "work-integral",
    },
    {
      prompt: "A force rises linearly from 0 to F₀ over a displacement d. The work done is",
      answer: "½F₀d — the area of a triangle",
      wrong: [
        { value: "F₀d", errorId: "area-as-F-times-d" },
        { value: "2F₀d", errorId: "arithmetic-slip" },
        { value: "F₀d cos θ with θ = 45°", errorId: "work-ignores-angle" },
      ],
      explanation: "The graph is a straight line from (0,0) to (d, F₀); the area under it is a triangle with base d and height F₀.",
      latex: "W = \\tfrac12 F_0 d",
      equationId: "work-integral",
    },
    {
      prompt: "A spring's force graph F = −kx versus x is a straight line through the origin. The magnitude of the work done by the spring from x = 0 to x = A is",
      answer: "½kA² — a triangle of base A and height kA",
      wrong: [
        { value: "kA²", errorId: "spring-work-missing-half" },
        { value: "kA", errorId: "forgot-square" },
        { value: "zero, since F = 0 at the start", errorId: "arithmetic-slip" },
      ],
      explanation: "Area of the triangle under |F| = kx from 0 to A is ½·A·kA = ½kA². The sign is negative when the spring is being stretched (force opposes displacement).",
      latex: "|W_s| = \\tfrac12 k A^2",
      equationId: "work-integral",
    },
  ],
);
