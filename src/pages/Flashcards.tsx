import { useEffect, useState } from "react";
import { pickFlashcard } from "../lib/detective";
import { FLASHCARDS, type Flashcard } from "../content/detective/flashcards";
import { getDetective, recordFlashcard } from "../lib/storage";
import { equationById } from "../content/equations";
import { Tex } from "../lib/latex";
import { EquationLink } from "../components/Solution";
import { PageHeader } from "../components/PageHeader";
import { ActionBar } from "../components/ActionBar";

export function FlashcardsPage() {
  const [card, setCard] = useState<Flashcard>(() => pickFlashcard());
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState({ knew: 0, missed: 0 });
  const next = (knew: boolean) => {
    recordFlashcard(card.id, knew);
    setCount((c) => ({ knew: c.knew + (knew ? 1 : 0), missed: c.missed + (knew ? 0 : 1) }));
    setCard(pickFlashcard(card.id));
    setFlipped(false);
    window.scrollTo({ top: 0 });
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
  const seen = Object.keys(getDetective().flashcards).length;
  return (
    <div className="question">
      <PageHeader back={{ to: "/detective", label: "Detective" }} title="Flashcards" right={<span className="small muted stat">{count.knew + count.missed > 0 ? `${count.knew}/${count.knew + count.missed}` : `${seen}/${FLASHCARDS.length}`}</span>} />
      <div className={"flashcard card" + (flipped ? " flipped" : "")} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0}>
        {!flipped ? (
          <div className="fc-front">
            <div className="fc-label">Situation</div>
            <div className="fc-text">{card.front}</div>
            <div className="small muted">Which equations? Tap to flip.</div>
          </div>
        ) : (
          <div className="fc-back stack">
            <div className="fc-label">Equations</div>
            {card.equationIds.map((id) => {
              const eq = equationById(id);
              return eq ? (
                <div key={id}>
                  <Tex block>{eq.latex}</Tex>
                  <EquationLink id={id} />
                </div>
              ) : null;
            })}
            <p style={{ margin: 0 }}>
              <strong>Why:</strong> {card.why}
            </p>
          </div>
        )}
      </div>
      <ActionBar>
        {!flipped ? (
          <button className="primary" onClick={() => setFlipped(true)}>
            Flip <kbd>space</kbd>
          </button>
        ) : (
          <>
            <button className="secondary" onClick={() => next(false)}>
              Missed it <kbd>2</kbd>
            </button>
            <button className="primary" onClick={() => next(true)}>
              Knew it <kbd>1</kbd>
            </button>
          </>
        )}
      </ActionBar>
    </div>
  );
}
