import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Check, Loader2 } from 'lucide-react';
import collectionService from '../../services/collectionService';
import CreateCollectionModal from './CreateCollectionModal';

const SaveToCollectionModal = ({ isOpen, onClose, assetId, assetTitle }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    if (!isOpen || !assetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await collectionService.searchCollections(searchQuery, assetId);
      
      if (response.success) {
        const cols = response.data || [];
        setCollections(cols);
        
        // Pre-select collections that already have this asset
        const alreadySelected = new Set(
          cols.filter(c => c.isSelected).map(c => c.id)
        );
        setSelectedCollections(alreadySelected);
      }
    } catch (err) {
      console.error('Fetch collections error:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [isOpen, assetId, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      // Focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset state quando fechar
      setSearchQuery('');
      setSelectedCollections(new Set());
      setError(null);
    }
  }, [isOpen, fetchCollections]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const toggleCollection = useCallback((collectionId) => {
    setSelectedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedCollections.size === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Get originally selected collections
      const originallySelected = new Set(
        collections.filter(c => c.isSelected).map(c => c.id)
      );

      // Collections to add
      const toAdd = Array.from(selectedCollections).filter(
        id => !originallySelected.has(id)
      );

      // Collections to remove
      const toRemove = Array.from(originallySelected).filter(
        id => !selectedCollections.has(id)
      );

      // Execute operations
      const promises = [];

      if (toAdd.length > 0) {
        promises.push(
          collectionService.addAssetToMultipleCollections(assetId, toAdd)
        );
      }

      if (toRemove.length > 0) {
        promises.push(
          collectionService.removeAssetFromMultipleCollections(assetId, toRemove)
        );
      }

      await Promise.all(promises);

      // Success
      onClose();
      
      // TODO: Show toast notification
      console.log(`Asset saved to ${selectedCollections.size} collections`);
      
    } catch (err) {
      console.error('Save to collections error:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [assetId, selectedCollections, collections, onClose]);

  const handleCreateSuccess = useCallback((newCollection) => {
    setShowCreateModal(false);
    // Add new collection to list and select it
    setCollections(prev => [newCollection.data, ...prev]);
    setSelectedCollections(prev => new Set(prev).add(newCollection.data.id));
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Save to Collection Modal */}
      <div
        className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        style={{
          contain: 'layout style paint',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        <div
          className="bg-surface-float rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
          style={{
            contain: 'layout style paint',
            willChange: 'transform'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg font-semibold truncate">Save to Collection</h2>
              {assetTitle && (
                <p className="text-xs text-text-tertiary truncate mt-0.5">
                  {assetTitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-float2 rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-base border border-white/10 rounded-lg text-sm focus:outline-none focus:border-theme-active transition-colors"
              />
            </div>
          </div>

          {/* Collections List */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-2"
            style={{
              WebkitOverflowScrolling: 'touch',
              contain: 'layout style paint',
              willChange: 'scroll-position'
            }}
          >
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-theme-active" />
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-8 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && collections.length === 0 && (
              <div className="text-center py-8 text-text-tertiary text-sm">
                {searchQuery ? 'No collections found' : 'No collections yet'}
              </div>
            )}

            {!loading && !error && collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => toggleCollection(collection.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-float2 transition-colors text-left group"
              >
                {/* Checkbox */}
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                    ${selectedCollections.has(collection.id)
                      ? 'bg-theme-active border-theme-active'
                      : 'border-white/20 group-hover:border-white/40'
                    }
                  `}
                >
                  {selectedCollections.has(collection.id) && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </div>

                {/* Collection Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{collection.emoji}</span>
                    <span className="text-sm font-medium truncate">
                      {collection.name}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {collection.assetCount} {collection.assetCount === 1 ? 'asset' : 'assets'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Create New Button */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-base hover:bg-surface-float2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Create New Collection
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-4 border-t border-white/5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg bg-surface-base hover:bg-surface-float2 transition-colors text-sm font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-lg bg-theme-active hover:bg-theme-hover transition-colors text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                `Save (${selectedCollections.size})`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>,
    document.body
  );
};

export default SaveToCollectionModal;
