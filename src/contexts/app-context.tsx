'use client';

/**
 * 全局状态管理 - Ontology Hub
 * 管理：聊天消息、当前选中领域、是否正在思考、语言
 */

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ChatMessage } from '@/types/ontology';

export type Locale = 'zh' | 'en';

/** 应用状态 */
export interface AppState {
  chatMessages: ChatMessage[];
  activeDomainId: string | undefined;
  isThinking: boolean;
  locale: Locale;
  showArchitectureInfo: boolean;
}

/** Action 类型 */
export type UIAction =
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'UPDATE_CHAT_MESSAGE'; messageId: string; updates: Partial<ChatMessage> }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_ACTIVE_DOMAIN'; domainId: string | undefined }
  | { type: 'SET_THINKING'; isThinking: boolean }
  | { type: 'SET_LOCALE'; locale: Locale }
  | { type: 'TOGGLE_ARCHITECTURE_INFO' }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };

const initialState: AppState = {
  chatMessages: [],
  activeDomainId: undefined,
  isThinking: false,
  locale: 'zh',
  showArchitectureInfo: false,
};

function appReducer(state: AppState, action: UIAction): AppState {
  switch (action.type) {
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.message] };

    case 'UPDATE_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.map((m) =>
          m.id === action.messageId ? { ...m, ...action.updates } : m,
        ),
      };

    case 'CLEAR_CHAT':
      return { ...state, chatMessages: [] };

    case 'SET_ACTIVE_DOMAIN':
      return { ...state, activeDomainId: action.domainId };

    case 'SET_THINKING':
      return { ...state, isThinking: action.isThinking };

    case 'SET_LOCALE':
      return { ...state, locale: action.locale };

    case 'TOGGLE_ARCHITECTURE_INFO':
      return { ...state, showArchitectureInfo: !state.showArchitectureInfo };

    case 'LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}

const STORAGE_KEY = 'ontology-hub-state';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<UIAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 加载持久化状态
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppState>;
        dispatch({ type: 'LOAD_STATE', state: parsed });
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }, []);

  // 持久化状态
  useEffect(() => {
    try {
      // 只持久化关键字段，不保存消息历史
      const toSave = {
        locale: state.locale,
        activeDomainId: state.activeDomainId,
        showArchitectureInfo: state.showArchitectureInfo,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state.locale, state.activeDomainId, state.showArchitectureInfo]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
