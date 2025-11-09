import { 
  Heart, 
  Download, 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck,
  FolderPlus,
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2
} from 'lucide-react';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import AssetDetailModal from './AssetDetailModal';
import SaveToCollectionDropdown from '../collections/SaveToCollectionDropdown';
import { PLACEHOLDER_IMAGES } from '../../constants';
import { handleImageError } from '../../utils/imageUtils';

const AssetCard = memo(({ asset, showStatus = false }) => {
  // State management
  const [isLiked, setIsLiked] = useState(asset.isLiked || false);
  const [likes, setLikes] = useState(asset.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(asset.isBookmarked || false);
  const [showModal, setShowModal] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  
  // Loading states for micro-interactions
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Refs
  const saveButtonRef = useRef(null);
  const cardRef = useRef(null);

  // Handlers with loading states and API integration
  const handleLike = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = isLiked;
    const previousLikes = likes;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    
    try {
      // TODO: Integrate with API
      // await api.post(`/api/assets/${asset.id}/like`);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API
    } catch (error) {
      // Rollback on error
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      console.error('Failed to like asset:', error);
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, likes, isLiking, asset.id]);

  const handleBookmark = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    const previousBookmarked = isBookmarked;
    
    // Optimistic update
    setIsBookmarked(!isBookmarked);
    
    try {
      // TODO: Integrate with bookmark API
      // await api.post(`/api/assets/${asset.id}/bookmark`);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API
    } catch (error) {
      // Rollback on error
      setIsBookmarked(previousBookmarked);
      console.error('Failed to bookmark asset:', error);
    } finally {
      setIsBookmarking(false);
    }
  }, [isBookmarked, isBookmarking, asset.id]);

  const handleDownload = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // TODO: Integrate with download API
      // window.open(asset.downloadUrl, '_blank');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate download
    } catch (error) {
      console.error('Failed to download asset:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, asset.downloadUrl]);

  const handleCardClick = useCallback(() => {
    // Não abre modal se dropdown estiver aberto
    if (showSaveDropdown) return;
    setShowModal(true);
  }, [showSaveDropdown]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSaveToCollection = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSaveDropdown(prev => !prev);
  }, []);

  const handleCloseSaveDropdown = useCallback(() => {
    setShowSaveDropdown(false);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  // Focus management
  useEffect(() => {
    if (showModal && cardRef.current) {
      cardRef.current.setAttribute('aria-expanded', 'true');
    } else if (cardRef.current) {
      cardRef.current.setAttribute('aria-expanded', 'false');
    }
  }, [showModal]);

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
      ref={cardRef}
      className="asset-card group relative cursor-pointer"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${asset.title} by ${asset.author.name}`}
      aria-expanded="false"
      style={{
        contain: 'layout style paint',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      {/* Thumbnail Container - Otimizado para 60 FPS */}
      <div 
        className="relative overflow-hidden bg-surface-float2 rounded-t-xl"
        style={{ 
          aspectRatio: '16/9',
          contain: 'layout style'
        }}
      >
        <img
          src={asset.thumbnail || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
          alt={asset.title}
          loading="lazy"
          className="asset-thumbnail w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ aspectRatio: '16/9' }}
          onError={handleImageError('thumbnail')}
        />
        
        {/* Gradient Overlay - Sempre visível em mobile, hover em desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" 
             style={{ contain: 'layout style paint' }} />

        {/* Top Bar - Category/Status + Like */}
        <div className="absolute top-0 inset-x-0 flex items-start justify-between p-2.5 z-10">
          {/* Status Badge (Priority) or Category */}
          {statusConfig ? (
            <span className={`flex items-center gap-1.5 px-2.5 py-1.5 backdrop-blur-xl rounded-lg text-xs font-semibold border shadow-lg ${statusConfig.className}`}>
              <statusConfig.icon size={12} strokeWidth={2.5} />
              {statusConfig.label}
            </span>
          ) : (
            <span className="px-2.5 py-1.5 bg-black/90 backdrop-blur-xl rounded-lg text-xs font-semibold border border-white/10 shadow-lg text-white/90">
              {asset.category}
            </span>
          )}

          {/* Like Button - Sempre visível */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`
              group/like p-2 rounded-lg backdrop-blur-xl transition-all duration-200 shadow-lg
              ${isLiked 
                ? 'bg-red-500/95 text-white scale-100' 
                : 'bg-black/90 hover:bg-black text-white/90 hover:text-white hover:scale-105'
              }
              ${isLiking ? 'cursor-wait' : 'cursor-pointer'}
              active:scale-95
            `}
            title={isLiked ? 'Unlike' : 'Like'}
            aria-label={isLiked ? `Unlike ${asset.title}` : `Like ${asset.title}`}
          >
            {isLiking ? (
              <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
            ) : (
              <Heart 
                size={16} 
                fill={isLiked ? 'currentColor' : 'none'}
                strokeWidth={2.5}
                className="transition-transform group-hover/like:scale-110"
              />
            )}
          </button>
        </div>

        {/* Action Bar - Hierarquia Clara (Primary, Secondary, Tertiary) */}
        <div 
          className="absolute inset-x-0 bottom-0 p-3 translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300 ease-out"
          style={{ 
            contain: 'layout style',
            willChange: 'transform'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            {/* PRIMARY: Download - CTA Principal */}
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn btn-primary flex-1 justify-center text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
              title="Download asset (Ctrl+D)"
              aria-label={`Download ${asset.title}`}
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <Download size={16} strokeWidth={2.5} />
              )}
              <span>Download</span>
            </button>

            {/* SECONDARY: Quick Bookmark */}
            <button 
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={`
                group/bookmark btn shadow-xl transition-all duration-200 active:scale-95
                ${isBookmarked 
                  ? 'bg-blue-500/95 text-white border-blue-400/50 hover:bg-blue-600' 
                  : 'bg-black/90 backdrop-blur-xl text-white/90 hover:bg-black hover:text-white border-white/10'
                }
                ${isBookmarking ? 'cursor-wait' : 'cursor-pointer'}
              `}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              aria-label={isBookmarked ? `Remove ${asset.title} from bookmarks` : `Bookmark ${asset.title}`}
            >
              {isBookmarking ? (
                <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
              ) : isBookmarked ? (
                <BookmarkCheck size={16} strokeWidth={2.5} className="transition-transform group-hover/bookmark:scale-110" />
              ) : (
                <Bookmark size={16} strokeWidth={2.5} className="transition-transform group-hover/bookmark:scale-110" />
              )}
            </button>

            {/* TERTIARY: Save to Collection */}
            <button 
              ref={saveButtonRef}
              onClick={handleSaveToCollection}
              className="group/save btn bg-black/90 backdrop-blur-xl text-white/90 hover:bg-black hover:text-white shadow-xl border-white/10 transition-all duration-200 active:scale-95"
              title="Save to collection"
              aria-label={`Save ${asset.title} to collection`}
              aria-expanded={showSaveDropdown}
            >
              <FolderPlus size={16} strokeWidth={2.5} className="transition-transform group-hover/save:scale-110" />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Minimalista e Hierárquico */}
      <div className="p-3" style={{ contain: 'layout style' }}>
        {/* Title - Destaque principal */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-theme-active transition-colors duration-200 leading-tight">
          {asset.title}
        </h3>

        {/* Author Info - Compacto */}
        <div 
          className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/5 cursor-pointer group/author"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Navigate to author profile
          }}
        >
          {asset.author.avatarUrl ? (
            <img 
              src={asset.author.avatarUrl} 
              alt={asset.author.name}
              className="w-5 h-5 rounded-full ring-1 ring-white/5 group-hover/author:ring-theme-active transition-all"
              loading="lazy"
              onError={handleImageError('avatar')}
              style={{ aspectRatio: '1/1' }}
            />
          ) : (
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full ring-1 ring-white/5 group-hover/author:ring-theme-active flex items-center justify-center transition-all">
              <span className="text-white text-[10px] font-bold">
                {asset.author.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
            <span className="text-xs text-text-secondary group-hover/author:text-text-primary transition-colors font-medium truncate">
              {asset.author.name}
            </span>
            <span className="text-text-tertiary text-[10px] flex-shrink-0">• {asset.uploadedAt}</span>
          </div>
        </div>

        {/* Stats - Simplificado e Visual Hierarchy */}
        <div className="flex items-center gap-3.5 text-xs">
          {/* Likes - Destaque se tiver muitos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(e);
            }}
            className={`
              flex items-center gap-1 transition-all duration-200 cursor-pointer
              ${likes > 0 
                ? 'text-text-secondary hover:text-red-500' 
                : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
            title="Likes"
          >
            <Heart 
              size={14} 
              strokeWidth={2} 
              fill={isLiked ? 'currentColor' : 'none'}
              className="transition-transform hover:scale-110"
            />
            <span className="font-medium tabular-nums">{likes}</span>
          </button>

          {/* Downloads */}
          <span 
            className="flex items-center gap-1 text-text-tertiary hover:text-blue-500 transition-colors cursor-pointer"
            title="Downloads"
          >
            <Download size={14} strokeWidth={2} />
            <span className="font-medium tabular-nums">{asset.downloads || 0}</span>
          </span>

          {/* Comments - Só mostra se tiver */}
          {asset.comments > 0 && (
            <span 
              className="flex items-center gap-1 text-text-tertiary hover:text-green-500 transition-colors cursor-pointer"
              title="Comments"
            >
              <MessageCircle size={14} strokeWidth={2} />
              <span className="font-medium tabular-nums">{asset.comments}</span>
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bookmark indicator - Passivo */}
          {isBookmarked && (
            <span className="text-blue-500/70" title="Bookmarked">
              <BookmarkCheck size={14} strokeWidth={2} />
            </span>
          )}
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
