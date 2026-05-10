'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, UIAction, AgentRecord, AgentVersion, DemoVersion, Locale } from '@/types/architecture';
import { loadAgents, saveAgents, generateId, getNextVersion, getNextDemoVersion } from '@/lib/data-service';

const initialState: AppState = {
  agents: [],
  selectedAgentId: null,
  selectedVersionId: null,
  selectedDemoId: null,
  activeTab: 0,
  locale: 'en',
  demoPlaying: false,
  demoCurrentStep: 0,
  demoAutoPlay: false,
};

function appReducer(state: AppState, action: UIAction): AppState {
  switch (action.type) {
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };

    case 'ADD_AGENT': {
      const agents = [...state.agents, action.payload];
      return {
        ...state,
        agents,
        selectedAgentId: action.payload.id,
        selectedVersionId: null,
        selectedDemoId: null,
      };
    }

    case 'UPDATE_AGENT': {
      const agents = state.agents.map(a =>
        a.id === action.payload.agentId ? { ...a, ...action.payload.updates, updatedAt: Date.now() } : a
      );
      return { ...state, agents };
    }

    case 'DELETE_AGENT': {
      const agents = state.agents.filter(a => a.id !== action.payload);
      const selectedAgentId = state.selectedAgentId === action.payload
        ? (agents[0]?.id ?? null)
        : state.selectedAgentId;
      return {
        ...state,
        agents,
        selectedAgentId,
        selectedVersionId: null,
        selectedDemoId: null,
      };
    }

    case 'SELECT_AGENT': {
      const agent = state.agents.find(a => a.id === action.payload);
      const latestVersion = agent?.versions[agent.versions.length - 1];
      const selectedVersionId = latestVersion?.id ?? null;
      const selectedDemoId = latestVersion?.demos.length
        ? latestVersion.demos[latestVersion.demos.length - 1]?.id ?? null
        : null;
      return {
        ...state,
        selectedAgentId: action.payload,
        selectedVersionId,
        selectedDemoId,
        activeTab: 0,
      };
    }

    case 'ADD_VERSION': {
      const agents = state.agents.map(a =>
        a.id === action.payload.agentId
          ? { ...a, versions: [...a.versions, action.payload.version], updatedAt: Date.now() }
          : a
      );
      return {
        ...state,
        agents,
        selectedVersionId: action.payload.version.id,
        selectedDemoId: null,
      };
    }

    case 'UPDATE_VERSION': {
      const agents = state.agents.map(a =>
        a.id === action.payload.agentId
          ? {
              ...a,
              versions: a.versions.map(v =>
                v.id === action.payload.versionId ? { ...v, ...action.payload.updates } : v
              ),
              updatedAt: Date.now(),
            }
          : a
      );
      return { ...state, agents };
    }

    case 'SELECT_VERSION': {
      const agent = state.agents.find(a => a.id === action.payload.agentId);
      const version = agent?.versions.find(v => v.id === action.payload.versionId);
      const selectedDemoId = version?.demos[version.demos.length - 1]?.id ?? null;
      return {
        ...state,
        selectedVersionId: action.payload.versionId,
        selectedDemoId,
      };
    }

    case 'ADD_DEMO': {
      const agents = state.agents.map(a =>
        a.id === action.payload.agentId
          ? {
              ...a,
              versions: a.versions.map(v =>
                v.id === action.payload.versionId
                  ? { ...v, demos: [...v.demos, action.payload.demo] }
                  : v
              ),
              updatedAt: Date.now(),
            }
          : a
      );
      return {
        ...state,
        agents,
        selectedDemoId: action.payload.demo.id,
        activeTab: 1,
      };
    }

    case 'SELECT_DEMO':
      return { ...state, selectedDemoId: action.payload.demoId };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_LOCALE':
      return { ...state, locale: action.payload };

    case 'TOGGLE_LOCALE':
      return { ...state, locale: state.locale === 'zh' ? 'en' : 'zh' };

    case 'SET_DEMO_PLAYING':
      return { ...state, demoPlaying: action.payload };

    case 'SET_DEMO_STEP':
      return { ...state, demoCurrentStep: action.payload };

    case 'SET_DEMO_AUTO_PLAY':
      return { ...state, demoAutoPlay: action.payload };

    case 'RESET_DEMO':
      return { ...state, demoCurrentStep: 0, demoPlaying: false, demoAutoPlay: false };

    default:
      return state;
  }
}

// Helper functions exposed via context
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<UIAction>;
  // Convenience helpers
  selectedAgent: AgentRecord | null;
  selectedVersion: AgentVersion | null;
  selectedDemo: DemoVersion | null;
  createAgent: (name: string) => void;
  addVersion: (agentId: string, description: AgentVersion['description']) => void;
  addDemo: (agentId: string, versionId: string, architecture: DemoVersion['architecture'], scenarios: DemoVersion['scenarios']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadAgents();
    if (stored.length > 0) {
      dispatch({ type: 'SET_AGENTS', payload: stored });
      dispatch({ type: 'SELECT_AGENT', payload: stored[0].id });
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    saveAgents(state.agents);
  }, [state.agents]);

  // Derive convenience values
  const selectedAgent = state.agents.find(a => a.id === state.selectedAgentId) ?? null;
  const selectedVersion = selectedAgent?.versions.find(v => v.id === state.selectedVersionId) ?? null;
  const selectedDemo = selectedVersion?.demos.find(d => d.id === state.selectedDemoId) ?? null;

  // Helper: Create new agent with initial version
  function createAgent(name: string) {
    const agentId = generateId();
    const versionId = generateId();
    const version: AgentVersion = {
      id: versionId,
      version: 'v1.0',
      createdAt: Date.now(),
      description: {
        intro: '',
        applicable_scenarios: '',
        capabilities: '',
        system_connections: '',
        business_impact: '',
        category: '',
      },
      demos: [],
    };
    const agent: AgentRecord = {
      id: agentId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [version],
    };
    dispatch({ type: 'ADD_AGENT', payload: agent });
  }

  // Helper: Add new version to agent
  function addVersion(agentId: string, description: AgentVersion['description']) {
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) return;
    const nextVersion = getNextVersion(agent.versions);
    const version: AgentVersion = {
      id: generateId(),
      version: nextVersion,
      createdAt: Date.now(),
      description,
      demos: [],
    };
    dispatch({ type: 'ADD_VERSION', payload: { agentId, version } });
  }

  // Helper: Add demo to version
  function addDemo(
    agentId: string,
    versionId: string,
    architecture: DemoVersion['architecture'],
    scenarios: DemoVersion['scenarios']
  ) {
    const version = state.agents.find(a => a.id === agentId)?.versions.find(v => v.id === versionId);
    if (!version) return;
    const nextDemoVersion = getNextDemoVersion(version.demos);
    const demo: DemoVersion = {
      id: generateId(),
      version: nextDemoVersion,
      createdAt: Date.now(),
      architecture,
      scenarios,
    };
    dispatch({ type: 'ADD_DEMO', payload: { agentId, versionId, demo } });
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        selectedAgent,
        selectedVersion,
        selectedDemo,
        createAgent,
        addVersion,
        addDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
