import { useTranslation } from '@/hooks/useTranslation';
import { HelpCircle, Send, Clock } from 'lucide-react';

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div 
          className="water-droplet w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0"
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
          <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('support.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {t('support.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Contact Methods */}
        <div 
          className="droplet-container p-6 sm:p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            {t('support.contactUs')}
          </h2>
          <div className="space-y-4">

            <a
              href="https://t.me/vanhdzsss"
              target="_blank"
              rel="noopener noreferrer"
              className="droplet-container p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer group"
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                 backdropFilter: 'blur(2px) saturate(120%)',
                 WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                boxShadow: `
                  0 4px 8px -2px rgba(0, 0, 0, 0.3),
                  0 2px 4px -1px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                  inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                  inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                  0 0 0 1px rgba(6, 182, 212, 0.2)
                `,
              }}
            >
              <Send className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1">
                  {t('support.telegram')}
                </h3>
                <p className="text-white/70 text-sm">
                  {t('support.telegramDesc')}
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div 
          className="droplet-container p-6 sm:p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            {t('support.faq')}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="droplet-container p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.025)',
                   backdropFilter: 'blur(2px) saturate(120%)',
                   WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: `
                    0 4px 8px -2px rgba(0, 0, 0, 0.3),
                    0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                    inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                    inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                <h3 className="text-base font-semibold text-white mb-2">
                  {t(`support.faq${num}Q` as any)}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {t(`support.faq${num}A` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div 
        className="droplet-container p-6 sm:p-8"
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
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 text-cyan-400" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {t('support.responseTime')}
            </h3>
            <p className="text-white/70 text-sm">
              {t('support.responseTimeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

