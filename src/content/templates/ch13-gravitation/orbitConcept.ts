import { conceptTemplate } from "../helpers";

export const template = conceptTemplate(
  {
    id: "ch13.orbits.concept",
    topicId: "ch13.orbits",
    title: "Orbit concepts (what holds a satellite up, does mass matter)",
    source: "Ch 6b lecture — 13.4 Satellite orbits",
    equations: ["grav-force", "sum-fc", "v-orbit", "T-orbit"],
    recipe: ["Gravity is the only force on an orbiting satellite", "GMm/r² = mv²/r → the satellite mass cancels", "v = √(GM/r), T = 2π√(r³/GM)"],
    hints: ["Ask what force acts and what it must equal.", "Look at which symbols survive after cancelling m.", "Larger r → smaller v but longer T."],
  },
  [
    {
      prompt: "What force keeps a satellite in a circular orbit around Earth?",
      answer: "Earth's gravity, acting as the centripetal force",
      wrong: [
        { value: "Its rocket engines, which must keep firing", errorId: "force-required-for-motion" },
        { value: "A balance between gravity and centrifugal force", errorId: "centrifugal-outward" },
        { value: "Nothing — there is no gravity in orbit", errorId: "weightless-means-no-gravity" },
      ],
      explanation: "Gravity is the only force on the satellite. It is not balanced by anything; it IS the net (centripetal) force that continually bends the path into a circle.",
      latex: "\\frac{G M m}{r^2} = \\frac{m v^2}{r}",
      equationId: "sum-fc",
    },
    {
      prompt: "Two satellites, one twice as massive as the other, are in the same circular orbit. How do their orbital speeds compare?",
      answer: "They are equal — the satellite's mass cancels",
      wrong: [
        { value: "The heavier one is √2 times slower", errorId: "orbit-mass-matters" },
        { value: "The heavier one is twice as fast", errorId: "orbit-mass-matters" },
        { value: "The heavier one is slower, since gravity pulls it harder", errorId: "mass-not-weight" },
      ],
      explanation: "GMm/r² = mv²/r → v = √(GM/r). Only the central mass M and the radius r matter.",
      latex: "v = \\sqrt{\\frac{GM}{r}}",
      equationId: "v-orbit",
    },
    {
      prompt: "A satellite is moved from a low orbit to a higher circular orbit. Its orbital speed",
      answer: "decreases, and its period increases",
      wrong: [
        { value: "increases, because it has more energy", errorId: "ratio-inverted" },
        { value: "stays the same; orbital speed is a constant 7.9 km/s", errorId: "arithmetic-slip" },
        { value: "decreases, and its period also decreases", errorId: "period-frequency-swap" },
      ],
      explanation: "v = √(GM/r) falls as r grows; T = 2π√(r³/GM) grows faster than r. Higher orbits are slower and take longer.",
      latex: "v \\propto r^{-1/2},\\qquad T \\propto r^{3/2}",
      equationId: "T-orbit",
    },
    {
      prompt: "Astronauts on the ISS float freely. The best explanation is",
      answer: "they and the station are in free fall together, so nothing pushes on them (apparent weightlessness)",
      wrong: [
        { value: "there is no gravity 400 km up", errorId: "weightless-means-no-gravity" },
        { value: "the centrifugal force exactly cancels gravity", errorId: "centrifugal-outward" },
        { value: "their weight is too small to notice at that altitude", errorId: "inverse-not-inverse-square" },
      ],
      explanation: "g at the ISS is about 8.7 m/s² — nearly 90% of the surface value. Everything in the station accelerates toward Earth at that rate, so there is no normal force: that is what 'weightless' means.",
      latex: "g_{\\text{ISS}} = \\frac{GM_E}{(R_E + h)^2} \\approx 8.7\\ \\text{m/s}^2",
      equationId: "grav-force",
    },
    {
      prompt: "To find the mass of a planet you need to observe",
      answer: "the orbital radius AND period of one of its moons",
      wrong: [
        { value: "only the planet's radius", errorId: "arithmetic-slip" },
        { value: "the mass of one of its moons", errorId: "orbit-mass-matters" },
        { value: "only the orbital period of a moon", errorId: "arithmetic-slip" },
      ],
      explanation: "From T = 2π√(r³/GM), M = 4π²r³/(GT²). The moon's own mass cancels and does not need to be known.",
      latex: "M = \\frac{4\\pi^2 r^3}{G T^2}",
      equationId: "T-orbit",
    },
  ],
);
