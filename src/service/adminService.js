import { API_BASE_URL } from '../config/apiConfig'

const normalizeBase = (value) => (value ? value.replace(/\/+$/, '') : '')

const DEFAULT_ADMIN_ORIGIN = 'http://localhost:8081'
const CUSTOM_ADMIN_ORIGIN = import.meta.env.VITE_ADMIN_API_ORIGIN
const ADMIN_ORIGIN = normalizeBase(CUSTOM_ADMIN_ORIGIN || DEFAULT_ADMIN_ORIGIN)
const ADMIN_BASE_URL = `${ADMIN_ORIGIN}/api/admin`

const getStoredToken = () => {
  const keys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken']
  for (const key of keys) {
    const value = localStorage.getItem(key)
    if (value) return value
  }
  return null
}

const authorizedAdminRequest = async (path, { method = 'GET', body } = {}) => {
  if (!path.startsWith('/')) {
    throw new Error('Admin path must start with "/"')
  }

  const url = `${ADMIN_BASE_URL}${path}`
  const headers = {
    accept: '*/*',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getStoredToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      mode: 'cors',
      credentials: 'include',
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.clone().json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (jsonErr) {
        try {
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        } catch {
          // ignore
        }
      }
      const error = new Error(errorMessage)
      error.status = response.status
      error.response = response
      throw error
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    const text = await response.text()
    if (!text) return {}
    return { message: text }
  } catch (err) {
    console.error('Admin service request failed:', {
      url,
      method,
      body,
      error: err.message,
      status: err.status,
    })
    throw err
  }
}

export const adminService = {
  getTeacherAccounts: async () => {
    return authorizedAdminRequest('/accounts/teachers')
  },

  getStudentAccounts: async () => {
    return authorizedAdminRequest('/accounts/students')
  },

  getAccountById: async (accountId) => {
    if (!accountId) {
      throw new Error('accountId is required')
    }
    return authorizedAdminRequest(`/accounts/${accountId}`)
  },

  updateAccountStatus: async (accountId, active) => {
    if (!accountId) {
      throw new Error('accountId is required')
    }
    if (typeof active !== 'boolean') {
      throw new Error('active flag must be boolean')
    }

    return authorizedAdminRequest(`/accounts/${accountId}/status`, {
      method: 'PUT',
      body: { active },
    })
  },
}

