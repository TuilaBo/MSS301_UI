import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../service/authService'

function Login() {
  const navigate = useNavigate()
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
      
      // Chuyển đến trang chủ sau khi đăng nhập thành công
      navigate('/home')
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

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Chưa có tài khoản? 
              <a 
                href="#register" 
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/register')
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

