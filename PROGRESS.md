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

## Session 3 — Ch 6 / 13 / 7 ⏳
## Session 4 — Equation Detective ⏳
## Session 5 — Exam sim + weak spots ⏳
## Session 6 — Exam 1 material ⏳
## Session 7 — Slide ingestion ⏳ (whenever slides arrive)
