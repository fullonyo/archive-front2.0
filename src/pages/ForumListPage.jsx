import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Flame, Clock, TrendingUp, HelpCircle, Search, ArrowUp } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import ForumPostCard from '../components/forum/ForumPostCard';
import Breadcrumb from '../components/common/Breadcrumb';

const ForumListPage = ({ category = 'popular', icon: Icon, title }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const observerTarget = useRef(null);

  // Sort Options
  const sortOptions = [
    { value: 'hot', label: t('forum.hot'), icon: Flame },
    { value: 'new', label: t('forum.new'), icon: Clock },
    { value: 'top', label: t('forum.top'), icon: TrendingUp },
    { value: 'unanswered', label: t('forum.unanswered'), icon: HelpCircle },
  ];

  // Popular Tags
  const popularTags = [
    'Avatar', 'World', 'Shader', 'Help', 'Question', 'Unity', 'Blender', 'VRChat'
  ];

  // Mock data generator
  const generateMockPosts = (startId, count = 10) => {
    const titles = [
      'Como fazer avatar aparecer corretamente no VRChat?',
      'Shader para efeito de brilho em avatares',
      'Mundo não carrega para alguns usuários',
      'Tutorial: Criando partículas customizadas',
      'Preciso de ajuda com PhysBones',
      'Melhor método para otimizar avatares?',
      'Bug com OSC - não detecta inputs',
      'Showcase: Meu novo mundo cyberpunk!',
      'Como configurar Dynamic Bones corretamente?',
      'Avatar crashando outros players - help!',
    ];

    const tags = [
      ['Avatar', 'Help', 'Question'],
      ['Shader', 'Unity', 'Tutorial'],
      ['World', 'Help', 'Bug'],
      ['Tutorial', 'VFX', 'Unity'],
      ['Avatar', 'PhysBones', 'Help'],
      ['Avatar', 'Optimization', 'Question'],
      ['Bug', 'OSC', 'Help'],
      ['World', 'Showcase', 'Cyberpunk'],
      ['Avatar', 'Dynamic Bones', 'Question'],
      ['Avatar', 'Bug', 'Help'],
    ];

    const badges = [
      ['Creator'],
      ['Helper', 'Expert'],
      ['VRChat Pro'],
      ['Moderator'],
      [],
      ['Level 15'],
      [],
      ['Creator', 'VRChat Pro'],
      ['Helper'],
      [],
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: startId + i,
      title: titles[i % titles.length],
      author: {
        name: `User${(startId + i) % 20}`,
        avatar: null,
        badges: badges[i % badges.length],
      },
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      tags: tags[i % tags.length],
      upvotes: Math.floor(Math.random() * 200),
      replies: Math.floor(Math.random() * 50),
      views: Math.floor(Math.random() * 3000),
      createdAt: `${Math.floor(Math.random() * 24)}h ago`,
      lastActivity: `${Math.floor(Math.random() * 60)}min ago`,
      isHot: Math.random() > 0.7,
      isPinned: i === 0 && page === 1,
      isSolved: Math.random() > 0.6,
      isUpvoted: false,
    }));
  };

  // Load initial posts
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockPosts = generateMockPosts(1, 15);
      setPosts(mockPosts);
      setLoading(false);
      setIsFirstLoad(false);
    }, 800);
  }, [category]);

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

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    setTimeout(() => {
      const newPosts = generateMockPosts(posts.length + 1, 10);
      setPosts(prev => [...prev, ...newPosts]);
      setPage(prev => prev + 1);
      setLoadingMore(false);
      
      if (page >= 5) {
        setHasMore(false);
      }
    }, 800);
  }, [posts.length, loadingMore, hasMore, page]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMorePosts, hasMore, loadingMore]);

  // Filter posts by search and tags
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => post.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

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
        const mockPosts = generateMockPosts(1, 15);
        setPosts(mockPosts);
        setLoading(false);
        setIsFirstLoad(false);
      }, 500);
    }
  }, [sortBy]);

  // Modern Skeleton with shimmer effect
  const PostSkeleton = ({ index }) => (
    <div 
      className="rounded-xl border border-white/5 bg-surface-float overflow-hidden"
      style={{
        opacity: 0.6,
        animation: `fade-in 0.3s ease-out ${index * 0.05}s backwards`,
      }}
    >
      <div className="p-4">
        {/* Header skeleton */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-surface-float2 to-surface-float rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-float2 rounded w-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
            <div className="h-3 bg-surface-float2 rounded w-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Title skeleton */}
        <div className="h-6 bg-surface-float2 rounded w-3/4 mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-1.5 mb-3">
          <div className="h-4 bg-surface-float2 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="h-4 bg-surface-float2 rounded w-2/3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-surface-float2 rounded w-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="h-6 bg-surface-float2 rounded w-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="flex gap-4 pt-3 border-t border-white/5">
          <div className="h-4 bg-surface-float2 rounded w-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="h-4 bg-surface-float2 rounded w-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="h-4 bg-surface-float2 rounded w-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Loading Progress Bar - Top */}
      {loading && isFirstLoad && (
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
            { label: 'Fórum', path: '/forum/popular' },
            { label: title, path: `/forum/${category}` }
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
              const OptionIcon = option.icon;
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
          
          {/* Post Count */}
          {!loading && posts.length > 0 && (
            <span className="text-xs text-text-tertiary">
              {posts.length} {posts.length === 1 ? t('forum.post') : t('forum.posts')}
            </span>
          )}
        </div>
      </div>

      {/* Content Area with padding */}
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        {/* Search and Create Post - Same Line */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            {/* Search Bar - Flexible */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
              <input
                type="text"
                placeholder={t('forum.searchPosts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-surface-float border border-white/5 rounded-lg text-sm text-text-primary 
                  placeholder:text-text-tertiary focus:outline-none focus:border-theme-active/50 focus:bg-surface-float2 transition-all"
              />
            </div>

            {/* Create Post Button - Fixed Width */}
            <button 
              onClick={() => window.location.href = '/forum/new'}
              className="btn btn-primary shrink-0 h-10 px-4 gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t('forum.createPost')}</span>
            </button>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-text-tertiary self-center mr-2">{t('forum.popularTags')}</span>
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-theme-active/20 text-theme-active border-theme-active/40'
                    : 'bg-surface-float2 text-text-secondary border-white/5 hover:border-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading && isFirstLoad ? (
            // Modern Skeleton Loading
            Array.from({ length: 8 }).map((_, i) => (
              <PostSkeleton key={i} index={i} />
            ))
          ) : filteredPosts.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <HelpCircle size={48} className="mx-auto text-text-tertiary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('forum.noPostsFound')}</h3>
              <p className="text-text-secondary mb-6">
                {t('forum.tryAdjustFilters')}
              </p>
              <button 
                onClick={() => window.location.href = '/forum/new'}
                className="btn btn-primary"
              >
                <Plus size={20} />
                {t('forum.createFirstPost')}
              </button>
            </div>
          ) : (
            // Posts
            <>
              {filteredPosts.map(post => (
                <ForumPostCard key={post.id} post={post} />
              ))}

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-active" />
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && !loadingMore && (
                <div ref={observerTarget} className="h-10" />
              )}

              {/* End of Results */}
              {!hasMore && (
                <div className="text-center py-8 text-text-tertiary text-sm">
                  {t('forum.endOfPosts')}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-theme-active hover:bg-theme-hover text-white rounded-full shadow-lg transition-all duration-300 z-40 animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default ForumListPage;
