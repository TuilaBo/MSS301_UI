import { useState, useEffect } from 'react'
import { authService } from '../../service/authService'

function Register({ onNavigate }) {
  const [userType, setUserType] = useState('student') // 'student' or 'teacher'
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
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

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
      
      if (userType === 'teacher') {
        // Đăng ký teacher - cần xác minh email
        const response = await authService.registerTeacher(registerData)
        console.log('Teacher register successful:', response)
        // Response có thể là object hoặc text message
        if (response && response.message) {
          console.log('Response message:', response.message)
        }
        setShowVerification(true)
        setSuccess(false) // Không hiển thị success message vì cần xác minh
      } else {
        // Đăng ký student - cũng cần xác minh email
        const response = await authService.register(registerData)
        console.log('Student register successful:', response)
        // Response có thể là object hoặc text message
        if (response && response.message) {
          console.log('Response message:', response.message)
        }
        // Hiển thị form xác minh email cho student
        setShowVerification(true)
        setSuccess(false) // Không hiển thị success message vì cần xác minh
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setVerifying(true)

    try {
      const response = await authService.verifyEmail(formData.email, verificationCode)
      console.log('Email verification successful:', response)
      
      setSuccess(true)
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('login')
        } else {
          window.location.hash = 'login'
        }
      }, 2000)
    } catch (err) {
      setError(err.message || 'Mã xác minh không đúng. Vui lòng thử lại.')
      console.error('Verification error:', err)
    } finally {
      setVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setResending(true)

    try {
      const response = await authService.resendVerificationCode(formData.email)
      console.log('Resend verification successful:', response)
      
      // Set cooldown 60 giây
      setResendCooldown(60)
      
      // Hiển thị thông báo thành công
      setError('')
      alert('Mã xác minh mới đã được gửi đến email của bạn!')
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã xác minh. Vui lòng thử lại sau.')
      console.error('Resend verification error:', err)
    } finally {
      setResending(false)
    }
  }

  // Countdown timer cho resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

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


          {showVerification ? (
            // Verification Form
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">✅ Đăng ký thành công!</p>
                <p className="text-sm mt-1">Mã xác minh đã được gửi đến email: <strong>{formData.email}</strong></p>
                <p className="text-sm mt-2">Vui lòng kiểm tra hộp thư và nhập mã xác minh bên dưới để hoàn tất đăng ký.</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mã xác minh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-center text-2xl tracking-widest"
                  placeholder="Nhập mã 6 số"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending || resendCooldown > 0}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {resending ? (
                      'Đang gửi...'
                    ) : resendCooldown > 0 ? (
                      `Gửi lại mã (${resendCooldown}s)`
                    ) : (
                      'Gửi lại mã xác minh'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-6"
              >
                {verifying ? 'Đang xác minh...' : 'Xác minh Email'}
              </button>

              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
              >
                Quay lại
              </button>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleSubmit} className="space-y-4">
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
          )}

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

