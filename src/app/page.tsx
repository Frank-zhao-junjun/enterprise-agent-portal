'use client';

import React from 'react';
import { AppProvider } from '@/contexts/app-context';
import AgentDesignerClient from '@/components/agent-designer/AgentDesignerClient';
import InteractiveDemoClient from '@/components/interactive-demo/InteractiveDemoClient';
import ArchitectureDiagramClient from '@/components/architecture-diagram/ArchitectureDiagramClient';
import AgentDetailsClient from '@/components/agent-details/AgentDetailsClient';
import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { Locale } from '@/types/architecture';

type TabId = 'designer' | 'demo' | 'architecture' | 'details';

const TABS: { id: TabId; icon: string; labelKey: 'tab_designer' | 'tab_interactive_demo' | 'tab_architecture' | 'tab_agent_details' }[] = [
  { id: 'designer', icon: '🧩', labelKey: 'tab_designer' },
  { id: 'demo', icon: '💬', labelKey: 'tab_interactive_demo' },
  { id: 'architecture', icon: '🔗', labelKey: 'tab_architecture' },
  { id: 'details', icon: '📋', labelKey: 'tab_agent_details' },
];

const TAB_IDS: TabId[] = ['designer', 'demo', 'architecture', 'details'];
const TAB_NUM_MAP: Record<number, TabId> = { 0: 'designer', 1: 'demo', 2: 'architecture', 3: 'details' };

function PageContent() {
  const { state, dispatch } = useApp();
  const locale: Locale = state.locale;
  const activeTab: TabId = TAB_NUM_MAP[state.activeTab] ?? 'designer';

  const renderTab = () => {
    switch (activeTab) {
      case 'designer':
        return <AgentDesignerClient />;
      case 'demo':
        return <InteractiveDemoClient />;
      case 'architecture':
        return <ArchitectureDiagramClient />;
      case 'details':
        return <AgentDetailsClient />;
      default:
        return <AgentDesignerClient />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="font-semibold text-sm leading-tight">{t('app_title', locale)}</h1>
            <p className="text-xs text-muted-foreground">{t('app_subtitle', locale)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_LOCALE' })}
            className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="h-11 border-b border-border bg-card flex items-end px-4 gap-1 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: TAB_IDS.indexOf(tab.id) as 0 | 1 | 2 | 3 })}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary font-semibold bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{t(tab.labelKey, locale)}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden flex">
        {renderTab()}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <PageContent />
    </AppProvider>
  );
}
