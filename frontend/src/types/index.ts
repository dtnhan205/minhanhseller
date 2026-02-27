export type UserRole = 'admin' | 'seller';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  wallet?: number;
  totalTopup?: number; // Tổng nạp tiền (USD)
  isLocked?: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  order?: number;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: Category | string;
  remainingQuantity: number;
  soldQuantity: number;
  createdAt: string;
}

export interface InventoryItem {
  key: string;
  sold: boolean;
  soldTo?: string;
  soldAt?: string;
}

export interface Order {
  _id: string;
  product: Product | string;
  productName: string;
  key: string;
  price: number;
  seller: string;
  createdAt: string;
}

export interface TopupTransaction {
  _id: string;
  seller: string;
  amount: number; // VND (backward compatibility)
  amountUSD?: number; // USD
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TopupRequest {
  amountUSD: number; // Amount in USD
}

export interface PurchaseRequest {
  productId: string;
}

export interface PurchaseResponse {
  order: Order;
  newBalance: number;
}

export interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  apiUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  sellerId: string;
  amount: number; // VNĐ (backward compatibility)
  amountUSD?: number;
  amountVND?: number;
  transferContent: string;
  bankAccountId: BankAccount | string | null;
  status: 'pending' | 'completed' | 'expired';
  completedAt?: string;
  expiresAt: string;
  note?: string; // Ghi chú cho manual topup
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  usdToVnd: number;
}

export interface SellerProductPrice {
  _id: string;
  seller: User | string;
  product: Product | string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  today: { totalOrders: number; totalRevenue: number };
  thisMonth: { totalOrders: number; totalRevenue: number };
  thisYear: { totalOrders: number; totalRevenue: number };
  allTime: { totalOrders: number; totalRevenue: number };
  chart: Array<{ date: string; totalOrders: number; totalRevenue: number }>;
}

export type HackStatusType = 'updating' | 'safe';

export interface Hack {
  _id: string;
  name: string;
  image?: string;
  status: HackStatusType;
  downloadUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResetRequest {
  _id: string;
  orderId: string | Order;
  sellerId: string | User;
  categoryName: string;
  productName: string;
  key: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: string;
  processedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

