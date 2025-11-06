import { Heart, Download, Eye, MessageCircle, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const AssetCard = ({ asset }) => {
  const [isLiked, setIsLiked] = useState(asset.isLiked || false);
  const [likes, setLikes] = useState(asset.likes || 0);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleCardClick = () => {
    // TODO: Navigate to asset detail page
    console.log('Navigate to asset:', asset.id);
  };

  return (
    <article 
      className="asset-card group"
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-surface-float2">
        <img
          src={asset.thumbnail || 'https://via.placeholder.com/400x225'}
          alt={asset.title}
          className="asset-thumbnail w-full h-48 object-cover"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium">
            {asset.category}
          </span>
        </div>

        {/* Like Button Overlay */}
        <button
          onClick={handleLike}
          className={`
            absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all
            ${isLiked 
              ? 'bg-red-500/90 text-white' 
              : 'bg-black/70 hover:bg-black/90 text-white'
            }
          `}
        >
          <Heart 
            size={18} 
            fill={isLiked ? 'currentColor' : 'none'} 
          />
        </button>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
          <div className="flex gap-2 w-full">
            <button className="btn btn-primary flex-1 justify-center text-sm">
              <Download size={16} />
              Download
            </button>
            <button className="btn btn-secondary p-2">
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-theme-active transition-colors">
          {asset.title}
        </h3>

        {/* Description */}
        {asset.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {asset.description}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          {asset.author.avatar ? (
            <img 
              src={asset.author.avatar} 
              alt={asset.author.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
          )}
          <span className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            {asset.author.name}
          </span>
          <span className="text-text-tertiary text-xs">•</span>
          <span className="text-text-tertiary text-xs">{asset.uploadedAt}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-text-tertiary">
            <span className="flex items-center gap-1">
              <Heart size={16} />
              {likes}
            </span>
            <span className="flex items-center gap-1">
              <Download size={16} />
              {asset.downloads}
            </span>
            {asset.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle size={16} />
                {asset.comments}
              </span>
            )}
          </div>

          <button 
            className="p-1 hover:bg-surface-float2 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Show options menu
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {asset.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-surface-float2 rounded text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-text-tertiary">
                +{asset.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default AssetCard;
