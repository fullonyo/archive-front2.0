import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PixelBlast from '../common/PixelBlast';
import pixelBlastConfig from '../../config/pixelBlastConfig';

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
    <div className="flex flex-col h-screen bg-surface-base text-text-primary relative overflow-hidden">
      {/* Background PixelBlast */}
      <div className="absolute inset-0 z-0">
        <PixelBlast {...pixelBlastConfig} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
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
    </div>
  );
};

export default MainLayout;
