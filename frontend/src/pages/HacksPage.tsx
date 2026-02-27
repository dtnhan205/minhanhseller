import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Hack } from '@/types';
import Card from '@/components/ui/Card';
import { Activity, Shield, AlertTriangle, Loader2 } from 'lucide-react';

export default function HacksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error: showError } = useToastStore();
  const [hacks, setHacks] = useState<Hack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await sellerApi.getHacks();
        setHacks(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to load hacks';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [showError]);

  const getStatusBadge = (status: Hack['status']) => {
    if (status === 'updating') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
          <AlertTriangle className="w-3 h-3" />
          Đang update
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
        <Shield className="w-3 h-3" />
        An toàn
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Card
        className="bg-black/30 border border-gray-800"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {hacks.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Chưa có hack nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hacks.map((hack) => (
              <div
                key={hack._id}
                className="p-3 sm:p-4 rounded-xl border border-gray-800 bg-gray-950/60 hover:border-cyan-500/60 hover:bg-gray-900/60 transition-all duration-300 flex gap-3 sm:gap-4"
              >
                {hack.image ? (
                  <img
                    src={hack.image}
                    alt={hack.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-800 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border border-gray-800 flex-shrink-0">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-white font-semibold text-sm sm:text-base truncate">
                        {hack.name}
                      </h2>
                      {getStatusBadge(hack.status)}
                    </div>
                    {hack.description && (
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
                        {hack.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => navigate(`/hacks/${hack._id}`)}
                      className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-xs sm:text-sm font-medium text-white shadow-md"
                    >
                      Lấy link tải
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


