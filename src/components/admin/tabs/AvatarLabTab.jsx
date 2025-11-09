import React, { useState } from 'react';
import { Package, Folder } from 'lucide-react';
import AssetsSubtab from '../subtabs/AssetsSubtab';
import CategoriesSubtab from '../subtabs/CategoriesSubtab';

/**
 * AvatarLabTab - Avatar Lab Management
 * Main Sections: Assets, Categories
 */
const AvatarLabTab = () => {
  const [activeSection, setActiveSection] = useState('assets');

  // Section tabs
  const sections = [
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'categories', label: 'Categories', icon: Folder }
  ];

  // Render active section
  const renderSection = () => {
    switch (activeSection) {
      case 'assets':
        return <AssetsSubtab />;
      case 'categories':
        return <CategoriesSubtab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? 'border-theme-active text-theme-active font-medium' 
                  : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-white/10'
                }
              `}
            >
              <Icon size={18} />
              <span className="text-sm">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {renderSection()}
    </div>
  );
};

export default React.memo(AvatarLabTab);
