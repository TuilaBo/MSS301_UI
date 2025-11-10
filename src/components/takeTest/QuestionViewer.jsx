import { useEffect, useState } from 'react'

function QuestionViewer({
  question,
  selectedOptionId,
  answerText,
  onSelectOption,
  onEssayAnswer,
  readOnly,
}) {
  const [essayDraft, setEssayDraft] = useState(answerText || '')

  useEffect(() => {
    setEssayDraft(answerText || '')
  }, [answerText, question?.id])

  const questionType = (question?.questionType || '').toUpperCase()
  const isEssay = questionType === 'ESSAY'

  const handleEssayBlur = () => {
    if (readOnly || !onEssayAnswer || !question?.id) return
    if ((answerText || '') === essayDraft) return
    onEssayAnswer(question.id, essayDraft)
  }

  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chọn một bài thi để bắt đầu.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
            {question.questionType || 'Question'}
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2 leading-snug">{question.question}</h3>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-full px-4 py-1">
          {question.point || 1} điểm
        </span>
      </div>

      <div className="space-y-4">
        {isEssay ? (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[160px] border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder={readOnly ? 'Bài thi đã hoàn thành.' : 'Nhập câu trả lời tự luận tại đây...'}
              value={essayDraft}
              onChange={(e) => setEssayDraft(e.target.value)}
              onBlur={handleEssayBlur}
              disabled={readOnly}
            />
            <p className="text-xs text-gray-500">
              {readOnly
                ? 'Không thể chỉnh sửa vì bài thi đã được nộp.'
                : 'Đáp án tự động lưu khi rời ô nhập hoặc chuyển sang câu hỏi khác.'}
            </p>
          </div>
        ) : question.options?.length ? (
          question.options.map((option) => {
            const isSelected = option.id === selectedOptionId
            const baseStyles = isSelected
              ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'

            return (
              <button
                key={option.id}
                type="button"
                disabled={readOnly}
                onClick={() => onSelectOption && onSelectOption(question.id, option.id)}
                className={`w-full text-left border rounded-2xl px-5 py-4 transition-all duration-200 font-medium ${baseStyles} ${
                  readOnly ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-base leading-relaxed">{option.name}</span>
              </button>
            )
          })
        ) : (
          <p className="text-sm text-gray-500">Không có đáp án cho câu hỏi này.</p>
        )}
      </div>
    </div>
  )
}

export default QuestionViewer

