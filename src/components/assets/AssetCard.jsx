import { Heart, Download, Eye, MessageCircle, MoreVertical, Clock, CheckCircle, XCircle, Bookmark } from 'lucide-react';
import { useState, useCallback, memo, useRef } from 'react';
import AssetDetailModal from './AssetDetailModal';
import SaveToCollectionDropdown from '../collections/SaveToCollectionDropdown';
import { PLACEHOLDER_IMAGES } from '../../constants';
import { handleImageError } from '../../utils/imageUtils';

const AssetCard = memo(({ asset, showStatus = false }) => {
  const [isLiked, setIsLiked] = useState(asset.isLiked || false);
  const [likes, setLikes] = useState(asset.likes || 0);
  const [showModal, setShowModal] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const saveButtonRef = useRef(null);

  const handleLike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  }, [isLiked, likes]);

  const handleCardClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSaveClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSaveDropdown(prev => !prev);
  }, []);

  const handleCloseSaveDropdown = useCallback(() => {
    setShowSaveDropdown(false);
  }, []);

  // Status badge config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pending', 
          icon: Clock, 
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
        };
      case 'published':
        return { 
          label: 'Published', 
          icon: CheckCircle, 
          className: 'bg-green-500/20 text-green-400 border-green-500/30' 
        };
      case 'draft':
        return { 
          label: 'Draft', 
          icon: XCircle, 
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
        };
      default:
        return null;
    }
  };

  const statusConfig = showStatus && asset.status ? getStatusConfig(asset.status) : null;

  return (
    <article 
      className="asset-card group relative"
      onClick={handleCardClick}
    >
      {/* Thumbnail Container - Mais compacto */}
      <div className="relative overflow-hidden bg-surface-float2 rounded-t-xl">
        <img
          src={asset.thumbnail || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
          alt={asset.title}
          loading="lazy"
          className="asset-thumbnail w-full h-40 object-cover"
          onError={handleImageError('thumbnail')}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge - Top left if showStatus */}
        {statusConfig ? (
          <div className="absolute top-2 left-2 z-10">
            <span className={`flex items-center gap-1 px-2.5 py-1 backdrop-blur-md rounded-full text-xs font-medium border ${statusConfig.className}`}>
              <statusConfig.icon size={12} />
              {statusConfig.label}
            </span>
          </div>
        ) : (
          /* Category Badge - Menor */
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
              {asset.category}
            </span>
          </div>
        )}

        {/* Like Button - Menor */}
        <button
          onClick={handleLike}
          className={`
            absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200
            ${isLiked 
              ? 'bg-red-500/90 text-white scale-110' 
              : 'bg-black/80 hover:bg-black/90 text-white hover:scale-110'
            }
          `}
        >
          <Heart 
            size={16} 
            fill={isLiked ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </button>

        {/* Hover Actions - Compacto */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button 
              ref={saveButtonRef}
              onClick={handleSaveClick}
              className="btn bg-black/80 backdrop-blur-md text-white hover:bg-black p-2 shadow-lg"
              title="Save to Collection"
            >
              <Bookmark size={14} />
            </button>
            <button className="btn btn-primary flex-1 justify-center text-xs py-1.5 shadow-lg">
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button className="btn bg-black/80 backdrop-blur-md text-white hover:bg-black p-2 shadow-lg">
              <Eye size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Mais compacto */}
      <div className="p-3">
        {/* Title - Menor */}
        <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-theme-active transition-colors leading-tight">
          {asset.title}
        </h3>

        {/* Description - Removida para economizar espaço */}
        
        {/* Author Info - Compacto */}
        <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/5">
          {asset.author.avatarUrl ? (
            <img 
              src={asset.author.avatarUrl} 
              alt={asset.author.name}
              className="w-5 h-5 rounded-full ring-1 ring-surface-float2"
              loading="lazy"
              onError={handleImageError('avatar')}
            />
          ) : (
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full ring-1 ring-surface-float2 flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">
                {asset.author.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer font-medium truncate block">
              {asset.author.name}
            </span>
          </div>
          <span className="text-text-tertiary text-xs flex-shrink-0">{asset.uploadedAt}</span>
        </div>

        {/* Stats - Mais compacto */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-text-tertiary">
            <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
              <Heart size={14} strokeWidth={2} />
              <span className="font-medium">{likes}</span>
            </span>
            <span className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
              <Download size={14} strokeWidth={2} />
              <span className="font-medium">{asset.downloads}</span>
            </span>
            {asset.comments > 0 && (
              <span className="flex items-center gap-1 hover:text-green-500 transition-colors cursor-pointer">
                <MessageCircle size={14} strokeWidth={2} />
                <span className="font-medium">{asset.comments}</span>
              </span>
            )}
          </div>

          <button 
            className="p-1 hover:bg-surface-float2 rounded transition-colors text-text-tertiary hover:text-text-primary"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Show options menu
            }}
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Save to Collection Dropdown */}
      <SaveToCollectionDropdown
        isOpen={showSaveDropdown}
        onClose={handleCloseSaveDropdown}
        assetId={asset.id}
        assetTitle={asset.title}
        buttonRef={saveButtonRef}
      />

      {/* Asset Detail Modal */}
      <AssetDetailModal 
        asset={asset}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </article>
  );
});

AssetCard.displayName = 'AssetCard';

export default AssetCard;
