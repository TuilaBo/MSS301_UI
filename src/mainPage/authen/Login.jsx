import { useState } from 'react'
import { authService } from '../../service/authService'

function Login({ onNavigate }) {
  const handleGoogleLogin = () => {
    authService.loginWithGoogle()
  }
  const [userType, setUserType] = useState('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(username, password)
      
      // Lưu userId vào localStorage (nếu backend không trả về, dùng giá trị mock)
      if (!localStorage.getItem('userId')) {
        // Mock userId cho testing - trong production backend phải trả về
        localStorage.setItem('userId', '1')
      }
      
      // Trigger storage event để Navbar cập nhật authentication status
      window.dispatchEvent(new Event('storage'))
      
      // Chuyển đến trang chủ sau khi đăng nhập thành công
      if (onNavigate) {
        onNavigate('home')
      } else {
        window.location.hash = 'home'
      }
    } catch (err) {
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      
      if (err.status === 403) {
        errorMessage = 'Không có quyền truy cập. Vui lòng kiểm tra backend server hoặc liên hệ quản trị viên.'
      } else if (err.status === 401) {
        errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.'
      } else if (err.message && err.message.includes('Failed to fetch')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra xem backend server có đang chạy không.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Login error:', {
        message: err.message,
        status: err.status,
        error: err
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <h1 className="text-3xl font-bold">📚 Ngữ Văn Việt Nam</h1>
          </div>
          <p className="text-gray-600 text-lg">Hệ thống quản lý giáo án và bài tập</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-amber-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Đăng Nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div className="flex gap-4 mb-6">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`p-4 rounded-xl text-center transition-all ${
                    userType === 'student'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-2">👨‍🎓</div>
                  <div className="font-semibold">Học Sinh</div>
                </div>
              </label>

              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`p-4 rounded-xl text-center transition-all ${
                    userType === 'teacher'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-2">👩‍🏫</div>
                  <div className="font-semibold">Giảng Viên</div>
                </div>
              </label>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tên đăng nhập / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Nhập tên đăng nhập hoặc email"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a
                href="#"
                className="text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                Quên mật khẩu?
              </a>
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
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Đăng nhập bằng Google</span>
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Chưa có tài khoản? 
              <a 
                href="#register" 
                onClick={(e) => {
                  e.preventDefault()
                  if (onNavigate) onNavigate('register')
                }}
                className="text-amber-600 hover:text-amber-700 font-medium ml-1"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">📖</div>
            <div className="text-sm font-medium text-gray-700">Xem Giáo Án</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">✍️</div>
            <div className="text-sm font-medium text-gray-700">Làm Bài Tập</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

