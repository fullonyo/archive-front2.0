/**
 * Central export point for all context hooks
 * 
 * Uso:
 * ```jsx
 * import { useAuth, useAvatar, useForum, useCache } from './contexts';
 * ```
 */

// Core contexts
export { useAuth } from './AuthContext';
export { useAvatar } from './AvatarContext';
export { useForum } from './ForumContext';
export { useNotification } from './NotificationContext';
export { useVRChat } from './VRChatContext';
export { useCache } from './CacheContext';

// Composite hook
export { useCurrentUser } from '../hooks/useCurrentUser';

// Provider
export { AppProviders } from './AppProviders';
