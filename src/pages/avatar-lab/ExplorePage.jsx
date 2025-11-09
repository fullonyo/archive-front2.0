import { Shirt, Globe, Sparkles, Wand2, Box, Star, Grid3x3, Package, Search, TrendingUp, Flame, Clock } from 'lucide-react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';
import { assetService } from '../../services/assetService';
import toast from 'react-hot-toast';
import { onCategoriesUpdate } from '../../utils/categoryEvents';

// Icon mapping for categories
const ICON_MAP = {
  // Lucide Icons (frontend expects)
  'Shirt': Shirt,
  'Globe': Globe,
  'Sparkles': Sparkles,
  'Wand2': Wand2,
  'Box': Box,
  'Star': Star,
  'Grid3x3': Grid3x3,
  'Package': Package,
  'Flame': Flame,
  'Clock': Clock,
  // Backend icons (legacy) - exact matches
  'user': Shirt,
  'user-circle': Shirt,
  'shirt': Shirt,
  'gem': Star,
  'star': Star,
  'globe': Globe,
  'globe-alt': Globe,
  'cube': Box,
  'wrench-screwdriver': Box,
  'package': Package,
  'sparkles': Sparkles,
  'wand2': Wand2,
  'grid3x3': Grid3x3
};

// Color mapping for categories
const COLOR_MAP = {
  'blue': 'from-blue-500 to-cyan-500',
  'green': 'from-green-500 to-emerald-500',
  'purple': 'from-purple-500 to-pink-500',
  'orange': 'from-orange-500 to-red-500',
  'yellow': 'from-yellow-500 to-orange-500',
  'indigo': 'from-indigo-500 to-blue-500',
  'pink': 'from-pink-500 to-rose-500',
  'teal': 'from-teal-500 to-cyan-500'
};

// Name to color mapping (fallback)
const getCategoryColor = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('avatar')) return COLOR_MAP['blue'];
  if (lowerName.includes('world')) return COLOR_MAP['green'];
  if (lowerName.includes('cloth') || lowerName.includes('shirt')) return COLOR_MAP['purple'];
  if (lowerName.includes('accessor')) return COLOR_MAP['yellow'];
  if (lowerName.includes('prop')) return COLOR_MAP['orange'];
  if (lowerName.includes('tool')) return COLOR_MAP['indigo'];
  return COLOR_MAP['blue']; // default
};

// Capitalize category name for display
const capitalizeName = (name) => {
  if (!name) return '';
  // Special handling for hyphenated names
  return name.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ExplorePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all'); // all, featured, popular
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalApproved: 0,
    recentUploads: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

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

  // Load categories from API - using useCallback to stabilize function
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await assetService.getCategories();
      
      // Support both formats: { success: true, data: [...] } or direct array [...]
      let categoriesData = null;
      
      if (response.success && response.data) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
        // Transform API data to match component structure
        const transformedCategories = categoriesData.map((cat, index) => {
          return {
            id: cat.id,
            name: capitalizeName(cat.name),
            icon: ICON_MAP[cat.icon] || ICON_MAP[cat.icon?.toLowerCase()] || Package,
            description: cat.description || `Browse ${capitalizeName(cat.name).toLowerCase()}`,
            count: cat.assetCount || cat.asset_count || cat._count?.assets || 0,
            color: COLOR_MAP[cat.color] || getCategoryColor(cat.name),
            featured: index < 3,
            trending: (cat.assetCount || cat.asset_count || 0) > 2,
            growth: (cat.assetCount || cat.asset_count || 0) > 100 ? '+12%' : (cat.assetCount || cat.asset_count || 0) > 50 ? '+8%' : '+5%',
            isActive: cat.isActive !== false
          };
        }).filter(cat => cat.isActive !== false);
        
        setCategories(transformedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Load categories error:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load popular tags from API
  const loadPopularTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const response = await assetService.getPopularTags(12);
      
      if (response.success && response.data) {
        // Transform tags to include trending flag based on usage count
        const tags = response.data.map((tag, index) => ({
          name: tag.name || tag.tag,
          count: tag.count || tag.usage_count || 0,
          trending: index < 3 // Top 3 are trending
        }));
        setPopularTags(tags);
      } else if (Array.isArray(response)) {
        const tags = response.map((tag, index) => ({
          name: tag.name || tag.tag,
          count: tag.count || tag.usage_count || 0,
          trending: index < 3
        }));
        setPopularTags(tags);
      }
    } catch (error) {
      console.error('Load popular tags error:', error);
      // Don't show error toast - tags are optional
      setPopularTags([]);
    } finally {
      setLoadingTags(false);
    }
  }, []);

  // Load global stats from API
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await assetService.getStats();
      
      if (response.success && response.data) {
        setStats({
          totalAssets: response.data.totalAssets || 0,
          totalApproved: response.data.totalApproved || 0,
          recentUploads: response.data.recentUploads || 0
        });
      }
    } catch (error) {
      console.error('Load stats error:', error);
      // Keep default values
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load all data on mount - orchestrated to avoid race conditions
  useEffect(() => {
    const loadAllData = async () => {
      // Load critical data first (categories)
      await loadCategories();
      
      // Load secondary data in parallel (non-critical)
      Promise.all([
        loadPopularTags(),
        loadStats()
      ]).catch(err => {
        console.error('Error loading secondary data:', err);
        // Don't block UI for non-critical data
      });
    };

    loadAllData();

    // Listen for category updates from admin panel
    return onCategoriesUpdate(() => {
      loadCategories();
    });
  }, [loadCategories, loadPopularTags, loadStats]);

  // Filter categories based on active view
  const filteredCategories = useMemo(() => {
    if (activeView === 'featured') return categories.filter(cat => cat.featured);
    if (activeView === 'popular') return [...categories].sort((a, b) => b.count - a.count);
    return categories;
  }, [categories, activeView]);

  // Memoize breadcrumb items to avoid recreation
  const breadcrumbItems = useMemo(() => [
    { label: t('explore.title'), path: '/explore' }
  ], [t]);

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
        <Breadcrumb items={breadcrumbItems} />
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
                placeholder={t('explore.searchPlaceholder')}
                className="w-full h-10 bg-surface-float border border-white/5 rounded-lg pl-10 pr-4 text-sm 
                  focus:outline-none focus:border-theme-active/50 focus:bg-surface-float2 transition-all
                  placeholder:text-text-tertiary"
              />
            </div>

            {/* View Filters */}
            <div className="flex gap-1">
              {[
                { value: 'all', label: t('explore.allCategories'), icon: Grid3x3 },
                { value: 'featured', label: t('explore.featured'), icon: Star },
                { value: 'popular', label: t('explore.popular'), icon: TrendingUp },
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
              {activeView === 'featured' ? t('explore.featured') : activeView === 'popular' ? t('explore.mostPopular') : t('explore.allCategories')}
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
            <button className="text-xs text-theme-active hover:underline">{t('explore.viewAll')} →</button>
          </div>
          <div className="rounded-xl border border-white/5 bg-surface-float p-4">
            {loadingTags ? (
              // Loading skeleton for tags
              <div className="flex flex-wrap gap-2">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="h-7 w-20 bg-surface-float2 rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : popularTags.length > 0 ? (
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
                      <div className="absolute -top-1 -right-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary text-center py-2">No popular tags found</p>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loadingStats ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-white/5 bg-surface-float">
                <div className="w-4 h-4 bg-surface-float2 rounded mb-2 animate-pulse" />
                <div className="h-6 w-16 bg-surface-float2 rounded mb-1 animate-pulse" />
                <div className="h-3 w-20 bg-surface-float2 rounded animate-pulse" />
              </div>
            ))
          ) : (
            [
              { 
                label: 'Total Assets', 
                value: stats.totalAssets > 999 ? `${(stats.totalAssets / 1000).toFixed(1)}K` : stats.totalAssets, 
                icon: Package, 
                color: 'text-blue-400' 
              },
              { 
                label: 'Categories', 
                value: categories.length, 
                icon: Grid3x3, 
                color: 'text-purple-400' 
              },
              { 
                label: 'This Week', 
                value: stats.recentUploads > 0 ? `+${stats.recentUploads}` : '0', 
                icon: Clock, 
                color: 'text-green-400' 
              },
              { 
                label: 'Trending', 
                value: categories.filter(c => c.trending).length, 
                icon: TrendingUp, 
                color: 'text-orange-400' 
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-4 rounded-lg border border-white/5 bg-surface-float">
                  <Icon size={16} className={`${stat.color} mb-2`} />
                  <div className="text-xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-text-tertiary">{stat.label}</div>
                </div>
              );
            })
          )}
        </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
