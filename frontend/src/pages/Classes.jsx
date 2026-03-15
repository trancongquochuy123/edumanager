import { useState, useEffect } from 'react'
import {
  getClasses, addClass, updateClass, deleteClass,
  getStudents, getEnrollments, addEnrollment, deleteEnrollment
} from '../services/api'
import { Plus, Pencil, Trash2, X, BookOpen, Users, UserPlus, Check } from 'lucide-react'

const emptyForm = { class_name: '', teacher: '', schedule: '', tuition_fee: '', start_date: '' }
const toArr = (d) => (Array.isArray(d) ? d : [])

function formatVND(n) {
  return new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫'
}

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEnroll, setShowEnroll] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [c, s, e] = await Promise.all([getClasses(), getStudents(), getEnrollments()])
      setClasses(Array.isArray(c) ? c : [])
      setStudents(Array.isArray(s) ? s : [])
      setEnrollments(Array.isArray(e) ? e : [])
    } catch { setError('Không thể tải dữ liệu') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); setError('') }
  const openEdit = (c) => { setEditItem(c); setForm({ ...c, tuition_fee: c.tuition_fee?.toString() }); setShowModal(true); setError('') }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(emptyForm) }

  const handleSave = async () => {
    if (!form.class_name.trim()) { setError('Vui lòng nhập tên lớp'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, tuition_fee: parseFloat(form.tuition_fee) || 0 }
      if (editItem) await updateClass(editItem.id, payload)
      else await addClass(payload)
      await load(); closeModal()
    } catch (e) { setError(e.response?.data?.detail || 'Có lỗi xảy ra') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteClass(id); await load(); setDeleteConfirm(null) }
    catch { setError('Không thể xóa lớp học') }
  }

  const getEnrolledStudents = (classId) =>
    enrollments.filter(e => e.class_id === classId).map(e => e.student_id)

  const handleToggleEnroll = async (classId, studentId) => {
    const existing = enrollments.find(e => e.class_id === classId && e.student_id === studentId)
    try {
      if (existing) {
        await deleteEnrollment(existing.id)
      } else {
        await addEnrollment({ student_id: studentId, class_id: classId })
      }
      const e = await getEnrollments()
      setEnrollments(Array.isArray(e) ? e : [])
    } catch (err) {
      alert(err.response?.data?.detail || 'Lỗi khi cập nhật đăng ký')
    }
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Danh Sách Lớp Học</p>
            <p className="text-xs text-gray-400">{classes.length} lớp học</p>
          </div>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Thêm Lớp
        </button>
      </div>

      {/* Grid of class cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : classes.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-pink-100" />
          <p className="font-medium text-gray-400">Chưa có lớp học nào</p>
          <p className="text-sm text-gray-300 mt-1">Nhấn "Thêm Lớp" để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map(cls => {
            const enrolledCount = getEnrolledStudents(cls.id).length
            return (
              <div key={cls.id} className="card hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-violet-400 bg-violet-50 px-2 py-0.5 rounded-lg">{cls.id}</span>
                    <h3 className="font-bold text-gray-800 mt-1.5 text-base">{cls.class_name}</h3>
                    <p className="text-sm text-gray-400">{cls.teacher}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => openEdit(cls)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      onClick={() => setDeleteConfirm(cls)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-pink-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Lịch học:</span>
                    <span className="font-medium text-gray-600 text-right text-xs">{cls.schedule || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Học phí:</span>
                    <span className="font-bold text-pink-600">{formatVND(cls.tuition_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Học sinh:</span>
                    <span className="font-semibold text-gray-600">{enrolledCount} em</span>
                  </div>
                </div>

                <button
                  className="w-full mt-3 py-2 rounded-xl border-2 border-dashed border-pink-200 text-pink-500 text-sm font-semibold hover:bg-pink-50 hover:border-pink-400 transition-all flex items-center justify-center gap-2"
                  onClick={() => setShowEnroll(cls)}
                >
                  <UserPlus className="w-4 h-4" /> Đăng Ký Học Sinh
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <h3 className="font-bold text-lg text-gray-800">
                {editItem ? 'Cập Nhật Lớp Học' : 'Thêm Lớp Học Mới'}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-pink-50 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Tên Lớp *</label>
                  <input className="input-field" placeholder="IELTS 6.0, Toán 9..." value={form.class_name}
                    onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Giáo Viên</label>
                  <input className="input-field" placeholder="Nguyễn Thị A" value={form.teacher}
                    onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Học Phí (VNĐ)</label>
                  <input className="input-field" type="number" placeholder="2000000" value={form.tuition_fee}
                    onChange={e => setForm(f => ({ ...f, tuition_fee: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Lịch Học</label>
                  <input className="input-field" placeholder="Thứ 2,4,6 - 18:00-20:00" value={form.schedule}
                    onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Ngày Khai Giảng</label>
                  <input className="input-field" type="date" value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
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

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEnroll(null)}>
          <div className="modal-box slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Đăng Ký Học Sinh</h3>
                <p className="text-sm text-pink-500">{showEnroll.class_name}</p>
              </div>
              <button onClick={() => setShowEnroll(null)} className="p-2 rounded-xl hover:bg-pink-50 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {students.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Chưa có học sinh nào</p>
              ) : (
                <div className="space-y-2">
                  {students.map(s => {
                    const isEnrolled = getEnrolledStudents(showEnroll.id).includes(s.id)
                    return (
                      <div key={s.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          isEnrolled ? 'bg-pink-50 border-2 border-pink-200' : 'bg-gray-50 border-2 border-transparent hover:border-pink-100'
                        }`}
                        onClick={() => handleToggleEnroll(showEnroll.id, s.id)}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-pink-700 font-bold text-sm flex-shrink-0">
                          {s.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700 text-sm">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.phone || s.email || '—'}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isEnrolled ? 'bg-pink-500' : 'border-2 border-gray-200'
                        }`}>
                          {isEnrolled && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-pink-50 bg-pink-50/30 rounded-b-2xl">
              <button className="btn-primary w-full justify-center" onClick={() => setShowEnroll(null)}>
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal-box max-w-sm slide-in p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Xóa Lớp Học</h3>
              <p className="text-gray-500 text-sm">Bạn có chắc muốn xóa lớp <strong>"{deleteConfirm.class_name}"</strong>?</p>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button
                className="btn-primary bg-gradient-to-r from-red-500 to-rose-600"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}