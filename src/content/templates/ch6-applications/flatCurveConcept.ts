import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch6.flat-curve.concept",
    topicId: "ch6.flat-curve",
    title: "Flat curve concepts (what supplies the centripetal force?)",
    source: "Ch 6b lecture — 'What force contributes to the centripetal acceleration here?' slides",
    equations: ["sum-fc", "friction-static", "vmax-flat-curve"],
    recipe: ["Identify the circle and its center", "Ask which REAL force points toward the center", "Set that force (at its limit) equal to mv²/r"],
    hints: ["On a flat road nothing but friction can point sideways toward the center.", "The tires don't slide on the road while turning, so the friction is static.", "v_max = √(μ_s g r): note what is NOT in it."],
  },
  [
    {
      prompt: "A car rounds a flat, unbanked curve at constant speed. What force provides the centripetal force?",
      answer: "Static friction between the tires and the road, pointing toward the center",
      wrong: [
        { value: "Kinetic friction, since the car is moving", errorId: "static-vs-kinetic" },
        { value: "The normal force from the road", errorId: "centripetal-as-extra-force" },
        { value: "The centrifugal force pushing the car outward", errorId: "centrifugal-outward" },
      ],
      explanation: "The road is horizontal, so N and mg are vertical and cancel. The only horizontal force is friction. The tire's contact patch does not slide relative to the road, so it is STATIC friction, directed toward the center of the turn.",
      latex: "f_s = \\frac{mv^2}{r} \\le \\mu_s mg",
      equationId: "sum-fc",
    },
    {
      prompt: "A loaded truck and an empty car take the same flat curve on the same road surface. Which can take the curve faster without skidding?",
      answer: "Both have the same maximum speed — mass cancels in v_max = √(μ_s g r)",
      wrong: [
        { value: "The truck, because it has more friction (larger N)", errorId: "mass-not-weight" },
        { value: "The car, because it needs less centripetal force", errorId: "mass-not-weight" },
        { value: "The truck, by a factor of √(m_truck/m_car)", errorId: "forgot-square" },
      ],
      explanation: "A heavier vehicle does have more friction available (μ_s mg) but also needs more centripetal force (mv²/r). Both scale with m, so m cancels.",
      latex: "\\mu_s mg = \\frac{mv^2}{r} \;\\Rightarrow\; v_{\\max} = \\sqrt{\\mu_s g r}",
      equationId: "vmax-flat-curve",
    },
    {
      prompt: "A car doubles its speed on a flat curve of fixed radius. The friction force required to keep it on the curve becomes",
      answer: "4 times as large",
      wrong: [
        { value: "2 times as large", errorId: "forgot-square" },
        { value: "√2 times as large", errorId: "forgot-square" },
        { value: "the same — friction is μ_s N regardless of speed", errorId: "static-max-not-needed" },
      ],
      explanation: "The required centripetal force is mv²/r, proportional to v². Friction adjusts to supply it (up to μ_s N), so doubling v quadruples the friction needed.",
      latex: "f_s = \\frac{m v^2}{r} \\propto v^2",
      equationId: "sum-fc",
    },
    {
      prompt: "On a rainy day μ_s between tires and road drops to one quarter of its dry value. The maximum safe speed on a given flat curve becomes",
      answer: "half the dry value",
      wrong: [
        { value: "one quarter of the dry value", errorId: "forgot-sqrt" },
        { value: "the same — the curve radius didn't change", errorId: "static-max-not-needed" },
        { value: "√2 times smaller", errorId: "arithmetic-slip" },
      ],
      explanation: "v_max = √(μ_s g r) scales with the square root of μ_s. √(1/4) = 1/2.",
      latex: "v_{\\max} \\propto \\sqrt{\\mu_s}",
      equationId: "vmax-flat-curve",
    },
    {
      prompt: "A car moves around a flat curve at a speed below the maximum. The static friction force on the car is",
      answer: "exactly mv²/r — less than its maximum μ_s N",
      wrong: [
        { value: "μ_s N, its maximum value", errorId: "static-max-not-needed" },
        { value: "zero, because the car is not slipping", errorId: "forgot-friction" },
        { value: "μ_k N", errorId: "static-vs-kinetic" },
      ],
      explanation: "Static friction supplies whatever inward force the motion requires, up to its limit μ_s N. Below the maximum speed, f_s = mv²/r < μ_s N.",
      latex: "f_s = \\frac{mv^2}{r} < \\mu_s N",
      equationId: "friction-static",
    },
  ],
);
