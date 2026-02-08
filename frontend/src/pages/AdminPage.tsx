import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';
import { useSellers, useCategories, useProducts } from '@/hooks/useAdminData';
import {
  UserPlus,
  Shield,
  Package,
  Folder,
  Key,
  Building2,
  DollarSign,
  Users,
  ShoppingBag,
  Layers,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import { adminApi } from '@/services/api';
import StatCard from '@/components/admin/StatCard';
import SellersTab from '@/components/admin/SellersTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import ProductsTab from '@/components/admin/ProductsTab';
import InventoryTab from '@/components/admin/InventoryTab';
import BankAccountsTab from '@/components/admin/BankAccountsTab';
import ExchangeRateTab from '@/components/admin/ExchangeRateTab';
import ResetRequestsTab from '@/components/admin/ResetRequestsTab';
import OrdersHistoryTab from '@/components/admin/OrdersHistoryTab';
import HacksTab from '@/components/admin/HacksTab';
import TopupTab from '@/components/admin/TopupTab';

type TabType =
  | 'sellers'
  | 'categories'
  | 'products'
  | 'inventory'
  | 'bank-accounts'
  | 'exchange-rate'
  | 'reset-requests'
  | 'orders-history'
  | 'hacks'
  | 'topup';

export default function AdminPage() {
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToastStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('sellers');

  // Kiểm tra token expiration và tự động logout
  useTokenExpiration();

  // Use custom hooks
  const { sellers, createSeller } = useSellers();
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    addInventory,
  } = useProducts();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSellers = sellers.length;
    const totalCategories = categories.length;
    const totalProducts = products.length;
    const totalSold = products.reduce(
      (sum, p) => sum + (p.soldQuantity || 0),
      0
    );

    return {
      totalSellers,
      totalCategories,
      totalProducts,
      totalSold,
    };
  }, [sellers, categories, products]);

  // Handlers
  const handleCreateSeller = async (data: { email: string; password: string }) => {
    return await createSeller(data);
  };

  const handleCreateCategory = async (name: string, image?: string, order?: number) => {
    return await createCategory(name, image, order);
  };

  const handleUpdateCategory = async (id: string, data: { name?: string; image?: string; order?: number }) => {
    return await updateCategory(id, data);
  };

  const handleDeleteCategory = async (id: string) => {
    return await deleteCategory(id);
  };

  const handleCreateProduct = async (data: { name: string; categoryId: string; price: number }) => {
    return await createProduct(data);
  };

  const handleUpdateProduct = async (id: string, data: { name?: string; categoryId?: string; price?: number }) => {
    return await updateProduct(id, data);
  };

  const handleDeleteProduct = async (id: string) => {
    return await deleteProduct(id);
  };

  const handleAddInventory = async (productId: string, keys: string[]) => {
    return await addInventory(productId, keys);
  };

  const handleCreateBankAccount = async (data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    apiUrl?: string;
  }) => {
    try {
      const account = await adminApi.createBankAccount(data);
      showSuccess('Bank account created successfully!');
      return account;
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create bank account');
      throw err;
    }
  };

  const handleUpdateBankAccount = async (id: string, data: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    apiUrl?: string;
    isActive?: boolean;
  }) => {
    try {
      const account = await adminApi.updateBankAccount(id, data);
      showSuccess('Bank account updated successfully!');
      return account;
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update bank account');
      throw err;
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    try {
      await adminApi.deleteBankAccount(id);
      showSuccess('Bank account deleted successfully!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete bank account');
      throw err;
    }
  };

  const handleUpdateExchangeRate = async (rate: number) => {
    try {
      const updated = await adminApi.updateExchangeRate(rate);
      showSuccess('Exchange rate updated successfully!');
      return updated;
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update exchange rate');
      throw err;
    }
  };

  const tabs = [
    { id: 'sellers' as TabType, labelKey: 'admin.sellers', icon: UserPlus },
    { id: 'categories' as TabType, labelKey: 'admin.categories', icon: Folder },
    { id: 'products' as TabType, labelKey: 'admin.products', icon: Package },
    { id: 'inventory' as TabType, labelKey: 'admin.inventory', icon: Key },
    { id: 'bank-accounts' as TabType, labelKey: 'admin.bankAccounts', icon: Building2 },
    { id: 'exchange-rate' as TabType, labelKey: 'admin.exchangeRate', icon: DollarSign },
    { id: 'topup' as TabType, labelKey: 'nav.topup', icon: Wallet },
    { id: 'reset-requests' as TabType, labelKey: 'admin.resetRequests', icon: RotateCcw },
    { id: 'orders-history' as TabType, labelKey: 'admin.ordersHistory', icon: ShoppingBag },
    { id: 'hacks' as TabType, labelKey: 'admin.hacks', icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Stats */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                {t('admin.dashboard')}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {t('admin.managePlatform')}
              </p>
            </div>
          </div>
          <div 
            className="droplet-container px-3 sm:px-4 py-2 w-full sm:w-auto justify-center sm:justify-start"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: `
                0 24px 72px -16px rgba(168, 85, 247, 0.4),
                0 16px 48px -12px rgba(168, 85, 247, 0.3),
                0 8px 24px -8px rgba(168, 85, 247, 0.2),
                inset 0 2px 0 0 rgba(255, 255, 255, 0.3),
                inset -3px -3px 8px 0 rgba(255, 255, 255, 0.15),
                inset 4px 4px 8px 0 rgba(0, 0, 0, 0.12),
                0 0 0 1px rgba(168, 85, 247, 0.25)
              `,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white font-medium truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Users}
            label={t('admin.totalSellers')}
            value={stats.totalSellers}
            color="purple"
          />
          <StatCard
            icon={Layers}
            label={t('admin.totalCategories')}
            value={stats.totalCategories}
            color="blue"
          />
          <StatCard
            icon={Package}
            label={t('admin.totalProducts')}
            value={stats.totalProducts}
            color="cyan"
          />
          <StatCard
            icon={ShoppingBag}
            label={t('admin.totalSold')}
            value={stats.totalSold}
            color="green"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-2 border-b border-gray-800 pb-2 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-950/50 text-gray-300 hover:bg-gray-900 border border-gray-800 hover:border-gray-700'
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
              <span className="hidden sm:inline">{t(tab.labelKey as any)}</span>
              <span className="sm:hidden">{t(tab.labelKey as any).split(' ')[0]}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'sellers' && (
          <SellersTab onCreateSeller={handleCreateSeller} />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab onAddInventory={handleAddInventory} />
        )}

        {activeTab === 'bank-accounts' && (
          <BankAccountsTab
            onCreateBankAccount={handleCreateBankAccount}
            onUpdateBankAccount={handleUpdateBankAccount}
            onDeleteBankAccount={handleDeleteBankAccount}
          />
        )}

        {activeTab === 'exchange-rate' && (
          <ExchangeRateTab onUpdateExchangeRate={handleUpdateExchangeRate} />
        )}

        {activeTab === 'reset-requests' && (
          <ResetRequestsTab />
        )}

        {activeTab === 'orders-history' && (
          <OrdersHistoryTab />
        )}

        {activeTab === 'hacks' && <HacksTab />}

        {activeTab === 'topup' && <TopupTab />}
      </div>
    </div>
  );
}
