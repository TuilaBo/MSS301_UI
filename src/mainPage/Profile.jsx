import { useState, useEffect } from 'react'
import { authService } from '../service/authService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Profile({ onNavigate }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setLoading(true)
    setError('')

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin người dùng')
      console.error('Profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatGender = (gender) => {
    return gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : gender
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
        <Navbar onNavigate={onNavigate} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
        <Navbar onNavigate={onNavigate} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchUserProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl text-white">
                {user?.role?.roleName === 'TEACHER' ? '👩‍🏫' : '👨‍🎓'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.fullName}</h1>
            <p className="text-gray-600">@{user?.username}</p>
            <div className="mt-4">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                user?.role?.roleName === 'TEACHER'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role?.roleName === 'TEACHER' ? 'Giảng Viên' : 'Học Sinh'}
              </span>
              {user?.active && (
                <span className="ml-2 inline-block px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Đang hoạt động
                </span>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-800 font-medium mt-1">{user?.email || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">Giới tính</label>
                <p className="text-gray-800 font-medium mt-1">{formatGender(user?.gender)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                <p className="text-gray-800 font-medium mt-1">
                  {user?.birthday ? formatDate(user.birthday) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-gray-800 font-medium mt-1">#{user?.userId}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">Vai trò</label>
                <p className="text-gray-800 font-medium mt-1">
                  {user?.role?.roleName || 'N/A'}
                </p>
                {user?.role?.description && (
                  <p className="text-sm text-gray-600 mt-1">{user.role.description}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</label>
                <p className="text-gray-800 font-medium mt-1">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>

              {user?.grade && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500">Lớp</label>
                  <p className="text-gray-800 font-medium mt-1">{user.grade}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={() => {
                authService.logout()
                if (onNavigate) {
                  onNavigate('login')
                } else {
                  window.location.hash = 'login'
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default Profile

