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

// Product Image Component
function ProductImage({ product }: { product: Product }) {
  const categoryImage =
    typeof product.category === 'object' ? product.category.image : null;

  if (categoryImage) {
    return (
      <img
        src={categoryImage}
        alt={product.name}
        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl object-cover border-2 border-gray-800 group-hover:border-cyan-500/50 transition-colors flex-shrink-0"
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
    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
      <Package className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
    </div>
  );
}

export default function GeneratePage() {
  const { user, updateUser } = useAuthStore();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t, language } = useTranslation();
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
      // console.log('GeneratePage: Loading products...');
      const data = await sellerApi.getProducts();
      // console.log('GeneratePage: Products received:', data);
      // console.log('GeneratePage: Products count:', data?.length || 0);
      
      if (!Array.isArray(data)) {
        // console.error('GeneratePage: Products is not an array:', data);
        showError('Invalid products data format');
        return;
      }
      
      if (data.length === 0) {
        // console.warn('GeneratePage: No products found in database');
        setProducts([]);
        return;
      }
      
      // Show all products, but filter available ones for selection
      setProducts(data);
      const availableProducts = data.filter((p) => (p.remainingQuantity || 0) > 0);
      // console.log('GeneratePage: Available products:', availableProducts.length);
      
      if (availableProducts.length > 0 && !selectedProduct) {
        setSelectedProduct(availableProducts[0]._id);
      } else if (availableProducts.length === 0 && data.length > 0) {
        // Don't show error, just show out of stock message in UI
        // console.warn('GeneratePage: All products are out of stock');
      }
    } catch (err: any) {
      // console.error('GeneratePage: Error loading products:', err);
      // console.error('GeneratePage: Error response:', err.response?.data);
      // console.error('GeneratePage: Error status:', err.response?.status);
      
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

  // Nhóm products theo category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, { order: number; products: Product[] }> = {};
    
    filteredProducts.forEach((product) => {
      const category = typeof product.category === 'object' ? product.category : null;
      const categoryName = category?.name || 'Other';
      const categoryOrder = category?.order ?? 999;
      
      if (!groups[categoryName]) {
        groups[categoryName] = { order: categoryOrder, products: [] };
      }
      groups[categoryName].products.push(product);
    });
    
    // Sắp xếp products trong mỗi category
    Object.keys(groups).forEach((key) => {
      groups[key].products.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    // Sắp xếp categories theo order, sau đó theo tên
    const sortedCategories = Object.entries(groups).sort((a, b) => {
      if (a[1].order !== b[1].order) {
        return a[1].order - b[1].order;
      }
      return a[0].localeCompare(b[0]);
    });
    
    // Chuyển đổi lại thành object với thứ tự đã sắp xếp
    const sortedGroups: Record<string, Product[]> = {};
    sortedCategories.forEach(([key, value]) => {
      sortedGroups[key] = value.products;
    });
    
    return sortedGroups;
  }, [filteredProducts]);

  const handlePurchase = async () => {
    if (!selectedProduct) {
      showError('Please select a product');
      return;
    }

    // Validate quantity
    if (!quantity || quantity < 1 || !Number.isInteger(quantity) || !isFinite(quantity)) {
      showError('Please enter a valid quantity');
      return;
    }

    // Prevent extremely large quantities (security check)
    if (quantity > 1000) {
      showError('Quantity is too large. Maximum is 1000');
      return;
    }

    // Check if product has enough stock
    const selectedProductData = products.find((p) => p._id === selectedProduct);
    if (!selectedProductData) {
      showError('Product not found');
      return;
    }

    if (quantity > (selectedProductData.remainingQuantity || 0)) {
      showError('Not enough stock available');
      return;
    }

    // Check if user has enough balance
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
        
        // Lưu danh sách keys đã mua
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
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(key);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = key;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          // console.error('Fallback copy failed:', err);
          throw err;
        }
        document.body.removeChild(textArea);
      }
      setCopiedKeyIndex(index);
      showSuccess('Copied!');
      setTimeout(() => setCopiedKeyIndex(null), 2000);
    } catch (err) {
      // console.error('Copy error:', err);
      showError('Failed to copy. Please try selecting and copying manually.');
    }
  };

  const copyAllKeys = async () => {
    try {
      const allKeys = purchasedKeys
        .map((order) => order.key)
        .filter((key) => key) // Filter out null/undefined keys
        .join('\n');
      
      if (!allKeys) {
        showError('No keys to copy');
        return;
      }

      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(allKeys);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = allKeys;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          // console.error('Fallback copy failed:', err);
          throw err;
        }
        document.body.removeChild(textArea);
      }
      showSuccess('All keys copied!');
    } catch (err) {
      // console.error('Copy all keys error:', err);
      showError('Failed to copy. Please try selecting and copying manually.');
    }
  };

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const totalPrice = selectedProductData ? selectedProductData.price * quantity : 0;

  const totalProducts = products.length;
  const availableProducts = products.filter(p => (p.remainingQuantity || 0) > 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.remainingQuantity || 0)), 0);

  // Sparkle particles cursor effect
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const particleIdRef = useRef(0);
  const lastParticleTimeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle: chỉ tạo particle mỗi 50ms
      if (now - lastParticleTimeRef.current < 50) return;
      lastParticleTimeRef.current = now;

      // Random size và delay cho đa dạng
      const size = 3 + Math.random() * 4; // 3-7px (nhỏ hơn, nhạt hơn)
      const delay = Math.random() * 0.2; // 0-0.2s delay

      const newParticle = {
        id: particleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        size: size,
        delay: delay,
      };
      setParticles((prev) => {
        // Giới hạn tối đa 20 particles
        const updated = [...prev, newParticle];
        return updated.slice(-20);
      });
      
      // Remove particle after animation completes
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen animate-fade-in pb-8 relative overflow-hidden">
      {/* Sparkle Particles Cursor Effect */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: 'translate(-50%, -50%)',
            animation: `sparkleFade 1.2s ease-out ${particle.delay}s forwards`,
          }}
        >
          {/* Main sparkle particle */}
          <div
            className="absolute"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(6, 182, 212, 0.25) 40%, transparent 70%)',
              borderRadius: '50%',
              boxShadow: `
                0 0 ${particle.size * 1.5}px rgba(255, 255, 255, 0.3),
                0 0 ${particle.size * 2}px rgba(6, 182, 212, 0.2),
                0 0 ${particle.size * 2.5}px rgba(6, 182, 212, 0.1)
              `,
            }}
          />
          {/* Outer glow ring */}
          <div
            className="absolute"
            style={{
              width: `${particle.size * 2.5}px`,
              height: `${particle.size * 2.5}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: `sparkleExpand 1.2s ease-out ${particle.delay}s forwards`,
            }}
          />
        </div>
      ))}
      {/* Main Layout - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0 overflow-x-hidden">
        {/* Left Sidebar - Stats Widgets */}
        <div className="hidden lg:block lg:col-span-2 space-y-4">
          {/* Header Widget */}
          <div 
            className="droplet-container p-4 sm:p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'saturate(120%)',
              WebkitBackdropFilter: 'blur(8px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="water-droplet w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: ' saturate(200%)',
                  WebkitBackdropFilter: 'blur(6px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 4px 8px -2px rgba(0, 0, 0, 0.3),
                    0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                    inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                    inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                    0 0 0 1px rgba(255, 255, 255, 0.08)
                  `,
                }}
              >
                <Zap className="w-5 h-5 text-white relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white leading-tight">
            {t('generate.title')}
          </h1>
                <p className="text-white/80 text-sm mt-0.5">
            {t('generate.subtitle')}
          </p>
              </div>
        </div>
      </div>

          {/* Admin Email Widget */}
          {user?.email && (
            <div 
              className="droplet-container p-4"
              style={{
                background: 'rgba(168, 85, 247, 0.06)',
                         backdropFilter: 'saturate(120%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: `
                  0 4px 8px -2px rgba(168, 85, 247, 0.3),
                  0 2px 4px -1px rgba(168, 85, 247, 0.2),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                  inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                  inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                  0 0 0 1px rgba(168, 85, 247, 0.15)
                `,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-white text-xs font-medium">{t('generate.seller')}</span>
              </div>
                <p className="text-white text-base font-semibold truncate">{user.email}</p>
            </div>
          )}

          {/* Balance Widget */}
          <div 
            className="droplet-container p-4"
            style={{
              background: 'rgba(6, 182, 212, 0.06)',
              backdropFilter: 'saturate(120%)',
              WebkitBackdropFilter: 'blur(8px) saturate(200%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: `
                0 4px 8px -2px rgba(6, 182, 212, 0.3),
                0 2px 4px -1px rgba(6, 182, 212, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(6, 182, 212, 0.2)
              `,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold">{t('generate.yourBalance')}</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatBalance(user?.wallet || 0)}$</p>
          </div>

          {/* Stats Widgets */}
          <div 
            className="droplet-container p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'saturate(120%)',
              WebkitBackdropFilter: 'blur(8px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">{t('generate.totalProducts')}</span>
                </div>
                <span className="text-white font-bold text-lg">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">{t('generate.available')}</span>
                </div>
                <span className="text-white font-bold text-lg">{availableProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">{t('generate.totalValue')}</span>
                </div>
                <span className="text-white font-bold text-lg">${formatPrice(totalValue)}</span>
              </div>
            </div>
        </div>
      </div>

        {/* Right Side - Product Selection & Purchase Panel (Horizontal Layout) */}
        <div className="col-span-1 lg:col-span-10 space-y-4 min-w-0 overflow-hidden">
          {/* Product Selection and Purchase Panel in one row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Product Selection */}
            <div className="space-y-4 min-w-0 overflow-visible relative z-10">
              <div 
                className="droplet-container p-2.5 sm:p-3 min-w-0 overflow-visible relative z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                     backdropFilter: 'blur(1px) saturate(120%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `
                    0 4px 8px -2px rgba(0, 0, 0, 0.3),
                    0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                    inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                    inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">{t('generate.selectProduct')}</h3>
            {/* Search */}
            <div className="mb-2.5">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                <input
                  type="text"
                  placeholder={t('generate.searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base text-white placeholder-gray-300 focus:outline-none transition-all"
                  style={{
                    borderRadius: '50px 50px 50px 8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                         backdropFilter: 'blur(8px) saturate(200%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
                  }}
                />
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-white/80 mt-4">{t('common.loading')}</p>
              </div>
            ) : Object.keys(groupedProducts).length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <p className="text-white/80">
                  {searchQuery ? t('admin.noSearchResults') : t('generate.noProductsAvailable')}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[320px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 relative z-0">
                {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
                  <div key={categoryName} className="space-y-2 relative z-0">
                    {/* Category Header */}
                    <div 
                      className="droplet-container flex items-center gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 relative z-10"
                      style={{
                        background: 'rgba(168, 85, 247, 0.18)',
                     backdropFilter: 'blur(12px) saturate(200%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        boxShadow: `
                          0 4px 8px -2px rgba(168, 85, 247, 0.3),
                          0 2px 4px -1px rgba(168, 85, 247, 0.2),
                          inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                          inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                          inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                          0 0 0 1px rgba(168, 85, 247, 0.15)
                        `,
                      }}
                    >
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate relative z-10">{categoryName}</h3>
                    </div>
                    
                    {/* Products in Category */}
                    <div className="space-y-2 pl-1.5 sm:pl-2 relative z-0">
                      {categoryProducts.map((product) => {
                        const isSelected = selectedProduct === product._id;
                        const isOutOfStock = (product.remainingQuantity || 0) === 0;
                        return (
                          <div
                            key={product._id}
                            onClick={() => !isOutOfStock && setSelectedProduct(product._id)}
                            className={`droplet-container group p-2 sm:p-2.5 transition-all duration-300 min-w-0 overflow-visible ${
                              isOutOfStock
                                ? 'opacity-60 cursor-not-allowed relative z-10'
                                : isSelected
                                ? 'cursor-pointer relative z-30'
                                : 'cursor-pointer hover:z-20 relative z-10'
                            }`}
                            style={{
                              background: isOutOfStock 
                                ? 'rgba(255, 255, 255, 0.08)'
                                : isSelected
                                ? 'rgba(6, 182, 212, 0.22)'
                                : 'rgba(255, 255, 255, 0.3)',
                     backdropFilter: 'blur(12px) saturate(200%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                              border: isOutOfStock
                                ? '1px solid rgba(255, 255, 255, 0.12)'
                                : isSelected
                                ? '1px solid rgba(6, 182, 212, 0.45)'
                                : '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: isSelected 
                                ? `
                                  0 4px 8px -2px rgba(6, 182, 212, 0.4),
                                  0 2px 4px -1px rgba(6, 182, 212, 0.3),
                                  inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                                  inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                                  inset 1px 1px 2px 0 rgba(0, 0, 0, 0.1),
                                  0 0 0 1px rgba(6, 182, 212, 0.25),
                                  0 0 4px rgba(6, 182, 212, 0.15)
                                `
                                : `
                                  0 4px 8px -2px rgba(0, 0, 0, 0.3),
                                  0 2px 4px -1px rgba(0, 0, 0, 0.2),
                                  inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                                  inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                                  inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                                  0 0 0 1px rgba(255, 255, 255, 0.05)
                                `,
                            }}
                          >
                            <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 overflow-hidden">
                                <div className="flex-shrink-0">
                                <ProductImage product={product} />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden pr-1 max-w-full">
                                  <p className={`font-semibold text-sm sm:text-base truncate ${
                                    isSelected ? 'text-cyan-300' : isOutOfStock ? 'text-gray-1000' : 'text-white'
                                  }`}>
                                    {getDisplayProductName(product.name, language)}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-xs mt-0.5 sm:mt-1">
                                    <span className={`font-bold flex-shrink-0 text-sm ${
                                      isOutOfStock ? 'text-gray-400' : 'text-cyan-300'
                                    }`}>
                                      ${formatPrice(product.price)}
                                    </span>
                                    <span className={`flex-shrink-0 text-sm ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
                                      {isOutOfStock ? t('generate.outOfStock') : t('generate.inStock')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isSelected && !isOutOfStock && (
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                              {isOutOfStock && (
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-300 text-sm font-bold">×</span>
                                </div>
                              )}
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
        </div>

        {/* Purchase Panel */}
            <div className="space-y-4 min-w-0 overflow-visible relative z-10">
              <div 
                className="droplet-container p-3 sm:p-4 h-fit overflow-visible relative z-10"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(1px) saturate(120%)',
              WebkitBackdropFilter: 'blur(8px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">{t('generate.purchaseDetails')}</h3>
            {selectedProductData ? (
              <div className="space-y-4 min-w-0 overflow-visible relative z-10">
                {/* Selected Product Info */}
                <div 
                  className="droplet-container p-2.5 sm:p-3 min-w-0 overflow-visible relative z-10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                     backdropFilter: 'blur(12px) saturate(200%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `
                      0 24px 72px -16px rgba(0, 0, 0, 0.5),
                      0 16px 48px -12px rgba(0, 0, 0, 0.4),
                      0 8px 24px -8px rgba(0, 0, 0, 0.3),
                      inset 0 2px 0 0 rgba(255, 255, 255, 0.3),
                      inset -3px -3px 8px 0 rgba(255, 255, 255, 0.15),
                      inset 4px 4px 8px 0 rgba(0, 0, 0, 0.12),
                      0 0 0 1px rgba(255, 255, 255, 0.08)
                    `,
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex-shrink-0">
                    <ProductImage product={selectedProductData} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="px-2 py-0.5 rounded-full text-white text-xs font-semibold whitespace-nowrap"
                          style={{
                            background: 'rgba(168, 85, 247, 0.2)',
                             backdropFilter: 'blur(8px) saturate(180%)',
                             WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                          }}
                        >
                          {typeof selectedProductData.category === 'object'
                            ? selectedProductData.category.name
                            : 'N/A'}
                        </span>
                      </div>
                      <p className="text-white font-medium truncate text-sm sm:text-base">
                        {getDisplayProductName(selectedProductData.name, language)}
                      </p>
                      <p className="text-white/90 text-sm">
                        ${formatPrice(selectedProductData.price)} each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    {t('generate.quantity')}
                  </label>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="water-droplet w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0 relative z-20"
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                         backdropFilter: 'blur(8px) saturate(200%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `
                          0 4px 8px -2px rgba(0, 0, 0, 0.3),
                          0 2px 4px -1px rgba(0, 0, 0, 0.2),
                          inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                          inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                          inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                          0 0 0 1px rgba(255, 255, 255, 0.08)
                        `,
                      }}
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:w-5 md:w-6 md:h-6 text-white relative z-10" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedProductData.remainingQuantity}
                      value={quantity}
                      onChange={(e) => {
                        const inputValue = e.target.value.trim();
                        if (!inputValue) {
                          setQuantity(1);
                          return;
                        }
                        const parsed = parseInt(inputValue, 10);
                        if (isNaN(parsed) || !isFinite(parsed) || parsed < 1) {
                          setQuantity(1);
                          return;
                        }
                        const val = Math.max(1, Math.min(selectedProductData.remainingQuantity, parsed));
                        setQuantity(val);
                      }}
                      className="flex-1 sm:w-28 text-center px-3 sm:px-4 py-2 sm:py-3 text-white text-base sm:text-lg font-semibold focus:outline-none"
                      style={{
                        borderRadius: '50px 50px 50px 8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                         backdropFilter: 'blur(8px) saturate(200%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: `
                          0 3px 5px -2px rgba(0, 0, 0, 0.15),
                          0 2px 4px -1px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                          inset -1px -1px 2px 0 rgba(255, 255, 255, 0.05),
                          0 0 0 1px rgba(255, 255, 255, 0.05)
                        `,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(selectedProductData.remainingQuantity, quantity + 1))}
                      className="water-droplet w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0 relative z-20"
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                         backdropFilter: 'blur(8px) saturate(200%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `
                          0 4px 8px -2px rgba(0, 0, 0, 0.3),
                          0 2px 4px -1px rgba(0, 0, 0, 0.2),
                          inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                          inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                          inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                          0 0 0 1px rgba(255, 255, 255, 0.08)
                        `,
                      }}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:w-5 md:w-6 md:h-6 text-white relative z-10" />
                    </button>
                  </div>
                    <p className="text-sm text-white/80 mt-1.5 text-center">
                      {t('generate.maxAvailable')}: {selectedProductData.remainingQuantity}
                    </p>
                </div>

                {/* Price Summary */}
                <div 
                  className="droplet-container p-3 overflow-visible relative z-10"
                  style={{
                    background: 'rgba(6, 182, 212, 0.18)',
                     backdropFilter: 'blur(12px) saturate(200%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    boxShadow: `
                      0 4px 8px -2px rgba(6, 182, 212, 0.3),
                      0 2px 4px -1px rgba(6, 182, 212, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                      inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(6, 182, 212, 0.2)
                    `,
                  }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-white text-sm font-medium">{t('generate.pricePerKey')}</span>
                    <span className="text-cyan-300 font-semibold text-base">
                      ${formatPrice(selectedProductData.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-white text-sm font-medium">{t('generate.quantity')}:</span>
                    <span className="text-white font-semibold text-base">{quantity}</span>
                  </div>
                  <div className="border-t border-white/20 pt-1.5 mt-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-base">{t('generate.total')}</span>
                      <span className="text-teal-300 font-bold text-2xl">
                        ${formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div 
                  className="droplet-container p-3 overflow-visible relative z-10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                     backdropFilter: 'blur(12px) saturate(200%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `
                      0 24px 72px -16px rgba(0, 0, 0, 0.5),
                      0 16px 48px -12px rgba(0, 0, 0, 0.4),
                      0 8px 24px -8px rgba(0, 0, 0, 0.3),
                      inset 0 2px 0 0 rgba(255, 255, 255, 0.3),
                      inset -3px -3px 8px 0 rgba(255, 255, 255, 0.15),
                      inset 4px 4px 8px 0 rgba(0, 0, 0, 0.12),
                      0 0 0 1px rgba(255, 255, 255, 0.08)
                    `,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{t('generate.yourBalance')}</span>
                    <span className="text-white font-bold text-base">
                      {formatBalance(user?.wallet || 0)}$
                    </span>
                  </div>
                  {totalPrice > (user?.wallet || 0) && (
                    <p className="text-red-300 text-sm mt-1.5 text-right font-medium">
                      {t('generate.insufficientBalance')}
                    </p>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  className="w-full relative z-20"
                  isLoading={isLoading}
                  disabled={!selectedProduct || quantity < 1 || totalPrice > (user?.wallet || 0)}
                >
                  <Zap className="w-5 h-5 inline mr-2" />
                  {isLoading ? t('generate.processing') : t('generate.generateKeys')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-3 text-white/50" />
                <p className="text-base text-white/80">{t('generate.selectProductToPurchase')}</p>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div 
            className="droplet-container p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
               backdropFilter: 'blur(15px) saturate(200%)',
               WebkitBackdropFilter: 'blur(15px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.4),
                0 2px 4px -1px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.08),
                0 0 4px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div 
                  className="water-droplet w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                         backdropFilter: 'blur(8px) saturate(200%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: `
                      0 20px 60px -12px rgba(16, 185, 129, 0.4),
                      0 12px 40px -8px rgba(16, 185, 129, 0.3),
                      0 4px 16px -4px rgba(16, 185, 129, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                      inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                      inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                      0 0 0 1px rgba(16, 185, 129, 0.25),
                      0 0 30px rgba(16, 185, 129, 0.2)
                    `,
                  }}
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    {t('generate.keysGenerated')}
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">
                    {purchasedKeys.length} {t('generate.key')}(s) {t('generate.purchased')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="water-droplet w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(6px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(6px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
              </button>
            </div>

            {/* Keys List */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {purchasedKeys.map((order, index) => {
                if (!order || !order.key) {
                  // console.warn('Invalid order in purchasedKeys:', order);
                  return null;
                }
                return (
                <div
                    key={order._id || index}
                    className="droplet-container p-2.5 sm:p-3 min-w-0 overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                     backdropFilter: 'blur(12px) saturate(200%)',
                     WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: `
                      0 24px 72px -16px rgba(0, 0, 0, 0.5),
                      0 16px 48px -12px rgba(0, 0, 0, 0.4),
                      0 8px 24px -8px rgba(0, 0, 0, 0.3),
                      inset 0 2px 0 0 rgba(255, 255, 255, 0.3),
                      inset -3px -3px 8px 0 rgba(255, 255, 255, 0.15),
                      inset 4px 4px 8px 0 rgba(0, 0, 0, 0.12),
                      0 0 0 1px rgba(255, 255, 255, 0.08)
                    `,
                    }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="text-white/60 text-xs sm:text-sm mb-1 truncate">{order.productName ? getDisplayProductName(order.productName, language) : 'N/A'}</p>
                        <p className="font-mono text-sm sm:text-base md:text-lg font-bold text-cyan-400 break-all">{order.key}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(order.key, index)}
                        className="water-droplet w-full sm:w-auto px-3 sm:px-4 py-2 flex items-center gap-2 min-w-[100px] justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                        disabled={!order.key}
                        style={{
                          background: 'rgba(255, 255, 255, 0.12)',
                         backdropFilter: 'blur(2px) saturate(120%)',
                         WebkitBackdropFilter: 'blur(8px) saturate(200%)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
                        }}
                    >
                      {copiedKeyIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                            <span className="text-white">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-white" />
                            <span className="text-white">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={copyAllKeys}
                className="flex-1"
              >
                <Copy className="w-5 h-5 inline mr-2" />
                {t('generate.copyAllKeys')}
              </Button>
              <Button
                onClick={() => setShowKeyModal(false)}
                variant="secondary"
                className="flex-1"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
