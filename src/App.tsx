import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { INITIAL_EVENT_SLUG } from './lib/constants'
import AdminAttendancePage from './pages/admin/AdminAttendancePage'
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage'
import AdminEventOverviewPage from './pages/admin/AdminEventOverviewPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminQrCodesPage from './pages/admin/AdminQrCodesPage'
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AttendancePage from './pages/public/AttendancePage'
import RegistrationPage from './pages/public/RegistrationPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/evento/${INITIAL_EVENT_SLUG}/inscricao`} replace />} />
      <Route path="/evento/:slug/inscricao" element={<RegistrationPage />} />
      <Route path="/evento/:slug/presenca" element={<AttendancePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminEventsPage />} />
        <Route path="eventos/:id" element={<AdminEventOverviewPage />} />
        <Route path="eventos/:id/inscricoes" element={<AdminRegistrationsPage />} />
        <Route path="eventos/:id/presencas" element={<AdminAttendancePage />} />
        <Route path="eventos/:id/certificados" element={<AdminCertificatesPage />} />
        <Route path="eventos/:id/qrcodes" element={<AdminQrCodesPage />} />
        <Route path="eventos/:id/configuracoes" element={<AdminSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
