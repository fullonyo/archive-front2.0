import { X, Heart, Download, MessageSquare, Share2, User, Calendar, Tag, ExternalLink, Copy, Flag } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const AssetDetailModal = ({ asset, isOpen, onClose }) => {
  const [isLiked, setIsLiked] = useState(asset?.isLiked || false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const modalRef = useRef(null);

  // Close on ESC key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Optimized backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Optimized share handler
  const handleShare = useCallback((platform) => {
    const url = `${window.location.origin}/asset/${asset.id}`;
    const text = `Check out ${asset.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setShowShareMenu(false);
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  }, [asset]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative bg-surface-float rounded-2xl shadow-2xl border border-white/10 max-w-7xl w-full max-h-[90vh] overflow-hidden flex animate-scale-in" 
        ref={modalRef}
        style={{ 
          contain: 'layout style paint',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
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
                {asset.author?.avatar ? (
                  <img src={asset.author.avatar} alt={asset.author.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{asset.author?.name || 'Unknown'}</h3>
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
            {/* Image/Thumbnail */}
            <div className="relative aspect-video bg-surface-base">
              <img 
                src={asset.thumbnail} 
                alt={asset.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-surface-float/90 backdrop-blur-sm rounded-lg text-xs font-medium border border-white/10">
                  {asset.category}
                </span>
              </div>
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

              {/* Stats & Actions */}
              <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-white/5">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                    <span className="font-medium">{asset.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Download size={16} />
                    <span className="font-medium">{asset.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <MessageSquare size={16} />
                    <span className="font-medium">{asset.comments}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm
                      ${isLiked 
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                        : 'bg-surface-float2 text-text-secondary hover:bg-surface-base hover:text-text-primary'}
                    `}
                  >
                    <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-theme-active hover:bg-theme-hover text-white rounded-lg font-medium transition-all text-sm">
                    <Download size={16} />
                    Download
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2 bg-surface-float2 hover:bg-surface-base rounded-lg transition-colors"
                    >
                      <Share2 size={18} />
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface-float border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 animate-slide-down">
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-surface-float2 flex items-center gap-3 transition-colors"
                        >
                          <Copy size={16} />
                          Copy link
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-surface-float2 flex items-center gap-3 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Share on X
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-surface-float2 flex items-center gap-3 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Share on Facebook
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-surface-float2 flex items-center gap-3 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Share on WhatsApp
                        </button>
                        <div className="border-t border-white/5">
                          <button className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-500/10 text-red-500 flex items-center gap-3 transition-colors">
                            <Flag size={16} />
                            Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-text-tertiary" />
                    <h3 className="font-semibold text-sm">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.slice(0, 10).map((tag, index) => (
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
                    <p className="text-sm font-medium">{asset.category}</p>
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

        {/* Right Sidebar - Additional Info */}
        <aside className="w-80 border-l border-white/5 bg-surface-base/30 flex-shrink-0 hidden lg:flex flex-col">
          <div 
            className="p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              contain: 'layout style paint',
              willChange: 'scroll-position'
            }}
          >
            {/* Author Card */}
            <div className="bg-surface-float/50 rounded-xl p-3 border border-white/5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Author</h3>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {asset.author?.avatar ? (
                    <img src={asset.author.avatar} alt={asset.author.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{asset.author?.name || 'Unknown'}</p>
                  <p className="text-xs text-text-tertiary">Creator</p>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 bg-theme-active hover:bg-theme-hover text-white rounded-lg text-xs font-medium transition-colors">
                Follow
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-surface-float/50 rounded-xl p-3 border border-white/5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Statistics</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Views</span>
                  <span className="text-xs font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Likes</span>
                  <span className="text-xs font-semibold">{asset.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Downloads</span>
                  <span className="text-xs font-semibold">{asset.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Comments</span>
                  <span className="text-xs font-semibold">{asset.comments}</span>
                </div>
              </div>
            </div>

            {/* File Info Card */}
            <div className="bg-surface-float/50 rounded-xl p-3 border border-white/5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">File Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">Category</p>
                  <p className="text-xs font-medium">{asset.category}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">Uploaded</p>
                  <p className="text-xs font-medium">{asset.uploadedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">File Size</p>
                  <p className="text-xs font-medium">-</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">Format</p>
                  <p className="text-xs font-medium">Unity Package</p>
                </div>
              </div>
            </div>

            {/* Related Squads/Groups */}
            <div className="bg-surface-float/50 rounded-xl p-3 border border-white/5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Related</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 p-1.5 hover:bg-surface-float rounded-lg transition-colors cursor-pointer">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs font-bold">
                    VR
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">VRChat Assets</p>
                    <p className="text-xs text-text-tertiary">1.2K members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 hover:bg-surface-float rounded-lg transition-colors cursor-pointer">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xs font-bold">
                    3D
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">3D Models</p>
                    <p className="text-xs text-text-tertiary">856 members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
};

export default AssetDetailModal;
