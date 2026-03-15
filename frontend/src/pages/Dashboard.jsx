import { useState, useEffect } from 'react'
import { getDashboard } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, UserX, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b']

function formatVND(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n?.toLocaleString('vi-VN') || '0'
}

function formatFullVND(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫'
}

function StatCard({ label, value, icon: Icon, color, subtext, trend }) {
  return (
    <div className="card fade-in flex items-start gap-4 relative overflow-hidden">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5" />
          {trend}
        </div>
      )}
    </div>
  )
}

const monthLabel = (key) => {
  const [y, m] = key.split('-')
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
  return months[(parseInt(m) - 1)] || key
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="card text-center py-12 text-gray-400">
      <AlertCircle className="w-10 h-10 mx-auto mb-3 text-pink-300" />
      <p>Không thể tải dữ liệu. Vui lòng kiểm tra backend.</p>
    </div>
  )

  const pieData = [
    { name: 'Có mặt', value: data.attendance_stats?.present || 0 },
    { name: 'Vắng mặt', value: data.attendance_stats?.absent || 0 },
    { name: 'Đi trễ', value: data.attendance_stats?.late || 0 },
  ]

  const chartData = (data.monthly_revenue || []).map(item => ({
    name: monthLabel(item.month),
    revenue: item.revenue,
  }))

  const statusMap = { present: 'Có mặt', absent: 'Vắng', late: 'Trễ' }
  const statusColor = { present: 'badge-active', absent: 'badge-unpaid', late: 'badge-partial' }

  return (
    <div className="space-y-5 fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng Học Sinh"
          value={data.total_students}
          icon={Users}
          color="bg-gradient-to-br from-pink-500 to-rose-500"
          subtext="Đang hoạt động"
        />
        <StatCard
          label="Vắng Hôm Nay"
          value={data.absent_today}
          icon={UserX}
          color="bg-gradient-to-br from-amber-400 to-orange-500"
          subtext="Học sinh"
        />
        <StatCard
          label="Chưa Đóng Phí"
          value={data.unpaid_count}
          icon={AlertCircle}
          color="bg-gradient-to-br from-red-400 to-rose-600"
          subtext="Học sinh"
        />
        <StatCard
          label="Doanh Thu Tháng"
          value={formatVND(data.revenue_this_month)}
          icon={TrendingUp}
          color="bg-gradient-to-br from-emerald-400 to-teal-500"
          subtext="VNĐ"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Bar Chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span>
            Doanh Thu 6 Tháng Gần Nhất
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => formatVND(v)} />
              <Tooltip
                formatter={(v) => [formatFullVND(v), 'Doanh thu']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}
                fill="url(#pinkGrad)" />
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f72b6b" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Pie Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            Thống Kê Điểm Danh
          </h3>
          {pieData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Payments */}
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span>
            Thanh Toán Gần Đây
          </h3>
          {(!data.recent_payments || data.recent_payments.length === 0) ? (
            <p className="text-gray-300 text-sm text-center py-6">Chưa có thanh toán nào</p>
          ) : (
            <div className="space-y-2">
              {data.recent_payments.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-pink-700 font-bold text-xs flex-shrink-0">
                    {p.student_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{p.student_name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.class_name} · {p.date}</p>
                  </div>
                  <span className="text-sm font-bold text-pink-600 flex-shrink-0">+{formatVND(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
            Điểm Danh Gần Đây
          </h3>
          {(!data.recent_attendance || data.recent_attendance.length === 0) ? (
            <p className="text-gray-300 text-sm text-center py-6">Chưa có dữ liệu điểm danh</p>
          ) : (
            <div className="space-y-2">
              {data.recent_attendance.map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                    {a.student_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{a.student_name}</p>
                    <p className="text-xs text-gray-400 truncate">{a.class_name} · {a.date}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    a.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                    a.status === 'late' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {statusMap[a.status] || a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
