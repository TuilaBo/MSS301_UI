import React, { useState } from 'react'

export default function DocumentViewer({ open, onClose, title, previewHtml, blobUrl, fileType, fileName, doc }) {
  const [loadError, setLoadError] = useState(null)

  if (!open) return null

  const handleMediaError = (ev, hint) => {
    console.error('DocumentViewer - media load error', { ev, hint, fileType, fileName, blobUrl })
    setLoadError(hint || 'Không thể tải nội dung xem trước.');
  }

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank')
    }
  }

  const renderContent = () => {
    if (previewHtml) {
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    }

    if (blobUrl) {
      // For PDFs: Due to CSP restrictions, we cannot embed PDF in iframe.
      // Best approach: open in new tab or provide download link.
      // Note: PDF.js could be used for client-side rendering, but that requires
      // adding a dependency. For now, open in new tab is the fastest solution.
      if (fileType && fileType.toLowerCase().includes('pdf')) {
        return (
          <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 mb-4">PDF không thể hiển thị trực tiếp do CSP.</p>
              <button
                onClick={handleOpenInNewTab}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Mở trong tab mới
              </button>
            </div>
          </div>
        )
      }

      // For video: Use native <video> tag (not iframe) — this often bypasses CSP frame-src restrictions
      if (fileType && (fileType.toLowerCase().includes('mp4') || fileType.toLowerCase().includes('video'))) {
        return (
          <video
            controls
            src={blobUrl}
            className="w-full max-h-[70vh]"
            onError={(e) => handleMediaError(e, 'Video failed to play')}
          />
        )
      }

      // For audio: Use native <audio> tag
      if (fileType && fileType.toLowerCase().includes('mp3')) {
        return (
          <audio
            controls
            src={blobUrl}
            className="w-full"
            onError={(e) => handleMediaError(e, 'Audio failed to play')}
          />
        )
      }

      // Fallback: show link to open
      return (
        <div className="text-center py-12">
          <a href={blobUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Mở/tải nội dung</a>
        </div>
      )
    }

    return <div className="text-center text-gray-500 py-12">Không có nội dung xem trước cho tài liệu này.</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {doc && (
              <div className="text-xs text-gray-500">{doc.category} • Lớp {doc.gradeLevel} • {doc.fileType}</div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {blobUrl && (
              <a href={blobUrl} download={fileName || ''} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Tải xuống</a>
            )}
            <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Đóng</button>
          </div>
        </div>

        <div className="p-4">
          {loadError ? (
            <div className="space-y-4 text-center">
              <div className="text-red-600 font-semibold">{loadError}</div>
              <div className="text-sm text-gray-600">Thử tải xuống rồi mở bằng ứng dụng phù hợp hoặc kiểm tra Console/Network để biết chi tiết.</div>
              {blobUrl && (
                <div>
                  <a href={blobUrl} download={fileName || ''} className="text-sm text-blue-600 underline">Tải xuống: {fileName || 'tệp'}</a>
                </div>
              )}
            </div>
          ) : (
            renderContent()
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-end space-x-2">
          <a href="#" className="text-xs text-gray-500">ID: {doc ? doc.id : '—'}</a>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Đóng</button>
        </div>
      </div>
    </div>
  )
}
