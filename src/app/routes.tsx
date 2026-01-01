import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ParticipantsPage from '../pages/admin/ParticipantsPage'
import CheckinPage from '../pages/checkin/CheckinPage'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/checkin', element: <CheckinPage /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/participants', element: <ParticipantsPage /> },
])