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
}

