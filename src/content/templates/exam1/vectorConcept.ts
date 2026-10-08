import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "e1.vectors.concept",
    topicId: "e1.vectors",
    title: "Vector concepts (displacement vs distance, components, equality)",
    source: "Ch 1–3 lectures — roundabout CQs, racecar ABCD card, 'which figure shows −15.79i + 12.04j'",
    equations: ["vec-components", "vec-magnitude", "avg-velocity"],
    recipe: ["Decide: scalar (magnitude only) or vector (magnitude + direction)?", "Displacement = final − initial; distance = path length", "Components: cos toward the reference axis, sin away from it"],
    hints: ["Displacement only cares about where you started and ended.", "Two vectors are equal only if BOTH magnitude and direction match.", "Negative x-component with positive y-component → quadrant II."],
  },
  [
    {
      prompt: "A car drives once around a roundabout of radius 20.0 m. What distance does it travel, and what is its displacement?",
      answer: "Distance 126 m, displacement 0",
      wrong: [
        { value: "Distance 126 m, displacement 126 m", errorId: "displacement-vs-distance" },
        { value: "Distance 40.0 m, displacement 40.0 m", errorId: "diameter-as-radius" },
        { value: "Distance 0, displacement 126 m", errorId: "displacement-vs-distance" },
      ],
      explanation: "Distance is the path length 2πr = 126 m. Displacement is final position minus initial position — the car ends where it started, so it is zero.",
      latex: "d = 2\\pi r,\\qquad \\Delta\\vec r = 0",
      equationId: "avg-velocity",
    },
    {
      prompt: "A racecar at constant speed has gone exactly halfway around a circular track of radius r. The magnitude of its displacement from the start is",
      answer: "2r (straight across the circle)",
      wrong: [
        { value: "πr (half the circumference)", errorId: "displacement-vs-distance" },
        { value: "r", errorId: "diameter-as-radius" },
        { value: "zero", errorId: "displacement-vs-distance" },
      ],
      explanation: "Halfway around, the car is diametrically opposite its start: the straight-line displacement is the diameter 2r. The DISTANCE travelled is πr.",
      latex: "|\\Delta\\vec r| = 2r",
      equationId: "avg-velocity",
    },
    {
      prompt: "A vector is −15.8 î + 12.0 ĵ. In which quadrant does it point, and what is its angle from +x?",
      answer: "Quadrant II; about 143° (the calculator's −37° plus 180°)",
      wrong: [
        { value: "Quadrant IV; −37°", errorId: "arctan-quadrant" },
        { value: "Quadrant I; 37°", errorId: "arctan-quadrant" },
        { value: "Quadrant II; 53°", errorId: "arctan-inverted" },
      ],
      explanation: "Negative x and positive y is quadrant II. tan⁻¹(12.0/−15.8) returns −37.2°, which the calculator can't distinguish from quadrant IV; add 180° to get 142.8°.",
      latex: "\\theta = \\tan^{-1}\\!\\left(\\frac{12.0}{-15.8}\\right) + 180^\\circ \\approx 143^\\circ",
      equationId: "vec-direction",
    },
    {
      prompt: "Two vectors have the same magnitude. They are equal",
      answer: "only if they also point in the same direction",
      wrong: [
        { value: "always — magnitude is what defines a vector", errorId: "vector-magnitudes-added" },
        { value: "only if they start at the same point", errorId: "arithmetic-slip" },
        { value: "if they are perpendicular", errorId: "arithmetic-slip" },
      ],
      explanation: "A vector is magnitude AND direction. Equal vectors are parallel with equal length; where they are drawn does not matter.",
      latex: "\\vec A = \\vec B \\iff A = B \\text{ and same direction}",
      equationId: "vec-magnitude",
    },
    {
      prompt: "A force of 10 N points 30° above the +x axis. Which statement about its components is correct?",
      answer: "F_x = 10 cos 30° = 8.66 N and F_y = 10 sin 30° = 5.00 N",
      wrong: [
        { value: "F_x = 10 sin 30° = 5.00 N and F_y = 10 cos 30° = 8.66 N", errorId: "sin-cos-swap" },
        { value: "F_x = F_y = 5.00 N, since the components share the force equally", errorId: "arithmetic-slip" },
        { value: "F_x = 10 N and F_y = 10 N", errorId: "used-full-speed-as-component" },
      ],
      explanation: "With the angle measured from the +x axis, the adjacent side (x) uses cosine and the opposite side (y) uses sine. The components must satisfy √(F_x² + F_y²) = 10 N.",
      latex: "F_x = F\\cos\\theta,\\quad F_y = F\\sin\\theta",
      equationId: "vec-components",
    },
    {
      prompt: "A vector points 25° east of NORTH. Its east (x) component is",
      answer: "A sin 25° — sine, because the angle is measured from the y-axis",
      wrong: [
        { value: "A cos 25°", errorId: "angle-from-wrong-axis" },
        { value: "A tan 25°", errorId: "arithmetic-slip" },
        { value: "A, since it mostly points east", errorId: "used-full-speed-as-component" },
      ],
      explanation: "'East of north' means the angle is measured from the +y (north) axis. The side adjacent to that angle is y (cos), and the opposite side is x (sin). Equivalently, the angle from +x is 65° and A cos 65° = A sin 25°.",
      latex: "A_x = A\\sin25^\\circ = A\\cos65^\\circ",
      equationId: "vec-components",
    },
    {
      prompt: "Vector A = 3 î + 2 ĵ and B = −5 î + 4 ĵ. What is A + B?",
      answer: "−2 î + 6 ĵ",
      wrong: [
        { value: "8 î + 6 ĵ", errorId: "arithmetic-slip" },
        { value: "2 î − 2 ĵ", errorId: "arithmetic-slip" },
        { value: "−2 î + 4 ĵ", errorId: "arithmetic-slip" },
      ],
      explanation: "Add like components: (3 + (−5)) î + (2 + 4) ĵ = −2 î + 6 ĵ.",
      latex: "\\vec A + \\vec B = (A_x + B_x)\\hat i + (A_y + B_y)\\hat j",
      equationId: "vec-components",
    },
  ],
);
