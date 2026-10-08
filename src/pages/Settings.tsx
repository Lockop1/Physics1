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
    <div>
      <h1>Settings</h1>
      <div className="card">
        <label className="field">
          <span>Exam 2 date</span>
          <input type="date" value={settings.examDate ?? ""} onChange={(e) => patch({ examDate: e.target.value || null })} />
        </label>
        <label className="field">
          <span>Answer mode</span>
          <select value={settings.defaultMode} onChange={(e) => patch({ defaultMode: e.target.value as Settings["defaultMode"] })}>
            <option value="mcq">Multiple choice</option>
            <option value="free">Type the number</option>
          </select>
        </label>
        <label className="field">
          <span>Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Settings["theme"])}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>

      <section>
        <div className="section-title">Progress backup</div>
        <div className="card stack">
          <p className="note" style={{ margin: 0 }}>
            Progress lives in this browser only. Export to move it to another device.
          </p>
          <div className="btn-row">
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
              Export
            </button>
            <button
              onClick={() => {
                const err = importJson(json);
                setMsg(err ?? "Imported.");
                if (!err) setSettings(getSettings());
              }}
              disabled={!json.trim()}
            >
              Import pasted JSON
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
      </section>

      <section>
        <div className="section-title">Keyboard (desktop)</div>
        <p className="note">1–5 pick a choice · Enter check / next · N next question.</p>
      </section>
    </div>
  );
}
