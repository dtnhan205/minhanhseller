import { useEffect, useMemo, useState } from 'react';
import { useSellers, useProducts } from '@/hooks/useAdminData';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type { Product, SellerProductPrice, User } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SkeletonLoader from './SkeletonLoader';
import { Plus, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

const PAGE_SIZE = 10;

export default function SellerPricesTab() {
  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const { sellers, isLoading: isLoadingSellers } = useSellers();
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { success: showSuccess, error: showError } = useToastStore();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [sellerPrices, setSellerPrices] = useState<SellerProductPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [savingSellerId, setSavingSellerId] = useState<string | null>(null);
  const [deletingPriceId, setDeletingPriceId] = useState<string | null>(null);
  const [sellerSearch, setSellerSearch] = useState('');

  const [selectedBulkSellerIds, setSelectedBulkSellerIds] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const [assignedPage, setAssignedPage] = useState(1);
  const [unassignedPage, setUnassignedPage] = useState(1);

  const [priceToDelete, setPriceToDelete] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    if (!selectedProductId) {
      setSellerPrices([]);
      return;
    }

    const load = async () => {
      setIsLoadingPrices(true);
      try {
        const data = await adminApi.getSellerProductPricesByProduct(selectedProductId);
        setSellerPrices(data);
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to load seller prices');
      } finally {
        setIsLoadingPrices(false);
      }
    };

    load();
  }, [selectedProductId, showError]);

  useEffect(() => {
    setSelectedBulkSellerIds([]);
    setBulkPrice('');
    setPriceInputs({});
    setSellerSearch('');
    setAssignedPage(1);
    setUnassignedPage(1);
  }, [selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId),
    [products, selectedProductId]
  );

  const searchText = sellerSearch.trim().toLowerCase();

  const assignedSellerIds = useMemo(() => {
    return new Set(
      sellerPrices.map((sp) =>
        typeof sp.seller === 'object' && sp.seller ? sp.seller._id : String(sp.seller)
      )
    );
  }, [sellerPrices]);

  const assignedSellers = useMemo(() => {
    const mapped = sellerPrices
      .map((sp) => {
        const sellerId = typeof sp.seller === 'object' && sp.seller ? sp.seller._id : String(sp.seller);
        const seller = sellers.find((s) => s._id === sellerId);
        return {
          price: sp,
          seller,
        };
      })
      .filter((item) => Boolean(item.seller)) as Array<{ price: SellerProductPrice; seller: User }>;

    if (!searchText) return mapped;
    return mapped.filter(({ seller }) => seller.email.toLowerCase().includes(searchText));
  }, [sellerPrices, sellers, searchText]);

  const unassignedSellers = useMemo(() => {
    const filtered = sellers.filter((seller) => !assignedSellerIds.has(seller._id));
    if (!searchText) return filtered;
    return filtered.filter((seller) => seller.email.toLowerCase().includes(searchText));
  }, [sellers, assignedSellerIds, searchText]);

  const assignedTotalPages = Math.max(1, Math.ceil(assignedSellers.length / PAGE_SIZE));
  const unassignedTotalPages = Math.max(1, Math.ceil(unassignedSellers.length / PAGE_SIZE));

  useEffect(() => {
    if (assignedPage > assignedTotalPages) setAssignedPage(assignedTotalPages);
  }, [assignedPage, assignedTotalPages]);

  useEffect(() => {
    if (unassignedPage > unassignedTotalPages) setUnassignedPage(unassignedTotalPages);
  }, [unassignedPage, unassignedTotalPages]);

  useEffect(() => {
    setAssignedPage(1);
    setUnassignedPage(1);
  }, [searchText]);

  const assignedSellersPage = useMemo(() => {
    const start = (assignedPage - 1) * PAGE_SIZE;
    return assignedSellers.slice(start, start + PAGE_SIZE);
  }, [assignedSellers, assignedPage]);

  const unassignedSellersPage = useMemo(() => {
    const start = (unassignedPage - 1) * PAGE_SIZE;
    return unassignedSellers.slice(start, start + PAGE_SIZE);
  }, [unassignedSellers, unassignedPage]);

  const currentPageUnassignedIds = useMemo(
    () => unassignedSellersPage.map((s) => s._id),
    [unassignedSellersPage]
  );

  const isAllCurrentPageSelected =
    currentPageUnassignedIds.length > 0 &&
    currentPageUnassignedIds.every((id) => selectedBulkSellerIds.includes(id));

  const handleSetPrice = async (sellerId: string) => {
    if (!selectedProductId) {
      showError('Please select product first');
      return;
    }

    const raw = (priceInputs[sellerId] || '').trim();
    if (!raw) {
      showError('Please input a price');
      return;
    }

    const price = Number(raw);
    if (!Number.isFinite(price) || price <= 0) {
      showError('Invalid price');
      return;
    }

    setSavingSellerId(sellerId);
    try {
      await adminApi.setSellerProductPrice(sellerId, selectedProductId, price);
      showSuccess('Set seller price successfully');
      const data = await adminApi.getSellerProductPricesByProduct(selectedProductId);
      setSellerPrices(data);
      setPriceInputs((prev) => ({ ...prev, [sellerId]: '' }));
      setSelectedBulkSellerIds((prev) => prev.filter((id) => id !== sellerId));
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to set seller price');
    } finally {
      setSavingSellerId(null);
    }
  };

  const handleToggleBulkSeller = (sellerId: string) => {
    setSelectedBulkSellerIds((prev) =>
      prev.includes(sellerId) ? prev.filter((id) => id !== sellerId) : [...prev, sellerId]
    );
  };

  const handleToggleCurrentPageUnassigned = () => {
    if (isAllCurrentPageSelected) {
      setSelectedBulkSellerIds((prev) =>
        prev.filter((id) => !currentPageUnassignedIds.includes(id))
      );
      return;
    }

    setSelectedBulkSellerIds((prev) => {
      const merged = new Set([...prev, ...currentPageUnassignedIds]);
      return Array.from(merged);
    });
  };

  const handleUseDefaultPrice = () => {
    if (!selectedProduct) {
      showError('Please select product first');
      return;
    }
    setBulkPrice(String(selectedProduct.price));
    showSuccess('Đã áp dụng giá gốc sản phẩm vào bulk price');
  };

  const handleBulkSetPrice = async () => {
    if (!selectedProductId) {
      showError('Please select product first');
      return;
    }

    if (selectedBulkSellerIds.length === 0) {
      showError('Please select at least one seller');
      return;
    }

    const value = bulkPrice.trim();
    if (!value) {
      showError('Please input bulk price');
      return;
    }

    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) {
      showError('Invalid bulk price');
      return;
    }

    setIsBulkSaving(true);
    try {
      await Promise.all(
        selectedBulkSellerIds.map((sellerId) =>
          adminApi.setSellerProductPrice(sellerId, selectedProductId, price)
        )
      );
      showSuccess(`Set giá thành công cho ${selectedBulkSellerIds.length} seller`);
      const data = await adminApi.getSellerProductPricesByProduct(selectedProductId);
      setSellerPrices(data);
      setSelectedBulkSellerIds([]);
      setBulkPrice('');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to bulk set price');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleDeletePrice = async () => {
    if (!priceToDelete) return;

    setDeletingPriceId(priceToDelete.id);
    try {
      await adminApi.deleteSellerProductPrice(priceToDelete.id);
      showSuccess('Removed seller price');
      setSellerPrices((prev) => prev.filter((sp) => sp._id !== priceToDelete.id));
      setPriceToDelete(null);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to remove seller price');
    } finally {
      setDeletingPriceId(null);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <Card title="Set giá sản phẩm theo seller">
          <div className="space-y-3">
            <label className="block text-sm text-gray-300 font-medium">Chọn sản phẩm</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p: Product) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {selectedProduct && (
              <p className="text-xs text-gray-400">
                Giá gốc:{' '}
                <span className="text-cyan-300 font-semibold">
                  {formatCurrency(selectedProduct.price, language, usdToVnd)}
                </span>
              </p>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Tìm seller theo email..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="pl-10 pr-10 bg-black/50 border-gray-800"
              />
              {sellerSearch && (
                <button
                  onClick={() => setSellerSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>

        {!selectedProductId ? (
          <Card>
            <p className="text-sm text-gray-400">
              Vui lòng chọn sản phẩm để quản lý danh sách seller đã set giá và chưa set giá.
            </p>
          </Card>
        ) : isLoadingSellers || isLoadingProducts || isLoadingPrices ? (
          <SkeletonLoader />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={`Đã set giá (${assignedSellers.length})`}>
              {assignedSellers.length === 0 ? (
                <p className="text-sm text-gray-400">Chưa có seller nào được set giá cho sản phẩm này.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {assignedSellersPage.map(({ price, seller }) => (
                      <div
                        key={price._id}
                        className="p-3 rounded-lg border border-gray-800 bg-gray-950/50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{seller.email}</p>
                          <p className="text-xs text-cyan-300 mt-1">
                            {formatCurrency(price.price, language, usdToVnd)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setPriceToDelete({ id: price._id, email: seller.email })}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
                          isLoading={deletingPriceId === price._id}
                        >
                          {deletingPriceId !== price._id && <Trash2 className="w-4 h-4 inline mr-2" />}
                          Xóa set giá
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>Trang {assignedPage}/{assignedTotalPages}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setAssignedPage((p) => Math.max(1, p - 1))}
                        disabled={assignedPage === 1}
                        className="bg-gray-800 hover:bg-gray-700 px-3 py-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setAssignedPage((p) => Math.min(assignedTotalPages, p + 1))}
                        disabled={assignedPage === assignedTotalPages}
                        className="bg-gray-800 hover:bg-gray-700 px-3 py-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card title={`Chưa set giá (${unassignedSellers.length})`}>
              {unassignedSellers.length === 0 ? (
                <p className="text-sm text-gray-400">Tất cả seller đã được set giá cho sản phẩm này.</p>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border border-gray-700/50 bg-gray-900/40 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm text-gray-200 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-cyan-500"
                          checked={isAllCurrentPageSelected}
                          onChange={handleToggleCurrentPageUnassigned}
                        />
                        Chọn tất cả trang hiện tại
                      </label>
                      <span className="text-xs text-gray-400">
                        Đã chọn: {selectedBulkSellerIds.length}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Giá USD áp dụng cho seller đã chọn"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="bg-black/50 border-gray-800"
                      />
                      <Button
                        type="button"
                        onClick={handleUseDefaultPrice}
                        className="bg-gray-800 hover:bg-gray-700"
                        disabled={!selectedProduct}
                      >
                        Dùng giá gốc
                      </Button>
                      <Button
                        type="button"
                        onClick={handleBulkSetPrice}
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                        isLoading={isBulkSaving}
                      >
                        Set hàng loạt
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto">
                    {unassignedSellersPage.map((seller) => (
                      <div key={seller._id} className="p-3 rounded-lg border border-gray-800 bg-gray-950/50">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label className="text-sm font-medium text-white flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="accent-cyan-500"
                              checked={selectedBulkSellerIds.includes(seller._id)}
                              onChange={() => handleToggleBulkSeller(seller._id)}
                            />
                            {seller.email}
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Nhập giá USD"
                            value={priceInputs[seller._id] || ''}
                            onChange={(e) =>
                              setPriceInputs((prev) => ({
                                ...prev,
                                [seller._id]: e.target.value,
                              }))
                            }
                            className="bg-black/50 border-gray-800"
                          />
                          <Button
                            type="button"
                            onClick={() => handleSetPrice(seller._id)}
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                            isLoading={savingSellerId === seller._id}
                          >
                            {savingSellerId !== seller._id && <Plus className="w-4 h-4 inline mr-2" />}
                            Set giá
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>Trang {unassignedPage}/{unassignedTotalPages}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setUnassignedPage((p) => Math.max(1, p - 1))}
                        disabled={unassignedPage === 1}
                        className="bg-gray-800 hover:bg-gray-700 px-3 py-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setUnassignedPage((p) => Math.min(unassignedTotalPages, p + 1))}
                        disabled={unassignedPage === unassignedTotalPages}
                        className="bg-gray-800 hover:bg-gray-700 px-3 py-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {priceToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Xác nhận xóa set giá</h3>
              <p className="text-sm text-gray-300">
                Bạn có chắc muốn xóa giá đã set cho seller <span className="text-white font-semibold">{priceToDelete.email}</span>?
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setPriceToDelete(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700"
                  disabled={deletingPriceId === priceToDelete.id}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleDeletePrice}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  isLoading={deletingPriceId === priceToDelete.id}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
