import { useState, useEffect, useRef, useCallback } from 'react';
import AssetCard from '../components/assets/AssetCard';
import { TrendingUp, Clock, Sparkles, Filter } from 'lucide-react';

const ForYouPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [filterCategory, setFilterCategory] = useState('all');
  const observerTarget = useRef(null);

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
    { value: 'latest', label: 'Latest', icon: Clock },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'popular', label: 'Popular', icon: Sparkles },
  ];

  const categories = ['all', 'Avatars', 'Worlds', 'Shaders', 'Effects', 'Tools', 'Accessories'];

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Compact Filter Bar - Minimalista - STICKY */}
      <div className="sticky top-0 z-10 bg-surface-base backdrop-blur-sm px-3 sm:px-4 lg:px-6 py-3 border-b border-white/5">
        <div className="flex gap-2 items-center justify-between">
          {/* Sort Tabs */}
          <div className="flex gap-1">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${sortBy === option.value 
                      ? 'bg-theme-active text-white' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-float'}
                  `}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`
                  px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                  ${filterCategory === category 
                    ? 'bg-theme-active/20 text-theme-active border border-theme-active/30' 
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-float/50'}
                `}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area with padding */}
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (<div key={i} className="card animate-pulse"><div className="bg-surface-float2 h-40 rounded-t-xl" /><div className="p-3 space-y-2"><div className="h-3 bg-surface-float2 rounded w-3/4" /><div className="h-2 bg-surface-float2 rounded w-full" /></div></div>))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {assets.map((asset) => (<AssetCard key={asset.id} asset={asset} />))}
          </div>
          <div ref={observerTarget} className="py-8 flex justify-center">
            {loadingMore && (<div className="flex items-center gap-2 text-text-tertiary"><div className="w-5 h-5 border-2 border-theme-active border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading more assets...</span></div>)}
            {!hasMore && assets.length > 0 && (<p className="text-text-tertiary text-sm">No more assets to load</p>)}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default ForYouPage;
