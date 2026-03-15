import { useState, useEffect } from 'react'
import { getClasses, getStudents, getEnrollments, getAttendance, postAttendance } from '../services/api'
import { CalendarCheck, Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

const toArr = (d) => (Array.isArray(d) ? d : [])

export default function Attendance() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getClasses(), getStudents(), getEnrollments()])
      .then(([c, s, e]) => {
        setClasses(toArr(c))
        setStudents(toArr(s))
        setEnrollments(toArr(e))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedClass || !selectedDate) return
    getAttendance({ class_id: selectedClass, date: selectedDate })
      .then(records => {
        const safeRecords = toArr(records)
        const map = {}
        safeRecords.forEach(r => { map[r.student_id] = r.status })
        const enrolled = toArr(enrollments).filter(e => e.class_id === selectedClass)
        const newMap = {}
        enrolled.forEach(e => { newMap[e.student_id] = map[e.student_id] || 'present' })
        setAttendance(newMap)
      })
      .catch(console.error)
  }, [selectedClass, selectedDate, enrollments])

  const enrolledStudents = toArr(enrollments)
    .filter(e => e.class_id === selectedClass)
    .map(e => toArr(students).find(s => s.id === e.student_id))
    .filter(Boolean)

  const handleStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return
    setSaving(true)
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id, class_id: selectedClass, date: selectedDate, status,
      }))
      await postAttendance(records)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { alert('Lỗi khi lưu điểm danh') }
    finally { setSaving(false) }
  }

  const counts = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent:  Object.values(attendance).filter(s => s === 'absent').length,
    late:    Object.values(attendance).filter(s => s === 'late').length,
  }

  const statusConfig = [
    { value: 'present', activeColor: 'bg-emerald-500 border-emerald-500' },
    { value: 'absent',  activeColor: 'bg-red-500 border-red-500' },
    { value: 'late',    activeColor: 'bg-amber-500 border-amber-500' },
  ]

  return (
    <div className="space-y-4 fade-in">
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="label">Chọn Ngày</label>
            <input type="date" className="input-field" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="label">Chọn Lớp</label>
            <select className="input-field" value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}>
              <option value="">-- Chọn lớp --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name} ({c.teacher})</option>
              ))}
            </select>
          </div>
          {selectedClass && enrolledStudents.length > 0 && (
            <button className={`btn-primary ${saved ? 'from-emerald-500 to-teal-500' : ''}`}
              onClick={handleSave} disabled={saving}>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang lưu...</>
                : saved ? <><CheckCircle2 className="w-4 h-4" /> Đã lưu!</>
                : <><Save className="w-4 h-4" /> Lưu Điểm Danh</>}
            </button>
          )}
        </div>
        {selectedClass && enrolledStudents.length > 0 && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-pink-50">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-500">Có mặt: <strong className="text-emerald-600">{counts.present}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-gray-500">Vắng: <strong className="text-red-500">{counts.absent}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-gray-500">Trễ: <strong className="text-amber-600">{counts.late}</strong></span>
            </div>
          </div>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {!selectedClass ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-pink-100" />
            <p className="font-medium text-gray-400">Vui lòng chọn lớp và ngày</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-pink-100" />
            <p className="font-medium text-gray-400">Lớp này chưa có học sinh đăng ký</p>
            <p className="text-sm text-gray-300 mt-1">Vào mục "Lớp Học" để đăng ký học sinh</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Học Sinh</th>
                  <th className="table-header text-center">Có Mặt</th>
                  <th className="table-header text-center">Vắng Mặt</th>
                  <th className="table-header text-center">Đi Trễ</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((s, idx) => (
                  <tr key={s.id} className={`hover:bg-pink-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-pink-700 font-bold text-sm flex-shrink-0">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    {statusConfig.map(({ value, activeColor }) => (
                      <td key={value} className="table-cell text-center">
                        <div className="flex justify-center">
                          <button onClick={() => handleStatus(s.id, value)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                              attendance[s.id] === value ? activeColor + ' text-white' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}>
                            {attendance[s.id] === value && <div className="w-3.5 h-3.5 bg-white rounded-full" />}
                          </button>
                        </div>
                      </td>
                    ))}
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