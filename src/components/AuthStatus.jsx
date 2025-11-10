import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Authentication utility functions
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export const getUserInfo = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub || payload.username || payload.email || 'User',
      email: payload.email || '',
      role: payload.role || payload.authorities || 'user',
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return { username: 'User', email: '', role: 'user' };
  }
};

export const handleLogout = (navigate) => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (navigate) {
    navigate('/');
  } else {
    window.location.reload();
  }
};

// Compact Auth Component for headers
function AuthStatus({ variant = 'default', className = '' }) {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  
  if (variant === 'mobile') {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        {isAuthenticated() ? (
          <>
            <div className="px-4 py-2 text-gray-700 text-sm">
              Xin chào <span className="font-semibold text-blue-600">{userInfo?.username}</span>
            </div>
            <button
              onClick={() => handleLogout(navigate)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-blue-600 font-medium text-left text-sm"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-sm"
            >
              Đăng ký
            </button>
          </>
        )}
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {isAuthenticated() ? (
          <>
            <span className="text-xs text-gray-600 hidden sm:inline">
              <span className="font-medium text-blue-600">{userInfo?.username}</span>
            </span>
            <button
              onClick={() => handleLogout(navigate)}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Thoát
            </button>
          </>
        ) : (
          <div className="flex space-x-1">
            <button
              onClick={() => navigate('/login')}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {isAuthenticated() ? (
        <>
          <span className="text-sm text-gray-700">
            Xin chào <span className="font-semibold text-blue-600">{userInfo?.username}</span>
          </span>
          <motion.button
            onClick={() => handleLogout(navigate)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Đăng xuất
          </motion.button>
        </>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Đăng nhập
          </button>
          <motion.button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Đăng ký
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default AuthStatus;