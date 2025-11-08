import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useTranslation } from '../hooks/useTranslation';
import { handleImageError } from '../utils/imageUtils';
import {
  User,
  Calendar,
  MapPin,
  Link,
  Edit,
  Settings,
  Trophy,
  Star,
  MessageSquare,
  Download,
  Heart,
  Eye
} from 'lucide-react';

const UserProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const { isAuthenticated } = useAuth();
  const { user: currentUser, stats: userStats } = useCurrentUser();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = isAuthenticated && currentUser?.username === username;

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
          // Use current user data
          setProfileData(currentUser);
        } else {
          // Load other user's public profile
          // TODO: Implement API call to get user by username
          console.log('Loading profile for:', username);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [username, isOwnProfile, currentUser]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  const avatarStats = getAvatarStats();
  const forumStats = getForumStats();

  const displayUser = profileData || currentUser;

  const tabs = [
    { id: 'overview', label: t('user.profile.overview'), icon: UserIcon },
    { id: 'avatars', label: t('user.profile.avatars'), icon: UserIcon, count: avatarStats.totalAvatars },
    { id: 'posts', label: t('user.profile.posts'), icon: ChatBubbleLeftIcon, count: forumStats.postsCount },
    { id: 'favorites', label: t('user.profile.favorites'), icon: HeartIcon, count: avatarStats.favoriteCount },
    { id: 'activity', label: t('user.profile.activity'), icon: TrophyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                  {displayUser?.avatarUrl ? (
                    <img 
                      src={displayUser.avatarUrl} 
                      alt={displayUser.username}
                      className="w-full h-full rounded-full object-cover"
                      loading="lazy"
                      onError={handleImageError('avatar')}
                    />
                  ) : (
                    (displayUser?.username?.[0] || 'U').toUpperCase()
                  )}
                </div>
                
                {/* Online Status */}
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
              </div>

              {/* User Info */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {displayUser?.username}
                  </h1>
                  {userStats?.isVerified && (
                    <Star className="w-6 h-6 text-yellow-500" />
                  )}
                  {userStats?.isModerator && (
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                      {userStats?.isAdmin ? 'Admin' : 'Moderator'}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{displayUser?.username}
                </p>
                
                {displayUser?.bio && (
                  <p className="text-gray-700 dark:text-gray-300 max-w-2xl mb-4">
                    {displayUser.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    {t('user.profile.joinedDate')} {new Date(displayUser?.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                  
                  {displayUser?.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {displayUser.location}
                    </div>
                  )}
                  
                  {displayUser?.website && (
                    <a 
                      href={displayUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-500"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {isOwnProfile ? (
              <div className="flex space-x-3 mt-6 lg:mt-0">
                <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  {t('user.profile.editProfile')}
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <CogIcon className="w-4 h-4 mr-2" />
                  {t('header.settings')}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3 mt-6 lg:mt-0">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  {t('user.profile.follow')}
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {t('user.profile.message')}
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avatarStats.totalAvatars}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('user.profile.avatars')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {forumStats.postsCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('user.profile.posts')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avatarStats.totalLikes}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('user.profile.likes')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avatarStats.totalDownloads}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('user.profile.downloads')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {forumStats.reputation}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('user.profile.reputation')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Avatars */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('user.profile.recentAvatars')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userAvatars.slice(0, 6).map(avatar => (
                    <div key={avatar.id} className="group relative">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={avatar.preview || '/placeholder-avatar.jpg'} 
                          alt={avatar.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {avatar.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <HeartIcon className="w-3 h-3 mr-1" />
                              {avatar.likes || 0}
                            </div>
                            <div className="flex items-center">
                              <CloudArrowDownIcon className="w-3 h-3 mr-1" />
                              {avatar.downloads || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('user.profile.recentActivity')}
                </h2>
                <div className="space-y-4">
                  {userPosts.slice(0, 5).map(post => (
                    <div key={post.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <ChatBubbleLeftIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {t('user.profile.postedIn')} <span className="text-blue-600 dark:text-blue-400">{post.category}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'avatars' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userAvatars.map(avatar => (
              <div key={avatar.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={avatar.preview || '/placeholder-avatar.jpg'} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {avatar.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1" />
                        {avatar.likes || 0}
                      </div>
                      <div className="flex items-center">
                        <CloudArrowDownIcon className="w-4 h-4 mr-1" />
                        {avatar.downloads || 0}
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {avatar.views || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other tab contents can be implemented similarly */}
      </div>
    </div>
  );
};

export default UserProfilePage;