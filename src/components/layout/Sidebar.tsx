'use client';

/**
 * 侧边栏导航
 * 主导航：仪表盘、本体模型、MCP Server
 * 测试区：Agent Showcase
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import {
  LayoutDashboard,
  Network,
  Server,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, labelKey: 'nav_dashboard', labelKeyEn: 'nav_dashboard' },
  { href: '/ontology', icon: Network, labelKey: 'nav_ontology', labelKeyEn: 'nav_ontology' },
  { href: '/mcp-servers', icon: Server, labelKey: 'nav_mcp_servers', labelKeyEn: 'nav_mcp_servers' },
] as const;

const SHOWCASE_ITEM = {
  href: '/showcase',
  icon: MessageSquare,
  labelKey: 'nav_showcase',
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useApp();
  const { locale } = state;
  const collapsed = state.sidebarCollapsed;

  return (
    <aside
      className={`flex flex-col h-full border-r border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 h-14 border-b border-border/50 flex-shrink-0">
        <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground flex-shrink-0">
          <Sparkles className="size-3.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-semibold leading-tight truncate">{t('app_title', locale)}</h1>
          </div>
        )}
      </div>

      {/* 主导航 */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        <p className={`text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider px-2 mb-1 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '·' : t('nav_platform', locale)}
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? t(item.labelKey, locale) : undefined}
            >
              <item.icon className="size-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.labelKey, locale)}</span>}
            </Link>
          );
        })}

        {/* 分隔线 */}
        <div className="border-t border-border/40 my-2" />

        {/* 测试区 */}
        <p className={`text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider px-2 mb-1 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '·' : t('nav_testing', locale)}
        </p>
        <Link
          href={SHOWCASE_ITEM.href}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === SHOWCASE_ITEM.href
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          } ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? t(SHOWCASE_ITEM.labelKey, locale) : undefined}
        >
          <SHOWCASE_ITEM.icon className="size-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">{t(SHOWCASE_ITEM.labelKey, locale)}</span>}
        </Link>
      </nav>

      {/* 折叠按钮 + 语言切换 */}
      <div className="border-t border-border/50 px-2 py-2 flex items-center gap-1">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={collapsed ? t('expand', locale) : t('collapse', locale)}
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
        {!collapsed && (
          <button
            onClick={() => dispatch({ type: 'SET_LOCALE', locale: locale === 'zh' ? 'en' : 'zh' })}
            className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
        )}
      </div>
    </aside>
  );
}
