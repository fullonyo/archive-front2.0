import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-colapsar sidebar em mobile no primeiro load
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-surface-base text-text-primary">
      {/* Header at the top */}
      <Header />
      
      {/* Sidebar and main content below header */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content Area - Centralized Container */}
        <main className="flex-1 transition-all duration-300 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
