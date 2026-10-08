import { Link } from "react-router-dom";
import { chaptersFor, CHAPTERS, type ExamId } from "../content/topics";
import { templatesForTopic, TEMPLATES } from "../content/templates";
import { errorById } from "../content/errors";
import { getSettings, masteryFor, load, getExams, getErrorCounts } from "../lib/storage";
import { topErrors } from "../engine/selection";
import { MasteryBar } from "../components/MasteryBar";
import { Countdown } from "../components/Countdown";

function ExamSection({ exam, title }: { exam: ExamId; title: string }) {
  return (
    <section className="exam-section">
      <h2>{title}</h2>
      {chaptersFor(exam).map((ch) => {
        const chTemplates = ch.topics.flatMap((t) => templatesForTopic(t.id).map((x) => x.id));
        const chMastery = masteryFor(chTemplates);
        return (
          <div className="chapter" key={ch.id}>
            <div className="row spread">
              <h3>{ch.title}</h3>
              {chTemplates.length > 0 && <span className="small muted stat">{chMastery.mastery === null ? "—" : `${Math.round(chMastery.mastery * 100)}% chapter mastery`}</span>}
            </div>
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
        );
      })}
    </section>
  );
}

export function HomePage() {
  const settings = getSettings();
  const data = load();
  const last = data.lastQuestion;
  const traps = topErrors(getErrorCounts(), 3);
  const exams = getExams();
  const lastExam = exams[exams.length - 1];
  const overall = masteryFor(TEMPLATES.map((t) => t.id));
  const exam2Templates = CHAPTERS.filter((c) => c.exam === "exam2").flatMap((c) => c.topics).flatMap((t) => templatesForTopic(t.id).map((x) => x.id));
  const exam2 = masteryFor(exam2Templates);
  return (
    <div>
      <div className="hero">
        <div>
          <h1>PHY2048 practice</h1>
          <p className="muted">Fresh numbers every time. Pick a topic, or jump back in.</p>
          <div className="small muted stat">
            {overall.attempts} attempts · Exam 2 mastery {exam2.mastery === null ? "—" : `${Math.round(exam2.mastery * 100)}%`}
          </div>
        </div>
        <div className="stack">
          <Countdown examDate={settings.examDate} />
          <div className="row">
            {last && (
              <Link className="btn primary" to={`/q/${last}`}>
                Continue
              </Link>
            )}
            <Link className={"btn" + (last ? "" : " primary")} to="/practice-exam2">
              Random Exam 2 question
            </Link>
            <Link className="btn" to="/detective">
              Equation Detective
            </Link>
            <Link className="btn" to="/exam">
              Exam simulation
            </Link>
            <Link className="btn" to="/drill/weak">
              Weak spots
            </Link>
          </div>
        </div>
      </div>

      <div className="practice" style={{ marginBottom: 18 }}>
        <div className="card">
          <h2>Your top traps</h2>
          {traps.length === 0 ? (
            <p className="muted small">No named mistakes recorded yet. Once you pick a distractor, it shows up here with a drill button.</p>
          ) : (
            <ul className="template-list">
              {traps.map(({ errorId, count }) => {
                const e = errorById(errorId);
                return (
                  <li key={errorId}>
                    <div className="grow">
                      <strong>{e?.label ?? errorId}</strong> <span className="badge">×{count}</span>
                      <div className="small muted">{e?.explanation}</div>
                    </div>
                    <Link className="btn" to={`/drill/error/${errorId}`}>
                      Drill
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="card">
          <h2>Exam simulations</h2>
          {lastExam ? (
            <div className="stack">
              <div>
                Last: <strong>{Math.round((100 * lastExam.score) / lastExam.count)}%</strong> ({lastExam.score}/{lastExam.count}) on {new Date(lastExam.finishedAt).toLocaleDateString()}
              </div>
              {exams.length > 1 && (
                <div className="small muted">
                  Recent scores: {exams.slice(-6).map((r) => `${Math.round((100 * r.score) / r.count)}%`).join(" · ")}
                </div>
              )}
              <div className="row">
                <Link className="btn" to={`/exam/results/${lastExam.id}`}>
                  Review last
                </Link>
                <Link className="btn primary" to="/exam">
                  New exam
                </Link>
              </div>
            </div>
          ) : (
            <div className="stack">
              <p className="muted small">No simulations yet. 20 mixed MCQs, 75-minute timer, results by topic and by named mistake.</p>
              <Link className="btn primary" to="/exam">
                Take a practice exam
              </Link>
            </div>
          )}
        </div>
      </div>

      <ExamSection exam="exam2" title="Exam 2" />
      <ExamSection exam="exam1" title="Exam 1 review" />
    </div>
  );
}
