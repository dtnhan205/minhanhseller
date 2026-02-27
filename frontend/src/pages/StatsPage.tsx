import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type { Order, Product } from '@/types';
import Card from '@/components/ui/Card';
import { BarChart3, TrendingUp, Package, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { getDisplayProductName } from '@/utils/translateProductName';

export default function StatsPage() {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: showError } = useToastStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        sellerApi.getOrders(),
        sellerApi.getProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load stats';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);
  const totalKeys = orders.length;
  const avgPrice = totalKeys > 0 ? totalSpent / totalKeys : 0;

  // Group by product
  const productStats = products.map((product) => {
    const productOrders = orders.filter((o) => {
      if (typeof o.product === 'object' && o.product !== null) {
        return o.product._id === product._id;
      }
      return o.product === product._id || o.productName === product.name;
    });
    return {
      name: getDisplayProductName(product.name, language),
      purchased: productOrders.length,
      revenue: productOrders.reduce((sum, o) => sum + o.price, 0),
    };
  });

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
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('stats.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('stats.subtitle')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card
          className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('stats.totalKeys')}</p>
              <p className="text-3xl font-bold text-cyan-400">{totalKeys}</p>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('stats.totalSpent')}</p>
              <p className="text-3xl font-bold text-teal-400">{formatCurrency(totalSpent, language, usdToVnd)}</p>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('stats.avgPrice')}</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(avgPrice, language, usdToVnd)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Product Stats */}
      <Card
        title={t('stats.productStatistics')}
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {productStats.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{t('stats.noStatistics')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Product</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">{t('stats.purchased')}</th>
                  </tr>
                </thead>
                <tbody>
                  {productStats.map((stat, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4 text-gray-200 font-medium">{stat.name}</td>
                      <td className="py-4 px-4 text-right text-cyan-400 font-semibold">{stat.purchased}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {productStats.map((stat, idx) => (
                <div key={idx} className="bg-gray-950/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-200 font-medium text-sm">{stat.name}</p>
                    <p className="text-cyan-400 font-semibold">{stat.purchased}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
