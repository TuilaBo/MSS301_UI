import TimerDisplay from './TimerDisplay'

function AttemptControlPanel({
  timeLeft,
  answeredCount,
  totalQuestions,
  selectedOptionLabel,
  onFinish,
  finishing,
  isDisabled,
  status,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 flex flex-col gap-5">
      <TimerDisplay seconds={timeLeft} />

      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Tiến độ</p>
        <p className="text-2xl font-semibold text-blue-900 mt-1">
          {answeredCount}/{totalQuestions} câu đã chọn
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-gray-700">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
          Đáp án đang chọn
        </p>
        <p className="text-base font-medium">{selectedOptionLabel || 'Chưa có lựa chọn'}</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
            Trạng thái bài thi
          </p>
          <p className="text-base font-semibold text-gray-800">{status || 'IN_PROGRESS'}</p>
        </div>
        <button
          type="button"
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          onClick={onFinish}
          disabled={isDisabled || finishing}
        >
          {finishing ? 'Đang nộp...' : 'Kết thúc bài thi'}
        </button>
      </div>
    </div>
  )
}

export default AttemptControlPanel

