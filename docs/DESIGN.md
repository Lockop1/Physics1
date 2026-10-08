# UI design notes

Why the app looks the way it does, so later sessions keep it this way.
The app is used mostly on a phone, one-handed, in short sessions between
classes. Every screen answers one question: *what do I do right now?*

## Principles (and where they come from)

1. **One primary action per screen, in the thumb zone.** Every task screen
   ends in a fixed bottom bar with one blue button (Check → Continue → Next).
   Secondary actions ("Not sure? Reveal", "Skip") are quiet text buttons on
   the same bar. Nothing else on the page is a call to action. Bottom
   placement follows thumb-reach research (bottom centre is the easy zone;
   top corners are hard) and the "one unmistakable CTA" rule from mobile UX
   guidance.
2. **Commit before you see anything.** No hints. Choices are visible, the
   student must pick (or explicitly reveal, which counts as a miss) before any
   feedback appears. Retrieval attempts followed by feedback beat reading the
   answer, even when the attempt is wrong (Potts & Shanks 2014). The
   "reveal" button exists so a stuck student can still learn from the
   worked solution without faking a guess.
3. **Immediate, explanatory feedback, in one place.** After checking, the
   bottom bar turns green or red and names the mistake with its one-line
   explanation. The correct choice is highlighted; everything else fades.
   Explanatory feedback right after the attempt lowers perceived cognitive
   load and anxiety and raises strategy use (2026 RCT, n = 60).
4. **Progressive disclosure.** The question screen shows the prompt, the
   diagram and the choices. The solution appears only after the answer
   (auto-opened on a miss, collapsed on a hit). "Why the other choices are
   wrong" is a further disclosure. Equation cards are collapsed to name +
   formula until tapped. Novices do better with reduced interfaces;
   advanced detail is one tap away for later (expertise-reversal studies).
5. **Fewer words.** Headers are one short line. Explanatory copy is one
   sentence or none. Breadcrumbs, badges, seed numbers, keyboard legends
   and source citations are gone from the task flow (the source and seed sit
   in a muted footer). Extraneous load is the enemy on a 375 px screen.
6. **Touch targets ≥ 48 px.** Choices are 56 px tall, buttons 48–56 px, tabs
   48 px wide. Keyboard hints (`kbd`) render only on devices with a pointer
   that can hover.
7. **Calm, consistent surfaces.** One accent colour, green/red only for
   feedback, no gamification. Light and dark themes share the same tokens.

## Layout rules

- Single column, max 680 px, on every screen. Desktop gets a top nav and
  wider margins, phones get a bottom tab bar (Practice · Detective · Exam ·
  Equations · Settings).
- "Focus" routes (a question, a detective round, an exam in progress,
  flashcards) hide the tab bar; the page header's back link is the way out.
- The bottom action bar is `position: fixed`; `ActionBar` measures itself and
  the page pads its bottom edge by that height (`--actionbar-h`).
- `PageHeader` = back link · short title · at most one control.
- Lists are `ul.list > li > .list-row` (title, optional sub-line, meta,
  chevron). Topic rows show a mini mastery bar instead of text.

## Sources consulted

- Thumb zone / touch targets: https://parachutedesign.ca/blog/thumb-zone-ux/ ,
  https://www.techclass.com/resources/learning-and-development-articles/designing-for-the-thumb-best-practices-for-creating-microlearning-content-for-mobile-users ,
  https://www.fahrenheitmarketing.com/services/design/ux-ui-design/mobile-ux-best-practices
- Immediate explanatory feedback and cognitive load (2026 RCT):
  https://dspace.kmitl.ac.th/handle/123456789/20602
- Errorful retrieval + feedback beats reading (Potts & Shanks 2014, summarised):
  https://techcoaches.dearbornschools.org/2017/01/11/practice-is-best-practice/
- Learner-paced stepwise MCQ (n = 13 060):
  https://utrecht-main-test.atmire.com/items/3d8f3930-52f6-4a27-b665-e524eda7a2fc
- Desirable difficulties (Bjork): https://en.wikipedia.org/wiki/Desirable_difficulty ,
  https://notes.andymatuschak.org/z49u8mtc9wZoY7siV7nz4V3PG2oMkNBn7AgUk
- Reduced interfaces for novices / expertise reversal:
  https://peer.asee.org/26188.pdf ,
  https://pmark.pearsoncmg.com/northamerica/myitlab/educators/learning-science/cognitive-load.html
- Minimal, whitespace-heavy lesson UI (Duolingo design blog):
  https://blog.duolingo.com/core-tabs-redesign , https://blog.duolingo.com/new-duolingo-home-screen-design
