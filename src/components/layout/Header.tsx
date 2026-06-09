'use client';

/**
 * 顶部导航栏
 * 包含标题、语言切换、架构说明按钮
 */

import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { Languages, Info, Sparkles } from 'lucide-react';

export function Header() {
  const { state, dispatch } = useApp();
  const { locale, showArchitectureInfo } = state;

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border/50 bg-card/40 backdrop-blur-sm flex-shrink-0">
      {/* 标题 */}
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground">
          <Sparkles className="size-3.5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight">{t('app_title', locale)}</h1>
          <p className="text-xs text-muted-foreground leading-tight hidden sm:block">
            {t('app_subtitle', locale)}
          </p>
        </div>
      </div>

      {/* 操作区 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_ARCHITECTURE_INFO' })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            showArchitectureInfo
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border/60 hover:border-primary/40 hover:bg-primary/5'
          }`}
        >
          <Info className="size-3" />
          {t('arch_title', locale)}
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_LOCALE', locale: locale === 'zh' ? 'en' : 'zh' })}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors flex items-center gap-1.5"
        >
          <Languages className="size-3" />
          {locale === 'zh' ? 'EN' : '中文'}
        </button>
      </div>
    </header>
  );
}
