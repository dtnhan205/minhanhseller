import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authApi } from '@/services/api';
import { Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { error: showError, success: showSuccess } = useToastStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.email || !formData.password) {
      showError(t('auth.enterBoth'), 5000);
      return;
    }
    
    setIsLoading(true);

    try {
      // console.log('Attempting login with:', { email: formData.email });
      const response = await authApi.login(formData);
      // console.log('Login response:', response);
      
      if (response && response.token && response.user) {
        setAuth(response.user, response.token);
        showSuccess(t('auth.loginSuccess'));
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      // console.error('Login error:', err);
      let errorMessage = t('auth.loginFailed');
      
      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const data = err.response.data;
        errorMessage = data?.message || data?.error || `Error ${status}: ${status === 401 ? 'Invalid credentials' : status === 400 ? 'Bad request' : 'Server error'}`;
        // console.error('Server error response:', { status, data });
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
        // console.error('No response received:', err.request);
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred';
        // console.error('Error:', err);
      }
      
      // console.log('Showing error toast:', errorMessage);
      showError(errorMessage, 7000);
      setIsLoading(false);
      // Prevent any default form submission behavior
      return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6">
      <div className="w-full max-w-md z-10 relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div 
              className="water-droplet w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(5px) saturate(200%)',
                WebkitBackdropFilter: 'blur(5px) saturate(200%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 20px 60px -12px rgba(0, 0, 0, 0.5),
                  0 12px 40px -8px rgba(0, 0, 0, 0.4),
                  0 4px 16px -4px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                  inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                  inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(255, 255, 255, 0.1)
                `,
              }}
            >
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                RESELLER VN
              </span>
            </h1>
          </div>
          <p className="text-white/90 text-xs sm:text-sm font-medium tracking-wider uppercase">
            SECURE AUTHENTICATION PORTAL
          </p>
        </div>

        {/* Card */}
        <div 
          className="droplet-container p-6 sm:p-8 md:p-10"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(200%)',
            WebkitBackdropFilter: 'blur(5px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: `
              0 36px 108px -18px rgba(0, 0, 0, 0.65),
              0 28px 84px -16px rgba(0, 0, 0, 0.6),
              0 20px 60px -12px rgba(0, 0, 0, 0.5),
              0 12px 36px -8px rgba(0, 0, 0, 0.4),
              0 6px 18px -4px rgba(0, 0, 0, 0.3),
              inset 0 3px 0 0 rgba(255, 255, 255, 0.4),
              inset 0 6px 12px 0 rgba(255, 255, 255, 0.2),
              inset -4px -4px 10px 0 rgba(255, 255, 255, 0.2),
              inset -6px -6px 14px 0 rgba(255, 255, 255, 0.12),
              inset 5px 5px 10px 0 rgba(0, 0, 0, 0.18),
              inset 7px 7px 14px 0 rgba(0, 0, 0, 0.12),
              -3px 0 10px 0 rgba(0, 0, 0, 0.2),
              3px 0 10px 0 rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.12),
              0 0 30px rgba(255, 255, 255, 0.06)
            `,
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
              <label className="block text-sm font-semibold text-white mb-2">
                  {t('auth.username').toUpperCase()}
                </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 z-10" />
                <input
                      type="email"
                      placeholder={t('auth.enterUsername')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-white placeholder-white/50 focus:outline-none transition-all text-sm sm:text-base"
                  style={{
                    borderRadius: '50px 50px 50px 8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(4px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(4px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: `
                      0 4px 8px -2px rgba(0, 0, 0, 0.3),
                      0 2px 4px -1px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                      inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(255, 255, 255, 0.05)
                    `,
                  }}
                      required
                    />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
              <label className="block text-sm font-semibold text-white mb-2">
                  {t('auth.password').toUpperCase()}
                </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 z-10" />
                <input
                      type="password"
                      placeholder={t('auth.enterPassword')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-white placeholder-white/50 focus:outline-none transition-all text-sm sm:text-base"
                  style={{
                    borderRadius: '50px 50px 50px 8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(4px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(4px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: `
                      0 4px 8px -2px rgba(0, 0, 0, 0.3),
                      0 2px 4px -1px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                      inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(255, 255, 255, 0.05)
                    `,
                  }}
                      required
                    />
              </div>
              </div>

              {/* Submit Button */}
            <button
                type="submit" 
              disabled={isLoading}
              className="water-droplet w-full mt-6 sm:mt-8 py-3.5 sm:py-4 px-6 sm:px-8 font-bold text-white transition-all duration-300 text-sm sm:text-base relative z-10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(6, 182, 212, 0.25)',
                 backdropFilter: 'blur(5px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(5px) saturate(200%)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                boxShadow: `
                  0 20px 60px -12px rgba(0, 0, 0, 0.5),
                  0 12px 40px -8px rgba(0, 0, 0, 0.4),
                  0 4px 16px -4px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                  inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                  inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(6, 182, 212, 0.3)
                `,
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="relative z-10">{t('auth.loginButton')}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{t('auth.authenticate')}</span>
                </>
              )}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
}

