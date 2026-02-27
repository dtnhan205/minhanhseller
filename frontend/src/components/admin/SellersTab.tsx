import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSellers } from '@/hooks/useAdminData';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import { UserPlus, Mail, Search, X, Calendar, Plus, History, DollarSign, Trash2, Lock, Unlock } from 'lucide-react';
import type { User, Payment } from '@/types';
import { formatCurrency } from '@/utils/format';

import { useExchangeRate } from '@/hooks/useExchangeRate';

interface SellersTabProps {
  onCreateSeller: (data: { email: string; password: string }) => Promise<boolean>;
}

export default function SellersTab({ onCreateSeller }: SellersTabProps) {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const { sellers, isLoading: isLoadingSellers, loadSellers } = useSellers();
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

  const [sellerToDelete, setSellerToDelete] = useState<User | null>(null);
  const [isDeletingSeller, setIsDeletingSeller] = useState(false);
  const [isLockingSeller, setIsLockingSeller] = useState<string | null>(null);

  const handleLockUnlockSeller = async (seller: User) => {
    setIsLockingSeller(seller._id);
    try {
      if (seller.isLocked) {
        await adminApi.unlockSeller(seller._id);
        showSuccess(`Unlocked seller ${seller.email}`);
      } else {
        await adminApi.lockSeller(seller._id);
        showSuccess(`Locked seller ${seller.email}`);
      }
      await loadSellers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update seller status');
    } finally {
      setIsLockingSeller(null);
    }
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    setIsDeletingSeller(true);
    try {
      await adminApi.deleteSeller(sellerToDelete._id);
      showSuccess(`Successfully deleted seller ${sellerToDelete.email}`);
      setSellerToDelete(null);
      await loadSellers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete seller');
    } finally {
      setIsDeletingSeller(false);
    }
  };

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
      showSuccess(`Successfully topped up ${formatCurrency(amount, language, usdToVnd)} to ${selectedSeller.email}`);
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
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
              className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-lg"
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
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
            <div data-lenis-prevent className="space-y-3 max-h-[600px] overflow-y-auto overscroll-contain">
              {filteredSellers.map((seller: User, index: number) => (
                <div
                  key={seller._id}
                  className="group p-4 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLockUnlockSeller(seller)}
                      disabled={isLockingSeller === seller._id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        seller.isLocked
                          ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={seller.isLocked ? 'Unlock seller' : 'Lock seller'}
                    >
                      {seller.isLocked ? (
                        <>
                          <Unlock className="w-4 h-4 inline mr-2" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 inline mr-2" />
                          Lock
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSellerToDelete(seller)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors border bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-300"
                      title="Delete seller"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Delete
                    </button>
                          <p className="text-white font-medium">{seller.email}</p>
                          {seller.isLocked && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{seller.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800/40 rounded-lg p-2 border border-blue-500/20">
                      <p className="text-xs text-gray-400 mb-1">{t('admin.balance')}</p>
                      <p className="text-blue-400 font-bold">{formatCurrency(seller.wallet || 0, language, usdToVnd)}</p>
                    </div>
                    <div className="bg-gray-800/40 rounded-lg p-2 border border-green-500/20">
                      <p className="text-xs text-gray-400 mb-1">{t('admin.totalTopup')}</p>
                      <p className="text-green-400 font-bold">{formatCurrency(seller.totalTopup || 0, language, usdToVnd)}</p>
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
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
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
                  {t('admin.currentBalance')}: <span className="text-cyan-400 font-bold">{formatCurrency(selectedSeller.wallet || 0, language, usdToVnd)}</span>
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
                <div className="bg-gray-800/40 border border-green-500/30 rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    {t('admin.newBalance')}: <span className="text-green-400 font-bold">
                      {formatCurrency((selectedSeller.wallet || 0) + parseFloat(topupForm.amountUSD), language, usdToVnd)}
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
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
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
                          +{formatCurrency(payment.amountUSD || 0, language, usdToVnd)}
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

      {/* Delete Confirmation Modal */}
      {sellerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-gray-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-center text-white mb-2">Confirm Delete</h3>
              <p className="text-gray-400 text-center mb-6">
                Are you sure you want to delete seller <span className="text-white font-semibold">{sellerToDelete.email}</span>? 
                This action cannot be undone and all associated data will be lost.
              </p>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setSellerToDelete(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  disabled={isDeletingSeller}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteSeller}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
                  isLoading={isDeletingSeller}
                >
                  Delete Seller
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
