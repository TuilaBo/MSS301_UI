import { useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useMockTestDetail } from '../../hooks/useMockTestDetail'
import { getUserInfo } from '../../components/AuthStatus'
import LessonTestFormModal from '../../components/lesson/LessonTestFormModal'
import QuestionFormModal from '../../components/test/QuestionFormModal'
import QuestionOptionFormModal from '../../components/test/QuestionOptionFormModal'
import { mockQuestionService } from '../../service/testService/mockQuestionService'

function TestDetail({ onNavigate }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const testId = searchParams.get('testId')
  const { data: testDetail, loading, error, refresh } = useMockTestDetail(testId)

  const userInfo = useMemo(() => getUserInfo(), [])
  const normalizedRoles = useMemo(() => {
    const collected = []
    const push = (value) => {
      if (!value) return
      if (Array.isArray(value)) {
        value.forEach(push)
        return
      }
      if (typeof value === 'object') {
        push(value.roleName || value.role)
        push(value.name)
        push(value.value)
        push(value.authority)
        return
      }
      if (typeof value === 'string') {
        collected.push(value.toUpperCase())
      }
    }
    push(userInfo?.role)
    push(userInfo?.roles)
    push(userInfo?.scopes)
    return collected.filter(Boolean)
  }, [userInfo])

  const isTeacherView = normalizedRoles.some(
    (role) => role.includes('TEACHER') || role.includes('ADMIN'),
  )

  const [testModalOpen, setTestModalOpen] = useState(false)
  const [questionModalConfig, setQuestionModalConfig] = useState(null)
  const [optionModalConfig, setOptionModalConfig] = useState(null)
  const [questionActionMessage, setQuestionActionMessage] = useState(null)
  const [questionActionIsError, setQuestionActionIsError] = useState(false)
  const [questionActionLoading, setQuestionActionLoading] = useState(false)

  const derivedTotalPoint = (detail) => (detail?.questions?.length || 0) * 10
  const isEssayQuestion = (question) =>
    (question?.questionType || '').toUpperCase() === 'ESSAY'

  const handleStart = () => {
    if (!testId || isTeacherView) return
    navigate(`/take-test?testId=${testId}`)
  }

  const handleAddQuestion = () => setQuestionModalConfig({ mode: 'create', question: null })
  const handleEditQuestion = (question) =>
    setQuestionModalConfig({ mode: 'update', question: question || null })

  const handleAddOption = (question) => {
    if (!question || isEssayQuestion(question)) return
    setOptionModalConfig({ mode: 'create', question: question || null, option: null })
  }
  const handleEditOption = (question, option) => {
    if (!question || isEssayQuestion(question)) return
    setOptionModalConfig({ mode: 'update', question: question || null, option: option || null })
  }

  const closeQuestionModal = () => setQuestionModalConfig(null)
  const closeOptionModal = () => setOptionModalConfig(null)

  const handleQuestionSaved = async () => {
    setQuestionModalConfig(null)
    await refresh()
    setQuestionActionMessage('Đã lưu câu hỏi.')
    setQuestionActionIsError(false)
  }

  const handleOptionSaved = async () => {
    setOptionModalConfig(null)
    await refresh()
    setQuestionActionMessage('Đã lưu đáp án.')
    setQuestionActionIsError(false)
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!questionId || questionActionLoading) return
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')
    if (!confirmed) return

    setQuestionActionLoading(true)
    setQuestionActionMessage(null)
    setQuestionActionIsError(false)
    try {
      await mockQuestionService.deleteQuestion(questionId)
      await refresh()
      setQuestionActionMessage('Đã xóa câu hỏi.')
    } catch (deleteError) {
      setQuestionActionIsError(true)
      setQuestionActionMessage(deleteError.message || 'Không thể xóa câu hỏi.')
    } finally {
      setQuestionActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Thông tin bài thi</h1>
          <p className="text-gray-600">
            {isTeacherView
              ? 'Giáo viên có thể chỉnh sửa bài test và quản lý câu hỏi trực tiếp tại đây.'
              : 'Kiểm tra thông tin bài thi trước khi bắt đầu làm bài.'}
          </p>
        </div>

        {!testId && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 text-center text-gray-600">
            Vui lòng chọn một bài thi hợp lệ (tham số <code className="px-1 bg-gray-100 rounded">testId</code>).
          </div>
        )}

        {testId && (
          <section className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 space-y-6">
            {loading && <p className="text-gray-500">Đang tải dữ liệu bài thi...</p>}
            {error && (
              <p className="text-red-500">
                Không thể tải bài thi. {error.message || 'Vui lòng thử lại sau.'}
              </p>
            )}

            {!loading && !error && testDetail && (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">
                      Mock Test #{testDetail.id}
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900 mt-2">{testDetail.name}</h2>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                      Bài thi bao gồm {testDetail.questions?.length || 0} câu hỏi với tổng điểm{' '}
                      {derivedTotalPoint(testDetail)}. Yêu cầu tier:{' '}
                      <span className="font-semibold text-blue-600">
                        {testDetail.requiredTier || 'Không có'}
                      </span>
                      .
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl px-6 py-4 text-center">
                    <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Thời lượng</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {Math.round((testDetail.durationSeconds || 0) / 60)} phút
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-blue-100">Tổng điểm</p>
                    <p className="text-3xl font-bold mt-2">{derivedTotalPoint(testDetail)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-amber-100">Số câu hỏi</p>
                    <p className="text-3xl font-bold mt-2">{testDetail.questions?.length || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-2xl p-5 shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-emerald-100">Tier yêu cầu</p>
                    <p className="text-3xl font-bold mt-2">{testDetail.requiredTier || 'Không có'}</p>
                  </div>
                </div>

                {isTeacherView ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="px-5 py-2 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        onClick={() => setTestModalOpen(true)}
                      >
                        Chỉnh sửa thông tin test
                      </button>
                      <button
                        type="button"
                        className="px-5 py-2 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                        onClick={handleAddQuestion}
                      >
                        + Thêm câu hỏi
                      </button>
                      <button
                        type="button"
                        className="px-5 py-2 rounded-2xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        onClick={() => navigate('/lessons')}
                      >
                        ← Quay về trang Lesson
                      </button>
                    </div>

                    {questionActionMessage && (
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm ${
                          questionActionIsError
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {questionActionMessage}
                      </div>
                    )}

                    <p className="text-sm text-gray-600">
                      Mỗi câu hỏi tương đương <span className="font-semibold text-gray-800">10 điểm</span>.
                      Tổng điểm hiện tại: {derivedTotalPoint(testDetail)} điểm.
                    </p>

                    <div className="space-y-4">
                      {testDetail.questions?.length ? (
                        testDetail.questions.map((question) => (
                          <div
                            key={question.id}
                            className="border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                                  #{question.id} • {question.questionType || 'UNKNOWN'}
                                </p>
                                <h4 className="text-lg font-semibold text-gray-800 mt-1">
                                  {question.question}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {isEssayQuestion(question) ? '10 điểm' : `${question.point || 10} điểm`}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition"
                                  onClick={() => handleEditQuestion(question)}
                                >
                                  Chỉnh sửa
                                </button>
                                <button
                                  type="button"
                                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition disabled:opacity-60"
                                  disabled={questionActionLoading}
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                            {!isEssayQuestion(question) && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                  type="button"
                                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
                                  onClick={() => handleAddOption(question)}
                                >
                                  + Thêm đáp án
                                </button>
                              </div>
                            )}
                            {!isEssayQuestion(question) && question.options?.length ? (
                              <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-2">
                                {question.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`px-4 py-3 rounded-lg border ${
                                      option.answer
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                        : 'border-gray-200 bg-white text-gray-700'
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div>
                                        <p className="font-medium">{option.name}</p>
                                        {option.answer && (
                                          <span className="text-xs font-semibold text-emerald-700">
                                            ✔ Đáp án đúng
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                                          onClick={() => handleEditOption(question, option)}
                                        >
                                          Chỉnh sửa
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 mt-3">
                                {isEssayQuestion(question)
                                  ? 'Câu hỏi tự luận không có đáp án lựa chọn.'
                                  : 'Chưa có đáp án cho câu hỏi này.'}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-8 border border-dashed border-gray-200 rounded-2xl">
                          Chưa có câu hỏi nào. Nhấn &quot;+ Thêm câu hỏi&quot; để bắt đầu.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition"
                      onClick={handleStart}
                    >
                      Bắt đầu làm bài
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition"
                      onClick={() => onNavigate && onNavigate('home')}
                    >
                      Quay lại trang chủ
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <Footer onNavigate={onNavigate} />

      {isTeacherView && testDetail && (
        <>
          <LessonTestFormModal
            open={testModalOpen}
            mode="update"
            lessonId={testDetail.lessonPlanId}
            test={testDetail}
            onClose={() => setTestModalOpen(false)}
            onSuccess={() => {
              setTestModalOpen(false)
              refresh()
            }}
          />

          <QuestionFormModal
            open={!!questionModalConfig}
            mode={questionModalConfig?.mode || 'create'}
            testId={testDetail.id}
            question={questionModalConfig?.question || null}
            onClose={closeQuestionModal}
            onSuccess={handleQuestionSaved}
          />

          <QuestionOptionFormModal
            open={!!optionModalConfig}
            mode={optionModalConfig?.mode || 'create'}
            questionId={optionModalConfig?.question?.id}
            option={optionModalConfig?.option || null}
            onClose={closeOptionModal}
            onSuccess={handleOptionSaved}
          />
        </>
      )}
    </div>
  )
}

export default TestDetail
