import { API_BASE_URL } from '../config/apiConfig'

// Lesson Service
const LESSON_API_BASE_URL = "http://localhost:8083"

async function lessonApiRequest(endpoint, options = {}) {
  const url = `${LESSON_API_BASE_URL}${endpoint}`
  
  // Kiểm tra token trước khi gọi API
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
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      headers: config.headers 
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
        
        // Xử lý các loại lỗi cụ thể
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
    let data
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
        console.log('Lesson API Success Response:', data)
        return data
      } else {
        const text = await response.text()
        return text ? JSON.parse(text) : {}
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError)
      // Nếu không parse được JSON, trả về response text
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

// Lesson API functions
export const lessonService = {
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
  
  // Lấy danh sách tất cả giáo án công khai (không cần token)
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
  
  // Lấy danh sách tất cả giáo án (cần token)
  getAllLessons: () => lessonApiRequest('/lessons'),
  
  // Lấy giáo án theo ID
  getLessonById: (id) => lessonApiRequest(`/lessons/${id}`),
  
  // Tạo giáo án mới
  createLesson: (lessonData) => lessonApiRequest('/lessons', {
    method: 'POST',
    body: JSON.stringify(lessonData)
  }),
  
  // Cập nhật giáo án
  updateLesson: (id, lessonData) => lessonApiRequest(`/lessons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lessonData)
  }),
  
  // Xóa giáo án
  deleteLesson: (id) => lessonApiRequest(`/lessons/${id}`, {
    method: 'DELETE'
  }),
  
  // Tìm kiếm giáo án
  searchLessons: (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString()
    return lessonApiRequest(`/lessons/search?${queryString}`)
  },
  
  // Lấy giáo án theo loại (lessonType)
  getLessonsByType: (lessonType) => lessonApiRequest(`/lessons/type/${lessonType}`),
  
  // Lọc giáo án theo lớp
  getLessonsByGrade: (gradeLevel) => lessonApiRequest(`/lessons/grade/${gradeLevel}`),
  
  // Lọc giáo án (với nhiều tham số)
  filterLessons: (filterParams) => {
    const queryString = new URLSearchParams(filterParams).toString()
    return lessonApiRequest(`/lessons/filter?${queryString}`)
  },
  
  // Lọc giáo án theo thời lượng
  getLessonsByDuration: (durationParams) => {
    const queryString = new URLSearchParams(durationParams).toString()
    return lessonApiRequest(`/lessons/duration?${queryString}`)
  }
}

export { lessonService }
export default lessonService
