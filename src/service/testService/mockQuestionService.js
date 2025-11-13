import testServiceApi from './testServiceApi'

export const mockQuestionService = {
  createQuestion: (data, options) => testServiceApi.post('/mock-questions', data, options),
  updateQuestion: (questionId, data, options) =>
    testServiceApi.put(`/mock-questions/${questionId}`, data, options),
  deleteQuestion: (questionId, options) =>
    testServiceApi.delete(`/mock-questions/${questionId}`, options),
  getQuestionOptions: (questionId, options) =>
    testServiceApi.get(`/mock-questions/${questionId}/answers`, options),
  createQuestionOption: (questionId, data, options) =>
    testServiceApi.post(`/mock-questions/${questionId}/answers`, data, options),
  updateQuestionOption: (questionId, answerId, data, options) =>
    testServiceApi.put(`/mock-questions/${questionId}/answers/${answerId}`, data, options),
}

export default mockQuestionService
