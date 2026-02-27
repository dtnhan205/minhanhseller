import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { adminApi } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { DollarSign } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

interface ExchangeRateTabProps {
  onUpdateExchangeRate: (rate: number) => Promise<{ usdToVnd: number }>;
}

export default function ExchangeRateTab({ onUpdateExchangeRate }: ExchangeRateTabProps) {
  const { t } = useTranslation();
  const { error: showError, success: showSuccess } = useToastStore();
  const [exchangeRate, setExchangeRate] = useState<number>(25000);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [exchangeRateInput, setExchangeRateInput] = useState('');

  useEffect(() => {
    const loadExchangeRate = async () => {
      setIsLoadingExchangeRate(true);
      try {
        const rate = await adminApi.getExchangeRate();
        setExchangeRate(rate.usdToVnd);
        setExchangeRateInput(rate.usdToVnd.toString());
      } catch (err) {
        // console.error('Failed to load exchange rate:', err);
      } finally {
        setIsLoadingExchangeRate(false);
      }
    };
    loadExchangeRate();
  }, []);

  const handleUpdateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = exchangeRateInput.trim();
    if (!trimmedInput) {
      showError('Please enter an exchange rate');
      return;
    }
    
    const rate = parseFloat(trimmedInput);
    if (isNaN(rate) || rate <= 0 || !isFinite(rate)) {
      showError('Please enter a valid exchange rate');
      return;
    }
    
    // Prevent extremely large rates (security check)
    if (rate > 100000) {
      showError('Exchange rate is too large. Maximum is 100,000');
      return;
    }

    setIsLoadingExchangeRate(true);
    try {
      const updated = await onUpdateExchangeRate(rate);
      setExchangeRate(updated.usdToVnd);
      showSuccess('Exchange rate updated successfully!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update exchange rate');
    } finally {
      setIsLoadingExchangeRate(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card 
        title={t('admin.exchangeRate')}
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <form onSubmit={handleUpdateExchangeRate} className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 text-sm">{t('admin.currentRate')}</span>
              <span className="text-blue-400 font-bold text-2xl">
                1 USD = {exchangeRate.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.newRate')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold">
                VNĐ
              </span>
              <Input
                type="number"
                placeholder="25000"
                value={exchangeRateInput}
                onChange={(e) => setExchangeRateInput(e.target.value)}
                min="1"
                step="1"
                className="pl-16 bg-black/50 border-gray-800 focus:border-cyan-500 text-lg"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('admin.rateDescription')}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"
            isLoading={isLoadingExchangeRate}
          >
            {!isLoadingExchangeRate && (
              <DollarSign className="w-5 h-5 inline mr-2" />
            )}
            {isLoadingExchangeRate ? t('admin.updating') : t('admin.updateRate')}
          </Button>
        </form>
      </Card>
    </div>
  );
}

