import { useEffect } from 'react'

/**
 * PaymentRedirect - Trang trung gian để chuyển hướng từ backend về frontend
 * 
 * Backend returnUrl sẽ trỏ về: http://localhost:5173/payment-redirect.html
 * Trang này sẽ redirect về: http://localhost:5173/#payment-result?params
 */
function PaymentRedirect() {
  useEffect(() => {
    // Lấy tất cả query params từ URL hiện tại
    const currentParams = new URLSearchParams(window.location.search)
    
    // Chuyển về hash-based route với params
    window.location.href = `/#payment-result?${currentParams.toString()}`
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-xl text-gray-600">Đang xử lý kết quả thanh toán...</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  )
}

export default PaymentRedirect
