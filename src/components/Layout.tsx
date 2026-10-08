import type { ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

/** Routes where the student is mid-task: no tab bar, the page's own header and bottom action bar take over. */
const FOCUS_ROUTES = [/^\/q\//, /^\/practice/, /^\/drill/, /^\/detective\/(pick|givens|recipe|trap|flashcards)/, /^\/exam\/run/];

const TABS: { to: string; label: string; icon: ReactNode; active: (path: string) => boolean }[] = [
  {
    to: "/",
    label: "Practice",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
    active: (p) => p === "/" || p.startsWith("/topic") || p.startsWith("/q/") || p.startsWith("/practice") || p.startsWith("/drill"),
  },
  {
    to: "/detective",
    label: "Detective",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>
    ),
    active: (p) => p.startsWith("/detective"),
  },
  {
    to: "/exam",
    label: "Exam",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
    active: (p) => p.startsWith("/exam"),
  },
  {
    to: "/equations",
    label: "Equations",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 5H7l6 7-6 7h11" />
      </svg>
    ),
    active: (p) => p.startsWith("/equations"),
  },
];

export function Layout() {
  const { pathname } = useLocation();
  const focus = FOCUS_ROUTES.some((r) => r.test(pathname));
  const nav = (cls: string) => (
    <nav className={cls} aria-label="Main">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={() => (t.active(pathname) ? "active" : "")} end={t.to === "/"}>
          {t.icon}
          <span>{t.label}</span>
        </NavLink>
      ))}
      <NavLink to="/settings" className={() => (pathname.startsWith("/settings") ? "active" : "")} aria-label="Settings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
        <span>Settings</span>
      </NavLink>
    </nav>
  );
  return (
    <div className={"app" + (focus ? " focus" : "")}>
      {!focus && (
        <header className="topbar">
          <NavLink to="/" className="brand">
            Physics 1
          </NavLink>
          {nav("topnav")}
        </header>
      )}
      <main className="container">
        <Outlet />
      </main>
      {!focus && nav("tabbar")}
    </div>
  );
}
