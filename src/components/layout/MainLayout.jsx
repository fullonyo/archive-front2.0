import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-surface-base text-text-primary">
      {/* Header at the top */}
      <Header />
      
      {/* Sidebar and main content below header */}
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
