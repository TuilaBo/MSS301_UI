const QUESTION_SERVICE_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_QUESTION_SERVICE_URL || 'http://localhost:8084/api'

async function questionServiceRequest(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${QUESTION_SERVICE_BASE_URL}${normalizedEndpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
      ...options.headers,
    },
    ...options,
  }

  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorPayload = await response.text()
      const message = errorPayload || `HTTP error! status: ${response.status}`
      const error = new Error(message)
      error.status = response.status
      throw error
    }

    const contentType = response.headers.get('content-type') || ''
    const body = await response.text()
    if (!body) {
      return {}
    }

    if (contentType.includes('application/json')) {
      return JSON.parse(body)
    }

    try {
      return JSON.parse(body)
    } catch (_err) {
      return { message: body }
    }
  } catch (error) {
    console.error('Question Service Request Error:', {
      url,
      method: config.method || 'GET',
      message: error.message,
      status: error.status,
    })
    throw error
  }
}

const testServiceApi = {
  get: (endpoint, options) => questionServiceRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) =>
    questionServiceRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint, data, options) =>
    questionServiceRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (endpoint, options) => questionServiceRequest(endpoint, { ...options, method: 'DELETE' }),
}

export default testServiceApi
