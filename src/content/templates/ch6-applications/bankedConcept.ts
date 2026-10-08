import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch6.banked-curve.concept",
    topicId: "ch6.banked-curve",
    title: "Banked curve concepts",
    source: "Ch 6b lecture — banked curve derivation; NASCAR slide",
    equations: ["sum-fc", "newton-2", "banked-angle"],
    recipe: ["FBD: N perpendicular to the road, mg down (no friction)", "N cos θ = mg; N sin θ = mv²/r", "tan θ = v²/(rg)"],
    hints: ["On a frictionless bank there are only two forces: N and mg.", "The horizontal component of N is the only thing pointing toward the center.", "Mass cancels when you divide the two equations."],
  },
  [
    {
      prompt: "On a frictionless banked curve, what provides the centripetal force on the car?",
      answer: "The horizontal component of the normal force",
      wrong: [
        { value: "Static friction", errorId: "forgot-friction" },
        { value: "The horizontal component of the car's weight", errorId: "sin-cos-swap" },
        { value: "The centrifugal force", errorId: "centrifugal-outward" },
      ],
      explanation: "With no friction only N and mg act. Weight is purely vertical. N is perpendicular to the tilted road, so it has a horizontal component N sin θ pointing toward the center of the curve.",
      latex: "N\\sin\\theta = \\frac{mv^2}{r}",
      equationId: "banked-angle",
    },
    {
      prompt: "A frictionless curve is banked for a design speed v. Does the correct bank angle depend on the car's mass?",
      answer: "No — the mass cancels: tan θ = v²/(rg)",
      wrong: [
        { value: "Yes — heavier cars need a steeper bank", errorId: "mass-not-weight" },
        { value: "Yes — heavier cars need a shallower bank", errorId: "mass-not-weight" },
        { value: "Only if the car is faster than the design speed", errorId: "arithmetic-slip" },
      ],
      explanation: "Dividing N sin θ = mv²/r by N cos θ = mg eliminates both N and m.",
      latex: "\\tan\\theta = \\frac{v^2}{rg}",
      equationId: "banked-angle",
    },
    {
      prompt: "A car takes a banked curve FASTER than the frictionless design speed. To stay on the road, friction must act",
      answer: "down the slope (toward the inside of the curve), adding inward force",
      wrong: [
        { value: "up the slope, to hold the car on the bank", errorId: "rope-direction-flip" },
        { value: "nowhere — a banked curve never needs friction", errorId: "forgot-friction" },
        { value: "outward, to balance the centrifugal force", errorId: "centrifugal-outward" },
      ],
      explanation: "Above the design speed, N sin θ alone is not enough inward force. The car tends to slide UP the bank, so static friction points DOWN the slope, contributing an extra inward component.",
      latex: "N\\sin\\theta + f_s\\cos\\theta = \\frac{mv^2}{r}",
      equationId: "sum-fc",
    },
    {
      prompt: "On a frictionless banked curve, how does the normal force N compare with mg?",
      answer: "N > mg, because N cos θ = mg",
      wrong: [
        { value: "N = mg", errorId: "normal-equals-mg" },
        { value: "N < mg, since the road is tilted", errorId: "incline-sin-cos-swap" },
        { value: "N = mg cos θ, as on an incline at rest", errorId: "incline-sin-cos-swap" },
      ],
      explanation: "Unlike a block sitting on an incline, the car is accelerating horizontally, so the axes are horizontal/vertical: N cos θ balances mg, giving N = mg/cos θ > mg.",
      latex: "N = \\frac{mg}{\\cos\\theta}",
      equationId: "newton-2",
    },
    {
      prompt: "NASCAR tracks have steeply banked turns. The main purpose of the banking is to",
      answer: "let the normal force supply part of the centripetal force, so cars can corner faster without relying only on friction",
      wrong: [
        { value: "reduce the normal force on the tires", errorId: "normal-equals-mg" },
        { value: "cancel the centrifugal force", errorId: "centrifugal-outward" },
        { value: "make the cars lighter", errorId: "mass-not-weight" },
      ],
      explanation: "Banking tilts N inward. Its horizontal component adds to friction's inward force, raising the maximum cornering speed.",
      latex: "\\tan\\theta = \\frac{v^2}{rg}",
      equationId: "banked-angle",
    },
  ],
);
