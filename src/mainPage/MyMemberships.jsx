import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { paymentService } from '../service/paymentService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MyMemberships({ onNavigate }) {
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMemberships()
  }, [])

  const fetchMemberships = async () => {
    setLoading(true)
    setError('')

    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setError('Vui lòng đăng nhập để xem membership của bạn')
        return
      }

      const data = await paymentService.getMembershipsForUser(parseInt(userId))
      setMemberships(data)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách membership')
    } finally {
      setLoading(false)
    }
  }

  const getActiveMembership = () => {
    return memberships.find(m => m.status === 'ACTIVE')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const activeMembership = getActiveMembership()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Membership của tôi
          </h1>
          <p className="text-xl text-gray-600">
            Quản lý gói membership và xem lịch sử thanh toán
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Active Membership Card */}
            {activeMembership ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-5xl">
                          {paymentService.getMembershipTierInfo(activeMembership.tier).icon}
                        </span>
                        <div>
                          <h2 className="text-3xl font-bold">
                            {paymentService.getMembershipTierInfo(activeMembership.tier).name}
                          </h2>
                          <p className="text-purple-100">Membership đang hoạt động</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                        <span className="text-2xl font-bold">
                          ✅ {paymentService.getMembershipStatus(activeMembership.status).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="text-purple-200 mb-2">Ngày bắt đầu</div>
                      <div className="text-2xl font-bold">{formatDate(activeMembership.startDate)}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="text-purple-200 mb-2">Ngày hết hạn</div>
                      <div className="text-2xl font-bold">{formatDate(activeMembership.endDate)}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="text-purple-200 mb-2">Số ngày còn lại</div>
                      <div className="text-2xl font-bold">
                        {getDaysRemaining(activeMembership.endDate)} ngày
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('membership-plans')
                        } else {
                          navigate('/membership-plans')
                        }
                      }}
                      className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Nâng cấp gói
                    </button>
                    <button
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('membership-plans')
                        } else {
                          navigate('/membership-plans')
                        }
                      }}
                      className="bg-purple-700 hover:bg-purple-800 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Gia hạn
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-2xl shadow-lg mb-12"
              >
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Bạn chưa có membership nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Nâng cấp tài khoản để truy cập đầy đủ tính năng
                </p>
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('membership-plans')
                    } else {
                      navigate('/membership-plans')
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Chọn gói Membership
                </button>
              </motion.div>
            )}

            {/* Membership History */}
            {memberships.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử Membership</h2>
                <div className="space-y-4">
                  {memberships.map((membership, index) => {
                    const tierInfo = paymentService.getMembershipTierInfo(membership.tier)
                    const statusInfo = paymentService.getMembershipStatus(membership.status)

                    return (
                      <motion.div
                        key={membership.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="text-4xl">{tierInfo.icon}</div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {tierInfo.name} Membership
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {formatDate(membership.startDate)} - {formatDate(membership.endDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right mr-4">
                              <div className="text-sm text-gray-600">Số tiền</div>
                              <div className="text-lg font-bold text-gray-800">
                                {paymentService.formatPrice(membership.pricePaid || 0)}
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700 font-medium text-sm`}>
                              {statusInfo.icon} {statusInfo.label}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default MyMemberships
