function TeacherSidebar({ activeSection = 'tests', onNavigateSection }) {
  const sections = [
    { id: 'lessons', label: 'Quản lý Lesson', disabled: true },
    { id: 'tests', label: 'Quản lý Test', disabled: false },
  ]

  return (
    <aside className="bg-white rounded-3xl shadow-lg border border-blue-50 p-6 space-y-4">
      <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Bảng điều khiển</p>
      <div className="space-y-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection
          return (
            <button
              key={section.id}
              type="button"
              disabled={section.disabled}
              onClick={() => onNavigateSection && onNavigateSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl font-semibold border transition ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
              } ${section.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {section.label}
              {section.disabled && <span className="text-xs ml-2">(sắp ra mắt)</span>}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default TeacherSidebar

