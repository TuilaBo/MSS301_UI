import { useState, useCallback, useEffect } from 'react'
import { mockTestService } from '../service/testService/mockTestService'

export function useLessonTests(lessonId, options = {}) {
  const { skip = false } = options
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTests = useCallback(async () => {
    if (!lessonId) {
      setTests([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await mockTestService.getMockTestsByLesson(lessonId)
      setTests(Array.isArray(response) ? response : [])
      return response
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    if (skip || !lessonId) return
    fetchTests()
  }, [fetchTests, skip, lessonId])

  return {
    tests,
    loading,
    error,
    refresh: fetchTests,
  }
}

