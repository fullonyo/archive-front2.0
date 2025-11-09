import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AssetCard from '../../components/assets/AssetCard';
import MasonryGrid from '../../components/assets/MasonryGrid';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';
import { assetService } from '../../services/assetService';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { useOptimisticLoading } from '../../hooks/useOptimisticLoading';
import { CACHE_KEYS, CACHE_TTL } from '../../config/cache';
import { TrendingUp, Clock, Sparkles, ArrowUp, AlertCircle, Upload, RefreshCw, Grid3x3, LayoutGrid } from 'lucide-react';
import { formatUploadDate } from '../../utils/dateUtils';

const ForYouPage = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState(() => {
    // Persistir preferência no localStorage
    return localStorage.getItem('forYou_viewMode') || 'masonry';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const observerTarget = useRef(null);
  const contentRef = useRef(null);

  // Cache key para a p�gina atual
  const cacheKey = CACHE_KEYS.assetsList(page, { sortBy });

  // Usar cache query para a p�gina atual
  const { 
    data: pageData, 
    loading: pageLoading, 
    error: pageError,
    isCached,
    refetch
  } = useCachedQuery(
    cacheKey,
    async () => {
      const response = await assetService.getAssets({
        page,
        limit: 15,
        sort: sortBy
      });
      return response;
    },
    { 
      ttl: CACHE_TTL.ASSETS_LIST,
      enabled: true
    }
  );

  // Optimistic loading - só mostra skeleton se demorar mais que 150ms
  const shouldShowSkeleton = useOptimisticLoading(pageLoading && page === 1, isCached, 150);

  // Memoizar transformação de assets - PERFORMANCE: Evita processamento desnecessário
  const transformedAssets = useMemo(() => {
    if (!pageData?.success || !pageData?.data) return [];

    const backendAssets = pageData.data.assets || pageData.data.data?.assets || [];
    
    // Transformar para o formato do frontend
    // Backend já normaliza: tags, imageUrls, thumbnailUrl (todos com proxy)
    return backendAssets.map(asset => ({
      id: asset.id,
      title: asset.title,
      description: asset.description,
      category: asset.category?.name || 'Unknown',
      thumbnail: asset.thumbnailUrl || (asset.imageUrls?.[0]) || null,
      thumbnailUrl: asset.thumbnailUrl,
      imageUrls: asset.imageUrls || [],
      author: {
        id: asset.user?.id,
        name: asset.user?.username || 'Unknown',
        username: asset.user?.username || 'Unknown',
        avatarUrl: asset.user?.avatarUrl || null
      },
      uploadedAt: formatUploadDate(asset.createdAt),
      likes: asset._count?.favorites || asset.favoritesCount || 0,
      downloads: asset._count?.downloads || asset.downloadCount || 0,
      comments: asset._count?.reviews || asset.reviewsCount || 0,
      tags: asset.tags || [],
      isLiked: asset.isLiked || false,
      averageRating: asset.averageRating || 0
    }));
  }, [pageData]);

  // Processar dados quando transformedAssets mudar
  useEffect(() => {
    if (transformedAssets.length === 0) {
      setHasProcessedData(false);
      return;
    }

    const total = pageData?.data?.total || pageData?.data?.data?.total || 0;

    if (page === 1) {
      setAssets(transformedAssets);
    } else {
      setAssets(prev => [...prev, ...transformedAssets]);
    }

    setTotalAssets(total);
    setHasMore(transformedAssets.length === 15 && assets.length + transformedAssets.length < total);
    setHasProcessedData(true);

    // Log cache status em dev
    if (import.meta.env.DEV) {
      console.log(`[ForYouPage] ${isCached ? 'Cache HIT' : 'Cache MISS'} - Page ${page}, Sort: ${sortBy}`);
    }
  }, [transformedAssets, page, sortBy, isCached, pageData, assets.length]);

  // Scroll to top button visibility
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
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
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

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !pageLoading) loadMoreAssets();
    }, { threshold: 0.1 });
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loadMoreAssets, hasMore, pageLoading]);

  const sortOptions = [
    { value: 'latest', label: t('forYou.latest'), icon: Clock },
    { value: 'trending', label: t('forYou.trending'), icon: TrendingUp },
    { value: 'popular', label: t('forYou.popular'), icon: Sparkles },
  ];

  // Handle sort change - Optimistic UI (keep old data visible)
  const handleSortChange = useCallback((newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
      
      // Scroll to top before loading
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'auto' });
      }
      
      // Reset page and processed flag
      // CRITICAL: DON'T clear assets - keep old data visible during transition
      setPage(1);
      setHasProcessedData(false);
    }
  }, [sortBy]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem('forYou_viewMode', mode);
    
    // Log em dev
    if (import.meta.env.DEV) {
      console.log(`[ForYouPage] View mode changed to: ${mode}`);
    }
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto" ref={contentRef}>
      {/* Loading Progress Bar - Top */}
      {pageLoading && page === 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-bar"
            style={{
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4">
        <Breadcrumb
          items={[
            { label: t('forYou.title'), path: '/for-you' }
          ]}
        />
      </div>

      {/* Compact Sort Bar - Sticky */}
      <div 
        className="sticky top-0 z-10 bg-surface-base px-3 sm:px-4 lg:px-6 py-3 border-b border-white/5"
        style={{ contain: 'layout style' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Sort Options */}
          <div className="flex gap-1">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${sortBy === option.value 
                      ? 'bg-theme-active text-white' 
                      : 'bg-surface-float text-text-secondary hover:bg-surface-float2 hover:text-text-primary'}
                  `}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
          
          {/* Right: View Mode Toggle + Asset Count */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-surface-float rounded-md p-0.5">
              <button
                onClick={() => handleViewModeChange('masonry')}
                className={`
                  p-1.5 rounded transition-all
                  ${viewMode === 'masonry' 
                    ? 'bg-theme-active text-white' 
                    : 'text-text-secondary hover:text-text-primary'}
                `}
                title="Masonry view"
                aria-label="Switch to masonry view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`
                  p-1.5 rounded transition-all
                  ${viewMode === 'grid' 
                    ? 'bg-theme-active text-white' 
                    : 'text-text-secondary hover:text-text-primary'}
                `}
                title="Grid view"
                aria-label="Switch to grid view"
              >
                <Grid3x3 size={16} />
              </button>
            </div>

            {/* Asset Count */}
            {!pageLoading && !pageError && assets.length > 0 && (
              <span className="text-xs text-text-tertiary">
                {assets.length} {totalAssets > 0 && `/ ${totalAssets}`} {assets.length === 1 ? t('forYou.asset') : t('forYou.assets')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Area with padding */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 relative">
        {/* Modern Skeleton Loading - Only show if not cached and takes > 150ms */}
        {shouldShowSkeleton && (
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

        {/* Error State */}
        {pageError && !pageLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              We couldn't load the assets. Please check your connection and try again.
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

        {/* Empty State - Only show after data processing */}
        {!pageLoading && !pageError && assets.length === 0 && hasProcessedData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface-float flex items-center justify-center mb-4">
              <Upload size={40} className="text-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('forYou.noAssets')}</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              {t('forYou.noAssetsDescription')}
            </p>
            <button className="px-6 py-2.5 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors font-medium">
              {t('forYou.uploadAsset')}
            </button>
          </div>
        )}

        {/* Assets Grid with Staggered Animation */}
        {!pageLoading && !pageError && assets.length > 0 && (
          <>
            {/* Render baseado no viewMode */}
            {viewMode === 'masonry' ? (
              <MasonryGrid assets={assets} loading={false} />
            ) : (
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
            )}
            
            <div ref={observerTarget} className="py-8 flex justify-center">
              {pageLoading && page > 1 && (
                <div className="flex items-center gap-2 text-text-tertiary">
                  <div className="w-5 h-5 border-2 border-theme-active border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">{t('forYou.loadingMore')}</span>
                </div>
              )}
              {!hasMore && assets.length > 0 && (
                <p className="text-text-tertiary text-sm">{t('forYou.reachedEnd')}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-theme-active text-white rounded-full shadow-lg hover:bg-theme-hover transition-all hover:scale-110 z-20"
          aria-label="Scroll to top"
          style={{
            contain: 'layout style paint',
            willChange: 'transform',
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default ForYouPage;
