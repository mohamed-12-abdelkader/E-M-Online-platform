import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import baseUrl from '../../api/baseUrl'
import UserType from '../../Hooks/auth/userType'

const League = () => {
  const { id } = useParams()
  const [userData, isAdmin] = UserType()
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
  const [matchPoints, setMatchPoints] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const [matchImageFile, setMatchImageFile] = useState(null)

  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }), [])

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await baseUrl.get(`/api/tournaments/${id}/details`, { headers: authHeader })
      setTournament(res?.data?.data)
    } catch (e) {
      setError('فشل في جلب تفاصيل الدوري')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTournamentDetails()
    }
  }, [id, authHeader])

  const resetMatchForm = () => {
    setMatchName("")
    setMatchDescription("")
    setMatchPoints("")
    setIsVisible(true)
    setMatchImageFile(null)
    setCreateError("")
    setCreateMsg("")
  }

  const handleCreateMatch = async (e) => {
    e?.preventDefault?.()
    try {
      setCreating(true)
      setCreateError("")
      setCreateMsg("")
      
      const form = new FormData()
      form.append('name', matchName)
      if (matchDescription) form.append('description', matchDescription)
      form.append('points', Number(matchPoints))
      form.append('isVisible', isVisible ? 'true' : 'false')
      if (matchImageFile) form.append('image', matchImageFile)

      await baseUrl.post(`/api/tournaments/${id}/matches`, form, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      })
      
      setCreateMsg('تم إنشاء المباراة بنجاح')
      await fetchTournamentDetails()
      setTimeout(() => {
        setIsCreateMatchOpen(false)
        resetMatchForm()
      }, 700)
    } catch (e) {
      setCreateError('فشل إنشاء المباراة. تحقق من البيانات والصلاحيات.')
    } finally {
      setCreating(false)
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
            {isAdmin && (
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
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tournament Details Card */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Tournament Image */}
          <div className="relative h-64 overflow-hidden">
            {tournament.image_url ? (
              <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              {tournament.is_free ? (
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
                  {tournament.price} ج.م
                </span>
              )}
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 space-y-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                tournament.is_visible ? 'bg-blue-500/90 text-white' : 'bg-gray-500/90 text-white'
              }`}>
                {tournament.is_visible ? 'ظاهر' : 'مخفي'}
              </span>
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
                <div className="text-2xl font-bold text-slate-800 mb-1">{tournament.season_duration}</div>
                <div className="text-sm text-slate-500">يوم</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">{tournament.matches_count}</div>
                <div className="text-sm text-slate-500">مباراة</div>
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

        {/* Matches Section */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/60">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <svg className="w-6 h-6 ml-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              المباريات ({tournament.matches?.length || 0})
            </h2>
          </div>

          <div className="p-8">
            {!tournament.matches || tournament.matches.length === 0 ? (
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
                {tournament.matches.map((match, index) => (
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
                      
                      {/* Points Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/90 text-white backdrop-blur-sm">
                          {match.points} نقطة
                        </span>
                      </div>

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

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {match.questions?.length || 0} سؤال
                        </span>
                        <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
                          بدء المباراة
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Match Modal */}
      {isCreateMatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => { setIsCreateMatchOpen(false); resetMatchForm() }} 
          />
          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-2xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden">
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

                {/* Points and Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 ml-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        النقاط
                      </span>
                    </label>
                    <input 
                      type="number" 
                      value={matchPoints} 
                      onChange={(e) => setMatchPoints(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm" 
                      placeholder="10" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
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
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setMatchImageFile(e.target.files?.[0] || null)} 
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
    </div>
  )
}

export default League


