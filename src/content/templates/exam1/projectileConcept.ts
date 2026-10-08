import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "e1.projectiles.concept",
    topicId: "e1.projectiles",
    title: "Projectile concepts (independence of x and y, apex, symmetric angles)",
    source: "Ch 4 lecture — CQ #1 (a_y in flight), CQ #2 (time up vs down), trajectory slides (15° and 75° same range)",
    equations: ["projectile-components", "projectile-range"],
    recipe: ["x: constant velocity (a_x = 0)", "y: free fall (a_y = −g)", "At the apex v_y = 0 but v_x ≠ 0"],
    hints: ["The two directions are independent and share only the time.", "Gravity never changes during the flight.", "sin 2θ is the same for θ and 90° − θ."],
  },
  [
    {
      prompt: "You toss a water bottle across the room. While it is in the air, its acceleration in the y-direction is",
      answer: "−9.80 m/s² (downward) the entire time",
      wrong: [
        { value: "0 at the top of the arc", errorId: "free-fall-sign" },
        { value: "positive on the way up, negative on the way down", errorId: "motion-vs-acceleration-direction" },
        { value: "It depends on how hard it was thrown", errorId: "arithmetic-slip" },
      ],
      explanation: "A projectile is in free fall from release: a_x = 0, a_y = −g always, regardless of its velocity.",
      latex: "a_x = 0,\\qquad a_y = -g",
      equationId: "projectile-components",
    },
    {
      prompt: "A ball is tossed upward from the ground. The time to reach the top compared with the time to fall back is",
      answer: "the same",
      wrong: [
        { value: "less", errorId: "arithmetic-slip" },
        { value: "more", errorId: "arithmetic-slip" },
        { value: "can't tell without the speed", errorId: "arithmetic-slip" },
      ],
      explanation: "Same |a|, same height, so the up and down halves are mirror images in time (ignoring air resistance).",
      latex: "t_{\\text{up}} = t_{\\text{down}} = \\frac{v_0\\sin\\theta_0}{g}",
      equationId: "projectile-range",
    },
    {
      prompt: "At the highest point of its trajectory, a projectile launched at an angle has",
      answer: "zero vertical velocity but nonzero horizontal velocity v₀ cos θ",
      wrong: [
        { value: "zero velocity", errorId: "vy-nonzero-at-top" },
        { value: "zero acceleration", errorId: "free-fall-sign" },
        { value: "its maximum speed", errorId: "arithmetic-slip" },
      ],
      explanation: "v_y = 0 at the apex while v_x = v₀ cos θ never changes. The speed there is the minimum of the flight, not zero.",
      latex: "v_{\\text{top}} = v_0\\cos\\theta_0",
      equationId: "projectile-components",
    },
    {
      prompt: "Two projectiles are launched with the same speed at 15° and 75° above the horizontal on level ground. Compare their ranges and maximum heights.",
      answer: "Same range; the 75° launch goes higher",
      wrong: [
        { value: "The 75° launch has the greater range", errorId: "height-vs-range" },
        { value: "The 15° launch has the greater range and height", errorId: "arithmetic-slip" },
        { value: "Same range and same height", errorId: "arithmetic-slip" },
      ],
      explanation: "R = v₀² sin 2θ/g and sin 30° = sin 150°, so the ranges match. Height ∝ sin²θ, which is larger at 75°.",
      latex: "R \\propto \\sin 2\\theta_0,\\qquad h \\propto \\sin^2\\theta_0",
      equationId: "projectile-range",
    },
    {
      prompt: "A ball rolls off a horizontal table while an identical ball is dropped from the table edge at the same instant. Which hits the floor first?",
      answer: "Both at the same time — the horizontal motion doesn't affect the fall",
      wrong: [
        { value: "The dropped ball, since it travels a shorter path", errorId: "arithmetic-slip" },
        { value: "The rolling ball, since it is moving faster", errorId: "used-full-speed-as-component" },
        { value: "It depends on the rolling speed", errorId: "arithmetic-slip" },
      ],
      explanation: "Both start with v_y = 0 and fall with a_y = −g; the vertical motions are identical. The rolling ball just also moves sideways.",
      latex: "t = \\sqrt{\\frac{2h}{g}} \\text{ for both}",
      equationId: "projectile-components",
    },
    {
      prompt: "For a projectile on level ground, the launch angle that gives the maximum range (same speed) is",
      answer: "45°",
      wrong: [
        { value: "90°", errorId: "height-vs-range" },
        { value: "30°", errorId: "arithmetic-slip" },
        { value: "60°", errorId: "arithmetic-slip" },
      ],
      explanation: "R = v₀² sin 2θ/g is largest when sin 2θ = 1, i.e. 2θ = 90°.",
      latex: "R_{\\max} = \\frac{v_0^2}{g} \\text{ at } \\theta_0 = 45^\\circ",
      equationId: "projectile-range",
    },
    {
      prompt: "A projectile is launched at speed v₀ and angle θ from a cliff. To find its time in the air you should use",
      answer: "the y-equation y = v₀ sin θ · t − ½gt² with y = −H, solving the quadratic",
      wrong: [
        { value: "t = 2v₀ sin θ / g", errorId: "range-missing-factor-2" },
        { value: "t = R / (v₀ cos θ) with R the level-ground range", errorId: "height-vs-range" },
        { value: "t = √(2H/g)", errorId: "used-full-speed-as-component" },
      ],
      explanation: "The level-ground formulas assume landing at the launch height. From a cliff, write the full vertical equation with the final y = −H and solve for t (positive root).",
      latex: "-H = v_0\\sin\\theta_0\\,t - \\tfrac12 g t^2",
      equationId: "projectile-components",
    },
  ],
);
