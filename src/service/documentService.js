// Document Service API - Vietnamese Literature Education System
const DOCUMENT_API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8084/api'

async function documentApiRequest(endpoint, options = {}) {
  const url = `${DOCUMENT_API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      ...options.headers,
    },
    ...options,
  }

  // Thêm token nếu có trong localStorage.
  // Support multiple possible keys returned by different auth backends.
  const tokenKeys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken', 'refreshToken']
  let token = null
  let tokenKey = null
  for (const k of tokenKeys) {
    const v = localStorage.getItem(k)
    if (v) {
      token = v
      tokenKey = k
      break
    }
  }
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // Debug: log token presence and outgoing Authorization header
  try {
    /* eslint-disable no-console */
  console.log('🔐 documentService - local accessToken present:', !!token, 'keyUsed:', tokenKey)
  console.log('🔐 documentService - outgoing Authorization header:', config.headers['Authorization'])
    /* eslint-enable no-console */
  } catch (e) {
    // ignore logging errors in environments that block console
  }

  try {
    console.log(`🌐 Document API Request: ${config.method || 'GET'} ${url}`)
    console.log(`🔧 Request config:`, config)
    const response = await fetch(url, config)
    
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    console.log(`📄 Document API Response:`, data)
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }
    
    return data
  } catch (error) {
    console.error(`❌ Document API Error: ${error.message}`)
    throw error
  }
}

export const documentService = {
  // ========== CORE DOCUMENT APIs ==========
  
  // GET /api/documents - Lấy danh sách tài liệu
  getDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.category) queryParams.append('category', params.category)
    if (params.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel)
    if (params.subject) queryParams.append('subject', params.subject)
    if (params.fileType) queryParams.append('fileType', params.fileType)
    if (params.search) queryParams.append('search', params.search)
    if (params.page) queryParams.append('page', params.page)
    if (params.size) queryParams.append('size', params.size)
    if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic)
    
    const endpoint = queryParams.toString() ? `/documents?${queryParams}` : '/documents'
    return documentApiRequest(endpoint)
  },

  // GET /api/documents/{id} - Lấy chi tiết tài liệu
  getDocumentById: async (id) => {
    return documentApiRequest(`/documents/${id}`)
  },

  // POST /api/documents - Upload tài liệu mới
  uploadDocument: async (formData) => {
    return documentApiRequest('/documents', {
      method: 'POST',
      headers: {},
      body: formData
    })
  },

  // POST /api/documents/upload-simple - Upload đơn giản
  uploadSimple: async (formData) => {
    return documentApiRequest('/documents/upload-simple', {
      method: 'POST',
      headers: {},
      body: formData
    })
  },

  // POST /api/documents/bulk-upload - Upload hàng loạt
  bulkUpload: async (formData) => {
    return documentApiRequest('/documents/bulk-upload', {
      method: 'POST',
      headers: {},
      body: formData
    })
  },

  // PUT /api/documents/{id} - Cập nhật tài liệu
  updateDocument: async (id, documentData) => {
    return documentApiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData)
    })
  },

  // DELETE /api/documents/{id} - Xóa tài liệu
  deleteDocument: async (id) => {
    return documentApiRequest(`/documents/${id}`, {
      method: 'DELETE'
    })
  },

  // ========== VIEW & STREAM APIs ==========
  
  // GET /api/documents/view/{id} - Xem/Stream nội dung
  viewDocument: async (id) => {
    return documentApiRequest(`/documents/view/${id}`, {
      headers: { accept: '*/*' }
    })
  },

  // GET /api/documents/download/{id} - Tải xuống  
  downloadDocument: async (id) => {
    return documentApiRequest(`/documents/download/${id}`, {
      headers: { accept: 'application/octet-stream' }
    })
  },

  // GET /api/documents/preview/{id} - Xem trước HTML
  getPreviewPage: async (id) => {
    return documentApiRequest(`/documents/preview/${id}`)
  },

  // GET /api/documents/upload-form - Form upload
  getUploadForm: async () => {
    return documentApiRequest('/documents/upload-form')
  },

  // GET /api/documents/test-view - Test viewer
  getTestViewer: async () => {
    return documentApiRequest('/documents/test-view')
  },

  // ========== SEARCH & FILTER APIs ==========
  
  // GET /api/documents/category/{category} - Lọc theo danh mục
  getDocumentsByCategory: async (category) => {
    return documentApiRequest(`/documents/category/${encodeURIComponent(category)}`)
  },

  // GET /api/documents/grade/{gradeLevel} - Lọc theo lớp
  getDocumentsByGrade: async (gradeLevel) => {
    return documentApiRequest(`/documents/grade/${gradeLevel}`)
  },

  // GET /api/documents/type/{fileType} - Lọc theo loại file
  getDocumentsByType: async (fileType) => {
    return documentApiRequest(`/documents/type/${encodeURIComponent(fileType)}`)
  },

  // GET /api/documents/subject/{subject} - Lọc theo môn học  
  getDocumentsBySubject: async (subject) => {
    return documentApiRequest(`/documents/subject/${encodeURIComponent(subject)}`)
  },

  // GET /api/documents/user/{userId} - Lọc theo người dùng
  getDocumentsByUser: async (userId) => {
    return documentApiRequest(`/documents/user/${encodeURIComponent(userId)}`)
  },

  // GET /api/documents/public - Tài liệu công khai
  getPublicDocuments: async () => {
    return documentApiRequest('/documents/public')
  },

  // GET /api/documents/search?keyword={term} - Tìm kiếm toàn văn
  searchDocuments: async (keyword, params = {}) => {
    const queryParams = new URLSearchParams({ keyword })
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    return documentApiRequest(`/documents/search?${queryParams}`)
  },

  // GET /api/documents/filter - Lọc nâng cao  
  filterDocuments: async (filters) => {
    const queryParams = new URLSearchParams()
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    
    return documentApiRequest(`/documents/filter?${queryParams}`)
  },

  // ========== STATISTICS APIs ==========
  
  // GET /api/documents/popular/downloads - Tải nhiều nhất
  getPopularDownloads: async () => {
    return documentApiRequest('/documents/popular/downloads')
  },

  // GET /api/documents/popular/views - Xem nhiều nhất
  getPopularViews: async () => {
    return documentApiRequest('/documents/popular/views')
  },

  // ========== MEDIA APIs ==========
  
  // GET /api/media/preview/{id} - Xem trước media (không tăng view count)
  getMediaPreview: async (id) => {
    return documentApiRequest(`/media/preview/${id}`)
  },

  // GET /api/media/embed/{id} - HTML embed cho media
  getMediaEmbed: async (id) => {
    return documentApiRequest(`/media/embed/${id}`)
  },

  // GET /api/media/player/{id} - Media player đầy đủ tính năng
  getMediaPlayer: async (id) => {
    return documentApiRequest(`/media/player/${id}`)
  },

  // GET /api/media/info/{id} - Thông tin chi tiết media
  getMediaInfo: async (id) => {
    return documentApiRequest(`/media/info/${id}`)
  },

  // GET /api/media/subtitle/{id} - Lấy subtitle cho video
  getMediaSubtitle: async (id) => {
    return documentApiRequest(`/media/subtitle/${id}`)
  },

  // ========== EDUCATIONAL CONTENT APIs ==========
  
  // GET /api/educational/lesson-materials/{gradeLevel}/{subject} - Tài liệu học tập
  getLessonMaterials: async (gradeLevel, subject) => {
    return documentApiRequest(`/educational/lesson-materials/${gradeLevel}/${encodeURIComponent(subject)}`)
  },

  // GET /api/educational/curriculum/{gradeLevel} - Chương trình học
  getCurriculum: async (gradeLevel) => {
    return documentApiRequest(`/educational/curriculum/${gradeLevel}`)
  },

  // GET /api/educational/exercise-materials/{gradeLevel}/{subject} - Bài tập và đề kiểm tra
  getExerciseMaterials: async (gradeLevel, subject) => {
    return documentApiRequest(`/educational/exercise-materials/${gradeLevel}/${encodeURIComponent(subject)}`)
  },

  // GET /api/educational/teaching-materials/{gradeLevel}/{subject} - Tài liệu giảng dạy
  getTeachingMaterials: async (gradeLevel, subject) => {
    return documentApiRequest(`/educational/teaching-materials/${gradeLevel}/${encodeURIComponent(subject)}`)
  },

  // GET /api/educational/multimedia/{gradeLevel}/{subject} - Tài liệu đa phương tiện
  getMultimediaMaterials: async (gradeLevel, subject) => {
    return documentApiRequest(`/educational/multimedia/${gradeLevel}/${encodeURIComponent(subject)}`)
  },

  // GET /api/educational/study-plan/{gradeLevel} - Kế hoạch học tập đề xuất
  getStudyPlan: async (gradeLevel) => {
    return documentApiRequest(`/educational/study-plan/${gradeLevel}`)
  },

  // GET /api/educational/popular-content/{gradeLevel} - Nội dung phổ biến theo lớp
  getPopularContentByGrade: async (gradeLevel) => {
    return documentApiRequest(`/educational/popular-content/${gradeLevel}`)
  },

  // ========== UTILITY FUNCTIONS ==========
  
  // Health check
  healthCheck: async () => {
    return documentApiRequest('/documents/health')
  },

  // API status check
  checkApiStatus: async () => {
    try {
      const response = await fetch(`${DOCUMENT_API_BASE_URL}/documents`)
      return {
        status: response.status,
        ok: response.ok,
        available: true
      }
    } catch (error) {
      return {
        status: 0,
        ok: false,
        available: false,
        error: error.message
      }
    }
  },

  // Lấy URL cho streaming
  getStreamUrl: (id) => `${DOCUMENT_API_BASE_URL}/documents/view/${id}`,
  
  // Lấy URL cho download
  getDownloadUrl: (id) => `${DOCUMENT_API_BASE_URL}/documents/download/${id}`,
  
  // Lấy URL cho media player
  getMediaPlayerUrl: (id) => `${DOCUMENT_API_BASE_URL}/media/player/${id}`,
  
  // Lấy URL cho preview
  getPreviewUrl: (id) => `${DOCUMENT_API_BASE_URL}/documents/preview/${id}`
}

export default documentService

// ---------- Convenience blob helpers (client-side) ----------
// These helpers perform fetch requests with the same Authorization logic
// and return a Blob or open it in a new tab. Useful when you need to
// open/download a protected resource in the browser where window.open
// would not include Authorization headers.

// Fetch a protected endpoint and return a Blob
export async function viewDocumentAsBlob(id) {
  const url = `${DOCUMENT_API_BASE_URL}/documents/view/${id}`
  const tokenKeys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken', 'refreshToken']
  let token = null
  for (const k of tokenKeys) {
    const v = localStorage.getItem(k)
    if (v) { token = v; break }
  }

  const headers = {
    accept: '*/*',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Debug logging to help trace Authorization header propagation
  try { console.log('🔍 viewDocumentAsBlob - fetching', url, 'headers:', headers) } catch (e) {}

  const res = await fetch(url, { method: 'GET', headers })
  try { console.log('🔍 viewDocumentAsBlob - response status:', res.status, 'content-type:', res.headers.get('content-type')) } catch (e) {}
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try { console.error('🔴 viewDocumentAsBlob - non-ok response body:', text) } catch (e) {}
    throw new Error(text || `HTTP error! status: ${res.status}`)
  }
  return await res.blob()
}

// Open a protected document in a new tab by fetching it as a blob first
export async function openDocumentInNewTab(id, filename) {
  const blob = await viewDocumentAsBlob(id)
  const blobUrl = URL.createObjectURL(blob)
  const newWindow = window.open(blobUrl, '_blank')
  // If the browser blocks the popup or it opens in same origin, we can prompt a download fallback
  if (!newWindow) {
    // fallback: trigger download
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename || `document-${id}`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  // Revoke object URL after a delay to allow the browser to load
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}

// Download a protected document as a file (saves to user's disk)
export async function downloadDocumentAsFile(id, filename) {
  const blob = await viewDocumentAsBlob(id)
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename || `document-${id}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

// Fetch preview as blob (useful when preview endpoint returns PDF/binary)
export async function getPreviewAsBlob(id) {
  const url = `${DOCUMENT_API_BASE_URL}/documents/preview/${id}`
  const tokenKeys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken', 'refreshToken']
  let token = null
  for (const k of tokenKeys) {
    const v = localStorage.getItem(k)
    if (v) { token = v; break }
  }
  const headers = { accept: '*/*' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Debug logging to help trace Authorization header propagation
  try { console.log('🔍 getPreviewAsBlob - fetching', url, 'headers:', headers) } catch (e) {}

  const res = await fetch(url, { method: 'GET', headers })
  try { console.log('🔍 getPreviewAsBlob - response status:', res.status, 'content-type:', res.headers.get('content-type')) } catch (e) {}
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try { console.error('🔴 getPreviewAsBlob - non-ok response body:', text) } catch (e) {}
    throw new Error(text || `HTTP error! status: ${res.status}`)
  }
  return await res.blob()
}

// Fetch download as blob (direct download endpoint)
export async function getDownloadAsBlob(id) {
  const url = `${DOCUMENT_API_BASE_URL}/documents/download/${id}`
  const tokenKeys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken', 'refreshToken']
  let token = null
  for (const k of tokenKeys) {
    const v = localStorage.getItem(k)
    if (v) { token = v; break }
  }
  const headers = { accept: 'application/octet-stream' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Debug logging to help trace Authorization header propagation
  try { console.log('🔍 getDownloadAsBlob - fetching', url, 'headers:', headers) } catch (e) {}

  const res = await fetch(url, { method: 'GET', headers })
  try { console.log('🔍 getDownloadAsBlob - response status:', res.status, 'content-type:', res.headers.get('content-type')) } catch (e) {}
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try { console.error('🔴 getDownloadAsBlob - non-ok response body:', text) } catch (e) {}
    throw new Error(text || `HTTP error! status: ${res.status}`)
  }
  return await res.blob()
}