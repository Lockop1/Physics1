import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { TopicPage } from "./pages/Topic";
import { PracticePage } from "./pages/Practice";
import { EquationSheetPage } from "./pages/EquationSheet";
import { SettingsPage } from "./pages/Settings";
import { useTheme } from "./lib/theme";

export function App() {
  useTheme();
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/q/:templateId/:seed" element={<PracticePage />} />
          <Route path="/q/:templateId" element={<PracticePage />} />
          <Route path="/practice/:topicId" element={<PracticePage />} />
          <Route path="/equations" element={<EquationSheetPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
