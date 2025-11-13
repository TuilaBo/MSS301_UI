import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockQuestionService } from '../../service/testService/mockQuestionService'

function QuestionOptionFormModal({
  open,
  mode = 'create',
  questionId,
  option,
  onClose,
  onSuccess,
}) {
  const isEditMode = mode === 'update'
  const [formData, setFormData] = useState({ name: '', answer: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEditMode && option) {
      setFormData({
        name: option.name || '',
        answer: !!option.answer,
      })
    } else {
      setFormData({ name: '', answer: false })
    }
    setError(null)
  }, [isEditMode, option, open])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!questionId) {
      setError('Không xác định được câu hỏi.')
      return
    }
    if (!formData.name.trim()) {
      setError('Nội dung đáp án không được để trống.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name: formData.name.trim(),
        answer: !!formData.answer,
        questionId,
      }
      if (isEditMode && option?.id) {
        await mockQuestionService.updateQuestionOption(questionId, option.id, payload)
      } else {
        await mockQuestionService.createQuestionOption(questionId, payload)
      }
      onSuccess?.()
    } catch (submitError) {
      setError(submitError.message || 'Không thể lưu đáp án.')
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
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-blue-100"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
                {isEditMode ? 'Cập nhật' : 'Thêm'} đáp án
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {isEditMode ? 'Chỉnh sửa đáp án' : 'Tạo đáp án mới'}
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
                Nội dung đáp án <span className="text-red-500">*</span>
              </span>
              <textarea
                name="name"
                value={formData.name}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập nội dung đáp án..."
                required
              />
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="answer"
                checked={formData.answer}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Đáp án đúng</span>
            </label>

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
                {submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Thêm đáp án'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuestionOptionFormModal
