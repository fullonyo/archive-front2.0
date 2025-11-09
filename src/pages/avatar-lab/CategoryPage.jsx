import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssetCard from '../../components/assets/AssetCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';
import { assetService } from '../../services/assetService';
import { TrendingUp, Clock, Sparkles, ArrowUp, AlertCircle, Upload, RefreshCw, Package } from 'lucide-react';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const observerTarget = useRef(null);
  const contentRef = useRef(null);
  const MAX_PAGES = 20;

  // Load assets for this category
  const loadAssets = useCallback(async (pageNum = 1, sort = sortBy, append = false) => {
    if (!append) setLoading(true);
    setError(null);

    try {
      const response = await assetService.getAssetsByCategory(id, {
        page: pageNum,
        limit: 15,
        sort
      });

      if (response.success && response.data) {
        // Backend returns { category, subcategories, assets, pagination }
        const categoryData = response.data.category;
        const backendAssets = response.data.assets || [];
        const pagination = response.data.pagination || {};
        const total = pagination.total || backendAssets.length;

        // Set category info if not already set
        if (!category && categoryData) {
          setCategory(categoryData);
        }

        // Transform to frontend format
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

        if (append) {
          setAssets(prev => [...prev, ...transformedAssets]);
        } else {
          setAssets(transformedAssets);
        }

        setTotalAssets(total);
        setHasMore(transformedAssets.length === 15 && (append ? assets.length : 0) + transformedAssets.length < total);
      } else {
        setAssets([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Load assets error:', err);
      setError('Failed to load assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [id, sortBy, category, assets.length]);

  // Format upload date
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
    
    return uploaded.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Load more assets (infinite scroll)
  const loadMore = useCallback(() => {
    if (loading || !hasMore || page >= MAX_PAGES) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    loadAssets(nextPage, sortBy, true);
  }, [loading, hasMore, page, sortBy, loadAssets]);

  // Change sort
  const handleSortChange = useCallback((newSort) => {
    if (newSort === sortBy) return;
    
    setSortBy(newSort);
    setPage(1);
    setAssets([]);
    setHasMore(true);
    loadAssets(1, newSort, false);
  }, [sortBy, loadAssets]);

  // Retry fetch
  const retryFetch = useCallback(() => {
    setPage(1);
    setAssets([]);
    setHasMore(true);
    loadAssets(1, sortBy, false);
  }, [sortBy, loadAssets]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowScrollTop(contentRef.current.scrollTop > 400);
      }
    };

    const scrollContainer = contentRef.current;
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && page < MAX_PAGES) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMore, hasMore, loading, page]);

  // Initial load
  useEffect(() => {
    loadAssets(1, sortBy, false);
  }, [id]); // Only reload when category ID changes

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: category?.name || 'Category', path: null }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'popular', label: 'Popular', icon: TrendingUp },
    { value: 'trending', label: 'Trending', icon: Sparkles }
  ];

  return (
    <div className="max-w-[1600px] mx-auto" ref={contentRef}>
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
            {sortOptions.map((option) => {
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
      <div className="px-3 sm:px-4 lg:px-6 py-6 space-y-6">
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

        {/* Loading State (first load) */}
        {loading && page === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-float rounded-xl overflow-hidden border border-white/5 animate-pulse"
              >
                <div className="h-40 bg-surface-float2" />
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

        {/* Empty State */}
        {!loading && !error && assets.length === 0 && (
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

        {/* Assets Grid */}
        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
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
                    ? `Showing first ${MAX_PAGES * 15} assets` 
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
