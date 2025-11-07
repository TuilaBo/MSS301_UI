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
      const contentType = response.headers.get('content-type') || ''
      
      try {
        // Try to get response as text first
        const responseText = await response.clone().text()
        
        // Try to parse as JSON
        if (contentType.includes('application/json') || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
            console.error('API Error Response:', errorData)
          } catch (e) {
            // Not valid JSON, use text as error message
            errorMessage = responseText || errorMessage
            console.error('API Error Text (not JSON):', responseText)
          }
        } else {
          // Plain text response
          errorMessage = responseText || errorMessage
          console.error('API Error Text:', responseText)
        }
      } catch (e) {
        console.error('Failed to read error response:', e)
        errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
      }
      
      const error = new Error(errorMessage)
      error.status = response.status
      error.response = response
      throw error
    }

    // Handle response based on content type
    const contentType = response.headers.get('content-type') || ''
    
    // Check if response is JSON
    if (contentType.includes('application/json')) {
      const text = await response.text()
      if (!text || text.trim() === '') {
        return {}
      }
      try {
        return JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse JSON response:', text)
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
      }
    } else {
      // Handle non-JSON response (text/plain, text/html, etc.)
      const text = await response.text()
      if (!text || text.trim() === '') {
        return {}
      }
      
      // Try to parse as JSON first (in case content-type is wrong)
      try {
        return JSON.parse(text)
      } catch (e) {
        // If not JSON, return as text message
        return { message: text }
      }
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

