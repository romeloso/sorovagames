import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AchievementsPage } from '@/pages/AchievementsPage'
import { StaffLoginPage } from '@/pages/AdminLoginPage'
import { AdminPanelPage } from '@/pages/AdminPanelPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { GameHubPage } from '@/pages/GameHubPage'
import { FamilyReportPage } from '@/pages/FamilyReportPage'
import { LessonPage } from '@/pages/LessonPage'
import { ReadingDiagnosticPage } from '@/pages/ReadingDiagnosticPage'
import { ReadingMapPage } from '@/pages/ReadingMapPage'
import { ProfileSelectPage } from '@/pages/ProfileSelectPage'
import { ProgressMapPage } from '@/pages/ProgressMapPage'
import { ResultPage } from '@/pages/ResultPage'
import { WordSearchPage } from '@/pages/WordSearchPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileSelectPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/progress" element={<ProgressMapPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/familia" element={<FamilyReportPage />} />
          <Route path="/games/aprende-a-leer" element={<ReadingMapPage />} />
          <Route path="/games/aprende-a-leer/diagnostico" element={<ReadingDiagnosticPage />} />
          <Route path="/games/:gameSlug" element={<GameHubPage />} />
          <Route path="/games/:gameSlug/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/games/sopa-de-letras/play/:puzzleId" element={<WordSearchPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/tutor" element={<StaffLoginPage mode="tutor" />} />
          <Route path="/superadmin" element={<StaffLoginPage mode="superadmin" />} />
          <Route path="/panel" element={<AdminPanelPage />} />
          <Route path="/admin" element={<Navigate to="/superadmin" replace />} />
          <Route path="/admin/panel" element={<Navigate to="/panel" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
