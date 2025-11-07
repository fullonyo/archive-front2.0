import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../hooks/user/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
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
  const navigate = useNavigate();
  const { isAuthenticated, user, userStats } = useUser();
  const { logout } = useAuth();
  
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
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/login?mode=register');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // If not authenticated, show user icon with login dropdown
  if (!isAuthenticated) {
    return (
      <>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2.5 hover:bg-surface-float2 rounded-lg transition-colors"
          >
            <User size={18} />
          </button>

          {/* Login Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-float border border-white/10 rounded-xl shadow-xl overflow-hidden animate-slide-down">
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{t('header.welcomeBack')}</h3>
                <p className="text-sm text-text-tertiary mb-4">
                  {t('header.signInToAccess')}
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignIn();
                    }}
                    className="btn btn-primary w-full justify-center"
                  >
                    {t('header.signIn')}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignUp();
                    }}
                    className="btn btn-secondary w-full justify-center"
                  >
                    {t('header.signUp')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Authenticated user menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="p-2.5 hover:bg-surface-float2 rounded-lg transition-colors flex items-center gap-2"
      >
        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.displayName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        
        <ChevronDown className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-surface-float border border-white/10 rounded-xl shadow-xl overflow-hidden animate-slide-down">
          {/* User Profile Header */}
          <div className="p-4 border-b border-white/5 bg-surface-base/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
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
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">
                  {user?.displayName || user?.username}
                </h3>
                <p className="text-sm text-text-tertiary truncate">
                  @{user?.username}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-tertiary">
                    {t('user.profile.level')} {userStats?.level}
                  </span>
                  <span className="text-xs text-theme-active font-medium">
                    {userStats?.reputation} {t('user.profile.reputation')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-white/5">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <User className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm font-semibold text-text-primary">
                    {userStats?.avatarsCount || 0}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  {t('user.profile.avatars')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm font-semibold text-text-primary">
                    {userStats?.favoritesCount || 0}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  {t('user.profile.favorites')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Download className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold text-text-primary">
                    {userStats?.downloadsCount || 0}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
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
                navigate(`/profile/${user?.username}`);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-float2 flex items-center gap-3 transition-colors"
            >
              <UserCircle className="w-5 h-5 text-text-tertiary" />
              {t('header.profile')}
            </button>
            
            <button
              onClick={() => {
                setShowUserMenu(false);
                navigate('/notifications');
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-float2 flex items-center gap-3 transition-colors"
            >
              <Bell className="w-5 h-5 text-text-tertiary" />
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
                navigate('/settings');
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-float2 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-5 h-5 text-text-tertiary" />
              {t('header.settings')}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('header.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;