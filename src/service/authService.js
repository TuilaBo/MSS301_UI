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

  logout: () => {
    localStorage.removeItem('accessToken')
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
}

