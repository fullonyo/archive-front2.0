import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssetCard from '../../components/assets/AssetCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { useOptimisticLoading } from '../../hooks/useOptimisticLoading';
import { assetService } from '../../services/assetService';
import { formatUploadDate } from '../../utils/dateUtils';
import { ASSET_SORT_OPTIONS } from '../../constants/sortOptions';
import { CACHE_KEYS, CACHE_TTL } from '../../config/cache';
import { 
  ASSETS_PER_PAGE, 
  MAX_PAGES, 
  SCROLL_TOP_THRESHOLD, 
  INFINITE_SCROLL_THRESHOLD 
} from '../../constants/pagination';
import { ArrowUp, AlertCircle, Upload, RefreshCw, Package } from 'lucide-react';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [assets, setAssets] = useState([]);
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const observerTarget = useRef(null);

  // Cache key para a página atual
  const cacheKey = CACHE_KEYS.categoryAssets(id, page, { sortBy });

  // Usar cache query para a página atual
  const { 
    data: pageData, 
    loading, 
    error: fetchError,
    isCached,
    refetch
  } = useCachedQuery(
    cacheKey,
    async () => {
      const response = await assetService.getAssetsByCategory(id, {
        page,
        limit: ASSETS_PER_PAGE,
        sort: sortBy
      });
      return response;
    },
    { 
      ttl: CACHE_TTL.CATEGORY_ASSETS,
      enabled: true
    }
  );

  // Optimistic loading - só mostra skeleton se demorar mais que 150ms
  const shouldShowSkeleton = useOptimisticLoading(loading && page === 1, isCached, 150);

  const error = fetchError ? 'Failed to load assets' : null;

  // Process data when pageData changes (similar to ForYouPage pattern)
  useEffect(() => {
    if (!pageData?.success || !pageData?.data) {
      setHasProcessedData(false);
      return;
    }

    const categoryData = pageData.data.category;
    const backendAssets = pageData.data.assets || [];
    const pagination = pageData.data.pagination || {};
    const total = pagination.total || backendAssets.length;

    // Set category info once
    if (!category && categoryData) {
      setCategory(categoryData);
    }

    // Transform assets
    const transformedAssets = backendAssets.map(asset => {
      const thumbnail = asset.thumbnailUrl || 
                       (Array.isArray(asset.imageUrls) && asset.imageUrls[0]) ||
                       null;

      return {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        category: asset.category?.name || categoryData?.name || 'Unknown',
        thumbnail,
        thumbnailUrl: asset.thumbnailUrl, // Keep original for fallback
        imageUrls: asset.imageUrls || [], // IMPORTANTE: Passar array de imagens para galeria
        author: {
          name: asset.user?.username || 'Unknown',
          avatarUrl: asset.user?.avatarUrl || null
        },
        uploadedAt: formatUploadDate(asset.createdAt),
        likes: asset._count?.favorites || asset.favoritesCount || 0,
        downloads: asset._count?.downloads || asset.downloadCount || 0,
        comments: asset._count?.reviews || asset.reviewsCount || 0,
        tags: asset.tags || [],
        isLiked: asset.isLiked || false,
        averageRating: asset.averageRating || 0
      };
    });

    // Update assets based on page
    if (page === 1) {
      setAssets(transformedAssets);
      setHasMore(transformedAssets.length === ASSETS_PER_PAGE);
    } else {
      setAssets(prev => {
        const newAssets = [...prev, ...transformedAssets];
        setHasMore(transformedAssets.length === ASSETS_PER_PAGE && newAssets.length < total);
        return newAssets;
      });
    }

    setTotalAssets(total);
    setHasProcessedData(true);
  }, [pageData, page, category]); // ✅ Removed assets.length - calculated inside setState

  // Log cache status in development
  useEffect(() => {
    if (import.meta.env.DEV && pageData) {
      console.log(`[CategoryPage] ${isCached ? 'Cache HIT' : 'Cache MISS'} - Category ${id}, Page ${page}, Sort: ${sortBy}`);
    }
  }, [pageData, isCached, id, page, sortBy]);

  // Load more (infinite scroll) - simplified like ForYouPage
  const loadMore = useCallback(() => {
    if (loading || !hasMore || page >= MAX_PAGES) return;
    setPage(prev => prev + 1); // ✅ Just increment, useEffect handles fetch
  }, [loading, hasMore, page]);

  // Handle sort change - Optimistic UI (keep old data visible)
  const handleSortChange = useCallback((newSort) => {
    if (newSort === sortBy) return;
    
    // Scroll to top
    const mainContent = document.querySelector('main');
    mainContent?.scrollTo({ top: 0, behavior: 'auto' });
    
    // Reset state and change sort
    // CRITICAL: DON'T clear assets - keep old data visible during transition
    setSortBy(newSort);
    setPage(1);
    setHasMore(true);
    setHasProcessedData(false);
    // ✅ useEffect will detect sortBy change and refetch
  }, [sortBy]);

  // Retry fetch
  const retryFetch = useCallback(() => {
    setPage(1);
    setAssets([]);
    setHasMore(true);
    refetch(); // ✅ Use refetch from useCachedQuery (bypasses cache)
  }, [refetch]);

  // Scroll to top button
  const scrollToTop = useCallback(() => {
    const mainContent = document.querySelector('main');
    mainContent?.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Scroll tracking for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        setShowScrollTop(mainContent.scrollTop > SCROLL_TOP_THRESHOLD);
      }
    };

    const mainContent = document.querySelector('main');
    mainContent?.addEventListener('scroll', handleScroll);
    return () => mainContent?.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && page < MAX_PAGES) {
          loadMore();
        }
      },
      { threshold: INFINITE_SCROLL_THRESHOLD }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMore, hasMore, loading, page]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: category?.name || 'Category', path: null }
  ], [category?.name]);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Sticky Filter Bar */}
      <div 
        className="sticky top-0 z-10 bg-surface-base px-3 sm:px-4 lg:px-6 py-3 border-b border-white/5"
        style={{ contain: 'layout style' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            {ASSET_SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-theme-active text-white'
                      : 'bg-surface-float hover:bg-surface-float2 text-text-secondary'
                  }`}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-3 sm:px-4 lg:px-6 py-6 space-y-6 relative">
        {/* Category Header */}
        {category && !error && (
          <div className="bg-surface-float rounded-xl p-6 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Package size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-text-secondary text-sm mb-3">{category.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span>{totalAssets || category.assetCount || 0} assets</span>
                  {category.isActive !== false && (
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State (first load) - Only show if not cached and takes > 150ms */}
        {shouldShowSkeleton && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(ASSETS_PER_PAGE)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-float rounded-xl overflow-hidden border border-white/5"
                style={{
                  opacity: 0.7,
                  animation: `stagger-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s backwards`,
                }}
              >
                {/* Thumbnail skeleton with shimmer */}
                <div className="relative h-40 bg-surface-float2 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-smooth"
                    style={{
                      transform: 'translateX(-100%)',
                    }}
                  />
                </div>
                {/* Content skeleton */}
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-surface-float2 rounded w-3/4" />
                  <div className="h-3 bg-surface-float2 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              {error === 'Category not found' 
                ? "This category doesn't exist or has been removed."
                : "We couldn't load the assets. Please check your connection and try again."}
            </p>
            <div className="flex gap-3">
              {error === 'Category not found' ? (
                <button
                  onClick={() => navigate('/explore')}
                  className="px-4 py-2 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors"
                >
                  Back to Explore
                </button>
              ) : (
                <button
                  onClick={retryFetch}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State - Only show after data processing */}
        {!loading && !error && assets.length === 0 && hasProcessedData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface-float flex items-center justify-center mb-4">
              <Upload size={40} className="text-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              This category doesn't have any assets yet. Be the first to upload!
            </p>
            <button 
              onClick={() => navigate('/new-asset')}
              className="px-6 py-2.5 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors font-medium"
            >
              Upload Asset
            </button>
          </div>
        )}

        {/* Assets Grid with Staggered Animation */}
        {!loading && !error && assets.length > 0 && (
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
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {loading && page > 1 && (
                <div className="flex items-center gap-2 text-text-tertiary">
                  <div className="w-4 h-4 border-2 border-theme-active border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasMore && assets.length > 0 && (
                <p className="text-text-tertiary text-sm">
                  {page >= MAX_PAGES 
                    ? `Showing first ${MAX_PAGES * ASSETS_PER_PAGE} assets` 
                    : "You've reached the end"}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-theme-active hover:bg-theme-hover text-white rounded-full shadow-lg transition-all z-20"
          style={{
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default CategoryPage;
