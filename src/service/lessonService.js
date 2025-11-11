import { API_BASE_URL } from '../config/apiConfig'

// Lesson Service API
const LESSON_API_BASE_URL = "http://localhost:8083"

const buildDefaultHeaders = () => {
  const token = localStorage.getItem('accessToken')
  const headers = {
    'Content-Type': 'application/json',
    accept: '*/*',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// Helper function for authenticated API requests
async function lessonApiRequest(endpoint, options = {}) {
  const url = `${LESSON_API_BASE_URL}${endpoint}`
  
  // Check token before API call - but allow some endpoints without token
  const token = localStorage.getItem('accessToken')
  const isPublicEndpoint = endpoint.includes('/public/') || endpoint === '/lessons' && options.method === undefined
  
  console.log('=== lessonApiRequest DEBUG ===')
  console.log('Endpoint:', endpoint)
  console.log('URL:', url)
  console.log('Token exists:', !!token)
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token')
  console.log('Is public endpoint:', isPublicEndpoint)
  console.log('Method:', options.method || 'GET')
  
  if (!token && !isPublicEndpoint) {
    const error = new Error('Bạn cần đăng nhập với tài khoản giáo viên để xem giáo án')
    error.status = 401
    error.code = 'NO_TOKEN'
    throw error
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      ...options.headers,
    },
    ...options,
  }
  
  // Only add Authorization header if we have a token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
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
  // Debug: Check current authentication status
  checkAuthStatus: () => {
    const token = localStorage.getItem('accessToken')
    console.log('=== AUTH STATUS CHECK ===')
    console.log('Token exists:', !!token)
    console.log('Token preview:', token ? `${token.substring(0, 50)}...` : 'No token')
    console.log('localStorage keys:', Object.keys(localStorage))
    
    // Try to parse JWT payload (for debug)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload)
        console.log('Token expires:', new Date(payload.exp * 1000))
        console.log('Token expired:', Date.now() > payload.exp * 1000)
      } catch (e) {
        console.log('Could not parse token:', e.message)
      }
    }
    
    return !!token
  },

  // Debug: Test authenticated API directly
  testAuthenticatedAPI: async () => {
    console.log('=== TESTING AUTHENTICATED API ===')
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
      return { success: false, error: 'No token found' }
    }
    
    try {
      const response = await fetch(`${LESSON_API_BASE_URL}/lessons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Direct auth test response:', response.status, response.statusText)
      console.log('Response headers:', [...response.headers.entries()])
      
      if (response.ok) {
        const data = await response.json()
        console.log('Auth test data:', data)
        return { success: true, data }
      } else {
        const errorText = await response.text()
        console.log('Auth test error:', errorText)
        return { success: false, error: `${response.status}: ${errorText}` }
      }
    } catch (error) {
      console.error('Auth test failed:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Test connection to lesson service (Health check - không cần token)
  testConnection: () => {
    console.log('Testing connection to lesson service...')
    return fetch(`${LESSON_API_BASE_URL}/lessons/public/health`, {
      headers: buildDefaultHeaders()
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
      headers: buildDefaultHeaders()
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
  
  // Get all lessons (cần token) với fallback
  getAllLessons: async () => {
    console.log('=== getAllLessons called ===')
    
    // Check auth status first
    const hasToken = lessonService.checkAuthStatus()
    
    if (!hasToken) {
      console.log('No token, falling back to public lessons')
      return lessonService.getAllPublicLessons()
    }
    
    try {
      console.log('Attempting authenticated request to /lessons')
      return await lessonApiRequest('/lessons')
    } catch (error) {
      console.error('Authenticated request failed:', error)
      
      // If 403/401, try public API as fallback
      if (error.status === 403 || error.status === 401) {
        console.log('Auth failed, falling back to public lessons')
        try {
          return await lessonService.getAllPublicLessons()
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          throw error // throw original error
        }
      }
      
      throw error
    }
  },
  
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
  
  // DISABLED: Search and filter moved to client-side
  // searchLessons: (searchParams) => {
  //   const queryString = new URLSearchParams(searchParams).toString()
  //   return lessonApiRequest(`/lessons/search?${queryString}`)
  // },
  
  // Get lessons by type
  getLessonsByType: (lessonType) => lessonApiRequest(`/lessons/type/${lessonType}`),
  
  // Get lessons by grade
  getLessonsByGrade: (gradeLevel) => lessonApiRequest(`/lessons/grade/${gradeLevel}`),
  
  // DISABLED: Filter moved to client-side
  // filterLessons: (filterParams) => {
  //   const queryString = new URLSearchParams(filterParams).toString()
  //   return lessonApiRequest(`/lessons/filter?${queryString}`)
  // },
  
  // Get lessons by duration
  getLessonsByDuration: (durationParams) => {
    const queryString = new URLSearchParams(durationParams).toString()
    return lessonApiRequest(`/lessons/duration?${queryString}`)
  }
}

// Export 
export { lessonService }
export default lessonService
