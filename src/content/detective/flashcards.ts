/**
 * Situation flashcards: front = a situation phrase, back = the equation(s) + why.
 * Built from the equation sheet's trigger phrases plus hand-written template-style situations.
 */
import { EQUATIONS } from "../equations";

export interface Flashcard {
  id: string;
  front: string;
  equationIds: string[];
  why: string;
}

const HAND_WRITTEN: Flashcard[] = [
  { id: "sit-flat-curve-vmax", front: "Car on a flat curve — fastest speed without skidding", equationIds: ["sum-fc", "friction-static", "vmax-flat-curve"], why: "Static friction (max μ_s mg) is the only inward force; set it equal to mv²/r." },
  { id: "sit-banked-no-friction", front: "Banked road, icy (no friction) — design speed or angle", equationIds: ["sum-fc", "banked-angle"], why: "N cos θ = mg and N sin θ = mv²/r divide to tan θ = v²/(rg)." },
  { id: "sit-top-of-loop", front: "Top of a roller-coaster loop — seat force", equationIds: ["sum-fc", "vertical-circle"], why: "Both N and mg point toward the center: N + mg = mv²/r." },
  { id: "sit-min-speed-loop", front: "Minimum speed to stay on the track at the top", equationIds: ["vmin-loop"], why: "Set N = 0 so gravity alone is centripetal: v = √(gr)." },
  { id: "sit-ferris-bottom", front: "Bottom of a Ferris wheel — seat force (feels heaviest)", equationIds: ["sum-fc", "vertical-circle"], why: "N − mg = mv²/r, so N = m(g + v²/r)." },
  { id: "sit-conical", front: "Ball on a string swinging in a horizontal circle", equationIds: ["conical-pendulum", "sum-fc"], why: "T cos θ holds the weight; T sin θ is the centripetal force; a_c = g tan θ." },
  { id: "sit-rpm", front: "Rotation rate given in rev/min, want a_c of a point at radius r", equationIds: ["rad-conv", "omega-def", "ac-v2-over-r"], why: "Convert to rad/s (×2π, ÷60), then a_c = rω²." },
  { id: "sit-uturn-braking", front: "Car slowing down while making a U-turn — total acceleration", equationIds: ["ac-v2-over-r", "a-total-circular"], why: "Two perpendicular components: a_c = v²/r and the given a_t; combine with √(a_c² + a_t²)." },
  { id: "sit-angled-push-friction", front: "Push at an angle on a block at rest with μ_s and μ_k given", equationIds: ["newton-2", "friction-static", "friction-kinetic"], why: "N ≠ mg (angled force); check F cos θ against μ_s N first; if it slides use μ_k N." },
  { id: "sit-critical-angle", front: "Board tilted until the block just starts to slip", equationIds: ["friction-static", "newton-2"], why: "mg sin θ = μ_s mg cos θ → μ_s = tan θ_c." },
  { id: "sit-incline-slide", front: "Block sliding down a rough incline — acceleration", equationIds: ["newton-2", "friction-kinetic"], why: "a = g(sin θ − μ_k cos θ) with N = mg cos θ." },
  { id: "sit-table-pulley", front: "Block on a table tied over a pulley to a hanging mass", equationIds: ["newton-2", "weight"], why: "Two FBDs, same T and a; add the equations: a = m₂g/(m₁ + m₂)." },
  { id: "sit-two-cables", front: "Sign hanging from two cables at different angles", equationIds: ["vec-components", "newton-2"], why: "Knot in equilibrium: ΣF_x = 0 and ΣF_y = 0 give two equations for T₁, T₂." },
  { id: "sit-elevator-scale", front: "Standing on a scale in an accelerating elevator", equationIds: ["newton-2", "weight"], why: "Scale reads N: N − mg = ma_y, so N = m(g + a_y)." },
  { id: "sit-spring-incline", front: "Spring holding a block on a frictionless incline", equationIds: ["hooke", "newton-2"], why: "Along the slope: kx = mg sin θ." },
  { id: "sit-g-altitude", front: "Gravity (or weight) at an altitude h above Earth", equationIds: ["g-altitude"], why: "g = GM/(R_E + h)² — distance from the center, km → m." },
  { id: "sit-orbit-speed", front: "Satellite in a circular orbit — speed and period", equationIds: ["v-orbit", "T-orbit"], why: "Gravity is the centripetal force: GMm/r² = mv²/r; the satellite mass cancels." },
  { id: "sit-planet-mass", front: "Find a planet's mass from a moon's orbit", equationIds: ["T-orbit", "v-2pir-over-T"], why: "v = 2πr/T, then M = v²r/G (or M = 4π²r³/GT²)." },
  { id: "sit-work-angle", front: "Pulling a vacuum cleaner with the handle at an angle", equationIds: ["work-const"], why: "W = Fd cos θ, θ between the force and the (horizontal) displacement." },
  { id: "sit-work-varying", front: "Force given as a function of x, e.g. F = −2/x", equationIds: ["work-integral"], why: "Varying force → W = ∫F dx, not F·Δx." },
  { id: "sit-work-graph", front: "Graph of F versus x — work over an interval", equationIds: ["work-integral"], why: "Signed area under the curve; regions below the axis are negative." },
  { id: "sit-spring-work", front: "Work done by a spring between two stretches", equationIds: ["work-spring"], why: "W_s = ½k(x_i² − x_f²); negative while being stretched further." },
  { id: "sit-final-speed-energy", front: "Final speed after a force acts over a distance (no time given)", equationIds: ["work-energy", "kinetic-energy"], why: "W_net = ½mv_f² − ½mv_i² — energy skips the acceleration step." },
  { id: "sit-friction-stop", front: "Sliding to a stop on a rough floor — stopping distance", equationIds: ["work-friction", "work-energy"], why: "−μ_k mg d = −½mv² → d = v²/(2μ_k g)." },
  { id: "sit-power-lift", front: "Motor lifting an elevator at constant speed — power", equationIds: ["newton-2", "power"], why: "T = Mg + f, then P = Tv." },
  { id: "sit-velocity-direction", front: "Direction of velocity at a point on a circle", equationIds: ["ac-v2-over-r"], why: "Velocity is tangent to the circle; acceleration (uniform motion) points to the center." },
  { id: "sit-zero-net-force", front: "Object moving at constant velocity — what is the net force?", equationIds: ["newton-2"], why: "Zero. Constant velocity means a = 0; no force is needed to keep it moving." },
  { id: "sit-mass-weight", front: "Given a mass in kg, need the gravitational force", equationIds: ["weight"], why: "W = mg; kg is not a force." },
];

/** One card per equation, built from its trigger phrases. */
function fromEquations(): Flashcard[] {
  return EQUATIONS.map((e) => ({
    id: `eq-${e.id}`,
    front: e.triggers.slice(0, 3).join(" · "),
    equationIds: [e.id],
    why: e.useWhen[0] ?? e.name,
  }));
}

export const FLASHCARDS: Flashcard[] = [...HAND_WRITTEN, ...fromEquations()];

export function flashcardById(id: string): Flashcard | undefined {
  return FLASHCARDS.find((c) => c.id === id);
}
