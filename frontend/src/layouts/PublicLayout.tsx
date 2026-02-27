import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Footer from '@/components/ui/Footer';
import { Activity, LogIn } from 'lucide-react';

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen relative bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-950/70 to-black/90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)',
            backgroundSize: '4px 4px',
          }}
        />
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[1800px] p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 relative z-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-lg shadow-cyan-900/20">
                <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-teal-300 bg-clip-text text-transparent">
                Reseller Platform
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <LanguageSelector />
              <button
                onClick={() =>
                  navigate('/login', { replace: false, state: { from: location.pathname } })
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Đăng nhập</span>
              </button>
            </div>
          </div>

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
