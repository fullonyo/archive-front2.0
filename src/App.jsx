import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import MainLayout from './components/layout/MainLayout';
import ForYouPage from './pages/ForYouPage';
import ExplorePage from './pages/ExplorePage';
import HistoryPage from './pages/HistoryPage';
import BookmarksPage from './pages/BookmarksPage';
import MyAssetsPage from './pages/MyAssetsPage';
import ForumPopularPage from './pages/ForumPopularPage';
import ForumSupportPage from './pages/ForumSupportPage';
import ForumIdeasPage from './pages/ForumIdeasPage';
import ForumGeneralPage from './pages/ForumGeneralPage';
import ForumPostDetailPage from './pages/ForumPostDetailPage';
import ForumNewPostPage from './pages/ForumNewPostPage';
import VRChatProfilePage from './pages/VRChatProfilePage';
import VRChatFriendsPage from './pages/VRChatFriendsPage';
import VRChatStatusPage from './pages/VRChatStatusPage';

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
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
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
            
            {/* Other Routes */}
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="profile" element={<PlaceholderPage title="Profile" />} />
            <Route path="new-asset" element={<PlaceholderPage title="Upload New Asset" />} />
            <Route path="search" element={<PlaceholderPage title="Search Results" />} />
            <Route path="category/:id" element={<PlaceholderPage title="Category" />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
