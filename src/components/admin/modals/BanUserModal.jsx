import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { handleImageError } from '../../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../../constants';
import toast from 'react-hot-toast';

/**
 * BanUserModal - Modal para banir usuário
 * Performance: Portal-based, GPU-accelerated
 */
const BanUserModal = ({ isOpen, onClose, user, onBan }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('permanent');
  const [deleteContent, setDeleteContent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Predefined ban reasons
  const banReasons = [
    'Spam or malicious content',
    'Harassment or abusive behavior',
    'Illegal content distribution',
    'Copyright infringement',
    'Multiple ToS violations',
    'Account security compromise',
    'Other (specify below)'
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDuration('permanent');
      setDeleteContent(false);
    }
  }, [isOpen]);

  // Lock body scroll
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

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle ban
  const handleBan = useCallback(async () => {
    if (!reason.trim()) {
      toast.error('Please select or enter a ban reason');
      return;
    }

    setLoading(true);
    try {
      await onBan(user.id, {
        reason: reason.trim(),
        duration,
        deleteContent
      });
      toast.success(`${user.username} has been banned`);
      onClose();
    } catch (error) {
      console.error('Ban user error:', error);
      toast.error(error.message || 'Failed to ban user');
    } finally {
      setLoading(false);
    }
  }, [user, reason, duration, deleteContent, onBan, onClose]);

  if (!isOpen || !user) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        contain: 'layout style paint',
        willChange: 'opacity'
      }}
    >
      <div 
        className="bg-surface-float border border-red-400/30 rounded-xl w-full max-w-xl overflow-hidden flex flex-col"
        style={{
          contain: 'layout style paint',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-red-400/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-400/20 rounded-lg">
              <Ban size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400">Ban User</h2>
              <p className="text-sm text-text-secondary">This action will restrict user access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-surface-base rounded-lg border border-white/5">
            <img
              src={user.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
              alt={user.username}
              onError={handleImageError}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-lg">{user.username}</p>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-400 mb-1">Warning</p>
              <p className="text-text-secondary">
                Banning this user will immediately revoke their access to the platform. 
                This action can be reversed later if needed.
              </p>
            </div>
          </div>

          {/* Ban Reason (Predefined) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for Ban <span className="text-red-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-base border border-white/10 rounded-lg px-4 py-2.5 text-sm 
                       focus:outline-none focus:border-red-400 transition-colors"
            >
              <option value="">Select a reason...</option>
              {banReasons.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Custom Reason */}
          {(reason === 'Other (specify below)' || !banReasons.includes(reason)) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason === 'Other (specify below)' ? '' : reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-surface-base border border-white/10 rounded-lg px-4 py-2.5 text-sm 
                         focus:outline-none focus:border-red-400 transition-colors resize-none"
                placeholder="Provide detailed reason for the ban..."
              />
              <p className="text-xs text-text-tertiary mt-1">
                {reason.length}/500 characters
              </p>
            </div>
          )}

          {/* Ban Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ban Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-surface-base border border-white/10 rounded-lg px-4 py-2.5 text-sm 
                       focus:outline-none focus:border-theme-active transition-colors"
            >
              <option value="1day">1 Day</option>
              <option value="3days">3 Days</option>
              <option value="1week">1 Week</option>
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="1year">1 Year</option>
              <option value="permanent">Permanent</option>
            </select>
            <p className="text-xs text-text-tertiary mt-1">
              {duration === 'permanent' 
                ? 'User will remain banned until manually unbanned'
                : `User will be automatically unbanned after ${duration.replace(/(\d+)(\w+)/, '$1 $2')}`
              }
            </p>
          </div>

          {/* Delete Content Option */}
          <label className="flex items-center justify-between p-4 bg-surface-base rounded-lg cursor-pointer hover:bg-surface-float2 transition-colors border border-white/5">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400" />
              <div>
                <p className="font-medium">Delete User Content</p>
                <p className="text-xs text-text-secondary">
                  Permanently delete all assets, reviews, and comments
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={deleteContent}
              onChange={(e) => setDeleteContent(e.target.checked)}
              className="w-5 h-5 rounded accent-red-400"
            />
          </label>

          {deleteContent && (
            <div className="flex gap-3 p-4 bg-red-400/10 border border-red-400/30 rounded-lg">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">
                <strong className="text-red-400">Warning:</strong> This will permanently delete 
                all content created by this user. This action cannot be undone!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary 
                     hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBan}
            disabled={loading || !reason.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                     rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ban size={16} />
            {loading ? 'Banning...' : 'Ban User'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BanUserModal;
