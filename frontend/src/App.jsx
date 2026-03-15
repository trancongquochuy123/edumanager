import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Classes from './pages/Classes'
import Attendance from './pages/Attendance'
import Tuition from './pages/Tuition'
import Payments from './pages/Payments'
import Reports from './pages/Reports'

// Route chỉ cho phép khi đã đăng nhập
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
    </div>
  )

  return user ? children : <Navigate to="/login" replace />
}

// Route chỉ cho phép khi CHƯA đăng nhập (tránh vào lại /login khi đã login)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />

          {/* Protected */}
          <Route path="/" element={
            <PrivateRoute><MainLayout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="students"   element={<Students />} />
            <Route path="classes"    element={<Classes />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="tuition"    element={<Tuition />} />
            <Route path="payments"   element={<Payments />} />
            <Route path="reports"    element={<Reports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}