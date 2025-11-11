import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import QuestionListPanel from '../../components/takeTest/QuestionListPanel'
import QuestionViewer from '../../components/takeTest/QuestionViewer'
import AttemptControlPanel from '../../components/takeTest/AttemptControlPanel'
import { useHashParams } from '../../hooks/useHashParams'
import { useMockTestDetail } from '../../hooks/useMockTestDetail'
import { useMockAttemptFlow } from '../../hooks/useMockAttemptFlow'

const readToken = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null)

function TakeTest({ onNavigate }) {
  const params = useHashParams()
  const testId = params.get('testId')

  const [token, setToken] = useState(() => readToken())
  useEffect(() => {
    const handler = () => setToken(readToken())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const { data: testDetail, loading: loadingTest, error: testError } = useMockTestDetail(testId, {
    skip: !testId,
  })

  const {
    attempt,
    answerMap,
    loading: attemptLoading,
    error: attemptError,
    startAttempt,
    selectAnswer,
    finalizeAttempt,
    resetAttempt,
  } = useMockAttemptFlow(testId)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [uiMessage, setUiMessage] = useState(null)
  const [finishing, setFinishing] = useState(false)
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false)
  const timerInitializedRef = useRef(false)

  useEffect(() => {
    setCurrentQuestionIndex(0)
    setTimeLeft(null)
    setUiMessage(null)
    setAutoSubmitTriggered(false)
    timerInitializedRef.current = false
    resetAttempt()
  }, [testId, resetAttempt])

  useEffect(() => {
    const latestToken = readToken()
    if (latestToken !== token) {
      setToken(latestToken)
    }

    if (!testDetail?.id || !latestToken) return
    if (attempt?.mockTestId === Number(testDetail.id)) return

    startAttempt().catch((err) => {
      console.error('Failed to start attempt', err)
      setUiMessage(err.message || 'Không thể bắt đầu bài thi.')
    })
  }, [testDetail?.id, token, attempt?.mockTestId, startAttempt])

  useEffect(() => {
    if (!testDetail?.durationSeconds || !attempt?.id) return
    if (timerInitializedRef.current) return

    const durationSeconds = Number(testDetail.durationSeconds) || 0
    let remaining = durationSeconds
    if (attempt.startTime) {
      const start = new Date(attempt.startTime).getTime()
      const elapsed = Math.floor((Date.now() - start) / 1000)
      remaining = Math.max(durationSeconds - elapsed, 0)
    }
    setTimeLeft(remaining)
    timerInitializedRef.current = true
  }, [attempt?.id, attempt?.startTime, testDetail?.durationSeconds])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0 && !autoSubmitTriggered) {
      setAutoSubmitTriggered(true)
      finalizeAttempt()
        .then((result) => {
          const attemptId = result?.id || attempt?.id
          if (attemptId) {
            window.location.hash = `test-result?attemptId=${attemptId}`
          }
        })
        .catch((err) => {
          console.error('Auto finalize failed', err)
          setUiMessage('Không thể nộp bài tự động. Vui lòng thử lại.')
        })
      return
    }

    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev
        return prev > 0 ? prev - 1 : 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, finalizeAttempt, attempt?.id, autoSubmitTriggered])

  const questions = testDetail?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? answerMap[currentQuestion.id] : null
  const selectedOptionId =
    typeof currentAnswer?.optionId !== 'undefined' && currentAnswer?.optionId !== null
      ? currentAnswer.optionId
      : null
  const currentAnswerText = currentAnswer?.answerText || ''
  const selectedOptionLabel = useMemo(() => {
    if (!currentQuestion) return ''
    if (selectedOptionId === null || typeof selectedOptionId === 'undefined') return ''
    return currentQuestion.options?.find((opt) => opt.id === selectedOptionId)?.name || ''
  }, [currentQuestion, selectedOptionId])

  const answeredCount = useMemo(() => {
    return questions.reduce((count, question) => {
      const answer = answerMap[question.id]
      if (!answer) {
        return count
      }
      const hasChoice = typeof answer.optionId !== 'undefined' && answer.optionId !== null
      const hasEssay =
        typeof answer.answerText === 'string' ? answer.answerText.trim().length > 0 : false
      return hasChoice || hasEssay ? count + 1 : count
    }, 0)
  }, [answerMap, questions])
  const disableInteraction = attempt?.status === 'COMPLETED'
  const readOnly = disableInteraction || !attempt?.id
  const currentAnswerDisplay =
    (currentQuestion?.questionType || '').toUpperCase() === 'ESSAY'
      ? currentAnswerText?.trim() || 'Chưa có nội dung'
      : selectedOptionLabel

  const handleOptionSelect = async (questionId, optionId) => {
    if (
      disableInteraction ||
      !questionId ||
      optionId === null ||
      typeof optionId === 'undefined'
    ) {
      return
    }
    try {
      await selectAnswer(questionId, { optionId })
      setUiMessage(null)
    } catch (err) {
      console.error('Failed to select answer', err)
      setUiMessage(err.message || 'Không thể lưu đáp án.')
    }
  }

  const handleEssayAnswer = async (questionId, text) => {
    if (disableInteraction || !questionId) return
    const existing = answerMap[questionId]?.answerText || ''
    if (existing === text) return

    try {
      await selectAnswer(questionId, { answerText: text })
      setUiMessage(null)
    } catch (err) {
      console.error('Failed to save essay answer', err)
      setUiMessage(err.message || 'Không thể lưu đáp án tự luận.')
    }
  }

  const handleFinish = async () => {
    if (!attempt?.id) return
    setFinishing(true)
    try {
      const result = await finalizeAttempt()
      const attemptId = result?.id || attempt?.id
      if (attemptId) {
        window.location.hash = `test-result?attemptId=${attemptId}`
      } else {
        setUiMessage('Đã nộp bài nhưng không tìm thấy mã attempt.')
      }
    } catch (err) {
      console.error('Finalize failed', err)
      setUiMessage(err.message || 'Không thể nộp bài. Vui lòng thử lại.')
    } finally {
      setFinishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header className="text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">Take Test</p>
          <h1 className="text-4xl font-bold text-gray-800">Làm bài kiểm tra</h1>
          <p className="text-gray-600">
            Danh sách câu hỏi, thời gian đếm ngược và thao tác nộp bài được thiết kế đồng bộ với phong cách
            hiện tại.
          </p>
        </header>

        {!token && (
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 text-center text-red-600">
            Vui lòng đăng nhập để bắt đầu làm bài thi.
          </div>
        )}

        {!testId && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 text-center text-gray-600">
            Không tìm thấy testId. Vui lòng quay lại trang danh sách để chọn bài thi.
          </div>
        )}

        {testId && (
          <section className="space-y-6">
            {(loadingTest || attemptLoading) && (
              <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 text-center text-gray-600">
                Đang chuẩn bị bài thi...
              </div>
            )}

            {(testError || attemptError) && (
              <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 text-red-600">
                {testError?.message || attemptError?.message || 'Không thể tải dữ liệu bài thi.'}
              </div>
            )}

            {uiMessage && (
              <div className="bg-white rounded-3xl shadow border border-amber-200 p-4 text-amber-700 text-center">
                {uiMessage}
              </div>
            )}

            {testDetail && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-3 space-y-6">
                  <QuestionListPanel
                    questions={questions}
                    currentQuestionId={currentQuestion?.id}
                    answerMap={answerMap}
                    onSelectQuestion={(index) => setCurrentQuestionIndex(index)}
                  />

                  <QuestionViewer
                    question={currentQuestion}
                    selectedOptionId={selectedOptionId}
                    answerText={currentAnswerText}
                    onSelectOption={handleOptionSelect}
                    onEssayAnswer={handleEssayAnswer}
                    readOnly={readOnly}
                  />
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <AttemptControlPanel
                    timeLeft={timeLeft}
                    answeredCount={answeredCount}
                    totalQuestions={questions.length}
                    selectedOptionLabel={currentAnswerDisplay}
                    onFinish={handleFinish}
                    finishing={finishing}
                    isDisabled={disableInteraction || !attempt?.id}
                    status={attempt?.status || 'IN_PROGRESS'}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default TakeTest
