import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherLayout from '../../components/teacher/TeacherLayout'
import { mockTestService } from '../../service/testService/mockTestService'

function TeacherDashboard({ onNavigate }) {
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  const fetchTests = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await mockTestService.getMockTests()
      setTests(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleDelete = async (testId) => {
    if (!testId) return
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bài test này?')
    if (!confirmed) return

    try {
      await mockTestService.deleteMockTest(testId)
      setActionMessage('Đã xóa bài test thành công.')
      fetchTests()
    } catch (err) {
      setActionMessage(err.message || 'Không thể xóa bài test.')
    }
  }

  const handleCreate = () => {
    navigate('/lessons')
  }

  const handleEdit = (testId) => {
    navigate(`/teacher-test-update?testId=${testId}`)
  }

  return (
    <TeacherLayout onNavigate={onNavigate}>
      <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">Quản lý Test</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">Danh sách mock tests</h2>
            <p className="text-gray-500 mt-1">Theo dõi, cập nhật và xóa các bài kiểm tra của bạn.</p>
          </div>
          <button
            type="button"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
            onClick={handleCreate}
          >
            + Thêm bài test
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-sm">
          Thêm bài test mới trực tiếp tại trang Lesson bằng cách mở giáo án cụ thể và chọn &quot;+ Thêm bài
          test&quot; trong phần chi tiết.
        </div>

        {actionMessage && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl text-sm">
            {actionMessage}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-6">Đang tải danh sách bài test...</div>
        )}

        {error && (
          <div className="text-center text-red-500 py-6">
            Không thể tải dữ liệu. {error.message || 'Vui lòng thử lại sau.'}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên bài test</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Thời lượng</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tổng điểm</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{test.name}</p>
                      <p className="text-xs text-gray-500">ID: {test.id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {test.createdDate ? new Date(test.createdDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{Math.round((test.durationSeconds || 0) / 60)} phút</td>
                    <td className="px-4 py-3 text-gray-600">{test.totalPoint || 0}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition"
                        onClick={() => handleEdit(test.id)}
                      >
                        Cập nhật
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                        onClick={() => handleDelete(test.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {!tests.length && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-6">
                      Chưa có bài test nào. Hãy tạo bài test mới.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}

export default TeacherDashboard
