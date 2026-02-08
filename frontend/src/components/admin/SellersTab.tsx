import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSellers, useProducts } from '@/hooks/useAdminData';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import { UserPlus, Mail, Lock, Search, X, Calendar, Plus, History, DollarSign, Tag } from 'lucide-react';
import type { User, Payment, Product, SellerProductPrice } from '@/types';
import { formatCurrency } from '@/utils/format';

interface SellersTabProps {
  onCreateSeller: (data: { email: string; password: string }) => Promise<boolean>;
}

export default function SellersTab({ onCreateSeller }: SellersTabProps) {
  const { t } = useTranslation();
  const { sellers, isLoading: isLoadingSellers, loadSellers } = useSellers();
  const { products } = useProducts();
  const { success: showSuccess, error: showError } = useToastStore();
  const [sellerForm, setSellerForm] = useState({ email: '', password: '' });
  const [sellerSearch, setSellerSearch] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [topupForm, setTopupForm] = useState({ amountUSD: '', note: '' });
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [topupHistory, setTopupHistory] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [sellerPrices, setSellerPrices] = useState<SellerProductPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceForm, setPriceForm] = useState<{ productId: string; price: string }>({
    productId: '',
    price: '',
  });

  const filteredSellers = useMemo(() => {
    if (!sellerSearch) return sellers;
    return sellers.filter((seller) =>
      seller.email.toLowerCase().includes(sellerSearch.toLowerCase())
    );
  }, [sellers, sellerSearch]);

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCreateSeller(sellerForm);
    if (success) {
      setSellerForm({ email: '', password: '' });
    }
  };

  const handleOpenTopupModal = (seller: User) => {
    setSelectedSeller(seller);
    setTopupForm({ amountUSD: '', note: '' });
    setIsTopupModalOpen(true);
  };

  const handleCloseTopupModal = () => {
    setIsTopupModalOpen(false);
    setSelectedSeller(null);
    setTopupForm({ amountUSD: '', note: '' });
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;
    
    const trimmedAmount = topupForm.amountUSD.trim();
    if (!trimmedAmount) {
      showError('Please enter an amount');
      return;
    }
    
    const amount = parseFloat(trimmedAmount);
    if (isNaN(amount) || amount <= 0 || !isFinite(amount)) {
      showError('Please enter a valid amount');
      return;
    }
    
    // Prevent extremely large amounts (security check)
    if (amount > 1000000) {
      showError('Amount is too large. Maximum is $1,000,000');
      return;
    }

    setIsTopupLoading(true);
    try {
      await adminApi.manualTopupSeller(selectedSeller._id, {
        amountUSD: amount,
        note: topupForm.note || undefined,
      });
      showSuccess(`Successfully topped up ${formatCurrency(amount, true)} to ${selectedSeller.email}`);
      handleCloseTopupModal();
      await loadSellers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to topup seller');
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleOpenHistoryModal = async (seller: User) => {
    setSelectedSeller(seller);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const history = await adminApi.getSellerTopupHistory(seller._id);
      setTopupHistory(history);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to load topup history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedSeller(null);
    setTopupHistory([]);
  };

  const handleOpenPriceModal = async (seller: User) => {
    setSelectedSeller(seller);
    setPriceForm({ productId: '', price: '' });
    setIsPriceModalOpen(true);
    setIsLoadingPrices(true);
    try {
      const data = await adminApi.getSellerProductPrices(seller._id);
      setSellerPrices(data);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to load special prices');
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const handleClosePriceModal = () => {
    setIsPriceModalOpen(false);
    setSelectedSeller(null);
    setSellerPrices([]);
    setPriceForm({ productId: '', price: '' });
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;

    if (!priceForm.productId) {
      showError('Please select a product');
      return;
    }

    const trimmedPrice = priceForm.price.trim();
    if (!trimmedPrice) {
      showError('Please enter a price');
      return;
    }

    const price = parseFloat(trimmedPrice);
    if (isNaN(price) || price <= 0 || !isFinite(price)) {
      showError('Please enter a valid price');
      return;
    }

    if (price > 1000000) {
      showError('Price is too large. Maximum is $1,000,000');
      return;
    }

    try {
      await adminApi.setSellerProductPrice(selectedSeller._id, priceForm.productId, price);
      showSuccess('Special price saved!');
      const data = await adminApi.getSellerProductPrices(selectedSeller._id);
      setSellerPrices(data);
      setPriceForm({ productId: '', price: '' });
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save special price');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            {t('topup.statusPending')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            {t('topup.statusCompleted')}
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            {t('topup.statusExpired')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        <Card 
          title={t('admin.createSeller')} 
          className="h-fit"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <form onSubmit={handleCreateSeller} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('admin.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  type="email"
                  placeholder={t('admin.placeholderEmail')}
                  value={sellerForm.email}
                  onChange={(e) =>
                    setSellerForm({ ...sellerForm, email: e.target.value })
                  }
                  className="pl-12 bg-black/50 border-gray-800 focus:border-cyan-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t('admin.password')}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  type="password"
                  placeholder={t('admin.placeholderPassword')}
                  value={sellerForm.password}
                  onChange={(e) =>
                    setSellerForm({
                      ...sellerForm,
                      password: e.target.value,
                    })
                  }
                  className="pl-12 bg-black/50 border-gray-800 focus:border-cyan-500"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              {t('admin.createSeller')}
            </Button>
          </form>
        </Card>

        <Card 
          title={t('admin.sellersList')} 
          className="h-fit"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('common.search') + ' sellers..."'}
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="pl-12 bg-black/50 border-gray-800"
              />
              {sellerSearch && (
                <button
                  onClick={() => setSellerSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isLoadingSellers ? (
            <SkeletonLoader />
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-900/50 rounded-full flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400">
                {sellerSearch ? t('admin.noSearchResults') : t('admin.noSellers')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredSellers.map((seller: User, index: number) => (
                <div
                  key={seller._id}
                  className="group p-4 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900/50 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{seller.email}</p>
                        <p className="text-gray-400 text-xs mt-1">{seller.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                      <p className="text-xs text-gray-400 mb-1">{t('admin.balance')}</p>
                      <p className="text-blue-400 font-bold">{formatCurrency(seller.wallet || 0, true)}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                      <p className="text-xs text-gray-400 mb-1">{t('admin.totalTopup')}</p>
                      <p className="text-green-400 font-bold">{formatCurrency(seller.totalTopup || 0, true)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenTopupModal(seller)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('admin.topup')}
                    </button>
                    <button
                      onClick={() => handleOpenHistoryModal(seller)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <History className="w-4 h-4" />
                      {t('admin.history')}
                    </button>
                    <button
                      onClick={() => handleOpenPriceModal(seller)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-700/80 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                      Set price
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Topup Modal */}
      {isTopupModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card 
            className="w-full max-w-md animate-fade-in"
            style={{
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('admin.topupSeller')}</h2>
              <button
                onClick={handleCloseTopupModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t('admin.seller')}: <span className="text-white font-medium">{selectedSeller.email}</span>
                </p>
                <p className="text-sm text-gray-400">
                  {t('admin.currentBalance')}: <span className="text-cyan-400 font-bold">{formatCurrency(selectedSeller.wallet || 0, true)}</span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {t('admin.amountUSD')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={topupForm.amountUSD}
                    onChange={(e) => setTopupForm({ ...topupForm, amountUSD: e.target.value })}
                    className="pl-12 bg-black/50 border-gray-800 focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {t('admin.note')} <span className="text-gray-500 text-xs">({t('admin.optional')})</span>
                </label>
                <Input
                  type="text"
                  placeholder={t('admin.notePlaceholder')}
                  value={topupForm.note}
                  onChange={(e) => setTopupForm({ ...topupForm, note: e.target.value })}
                  className="bg-black/50 border-gray-800 focus:border-cyan-500"
                />
              </div>
              {topupForm.amountUSD && parseFloat(topupForm.amountUSD) > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    {t('admin.newBalance')}: <span className="text-green-400 font-bold">
                      {formatCurrency((selectedSeller.wallet || 0) + parseFloat(topupForm.amountUSD), true)}
                    </span>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleCloseTopupModal}
                  className="flex-1 bg-gray-800 hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                  isLoading={isTopupLoading}
                >
                  {!isTopupLoading && <Plus className="w-4 h-4 inline mr-2" />}
                  {t('admin.topup')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card 
            className="w-full max-w-2xl max-h-[80vh] animate-fade-in"
            style={{
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('admin.topupHistory')} - {selectedSeller.email}</h2>
              <button
                onClick={handleCloseHistoryModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {isLoadingHistory ? (
                <SkeletonLoader />
              ) : topupHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">{t('admin.noTopupHistory')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topupHistory.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(payment.status)}
                          {payment.note && (
                            <span className="text-xs text-gray-500">({payment.note})</span>
                          )}
                        </div>
                        <span className="text-green-400 font-bold">
                          +{formatCurrency(payment.amountUSD || 0, true)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>{t('admin.date')}: {new Date(payment.createdAt).toLocaleString()}</p>
                        {payment.completedAt && (
                          <p>{t('admin.completedAt')}: {new Date(payment.completedAt).toLocaleString()}</p>
                        )}
                        {payment.transferContent && (
                          <p className="font-mono">{payment.transferContent}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Seller Product Prices Modal */}
      {isPriceModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            className="w-full max-w-2xl max-h-[80vh] animate-fade-in"
            style={{
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Special prices - {selectedSeller.email}
              </h2>
              <button
                onClick={handleClosePriceModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Product
                </label>
                <select
                  value={priceForm.productId}
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, productId: e.target.value })
                  }
                  className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p: Product) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Special price (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={priceForm.price}
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, price: e.target.value })
                  }
                  className="bg-black/50 border-gray-800 focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleClosePriceModal}
                  className="flex-1 bg-gray-800 hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                >
                  <Tag className="w-4 h-4 inline mr-2" />
                  Save price
                </Button>
              </div>
            </form>

            <div className="overflow-y-auto max-h-[40vh]">
              {isLoadingPrices ? (
                <SkeletonLoader />
              ) : sellerPrices.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No special prices for this seller yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerPrices.map((sp) => {
                    const product =
                      typeof sp.product === 'object' && sp.product
                        ? (sp.product as Product)
                        : products.find((p) => p._id === sp.product);
                    return (
                      <div
                        key={sp._id}
                        className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            {product ? product.name : 'Unknown product'}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Created:{' '}
                            {new Date(sp.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 font-bold">
                            ${formatCurrency(sp.price, true)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
