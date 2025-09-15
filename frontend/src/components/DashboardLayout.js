import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const { darkMode: isDarkMode } = useTheme();
  const { isExpanded } = useSidebar();

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-[#0A0F1F]' : 'bg-slate-50'}`}
      style={{
        '--sidebar-width': isExpanded ? '240px' : '80px',
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className="ml-[var(--sidebar-width)] transition-all duration-300 ease-in-out min-h-screen"
        style={{
          width: `calc(100% - var(--sidebar-width))`,
        }}
      >
        {/* Page Content */}
        <main className="pt-4 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;