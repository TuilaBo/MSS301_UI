import { useState, useCallback, useEffect } from 'react'
import { mockTestService } from '../service/testService/mockTestService'

export function useMockTestDetail(testId, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDetail = useCallback(
    async (signal) => {
      if (!testId) {
        setData(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const detail = await mockTestService.getMockTestById(testId, { signal })
        setData(detail)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    [testId],
  )

  useEffect(() => {
    if (options.skip) return

    const controller = new AbortController()
    fetchDetail(controller.signal)
    return () => controller.abort()
  }, [fetchDetail, options.skip])

  return {
    data,
    loading,
    error,
    refresh: () => fetchDetail(),
  }
}

