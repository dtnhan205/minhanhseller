import { useTranslation } from '@/hooks/useTranslation';
import { HelpCircle, Send, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 rounded-2xl border border-gray-800/40 bg-slate-900/20 shadow-xl">
          <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400/80" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-100 via-indigo-200 to-slate-400 bg-clip-text text-transparent">
            {t('support.title')}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{t('support.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-6 sm:p-8 border-gray-800/30 bg-slate-900/10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-200 mb-4 sm:mb-6">{t('support.contactUs')}</h2>
          <div className="space-y-4">

            <a
              href="https://t.me/dlmzc"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-gray-800/40 bg-black/10 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl border border-gray-800/40 bg-black/10 flex items-center justify-center">
                <Send className="w-6 h-6 text-indigo-400/60" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-200 mb-1">{t('support.telegram')}</h3>
                <p className="text-gray-500 text-sm">{t('support.telegramDesc')}</p>
              </div>
            </a>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 border-gray-800/30 bg-slate-900/10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-200 mb-4 sm:mb-6">{t('support.faq')}</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-4 rounded-2xl border border-gray-800/40 bg-black/10">
                <h3 className="text-base font-semibold text-gray-200 mb-2">{t(`support.faq${num}Q` as any)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(`support.faq${num}A` as any)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 border-gray-800/30 bg-slate-900/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl border border-gray-800/40 bg-black/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-indigo-400/60" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-1">{t('support.responseTime')}</h3>
            <p className="text-gray-500 text-sm">{t('support.responseTimeDesc')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
