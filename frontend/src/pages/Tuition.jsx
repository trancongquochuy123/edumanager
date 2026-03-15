import { useState, useEffect } from 'react'
import { getTuition } from '../services/api'
import { CreditCard, Search, TrendingUp } from 'lucide-react'

function formatVND(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫'
}

export default function Tuition() {
  const [tuition, setTuition] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const load = async () => {
    try { const data = await getTuition(); setTuition(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = tuition.filter(t => {
    const matchSearch =
      t.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.class_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || t.status === filter
    return matchSearch && matchFilter
  })

  const summary = {
    total: tuition.reduce((s, t) => s + (t.total_fee || 0), 0),
    paid: tuition.reduce((s, t) => s + (t.paid || 0), 0),
    remaining: tuition.reduce((s, t) => s + (t.remaining || 0), 0),
    unpaidCount: tuition.filter(t => t.status === 'unpaid').length,
    partialCount: tuition.filter(t => t.status === 'partial').length,
    paidCount: tuition.filter(t => t.status === 'paid').length,
  }

  const statusLabel = { paid: 'Đã đóng', partial: 'Còn thiếu', unpaid: 'Chưa đóng' }
  const statusClass = { paid: 'badge-paid', partial: 'badge-partial', unpaid: 'badge-unpaid' }

  return (
    <div className="space-y-4 fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tổng Học Phí', value: formatVND(summary.total), color: 'from-violet-500 to-purple-600' },
          { label: 'Đã Thu', value: formatVND(summary.paid), color: 'from-emerald-500 to-teal-500' },
          { label: 'Còn Thiếu', value: formatVND(summary.remaining), color: 'from-pink-500 to-rose-500' },
          { label: 'Chưa Đóng', value: `${summary.unpaidCount + summary.partialCount} HS`, color: 'from-amber-400 to-orange-500' },
        ].map(c => (
          <div key={c.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium truncate">{c.label}</p>
              <p className="font-bold text-gray-800 text-sm truncate">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="input-field pl-9" placeholder="Tìm học sinh, lớp học..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[['all','Tất cả'],['unpaid','Chưa đóng'],['partial','Còn thiếu'],['paid','Đã đóng']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === val
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-pink-300 hover:text-pink-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-pink-100" />
            <p className="font-medium text-gray-400">
              {tuition.length === 0 ? 'Chưa có dữ liệu học phí' : 'Không tìm thấy kết quả'}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {tuition.length === 0 ? 'Hãy đăng ký học sinh vào lớp học trước' : 'Thử thay đổi bộ lọc'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Học Sinh','Lớp Học','Tổng Phí','Đã Đóng','Còn Lại','Trạng Thái'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={`${t.student_id}-${t.class_id}`}
                    className={`hover:bg-pink-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-pink-700 font-bold text-xs flex-shrink-0">
                          {t.student_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-gray-700">{t.student_name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-lg">{t.class_name}</span>
                    </td>
                    <td className="table-cell font-semibold text-gray-700">{formatVND(t.total_fee)}</td>
                    <td className="table-cell font-semibold text-emerald-600">{formatVND(t.paid)}</td>
                    <td className="table-cell">
                      <span className={`font-bold ${t.remaining > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {formatVND(t.remaining)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={statusClass[t.status] || 'badge-inactive'}>
                        {statusLabel[t.status] || t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
