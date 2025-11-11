import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { lessonService } from '../service/lessonService';
import AuthStatus, { isAuthenticated, getUserInfo, handleLogout } from '../components/AuthStatus';

const Lessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  // Reset filters and token when error occurs
  const handleResetAndRefresh = () => {
    console.log('Resetting filters and refreshing...');
    setFilterGrade('');
    setFilterType('');
    setFilterDuration('');
    setSearchTerm('');
    setError(null);
    setAuthError(false);
    
    // Check token validity
    const userInfo = getUserInfo();
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (!userInfo || !userInfo.exp || userInfo.exp < currentTime) {
      // Token invalid, clear and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }
    
    // Token valid, just refresh
    fetchLessons();
  };
  const [componentError, setComponentError] = useState(null);

  // Available lesson types (có thể lấy từ API sau)
  const lessonTypes = ['Lý thuyết', 'Thực hành', 'Thí nghiệm', 'Kiểm tra', 'Ôn tập', 'Khác'];
  
  // Duration options for filter
  const durationOptions = [
    { value: '', label: 'Tất cả thời lượng' },
    { value: '30', label: 'Dưới 30 phút' },
    { value: '45', label: '30-45 phút' },
    { value: '60', label: '45-60 phút' },
    { value: '90', label: 'Trên 60 phút' }
  ];

  // Error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error('Component Error:', error);
      setComponentError(error.message || 'Có lỗi xảy ra khi tải trang');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Component error display
  if (componentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Lỗi tải trang</h3>
          <p className="text-gray-600 mb-6">{componentError}</p>
          <div className="flex flex-col space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setComponentError(null);
                window.location.reload();
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              🔄 Tải lại trang
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ← Quay về trang chủ
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Fetch lessons with advanced filtering
  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(false);
      setComponentError(null);
      
      console.log('=== LESSON API DEBUG ===');
      const isAuth = isAuthenticated();
      console.log('Is authenticated:', isAuth);
      
      // Check token expiry if authenticated
      if (isAuth) {
        const userInfo = getUserInfo();
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (userInfo && userInfo.exp && userInfo.exp < currentTime) {
          console.log('Token expired, removing from storage');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setAuthError(true);
          setError('Token đã hết hạn. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        
        console.log('Token valid, expires at:', new Date(userInfo.exp * 1000));
      }
      
      // Kiểm tra lessonService trước khi sử dụng
      if (!lessonService) {
        throw new Error('LessonService chưa được import đúng cách');
      }
      
      if (typeof lessonService.testConnection !== 'function') {
        throw new Error('lessonService.testConnection không phải là function');
      }
      
      // Test connection first
      console.log('Testing connection to lesson service...');
      const connectionOk = await lessonService.testConnection();
      console.log('Connection test result:', connectionOk);
      
      if (!connectionOk) {
        throw new Error('Không thể kết nối đến lesson service (port 8888). Vui lòng kiểm tra:\n• Server lesson service có đang chạy?\n• CORS đã được cấu hình?\n• URL có đúng không?');
      }
      
      let response;
      
      // Nếu chưa đăng nhập, sử dụng public API
      if (!isAuth) {
        console.log('Not authenticated, fetching public lessons...');
        if (typeof lessonService.getAllPublicLessons !== 'function') {
          throw new Error('lessonService.getAllPublicLessons không phải là function');
        }
        response = await lessonService.getAllPublicLessons();
      } else {
        // Fetch all lessons - filtering is done client-side
        console.log('Fetching all lessons with auth...');
        if (typeof lessonService.getAllLessons !== 'function') {
          throw new Error('lessonService.getAllLessons không phải là function');
        }
        response = await lessonService.getAllLessons();
      }
      
      console.log('API Response:', response);
      
      // Kiểm tra xem response có data array không
      const lessonsData = response?.data || response || [];
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      
      // Show info message for unauthenticated users
      if (!isAuth && lessonsData.length > 0) {
        console.log('Showing public lessons to unauthenticated user');
      }
      
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      console.error('Error stack:', error.stack);
      
      // Xử lý các loại lỗi authentication
      if (error.code === 'NO_TOKEN' || error.code === 'INVALID_TOKEN' || error.code === 'EXPIRED_TOKEN' || error.code === 'INSUFFICIENT_PERMISSIONS') {
        setAuthError(true);
        setError(error.message);
      } else if (error.message === 'Failed to fetch') {
        setError('Không thể kết nối đến lesson service (port 8888). Vui lòng kiểm tra:\n• Server lesson service có đang chạy?\n• CORS đã được cấu hình?\n• URL http://localhost:8888/api/lessons có đúng?');
      } else if (error.message?.includes('403') || error.status === 403) {
        // 403 error - có thể do CORS hoặc permissions
        setAuthError(true);
        const isFilteringRequest = filterGrade || filterType || filterDuration;
        if (isFilteringRequest) {
          setError('Lỗi khi lọc dữ liệu. Có thể do:\n• Token hết hạn trong quá trình sử dụng\n• Filter endpoint yêu cầu quyền khác\n• Vui lòng thử đăng nhập lại');
        } else {
          setError('Không có quyền truy cập. Vui lòng:\n• Đăng nhập bằng tài khoản giáo viên\n• Kiểm tra CORS configuration trên server\n• Đảm bảo lesson service đang chạy đúng cách');
        }
      } else if (error.message?.includes('không phải là function')) {
        // Import/export error
        setComponentError('Lỗi import module: ' + error.message);
        return; // Don't continue with normal error handling
      } else {
        setError(error.message || 'Không thể tải danh sách giáo án');
      }
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  // Search is now handled client-side in filteredLessons

  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giáo án này?')) {
      try {
        await lessonService.deleteLesson(lessonId);
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
        setSelectedLesson(null);
        alert('Xóa giáo án thành công!');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Lỗi khi xóa giáo án: ' + error.message);
      }
    }
  };

  // Create new lesson
  const handleCreateLesson = async (lessonData) => {
    try {
      const response = await lessonService.createLesson(lessonData);
      setLessons([...lessons, response.data || response]);
      setShowCreateModal(false);
      alert('Tạo giáo án thành công!');
    } catch (error) {
      console.error('Create error:', error);
      alert('Lỗi khi tạo giáo án: ' + error.message);
    }
  };

  // Update lesson
  const handleUpdateLesson = async (lessonId, lessonData) => {
    try {
      const response = await lessonService.updateLesson(lessonId, lessonData);
      const updatedLesson = response.data || response;
      setLessons(lessons.map(lesson => 
        lesson.id === lessonId ? updatedLesson : lesson
      ));
      setEditingLesson(null);
      setSelectedLesson(updatedLesson);
      alert('Cập nhật giáo án thành công!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Lỗi khi cập nhật giáo án: ' + error.message);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Auto-fetch when filters change - DISABLED server-side filtering, use client-side only
  useEffect(() => {
    // Skip API calls for filtering - just use client-side filtering
    console.log('Filter changed (client-side only):', { filterGrade, filterType, filterDuration });
    
    // Show subtle notification that we're using client-side filtering
    if (filterGrade || filterType || filterDuration) {
      console.log('Using client-side filtering for performance and reliability');
    }
  }, [filterGrade, filterType, filterDuration]);

  const filteredLessons = lessons.filter(lesson => {
    // Search filter
    const matchesSearch = !searchTerm || 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.lessonType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.objectives.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Grade filter
    const matchesGrade = !filterGrade || lesson.gradeLevel.toString() === filterGrade;
    
    // Type filter  
    const matchesType = !filterType || lesson.lessonType === filterType;
    
    // Duration filter
    let matchesDuration = true;
    if (filterDuration) {
      const duration = lesson.durationMinutes;
      switch (filterDuration) {
        case '30':
          matchesDuration = duration <= 30;
          break;
        case '45':
          matchesDuration = duration > 30 && duration <= 45;
          break;
        case '60':
          matchesDuration = duration > 45 && duration <= 60;
          break;
        case '90':
          matchesDuration = duration > 60;
          break;
        default:
          matchesDuration = true;
      }
    }
    
    return matchesSearch && matchesGrade && matchesType && matchesDuration;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGradeLevelColor = (grade) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-green-100 text-green-800',
      5: 'bg-blue-100 text-blue-800',
      6: 'bg-indigo-100 text-indigo-800',
      7: 'bg-purple-100 text-purple-800',
      8: 'bg-pink-100 text-pink-800',
      9: 'bg-gray-100 text-gray-800',
      10: 'bg-cyan-100 text-cyan-800',
      11: 'bg-emerald-100 text-emerald-800',
      12: 'bg-violet-100 text-violet-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Đang tải giáo án từ server...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md"
        >
          <div className="text-6xl mb-4">
            {authError ? '🔒' : '⚠️'}
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            {authError ? 'Cần đăng nhập' : 'Lỗi kết nối'}
          </h3>
          <div className="text-gray-600 mb-6 text-left">
            {error.split('\n').map((line, index) => (
              <p key={index} className="mb-1">
                {line.startsWith('•') ? (
                  <span className="ml-2">{line}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
          
          <div className="flex flex-col space-y-3">
            {authError ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🔑 Đăng nhập ngay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  📝 Đăng ký tài khoản
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchLessons}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                🔄 Thử lại
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ← Quay về trang chủ
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg"
      >
        <div className="container mx-auto px-6 py-8">
          {/* Top row with back button, title and auth section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-gray-100 hover:bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <span>←</span>
                  <span className="hidden sm:block">Trang chủ</span>
                </motion.button>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
                  📚 Quản lý Giáo án
                </h1>
              </div>
              <p className="text-gray-600 text-sm lg:text-base">
                Kho tài liệu giảng dạy chất lượng cao ({lessons.length} giáo án)
              </p>
            </div>
            
            {/* Authentication section */}
            <AuthStatus 
              className="flex-shrink-0"
            />
          </div>
          
          {/* Thông báo trạng thái authentication */}
          {!isAuthenticated() ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-sm text-blue-700 mb-2">
                � <strong>Chế độ xem công khai:</strong> Bạn đang xem danh sách giáo án công khai.
              </p>
              <p className="text-sm text-blue-600">
                💡 Để xem tất cả giáo án và sử dụng đầy đủ tính năng (tạo, sửa, xóa), vui lòng đăng nhập bằng tài khoản giáo viên.
                <button 
                  onClick={() => navigate('/login')}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Đăng nhập ngay →
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-700">
                ✅ <strong>Đã đăng nhập:</strong> Bạn có quyền truy cập đầy đủ vào hệ thống quản lý giáo án.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filter */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              🔍 <span className="ml-2">Tìm kiếm & Lọc giáo án</span>
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                {filteredLessons.length} kết quả
              </span>
              {(filterGrade || filterType || filterDuration) && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  📊 Lọc cục bộ
                </span>
              )}
            </div>
          </div>
          
          {/* Search and Create Button Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm theo tên bài học, loại hoặc nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md pointer-events-none">
                  📊 Tức thì
                </div>
              </div>
            </div>

            {/* Create Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              ✨ Tạo giáo án mới
            </motion.button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                🎓 <span className="ml-1">Lớp học</span>
              </label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-200"
              >
                <option value="">Tất cả lớp</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Lớp {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                📚 <span className="ml-1">Loại bài</span>
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-200"
              >
                <option value="">Tất cả loại</option>
                {lessonTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                ⏱️ <span className="ml-1">Thời lượng</span>
              </label>
              <select
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-200"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterGrade('');
                  setFilterType('');
                  setFilterDuration('');
                  fetchLessons();
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                🗑️ Xóa bộ lọc
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer border border-gray-100 transition-all duration-300"
              onClick={() => setSelectedLesson(lesson)}
            >
              <div className="p-6">
                {/* Header with badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeLevelColor(lesson.gradeLevel)}`}>
                      Lớp {lesson.gradeLevel}
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {lesson.lessonType}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    ⏱️ {lesson.durationMinutes}p
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 leading-tight">
                  {lesson.title}
                </h3>

                {/* Objectives preview */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  🎯 {lesson.objectives}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    📅 {formatDate(lesson.createdAt)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLesson(lesson);
                    }}
                  >
                    Xem chi tiết →
                  </motion.button>
                </div>
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy giáo án
            </h3>
            <p className="text-gray-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </motion.div>
        )}
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLesson(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{selectedLesson.title}</h2>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeLevelColor(selectedLesson.gradeLevel)}`}>
                      Lớp {selectedLesson.gradeLevel}
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedLesson.lessonType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              {/* Lesson Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      🎯 Mục tiêu bài học
                    </h3>
                    <p className="text-blue-700 break-words overflow-wrap-anywhere">{selectedLesson.objectives}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      📚 Phương pháp giảng dạy
                    </h3>
                    <p className="text-green-700 break-words overflow-wrap-anywhere">{selectedLesson.methodology}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">
                      🛠️ Thiết bị & Tài liệu
                    </h3>
                    <p className="text-purple-700 break-words overflow-wrap-anywhere">{selectedLesson.materials}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      📝 Bài tập về nhà
                    </h3>
                    <p className="text-orange-700 break-words overflow-wrap-anywhere">{selectedLesson.homework}</p>
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📖 Nội dung bài học
                </h3>
                <p className="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">{selectedLesson.content}</p>
              </div>

              {/* Meta Information & Actions */}
              <div className="border-t pt-6 mt-6">
                <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ Thời lượng: {selectedLesson.durationMinutes} phút</span>
                  <span>📅 Tạo: {formatDate(selectedLesson.createdAt)}</span>
                  <span>📅 Cập nhật: {formatDate(selectedLesson.updatedAt)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLesson(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    ← Đóng
                  </motion.button>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (selectedLesson && selectedLesson.id) {
                          setEditingLesson(selectedLesson)
                        } else {
                          alert('Không thể chỉnh sửa: Thiếu thông tin giáo án')
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      ✏️ Chỉnh sửa
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (selectedLesson && selectedLesson.id) {
                          handleDeleteLesson(selectedLesson.id)
                        } else {
                          alert('Không thể xóa: Thiếu thông tin giáo án')
                        }
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      🗑️ Xóa
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.print()}
                    >
                      📄 In giáo án
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <LessonFormModal
          title="Tạo giáo án mới"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateLesson}
          lessonTypes={lessonTypes}
        />
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <LessonFormModal
          title="Chỉnh sửa giáo án"
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSubmit={(data) => handleUpdateLesson(editingLesson.id, data)}
          lessonTypes={lessonTypes}
        />
      )}
    </div>
  );
};

// Lesson Form Modal Component
const LessonFormModal = ({ title, lesson, onClose, onSubmit, lessonTypes }) => {
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    lessonType: lesson?.lessonType || '',
    gradeLevel: lesson?.gradeLevel || 1,
    durationMinutes: lesson?.durationMinutes || 45,
    objectives: lesson?.objectives || '',
    content: lesson?.content || '',
    methodology: lesson?.methodology || '',
    materials: lesson?.materials || '',
    homework: lesson?.homework || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.lessonType.trim()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên bài học, Loại)');
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-8">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tên bài học..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bài học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.lessonType}
                    onChange={(e) => setFormData({...formData, lessonType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Chọn loại...</option>
                    {lessonTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lớp
                  </label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({...formData, gradeLevel: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Lớp {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mục tiêu bài học
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Mô tả mục tiêu bài học..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương pháp giảng dạy
                </label>
                <textarea
                  value={formData.methodology}
                  onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Mô tả phương pháp giảng dạy..."
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài học
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="8"
                  placeholder="Mô tả chi tiết nội dung bài học..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thiết bị & Tài liệu
                </label>
                <textarea
                  value={formData.materials}
                  onChange={(e) => setFormData({...formData, materials: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Danh sách thiết bị và tài liệu cần thiết..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bài tập về nhà
                </label>
                <textarea
                  value={formData.homework}
                  onChange={(e) => setFormData({...formData, homework: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Mô tả bài tập về nhà..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Hủy
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {lesson ? 'Cập nhật' : 'Tạo mới'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Lessons;
