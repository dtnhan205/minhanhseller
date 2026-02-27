import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import {
  ShoppingBag,
  Copy,
  Check,
  Search,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
} from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';

interface Order {
  _id: string;
  sellerEmail: string;
  sellerId: string;
  productName: string;
  productId: string;
  keyValue: string;
  price: number;
  purchasedAt: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function OrdersHistoryTab() {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, startDate, endDate]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllOrders(
        currentPage,
        ITEMS_PER_PAGE,
        startDate || undefined,
        endDate || undefined,
        searchQuery || undefined
      );
      setOrders(data.orders);
      setTotalRevenue(data.totalRevenue);
      setTotalOrders(data.totalOrders);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      // console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      // console.error('Failed to copy key:', error);
    }
  };

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="water-droplet w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(2px) saturate(120%)',
                WebkitBackdropFilter: 'blur(2px) saturate(120%)',
              }}
            >
              <ShoppingBag className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">{t('admin.totalOrders')}</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="water-droplet w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(2px) saturate(120%)',
                WebkitBackdropFilter: 'blur(2px) saturate(120%)',
              }}
            >
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">{t('admin.totalRevenue')}</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalRevenue, language, usdToVnd)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Date Filter */}
      <div className="space-y-4">
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder={t('common.search') || 'Tìm kiếm...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12"
              style={{ fontSize: '16px' }}
            />
          </div>
        </Card>

        {/* Date Filter */}
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-5 h-5 flex-shrink-0 text-white/70" />
              <span className="text-sm font-medium">Lọc theo ngày:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label className="text-sm text-white/70 whitespace-nowrap">Từ ngày:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field flex-1 sm:w-auto min-w-[150px]"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label className="text-sm text-white/70 whitespace-nowrap">Đến ngày:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={startDate || undefined}
                  className="input-field flex-1 sm:w-auto min-w-[150px]"
                  style={{ fontSize: '16px' }}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearDateFilter}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Orders List */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/70">
                {searchQuery ? t('common.noData') : t('admin.noOrders')}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                        {t('admin.seller') || 'Seller'}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                        {t('admin.product') || 'Sản phẩm'}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                        {t('admin.key') || 'Key'}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                        {t('admin.price') || 'Giá'}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                        {t('admin.purchasedAt')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="text-white text-sm">{order.sellerEmail}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-white text-sm">{order.productName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-cyan-400 bg-white/5 px-2 py-1 rounded font-mono max-w-[200px] truncate">
                              {order.keyValue}
                            </code>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-white text-sm font-semibold">
                            {formatCurrency(order.price, language, usdToVnd)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-white/70 text-sm">{formatDateShort(order.purchasedAt)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleCopyKey(order.keyValue)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title={copiedKey === order.keyValue ? t('common.copied') : t('common.copy')}
                          >
                            {copiedKey === order.keyValue ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/60 hover:text-white" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalOrders > 0 && totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-white/70">
                      {t('history.showing')} {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalOrders)} {t('history.of')} {totalOrders}{' '}
                      {t('history.orders')}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/20 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!showPage && page === currentPage - 2 && currentPage > 3) {
                            return (
                              <span key="ellipsis-start" className="px-2 text-white/50">
                                ...
                              </span>
                            );
                          }
                          if (!showPage && page === currentPage + 2 && currentPage < totalPages - 2) {
                            return (
                              <span key="ellipsis-end" className="px-2 text-white/50">
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
                                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
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
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/20 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
