const hasAnswer = (answer) => {
  if (!answer) return false
  if (typeof answer.optionId !== 'undefined' && answer.optionId !== null) {
    return true
  }
  if (typeof answer.answerText === 'string' && answer.answerText.trim().length > 0) {
    return true
  }
  return false
}

function QuestionListPanel({ questions = [], currentQuestionId, answerMap = {}, onSelectQuestion }) {
  const answeredCount = questions.reduce(
    (count, question) => (hasAnswer(answerMap[question.id]) ? count + 1 : count),
    0,
  )

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">Câu hỏi</p>
          <h3 className="text-lg font-semibold text-gray-800">Danh sách câu hỏi</h3>
        </div>
        <span className="text-sm text-gray-500">
          {answeredCount}/{questions.length} câu đã chọn
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {questions.map((question, index) => {
          const isActive = question.id === currentQuestionId
          const answered = hasAnswer(answerMap[question.id])
          const baseStyles = isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : answered
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-gray-50 text-gray-600 border border-gray-200'

          return (
            <button
              key={question.id}
              type="button"
              className={`h-12 rounded-xl font-semibold transition-all duration-200 ${baseStyles}`}
              onClick={() => onSelectQuestion && onSelectQuestion(index)}
            >
              {index + 1}
            </button>
          )
        })}
        {!questions.length && <p className="text-sm text-gray-500 col-span-full">Không có câu hỏi.</p>}
      </div>
    </div>
  )
}

export default QuestionListPanel

