import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCategories, useProducts } from '@/hooks/useAdminData';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import ProductImage from './ProductImage';
import { Plus, Search, X, Package, Edit, Trash2, Key, Copy, Check, Languages } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { translateProductName, hasVietnameseWords } from '@/utils/translateProductName';

interface ProductsTabProps {
  onCreateProduct: (data: { name: string; categoryId: string; price: number }) => Promise<boolean>;
  onUpdateProduct: (id: string, data: { name?: string; categoryId?: string; price?: number }) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
}

export default function ProductsTab({
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsTabProps) {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();
  const { categories } = useCategories();
  const { products, isLoading: isLoadingProducts } = useProducts();
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    price: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [viewingKeysProductId, setViewingKeysProductId] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<Array<{
    _id: string;
    value: string;
    qtyAvailable: number;
    createdAt: string;
  }>>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (typeof product.category === 'object' &&
          product.category.name
            .toLowerCase()
            .includes(productSearch.toLowerCase()))
    );
  }, [products, productSearch]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPrice = productForm.price.trim();
    if (!trimmedPrice) {
      showError('Please enter a price');
      return;
    }
    
    const price = parseFloat(trimmedPrice);
    if (isNaN(price) || price <= 0 || !isFinite(price)) {
      showError('Please enter a valid price');
      return;
    }
    
    // Prevent extremely large prices (security check)
    if (price > 1000000) {
      showError('Price is too large. Maximum is $1,000,000');
      return;
    }
    
    // Tự động dịch tên product sang tiếng Anh nếu có từ tiếng Việt
    let productName = productForm.name.trim();
    if (hasVietnameseWords(productName)) {
      productName = translateProductName(productName);
    }
    
    const success = await onCreateProduct({
      name: productName,
      categoryId: productForm.categoryId,
      price: price,
    });
    if (success) {
      setProductForm({ name: '', categoryId: '', price: '' });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      categoryId: typeof product.category === 'object' ? product.category._id : product.category,
      price: product.price.toString(),
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const trimmedPrice = productForm.price.trim();
    if (!trimmedPrice) {
      showError('Please enter a price');
      return;
    }
    
    const price = parseFloat(trimmedPrice);
    if (isNaN(price) || price <= 0 || !isFinite(price)) {
      showError('Please enter a valid price');
      return;
    }
    
    // Prevent extremely large prices (security check)
    if (price > 1000000) {
      showError('Price is too large. Maximum is $1,000,000');
      return;
    }
    
    // Tự động dịch tên product sang tiếng Anh nếu có từ tiếng Việt
    let productName = productForm.name.trim();
    if (hasVietnameseWords(productName)) {
      productName = translateProductName(productName);
    }
    
    const success = await onUpdateProduct(editingProduct._id, {
      name: productName,
      categoryId: productForm.categoryId,
      price: price,
    });
    if (success) {
      setProductForm({ name: '', categoryId: '', price: '' });
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm(t('admin.confirmDeleteProduct'))) {
      await onDeleteProduct(id);
    }
  };

  const handleCancelEditProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', categoryId: '', price: '' });
  };

  const handleViewKeys = async (productId: string) => {
    setIsLoadingKeys(true);
    try {
      const data = await adminApi.getProductKeys(productId);
      setProductKeys(data.keys);
      setViewingKeysProductId(productId);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to load product keys');
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleCopyKey = async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(keyId);
      showSuccess('Key copied!');
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      showError('Failed to copy key');
    }
  };

  const handleDeleteKey = async (productId: string, keyId: string) => {
    if (!confirm('Are you sure you want to delete this key? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.deleteInventoryKey(productId, keyId);
      showSuccess('Key deleted successfully');
      // Reload keys after deletion
      const data = await adminApi.getProductKeys(productId);
      setProductKeys(data.keys);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete key');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
      <Card title={t('admin.createProduct')} className="h-fit">
        <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.productName')}
            </label>
            <div className="relative">
              <Input
                placeholder={t('admin.placeholderProductName')}
                value={productForm.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductForm({ ...productForm, name: value });
                }}
                onBlur={(e) => {
                  // Tự động dịch khi blur nếu có từ tiếng Việt
                  const value = e.target.value.trim();
                  if (value && hasVietnameseWords(value)) {
                    const translated = translateProductName(value);
                    if (translated !== value) {
                      setProductForm({ ...productForm, name: translated });
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Tự động dịch khi nhấn Enter hoặc Tab
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const value = productForm.name.trim();
                    if (value && hasVietnameseWords(value)) {
                      const translated = translateProductName(value);
                      if (translated !== value) {
                        e.preventDefault();
                        setProductForm({ ...productForm, name: translated });
                        // Nếu là Enter, focus vào field tiếp theo
                        if (e.key === 'Enter') {
                          setTimeout(() => {
                            const nextInput = (e.target as HTMLElement).closest('form')?.querySelector('input[type="number"], select') as HTMLElement;
                            nextInput?.focus();
                          }, 0);
                        }
                      }
                    }
                  }
                }}
                className="bg-black/50 border-gray-800 focus:border-cyan-500 pr-10"
                required
              />
              {hasVietnameseWords(productForm.name) && (
                <button
                  type="button"
                  onClick={() => {
                    const translated = translateProductName(productForm.name);
                    setProductForm({ ...productForm, name: translated });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  title="Dịch sang tiếng Anh"
                >
                  <Languages className="w-4 h-4" />
                </button>
              )}
            </div>
            {hasVietnameseWords(productForm.name) && (
              <p className="text-xs text-cyan-400 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Nhấn vào biểu tượng hoặc rời khỏi ô để tự động dịch: <span className="font-medium">{translateProductName(productForm.name)}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('common.select')}
            </label>
            <select
              value={productForm.categoryId}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  categoryId: e.target.value,
                })
              }
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            >
              <option value="">{t('admin.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.price')}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({ ...productForm, price: e.target.value })
              }
              className="bg-black/50 border-gray-800 focus:border-cyan-500"
              required
            />
          </div>
          <div className="flex gap-3">
            {editingProduct && (
              <Button
                type="button"
                onClick={handleCancelEditProduct}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              className={editingProduct ? "flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg" : "w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"}
            >
              {editingProduct ? (
                <>
                  <Edit className="w-5 h-5 inline mr-2" />
                  {t('common.save')}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t('admin.createProduct')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card title={t('admin.productsList')} className="h-fit">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('common.search') + ' products..."'}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-12 bg-black/50 border-gray-800"
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoadingProducts ? (
          <SkeletonLoader />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-900/50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400">
              {productSearch ? t('admin.noSearchResults') : t('admin.noProducts')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="group p-3 sm:p-4 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900/50 transition-all duration-300"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                    <ProductImage product={product} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base md:text-lg truncate">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {typeof product.category === 'object'
                          ? product.category.name
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-cyan-400 font-bold text-base sm:text-lg">
                      ${formatPrice(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                    <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border whitespace-nowrap ${
                      (product.remainingQuantity || 0) > 0 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <span className={`font-medium ${
                        (product.remainingQuantity || 0) > 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {(product.remainingQuantity || 0) > 0 
                          ? `${t('admin.inStock')}: ${product.remainingQuantity} key` 
                          : t('admin.outOfStock')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <span className="text-purple-400 font-medium whitespace-nowrap">
                        {t('admin.sold')}: {product.soldQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewKeys(product._id)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                      title="View Keys"
                    >
                      <Key className="w-4 h-4 text-yellow-400" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-2 bg-gray-800 hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title={t('common.delete')}
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

      {/* Keys Modal */}
      {viewingKeysProductId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div 
            className="droplet-container p-4 sm:p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(2px) saturate(120%)',
              WebkitBackdropFilter: 'blur(2px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: `
                0 32px 96px -20px rgba(0, 0, 0, 0.7),
                0 20px 64px -16px rgba(0, 0, 0, 0.6),
                0 10px 32px -10px rgba(0, 0, 0, 0.5),
                inset 0 2px 0 0 rgba(255, 255, 255, 0.4),
                inset -4px -4px 10px 0 rgba(255, 255, 255, 0.2),
                inset 5px 5px 10px 0 rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.12),
                0 0 60px rgba(255, 255, 255, 0.08)
              `,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div 
                  className="water-droplet w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(234, 179, 8, 0.25)',
                    backdropFilter: 'blur(2px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    boxShadow: `
                      0 20px 60px -12px rgba(234, 179, 8, 0.4),
                      0 12px 40px -8px rgba(234, 179, 8, 0.3),
                      0 4px 16px -4px rgba(234, 179, 8, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                      inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                      inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                      0 0 0 1px rgba(234, 179, 8, 0.25),
                      0 0 30px rgba(234, 179, 8, 0.2)
                    `,
                  }}
                >
                  <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    Available Keys
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">
                    {productKeys.length} key(s) available
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewingKeysProductId(null);
                  setProductKeys([]);
                }}
                className="water-droplet w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(2px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 20px 60px -12px rgba(0, 0, 0, 0.5),
                    0 12px 40px -8px rgba(0, 0, 0, 0.4),
                    0 4px 16px -4px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                    inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                    inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
              </button>
            </div>

            {/* Keys List */}
            {isLoadingKeys ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-white/60 mt-4">Loading keys...</p>
              </div>
            ) : productKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <p className="text-white/60">No available keys</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {productKeys.map((keyItem) => (
                  <div
                    key={keyItem._id}
                    className="droplet-container p-3 sm:p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(2px) saturate(120%)',
                      WebkitBackdropFilter: 'blur(2px) saturate(120%)',
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
                        <p className="font-mono text-sm sm:text-base md:text-lg font-bold text-yellow-400 break-all">
                          {keyItem.value}
                        </p>
                        <p className="text-white/50 text-xs mt-1">
                          Quantity: {keyItem.qtyAvailable} • Added: {new Date(keyItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleCopyKey(keyItem.value, keyItem._id)}
                          className="water-droplet w-full sm:w-auto px-3 sm:px-4 py-2 flex items-center gap-2 min-w-[100px] justify-center text-sm relative z-10"
                          style={{
                            background: 'rgba(255, 255, 255, 0.18)',
                            backdropFilter: 'blur(2px) saturate(120%)',
                            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: `
                              0 20px 60px -12px rgba(0, 0, 0, 0.5),
                              0 12px 40px -8px rgba(0, 0, 0, 0.4),
                              0 4px 16px -4px rgba(0, 0, 0, 0.3),
                              inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                              inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                              inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                              0 0 0 1px rgba(255, 255, 255, 0.1)
                            `,
                          }}
                        >
                          {copiedKeyId === keyItem._id ? (
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
                        <button
                          onClick={() => viewingKeysProductId && handleDeleteKey(viewingKeysProductId, keyItem._id)}
                          className="water-droplet w-full sm:w-auto px-3 sm:px-4 py-2 flex items-center gap-2 min-w-[100px] justify-center text-sm relative z-10"
                          style={{
                            background: 'rgba(239, 68, 68, 0.18)',
                            backdropFilter: 'blur(2px) saturate(120%)',
                            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            boxShadow: `
                              0 20px 60px -12px rgba(239, 68, 68, 0.3),
                              0 12px 40px -8px rgba(239, 68, 68, 0.2),
                              0 4px 16px -4px rgba(239, 68, 68, 0.1),
                              inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                              inset -2px -2px 4px 0 rgba(255, 255, 255, 0.1),
                              inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                              0 0 0 1px rgba(239, 68, 68, 0.2)
                            `,
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

