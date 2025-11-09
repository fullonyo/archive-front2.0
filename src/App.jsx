import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProviders } from './contexts/AppProviders';
import ErrorBoundary from './components/common/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DevTools from './components/dev/DevTools';

// All pages imported from central hub
import {
  // Avatar Lab
  ForYouPage,
  ExplorePage,
  CategoryPage,
  HistoryPage,
  BookmarksPage,
  MyAssetsPage,
  NewAssetPage,
  // Forum Lab
  ForumPopularPage,
  ForumSupportPage,
  ForumIdeasPage,
  ForumGeneralPage,
  ForumPostDetailPage,
  ForumNewPostPage,
  // VRChat Lab
  VRChatProfilePage,
  VRChatFriendsPage,
  VRChatStatusPage,
  // User
  UserProfilePage,
  ProfilePage,
  // Auth
  LoginPage,
  EmailConfirmationPage,
  // Admin
  AdminPage,
} from './pages';

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-text-secondary">This page is coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppProviders>
          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Router>
            {/* Dev Tools - Only visible in development */}
            <DevTools />
            
            <Routes>
              {/* Public Routes - Login without MainLayout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/confirm-email/:token" element={<EmailConfirmationPage />} />
              
              {/* Protected Routes with MainLayout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<ForYouPage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
                <Route path="my-assets" element={<MyAssetsPage />} />
                
                {/* Forum Routes */}
                <Route path="forum/popular" element={<ForumPopularPage />} />
                <Route path="forum/support" element={<ForumSupportPage />} />
                <Route path="forum/ideas" element={<ForumIdeasPage />} />
                <Route path="forum/general" element={<ForumGeneralPage />} />
                <Route path="forum/new" element={<ForumNewPostPage />} />
                <Route path="forum/post/:id" element={<ForumPostDetailPage />} />
                
                {/* VRChat Routes */}
                <Route path="vrchat/profile" element={<VRChatProfilePage />} />
                <Route path="vrchat/friends" element={<VRChatFriendsPage />} />
                <Route path="vrchat/status" element={<VRChatStatusPage />} />
                
                {/* User Routes */}
                <Route path="user/:username" element={<UserProfilePage />} />
                <Route path="profile/:username" element={<ProfilePage />} />
                
                {/* Other Routes */}
                <Route path="settings" element={<PlaceholderPage title="Settings" />} />
                <Route path="new-asset" element={<NewAssetPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="search" element={<PlaceholderPage title="Search Results" />} />
                <Route path="category/:id" element={<CategoryPage />} />
              </Route>
            </Routes>
          </Router>
        </AppProviders>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
