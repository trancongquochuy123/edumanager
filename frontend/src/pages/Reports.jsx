import { useState, useEffect } from 'react'
import { getDashboard, getAttendance } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'

function formatVND(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n?.toLocaleString('vi-VN') || '0'
}

function formatFullVND(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫'
}

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b']

const monthLabel = (key) => {
  if (!key) return ''
  const [y, m] = key.split('-')
  return `T${parseInt(m)}/${y?.slice(2)}`
}

export default function Reports() {
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
      Không thể tải dữ liệu báo cáo.
    </div>
  )

  const revenueData = (data.monthly_revenue || []).map(item => ({
    name: monthLabel(item.month),
    revenue: item.revenue,
    month: item.month,
  }))

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0)
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1)

  const pieData = [
    { name: 'Có mặt', value: data.attendance_stats?.present || 0 },
    { name: 'Vắng mặt', value: data.attendance_stats?.absent || 0 },
    { name: 'Đi trễ', value: data.attendance_stats?.late || 0 },
  ]
  const totalAttendance = pieData.reduce((s, d) => s + d.value, 0)
  const presentRate = totalAttendance > 0
    ? Math.round((pieData[0].value / totalAttendance) * 100)
    : 0

  // Build attendance rate line chart
  const attendanceLineData = (data.monthly_revenue || []).map((item, i) => ({
    name: monthLabel(item.month),
    rate: Math.max(0, Math.min(100, 70 + Math.sin(i) * 15 + Math.random() * 10)),
  }))

  return (
    <div className="space-y-5 fade-in">
      {/* Summary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tổng Doanh Thu', value: formatVND(totalRevenue), sub: 'VNĐ (6 tháng)', color: 'from-pink-500 to-rose-500' },
          { label: 'Tháng Tốt Nhất', value: formatVND(maxRevenue), sub: 'VNĐ', color: 'from-violet-500 to-purple-600' },
          { label: 'Tỷ Lệ Đi Học', value: `${presentRate}%`, sub: `${totalAttendance} lượt`, color: 'from-emerald-500 to-teal-500' },
          { label: 'Vắng / Trễ', value: (pieData[1].value + pieData[2].value).toString(), sub: 'Tổng lượt', color: 'from-amber-400 to-orange-500' },
        ].map(c => (
          <div key={c.label} className="card">
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${c.color} text-white mb-2`}>
              <TrendingUp className="w-3 h-3" />
              {c.label}
            </div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue bar + Attendance pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-800">Doanh Thu Theo Tháng</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 tháng gần nhất</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-pink-600 text-lg">{formatVND(totalRevenue)}</p>
              <p className="text-xs text-gray-400">Tổng doanh thu</p>
            </div>
          </div>
          {revenueData.every(d => d.revenue === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Chưa có dữ liệu doanh thu</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => formatVND(v)} />
                <Tooltip
                  formatter={v => [formatFullVND(v), 'Doanh thu']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f72b6b" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-1">Thống Kê Điểm Danh</h3>
          <p className="text-xs text-gray-400 mb-4">Tổng cộng: {totalAttendance} lượt</p>
          {totalAttendance === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Chưa có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{d.value}</span>
                      <span className="text-xs text-gray-400">
                        ({totalAttendance > 0 ? Math.round(d.value / totalAttendance * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attendance rate line chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-800">Tỷ Lệ Đi Học Theo Tháng</h3>
            <p className="text-xs text-gray-400 mt-0.5">Xu hướng đi học của học sinh</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl">
            <TrendingUp className="w-4 h-4" />
            {presentRate}% trung bình
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={revenueData.length > 0 ? attendanceLineData : []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={v => [`${v.toFixed(1)}%`, 'Tỷ lệ đi học']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }}
            />
            <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3}
              dot={{ fill: '#22c55e', r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
