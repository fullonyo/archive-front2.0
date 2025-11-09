import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Lock, Globe } from 'lucide-react';
import collectionService from '../../services/collectionService';

// Common emojis for collections
const EMOJI_SUGGESTIONS = [
  '📌', '⭐', '❤️', '💙', '💚', '💛', '💜', '🔥',
  '🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲', '�',
  '🌟', '✨', '💫', '🌈', '🌸', '🌺', '🌻', '🌹',
  '🏆', '🎁', '🎉', '🎊', '🎈', '🎀', '💝', '💎'
];

const CreateCollectionModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📌');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus name input
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, loading]);

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setEmoji('📌');
      setVisibility('PRIVATE');
      setError(null);
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  }, [loading]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    if (name.length > 100) {
      setError('Collection name is too long (max 100 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await collectionService.createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        visibility
      });

      if (result.success) {
        onSuccess?.(result);
        onClose();
      } else {
        setError(result.message || 'Failed to create collection');
      }
    } catch (err) {
      console.error('Create collection error:', err);
      setError(err.response?.data?.message || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  }, [name, description, emoji, visibility, onSuccess, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        contain: 'layout style paint',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      <div
        className="bg-surface-float rounded-xl w-full max-w-md"
        style={{
          contain: 'layout style paint',
          willChange: 'transform'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">Create Collection</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-surface-float2 rounded-lg transition-colors text-text-tertiary hover:text-text-primary disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Vibes, Cyberpunk Look..."
              maxLength={100}
              className="w-full px-3 py-2 bg-surface-base border border-white/10 rounded-lg text-sm focus:outline-none focus:border-theme-active transition-colors"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-text-tertiary text-right">
              {name.length}/100
            </p>
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Icon (Emoji)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 bg-surface-base rounded-lg border border-white/10 flex items-center justify-center text-2xl">
                {emoji}
              </div>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
                placeholder="📌"
                maxLength={2}
                className="flex-1 px-3 py-2 bg-surface-base border border-white/10 rounded-lg text-sm focus:outline-none focus:border-theme-active transition-colors"
                disabled={loading}
              />
            </div>
            {/* Emoji Suggestions */}
            <div className="flex flex-wrap gap-1">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`
                    w-8 h-8 rounded text-lg hover:bg-surface-float2 transition-colors
                    ${emoji === e ? 'bg-surface-float2 ring-1 ring-theme-active' : ''}
                  `}
                  disabled={loading}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 bg-surface-base border border-white/10 rounded-lg text-sm focus:outline-none focus:border-theme-active transition-colors resize-none"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-text-tertiary text-right">
              {description.length}/500
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Privacy
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                disabled={loading}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 transition-all
                  ${visibility === 'PRIVATE'
                    ? 'border-theme-active bg-theme-active/10 text-text-primary'
                    : 'border-white/10 hover:border-white/20 text-text-secondary'
                  }
                `}
              >
                <Lock size={16} />
                <span className="text-sm font-medium">Private</span>
              </button>
              
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                disabled={loading}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 transition-all
                  ${visibility === 'PUBLIC'
                    ? 'border-theme-active bg-theme-active/10 text-text-primary'
                    : 'border-white/10 hover:border-white/20 text-text-secondary'
                  }
                `}
              >
                <Globe size={16} />
                <span className="text-sm font-medium">Public</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              {visibility === 'PRIVATE' 
                ? 'Only you can see this collection' 
                : 'Anyone can see this collection'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-surface-base hover:bg-surface-float2 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 px-4 rounded-lg bg-theme-active hover:bg-theme-hover transition-colors text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Collection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateCollectionModal;
