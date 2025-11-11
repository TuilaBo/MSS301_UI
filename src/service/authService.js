import api from './api'

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
    if (response.userId) {
      localStorage.setItem('userId', response.userId)
    }
    
    // Lưu userName/fullName nếu có trong response
    if (response.fullName) {
      localStorage.setItem('userName', response.fullName)
      localStorage.setItem('fullName', response.fullName)
    } else if (response.username) {
      localStorage.setItem('userName', response.username)
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
    // Endpoint không yêu cầu token, nên gửi request riêng không cần auth header
    const response = await api.post('/auth/verify', { email, code }, {
      headers: {
        Authorization: undefined,
      },
    })

    // Một số backend trả plain text nên đảm bảo trả về message
    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  },

  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/resend-verification', { email }, {
      headers: {
        Authorization: undefined,
      },
    })

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
  },

  getToken: () => {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
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

