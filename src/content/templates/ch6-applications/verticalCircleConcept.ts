import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch6.vertical-circle.concept",
    topicId: "ch6.vertical-circle",
    title: "Vertical circle concepts (top vs bottom)",
    source: "Ch 6b lecture — roller coaster and Ferris wheel examples",
    equations: ["sum-fc", "vertical-circle", "vmin-loop"],
    recipe: ["Identify the center of the circle", "List the real forces (N or T, mg) and their directions", "Radial sum = mv²/r"],
    hints: ["Only real forces go on the free-body diagram; mv²/r is what they must add up to.", "At the top the center is below the object; at the bottom it is above.", "Compare N at top and bottom using N = m(v²/r ∓ g)."],
  },
  [
    {
      prompt: "A roller-coaster car is at the TOP of a vertical loop. Which forces on the rider point toward the center of the loop?",
      answer: "Both the seat's normal force and gravity",
      wrong: [
        { value: "Only gravity — the seat force points outward", errorId: "top-bottom-loop-sign" },
        { value: "Only the seat force — gravity points away from the center", errorId: "top-bottom-loop-sign" },
        { value: "Gravity, the seat force, and the centripetal force mv²/r", errorId: "centripetal-as-extra-force" },
      ],
      explanation: "At the top the center is directly below the rider. The seat pushes the rider toward the track (down) and gravity pulls down — both toward the center. Their sum is the required mv²/r; there is no separate 'centripetal force' on the diagram.",
      latex: "N + mg = \\frac{mv^2}{r}",
      equationId: "vertical-circle",
    },
    {
      prompt: "A Ferris wheel turns at constant speed. Where does a rider feel heaviest (largest seat force)?",
      answer: "At the bottom",
      wrong: [
        { value: "At the top", errorId: "top-bottom-loop-sign" },
        { value: "At the sides, halfway up", errorId: "arithmetic-slip" },
        { value: "Everywhere the same, since the speed is constant", errorId: "normal-equals-mg" },
      ],
      explanation: "At the bottom the seat must both support the weight and supply the upward centripetal force: N = m(g + v²/r) > mg. At the top, N = m(g − v²/r) < mg.",
      latex: "N_{\\text{bottom}} = m\\left(g + \\frac{v^2}{r}\\right),\\qquad N_{\\text{top}} = m\\left(g - \\frac{v^2}{r}\\right)",
      equationId: "vertical-circle",
    },
    {
      prompt: "A car goes over the top of a loop at exactly the minimum speed √(gr). What is the normal force from the track on the car at that instant?",
      answer: "Zero — gravity alone supplies the centripetal force",
      wrong: [
        { value: "mg", errorId: "normal-equals-mg" },
        { value: "2mg", errorId: "top-bottom-loop-sign" },
        { value: "mv²/r", errorId: "centripetal-as-extra-force" },
      ],
      explanation: "Minimum speed is defined by N → 0: the track just stops pushing, and mg = mv²/r. Any slower and the car would leave the track.",
      latex: "N = m\\left(\\frac{v^2}{r} - g\\right) = 0 \\text{ when } v = \\sqrt{gr}",
      equationId: "vmin-loop",
    },
    {
      prompt: "Two riders, one twice as massive as the other, sit in the same roller-coaster car going over the top of a loop. How does the minimum speed to stay in the seat compare?",
      answer: "It is the same for both — mass cancels in v_min = √(gr)",
      wrong: [
        { value: "The heavier rider needs twice the speed", errorId: "mass-not-weight" },
        { value: "The heavier rider needs √2 times the speed", errorId: "forgot-square" },
        { value: "The heavier rider needs a lower speed", errorId: "ratio-inverted" },
      ],
      explanation: "Setting N = 0 at the top gives mg = mv²/r; the mass divides out, so v_min = √(gr) depends only on g and the radius.",
      latex: "v_{\\min} = \\sqrt{gr}",
      equationId: "vmin-loop",
    },
    {
      prompt: "A ball on a string is whirled in a vertical circle. At the BOTTOM of the circle, the tension in the string is",
      answer: "greater than mg, because T − mg must equal mv²/r",
      wrong: [
        { value: "equal to mg, since the string just holds the ball up", errorId: "tension-equals-weight" },
        { value: "less than mg, because part of the weight is 'used' for the circle", errorId: "top-bottom-loop-sign" },
        { value: "equal to mv²/r", errorId: "centripetal-only" },
      ],
      explanation: "At the bottom the tension points up (toward the center) and gravity down. The net inward force T − mg must be mv²/r, so T = m(g + v²/r) > mg.",
      latex: "T - mg = \\frac{mv^2}{r}",
      equationId: "vertical-circle",
    },
    {
      prompt: "A rider at the top of a loop moves faster than the minimum speed. Compared with the minimum-speed case, the normal force from the seat is",
      answer: "larger — the seat must push harder to supply the bigger mv²/r",
      wrong: [
        { value: "smaller — the rider is 'thrown outward' more", errorId: "centrifugal-outward" },
        { value: "the same, equal to mg", errorId: "normal-equals-mg" },
        { value: "zero at any speed at the top", errorId: "arithmetic-slip" },
      ],
      explanation: "At the top N = m(v²/r − g). A larger v means a larger required centripetal force, and gravity is fixed, so the seat supplies the extra.",
      latex: "N_{\\text{top}} = m\\left(\\frac{v^2}{r} - g\\right)",
      equationId: "vertical-circle",
    },
  ],
);
