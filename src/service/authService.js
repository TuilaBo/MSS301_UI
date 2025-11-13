import api from './api'
import { API_BASE_URL } from '../config/apiConfig'

const normalizeBase = (value) => (value ? value.replace(/\/+$/, '') : '')

const DEFAULT_AUTH_ORIGIN = 'http://localhost:8081'
const AUTH_ORIGIN = normalizeBase(import.meta.env.VITE_AUTH_API_ORIGIN || DEFAULT_AUTH_ORIGIN)
const AUTH_BASE_URL = `${AUTH_ORIGIN}/api/auth`

const buildAuthUrl = (path) => {
  if (!path.startsWith('/')) {
    throw new Error('Path must start with /')
  }
  if (API_BASE_URL.startsWith('/api')) {
    return `${AUTH_BASE_URL}${path}`
  }
  const cleanedBase = normalizeBase(API_BASE_URL)
  return `${cleanedBase}${path}`
}

const unauthenticatedJsonPost = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
      body: JSON.stringify(payload),
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
      throw error
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    const text = await response.text()
    if (!text) {
      return {}
    }
    return { message: text }
  } catch (err) {
    console.error('Unauthenticated POST error:', {
      url,
      payload,
      error: err.message,
      status: err.status,
    })
    throw err
  }
}

const persistUserProfile = (user) => {
  if (!user || typeof user !== 'object') return

  if (user.userId !== undefined && user.userId !== null) {
    localStorage.setItem('userId', String(user.userId))
  }

  if (user.username) {
    localStorage.setItem('userName', user.username)
  }

  if (user.fullName) {
    localStorage.setItem('fullName', user.fullName)
  }

  if (user.email) {
    localStorage.setItem('email', user.email)
  }

  if (user.role) {
    const roleName = typeof user.role === 'object' ? user.role.roleName : user.role
    if (roleName) {
      localStorage.setItem('role', roleName)
    }
  }

  if (user.grade) {
    localStorage.setItem('grade', user.grade)
  }

  if (user.gender) {
    localStorage.setItem('gender', user.gender)
  }

  if (user.active !== undefined) {
    localStorage.setItem('active', String(!!user.active))
  }
}

export const authService = {
  login: async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password,
    })
    
    // Lưu token và userId vào localStorage
    // Hỗ trợ nhiều tên field token trả về từ backend: accessToken, access_token, token, jwt
    const tokenCandidateKeys = ['accessToken', 'access_token', 'token', 'jwt', 'idToken']
    let tokenValue = null
    for (const k of tokenCandidateKeys) {
      if (response[k]) {
        tokenValue = response[k]
        break
      }
    }
    if (tokenValue) {
      localStorage.setItem('accessToken', tokenValue)
      localStorage.setItem('tokenType', response.tokenType || 'Bearer')
    }
    
    // Lưu userId nếu có trong response
    if (response.userId !== undefined && response.userId !== null) {
      localStorage.setItem('userId', String(response.userId))
    }
    
    // Lưu userName/fullName nếu có trong response
    if (response.fullName) {
      localStorage.setItem('userName', response.fullName)
      localStorage.setItem('fullName', response.fullName)
    } else if (response.username) {
      localStorage.setItem('userName', response.username)
    }

    if (response.role) {
      const roleName = typeof response.role === 'object' ? response.role.roleName : response.role
      if (roleName) {
        localStorage.setItem('role', roleName)
      }
    }
    
    return response
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', {
      username: userData.username,
      fullName: userData.fullName,
      password: userData.password,
      email: userData.email,
      gender: userData.gender,
      birthday: userData.birthday,
    })
    
    return response
  },

  registerTeacher: async (userData) => {
    const response = await api.post('/auth/register-teacher', {
      username: userData.username,
      fullName: userData.fullName,
      password: userData.password,
      email: userData.email,
      gender: userData.gender,
      birthday: userData.birthday,
    })

    return response
  },

  verifyEmail: async (email, code) => {
    if (!email || !code) {
      throw new Error('Email và mã xác minh là bắt buộc.')
    }

    const endpoint = buildAuthUrl('/verify')
    const response = await unauthenticatedJsonPost(endpoint, { email, code })

    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  },

  resendVerificationCode: async (email) => {
    if (!email) {
      throw new Error('Email là bắt buộc để gửi lại mã xác minh.')
    }

    const endpoint = buildAuthUrl('/resend-verification')
    const response = await unauthenticatedJsonPost(endpoint, { email })

    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  },

  forgotPassword: async (email) => {
    if (!email) {
      throw new Error('Email is required để gửi yêu cầu quên mật khẩu.')
    }

    const endpoint = buildAuthUrl('/forgot-password')
    const response = await unauthenticatedJsonPost(endpoint, { email })

    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  },

  resetPassword: async (token, newPassword) => {
    if (!token || !newPassword) {
      throw new Error('Token và mật khẩu mới là bắt buộc để đặt lại mật khẩu.')
    }

    const endpoint = buildAuthUrl('/reset-password')
    const response = await unauthenticatedJsonPost(endpoint, { token, newPassword })

    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  },

  logout: () => {
    // Remove common token keys as well
    localStorage.removeItem('accessToken')
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('jwt')
    localStorage.removeItem('idToken')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    localStorage.removeItem('grade')
    localStorage.removeItem('gender')
    localStorage.removeItem('active')
    window.dispatchEvent(new Event('storage'))
  },

  getToken: () => {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    persistUserProfile(response)
    return response
  },

  loginWithGoogle: () => {
    // Redirect đến OAuth2 endpoint qua API Gateway
    // OAuth2 redirect phải dùng absolute URL để browser tự redirect đến Google
    // Không thể dùng relative URL vì proxy không follow OAuth2 redirects đúng cách
    const oauthUrl = import.meta.env.VITE_API_ORIGIN 
      ? `${import.meta.env.VITE_API_ORIGIN}/api/auth/oauth2/authorization/google`
      : 'http://localhost:8888/api/auth/oauth2/authorization/google'
    
    console.log('Redirecting to OAuth2 endpoint:', oauthUrl)
    window.location.href = oauthUrl
  },
}

