import { Lock, Globe, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const CollectionCard = memo(({ collection, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = useCallback(() => {
    navigate(`/collections/${collection.id}`);
  }, [navigate, collection.id]);

  const handleMenuClick = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  }, []);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(collection);
  }, [collection, onEdit]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(collection);
  }, [collection, onDelete]);

  // Preview covers - máximo 4 assets
  const previewCovers = collection.previewCovers || [];
  const hasCovers = previewCovers.length > 0;

  return (
    <article 
      className="group relative bg-surface-float hover:bg-surface-float2 border border-white/5 hover:border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      onClick={handleCardClick}
      style={{
        contain: 'layout style paint',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Preview Grid - 2x2 */}
      <div className="relative aspect-square bg-surface-float2">
        {hasCovers ? (
          <div className={`grid h-full ${previewCovers.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5 p-0.5`}>
            {previewCovers.slice(0, 4).map((cover, index) => (
              <div
                key={index}
                className="relative bg-surface-base overflow-hidden"
              >
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, 4 - previewCovers.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-surface-base" />
            ))}
          </div>
        ) : (
          // Empty state - mostrar emoji grande
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl opacity-50">{collection.emoji || '📌'}</span>
          </div>
        )}

        {/* Gradient overlay no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Privacy badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="flex items-center gap-1 px-2 py-1 bg-black/80 backdrop-blur-md rounded-full text-xs border border-white/10">
            {collection.visibility === 'PRIVATE' ? (
              <>
                <Lock size={10} />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe size={10} />
                <span>Public</span>
              </>
            )}
          </span>
        </div>

        {/* Menu button */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleMenuClick}
            className="p-1.5 bg-black/80 backdrop-blur-md hover:bg-black rounded-full transition-colors border border-white/10"
          >
            <MoreVertical size={14} />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-surface-float border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-surface-float2 text-sm text-left transition-colors"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/10 text-red-400 text-sm text-left transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-2xl flex-shrink-0">{collection.emoji || '📌'}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-theme-active transition-colors">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="text-xs text-text-tertiary line-clamp-2 mt-1">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <div className="text-xs text-text-tertiary">
          {collection.assetCount} {collection.assetCount === 1 ? 'item' : 'itens'}
        </div>
      </div>
    </article>
  );
});

CollectionCard.displayName = 'CollectionCard';

export default CollectionCard;
