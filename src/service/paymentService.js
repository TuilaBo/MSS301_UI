import api from './api'

export const paymentService = {
  // Membership endpoints
  getAllMemberships: async () => {
    return await api.get('/memberships')
  },

  getMembershipsForUser: async (userId) => {
    return await api.get(`/memberships/user/${userId}`)
  },

  getMembershipById: async (id) => {
    return await api.get(`/memberships/${id}`)
  },

  createMembership: async (data) => {
    return await api.post('/memberships', data)
  },

  purchaseMembership: async (data) => {
    return await api.post('/memberships/purchase', data)
  },

  updateMembership: async (id, data) => {
    return await api.put(`/memberships/${id}`, data)
  },

  deleteMembership: async (id) => {
    return await api.delete(`/memberships/${id}`)
  },

  getMembershipByPaymentRef: async (paymentReference) => {
    return await api.get(`/memberships/by-payment/${paymentReference}`)
  },

  // Payment endpoints
  createPayment: async (data) => {
    return await api.post('/payments/vnpay/create', data)
  },

  // Helper to get membership tier info
  getMembershipTierInfo: (tier) => {
    const tiers = {
      BASIC: {
        name: 'Basic',
        price: 10000,
        duration: 30,
        features: [
          'Truy cập giáo án cơ bản',
          'Làm bài tập trực tuyến',
          'Tải tài liệu giới hạn',
          'Hỗ trợ email'
        ],
        color: 'blue',
        icon: '📘'
      },
      SILVER: {
        name: 'Silver',
        price: 30000,
        duration: 90,
        features: [
          'Tất cả tính năng Basic',
          'Truy cập đầy đủ giáo án',
          'Tải tài liệu không giới hạn',
          'Hỗ trợ ưu tiên',
          'Bài tập nâng cao'
        ],
        color: 'gray',
        icon: '🥈'
      },
      GOLD: {
        name: 'Gold',
        price: 50000,
        duration: 180,
        features: [
          'Tất cả tính năng Silver',
          'Video bài giảng HD',
          'Chấm bài tự động',
          'Phân tích tiến độ học tập',
          'Hỗ trợ 24/7'
        ],
        color: 'yellow',
        icon: '🥇'
      },
      PLATINUM: {
        name: 'Platinum',
        price: 100000,
        duration: 365,
        features: [
          'Tất cả tính năng Gold',
          'Tư vấn giảng viên 1-1',
          'Kho tài liệu độc quyền',
          'Lớp học online trực tiếp',
          'Chứng chỉ hoàn thành'
        ],
        color: 'purple',
        icon: '💎'
      }
    }
    return tiers[tier] || tiers.BASIC
  },

  formatPrice: (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  },

  getMembershipStatus: (status) => {
    const statuses = {
      PENDING: { label: 'Đang chờ', color: 'yellow', icon: '⏳' },
      ACTIVE: { label: 'Đang hoạt động', color: 'green', icon: '✅' },
      EXPIRED: { label: 'Đã hết hạn', color: 'red', icon: '❌' },
      CANCELLED: { label: 'Đã hủy', color: 'gray', icon: '🚫' }
    }
    return statuses[status] || statuses.PENDING
  }
}
