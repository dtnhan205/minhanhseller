import { useTranslation } from '@/hooks/useTranslation';
import { Shield, Users, Target, Award } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 rounded-2xl border border-gray-800/40 bg-slate-900/20 shadow-xl">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400/80" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-100 via-indigo-200 to-slate-400 bg-clip-text text-transparent">
            {t('about.title')}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-6 sm:p-8 md:p-10 border-gray-800/30 bg-slate-900/10">
        <div className="space-y-6 sm:space-y-10">
          {/* Introduction */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-200">
              {t('about.introduction')}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-4xl">
              {t('about.introText')}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="p-6 rounded-2xl border border-gray-800/40 bg-black/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400/60" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-200">
                  {t('about.mission')}
                </h3>
              </div>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                {t('about.missionText')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-800/40 bg-black/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400/60" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-200">
                  {t('about.vision')}
                </h3>
              </div>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                {t('about.visionText')}
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-200">
              {t('about.values')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { key: 'security', icon: Shield, color: 'text-indigo-400/50' },
                { key: 'reliability', icon: Award, color: 'text-slate-400/50' },
                { key: 'innovation', icon: Target, color: 'text-indigo-400/50' },
              ].map(({ key, icon: Icon, color }) => (
                <div
                  key={key}
                  className="p-5 rounded-2xl border border-gray-800/30 bg-black/5"
                >
                  <Icon className={`w-6 h-6 ${color} mb-3`} />
                  <h4 className="text-base font-semibold text-gray-300 mb-2">
                    {t(`about.value${key.charAt(0).toUpperCase() + key.slice(1)}` as any)}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(`about.value${key.charAt(0).toUpperCase() + key.slice(1)}Text` as any)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
