import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Footer from '@/components/ui/Footer';
import { Activity, LogIn } from 'lucide-react';

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen relative">
      <div className="flex justify-center">
        <div className="w-full max-w-[1800px] p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 relative z-20">
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
                <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Status Hack
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <LanguageSelector />
              <button
                onClick={() => navigate('/login', { replace: false, state: { from: location.pathname } })}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-base sm:text-lg p-2 sm:p-0"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            </div>
          </div>

          {/* Content */}
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


