import { Link } from "react-router-dom";
import { getDetective } from "../lib/storage";
import { TRAPS } from "../content/detective/traps";
import { FLASHCARDS } from "../content/detective/flashcards";

function Stat({ mode }: { mode: string }) {
  const s = getDetective().modes[mode];
  return <span className="small muted stat">{s && s.attempts ? `${s.correct}/${s.attempts} correct` : "not started"}</span>;
}

export function DetectivePage() {
  const fc = getDetective().flashcards;
  const seen = Object.keys(fc).length;
  return (
    <div className="stack">
      <h1>Equation Detective</h1>
      <p className="muted">The formula sheet is given on the exam. The skill is recognising the situation and picking the right equations — no arithmetic here.</p>
      <div className="mode-grid">
        <Link to="/detective/pick" className="topic-card">
          <div className="title">A · Pick the equations</div>
          <div className="small">A fresh problem (numbers hidden if you like). Select the equations you'd use from a list that includes decoys.</div>
          <Stat mode="pick" />
        </Link>
        <Link to="/detective/givens" className="topic-card">
          <div className="title">B · Givens & target</div>
          <div className="small">Tag each number with its symbol — or "not needed" — and pick the unknown. Then pick the equations.</div>
          <Stat mode="givens" />
        </Link>
        <Link to="/detective/recipe" className="topic-card">
          <div className="title">C · Build the recipe</div>
          <div className="small">The solution plan, shuffled. Put the steps in order.</div>
          <Stat mode="recipe" />
        </Link>
        <Link to="/detective/trap" className="topic-card">
          <div className="title">D · Spot the trap</div>
          <div className="small">{TRAPS.length} hand-written situations where the tempting equation is wrong.</div>
          <Stat mode="trap" />
        </Link>
        <Link to="/detective/flashcards" className="topic-card">
          <div className="title">Situation flashcards</div>
          <div className="small">Front: a situation. Back: the equations and why. {FLASHCARDS.length} cards, weighted toward your misses.</div>
          <span className="small muted stat">{seen ? `${seen}/${FLASHCARDS.length} cards seen` : "not started"}</span>
        </Link>
        <Link to="/equations" className="topic-card">
          <div className="title">Equation sheet</div>
          <div className="small">Every equation with use / don't-use cues, trigger phrases, and your detective accuracy.</div>
        </Link>
      </div>
    </div>
  );
}
