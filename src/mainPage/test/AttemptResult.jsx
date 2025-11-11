import { useMemo } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ResultQuestionCard from '../../components/takeTest/ResultQuestionCard'
import { useHashParams } from '../../hooks/useHashParams'
import { useMockAttemptResult } from '../../hooks/useMockAttemptResult'
import { useMockTestDetail } from '../../hooks/useMockTestDetail'

function AttemptResult({ onNavigate }) {
  const params = useHashParams()
  const attemptId = params.get('attemptId')

  const { data: attempt, loading, error } = useMockAttemptResult(attemptId, { skip: !attemptId })
  const { data: testDetail, loading: testLoading } = useMockTestDetail(attempt?.mockTestId, {
    skip: !attempt?.mockTestId,
  })

  const answerLookup = useMemo(() => {
    const map = {}
    attempt?.mockAnswers?.forEach((answer) => {
      if (answer.mockQuestionId) {
        map[answer.mockQuestionId] = answer
      }
    })
    return map
  }, [attempt])

  const totalPoint = testDetail?.totalPoint || attempt?.maxPoint || 0
  const gainedPoint = attempt?.attemptPoint || 0
  const percentage = totalPoint ? Math.round((gainedPoint / totalPoint) * 100) : 0

  const handleRetake = () => {
    if (!attempt?.mockTestId) return
    window.location.hash = `take-test?testId=${attempt.mockTestId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <header className="text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">Kết quả</p>
          <h1 className="text-4xl font-bold text-gray-800">Kết quả attempt</h1>
          <p className="text-gray-600">
            Thông tin chi tiết lượt làm bài và đáp án cho từng câu hỏi.
          </p>
        </header>

        {!attemptId && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 text-center text-gray-600">
            Vui lòng cung cấp <code className="px-1 bg-gray-100 rounded">attemptId</code> hợp lệ.
          </div>
        )}

        {attemptId && (
          <section className="space-y-6">
            {loading && <p className="text-center text-gray-500">Đang tải dữ liệu attempt...</p>}
            {error && (
              <p className="text-center text-red-500">
                Không thể tải attempt. {error.message || 'Vui lòng thử lại sau.'}
              </p>
            )}

            {!loading && !error && !attempt && (
              <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 text-center text-gray-600">
                Không tìm thấy dữ liệu attempt tương ứng.
              </div>
            )}

            {attempt && (
              <>
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
                      Mock Test #{attempt.mockTestId}
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {testDetail?.name || 'Đang tải tên bài thi'}
                    </h2>
                    <p className="text-sm text-gray-500">Attempt #{attempt.id}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-blue-100">Điểm số</p>
                    <p className="text-3xl font-bold mt-2">
                      {gainedPoint}/{totalPoint}
                    </p>
                    <p className="text-sm text-blue-100 mt-1">{percentage}% tổng điểm</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-emerald-100">Trạng thái</p>
                    <p className="text-2xl font-bold mt-2">{attempt.status || 'UNKNOWN'}</p>
                    <p className="text-sm text-emerald-100 mt-1">
                      Bắt đầu: {attempt.startTime ? new Date(attempt.startTime).toLocaleString() : 'N/A'}
                      <br />
                      Kết thúc: {attempt.endTime ? new Date(attempt.endTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition"
                    onClick={handleRetake}
                    disabled={!attempt?.mockTestId}
                  >
                    Làm lại bài thi
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition"
                    onClick={() => onNavigate && onNavigate('home')}
                  >
                    Về trang chủ
                  </button>
                </div>

                <div className="space-y-5">
                  {(testLoading || !testDetail) && (
                    <div className="bg-white rounded-3xl shadow border border-blue-100 p-6 text-center text-gray-500">
                      Đang tải danh sách câu hỏi...
                    </div>
                  )}

                  {testDetail?.questions?.map((question) => (
                    <ResultQuestionCard key={question.id} question={question} answerLookup={answerLookup} />
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

export default AttemptResult
