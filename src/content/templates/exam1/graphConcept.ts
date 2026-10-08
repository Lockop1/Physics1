import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "e1.graphs.concept",
    topicId: "e1.graphs",
    title: "Motion graph concepts (slopes, areas, signs)",
    source: "Ch 3 lecture — graphical analysis; Quick Quiz matching v–t to a–t",
    equations: ["graph-slope-area", "velocity-derivative", "avg-velocity"],
    recipe: ["x–t: slope = v", "v–t: slope = a, area = Δx", "Signs: velocity sign = direction; acceleration sign = direction of Δv"],
    hints: ["Ask: is the question about the height of the graph, its slope, or the area under it?", "A straight sloped v–t line means constant acceleration.", "Speeding up ⇔ v and a have the same sign."],
  },
  [
    {
      prompt: "On a position–time graph, the velocity of the object at an instant is",
      answer: "the slope of the tangent line at that instant",
      wrong: [
        { value: "the height of the curve at that instant", errorId: "slope-vs-area" },
        { value: "the area under the curve up to that instant", errorId: "slope-vs-area" },
        { value: "the curvature of the graph", errorId: "arithmetic-slip" },
      ],
      explanation: "v = dx/dt, the rate of change of position — graphically, the slope of x(t).",
      latex: "v = \\frac{dx}{dt} = \\text{slope of } x\\text{–}t",
      equationId: "graph-slope-area",
    },
    {
      prompt: "On a velocity–time graph, the displacement over an interval is",
      answer: "the signed area between the curve and the t-axis",
      wrong: [
        { value: "the slope of the curve", errorId: "slope-vs-area" },
        { value: "the change in height of the curve", errorId: "slope-vs-area" },
        { value: "the total unsigned area", errorId: "displacement-vs-distance" },
      ],
      explanation: "Δx = ∫v dt. Area below the axis (negative v) subtracts because the object moves backward. The unsigned area is the DISTANCE.",
      latex: "\\Delta x = \\int v\\,dt",
      equationId: "graph-slope-area",
    },
    {
      prompt: "A v–t graph is a straight line sloping downward through zero. The object is",
      answer: "slowing down, stopping momentarily, then speeding up in the opposite direction — with constant acceleration",
      wrong: [
        { value: "slowing down the whole time", errorId: "motion-vs-acceleration-direction" },
        { value: "moving at constant velocity", errorId: "slope-vs-area" },
        { value: "accelerating with increasing magnitude", errorId: "arithmetic-slip" },
      ],
      explanation: "A straight line has constant slope, so a is constant. Before the zero crossing v and a have opposite signs (slowing); after it they have the same sign (speeding up the other way).",
      latex: "a = \\text{slope} = \\text{const}",
      equationId: "graph-slope-area",
    },
    {
      prompt: "A particle's x–t graph is a parabola opening downward. Its velocity–time graph is",
      answer: "a straight line with negative slope",
      wrong: [
        { value: "a parabola opening downward", errorId: "derivative-not-taken" },
        { value: "a horizontal line", errorId: "slope-vs-area" },
        { value: "a straight line with positive slope", errorId: "arithmetic-slip" },
      ],
      explanation: "The derivative of a downward parabola x = c + bt − kt² is v = b − 2kt: linear, decreasing. The acceleration is the constant −2k.",
      latex: "x = c + bt - kt^2 \\Rightarrow v = b - 2kt",
      equationId: "velocity-derivative",
    },
    {
      prompt: "An object moves in the −x direction and its speed is increasing. The signs of its velocity and acceleration are",
      answer: "both negative",
      wrong: [
        { value: "velocity negative, acceleration positive", errorId: "motion-vs-acceleration-direction" },
        { value: "both positive", errorId: "arithmetic-slip" },
        { value: "velocity positive, acceleration negative", errorId: "motion-vs-acceleration-direction" },
      ],
      explanation: "Speeding up means a points the same way as v. Moving in −x with increasing speed → v < 0 and a < 0.",
      latex: "\\text{speeding up} \\iff v\\cdot a > 0",
      equationId: "velocity-derivative",
    },
    {
      prompt: "Over a 10 s interval an object's v–t graph has 30 m of area above the axis and 10 m below. Its average velocity and average speed are",
      answer: "average velocity 2 m/s, average speed 4 m/s",
      wrong: [
        { value: "both 4 m/s", errorId: "avg-speed-vs-velocity" },
        { value: "both 2 m/s", errorId: "avg-speed-vs-velocity" },
        { value: "average velocity 4 m/s, average speed 2 m/s", errorId: "displacement-vs-distance" },
      ],
      explanation: "Displacement = 30 − 10 = 20 m → average velocity 2 m/s. Distance = 30 + 10 = 40 m → average speed 4 m/s.",
      latex: "\\bar v = \\frac{\\Delta x}{\\Delta t},\\qquad \\text{avg speed} = \\frac{d}{\\Delta t}",
      equationId: "avg-velocity",
    },
    {
      prompt: "Which v–t graph corresponds to an a–t graph that is a positive constant?",
      answer: "A straight line with constant positive slope",
      wrong: [
        { value: "A horizontal line above the axis", errorId: "slope-vs-area" },
        { value: "A parabola", errorId: "derivative-not-taken" },
        { value: "A straight line with negative slope", errorId: "arithmetic-slip" },
      ],
      explanation: "Constant a means v changes at a constant rate: v(t) = v₀ + at, a straight line with slope a.",
      latex: "v = v_0 + at",
      equationId: "graph-slope-area",
    },
  ],
);
