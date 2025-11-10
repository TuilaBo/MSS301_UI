function ResultQuestionCard({ question, answerLookup }) {
  const answer = answerLookup[question.id]
  const selectedOptionId = answer?.mockOptionId
  const correctOptionId = question.options?.find((opt) => opt.answer)?.id

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
            {question.questionType || 'Question'}
          </p>
          <h4 className="text-xl font-bold text-gray-800 mt-2">{question.question}</h4>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-full px-4 py-1">
          {question.point || 1} điểm
        </span>
      </div>

      <div className="space-y-3">
        {question.options?.map((option) => {
          const isCorrect = option.id === correctOptionId
          const isSelected = option.id === selectedOptionId
          const baseStyles = isCorrect
            ? 'border-green-500 bg-green-50 text-green-900'
            : isSelected
              ? 'border-red-400 bg-red-50 text-red-800'
              : 'border-gray-200 text-gray-700'

          return (
            <div
              key={option.id}
              className={`border rounded-2xl px-5 py-3 flex items-start gap-3 ${baseStyles}`}
            >
              <div className="text-sm font-semibold">
                {isCorrect ? '✓' : isSelected ? '•' : ''}
              </div>
              <p className="text-base leading-relaxed">{option.name}</p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
        <span>
          Bạn chọn:{' '}
          <strong>
            {selectedOptionId
              ? question.options?.find((opt) => opt.id === selectedOptionId)?.name || 'Không xác định'
              : 'Chưa chọn'}
          </strong>
        </span>
        <span>
          Đạt điểm: <strong>{answer?.answerPoint ?? 0}</strong>/{question.point || 1}
        </span>
      </div>
    </div>
  )
}

export default ResultQuestionCard

