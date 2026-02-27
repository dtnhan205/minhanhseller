import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  FolderTree,
  Package,
  Database,
  LayoutDashboard,
  DollarSign,
  Building2,
  History,
  RotateCcw,
  Activity,
  Tags,
  ShoppingCart,
  Wallet,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

import { useSellers, useCategories, useProducts } from '@/hooks/useAdminData';
import { adminApi } from '@/services/api';
import SellersTab from '@/components/admin/SellersTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import ProductsTab from '@/components/admin/ProductsTab';
import InventoryTab from '@/components/admin/InventoryTab';
import ExchangeRateTab from '@/components/admin/ExchangeRateTab';
import BankAccountsTab from '@/components/admin/BankAccountsTab';
import OrdersHistoryTab from '@/components/admin/OrdersHistoryTab';
import ResetRequestsTab from '@/components/admin/ResetRequestsTab';
import HacksTab from '@/components/admin/HacksTab';
import SellerPricesTab from '@/components/admin/SellerPricesTab';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatCurrency } from '@/utils/format';
import type { AdminDashboardStats } from '@/types';

type TabType =
  | 'dashboard'
  | 'sellers'
  | 'categories'
  | 'products'
  | 'inventory'
  | 'exchange-rate'
  | 'banks'
  | 'orders'
  | 'reset-requests'
  | 'hacks-status'
  | 'seller-prices';

const emptyStats: AdminDashboardStats = {
  today: { totalOrders: 0, totalRevenue: 0 },
  thisMonth: { totalOrders: 0, totalRevenue: 0 },
  thisYear: { totalOrders: 0, totalRevenue: 0 },
  allTime: { totalOrders: 0, totalRevenue: 0 },
  chart: [],
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats>(emptyStats);
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(false);

  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const { sellers, isLoading: isLoadingSellers, createSeller } = useSellers();
  const {
    isLoading: isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const {
    isLoading: isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addInventory,
  } = useProducts();

  const isLoading = isLoadingSellers || isLoadingCategories || isLoadingProducts;

  useEffect(() => {
    if (activeTab !== 'dashboard') return;

    const loadStats = async () => {
      setIsLoadingDashboardStats(true);
      try {
        const data = await adminApi.getDashboardStats();
        setDashboardStats(data);
      } catch {
        setDashboardStats(emptyStats);
      } finally {
        setIsLoadingDashboardStats(false);
      }
    };

    loadStats();
  }, [activeTab]);

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sellers', label: 'Sellers', icon: Users },
    { id: 'seller-prices', label: 'Set giá seller', icon: Tags },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'orders', label: 'Lịch sử mua', icon: History },
    { id: 'reset-requests', label: 'Yêu cầu reset', icon: RotateCcw },
    { id: 'hacks-status', label: 'Status hack', icon: Activity },
    { id: 'banks', label: 'Ngân hàng', icon: Building2 },
    { id: 'exchange-rate', label: 'Tỷ giá', icon: DollarSign },
  ];

  const chartPoints = useMemo(() => {
    const chart = dashboardStats.chart || [];
    if (chart.length === 0) return '';

    const maxRevenue = Math.max(...chart.map((c) => c.totalRevenue), 1);

    return chart
      .map((item, index) => {
        const x = (index / Math.max(chart.length - 1, 1)) * 100;
        const y = 100 - (item.totalRevenue / maxRevenue) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  }, [dashboardStats.chart]);

  const handleUpdateExchangeRate = async (rate: number) => {
    return await adminApi.updateExchangeRate(rate);
  };

  const handleCreateBankAccount = async (data: any) => {
    return await adminApi.createBankAccount(data);
  };

  const handleUpdateBankAccount = async (id: string, data: any) => {
    return await adminApi.updateBankAccount(id, data);
  };

  const handleDeleteBankAccount = async (id: string) => {
    return await adminApi.deleteBankAccount(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-white/60">Quản trị hệ thống và phân phối</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ` +
                (isActive
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5 rounded-t-lg')
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng số Sellers</div>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white">{isLoadingSellers ? '...' : sellers.length}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng đơn đã bán</div>
                  <ShoppingCart className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {isLoadingDashboardStats ? '...' : dashboardStats.allTime.totalOrders}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng doanh thu</div>
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {isLoadingDashboardStats
                    ? '...'
                    : formatCurrency(dashboardStats.allTime.totalRevenue, language, usdToVnd)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 text-blue-400" /> Hôm nay
                </div>
                <p className="text-white text-sm">Đơn: <span className="font-bold">{dashboardStats.today.totalOrders}</span></p>
                <p className="text-white text-sm">Tiền: <span className="font-bold text-green-400">{formatCurrency(dashboardStats.today.totalRevenue, language, usdToVnd)}</span></p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 text-purple-400" /> Tháng này
                </div>
                <p className="text-white text-sm">Đơn: <span className="font-bold">{dashboardStats.thisMonth.totalOrders}</span></p>
                <p className="text-white text-sm">Tiền: <span className="font-bold text-green-400">{formatCurrency(dashboardStats.thisMonth.totalRevenue, language, usdToVnd)}</span></p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 text-amber-400" /> Năm nay
                </div>
                <p className="text-white text-sm">Đơn: <span className="font-bold">{dashboardStats.thisYear.totalOrders}</span></p>
                <p className="text-white text-sm">Tiền: <span className="font-bold text-green-400">{formatCurrency(dashboardStats.thisYear.totalRevenue, language, usdToVnd)}</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-medium text-white">Biểu đồ doanh thu 14 ngày gần nhất</h3>
              </div>

              {dashboardStats.chart.length === 0 ? (
                <p className="text-sm text-white/50">Chưa có dữ liệu biểu đồ.</p>
              ) : (
                <div className="space-y-4">
                  <div className="h-56 w-full bg-black/20 rounded-lg p-3 border border-white/10">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      <polyline
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="2"
                        points={chartPoints}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                    {dashboardStats.chart.map((item) => (
                      <div key={item.date} className="text-xs bg-black/20 border border-white/10 rounded-md p-2">
                        <p className="text-white/60">{item.date.slice(5)}</p>
                        <p className="text-white">{item.totalOrders} đơn</p>
                        <p className="text-green-400">{formatCurrency(item.totalRevenue, language, usdToVnd)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Trạng thái hệ thống</h3>
              <div className="flex items-center gap-3">
                <div
                  className={
                    `w-3 h-3 rounded-full ` +
                    (isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500')
                  }
                />
                <span className="text-white/80">
                  {isLoading ? 'Đang đồng bộ dữ liệu...' : 'Hệ thống sẵn sàng'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && <SellersTab onCreateSeller={createSeller} />}

        {activeTab === 'categories' && (
          <CategoriesTab
            onCreateCategory={createCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            onCreateProduct={createProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        )}

        {activeTab === 'inventory' && <InventoryTab onAddInventory={addInventory} />}

        {activeTab === 'orders' && <OrdersHistoryTab />}

        {activeTab === 'reset-requests' && <ResetRequestsTab />}

        {activeTab === 'hacks-status' && <HacksTab />}

        {activeTab === 'seller-prices' && <SellerPricesTab />}

        {activeTab === 'banks' && (
          <BankAccountsTab
            onCreateBankAccount={handleCreateBankAccount}
            onUpdateBankAccount={handleUpdateBankAccount}
            onDeleteBankAccount={handleDeleteBankAccount}
          />
        )}

        {activeTab === 'exchange-rate' && (
          <ExchangeRateTab onUpdateExchangeRate={handleUpdateExchangeRate} />
        )}
      </div>
    </div>
  );
}
