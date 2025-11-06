import { useState, useEffect } from 'react';
import AssetCard from '../components/assets/AssetCard';
import { TrendingUp, Clock, Sparkles, Filter } from 'lucide-react';

const ForYouPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data - será substituído com API real
  useEffect(() => {
    const mockAssets = [
      {
        id: 1,
        title: 'Anime Girl Avatar - Complete Package',
        description: 'High quality anime style avatar with full body tracking support and custom animations',
        category: 'Avatars',
        thumbnail: 'https://via.placeholder.com/400x225',
        author: {
          name: 'ArtistName',
          avatar: null
        },
        uploadedAt: '2 hours ago',
        likes: 145,
        downloads: 523,
        comments: 23,
        tags: ['anime', 'avatar', 'vrchat', 'fullbody'],
        isLiked: false
      },
      {
        id: 2,
        title: 'Cyberpunk Neon Shader Pack',
        description: 'Stunning cyberpunk-themed shaders for your worlds and avatars',
        category: 'Shaders',
        thumbnail: 'https://via.placeholder.com/400x225',
        author: {
          name: 'TechCreator',
          avatar: null
        },
        uploadedAt: '5 hours ago',
        likes: 89,
        downloads: 234,
        comments: 12,
        tags: ['shader', 'cyberpunk', 'neon'],
        isLiked: false
      },
      {
        id: 3,
        title: 'Fantasy Medieval World',
        description: 'Complete medieval fantasy world with interactive elements',
        category: 'Worlds',
        thumbnail: 'https://via.placeholder.com/400x225',
        author: {
          name: 'WorldBuilder',
          avatar: null
        },
        uploadedAt: '1 day ago',
        likes: 312,
        downloads: 1024,
        comments: 45,
        tags: ['world', 'medieval', 'fantasy'],
        isLiked: true
      },
      {
        id: 4,
        title: 'Particle Effects Collection',
        description: 'Over 50 particle effects ready to use in your projects',
        category: 'Effects',
        thumbnail: 'https://via.placeholder.com/400x225',
        author: {
          name: 'FXMaster',
          avatar: null
        },
        uploadedAt: '3 days ago',
        likes: 201,
        downloads: 678,
        comments: 18,
        tags: ['particles', 'vfx', 'effects'],
        isLiked: false
      },
      {
        id: 5,
        title: 'Realistic Hair Physics System',
        description: 'Advanced hair physics for realistic movement and collisions',
        category: 'Tools',
        thumbnail: 'https://via.placeholder.com/400x225',
        author: {
          name: 'PhysicsGuru',
          avatar: null
        },
        uploadedAt: '4 days ago',
        likes: 156,
        downloads: 445,
        comments: 31,
        tags: ['physics', 'hair', 'tools'],
        isLiked: false
      },
      {
        id: 6,
        title: 'Kawaii Accessories Pack',
        description: 'Cute accessories bundle with over 30 items',
        category: 'Accessories',
        thumbnail: 'https://via.placeholder.com/400x225',
        author: {
          name: 'CuteDesigns',
          avatar: null
        },
        uploadedAt: '1 week ago',
        likes: 423,
        downloads: 1523,
        comments: 67,
        tags: ['kawaii', 'accessories', 'cute'],
        isLiked: false
      },
    ];

    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
    }, 1000);
  }, []);

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: Clock },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'popular', label: 'Popular', icon: Sparkles },
  ];

  const categories = ['all', 'Avatars', 'Worlds', 'Shaders', 'Effects', 'Tools', 'Accessories'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">For You</h1>
          <p className="text-text-secondary">Latest assets uploaded by the community</p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Sort Options */}
        <div className="flex gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`
                  btn flex items-center gap-2 text-sm
                  ${sortBy === option.value ? 'btn-primary' : 'btn-secondary'}
                `}
              >
                <Icon size={16} />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter size={16} className="text-text-tertiary flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${filterCategory === category
                  ? 'bg-theme-active text-white'
                  : 'bg-surface-float text-text-secondary hover:bg-surface-float2 hover:text-text-primary'
                }
              `}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-surface-float2 h-48 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-surface-float2 rounded w-3/4" />
                <div className="h-3 bg-surface-float2 rounded w-full" />
                <div className="h-3 bg-surface-float2 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && assets.length > 0 && (
        <div className="flex justify-center pt-6">
          <button className="btn btn-secondary">
            Load More Assets
          </button>
        </div>
      )}
    </div>
  );
};

export default ForYouPage;
