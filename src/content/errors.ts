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

  // ---------- Ch 5 / 6 additions (Session 2) ----------
  e(
    "third-law-same-object",
    "Paired two forces acting on the same object",
    "A third-law pair is two forces between the SAME two objects, acting on different objects. The normal force and the weight both act on the monitor, so they are not a pair (they just happen to balance).",
  ),
  e(
    "third-law-wrong-partner",
    "Right kind of force, wrong pair of objects",
    "The reaction to 'A pushes on B' is 'B pushes on A' — same type of force, same magnitude, opposite direction, swapped objects. This choice swaps in a different object or a different kind of force.",
  ),
  e(
    "zero-net-force-means-rest",
    "Assumed zero net force means at rest",
    "ΣF = 0 means zero acceleration: the object is either at rest OR moving at constant velocity. Newton's first law does not require it to be stationary.",
  ),
  e(
    "force-required-for-motion",
    "Assumed a net force is needed to keep moving",
    "No net force is needed to maintain constant velocity. A net force is needed only to CHANGE velocity (speed up, slow down, or turn).",
  ),
  e(
    "wrong-law-number",
    "Attributed the situation to the wrong law",
    "First law: no net force → constant velocity. Second law: net force → acceleration (ΣF = ma). Third law: forces come in equal-and-opposite pairs between two objects.",
  ),
  e(
    "tension-equals-weight",
    "Assumed T = mg while accelerating",
    "T = mg only when the vertical acceleration is zero. Write ΣF_y = ma_y: T − mg = ma_y, so T is larger when accelerating up and smaller when accelerating down.",
  ),
  e(
    "elevator-sign",
    "Wrong sign on the acceleration term",
    "Accelerating upward means a_y > 0 so T (or N) = m(g + a); accelerating downward means a_y < 0 so T = m(g − a). The sign was flipped here. (An elevator moving down but slowing is accelerating UP.)",
  ),
  e(
    "angle-complement",
    "Used the complementary angle",
    "The angle was measured from the wrong reference (ceiling vs vertical, horizontal vs incline). cos θ and sin θ swap when you use 90° − θ.",
  ),
  e(
    "forgot-friction",
    "Left friction out of ΣF",
    "The surface is rough, so a friction force opposing the (impending) motion must appear in the force sum along the surface.",
  ),
  e(
    "forgot-gravity-component",
    "Ignored the gravity component along the incline",
    "On an incline, gravity has a component mg sin θ along the slope that must appear in ΣF_x along with tension, spring force, or friction.",
  ),
  e(
    "rope-direction-flip",
    "Rope/tension direction reversed",
    "Check which way the rope pulls. A rope pulling down-slope ADDS to mg sin θ; a rope pulling up-slope opposes it. The sign of T was flipped here.",
  ),
  e(
    "added-magnitudes-no-components",
    "Added force magnitudes without taking components",
    "Forces are vectors. Resolve each into x and y components first, then sum per axis; adding magnitudes only works when the forces are parallel.",
  ),
  e(
    "critical-angle-sin-not-tan",
    "Used sin θ (or cos θ) instead of tan θ",
    "At the critical angle, mg sin θ = μ_s mg cos θ, so μ_s = tan θ_c — not sin θ_c.",
  ),
  e(
    "forgot-sqrt",
    "Forgot the square root",
    "v² = v₀² + 2aΔx gives v SQUARED. Take the square root to get the speed.",
    "both",
  ),
  e(
    "treated-as-free-fall",
    "Treated the hanging mass as free fall (a = g)",
    "The hanging mass is attached to another mass by the rope, so it accelerates at the system's acceleration a = m₂g/(m₁ + m₂), not at g.",
  ),
  e(
    "static-max-not-needed",
    "Reported μ_s N when friction only balances a smaller force",
    "Static friction adjusts to whatever is needed to prevent motion, up to μ_s N. If the object isn't on the verge of slipping, f_s equals the force it balances (e.g. mg sin θ), not μ_s N.",
  ),
  e(
    "pushed-up-forgot-gravity",
    "Forgot gravity in the vertical force sum",
    "A vertical push doesn't act alone — weight mg pulls down. Use ΣF_y = F − mg = ma, not F = ma.",
  ),

  e(
    "kinematics-missing-half",
    "Dropped the ½ in x = ½at²",
    "Starting from rest with constant acceleration, the displacement is ½at², not at². Half the distance was doubled here.",
    "both",
  ),
  e(
    "ignored-force-angle",
    "Used the whole force instead of its component",
    "Only the component of the force along the surface (F cos θ) pushes the block along it; the perpendicular part (F sin θ) changes the normal force instead.",
  ),
  e(
    "vertical-component-sign",
    "Vertical component added with the wrong sign",
    "A force pushing DOWN at an angle increases N (N = mg + F sin θ); a force pulling UP at an angle decreases it (N = mg − F sin θ). The sign was flipped.",
  ),

  // ---------- Ch 6 / 13 / 7 additions (Session 3) ----------
  e("km-not-converted", "km used as m", "Altitudes and radii given in km must be converted to meters (×1000) before combining with R_E = 6.37 × 10⁶ m or using SI constants."),
  e("ratio-inverted", "Ratio inverted", "The factor was computed upside down (e.g. 4 instead of 1/4). Check which quantity got bigger and which got smaller."),
  e("centripetal-as-extra-force", "Treated mv²/r as an extra force", "mv²/r is the NET force required for circular motion, not an additional outward or inward force on the free-body diagram. Only real forces (N, mg, T, friction) go on the diagram; their radial sum equals mv²/r."),
  e("orbit-mass-matters", "Thought the satellite's mass matters", "In GMm/r² = mv²/r the satellite's mass cancels. Orbital speed and period depend only on the central mass and the orbit radius."),
  e("weightless-means-no-gravity", "Assumed 'weightless' means no gravity", "Astronauts in orbit still have weight — gravity is what keeps them in orbit (g ≈ 8.7 m/s² at the ISS). They feel weightless because they and the station are in free fall together."),
  e("integrated-wrong-power", "Integration slip (wrong power of x)", "∫ a xⁿ dx = a xⁿ⁺¹/(n+1). The power must go UP by one and be divided by the new power — here it was differentiated, or the exponent wasn't raised."),
  e("log-of-difference", "ln of a difference instead of a ratio", "∫ dx/x = ln x, so the definite integral is ln(x_f) − ln(x_i) = ln(x_f / x_i) — not ln(x_f − x_i)."),
  e("ignored-negative-area", "Counted area below the axis as positive", "Where F is negative the force opposes the motion and the work is negative. The area below the x-axis subtracts from the total."),
  e("spring-work-missing-half", "Dropped the ½ in ½kx²", "The spring force grows linearly from 0 to kx, so the work is the triangle area ½kx², not kx·x."),
  e("work-by-vs-on-spring", "Confused work BY the spring with work ON it", "Stretching a spring from its natural length, the spring does NEGATIVE work (−½kx²) while the external agent does +½kx². The sign was swapped."),
  e("minutes-not-converted", "Minutes used as seconds", "Power is in watts = joules per SECOND. Convert the time interval to seconds (×60) first."),
  e("gravity-work-sign", "Wrong sign for the work done by gravity", "Gravity does negative work when the object rises (force down, displacement up) and positive work when it falls. The sign here is reversed."),
  e("power-forgot-friction", "Left friction out of the lifting force", "At constant speed the cable must supply T = Mg + f (friction opposes the motion), so P = (Mg + f)v. Friction was omitted."),
  e("kwh-units", "Mixed W, kW, and kWh", "Energy in kWh = power in kW × hours. Convert watts to kilowatts (÷1000) before multiplying by hours."),

  // ---------- Exam 1 additions (Session 6) ----------
  e("displacement-vs-distance", "Displacement and distance confused", "Distance is the total path length (always positive); displacement is final minus initial position (a vector). Going around a loop gives a large distance but zero displacement.", "exam1"),
  e("avg-speed-vs-velocity", "Average speed and average velocity confused", "Average velocity = displacement / time; average speed = total distance / time. They differ whenever the path doubles back or curves.", "exam1"),
  e("derivative-not-taken", "Used the position function where its derivative belongs", "Velocity is dx/dt and acceleration is dv/dt. Plugging t into x(t) gives a position, not a velocity.", "exam1"),
  e("slope-vs-area", "Slope and area swapped on a motion graph", "On a v–t graph the SLOPE is acceleration and the AREA is displacement. On an x–t graph the slope is velocity.", "exam1"),
  e("free-fall-sign", "Sign of g dropped in free fall", "With up positive, a_y = −9.80 m/s² for the whole flight — rising, at the top, and falling. Using +g (or flipping it at the top) gives the wrong result.", "exam1"),
  e("quadratic-wrong-root", "Took the wrong root of the quadratic", "Solving y = v₀t − ½gt² gives two times; the negative one is before launch. Keep the positive root (and, for 'returns to the same height', the non-zero one).", "exam1"),
  e("head-start-ignored", "Ignored the head start in a chase", "The pursued object is already ahead (in distance or in time) when the chase begins. Both positions must be written from the same origin and the same clock.", "exam1"),
  e("used-full-speed-as-component", "Used the full launch speed as one component", "A projectile launched at angle θ has v₀x = v₀ cos θ and v₀y = v₀ sin θ. The full v₀ was used where a component belongs.", "exam1"),
  e("vy-nonzero-at-top", "Assumed v_y ≠ 0 (or v = 0) at the top", "At the highest point the VERTICAL velocity is zero while the horizontal velocity v₀ cos θ is unchanged. The total velocity there is v₀ cos θ, not zero.", "exam1"),
  e("kmh-not-converted", "km/h used as m/s", "Divide km/h by 3.6 to get m/s (1000 m per km, 3600 s per h). Mixing km/h with meters and seconds gives nonsense.", "exam1"),
  e("vector-magnitudes-added", "Added vector magnitudes directly", "Vectors add by components (or tip-to-tail). |A + B| equals |A| + |B| only when they point the same way.", "exam1"),
  e("angle-from-wrong-axis", "Angle measured from the wrong axis", "'North of east' is measured from the +x axis; 'east of north' from the +y axis. cos and sin swap when the reference axis changes.", "exam1"),

  e("sig-figs-rule", "Significant-figure rule misapplied", "Multiplying/dividing: keep as many SIGNIFICANT FIGURES as the least precise factor. Adding/subtracting: keep as many DECIMAL PLACES as the least precise term.", "exam1"),
  e("terminal-not-equilibrium", "Didn't set drag equal to weight at terminal speed", "At terminal speed the acceleration is zero, so F_D = mg. Solve ½CρAv² = mg for v.", "both"),

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
