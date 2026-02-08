import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Heart, Send, Shield, Info, HelpCircle, Scale } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-20 md:mt-24 pb-6 sm:pb-8">
      <div 
        className="droplet-container p-6 sm:p-8 md:p-10"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="water-droplet w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(2px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(2px) saturate(120%)',
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
                <Shield className="w-6 h-6 text-white relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {t('footer.brand')}
              </h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about"
                  className="text-white/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('footer.about')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/support"
                  className="text-white/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('footer.support')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy"
                  className="text-white/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('footer.privacy')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="text-white/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('footer.terms')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://t.me/dlmzc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-all duration-300 text-sm flex items-center gap-3 group"
                >
                  <div 
                    className="water-droplet w-9 h-9 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(6, 182, 212, 0.2)',
                      backdropFilter: 'blur(2px) saturate(120%)',
                      WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      boxShadow: `
                        0 4px 8px -2px rgba(6, 182, 212, 0.3),
                        0 2px 4px -1px rgba(6, 182, 212, 0.2),
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                        inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                        inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                        0 0 0 1px rgba(6, 182, 212, 0.2)
                      `,
                    }}
                  >
                    <Send className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors relative z-10" />
                  </div>
                  <span>{t('footer.telegram')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6 sm:mb-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-white/70 text-xs sm:text-sm">
            © {currentYear} {t('footer.brand')}. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-xs sm:text-sm">
            <span>{t('footer.madeWith')}</span>
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 fill-red-400 animate-pulse" />
            <span>{t('footer.by')}</span>
            <span className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors cursor-pointer">
              {t('footer.team')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
