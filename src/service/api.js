import { API_BASE_URL } from '../config/apiConfig'

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

  // Thêm token nếu có trong localStorage - hỗ trợ nhiều tên khóa token khác nhau
  const tokenKeys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken']
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

  // Debug: which key provided the token
  try {
    /* eslint-disable no-console */
    console.log('🔐 apiRequest - token present:', !!token, 'keyUsed:', tokenKey)
    console.log('🔐 apiRequest - outgoing Authorization header:', config.headers['Authorization'])
    /* eslint-enable no-console */
  } catch (e) {}

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        // Clone response để tránh lỗi "body stream already read"
        const responseClone = response.clone()
        const errorData = await responseClone.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        console.error('API Error Response:', errorData)
      } catch (e) {
        try {
          const errorText = await response.text()
          console.error('API Error Text:', errorText)
          errorMessage = errorText || errorMessage
        } catch (textError) {
          console.error('Could not read error response:', textError)
        }
      }
      const error = new Error(errorMessage)
      error.status = response.status
      error.response = response
      throw error
    }

    // Handle successful response
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    const text = await response.text()
    if (!text) {
      return {}
    }

    // Try parse JSON even when content-type is wrong, fallback to plain text message
    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.warn('Response is not valid JSON, returning as message:', text)
      return { message: text }
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

