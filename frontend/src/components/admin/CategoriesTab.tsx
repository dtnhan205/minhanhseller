import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCategories } from '@/hooks/useAdminData';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageInput from '@/components/ui/ImageInput';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import CategoryImage from './CategoryImage';
import { Plus, Search, X, Folder, Edit, Trash2 } from 'lucide-react';
import type { Category } from '@/types';

interface CategoriesTabProps {
  onCreateCategory: (name: string, image?: string, order?: number) => Promise<boolean>;
  onUpdateCategory: (id: string, data: { name?: string; image?: string; order?: number }) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
}

export default function CategoriesTab({
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoriesTabProps) {
  const { t } = useTranslation();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', order: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      category.slug.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCreateCategory(
      categoryForm.name,
      categoryForm.image || undefined,
      categoryForm.order ? Number(categoryForm.order) : undefined
    );
    if (success) {
      setCategoryForm({ name: '', image: '', order: '' });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ 
      name: category.name, 
      image: category.image || '',
      order: category.order?.toString() || ''
    });
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const success = await onUpdateCategory(editingCategory._id, {
      name: categoryForm.name,
      image: categoryForm.image || undefined,
      order: categoryForm.order ? Number(categoryForm.order) : undefined,
    });
    if (success) {
      setCategoryForm({ name: '', image: '', order: '' });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm(t('admin.confirmDeleteCategory'))) {
      await onDeleteCategory(id);
    }
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', image: '', order: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
      <Card 
        title={t('admin.createCategory')} 
        className="h-fit"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.categoryName')}
            </label>
            <Input
              placeholder="e.g., Software, Games, Services"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              className="bg-black/50 border-gray-800 focus:border-cyan-500"
              required
            />
          </div>
          <ImageInput
            label={t('admin.imageUrl')}
            placeholder="https://example.com/image.jpg"
            value={categoryForm.image}
            onChange={(value) =>
              setCategoryForm({ ...categoryForm, image: value })
            }
            optional={true}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.order')} <span className="text-gray-500 text-xs ml-2">({t('admin.optional')})</span>
            </label>
            <Input
              type="number"
              placeholder="0"
              value={categoryForm.order}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, order: e.target.value })
              }
              className="bg-black/50 border-gray-800 focus:border-cyan-500"
              min="0"
              style={{ fontSize: '16px' }}
            />
            <p className="text-xs text-gray-500">
              {t('admin.orderHint')}
            </p>
          </div>
          <div className="flex gap-3">
            {editingCategory && (
              <Button
                type="button"
                onClick={handleCancelEditCategory}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              className={editingCategory ? "flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg" : "w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"}
            >
              {editingCategory ? (
                <>
                  <Edit className="w-5 h-5 inline mr-2" />
                  {t('common.save')}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t('admin.createCategory')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card 
        title={t('admin.categoriesList')} 
        className="h-fit"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('common.search') + ' categories..."'}
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-12 bg-black/50 border-gray-800"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoadingCategories ? (
          <SkeletonLoader />
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-900/50 rounded-full flex items-center justify-center">
              <Folder className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400">
              {categorySearch ? t('admin.noSearchResults') : t('admin.noCategories')}
            </p>
          </div>
        ) : (
          <div data-lenis-prevent className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredCategories.map((category, index) => (
              <div
                key={category._id}
                className="group flex items-center justify-between p-3 sm:p-4 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all duration-300 gap-3"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                  <CategoryImage image={category.image} name={category.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{category.name}</p>
                    <p className="text-gray-400 text-xs mt-1 truncate">{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 bg-gray-800 hover:bg-red-900/30 rounded-lg transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

