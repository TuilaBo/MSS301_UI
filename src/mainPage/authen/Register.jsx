import { useState } from 'react'
import { authService } from '../../service/authService'

function Register({ onNavigate }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    email: '',
    gender: 'MALE',
    birthday: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      const response = await authService.register(registerData)
      console.log('Register successful:', response)
      
      setSuccess(true)
      setTimeout(() => {
        // Redirect to login after 2 seconds
        if (onNavigate) {
          onNavigate('login')
        } else {
          window.location.hash = 'login'
        }
      }, 2000)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <h1 className="text-3xl font-bold">📚 Ngữ Văn Việt Nam</h1>
          </div>
          <p className="text-gray-600 text-lg">Đăng ký tài khoản mới</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-amber-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Đăng Ký
          </h2>

          {success && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Đăng ký thành công! Đang chuyển đến trang đăng nhập...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="example@email.com"
                  required
                />
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={formData.gender === 'MALE'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 rounded-xl text-center transition-all ${
                      formData.gender === 'MALE'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">Nam</div>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={formData.gender === 'FEMALE'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 rounded-xl text-center transition-all ${
                      formData.gender === 'FEMALE'
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">Nữ</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-6"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Đã có tài khoản? 
              <a 
                href="#login" 
                onClick={(e) => {
                  e.preventDefault()
                  if (onNavigate) onNavigate('login')
                }}
                className="text-amber-600 hover:text-amber-700 font-medium ml-1"
              >
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

