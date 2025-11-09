import React, { useState, useCallback, useRef } from 'react';
import { 
  Package, CheckCircle, AlertTriangle, Eye, 
  Check, X, Download, Calendar, User, Loader,
  Filter, TrendingUp, Clock
} from 'lucide-react';
import { DataTable, StatsCard, FilterBar, StatusBadge } from '../shared';
import adminService from '../../../services/adminService';
import { handleImageError } from '../../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../../constants';
import AssetDetailModal from '../../assets/AssetDetailModal';
import toast from 'react-hot-toast';

/**
 * AssetsSubtab - Gerenciamento de assets
 * Sub-subtabs: All Assets, Pending Approval, Flagged Assets
 */
const AssetsSubtab = () => {
  const [activeSubtab, setActiveSubtab] = useState('pending');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    flagged: 0
  });

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await adminService.getAssetStats();
      if (response.success && response.data) {
        setStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          approved: response.data.approved || 0,
          flagged: (response.data.rejected || 0) + (response.data.inactive || 0)
        });
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, []);

  // Load on mount
  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Render content based on subtab
  const renderContent = () => {
    switch (activeSubtab) {
      case 'all':
        return <AllAssetsView onStatsUpdate={loadStats} />;
      case 'pending':
        return <PendingApprovalView onStatsUpdate={loadStats} />;
      case 'flagged':
        return <FlaggedAssetsView onStatsUpdate={loadStats} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Assets"
          value={stats.total.toLocaleString()}
          icon={Package}
          trend={{ value: '+45', direction: 'up' }}
          subtitle="all time"
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pending.toLocaleString()}
          icon={Clock}
          trend={{ value: stats.pending > 10 ? 'High' : 'Normal', direction: stats.pending > 10 ? 'up' : 'neutral' }}
          subtitle="awaiting review"
        />
        <StatsCard
          title="Approved"
          value={stats.approved.toLocaleString()}
          icon={CheckCircle}
          trend={{ value: '+12%', direction: 'up' }}
          subtitle="this month"
        />
        <StatsCard
          title="Flagged"
          value={stats.flagged.toLocaleString()}
          icon={AlertTriangle}
          trend={{ value: stats.flagged > 0 ? 'Needs attention' : 'None', direction: stats.flagged > 0 ? 'up' : 'neutral' }}
          subtitle="reported"
        />
      </div>

      {/* Sub-subtabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
        {[
          { id: 'pending', label: 'Pending Approval', icon: Clock, count: stats.pending },
          { id: 'all', label: 'All Assets', icon: Package, count: stats.total },
          { id: 'flagged', label: 'Flagged Assets', icon: AlertTriangle, count: stats.flagged }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubtab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
                ${isActive 
                  ? 'text-theme-active border-b-2 border-theme-active' 
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-theme-active/20 text-theme-active' : 'bg-white/10 text-text-tertiary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

// ============================================
// PENDING APPROVAL VIEW
// ============================================

const PendingApprovalView = React.memo(({ onStatsUpdate }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const observerTarget = useRef(null);

  // Load pending assets
  const loadAssets = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getPendingAssets({
        page: pageNum,
        limit: 20
      });

      if (response.success) {
        const newAssets = response.data.assets || [];
        
        if (pageNum === 1) {
          setAssets(newAssets);
        } else {
          setAssets(prev => [...prev, ...newAssets]);
        }
        
        setHasMore(newAssets.length === 20);
      }
    } catch (error) {
      console.error('Load assets error:', error);
      toast.error('Failed to load pending assets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  React.useEffect(() => {
    loadAssets(1);
  }, [loadAssets]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadAssets(nextPage);
  }, [loading, hasMore, page, loadAssets]);

  React.useEffect(() => {
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

  // Approve asset
  const handleApprove = useCallback(async (asset) => {
    setProcessingIds(prev => new Set(prev).add(asset.id));
    try {
      await adminService.approveAsset(asset.id);
      toast.success(`${asset.title} approved`);
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      setSelectedAssets(prev => prev.filter(id => id !== asset.id));
      onStatsUpdate?.();
    } catch (error) {
      toast.error('Failed to approve asset');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });
    }
  }, [onStatsUpdate]);

  // Reject asset
  const handleReject = useCallback(async (asset) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    setProcessingIds(prev => new Set(prev).add(asset.id));
    try {
      await adminService.rejectAsset(asset.id, reason);
      toast.success(`${asset.title} rejected`);
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      setSelectedAssets(prev => prev.filter(id => id !== asset.id));
      onStatsUpdate?.();
    } catch (error) {
      toast.error('Failed to reject asset');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });
    }
  }, [onStatsUpdate]);

  // Batch approve
  const handleBatchApprove = useCallback(async () => {
    if (!confirm(`Approve ${selectedAssets.length} assets?`)) return;

    setProcessingIds(new Set(selectedAssets));
    try {
      await adminService.batchApproveAssets(selectedAssets);
      toast.success(`Approved ${selectedAssets.length} assets`);
      setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
      setSelectedAssets([]);
      onStatsUpdate?.();
    } catch (error) {
      toast.error('Failed to approve assets');
    } finally {
      setProcessingIds(new Set());
    }
  }, [selectedAssets, onStatsUpdate]);

  // Batch reject
  const handleBatchReject = useCallback(async () => {
    if (!confirm(`Reject ${selectedAssets.length} assets?`)) return;

    setProcessingIds(new Set(selectedAssets));
    try {
      await adminService.batchRejectAssets(selectedAssets);
      toast.success(`Rejected ${selectedAssets.length} assets`);
      setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
      setSelectedAssets([]);
      onStatsUpdate?.();
    } catch (error) {
      toast.error('Failed to reject assets');
    } finally {
      setProcessingIds(new Set());
    }
  }, [selectedAssets, onStatsUpdate]);

  // View details
  const handleViewDetails = useCallback((asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  }, []);

  // Table columns
  const columns = React.useMemo(() => [
    {
      key: 'asset',
      label: 'Asset',
      width: 'w-80',
      render: (asset) => (
        <div className="flex items-center gap-3">
          <img
            src={asset.thumbnailUrl || asset.imageUrls?.[0] || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
            alt={asset.title}
            onError={handleImageError}
            className="w-20 h-16 rounded-lg object-cover"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary truncate">
              {asset.title}
            </p>
            <p className="text-xs text-text-secondary line-clamp-1">
              {asset.description}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (asset) => (
        <div className="flex items-center gap-2">
          <img
            src={asset.user?.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
            alt={asset.user?.username}
            onError={handleImageError}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm">{asset.user?.username || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (asset) => (
        <StatusBadge type="CATEGORY" size="sm" label={asset.category?.name || 'Unknown'} />
      )
    },
    {
      key: 'submitted',
      label: 'Submitted',
      sortable: true,
      render: (asset) => (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-text-tertiary mt-1">
            {formatRelativeTime(asset.createdAt)}
          </p>
        </div>
      )
    }
  ], []);

  // Table actions
  const actions = React.useMemo(() => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleViewDetails
    },
    {
      label: 'Approve',
      icon: Check,
      onClick: handleApprove,
      variant: 'success',
      disabled: (asset) => processingIds.has(asset.id)
    },
    {
      label: 'Reject',
      icon: X,
      onClick: handleReject,
      variant: 'danger',
      disabled: (asset) => processingIds.has(asset.id)
    }
  ], [handleViewDetails, handleApprove, handleReject, processingIds]);

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className="bg-surface-float border border-white/10 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {selectedAssets.length} asset(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 
                       hover:bg-green-600/30 rounded-lg text-sm font-medium transition-all"
            >
              <CheckCircle size={16} />
              Approve Selected
            </button>
            <button
              onClick={handleBatchReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 
                       hover:bg-red-600/30 rounded-lg text-sm font-medium transition-all"
            >
              <X size={16} />
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={assets}
        loading={loading}
        selectable
        selectedRows={selectedAssets}
        onSelectionChange={setSelectedAssets}
        actions={actions}
        emptyState={
          <>
            <CheckCircle size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-lg font-semibold text-text-primary mb-2">All caught up!</p>
            <p className="text-text-secondary">No assets pending approval</p>
          </>
        }
      />

      {/* Infinite scroll trigger */}
      {hasMore && !loading && <div ref={observerTarget} className="h-4" />}

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
});

PendingApprovalView.displayName = 'PendingApprovalView';

// ============================================
// ALL ASSETS VIEW
// ============================================

const AllAssetsView = React.memo(({ onStatsUpdate }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    status: null,
    sortBy: 'newest'
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Load all assets
  const loadAssets = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getAssets({
        page: pageNum,
        limit: 20,
        search: filters.search,
        category: filters.category,
        status: filters.status,
        sortBy: filters.sortBy
      });

      if (response.success) {
        const newAssets = response.data.assets || response.data.data || [];
        
        if (pageNum === 1) {
          setAssets(newAssets);
        } else {
          setAssets(prev => [...prev, ...newAssets]);
        }
        
        setHasMore(newAssets.length === 20);
      }
    } catch (error) {
      console.error('Load assets error:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load on mount and filter change
  React.useEffect(() => {
    setPage(1);
    loadAssets(1);
  }, [loadAssets]);

  // Filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: null,
      status: null,
      sortBy: 'newest'
    });
  }, []);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadAssets(nextPage);
  }, [loading, hasMore, page, loadAssets]);

  React.useEffect(() => {
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

  // Filter configs
  const filterConfigs = React.useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      icon: Filter,
      options: [
        { value: 'approved', label: 'Approved' },
        { value: 'pending', label: 'Pending' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      icon: TrendingUp,
      options: [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'downloads', label: 'Most Downloads' }
      ]
    }
  ], []);

  // Table columns
  const columns = React.useMemo(() => [
    {
      key: 'asset',
      label: 'Asset',
      width: 'w-80',
      render: (asset) => (
        <div className="flex items-center gap-3">
          <img
            src={asset.thumbnailUrl || asset.imageUrls?.[0] || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
            alt={asset.title}
            onError={handleImageError}
            className="w-20 h-16 rounded-lg object-cover"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary truncate">
              {asset.title}
            </p>
            <p className="text-xs text-text-secondary line-clamp-1">
              {asset.description}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (asset) => (
        <span className="text-sm">{asset.user?.username || 'Unknown'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (asset) => (
        <StatusBadge 
          type={asset.isApproved ? 'APPROVED' : asset.isApproved === false ? 'REJECTED' : 'PENDING'} 
          size="sm" 
        />
      )
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (asset) => (
        <div className="flex gap-3 text-xs text-text-tertiary">
          <div className="flex items-center gap-1" title="Downloads">
            <Download size={12} />
            <span>{asset._count?.downloads || asset.downloadCount || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'created',
      label: 'Created',
      sortable: true,
      render: (asset) => (
        <div className="text-xs text-text-secondary">
          {new Date(asset.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ], []);

  // Table actions
  const actions = React.useMemo(() => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (asset) => window.open(`/assets/${asset.id}`, '_blank')
    }
  ], []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search assets..."
        onSearchChange={(value) => handleFilterChange('search', value)}
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={assets}
        loading={loading}
        actions={actions}
        emptyState={
          <>
            <Package size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-lg font-semibold text-text-primary mb-2">No assets found</p>
            <p className="text-text-secondary">Try adjusting your filters</p>
          </>
        }
      />

      {/* Infinite scroll trigger */}
      {hasMore && !loading && <div ref={observerTarget} className="h-4" />}
    </div>
  );
});

AllAssetsView.displayName = 'AllAssetsView';

// ============================================
// FLAGGED ASSETS VIEW
// ============================================

const FlaggedAssetsView = React.memo(() => {
  return (
    <div className="bg-surface-float border border-white/10 rounded-xl p-12 text-center">
      <AlertTriangle size={48} className="mx-auto mb-4 text-text-tertiary" />
      <h3 className="text-lg font-semibold mb-2">Flagged Assets</h3>
      <p className="text-text-secondary mb-6">
        Review and manage reported assets
      </p>
      <p className="text-sm text-text-tertiary">
        Coming soon...
      </p>
    </div>
  );
});

FlaggedAssetsView.displayName = 'FlaggedAssetsView';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default React.memo(AssetsSubtab);
