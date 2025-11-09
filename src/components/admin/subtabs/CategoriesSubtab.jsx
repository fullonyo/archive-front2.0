import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Folder, Plus, Edit2, Trash2, Eye, EyeOff,
  Search, MoreVertical, Loader, Check, X,
  TrendingUp, Package, Users, Star
} from 'lucide-react';
import { DataTable, StatsCard } from '../shared';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import { emitCategoriesUpdate } from '../../../utils/categoryEvents';

/**
 * CategoriesSubtab - Category Management
 * CRUD operations for asset categories with stats
 */
const CategoriesSubtab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    hidden: 0,
    totalAssets: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getCategories();
      
      if (response.success) {
        const cats = response.data || [];
        setCategories(cats);
        
        // Calculate stats
        setStats({
          total: cats.length,
          active: cats.filter(c => c.isActive).length,
          hidden: cats.filter(c => !c.isActive).length,
          totalAssets: cats.reduce((sum, c) => sum + (c.assetCount || 0), 0)
        });
      }
    } catch (error) {
      console.error('Load categories error:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Handle create category
  const handleCreate = useCallback(() => {
    setSelectedCategory(null);
    setEditModalOpen(true);
  }, []);

  // Handle edit category
  const handleEdit = useCallback((category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  }, []);

  // Handle delete category
  const handleDelete = useCallback((category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  }, []);

  // Handle toggle active
  const handleToggleActive = useCallback(async (category) => {
    try {
      await adminService.updateCategory(category.id, {
        isActive: !category.isActive
      });
      
      toast.success(`Category ${category.isActive ? 'hidden' : 'activated'}`);
      
      // Wait for backend cache invalidation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await loadCategories();
      emitCategoriesUpdate();
    } catch (error) {
      console.error('Toggle category error:', error);
      toast.error('Failed to update category');
    }
  }, [loadCategories]);

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (category) => (
        <div className="flex items-center gap-3">
          {category.icon && (
            <div className="w-10 h-10 rounded-lg bg-surface-float2 flex items-center justify-center text-xl">
              {category.icon}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {category.name}
            </p>
            <p className="text-xs text-text-tertiary truncate max-w-[200px]">
              {category.description || 'No description'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'assetCount',
      label: 'Assets',
      sortable: true,
      render: (category) => (
        <div className="text-sm text-text-secondary">
          {(category.assetCount || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (category) => (
        <span className={`px-2 py-1 text-xs rounded-md ${
          category.isActive
            ? 'bg-green-500/10 text-green-400'
            : 'bg-gray-500/10 text-gray-400'
        }`}>
          {category.isActive ? 'Active' : 'Hidden'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (category) => (
        <div className="text-xs text-text-tertiary">
          {new Date(category.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (category) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(category);
            }}
            className="p-2 hover:bg-surface-float2 rounded-lg transition-colors"
            title={category.isActive ? 'Hide category' : 'Show category'}
          >
            {category.isActive ? (
              <Eye size={16} className="text-text-secondary" />
            ) : (
              <EyeOff size={16} className="text-text-secondary" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(category);
            }}
            className="p-2 hover:bg-surface-float2 rounded-lg transition-colors"
            title="Edit category"
          >
            <Edit2 size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(category);
            }}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      )
    }
  ], [handleToggleActive, handleEdit, handleDelete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-theme-active" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Categories"
          value={stats.total.toLocaleString()}
          icon={Folder}
          subtitle="all categories"
        />
        <StatsCard
          title="Active"
          value={stats.active.toLocaleString()}
          icon={Eye}
          trend={{ value: `${stats.total > 0 ? Math.round(stats.active / stats.total * 100) : 0}%`, direction: 'neutral' }}
          subtitle="visible to users"
        />
        <StatsCard
          title="Hidden"
          value={stats.hidden.toLocaleString()}
          icon={EyeOff}
          subtitle="not visible"
        />
        <StatsCard
          title="Total Assets"
          value={stats.totalAssets.toLocaleString()}
          icon={Package}
          subtitle="across all categories"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-float border border-white/5 rounded-lg
                     text-sm text-text-primary placeholder-text-tertiary
                     focus:outline-none focus:border-theme-active transition-colors"
            style={{ contain: 'layout style' }}
          />
        </div>

        {/* New Category Button */}
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-theme-active text-white rounded-lg
                   hover:bg-theme-hover transition-all duration-200 font-medium text-sm"
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <DataTable
        data={filteredCategories}
        columns={columns}
        emptyMessage="No categories found"
        loading={loading}
      />

      {/* Modals */}
      {editModalOpen && (
        <EditCategoryModal
          category={selectedCategory}
          onClose={() => setEditModalOpen(false)}
          onSuccess={async () => {
            // Wait for backend cache invalidation
            await new Promise(resolve => setTimeout(resolve, 300));
            await loadCategories();
            emitCategoriesUpdate();
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteCategoryModal
          category={selectedCategory}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={async () => {
            // Wait for backend cache invalidation
            await new Promise(resolve => setTimeout(resolve, 300));
            await loadCategories();
            emitCategoriesUpdate();
          }}
        />
      )}
    </div>
  );
};

/**
 * EditCategoryModal - Create/Edit Category
 */
const EditCategoryModal = React.memo(({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '📦',
    isActive: category?.isActive ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        await adminService.updateCategory(category.id, formData);
        toast.success('Category updated successfully');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created successfully');
      }
      
      // Close modal first for better UX
      onClose();
      
      // Then reload and notify (this is async, runs in background)
      onSuccess();
    } catch (error) {
      console.error('Save category error:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  }, [category, formData, onSuccess, onClose]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ contain: 'layout style paint' }}
    >
      <div
        className="bg-surface-float border border-white/10 rounded-xl max-w-md w-full p-6"
        style={{ transform: 'translateZ(0)' }}
      >
        <h2 className="text-xl font-bold text-text-primary mb-4">
          {category ? 'Edit Category' : 'Create Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-base border border-white/5 rounded-lg
                       text-text-primary placeholder-text-tertiary
                       focus:outline-none focus:border-theme-active transition-colors"
              placeholder="Avatars"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-surface-base border border-white/5 rounded-lg
                       text-text-primary placeholder-text-tertiary resize-none
                       focus:outline-none focus:border-theme-active transition-colors"
              placeholder="VRChat avatar assets..."
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Icon (emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              maxLength={2}
              className="w-full px-3 py-2 bg-surface-base border border-white/5 rounded-lg
                       text-text-primary placeholder-text-tertiary text-2xl
                       focus:outline-none focus:border-theme-active transition-colors"
              placeholder="📦"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-surface-base
                       text-theme-active focus:ring-theme-active focus:ring-offset-0"
            />
            <label htmlFor="isActive" className="text-sm text-text-secondary">
              Active (visible to users)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-surface-base border border-white/10 rounded-lg
                       text-text-secondary hover:bg-surface-float2 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-theme-active text-white rounded-lg
                       hover:bg-theme-hover transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>{category ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EditCategoryModal.displayName = 'EditCategoryModal';

/**
 * DeleteCategoryModal - Confirm deletion
 */
const DeleteCategoryModal = React.memo(({ category, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await adminService.deleteCategory(category.id);
      toast.success('Category deleted successfully');
      
      // Close modal first for better UX
      onClose();
      
      // Then reload and notify (this is async, runs in background)
      onSuccess();
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  }, [category, onSuccess, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ contain: 'layout style paint' }}
    >
      <div
        className="bg-surface-float border border-white/10 rounded-xl max-w-md w-full p-6"
        style={{ transform: 'translateZ(0)' }}
      >
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Delete Category
        </h2>

        <p className="text-text-secondary mb-2">
          Are you sure you want to delete <strong className="text-text-primary">{category?.name}</strong>?
        </p>

        {category?.assetCount > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
            <p className="text-sm text-red-400">
              ⚠️ This category has <strong>{category.assetCount}</strong> asset(s). 
              You must reassign or delete these assets first.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-surface-base border border-white/10 rounded-lg
                     text-text-secondary hover:bg-surface-float2 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || category?.assetCount > 0}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg
                     hover:bg-red-600 transition-colors flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={18} />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteCategoryModal.displayName = 'DeleteCategoryModal';

export default React.memo(CategoriesSubtab);
