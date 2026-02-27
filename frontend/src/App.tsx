import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import GeneratePage from './pages/GeneratePage';
import StatsPage from './pages/StatsPage';
import HistoryPage from './pages/HistoryPage';
import TransactionsPage from './pages/TransactionsPage';
import TopupPage from './pages/TopupPage';
import AdminPage from './pages/AdminPage';
import HacksPage from './pages/HacksPage';
import HackDetailPage from './pages/HackDetailPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ToastContainer from './components/ui/ToastContainer';
import ScrollToTop from './components/ScrollToTop';
import RainEffect from './components/RainEffect';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
}

function SellerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'seller' ? <>{children}</> : <Navigate to="/admin" replace />;
}

function LenisController() {
  const location = useLocation();

  useEffect(() => {
    // Disable Lenis on problematic pages (long tables, heavy layouts)
    // and all Admin pages to ensure they never feel "stiff"
    const isProblematicPage =
      location.pathname.startsWith('/admin') 

    if (isProblematicPage) {
      // Use native browser scrolling on these pages to avoid wheel-lock issues
      // inside forms, modals, and nested scroll containers.
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      lerp: 0.1,
      touchInertiaMultiplier: 35,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location.pathname]);

  return null;
}

// HacksRouteWrapper: Nếu đã login thì dùng DashboardLayout, chưa login thì dùng PublicLayout
function HacksRouteWrapper() {
  const { token, user } = useAuthStore();

  // Nếu đã login và là seller → dùng DashboardLayout (có navigation bar)
  if (token && user?.role === 'seller') {
    return <DashboardLayout />;
  }

  // Nếu chưa login → dùng PublicLayout (không có navigation bar)
  return <PublicLayout />;
}

function App() {
  const { user } = useAuthStore();
  const defaultRoute = user?.role === 'admin' ? '/admin' : '/generate';

  // Anti F12 / DevTools & disable right-click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (e.ctrlKey && key === 'u')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <>
      <LenisController />
      <RainEffect />
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Public Pages outside of /app */}
        <Route element={<PublicLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route
          path="/app"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to={defaultRoute} replace />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="generate"
            element={
              <SellerRoute>
                <GeneratePage />
              </SellerRoute>
            }
          />
          <Route
            path="stats"
            element={
              <SellerRoute>
                <StatsPage />
              </SellerRoute>
            }
          />
          <Route
            path="history"
            element={
              <SellerRoute>
                <HistoryPage />
              </SellerRoute>
            }
          />
          <Route
            path="transactions"
            element={
              <SellerRoute>
                <TransactionsPage />
              </SellerRoute>
            }
          />
          <Route
            path="topup"
            element={
              <SellerRoute>
                <TopupPage />
              </SellerRoute>
            }
          />
        </Route>

        {/* Hacks pages: Nếu đã login (seller) thì có navigation bar, chưa login thì không */}
        <Route path="/hacks" element={<HacksRouteWrapper />}>
          <Route index element={<HacksPage />} />
          <Route path=":id" element={<HackDetailPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
