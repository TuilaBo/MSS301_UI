import React, { useState } from 'react'
import { documentService } from '../service/documentService'

export default function StudyPlan() {
  const [grade, setGrade] = useState(10)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlan = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await documentService.getStudyPlan(grade)
      setPlan(res)
    } catch (e) {
      console.error('Study plan fetch error', e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tạo / Xem kế hoạch học tập</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border px-3 py-2 rounded">
            <option value={9}>Lớp 9</option>
            <option value={10}>Lớp 10</option>
            <option value={11}>Lớp 11</option>
            <option value={12}>Lớp 12</option>
          </select>
          <button onClick={fetchPlan} className="bg-green-600 text-white px-4 py-2 rounded">Lấy kế hoạch</button>
        </div>
        {loading && <div>Đang tải...</div>}
        {error && <div className="text-red-600">Lỗi: {error}</div>}
        {plan && (
          <div className="mt-4 text-sm text-gray-700">
            <pre className="bg-gray-100 p-3 rounded overflow-auto" style={{maxHeight: 400}}>{JSON.stringify(plan, null, 2)}</pre>
          </div>
        )}
        {!plan && !loading && <div className="text-gray-500">Nhấn "Lấy kế hoạch" để yêu cầu từ API</div>}
      </div>
    </div>
  )
}
