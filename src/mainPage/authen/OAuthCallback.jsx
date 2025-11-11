import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { authService } from '../../service/authService'

function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = useSearchParams()[0]
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
        throw new Error('Không thể lấy thông tin người dùng. Token có thể không hợp lệ.')
      }
    }

    const handleOAuthCallback = async () => {
      try {
        // Log toàn bộ URL để debug
        console.log('=== OAuth Callback Debug ===')
        console.log('Full URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        console.log('Search:', window.location.search)
        console.log('Pathname:', window.location.pathname)
        
        // Extract token từ URL - hỗ trợ nhiều format
        // Format 1: http://localhost:5173/#oauth-callback?token=JWT_TOKEN (hash-based)
        // Format 2: http://localhost:5173/oauth-callback?token=JWT_TOKEN (path-based)
        // Format 3: http://localhost:5173/oauth-callback#token=JWT_TOKEN (hash token)
        
        let token = null
        
        // Thử lấy từ hash trước (cho hash-based routing)
        const hash = window.location.hash
        console.log('Hash value:', hash)
        if (hash) {
          // Format: #oauth-callback?token=xxx hoặc #token=xxx
          if (hash.includes('?')) {
            const hashParts = hash.split('?')
            const hashParams = new URLSearchParams(hashParts[1] || '')
            token = hashParams.get('token')
            console.log('Token from hash query:', token ? 'Found' : 'Not found')
          } else if (hash.includes('token=')) {
            // Format: #token=xxx
            const hashParams = new URLSearchParams(hash.replace('#', ''))
            token = hashParams.get('token')
            console.log('Token from hash param:', token ? 'Found' : 'Not found')
          }
        }
        
        // Nếu không có trong hash, thử lấy từ search params (cho path-based routing)
        if (!token) {
          token = searchParams.get('token')
          console.log('Token from searchParams:', token ? 'Found' : 'Not found')
        }
        
        // Nếu vẫn không có, thử lấy từ window.location.search trực tiếp
        if (!token && window.location.search) {
          const urlParams = new URLSearchParams(window.location.search)
          token = urlParams.get('token')
          console.log('Token from location.search:', token ? 'Found' : 'Not found')
        }
        
        // Thử parse từ toàn bộ URL nếu vẫn không có
        if (!token) {
          const fullUrl = window.location.href
          const tokenMatch = fullUrl.match(/[?&#]token=([^&?#]+)/)
          if (tokenMatch) {
            token = decodeURIComponent(tokenMatch[1])
            console.log('Token from URL regex:', token ? 'Found' : 'Not found')
          }
        }
        
        console.log('Final token check:', token ? `Token found (${token.substring(0, 20)}...)` : 'NO TOKEN FOUND')
        console.log('Current localStorage accessToken:', localStorage.getItem('accessToken') ? 'Exists' : 'Not exists')
        
        if (!token) {
          // Kiểm tra error từ URL
          const errorParam = searchParams.get('error') || new URLSearchParams(window.location.search).get('error')
          const errorMessage = searchParams.get('message') || new URLSearchParams(window.location.search).get('message')
          
          console.log('Error param:', errorParam)
          console.log('Error message:', errorMessage)
          
          if (errorParam) {
            throw new Error(errorMessage || 'Đăng nhập với Google thất bại. Vui lòng thử lại.')
          }
          
          // Nếu không có token và không có error, có thể backend chưa redirect đúng
          // Đợi thêm một chút để xem có redirect không
          console.warn('No token found in URL. Waiting 2 seconds to check if backend redirects...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Kiểm tra lại sau khi đợi
          const urlParams = new URLSearchParams(window.location.search)
          token = urlParams.get('token') || new URLSearchParams(window.location.hash.replace('#', '')).get('token')
          
          if (!token) {
            throw new Error('Token không tìm thấy trong URL. Backend có thể chưa redirect đúng. Vui lòng thử đăng nhập lại.')
          }
        }
        
        console.log('OAuth token received:', token.substring(0, 20) + '...')
        
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', token)
        localStorage.setItem('tokenType', 'Bearer')
        console.log('Token saved to localStorage')
        
        // Fetch user info từ /api/auth/me
        console.log('Fetching user info...')
        await fetchAndSaveUserInfo()
        console.log('User info saved successfully')
        
        setStatus('Đăng nhập thành công!')
        
        // Trigger storage event để Navbar cập nhật authentication status
        window.dispatchEvent(new Event('storage'))
        
        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          console.log('Redirecting to /home')
          navigate('/home')
        }, 1000)
      } catch (err) {
        console.error('OAuth callback error:', err)
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          url: window.location.href
        })
        setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
        setStatus('Lỗi')
        
        // Redirect về trang login với error message sau 3 giây
        setTimeout(() => {
          const errorMessage = encodeURIComponent(err.message || 'Đăng nhập thất bại')
          console.log('Redirecting to login with error:', errorMessage)
          navigate(`/login?error=oauth_failed&message=${errorMessage}`)
        }, 3000)
      }
    }

    handleOAuthCallback()
  }, [navigate, searchParams, location])

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

