import { memo, useCallback, useState } from 'react';
import AssetDetailModal from './AssetDetailModal';
import { PLACEHOLDER_IMAGES } from '../../constants';
import { handleImageError } from '../../utils/imageUtils';

/**
 * AssetCardMasonry - Versão minimalista do AssetCard para layout Masonry
 * 
 * Performance-first design:
 * - Apenas imagem, sem botões/stats/overlays
 * - GPU acceleration (translateZ, willChange)
 * - CSS containment para scroll otimizado
 * - Lazy loading nativo
 * - Memoização completa
 * 
 * Inspiração: Unsplash/Pinterest minimal cards
 */
const AssetCardMasonry = memo(({ asset, height }) => {
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Thumbnail URL com fallback
  const thumbnailUrl = asset.thumbnail || asset.thumbnailUrl || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL;

  // Handlers otimizados com useCallback
  const handleCardClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  return (
    <>
      <article
        className="masonry-card group cursor-pointer break-inside-avoid mb-4"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${asset.title}`}
        style={{
          // PERFORMANCE: CSS containment para scroll 60 FPS
          contain: 'layout style paint',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          // Altura dinâmica baseada no aspect ratio da imagem
          height: height ? `${height}px` : 'auto'
        }}
      >
        {/* Container com aspect ratio preservado */}
        <div className="relative overflow-hidden rounded-xl bg-surface-float2 shadow-lg transition-all duration-500 ease-out group-hover:shadow-2xl">
          {/* Skeleton placeholder - Mostra antes da imagem carregar */}
          {!imageLoaded && (
            <div 
              className="absolute inset-0 bg-surface-float2 animate-pulse"
              style={{ 
                contain: 'layout style paint'
              }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-smooth"
                style={{ transform: 'translateX(-100%)' }}
              />
            </div>
          )}

          {/* Imagem principal - Lazy loading nativo */}
          <img
            src={thumbnailUrl}
            alt={asset.title}
            loading="lazy"
            className={`
              w-full h-full object-cover transition-all duration-700 ease-out
              ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              group-hover:scale-110
            `}
            onLoad={handleImageLoad}
            onError={handleImageError('thumbnail')}
            style={{
              // PERFORMANCE: GPU acceleration
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out'
            }}
          />

          {/* Overlay minimalista - Só aparece no hover */}
          <div 
            className="
              absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out
              flex items-end p-4
            "
            style={{
              contain: 'layout style paint',
              willChange: 'opacity'
            }}
          >
            {/* Título - Só visível no hover com animação de slide */}
            <h3 
              className="text-white text-sm font-semibold line-clamp-2 leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out"
              style={{
                willChange: 'transform',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {asset.title}
            </h3>
          </div>

          {/* Subtle hover ring effect */}
          <div 
            className="
              absolute inset-0 rounded-xl ring-2 ring-white/0 
              group-hover:ring-white/30 transition-all duration-500 ease-out
              pointer-events-none
            "
            style={{ 
              contain: 'layout style paint',
              transition: 'box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </article>

      {/* Modal - Reutiliza o componente existente */}
      <AssetDetailModal 
        asset={asset}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
});

AssetCardMasonry.displayName = 'AssetCardMasonry';

export default AssetCardMasonry;
