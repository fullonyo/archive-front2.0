import { useState, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { userService } from '../../services/userService';

export const useProfile = () => {
  const { 
    user, 
    userStats,
    updateProfile: contextUpdateProfile,
    loading: contextLoading 
  } = useUser();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const updateProfile = useCallback(async (profileData) => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const result = await contextUpdateProfile(profileData);
      
      if (result.success) {
        return { success: true, message: 'Profile updated successfully' };
      } else {
        setProfileError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [contextUpdateProfile]);

  const updateAvatar = useCallback(async (avatarFile) => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const result = await userService.uploadAvatar(user.id, avatarFile);
      return { success: true, avatar: result.avatar };
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload avatar';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const updateBio = useCallback(async (bio) => {
    return updateProfile({ bio });
  }, [updateProfile]);

  const updateDisplayName = useCallback(async (displayName) => {
    return updateProfile({ displayName });
  }, [updateProfile]);

  const updateSocialLinks = useCallback(async (socialLinks) => {
    return updateProfile({ socialLinks });
  }, [updateProfile]);

  const updatePrivacySettings = useCallback(async (privacySettings) => {
    return updateProfile({ privacySettings });
  }, [updateProfile]);

  const updateNotificationPreferences = useCallback(async (preferences) => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      await userService.updateUserPreferences(user.id, { 
        notifications: preferences 
      });
      return { success: true, message: 'Notification preferences updated' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update preferences';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const linkVRChatAccount = useCallback(async (vrchatData) => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      await userService.linkVRChatAccount(user.id, vrchatData);
      return { success: true, message: 'VRChat account linked successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to link VRChat account';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const unlinkVRChatAccount = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      await userService.unlinkVRChatAccount(user.id);
      return { success: true, message: 'VRChat account unlinked successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to unlink VRChat account';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const exportUserData = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const data = await userService.exportUserData(user.id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'User data exported successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to export user data';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id, user?.username]);

  const deactivateAccount = useCallback(async (reason) => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      await userService.deactivateAccount(user.id, reason);
      return { success: true, message: 'Account deactivated successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to deactivate account';
      setProfileError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setProfileError(null);
  }, []);

  return {
    // State
    user,
    userStats,
    loading: contextLoading || profileLoading,
    error: profileError,
    
    // Profile actions
    updateProfile,
    updateAvatar,
    updateBio,
    updateDisplayName,
    updateSocialLinks,
    updatePrivacySettings,
    updateNotificationPreferences,
    
    // VRChat integration
    linkVRChatAccount,
    unlinkVRChatAccount,
    
    // Account management
    exportUserData,
    deactivateAccount,
    
    // Utils
    clearError
  };
};