import { useState } from "react";
import { getSettings, updateSettings, exportJson, importJson, clearAll, type Settings } from "../lib/storage";
import { useTheme } from "../lib/theme";

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [theme, setTheme] = useTheme();
  const [json, setJson] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const patch = (p: Partial<Settings>) => setSettings(updateSettings(p));

  return (
    <div className="stack">
      <h1>Settings</h1>
      <div className="card stack">
        <label className="row">
          <span style={{ minWidth: 140 }}>Exam 2 date</span>
          <input type="date" value={settings.examDate ?? ""} onChange={(e) => patch({ examDate: e.target.value || null })} />
        </label>
        <label className="row">
          <span style={{ minWidth: 140 }}>Default answer mode</span>
          <select value={settings.defaultMode} onChange={(e) => patch({ defaultMode: e.target.value as Settings["defaultMode"] })}>
            <option value="mcq">Multiple choice</option>
            <option value="free">Type the number</option>
          </select>
        </label>
        <label className="row">
          <span style={{ minWidth: 140 }}>Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Settings["theme"])}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>

      <div className="card stack">
        <h2>Progress backup</h2>
        <p className="small muted">Progress is stored only in this browser. Export it to move between devices.</p>
        <div className="row">
          <button
            onClick={() => {
              const text = exportJson();
              setJson(text);
              const blob = new Blob([text], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `phys1-progress-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </button>
          <button
            onClick={() => {
              const err = importJson(json);
              setMsg(err ?? "Imported.");
              if (!err) setSettings(getSettings());
            }}
            disabled={!json.trim()}
          >
            Import from text below
          </button>
          <button
            onClick={() => {
              if (confirm("Erase all progress in this browser?")) {
                clearAll();
                setSettings(getSettings());
                setMsg("Cleared.");
              }
            }}
          >
            Reset progress
          </button>
        </div>
        <textarea className="json" value={json} onChange={(e) => setJson(e.target.value)} placeholder="Paste exported JSON here to import" />
        {msg && <div className="small muted">{msg}</div>}
      </div>
    </div>
  );
}
