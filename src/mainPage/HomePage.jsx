import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function HomePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-amber-50 to-orange-50">
      <Navbar onNavigate={onNavigate} />

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight"
          >
            Quản lý giáo án và bài tập{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Ngữ văn
            </span>{' '}
            hiệu quả
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Nền tảng quản lý giáo án và bài tập trực tuyến dành cho giảng viên và học sinh.
            Tạo, chia sẻ và quản lý tài liệu học tập một cách dễ dàng và hiệu quả.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => onNavigate && onNavigate('login')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Bắt Đầu Ngay
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Giải pháp toàn diện cho việc quản lý và học tập môn Ngữ văn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200"
          >
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Quản lý giáo án
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Tạo và chia sẻ giáo án môn Ngữ văn một cách dễ dàng. Quản lý nội dung bài giảng,
              tài liệu tham khảo và lịch học tập một cách hiệu quả.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200"
          >
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Bài tập & Assignment
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Giao và nộp bài trực tuyến. Theo dõi tiến độ làm bài của học sinh,
              chấm điểm và nhận xét một cách nhanh chóng và thuận tiện.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200"
          >
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Tài liệu học tập
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Truy cập và tải giáo trình nhanh chóng. Kho tài liệu phong phú với
              các tác phẩm văn học, bài phân tích và tài liệu tham khảo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonial/Quote Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-100 via-blue-50 to-amber-100 rounded-3xl p-12 md:p-16 text-center shadow-xl border border-blue-200"
        >
          <div className="text-6xl mb-6">💭</div>
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-800 mb-6 italic leading-relaxed">
            "Văn học là nhân học. Học văn không chỉ là học kiến thức,
            mà còn là học cách sống, cách cảm nhận và cách yêu thương."
          </blockquote>
          <p className="text-lg text-gray-600 font-medium">
            — Văn Học Trực Tuyến
          </p>
        </motion.div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default HomePage

