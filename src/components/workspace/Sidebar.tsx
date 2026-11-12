import React from 'react';
import {
  Home,
  FileText,
  Wand2,
  LayoutGrid,
  MessageSquareText,
  ShieldCheck,
  Plus,
  Lock,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { FroggoLogo } from '../FroggoLogo';

export type PageType = 'home' | 'read' | 'create' | 'shield' | 'upload';

export interface SidebarProps {
  page: PageType;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigateTo: (page: PageType) => void;
  setAiAssistantMode: (mode: 'chat' | 'voice') => void;
  setAiAssistantOpen: (open: boolean) => void;
  setShieldSubTab: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  page,
  sidebarOpen,
  setSidebarOpen,
  navigateTo,
  setAiAssistantMode,
  setAiAssistantOpen,
  setShieldSubTab,
}) => {
  return (
    <>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        className={'emerald-sidebar ' + (sidebarOpen ? 'sidebar-open' : '')}
      >
        <button
          className="sidebar-brand"
          aria-label="Froggo home"
          onClick={() => navigateTo('home')}
        >
          <FroggoLogo size={42} />
          <span>
            froggo<span>®</span>
          </span>
        </button>

        <div className="workspace-picker">
          <span className="workspace-avatar">F</span>
          <div>
            <strong>Personal workspace</strong>
            <span>Contract review</span>
          </div>
          <Check size={13} />
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav aria-label="Main navigation" className="sidebar-nav">
          {(
            [
              { id: 'home', label: 'Overview', icon: Home },
              { id: 'read', label: 'Reading room', icon: FileText },
              { id: 'create', label: 'Creator desk', icon: Wand2 },
              { id: 'shield', label: 'Templates', icon: LayoutGrid },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => navigateTo(item.id)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {page === item.id && <span className="sidebar-active-dot" />}
            </button>
          ))}
          <button
            onClick={() => {
              setAiAssistantMode('chat');
              setAiAssistantOpen(true);
              setSidebarOpen(false);
            }}
          >
            <MessageSquareText size={17} />
            <span>Assistant</span>
            <span className="sidebar-ai-label">AI</span>
          </button>
        </nav>

        <div className="sidebar-lower">
          <div className="sidebar-glass-note">
            <div className="sidebar-note-symbol">
              <ShieldCheck size={21} />
            </div>
            <strong>A little more clarity.</strong>
            <p>Keep your documents and the details that matter together.</p>
            <button onClick={() => navigateTo('upload')}>
              Add a document <Plus size={15} />
            </button>
          </div>
          <button
            className="sidebar-privacy"
            onClick={() => {
              setShieldSubTab('privacy');
              navigateTo('shield');
            }}
          >
            <Lock size={15} /> Privacy &amp; data <ArrowUpRight size={13} />
          </button>
          <span className="sidebar-copyright">FROGGO / YOUR CONTRACT WORKSPACE</span>
        </div>
      </aside>
    </>
  );
};
