import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockTestService } from '../../service/testService/mockTestService'

const DEFAULT_FORM = {
  name: '',
  durationMinutes: 60,
  requiredTier: 'BASIC',
}

const TIER_OPTIONS = [
  { value: 'BASIC', label: 'BASIC (Tier 1)' },
  { value: 'SILVER', label: 'SILVER (Tier 2)' },
  { value: 'GOLD', label: 'GOLD (Tier 3)' },
  { value: 'PLATINUM', label: 'PLATINUM (Tier 4)' },
]

function LessonTestFormModal({
  open,
  mode = 'create',
  lessonId,
  test,
  onClose,
  onSuccess,
  onOpenQuestionManager,
}) {
  const isEditMode = mode === 'update'
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isEditMode && test) {
      setFormData({
        name: test?.name || '',
        durationMinutes: Math.max(1, Math.round((test?.durationSeconds || 60) / 60)),
        requiredTier: test?.requiredTier || 'BASIC',
      })
    } else {
      setFormData(DEFAULT_FORM)
    }
    setError(null)
    setSuccessMessage('')
  }, [isEditMode, test, open])

  const effectiveLessonId = useMemo(() => {
    if (isEditMode) {
      return (
        test?.lessonPlanId ||
        test?.lessonPlan?.id ||
        test?.lesson?.id ||
        test?.lessonId ||
        lessonId
      )
    }
    return lessonId
  }, [
    isEditMode,
    lessonId,
    test?.lessonPlanId,
    test?.lessonPlan?.id,
    test?.lesson?.id,
    test?.lessonId,
  ])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!effectiveLessonId) {
      setError('Không xác định được giáo án để gắn bài test.')
      return
    }

    const derivedTotalPoint =
      isEditMode && Array.isArray(test?.questions) ? test.questions.length * 10 : 0

    const payload = {
      name: formData.name.trim(),
      durationSeconds: Math.max(60, Number(formData.durationMinutes || 0) * 60),
      totalPoint: derivedTotalPoint,
      lessonPlanId: effectiveLessonId,
      requiredTier: formData.requiredTier || null,
    }

    if (!payload.name) {
      setError('Tên bài test không được bỏ trống.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMessage('')

    try {
      let response
      if (isEditMode && test?.id) {
        response = await mockTestService.updateMockTest(test.id, payload)
        setSuccessMessage('Đã cập nhật bài test.')
      } else {
        response = await mockTestService.createMockTest(payload)
        setSuccessMessage('Đã tạo bài test mới.')
      }
      onSuccess?.(response)
    } catch (submitError) {
      setError(submitError.message || 'Không thể lưu bài test. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={() => !submitting && onClose?.()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl border border-blue-100"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">
                {isEditMode ? 'Cập nhật' : 'Tạo mới'} bài test
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {isEditMode ? 'Chỉnh sửa bài test' : 'Thêm bài test cho giáo án'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Giáo án mục tiêu:{' '}
                <span className="font-semibold text-blue-600">
                  {effectiveLessonId ? `#${effectiveLessonId}` : 'Không xác định'}
                </span>
              </p>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              onClick={() => !submitting && onClose?.()}
            >
              ×
            </button>
          </div>

          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm">
                {successMessage}
              </div>
            )}

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
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ví dụ: Kiểm tra Văn học Việt Nam"
                  required
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
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="60"
                  required
                />
              </label>

              <label className="space-y-2">
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
              <p className="text-sm text-blue-800 font-semibold">Quản lý câu hỏi</p>
              <p className="text-sm text-blue-700">
                Sau khi lưu, hãy chuyển đến trang chi tiết bài test để thêm, chỉnh sửa hoặc xóa câu hỏi. Tổng
                điểm của bài test được tính tự động: mỗi câu hỏi = 10 điểm.
              </p>
              <button
                type="button"
                disabled={!isEditMode || !test?.id}
                onClick={() => isEditMode && test?.id && onOpenQuestionManager?.(test.id)}
                className={`px-4 py-2 rounded-xl font-medium ${
                  isEditMode && test?.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isEditMode ? 'Mở trang quản lý câu hỏi' : 'Lưu trước rồi thêm câu hỏi'}
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300"
                onClick={() => !submitting && onClose?.()}
              >
                Hủy
              </button>
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded-xl text-white font-semibold ${
                  submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LessonTestFormModal
