import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck,
  CreditCard, DollarSign, BarChart3, Menu, X,
  GraduationCap, Bell, Search, LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { path: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/students',   label: 'Học Sinh',      icon: Users },
  { path: '/classes',    label: 'Lớp Học',       icon: BookOpen },
  { path: '/attendance', label: 'Điểm Danh',     icon: CalendarCheck },
  { path: '/tuition',    label: 'Học Phí',       icon: CreditCard },
  { path: '/payments',   label: 'Thanh Toán',    icon: DollarSign },
  { path: '/reports',    label: 'Báo Cáo',       icon: BarChart3 },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const currentPage = navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Hiển thị tên: lấy từ email (phần trước @)
  const displayName = user?.email?.split('@')[0] || 'Admin'
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdf2f8]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-pink-100
        flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-pink-100">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight">EduManager</h1>
            <p className="text-xs text-pink-400 font-medium">Quản Lý Học Phí</p>
          </div>
          <button className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Menu</p>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-pink-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-pink-100 px-4 lg:px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-gray-800 text-base leading-tight">{currentPage}</h2>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 w-52">
              <Search className="w-4 h-4" />
              <span>Tìm kiếm...</span>
            </div>
            <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold hover:shadow-md transition-shadow"
            >
              {initial}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}