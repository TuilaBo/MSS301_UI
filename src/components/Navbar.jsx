import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthStatus, { isAuthenticated } from './AuthStatus'
import { authService } from '../service/authService'

function Navbar() {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch user info when authenticated
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const authenticated = authService.isAuthenticated()
      setIsAuth(authenticated)
      
      if (authenticated) {
        try {
          const user = await authService.getCurrentUser()
          setUserInfo(user)
        } catch (err) {
          console.error('Failed to fetch user info:', err)
          // If token is invalid, clear auth state
          if (err.status === 401) {
            authService.logout()
            setIsAuth(false)
            setUserInfo(null)
          }
        }
      } else {
        setUserInfo(null)
      }
    }

    checkAuthAndFetchUser()

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuthAndFetchUser()
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Also check on focus
    const handleFocus = () => {
      checkAuthAndFetchUser()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    setIsAuth(false)
    setUserInfo(null)
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const roleName = userInfo?.role?.roleName || localStorage.getItem('role')

  const navItems = [
    { label: 'Trang chủ', href: '/', action: () => navigate('/') },
    { label: 'Giáo án', href: '/lessons', action: () => navigate('/lessons') },
    { label: 'Tài liệu', href: '/documents', action: () => navigate('/documents') },
    { label: 'Bài tập', href: '#features', action: () => scrollToSection('features') },
    { label: 'Membership', href: '/membership', action: () => navigate('/membership') },
    ...(roleName === 'ADMIN'
      ? [{ label: 'Quản trị', href: '/admin', action: () => navigate('/admin') }]
      : []),
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg border-b border-blue-100'
          : 'bg-white/95 backdrop-blur-md border-b border-blue-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg shadow-md">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Văn Học Trực Tuyến
              </div>
              <div className="text-xs text-gray-500 font-medium">FPT Education</div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  item.action()
                }}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuth && userInfo ? (
              <>
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer relative"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                    <span className="text-xl text-white">
                      {userInfo.role?.roleName === 'TEACHER' ? '👩‍🏫' : '👨‍🎓'}
                    </span>
                  </div>
                  {/* Online indicator */}
                  {userInfo.active && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </motion.div>
                {/* User name (optional, can be hidden on smaller screens) */}
                <span className="text-sm text-gray-700 hidden xl:block">
                  {userInfo.fullName || userInfo.username}
                </span>
                <motion.button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng xuất
                </motion.button>
              </>
            ) : (
              <AuthStatus />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-700 hover:text-blue-600 p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pb-4 border-t border-blue-100 mt-2"
          >
            <div className="flex flex-col space-y-2 pt-4">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    item.action()
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t border-blue-100">
                {isAuth && userInfo ? (
                  <>
                    {/* Mobile Avatar */}
                    <div
                      onClick={() => {
                        navigate('/profile')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-2xl text-white">
                          {userInfo.role?.roleName === 'TEACHER' ? '👩‍🏫' : '👨‍🎓'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{userInfo.fullName || userInfo.username}</p>
                        <p className="text-xs text-gray-600">
                          {userInfo.role?.roleName === 'TEACHER' ? 'Giảng Viên' : 'Học Sinh'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <AuthStatus variant="mobile" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

