/**
 * AssetCard - Usage Examples
 * 
 * Este arquivo demonstra os diferentes casos de uso do AssetCard reformulado.
 */

import React from 'react';
import AssetCard from '../components/assets/AssetCard';

// ============================================================================
// EXEMPLO 1: Uso Básico (For You Page)
// ============================================================================
export const BasicUsageExample = () => {
  const asset = {
    id: '1',
    title: 'Cyberpunk Avatar Full Set',
    thumbnail: 'https://example.com/thumbnail.jpg',
    category: 'Avatars',
    author: {
      name: 'NyoCreator',
      avatarUrl: 'https://example.com/avatar.jpg'
    },
    likes: 156,
    downloads: 89,
    comments: 12,
    uploadedAt: '2h ago',
    isLiked: false,
    isBookmarked: false
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      <AssetCard asset={asset} />
    </div>
  );
};

// ============================================================================
// EXEMPLO 2: My Assets Page (com status)
// ============================================================================
export const MyAssetsExample = () => {
  const myAssets = [
    {
      id: '1',
      title: 'My Pending Asset',
      thumbnail: 'https://example.com/thumbnail.jpg',
      category: 'Avatars',
      status: 'pending', // pending | published | draft
      author: {
        name: 'Me',
        avatarUrl: null
      },
      likes: 0,
      downloads: 0,
      uploadedAt: '1h ago'
    },
    {
      id: '2',
      title: 'My Published Asset',
      thumbnail: 'https://example.com/thumbnail.jpg',
      category: 'Worlds',
      status: 'published',
      author: {
        name: 'Me',
        avatarUrl: null
      },
      likes: 45,
      downloads: 23,
      uploadedAt: '3d ago'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {myAssets.map(asset => (
        <AssetCard 
          key={asset.id} 
          asset={asset} 
          showStatus={true} // Mostra badge de status
        />
      ))}
    </div>
  );
};

// ============================================================================
// EXEMPLO 3: Collection Detail Page
// ============================================================================
export const CollectionDetailExample = () => {
  const collectionItems = [
    {
      asset: {
        id: '1',
        title: 'Favorite Avatar 1',
        thumbnail: 'https://example.com/thumbnail.jpg',
        category: 'Avatars',
        author: {
          name: 'Creator123',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        likes: 234,
        downloads: 156,
        uploadedAt: '1w ago',
        isBookmarked: true // Mostra indicador de bookmark
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {collectionItems.map(item => (
        <AssetCard key={item.asset.id} asset={item.asset} />
      ))}
    </div>
  );
};

// ============================================================================
// EXEMPLO 4: Profile Page (expanded mode - futuro)
// ============================================================================
export const ProfilePageExample = () => {
  const userAssets = [
    {
      id: '1',
      title: 'My Best Avatar',
      thumbnail: 'https://example.com/thumbnail.jpg',
      category: 'Avatars',
      author: {
        name: 'ProfileUser',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      likes: 567,
      downloads: 234,
      comments: 45,
      uploadedAt: '2w ago',
      isLiked: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {userAssets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
};

// ============================================================================
// EXEMPLO 5: Search Results
// ============================================================================
export const SearchResultsExample = () => {
  const searchResults = [
    {
      id: '1',
      title: 'Cyberpunk Avatar Matching "cyber"',
      thumbnail: 'https://example.com/thumbnail.jpg',
      category: 'Avatars',
      author: {
        name: 'SearchCreator',
        avatarUrl: null
      },
      likes: 89,
      downloads: 45,
      uploadedAt: '3d ago',
      isLiked: false,
      isBookmarked: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {searchResults.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
};

// ============================================================================
// EXEMPLO 6: Infinite Scroll Integration
// ============================================================================
export const InfiniteScrollExample = () => {
  const [assets, setAssets] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const observerTarget = React.useRef(null);

  const loadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newAssets = Array.from({ length: 20 }, (_, i) => ({
        id: `${page}-${i}`,
        title: `Asset ${page * 20 + i}`,
        thumbnail: 'https://example.com/thumbnail.jpg',
        category: 'Avatars',
        author: {
          name: `Creator ${i}`,
          avatarUrl: null
        },
        likes: Math.floor(Math.random() * 500),
        downloads: Math.floor(Math.random() * 200),
        uploadedAt: '1d ago'
      }));
      
      setAssets(prev => [...prev, ...newAssets]);
      setPage(prev => prev + 1);
      setLoading(false);
      
      // Max 5 pages for demo
      if (page >= 5) setHasMore(false);
    }, 1000);
  }, [loading, hasMore, page]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
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
  }, [loadMore]);

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
      
      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10 mt-8" />
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-theme-active border-t-transparent" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXEMPLO 7: Empty State
// ============================================================================
export const EmptyStateExample = () => {
  const assets = []; // Empty array

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
      {assets.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-float2 mb-4">
            <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No assets found</h3>
          <p className="text-text-secondary text-sm mb-6">Try adjusting your filters or search terms</p>
          <button className="btn btn-primary">
            Upload Your First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXEMPLO 8: Loading Skeleton
// ============================================================================
export const LoadingSkeletonExample = () => {
  const SkeletonCard = () => (
    <div className="asset-card animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="bg-surface-float2 rounded-t-xl" style={{ aspectRatio: '16/9' }}>
        <div className="w-full h-full bg-gradient-to-br from-surface-float to-surface-float2" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-3">
        <div className="h-4 bg-surface-float2 rounded mb-2 w-3/4" />
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
          <div className="w-5 h-5 bg-surface-float2 rounded-full" />
          <div className="h-3 bg-surface-float2 rounded flex-1" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 bg-surface-float2 rounded w-12" />
          <div className="h-3 bg-surface-float2 rounded w-12" />
          <div className="h-3 bg-surface-float2 rounded w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

// ============================================================================
// EXEMPLO 9: Com dados reais da API
// ============================================================================
export const RealAPIExample = () => {
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/assets?page=1&limit=20&sortBy=newest');
        const data = await response.json();
        
        if (data.success) {
          // Transform backend data to match AssetCard interface
          const transformedAssets = data.data.assets.map(asset => ({
            id: asset.id,
            title: asset.title,
            thumbnail: asset.imageUrls?.[0] || asset.thumbnailUrl,
            category: asset.category?.name || 'Uncategorized',
            author: {
              name: asset.user?.username || 'Unknown',
              avatarUrl: asset.user?.avatarUrl
            },
            likes: asset.likes || 0,
            downloads: asset.downloadCount || 0,
            comments: asset.reviewCount || 0,
            uploadedAt: formatTimeAgo(asset.createdAt),
            isLiked: asset.isLikedByUser || false,
            isBookmarked: asset.isBookmarkedByUser || false
          }));
          
          setAssets(transformedAssets);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  if (loading) return <LoadingSkeletonExample />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {assets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================
export default {
  BasicUsageExample,
  MyAssetsExample,
  CollectionDetailExample,
  ProfilePageExample,
  SearchResultsExample,
  InfiniteScrollExample,
  EmptyStateExample,
  LoadingSkeletonExample,
  RealAPIExample
};
