# Progress

## Session 1 — Scaffold, engine, deploy, Ch 4 vertical slice ✅

**Done**
- Vite + React + TypeScript (strict), HashRouter, KaTeX, Vitest, CSS variables
  with light/dark (system + manual), `.gitignore` incl. `source-material/` and
  `lectures/`, GitHub Actions → Pages workflow (`VITE_BASE` set from the repo
  name; runs tests before build).
- Engine: `rng.ts` (mulberry32), `params.ts` (nice/sig/sig-fig/format),
  `check.ts` (±2 %, lenient number parsing incl. `1.2×10^3`), `distractors.ts`
  (3 % dedupe, arithmetic-slip filler, seeded shuffle), `selection.ts`
  (weak-spot + staleness weighting), `types.ts`.
- `storage.ts`: single versioned key, try/catch everywhere, in-memory fallback,
  per-template / per-error / per-equation stats, settings, export/import JSON,
  `migrate()` hook for future version bumps.
- Content: `constants.ts`, `topics.ts` (full Exam 2 + Exam 1 tree),
  `errors.ts` (every error in CLAUDE.md + 7 extra circular-motion ones),
  `equations.ts` (every equation in CLAUDE.md, fully filled in).
- Ch 4 templates (6): `ch4.ucm.rad-deg`, `ch4.ucm.arc-length`,
  `ch4.ucm.period-speed-omega` (rotates T/v/ω/r), `ch4.ucm.ac-rpm`
  (rpm or period input, radius or diameter in cm), `ch4.ucm.nonuniform`
  (diameter given), `ch4.ucm.direction` (conceptual, CW/CCW).
- Circle SVG diagram (radius/diameter, motion sense, marked point, v / a_c /
  a_t arrows, swept arc).
- Pages: Home (topic grid, mastery bars, countdown, continue), Topic,
  Practice (MCQ / typed toggle, progressive hints, named-error feedback,
  solution with recipe + linked equations, keys 1–5 / ↵ / H / S / N / R,
  URL `#/q/<templateId>/<seed>`), Equation Sheet (grouped by chapter),
  Settings (exam date, default mode, theme, export/import/reset).
- Tests (46): golden Ch 4 values (fan 142 m/s², SI Q25, SI Q26, π/4, πr,
  directions), property test over 300 seeds for every template, engine unit
  tests, storage round-trip, content integrity.
- Verified in headless Chromium at 375 px light/dark and 1200 px: picking a
  distractor shows its label + explanation, reloading a URL reproduces the
  question, stats persist across reload, no console errors.
- `CONTENT_GUIDE.md` written.

**Notes / caveats**
- No `source-material/` or `lectures/` folder existed in this checkout, so
  Session 1 content is based on CLAUDE.md's golden table (which carries the
  review's numbers). When the PDFs/slides are available, run Session 7 to
  cross-check wording and add anything missed.
- Deploy workflow triggers on push to `main`. Repo Settings → Pages → Source
  must be "GitHub Actions".
- `onSheet` flags are a best guess until the real formula sheet is known.

**Next smallest safe task**
Session 2, starting with the diagram components (block + angled force,
incline, table/pulley, two cables, elevator) and the Ch 5 concept MCQs — they
need no new engine features. Multi-part question support should be added as
an optional `parts?: QuestionPart[]` on `GeneratedQuestion` so Session 1
templates are untouched.

## Session 2 — Chapter 5: Newton's laws, friction, pulleys, springs ✅

**Source material used**: `lectures/Chapter-5 Newton's Law_ Fall 2026 (Pre).pdf`,
`Chapter-5 … .pptx`, `Chapter-6a Applications of Newton's Laws(1)` (PDF + PPTX)
— the friction / incline / pulley / spring examples live in 6a. Lecture examples
were turned into golden tests with the slides' original numbers: Problem 40
(1.87 m/s²), pushed-up block (2.70), chandelier (196 N), fish in elevator
(48.2 / 31.8 N), traffic light (73.4 / 97.4 N), Example 3a (100 N → 200 N,
assumed horizontal + 30° geometry — the figure isn't in the text), critical
angle 20° → 0.364, cabinet push 79.0 N, table+pulley (1.96 / 7.84 / 1.98),
table+pulley μ_k 0.2 → 0.392, spring on incline 5.09 × 10³, spring + rope 0.30 m,
plus SI Q20–Q24. The 14.0 kg → 120 N cable example could not be reproduced
without its figure; skipped.

**Done**
- Multi-part questions: optional `parts?: QuestionPart[]` on `GeneratedQuestion`
  (`withParts()` helper mirrors parts[0] to the top level). Practice page
  renders parts sequentially, checks each, shows per-part named-error feedback,
  and records one attempt when the last part is submitted. Session 1 templates
  untouched.
- Diagrams: block + angled forces (`block-force`), incline with optional spring /
  rope / friction (`incline`), table + pulley + hanging mass and Atwood
  (`pulley`), two cables (`cables`, angles from horizontal or vertical),
  hanging / elevator / pushed-up box (`vertical-box`). Shared SVG primitives in
  `src/diagrams/primitives.tsx`.
- 25 Ch 5 templates (every Ch 5 topic has ≥ 3; asserted by a test):
  concepts ×4, net force ×3, normal ×3, tension ×3, friction ×3, inclines ×3,
  pulleys ×3, springs ×3. Unknown rotates where the physics allows (e.g.
  normal-force case, tension rest/up/down, critical angle ↔ μ_s, spring k ↔ x,
  rope up- vs down-slope).
- 20 new named errors (third-law-same-object, zero-net-force-means-rest,
  tension-equals-weight, elevator-sign, forgot-friction, rope-direction-flip,
  critical-angle-sin-not-tan, treated-as-free-fall, static-max-not-needed, …).
- Tests: 166 total. Golden Ch 5 file, "static holds AND slides both occur over
  300 seeds" assertion, ≥3-templates-per-Ch-5-topic assertion, property test now
  validates every part of multi-part questions.
- Verified in headless Chromium: multi-part flow (3 parts, per-part feedback,
  answers list), all five diagram kinds at 375 px light/dark, no console errors.

**Next smallest safe task**: Session 3 (Ch 6 / 13 / 7).

## Session 3 — Ch 6 circular dynamics, Ch 13 gravitation, Ch 7 work ✅

**Source material used**: `lectures/Chapter-6b Applications of Newton's Laws(2) & Gravitation`
and `Chapter-7 Work & Kinetic Energy`. Every worked example with a published
answer became a golden test: roller coaster #73 (179 N top, v_min 8.28), Ferris
wheel (1.09 mg / 0.907 mg), flat-curve ABCD (1125 N, μ_s 0.13), Example 2
(13.4 m/s; wet → 0.187), banked Example 3 (27.6°), ISS g (8.67), ISS orbit
(7.67 × 10³ m/s, 5.55 × 10³ s), planet Nutron (4.3 × 10²⁸ kg), Mr. Clean (130 J),
concrete block (28°), elevator #25 (592 kJ / −588 kJ / 0), friction work
(−3.92 J, −25 J), dot product (4, 60.3°), #36 (−1.8 J), F–x graph (25 J),
W–E example (3.5 m/s), #64 (−1.2 J, assuming the figure's drop is 2.0 m),
power (18 W), elevator motor (6.49 × 10⁴ W, 7.02 × 10⁴ W). Plus SI Q27/Q28 and
the CLAUDE.md table.

**Physics flag (fixed)**: at the top of a circle the contact force points
toward the center inside a loop / on a string (N + mg = mv²/r) but AWAY from
the center on a Ferris-wheel seat (mg − N = mv²/r). The seat-force template
carries a per-skin `topContact` flag; the equation card's "don't use when"
says so.

**Not reproducible**: roller coaster #73(b) "point B → 290 N" — B is at an
unlabelled position on the loop (the bottom would give 1022 N; 290 N matches
a point ≈30° from the top). Skipped rather than guessed.

**Beyond CLAUDE.md, added from the slides**: a "Power" topic under Ch 7
(P = W/Δt, P = Fv with and without acceleration, kWh cost), the scalar
product, work by friction, elevator-cable work, "which interval has the most
work" graph reading, and a sliding-to-a-stop W–E template.

**Done**
- 44 new templates: Ch 6 ×12 (vertical circle 3, flat curve 3, banked 3,
  conical 3), Ch 13 ×10, Ch 7 ×22 (constant force 6, varying 3, graphs 3,
  spring work 3, W–E 4, power 3). Every Exam 2 topic now has ≥ 3 templates
  (asserted). Unknown rotation verified for every declared variant (asserted).
- `conceptTemplate()` factory in `templates/helpers.ts` for hand-written
  conceptual MCQs (content stays data; one file per template).
- Diagrams: vertical loop, flat curve (overhead), banked cross-section,
  conical pendulum, orbit, force-at-angle, four-panel ranking, piecewise
  F–x graph with shaded interval.
- 14 new errors (km-not-converted, ratio-inverted, centripetal-as-extra-force,
  orbit-mass-matters, weightless-means-no-gravity, integrated-wrong-power,
  log-of-difference, ignored-negative-area, spring-work-missing-half,
  work-by-vs-on-spring, minutes-not-converted, gravity-work-sign,
  power-forgot-friction, kwh-units). 6 new equations (vertical-circle,
  vmin-loop, conical-pendulum, dot-product, work-friction, power).
- Tests: 371. F–x graph template is checked against an independent 20 000-slice
  Riemann sum over 300 seeds; generator is asserted to produce negative regions.
- Verified in headless Chromium: all new diagram kinds at 375 px, no console errors.

**Next smallest safe task**: Session 4 (Equation Detective).

## Session 4 — Equation Detective ✅

**Done**
- `src/engine/detective.ts`: decoy selection (same chapter first, never a
  correct equation), set-equality grading with missing/extra lists, number
  hiding for prompts (keeps exponents/subscripts), givens tagging setup +
  grading (irrelevant-given recognition counted separately), recipe shuffle +
  ordering grade.
- Mode A "Pick the equations" (`/detective/pick/:templateId/:seed`): any
  template, hide-numbers toggle (prompt AND diagram labels), 6–8 options, keys
  1–8 / ↵ / N, wrong picks explained with the decoy's `dontUseWhen`, missed
  ones with `useWhen`, then recipe + equations in order, link to solve with
  numbers.
- Mode B "Givens & target": tag each number with a symbol or "not needed",
  pick the unknown, graded, then flows into mode A for the same question.
- Mode C "Build the recipe": shuffled plan, drag-and-drop (desktop) or ▲▼
  (mobile), graded with the first wrong position. Only templates with ≥ 3
  recipe steps are served.
- Mode D "Spot the trap": 33 hand-written scenarios in
  `src/content/detective/traps.ts` covering every case in the spec (N ≠ mg
  ×6 incl. Ferris vs loop, constant-a kinematics ×2, varying force ×2,
  perpendicular work ×2, static vs kinetic ×3, radius/diameter, rpm, s = rθ,
  R_E + h, orbit mass, ratio 1/r², banked/flat mass independence, tension
  accelerating ×2, Hooke x, W angle reference ×2, net work, power seconds,
  conical angle, v_min, third-law pairs). Weighted toward misses.
- Situation flashcards: 28 hand-written situation cards + one per equation
  from its triggers; flip, knew-it / didn't, weighted toward misses and
  unseen cards.
- Equation Sheet upgrade: search (name, triggers, use/don't-use, variables),
  chapter filter, derived-from chain links, per-equation detective accuracy
  ("you pick this correctly 4/7"), "Practice problems (n)" button →
  `/practice-eq/:id` launches a template that uses the equation.
- storage v2: adds `detective.{modes,traps,flashcards}`; `migrate()` is
  additive (v1 fixture test keeps templates / errors / equations / settings).
- Tests: 380. Decoy ∩ correct = ∅ for every template × 50 seeds; grading;
  hideNumbers; trap/flashcard content integrity; v1 → v2 migration.
- Verified in headless Chromium: all five modes + sheet search + practice
  button, phone and desktop, light and dark, no console errors.

**Next smallest safe task**: Session 5 (exam simulation + weak spots).

## Session 5 — Exam simulation + weak-spot drill + Home polish ✅

**Done**
- `src/engine/exam.ts`: `buildExam(seed, {exam, count})` — pure and
  deterministic from the exam seed; uniform over templates (so topics are
  weighted by template count), ~25 % conceptual, no repeated template unless
  the pool is smaller than the request, "mixed" weights Exam 2 ≈ 70 %.
  Exam 1 currently falls back to Exam 2 templates until Session 6 lands.
- Exam pages: setup (exam / count default 20 / timer default 75 min,
  editable, on-off), run (MCQ only, no hints, no feedback, question
  navigator, sticky timer with auto-submit at 0, keys 1–5 / N / P, confirm on
  unanswered), results (score, per-topic bars, named mistakes with counts +
  explanations + Drill buttons, expandable review of every question with the
  full solution and a "same type, new numbers" link). History list on the
  setup page.
- storage v3: `exams[]` (last 50) with additive migration; exam answers also
  feed per-template and per-error stats.
- `selection.ts`: `weakSpotWeight()` = low recent accuracy + staleness +
  share of the student's committed errors that the template exercises
  (`errorsProducedBy()` samples a template's distractors). `/drill/weak` and
  `/drill/error/:id`; "Next" keeps drilling.
- Home: Continue, Random Exam 2 question (weak-weighted), Detective, Exam
  sim, Weak spots; "Your top traps" (3 most-committed errors with Drill);
  exam history card; per-chapter mastery; overall attempts + Exam 2 mastery.
- Tests: 386. Exam builder (no dupes, 5/20 conceptual, deterministic, all
  questions buildable with one correct choice, topic weighting), weak-spot
  weight ordering, error→template lookup, v2→v3 migration + exam recording.
- Verified in headless Chromium: 8-question timed exam end to end.

**Next smallest safe task**: Session 6 (Exam 1 material).

## Session 6 — Exam 1 material (vectors, units, kinematics, projectiles) ✅

**Source material used**: `lectures/Chapter-1& 2 Units_Measurements_Vectors`,
`Chapter-3 1D Kinematics`, `Chapter-4 2D Motion`. (The SI Exam 1 review PDF is
not in the repo; its Q19–Q28 values from CLAUDE.md were already covered in
Sessions 2–3.)

**Golden values from the slides** (all in `tests/golden/exam1.test.ts`):
120 km/h → 33.3 m/s; 85.0 mi/h → 137 km/h; 33.0 m/s → 73.8 mi/h; 15.0 in →
38.1 cm; lead 11.35 g/cm³ → 11 350 kg/m³; C = 12.0 at −60° → (6.00, −10.4);
(2,2)+(2,−4) → 4.5 at 333°; (3,2)+(−5,4) = (−2,6); #58 train (28.0 m/s,
50.9 s, 7680 m, 713 m); trooper 31.0 s; #96 Jacob (44.7 s, 184 m, 5.2 m/s);
#35 x = 10t − 2t²; #27 x = 4 − 2t; Example 3.4; drop 13.5 m (1.66 s, −16.3);
stone throw (2.04 s, 20.4 m, −29.0 m/s, −22.5 m); Examples 4.3/4.4; plane
(43 m/s at −21°); #28 boat; boat trip (1.00 × 10⁵ m, 38.9, 27.8, 53.1°);
#20 bird (8.80 m/s); long jumper (7.94 m, 0.722 m); firework (233 m, 6.90 s);
#36 crate (1779 m); Waymo (2.02 s, 14.8, 24.8); stone from building (4.22 s,
35.8 m/s); Kilauea (3.96 s, 31.9 m/s at −50°); #46 agent (54 m < 60 m: no).

**Flags**: the Waymo slide lists t = 2.20 s and θ = 15.3°; with h = 20.0 m
the fall time is 2.02 s (which is what gives their 14.8 m/s) and the impact
angle is 53° below horizontal — the slide's two numbers look like typos, so
the test uses 2.02 s and skips the angle. The Ch 1–2 "resultant of A = 5.00,
B = 7.00, C = 8.50" and "net force 8754 units" problems depend on figures not
in the text; skipped.

**Done**
- 27 Exam 1 templates (every Exam 1 topic has ≥ 3; asserted): vectors ×4
  (components from +x / +y / −y / −x, add/subtract, three-vector resultant,
  concepts), units ×3 (speed, density, length/area/volume/time), 1D ×3
  (multi-phase, stopping, chase with time- or distance head start), calculus
  ×3 (polynomial x(t), vector r(t)/v(t), turning point & origin crossing),
  graphs ×3 (generated v–t graph → Δx / distance / v̄ / a, slope reading,
  concepts), 2D ×3 (constant-a vector motion, two-leg trip, straight flight at
  an angle), free fall ×4 (drop, thrown up from a building, up-vs-down from a
  cliff, concepts), projectiles ×4 (level ground R/h/t/v₀ incl. other-planet
  g, horizontal launch incl. km/h, cliff launch above / below / from-vertical,
  concepts).
- Diagrams: vectors from the origin with reference-axis arcs and dashed
  resultant; projectile trajectory with cliff/table, angle (from horizontal or
  vertical), range; the graph component now takes axis labels (v–t).
- 12 new Exam 1 errors (displacement-vs-distance, avg-speed-vs-velocity,
  derivative-not-taken, slope-vs-area, free-fall-sign, quadratic-wrong-root,
  head-start-ignored, used-full-speed-as-component, vy-nonzero-at-top,
  kmh-not-converted, vector-magnitudes-added, angle-from-wrong-axis) and
  7 equations (avg-velocity, velocity-derivative, graph-slope-area,
  unit-conversion, density, projectile-components, projectile-range).
- Tests: 509. v–t displacement AND distance checked against an independent
  40 000-slice Riemann sum over 300 seeds.
- Exam sim's "Exam 1" and "mixed" modes now draw real Exam 1 templates.

**Next smallest safe task**: Session 7 (coverage audit of the slides).

## Session 7 — Lecture-slide coverage audit ✅

All ten files in `lectures/` were read (PDF text via pdftotext; the two PPTX
files for answers the "Pre" PDFs omit). Every worked example, clicker /
ABCD question and concept is mapped below. **Zero MISSING items remain**;
six templates, two equations, two errors and one topic were added in this
session to close the gaps found.

### Coverage report

| Slide item | Template id(s) |
|---|---|
| **Ch 1–2** CQ 38 km → m; ms in a minute; 15.0 in → cm | `e1.units.length-area-volume` |
| 85.0 mi/h → km/h; 33.0 m/s → mi/h; 120 km/h → m/s | `e1.units.speed` |
| Sig figs (1500 g family; 12.71 × 3.46; 23.2 + 5.174; rounding) | `e1.units.sig-figs` *(added S7)* |
| Lead 11.35 g/cm³ → kg/m³ | `e1.units.density` |
| Scalar vs vector; equal vectors; unit vectors; CQ "which figure shows −15.79î + 12.04ĵ" | `e1.vectors.concept` |
| Components (C = 12.0 at −60° → 6.00, −10.4); SOHCAHTOA | `e1.vectors.components` |
| Example 1 (2,2)+(2,−4) → 4.5 at −27°; ABCD (3,2)+(−5,4) | `e1.vectors.add-subtract` |
| Resultant of A = 5.00, B = 7.00, C = 8.50; net force 8754 "along A" | `e1.vectors.three-resultant` (figure-dependent numbers not reproduced) |
| **Ch 3** CQ roundabout distance/displacement; racecar halfway ABCD | `e1.vectors.concept`, `e1.kin2d.chord-displacement` *(added S7)* |
| #27 x = 4 − 2t; #35 x = 10t − 2t²; Example 3.4 x = 3t − 3t² | `e1.calculus.position-polynomial`, `e1.calculus.turning-point` |
| Example 1 average velocity vs speed (1.36 / 2.27 m/s) | `e1.kin1d.out-and-back` *(added S7)* |
| Example 2 boat (1.00 × 10⁵ m, 39.0, 28.0, 53.1°) | `e1.kin2d.trip` |
| x–t slope = v; v–t slope = a; Example 3.6 v = 20t − 5t²; Quick Quiz matching | `e1.graphs.slope`, `e1.graphs.vt-graph`, `e1.graphs.concept` |
| #58 freight train | `e1.kin1d.multi-phase` |
| Trooper Example 3; #96 Pablo & Jacob | `e1.kin1d.chase` |
| Free fall concepts (CQ 3, CQ 4, wrench vs feather, speed after throw) | `e1.freefall.concept` |
| Example 5 drop 13.5 m; Example 6 stone throw (A–D) | `e1.freefall.drop`, `e1.freefall.thrown-up`, `e1.freefall.cliff-up-vs-down` |
| Direction of acceleration (speeding up / slowing down) | `e1.graphs.concept` |
| **Ch 4** Example 4.1 satellite chord displacement | `e1.kin2d.chord-displacement` *(added S7)* |
| #20 bird 95 km at 45° for 3 h | `e1.kin2d.displacement-vector` |
| Examples 4.3 / 4.4 (r(t) → v; v(t) → a) | `e1.calculus.vector-function` |
| Example 1 plane; #28 boat; CQ 1 a_y in flight | `e1.kin2d.constant-accel`, `e1.projectiles.concept` |
| Range / height derivation; CQ 2; 15° vs 75°; long jumper Example 2; firework 4.7 | `e1.projectiles.range-height`, `e1.projectiles.concept` |
| Example 3 stone from building; Kilauea; #46 ski gorge | `e1.projectiles.cliff-launch` |
| #36 crate from plane; Example 4 Waymo | `e1.projectiles.horizontal-launch` |
| ABCD tangential velocity (clockwise ball) | `ch4.ucm.direction` |
| CQ 3 45° = π/4; CQ 4 half revolution | `ch4.ucm.rad-deg`, `ch4.ucm.arc-length` |
| v = 2πr/T, ω = 2π/T, v = rω; #67 fan 360 rpm | `ch4.ucm.period-speed-omega`, `ch4.ucm.ac-rpm` |
| Non-uniform circular motion a = √(a_c² + a_T²) | `ch4.ucm.nonuniform` |
| **Ch 5** Newton's laws / hockey puck / space station / bullet in space / bus | `ch5.concepts.which-law`, `ch5.concepts.net-force-zero` |
| Two equal opposite forces box (CQs) | `ch5.concepts.net-force-zero` |
| Truck vs fly; monitor-on-table pairs | `ch13.universal.concept`, `ch5.concepts.action-reaction` |
| Weight, g_Moon; mass vs weight | `ch5.concepts.mass-vs-weight` |
| N ≠ mg slides; incline normal | `ch5.normal.cases`, `ch5.normal.concept`, `ch5.normal.apparent-weight` |
| Chandelier 20 kg; fish in elevator; apparent weight | `ch5.tension.hanging`, `ch5.tension.concept` |
| Hooke 50 N/m × 1 cm | `ch5.springs.hooke` |
| FBD slides (flat ± friction, incline ± friction) | `ch5.inclines.sliding`, `ch5.inclines.stuck`, `ch5.friction.rope-angle` |
| Problem 40 (two 30 N forces → 1.87 m/s²) | `ch5.net-force.two-forces` |
| 2.00 kg pushed up by 25.0 N | `ch5.net-force.pushed-up` |
| The Runway (icy incline: a, t, v) | `ch5.inclines.sliding` |
| Example 3a two cables (100 N → 200 N; 14.0 kg → 120 N) | `ch5.tension.two-cables` (14.0 kg case: figure geometry unknown, skipped) |
| **Ch 6a** Traffic light 122 N | `ch5.tension.two-cables` |
| Static/kinetic friction definitions; ABCD critical angle 20° → 0.364 | `ch5.inclines.critical-angle`, `ch5.friction.angled-force` |
| "Find the acceleration" (T, μ_k; angled rope) | `ch5.friction.rope-angle` |
| Problems i / ii table + hanging (frictionless; μ_k 0.2) | `ch5.pulleys.table-frictionless`, `ch5.pulleys.table-friction` |
| Problem iii cabinet 79.0 N | `ch5.friction.cabinet-push` |
| Textbook spring on 60° incline; Problem #6 spring + rope | `ch5.springs.incline`, `ch5.springs.rope-incline` |
| **Ch 6b** Centripetal force concept slides | `ch6.flat-curve.concept`, `ch6.vertical-circle.concept` |
| Roller coaster #73 (a, c) | `ch6.vertical-circle.seat-force`, `ch6.vertical-circle.min-speed` (part b "point B → 290 N": position not labelled, skipped) |
| Ferris wheel 1.09 mg / 0.907 mg | `ch6.vertical-circle.seat-force` (Ferris skin) |
| Flat curve ABCD 1125 N; μ_s 0.13; Example 2 v_max 13.4 / wet 0.187 | `ch6.flat-curve.centripetal-force`, `ch6.flat-curve.vmax-mu-r` |
| Banked Example 3 27.6°; banked with friction (recitation) ; NASCAR | `ch6.banked-curve.theta-v-r`, `ch6.banked-curve.flat-vs-banked`, `ch6.banked-curve.concept` |
| Drag force F_D = ½CρAv²; terminal velocity | `ch6.drag.force`, `ch6.drag.terminal-speed`, `ch6.drag.concept` *(topic + 3 templates added S7)* |
| Universal gravitation; comparing forces (woman / Earth) | `ch13.universal.force`, `ch13.universal.ratio`, `ch13.universal.concept` |
| g = GM/R²; Example 13.4 ISS 8.67; ABCD h = R_E → ¼ | `ch13.g-altitude.g-at-h`, `ch13.g-altitude.weight-fraction`, `ch13.g-altitude.planet-surface` |
| Example 13.9 ISS speed/period; planet Nutron | `ch13.orbits.speed-period`, `ch13.orbits.angular-speed`, `ch13.orbits.planet-mass`, `ch13.orbits.concept` |
| **Ch 7** Work definition; briefcase examples; normal/friction work | `ch7.constant-force.concept`, `ch7.constant-force.friction-work` |
| Rank the work (four directions) | `ch7.constant-force.ranking` |
| Scalar product Example 1 (4; 60.3°) | `ch7.constant-force.dot-product` |
| Mr. Clean 130 J; Example 3 concrete block 28° | `ch7.constant-force.fd-cos` |
| #25 elevator (592 kJ / −588 kJ / 0); descending-elevator ABCD | `ch7.constant-force.elevator`, `ch7.constant-force.concept` |
| #36 F = −2.0/x; varying force; F–x graph examples (25 J, 30 J) | `ch7.varying-force.inverse-x`, `ch7.varying-force.power-law`, `ch7.varying-force.linear`, `ch7.graphs.area`, `ch7.graphs.which-interval`, `ch7.graphs.concept` |
| Spring work | `ch7.spring-work.by-spring`, `ch7.spring-work.by-agent`, `ch7.spring-work.concept` |
| Conservative vs non-conservative; cliff ABCD | `ch7.constant-force.concept` |
| Friction work examples (−3.92 J; −25 J) | `ch7.constant-force.friction-work` |
| W–E theorem example (3.5 m/s); #64 (−1.2 J) | `ch7.work-energy.final-speed`, `ch7.work-energy.friction-path`, `ch7.work-energy.friction-stop`, `ch7.work-energy.varying-force-speed` |
| Power: wagon 18 W; elevator motor 6.49 / 7.02 × 10⁴ W; kWh | `ch7.power.average`, `ch7.power.elevator`, `ch7.power.kwh` |

### Items skipped on purpose (figure-dependent, no numbers in the text)
- Ch 1–2 "resultant of A, B, C" and "net force 8754 units"; Ch 5 Example 3a
  14.0 kg → 120 N; Ch 6b roller coaster point B (290 N); Waymo t = 2.20 s and
  θ = 15.3° (inconsistent with its own 14.8 m/s — treated as slide typos).

### Formula sheet
No slide shows the actual exam formula sheet, so `onSheet` flags in
`equations.ts` remain the Session 1 best guess (editable in one place).

### Topic-tree additions beyond CLAUDE.md
`ch7.power` (Power, S3) and `ch6.drag` (Drag & terminal speed, S7) were added
because the lectures cover them. CLAUDE.md's topic list was left as written —
update it if these should be permanent.

**Totals**: 108 templates, 33 trap scenarios, 48 flashcards, 538 tests.

## Session 3 — Ch 6 / 13 / 7 ⏳
## Session 4 — Equation Detective ⏳
## Session 5 — Exam sim + weak spots ⏳
## Session 6 — Exam 1 material ⏳
## Session 7 — Slide ingestion ⏳ (whenever slides arrive)
