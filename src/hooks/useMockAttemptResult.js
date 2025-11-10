import { useState, useCallback, useEffect } from 'react'
import { mockAttemptService } from '../service/testService/mockAttemptService'

export function useMockAttemptResult(attemptId, options = {}) {
  const { useMyAttempt = true, skip = false } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAttempt = useCallback(async () => {
    if (!attemptId) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = useMyAttempt
        ? await mockAttemptService.getMyAttemptById(attemptId)
        : await mockAttemptService.getAttemptById(attemptId)
      setData(response)
      return response
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [attemptId, useMyAttempt])

  useEffect(() => {
    if (skip) return
    fetchAttempt()
  }, [fetchAttempt, skip])

  return {
    data,
    loading,
    error,
    refresh: fetchAttempt,
  }
}

