import { useState, useEffect, useMemo, useRef } from 'react';
import { sellerApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product, Order } from '@/types';
import Button from '@/components/ui/Button';
import { Minus, Plus, Zap, Package, Search, X, Copy, Check, Wallet, TrendingUp, ShoppingCart } from 'lucide-react';
import { formatPrice, formatBalance } from '@/utils/format';
import { getDisplayProductName } from '@/utils/translateProductName';
import { useExchangeRate } from '@/hooks/useExchangeRate';

// Product Image Component
function ProductImage({ product }: { product: Product }) {
  const categoryImage =
    typeof product.category === 'object' ? product.category.image : null;

  if (categoryImage) {
    return (
      <img
        src={categoryImage}
        alt={product.name}
        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl object-cover border-2 border-slate-800 group-hover:border-cyan-500/50 transition-colors flex-shrink-0"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }
  return (
    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
      <Package className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
    </div>
  );
}

export default function GeneratePage() {
  const { user, updateUser } = useAuthStore();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [purchasedKeys, setPurchasedKeys] = useState<Order[]>([]);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await sellerApi.getProducts();
      if (!Array.isArray(data)) {
        showError('Invalid products data format');
        return;
      }
      setProducts(data);
      const availableProducts = data.filter((p) => (p.remainingQuantity || 0) > 0);
      if (availableProducts.length > 0 && !selectedProduct) {
        setSelectedProduct(availableProducts[0]._id);
      }
    } catch (err: any) {
      let errorMessage = 'Failed to load products';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Seller role required.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      showError(errorMessage);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof p.category === 'object' &&
          p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, { id: string; name: string; order: number; products: Product[] }> = {};
    
    filteredProducts.forEach((product) => {
      const category = typeof product.category === 'object' ? product.category : null;
      const categoryId = category?._id || 'other';
      const categoryName = category?.name || 'Other';
      
      // Use a very high default order for missing values to push them to the bottom
      const rawOrder = (category as any)?.order;
      const categoryOrder = (rawOrder !== undefined && rawOrder !== null && rawOrder !== '') 
        ? Number(rawOrder) 
        : 999999;
      
      if (!groups[categoryId]) {
        groups[categoryId] = { id: categoryId, name: categoryName, order: categoryOrder, products: [] };
      }

      groups[categoryId].products.push(product);
    });
    
    const result = Object.values(groups);
    result.forEach((g) => {
      g.products.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return result.sort((a, b) => {
      // Numerical sort: smallest to largest
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });
  }, [filteredProducts]);

  const handlePurchase = async () => {
    if (!selectedProduct) {
      showError('Please select a product');
      return;
    }
    if (!quantity || quantity < 1 || !Number.isInteger(quantity) || !isFinite(quantity)) {
      showError('Please enter a valid quantity');
      return;
    }
    if (quantity > 1000) {
      showError('Quantity is too large. Maximum is 1000');
      return;
    }
    const selectedProductData = products.find((p) => p._id === selectedProduct);
    if (!selectedProductData) {
      showError('Product not found');
      return;
    }
    if (quantity > (selectedProductData.remainingQuantity || 0)) {
      showError('Not enough stock available');
      return;
    }
    const totalPrice = quantity * selectedProductData.price;
    if (totalPrice > (user?.wallet || 0)) {
      showError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      const promises = [];
      for (let i = 0; i < quantity; i++) {
        promises.push(sellerApi.purchase({ productId: selectedProduct }));
      }
      const results = await Promise.all(promises);
      if (results.length > 0) {
        updateUser({ ...user!, wallet: results[results.length - 1].newBalance });
        const orders = results.map((r) => r.order);
        setPurchasedKeys(orders);
        setShowKeyModal(true);
      }
      setQuantity(1);
      await loadProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Purchase failed';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (key: string | undefined, index: number) => {
    if (!key) {
      showError('No key to copy');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(key);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = key;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
          document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedKeyIndex(index);
      showSuccess('Copied!');
      setTimeout(() => setCopiedKeyIndex(null), 2000);
    } catch (err) {
      showError('Failed to copy. Please try selecting and copying manually.');
    }
  };

  const copyAllKeys = async () => {
    try {
      const allKeys = purchasedKeys
        .map((order) => order.key)
        .filter((key) => key)
        .join('\n');
      if (!allKeys) {
        showError('No keys to copy');
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(allKeys);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = allKeys;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
          document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showSuccess('All keys copied!');
    } catch (err) {
      showError('Failed to copy. Please try selecting and copying manually.');
    }
  };

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const totalPrice = selectedProductData ? selectedProductData.price * quantity : 0;
  const totalProducts = products.length;
  const availableProducts = products.filter(p => (p.remainingQuantity || 0) > 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.remainingQuantity || 0)), 0);

  const [cursorParticles, setCursorParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const particleIdRef = useRef(0);
  const lastParticleTimeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastParticleTimeRef.current < 50) return;
      lastParticleTimeRef.current = now;
      const size = 3 + Math.random() * 4;
      const delay = Math.random() * 0.2;
      const newParticle = { id: particleIdRef.current++, x: e.clientX, y: e.clientY, size: size, delay: delay };
      setCursorParticles((prev) => [...prev, newParticle].slice(-20));
      setTimeout(() => {
        setCursorParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1200);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cardStyle = {
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
  };

  return (
    <div className="min-h-screen animate-fade-in pb-8 relative overflow-hidden">
      {/* Cursor Sparkles */}
      {cursorParticles.map((p) => (
        <div key={p.id} className="fixed pointer-events-none z-[9999]" style={{ left: `${p.x}px`, top: `${p.y}px`, transform: 'translate(-50%, -50%)', animation: `sparkleFade 1.2s ease-out ${p.delay}s forwards` }}>
          <div className="absolute" style={{ width: `${p.size}px`, height: `${p.size}px`, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(6, 182, 212, 0.25) 40%, transparent 70%)', borderRadius: '50%', boxShadow: `0 0 ${p.size * 1.5}px rgba(255, 255, 255, 0.3), 0 0 ${p.size * 2}px rgba(6, 182, 212, 0.2)` }} />
        </div>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="rounded-3xl p-5" style={cardStyle}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{t('generate.title')}</h1>
                <p className="text-cyan-400/70 text-xs font-medium uppercase tracking-wider">{t('generate.subtitle')}</p>
              </div>
        </div>
            
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="bg-slate-900/40 rounded-2xl p-3 border border-white/5">
                <p className="text-slate-400 text-xs font-medium mb-1">{t('generate.seller')}</p>
                <p className="text-white text-sm font-semibold truncate">{user?.email}</p>
      </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl p-4 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 text-xs font-bold uppercase">{t('generate.yourBalance')}</span>
                </div>
                <p className="text-2xl font-black text-white">{formatBalance(user?.wallet || 0, language, usdToVnd)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-5 space-y-4" style={cardStyle}>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Statistics</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{t('generate.totalProducts')}</span>
                </div>
                <span className="text-white font-bold">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 text-sm">{t('generate.available')}</span>
                </div>
                <span className="text-emerald-400 font-bold">{availableProducts}</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm">{t('generate.totalValue')}</span>
                </div>
                <p className="text-white font-bold text-right">{formatPrice(totalValue, language, usdToVnd)}</p>
              </div>
            </div>
        </div>
      </div>

        {/* Content */}
        <div className="col-span-1 lg:col-span-9 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Product List */}
            <div className="rounded-3xl p-4 sm:p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">{t('generate.selectProduct')}</h3>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder={t('generate.searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all w-40 sm:w-64"
                />
              </div>
            </div>

            {isLoadingProducts ? (
                <div className="py-20 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mx-auto"></div>
                </div>
            ) : (
                <div className="space-y-6 max-h-[470px] sm:max-h-[600px] overflow-y-auto custom-scrollbar pr-2" onWheelCapture={(e) => {
                  // Prevent the wheel from bubbling to the page when this list can scroll
                  const el = e.currentTarget;
                  const atTop = el.scrollTop <= 0;
                  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
                  const deltaY = e.deltaY;
                  if ((!atTop && deltaY < 0) || (!atBottom && deltaY > 0)) {
                    e.stopPropagation();
                  }
                }}>
                  {groupedProducts.map((group) => (
                    <div key={group.id} className="space-y-3">
                      <h4 className="text-xs font-black text-cyan-500/70 uppercase tracking-[0.2em] pl-1">{group.name}</h4>
                      <div className="space-y-2">
                        {group.products.map((product) => {
                        const isSelected = selectedProduct === product._id;
                        const isOutOfStock = (product.remainingQuantity || 0) === 0;
                        return (
                          <div
                            key={product._id}
                            onClick={() => !isOutOfStock && setSelectedProduct(product._id)}
                              className={`group p-3 rounded-2xl border transition-all duration-300 ${
                                isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed border-transparent bg-white/5' :
                                isSelected ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' :
                                'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer'
                              }`}
                          >
                              <div className="flex items-center gap-3">
                                <ProductImage product={product} />
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold text-sm sm:text-base truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                                    {getDisplayProductName(product.name, language)}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-cyan-400 font-black text-sm">{formatPrice(product.price, language, usdToVnd)}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isOutOfStock ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                      {isOutOfStock ? t('generate.outOfStock') : t('generate.inStock')}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && !isOutOfStock && <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>

            {/* Purchase Details */}
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-3xl p-6" style={cardStyle}>
                <h3 className="text-lg font-bold text-white mb-6">{t('generate.purchaseDetails')}</h3>
                
            {selectedProductData ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 flex items-center gap-4">
                    <ProductImage product={selectedProductData} />
                    <div className="flex-1 min-w-0">
                        <p className="text-cyan-400 text-xs font-bold uppercase mb-1">
                          {typeof selectedProductData.category === 'object' ? selectedProductData.category.name : 'N/A'}
                        </p>
                        <p className="text-white font-bold truncate">{getDisplayProductName(selectedProductData.name, language)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">{t('generate.quantity')}</span>
                        <span className="text-slate-500 text-xs italic">{t('generate.maxAvailable')}: {selectedProductData.remainingQuantity}</span>
                  </div>
                      <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors border border-white/5"
                    >
                          <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(selectedProductData.remainingQuantity, parseInt(e.target.value) || 1)))}
                          className="flex-1 h-12 bg-slate-900/60 border border-white/10 rounded-xl text-center text-white font-black text-xl focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(selectedProductData.remainingQuantity, quantity + 1))}
                          className="w-12 h-12 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center transition-colors border border-cyan-500/30"
                    >
                          <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                    <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 rounded-2xl border border-cyan-500/20 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">{t('generate.pricePerKey')}</span>
                        <span className="text-white font-bold">{formatPrice(selectedProductData.price, language, usdToVnd)}</span>
                  </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-white font-bold">{t('generate.total')}</span>
                        <span className="text-2xl font-black text-cyan-400">{formatPrice(totalPrice, language, usdToVnd)}</span>
                  </div>
                </div>

                    <Button
                      onClick={handlePurchase}
                      className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] border-none shadow-none"
                      isLoading={isLoading}
                      disabled={totalPrice > (user?.wallet || 0)}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {isLoading ? t('generate.processing') : t('generate.generateKeys')}
                    </Button>

                  {totalPrice > (user?.wallet || 0) && (
                      <p className="text-red-400 text-center text-xs font-bold uppercase tracking-wider bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      {t('generate.insufficientBalance')}
                    </p>
                  )}
                </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <Package className="w-8 h-8 text-slate-500" />
              </div>
                    <p className="text-slate-400 text-sm">{t('generate.selectProductToPurchase')}</p>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10 bg-slate-900/70" style={{ backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{t('generate.keysGenerated')}</h2>
                  <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-widest">
                    {purchasedKeys.length} {t('generate.key')}(s) {t('generate.purchased')}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-8">
              {purchasedKeys.map((order, index) => (
                <div key={order._id || index} className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 group relative">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {order.productName ? getDisplayProductName(order.productName, language) : 'Product'}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-cyan-400 font-bold break-all">{order.key}</p>
                    <button
                      onClick={() => copyToClipboard(order.key, index)}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all flex-shrink-0"
                    >
                      {copiedKeyIndex === index ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-auto">
              <Button onClick={copyAllKeys} className="flex-1 py-4 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                <Copy className="w-5 h-5 mr-2" />
                {t('generate.copyAllKeys')}
              </Button>
              <Button onClick={() => setShowKeyModal(false)} variant="secondary" className="flex-1 py-4 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 font-black uppercase tracking-widest">
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
