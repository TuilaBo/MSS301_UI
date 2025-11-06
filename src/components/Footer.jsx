import { motion } from 'framer-motion'

function Footer({ onNavigate }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const footerLinks = {
    platform: [
      { label: 'Trang chủ', action: () => scrollToSection('home') },
      { label: 'Giáo án', action: () => scrollToSection('features') },
      { label: 'Bài tập', action: () => scrollToSection('features') },
      { label: 'Tài liệu', action: () => scrollToSection('features') },
      { label: 'Membership', action: () => onNavigate && onNavigate('membership-plans') },
    ],
    account: [
      { label: 'Đăng nhập', action: () => onNavigate && onNavigate('login') },
      { label: 'Đăng ký', action: () => onNavigate && onNavigate('register') },
      { label: 'Membership của tôi', action: () => onNavigate && onNavigate('my-memberships') },
      { label: 'Quên mật khẩu', action: () => {} },
    ],
    support: [
      { label: 'Hướng dẫn sử dụng', action: () => {} },
      { label: 'FAQ', action: () => {} },
      { label: 'Liên hệ hỗ trợ', action: () => {} },
    ],
  }

  const socialLinks = [
    { icon: '📘', label: 'Facebook', href: '#' },
    { icon: '📧', label: 'Email', href: 'mailto:contact@fpt.edu.vn' },
    { icon: '🌐', label: 'Website', href: 'https://fpt.edu.vn' },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <div className="text-xl font-bold">Văn Học Trực Tuyến</div>
                <div className="text-sm text-gray-400 font-medium">FPT Education</div>
              </div>
            </motion.div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Nền tảng quản lý giáo án và bài tập trực tuyến hàng đầu của FPT Education.
              Kết nối giảng viên và học sinh trong môi trường học tập hiện đại.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : '_self'}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="w-12 h-12 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Nền tảng</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Tài khoản</h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📧</div>
              <div>
                <div className="text-sm text-gray-400">Email</div>
                <div className="text-sm font-medium">contact@fpt.edu.vn</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📞</div>
              <div>
                <div className="text-sm text-gray-400">Hotline</div>
                <div className="text-sm font-medium">1900 636 636</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📍</div>
              <div>
                <div className="text-sm text-gray-400">Địa chỉ</div>
                <div className="text-sm font-medium">FPT Education, Hà Nội</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 <span className="text-blue-400 font-semibold">Văn Học Trực Tuyến</span> - FPT Education.
              Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

