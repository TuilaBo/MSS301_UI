import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TeacherLayout from '../../components/teacher/TeacherLayout'
import { mockTestService } from '../../service/testService/mockTestService'

const TIER_OPTIONS = [
  { value: 'BASIC', label: 'BASIC (Tier 1)' },
  { value: 'SILVER', label: 'SILVER (Tier 2)' },
  { value: 'GOLD', label: 'GOLD (Tier 3)' },
  { value: 'PLATINUM', label: 'PLATINUM (Tier 4)' },
]

const initialFormState = {
  name: '',
  durationMinutes: 60,
  lessonPlanId: '',
  requiredTier: 'BASIC',
}

function TeacherTestForm({ onNavigate, mode = 'auto', initialTestId }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryMode = searchParams.get('mode')
  const queryTestId = searchParams.get('testId')
  const presetLessonId = searchParams.get('lessonPlanId')

  const resolvedMode =
    mode !== 'auto'
      ? mode
      : queryMode === 'update'
        ? 'update'
        : queryMode === 'create'
          ? 'create'
          : queryTestId
            ? 'update'
            : 'create'

  const effectiveTestId = initialTestId || queryTestId
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
          lessonPlanId: detail?.lessonPlanId || '',
          requiredTier: detail?.requiredTier || 'BASIC',
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [isEditMode, effectiveTestId])

  useEffect(() => {
    if (isEditMode) return
    if (!presetLessonId) return
    setFormData((prev) => {
      if (prev.lessonPlanId) return prev
      return { ...prev, lessonPlanId: presetLessonId }
    })
  }, [presetLessonId, isEditMode])

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

    return {
      name: formData.name,
      durationSeconds,
      lessonPlanId: lessonPlanIdNumeric || null,
      requiredTier: formData.requiredTier || null,
    }
  }, [formData])

  const goToDashboard = () => {
    if (onNavigate) {
      onNavigate('teacher-dashboard')
    } else {
      navigate('/teacher-dashboard')
    }
  }

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
        goToDashboard()
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
            onClick={goToDashboard}
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
                <span className="text-sm font-semibold text-gray-700">Lesson Plan ID (tự động)</span>
                <input
                  type="text"
                  value={formData.lessonPlanId}
                  readOnly
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Được gắn từ trang Lesson"
                />
                <span className="text-xs text-gray-500">
                  Mở giáo án trong trang Lesson và tạo test trực tiếp để tự động điền ID.
                </span>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Tier membership</span>
                <select
                  name="requiredTier"
                  value={formData.requiredTier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {TIER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Quản lý câu hỏi</p>
              <p className="text-sm text-blue-700">
                Sau khi lưu, hãy vào trang chi tiết bài test để thêm, sửa hoặc xóa câu hỏi. Tổng điểm được
                tính tự động = số câu hỏi × 10 điểm.
              </p>
              <button
                type="button"
                disabled={!isEditMode || !effectiveTestId}
                onClick={() => effectiveTestId && navigate(`/test-detail?testId=${effectiveTestId}`)}
                className={`px-5 py-2 rounded-xl font-semibold ${
                  isEditMode && effectiveTestId
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isEditMode ? 'Mở trang quản lý câu hỏi' : 'Lưu trước để thêm câu hỏi'}
              </button>
            </div>

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
