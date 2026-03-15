import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// ─── Students ───────────────────────────────────────────────
export const getStudents = async () => {
  const { data } = await api.get('/students')
  return data
}
export const addStudent = async (student) => {
  const { data } = await api.post('/students', student)
  return data
}
export const updateStudent = async (id, student) => {
  const { data } = await api.put(`/students/${id}`, student)
  return data
}
export const deleteStudent = async (id) => {
  const { data } = await api.delete(`/students/${id}`)
  return data
}

// ─── Classes ────────────────────────────────────────────────
export const getClasses = async () => {
  const { data } = await api.get('/classes')
  return data
}
export const addClass = async (cls) => {
  const { data } = await api.post('/classes', cls)
  return data
}
export const updateClass = async (id, cls) => {
  const { data } = await api.put(`/classes/${id}`, cls)
  return data
}
export const deleteClass = async (id) => {
  const { data } = await api.delete(`/classes/${id}`)
  return data
}

// ─── Enrollments ─────────────────────────────────────────────
export const getEnrollments = async () => {
  const { data } = await api.get('/enrollments')
  return data
}
export const addEnrollment = async (enrollment) => {
  const { data } = await api.post('/enrollments', enrollment)
  return data
}
export const deleteEnrollment = async (id) => {
  const { data } = await api.delete(`/enrollments/${id}`)
  return data
}

// ─── Attendance ──────────────────────────────────────────────
export const getAttendance = async (params = {}) => {
  const { data } = await api.get('/attendance', { params })
  return data
}
export const postAttendance = async (records) => {
  const { data } = await api.post('/attendance', { records })
  return data
}

// ─── Payments ────────────────────────────────────────────────
export const getPayments = async () => {
  const { data } = await api.get('/payments')
  return data
}
export const addPayment = async (payment) => {
  const { data } = await api.post('/payments', payment)
  return data
}

// ─── Tuition ─────────────────────────────────────────────────
export const getTuition = async () => {
  const { data } = await api.get('/tuition')
  return data
}
export const getTuitionByStudent = async (studentId) => {
  const { data } = await api.get(`/tuition/${studentId}`)
  return data
}

// ─── Dashboard ───────────────────────────────────────────────
export const getDashboard = async () => {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export default api
