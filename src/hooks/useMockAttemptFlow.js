import { useState, useCallback } from 'react'
import { mockTestService } from '../service/testService/mockTestService'
import { mockAttemptService } from '../service/testService/mockAttemptService'

const buildAnswerMap = (answers = []) =>
  answers.reduce((acc, ans) => {
    if (!ans?.mockQuestionId) {
      return acc
    }

    acc[ans.mockQuestionId] = {
      optionId:
        typeof ans.mockOptionId !== 'undefined' && ans.mockOptionId !== null ? ans.mockOptionId : null,
      answerText:
        typeof ans.answerText === 'string'
          ? ans.answerText
          : typeof ans.answerText === 'number'
            ? String(ans.answerText)
            : '',
    }

    return acc
  }, {})

export function useMockAttemptFlow(testId) {
  const [attempt, setAttempt] = useState(null)
  const [answerMap, setAnswerMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const startAttempt = useCallback(async () => {
    if (!testId) {
      throw new Error('Thiếu testId để bắt đầu bài thi')
    }

    setLoading(true)
    setError(null)
    try {
      const data = await mockTestService.startAttempt(testId)
      const initialAnswers = buildAnswerMap(data?.mockAnswers || [])
      setAttempt(data)
      setAnswerMap(initialAnswers)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [testId])

  const selectAnswer = useCallback(
    async (questionId, answerPayload) => {
      if (!attempt?.id) {
        throw new Error('Chưa có attempt để lưu đáp án')
      }

      if (!questionId) {
        throw new Error('Thiếu mã câu hỏi')
      }

      const normalizedPayload =
        answerPayload && typeof answerPayload === 'object'
          ? answerPayload
          : { optionId: answerPayload }

      const optionId =
        typeof normalizedPayload.optionId !== 'undefined' ? normalizedPayload.optionId : undefined
      const answerText =
        typeof normalizedPayload.answerText !== 'undefined' ? normalizedPayload.answerText : undefined

      if (typeof optionId === 'undefined' && typeof answerText === 'undefined') {
        throw new Error('Không có dữ liệu để lưu đáp án')
      }

      const accountId = Number(localStorage.getItem('userId')) || undefined
      const payload = {
        accountId,
        mockQuestionId: questionId,
        mockAttemptId: attempt.id,
      }

      if (typeof optionId !== 'undefined') {
        payload.mockOptionId = optionId
      }

      if (typeof answerText !== 'undefined') {
        payload.answerText = answerText
      }

      setLoading(true)
      setError(null)
      try {
        const response = await mockAttemptService.submitAnswer(attempt.id, payload)
        const submittedAnswer = response?.answer
        const finalizedAttempt = response?.finalizedAttempt

        if (Array.isArray(finalizedAttempt?.mockAnswers)) {
          setAnswerMap(buildAnswerMap(finalizedAttempt.mockAnswers))
        } else if (submittedAnswer?.mockQuestionId) {
          setAnswerMap((prev) => ({
            ...prev,
            [submittedAnswer.mockQuestionId]: {
              optionId:
                typeof submittedAnswer.mockOptionId !== 'undefined' &&
                submittedAnswer.mockOptionId !== null
                  ? submittedAnswer.mockOptionId
                  : null,
              answerText:
                typeof submittedAnswer.answerText === 'string'
                  ? submittedAnswer.answerText
                  : typeof submittedAnswer.answerText === 'number'
                    ? String(submittedAnswer.answerText)
                    : '',
            },
          }))
        }

        setAttempt((prev) => {
          if (!prev && !finalizedAttempt) {
            return prev
          }

          const baseAttempt = finalizedAttempt ? { ...(prev || {}), ...finalizedAttempt } : prev
          if (!baseAttempt) {
            return baseAttempt
          }

          let nextAnswers
          if (Array.isArray(finalizedAttempt?.mockAnswers)) {
            nextAnswers = finalizedAttempt.mockAnswers
          } else if (submittedAnswer?.mockQuestionId) {
            const answers = Array.isArray(baseAttempt.mockAnswers) ? [...baseAttempt.mockAnswers] : []
            const existingIndex = answers.findIndex(
              (ans) => ans.mockQuestionId === submittedAnswer.mockQuestionId,
            )
            if (existingIndex >= 0) {
              answers[existingIndex] = submittedAnswer
            } else {
              answers.push(submittedAnswer)
            }
            nextAnswers = answers
          } else {
            nextAnswers = baseAttempt.mockAnswers
          }

          return {
            ...baseAttempt,
            mockAnswers: nextAnswers,
          }
        })
        return response
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [attempt],
  )

  const finalizeAttempt = useCallback(async () => {
    if (!attempt?.id) {
      throw new Error('Không tìm thấy attempt để kết thúc')
    }

    setLoading(true)
    setError(null)
    try {
      const result = await mockAttemptService.finalizeAttempt(attempt.id)
      setAttempt((prev) => (prev ? { ...prev, ...result } : prev))
      if (Array.isArray(result?.mockAnswers)) {
        setAnswerMap(buildAnswerMap(result.mockAnswers))
      }
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [attempt])

  const resetAttempt = useCallback(() => {
    setAttempt(null)
    setAnswerMap({})
    setError(null)
  }, [])

  return {
    attempt,
    answerMap,
    loading,
    error,
    startAttempt,
    selectAnswer,
    finalizeAttempt,
    resetAttempt,
  }
}
