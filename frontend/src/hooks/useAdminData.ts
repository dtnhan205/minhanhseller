import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import type { User, Category, Product } from '@/types';

// Hook for managing sellers
export function useSellers() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToastStore();

  const loadSellers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getSellers();
      setSellers(data);
    } catch (err) {
      showError('Failed to load sellers');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const createSeller = useCallback(
    async (data: { email: string; password: string }) => {
      try {
        await adminApi.createSeller(data);
        showSuccess('Seller created successfully!');
        await loadSellers();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create seller';
        showError(errorMessage);
        return false;
      }
    },
    [loadSellers, showError, showSuccess]
  );

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  return {
    sellers,
    isLoading,
    loadSellers,
    createSeller,
  };
}

// Hook for managing categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToastStore();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getCategories();
      // console.log('[useCategories] Loaded categories:', data);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        // console.warn('[useCategories] Expected array but got:', data);
        setCategories([]);
      }
    } catch (err) {
      // console.error('[useCategories] Error loading categories:', err);
      showError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const createCategory = useCallback(
    async (name: string, image?: string, order?: number) => {
      try {
        // console.log('[useCategories] Creating category:', name, image, order);
        const newCategory = await adminApi.createCategory(name, image, order);
        // console.log('[useCategories] Category created:', newCategory);
        
        // Optimistically update the state
        if (newCategory && typeof newCategory === 'object') {
          setCategories(prev => {
            // Check if category already exists to avoid duplicates
            const exists = prev.some(cat => cat._id === newCategory._id || cat.slug === newCategory.slug);
            if (exists) {
              // console.log('[useCategories] Category already in list, skipping optimistic update');
              return prev;
            }
            // Add new category at the beginning (newest first)
            return [newCategory, ...prev];
          });
        }
        
        showSuccess('Category created successfully!');
        
        // Reload to ensure we have the latest data from server
        await loadCategories();
        // console.log('[useCategories] Categories reloaded after create');
        return true;
      } catch (err: any) {
        // console.error('[useCategories] Error creating category:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create category';
        showError(errorMessage);
        return false;
      }
    },
    [loadCategories, showError, showSuccess]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const updateCategory = useCallback(
    async (id: string, data: { name?: string; image?: string; order?: number }) => {
      try {
        const updated = await adminApi.updateCategory(id, data);
        setCategories(prev => prev.map(cat => cat._id === id ? updated : cat));
        showSuccess('Category updated successfully!');
        await loadCategories();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update category';
        showError(errorMessage);
        return false;
      }
    },
    [loadCategories, showError, showSuccess]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await adminApi.deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat._id !== id));
        showSuccess('Category deleted successfully!');
        await loadCategories();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete category';
        showError(errorMessage);
        return false;
      }
    },
    [loadCategories, showError, showSuccess]
  );

  return {
    categories,
    isLoading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// Hook for managing products
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToastStore();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (err) {
      showError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const createProduct = useCallback(
    async (data: { name: string; categoryId: string; price: number }) => {
      try {
        await adminApi.createProduct(data);
        showSuccess('Product created successfully!');
        await loadProducts();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create product';
        showError(errorMessage);
        return false;
      }
    },
    [loadProducts, showError, showSuccess]
  );

  const addInventory = useCallback(
    async (productId: string, keys: string[]) => {
      try {
        await adminApi.addInventory(productId, keys);
        showSuccess(`Added ${keys.length} key(s) to inventory!`);
        await loadProducts();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add inventory';
        showError(errorMessage);
        return false;
      }
    },
    [loadProducts, showError, showSuccess]
  );

  const updateProduct = useCallback(
    async (id: string, data: { name?: string; categoryId?: string; price?: number }) => {
      try {
        const updated = await adminApi.updateProduct(id, data);
        setProducts(prev => prev.map(prod => prod._id === id ? updated : prod));
        showSuccess('Product updated successfully!');
        await loadProducts();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update product';
        showError(errorMessage);
        return false;
      }
    },
    [loadProducts, showError, showSuccess]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await adminApi.deleteProduct(id);
        setProducts(prev => prev.filter(prod => prod._id !== id));
        showSuccess('Product deleted successfully!');
        await loadProducts();
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete product';
        showError(errorMessage);
        return false;
      }
    },
    [loadProducts, showError, showSuccess]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addInventory,
  };
}

