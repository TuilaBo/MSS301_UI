import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { paymentService } from '../service/paymentService'

function PaymentResult({ onNavigate }) {
  const [status, setStatus] = useState('loading')
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [membership, setMembership] = useState(null)
  const [userName, setUserName] = useState('')
  const [isLoadingMembership, setIsLoadingMembership] = useState(false)

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUserName = localStorage.getItem('userName') || localStorage.getItem('fullName')
    if (storedUserName) {
      setUserName(storedUserName)
    }

    // Parse URL parameters - Check cả window.location.search và hash
    let params;
    
    // Trường hợp 1: Params trong query string thông thường
    if (window.location.search) {
      params = new URLSearchParams(window.location.search)
    } 
    // Trường hợp 2: Params sau hash (hash-based routing)
    else if (window.location.hash.includes('?')) {
      const hashParts = window.location.hash.split('?')
      params = new URLSearchParams(hashParts[1])
    }
    // Trường hợp 3: Không có params
    else {
      setStatus('error')
      return
    }
    
    const responseCode = params.get('vnp_ResponseCode')
    const txnRef = params.get('vnp_TxnRef')
    const transactionNo = params.get('vnp_TransactionNo')
    const amount = params.get('vnp_Amount')
    const bankCode = params.get('vnp_BankCode')

    if (!responseCode || !txnRef) {
      setStatus('error')
      return
    }

    const isSuccess = responseCode === '00'
    setStatus(isSuccess ? 'success' : 'failed')

    setPaymentInfo({
      responseCode,
      txnRef,
      transactionNo,
      bankCode,
      amount: amount ? parseInt(amount) / 100 : 0
    })

    // Try to fetch membership info if payment is successful
    if (isSuccess && txnRef) {
      setIsLoadingMembership(true)
      fetchMembershipByPaymentRef(txnRef)
    }
  }, [])

  const fetchMembershipByPaymentRef = async (txnRef, retryCount = 0) => {
    try {
      const data = await paymentService.getMembershipByPaymentRef(txnRef)
      setMembership(data)
      
      // Nếu status vẫn là PENDING và chưa retry quá 5 lần, thử lại sau 2 giây
      // Vì VNPAY IPN callback có thể chậm hơn returnUrl redirect
      if (data.status === 'PENDING' && retryCount < 5) {
        setTimeout(() => {
          fetchMembershipByPaymentRef(txnRef, retryCount + 1)
        }, 2000) // Retry sau 2 giây
      } else {
        setIsLoadingMembership(false) // Dừng loading khi đã ACTIVE hoặc hết retry
      }
    } catch (err) {
      // Không hiển thị lỗi vì có thể payment không liên quan đến membership
      // Hoặc membership chưa được tạo khi IPN chưa gọi về
      if (retryCount < 5) {
        setTimeout(() => {
          fetchMembershipByPaymentRef(txnRef, retryCount + 1)
        }, 2000)
      } else {
        setIsLoadingMembership(false) // Dừng loading sau khi hết retry
      }
    }
  }

  const getErrorMessage = (code) => {
    const messages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản bị khóa.',
      '13': 'Mật khẩu xác thực giao dịch (OTP) không đúng.',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Lỗi không xác định'
    }
    return messages[code] || `Giao dịch thất bại với mã lỗi: ${code}`
  }

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('home')
    } else {
      window.location.hash = 'home'
    }
  }

  const handleViewMemberships = () => {
    if (onNavigate) {
      onNavigate('my-memberships')
    } else {
      window.location.hash = 'my-memberships'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-xl text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Result Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${
            status === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-pink-600'
          } text-white`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-7xl mb-4"
            >
              {status === 'success' ? '✅' : '❌'}
            </motion.div>
            {userName && (
              <p className="text-xl opacity-90 mb-2">
                🎉 Chúc mừng {userName}!
              </p>
            )}
            <h1 className="text-3xl font-bold mb-2">
              {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>
            <p className="text-lg opacity-90">
              {status === 'success' 
                ? 'Giao dịch của bạn đã được xử lý thành công' 
                : getErrorMessage(paymentInfo?.responseCode)
              }
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8">
            {paymentInfo && (
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-mono font-bold text-gray-800">{paymentInfo.txnRef}</span>
                </div>
                
                {paymentInfo.transactionNo && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Mã thanh toán VNPAY:</span>
                    <span className="font-mono font-bold text-gray-800">{paymentInfo.transactionNo}</span>
                  </div>
                )}

                {paymentInfo.amount > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="text-2xl font-bold text-gray-800">
                      {paymentService.formatPrice(paymentInfo.amount)}
                    </span>
                  </div>
                )}

                {paymentInfo.bankCode && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-bold text-gray-800">{paymentInfo.bankCode}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-bold ${
                    status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {status === 'success' ? 'Thành công' : 'Thất bại'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-bold text-gray-800">
                    {new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            )}

            {/* Membership Info */}
            {status === 'success' && isLoadingMembership && !membership && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 rounded-2xl p-6 mb-6 text-center"
              >
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-3"></div>
                <p className="text-gray-600">
                  ⏳ Đang kích hoạt membership, vui lòng chờ trong giây lát...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  (Đang chờ xác nhận từ cổng thanh toán)
                </p>
              </motion.div>
            )}
            
            {status === 'success' && membership && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">
                    {paymentService.getMembershipTierInfo(membership.tier).icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Membership {paymentService.getMembershipTierInfo(membership.tier).name}
                    </h3>
                    <p className="text-gray-600">
                      {membership.status === 'ACTIVE' ? 'đã được kích hoạt' : 
                       membership.status === 'PENDING' ? 'đang chờ kích hoạt' : 
                       'đã tạo'}
                    </p>
                  </div>
                </div>
                
                {isLoadingMembership && membership.status === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-sm text-yellow-700">
                      Đang chờ xác nhận từ ngân hàng để kích hoạt...
                    </span>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">📅 Ngày kích hoạt</div>
                    <div className="font-bold text-lg text-green-600">
                      {membership.startDate 
                        ? new Date(membership.startDate).toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Đang xử lý'
                      }
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">⏰ Ngày hết hạn</div>
                    <div className="font-bold text-lg text-gray-800">
                      {membership.endDate 
                        ? new Date(membership.endDate).toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Đang xử lý'
                      }
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">⚡ Trạng thái</div>
                    <div className="font-bold text-lg text-purple-600">
                      {membership.status === 'ACTIVE' ? '🟢 Đang hoạt động' : 
                       membership.status === 'PENDING' ? '🟡 Đang xử lý' : 
                       membership.status === 'EXPIRED' ? '🔴 Đã hết hạn' : membership.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {status === 'success' && membership && (
                <button
                  onClick={handleViewMemberships}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Xem Membership của tôi
                </button>
              )}
              <button
                onClick={handleGoHome}
                className={`flex-1 ${
                  status === 'success' && membership
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                } font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
              >
                Về trang chủ
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                💡 Nếu có vấn đề, vui lòng liên hệ hỗ trợ: 
                <a href="tel:1900636636" className="text-blue-600 font-bold ml-1">
                  1900 636 636
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('membership-plans')
                } else {
                  window.location.hash = 'membership-plans'
                }
              }}
              className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Thử lại thanh toán
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default PaymentResult
