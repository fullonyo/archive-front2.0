import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../hooks/user/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import AuthModal from './AuthModal';
import {
  User,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle,
  Bell,
  Heart,
  Download
} from 'lucide-react';

const UserButton = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, userStats } = useUser();
  const { logout } = useAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // If not authenticated, show sign in/up buttons
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSignIn}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t('header.signIn')}
          </button>
          <button
            onClick={handleSignUp}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('header.signUp')}
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
        />
      </>
    );
  }

  // Authenticated user menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.displayName || user?.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('user.profile.level')} {userStats?.level} • {userStats?.reputation} {t('user.profile.reputation')}
          </p>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* User Profile Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || user?.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{user?.username}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('user.profile.level')} {userStats?.level}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {userStats?.reputation} {t('user.profile.reputation')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <User className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userStats?.avatarsCount || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('user.profile.avatars')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userStats?.favoritesCount || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('user.profile.favorites')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Download className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userStats?.downloadsCount || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('user.profile.downloads')}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowUserMenu(false);
                // Navigate to profile page
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <UserCircle className="w-5 h-5 mr-3 text-gray-400" />
              {t('header.profile')}
            </button>
            
            <button
              onClick={() => {
                setShowUserMenu(false);
                // Navigate to notifications
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <Bell className="w-5 h-5 mr-3 text-gray-400" />
              {t('header.notifications')}
              {userStats?.unreadNotificationsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {userStats.unreadNotificationsCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowUserMenu(false);
                // Navigate to settings
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <Settings className="w-5 h-5 mr-3 text-gray-400" />
              {t('header.settings')}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t('header.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;