import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import type { Hack } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Activity, ArrowLeft, Shield, AlertTriangle, ExternalLink, Copy, Check, Loader2 } from 'lucide-react';

export default function HackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToastStore();
  const [hack, setHack] = useState<Hack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await sellerApi.getHackDetail(id);
        setHack(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to load hack detail';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, showError]);

  const handleCopyLink = async () => {
    if (!hack?.downloadUrl) return;
    try {
      await navigator.clipboard.writeText(hack.downloadUrl);
      setCopied(true);
      showSuccess('Đã copy link tải!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError('Copy thất bại, hãy copy thủ công.');
    }
  };

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

  if (isLoading || !hack) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Đang tải chi tiết hack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/hacks')}
        className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      <Card
        className="bg-black/40 border border-gray-800"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          <div className="w-full md:w-64 flex-shrink-0">
            {hack.image ? (
              <img
                src={hack.image}
                alt={hack.name}
                className="w-full h-40 sm:h-56 md:h-64 object-cover rounded-xl border border-gray-800"
              />
            ) : (
              <div className="w-full h-40 sm:h-56 md:h-64 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border border-gray-800">
                <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {hack.name}
                </h1>
                <div className="mt-1">{getStatusBadge(hack.status)}</div>
              </div>
            </div>

            {hack.description && (
              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-1">
                  Mô tả
                </h2>
                <p className="text-gray-300 text-sm whitespace-pre-line">
                  {hack.description}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-gray-300 mb-1">
                Link tải
              </h2>
              {hack.downloadUrl ? (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <code className="flex-1 text-xs sm:text-sm text-cyan-300 bg-black/60 border border-gray-800 rounded px-3 py-2 break-all">
                      {hack.downloadUrl}
                    </code>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-2 text-xs sm:text-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <a
                        href={hack.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="button"
                          className="px-3 py-2 text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Mở link
                        </Button>
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Bấm "Copy" để sao chép link hoặc "Mở link" để tải ngay.
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Chưa có link tải.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


