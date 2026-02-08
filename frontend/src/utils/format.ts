export const formatCurrency = (amount: number, isUSD: boolean = false): string => {
  if (isUSD) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  // Format VNĐ
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format price for products (USD with decimals)
export const formatPrice = (price: number | undefined | null): string => {
  // Handle invalid inputs
  if (price === null || price === undefined || isNaN(price)) {
    return '0';
  }
  // If price is a whole number, show without decimals, otherwise show up to 2 decimals
  const isWholeNumber = price % 1 === 0;
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (err) {
    // console.error('Error formatting price:', err, price);
    return String(price);
  }
};

// Format balance with comma as decimal separator (Vietnamese style)
export const formatBalance = (amount: number | undefined | null): string => {
  // Handle invalid inputs
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  // If amount is a whole number, show without decimals, otherwise show up to 2 decimals
  const isWholeNumber = amount % 1 === 0;
  try {
    // Use 'de-DE' locale which uses comma as decimal separator
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    // console.error('Error formatting balance:', err, amount);
    return String(amount).replace('.', ',');
  }
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
    // console.error('Error formatting date:', err, date);
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

