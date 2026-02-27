import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type { Order, ResetRequest } from '@/types';
import Card from '@/components/ui/Card';
import { Key, Download, History, Loader2, Search, X, Copy, Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, formatDateShort, truncateKey } from '@/utils/format';
import Input from '@/components/ui/Input';
import { getDisplayProductName } from '@/utils/translateProductName';

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  const [requestingResetId, setRequestingResetId] = useState<string | null>(null);
  const { error: showError, success: showSuccess } = useToastStore();

  useEffect(() => {
    loadOrders();
    loadResetRequests();
  }, []);

  // Refresh orders when navigating to this page
  useEffect(() => {
    if (location.pathname === '/history') {
      loadOrders();
    }
  }, [location.pathname]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await sellerApi.getOrders();

      const validOrders = (Array.isArray(data) ? data : [])
        .map((order: any) => {
          if (!order.key && order.keyValue) {
            order.key = order.keyValue;
          }
          if (!order.createdAt && order.purchasedAt) {
            order.createdAt = order.purchasedAt;
          }
          return order;
        })
        .filter((order: any) => {
          const isValid = order && order._id && (order.key || order.keyValue) && order.productName && typeof order.price === 'number';
          return isValid;
        });

      setOrders(
        validOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load orders';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResetRequests = async () => {
    try {
      const data = await sellerApi.getResetRequests();
      setResetRequests(data);
    } catch (err) {
      // Silently fail for reset requests
    }
  };

  const handleRequestReset = async (orderId: string) => {
    setRequestingResetId(orderId);
    try {
      await sellerApi.createResetRequest(orderId);
      showSuccess(t('history.resetRequested') || 'Yêu cầu reset đã được gửi');
      await loadResetRequests();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể gửi yêu cầu reset');
    } finally {
      setRequestingResetId(null);
    }
  };

  const getResetStatus = (orderId: string) => {
    return resetRequests.find((r) => {
      const rOrderId = typeof r.orderId === 'object' ? r.orderId._id : r.orderId;
      return rOrderId === orderId;
    });
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        (order.productName?.toLowerCase().includes(query) || false) ||
        (order.key?.toLowerCase().includes(query) || false) ||
        (formatPrice(order.price || 0, language, usdToVnd).toLowerCase().includes(query) || false)
    );
  }, [orders, searchQuery, language, usdToVnd]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      showSuccess(t('history.copied') || 'Copied!');
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      showError('Failed to copy');
    }
  };

  const downloadCSV = () => {
    const headers = [
      t('history.table.orderId') || 'Order ID',
      t('history.table.product') || 'Product',
      t('history.table.key') || 'Key',
      t('history.table.price') || 'Price',
      t('history.table.date') || 'Date',
    ];
    const csvData = orders.map((order) => [
      order._id,
      order.productName,
      order.key,
      formatPrice(order.price, language, usdToVnd),
      order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A',
    ]);

    const csvContent = [headers, ...csvData].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `key-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              {t('history.title')}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('history.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-950/50 hover:bg-gray-900 text-white border border-gray-800 hover:border-gray-700 rounded-xl transition-all shadow-lg text-sm sm:text-base whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          {t('history.downloadCSV')}
        </button>
      </div>

      <Card
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={t('history.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-black/50 border-gray-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      <Card
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{searchQuery ? t('history.noResults') : t('history.noHistory')}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">#</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">
                      {t('history.table.key') || 'Key'}
                    </th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">
                      {t('history.table.product') || 'Product'}
                    </th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">
                      {t('history.table.price') || 'Price'}
                    </th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">
                      {t('history.table.date') || 'Date'}
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">
                      {t('history.table.action') || 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, idx) => {
                    const globalIndex = startIndex + idx;
                    return (
                      <tr key={order._id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                        <td className="py-4 px-4 text-gray-200">#{globalIndex + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-cyan-400" />
                            <span className="text-gray-200 font-mono text-sm">{truncateKey(order.key || '', 30)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-200 font-medium">
                          {order.productName ? getDisplayProductName(order.productName, language) : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right text-teal-400 font-semibold">
                          {formatPrice(order.price || 0, language, usdToVnd)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-400 text-sm">
                          {order.createdAt ? formatDateShort(order.createdAt) : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => copyToClipboard(order.key || '', order._id)}
                              className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-2 group"
                              title={
                                copiedKeyId === order._id
                                  ? t('history.copied') || 'Copied!'
                                  : t('history.copyKey') || 'Copy Key'
                              }
                              disabled={!order.key}
                            >
                              {copiedKeyId === order._id ? (
                                <>
                                  <Check className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm font-medium">{t('history.copied') || 'Copied'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                                  <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300">
                                    {t('history.copyKey') || 'Copy'}
                                  </span>
                                </>
                              )}
                            </button>
                            {(() => {
                              const resetStatus = getResetStatus(order._id);
                              if (resetStatus) {
                                if (resetStatus.status === 'approved') {
                                  return (
                                    <span className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium">
                                      {t('history.resetApproved') || 'Đã reset'}
                                    </span>
                                  );
                                } else if (resetStatus.status === 'rejected') {
                                  return (
                                    <span className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium">
                                      {t('history.resetRejected') || 'Không thể reset'}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium">
                                      {t('history.resetPending') || 'Đang chờ'}
                                    </span>
                                  );
                                }
                              } else {
                                return (
                                  <button
                                    onClick={() => handleRequestReset(order._id)}
                                    disabled={requestingResetId === order._id}
                                    className="px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t('history.requestReset') || 'Yêu cầu reset'}
                                  >
                                    <RotateCcw className="w-4 h-4 text-orange-400" />
                                    <span className="text-orange-400 text-sm font-medium">
                                      {t('history.requestReset') || 'Yêu cầu reset'}
                                    </span>
                                  </button>
                                );
                              }
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {paginatedOrders.map((order, idx) => {
                const globalIndex = startIndex + idx;
                const resetStatus = getResetStatus(order._id);
                return (
                  <div key={order._id} className="bg-gray-950/50 rounded-xl p-4 border border-gray-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-400 text-xs">#{globalIndex + 1}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 text-xs">{order.createdAt ? formatDateShort(order.createdAt) : 'N/A'}</span>
                        </div>
                        <p className="text-white font-medium text-sm mb-1">
                          {order.productName ? getDisplayProductName(order.productName, language) : 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="text-gray-200 font-mono text-xs break-all">{order.key || 'N/A'}</span>
                        </div>
                        <p className="text-teal-400 font-semibold text-sm">{formatPrice(order.price || 0, language, usdToVnd)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => copyToClipboard(order.key || '', order._id)}
                        className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-2 justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!order.key}
                      >
                        {copiedKeyId === order._id ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">{t('history.copied') || 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-medium">{t('history.copyKey') || 'Copy'}</span>
                          </>
                        )}
                      </button>
                      {resetStatus ? (
                        resetStatus.status === 'approved' ? (
                          <span className="w-full px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium text-center">
                            {t('history.resetApproved') || 'Đã reset'}
                          </span>
                        ) : resetStatus.status === 'rejected' ? (
                          <span className="w-full px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium text-center">
                            {t('history.resetRejected') || 'Không thể reset'}
                          </span>
                        ) : (
                          <span className="w-full px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium text-center">
                            {t('history.resetPending') || 'Đang chờ'}
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleRequestReset(order._id)}
                          disabled={requestingResetId === order._id}
                          className="w-full px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg transition-all flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <RotateCcw className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 font-medium">{t('history.requestReset') || 'Yêu cầu reset'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400 order-2 sm:order-1">
                  {t('history.showing')} <span className="text-white font-medium">{startIndex + 1}</span> -{' '}
                  <span className="text-white font-medium">{Math.min(endIndex, filteredOrders.length)}</span> {t('history.of')}{' '}
                  <span className="text-white font-medium">{filteredOrders.length}</span> {t('history.orders')}
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-gray-950/50 hover:bg-gray-900 border border-gray-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold transition-all ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                                : 'bg-gray-950/50 text-gray-400 hover:bg-gray-900 border border-gray-800'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if ((page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2)) {
                        return (
                          <span key={page} className="text-gray-600 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-950/50 hover:bg-gray-900 border border-gray-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
