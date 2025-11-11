function formatTime(totalSeconds = 0) {
  const seconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return {
    minutes,
    remainingSeconds,
    label: `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`,
  }
}

function TimerDisplay({ seconds }) {
  const { minutes, remainingSeconds, label } = formatTime(seconds)

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow-lg">
      <p className="text-sm uppercase tracking-widest text-blue-100">Thời gian còn lại</p>
      <p className="text-4xl font-bold mt-2 font-mono">{label}</p>
      <p className="text-xs text-blue-100 mt-1">
        {minutes} phút {remainingSeconds} giây
      </p>
    </div>
  )
}

export default TimerDisplay

