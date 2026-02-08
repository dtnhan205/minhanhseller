import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { isTokenExpired, getTimeUntilExpiration } from '@/utils/token';

/**
 * Hook để tự động kiểm tra token expiration và logout khi hết hạn
 */
export function useTokenExpiration() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Kiểm tra ngay lập tức
    if (isTokenExpired(token)) {
      logout();
      navigate('/login');
      return;
    }

    // Tính thời gian còn lại đến khi token hết hạn
    const timeUntilExpiration = getTimeUntilExpiration(token);
    
    // Nếu còn ít hơn 1 phút, logout ngay
    if (timeUntilExpiration < 60000) {
      logout();
      navigate('/login');
      return;
    }

    // Set timeout để logout khi token hết hạn
    const timeoutId = setTimeout(() => {
      logout();
      navigate('/login');
    }, timeUntilExpiration);

    // Kiểm tra định kỳ mỗi 30 giây
    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken || isTokenExpired(currentToken)) {
        logout();
        navigate('/login');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [logout, navigate]);
}

