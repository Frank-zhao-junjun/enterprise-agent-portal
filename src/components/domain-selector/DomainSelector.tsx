'use client';

/**
 * 领域选择器
 * 显示所有可用领域本体及其 MCP 工具
 */

import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { ALL_DOMAINS } from '@/lib/domain-registry';
import { t, getToolCategoryName, getCategoryColor } from '@/lib/i18n';
import { Server, Wrench, ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { DomainOntology, MCPTool } from '@/types/ontology';

export function DomainSelector() {
  const { state, dispatch } = useApp();
  const { locale, activeDomainId } = state;
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="p-5 border-b border-border/50">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Server className="size-4 text-primary" />
          {t('domains_title', locale)}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{t('domains_subtitle', locale)}</p>
      </div>

      {/* 领域列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {ALL_DOMAINS.map((domain) => {
          const isActive = activeDomainId === domain.id;
          const isExpanded = expandedDomainId === domain.id;
          const name = locale === 'zh' ? domain.name : domain.nameEn;
          const desc = locale === 'zh' ? domain.description : domain.descriptionEn;

          return (
            <div
              key={domain.id}
              className={`rounded-xl border transition-all ${
                isActive
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border/40 bg-card/50 hover:border-primary/30'
              }`}
            >
              {/* 领域头部 */}
              <button
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_DOMAIN', domainId: isActive ? undefined : domain.id });
                }}
                className="w-full p-3 text-left"
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isActive ? <Check className="size-4" /> : <Server className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-medium truncate">{name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{desc}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        <Wrench className="size-2.5 inline mr-0.5" />
                        {domain.tools.length} {t('tools_count', locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* 工具展开按钮 */}
              <button
                onClick={() => setExpandedDomainId(isExpanded ? null : domain.id)}
                className="w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border-t border-border/30 flex items-center justify-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="size-3" />
                    {locale === 'zh' ? '收起工具' : 'Hide tools'}
                  </>
                ) : (
                  <>
                    <ChevronRight className="size-3" />
                    {locale === 'zh' ? '查看工具' : 'View tools'}
                  </>
                )}
              </button>

              {/* 工具列表 */}
              {isExpanded && <ToolList domain={domain} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 工具列表 */
function ToolList({ domain }: { domain: DomainOntology }) {
  return (
    <div className="px-3 pb-3 space-y-1.5 border-t border-border/30 pt-2">
      {domain.tools.map((tool) => (
        <ToolCard key={tool.name} tool={tool} />
      ))}
    </div>
  );
}

/** 工具卡片 */
function ToolCard({ tool }: { tool: MCPTool }) {
  const { state } = useApp();
  const locale = state.locale;
  return (
    <div className="rounded-lg border border-border/40 bg-background/50 p-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`text-xs px-1.5 py-0.5 rounded border ${getCategoryColor(tool.category)}`}
        >
          {getToolCategoryName(tool.category, locale)}
        </span>
        <span className="text-xs font-mono text-foreground/80">{tool.name}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
    </div>
  );
}
