import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { paymentService } from '../service/paymentService'
import { authService } from '../service/authService'
import { testApiConnections, displayApiStatus } from '../utils/apiTest'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MembershipPlans() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [memberships, setMemberships] = useState([])
  const [fetchingMemberships, setFetchingMemberships] = useState(true)
  const [apiTestResults, setApiTestResults] = useState(null)
  const [userRole, setUserRole] = useState(null)

  // Test API connections
  const handleTestApi = async () => {
    console.log('🧪 Manual API test triggered')
    const results = await testApiConnections()
    setApiTestResults(results)
    displayApiStatus(results)
  }

  // Check user role
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user && user.role) {
          setUserRole(user.role.roleName)
        }
      } catch (err) {
        console.error('Error checking user role:', err)
      }
    }
    checkUserRole()
  }, [])

  // Fetch memberships from API
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setFetchingMemberships(true)
        console.log('🚀 Fetching memberships from API...')
        
        const response = await paymentService.getAllMemberships()
        console.log('📦 Memberships API Response:', response)
        
        // Handle different response structures
        let membershipData = []
        if (response && response.data && Array.isArray(response.data)) {
          membershipData = response.data
        } else if (response && Array.isArray(response)) {
          membershipData = response
        } else {
          console.warn('⚠️ Unexpected membership API response:', response)
          membershipData = []
        }
        
        setMemberships(membershipData)
        console.log('✅ Memberships loaded:', membershipData)
      } catch (err) {
        console.error('❌ Error fetching memberships:', err)
        setError('Không thể tải danh sách gói membership từ server. Hiển thị dữ liệu mẫu.')
        // Fallback to default tiers if API fails
        setMemberships([])
      } finally {
        setFetchingMemberships(false)
      }
    }

    fetchMemberships()
  }, [])

  const tiers = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM']

  const handlePurchase = async (tier) => {
    setError('')
    setLoading(true)

    try {
      // Check if user is logged in
      const userId = localStorage.getItem('userId')
      const accessToken = localStorage.getItem('accessToken')
      
      if (!userId || !accessToken) {
        setLoading(false)
        setError('Vui lòng đăng nhập để mua gói membership')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
        return
      }

      // Call purchase API
      const response = await paymentService.purchaseMembership({
        userId: parseInt(userId),
        tier: tier
      })

      // Redirect to VNPAY payment page
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl
      } else {
        setError('Không nhận được link thanh toán. Vui lòng thử lại.')
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Chọn gói <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Membership</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nâng cấp tài khoản của bạn để truy cập đầy đủ tính năng và tài liệu học tập
          </p>
          
          {/* API Test Button - Development only */}
          {import.meta.env.DEV && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleTestApi}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                🧪 Test API Connections
              </button>
            </div>
          )}
          
          {/* API Test Results */}
          {apiTestResults && (
            <div className="mt-4 max-w-md mx-auto bg-gray-50 p-4 rounded-lg text-sm">
              <div className="font-semibold mb-2">API Status:</div>
              <div className="flex justify-between items-center">
                <span>Payment Service:</span>
                <span className={`font-mono ${apiTestResults.payment.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {apiTestResults.payment.status === 'success' ? '✅ Connected' : '❌ Failed'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Document Service:</span>
                <span className={`font-mono ${apiTestResults.document.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {apiTestResults.document.status === 'success' ? '✅ Connected' : '❌ Failed'}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Teacher Notice */}
        {userRole === 'TEACHER' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 px-6 py-6 rounded-lg shadow-md"
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">👨‍🏫</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  Thông báo dành cho Giảng Viên
                </h3>
                <p className="text-orange-700 mb-4">
                  Tính năng Membership chỉ dành cho Học Sinh. Giảng viên vui lòng sử dụng các tính năng dành riêng cho giáo viên.
                </p>
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Về Teacher Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {fetchingMemberships && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"
              />
              Đang tải dữ liệu gói membership...
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => {
            // Try to find API data first, fallback to static data
            const apiMembership = memberships.find(m => m.tier === tier)
            const staticInfo = paymentService.getMembershipTierInfo(tier)
            
            // Use API data if available, otherwise use static data
            const info = apiMembership ? {
              name: staticInfo.name,
              price: apiMembership.price || staticInfo.price,
              duration: apiMembership.duration || staticInfo.duration,
              features: apiMembership.features || staticInfo.features,
              color: staticInfo.color,
              icon: staticInfo.icon
            } : staticInfo

            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              gray: 'from-gray-400 to-gray-600', 
              yellow: 'from-yellow-500 to-orange-500',
              purple: 'from-purple-600 to-pink-600'
            }

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                  tier === 'PLATINUM' ? 'ring-4 ring-purple-300 transform lg:scale-105' : ''
                }`}
              >
                {tier === 'PLATINUM' && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 font-bold text-sm">
                    ⭐ PHỔ BIẾN NHẤT ⭐
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">{info.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-800">{info.name}</h3>
                    {apiMembership && (
                      <div className="text-xs text-green-600 mt-1">✓ API Data</div>
                    )}
                    {!apiMembership && memberships.length === 0 && !fetchingMemberships && (
                      <div className="text-xs text-yellow-600 mt-1">⚠️ Static Data</div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      {paymentService.formatPrice(info.price)}
                    </div>
                    <div className="text-gray-600">
                      {info.duration} ngày
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {info.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(tier)}
                    disabled={loading || userRole === 'TEACHER'}
                    className={`w-full bg-gradient-to-r ${colorClasses[info.color]} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                  >
                    {loading ? 'Đang xử lý...' : userRole === 'TEACHER' ? 'Chỉ dành cho Học Sinh' : 'Mua ngay'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ❓ Câu hỏi thường gặp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Thanh toán như thế nào?</h4>
              <p className="text-gray-600 text-sm">
                Chúng tôi hỗ trợ thanh toán qua VNPAY với đa dạng phương thức: ATM, Visa, MasterCard, QR Code.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Có thể hủy membership không?</h4>
              <p className="text-gray-600 text-sm">
                Membership sẽ tự động hết hạn khi kết thúc chu kỳ. Bạn có thể gia hạn bất cứ lúc nào.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Bảo mật thông tin?</h4>
              <p className="text-gray-600 text-sm">
                Tất cả giao dịch được mã hóa và xử lý qua cổng thanh toán VNPAY an toàn.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Hỗ trợ khách hàng?</h4>
              <p className="text-gray-600 text-sm">
                Liên hệ hotline 1900 636 636 hoặc email contact@fpt.edu.vn để được hỗ trợ.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

export default MembershipPlans
