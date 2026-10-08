import { Link, useParams } from "react-router-dom";
import { topicById } from "../content/topics";
import { templatesForTopic } from "../content/templates";
import { getTemplateStats, masteryFor } from "../lib/storage";
import { MasteryBar } from "../components/MasteryBar";
import { PageHeader } from "../components/PageHeader";

export function TopicPage() {
  const { topicId = "" } = useParams();
  const topic = topicById(topicId);
  const temps = templatesForTopic(topicId);
  if (!topic) return <p>Unknown topic.</p>;
  const { mastery, attempts } = masteryFor(temps.map((t) => t.id));
  return (
    <div>
      <PageHeader back={{ to: "/", label: "Topics" }} title={topic.chapter} />
      <h1>{topic.title}</h1>
      <div style={{ maxWidth: 320, margin: "6px 0 18px" }}>
        <MasteryBar mastery={mastery} attempts={attempts} />
      </div>
      <Link className="btn primary big" to={`/practice/${topic.id}`}>
        Practice this topic
      </Link>

      <section>
        <div className="section-title">Question types</div>
        {temps.length === 0 && <p className="muted">Nothing here yet.</p>}
        <ul className="list">
          {temps.map((t) => {
            const s = getTemplateStats(t.id);
            return (
              <li key={t.id}>
                <Link to={`/q/${t.id}`} className="list-row">
                  <div className="body">
                    <div className="title">
                      {t.title}{" "}
                      <span className="diff" title={`difficulty ${t.difficulty}`}>
                        {"★".repeat(t.difficulty)}
                      </span>
                    </div>
                    {t.kind === "conceptual" && <div className="sub">concept</div>}
                  </div>
                  <span className="meta">{s && s.attempts ? `${s.correct}/${s.attempts}` : ""}</span>
                  <svg className="chev" viewBox="0 0 18 18" aria-hidden="true">
                    <path d="m7 4 5 5-5 5" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
