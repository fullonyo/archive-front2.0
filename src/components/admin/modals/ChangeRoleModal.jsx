import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Crown, User, Package, AlertTriangle, Check } from 'lucide-react';
import { StatusBadge } from '../shared';
import { handleImageError } from '../../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../../constants';
import toast from 'react-hot-toast';

/**
 * ChangeRoleModal - Modal para alterar role do usuário
 * Performance: Portal-based, GPU-accelerated
 */
const ChangeRoleModal = ({ isOpen, onClose, user, onChangeRole }) => {
  const [selectedRole, setSelectedRole] = useState('USER');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Role configurations
  const roles = [
    {
      value: 'USER',
      label: 'User',
      icon: User,
      color: 'text-gray-400',
      bg: 'bg-gray-400/10',
      description: 'Standard user with basic access',
      permissions: [
        'Browse and download assets',
        'Submit reviews and ratings',
        'Manage personal favorites'
      ]
    },
    {
      value: 'CREATOR',
      label: 'Creator',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      description: 'Can upload and manage assets',
      permissions: [
        'All User permissions',
        'Upload new assets',
        'Manage own asset listings',
        'View upload analytics'
      ]
    },
    {
      value: 'MODERATOR',
      label: 'Moderator',
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      description: 'Community moderation access',
      permissions: [
        'All Creator permissions',
        'Approve/reject assets',
        'Moderate user content',
        'Handle user reports',
        'View moderation logs'
      ]
    },
    {
      value: 'ADMIN',
      label: 'Admin',
      icon: Crown,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      description: 'Full platform access',
      permissions: [
        'All Moderator permissions',
        'Manage all users',
        'Access system settings',
        'View analytics dashboard',
        'Manage platform configuration'
      ]
    }
  ];

  // Initialize selected role
  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role || 'USER');
      setReason('');
    }
  }, [isOpen, user]);

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

  // Handle role change
  const handleSave = useCallback(async () => {
    if (selectedRole === user.role) {
      toast.error('Please select a different role');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the role change');
      return;
    }

    setLoading(true);
    try {
      await onChangeRole(user.id, selectedRole, reason.trim());
      toast.success(`${user.username}'s role changed to ${selectedRole}`);
      onClose();
    } catch (error) {
      console.error('Change role error:', error);
      toast.error(error.message || 'Failed to change role');
    } finally {
      setLoading(false);
    }
  }, [user, selectedRole, reason, onChangeRole, onClose]);

  if (!isOpen || !user) return null;

  const currentRole = roles.find(r => r.value === user.role);
  const newRole = roles.find(r => r.value === selectedRole);
  const isUpgrade = roles.findIndex(r => r.value === selectedRole) > roles.findIndex(r => r.value === user.role);

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
        className="bg-surface-float border border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          contain: 'layout style paint',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-active/20 rounded-lg">
              <Shield size={20} className="text-theme-active" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Change User Role</h2>
              <p className="text-sm text-text-secondary">Modify user permissions and access level</p>
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
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          style={{
            WebkitOverflowScrolling: 'touch',
            contain: 'layout style paint',
            willChange: 'scroll-position',
            overscrollBehavior: 'contain'
          }}
        >
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-surface-base rounded-lg border border-white/5">
            <img
              src={user.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
              alt={user.username}
              onError={handleImageError}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-lg">{user.username}</p>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-tertiary mb-1">Current Role</p>
              <StatusBadge type={user.role} size="md" />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select New Role <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                const isCurrent = user.role === role.value;

                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    disabled={isCurrent}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all text-left
                      ${isCurrent 
                        ? 'border-white/5 bg-surface-base opacity-50 cursor-not-allowed' 
                        : isSelected 
                          ? 'border-theme-active bg-theme-active/10' 
                          : 'border-white/10 bg-surface-base hover:border-white/20 hover:bg-surface-float2'
                      }
                    `}
                  >
                    {isCurrent && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs text-text-tertiary">Current</span>
                      </div>
                    )}
                    {isSelected && !isCurrent && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-theme-active" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${role.bg} rounded-lg`}>
                        <Icon size={20} className={role.color} />
                      </div>
                      <div>
                        <p className="font-semibold">{role.label}</p>
                        <p className="text-xs text-text-secondary">{role.description}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {role.permissions.slice(0, 3).map((perm, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check size={12} className={`${role.color} mt-0.5 flex-shrink-0`} />
                          <p className="text-xs text-text-tertiary">{perm}</p>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change Summary */}
          {selectedRole !== user.role && (
            <div className={`flex gap-3 p-4 rounded-lg border ${isUpgrade ? 'bg-green-400/10 border-green-400/30' : 'bg-yellow-400/10 border-yellow-400/30'}`}>
              <AlertTriangle size={20} className={`${isUpgrade ? 'text-green-400' : 'text-yellow-400'} flex-shrink-0 mt-0.5`} />
              <div className="text-sm">
                <p className={`font-semibold mb-1 ${isUpgrade ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isUpgrade ? 'Role Upgrade' : 'Role Downgrade'}
                </p>
                <p className="text-text-secondary">
                  {isUpgrade 
                    ? `This will grant ${user.username} additional permissions and access.`
                    : `This will revoke some of ${user.username}'s current permissions.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for Role Change <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full bg-surface-base border border-white/10 rounded-lg px-4 py-2.5 text-sm 
                       focus:outline-none focus:border-theme-active transition-colors resize-none"
              placeholder="Explain why this role change is being made..."
            />
            <p className="text-xs text-text-tertiary mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Permissions Comparison */}
          {selectedRole !== user.role && (
            <div className="grid grid-cols-2 gap-4">
              {/* Current Permissions */}
              <div className="p-4 bg-surface-base rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  {currentRole && React.createElement(currentRole.icon, { 
                    size: 16, 
                    className: currentRole.color 
                  })}
                  <p className="text-sm font-semibold">Current Permissions</p>
                </div>
                <div className="space-y-2">
                  {currentRole?.permissions.map((perm, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={12} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-text-secondary">{perm}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Permissions */}
              <div className="p-4 bg-theme-active/10 rounded-lg border border-theme-active/30">
                <div className="flex items-center gap-2 mb-3">
                  {newRole && React.createElement(newRole.icon, { 
                    size: 16, 
                    className: newRole.color 
                  })}
                  <p className="text-sm font-semibold">New Permissions</p>
                </div>
                <div className="space-y-2">
                  {newRole?.permissions.map((perm, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={12} className="text-theme-active mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-text-secondary">{perm}</p>
                    </div>
                  ))}
                </div>
              </div>
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
            onClick={handleSave}
            disabled={loading || selectedRole === user.role || !reason.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-theme-active hover:bg-theme-hover 
                     rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield size={16} />
            {loading ? 'Changing...' : 'Change Role'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChangeRoleModal;
