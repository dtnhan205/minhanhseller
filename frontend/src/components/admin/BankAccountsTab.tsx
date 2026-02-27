import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { adminApi } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import { Plus, Building2, Edit, Trash2 } from 'lucide-react';
import type { BankAccount } from '@/types';
import { useToastStore } from '@/store/toastStore';

interface BankAccountsTabProps {
  onCreateBankAccount: (data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    apiUrl?: string;
  }) => Promise<BankAccount>;
  onUpdateBankAccount: (id: string, data: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    apiUrl?: string;
    isActive?: boolean;
  }) => Promise<BankAccount>;
  onDeleteBankAccount: (id: string) => Promise<void>;
}

export default function BankAccountsTab({
  onCreateBankAccount,
  onUpdateBankAccount,
  onDeleteBankAccount,
}: BankAccountsTabProps) {
  const { t } = useTranslation();
  const { error: showError } = useToastStore();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);
  const [bankAccountForm, setBankAccountForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    apiUrl: '',
    isActive: true,
  });
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    setIsLoadingBankAccounts(true);
    try {
      const accounts = await adminApi.getBankAccounts();
      setBankAccounts(accounts);
    } catch (err) {
      showError('Failed to load bank accounts');
    } finally {
      setIsLoadingBankAccounts(false);
    }
  };

  const handleCreateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateBankAccount({
        bankName: bankAccountForm.bankName,
        accountNumber: bankAccountForm.accountNumber,
        accountHolder: bankAccountForm.accountHolder,
        apiUrl: bankAccountForm.apiUrl || undefined,
      });
      setBankAccountForm({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        apiUrl: '',
        isActive: true,
      });
      await loadBankAccounts();
    } catch (err) {
      // console.error('Failed to create bank account:', err);
    }
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setEditingBankAccount(account);
    setBankAccountForm({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      apiUrl: account.apiUrl || '',
      isActive: account.isActive,
    });
  };

  const handleUpdateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBankAccount) return;
    try {
      await onUpdateBankAccount(editingBankAccount._id, {
        bankName: bankAccountForm.bankName,
        accountNumber: bankAccountForm.accountNumber,
        accountHolder: bankAccountForm.accountHolder,
        apiUrl: bankAccountForm.apiUrl || undefined,
        isActive: bankAccountForm.isActive,
      });
      setBankAccountForm({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        apiUrl: '',
        isActive: true,
      });
      setEditingBankAccount(null);
      await loadBankAccounts();
    } catch (err) {
      // console.error('Failed to update bank account:', err);
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (window.confirm(t('admin.confirmDeleteBankAccount'))) {
      try {
        await onDeleteBankAccount(id);
        await loadBankAccounts();
      } catch (err) {
        // console.error('Failed to delete bank account:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBankAccount(null);
    setBankAccountForm({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      apiUrl: '',
      isActive: true,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card 
        title={editingBankAccount ? t('common.edit') : t('admin.createBankAccount')} 
        className="h-fit"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <form onSubmit={editingBankAccount ? handleUpdateBankAccount : handleCreateBankAccount} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.bankName')} <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={bankAccountForm.bankName}
              onChange={(e) => setBankAccountForm({ ...bankAccountForm, bankName: e.target.value })}
              placeholder={t('admin.bankName')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.accountNumber')} <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={bankAccountForm.accountNumber}
              onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountNumber: e.target.value })}
              placeholder={t('admin.accountNumber')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.accountHolder')} <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={bankAccountForm.accountHolder}
              onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountHolder: e.target.value })}
              placeholder={t('admin.accountHolder')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.apiUrl')} <span className="text-gray-500 text-xs ml-2">{t('admin.optional')}</span>
            </label>
            <Input
              type="url"
              value={bankAccountForm.apiUrl}
              onChange={(e) => setBankAccountForm({ ...bankAccountForm, apiUrl: e.target.value })}
              placeholder="https://api.example.com/transactions"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bankAccountForm.isActive}
                onChange={(e) => setBankAccountForm({ ...bankAccountForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">{t('admin.isActive')}</span>
            </label>
          </div>
          <div className="flex gap-3">
            {editingBankAccount && (
              <Button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              className={editingBankAccount ? "flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg" : "w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"}
            >
              {editingBankAccount ? (
                <>
                  <Edit className="w-5 h-5 inline mr-2" />
                  {t('common.save')}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t('admin.createBankAccount')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card 
        title={t('admin.bankAccountsList')} 
        className="h-fit"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {isLoadingBankAccounts ? (
          <SkeletonLoader />
        ) : bankAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{t('admin.noBankAccounts')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account._id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{account.bankName}</h3>
                      {account.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                          {t('admin.active')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t('admin.inactive')}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>
                        <span className="text-gray-500">{t('admin.accountNumber')}:</span>{' '}
                        <span className="text-white font-mono">{account.accountNumber}</span>
                      </p>
                      <p>
                        <span className="text-gray-500">{t('admin.accountHolder')}:</span>{' '}
                        <span className="text-white">{account.accountHolder}</span>
                      </p>
                      {account.apiUrl && (
                        <p className="text-xs text-gray-500 truncate">
                          API: {account.apiUrl}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBankAccount(account)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteBankAccount(account._id)}
                      className="p-2 bg-gray-800 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

