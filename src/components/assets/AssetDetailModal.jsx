import { 
  X, 
  Heart, 
  Download, 
  MessageSquare, 
  Share2, 
  User, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Copy, 
  Flag,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Check,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Package
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { handleImageError } from '../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../constants';
import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';

const AssetDetailModal = ({ asset, isOpen, onClose }) => {
  // Normalize author/user naming (backend uses 'user', we use 'author' in UI)
  const author = useMemo(() => asset?.author || asset?.user, [asset]);
  
  // Backend returns tags and imageUrls as arrays after normalization
  const tags = useMemo(() => Array.isArray(asset?.tags) ? asset.tags : [], [asset?.tags]);
  const imageUrls = useMemo(() => Array.isArray(asset?.imageUrls) ? asset.imageUrls : [], [asset?.imageUrls]);
  
  // Normalize category - can be string or object {id, name, icon}
  const categoryName = useMemo(() => {
    if (!asset?.category) return 'Uncategorized';
    return typeof asset.category === 'string' ? asset.category : asset.category.name;
  }, [asset?.category]);
  
  // Thumbnail URL - Backend já normaliza, use direto
  const thumbnailUrl = useMemo(() => {
    return asset?.thumbnail || asset?.thumbnailUrl || null;
  }, [asset?.thumbnail, asset?.thumbnailUrl]);
  
  // State management
  const [isLiked, setIsLiked] = useState(asset?.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(asset?.isBookmarked || false);
  const [isFollowing, setIsFollowing] = useState(author?.isFollowing || false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // Mobile tabs
  
  // Loading states
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isDownloadingSidebar, setIsDownloadingSidebar] = useState(false);
  const [isDownloadingMain, setIsDownloadingMain] = useState(false);
  const [isFollowingAction, setIsFollowingAction] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Refs
  const modalRef = useRef(null);
  const shareButtonRef = useRef(null);

  // Gallery images - USE DIRECTLY from backend (already normalized with proxy URLs)
  const images = useMemo(() => {
    // Backend já converte tudo para proxy URLs, então use direto
    return imageUrls.length > 0 ? imageUrls : [thumbnailUrl].filter(Boolean);
  }, [thumbnailUrl, imageUrls]);

  // Sync states when asset changes
  useEffect(() => {
    if (asset) {
      setIsLiked(asset.isLiked || false);
      setIsBookmarked(asset.isBookmarked || false);
    }
  }, [asset]);

  // Sync following state when author changes
  useEffect(() => {
    if (author) {
      setIsFollowing(author.isFollowing || false);
    }
  }, [author]);

  // Close on ESC key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showLightbox) {
          setShowLightbox(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showLightbox, onClose]);

  // Optimized backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Like handler with loading state and API integration
  const handleLike = useCallback(async (e) => {
    e?.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!isLiked);
    
    try {
      await assetService.toggleFavorite(asset.id);
    } catch (error) {
      setIsLiked(previousLiked); // Rollback
      console.error('Failed to like asset:', error);
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, isLiking, asset?.id]);

  // Bookmark handler with loading state
  const handleBookmark = useCallback(async (e) => {
    e?.stopPropagation();
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    const previousBookmarked = isBookmarked;
    
    // Optimistic update
    setIsBookmarked(!isBookmarked);
    
    try {
      await assetService.toggleBookmark(asset.id);
    } catch (error) {
      setIsBookmarked(previousBookmarked); // Rollback
      console.error('Failed to bookmark asset:', error);
    } finally {
      setIsBookmarking(false);
    }
  }, [isBookmarked, isBookmarking, asset?.id]);

  // Download handlers with separate loading states
  const handleDownloadSidebar = useCallback(async () => {
    if (isDownloadingSidebar) return;
    
    setIsDownloadingSidebar(true);
    
    try {
      const response = await assetService.downloadAsset(asset.id);
      if (response.success && response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download asset:', error);
      alert('Failed to download asset. Please try again.');
    } finally {
      setIsDownloadingSidebar(false);
    }
  }, [isDownloadingSidebar, asset?.id]);

  const handleDownloadMain = useCallback(async () => {
    if (isDownloadingMain) return;
    
    setIsDownloadingMain(true);
    
    try {
      const response = await assetService.downloadAsset(asset.id);
      if (response.success && response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download asset:', error);
      alert('Failed to download asset. Please try again.');
    } finally {
      setIsDownloadingMain(false);
    }
  }, [isDownloadingMain, asset?.id]);

  // Optimized share handler
  const handleShare = useCallback((platform) => {
    const url = `${window.location.origin}/asset/${asset.id}`;
    const text = `Check out ${asset.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      discord: `https://discord.com/channels/@me`, // Discord doesn't have direct share URL
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
      setShowShareMenu(false);
    } else if (platform === 'discord') {
      navigator.clipboard.writeText(url);
      alert('Link copied! Paste it in Discord.');
      setShowShareMenu(false);
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  }, [asset]);

  // Image navigation
  const handlePreviousImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Follow handler with loading state
  const handleFollow = useCallback(async (e) => {
    e?.stopPropagation();
    if (isFollowingAction || !author?.id) return;
    
    setIsFollowingAction(true);
    const previousFollowing = isFollowing;
    
    // Optimistic update
    setIsFollowing(!isFollowing);
    
    try {
      await userService.toggleFollow(author.id);
    } catch (error) {
      setIsFollowing(previousFollowing); // Rollback
      console.error('Failed to follow user:', error);
    } finally {
      setIsFollowingAction(false);
    }
  }, [isFollowing, isFollowingAction, author?.id]);

  // Optimized close button handler
  const handleCloseClick = useCallback((e) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  // Don't render if not open
  if (!isOpen || !asset) return null;

  // Render modal in portal for better performance and z-index management
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-modal-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        contain: 'layout style paint',
        willChange: 'opacity'
      }}
    >
      <div 
        className="relative bg-surface-float rounded-2xl shadow-2xl border border-white/10 max-w-7xl w-full max-h-[90vh] overflow-hidden flex animate-scale-in" 
        ref={modalRef}
        style={{ 
          contain: 'layout style paint',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Content - Left Side */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Fixed */}
          <div 
            className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-float sticky top-0 z-10"
            style={{ contain: 'layout style' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {author?.avatarUrl ? (
                  <img 
                    src={author.avatarUrl} 
                    alt={author.username} 
                    className="w-full h-full rounded-full object-cover" 
                    loading="lazy"
                    onError={handleImageError('avatar')}
                  />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{author?.username || 'Unknown'}</h3>
                <p className="text-xs text-text-tertiary">{asset.uploadedAt}</p>
              </div>
            </div>
            <button 
              onClick={handleCloseClick}
              className="p-2 hover:bg-surface-float2 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              contain: 'layout style paint',
              willChange: 'scroll-position'
            }}
          >
            {/* Image Gallery */}
            <div className="relative bg-surface-base group/gallery">
              <div className="relative max-h-[70vh] flex items-center justify-center">
                <img 
                  src={images[currentImageIndex] || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL} 
                  alt={`${asset.title} - Image ${currentImageIndex + 1}`}
                  className="max-h-[70vh] w-full object-contain cursor-zoom-in"
                  loading="lazy"
                  onError={handleImageError('thumbnail')}
                  onClick={() => setShowLightbox(true)}
                />
                
                {/* Zoom indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                  <div className="px-3 py-1.5 bg-black/90 backdrop-blur-xl rounded-lg text-xs font-medium border border-white/10 flex items-center gap-1.5">
                    <ZoomIn size={14} />
                    Click to enlarge
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1.5 bg-surface-float/95 backdrop-blur-xl rounded-lg text-xs font-semibold border border-white/10 shadow-lg">
                    {categoryName}
                  </span>
                </div>

                {/* Gallery Navigation (if multiple images) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviousImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/90 backdrop-blur-xl hover:bg-black rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover/gallery:opacity-100 shadow-xl"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/90 backdrop-blur-xl hover:bg-black rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover/gallery:opacity-100 shadow-xl"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 bg-black/90 backdrop-blur-xl rounded-lg text-xs font-medium border border-white/10">
                        {currentImageIndex + 1} / {images.length}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery (if multiple images) */}
              {images.length > 1 && (
                <div className="p-3 bg-surface-base/50 border-t border-white/5">
                  <div className="flex gap-2 overflow-x-auto overscroll-contain pb-1" style={{ scrollbarWidth: 'thin' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`
                          relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                          ${idx === currentImageIndex 
                            ? 'border-theme-active ring-2 ring-theme-active/50' 
                            : 'border-white/10 hover:border-white/30'
                          }
                        `}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={handleImageError('thumbnail')}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
              {/* Title & Description */}
              <div>
                <h1 id="modal-title" className="text-2xl font-bold mb-2">{asset.title}</h1>
                <p className="text-text-secondary leading-relaxed">
                  {asset.description || 'High quality VRChat asset with amazing features and optimized performance.'}
                </p>
              </div>

              {/* PRIMARY ACTION - Download (Full Width, Most Prominent) */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadMain}
                  disabled={isDownloadingMain}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:cursor-wait flex items-center justify-center gap-2.5"
                  aria-label={`Download ${asset.title}`}
                >
                  {isDownloadingMain ? (
                    <>
                      <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} strokeWidth={2.5} />
                      <span>Download Asset</span>
                    </>
                  )}
                </button>

                {/* SECONDARY ACTIONS - Like & Bookmark (Side by Side) */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`
                      flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm border
                      ${isLiked 
                        ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30' 
                        : 'bg-surface-float2 text-text-secondary border-white/5 hover:bg-surface-base hover:text-text-primary hover:border-white/10'
                      }
                      ${isLiking ? 'cursor-wait' : 'cursor-pointer'}
                      active:scale-95
                    `}
                    aria-label={isLiked ? `Unlike ${asset.title}` : `Like ${asset.title}`}
                  >
                    {isLiking ? (
                      <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                    ) : (
                      <Heart 
                        size={16} 
                        strokeWidth={2.5}
                        className={isLiked ? 'fill-current' : ''} 
                      />
                    )}
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                    className={`
                      flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm border
                      ${isBookmarked 
                        ? 'bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30' 
                        : 'bg-surface-float2 text-text-secondary border-white/5 hover:bg-surface-base hover:text-text-primary hover:border-white/10'
                      }
                      ${isBookmarking ? 'cursor-wait' : 'cursor-pointer'}
                      active:scale-95
                    `}
                    aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  >
                    {isBookmarking ? (
                      <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                    ) : isBookmarked ? (
                      <BookmarkCheck size={16} strokeWidth={2.5} />
                    ) : (
                      <Bookmark size={16} strokeWidth={2.5} />
                    )}
                    <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>
                </div>

                {/* TERTIARY ACTION - Share (Icon-only with dropdown) */}
                <div className="relative">
                  <button 
                    ref={shareButtonRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface-float2 hover:bg-surface-base rounded-lg transition-all text-sm border border-white/5 hover:border-white/10"
                    aria-expanded={showShareMenu}
                  >
                    <Share2 size={16} strokeWidth={2.5} />
                    <span>Share</span>
                  </button>

                  {/* Share Menu - Portal for better positioning */}
                  {showShareMenu && createPortal(
                    <>
                      {/* Backdrop to close menu */}
                      <div 
                        className="fixed inset-0 z-[60]" 
                        onClick={() => setShowShareMenu(false)}
                      />
                      {/* Menu */}
                      <div className="fixed z-[61] w-56 bg-surface-float border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-1">
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full px-3 py-2.5 text-sm text-left hover:bg-surface-float2 rounded-lg flex items-center gap-3 transition-colors"
                          >
                            {copySuccess ? (
                              <>
                                <Check size={16} className="text-green-500" strokeWidth={2.5} />
                                <span className="text-green-500 font-medium">Link copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={16} strokeWidth={2} />
                                <span>Copy link</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleShare('discord')}
                            className="w-full px-3 py-2.5 text-sm text-left hover:bg-surface-float2 rounded-lg flex items-center gap-3 transition-colors"
                          >
                            <ExternalLink size={16} strokeWidth={2} />
                            <span>Share on Discord</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full px-3 py-2.5 text-sm text-left hover:bg-surface-float2 rounded-lg flex items-center gap-3 transition-colors"
                          >
                            <ExternalLink size={16} strokeWidth={2} />
                            <span>Share on X</span>
                          </button>
                          <button
                            onClick={() => handleShare('telegram')}
                            className="w-full px-3 py-2.5 text-sm text-left hover:bg-surface-float2 rounded-lg flex items-center gap-3 transition-colors"
                          >
                            <ExternalLink size={16} strokeWidth={2} />
                            <span>Share on Telegram</span>
                          </button>
                        </div>
                        <div className="border-t border-white/5 p-1">
                          <button className="w-full px-3 py-2.5 text-sm text-left hover:bg-red-500/10 rounded-lg text-red-500 flex items-center gap-3 transition-colors">
                            <Flag size={16} strokeWidth={2} />
                            <span>Report asset</span>
                          </button>
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-6 text-sm py-4 border-y border-white/5">
                <div className="flex items-center gap-1.5 text-text-secondary hover:text-red-500 transition-colors cursor-pointer">
                  <Heart size={16} strokeWidth={2} className={isLiked ? 'fill-current text-red-500' : ''} />
                  <span className="font-medium tabular-nums">{asset.likes?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary hover:text-blue-500 transition-colors cursor-pointer">
                  <Download size={16} strokeWidth={2} />
                  <span className="font-medium tabular-nums">{asset.downloads?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary hover:text-green-500 transition-colors cursor-pointer">
                  <MessageSquare size={16} strokeWidth={2} />
                  <span className="font-medium tabular-nums">{asset.comments || 0}</span>
                </div>
                {isBookmarked && (
                  <div className="ml-auto">
                    <span className="flex items-center gap-1.5 text-blue-500/70 text-xs">
                      <BookmarkCheck size={14} strokeWidth={2} />
                      <span>Bookmarked</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-text-tertiary" />
                    <h3 className="font-semibold text-sm">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag, index) => (
                      <span 
                        key={`${tag}-${index}`}
                        className="px-3 py-1.5 bg-surface-float2 hover:bg-surface-base text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-base/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-float rounded-lg">
                    <Calendar size={16} className="text-theme-active" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Uploaded</p>
                    <p className="text-sm font-medium">{asset.uploadedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-float rounded-lg">
                    <Tag size={16} className="text-theme-active" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Category</p>
                    <p className="text-sm font-medium">{categoryName}</p>
                  </div>
                </div>
              </div>

              {/* Comments Section Preview */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Comments ({asset.comments})
                </h3>
                <div className="bg-surface-base/30 rounded-lg p-4 text-center text-sm text-text-tertiary">
                  Comments section coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Download Options & Details */}
        <aside className="w-80 border-l border-white/5 bg-surface-base/30 flex-shrink-0 hidden lg:flex flex-col">
          <div 
            className="p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              contain: 'layout style paint',
              willChange: 'scroll-position'
            }}
          >
            {/* Download Options Card */}
            <div className="bg-surface-float/50 rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3 flex items-center gap-2">
                <Package size={14} />
                Download Options
              </h3>
              
              {/* Primary Download Button */}
              <button
                onClick={handleDownloadSidebar}
                disabled={isDownloadingSidebar}
                className="w-full mb-3 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-semibold text-sm shadow-lg transition-all active:scale-95 disabled:cursor-wait flex items-center justify-center gap-2"
                aria-label={`Download ${asset.title}`}
              >
                {isDownloadingSidebar ? (
                  <>
                    <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} strokeWidth={2.5} />
                    <span>Download Asset</span>
                  </>
                )}
              </button>

              {/* External Link Button */}
              <a
                href={asset.externalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-surface-float2 hover:bg-surface-base text-text-secondary hover:text-text-primary rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-white/10"
              >
                <ExternalLink size={16} strokeWidth={2} />
                <span>External Link</span>
              </a>

              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-text-tertiary mb-2">File Size</p>
                <p className="text-xs font-medium mb-3">{asset.fileSize || '23.4 MB'}</p>
                
                <p className="text-xs text-text-tertiary mb-2">Requirements</p>
                <div className="space-y-1">
                  <p className="text-xs">• Unity 2019.4.31f1+</p>
                  <p className="text-xs">• VRChat SDK 3.0</p>
                  <p className="text-xs">• Poiyomi Shader 8.0+</p>
                </div>
              </div>
            </div>

            {/* License & Usage */}
            <div className="bg-surface-float/50 rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">License</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <p>Personal & Commercial use</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <p>Modifications allowed</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p>No redistribution</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p>Attribution required</p>
                </div>
              </div>
            </div>

            {/* Builder Info */}
            <div className="bg-surface-float/50 rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3 flex items-center gap-2">
                <User size={14} />
                About Builder
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-theme-active transition-all">
                  {author?.avatarUrl ? (
                    <img 
                      src={author.avatarUrl} 
                      alt={author.username} 
                      className="w-full h-full rounded-full object-cover" 
                      loading="lazy"
                      onError={handleImageError('avatar')}
                    />
                  ) : (
                    <User size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm hover:text-theme-active transition-colors cursor-pointer">
                    {author?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-text-tertiary">Builder • {asset.uploadedAt}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Navigate to profile
                    console.log('Navigate to profile:', author?.id);
                  }}
                  className="px-2.5 py-1.5 bg-surface-float2 hover:bg-surface-base text-text-secondary hover:text-text-primary rounded-md text-xs font-medium transition-all border border-white/5 hover:border-white/10"
                >
                  Profile
                </button>
                <button 
                  onClick={handleFollow}
                  disabled={isFollowingAction}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                    ${isFollowing 
                      ? 'bg-surface-float2 hover:bg-surface-base text-text-primary border border-white/10' 
                      : 'bg-theme-active hover:bg-theme-hover text-white'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFollowingAction ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 size={12} className="animate-spin" />
                      {isFollowing ? 'Unfollowing...' : 'Following...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      {isFollowing && <Check size={12} />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Version History (if applicable) */}
            <div className="bg-surface-float/50 rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">Version History</h3>
              <div className="space-y-3">
                <div className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">v1.2.0</span>
                    <span className="text-xs text-text-tertiary">Current</span>
                  </div>
                  <p className="text-xs text-text-secondary">Bug fixes and performance improvements</p>
                  <p className="text-xs text-text-tertiary mt-1">{asset.uploadedAt}</p>
                </div>
                <div className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">v1.1.0</span>
                    <span className="text-xs text-text-tertiary">2w ago</span>
                  </div>
                  <p className="text-xs text-text-secondary">Added new features and optimizations</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Image Lightbox (Fullscreen) */}
      {showLightbox && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-modal-fade-in"
          onClick={() => setShowLightbox(false)}
          style={{
            contain: 'layout style paint',
            willChange: 'opacity'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-3 bg-black/80 backdrop-blur-xl hover:bg-black rounded-lg transition-all z-10"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 px-3 py-2 bg-black/80 backdrop-blur-xl rounded-lg text-sm font-medium z-10">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/80 backdrop-blur-xl hover:bg-black rounded-lg transition-all z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/80 backdrop-blur-xl hover:bg-black rounded-lg transition-all z-10"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[currentImageIndex]}
            alt={`${asset.title} - Fullscreen`}
            className="max-h-[95vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
};

export default AssetDetailModal;
