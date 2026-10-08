import { useState } from "react";
import { Link } from "react-router-dom";
import { chaptersFor, CHAPTERS, type ExamId } from "../content/topics";
import { templatesForTopic, TEMPLATES } from "../content/templates";
import { errorById } from "../content/errors";
import { getSettings, masteryFor, load, getErrorCounts } from "../lib/storage";
import { topErrors } from "../engine/selection";
import { MasteryBar } from "../components/MasteryBar";
import { Countdown } from "../components/Countdown";

const Chevron = () => (
  <svg className="chev" viewBox="0 0 18 18" aria-hidden="true">
    <path d="m7 4 5 5-5 5" />
  </svg>
);

function TopicList({ exam }: { exam: ExamId }) {
  return (
    <>
      {chaptersFor(exam).map((ch) => {
        const topics = ch.topics.filter((t) => templatesForTopic(t.id).length > 0);
        if (topics.length === 0) return null;
        return (
          <div className="chapter" key={ch.id}>
            <h3>{ch.title}</h3>
            <ul className="list">
              {topics.map((t) => {
                const temps = templatesForTopic(t.id);
                const { mastery, attempts } = masteryFor(temps.map((x) => x.id));
                return (
                  <li key={t.id}>
                    <Link to={`/topic/${t.id}`} className="list-row">
                      <div className="body">
                        <div className="title">{t.title}</div>
                      </div>
                      <MasteryBar mastery={mastery} attempts={attempts} compact />
                      <Chevron />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export function HomePage() {
  const settings = getSettings();
  const data = load();
  const last = data.lastQuestion;
  const traps = topErrors(getErrorCounts(), 3);
  const overall = masteryFor(TEMPLATES.map((t) => t.id));
  const exam2Templates = CHAPTERS.filter((c) => c.exam === "exam2").flatMap((c) => c.topics).flatMap((t) => templatesForTopic(t.id).map((x) => x.id));
  const exam2 = masteryFor(exam2Templates);
  const [exam, setExam] = useState<ExamId>("exam2");
  const started = overall.attempts > 0;

  return (
    <div>
      <div className="home-top">
        <h1>Physics 1</h1>
        {exam2.mastery !== null && <span className="small muted stat">Exam 2 · {Math.round(exam2.mastery * 100)}%</span>}
      </div>
      <Countdown examDate={settings.examDate} />

      <section className="start">
        <Link className="btn primary big" to={last ? `/q/${last}` : "/practice-exam2"}>
          {last ? "Continue practicing" : "Start practicing"}
        </Link>
        <div className="start-secondary">
          <Link className="btn" to="/practice-exam2">
            Random Exam 2
          </Link>
          <Link className="btn" to={started ? "/drill/weak" : "/detective"}>
            {started ? "Weak spots" : "Detective"}
          </Link>
        </div>
      </section>

      {traps.length > 0 && (
        <section>
          <div className="section-title">Watch out for</div>
          <ul className="list">
            {traps.map(({ errorId, count }) => {
              const e = errorById(errorId);
              return (
                <li key={errorId}>
                  <Link to={`/drill/error/${errorId}`} className="list-row trap-row">
                    <div className="body">
                      <div className="title">{e?.label ?? errorId}</div>
                      <div className="sub">{e?.explanation}</div>
                    </div>
                    <span className="pill bad">×{count}</span>
                    <Chevron />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="row spread" style={{ marginBottom: 4 }}>
          <div className="section-title" style={{ margin: 0 }}>
            Topics
          </div>
          <div className="seg mini" role="group" aria-label="exam">
            <button className={exam === "exam2" ? "on" : ""} onClick={() => setExam("exam2")}>
              Exam 2
            </button>
            <button className={exam === "exam1" ? "on" : ""} onClick={() => setExam("exam1")}>
              Exam 1
            </button>
          </div>
        </div>
        <TopicList exam={exam} />
      </section>
    </div>
  );
}
