import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ForYouPage from './pages/ForYouPage';
import ExplorePage from './pages/ExplorePage';

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
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ForYouPage />} />
          <Route path="following" element={<PlaceholderPage title="Following" />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="history" element={<PlaceholderPage title="History" />} />
          <Route path="bookmarks" element={<PlaceholderPage title="Bookmarks" />} />
          <Route path="my-assets" element={<PlaceholderPage title="My Assets" />} />
          <Route path="discussions" element={<PlaceholderPage title="Discussions" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="profile" element={<PlaceholderPage title="Profile" />} />
          <Route path="new-asset" element={<PlaceholderPage title="Upload New Asset" />} />
          <Route path="search" element={<PlaceholderPage title="Search Results" />} />
          <Route path="category/:id" element={<PlaceholderPage title="Category" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
