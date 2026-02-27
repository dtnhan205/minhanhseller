import { useState, useEffect, useMemo } from 'react';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { TopupTransaction } from '@/types';
import Card from '@/components/ui/Card';
import { ArrowDownCircle, TrendingUp, Loader2, Calendar, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';
import Input from '@/components/ui/Input';
import { useExchangeRate } from '@/hooks/useExchangeRate';

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const [transactions, setTransactions] = useState<TopupTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { error: showError } = useToastStore();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await sellerApi.getTopupHistory();
      setTransactions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load transactions';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter((t) => {
      const amountUSD = t.amountUSD || t.amount / usdToVnd;
      const amountStr = formatCurrency(amountUSD, language, usdToVnd).toLowerCase();
      const dateStr = formatDateShort(t.createdAt).toLowerCase();
      return amountStr.includes(query) || dateStr.includes(query);
    });
  }, [transactions, searchQuery, language, usdToVnd]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalTopup = filteredTransactions.reduce(
    (sum, t) => sum + (t.amountUSD || t.amount / usdToVnd),
    0
  );

  const thisMonth = filteredTransactions.filter((t) => {
    const transactionDate = new Date(t.createdAt);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce(
    (sum, t) => sum + (t.amountUSD || t.amount / usdToVnd),
    0
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
          <ArrowDownCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('transactions.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {t('transactions.subtitle')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card 
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('transactions.totalTopup')}</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(totalTopup, language, usdToVnd)}</p>
            </div>
          </div>
        </Card>

        <Card 
          className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('transactions.thisMonth')}</p>
              <p className="text-3xl font-bold text-cyan-400">{formatCurrency(thisMonthTotal, language, usdToVnd)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
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
            placeholder={t('common.search') || 'Tìm kiếm theo số tiền hoặc ngày...'}
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

      {/* Transactions Table */}
      <Card 
        title={t('transactions.history')}
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{t('transactions.noHistory')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">#</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">AMOUNT</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction, idx) => (
                    <tr
                      key={transaction._id}
                      className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-200">#{startIndex + idx + 1}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-400 font-bold text-lg">
                          +{formatCurrency(transaction.amountUSD || transaction.amount / usdToVnd, language, usdToVnd)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-400 text-sm">
                        {formatDateShort(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {paginatedTransactions.map((transaction, idx) => (
                <div
                  key={transaction._id}
                  className="bg-gray-950/50 rounded-xl p-4 border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">#{startIndex + idx + 1}</span>
                    <span className="text-gray-400 text-xs">
                      {formatDateShort(transaction.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Amount</span>
                    <span className="text-green-400 font-bold text-lg">
                      +{formatCurrency(transaction.amountUSD || transaction.amount / usdToVnd, language, usdToVnd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredTransactions.length > 0 && (
          <>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-400">
                    {t('history.showing')} {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)}{' '}
                    {t('history.of')} {filteredTransactions.length}{' '}
                    {filteredTransactions.length !== 1
                      ? t('transactions.transactions')
                      : t('transactions.transaction')}
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

            {/* Total count (no pagination or single page) */}
            {totalPages === 1 && (
              <div className="mt-6 pt-4 border-t border-gray-800 text-center text-sm text-gray-400">
                {t('transactions.total')} {filteredTransactions.length}{' '}
                {filteredTransactions.length !== 1
                  ? t('transactions.transactions')
                  : t('transactions.transaction')}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
