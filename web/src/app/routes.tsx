import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ParticipantsPage from '../pages/admin/ParticipantsPage'
import AttendancesPage from '../pages/admin/AttendancesPage'
import SessionsPage from '../pages/admin/SessionsPage'
import QRDisplayPage from '../pages/admin/QRDisplayPage'
import SettingsPage from '../pages/admin/SettingsPage'
import CheckinPage from '../pages/checkin/CheckinPage'
import ShortCodeCheckinPage from '../pages/checkin/ShortCodeCheckinPage'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/checkin', element: <CheckinPage /> },
  { path: '/c/:code', element: <ShortCodeCheckinPage /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/participants', element: <ParticipantsPage /> },
  { path: '/admin/attendances', element: <AttendancesPage /> },
  { path: '/admin/sessions', element: <SessionsPage /> },
  { path: '/admin/qr/:sessionId', element: <QRDisplayPage /> },
  { path: '/admin/settings', element: <SettingsPage /> },
])