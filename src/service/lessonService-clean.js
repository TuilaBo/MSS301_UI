import { API_BASE_URL } from '../config/apiConfig'

// Lesson Service API
const LESSON_API_BASE_URL = "http://localhost:8083"

// Helper function for authenticated API requests
async function lessonApiRequest(endpoint, options = {}) {
  const url = `${LESSON_API_BASE_URL}${endpoint}`
  
  // Check token before API call
  const token = localStorage.getItem('accessToken')
  if (!token) {
    const error = new Error('Bạn cần đăng nhập với tài khoản giáo viên để xem giáo án')
    error.status = 401
    error.code = 'NO_TOKEN'
    throw error
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log('Lesson API Request:', { 
      url, 
      method: config.method || 'GET', 
      hasToken: !!token
    })
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      let errorCode = 'UNKNOWN_ERROR'
      
      try {
        // Clone response để tránh lỗi "body stream already read"
        const responseClone = response.clone()
        const errorData = await responseClone.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        
        // Handle specific error types
        if (response.status === 401) {
          if (errorData.message === 'Missing JWT token' || errorData.message?.includes('JWT')) {
            errorMessage = 'Bạn cần đăng nhập với tài khoản giáo viên để xem giáo án'
            errorCode = 'INVALID_TOKEN'
          } else {
            errorMessage = 'Token đã hết hạn, vui lòng đăng nhập lại'
            errorCode = 'EXPIRED_TOKEN'
          }
        } else if (response.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập giáo án. Vui lòng đăng nhập bằng tài khoản giáo viên'
          errorCode = 'INSUFFICIENT_PERMISSIONS'
        }
        
        console.error('Lesson API Error Response:', errorData)
      } catch (e) {
        try {
          const errorText = await response.text()
          console.error('Lesson API Error Text:', errorText)
          errorMessage = errorText || errorMessage
        } catch (textError) {
          console.error('Could not read error response:', textError)
        }
      }
      
      const error = new Error(errorMessage)
      error.status = response.status
      error.response = response
      error.code = errorCode
      throw error
    }

    // Handle successful response
    const contentType = response.headers.get('content-type')
    try {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log('Lesson API Success Response:', data)
        return data
      } else {
        const text = await response.text()
        return text ? JSON.parse(text) : {}
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError)
      try {
        const text = await response.text()
        return text || {}
      } catch (textError) {
        console.error('Could not read response text:', textError)
        return {}
      }
    }
  } catch (error) {
    console.error('Lesson API Request Error:', {
      url,
      method: config.method || 'GET',
      error: error.message,
      status: error.status,
      code: error.code
    })
    throw error
  }
}

// Lesson Service Object
const lessonService = {
  // Test connection to lesson service (Health check - không cần token)
  testConnection: () => {
    console.log('Testing connection to lesson service...')
    return fetch(`${LESSON_API_BASE_URL}/lessons/public/health`, {
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      }
    })
      .then(response => {
        console.log('Health check response:', response.status, response.statusText)
        return response.ok
      })
      .catch(error => {
        console.error('Health check failed:', error)
        return false
      })
  },
  
  // Get all public lessons (không cần token)
  getAllPublicLessons: () => {
    console.log('Fetching public lessons...')
    return fetch(`${LESSON_API_BASE_URL}/lessons/public/all`, {
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      }
    })
      .then(async response => {
        console.log('Public lessons response:', response.status, response.statusText)
        if (response.ok) {
          const data = await response.json()
          console.log('Public lessons data:', data)
          return data
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      })
      .catch(error => {
        console.error('Public lessons failed:', error)
        throw error
      })
  },
  
  // Get all lessons (cần token)
  getAllLessons: () => lessonApiRequest('/lessons'),
  
  // Get lesson by ID
  getLessonById: (id) => lessonApiRequest(`/lessons/${id}`),
  
  // Create new lesson
  createLesson: (lessonData) => lessonApiRequest('/lessons', {
    method: 'POST',
    body: JSON.stringify(lessonData)
  }),
  
  // Update lesson
  updateLesson: (id, lessonData) => lessonApiRequest(`/lessons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lessonData)
  }),
  
  // Delete lesson
  deleteLesson: (id) => lessonApiRequest(`/lessons/${id}`, {
    method: 'DELETE'
  }),
  
  // Search lessons
  searchLessons: (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString()
    return lessonApiRequest(`/lessons/search?${queryString}`)
  },
  
  // Get lessons by type
  getLessonsByType: (lessonType) => lessonApiRequest(`/lessons/type/${lessonType}`),
  
  // Get lessons by grade
  getLessonsByGrade: (gradeLevel) => lessonApiRequest(`/lessons/grade/${gradeLevel}`),
  
  // Filter lessons with multiple params
  filterLessons: (filterParams) => {
    const queryString = new URLSearchParams(filterParams).toString()
    return lessonApiRequest(`/lessons/filter?${queryString}`)
  },
  
  // Get lessons by duration
  getLessonsByDuration: (durationParams) => {
    const queryString = new URLSearchParams(durationParams).toString()
    return lessonApiRequest(`/lessons/duration?${queryString}`)
  }
}

// Export 
export { lessonService }
export default lessonService
