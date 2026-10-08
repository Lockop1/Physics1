import { Link } from "react-router-dom";
import { chaptersFor, type ExamId } from "../content/topics";
import { templatesForTopic } from "../content/templates";
import { getSettings, masteryFor, load } from "../lib/storage";
import { MasteryBar } from "../components/MasteryBar";
import { Countdown } from "../components/Countdown";

function ExamSection({ exam, title }: { exam: ExamId; title: string }) {
  return (
    <section className="exam-section">
      <h2>{title}</h2>
      {chaptersFor(exam).map((ch) => (
        <div className="chapter" key={ch.id}>
          <h3>{ch.title}</h3>
          <div className="topic-grid">
            {ch.topics.map((t) => {
              const temps = templatesForTopic(t.id);
              const { mastery, attempts } = masteryFor(temps.map((x) => x.id));
              const empty = temps.length === 0;
              return (
                <Link key={t.id} to={empty ? "#" : `/topic/${t.id}`} className={"topic-card" + (empty ? " empty" : "")} aria-disabled={empty}>
                  <div className="title">{t.title}</div>
                  {empty ? <div className="small muted">coming in a later session</div> : <MasteryBar mastery={mastery} attempts={attempts} />}
                  {!empty && (
                    <div className="small muted">
                      {temps.length} question type{temps.length === 1 ? "" : "s"}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export function HomePage() {
  const settings = getSettings();
  const last = load().lastQuestion;
  return (
    <div>
      <div className="hero">
        <div>
          <h1>PHY2048 practice</h1>
          <p className="muted">Fresh numbers every time. Pick a topic, or jump back in.</p>
        </div>
        <div className="stack">
          <Countdown examDate={settings.examDate} />
          <div className="row">
            <Link className="btn primary" to="/practice/ch4.ucm">
              Random Ch 4 question
            </Link>
            {last && (
              <Link className="btn" to={`/q/${last}`}>
                Continue last question
              </Link>
            )}
          </div>
        </div>
      </div>
      <ExamSection exam="exam2" title="Exam 2" />
      <ExamSection exam="exam1" title="Exam 1 review" />
    </div>
  );
}
