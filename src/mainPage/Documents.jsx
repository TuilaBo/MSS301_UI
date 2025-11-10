import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthStatus from '../components/AuthStatus';
import { documentService, openDocumentInNewTab, downloadDocumentAsFile, getPreviewAsBlob, viewDocumentAsBlob } from '../service/documentService';
import DocumentViewer from '../components/DocumentViewer'

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  console.log('🚀 Vietnamese Literature Document Service - Initializing...');

  // Mock Vietnamese Literature data following API schema
  const mockDocuments = [
    {
      id: "67123abc4def567890123456",
      title: "Phân tích Ca dao Việt Nam",
      description: "Tổng hợp và phân tích các ca dao tiêu biểu của văn học dân gian Việt Nam. Nghiên cứu sâu về giá trị văn hóa và nghệ thuật của ca dao qua các thời kỳ lịch sử.",
      fileName: "phan-tich-ca-dao-viet-nam.pdf",
      fileType: "PDF",
      fileSize: 2456789,
      fileUrl: "/storage/documents/phan-tich-ca-dao-viet-nam.pdf",
      thumbnailUrl: "/storage/thumbnails/ca-dao-thumb.jpg",
      category: "Giáo trình",
      gradeLevel: 9,
      subject: "Ngữ văn",
      tags: "ca dao, văn học dân gian, phân tích, nghiên cứu",
      isPublic: true,
      isActive: true,
      uploadedBy: "admin",
      viewCount: 1245,
      downloadCount: 567,
      durationSeconds: null,
      createdAt: "2024-03-15T09:30:00Z",
      updatedAt: "2024-03-20T14:15:00Z"
    },
    {
      id: "67123abc4def567890123457",
      title: "Truyện Kiều - Nguyễn Du",
      description: "Phân tích toàn diện tác phẩm Truyện Kiều của đại thi hào Nguyễn Du. Nghiên cứu về cấu trúc, nhân vật, ngôn ngữ nghệ thuật và giá trị nhân văn của tác phẩm.",
      fileName: "truyen-kieu-nguyen-du-phan-tich.pdf",
      fileType: "PDF",
      fileSize: 3789456,
      fileUrl: "/storage/documents/truyen-kieu-nguyen-du-phan-tich.pdf",
      thumbnailUrl: "/storage/thumbnails/kieu-thumb.jpg",
      category: "Giáo trình",
      gradeLevel: 11,
      subject: "Ngữ văn",
      tags: "truyện kiều, nguyễn du, phân tích, tác phẩm kinh điển",
      isPublic: true,
      isActive: true,
      uploadedBy: "teacher_nguyen",
      viewCount: 2890,
      downloadCount: 1234,
      durationSeconds: null,
      createdAt: "2024-02-20T11:45:00Z",
      updatedAt: "2024-03-10T16:20:00Z"
    },
    {
      id: "67123abc4def567890123458",
      title: "Video: Phong trào Thơ mới",
      description: "Video bài giảng chi tiết về phong trào Thơ mới với các tác giả tiêu biểu như Xuân Diệu, Huy Cận, Thế Lữ. Phân tích đặc điểm nghệ thuật và ảnh hưởng của phong trào.",
      fileName: "phong-trao-tho-moi-video.mp4",
      fileType: "MP4",
      fileSize: 567890123,
      fileUrl: "/storage/videos/phong-trao-tho-moi-video.mp4",
      thumbnailUrl: "/storage/thumbnails/tho-moi-thumb.jpg",
      category: "Video",
      gradeLevel: 12,
      subject: "Ngữ văn",
      tags: "thơ mới, xuân diệu, huy cận, thế lữ, video bài giảng",
      isPublic: true,
      isActive: true,
      uploadedBy: "teacher_tran",
      viewCount: 3456,
      downloadCount: 890,
      durationSeconds: 2700,
      createdAt: "2024-01-15T08:20:00Z",
      updatedAt: "2024-02-05T13:30:00Z"
    },
    {
      id: "67123abc4def567890123459",
      title: "Audio: Đọc thơ Xuân Quỳnh",
      description: "Bài đọc thơ các tác phẩm tiêu biểu của nhà thơ Xuân Quỳnh với giọng đọc cảm xúc. Giúp học sinh cảm nhận được vẻ đẹp của thơ ca.",
      fileName: "doc-tho-xuan-quynh.mp3",
      fileType: "MP3",
      fileSize: 45678901,
      fileUrl: "/storage/audio/doc-tho-xuan-quynh.mp3",
      thumbnailUrl: "/storage/thumbnails/xuan-quynh-thumb.jpg",
      category: "Audio",
      gradeLevel: 11,
      subject: "Ngữ văn",
      tags: "xuân quỳnh, thơ, đọc thơ, audio",
      isPublic: true,
      isActive: true,
      uploadedBy: "teacher_le",
      viewCount: 1890,
      downloadCount: 456,
      durationSeconds: 1800,
      createdAt: "2024-03-01T10:15:00Z",
      updatedAt: "2024-03-15T15:45:00Z"
    },
    {
      id: "67123abc4def567890123460",
      title: "Bài tập Chí Phèo - Nam Cao",
      description: "Bộ câu hỏi và bài tập về tác phẩm Chí Phèo của Nam Cao. Bao gồm câu hỏi trắc nghiệm, tự luận và hướng dẫn giải chi tiết.",
      fileName: "bai-tap-chi-pheo-nam-cao.docx",
      fileType: "DOCX",
      fileSize: 1234567,
      fileUrl: "/storage/documents/bai-tap-chi-pheo-nam-cao.docx",
      thumbnailUrl: "/storage/thumbnails/chi-pheo-thumb.jpg",
      category: "Bài tập",
      gradeLevel: 12,
      subject: "Ngữ văn",
      tags: "chí phèo, nam cao, bài tập, trắc nghiệm",
      isPublic: false,
      isActive: true,
      uploadedBy: "teacher_minh",
      viewCount: 987,
      downloadCount: 234,
      durationSeconds: null,
      createdAt: "2024-02-10T14:30:00Z",
      updatedAt: "2024-02-25T09:15:00Z"
    },
    {
      id: "67123abc4def567890123461",
      title: "Đề kiểm tra cuối kỳ Văn 10",
      description: "Đề kiểm tra cuối kỳ môn Ngữ văn lớp 10 với đáp án chi tiết. Bao gồm phần trắc nghiệm và tự luận theo cấu trúc chuẩn của Bộ GD&ĐT.",
      fileName: "de-kiem-tra-cuoi-ky-van-10.pdf",
      fileType: "PDF",
      fileSize: 1789234,
      fileUrl: "/storage/documents/de-kiem-tra-cuoi-ky-van-10.pdf",
      thumbnailUrl: "/storage/thumbnails/de-kiem-tra-thumb.jpg",
      category: "Đề kiểm tra",
      gradeLevel: 10,
      subject: "Ngữ văn",
      tags: "đề kiểm tra, văn 10, cuối kỳ, đáp án",
      isPublic: false,
      isActive: true,
      uploadedBy: "teacher_hoa",
      viewCount: 2345,
      downloadCount: 678,
      durationSeconds: null,
      createdAt: "2024-01-20T16:00:00Z",
      updatedAt: "2024-02-01T11:30:00Z"
    }
  ];

  // Categories and options for filtering
  const categories = ['all', 'Giáo trình', 'Bài tập', 'Video', 'Audio', 'Đề kiểm tra'];
  const gradelevels = ['all', 6, 7, 8, 9, 10, 11, 12];
  const fileTypes = ['all', 'PDF', 'DOCX', 'MP4', 'MP3'];

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    console.log('🔐 Authentication status:', !!token ? 'Logged in' : 'Guest user');
  }, []);

  // Decode JWT payload for quick debugging (if present)
  const [jwtPayload, setJwtPayload] = useState(null);
  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (!t) {
      setJwtPayload(null);
      return;
    }
    try {
      const parts = t.split('.')
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
        setJwtPayload(payload)
      } else {
        setJwtPayload(null)
      }
    } catch (e) {
      console.warn('Could not decode JWT payload:', e)
      setJwtPayload(null)
    }
  }, [isLoggedIn]);

  // Viewer modal state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerHtml, setViewerHtml] = useState(null)
  const [viewerDoc, setViewerDoc] = useState(null)
  const [viewerBlobUrl, setViewerBlobUrl] = useState(null)

  // Load documents from API with fallback to mock data
  useEffect(() => {
    const fetchDocuments = async () => {
      console.log('📚 Fetching documents from Vietnamese Literature Document Service...');
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from actual API
        const response = await documentService.getPublicDocuments();
        console.log('📊 API Response received:', response);
        
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          setDocuments(response.data);
          console.log('✅ Real API data loaded:', response.data.length, 'documents');
        } else {
          console.log('📋 Using mock Vietnamese Literature data');
          setDocuments(mockDocuments);
        }
      } catch (err) {
        console.error('❌ API Error:', err.message);
        setError(err.message);
        setDocuments(mockDocuments);
        console.log('📋 Fallback to mock data due to API error');
      } finally {
        setLoading(false);
        console.log('🏁 Document loading completed');
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents based on selected criteria
  useEffect(() => {
    let filtered = [...documents];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by grade level
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(doc => doc.gradeLevel === parseInt(selectedGrade));
    }

    // Filter by file type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.fileType === selectedType);
    }

    // Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(keyword) ||
        doc.description.toLowerCase().includes(keyword) ||
        doc.tags.toLowerCase().includes(keyword)
      );
    }

    // Filter by public status if not logged in
    if (!isLoggedIn) {
      filtered = filtered.filter(doc => doc.isPublic);
    }

    setFilteredDocuments(filtered);
    console.log('🔍 Filtered documents:', filtered.length, 'of', documents.length);
  }, [documents, selectedCategory, selectedGrade, selectedType, searchKeyword, isLoggedIn]);

  // Handle document view
  const handleViewDocument = async (doc) => {
    console.log('👁️ Viewing document:', doc.title);
    try {
      // Debug: show token before view request
      console.log('🔐 handleViewDocument - accessToken in localStorage:', localStorage.getItem('accessToken'))
      console.log('🔐 handleViewDocument - isLoggedIn state:', isLoggedIn)

      if (!isLoggedIn) {
        alert('Vui lòng đăng nhập để xem tài liệu này')
        navigate('/login')
        return
      }

      // Tăng view count (API) - không chặn UI nếu lỗi
      try { await documentService.viewDocument(doc.id) } catch (e) { console.warn('Could not increment view count', e) }

      // Lấy preview HTML từ server (nếu server trả về HTML viewer)
      try {
        const preview = await documentService.getPreviewPage(doc.id)
        // nếu preview là object (json), convert sang string; nếu text thì giữ nguyên
        const html = typeof preview === 'string' ? preview : (preview && preview.html) ? preview.html : null
        if (html) {
          // If the server returned an HTML preview that includes an iframe
          // pointing to a backend URL which sets X-Frame-Options: DENY, the
          // browser will refuse to display it. Detect iframe src and fetch
          // that resource as a blob (with Authorization) and replace the
          // iframe src with a blob URL so it can be embedded.
          try {
            const iframeSrcMatch = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i)
            if (iframeSrcMatch && iframeSrcMatch[1]) {
              const iframeUrl = iframeSrcMatch[1]
              console.log('🧩 Preview HTML contains iframe. Attempting to fetch iframe src as blob:', iframeUrl)
              try {
                // fetch the iframe target as blob (preserves Authorization)
                const iframeBlob = await viewDocumentAsBlob(iframeUrl.split('/').pop())
                const iframeBlobUrl = URL.createObjectURL(iframeBlob)
                // replace the src in the returned HTML
                const safeHtml = html.replace(iframeSrcMatch[1], iframeBlobUrl)
                setViewerHtml(safeHtml)
                setViewerBlobUrl(null)
                setViewerDoc(doc)
                setViewerOpen(true)
                return
              } catch (innerErr) {
                console.warn('Could not fetch iframe src as blob, falling back to original HTML:', innerErr)
              }
            }

            // No iframe to patch or patch failed - show the HTML as-is
            setViewerHtml(html)
            setViewerBlobUrl(null)
            setViewerDoc(doc)
            setViewerOpen(true)
          } catch (procHtmlErr) {
            console.warn('Error processing preview HTML, falling back to blob preview', procHtmlErr)
            // proceed to blob fallback below
            // (no return)
          }
        } else {
          // nếu backend không trả HTML, thử fetch preview dưới dạng blob (PDF/video)
          try {
            const blob = await getPreviewAsBlob(doc.id)
            const url = URL.createObjectURL(blob)
            setViewerBlobUrl(url)
            setViewerHtml(null)
            setViewerDoc(doc)
            setViewerOpen(true)
          } catch (be) {
            console.warn('Preview as blob failed, fallback to openDocumentInNewTab', be)
            try { await openDocumentInNewTab(doc.id, doc.fileName) } catch (ee) { console.error('Fallback open failed', ee); window.open(`/api/documents/view/${doc.id}`, '_blank') }
          }
        }
      } catch (e) {
        console.warn('Could not fetch preview HTML, fallback to openDocumentInNewTab', e)
        try { await openDocumentInNewTab(doc.id, doc.fileName) } catch (ee) { console.error('Fallback open failed', ee); window.open(`/api/documents/view/${doc.id}`, '_blank') }
      }
    } catch (error) {
      console.error('❌ Error viewing document:', error);
      alert(`Preview: ${doc.title}\nAPI: /api/documents/view/${doc.id}`);
    }
  };

  // Handle document download
  const handleDownloadDocument = async (doc) => {
    console.log('⬇️ Downloading document:', doc.title);
    try {
      if (!isLoggedIn) {
        alert('Vui lòng đăng nhập để tải xuống tài liệu')
        navigate('/login')
        return
      }

      // Tăng download count non-blocking
      try { await documentService.downloadDocument(doc.id) } catch (e) { console.warn('Could not increment download count', e) }

      // Use blob helper to fetch and force download with Authorization header
      try {
        await downloadDocumentAsFile(doc.id, doc.fileName)
        console.log('✅ Download initiated for:', doc.fileName)
      } catch (e) {
        console.error('❌ downloadDocumentAsFile failed:', e)
        // Fallback: try fetching download as blob and trigger download
        try {
          const blob = await getPreviewAsBlob(doc.id) // try preview endpoint as alternative
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = doc.fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        } catch (ee) {
          window.open(`/api/documents/download/${doc.id}`, '_blank')
        }
      }
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      alert(`Download: ${doc.title}\nAPI: /api/documents/download/${doc.id}`);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="text-xl text-blue-600 font-semibold">📚 Đang tải Vietnamese Literature Document Service...</div>
          <div className="text-sm text-gray-500 mt-2">Connecting to API endpoints...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => navigate('/')}
                className='text-gray-600 hover:text-blue-600 transition-colors flex items-center'
              >
                <span className="mr-2">←</span> Trang chủ
              </button>
              <h1 className='text-2xl font-bold text-gray-800'>📚 Vietnamese Literature Document Service</h1>
              <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                {filteredDocuments.length} tài liệu
              </span>
              <button
                onClick={() => navigate('/upload')}
                className='ml-3 text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700'
              >
                ➕ Upload
              </button>
            </div>
            <AuthStatus variant='compact' />
          </div>

          
          {/* API Status Banner */}
          <div className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-700">
                <span>{error ? '⚠️' : '✅'}</span>
                <span className="text-sm font-medium">
                  {error 
                    ? `API Warning: ${error} - Showing mock data`
                    : 'Connected to Vietnamese Literature Document Service API'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {isLoggedIn ? '🔑 Authenticated User' : '👤 Guest Mode'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📂 Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Tất cả' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎓 Lớp</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {gradelevels.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'Tất cả' : `Lớp ${grade}`}
                  </option>
                ))}
              </select>
            </div>

            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📄 Loại file</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fileTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Tất cả' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredDocuments.length} trong số {documents.length} tài liệu
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Chế độ xem:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                🔲 Lưới
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                📋 Danh sách
              </button>
            </div>
          </div>
        </motion.div>

        {/* Viewer modal */}
        <DocumentViewer
          open={viewerOpen}
          onClose={() => {
            setViewerOpen(false)
            if (viewerBlobUrl) { URL.revokeObjectURL(viewerBlobUrl); setViewerBlobUrl(null) }
          }}
          title={viewerDoc ? viewerDoc.title : 'Preview'}
          previewHtml={viewerHtml}
          blobUrl={viewerBlobUrl}
          fileType={viewerDoc ? viewerDoc.fileType : null}
          fileName={viewerDoc ? viewerDoc.fileName : null}
          doc={viewerDoc}
        />

        {/* Documents Grid/List */}
        <div className={viewMode === 'grid' ? 
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
          'space-y-4'
        }>
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={viewMode === 'grid' 
                ? "bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                : "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4"
              }
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-4xl">
                      {doc.fileType === 'MP4' || doc.category === 'Video' ? '🎥' : 
                       doc.fileType === 'MP3' || doc.category === 'Audio' ? '🎵' : 
                       doc.fileType === 'DOCX' ? '📝' :
                       doc.category === 'Đề kiểm tra' ? '📋' :
                       doc.category === 'Bài tập' ? '✏️' : '📄'}
                    </div>
                    
                    {/* File Type Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                      {doc.fileType}
                    </div>
                    
                    {/* Grade Level Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-semibold">
                      Lớp {doc.gradeLevel}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-semibold">
                      {doc.category}
                    </div>

                    {/* Public/Private Badge */}
                    {!doc.isPublic && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-semibold">
                        🔒 Private
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                      {doc.description}
                    </p>

                    {/* File Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <span>📁</span>
                        <span className="ml-1 truncate">{formatFileSize(doc.fileSize)}</span>
                      </div>
                      {doc.durationSeconds && (
                        <div className="flex items-center">
                          <span>⏱️</span>
                          <span className="ml-1">{formatDuration(doc.durationSeconds)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <span>👁️</span>
                        <span className="ml-1">{doc.viewCount}</span>
                      </div>
                      <div className="flex items-center">
                        <span>📥</span>
                        <span className="ml-1">{doc.downloadCount}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-all text-xs flex items-center justify-center"
                      >
                        <span className="mr-1">⬇️</span>
                        <span>Tải xuống</span>
                      </button>
                    </div>
                    
                    {/* API Info */}
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      ID: {doc.id.substring(0, 8)}...
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-2xl">
                        {doc.fileType === 'MP4' || doc.category === 'Video' ? '🎥' : 
                         doc.fileType === 'MP3' || doc.category === 'Audio' ? '🎵' : 
                         doc.fileType === 'DOCX' ? '📝' :
                         doc.category === 'Đề kiểm tra' ? '📋' :
                         doc.category === 'Bài tập' ? '✏️' : '📄'}
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow min-w-0 mr-4">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {doc.description}
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>📂 {doc.category}</span>
                            <span>🎓 Lớp {doc.gradeLevel}</span>
                            <span>📄 {doc.fileType}</span>
                            <span>📁 {formatFileSize(doc.fileSize)}</span>
                            {doc.durationSeconds && (
                              <span>⏱️ {formatDuration(doc.durationSeconds)}</span>
                            )}
                            <span>👁️ {doc.viewCount}</span>
                            <span>📥 {doc.downloadCount}</span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center"
                          >
                            <span className="mr-1">⬇️</span>
                            <span>Tải xuống</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy tài liệu
            </h3>
            <p className="text-gray-500 mb-4">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <button
              onClick={() => {
                setSearchKeyword('');
                setSelectedCategory('all');
                setSelectedGrade('all');
                setSelectedType('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </motion.div>
        )}

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-8"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Vietnamese Literature Document Service - Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                <div className="text-blue-700">Tổng tài liệu</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {documents.reduce((sum, doc) => sum + doc.viewCount, 0).toLocaleString()}
                </div>
                <div className="text-green-700">Lượt xem</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {documents.reduce((sum, doc) => sum + doc.downloadCount, 0).toLocaleString()}
                </div>
                <div className="text-purple-700">Lượt tải</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600">
                  {documents.filter(doc => doc.isPublic).length}
                </div>
                <div className="text-orange-700">Công khai</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              ✅ Full API Integration • 🔍 Advanced Filtering • 📊 Real-time Statistics • 🔒 Authentication Ready
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Documents;
