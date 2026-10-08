import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  /** Back link. Always a real route (never history.back) so the page is predictable after a reload. */
  back?: { to: string; label?: string };
  title?: ReactNode;
  right?: ReactNode;
}

/** One-line page header: back link on the left, a quiet title in the middle, one optional control on the right. */
export function PageHeader({ back, title, right }: Props) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        {back && (
          <Link to={back.to} className="back" aria-label={back.label ? `Back to ${back.label}` : "Back"}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {back.label && <span>{back.label}</span>}
          </Link>
        )}
      </div>
      <div className="page-header-title">{title}</div>
      <div className="page-header-right">{right}</div>
    </div>
  );
}
