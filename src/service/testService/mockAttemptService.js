import testServiceApi from './testServiceApi'

export const mockAttemptService = {
  getAttemptById: (attemptId, options) => testServiceApi.get(`/mock-attempts/${attemptId}`, options),

  getMyAttemptById: (attemptId, options) => testServiceApi.get(`/mock-attempts/${attemptId}/me`, options),

  listMyAttempts: (options) => testServiceApi.get('/mock-attempts/me', options),

  submitAnswer: (attemptId, payload, options) =>
    testServiceApi.post(`/mock-attempts/${attemptId}/answers`, payload, options),

  finalizeAttempt: (attemptId, payload, options) =>
    testServiceApi.post(`/mock-attempts/${attemptId}/grade`, payload, options),
}
