import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "e1.freefall.concept",
    topicId: "e1.freefall",
    title: "Free-fall concepts (velocity at the top, acceleration, up vs down)",
    source: "Ch 3 lecture — CQ #3, CQ #4, ABCD cards (wrench vs feather; speed after throw)",
    equations: ["kin-v", "kin-v2"],
    recipe: ["Free fall = constant a = −g (up +), from release to landing", "Velocity can be zero while acceleration is not", "Thrown up: returns to launch height at the same speed, opposite direction"],
    hints: ["Separate velocity (what it's doing now) from acceleration (how velocity is changing).", "g doesn't switch off at the top.", "Mass doesn't appear in any free-fall equation."],
  },
  [
    {
      prompt: "You toss a ball straight up at 3.00 m/s. What is its velocity at the highest point?",
      answer: "0 m/s",
      wrong: [
        { value: "3.00 m/s", errorId: "vy-nonzero-at-top" },
        { value: "−9.80 m/s", errorId: "motion-vs-acceleration-direction" },
        { value: "−3.00 m/s", errorId: "vy-nonzero-at-top" },
      ],
      explanation: "The ball momentarily stops at the top before coming back down: v = 0 there. Its acceleration is still −9.80 m/s².",
      latex: "v_{\\text{top}} = 0,\\qquad a = -g",
      equationId: "kin-v",
    },
    {
      prompt: "What happens to the ACCELERATION of a ball after it is thrown straight up (neglect air resistance)?",
      answer: "It remains the same: 9.80 m/s² downward the whole time",
      wrong: [
        { value: "It decreases on the way up, is zero at the top, and increases on the way down", errorId: "free-fall-sign" },
        { value: "It is upward on the way up and downward on the way down", errorId: "motion-vs-acceleration-direction" },
        { value: "It decreases until the ball stops", errorId: "motion-vs-acceleration-direction" },
      ],
      explanation: "Gravity is the only force, so a = −g at every instant, including the top where v = 0.",
      latex: "a_y = -9.80\\ \\text{m/s}^2 \\text{ throughout}",
      equationId: "kin-v",
    },
    {
      prompt: "What happens to the SPEED of a ball after it is thrown straight up?",
      answer: "It decreases, then increases",
      wrong: [
        { value: "It remains the same", errorId: "arithmetic-slip" },
        { value: "It increases, then decreases", errorId: "motion-vs-acceleration-direction" },
        { value: "It decreases the whole time", errorId: "arithmetic-slip" },
      ],
      explanation: "Going up, v and a are opposite → slowing. After the top, v and a are both downward → speeding up.",
      latex: "|v| = |v_0 - gt|",
      equationId: "kin-v",
    },
    {
      prompt: "A wrench and a feather are dropped at the same time in a vacuum. Which hits the ground first?",
      answer: "They land at the same time",
      wrong: [
        { value: "The wrench, because it is heavier", errorId: "mass-not-weight" },
        { value: "The feather, because it has less inertia", errorId: "mass-not-weight" },
        { value: "The wrench, by a factor of its mass ratio", errorId: "mass-not-weight" },
      ],
      explanation: "With no air resistance every object has the same acceleration g; h = ½gt² does not contain the mass.",
      latex: "t = \\sqrt{\\frac{2h}{g}}",
      equationId: "kin-x",
    },
    {
      prompt: "Two balls are thrown from a cliff at the same speed, one straight up and one straight down. Just before landing,",
      answer: "they have the same speed",
      wrong: [
        { value: "the one thrown down is faster", errorId: "free-fall-sign" },
        { value: "the one thrown up is faster, because it fell from higher", errorId: "arithmetic-slip" },
        { value: "the one thrown up is faster, because it spent longer in the air", errorId: "arithmetic-slip" },
      ],
      explanation: "The upward ball returns to the cliff edge moving down at the launch speed, so from there the two motions are identical. v² = v₀² + 2gH for both.",
      latex: "v^2 = v_0^2 + 2gH",
      equationId: "kin-v2",
    },
    {
      prompt: "A ball thrown straight up takes 2.0 s to reach its highest point. How long does it take to fall back to the launch height from there?",
      answer: "2.0 s — the motion is symmetric",
      wrong: [
        { value: "Less than 2.0 s, since it speeds up on the way down", errorId: "arithmetic-slip" },
        { value: "More than 2.0 s", errorId: "arithmetic-slip" },
        { value: "4.0 s", errorId: "range-missing-factor-2" },
      ],
      explanation: "Same acceleration, same distance, starting from rest at the top versus ending at rest at the top: the times are equal.",
      latex: "t_{\\text{up}} = t_{\\text{down}} = \\frac{v_0}{g}",
      equationId: "kin-v",
    },
    {
      prompt: "An object in free fall near Earth's surface. Which quantity is constant?",
      answer: "Its acceleration",
      wrong: [
        { value: "Its velocity", errorId: "arithmetic-slip" },
        { value: "Its speed", errorId: "arithmetic-slip" },
        { value: "Its kinetic energy", errorId: "arithmetic-slip" },
      ],
      explanation: "Free fall means the only force is gravity, giving the constant acceleration g downward. Velocity changes by 9.80 m/s every second.",
      latex: "a = -g = \\text{const}",
      equationId: "kin-v",
    },
  ],
);
