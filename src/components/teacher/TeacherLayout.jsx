import TeacherNavbar from './TeacherNavbar'
import TeacherSidebar from './TeacherSidebar'

function TeacherLayout({ onNavigate, children, activeSection = 'tests', onSectionChange }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <TeacherNavbar onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TeacherSidebar activeSection={activeSection} onNavigateSection={onSectionChange} />
        </div>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  )
}

export default TeacherLayout

