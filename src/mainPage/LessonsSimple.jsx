import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Lessons = () => {
  const navigate = useNavigate();
  const [lessons] = useState([
    {
      id: 1,
      title: "Văn học dân gian Việt Nam",
      gradeLevel: 10,
      lessonType: "Lý thuyết",
      durationMinutes: 45,
      objectives: "Hiểu về đặc điểm văn học dân gian",
      content: "Nghiên cứu về ca dao, tục ngữ, truyện cổ tích..."
    },
    {
      id: 2, 
      title: "Truyện Kiều - Nguyễn Du",
      gradeLevel: 11,
      lessonType: "Phân tích",
      durationMinutes: 60,
      objectives: "Phân tích tác phẩm Truyện Kiều",
      content: "Nghiên cứu nhân vật, nghệ thuật, ý nghĩa..."
    },
    {
      id: 3,
      title: "Thơ Xuân Diệu",
      gradeLevel: 12,
      lessonType: "Thực hành",
      durationMinutes: 45,
      objectives: "Hiểu về phong cách thơ Xuân Diệu",
      content: "Phân tích các bài thơ tiêu biểu..."
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = !searchTerm || 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.objectives.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !filterGrade || lesson.gradeLevel.toString() === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  const getGradeLevelColor = (grade) => {
    const colors = {
      10: 'bg-blue-100 text-blue-800',
      11: 'bg-green-100 text-green-800',
      12: 'bg-purple-100 text-purple-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">📖 Quản lý Giáo án</h1>
                <p className="text-gray-600">Danh sách giáo án môn Ngữ văn</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="container mx-auto px-6 py-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Tìm kiếm giáo án
              </label>
              <input
                type="text"
                placeholder="Nhập tên bài học hoặc mục tiêu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📚 Lớp
              </label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả lớp</option>
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">
                  {lesson.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeLevelColor(lesson.gradeLevel)}`}>
                  Lớp {lesson.gradeLevel}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📝</span>
                  <span>{lesson.lessonType}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>{lesson.durationMinutes} phút</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Mục tiêu:</p>
                  <p className="text-sm text-gray-600">{lesson.objectives}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Nội dung:</p>
                  <p className="text-sm text-gray-600">{lesson.content}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  📖 Xem chi tiết
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  ✏️ Chỉnh sửa
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy giáo án</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </motion.div>
        )}

        {/* Add New Lesson Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Lessons;