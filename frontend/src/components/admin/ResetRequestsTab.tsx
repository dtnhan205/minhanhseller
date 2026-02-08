import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { ResetRequest } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RotateCcw, Loader2, Check, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateShort, truncateKey } from '@/utils/format';

const ITEMS_PER_PAGE = 10;

export default function ResetRequestsTab() {
  const { t } = useTranslation();
  const { error: showError, success: showSuccess } = useToastStore();
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getResetRequests();
      setRequests(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load reset requests';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await adminApi.approveResetRequest(id);
      showSuccess(t('admin.approve') || 'Reset request approved');
      await loadRequests();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to approve request';
      showError(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await adminApi.rejectResetRequest(id);
      showSuccess(t('admin.reject') || 'Reset request rejected');
      await loadRequests();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to reject request';
      showError(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            {t('admin.pending')}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <Check className="w-3 h-3" />
            {t('admin.approved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <X className="w-3 h-3" />
            {t('admin.rejected')}
          </span>
        );
      default:
        return null;
    }
  };

  // Reset về trang 1 khi dữ liệu thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length]);

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Card
      style={{
        backdropFilter: 'blur(2px) saturate(120%)',
        WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">{t('admin.resetRequestTitle')}</h2>
        <p className="text-gray-400 text-sm">{t('admin.resetRequestSubtitle')}</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <RotateCcw className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">{t('admin.noResetRequests')}</p>
        </div>
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">#</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">{t('admin.category')}</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">{t('admin.product')}</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">{t('admin.key')}</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">{t('admin.requestedBy')}</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">{t('admin.requestedAt')}</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">{t('admin.status')}</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody>
                {paginatedRequests.map((request, idx) => (
                  <tr
                    key={request._id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-200">#{startIndex + idx + 1}</td>
                  <td className="py-4 px-4 text-gray-200">{request.categoryName}</td>
                  <td className="py-4 px-4 text-gray-200">{request.productName}</td>
                  <td className="py-4 px-4">
                      <span className="font-mono text-sm text-cyan-400">
                        {truncateKey(request.key, 30)}
                      </span>
                  </td>
                  <td className="py-4 px-4 text-gray-200">{request.requestedBy}</td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {formatDateShort(request.createdAt)}
                    </td>
                  <td className="py-4 px-4 text-center">{getStatusBadge(request.status)}</td>
                  <td className="py-4 px-4 text-center">
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm"
                          isLoading={processingId === request._id}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {t('admin.approve')}
                        </Button>
                        <Button
                          onClick={() => handleReject(request._id)}
                          disabled={processingId === request._id}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm"
                          isLoading={processingId === request._id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t('admin.reject')}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">
                        {request.processedAt && (
                          <div>
                              <div>
                                {t('admin.processedAt')}: {formatDateShort(request.processedAt)}
                              </div>
                            {request.processedBy && typeof request.processedBy === 'object' && (
                                <div className="mt-1">
                                  {t('admin.processedBy')}: {request.processedBy.email}
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Pagination */}
          {requests.length > 0 && totalPages > 1 && (
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  {t('history.showing')} {startIndex + 1}-{Math.min(endIndex, requests.length)} {t('history.of')}{' '}
                  {requests.length} {t('history.orders')}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-200" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage && page === currentPage - 2 && currentPage > 3) {
                        return (
                          <span key="ellipsis-start" className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      if (!showPage && page === currentPage + 2 && currentPage < totalPages - 2) {
                        return (
                          <span key="ellipsis-end" className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      if (!showPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold border ${
                            currentPage === page
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-200" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

