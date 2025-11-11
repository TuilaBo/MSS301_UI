import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useLessonTests } from '../../hooks/useLessonTests'

function LessonTestList({ onNavigate }) {
  const [searchParams] = useSearchParams()
  const lessonId = searchParams.get('lessonId')
  const navigate = useNavigate()
  const { tests, loading, error } = useLessonTests(lessonId, { skip: !lessonId })

  const handleSelectTest = (testId) => {
    if (!testId) return
    navigate(`/test-detail?testId=${testId}`)
  }

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('home')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <header className="text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">Mock Tests</p>
          <h1 className="text-4xl font-bold text-gray-800">Danh sách bài thi theo Lesson</h1>
          <p className="text-gray-600">
            Chọn một lessonId để xem tất cả mock test liên quan và chuyển đến trang chi tiết để bắt đầu làm bài.
          </p>
        </header>

        {!lessonId && (
          <section className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 text-center text-gray-600">
            Vui lòng truyền <code className="px-1 bg-gray-100 rounded">lessonId</code> trong URL. Ví dụ:{' '}
            <span className="font-semibold text-blue-600">#lesson-tests?lessonId=10</span>
          </section>
        )}

        {lessonId && (
          <section className="space-y-6">
            {loading && (
              <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 text-center text-gray-600">
                Đang tải danh sách bài thi...
              </div>
            )}

            {error && (
              <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 text-center text-red-600">
                Không thể tải mock tests. {error.message || 'Vui lòng thử lại sau.'}
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-left">
                    <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">
                      Lesson #{lessonId}
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">Mock tests phù hợp</h2>
                  </div>
                  <button
                    type="button"
                    className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 font-semibold hover:border-blue-300 hover:text-blue-600 transition"
                    onClick={handleGoHome}
                  >
                    Quay về trang chủ
                  </button>
                </div>

                {tests.length === 0 && (
                  <div className="bg-white rounded-3xl shadow border border-gray-100 p-8 text-center text-gray-500">
                    Không có mock test nào cho lesson này.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tests.map((test) => (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => handleSelectTest(test.id)}
                      className="text-left bg-white rounded-3xl border border-blue-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
                            Mock Test #{test.id}
                          </p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-2">{test.name}</h3>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1">
                          {Math.round((test.durationSeconds || 0) / 60)} phút
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-3">
                        Tổng điểm: <span className="font-semibold text-gray-800">{test.totalPoint || 0}</span>
                        . Yêu cầu tier:{' '}
                        <span className="font-semibold text-blue-600">{test.requiredTier || 'Không có'}</span>.
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{test.questions?.length || 0} câu hỏi</span>
                        <span className="font-semibold text-blue-600">Xem chi tiết →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default LessonTestList

