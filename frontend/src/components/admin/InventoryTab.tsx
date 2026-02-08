import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useProducts } from '@/hooks/useAdminData';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Key } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface InventoryTabProps {
  onAddInventory: (productId: string, keys: string[]) => Promise<boolean>;
}

export default function InventoryTab({ onAddInventory }: InventoryTabProps) {
  const { t } = useTranslation();
  const { products, loadProducts } = useProducts();
  const [selectedProductForInventory, setSelectedProductForInventory] = useState('');
  const [inventoryKeys, setInventoryKeys] = useState('');
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, loadProducts]);

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForInventory || !inventoryKeys.trim()) {
      return;
    }

    setIsLoadingInventory(true);
    try {
      const keys = inventoryKeys
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const success = await onAddInventory(selectedProductForInventory, keys);
      if (success) {
        setInventoryKeys('');
      }
    } catch (err: any) {
      // console.error('Failed to add inventory:', err);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card 
        title={t('admin.addInventory')}
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <form onSubmit={handleAddInventory} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.selectProduct')}
            </label>
            <select
              value={selectedProductForInventory}
              onChange={(e) =>
                setSelectedProductForInventory(e.target.value)
              }
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            >
              <option value="">{t('admin.selectProduct')}</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - ${formatPrice(product.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.keys')}
              <span className="text-gray-500 text-xs ml-2">
                {t('admin.onePerLine')}
              </span>
            </label>
            <textarea
              value={inventoryKeys}
              onChange={(e) => setInventoryKeys(e.target.value)}
              placeholder={t('admin.keys') + ', ' + t('admin.onePerLine') + '...'}
              rows={10}
              className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500">
              {inventoryKeys.split('\n').filter((k) => k.trim()).length}{' '}
              {t('admin.keysEntered')}
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"
            isLoading={isLoadingInventory}
          >
            {!isLoadingInventory && (
              <Key className="w-5 h-5 inline mr-2" />
            )}
            {isLoadingInventory ? t('admin.adding') : t('admin.addInventory')}
          </Button>
        </form>
      </Card>
    </div>
  );
}

