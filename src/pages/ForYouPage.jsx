import { useState, useEffect, useRef, useCallback } from 'react';
import AssetCard from '../components/assets/AssetCard';
import Breadcrumb from '../components/common/Breadcrumb';
import { useTranslation } from '../hooks/useTranslation';
import { assetService } from '../services/assetService';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { CACHE_KEYS, CACHE_TTL } from '../config/cache';
import { TrendingUp, Clock, Sparkles, ArrowUp, AlertCircle, Upload, RefreshCw } from 'lucide-react';

const ForYouPage = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const observerTarget = useRef(null);
  const contentRef = useRef(null);

  // Cache key para a página atual
  const cacheKey = CACHE_KEYS.assetsList(page, { sortBy });

  // Usar cache query para a página atual
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

  // Processar dados quando pageData mudar
  useEffect(() => {
    if (!pageData?.success || !pageData?.data) return;

    const backendAssets = pageData.data.assets || pageData.data.data?.assets || [];
    const total = pageData.data.total || pageData.data.data?.total || 0;

    // Transformar para o formato do frontend
    const transformedAssets = backendAssets.map(asset => {
      const thumbnail = asset.thumbnailUrl || 
                       (Array.isArray(asset.imageUrls) && asset.imageUrls[0]) ||
                       null;

      return {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        category: asset.category?.name || 'Unknown',
        thumbnail,
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

    if (page === 1) {
      setAssets(transformedAssets);
    } else {
      setAssets(prev => [...prev, ...transformedAssets]);
    }

    setTotalAssets(total);
    setHasMore(transformedAssets.length === 15 && assets.length + transformedAssets.length < total);

    // Log cache status em dev
    if (import.meta.env.DEV) {
      console.log(`[ForYouPage] ${isCached ? 'Cache HIT' : 'Cache MISS'} - Page ${page}, Sort: ${sortBy}`);
    }
  }, [pageData, page, sortBy, isCached, assets.length]);

  // Formatar data de upload
  const formatUploadDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const uploaded = new Date(dateString);
    const diffMs = now - uploaded;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return uploaded.toLocaleDateString();
  };

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

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
      
      // Scroll to top before loading
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'auto' });
      }
      
      // Reset page and assets
      setPage(1);
      setAssets([]);
    }
  }, [sortBy]);

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
          {/* Sort Options */}
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
          
          {/* Asset Count */}
          {!pageLoading && !pageError && assets.length > 0 && (
            <span className="text-xs text-text-tertiary">
              {assets.length} {totalAssets > 0 && `/ ${totalAssets}`} {assets.length === 1 ? t('forYou.asset') : t('forYou.assets')}
            </span>
          )}
        </div>
      </div>

      {/* Content Area with padding */}
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        {/* Modern Skeleton Loading - Subtle and Minimal */}
        {pageLoading && page === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="rounded-xl border border-white/5 bg-surface-float overflow-hidden"
                style={{
                  opacity: 0.6,
                  animation: `fade-in 0.3s ease-out ${i * 0.05}s backwards`,
                }}
              >
                {/* Thumbnail skeleton */}
                <div className="relative h-40 bg-gradient-to-br from-surface-float2 to-surface-float overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
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

        {/* Empty State */}
        {!pageLoading && !pageError && assets.length === 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {assets.map((asset, index) => (
                <div key={asset.id}>
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
            
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
