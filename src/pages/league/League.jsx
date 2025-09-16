import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import baseUrl from '../../api/baseUrl'
import UserType from '../../Hooks/auth/userType'
import ScrollToTop from '../../components/scollToTop/ScrollToTop'

const League = () => {
  const { id } = useParams()
  const [userData, isAdmin, isTeacher, student] = UserType()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createMsg, setCreateMsg] = useState("")

  // Match creation form states
  const [matchName, setMatchName] = useState("")
  const [matchDescription, setMatchDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const [matchImageFile, setMatchImageFile] = useState(null)
  const [matchImagePreview, setMatchImagePreview] = useState("")
  const matchImageInputRef = useRef(null)

  // Enrolled students (admin only)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState("")
  const [isStudentsOpen, setIsStudentsOpen] = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)

  // Matches (read/manage)
  const [matches, setMatches] = useState([])
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [matchesError, setMatchesError] = useState("")
  const [isEditMatch, setIsEditMatch] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [matchToDelete, setMatchToDelete] = useState(null)
  const [deletingMatch, setDeletingMatch] = useState(false)

  // Leaderboard
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false) // legacy modal flag (unused for full-page)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLeague, setLeaderboardLeague] = useState(null)
  const [lbLoading, setLbLoading] = useState(false)
  const [lbError, setLbError] = useState("")
  const [lbPagination, setLbPagination] = useState({ total: 0, limit: 10, offset: 0, has_more: false })

  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }), [])

  // Time selection helpers (for precise, easy selection)
  const hoursOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0')), [])
  const minutesOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0')), [])
  const getTimeParts = (timeStr) => {
    const parts = (timeStr || '').split(':')
    return { hour: parts[0] || '', minute: parts[1] || '' }
  }
  const setStartTimeFromParts = (hour, minute) => {
    if (!hour && !minute) { setStartTime(''); return }
    const hh = hour || getTimeParts(startTime).hour || '00'
    const mm = minute || getTimeParts(startTime).minute || '00'
    setStartTime(`${hh}:${mm}`)
  }
  const setEndTimeFromParts = (hour, minute) => {
    if (!hour && !minute) { setEndTime(''); return }
    const hh = hour || getTimeParts(endTime).hour || '00'
    const mm = minute || getTimeParts(endTime).minute || '00'
    setEndTime(`${hh}:${mm}`)
  }

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await baseUrl.get(`/api/leagues/${id}`, { headers: authHeader })
      // API returns the league object directly
      setTournament(res?.data ?? res?.data?.data)
    } catch (e) {
      setError('فشل في جلب تفاصيل الدوري')
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true)
      setMatchesError("")
      const res = await baseUrl.get(`/api/leagues/${id}/matches`, { headers: authHeader })
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])
      setMatches(list)
    } catch (e) {
      setMatchesError('فشل في جلب المباريات')
    } finally {
      setMatchesLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true)
      setStudentsError("")
      const res = await baseUrl.get(`/api/leagues/${id}/students`, { headers: authHeader })
      const list = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : [])
      setStudents(list)
    } catch (e) {
      setStudentsError('فشل في جلب الطلاب المشتركين')
    } finally {
      setStudentsLoading(false)
    }
  }

  const openStudentsModal = async () => {
    try {
      if (isAdmin) {
        await fetchStudents()
      }
    } finally {
      setIsStudentsOpen(true)
    }
  }

  const closeStudentsModal = () => setIsStudentsOpen(false)

  const handleDeleteStudent = async (studentId) => {
    if (!studentId) return
    try {
      setDeletingStudentId(studentId)
      await baseUrl.delete(`/api/leagues/${id}/students/${studentId}`, { headers: authHeader })
      setStudents((prev) => prev.filter((s) => (s.student_id ?? s.id) !== studentId))
    } catch (e) {
      setStudentsError('فشل حذف اشتراك الطالب')
    } finally {
      setDeletingStudentId(null)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTournamentDetails()
      fetchMatches()
    }
  }, [id, authHeader])

  useEffect(() => {
    if (id && isAdmin) {
      fetchStudents()
    }
  }, [id, isAdmin, authHeader])

  const resetMatchForm = () => {
    setMatchName("")
    setMatchDescription("")
    setStartDate("")
    setStartTime("")
    setEndTime("")
    setIsVisible(true)
    setMatchImageFile(null)
    setMatchImagePreview("")
    try { if (matchImageInputRef?.current) matchImageInputRef.current.value = "" } catch {}
    setCreateError("")
    setCreateMsg("")
    setIsEditMatch(false)
    setEditingMatch(null)
  }

  const handleCreateMatch = async (e) => {
    e?.preventDefault?.()
    try {
      setCreating(true)
      setCreateError("")
      setCreateMsg("")
      
      // Validate time window
      if (startTime && endTime && startDate) {
        const start = new Date(`${startDate}T${startTime}:00`)
        const end = new Date(`${startDate}T${endTime}:00`)
        if (!(end > start)) {
          setCreateError('وقت النهاية يجب أن يكون بعد وقت البداية')
          setCreating(false)
          return
        }
      }

      const form = new FormData()
      form.append('name', matchName)
      if (matchDescription) form.append('description', matchDescription)
      if (startDate) form.append('start_date', startDate)
      if (startTime) form.append('start_time', startTime)
      if (endTime) form.append('end_time', endTime)
      form.append('is_visible', isVisible ? 'true' : 'false')
      if (matchImageFile) form.append('image', matchImageFile)

      const endpoint = isEditMatch && editingMatch ? `/api/leagues/matches/${editingMatch.id}` : `/api/leagues/${id}/matches`
      const method = isEditMatch && editingMatch ? 'put' : 'post'
      await baseUrl[method](endpoint, form, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      })
      
      setCreateMsg(isEditMatch ? 'تم تحديث المباراة بنجاح' : 'تم إنشاء المباراة بنجاح')
      await fetchMatches()
      setTimeout(() => {
        setIsCreateMatchOpen(false)
        resetMatchForm()
      }, 700)
    } catch (e) {
      setCreateError(isEditMatch ? 'فشل تحديث المباراة.' : 'فشل إنشاء المباراة.')
    } finally {
      setCreating(false)
    }
  }

  const openEditMatch = (match) => {
    setIsEditMatch(true)
    setEditingMatch(match)
    setMatchName(match.name || '')
    setMatchDescription(match.description || '')
    setIsVisible(Boolean(match.is_visible))
    setStartDate(match.start_date || '')
    setStartTime(match.start_time || '')
    setEndTime(match.end_time || '')
    setMatchImageFile(null)
    setIsCreateMatchOpen(true)
  }

  const handleDeleteMatch = async (matchId) => {
    try {
      await baseUrl.delete(`/api/leagues/matches/${matchId}`, { headers: authHeader })
      await fetchMatches()
    } catch (e) {
      // swallow; you can add toast later
    }
  }

  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return
    try {
      setDeletingMatch(true)
      await baseUrl.delete(`/api/leagues/matches/${matchToDelete.id}`, { headers: authHeader })
      await fetchMatches()
      setMatchToDelete(null)
    } catch (e) {
      // ignore
    } finally {
      setDeletingMatch(false)
    }
  }

  const handleToggleMatchVisibility = async (matchId) => {
    try {
      await baseUrl.patch(`/api/leagues/matches/${matchId}/toggle-visibility`, {}, { headers: authHeader })
      await fetchMatches()
    } catch (e) {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-lg text-slate-600">جارِ تحميل تفاصيل الدوري...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 ml-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">الدوري غير موجود</h3>
          <Link to="/leagues" className="text-indigo-600 hover:text-indigo-700">
            العودة للدوريات
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const formatPrice = (value) => {
    if (value === '' || value == null) return 'مجاني'
    const n = Number(value)
    if (Number.isNaN(n)) return 'غير متاح'
    return `${n.toLocaleString('ar-EG')} ج.م`
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    } catch {
      return dateStr
    }
  }

  const isMatchAvailableNow = (m) => {
    try {
      if (!m) return false
      const now = new Date()
      const start = m.start_date && m.start_time ? new Date(`${m.start_date}T${m.start_time}:00`) : null
      const end = m.start_date && m.end_time ? new Date(`${m.start_date}T${m.end_time}:00`) : null
      return Boolean(start && end && now >= start && now <= end)
    } catch {
      return false
    }
  }

  const fetchLeaderboard = async (offset = 0, limit = 10) => {
    if (!id) return
    try {
      setLbLoading(true)
      setLbError("")
      const { data } = await baseUrl.get(`/api/leagues/${id}/leaderboard`, { params: { offset, limit }, headers: authHeader })
      const board = data?.leaderboard || []
      const league = data?.league || null
      const pagination = data?.pagination || { total: board.length, limit, offset, has_more: false }
      setLeaderboard(board)
      setLeaderboardLeague(league)
      setLbPagination({
        total: Number(pagination.total || 0),
        limit: Number(pagination.limit || limit),
        offset: Number(pagination.offset || offset),
        has_more: Boolean(pagination.has_more)
      })
    } catch (e) {
      setLbError('فشل في جلب المتصدرين')
      setLeaderboard([])
    } finally {
      setLbLoading(false)
    }
  }

  const openLeaderboard = async () => {
    await fetchLeaderboard(0, lbPagination.limit || 10)
    setShowLeaderboard(true)
  }
  const closeLeaderboard = () => setShowLeaderboard(false)
  const nextLeaderboardPage = async () => {
    const next = lbPagination.offset + lbPagination.limit
    await fetchLeaderboard(next, lbPagination.limit)
  }
  const prevLeaderboardPage = async () => {
    const prev = Math.max(0, lbPagination.offset - lbPagination.limit)
    await fetchLeaderboard(prev, lbPagination.limit)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/leagues" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {tournament.name}
                </h1>
                <div className="flex items-center space-x-4 space-x-reverse mt-1">
                  <span className="text-sm text-slate-500">{tournament.grade_name}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {tournament.matches_count} مباراة
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(isAdmin || student) && (
                <button
                  onClick={openLeaderboard}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  عرض متصدرين الدوري
                </button>
              )}
              {isAdmin && (
              <>
                <button
                  onClick={openStudentsModal}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  الطلاب المشتركين
                </button>
              <button
                onClick={() => setIsCreateMatchOpen(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">إنشاء مباراة جديدة</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
              </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLeaderboard && (
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200 to-yellow-300 blur-3xl opacity-50 animate-pulse"></div>
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200 to-red-300 blur-3xl opacity-40 animate-pulse"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold">لوحة المتصدرين</h3>
                <p className="text-white/85 text-sm mt-1">{leaderboardLeague ? leaderboardLeague.name : tournament?.name}</p>
              </div>
              <button onClick={closeLeaderboard} className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30">عودة</button>
            </div>
            <div className="p-6">
              {lbError && <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{lbError}</div>}
              {lbLoading ? (
                <div className="py-10 text-center">جارِ تحميل المتصدرين...</div>
              ) : leaderboard.length === 0 ? (
                <div className="py-10 text-center text-slate-600">لا يوجد بيانات للمتصدرين بعد</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {leaderboard.map((row) => (
                    <div key={`${row.rank}-${row.student_id}`} className="relative bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center text-xl font-extrabold">{row.rank}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-slate-900 font-bold">{row.student_name}</h4>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{row.submissions_count} محاولات</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-slate-700">
                          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          <span className="font-semibold">{row.total_score} نقطة</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-200/70 flex items-center justify-between">
              <div className="text-sm text-slate-600">الإجمالي: {lbPagination.total}</div>
              <div className="flex items-center gap-2">
                <button onClick={prevLeaderboardPage} disabled={lbPagination.offset === 0 || lbLoading} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-50 hover:bg-white">السابق</button>
                <button onClick={nextLeaderboardPage} disabled={!lbPagination.has_more || lbLoading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white disabled:opacity-50">التالي</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!showLeaderboard && (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tournament Details Card */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Tournament Image */}
          <div className="relative  overflow-hidden">
            {tournament.image_url ? (
              <img src={tournament.image_url} alt={tournament.name} className="w-full h-[400px] object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              {tournament.price == null ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/90 text-white backdrop-blur-sm">
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  مجاني
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500/90 text-white backdrop-blur-sm">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {formatPrice(tournament.price)}
                </span>
              )}
            </div>

            {/* Status Badges (only if provided by API) */}
            <div className="absolute top-4 left-4 space-y-2">
              {typeof tournament.is_visible !== 'undefined' && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                tournament.is_visible ? 'bg-blue-500/90 text-white' : 'bg-gray-500/90 text-white'
              }`}>
                {tournament.is_visible ? 'ظاهر' : 'مخفي'}
              </span>
              )}
              {typeof tournament.is_subscribed !== 'undefined' && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                  tournament.is_subscribed ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'
                }`}>
                  {tournament.is_subscribed ? 'مشترك' : 'غير مشترك'}
                </span>
              )}
            </div>
          </div>

          {/* Tournament Info */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-50/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">{tournament.matches_count}</div>
                <div className="text-sm text-slate-500">مباراة</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4 text-center">
                <div className="text-sm text-slate-500 mb-1">الفترة</div>
                <div className="text-base font-semibold text-slate-800">{formatDate(tournament.start_date)} → {formatDate(tournament.end_date)}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">{tournament.grade_name}</div>
                <div className="text-sm text-slate-500">الصف الدراسي</div>
              </div>
            </div>

            {tournament.description && (
              <div className="bg-slate-50/50 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">الوصف</h3>
                <p className="text-slate-600 leading-relaxed">{tournament.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Students Modal (Admin) */}
        {isAdmin && isStudentsOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[100px]">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
              onClick={closeStudentsModal}
            />
            <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-3xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">الطلاب المشتركين ({students.length})</h3>
                <button onClick={closeStudentsModal} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Content */}
              <div className="p-6">
                {/* Delete confirmation inline modal */}
                {studentToDelete && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-red-700 font-semibold mb-1">تأكيد حذف اشتراك الطالب</h4>
                        <p className="text-red-600 text-sm">سيتم حذف اشتراك <span className="font-bold">{studentToDelete.student_name}</span> ولن يتمكن من الوصول للدوري.</p>
                      </div>
                      <button onClick={() => setStudentToDelete(null)} className="w-8 h-8 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-100">×</button>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <button onClick={() => setStudentToDelete(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white">إلغاء</button>
                      <button
                        onClick={() => studentToDelete && handleDeleteStudent(studentToDelete.student_id)}
                        disabled={deletingStudentId === studentToDelete?.student_id}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingStudentId === studentToDelete?.student_id ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
                      </button>
                    </div>
                  </div>
                )}
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="mr-3 text-slate-600">جارِ تحميل الطلاب...</span>
                  </div>
                ) : studentsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{studentsError}</div>
                ) : students.length === 0 ? (
                  <div className="text-center text-slate-600">لا يوجد طلاب مشتركين بعد</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الاسم</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">البريد الإلكتروني</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الصف</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">تاريخ الاشتراك</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((s) => (
                          <tr key={s.subscription_id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-800">{s.student_name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{s.student_email}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{s.grade_name || `الصف ${s.grade_id}`}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(s.joined_at)}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <button
                                onClick={() => setStudentToDelete(s)}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-md"
                                title="حذف الطالب"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200/50 flex items-center justify-end">
                <button onClick={closeStudentsModal} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white">إغلاق</button>
              </div>
            </div>
          </div>
        )}

        {/* Matches Section */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/60">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <svg className="w-6 h-6 ml-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              المباريات ({matches?.length || 0})
            </h2>
          </div>

          <div className="p-8">
            {matchesLoading ? (
              <div className="text-center py-12">جارِ تحميل المباريات...</div>
            ) : matchesError ? (
              <div className="text-center py-12 text-red-600">{matchesError}</div>
            ) : !matches || matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد مباريات حالياً</h3>
                <p className="text-slate-500 mb-6">ابدأ بإنشاء أول مباراة في هذا الدوري</p>
                {isAdmin && (
                  <button
                    onClick={() => setIsCreateMatchOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إنشاء مباراة الآن
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match, index) => (
                  <div 
                    key={match.id} 
                    className="group bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Match Image */}
                    <div className="relative h-32 overflow-hidden">
                      {match.image_url ? (
                        <img src={match.image_url} alt={match.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Visibility Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                          match.is_visible ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                        }`}>
                          {match.is_visible ? 'ظاهر' : 'مخفي'}
                        </span>
                      </div>
                    </div>

                    {/* Match Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
                        {match.name}
                      </h3>
                      
                      {match.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {match.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {(() => {
                            try {
                              const now = new Date()
                              const start = match.start_date && match.start_time ? new Date(`${match.start_date}T${match.start_time}:00`) : null
                              const end = match.start_date && match.end_time ? new Date(`${match.start_date}T${match.end_time}:00`) : null
                              const available = start && end ? (now >= start && now <= end) : false
                              return (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${available ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                  {available ? 'متاحة الآن' : 'غير متاحة'}
                                </span>
                              )
                            } catch {
                              return null
                            }
                          })()}
                          {(match.start_time && match.end_time) && (
                            <span className="text-[11px] text-slate-500">{match.start_time} → {match.end_time}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditMatch(match)}
                                className="p-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                title="تعديل"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleToggleMatchVisibility(match.id)}
                                className={`p-2 rounded-lg hover:bg-slate-100 ${match.is_visible ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-50'}`}
                                title={match.is_visible ? 'إخفاء' : 'إظهار'}
                              >
                                {match.is_visible ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.07.41-2.07 1.125-2.925M6.223 6.223A9.956 9.956 0 0112 5c5 0 9 4 9 7 0 1.137-.41 2.2-1.123 3.063M3 3l18 18" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => setMatchToDelete(match)}
                                className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                title="حذف"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <Link to={`/matche/${match.id}`}>
                                <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
                                  عرض المباراة
                                </button>
                              </Link>
                            </>
                          )}
                          {(!isAdmin) && (
                            (() => {
                              const availableNow = isMatchAvailableNow(match)
                              return (
                                <Link to={`/matche/${match.id}`}>
                                  <button
                                    className={
                                      availableNow
                                        ? "px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                        : "px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium cursor-not-allowed"
                                    }
                                    disabled={!availableNow}
                                  >
                                    {availableNow ? 'بدء المباراة' : 'غير متاحة'}
                                  </button>
                                </Link>
                              )
                            })()
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[100px]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeLeaderboard} />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-3xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">متصدرين الدوري</h3>
                <p className="text-white/80 text-sm mt-1">{leaderboardLeague ? leaderboardLeague.name : tournament?.name}</p>
              </div>
              <button onClick={closeLeaderboard} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {lbError && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{lbError}</div>
              )}
              {lbLoading ? (
                <div className="py-8 text-center">جارِ تحميل المتصدرين...</div>
              ) : leaderboard.length === 0 ? (
                <div className="py-8 text-center text-slate-600">لا يوجد بيانات للمتصدرين بعد</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الترتيب</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الطالب</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">النقاط</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">محاولات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboard.map((row) => (
                        <tr key={`${row.rank}-${row.student_id}`} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-sm font-bold text-slate-800">#{row.rank}</td>
                          <td className="px-4 py-2 text-sm text-slate-700">{row.student_name}</td>
                          <td className="px-4 py-2 text-sm text-slate-700">{row.total_score}</td>
                          <td className="px-4 py-2 text-sm text-slate-700">{row.submissions_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200/50 flex items-center justify-between">
              <div className="text-sm text-slate-500">الإجمالي: {lbPagination.total}</div>
              <div className="flex items-center gap-2">
                <button onClick={prevLeaderboardPage} disabled={lbPagination.offset === 0 || lbLoading} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50">السابق</button>
                <button onClick={nextLeaderboardPage} disabled={!lbPagination.has_more || lbLoading} className="px-4 py-2 rounded-lg bg-amber-500 text-white disabled:opacity-50">التالي</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Match Modal */}
      {isCreateMatchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[100px]">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => { setIsCreateMatchOpen(false); resetMatchForm() }} 
          />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-2xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">إنشاء مباراة جديدة</h3>
                    <p className="text-white/80 text-sm mt-1">أضف مباراة جديدة للدوري</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsCreateMatchOpen(false); resetMatchForm() }} 
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6">
              <form onSubmit={handleCreateMatch} className="space-y-6">
                {/* Match Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      اسم المباراة
                    </span>
                  </label>
                  <input 
                    value={matchName} 
                    onChange={(e) => setMatchName(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm" 
                    placeholder="مثال: المرحلة الأولى" 
                    required 
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      الوصف (اختياري)
                    </span>
                  </label>
                  <textarea 
                    value={matchDescription} 
                    onChange={(e) => setMatchDescription(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm resize-none" 
                    rows={3} 
                    placeholder="وصف المباراة وأهدافها..."
                  />
                </div>

                {/* Date & Time + Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m4 4H4m0 0v8a2 2 0 002 2h12a2 2 0 002-2v-8M4 11h16" />
                        </svg>
                        تاريخ البداية
                      </span>
                    </label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                        </svg>
                        وقت البداية
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select 
                        value={getTimeParts(startTime).hour}
                        onChange={(e) => setStartTimeFromParts(e.target.value, null)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        required
                      >
                        <option value="">الساعة</option>
                        {hoursOptions.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <select 
                        value={getTimeParts(startTime).minute}
                        onChange={(e) => setStartTimeFromParts(null, e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        required
                      >
                        <option value="">الدقيقة</option>
                        {minutesOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    {startTime && (
                      <div className="text-xs text-slate-500 mt-1">الوقت: {startTime}</div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                        </svg>
                        وقت النهاية
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select 
                        value={getTimeParts(endTime).hour}
                        onChange={(e) => setEndTimeFromParts(e.target.value, null)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        required
                      >
                        <option value="">الساعة</option>
                        {hoursOptions.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <select 
                        value={getTimeParts(endTime).minute}
                        onChange={(e) => setEndTimeFromParts(null, e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        required
                      >
                        <option value="">الدقيقة</option>
                        {minutesOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    {endTime && (
                      <div className="text-xs text-slate-500 mt-1">الوقت: {endTime}</div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        حالة الظهور
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-white/50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isVisible} 
                        onChange={(e) => setIsVisible(e.target.checked)} 
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">ظاهر للطلاب</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      صورة المباراة (اختياري)
                    </span>
                  </label>
                  <div className="relative">
                    <input 
                      ref={matchImageInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setMatchImageFile(file)
                        if (file) {
                          const url = URL.createObjectURL(file)
                          setMatchImagePreview(url)
                        } else {
                          setMatchImagePreview("")
                        }
                      }} 
                      className="w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  {(matchImagePreview || (isEditMatch && editingMatch?.image_url)) && (
                    <div className="mt-3">
                      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50">
                        <img src={matchImagePreview || editingMatch?.image_url} alt="preview" className="w-full max-h-56 object-cover" />
                      </div>
                      {matchImagePreview && (
                        <div className="mt-3 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => { setMatchImageFile(null); setMatchImagePreview(""); try { if (matchImageInputRef?.current) matchImageInputRef.current.value = "" } catch {} }}
                            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
                          >
                            إزالة الصورة
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Messages */}
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 ml-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 text-sm">{createError}</span>
                    </div>
                  </div>
                )}
                {createMsg && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 ml-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-700 text-sm">{createMsg}</span>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-200/50">
              <div className="flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => { setIsCreateMatchOpen(false); resetMatchForm() }} 
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  onClick={handleCreateMatch}
                  disabled={creating} 
                  className="group relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>جارٍ الإنشاء...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>إنشاء المباراة</span>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[100px]">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setMatchToDelete(null)} 
          />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-md rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 text-white">
              <h3 className="text-xl font-bold">تأكيد حذف المباراة</h3>
              <p className="text-white/80 text-sm mt-1">سيتم حذف "{matchToDelete?.name}" نهائياً</p>
            </div>
            <div className="px-6 py-6">
              <p className="text-slate-700 text-sm">هذا الإجراء لا يمكن التراجع عنه.</p>
            </div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200/50 flex items-center justify-end gap-3">
              <button onClick={() => setMatchToDelete(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white">إلغاء</button>
              <button onClick={confirmDeleteMatch} disabled={deletingMatch} className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {deletingMatch ? 'جارٍ الحذف...' : 'حذف نهائي'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ScrollToTop/>
    </div>
  )
}

export default League


















