import { useLayoutEffect, useRef, type ReactNode } from "react";

interface Props {
  /** Colour the bar as feedback after an answer. */
  tone?: "good" | "bad" | "neutral";
  /** One short line: "Correct" / "Not quite — Used diameter as radius". */
  message?: ReactNode;
  /** Optional one or two sentences under the message (the explanation of the named mistake). */
  detail?: ReactNode;
  /** The buttons. The first `.primary` button is the one action for this screen. */
  children?: ReactNode;
}

/**
 * The fixed bottom action bar: the one place to look for "what do I do next".
 * Sits in the thumb zone on phones. Measures itself so the page can pad its bottom edge.
 */
export function ActionBar({ tone, message, detail, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--actionbar-h", `${el.offsetHeight}px`);
    set();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty("--actionbar-h");
    };
  }, []);
  const cls = "actionbar" + (tone && tone !== "neutral" ? ` ${tone}` : "");
  return (
    <div className={cls} ref={ref} role="region" aria-live="polite">
      <div className="actionbar-inner">
        {(message || detail) && (
          <div className="actionbar-text">
            {message && <div className="actionbar-msg">{message}</div>}
            {detail && <div className="actionbar-detail">{detail}</div>}
          </div>
        )}
        {children && <div className="actionbar-buttons">{children}</div>}
      </div>
    </div>
  );
}
