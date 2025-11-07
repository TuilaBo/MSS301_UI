import api from './api'

export const authService = {
  login: async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password,
    })
    
    // Lưu token và userId vào localStorage
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
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
    const response = await api.post('/auth/verify', {
      email,
      code,
    })
    
    return response
  },

  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/resend-verification', {
      email,
    })
    
    return response
  },

  logout: () => {
    // Xóa tất cả thông tin trong localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    
    // Trigger storage event để các tab khác cũng cập nhật
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
    return response
  },

  loginWithGoogle: () => {
    // Redirect đến Google OAuth endpoint
    window.location.href = '/oauth2/authorization/google'
  },

  handleOAuthCallback: async (response) => {
    // Xử lý response từ /api/auth/success
    if (response.authenticated && response.token) {
      localStorage.setItem('accessToken', response.token)
      localStorage.setItem('tokenType', 'Bearer')
      
      if (response.user) {
        localStorage.setItem('userId', response.user.userId)
        localStorage.setItem('userName', response.user.username)
        localStorage.setItem('fullName', response.user.fullName)
        localStorage.setItem('email', response.user.email)
        localStorage.setItem('role', response.user.role)
      }
      
      return response
    }
    throw new Error('OAuth authentication failed')
  },
}

