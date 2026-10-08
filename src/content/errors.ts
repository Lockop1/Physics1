/**
 * Library of named mistakes. Every MCQ distractor must reference one of these
 * by id. A template's solver applies the mistake to the SAME parameters to
 * produce the distractor value — never a random offset.
 */
export interface NamedError {
  id: string;
  label: string; // short, shown next to the wrong choice
  explanation: string; // 1–2 sentences: why it's wrong
  exam: "exam1" | "exam2" | "both";
}

const e = (id: string, label: string, explanation: string, exam: NamedError["exam"] = "exam2"): NamedError => ({
  id,
  label,
  explanation,
  exam,
});

export const ERRORS: NamedError[] = [
  // ---------- generic ----------
  e(
    "arithmetic-slip",
    "Arithmetic slip (factor of 2 or 10)",
    "This value is off by a simple factor — a dropped 2, a misplaced decimal, or a squared number that wasn't squared. Recheck each step with units.",
    "both",
  ),

  // ---------- Exam 2 traps ----------
  e(
    "diameter-as-radius",
    "Used diameter as radius",
    "The problem gave a diameter. Every circular-motion formula (a_c = v²/r, v = 2πr/T, s = rθ) wants the radius, so divide the diameter by 2 first.",
  ),
  e(
    "rpm-not-converted",
    "rev/min used as rad/s",
    "Angular speed in rev/min (or rev/s) must be converted: multiply by 2π rad/rev, and divide by 60 s/min. Only rad/s works in v = rω and a_c = rω².",
  ),
  e(
    "degrees-in-radian-formula",
    "Degrees in a radian formula",
    "s = rθ and ω = Δθ/Δt require θ in radians. Convert degrees with θ_rad = θ_deg · π/180 (and revolutions with 2π per rev).",
  ),
  e(
    "forgot-square",
    "Forgot to square",
    "This quantity depends on the square — v² in a_c = v²/r and K = ½mv², ω² in a_c = rω², r² in F = Gm₁m₂/r². The value here uses the first power.",
  ),
  e(
    "normal-equals-mg",
    "Assumed N = mg",
    "N = mg only on a horizontal surface with no vertical acceleration and no other vertical force components. Angled forces, inclines, and vertical acceleration all change N — write ΣF_y = ma_y and solve for N.",
  ),
  e(
    "incline-sin-cos-swap",
    "sin/cos swapped on incline",
    "On an incline of angle θ the gravity component along the slope is mg sin θ and the component into the slope is mg cos θ. These were swapped.",
  ),
  e(
    "static-vs-kinetic",
    "Used the wrong friction coefficient",
    "Use μ_s only to test whether an object at rest will start to move (f_s,max = μ_s N). Once it slides, friction is f_k = μ_k N. The wrong coefficient was used here.",
  ),
  e(
    "didnt-check-static",
    "Didn't check whether static friction holds",
    "Before computing an acceleration, compare the applied force along the surface with f_s,max = μ_s N. If the applied force is smaller, the object stays at rest and a = 0.",
  ),
  e(
    "top-bottom-loop-sign",
    "Wrong sign at top/bottom of a vertical circle",
    "At the top of a loop both N and mg point toward the center: N + mg = mv²/r. At the bottom they oppose: N − mg = mv²/r. The signs were swapped here.",
  ),
  e(
    "altitude-not-plus-radius",
    "Used altitude h instead of R_E + h",
    "The distance in g = GM/r² is measured from Earth's center, so r = R_E + h, not h. Using h alone gives a wildly wrong value.",
  ),
  e(
    "inverse-not-inverse-square",
    "Scaled with 1/r instead of 1/r²",
    "Gravitational force and g fall off as 1/r². Doubling the distance divides the force by 4, not by 2.",
  ),
  e(
    "work-ignores-angle",
    "Ignored the angle in W = Fd cos θ",
    "Only the component of the force along the displacement does work. With θ between F and d, W = Fd cos θ — the cos θ factor was left out.",
  ),
  e(
    "work-sign-flip",
    "Wrong sign of work",
    "A force with a component opposite the displacement does negative work. Check the sign of cos θ (or of the area under the F–x curve).",
  ),
  e(
    "area-as-F-times-d",
    "Used F × Δx instead of the area under the curve",
    "For a varying force, work is the signed area under the F–x graph (or ∫F dx), not a single F times the total displacement.",
  ),
  e(
    "cm-not-converted",
    "cm used as m",
    "Lengths must be in meters in SI formulas. A radius or displacement in cm must be divided by 100 first.",
  ),
  e(
    "tangential-only",
    "Reported only the tangential acceleration",
    "In non-uniform circular motion there are two perpendicular components: a_c = v²/r toward the center and a_t along the path. The magnitude is √(a_c² + a_t²).",
  ),
  e(
    "centripetal-only",
    "Reported only the centripetal acceleration",
    "When the speed is changing there is also a tangential component a_t. Combine them: a = √(a_c² + a_t²).",
  ),
  e(
    "mass-not-weight",
    "Mass used where weight belongs",
    "Mass (kg) is not a force. Weight is W = mg in newtons — multiply by g before using it in a force equation.",
  ),
  e(
    "pulley-single-mass",
    "Used only one mass for the connected system",
    "The whole system accelerates together, so the net external force acts on the total mass (m₁ + m₂), not just the hanging or sliding one.",
  ),
  e(
    "period-frequency-swap",
    "Period and frequency confused",
    "T is seconds per revolution; f = 1/T is revolutions per second. ω = 2π/T = 2πf — using T where f belongs (or vice versa) inverts the answer.",
  ),
  e(
    "velocity-not-tangent",
    "Velocity not drawn tangent to the path",
    "In circular motion the velocity vector is always tangent to the circle at the object's position, pointing in the direction of travel (CW or CCW).",
    "both",
  ),
  e(
    "acceleration-along-velocity",
    "Centripetal acceleration drawn along the velocity",
    "In uniform circular motion the acceleration is perpendicular to the velocity, pointing toward the center of the circle — not along the motion.",
    "both",
  ),
  e(
    "centrifugal-outward",
    "Acceleration drawn outward (centrifugal)",
    "There is no outward force on the object. The net force and acceleration point toward the center of the circle.",
    "both",
  ),
  e(
    "cw-ccw-swap",
    "Direction of travel reversed (CW vs CCW)",
    "The tangent line is right, but the arrow points the wrong way along it. Check whether the motion is clockwise or counter-clockwise at that point.",
    "both",
  ),

  // ---------- Exam 1 traps ----------
  e(
    "sin-cos-swap",
    "sin/cos components swapped",
    "A component is cos of the angle to that axis and sin of the angle away from it. When the angle is measured from the vertical (or from the y-axis), the x-component uses sin and the y-component uses cos.",
    "exam1",
  ),
  e(
    "arctan-inverted",
    "tan⁻¹(x/y) instead of tan⁻¹(y/x)",
    "The direction from the +x axis is θ = tan⁻¹(A_y / A_x). The argument was inverted, giving the complementary angle.",
    "exam1",
  ),
  e(
    "arctan-quadrant",
    "Calculator angle not corrected for quadrant",
    "tan⁻¹ only returns angles between −90° and 90°. If A_x < 0 the vector is in quadrant II or III — add 180° to the calculator result.",
    "exam1",
  ),
  e(
    "linear-conversion-on-area-volume",
    "Linear factor applied to an area or volume",
    "Converting m² or m³ requires the conversion factor squared or cubed (e.g. 1 m³ = 10⁶ cm³, not 10² cm³).",
    "exam1",
  ),
  e(
    "range-missing-factor-2",
    "Dropped the factor of 2 in the range formula",
    "Level-ground range is R = v₀² sin(2θ)/g, or equivalently uses the full flight time 2v₀ sin θ/g. Half the flight time (time to the top) gives half the range.",
    "exam1",
  ),
  e(
    "height-vs-range",
    "Max-height formula used for range (or vice versa)",
    "Max height uses the vertical component only: H = (v₀ sin θ)²/(2g). Range uses sin 2θ. The two were confused.",
    "exam1",
  ),
  e(
    "wrong-g",
    "Used 9.80 m/s² when the problem gives a different g",
    "The problem specifies a different gravitational acceleration (another planet, or a rounded value). Use the given g.",
    "exam1",
  ),
  e(
    "motion-vs-acceleration-direction",
    "Assumed acceleration points along the motion",
    "Acceleration points along the change in velocity, not along the velocity itself. An object can move one way while accelerating the opposite way (slowing) or sideways (turning).",
    "exam1",
  ),
  e(
    "revolutions-not-converted",
    "Revolutions used as radians",
    "One revolution is 2π radians. Multiply the number of revolutions by 2π before using s = rθ or ω = Δθ/Δt.",
  ),
  e(
    "unit-conversion-direction",
    "Conversion factor applied the wrong way",
    "The conversion was multiplied where it should have been divided (or vice versa). Carry the units through and cancel them explicitly.",
    "both",
  ),
];

export const ERROR_IDS = new Set(ERRORS.map((x) => x.id));

export function errorById(id: string): NamedError | undefined {
  return ERRORS.find((x) => x.id === id);
}
