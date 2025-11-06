import { useState } from 'react'
import { motion } from 'framer-motion'
import { paymentService } from '../service/paymentService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MembershipPlans({ onNavigate }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          if (onNavigate) {
            onNavigate('login')
          } else {
            window.location.hash = 'login'
          }
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
      <Navbar onNavigate={onNavigate} />

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
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => {
            const info = paymentService.getMembershipTierInfo(tier)
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
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${colorClasses[info.color]} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                  >
                    {loading ? 'Đang xử lý...' : 'Mua ngay'}
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

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default MembershipPlans
