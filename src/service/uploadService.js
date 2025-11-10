// Upload Service for Document API
import api from './api'

export const uploadService = {
  // Simple upload endpoint for teachers
  uploadDocument: async (file, documentData, onProgress = null) => {
    const formData = new FormData()
    
    // Add file
    formData.append('file', file)
    
    // Add document metadata
    Object.keys(documentData).forEach(key => {
      if (documentData[key] !== null && documentData[key] !== undefined) {
        formData.append(key, documentData[key])
      }
    })

    try {
      console.log('📤 Uploading document:', {
        fileName: file.name,
        fileSize: file.size,
        metadata: documentData
      })

      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Progress tracking
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100
              onProgress(percentComplete)
            }
          })
        }

        // Success handler
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              console.log('✅ Upload successful:', response)
              resolve(response)
            } catch (e) {
              console.error('❌ Failed to parse response:', xhr.responseText)
              reject(new Error('Invalid response format'))
            }
          } else {
            console.error('❌ Upload failed:', xhr.status, xhr.responseText)
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        })

        // Error handler
        xhr.addEventListener('error', () => {
          console.error('❌ Upload error')
          reject(new Error('Network error during upload'))
        })

        // Setup request
        const token = localStorage.getItem('accessToken')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }

        // Start upload
        xhr.open('POST', '/api/documents/upload-simple', true)
        xhr.send(formData)
      })
    } catch (error) {
      console.error('❌ Upload service error:', error)
      throw error
    }
  },

  // Advanced upload with JWT (for authenticated teachers)
  uploadDocumentAdvanced: async (file, documentData, onProgress = null) => {
    const formData = new FormData()
    
    formData.append('file', file)
    formData.append('document', JSON.stringify(documentData))

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch (e) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      const token = localStorage.getItem('accessToken')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.open('POST', '/api/documents', true)
      xhr.send(formData)
    })
  },

  // Bulk upload multiple files
  uploadMultipleDocuments: async (files, commonData, onProgress = null) => {
    const formData = new FormData()
    
    // Add all files
    files.forEach((file, index) => {
      formData.append('files', file)
    })
    
    // Add common metadata
    Object.keys(commonData).forEach(key => {
      if (commonData[key] !== null && commonData[key] !== undefined) {
        formData.append(key, commonData[key])
      }
    })

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch (e) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Bulk upload failed: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during bulk upload'))
      })

      const token = localStorage.getItem('accessToken')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.open('POST', '/api/documents/bulk-upload', true)
      xhr.send(formData)
    })
  },

  // Validate file before upload
  validateFile: (file) => {
    const errors = []
    
    // File size limits (in bytes)
    const sizeLimits = {
      'video': 500 * 1024 * 1024,   // 500MB
      'audio': 100 * 1024 * 1024,   // 100MB  
      'document': 50 * 1024 * 1024, // 50MB
      'image': 10 * 1024 * 1024,    // 10MB
      'presentation': 100 * 1024 * 1024, // 100MB
      'spreadsheet': 25 * 1024 * 1024   // 25MB
    }

    // Supported file types
    const supportedTypes = {
      'video': ['mp4', 'avi', 'mov', 'webm'],
      'audio': ['mp3', 'wav', 'm4a', 'ogg'],
      'document': ['pdf', 'doc', 'docx', 'txt'],
      'image': ['jpg', 'jpeg', 'png', 'gif'],
      'presentation': ['ppt', 'pptx'],
      'spreadsheet': ['xls', 'xlsx']
    }

    const extension = file.name.split('.').pop().toLowerCase()
    let fileCategory = null

    // Determine file category
    for (const [category, extensions] of Object.entries(supportedTypes)) {
      if (extensions.includes(extension)) {
        fileCategory = category
        break
      }
    }

    if (!fileCategory) {
      errors.push(`Định dạng file .${extension} không được hỗ trợ`)
      return { isValid: false, errors, category: null }
    }

    // Check file size
    if (file.size > sizeLimits[fileCategory]) {
      const maxSizeMB = sizeLimits[fileCategory] / (1024 * 1024)
      errors.push(`File ${fileCategory} không được vượt quá ${maxSizeMB}MB`)
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      category: fileCategory,
      suggestedCategory: uploadService.getCategoryFromExtension(extension)
    }
  },

  // Auto-detect category from file extension
  getCategoryFromExtension: (extension) => {
    const categoryMap = {
      'pdf': 'Giáo trình',
      'doc': 'Bài tập',
      'docx': 'Bài tập',
      'mp4': 'Video',
      'avi': 'Video',
      'mov': 'Video',
      'webm': 'Video',
      'mp3': 'Audio',
      'wav': 'Audio',
      'm4a': 'Audio',
      'ogg': 'Audio',
      'ppt': 'Hướng dẫn',
      'pptx': 'Hướng dẫn',
      'xls': 'Bài tập',
      'xlsx': 'Bài tập',
      'txt': 'Tham khảo',
      'jpg': 'Tham khảo',
      'jpeg': 'Tham khảo',
      'png': 'Tham khảo',
      'gif': 'Tham khảo'
    }
    return categoryMap[extension.toLowerCase()] || 'Tài liệu'
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}