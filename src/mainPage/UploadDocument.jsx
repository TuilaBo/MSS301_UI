import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentService } from '../service/documentService'

export default function UploadDocument() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState(10)
  const [subject, setSubject] = useState('Ngữ văn')
  const [category, setCategory] = useState('Giáo trình')
  const [fileType, setFileType] = useState('PDF')
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setMessage('Vui lòng chọn file trước khi upload')
  const form = new FormData()
  form.append('file', file)
  form.append('title', title)
  form.append('gradeLevel', grade)
  form.append('subject', subject)
  form.append('category', category)
  form.append('fileType', fileType)

    try {
      setMessage('Đang upload...')
      const res = await documentService.uploadSimple(form)
      setMessage('Upload thành công')
      console.log('Upload response', res)
      setTimeout(() => navigate('/documents'), 1000)
    } catch (e) {
      console.error('Upload error', e)
      setMessage('Upload thất bại: ' + (e.message || e.toString()))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upload tài liệu mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Tiêu đề</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">File</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Danh mục</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border px-2 py-1 rounded">
                <option>Giáo trình</option>
                <option>Bài tập</option>
                <option>Video</option>
                <option>Audio</option>
                <option>Đề kiểm tra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Loại file</label>
              <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full border px-2 py-1 rounded">
                <option>PDF</option>
                <option>DOCX</option>
                <option>MP4</option>
                <option>MP3</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Lớp</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full border px-2 py-1 rounded">
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9</option>
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Môn</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Hủy</button>
          </div>
          {message && <div className="text-sm text-gray-600">{message}</div>}
        </form>
      </div>
    </div>
  )
}
