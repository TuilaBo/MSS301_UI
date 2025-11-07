import { useEffect, useState } from 'react'
import { authService } from '../../service/authService'

function OAuthCallback({ onNavigate }) {
  const [status, setStatus] = useState('Đang xử lý...')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAndSaveUserInfo = async () => {
      try {
        const userInfo = await authService.getCurrentUser()
        console.log('User info fetched:', userInfo)
        
        // Lưu thông tin user vào localStorage
        if (userInfo.userId) {
          localStorage.setItem('userId', userInfo.userId.toString())
        }
        if (userInfo.username) {
          localStorage.setItem('userName', userInfo.username)
        }
        if (userInfo.fullName) {
          localStorage.setItem('fullName', userInfo.fullName)
        }
        if (userInfo.email) {
          localStorage.setItem('email', userInfo.email)
        }
        if (userInfo.role) {
          const roleName = typeof userInfo.role === 'object' ? userInfo.role.roleName : userInfo.role
          localStorage.setItem('role', roleName)
        }
      } catch (userErr) {
        console.warn('Failed to fetch user info:', userErr)
        // Throw error để handleOAuthCallback có thể xử lý
        throw new Error('Không thể lấy thông tin người dùng. Token có thể không hợp lệ hoặc email chưa được đăng ký.')
      }
    }

    const handleOAuthCallback = async () => {
      try {
        // Extract token từ URL query params
        // URL format: http://localhost:5173/#oauth-callback?token=JWT_TOKEN
        const hash = window.location.hash
        console.log('Current hash:', hash)
        
        // Parse hash để lấy query params
        const hashParts = hash.split('?')
        const urlParams = new URLSearchParams(hashParts[1] || '')
        const token = urlParams.get('token')
        
        console.log('Extracted token:', token ? 'Token found' : 'No token')
        
        if (!token) {
          // Thử lấy từ window.location.search nếu không có trong hash
          const searchParams = new URLSearchParams(window.location.search)
          const tokenFromSearch = searchParams.get('token')
          
          if (tokenFromSearch) {
            // Lưu token vào localStorage
            localStorage.setItem('accessToken', tokenFromSearch)
            localStorage.setItem('tokenType', 'Bearer')
            
            // Fetch user info
            await fetchAndSaveUserInfo()
            
            setStatus('Đăng nhập thành công!')
            window.dispatchEvent(new Event('storage'))
            
            setTimeout(() => {
              if (onNavigate) {
                onNavigate('home')
              } else {
                window.location.hash = 'home'
              }
            }, 1000)
            return
          }
          
          throw new Error('Token không tìm thấy trong URL. Vui lòng thử đăng nhập lại.')
        }
        
        console.log('OAuth token received:', token.substring(0, 20) + '...')
        
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', token)
        localStorage.setItem('tokenType', 'Bearer')
        
        // Fetch user info từ /api/auth/me
        await fetchAndSaveUserInfo()
        
        setStatus('Đăng nhập thành công!')
        
        // Trigger storage event để Navbar cập nhật authentication status
        window.dispatchEvent(new Event('storage'))
        
        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('home')
          } else {
            window.location.hash = 'home'
          }
        }, 1000)
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
        setStatus('Lỗi')
        
        // Redirect về trang login sau 3 giây
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('login')
          } else {
            window.location.hash = 'login'
          }
        }, 3000)
      }
    }

    handleOAuthCallback()
  }, [onNavigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-amber-100 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Đăng nhập thất bại</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">Đang chuyển về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{status}</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default OAuthCallback

