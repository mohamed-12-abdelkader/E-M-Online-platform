import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import baseUrl from '../../api/baseUrl'
import UserType from '../../Hooks/auth/userType'
import ScrollToTop from '../../components/scollToTop/ScrollToTop'

const Match = () => {
  const { id } = useParams()
  const [userData, isAdmin] = UserType()
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Questions state
  const [questions, setQuestions] = useState([])
  const [qLoading, setQLoading] = useState(false)
  const [qError, setQError] = useState('')
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [creatingBulk, setCreatingBulk] = useState(false)
  const [showSingleForm, setShowSingleForm] = useState(false)
  const [singleDraft, setSingleDraft] = useState({ text: '', option_a: '', option_b: '', option_c: '', option_d: '' })
  const [creatingSingle, setCreatingSingle] = useState(false)
  const [editing, setEditing] = useState(null) // { id, text, option_a.. }
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)
  const [settingCorrectId, setSettingCorrectId] = useState(null)
  const [studentIndex, setStudentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [questionId]: 'A'|'B'|'C'|'D' }
  const [submittingSolve, setSubmittingSolve] = useState(false)
  const [solveError, setSolveError] = useState('')
  const [resultData, setResultData] = useState(null)
  const [resultLoading, setResultLoading] = useState(false)
  const [resultError, setResultError] = useState('')

  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }), [])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return dateStr }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    } catch { return dateStr }
  }

  const buildDateFromParts = (date, time) => {
    if (!date || !time) return null
    try { return new Date(`${date}T${time}:00`) } catch { return null }
  }

  const isAvailableNow = (m) => {
    if (!m) return false
    if (m.is_ended) return false
    const start = buildDateFromParts(m.start_date, m.start_time)
    const end = buildDateFromParts(m.start_date, m.end_time)
    if (!start || !end) return false
    const now = new Date()
    return now >= start && now <= end
  }

  const fetchMatch = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError('')
      const { data } = await baseUrl.get(`/api/leagues/matches/${id}`, { headers: authHeader })
      setMatchData(data?.data ?? data)
    } catch (e) {
      setError('فشل في جلب تفاصيل المباراة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMatch() }, [id, authHeader])

  const fetchQuestions = async () => {
    if (!id) return
    try {
      setQLoading(true)
      setQError('')
      const { data } = await baseUrl.get(`/api/leagues/matches/${id}/questions`, { headers: authHeader })
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      setQuestions(list)
    } catch {
      setQError('فشل في جلب أسئلة المباراة')
    } finally {
      setQLoading(false)
    }
  }

  useEffect(() => { fetchQuestions() }, [id, authHeader])
  useEffect(() => {
    setStudentIndex((prev) => {
      if (!Array.isArray(questions) || questions.length === 0) return 0
      return Math.min(prev, Math.max(0, questions.length - 1))
    })
  }, [questions])

  const handleSelectOption = (questionId, letter) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: letter }))
  }

  const handleSubmitAnswers = async () => {
    try {
      setSolveError('')
      setSubmittingSolve(true)
      const answers = questions
        .filter(q => selectedAnswers[q.id])
        .map(q => ({ question_id: q.id, selected_answer: selectedAnswers[q.id] }))
      if (answers.length === 0) {
        setSolveError('اختر إجابة واحدة على الأقل')
        setSubmittingSolve(false)
        return
      }
      await baseUrl.post(`/api/leagues/matches/${id}/solve`, { answers }, { headers: { ...authHeader, 'Content-Type': 'application/json' } })
      await fetchStudentResult()
    } catch {
      setSolveError('تعذر إرسال الإجابات')
    } finally {
      setSubmittingSolve(false)
    }
  }

  const fetchStudentResult = async () => {
    try {
      setResultLoading(true)
      setResultError('')
      const { data } = await baseUrl.get(`/api/leagues/matches/${id}/student-result`, { headers: authHeader })
      setResultData(data?.data ?? data)
    } catch {
      setResultError('تعذر جلب نتيجة الطالب')
    } finally {
      setResultLoading(false)
    }
  }

  const handleCreateBulk = async () => {
    if (!bulkText.trim()) return
    try {
      setCreatingBulk(true)
      const body = { text: bulkText }
      const { data } = await baseUrl.post(`/api/leagues/matches/${id}/questions/bulk`, body, { headers: { ...authHeader, 'Content-Type': 'application/json' } })
      const created = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      setQuestions(prev => [...created, ...prev])
      setBulkText('')
      setShowBulkForm(false)
    } catch {
      setQError('تعذر إضافة الأسئلة بالنص الحر')
    } finally {
      setCreatingBulk(false)
    }
  }

  const handleCreateSingle = async () => {
    if (!singleDraft.text.trim()) return
    try {
      setCreatingSingle(true)
      const { data } = await baseUrl.post(`/api/leagues/matches/${id}/questions`, singleDraft, { headers: { ...authHeader, 'Content-Type': 'application/json' } })
      const created = data?.data ?? data
      setQuestions(prev => [created, ...prev])
      setSingleDraft({ text: '', option_a: '', option_b: '', option_c: '', option_d: '' })
      setShowSingleForm(false)
    } catch {
      setQError('تعذر إضافة السؤال')
    } finally {
      setCreatingSingle(false)
    }
  }

  const startEdit = (q) => {
    setEditing({ id: q.id, text: q.text || '', option_a: q.option_a || q.options?.[0] || '', option_b: q.option_b || q.options?.[1] || '', option_c: q.option_c || q.options?.[2] || '', option_d: q.option_d || q.options?.[3] || '' })
  }

  const saveEdit = async () => {
    if (!editing) return
    try {
      setSavingEdit(true)
      const { id: qid, ...payload } = editing
      const { data } = await baseUrl.put(`/api/leagues/questions/${qid}`, payload, { headers: { ...authHeader, 'Content-Type': 'application/json' } })
      const updated = data?.data ?? data
      setQuestions(prev => prev.map(q => q.id === qid ? { ...q, ...updated } : q))
      setEditing(null)
    } catch {
      setQError('تعذر حفظ التعديلات')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!deletingId) return
    try {
      setDeleting(true)
      await baseUrl.delete(`/api/leagues/questions/${deletingId}`, { headers: authHeader })
      setQuestions(prev => prev.filter(q => q.id !== deletingId))
      setDeletingId(null)
    } catch {
      setQError('تعذر حذف السؤال')
    } finally {
      setDeleting(false)
    }
  }

  const handleUploadImage = async (qid, file) => {
    if (!file) return
    try {
      setUploadingId(qid)
      const form = new FormData()
      form.append('image', file)
      const { data } = await baseUrl.post(`/api/leagues/questions/${qid}/image`, form, { headers: { ...authHeader, 'Content-Type': 'multipart/form-data' } })
      const updated = data?.data ?? data
      setQuestions(prev => prev.map(q => q.id === qid ? { ...q, ...updated } : q))
    } catch {
      setQError('تعذر رفع الصورة')
    } finally {
      setUploadingId(null)
    }
  }

  const handleSetCorrect = async (qid, letter) => {
    try {
      setSettingCorrectId(qid)
      const body = { correct_answer: letter }
      const { data } = await baseUrl.post(`/api/leagues/questions/${qid}/correct-answer`, body, { headers: { ...authHeader, 'Content-Type': 'application/json' } })
      const updated = data?.data ?? data
      setQuestions(prev => prev.map(q => q.id === qid ? { ...q, ...updated } : q))
    } catch {
      setQError('تعذر تحديد الإجابة الصحيحة')
    } finally {
      setSettingCorrectId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-lg text-slate-600">جارِ تحميل تفاصيل المباراة...</span>
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

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">المباراة غير موجودة</h3>
          <Link to="/leagues" className="text-indigo-600 hover:text-indigo-700">العودة للدوريات</Link>
        </div>
      </div>
    )
  }

  const available = isAvailableNow(matchData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to={`/league/${matchData.league_id}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="عودة للدوري">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{matchData.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${available ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {available ? 'متاحة الآن' : 'غير متاحة'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${matchData.is_visible ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                    {matchData.is_visible ? 'ظاهرة للطلاب' : 'مخفية'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          {/* Image Section */}
          <div className="relative h-[260px] md:h-[360px] overflow-hidden">
            {matchData.image_url ? (
              <img src={matchData.image_url} alt={matchData.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <svg className="w-14 h-14 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 space-y-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${available ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                {available ? 'متاحة الآن' : 'غير متاحة'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${matchData.is_visible ? 'bg-blue-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                {matchData.is_visible ? 'ظاهرة' : 'مخفية'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {matchData.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">الوصف</h3>
                <p className="text-slate-600 leading-relaxed">{matchData.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50/80 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">تاريخ المباراة</div>
                <div className="text-base font-semibold text-slate-800">{formatDate(matchData.start_date)}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">الوقت</div>
                <div className="text-base font-semibold text-slate-800">{matchData.start_time} → {matchData.end_time}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">الحالة</div>
                <div className="text-base font-semibold text-slate-800">{matchData.is_ended ? 'منتهية' : (available ? 'متاحة الآن' : 'غير متاحة')}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50/60 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">أُنشئت في</div>
                <div className="text-sm text-slate-700">{formatDateTime(matchData.created_at)}</div>
              </div>
              <div className="bg-slate-50/60 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">آخر تحديث</div>
                <div className="text-sm text-slate-700">{formatDateTime(matchData.updated_at)}</div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Link to={`/league/${matchData.league_id}`} className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white">
                العودة للدوري
              </Link>
              {available && matchData.is_visible && !matchData.is_ended && (
                <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  ابدأ الآن
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">أسئلة المباراة ({questions.length})</h2>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowBulkForm(v => !v)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">إضافة نص حر</button>
                <button onClick={() => setShowSingleForm(v => !v)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">إضافة سؤال</button>
              </div>
            )}
          </div>
          <div className="p-6">
            {qError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{qError}</div>
            )}

            {qLoading ? (
              <div className="text-center py-8">جارِ تحميل الأسئلة...</div>
            ) : questions.length === 0 ? (
              <div className="text-center text-slate-600">لا توجد أسئلة حتى الآن</div>
            ) : isAdmin ? (
              <>
                {showBulkForm && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">أدخل النص (سطر للسؤال، والأسطر التالية للاختيارات A-D)</label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={6}
                      placeholder={"السؤال الأول؟\nA) الخيار الأول\nB) الخيار الثاني\nC) الخيار الثالث\nD) الخيار الرابع\n\nالسؤال الثاني؟\nA) الخيار الأول\nB) الخيار الثاني\nC) الخيار الثالث\nD) الخيار الرابع"}
                    />
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button onClick={() => setShowBulkForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700">إلغاء</button>
                      <button onClick={handleCreateBulk} disabled={creatingBulk} className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                        {creatingBulk ? 'جارٍ الإضافة...' : 'إضافة'}
                      </button>
                    </div>
                  </div>
                )}

                {showSingleForm && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">نص السؤال</label>
                      <textarea
                        value={singleDraft.text}
                        onChange={(e) => setSingleDraft(prev => ({ ...prev, text: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={3}
                        placeholder="اكتب نص السؤال هنا"
                      />
                    </div>
                    {(['option_a','option_b','option_c','option_d']).map((key, i) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">خيار {String.fromCharCode(65 + i)}</label>
                        <input
                          value={singleDraft[key]}
                          onChange={(e) => setSingleDraft(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder={`اكتب خيار ${String.fromCharCode(65 + i)}`}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                      <button onClick={() => setShowSingleForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700">إلغاء</button>
                      <button onClick={handleCreateSingle} disabled={creatingSingle} className="px-5 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">{creatingSingle ? 'جارٍ الإضافة...' : 'إضافة السؤال'}</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {questions.map((q) => {
                    const options = [q.option_a ?? q.options?.[0], q.option_b ?? q.options?.[1], q.option_c ?? q.options?.[2], q.option_d ?? q.options?.[3]]
                    return (
                      <div key={q.id} className="bg-white/60 border border-slate-200 rounded-xl p-4">
                        {editing?.id === q.id ? (
                          <div className="space-y-3">
                            <textarea value={editing.text} onChange={(e) => setEditing(prev => ({ ...prev, text: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} />
                            {(['option_a','option_b','option_c','option_d']).map((k, idx) => (
                              <div key={k} className="grid grid-cols-[36px_1fr] items-center gap-2">
                                <div className="text-sm font-semibold text-slate-600">{String.fromCharCode(65+idx)})</div>
                                <input value={editing[k]} onChange={(e) => setEditing(prev => ({ ...prev, [k]: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                              </div>
                            ))}
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700">إلغاء</button>
                              <button onClick={saveEdit} disabled={savingEdit} className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">{savingEdit ? 'جارٍ الحفظ...' : 'حفظ'}</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-slate-800 font-medium mb-2 whitespace-pre-wrap">{q.text}</p>
                                <div className="space-y-2">
                                  {options.map((opt, idx) => (
                                    <div key={idx} className={`px-3 py-2 rounded-lg border text-sm ${isAdmin && q.correct_answer && q.correct_answer === String.fromCharCode(65+idx) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                      <span className="font-semibold mr-2">{String.fromCharCode(65+idx)})</span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                                {q.image && (
                                  <div className="mt-3">
                                    <img src={q.image} alt="question" className="max-h-48 rounded-lg border border-slate-200" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <button onClick={() => startEdit(q)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100">تعديل</button>
                                <button onClick={() => setDeletingId(q.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100">حذف</button>
                                <label className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 cursor-pointer">
                                  رفع صورة
                                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(q.id, f); e.target.value=''; }} style={{ display: 'none' }} />
                                </label>
                                <div className="mt-1 text-xs text-slate-500">الإجابة الصحيحة</div>
                                <div className="grid grid-cols-4 gap-1">
                                  {['A','B','C','D'].map(letter => (
                                    <button key={letter} onClick={() => handleSetCorrect(q.id, letter)} disabled={settingCorrectId===q.id} className={`px-2 py-1 rounded-md text-xs ${q.correct_answer === letter ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{letter}</button>
                                  ))}
                                  <button onClick={() => handleSetCorrect(q.id, null)} disabled={settingCorrectId===q.id} className="px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-600">مسح</button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              // Student view: one-by-one with pagination and selectable answers
              <div className="max-w-3xl mx-auto space-y-4">
                {resultLoading ? (
                  <div className="text-center py-8">جارِ تحميل النتيجة...</div>
                ) : resultData ? (
                  <div className="bg-white/70 border border-slate-200 rounded-2xl shadow p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">نتيجة المباراة</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-sm text-slate-500">النقاط</div>
                        <div className="text-lg font-semibold text-slate-800">{resultData.score}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-sm text-slate-500">عدد الأسئلة</div>
                        <div className="text-lg font-semibold text-slate-800">{resultData.total_questions}</div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                        <div className="text-sm text-emerald-700">إجابات صحيحة</div>
                        <div className="text-lg font-semibold text-emerald-800">{resultData.correct_answers}</div>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
                        <div className="text-sm text-red-700">إجابات خاطئة</div>
                        <div className="text-lg font-semibold text-red-800">{resultData.wrong_answers}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {Array.isArray(resultData.answers) && resultData.answers.map((a) => (
                        <div key={a.question_id} className="bg-white/60 border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-slate-800">{a.question_text}</p>
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${a.is_correct ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{a.is_correct ? 'صحيح' : 'خطأ'}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(a.options || []).map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx)
                              const isSelected = a.selected_answer === letter
                              const isCorrect = a.correct_answer === letter
                              return (
                                <div key={idx} className={`px-3 py-2 rounded-lg border text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : isSelected ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                  <span className="font-semibold mr-2">{letter})</span>
                                  <span>{opt}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  (() => {
                    const answeredCount = questions.filter(qq => !!selectedAnswers[qq.id]).length
                    const total = questions.length
                    const allAnswered = total > 0 && answeredCount === total
                    const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0
                    const q = questions[studentIndex]
                    const options = [q.option_a ?? q.options?.[0], q.option_b ?? q.options?.[1], q.option_c ?? q.options?.[2], q.option_d ?? q.options?.[3]]
                    const currentSelected = selectedAnswers[q.id]
                    return (
                      <>
                        {/* Progress header (enhanced) */}
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-slate-600">تمت الإجابة</div>
                              <div className="text-base font-semibold text-slate-800">{answeredCount} من {total}</div>
                            </div>
                            <div className="relative w-14 h-14 rounded-full bg-slate-200 overflow-hidden">
                              <div className="absolute inset-0" style={{ background: `conic-gradient(#6366f1 ${progress}%, #e5e7eb ${progress}%)` }}></div>
                              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-700">{progress}%</div>
                            </div>
                          </div>
                          {/* Quick nav */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {questions.map((qq, idx) => {
                              const isCurrent = idx === studentIndex
                              const isAnswered = !!selectedAnswers[qq.id]
                              return (
                                <button key={qq.id} onClick={() => setStudentIndex(idx)} className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center ${isCurrent ? 'bg-indigo-600 text-white border-indigo-600 shadow' : isAnswered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                                  {isAnswered ? (
                                    <svg className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4A1 1 0 014.707 9.293L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                  ) : (
                                    idx + 1
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Question card (enhanced) */}
                        <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">سؤال {studentIndex + 1}</h3>
                            <span className="text-xs md:text-sm text-slate-500">{studentIndex + 1} / {total}</span>
                          </div>
                          <p className="text-slate-800 font-medium leading-relaxed mb-4 whitespace-pre-wrap">{q.text}</p>
                          {q.image && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                              <img src={q.image} alt="question" className="max-h-64 w-full object-contain bg-slate-50" />
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {options.map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx)
                              const isSelected = currentSelected === letter
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, letter)}
                                  className={`group text-right px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between hover:-translate-y-0.5 ${isSelected ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-300 shadow' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}
                                >
                                  <span className="flex items-start gap-3">
                                    <span className={`mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200'}`}>{letter}</span>
                                    <span className="leading-6">{opt}</span>
                                  </span>
                                  {isSelected ? (
                                    <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4A1 1 0 014.707 9.293L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                  ) : (
                                    <span className="w-5 h-5 rounded-full border border-slate-300"></span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                          {solveError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{solveError}</div>
                          )}
                          {/* Sticky action bar */}
                          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                            <button onClick={() => setStudentIndex((i) => Math.max(0, i - 1))} disabled={studentIndex === 0} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-50 hover:bg-white">السابق</button>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setStudentIndex((i) => Math.min(total - 1, i + 1))} disabled={studentIndex >= total - 1} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-900 disabled:opacity-50 hover:bg-slate-300">التالي</button>
                              {allAnswered && (
                                <button onClick={handleSubmitAnswers} disabled={submittingSolve} className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50">
                                  {submittingSolve ? 'جارِ الإرسال...' : 'إرسال الإجابات'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()
                )}
                {resultError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{resultError}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[100px]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 text-white">
              <h3 className="text-lg font-bold">تأكيد حذف السؤال</h3>
            </div>
            <div className="px-6 py-5 text-slate-700">هل أنت متأكد من حذف هذا السؤال؟ هذا الإجراء لا يمكن التراجع عنه.</div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200/50 flex items-center justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white">إلغاء</button>
              <button onClick={handleDeleteQuestion} disabled={deleting} className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50">
                {deleting ? 'جارٍ الحذف...' : 'حذف نهائي'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ScrollToTop/>
    </div>
  )
}

export default Match