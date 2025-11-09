import { useState, useCallback } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * FollowButton Component
 * 
 * Botão reutilizável de Follow/Unfollow com:
 * - Optimistic updates
 * - Loading states
 * - Auth check
 * - Variants (primary, secondary, minimal)
 */
const FollowButton = ({ 
  userId, 
  username,
  initialIsFollowing = false,
  variant = 'primary', // 'primary' | 'secondary' | 'minimal'
  size = 'default', // 'sm' | 'default' | 'lg'
  showIcon = true,
  onFollowChange,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = useCallback(async (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const previousFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const response = await userService.toggleFollow(userId);
      
      // Update with real data
      if (response.success) {
        setIsFollowing(response.data.isFollowing);
        
        // Callback for parent component
        if (onFollowChange) {
          onFollowChange(response.data.isFollowing, response.data.followerCount);
        }

        // Toast notification
        toast.success(
          response.data.isFollowing 
            ? `Following @${username}` 
            : `Unfollowed @${username}`
        );
      } else {
        // Rollback on failure
        setIsFollowing(previousFollowing);
        toast.error(response.message || 'Failed to update follow status');
      }
    } catch (error) {
      // Rollback on error
      setIsFollowing(previousFollowing);
      console.error('Failed to follow user:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isFollowing, isLoading, userId, username, navigate, onFollowChange]);

  // Size variants
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Style variants
  const variantClasses = {
    primary: isFollowing
      ? 'bg-surface-float2 hover:bg-surface-base text-text-primary border border-white/10'
      : 'bg-theme-active hover:bg-theme-hover text-white border border-transparent',
    secondary: isFollowing
      ? 'bg-surface-float hover:bg-surface-float2 text-text-secondary hover:text-text-primary border border-white/5 hover:border-white/10'
      : 'bg-surface-float hover:bg-surface-float2 text-theme-active hover:text-theme-hover border border-theme-active/20 hover:border-theme-active/40',
    minimal: isFollowing
      ? 'bg-transparent hover:bg-surface-float text-text-secondary hover:text-text-primary'
      : 'bg-transparent hover:bg-surface-float text-theme-active hover:text-theme-hover'
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={isFollowing ? `Unfollow ${username}` : `Follow ${username}`}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
          {size !== 'sm' && (isFollowing ? 'Unfollowing...' : 'Following...')}
        </>
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus size={size === 'sm' ? 14 : 16} />
            ) : (
              <UserPlus size={size === 'sm' ? 14 : 16} />
            )
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </button>
  );
};

export default FollowButton;
