import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Mail, Shield, Crown, Package, Link as LinkIcon } from 'lucide-react';
import { StatusBadge } from '../shared';
import { handleImageError } from '../../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../../constants';
import toast from 'react-hot-toast';

/**
 * EditUserModal - Modal para editar informações do usuário
 * Performance: Portal-based, GPU-accelerated, no blur effects
 */
const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'USER',
    accountType: 'FREE',
    isVerified: false,
    isActive: true,
    bio: '',
    location: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'USER',
        accountType: user.accountType || 'FREE',
        isVerified: user.isVerified || false,
        isActive: user.isActive !== undefined ? user.isActive : true,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      });
      setErrors({});
    }
  }, [user]);

  // Lock body scroll when open
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

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL (http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setLoading(true);
    try {
      await onSave(user.id, formData);
      toast.success('User updated successfully');
      onClose();
    } catch (error) {
      console.error('Save user error:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  }, [validate, user, formData, onSave, onClose]);

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
        className="bg-surface-float border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          contain: 'layout style paint',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
              alt={user.username}
              onError={handleImageError}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">Edit User</h2>
              <p className="text-sm text-text-secondary">Update user information</p>
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
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          style={{
            WebkitOverflowScrolling: 'touch',
            contain: 'layout style paint',
            willChange: 'scroll-position',
            overscrollBehavior: 'contain'
          }}
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Basic Information
            </h3>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className={`w-full bg-surface-base border ${errors.username ? 'border-red-400' : 'border-white/10'} 
                           rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-theme-active 
                           transition-colors`}
                  placeholder="Enter username"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-400 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full bg-surface-base border ${errors.email ? 'border-red-400' : 'border-white/10'} 
                           rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-theme-active 
                           transition-colors`}
                  placeholder="Enter email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Role & Account */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Permissions & Access
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <div className="relative">
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full bg-surface-base border border-white/10 rounded-lg pl-10 pr-4 py-2.5 
                             text-sm focus:outline-none focus:border-theme-active transition-colors"
                  >
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <Crown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <select
                    value={formData.accountType}
                    onChange={(e) => handleChange('accountType', e.target.value)}
                    className="w-full bg-surface-base border border-white/10 rounded-lg pl-10 pr-4 py-2.5 
                             text-sm focus:outline-none focus:border-theme-active transition-colors"
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Account Status
            </h3>

            <div className="space-y-3">
              {/* Verified */}
              <label className="flex items-center justify-between p-4 bg-surface-base rounded-lg cursor-pointer hover:bg-surface-float2 transition-colors">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-theme-active" />
                  <div>
                    <p className="font-medium">Verified Account</p>
                    <p className="text-xs text-text-secondary">User has verified their email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => handleChange('isVerified', e.target.checked)}
                  className="w-5 h-5 rounded accent-theme-active"
                />
              </label>

              {/* Active */}
              <label className="flex items-center justify-between p-4 bg-surface-base rounded-lg cursor-pointer hover:bg-surface-float2 transition-colors">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-green-400" />
                  <div>
                    <p className="font-medium">Active Account</p>
                    <p className="text-xs text-text-secondary">User can access the platform</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5 rounded accent-theme-active"
                />
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Profile Information
            </h3>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-surface-base border border-white/10 rounded-lg px-4 py-2.5 text-sm 
                         focus:outline-none focus:border-theme-active transition-colors resize-none"
                placeholder="User bio (max 500 characters)"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full bg-surface-base border border-white/10 rounded-lg px-4 py-2.5 text-sm 
                         focus:outline-none focus:border-theme-active transition-colors"
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Website
              </label>
              <div className="relative">
                <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={`w-full bg-surface-base border ${errors.website ? 'border-red-400' : 'border-white/10'} 
                           rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-theme-active 
                           transition-colors`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && (
                <p className="text-xs text-red-400 mt-1">{errors.website}</p>
              )}
            </div>
          </div>
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
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-theme-active hover:bg-theme-hover 
                     rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditUserModal;
