import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useHashParams } from '../../hooks/useHashParams'
import { useMockTestDetail } from '../../hooks/useMockTestDetail'

function TestDetail({ onNavigate }) {
  const params = useHashParams()
  const testId = params.get('testId')
  const { data: testDetail, loading, error } = useMockTestDetail(testId)

  const handleStart = () => {
    if (!testId) return
    window.location.hash = `take-test?testId=${testId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Thông tin bài thi</h1>
          <p className="text-gray-600">
            Kiểm tra chi tiết mock test được tạo từ backend. Vui lòng đảm bảo bạn đã đăng nhập để bắt đầu
            bài thi.
          </p>
        </div>

        {!testId && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 text-center text-gray-600">
            Vui lòng chọn một bài thi hợp lệ (tham số <code className="px-1 bg-gray-100 rounded">testId</code>).
          </div>
        )}

        {testId && (
          <section className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 space-y-6">
            {loading && <p className="text-gray-500">Đang tải dữ liệu bài thi...</p>}
            {error && (
              <p className="text-red-500">
                Không thể tải bài thi. {error.message || 'Vui lòng thử lại sau.'}
              </p>
            )}
            {!loading && !error && testDetail && (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">
                      Mock Test #{testDetail.id}
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900 mt-2">{testDetail.name}</h2>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                      Bài thi bao gồm {testDetail.questions?.length || 0} câu hỏi với tổng điểm{' '}
                      {testDetail.totalPoint || 0}. Yêu cầu tier:{' '}
                      <span className="font-semibold text-blue-600">
                        {testDetail.requiredTier || 'Không có'}
                      </span>
                      .
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl px-6 py-4 text-center">
                    <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Thời lượng</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {Math.round((testDetail.durationSeconds || 0) / 60)} phút
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-blue-100">Tổng điểm</p>
                    <p className="text-3xl font-bold mt-2">{testDetail.totalPoint || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-amber-100">Số câu hỏi</p>
                    <p className="text-3xl font-bold mt-2">{testDetail.questions?.length || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-emerald-100">Tier yêu cầu</p>
                    <p className="text-3xl font-bold mt-2">{testDetail.requiredTier || 'Không có'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition"
                    onClick={handleStart}
                  >
                    Bắt đầu làm bài
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition"
                    onClick={() => onNavigate && onNavigate('home')}
                  >
                    Quay lại trang chủ
                  </button>
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

export default TestDetail
