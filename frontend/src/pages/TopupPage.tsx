import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi, authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Wallet, Plus, Copy, Check, Clock, XCircle, CreditCard, QrCode, AlertCircle } from 'lucide-react';
import { formatCurrency, formatBalance, formatVND } from '@/utils/format';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type { Payment, BankAccount } from '@/types';

export default function TopupPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success: showSuccess, error: showError } = useToastStore();
  
  // Single state for the input text
  const [inputValue, setInputValue] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { usdToVnd } = useExchangeRate();
  const pollingIntervalRef = useRef<number | null>(null);
  const { updateUser } = useAuthStore();

  const isVi = language === 'vi';

  const quickAmountsVND = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  const quickAmountsUSD = [10, 25, 50, 100, 200, 500, 1000];

  // Calculations based on exchange rate
  const calculateUSDFromVND = (vnd: number): number => vnd / usdToVnd;
  const calculateVNDFromUSD = (usd: number): number => Math.round(usd * usdToVnd);

  // Clear input when switching languages to avoid unit confusion
  useEffect(() => {
    setInputValue('');
  }, [language]);

  // Helper: Map bank name to VietQR bank code
  const getBankCode = (bankName: string): string => {
    const bankMap: Record<string, string> = {
      'Vietcombank': 'vcb',
      'Vietinbank': 'ctg',
      'BIDV': 'bid',
      'Agribank': 'vba',
      'Techcombank': 'tcb',
      'MBBank': 'mbbank',
      'MB Bank': 'mbbank',
      'ACB': 'acb',
      'VPBank': 'vpb',
      'TPBank': 'tpb',
      'Sacombank': 'stb',
      'HDBank': 'hdb',
      'DongA Bank': 'dab',
      'Eximbank': 'eib',
      'SHB': 'shb',
      'OCB': 'ocb',
      'SeABank': 'ssb',
      'VIB': 'vib',
      'VietABank': 'vab',
      'ABBank': 'abb',
      'Nam A Bank': 'nab',
      'PGBank': 'pgb',
      'PublicBank': 'pbv',
      'Bac A Bank': 'bab',
      'SCB': 'scb',
      'VietBank': 'vccb',
      'Kienlongbank': 'klb',
      'GPBank': 'gpb',
      'BaoVietBank': 'bvb',
      'VietCapitalBank': 'vcb',
    };

    for (const [name, code] of Object.entries(bankMap)) {
      if (bankName.toLowerCase().includes(name.toLowerCase())) {
        return code;
      }
    }
    return 'vcb';
  };

  useEffect(() => {
    loadPendingPayments();
  }, []);

  useEffect(() => {
    if (currentPayment && typeof currentPayment.bankAccountId === 'object' && currentPayment.bankAccountId) {
      const bankAccount = currentPayment.bankAccountId as BankAccount;
      const bankCode = getBankCode(bankAccount.bankName);
      const accountNumber = bankAccount.accountNumber;
      const content = currentPayment.transferContent;
      const accountName = bankAccount.accountHolder;

      const amountVNDValue = currentPayment.amountVND || currentPayment.amount;
      const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amountVNDValue}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
      setQrCodeUrl(qrUrl);
    } else {
      setQrCodeUrl('');
    }
  }, [currentPayment]);

  useEffect(() => {
    if (currentPayment && currentPayment.status === 'pending') {
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const updatedPayment = await sellerApi.getPaymentDetail(currentPayment._id);
          
          if (updatedPayment.status === 'completed' && currentPayment.status === 'pending') {
            if (pollingIntervalRef.current) {
              window.clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            
            setCurrentPayment(updatedPayment);
            
            try {
              const updatedUser = await authApi.me();
              updateUser(updatedUser);
            } catch (err) {}
            
            await loadPendingPayments();
            showSuccess(t('topup.paymentCompleted') || `Success! Balance updated.`);
            
            setTimeout(() => {
              navigate('/app/generate');
            }, 1500);
          } else if (updatedPayment.status !== currentPayment.status) {
            setCurrentPayment(updatedPayment);
            await loadPendingPayments();
          }
        } catch (err) {}
      }, 5000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [currentPayment, updateUser, showSuccess, t, navigate]);

  const loadPendingPayments = async () => {
    try {
      const payments = await sellerApi.getPayments();
      const pending = payments.filter((p: Payment) => p.status === 'pending');
      setPendingPayments(pending);
    } catch (err) {}
  };

  const handleOpenPayment = async (payment: Payment) => {
    try {
      const fullPayment = await sellerApi.getPaymentDetail(payment._id);
      setCurrentPayment(fullPayment);
      
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-information');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setCurrentPayment(payment);
    }
  };

  const handleTopup = async () => {
    const trimmedAmount = inputValue.trim();
    if (!trimmedAmount) {
      showError(isVi ? 'Vui lòng nhập số tiền' : 'Please enter an amount');
      return;
    }
    
    let numUSD = 0;
    if (isVi) {
      const numVND = parseInt(trimmedAmount, 10);
      if (isNaN(numVND) || numVND <= 0) {
        showError('Vui lòng nhập số tiền hợp lệ');
        return;
      }
      numUSD = calculateUSDFromVND(numVND);
    } else {
      const parsedUSD = parseFloat(trimmedAmount);
      if (isNaN(parsedUSD) || parsedUSD <= 0) {
        showError('Please enter a valid amount');
        return;
      }
      numUSD = parsedUSD;
    }

    setIsLoading(true);
    try {
      const payment = await sellerApi.topup({ amountUSD: numUSD });
      setCurrentPayment(payment);
      showSuccess(t('topup.paymentCreated'));
      setInputValue('');
      await loadPendingPayments();
      
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-information');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || (isVi ? 'Nạp tiền thất bại' : 'Topup failed');
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess(t('topup.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError('Failed to copy');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            {t('topup.statusPending')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <Check className="w-3 h-3" />
            {t('topup.statusCompleted')}
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            {t('topup.statusExpired')}
          </span>
        );
      default:
        return null;
    }
  };

  const amountNumeric = isVi ? parseInt(inputValue, 10) : parseFloat(inputValue);
  const isValidAmount = !isNaN(amountNumeric) && amountNumeric > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
          <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('topup.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {t('topup.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <Card 
            className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30"
            style={{
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{t('topup.currentBalance')}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {formatBalance(user?.wallet || 0, language, usdToVnd)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card 
            title={t('topup.addFunds')}
            style={{
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
            }}
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{t('topup.exchangeRate')}</span>
                  <span className="text-blue-400 font-bold">
                    1 USD = {formatVND(usdToVnd)}
                  </span>
                </div>
              </div>

              {/* Amount Input - Locale based */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isVi ? 'Số tiền nạp (VNĐ) - Ví dụ: 10000' : 'Topup Amount (USD) - Example: 10.5'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold">
                    {isVi ? '₫' : '$'}
                  </span>
                  <Input
                    type="number"
                    placeholder={isVi ? "Ví dụ: 10000" : "Example: 10.5"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    min={isVi ? "1000" : "1"}
                    step={isVi ? "1000" : "0.1"}
                    className="pl-10 h-14 sm:h-16 bg-black/50 border-gray-800 focus:border-cyan-500 text-lg sm:text-xl rounded-xl"
                  />
                </div>
                {isValidAmount && (
                  <div className="mt-2 text-sm text-gray-400 flex justify-between">
                    {isVi ? (
                      <>
                        <span>Số dư sẽ cộng: <span className="text-blue-400 font-semibold">{formatCurrency(calculateUSDFromVND(amountNumeric), language, usdToVnd)}</span></span>
                        <span className="text-green-400 font-semibold">{formatVND(amountNumeric)}</span>
                      </>
                    ) : (
                      <>
                        <span>Amount to pay: <span className="text-green-400 font-semibold">{formatVND(calculateVNDFromUSD(amountNumeric))}</span></span>
                        <span className="text-blue-400 font-semibold">{formatCurrency(amountNumeric, language, usdToVnd)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Amount Buttons - Locale based */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                  {t('topup.quickAmount')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {isVi ? (
                    quickAmountsVND.map((vndAmount) => (
                      <button
                        key={vndAmount}
                        type="button"
                        onClick={() => setInputValue(vndAmount.toString())}
                        className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                          inputValue === vndAmount.toString()
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                            : 'bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-cyan-500/50'
                        }`}
                      >
                        {formatVND(vndAmount)}
                      </button>
                    ))
                  ) : (
                    quickAmountsUSD.map((usdAmount) => (
                      <button
                        key={usdAmount}
                        type="button"
                        onClick={() => setInputValue(usdAmount.toString())}
                        className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                          inputValue === usdAmount.toString()
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                            : 'bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-cyan-500/50'
                        }`}
                      >
                        ${usdAmount}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <Button
                onClick={handleTopup}
                className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg rounded-xl"
                isLoading={isLoading}
                disabled={!inputValue || (isVi ? parseInt(inputValue, 10) < 1000 : parseFloat(inputValue) <= 0)}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                {isLoading ? t('topup.processing') : t('topup.topupWallet')}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {currentPayment && (
        <Card 
          id="payment-information" 
          className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border-purple-500/30 animate-fade-in overflow-hidden"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                {t('topup.paymentCreated')}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{t('topup.transferNote')}</p>
            </div>
          </div>
          
          {typeof currentPayment.bankAccountId === 'object' && currentPayment.bankAccountId && (
            <div className="space-y-6">
              {qrCodeUrl && (
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <QrCode className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-gray-200">{t('topup.scanQR')}</h3>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
                    <div className="flex-shrink-0 w-full lg:w-auto">
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl w-full max-w-md mx-auto lg:mx-0">
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <img 
                            src={qrCodeUrl} 
                            alt="QR Code" 
                            className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-lg"
                          />
                        </div>
                        <div className="h-px bg-gray-200 mb-4" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm font-medium">{(currentPayment.bankAccountId as BankAccount).accountHolder}</span>
                          <span className="text-gray-600 text-sm font-medium font-mono">{(currentPayment.bankAccountId as BankAccount).accountNumber}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-600 text-sm font-medium">Số tiền: </span>
                          <span className="text-gray-900 font-bold">{formatVND(currentPayment.amountVND || currentPayment.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 w-full max-w-md lg:max-w-none space-y-3 sm:space-y-4">
                      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 space-y-4 border border-gray-700/50 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{t('topup.accountHolder') || 'Chủ tài khoản'}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{(currentPayment.bankAccountId as BankAccount).accountHolder}</span>
                            <button
                              onClick={() => copyToClipboard((currentPayment.bankAccountId as BankAccount).accountHolder)}
                              className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-purple-400" />}
                            </button>
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{t('topup.accountNumber') || 'Số tài khoản'}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold font-mono">{(currentPayment.bankAccountId as BankAccount).accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard((currentPayment.bankAccountId as BankAccount).accountNumber)}
                              className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-purple-400" />}
                            </button>
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{isVi ? 'Số tiền thanh toán:' : 'Amount to pay:'}</span>
                          <span className="text-green-400 font-bold text-lg">{formatVND(currentPayment.amountVND || currentPayment.amount)}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-5 border border-purple-500/30 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-purple-400" />
                          <h4 className="text-sm font-semibold text-gray-200">{t('topup.transferContent')}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-black/40 rounded-lg p-3 border border-purple-500/30">
                            <p className="font-mono text-lg font-bold text-purple-400 text-center tracking-wider">
                              {currentPayment.transferContent}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(currentPayment.transferContent)}
                            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all shadow-lg flex items-center justify-center"
                          >
                            {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">
                          {t('topup.transferNote')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{t('topup.status')}</p>
                      {getStatusBadge(currentPayment.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                      <Clock className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{t('topup.expiresAt')}</p>
                      <p className="text-white font-semibold text-base">
                        {new Date(currentPayment.expiresAt).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {pendingPayments.length > 0 && (
        <Card className="animate-fade-in bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-200">{t('topup.pendingPayment')}</h2>
          </div>
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment._id}
                onClick={() => handleOpenPayment(payment)}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-5 hover:border-yellow-500/50 transition-all shadow-lg cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-xs text-gray-400 mb-1">{t('topup.transferContent')}</p>
                        <p className="font-mono text-lg font-bold text-purple-400">{payment.transferContent}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-sm">
                      <div>
                        <span className="text-gray-400">{isVi ? 'Số tiền: ' : 'Amount: '}</span>
                        <span className="text-green-400 font-semibold">
                          {formatVND(payment.amountVND || payment.amount)}
                        </span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div>
                        <span className="text-gray-400">{isVi ? 'Hết hạn: ' : 'Expires: '}</span>
                        <span className="text-red-400 font-semibold">
                          {new Date(payment.expiresAt).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(payment.transferContent);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-purple-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
