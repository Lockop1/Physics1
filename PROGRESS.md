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

## Session 3 — Ch 6 / 13 / 7 ⏳
## Session 4 — Equation Detective ⏳
## Session 5 — Exam sim + weak spots ⏳
## Session 6 — Exam 1 material ⏳
## Session 7 — Slide ingestion ⏳ (whenever slides arrive)
