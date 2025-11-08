import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, Eye, Download, Calendar, User, AlertCircle, CheckCircle, Loader, Package } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { handleImageError } from '../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../constants';
import AssetDetailModal from '../assets/AssetDetailModal';

const PendingAssetsTab = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [processingIds, setProcessingIds] = useState(new Set());
  const [totalPending, setTotalPending] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const observerTarget = useRef(null);

  // Load pending assets
  const loadPendingAssets = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getPendingAssets({
        page: pageNum,
        limit: 20
      });

      if (response.success && response.data) {
        const backendAssets = response.data.assets || response.data.data?.assets || [];
        const total = response.data.total || response.data.data?.total || 0;

        // Transform assets
        const transformedAssets = backendAssets.map(asset => ({
          id: asset.id,
          title: asset.title,
          description: asset.description,
          category: asset.category?.name || 'Unknown',
          thumbnail: asset.thumbnailUrl || 
                    (Array.isArray(asset.imageUrls) && asset.imageUrls[0]) ||
                    null,
          author: {
            name: asset.user?.username || 'Unknown',
            avatarUrl: asset.user?.avatarUrl || null
          },
          uploadedAt: new Date(asset.createdAt).toLocaleDateString('pt-BR'),
          fileSize: formatFileSize(asset.fileSize),
          downloads: asset._count?.downloads || asset.downloadCount || 0,
          tags: asset.tags || [],
          imageUrls: asset.imageUrls || [],
          downloadUrl: asset.downloadUrl || asset.fileUrl
        }));

        if (pageNum === 1) {
          setAssets(transformedAssets);
        } else {
          setAssets(prev => [...prev, ...transformedAssets]);
        }

        setTotalPending(total);
        setHasMore(transformedAssets.length === 20);
      }
    } catch (error) {
      console.error('Load pending assets error:', error);
      toast.error('Failed to load pending assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingAssets(1);
  }, [loadPendingAssets]);

  // Debug: Monitor assets array changes
  useEffect(() => {
    console.log('[Admin] Assets array updated. Count:', assets.length);
    if (assets.length > 0) {
      console.log('[Admin] Asset IDs:', assets.map(a => a.id).join(', '));
    }
  }, [assets]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPendingAssets(nextPage);
  }, [loading, hasMore, page, loadPendingAssets]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMore]);

  // Select/deselect asset
  const toggleSelect = useCallback((assetId) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  }, []);

  // Select all
  const toggleSelectAll = useCallback(() => {
    if (selectedAssets.size === assets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assets.map(a => a.id)));
    }
  }, [selectedAssets.size, assets]);

  // Approve single asset
  const handleApprove = useCallback(async (assetId) => {
    setProcessingIds(prev => new Set(prev).add(assetId));
    try {
      await adminService.approveAsset(assetId);
      toast.success('Asset approved successfully');
      
      // Remove from list immediately (optimistic update)
      setAssets(prev => {
        const filtered = prev.filter(a => a.id !== assetId);
        console.log(`[Admin] Removed asset ${assetId}. Before: ${prev.length}, After: ${filtered.length}`);
        return filtered;
      });
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
      setTotalPending(prev => Math.max(0, prev - 1));
      
      // Optional: Reload from server to ensure consistency
      // Uncomment if you want to force refresh after approval
      // setTimeout(() => {
      //   setPage(1);
      //   loadPendingAssets(1);
      // }, 500);
      
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve asset');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  }, []);

  // Reject single asset
  const handleReject = useCallback(async (assetId) => {
    setProcessingIds(prev => new Set(prev).add(assetId));
    try {
      await adminService.rejectAsset(assetId);
      toast.success('Asset rejected');
      
      // Remove from list
      setAssets(prev => {
        const filtered = prev.filter(a => a.id !== assetId);
        console.log(`[Admin] Removed asset ${assetId}. Before: ${prev.length}, After: ${filtered.length}`);
        return filtered;
      });
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
      setTotalPending(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject asset');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  }, []);

  // Batch approve
  const handleBatchApprove = useCallback(async () => {
    if (selectedAssets.size === 0) return;
    
    const ids = Array.from(selectedAssets);
    setProcessingIds(new Set(ids));
    
    try {
      const result = await adminService.batchApproveAssets(ids);
      toast.success(`Approved ${result.data.successful} of ${result.data.total} assets`);
      
      // Remove approved assets from list
      setAssets(prev => {
        const filtered = prev.filter(a => !selectedAssets.has(a.id));
        console.log(`[Admin] Batch approved ${ids.length} assets. Before: ${prev.length}, After: ${filtered.length}`);
        console.log('[Admin] Removed IDs:', ids);
        return filtered;
      });
      setSelectedAssets(new Set());
      setTotalPending(prev => Math.max(0, prev - result.data.successful));
    } catch (error) {
      console.error('Batch approve error:', error);
      toast.error('Failed to approve selected assets');
    } finally {
      setProcessingIds(new Set());
    }
  }, [selectedAssets]);

  // Batch reject
  const handleBatchReject = useCallback(async () => {
    if (selectedAssets.size === 0) return;
    
    const ids = Array.from(selectedAssets);
    setProcessingIds(new Set(ids));
    
    try {
      const result = await adminService.batchRejectAssets(ids);
      toast.success(`Rejected ${result.data.successful} of ${result.data.total} assets`);
      
      // Remove rejected assets from list
      setAssets(prev => prev.filter(a => !selectedAssets.has(a.id)));
      setSelectedAssets(new Set());
      setTotalPending(prev => Math.max(0, prev - result.data.successful));
    } catch (error) {
      console.error('Batch reject error:', error);
      toast.error('Failed to reject selected assets');
    } finally {
      setProcessingIds(new Set());
    }
  }, [selectedAssets]);

  // View asset details
  const handleViewDetails = useCallback((asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="animate-spin text-theme-active" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-surface-float border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Pending Approvals</h3>
            <p className="text-sm text-text-secondary">
              {totalPending} asset{totalPending !== 1 ? 's' : ''} waiting for review
            </p>
          </div>
          
          {selectedAssets.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {selectedAssets.size} selected
              </span>
              <button
                onClick={handleBatchApprove}
                className="btn btn-success btn-sm"
                disabled={processingIds.size > 0}
              >
                <CheckCircle size={14} />
                Approve All
              </button>
              <button
                onClick={handleBatchReject}
                className="btn btn-danger btn-sm"
                disabled={processingIds.size > 0}
              >
                <X size={14} />
                Reject All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Select All */}
      {assets.length > 0 && (
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            checked={selectedAssets.size === assets.length && assets.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-white/20 bg-surface-float2 text-theme-active focus:ring-2 focus:ring-theme-active"
          />
          <label className="text-sm text-text-secondary cursor-pointer" onClick={toggleSelectAll}>
            Select All ({assets.length})
          </label>
        </div>
      )}

      {/* Assets List */}
      {assets.length === 0 ? (
        <div className="bg-surface-float border border-white/10 rounded-xl p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-text-tertiary" />
          <h3 className="text-lg font-semibold mb-2">No Pending Assets</h3>
          <p className="text-text-secondary">
            All assets have been reviewed. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map(asset => {
            const isSelected = selectedAssets.has(asset.id);
            const isProcessing = processingIds.has(asset.id);

            return (
              <article
                key={asset.id}
                className={`bg-surface-float border rounded-xl p-4 transition-all ${
                  isSelected ? 'border-theme-active' : 'border-white/10'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ contain: 'layout style paint' }}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(asset.id)}
                      disabled={isProcessing}
                      className="w-5 h-5 rounded border-white/20 bg-surface-float2 text-theme-active focus:ring-2 focus:ring-theme-active"
                    />
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={asset.thumbnail || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
                      alt={asset.title}
                      onError={handleImageError}
                      className="w-32 h-24 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold mb-1 truncate">
                      {asset.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {asset.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
                      <div className="flex items-center gap-1.5">
                        <User size={12} />
                        <span>{asset.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{asset.uploadedAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package size={12} />
                        <span>{asset.fileSize}</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-theme-active/10 text-theme-active">
                        {asset.category}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => handleViewDetails(asset)}
                      className="btn btn-secondary btn-sm"
                      disabled={isProcessing}
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => handleApprove(asset.id)}
                      className="btn btn-success btn-sm"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(asset.id)}
                      className="btn btn-danger btn-sm"
                      disabled={isProcessing}
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Loading More */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="py-8 text-center">
          <Loader size={24} className="animate-spin text-theme-active mx-auto" />
        </div>
      )}

      {/* Asset Detail Modal */}
      {showDetailModal && selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default PendingAssetsTab;
