import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AssetCard from '../../components/assets/AssetCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';
import { bookmarkService } from '../../services/bookmarkService';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { useOptimisticLoading } from '../../hooks/useOptimisticLoading';
import { CACHE_KEYS, CACHE_TTL } from '../../config/cache';
import { formatUploadDate } from '../../utils/dateUtils';
import { 
  Bookmark, 
  Clock, 
  Upload, 
  AlertCircle, 
  RefreshCw,
  ArrowUp,
  Download,
  Heart
} from 'lucide-react';

const BookmarksPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const observerTarget = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cache key
  const cacheKey = CACHE_KEYS.userFavorites(user?.id, page, { sortBy });

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
      const response = await bookmarkService.getUserBookmarks(page, 15);
      return response;
    },
    { 
      ttl: CACHE_TTL.USER_FAVORITES,
      enabled: !!user?.id
    }
  );

  // Optimistic loading
  const shouldShowSkeleton = useOptimisticLoading(
    pageLoading && page === 1 && assets.length === 0, 
    isCached, 
    150
  );

  // Helper function - Sort assets
  const sortAssets = useCallback((assetList, sortOption) => {
    const sorted = [...assetList];
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.bookmarkedAt) - new Date(b.bookmarkedAt));
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'downloads':
        return sorted.sort((a, b) => b.downloads - a.downloads);
      default:
        return sorted;
    }
  }, []);

  // Memoizar transformação de assets - PERFORMANCE: Evita processamento desnecessário
  const transformedAssets = useMemo(() => {
    if (!pageData?.success || !pageData?.data) return [];

    const backendBookmarks = pageData.data.bookmarks || [];

    // Transform bookmarks to asset format - Backend já normaliza URLs
    const transformed = backendBookmarks.map(bookmark => {
      const asset = bookmark.asset;
      
      return {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        category: asset.category?.name || 'Unknown',
        thumbnail: asset.thumbnailUrl || (asset.imageUrls?.[0]) || null,
        thumbnailUrl: asset.thumbnailUrl,
        imageUrls: asset.imageUrls || [],
        author: {
          name: asset.user?.username || 'Unknown',
          avatarUrl: asset.user?.avatarUrl || null
        },
        uploadedAt: formatUploadDate(asset.createdAt),
        bookmarkedAt: bookmark.bookmarkedAt, // Data do bookmark, não do favorite
        likes: asset.likes || 0,
        downloads: asset.downloads || 0,
        comments: asset.reviews || 0,
        tags: asset.tags || [],
        isBookmarked: true, // Sempre true pois está nos bookmarks
        isLiked: asset.isLiked || false, // Pode ou não estar liked
        averageRating: asset.averageRating || 0
      };
    });

    // Client-side sort
    return sortAssets(transformed, sortBy);
  }, [pageData, sortBy, sortAssets]);

  // Process data
  useEffect(() => {
    if (transformedAssets.length === 0) {
      setHasProcessedData(false);
      return;
    }

    const total = pageData?.data?.total || 0;

    if (page === 1) {
      setAssets(transformedAssets);
    } else {
      setAssets(prev => [...prev, ...transformedAssets]);
    }

    setTotalAssets(total);
    setHasMore(pageData?.data?.hasMore || false);
    setHasProcessedData(true);

    if (import.meta.env.DEV) {
      console.log(`[Bookmarks] ${isCached ? 'Cache HIT' : 'Cache MISS'} - Page ${page}, Sort: ${sortBy}`);
    }
  }, [transformedAssets, page, isCached, pageData, assets.length]);

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
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loadMoreAssets, hasMore, pageLoading]);

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Recently Added', icon: Clock },
    { value: 'oldest', label: 'Oldest First', icon: Clock },
    { value: 'popular', label: 'Most Liked', icon: Heart },
    { value: 'downloads', label: 'Most Downloaded', icon: Download },
  ];

  const handleSortChange = useCallback((newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'auto' });
      setPage(1);
      setHasProcessedData(false);
    }
  }, [sortBy]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-[1600px] mx-auto">
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
        <Breadcrumb items={[{ label: t('sidebar.bookmarks') || 'Bookmarks', path: '/bookmarks' }]} />
      </div>

      {/* Filters - Sticky */}
      <div 
        className="sticky top-0 z-10 bg-surface-base px-3 sm:px-4 lg:px-6 py-3 border-b border-white/5"
        style={{ contain: 'layout style' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Title & Count */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-float">
              <Bookmark size={20} className="text-theme-active" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">My Bookmarks</h1>
              {!pageLoading && !pageError && assets.length > 0 && (
                <p className="text-xs text-text-tertiary">
                  {assets.length} {totalAssets > 0 && `/ ${totalAssets}`} saved {assets.length === 1 ? 'asset' : 'assets'}
                </p>
              )}
            </div>
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Sort by:</span>
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
              We couldn't load your bookmarks. Please try again.
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
              <Bookmark size={40} className="text-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
              Start bookmarking assets you like! Click the bookmark icon on any asset to save it here.
            </p>
            <button 
              onClick={() => navigate('/for-you')}
              className="px-6 py-2.5 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors font-medium"
            >
              Explore Assets
            </button>
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
                  <AssetCard asset={asset} />
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
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default BookmarksPage;
