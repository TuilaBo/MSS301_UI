import api from './api'

export const authService = {
  login: async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password,
    })
    
    // Lưu token vào localStorage
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('tokenType', response.tokenType || 'Bearer')
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
  },

  getToken: () => {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },
}

