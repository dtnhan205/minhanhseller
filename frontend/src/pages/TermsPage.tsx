import { useTranslation } from '@/hooks/useTranslation';
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 rounded-2xl border border-gray-800/40 bg-slate-900/20 shadow-xl">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400/80" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-100 via-indigo-200 to-slate-400 bg-clip-text text-transparent">
            {t('terms.title')}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{t('terms.subtitle')}</p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 md:p-10 border-gray-800/30 bg-slate-900/10">
        <div className="space-y-6 sm:space-y-8">
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('terms.intro')}</p>

          {[
            { key: 'acceptance', icon: CheckCircle },
            { key: 'usage', icon: FileText },
            { key: 'prohibited', icon: XCircle },
            { key: 'liability', icon: AlertTriangle },
          ].map(({ key, icon: Icon }) => (
            <div key={key} className="p-5 sm:p-6 rounded-2xl border border-gray-800/40 bg-black/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400/60" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-200">{t(`terms.${key}Title` as any)}</h2>
              </div>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{t(`terms.${key}Text` as any)}</p>
            </div>
          ))}

          <div className="pt-5 border-t border-gray-800/30">
            <p className="text-gray-500 text-sm sm:text-base">{t('terms.contact')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
