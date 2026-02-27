import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Shield, 
  Zap, 
  Smartphone, 
  ArrowRight, 
  MessageCircle,
  Trophy,
  Medal
} from 'lucide-react';
import Footer from '@/components/ui/Footer';
import ParticleNetwork from '@/components/ParticleNetwork';
import { sellerApi } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import { useExchangeRate } from '@/hooks/useExchangeRate';

function CountUp({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      const easedPercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      const currentCount = Math.floor(easedPercentage * end);
      
      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const [leaderboard, setLeaderboard] = useState<Array<{ email: string; totalTopup: number }>>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const data = await sellerApi.getTopupLeaderboard();
        setLeaderboard(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch {
        setLeaderboard([]);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    loadLeaderboard();
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-indigo-400" />,
      title: "An Toàn & Bảo Mật",
      desc: "Hệ thống mã hóa tiên tiến bảo vệ thông tin cá nhân và giao dịch của bạn tuyệt đối."
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      title: "Tốc Độ Vượt Trội",
      desc: "Xử lý giao dịch và tạo key chỉ trong vài giây, mang lại trải nghiệm không gián đoạn."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-indigo-400" />,
      title: "Đa Nền Tảng",
      desc: "Hỗ trợ hoàn hảo trên Android, iOS và PC với giao diện tối ưu hóa cho mọi kích thước màn hình."
    }
  ];

  const stats = useMemo(
    () => [
      { label: "Người dùng tin tưởng", value: 8000, suffix: "+" },
      { label: "Giao dịch thành công", value: 100000, suffix: "+" },
      { label: "Quốc gia hỗ trợ", value: 15, suffix: "+" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/25">
      {/* Particle Network Background */}
      <ParticleNetwork
        particleColor="rgba(99, 102, 241, 0.95)"
        lineColor="rgba(255, 255, 255, 0.35)"
        particleCount={80}
        linkDistance={180}
        opacity={0.6}
      />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
            backgroundSize: '4px 4px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-xl flex items-center justify-center shadow-lg border border-white/10"
            style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.45)' }}
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            RESELLER
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium backdrop-blur-md"
        >
          {t('auth.login') || 'Đăng nhập'}
        </button>
      </nav>

      {/* Hero Section - Banner Style */}
      <section className="relative z-10 px-6 pt-10 pb-32 mt-6">
        <div className="relative w-[90vw] max-w-none mx-auto min-h-[520px] sm:min-h-[600px] lg:min-h-[660px] flex items-center justify-center">
          {/* Background Layer (Spiderman) */}
          <div className="absolute inset-0 z-0 hidden lg:flex justify-end items-start overflow-visible">
            <img
              src="/images/spiderman.png"
              alt="Spiderman Banner"
              className="absolute right-0 top-0 h-[120%] w-auto max-w-none object-contain translate-y-[-8%] lg:translate-x-[6%]"
            />
          </div>

          {/* Overlay Content (Text & Buttons) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center lg:justify-start">
            <div className="px-6 sm:px-8 md:px-16 py-12 lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md animate-fade-in">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-indigo-300">Nền tảng Reseller thế hệ mới</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-slide-up">
                Nâng Tầm Trải Nghiệm{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-sky-400 to-violet-400 bg-clip-text text-transparent sm:whitespace-nowrap">
                  Game Thủ Chuyên Nghiệp
                </span>
              </h1>

              <p
                className="max-w-xl text-lg md:text-xl text-gray-300 mb-10 leading-relaxed animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                Cung cấp giải pháp tối ưu cho việc quản lý và phân phối key dịch vụ.
                Giao diện hiện đại, thanh toán tự động, hỗ trợ 24/7.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center justify-start gap-4 animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <button
                  onClick={() => navigate('/login')}
                  className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-950 font-bold text-lg shadow-lg hover:scale-105 transition-all overflow-hidden border border-white/10"
                  style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.45)' }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    Bắt đầu ngay <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-lg backdrop-blur-md"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee beneath the Banner */}
        <div className="mt-12 relative overflow-hidden py-4 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm -mx-6 md:-mx-12 lg:-mx-24">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-4">
                <span className="text-2xl md:text-3xl font-black text-white/20 uppercase tracking-tighter">
                  HỆ THỐNG RESELLER UY TÍN HÀNG ĐẦU
                </span>
                <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
                <span className="text-2xl md:text-3xl font-black text-indigo-500/30 uppercase tracking-tighter">
                  THANH TOÁN TỰ ĐỘNG 24/7
                </span>
                <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
                <span className="text-2xl md:text-3xl font-black text-white/20 uppercase tracking-tighter">
                  HỖ TRỢ ĐA NỀN TẢNG
                </span>
                <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-32 bg-white/[0.02] backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Tại sao chọn chúng tôi?</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-32 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-5xl md:text-6xl font-black bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent mb-2">
                <CountUp end={s.value} suffix={s.suffix} />
              </p>
              <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topup Leaderboard Section */}
      <section className="relative z-10 px-6 py-20 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Bảng Xếp Hạng Nạp Tiền
          </h2>
          <p className="text-gray-400">Vinh danh những Seller dẫn đầu hệ thống</p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
          {isLoadingLeaderboard ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Đang tải bảng xếp hạng...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-20 text-center text-gray-500 italic">
              Chưa có dữ liệu xếp hạng
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transform group-hover:scale-110 transition-transform ${
                        index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950' :
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-orange-950' :
                        'bg-white/5 text-gray-400 border border-white/10'
                      }`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <Medal className={`absolute -top-2 -right-2 w-6 h-6 ${
                          index === 0 ? 'text-amber-400' :
                          index === 1 ? 'text-slate-300' :
                          'text-orange-500'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {item.email}
                      </p>
                      <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Top {index + 1} Nạp tiền</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {formatCurrency(item.totalTopup, language, usdToVnd)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="mx-auto max-w-5xl p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden text-center group border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 leading-tight">
            Sẵn sàng để bứt phá <br className="hidden md:block" /> công việc kinh doanh của bạn?
          </h2>

          <button
            onClick={() => navigate('/login')}
            className="relative z-10 px-10 py-5 rounded-2xl bg-white text-blue-600 font-black text-xl hover:scale-105 transition-all shadow-2xl active:scale-95"
          >
            Đăng ký tham gia ngay
          </button>
        </div>
      </section>

      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all group shadow-2xl"
          onClick={() => window.open('/support', '_blank')}
        >
          <span className="text-xs font-bold text-gray-300 group-hover:text-white">Liên hệ hỗ trợ tại đây</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>

      <Footer />
    </div>
  );
}
