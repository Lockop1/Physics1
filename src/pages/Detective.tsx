import { Link } from "react-router-dom";
import { getDetective } from "../lib/storage";
import { TRAPS } from "../content/detective/traps";
import { FLASHCARDS } from "../content/detective/flashcards";

const Chevron = () => (
  <svg className="chev" viewBox="0 0 18 18" aria-hidden="true">
    <path d="m7 4 5 5-5 5" />
  </svg>
);

function stat(mode: string): string {
  const s = getDetective().modes[mode];
  return s && s.attempts ? `${s.correct}/${s.attempts}` : "";
}

export function DetectivePage() {
  const seen = Object.keys(getDetective().flashcards).length;
  const modes = [
    { to: "/detective/pick", title: "Pick the equations", sub: "A problem, numbers hidden. Choose what you'd use.", meta: stat("pick") },
    { to: "/detective/givens", title: "Givens & target", sub: "Label each number. Spot the decoys.", meta: stat("givens") },
    { to: "/detective/recipe", title: "Build the recipe", sub: "Put the solution steps in order.", meta: stat("recipe") },
    { to: "/detective/trap", title: "Spot the trap", sub: `${TRAPS.length} situations where the obvious equation is wrong.`, meta: stat("trap") },
    { to: "/detective/flashcards", title: "Flashcards", sub: "Situation on the front, equations on the back.", meta: seen ? `${seen}/${FLASHCARDS.length}` : "" },
  ];
  return (
    <div>
      <h1>Equation Detective</h1>
      <p className="helper">The sheet is given on the exam. The skill is knowing which equation fits the situation.</p>
      <ul className="list mode-list">
        {modes.map((m) => (
          <li key={m.to}>
            <Link to={m.to} className="list-row">
              <div className="body">
                <div className="title">{m.title}</div>
                <div className="sub">{m.sub}</div>
              </div>
              {m.meta && <span className="meta">{m.meta}</span>}
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
