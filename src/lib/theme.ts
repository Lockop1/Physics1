import { useEffect, useState } from "react";
import { getSettings, updateSettings, type Settings } from "./storage";

function apply(theme: Settings["theme"]): void {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

/** Keeps <html data-theme> in sync with the stored setting. */
export function useTheme(): [Settings["theme"], (t: Settings["theme"]) => void] {
  const [theme, setThemeState] = useState<Settings["theme"]>(() => getSettings().theme);
  useEffect(() => {
    apply(theme);
  }, [theme]);
  const setTheme = (t: Settings["theme"]) => {
    updateSettings({ theme: t });
    setThemeState(t);
  };
  return [theme, setTheme];
}
