import { Shirt, Globe, Sparkles, Wand2, Box, Star, Grid3x3, Package, Search, TrendingUp, Flame, Clock } from 'lucide-react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all'); // all, featured, popular
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      id: 'avatars',
      name: 'Avatars',
      icon: Shirt,
      description: 'Complete avatar models and packages',
      count: 1234,
      color: 'from-blue-500 to-cyan-500',
      featured: true,
      trending: true,
      growth: '+12%'
    },
    {
      id: 'worlds',
      name: 'Worlds',
      icon: Globe,
      description: 'Virtual worlds and environments',
      count: 856,
      color: 'from-green-500 to-emerald-500',
      featured: true,
      trending: true,
      growth: '+8%'
    },
    {
      id: 'shaders',
      name: 'Shaders',
      icon: Sparkles,
      description: 'Visual effects and shaders',
      count: 432,
      color: 'from-purple-500 to-pink-500',
      featured: true,
      trending: false,
      growth: '+5%'
    },
    {
      id: 'effects',
      name: 'Effects',
      icon: Wand2,
      description: 'Particle effects and VFX',
      count: 678,
      color: 'from-orange-500 to-red-500',
      featured: false,
      trending: true,
      growth: '+15%'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: Star,
      description: 'Avatar accessories and props',
      count: 923,
      color: 'from-yellow-500 to-orange-500',
      featured: false,
      trending: false,
      growth: '+3%'
    },
    {
      id: 'tools',
      name: 'Tools',
      icon: Box,
      description: 'Unity scripts and tools',
      count: 345,
      color: 'from-indigo-500 to-blue-500',
      featured: false,
      trending: false,
      growth: '+7%'
    },
    {
      id: 'animations',
      name: 'Animations',
      icon: Package,
      description: 'Animation packs and poses',
      count: 567,
      color: 'from-pink-500 to-rose-500',
      featured: false,
      trending: false,
      growth: '+10%'
    },
    {
      id: 'textures',
      name: 'Textures',
      icon: Grid3x3,
      description: 'Texture packs and materials',
      count: 789,
      color: 'from-teal-500 to-cyan-500',
      featured: false,
      trending: false,
      growth: '+6%'
    },
  ];

  const popularTags = [
    { name: 'anime', count: 2341, trending: true },
    { name: 'realistic', count: 1876, trending: false },
    { name: 'cyberpunk', count: 1523, trending: true },
    { name: 'fantasy', count: 1432, trending: false },
    { name: 'cute', count: 1298, trending: true },
    { name: 'horror', count: 987, trending: false },
    { name: 'scifi', count: 876, trending: false },
    { name: 'medieval', count: 765, trending: false },
    { name: 'modern', count: 654, trending: false },
    { name: 'nature', count: 543, trending: false },
    { name: 'urban', count: 432, trending: false },
    { name: 'space', count: 321, trending: false },
  ];

  const handleCategoryClick = useCallback((categoryId) => {
    navigate(`/category/${categoryId}`);
  }, [navigate]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter categories based on active view
  const filteredCategories = useMemo(() => {
    if (activeView === 'featured') return categories.filter(cat => cat.featured);
    if (activeView === 'popular') return categories.sort((a, b) => b.count - a.count);
    return categories;
  }, [activeView]);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* RGB Progress Bar - Loading State */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-bar"
            style={{ 
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
              willChange: 'transform'
            }}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4">
        <Breadcrumb
          items={[
            { label: 'Explorer', path: '/explore' }
          ]}
        />
      </div>

      {/* Sticky Search & Filter Bar */}
      <div 
        className="sticky top-0 z-10 bg-surface-base px-3 sm:px-4 lg:px-6 py-3 border-b border-white/5"
        style={{ contain: 'layout style' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search Bar and View Filters in same line */}
          <div className="flex gap-3 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                placeholder="Search categories, tags..."
                className="w-full h-10 bg-surface-float border border-white/5 rounded-lg pl-10 pr-4 text-sm 
                  focus:outline-none focus:border-theme-active/50 focus:bg-surface-float2 transition-all
                  placeholder:text-text-tertiary"
              />
            </div>

            {/* View Filters */}
            <div className="flex gap-1">
              {[
                { value: 'all', label: 'All', icon: Grid3x3 },
                { value: 'featured', label: 'Featured', icon: Star },
                { value: 'popular', label: 'Popular', icon: TrendingUp },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setActiveView(option.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeView === option.value
                        ? 'bg-theme-active text-white'
                        : 'bg-surface-float text-text-secondary hover:bg-surface-float2 hover:text-text-primary'
                    }`}
                  >
                    <Icon size={14} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Category Count */}
          <span className="text-xs text-text-tertiary">
            {filteredCategories.length} categories
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-3 sm:px-4 lg:px-6 py-6 space-y-8">
        {loading ? (
          /* Modern Skeleton Loading */
          <>
            {/* Featured Categories Skeleton */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-48 bg-surface-float rounded animate-pulse" style={{ opacity: 0.6 }} />
                <div className="h-4 w-20 bg-surface-float rounded animate-pulse" style={{ opacity: 0.6 }} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-float"
                    style={{ 
                      animation: `fade-in 0.3s ease-out ${i * 0.05}s backwards`,
                      opacity: 0.6
                    }}
                  >
                    {/* Gradient Header Skeleton */}
                    <div className="h-28 bg-gradient-to-br from-surface-float2 to-surface-float relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    </div>
                    {/* Content Skeleton */}
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-24 bg-surface-float2 rounded" />
                      <div className="h-3 w-full bg-surface-float2 rounded" />
                      <div className="flex items-center justify-between pt-1">
                        <div className="h-3 w-16 bg-surface-float2 rounded" />
                        <div className="h-3 w-14 bg-surface-float2 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* All Categories Grid Skeleton */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-surface-float rounded animate-pulse" style={{ opacity: 0.6 }} />
                <div className="h-4 w-24 bg-surface-float rounded animate-pulse" style={{ opacity: 0.6 }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className="relative p-4 rounded-lg border border-white/5 bg-surface-float"
                    style={{ 
                      animation: `fade-in 0.3s ease-out ${i * 0.03}s backwards`,
                      opacity: 0.6
                    }}
                  >
                    <div className="relative">
                      <div className="inline-flex p-2.5 rounded-lg bg-gradient-to-br from-surface-float2 to-surface-float mb-3">
                        <div className="w-5 h-5 bg-surface-float2 rounded" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-surface-float2 rounded mb-1" />
                    <div className="h-3 w-12 bg-surface-float2 rounded" />
                  </div>
                ))}
              </div>
            </section>

            {/* Tags Skeleton */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-surface-float rounded animate-pulse" style={{ opacity: 0.6 }} />
                <div className="h-4 w-16 bg-surface-float rounded animate-pulse" style={{ opacity: 0.6 }} />
              </div>
              <div className="rounded-xl border border-white/5 bg-surface-float p-4">
                <div className="flex flex-wrap gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="h-7 bg-surface-float2 rounded-md"
                      style={{ 
                        width: `${Math.random() * 40 + 60}px`,
                        animation: `fade-in 0.3s ease-out ${i * 0.02}s backwards`,
                        opacity: 0.6
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Skeleton */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-lg border border-white/5 bg-surface-float"
                  style={{ 
                    animation: `fade-in 0.3s ease-out ${i * 0.05}s backwards`,
                    opacity: 0.6
                  }}
                >
                  <div className="w-4 h-4 bg-surface-float2 rounded mb-2" />
                  <div className="h-6 w-16 bg-surface-float2 rounded mb-1" />
                  <div className="h-3 w-20 bg-surface-float2 rounded" />
                </div>
              ))}
            </section>
          </>
        ) : (
          <>
        {/* Featured Hero Categories - Large Cards (2 columns on desktop) */}
        {activeView === 'all' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star className="text-yellow-500" size={18} />
                Featured Categories
              </h2>
              <span className="text-xs text-text-tertiary">Top picks</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.filter(cat => cat.featured).map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-float hover:border-white/10 transition-all group"
                    style={{
                      contain: 'layout style paint',
                      willChange: 'transform',
                    }}
                  >
                    {/* Gradient Header */}
                    <div className={`h-28 bg-gradient-to-br ${category.color} relative`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon size={40} className="text-white/90 group-hover:scale-110 transition-transform" />
                      </div>
                      {category.trending && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md">
                          <Flame size={12} className="text-orange-400" />
                          <span className="text-xs text-white font-medium">{category.growth}</span>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-1 group-hover:text-theme-active transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-text-secondary mb-3 line-clamp-1">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">
                          {category.count.toLocaleString()} assets
                        </span>
                        <span className="text-theme-active font-medium group-hover:translate-x-1 transition-transform">
                          Browse →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* All Categories Grid - Compact Cards (4-5 columns) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {activeView === 'featured' ? 'Featured' : activeView === 'popular' ? 'Most Popular' : 'All Categories'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="relative p-4 rounded-lg border border-white/5 bg-surface-float hover:bg-surface-float2 hover:border-white/10 transition-all group text-left"
                  style={{
                    contain: 'layout style paint',
                  }}
                >
                  {category.trending && (
                    <div className="absolute top-2 right-2">
                      <Flame size={14} className="text-orange-400" />
                    </div>
                  )}
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${category.color} mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-theme-active transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    {category.count.toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Popular Tags - Modern Tag Cloud */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Popular Tags</h2>
            <button className="text-xs text-theme-active hover:underline">View all →</button>
          </div>
          <div className="rounded-xl border border-white/5 bg-surface-float p-4">
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagClick(tag.name)}
                  className="group relative px-3 py-1.5 bg-surface-float2 hover:bg-theme-active/20 border border-white/5 hover:border-theme-active/30 rounded-md text-xs transition-all"
                >
                  <span className="font-medium group-hover:text-theme-active transition-colors">
                    #{tag.name}
                  </span>
                  <span className="ml-1.5 text-text-tertiary text-[10px]">
                    {tag.count > 999 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count}
                  </span>
                  {tag.trending && (
                    <TrendingUp size={10} className="inline ml-1 text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Assets', value: '8.5K', icon: Package, color: 'text-blue-400' },
            { label: 'Categories', value: categories.length, icon: Grid3x3, color: 'text-purple-400' },
            { label: 'This Week', value: '+342', icon: Clock, color: 'text-green-400' },
            { label: 'Trending', value: categories.filter(c => c.trending).length, icon: TrendingUp, color: 'text-orange-400' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 rounded-lg border border-white/5 bg-surface-float">
                <Icon size={16} className={`${stat.color} mb-2`} />
                <div className="text-xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-text-tertiary">{stat.label}</div>
              </div>
            );
          })}
        </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
