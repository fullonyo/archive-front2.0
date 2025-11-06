import { Shirt, Globe, Sparkles, Wand2, Box, Star, Grid3x3, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExplorePage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'avatars',
      name: 'Avatars',
      icon: Shirt,
      description: 'Complete avatar models and packages',
      count: 1234,
      color: 'from-blue-500 to-cyan-500',
      featured: true
    },
    {
      id: 'worlds',
      name: 'Worlds',
      icon: Globe,
      description: 'Virtual worlds and environments',
      count: 856,
      color: 'from-green-500 to-emerald-500',
      featured: true
    },
    {
      id: 'shaders',
      name: 'Shaders',
      icon: Sparkles,
      description: 'Visual effects and shaders',
      count: 432,
      color: 'from-purple-500 to-pink-500',
      featured: true
    },
    {
      id: 'effects',
      name: 'Effects',
      icon: Wand2,
      description: 'Particle effects and VFX',
      count: 678,
      color: 'from-orange-500 to-red-500',
      featured: false
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: Star,
      description: 'Avatar accessories and props',
      count: 923,
      color: 'from-yellow-500 to-orange-500',
      featured: false
    },
    {
      id: 'tools',
      name: 'Tools',
      icon: Box,
      description: 'Unity scripts and tools',
      count: 345,
      color: 'from-indigo-500 to-blue-500',
      featured: false
    },
    {
      id: 'animations',
      name: 'Animations',
      icon: Package,
      description: 'Animation packs and poses',
      count: 567,
      color: 'from-pink-500 to-rose-500',
      featured: false
    },
    {
      id: 'textures',
      name: 'Textures',
      icon: Grid3x3,
      description: 'Texture packs and materials',
      count: 789,
      color: 'from-teal-500 to-cyan-500',
      featured: false
    },
  ];

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Explore Categories</h1>
        <p className="text-text-secondary">Browse assets by category and find what you need</p>
      </div>

      {/* Featured Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(cat => cat.featured).map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="card p-0 overflow-hidden text-left group hover:scale-[1.02] transition-transform"
              >
                <div className={`h-32 bg-gradient-to-br ${category.color} relative`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={48} className="text-white/90" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-theme-active transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-text-tertiary text-sm">
                      {category.count.toLocaleString()} assets
                    </span>
                    <span className="text-theme-active text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Browse →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* All Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="card p-6 text-left group hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-theme-active transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-text-tertiary text-xs">
                      {category.count.toLocaleString()} assets
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Tags */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
        <div className="card p-6">
          <div className="flex flex-wrap gap-2">
            {['anime', 'realistic', 'cyberpunk', 'fantasy', 'cute', 'horror', 'scifi', 'medieval', 
              'modern', 'nature', 'urban', 'space', 'underwater', 'desert', 'winter', 'summer'].map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 bg-surface-float2 hover:bg-theme-active/20 hover:text-theme-active rounded-lg text-sm transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
