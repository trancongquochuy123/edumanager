import { useState, useEffect } from 'react'
import { getPayments, addPayment, getStudents, getClasses } from '../services/api'
import { Plus, X, DollarSign, Search } from 'lucide-react'

const emptyForm = { student_id: '', class_id: '', amount: '', method: 'cash', note: '', date: new Date().toISOString().split('T')[0] }

function formatVND(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫'
}

const methodLabel = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', momo: 'MoMo', vnpay: 'VNPay' }
const methodColor = {
  cash: 'bg-emerald-100 text-emerald-700',
  transfer: 'bg-blue-100 text-blue-700',
  momo: 'bg-pink-100 text-pink-700',
  vnpay: 'bg-violet-100 text-violet-700',
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const [p, s, c] = await Promise.all([getPayments(), getStudents(), getClasses()])
      setPayments(p); setStudents(s); setClasses(c)
    } catch { console.error('Load error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const studentMap = Object.fromEntries(students.map(s => [s.id, s.name]))
  const classMap = Object.fromEntries(classes.map(c => [c.id, c.class_name]))

  const openModal = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] })
    setError(''); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.student_id || !form.class_id || !form.amount) {
      setError('Vui lòng điền đầy đủ thông tin'); return
    }
    setSaving(true); setError('')
    try {
      await addPayment({ ...form, amount: parseFloat(form.amount) })
      await load(); setShowModal(false)
    } catch (e) { setError(e.response?.data?.detail || 'Có lỗi xảy ra') }
    finally { setSaving(false) }
  }

  const filtered = payments.filter(p => {
    const sName = studentMap[p.student_id] || ''
    const cName = classMap[p.class_id] || ''
    return (
      sName.toLowerCase().includes(search.toLowerCase()) ||
      cName.toLowerCase().includes(search.toLowerCase()) ||
      p.note?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Lịch Sử Thanh Toán</p>
              <p className="text-xs text-gray-400">{payments.length} giao dịch</p>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-pink-100" />
          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Tổng thu</p>
            <p className="font-bold text-pink-600">{formatVND(totalRevenue)}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="input-field pl-9 w-full" placeholder="Tìm kiếm..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary flex-shrink-0" onClick={openModal}>
            <Plus className="w-4 h-4" /> Thêm
          </button>
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
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-pink-100" />
            <p className="font-medium text-gray-400">
              {payments.length === 0 ? 'Chưa có thanh toán nào' : 'Không tìm thấy kết quả'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Ngày','Học Sinh','Lớp Học','Số Tiền','Phương Thức','Ghi Chú'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className={`hover:bg-pink-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="table-cell">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{p.date}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-pink-700 font-bold text-xs flex-shrink-0">
                          {studentMap[p.student_id]?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-gray-700 text-sm">{studentMap[p.student_id] || p.student_id}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-lg">
                        {classMap[p.class_id] || p.class_id}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-bold text-pink-600">+{formatVND(p.amount)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${methodColor[p.method] || 'bg-gray-100 text-gray-600'}`}>
                        {methodLabel[p.method] || p.method}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400 text-sm">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <h3 className="font-bold text-lg text-gray-800">Thêm Thanh Toán</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-pink-50 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Học Sinh *</label>
                  <select className="input-field" value={form.student_id}
                    onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}>
                    <option value="">-- Chọn học sinh --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Lớp Học *</label>
                  <select className="input-field" value={form.class_id}
                    onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}>
                    <option value="">-- Chọn lớp --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Số Tiền (VNĐ) *</label>
                  <input type="number" className="input-field" placeholder="1000000"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Phương Thức</label>
                  <select className="input-field" value={form.method}
                    onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                    <option value="momo">MoMo</option>
                    <option value="vnpay">VNPay</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ngày Thanh Toán</label>
                  <input type="date" className="input-field" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Ghi Chú</label>
                  <input className="input-field" placeholder="Đóng học phí tháng 3..."
                    value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-pink-50 bg-pink-50/30 rounded-b-2xl">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Xác Nhận Thanh Toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
