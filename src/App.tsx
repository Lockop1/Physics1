import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { TopicPage } from "./pages/Topic";
import { PracticePage } from "./pages/Practice";
import { EquationSheetPage } from "./pages/EquationSheet";
import { SettingsPage } from "./pages/Settings";
import { DetectivePage } from "./pages/Detective";
import { DetectivePickPage } from "./pages/DetectivePick";
import { DetectiveGivensPage } from "./pages/DetectiveGivens";
import { DetectiveRecipePage } from "./pages/DetectiveRecipe";
import { DetectiveTrapPage } from "./pages/DetectiveTrap";
import { FlashcardsPage } from "./pages/Flashcards";
import { PracticeByEquationPage } from "./pages/PracticeByEquation";
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
          <Route path="/practice-eq/:equationId" element={<PracticeByEquationPage />} />
          <Route path="/detective" element={<DetectivePage />} />
          <Route path="/detective/pick" element={<DetectivePickPage />} />
          <Route path="/detective/pick/:templateId/:seed" element={<DetectivePickPage />} />
          <Route path="/detective/givens" element={<DetectiveGivensPage />} />
          <Route path="/detective/givens/:templateId/:seed" element={<DetectiveGivensPage />} />
          <Route path="/detective/recipe" element={<DetectiveRecipePage />} />
          <Route path="/detective/recipe/:templateId/:seed" element={<DetectiveRecipePage />} />
          <Route path="/detective/trap" element={<DetectiveTrapPage />} />
          <Route path="/detective/trap/:trapId" element={<DetectiveTrapPage />} />
          <Route path="/detective/flashcards" element={<FlashcardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
