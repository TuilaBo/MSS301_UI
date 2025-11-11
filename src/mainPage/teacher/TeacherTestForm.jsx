import { useEffect, useMemo, useState } from 'react'
import TeacherLayout from '../../components/teacher/TeacherLayout'
import { useHashParams } from '../../hooks/useHashParams'
import { mockTestService } from '../../service/testService/mockTestService'

const initialFormState = {
  name: '',
  durationMinutes: 60,
  totalPoint: 100,
  lessonPlanId: '',
  requiredTier: '',
  questionIds: '',
}

function TeacherTestForm({ onNavigate, mode = 'auto', initialTestId }) {
  const params = useHashParams()
  const hashMode = params.get('mode')
  const hashTestId = params.get('testId')

  const resolvedMode =
    mode !== 'auto'
      ? mode
      : hashMode === 'update'
        ? 'update'
        : hashMode === 'create'
          ? 'create'
          : hashTestId
            ? 'update'
            : 'create'

  const effectiveTestId = initialTestId || hashTestId
  const isEditMode = resolvedMode === 'update'

  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    const loadTest = async () => {
      if (!isEditMode || !effectiveTestId) {
        if (!isEditMode) {
          setFormData(initialFormState)
        }
        return
      }
      setLoading(true)
      setError(null)
      try {
        const detail = await mockTestService.getMockTestById(effectiveTestId)
        setFormData({
          name: detail?.name || '',
          durationMinutes: Math.max(1, Math.round((detail?.durationSeconds || 60) / 60)),
          totalPoint: detail?.totalPoint || 0,
          lessonPlanId: detail?.lessonPlanId || '',
          requiredTier: detail?.requiredTier || '',
          questionIds: Array.isArray(detail?.questions)
            ? detail.questions.map((q) => q.id).join(', ')
            : '',
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [isEditMode, effectiveTestId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const payload = useMemo(() => {
    const durationSeconds = Math.max(60, Number(formData.durationMinutes || 0) * 60)
    const lessonPlanIdNumeric = formData.lessonPlanId ? Number(formData.lessonPlanId) : null
    const questionIds = formData.questionIds
      ? formData.questionIds
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !Number.isNaN(id))
      : []

    return {
      name: formData.name,
      durationSeconds,
      totalPoint: Number(formData.totalPoint || 0),
      lessonPlanId: lessonPlanIdNumeric || null,
      requiredTier: formData.requiredTier || null,
      questionIds,
    }
  }, [formData])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isEditMode) {
        if (!effectiveTestId) {
          throw new Error('Không tìm thấy testId để cập nhật.')
        }
        await mockTestService.updateMockTest(effectiveTestId, payload)
        setSuccessMessage('Đã cập nhật bài test thành công.')
      } else {
        await mockTestService.createMockTest(payload)
        setSuccessMessage('Đã tạo bài test mới.')
        setFormData(initialFormState)
      }
      setTimeout(() => {
        window.location.hash = 'teacher-dashboard'
      }, 1000)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TeacherLayout onNavigate={onNavigate}>
      <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">
              {isEditMode ? 'Cập nhật' : 'Tạo mới'} mock test
            </p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">
              {isEditMode ? 'Chỉnh sửa bài test' : 'Thêm bài test mới'}
            </h2>
            <p className="text-gray-500 mt-1">
              Điền các thông tin cần thiết cho mock test. Các trường có dấu * là bắt buộc.
            </p>
          </div>
          <button
            type="button"
            className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:border-blue-300 hover:text-blue-600 transition"
            onClick={() => (window.location.hash = 'teacher-dashboard')}
          >
            ← Quay lại danh sách
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
            Không thể lưu bài test. {error.message || 'Vui lòng kiểm tra lại thông tin.'}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm">
            {successMessage}
          </div>
        )}

        {isEditMode && !effectiveTestId ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-sm">
            Không tìm thấy testId hợp lệ để chỉnh sửa. Vui lòng quay lại danh sách và chọn lại bài test.
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Tên bài test <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ví dụ: Kiểm tra Văn học Việt Nam"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Thời lượng (phút) <span className="text-red-500">*</span>
              </span>
              <input
                type="number"
                min="1"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="60"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Tổng điểm <span className="text-red-500">*</span>
              </span>
              <input
                type="number"
                min="0"
                name="totalPoint"
                value={formData.totalPoint}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">Lesson Plan ID</span>
              <input
                type="number"
                name="lessonPlanId"
                value={formData.lessonPlanId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập ID giáo án"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-gray-700">Tier yêu cầu</span>
              <input
                type="text"
                name="requiredTier"
                value={formData.requiredTier}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ví dụ: PREMIUM"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-gray-700">Danh sách Question IDs</span>
            <textarea
              name="questionIds"
              value={formData.questionIds}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Nhập danh sách ID câu hỏi, ví dụ: 12, 45, 46"
            />
            <span className="text-xs text-gray-500">
              Mỗi ID cách nhau bởi dấu phẩy. Để trống nếu sẽ gán câu hỏi sau.
            </span>
          </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật bài test' : 'Tạo bài test'}
            </button>
          </form>
        )}
      </div>
    </TeacherLayout>
  )
}

export default TeacherTestForm
