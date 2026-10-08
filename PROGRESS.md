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

## Session 2 — Ch 5 ⏳ not started
## Session 3 — Ch 6 / 13 / 7 ⏳
## Session 4 — Equation Detective ⏳
## Session 5 — Exam sim + weak spots ⏳
## Session 6 — Exam 1 material ⏳
## Session 7 — Slide ingestion ⏳ (whenever slides arrive)
