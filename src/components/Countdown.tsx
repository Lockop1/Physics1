import { Link } from "react-router-dom";

/** One quiet line: how long until Exam 2. */
export function Countdown({ examDate }: { examDate: string | null }) {
  if (!examDate) {
    return (
      <div className="countdown">
        <Link to="/settings">Set your exam date</Link> for a countdown.
      </div>
    );
  }
  const target = new Date(examDate + "T00:00:00");
  const days = Math.ceil((target.getTime() - Date.now()) / 86_400_000);
  if (Number.isNaN(days)) return null;
  return (
    <div className="countdown">
      {days > 0 ? (
        <>
          <strong>{days}</strong> day{days === 1 ? "" : "s"} until Exam 2
        </>
      ) : days === 0 ? (
        <strong>Exam 2 is today.</strong>
      ) : (
        <>Exam 2 was {-days} day{days === -1 ? "" : "s"} ago.</>
      )}
    </div>
  );
}
