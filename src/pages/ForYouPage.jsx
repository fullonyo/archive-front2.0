import { useState, useEffect, useRef, useCallback } from 'react';
import AssetCard from '../components/assets/AssetCard';
import Breadcrumb from '../components/common/Breadcrumb';
import { useTranslation } from '../hooks/useTranslation';
import { TrendingUp, Clock, Sparkles, ArrowUp, AlertCircle, Upload, RefreshCw } from 'lucide-react';

const ForYouPage = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const observerTarget = useRef(null);
  const contentRef = useRef(null);

  const generateMockAssets = (startId, count = 12) => {
    const categories = ['Avatars', 'Worlds', 'Shaders', 'Effects', 'Tools', 'Accessories'];
    const titles = ['Anime Avatar', 'Cyberpunk Shader', 'Medieval World', 'Particle Effects', 'Hair Physics', 'Kawaii Pack', 'Dynamic Light', 'Animations', 'Sound Pack', 'UI Elements'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: startId + i,
      title: titles[i % titles.length] + ` #${startId + i}`,
      description: 'High quality asset',
      category: categories[i % categories.length],
      thumbnail: 'https://via.placeholder.com/400x225',
      author: { name: 'Creator' + ((startId + i) % 10), avatar: null },
      uploadedAt: `${Math.floor(Math.random() * 24)}h ago`,
      likes: Math.floor(Math.random() * 500),
      downloads: Math.floor(Math.random() * 2000),
      comments: Math.floor(Math.random() * 50),
      tags: ['tag1', 'tag2', 'tag3'],
      isLiked: false
    }));
  };

  useEffect(() => {
    const mockAssets = generateMockAssets(1, 15);
    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
      setError(null);
      setIsFirstLoad(false);
    }, 800);
  }, []);

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
    setError(null);
    setLoading(true);
    const mockAssets = generateMockAssets(1, 15);
    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
    }, 800);
  }, []);

  const loadMoreAssets = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const newAssets = generateMockAssets(assets.length + 1, 15);
      setAssets(prev => [...prev, ...newAssets]);
      setPage(prev => prev + 1);
      setLoadingMore(false);
      if (page >= 5) setHasMore(false);
    }, 800);
  }, [assets.length, loadingMore, hasMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) loadMoreAssets();
    }, { threshold: 0.1 });
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loadMoreAssets, hasMore, loadingMore]);

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
      
      // Simulate refresh
      setLoading(true);
      setTimeout(() => {
        const mockAssets = generateMockAssets(1, 15);
        setAssets(mockAssets);
        setLoading(false);
        setIsFirstLoad(false);
      }, 500);
    }
  }, [sortBy]);

  return (
    <div className="max-w-[1600px] mx-auto" ref={contentRef}>
      {/* Loading Progress Bar - Top */}
      {loading && (
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
          {!loading && !error && assets.length > 0 && (
            <span className="text-xs text-text-tertiary">
              {assets.length} {assets.length === 1 ? t('forYou.asset') : t('forYou.assets')}
            </span>
          )}
        </div>
      </div>

      {/* Content Area with padding */}
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        {/* Modern Skeleton Loading - Subtle and Minimal */}
        {loading && (
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
        {error && !loading && (
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
        {!loading && !error && assets.length === 0 && (
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
        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  className={isFirstLoad ? 'animate-stagger-in' : ''}
                  style={isFirstLoad ? { animationDelay: `${index * 30}ms` } : {}}
                >
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
            
            <div ref={observerTarget} className="py-8 flex justify-center">
              {loadingMore && (
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
