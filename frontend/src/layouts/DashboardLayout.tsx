import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Footer from '@/components/ui/Footer';
import ParticleNetwork from '@/components/ParticleNetwork';
import {
  Sparkles,
  BarChart3,
  Clock,
  DollarSign,
  Plus,
  LogOut,
  Shield,
  Wallet,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { formatBalance } from '@/utils/format';

const sellerNavItems = [
  { path: '/app/generate', labelKey: 'nav.generate' as const, icon: Sparkles },
  { path: '/app/stats', labelKey: 'nav.stats' as const, icon: BarChart3 },
  { path: '/app/history', labelKey: 'nav.history' as const, icon: Clock },
  { path: '/app/transactions', labelKey: 'nav.transactions' as const, icon: DollarSign },
  { path: '/hacks', labelKey: 'nav.hacks' as const, icon: Activity },
  { path: '/app/topup', labelKey: 'nav.topup' as const, icon: Plus },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, refreshUser } = useAuthStore();
  const { t, language } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  useTokenExpiration();

  useEffect(() => {
    if (user && !isAdmin) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = isAdmin ? (
    <button
      onClick={() => navigate('/admin')}
      className={`flex items-center gap-3 px-6 py-3 font-bold rounded-2xl border transition-all text-base w-full sm:w-auto sm:justify-center ${
        location.pathname === '/admin'
          ? 'bg-cyan-600/20 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
          : 'bg-slate-900/40 border-gray-800/40 text-gray-400 hover:border-gray-700 hover:text-gray-200'
      }`}
    >
      <Shield className="w-5 h-5" />
      <span>ADMIN</span>
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
            className={`flex items-center gap-3 px-6 py-3 font-bold rounded-2xl border transition-all text-base w-full sm:w-auto sm:justify-center ${
              isActive
                ? 'bg-cyan-600/20 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-slate-900/40 border-gray-800/40 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{t(item.labelKey)}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className={`${isAdmin ? '' : 'seller-mono '}min-h-screen relative bg-black text-white`}>
      <ParticleNetwork
        particleColor="rgba(99, 102, 241, 0.7)"
        lineColor="rgba(255, 255, 255, 0.25)"
        particleCount={70}
        linkDistance={170}
        opacity={0.35}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '4px 4px',
          }}
        />
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[1800px] p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4 relative">
            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 rounded-2xl border border-gray-800/40 bg-slate-900/20 shadow-[0_0_5px_rgba(99,102,241,0.2)] cursor-pointer"
                onClick={() => navigate('/')}
              >
                {isAdmin ? (
                  <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400/80" />
                ) : (
                  <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400/80" />
                )}
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-100 via-cyan-200 to-slate-400 bg-clip-text text-transparent">
                {isAdmin ? t('admin.dashboard') : t('dashboard.title')}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {!isAdmin && user && (
                <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10 shadow-[0_0_5px_rgba(99,102,241,0.15)]">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400/60" />
                  <span className="text-gray-200 font-bold text-xs sm:text-base">
                    {formatBalance(user.wallet || 0, language)}
                  </span>
                </div>
              )}

              <div className="hidden sm:block">
              <LanguageSelector />
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-cyan-300 transition-colors text-base sm:text-lg"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('auth.logout')}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/40 border border-gray-800/40 text-gray-400"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:flex-wrap gap-2 sm:gap-3 md:gap-4 mb-[60px] sm:mb-[80px] lg:mb-[100px] justify-center">
            {navContent}
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[100] sm:hidden">
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Drawer */}
              <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-slate-950 border-l border-gray-800 shadow-2xl p-6 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-lg font-bold text-cyan-400 uppercase tracking-wider">Menu</span>
              <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/40 border border-gray-800/40 text-gray-400"
              >
                      <X className="w-6 h-6" />
              </button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {navContent}
                  </div>

                  <div className="mt-auto pt-6 space-y-4 border-t border-gray-800">
                    <div className="flex justify-center">
                      <LanguageSelector />
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-3 w-full px-6 py-3 font-bold rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
          </div>
          )}

          <div className="flex justify-center">
            <div className="w-full max-w-[1600px]">
              <Outlet />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

