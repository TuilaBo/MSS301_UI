import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ Lỗi Ứng Dụng
              </h1>
              <p className="text-gray-600 mb-6">
                Đã xảy ra lỗi trong ứng dụng. Vui lòng thử lại.
              </p>
              
              {/* Error details for debugging */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Chi tiết lỗi:</h3>
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-600 mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                🔄 Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;