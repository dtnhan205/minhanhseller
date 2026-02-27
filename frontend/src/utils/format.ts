const DEFAULT_USD_TO_VND = 25000;

const languageToCurrency: Record<string, { locale: string; currency: string }> = {
  en: { locale: 'en-US', currency: 'USD' },
  vi: { locale: 'vi-VN', currency: 'VND' },
};

export const formatCurrency = (
  amountUSD: number,
  language: string = 'vi',
  usdToVnd: number = DEFAULT_USD_TO_VND,
  currencyOverride?: 'USD' | 'VND'
): string => {
  if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
    const fallbackCurrency = currencyOverride ?? languageToCurrency[language]?.currency ?? 'USD';
    return fallbackCurrency === 'VND' ? '0 ₫' : '$0.00';
  }

  const currency = currencyOverride ?? languageToCurrency[language]?.currency ?? 'USD';

  if (currency === 'USD') {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amountUSD);
    } catch {
      return `$${amountUSD.toFixed(2)}`;
    }
  }

  // VND
  try {
    const amountVND = Math.round(amountUSD * usdToVnd);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountVND);
  } catch {
    return `${Math.round(amountUSD * usdToVnd).toLocaleString('vi-VN')} ₫`;
  }
};

export const formatVND = (amountVND: number): string => {
  if (amountVND === null || amountVND === undefined || isNaN(amountVND)) {
    return '0 ₫';
  }
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountVND);
  } catch {
    return `${Math.round(amountVND).toLocaleString('vi-VN')} ₫`;
  }
};

// Giá sản phẩm đang lưu theo USD -> hiển thị theo ngôn ngữ
export const formatPrice = (priceUSD: number | undefined | null, language: string = 'vi', usdToVnd: number = 25000): string => {
  return formatCurrency(priceUSD ?? 0, language, usdToVnd);
};

// Số dư ví đang lưu theo USD -> hiển thị theo ngôn ngữ
export const formatBalance = (amountUSD: number | undefined | null, language: string = 'vi', usdToVnd: number = 25000): string => {
  return formatCurrency(amountUSD ?? 0, language, usdToVnd);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatDateShort = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (err) {
    return 'N/A';
  }
};

export const truncateKey = (key: string | null | undefined, length: number = 20): string => {
  if (!key) return 'N/A';
  if (typeof key !== 'string') return String(key || 'N/A');
  if (key.length <= length) return key;
  return `${key.substring(0, length)}...`;
};

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
}
