import React, { useCallback, useEffect, useMemo, useState } from 'react'
import baseUrl from '../../api/baseUrl'
import UserType from '../../Hooks/auth/userType'
import { Link } from 'react-router-dom'

const PlatfourmLeagues = () => {
  const [userData, isAdmin] = UserType()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createMsg, setCreateMsg] = useState("")

  const [name, setName] = useState("")
  const [gradeId, setGradeId] = useState("")
  const [seasonDuration, setSeasonDuration] = useState("")
  const [matchesCount, setMatchesCount] = useState("")
  const [description, setDescription] = useState("")
  const [isFree, setIsFree] = useState(false)
  const [price, setPrice] = useState("")
  const [imageFile, setImageFile] = useState(null)

  // Edit/Delete states
  const [editMode, setEditMode] = useState(false)
  const [editingTournament, setEditingTournament] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [grades, setGrades] = useState([])
  const [gradesLoading, setGradesLoading] = useState(false)
  const [gradesError, setGradesError] = useState("")

  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }), [])

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await baseUrl.get('/api/tournaments', { headers: authHeader })
      setTournaments(res?.data?.data || [])
    } catch (e) {
      setError('فشل في جلب الدوريات')
    } finally {
      setLoading(false)
    }
  }, [authHeader])

  const fetchGrades = useCallback(async () => {
    try {
      setGradesLoading(true)
      setGradesError("")
      const res = await baseUrl.get('/api/users/grades', { headers: authHeader })
      setGrades(res?.data?.grades || [])
    } catch (e) {
      setGradesError('تعذر جلب الصفوف الدراسية')
    } finally {
      setGradesLoading(false)
    }
  }, [authHeader])

  useEffect(() => {
    fetchTournaments()
    fetchGrades()
  }, [fetchTournaments, fetchGrades])

  const resetForm = () => {
    setName("")
    setGradeId("")
    setSeasonDuration("")
    setMatchesCount("")
    setDescription("")
    setIsFree(false)
    setPrice("")
    setImageFile(null)
    setCreateError("")
    setCreateMsg("")
    setEditMode(false)
    setEditingTournament(null)
  }

  const handleEdit = (tournament) => {
    setEditMode(true)
    setEditingTournament(tournament)
    setName(tournament.name || "")
    setGradeId(tournament.grade_id?.toString() || "")
    setSeasonDuration(tournament.season_duration?.toString() || "")
    setMatchesCount(tournament.matches_count?.toString() || "")
    setDescription(tournament.description || "")
    setIsFree(tournament.is_free || false)
    setPrice(tournament.price?.toString() || "")
    setImageFile(null)
    setIsOpen(true)
  }

  const handleUpdate = async (e) => {
    e?.preventDefault?.()
    if (!editingTournament) return
    
    try {
      setUpdating(true)
      setCreateError("")
      setCreateMsg("")
      const form = new FormData()
      if (gradeId) form.append('grade_id', Number(gradeId))
      if (seasonDuration) form.append('seasonDuration', Number(seasonDuration))
      if (name) form.append('name', name)
      if (matchesCount) form.append('matchesCount', Number(matchesCount))
      if (description) form.append('description', description)
      form.append('isFree', isFree ? 'true' : 'false')
      if (!isFree && price) form.append('price', Number(price))
      if (imageFile) form.append('image', imageFile)

      await baseUrl.put(`/api/tournaments/${editingTournament.id}`, form, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      })
      setCreateMsg('تم تحديث الدوري بنجاح')
      await fetchTournaments()
      setTimeout(() => {
        setIsOpen(false)
        resetForm()
      }, 700)
    } catch (e) {
      setCreateError('فشل تحديث الدوري. تحقق من البيانات والصلاحيات.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (tournamentId) => {
    try {
      setDeleting(true)
      await baseUrl.delete(`/api/tournaments/${tournamentId}`, { headers: authHeader })
      await fetchTournaments()
      setDeleteConfirm(null)
    } catch (e) {
      setCreateError('فشل حذف الدوري.')
    } finally {
      setDeleting(false)
    }
  }

  const handleCreate = async (e) => {
    e?.preventDefault?.()
    try {
      setCreating(true)
      setCreateError("")
      setCreateMsg("")
      const form = new FormData()
      if (gradeId) form.append('grade_id', Number(gradeId))
      if (seasonDuration) form.append('seasonDuration', Number(seasonDuration))
      if (name) form.append('name', name)
      if (matchesCount) form.append('matchesCount', Number(matchesCount))
      if (description) form.append('description', description)
      form.append('isFree', isFree ? 'true' : 'false')
      if (!isFree && price) form.append('price', Number(price))
      if (imageFile) form.append('image', imageFile)

      await baseUrl.post('/api/tournaments', form, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      })
      setCreateMsg('تم إنشاء الدوري بنجاح')
      await fetchTournaments()
      setTimeout(() => {
        setIsOpen(false)
        resetForm()
      }, 700)
    } catch (e) {
      setCreateError('فشل إنشاء الدوري. تحقق من البيانات والصلاحيات.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  الدوريات
                </h1>
                <div className="flex items-center space-x-2 space-x-reverse mt-1">
                  <span className="text-sm text-slate-500">إجمالي الدوريات:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {tournaments.length}
                  </span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsOpen(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">إنشاء دوري جديد</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-lg text-slate-600">جارِ تحميل الدوريات...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 ml-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!loading && tournaments.length === 0) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">لا توجد دوريات حالياً</h3>
            <p className="text-slate-500 mb-6">ابدأ بإنشاء أول دوري لطلابك</p>
            {isAdmin && (
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إنشاء دوري الآن
              </button>
            )}
          </div>
        )}

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tournaments.map((t, index) => (
          <div 
            key={t.id} 
            className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image Section */}
            <Link to={`/league/${t.id}`}>
          
            <div className="relative overflow-hidden">
              {t.image_url ? (
                <img src={t.image_url} alt={t.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}
              
              {/* Price Badge */}
              <div className="absolute top-3 right-3">
                {t.is_free ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white backdrop-blur-sm">
                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    مجاني
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/90 text-white backdrop-blur-sm">
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {t.price} ج.م
                  </span>
                )}
              </div>

              {/* Status Badges */}
              <div className="absolute top-3 left-3 space-y-1">
                {typeof t.is_visible !== 'undefined' && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    t.is_visible ? 'bg-blue-500/90 text-white' : 'bg-gray-500/90 text-white'
                  }`}>
                    {t.is_visible ? 'ظاهر' : 'مخفي'}
                  </span>
                )}
                {typeof t.is_subscribed !== 'undefined' && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    t.is_subscribed ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'
                  }`}>
                    {t.is_subscribed ? 'مشترك' : 'غير مشترك'}
                  </span>
                )}
              </div>
            </div>
  </Link>
            {/* Content Section */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                  {t.name}
                </h3>
              </div>
              
              {t.description && (
                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {t.description}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50/80 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-slate-800">{t.season_duration}</div>
                  <div className="text-xs text-slate-500">يوم</div>
                </div>
                <div className="bg-slate-50/80 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-slate-800">{t.matches_count}</div>
                  <div className="text-xs text-slate-500">مباراة</div>
                </div>
              </div>

              {/* Grade Badge */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {t.grade_name || `الصف ${t.grade_id}`}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {isAdmin ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(t)}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(t.id)}
                      className="py-2.5 px-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:shadow-lg">
                    عرض التفاصيل
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => { setIsOpen(false); resetForm() }} 
          />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-3xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden">
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
                    <h3 className="text-2xl font-bold">{editMode ? 'تعديل الدوري' : 'إنشاء دوري جديد'}</h3>
                    <p className="text-white/80 text-sm mt-1">{editMode ? 'تحديث بيانات الدوري' : 'أضف دوري تفاعلي للطلاب'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsOpen(false); resetForm() }} 
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
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Tournament Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      اسم الدوري
                    </span>
                  </label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm" 
                    placeholder="مثال: دوري العلوم المتقدم" 
                    required 
                  />
                </div>

                {/* Grid Layout for Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        الصف الدراسي
                      </span>
                    </label>
                    <select
                      value={gradeId}
                      onChange={(e) => setGradeId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                      required
                    >
                      <option value="" disabled>{gradesLoading ? 'جارِ التحميل...' : 'اختر الصف'}</option>
                      {gradesError && <option value="" disabled>{gradesError}</option>}
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 108 0" />
                        </svg>
                        مدة الموسم (أيام)
                      </span>
                    </label>
                    <input 
                      type="number" 
                      value={seasonDuration} 
                      onChange={(e) => setSeasonDuration(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm" 
                      placeholder="30" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        عدد المباريات (اختياري)
                      </span>
                    </label>
                    <input 
                      type="number" 
                      value={matchesCount} 
                      onChange={(e) => setMatchesCount(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm" 
                      placeholder="5" 
                    />
                  </div>
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
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm resize-none" 
                    rows={4} 
                    placeholder="وصف مفصل عن الدوري وأهدافه..."
                  />
                </div>

                {/* Pricing Section */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/50">
                  <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    التسعير
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1 space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-white/50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isFree} 
                          onChange={(e) => setIsFree(e.target.checked)} 
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-700">دوري مجاني</span>
                      </label>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        السعر (جنيه مصري)
                      </label>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="99" 
                        disabled={isFree} 
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      صورة الدوري (اختياري)
                    </span>
                  </label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                      className="w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
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
                  onClick={() => { setIsOpen(false); resetForm() }} 
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  form="create-tournament-form"
                  disabled={creating || updating} 
                  className="group relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
                  onClick={editMode ? handleUpdate : handleCreate}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {(creating || updating) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editMode ? 'جارٍ التحديث...' : 'جارٍ الإنشاء...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {editMode ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          )}
                        </svg>
                        <span>{editMode ? 'حفظ التغييرات' : 'إنشاء الدوري'}</span>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setDeleteConfirm(null)} 
          />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-md rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden">
            {/* Delete Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 text-white">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">تأكيد الحذف</h3>
                  <p className="text-white/80 text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
            </div>

            {/* Delete Modal Content */}
            <div className="px-6 py-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">هل أنت متأكد؟</h4>
                <p className="text-slate-600 mb-6">
                  سيتم حذف الدوري نهائياً مع جميع المباريات والأسئلة المرتبطة به
                </p>
              </div>
            </div>

            {/* Delete Modal Footer */}
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200/50">
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جارٍ الحذف...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>حذف نهائي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default PlatfourmLeagues