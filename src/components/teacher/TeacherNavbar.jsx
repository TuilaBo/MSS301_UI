function TeacherNavbar({ onNavigate }) {
  const userName =
    (typeof window !== 'undefined' && (localStorage.getItem('fullName') || localStorage.getItem('userName'))) ||
    'Teacher'

  return (
    <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow">
            NG
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Ngữ văn</p>
            <h1 className="text-lg font-bold text-gray-800">Teacher Console</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden sm:inline-flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
            onClick={() => onNavigate && onNavigate('home')}
          >
            Về trang chính
          </button>
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold flex items-center justify-center uppercase">
              {userName?.charAt(0) || 'T'}
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Teacher</p>
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">{userName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TeacherNavbar

