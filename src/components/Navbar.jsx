import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authService } from '../service/authService'

function Navbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(authService.isAuthenticated())
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check on focus (when user comes back to tab)
    const handleFocus = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const scrollToSection = (id) => {
    // Kiểm tra xem có đang ở HomePage không (check hash hoặc current page)
    const currentHash = window.location.hash.slice(1) || 'home'
    
    // Nếu không ở home page, navigate về home và lưu section id để scroll sau
    if (currentHash !== 'home') {
      // Lưu section id vào sessionStorage để HomePage có thể scroll sau khi load
      sessionStorage.setItem('scrollToSection', id)
      
      if (onNavigate) {
        onNavigate('home')
      } else {
        window.location.hash = 'home'
      }
      
      // Đợi để page render xong rồi scroll
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
          sessionStorage.removeItem('scrollToSection')
        }
      }, 500)
    } else {
      // Nếu đã ở home page, scroll ngay
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setIsMobileMenuOpen(false)
    if (onNavigate) {
      onNavigate('home')
    } else {
      window.location.hash = 'home'
    }
  }

  const navItems = [
    { label: 'Trang chủ', href: '#home', action: () => scrollToSection('home') },
    { label: 'Giáo án', href: '#features', action: () => scrollToSection('features') },
    { label: 'Bài tập', href: '#features', action: () => scrollToSection('features') },
    { label: 'Tài liệu', href: '#features', action: () => scrollToSection('features') },
    { label: 'Membership', href: '#membership-plans', action: () => onNavigate && onNavigate('membership-plans') },
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
            onClick={() => {
              if (onNavigate) {
                onNavigate('home')
              } else {
                window.location.hash = 'home'
              }
            }}
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
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate && onNavigate('profile')}
                  className="px-5 py-2.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  Profile
                </button>
                <motion.button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng xuất
                </motion.button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate && onNavigate('login')}
                  className="px-5 py-2.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  Đăng nhập
                </button>
                <motion.button
                  onClick={() => onNavigate && onNavigate('register')}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng ký
                </motion.button>
              </>
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
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('profile')
                        setIsMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-blue-600 font-medium text-left"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('login')
                        setIsMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-blue-600 font-medium text-left"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('register')
                        setIsMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium"
                    >
                      Đăng ký
                    </button>
                  </>
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

