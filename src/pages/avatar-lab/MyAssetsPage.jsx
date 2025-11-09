import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AssetCard from '../../components/assets/AssetCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';
import { userService } from '../../services/userService';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { useOptimisticLoading } from '../../hooks/useOptimisticLoading';
import { CACHE_KEYS, CACHE_TTL } from '../../config/cache';
import { formatUploadDate } from '../../utils/dateUtils';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  Upload, 
  AlertCircle, 
  RefreshCw,
  ArrowUp,
  Download,
  Heart,
  FileText
} from 'lucide-react';

const MyAssetsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const observerTarget = useRef(null);
  const contentRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Query params based on filter
  // Para "My Assets": sempre buscar TODOS os assets (aprovados + não aprovados + ativos + inativos)
  // E filtrar client-side por statusFilter
  const queryParams = useMemo(() => {
    return {
      page,
      limit: 15,
      sortBy: sortBy,
      includeUnapproved: true, // ✅ Sempre true para pegar pending
      includeInactive: true     // ✅ Sempre true para pegar drafts
    };
  }, [page, sortBy]); // ✅ Removido statusFilter - não afeta query

  // Cache key - statusFilter NÃO afeta cache pois filtro é client-side
  const cacheKey = CACHE_KEYS.userAssets(user?.id, page, { sortBy });

  // Fetch data with cache
  const { 
    data: pageData, 
    loading: pageLoading, 
    error: pageError,
    isCached,
    refetch
  } = useCachedQuery(
    cacheKey,
    async () => {
      // NÃO passar userId - API usa req.user.id automaticamente
      const response = await userService.getUserAssets(null, queryParams);
      return response;
    },
    { 
      ttl: CACHE_TTL.USER_ASSETS,
      enabled: !!user?.id
    }
  );

  // Optimistic loading
  const shouldShowSkeleton = useOptimisticLoading(
    pageLoading && page === 1 && assets.length === 0, 
    isCached, 
    150
  );

  // Helper functions - DEVEM estar antes do useMemo que as usa
  const getAssetStatus = useCallback((asset) => {
    if (!asset.isApproved) return 'pending';
    if (!asset.isActive) return 'draft';
    return 'published';
  }, []);

  // Memoizar transformação de assets - PERFORMANCE: Evita processamento desnecessário
  // Backend envia TODOS os assets (approved + unapproved + active + inactive)
  // Filtro client-side por statusFilter para tabs Published/Pending/Drafts
  const transformedAssets = useMemo(() => {
    if (!pageData?.success || !pageData?.data) return [];

    const backendAssets = pageData.data.assets || [];

    // Transform assets - Backend já normaliza: tags, imageUrls, thumbnailUrl
    const transformed = backendAssets.map(asset => ({
      id: asset.id,
      title: asset.title,
      description: asset.description,
      category: asset.category?.name || 'Unknown',
      thumbnail: asset.thumbnailUrl || (asset.imageUrls?.[0]) || null,
      thumbnailUrl: asset.thumbnailUrl,
      imageUrls: asset.imageUrls || [],
      author: {
        name: user?.username || 'You',
        avatarUrl: user?.avatarUrl || null
      },
      uploadedAt: formatUploadDate(asset.createdAt),
      likes: asset._count?.favorites || asset.favoritesCount || 0,
      downloads: asset._count?.downloads || asset.downloadCount || 0,
      comments: asset._count?.reviews || asset.reviewsCount || 0,
      tags: asset.tags || [],
      isLiked: asset.isLiked || false,
      averageRating: asset.averageRating || 0,
      isApproved: asset.isApproved,
      isActive: asset.isActive,
      status: getAssetStatus(asset)
    }));

    // ✅ Filtro client-side baseado em statusFilter
    return transformed.filter(asset => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'published') return asset.isApproved && asset.isActive;
      if (statusFilter === 'pending') return !asset.isApproved;
      if (statusFilter === 'drafts') return !asset.isActive;
      return true;
    });
  }, [pageData, user, getAssetStatus, statusFilter]); // ✅ Adicionado statusFilter

  // Process data
  useEffect(() => {
    if (transformedAssets.length === 0) {
      setHasProcessedData(false);
      return;
    }

    const total = pageData?.data?.total || 0;

    if (page === 1) {
      setAssets(transformedAssets);
      // ⚠️ hasMore baseado no backend total (não no filtrado)
      // Pode carregar páginas extras mas garante que não perca dados
      setHasMore(total > 15);
    } else {
      setAssets(prev => {
        const newAssets = [...prev, ...transformedAssets];
        setHasMore(newAssets.length < total);
        return newAssets;
      });
    }

    setTotalAssets(total);
    setHasProcessedData(true);

    if (import.meta.env.DEV) {
      console.log(`[MyAssets] ${isCached ? 'HIT' : 'MISS'} - Page ${page}, ${statusFilter}, ${sortBy}`);
    }
  }, [transformedAssets, page, isCached, pageData, statusFilter, sortBy]); // ✅ Removido assets.length

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        setShowScrollTop(mainElement.scrollTop > 500);
      }
    };

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'auto' }); // ✅ auto para evitar input lag
    }
  }, []);

  const retryFetch = useCallback(() => {
    setPage(1);
    setAssets([]);
    refetch();
  }, [refetch]);

  const loadMoreAssets = useCallback(() => {
    if (pageLoading || !hasMore) return;
    setPage(prev => prev + 1);
  }, [pageLoading, hasMore]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !pageLoading) loadMoreAssets();
      },
      { threshold: 0.1 }
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      observer.disconnect(); // ✅ Mais seguro que unobserve
    };
  }, [loadMoreAssets, hasMore, pageLoading]);

  // Filter/sort options
  const statusOptions = [
    { value: 'all', label: 'All', icon: FolderOpen },
    { value: 'published', label: 'Published', icon: CheckCircle },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'drafts', label: 'Drafts', icon: FileText },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'oldest', label: 'Oldest', icon: Clock },
    { value: 'downloads', label: 'Downloads', icon: Download },
    { value: 'likes', label: 'Likes', icon: Heart },
  ];

  const handleStatusChange = useCallback((newStatus) => {
    if (newStatus !== statusFilter) {
      setStatusFilter(newStatus);
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'auto' });
      setPage(1);
      setAssets([]); // ✅ Limpar assets para forçar re-render com novo filtro
    }
  }, [statusFilter]);

  const handleSortChange = useCallback((newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'auto' });
      setPage(1);
      // ✅ Removido setHasProcessedData(false) - skeleton aparece naturalmente
    }
  }, [sortBy]);

  // Stats calculation - Single-pass com reduce para performance
  const stats = useMemo(() => {
    return assets.reduce((acc, asset) => {
      acc.all++;
      if (asset.status === 'published') acc.published++;
      else if (asset.status === 'pending') acc.pending++;
      else if (asset.status === 'draft') acc.drafts++;
      return acc;
    }, { all: 0, published: 0, pending: 0, drafts: 0 });
  }, [assets]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-[1600px] mx-auto" ref={contentRef}>
      {/* Progress Bar */}
      {pageLoading && page === 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-bar"
            style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4">
        <Breadcrumb items={[{ label: t('sidebar.myAssets'), path: '/my-assets' }]} />
      </div>

      {/* Filters - Sticky */}
      <div 
        className="sticky top-0 z-10 bg-surface-base px-3 sm:px-4 lg:px-6 py-3 border-b border-white/5"
        style={{ contain: 'layout style' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Status */}
          <div className="flex gap-1">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const count = stats[option.value];
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${statusFilter === option.value 
                      ? 'bg-theme-active text-white' 
                      : 'bg-surface-float text-text-secondary hover:bg-surface-float2 hover:text-text-primary'}
                  `}
                >
                  <Icon size={14} />
                  {option.label}
                  {count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-white/10">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Sort:</span>
            <div className="flex gap-1">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all
                      ${sortBy === option.value 
                        ? 'bg-surface-float2 text-text-primary' 
                        : 'text-text-tertiary hover:text-text-primary hover:bg-surface-float'}
                    `}
                  >
                    <Icon size={12} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {!pageLoading && !pageError && assets.length > 0 && (
          <div className="mt-2 text-xs text-text-tertiary">
            {assets.length} {totalAssets > 0 && `/ ${totalAssets}`} {assets.length === 1 ? 'asset' : 'assets'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 relative">
        {/* Skeleton */}
        {shouldShowSkeleton && assets.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="rounded-xl border border-white/5 bg-surface-float overflow-hidden"
                style={{
                  opacity: 0.7,
                  animation: `stagger-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s backwards`,
                }}
              >
                <div className="relative h-40 bg-surface-float2 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-smooth"
                    style={{ transform: 'translateX(-100%)' }}
                  />
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-surface-float2 rounded w-3/4" />
                  <div className="h-2 bg-surface-float2 rounded w-full" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-2 bg-surface-float2 rounded w-12" />
                    <div className="h-2 bg-surface-float2 rounded w-12" />
                    <div className="h-2 bg-surface-float2 rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {pageError && !pageLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              We couldn't load your assets. Please try again.
            </p>
            <button
              onClick={retryFetch}
              className="flex items-center gap-2 px-4 py-2 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!pageLoading && !pageError && assets.length === 0 && hasProcessedData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface-float flex items-center justify-center mb-4">
              <Upload size={40} className="text-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              {statusFilter === 'all' && "You haven't uploaded any assets yet. Start creating!"}
              {statusFilter === 'published' && "No published assets. Upload and get approved!"}
              {statusFilter === 'pending' && "No pending assets. All your assets are reviewed!"}
              {statusFilter === 'drafts' && "No drafts. All your assets are active!"}
            </p>
            {statusFilter === 'all' && (
              <button 
                onClick={() => navigate('/new-asset')}
                className="px-6 py-2.5 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors font-medium"
              >
                Upload Your First Asset
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!pageLoading && !pageError && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="animate-stagger-in"
                  style={{
                    animationDelay: `${Math.min(index * 30, 500)}ms`,
                    opacity: 0,
                    animationFillMode: 'forwards'
                  }}
                >
                  <AssetCard asset={asset} showStatus />
                </div>
              ))}
            </div>
            
            {/* Infinite scroll */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {pageLoading && page > 1 && hasProcessedData && (
                <div className="flex items-center gap-2 text-text-tertiary">
                  <div className="w-5 h-5 border-2 border-theme-active border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasMore && assets.length > 0 && (
                <p className="text-text-tertiary text-sm">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Scroll Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-theme-active text-white rounded-full shadow-lg hover:bg-theme-hover transition-all hover:scale-110 z-20"
          aria-label="Scroll to top"
          style={{
            contain: 'layout style paint',
            willChange: 'transform',
            transform: 'translateZ(0)', // ✅ GPU acceleration
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default MyAssetsPage;
