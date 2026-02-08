import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Order, ResetRequest } from '@/types';
import Card from '@/components/ui/Card';
import { Key, Download, History, Loader2, Search, X, Copy, Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, formatDateShort, truncateKey } from '@/utils/format';
import Input from '@/components/ui/Input';
import { getDisplayProductName } from '@/utils/translateProductName';

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { t, language } = useTranslation();
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
      // console.log('Loaded orders from API:', data);
      // console.log('Number of orders:', data?.length || 0);
      
      // Validate and filter out invalid orders
      // Note: Backend returns 'key' field (transformed from keyValue)
      const validOrders = (Array.isArray(data) ? data : []).map((order: any) => {
        // Ensure key field exists (backend might return keyValue)
        if (!order.key && order.keyValue) {
          order.key = order.keyValue;
        }
        // Ensure createdAt exists
        if (!order.createdAt && order.purchasedAt) {
          order.createdAt = order.purchasedAt;
        }
        return order;
      }).filter((order: any) => {
        const isValid = order && 
                       order._id && 
                       (order.key || order.keyValue) && 
                       order.productName && 
                       typeof order.price === 'number';
        if (!isValid) {
          // console.warn('Invalid order filtered out:', order);
        }
        return isValid;
      });
      
      // console.log('Valid orders after filtering:', validOrders);
      // console.log('Number of valid orders:', validOrders.length);
      
      setOrders(validOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }));
    } catch (err: any) {
      // console.error('Error loading orders:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load orders';
      showError(errorMessage);
      setOrders([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadResetRequests = async () => {
    try {
      const data = await sellerApi.getResetRequests();
      setResetRequests(data);
    } catch (err: any) {
      // console.error('Failed to load reset requests:', err);
    }
  };

  const handleRequestReset = async (orderId: string) => {
    setRequestingResetId(orderId);
    try {
      await sellerApi.createResetRequest(orderId);
      showSuccess(t('history.resetRequested') || 'Yêu cầu reset đã được gửi');
      await loadResetRequests();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to request reset';
      showError(errorMessage);
    } finally {
      setRequestingResetId(null);
    }
  };

  const getResetStatus = (orderId: string): ResetRequest | null => {
    if (!orderId) return null;
    try {
      return resetRequests.find(r => {
        if (!r) return false;
        if (r.orderId === orderId) return true;
        if (typeof r.orderId === 'object' && r.orderId && r.orderId._id === orderId) return true;
        return false;
      }) || null;
    } catch (err) {
      // console.error('Error in getResetStatus:', err, orderId);
      return null;
    }
  };

  const filteredOrders = useMemo(() => {
    // console.log('=== Filtering Orders ===');
    // console.log('Total orders:', orders.length);
    // console.log('Search query:', searchQuery);
    
    const filtered = orders.filter((order) => {
      if (!order) {
        // console.warn('Null order in filter');
        return false;
      }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
      try {
        const matches = (
          (order.productName?.toLowerCase().includes(query) || false) ||
          (order.key?.toLowerCase().includes(query) || false) ||
          (formatPrice(order.price || 0).toLowerCase().includes(query) || false)
    );
        return matches;
      } catch (err) {
        // console.error('Error filtering order:', err, order);
        return false;
      }
    });
    
    // console.log('Filtered result:', filtered.length, 'orders');
    // console.log('Filtered orders:', filtered);
    return filtered;
  }, [orders, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Debug logging
  useEffect(() => {
    // console.log('=== HistoryPage State ===');
    // console.log('Orders:', orders);
    // console.log('Orders count:', orders.length);
    // console.log('Filtered orders:', filteredOrders);
    // console.log('Filtered count:', filteredOrders.length);
    // console.log('Is loading:', isLoading);
  }, [orders, filteredOrders, isLoading]);

  const handleDownloadCSV = () => {
    try {
    const headers = ['#', 'KEY', 'TYPE', 'PRICE', 'DATE'];
    const rows = filteredOrders.map((order, idx) => [
      idx + 1,
        order.key || 'N/A',
        order.productName || 'N/A',
        (order.price || 0).toString(),
      formatDateShort(order.createdAt),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `key-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    } catch (err) {
      // console.error('Error downloading CSV:', err);
      showError('Failed to download CSV');
    }
  };

  const copyToClipboard = async (key: string | undefined, orderId: string) => {
    if (!key) {
      showError('No key to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(orderId);
      showSuccess(t('history.copied') || 'Copied!');
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      showError('Failed to copy');
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              {t('history.title')}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {t('history.subtitle')}
            </p>
          </div>
        </div>
        {orders.length > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t('history.downloadCSV')}</span>
            <span className="sm:hidden">Download</span>
          </button>
        )}
      </div>

      <Card
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {/* Search */}
        <div className="mb-6">
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
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{t('history.noHistory')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{t('history.noResults')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">#</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">KEY</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">TYPE</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">PRICE</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">DATE</th>
                    <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, idx) => {
                  try {
                    if (!order || !order._id) return null;
                    const globalIndex = startIndex + idx;
                    return (
                  <tr key={order._id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                    <td className="py-4 px-4 text-gray-200">#{globalIndex + 1}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-200 font-mono text-sm">
                          {truncateKey(order.key || '', 30)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-200 font-medium">{order.productName ? getDisplayProductName(order.productName, language) : 'N/A'}</td>
                    <td className="py-4 px-4 text-right text-teal-400 font-semibold">
                      ${formatPrice(order.price || 0)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400 text-sm">
                      {order.createdAt ? formatDateShort(order.createdAt) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => copyToClipboard(order.key || '', order._id)}
                          className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-2 group"
                          title={copiedKeyId === order._id ? (t('history.copied') || 'Copied!') : (t('history.copyKey') || 'Copy Key')}
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
                              <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300">{t('history.copyKey') || 'Copy'}</span>
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
                                <span className="text-orange-400 text-sm font-medium">{t('history.requestReset') || 'Yêu cầu reset'}</span>
                              </button>
                            );
                          }
                        })()}
                      </div>
                    </td>
                  </tr>
                    );
                  } catch (err) {
                    // console.error('Error rendering order row:', err, order);
                    return null;
                  }
                })}
              </tbody>
            </table>
          </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {paginatedOrders.map((order, idx) => {
                try {
                  if (!order || !order._id) return null;
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
                        <p className="text-white font-medium text-sm mb-1">{order.productName ? getDisplayProductName(order.productName, language) : 'N/A'}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="text-gray-200 font-mono text-xs break-all">{order.key || 'N/A'}</span>
                        </div>
                        <p className="text-teal-400 font-semibold text-sm">${formatPrice(order.price || 0)}</p>
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
                } catch (err) {
                    // console.error('Error rendering order card:', err, order);
                  return null;
                }
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                {t('history.showing')} {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} {t('history.of')} {filteredOrders.length} {t('history.orders')}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="water-droplet w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                  style={{
                    background: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(2px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: currentPage === 1 ? 'none' : `
                      0 4px 8px -2px rgba(0, 0, 0, 0.3),
                      0 2px 4px -1px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                      inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(255, 255, 255, 0.05)
                    `,
                  }}
                >
                  <ChevronLeft className="w-5 h-5 text-white relative z-10" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!showPage && page === currentPage - 2 && currentPage > 3) {
                      return <span key={`ellipsis-start`} className="text-gray-500 px-2">...</span>;
                    }
                    if (!showPage && page === currentPage + 2 && currentPage < totalPages - 2) {
                      return <span key={`ellipsis-end`} className="text-gray-500 px-2">...</span>;
                    }
                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`water-droplet w-10 h-10 flex items-center justify-center text-sm font-semibold relative z-10 ${
                          currentPage === page ? 'text-cyan-400' : 'text-white/70 hover:text-white'
                        }`}
                        style={{
                          background: currentPage === page 
                            ? 'rgba(6, 182, 212, 0.2)' 
                            : 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(2px) saturate(120%)',
                          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                          border: currentPage === page
                            ? '1px solid rgba(6, 182, 212, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: currentPage === page
                            ? `
                              0 4px 8px -2px rgba(6, 182, 212, 0.3),
                              0 2px 4px -1px rgba(6, 182, 212, 0.2),
                              inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                              inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                              inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                              0 0 0 1px rgba(6, 182, 212, 0.2)
                            `
                            : `
                              0 4px 8px -2px rgba(0, 0, 0, 0.3),
                              0 2px 4px -1px rgba(0, 0, 0, 0.2),
                              inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                              inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                              inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                              0 0 0 1px rgba(255, 255, 255, 0.05)
                            `,
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="water-droplet w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                  style={{
                    background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(2px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: currentPage === totalPages ? 'none' : `
                      0 4px 8px -2px rgba(0, 0, 0, 0.3),
                      0 2px 4px -1px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                      inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(255, 255, 255, 0.05)
                    `,
                  }}
                >
                  <ChevronRight className="w-5 h-5 text-white relative z-10" />
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredOrders.length > 0 && totalPages === 1 && (
          <div className="mt-6 pt-4 border-t border-gray-800 text-center text-sm text-gray-400">
            {t('history.showing')} {filteredOrders.length} {t('history.of')} {orders.length} {t('history.orders')}
          </div>
        )}
      </Card>
    </div>
  );
}
