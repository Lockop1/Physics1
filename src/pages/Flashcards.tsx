import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pickFlashcard } from "../lib/detective";
import { FLASHCARDS, type Flashcard } from "../content/detective/flashcards";
import { getDetective, recordFlashcard } from "../lib/storage";
import { equationById } from "../content/equations";
import { Tex } from "../lib/latex";
import { EquationLink } from "../components/Solution";

export function FlashcardsPage() {
  const [card, setCard] = useState<Flashcard>(() => pickFlashcard());
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState({ knew: 0, missed: 0 });
  const next = (knew: boolean) => {
    recordFlashcard(card.id, knew);
    setCount((c) => ({ knew: c.knew + (knew ? 1 : 0), missed: c.missed + (knew ? 0 : 1) }));
    setCard(pickFlashcard(card.id));
    setFlipped(false);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && (e.key === "1" || e.key === "k" || e.key === "K")) next(true);
      else if (flipped && (e.key === "2" || e.key === "d" || e.key === "D")) next(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const stats = getDetective().flashcards[card.id];
  const seen = Object.keys(getDetective().flashcards).length;
  return (
    <div>
      <p className="small muted row spread">
        <span>
          <Link to="/detective">Detective</Link> › Situation flashcards
        </span>
        <span className="stat">
          this session {count.knew} ✓ / {count.missed} ✗ · {seen}/{FLASHCARDS.length} cards seen
        </span>
      </p>
      <div className={"flashcard card" + (flipped ? " flipped" : "")} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0}>
        {!flipped ? (
          <div className="fc-front">
            <div className="small muted">Situation</div>
            <div className="fc-text">{card.front}</div>
            <div className="small muted">Which equation(s)? Tap / space to flip.</div>
          </div>
        ) : (
          <div className="fc-back stack">
            <div className="small muted">Equation(s)</div>
            {card.equationIds.map((id) => {
              const eq = equationById(id);
              return eq ? (
                <div key={id}>
                  <Tex block>{eq.latex}</Tex>
                  <div className="small">
                    <EquationLink id={id} />
                  </div>
                </div>
              ) : null;
            })}
            <div>
              <strong>Why:</strong> {card.why}
            </div>
          </div>
        )}
      </div>
      <div className="actions" style={{ justifyContent: "center" }}>
        {!flipped ? (
          <button className="primary" onClick={() => setFlipped(true)}>
            Flip <kbd>space</kbd>
          </button>
        ) : (
          <>
            <button className="primary" onClick={() => next(true)}>
              Knew it <kbd>1</kbd>
            </button>
            <button onClick={() => next(false)}>
              Didn't <kbd>2</kbd>
            </button>
          </>
        )}
      </div>
      {stats && stats.seen > 0 && (
        <p className="small muted" style={{ textAlign: "center" }}>
          This card: missed {stats.missed} of {stats.seen}.
        </p>
      )}
    </div>
  );
}
