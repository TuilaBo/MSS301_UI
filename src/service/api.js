// Sử dụng proxy trong development, absolute URL trong production
// Port 8081: Account Service (auth)
// Port 8082: Payment Service (memberships, payments)
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8081/api'

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      ...options.headers,
    },
    ...options,
  }

  // Thêm token nếu có trong localStorage
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        console.error('API Error Response:', errorData)
      } catch (e) {
        const errorText = await response.text()
        console.error('API Error Text:', errorText)
        errorMessage = errorText || errorMessage
      }
      const error = new Error(errorMessage)
      error.status = response.status
      error.response = response
      throw error
    }

    // Handle empty response
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    }
  } catch (error) {
    console.error('API Request Error:', {
      url,
      method: config.method || 'GET',
      error: error.message,
      status: error.status
    })
    throw error
  }
}

export default {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
}

