import React from 'react';
import { PanelLeftOpen, ChevronRight, Sun, Moon } from 'lucide-react';
import { PageType } from './Sidebar';

export interface TopbarProps {
  page: PageType;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Topbar: React.FC<TopbarProps> = ({
  page,
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
}) => {
  const pageTitles: Record<PageType, string> = {
    home: 'Overview',
    read: 'Reading room',
    create: 'Creator desk',
    shield: 'Templates',
    upload: 'New document',
  };

  return (
    <header className="workspace-topbar">
      <div className="workspace-breadcrumb">
        <button
          className="mobile-nav-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-expanded={sidebarOpen}
          aria-controls="workspace-navigation"
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation'}
        >
          <PanelLeftOpen size={19} />
        </button>
        <span>Workspace</span>
        <ChevronRight size={12} />
        <strong>{pageTitles[page]}</strong>
      </div>
      <div className="workspace-top-actions">
        <span className="workspace-mode">
          <span /> Personal space
        </span>
        <button
          className="theme-switch"
          onClick={() => setDarkMode((v) => !v)}
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={darkMode}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span className="topbar-avatar" aria-label="Personal workspace">
          F
        </span>
      </div>
    </header>
  );
};
