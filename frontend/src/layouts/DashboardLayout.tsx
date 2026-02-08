import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Footer from '@/components/ui/Footer';
import { Sparkles, BarChart3, Clock, DollarSign, Plus, LogOut, Shield, Wallet, Activity } from 'lucide-react';
import { formatBalance } from '@/utils/format';

const sellerNavItems = [
  { path: '/generate', labelKey: 'nav.generate' as const, icon: Sparkles },
  { path: '/stats', labelKey: 'nav.stats' as const, icon: BarChart3 },
  { path: '/history', labelKey: 'nav.history' as const, icon: Clock },
  { path: '/transactions', labelKey: 'nav.transactions' as const, icon: DollarSign },
  { path: '/hacks', labelKey: 'nav.hacks' as const, icon: Activity },
  { path: '/topup', labelKey: 'nav.topup' as const, icon: Plus },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, refreshUser } = useAuthStore();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  // Kiểm tra token expiration và tự động logout
  useTokenExpiration();

  // Refresh user data when component mounts
  useEffect(() => {
    if (user && !isAdmin) {
      // Refresh only on mount
      refreshUser();
    }
  }, []); // Only run once on mount

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative">
      <div className="flex justify-center">
        <div className="w-full max-w-[1800px] p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 relative">
            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                className="water-droplet w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(6px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(6px) saturate(200%)',
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
                {isAdmin ? <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" /> : <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {isAdmin ? t('admin.dashboard') : t('dashboard.title')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              {/* Balance Display - Only for sellers */}
              {!isAdmin && user && (
                <div 
                  className="water-droplet flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 flex-shrink-0"
                  style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    backdropFilter: 'blur(20px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(200%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: `
                      0 20px 60px -12px rgba(0, 0, 0, 0.5),
                      0 12px 40px -8px rgba(0, 0, 0, 0.4),
                      0 4px 16px -4px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                      inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                      inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                      0 0 0 1px rgba(6, 182, 212, 0.2)
                    `,
                  }}
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 relative z-10" />
                  <span className="text-white font-semibold text-sm sm:text-base relative z-10">
                    {formatBalance(user.wallet || 0)}$
                  </span>
                </div>
              )}
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-base sm:text-lg p-2 sm:p-0"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-[100px] sm:justify-center">
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin')}
              className={`water-droplet flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold transition-all duration-300 text-sm sm:text-base relative z-10 ${
                location.pathname === '/admin' ? 'text-white' : 'text-white/80'
              }`}
              style={{
                background: location.pathname === '/admin'
                  ? 'rgba(255, 255, 255, 0.22)'
                  : 'rgba(255, 255, 255, 0.15)',
                 backdropFilter: 'blur(8px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(8px) saturate(200%)',
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
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">ADMIN</span>
              <span className="sm:hidden relative z-10">ADM</span>
            </button>
          ) : (
            <>
              {sellerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`water-droplet flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold transition-all duration-300 text-sm sm:text-base relative z-10 w-full sm:w-auto ${
                      isActive ? 'text-white' : 'text-white'
                    }`}
                    style={{
                      background: isActive
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: ' saturate(120%)',
                      WebkitBackdropFilter: 'saturate(200%)',
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
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                    <span className="relative z-10">{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>

          {/* Main Content */}
          <div className="flex justify-center">
            <div className="w-full max-w-[1600px]">
              <Outlet />
            </div>
          </div>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

