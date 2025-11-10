import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadService } from '../service/uploadService'

const TeacherUpload = ({ onUploadSuccess, onClose }) => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [errors, setErrors] = useState([])
  const [successUploads, setSuccessUploads] = useState([])
  const [uploadMode, setUploadMode] = useState('single') // 'single' or 'bulk'
  
  const fileInputRef = useRef(null)

  // Form data for document metadata
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    category: 'Giáo trình',
    gradeLevel: 12,
    subject: 'Ngữ văn',
    tags: '',
    isPublic: true
  })

  const categories = [
    'Giáo trình',
    'Bài tập', 
    'Hướng dẫn',
    'Video',
    'Audio',
    'Tham khảo'
  ]

  const subjects = [
    'Ngữ văn',
    'Toán học',
    'Tiếng Anh',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lý',
    'GDCD',
    'Tin học',
    'Thể dục',
    'Chung'
  ]

  const gradeLevels = Array.from({length: 7}, (_, i) => i + 6) // 6-12

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  // Process selected files
  const handleFiles = (newFiles) => {
    const validFiles = []
    const fileErrors = []

    newFiles.forEach(file => {
      const validation = uploadService.validateFile(file)
      if (validation.isValid) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          suggestedCategory: validation.suggestedCategory,
          preview: URL.createObjectURL(file)
        })
      } else {
        fileErrors.push(`${file.name}: ${validation.errors.join(', ')}`)
      }
    })

    if (fileErrors.length > 0) {
      setErrors(prev => [...prev, ...fileErrors])
    }

    setFiles(prev => [...prev, ...validFiles])
    
    // Auto-set category from first file if not set
    if (validFiles.length > 0 && !documentData.title) {
      const firstFile = validFiles[0]
      setDocumentData(prev => ({
        ...prev,
        category: firstFile.suggestedCategory,
        title: firstFile.name.split('.')[0]
      }))
    }
  }

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      // Clean up object URL
      const removedFile = prev.find(f => f.id === fileId)
      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return newFiles
    })
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setDocumentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Upload single file
  const uploadSingleFile = async (fileData) => {
    const uploadData = {
      title: documentData.title || fileData.name.split('.')[0],
      description: documentData.description,
      category: documentData.category,
      gradeLevel: documentData.gradeLevel,
      subject: documentData.subject,
      tags: documentData.tags,
      isPublic: documentData.isPublic,
      uploadedBy: localStorage.getItem('userId') || 'teacher'
    }

    return uploadService.uploadDocument(
      fileData.file,
      uploadData,
      (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: progress
        }))
      }
    )
  }

  // Upload multiple files
  const uploadBulkFiles = async () => {
    const fileList = files.map(f => f.file)
    const commonData = {
      category: documentData.category,
      gradeLevel: documentData.gradeLevel,
      subject: documentData.subject,
      isPublic: documentData.isPublic,
      uploadedBy: localStorage.getItem('userId') || 'teacher'
    }

    return uploadService.uploadMultipleDocuments(
      fileList,
      commonData,
      (progress) => {
        setUploadProgress({ bulk: progress })
      }
    )
  }

  // Start upload process
  const handleUpload = async () => {
    if (files.length === 0) {
      setErrors(['Vui lòng chọn file để upload'])
      return
    }

    setUploading(true)
    setErrors([])
    setSuccessUploads([])
    setUploadProgress({})

    try {
      if (uploadMode === 'bulk' && files.length > 1) {
        // Bulk upload
        const result = await uploadBulkFiles()
        setSuccessUploads(result.data || [])
        
        if (onUploadSuccess) {
          onUploadSuccess(result)
        }
      } else {
        // Single file uploads
        const uploadPromises = files.map(uploadSingleFile)
        const results = await Promise.allSettled(uploadPromises)
        
        const successful = []
        const failed = []
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successful.push(result.value.data)
          } else {
            failed.push(`${files[index].name}: ${result.reason.message}`)
          }
        })
        
        setSuccessUploads(successful)
        if (failed.length > 0) {
          setErrors(failed)
        }

        if (successful.length > 0 && onUploadSuccess) {
          onUploadSuccess({ data: successful })
        }
      }
    } catch (error) {
      setErrors([`Lỗi upload: ${error.message}`])
    } finally {
      setUploading(false)
    }
  }

  // Clear all
  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview))
    setFiles([])
    setErrors([])
    setSuccessUploads([])
    setUploadProgress({})
    setDocumentData({
      title: '',
      description: '',
      category: 'Giáo trình',
      gradeLevel: 12,
      subject: 'Ngữ văn',
      tags: '',
      isPublic: true
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📚 Upload Tài liệu Giảng dạy</h2>
            <p className="text-gray-600">Dành cho giáo viên - Upload tài liệu cho học sinh</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setUploadMode('single')}
              className={`px-4 py-2 rounded-lg ${uploadMode === 'single' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'}`}
            >
              📄 Upload đơn lẻ
            </button>
            <button
              onClick={() => setUploadMode('bulk')}
              className={`px-4 py-2 rounded-lg ${uploadMode === 'bulk' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'}`}
            >
              📦 Upload hàng loạt
            </button>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={uploadMode === 'bulk'}
              accept=".pdf,.doc,.docx,.mp4,.mp3,.ppt,.pptx,.xls,.xlsx,.jpg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Kéo thả file vào đây hoặc
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📂 Chọn file
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Hỗ trợ: PDF, DOC, DOCX, MP4, MP3, PPT, PPTX, XLS, XLSX, JPG, PNG
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">📋 File đã chọn ({files.length})</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {file.name.endsWith('.pdf') && '📄'}
                        {file.name.endsWith('.mp4') && '🎥'}
                        {file.name.endsWith('.mp3') && '🎵'}
                        {file.name.endsWith('.ppt') && '📊'}
                        {file.name.endsWith('.doc') && '📝'}
                        {!/(pdf|mp4|mp3|ppt|doc)/.test(file.name) && '📁'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{file.name}</div>
                        <div className="text-sm text-gray-600">
                          {uploadService.formatFileSize(file.size)} • {file.suggestedCategory}
                        </div>
                        {uploadProgress[file.id] && (
                          <div className="text-xs text-blue-600">
                            Upload: {Math.round(uploadProgress[file.id])}%
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={uploading}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Tiêu đề
              </label>
              <input
                type="text"
                name="title"
                value={documentData.title}
                onChange={handleInputChange}
                placeholder="Tiêu đề tài liệu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📂 Danh mục
              </label>
              <select
                name="category"
                value={documentData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎓 Lớp học
              </label>
              <select
                name="gradeLevel"
                value={documentData.gradeLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>Lớp {grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📚 Môn học
              </label>
              <select
                name="subject"
                value={documentData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📄 Mô tả
              </label>
              <textarea
                name="description"
                value={documentData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết về tài liệu..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                name="tags"
                value={documentData.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPublic"
                checked={documentData.isPublic}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                🌐 Công khai cho học sinh
              </label>
            </div>
          </div>

          {/* Progress */}
          {uploading && Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">⏳ Tiến trình upload</h3>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{fileId === 'bulk' ? 'Bulk Upload' : files.find(f => f.id === fileId)?.name}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Lỗi:</h3>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success */}
          {successUploads.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Upload thành công:</h3>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                {successUploads.map((doc, index) => (
                  <li key={index}>{doc.title}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div className="space-x-2">
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                🗑️ Xóa tất cả
              </button>
            </div>
            
            <div className="space-x-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                ❌ Hủy
              </button>
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '⏳ Đang upload...' : '📤 Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TeacherUpload