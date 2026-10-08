import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch6.conical-pendulum.concept",
    topicId: "ch6.conical-pendulum",
    title: "Conical pendulum concepts",
    source: "SI Exam 1 Review — Q27 setup",
    equations: ["newton-2", "sum-fc", "conical-pendulum"],
    recipe: ["FBD: T along the string, mg down — nothing else", "Vertical: T cos θ = mg", "Horizontal: T sin θ = mv²/r"],
    hints: ["Only two forces act on the bob.", "The bob never moves vertically, so the vertical forces balance.", "Something must point toward the center of the horizontal circle."],
  },
  [
    {
      prompt: "A ball on a string swings in a horizontal circle (a conical pendulum). What provides the centripetal force?",
      answer: "The horizontal component of the string's tension",
      wrong: [
        { value: "Gravity", errorId: "sin-cos-swap" },
        { value: "The full tension T", errorId: "ignored-force-angle" },
        { value: "A centripetal force in addition to T and mg", errorId: "centripetal-as-extra-force" },
      ],
      explanation: "Only T and mg act. Gravity is vertical, so the horizontal component T sin θ is the entire inward force.",
      latex: "T\\sin\\theta = \\frac{mv^2}{r}",
      equationId: "conical-pendulum",
    },
    {
      prompt: "In a conical pendulum, how does the tension compare with the bob's weight?",
      answer: "T > mg, since only the vertical component T cos θ balances mg",
      wrong: [
        { value: "T = mg", errorId: "tension-equals-weight" },
        { value: "T < mg because the string is tilted", errorId: "sin-cos-swap" },
        { value: "T = mg cos θ", errorId: "sin-cos-swap" },
      ],
      explanation: "T cos θ = mg with cos θ < 1, so T = mg / cos θ > mg.",
      latex: "T = \\frac{mg}{\\cos\\theta}",
      equationId: "conical-pendulum",
    },
    {
      prompt: "The bob of a conical pendulum is made to go faster (same string). What happens to the angle the string makes with the vertical?",
      answer: "It increases — a larger a_c = g tan θ requires a larger θ",
      wrong: [
        { value: "It decreases, the string becomes more vertical", errorId: "ratio-inverted" },
        { value: "It stays the same; speed and angle are unrelated", errorId: "arithmetic-slip" },
        { value: "It becomes exactly 90° (horizontal)", errorId: "tension-equals-weight" },
      ],
      explanation: "a_c = g tan θ. Faster motion means larger centripetal acceleration, hence a larger θ. The string can never be exactly horizontal, since then no vertical component would support the weight.",
      latex: "a_c = g\\tan\\theta",
      equationId: "conical-pendulum",
    },
    {
      prompt: "A problem says the string of a conical pendulum makes 30° with the HORIZONTAL. In T cos θ = mg, what θ should you use?",
      answer: "60° — the angle from the vertical",
      wrong: [
        { value: "30°", errorId: "angle-complement" },
        { value: "Either, the result is the same", errorId: "sin-cos-swap" },
        { value: "15°", errorId: "arithmetic-slip" },
      ],
      explanation: "The standard equations use θ from the vertical, because T cos θ is the vertical component. Angle from vertical = 90° − 30° = 60° (equivalently, T sin 30° = mg).",
      latex: "T\\cos 60^\\circ = T\\sin 30^\\circ = mg",
      equationId: "conical-pendulum",
    },
    {
      prompt: "Two conical pendulums have the same string length and angle but one bob is twice as heavy. Compare their speeds.",
      answer: "Equal — mass cancels in tan θ = v²/(rg)",
      wrong: [
        { value: "The heavier bob is √2 times faster", errorId: "mass-not-weight" },
        { value: "The heavier bob is twice as fast", errorId: "mass-not-weight" },
        { value: "The heavier bob is slower", errorId: "ratio-inverted" },
      ],
      explanation: "Dividing T sin θ = mv²/r by T cos θ = mg removes both T and m: v = √(g r tan θ).",
      latex: "v = \\sqrt{g r\\tan\\theta}",
      equationId: "conical-pendulum",
    },
  ],
);
