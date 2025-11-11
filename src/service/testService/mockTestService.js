import testServiceApi from './testServiceApi'

export const mockTestService = {
  getMockTests: (options) => testServiceApi.get('/mock-tests', options),

  getMockTestById: (testId, options) => testServiceApi.get(`/mock-tests/${testId}`, options),

  getMockTestsByLesson: (lessonId, options) =>
    testServiceApi.get(`/mock-tests/lesson/${lessonId}`, options),

  startAttempt: (testId, body, options) =>
    testServiceApi.post(`/mock-tests/${testId}/attempts/start`, body, options),

  createMockTest: (data, options) => testServiceApi.post('/mock-tests', data, options),

  updateMockTest: (testId, data, options) => testServiceApi.put(`/mock-tests/${testId}`, data, options),

  deleteMockTest: (testId, options) => testServiceApi.delete(`/mock-tests/${testId}`, options),
}
