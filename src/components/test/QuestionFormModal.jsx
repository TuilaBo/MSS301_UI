import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockQuestionService } from '../../service/testService/mockQuestionService'

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICES', label: 'Trắc nghiệm' },
  { value: 'ESSAY', label: 'Tự luận' },
]

const DEFAULT_FORM = {
  question: '',
  questionType: 'MULTIPLE_CHOICES',
}

const DEFAULT_POINT = 10

function QuestionFormModal({ open, mode = 'create', testId, question, onClose, onSuccess }) {
  const isEditMode = mode === 'update'
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEditMode && question) {
      setFormData({
        question: question.question || '',
        questionType: question.questionType || 'MULTIPLE_CHOICES',
      })
    } else {
      setFormData(DEFAULT_FORM)
    }
    setError(null)
  }, [isEditMode, question, open])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!testId && !question?.testId) {
      setError('Không xác định được bài test liên quan.')
      return
    }

    const payload = {
      question: formData.question.trim(),
      point: DEFAULT_POINT,
      questionType: formData.questionType,
      testId: question?.testId || testId,
    }

    if (!payload.question) {
      setError('Nội dung câu hỏi không được trống.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isEditMode && question?.id) {
        await mockQuestionService.updateQuestion(question.id, payload)
      } else {
        await mockQuestionService.createQuestion(payload)
      }
      onSuccess?.()
    } catch (submitError) {
      setError(submitError.message || 'Không thể lưu câu hỏi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

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
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-blue-100"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
                {isEditMode ? 'Cập nhật' : 'Thêm mới'} câu hỏi
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {isEditMode ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
              </h3>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              onClick={() => !submitting && onClose?.()}
            >
              ×
            </button>
          </div>

          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">
                Nội dung câu hỏi <span className="text-red-500">*</span>
              </span>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập nội dung câu hỏi..."
                required
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">Loại câu hỏi</span>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">Điểm số mặc định</span>
                <div className="px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-600">
                  {DEFAULT_POINT} điểm/câu
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-sm">
              Sau khi lưu câu hỏi, hãy sử dụng phần &quot;Đáp án&quot; trong trang chi tiết bài test để thêm hoặc
              chỉnh sửa các lựa chọn trả lời.
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

export default QuestionFormModal
