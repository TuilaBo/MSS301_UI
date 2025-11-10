# 📚 Teacher Document Upload - Hướng dẫn sử dụng

## 🎯 Tính năng Upload dành cho Giáo viên

Hệ thống Document Upload được thiết kế chuyên biệt cho giáo viên, giúp upload và quản lý tài liệu giảng dạy một cách chuyên nghiệp.

## 🚀 Cách sử dụng:

### **1. Đăng nhập với quyền Teacher**
- Đăng nhập vào hệ thống
- Đảm bảo tài khoản có role `teacher` hoặc `admin`
- Trên trang Documents sẽ hiển thị nút "📤 Upload Tài liệu"

### **2. Chọn chế độ Upload**
- **📄 Upload đơn lẻ**: Upload từng file một với metadata riêng biệt
- **📦 Upload hàng loạt**: Upload nhiều file cùng lúc với metadata chung

### **3. Upload file**
- **Kéo thả**: Drag & drop file vào vùng upload
- **Chọn file**: Click "Chọn file" để browse
- Hỗ trợ multiple file selection cho bulk upload

### **4. Điền thông tin tài liệu**
- **📝 Tiêu đề**: Tự động từ tên file hoặc nhập manual
- **📂 Danh mục**: Giáo trình, Bài tập, Video, Audio, v.v.
- **🎓 Lớp học**: 6, 7, 8, 9, 10, 11, 12
- **📚 Môn học**: Ngữ văn, Toán, Tiếng Anh, v.v.
- **📄 Mô tả**: Chi tiết về nội dung
- **🏷️ Tags**: Phân cách bằng dấu phẩy
- **🌐 Công khai**: Cho phép học sinh truy cập

## 📁 File formats được hỗ trợ:

| Loại | Định dạng | Kích thước max | Mục đích |
|------|-----------|----------------|-----------|
| **📄 Tài liệu** | PDF, DOC, DOCX | 50MB | Giáo trình, bài tập |
| **🎬 Video** | MP4, AVI, MOV, WEBM | 500MB | Video bài giảng |
| **🔊 Audio** | MP3, WAV, M4A, OGG | 100MB | Bài giảng audio |
| **🎭 Trình bày** | PPT, PPTX | 100MB | Slide giảng dạy |
| **📊 Bảng tính** | XLS, XLSX | 25MB | Bài tập, dữ liệu |
| **🖼️ Hình ảnh** | JPG, PNG, GIF | 10MB | Hình minh họa |

## ⚡ Auto-Detection Features:

1. **📝 Auto Title**: Tự động tạo tiêu đề từ tên file
2. **📂 Smart Category**: 
   - `.pdf` → Giáo trình
   - `.docx` → Bài tập  
   - `.mp4` → Video
   - `.mp3` → Audio
   - `.pptx` → Hướng dẫn
3. **🏷️ Auto Tags**: Tự động tag dựa trên category và subject
4. **✅ Validation**: Kiểm tra file size và format

## 🎮 Test trong Development:

### **Role Switching (Chỉ development)**
- Góc dưới phải có 2 nút test:
  - **Set Teacher**: Chuyển role thành teacher
  - **Set Student**: Chuyển role thành student

### **Teacher Mode**
- Hiển thị banner "👨‍🏫 Chế độ Giáo viên"
- Nút "📤 Upload Tài liệu" trong header
- Có thể upload, edit, delete tài liệu

### **Student Mode**  
- Chỉ xem và download tài liệu
- Không có quyền upload

## 📤 Upload Process:

1. **Select Files** 📁
   ```
   Drag & Drop hoặc Browse files
   ↓
   Validation (size, format)
   ↓
   Add to upload queue
   ```

2. **Fill Metadata** ✏️
   ```
   Auto-detect category from extension
   ↓
   Fill title, description, tags
   ↓
   Set grade level & subject
   ```

3. **Upload** 🚀
   ```
   Send to /api/documents/upload-simple
   ↓
   Progress tracking với XHR
   ↓
   Success/Error handling
   ```

4. **Result** ✅
   ```
   Success: Show uploaded files
   ↓
   Refresh document list
   ↓
   Close upload modal
   ```

## 🔧 API Integration:

### **Upload Endpoints:**
- `POST /api/documents/upload-simple` - Single/bulk upload
- `POST /api/documents` - Advanced upload với JWT
- `POST /api/documents/bulk-upload` - Bulk upload chuyên biệt

### **Authentication:**
- JWT token từ localStorage
- Auto-add vào Authorization header
- Fallback nếu token expire

### **Progress Tracking:**
- XMLHttpRequest với upload progress events
- Real-time progress bar
- Individual progress cho từng file

## 🎨 UI/UX Features:

### **Upload Modal**
- ✅ Modern drag & drop interface
- ✅ File preview với icons
- ✅ Progress bars animation
- ✅ Validation error messages
- ✅ Success confirmations

### **File Management**
- ✅ File list với preview
- ✅ Remove individual files
- ✅ File size formatting
- ✅ Category suggestions

### **Form Auto-completion**
- ✅ Smart defaults
- ✅ Category detection
- ✅ Title generation
- ✅ Form validation

## 🚨 Error Handling:

### **File Validation Errors:**
- File size quá lớn
- Định dạng không supported
- File corrupt

### **Upload Errors:**
- Network issues
- Server errors
- Authentication failures

### **Recovery:**
- Retry mechanism
- Clear error states
- User-friendly messages

## 📊 Success Metrics:

Sau upload thành công:
- ✅ Files available ngay trong document list
- ✅ Searchable theo metadata
- ✅ Accessible cho students (nếu public)
- ✅ Ready for streaming (video/audio)

---

**🎓 Teacher Upload v1.0** - Powerful document management for educators!