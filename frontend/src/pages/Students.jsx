import { useState, useEffect } from 'react'
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/api'
import { Plus, Search, Pencil, Trash2, X, UserCheck, UserX, Users } from 'lucide-react'

const emptyForm = { name: '', phone: '', parent_phone: '', email: '', address: '', status: 'active' }
const toArr = (d) => (Array.isArray(d) ? d : [])

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getStudents()
      setStudents(toArr(data))
    } catch (e) {
      console.error(e)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); setError('') }
  const openEdit = (s) => { setEditItem(s); setForm({ ...s }); setShowModal(true); setError('') }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(emptyForm) }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Vui lòng nhập tên học sinh'); return }
    setSaving(true); setError('')
    try {
      if (editItem) await updateStudent(editItem.id, form)
      else await addStudent(form)
      await load()
      closeModal()
    } catch (e) {
      setError(e.response?.data?.detail || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id)
      await load()
      setDeleteConfirm(null)
    } catch { setError('Không thể xóa học sinh') }
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 fade-in">
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input className="input-field pl-9" placeholder="Tìm học sinh..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Thêm Học Sinh
          </button>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-pink-50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4 text-pink-400" />
            <span>Tổng: <strong className="text-gray-700">{students.length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Hoạt động: <strong className="text-emerald-600">{students.filter(s => s.status === 'active').length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UserX className="w-4 h-4 text-gray-300" />
            <span>Nghỉ học: <strong className="text-gray-400">{students.filter(s => s.status !== 'active').length}</strong></span>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <Users className="w-12 h-12 mx-auto mb-3 text-pink-100" />
            <p className="font-medium text-gray-400">Không có học sinh nào</p>
            <p className="text-sm mt-1">{search ? 'Thử từ khóa khác' : 'Nhấn "Thêm Học Sinh" để bắt đầu'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['ID','Học Sinh','Điện Thoại','Email','Trạng Thái','Thao Tác'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id} className={`hover:bg-pink-50/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="table-cell">
                      <span className="text-xs font-mono font-bold text-pink-400 bg-pink-50 px-2 py-0.5 rounded-lg">{s.id}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-pink-700 font-bold text-xs flex-shrink-0">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">{s.name}</p>
                          {s.address && <p className="text-xs text-gray-400 truncate max-w-[160px]">{s.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm">{s.phone || '—'}</p>
                        {s.parent_phone && <p className="text-xs text-gray-400">PH: {s.parent_phone}</p>}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{s.email || '—'}</td>
                    <td className="table-cell">
                      <span className={s.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                        {s.status === 'active' ? 'Hoạt động' : 'Nghỉ học'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                          onClick={() => setDeleteConfirm(s)}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <h3 className="font-bold text-lg text-gray-800">{editItem ? 'Cập Nhật Học Sinh' : 'Thêm Học Sinh Mới'}</h3>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-pink-50 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Họ và Tên *</label>
                  <input className="input-field" placeholder="Nguyễn Văn A" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Số Điện Thoại</label>
                  <input className="input-field" placeholder="0901234567" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">ĐT Phụ Huynh</label>
                  <input className="input-field" placeholder="0912345678" value={form.parent_phone}
                    onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email</label>
                  <input className="input-field" placeholder="email@gmail.com" type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Địa Chỉ</label>
                  <input className="input-field" placeholder="123 Đường ABC..." value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Trạng Thái</label>
                  <select className="input-field" value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Nghỉ học</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-pink-50 bg-pink-50/30 rounded-b-2xl">
              <button className="btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editItem ? 'Cập Nhật' : 'Thêm Mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal-box max-w-sm slide-in p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Xác Nhận Xóa</h3>
              <p className="text-gray-500 text-sm">Bạn có chắc muốn xóa <strong>"{deleteConfirm.name}"</strong>?</p>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button className="btn-primary bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                onClick={() => handleDelete(deleteConfirm.id)}>
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}