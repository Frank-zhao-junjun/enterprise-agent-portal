'use client';

/**
 * 本体模型浏览页面
 * 展示各领域的本体模型：领域详情、能力类别、工具定义
 */

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { getAllDomains } from '@/lib/domain-registry';
import type { DomainOntology, MCPTool, MCPToolParameter } from '@/types/ontology';
import {
  Network,
  Cpu,
  Truck,
  HeadphonesIcon,
  Boxes,
  Search,
  ChevronDown,
  ChevronRight,
  Wrench,
  Eye,
  Play,
  ArrowRight,
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  manufacturing: Cpu,
  'customer-service': HeadphonesIcon,
  'supply-chain': Truck,
};

const CATEGORY_META: Record<
  string,
  { label: string; labelEn: string; icon: React.ElementType; color: string }
> = {
  semantic: {
    label: '语义理解',
    labelEn: 'Semantic Understanding',
    icon: Eye,
    color: 'bg-blue-500/10 text-blue-500',
  },
  behavior: {
    label: '行为执行',
    labelEn: 'Behavior Execution',
    icon: Play,
    color: 'bg-green-500/10 text-green-500',
  },
  event: {
    label: '事件查询',
    labelEn: 'Event Query',
    icon: Search,
    color: 'bg-orange-500/10 text-orange-500',
  },
  governance: {
    label: '合规治理',
    labelEn: 'Governance & Compliance',
    icon: Wrench,
    color: 'bg-purple-500/10 text-purple-500',
  },
  api: {
    label: 'API 连接',
    labelEn: 'API Connection',
    icon: ArrowRight,
    color: 'bg-cyan-500/10 text-cyan-500',
  },
};

export default function OntologyPage() {
  const { state } = useApp();
  const { locale } = state;
  const [domains, setDomains] = useState<DomainOntology[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDomains(getAllDomains());
  }, []);

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleTool = (key: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredDomains = selectedDomain
    ? domains.filter((d) => d.id === selectedDomain)
    : domains;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* 标题 */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="size-6 text-primary" />
            {t('ontology_title', locale)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('ontology_subtitle', locale)}</p>
        </div>

        {/* 领域筛选 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDomain(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedDomain === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border/60 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            {t('all_domains', locale)}
          </button>
          {domains.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.id] || Boxes;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id === selectedDomain ? null : domain.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  selectedDomain === domain.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                <Icon className="size-3" />
                {locale === 'zh' ? domain.name : domain.nameEn}
              </button>
            );
          })}
        </div>

        {/* 本体模型列表 */}
        <div className="space-y-4">
          {filteredDomains.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.id] || Boxes;
            const categories = [...new Set(domain.tools.map((tool) => tool.category))];

            return (
              <div
                key={domain.id}
                className="rounded-xl border border-border/50 bg-card/50 overflow-hidden"
              >
                {/* 领域头部 */}
                <div className="px-5 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-semibold">
                        {locale === 'zh' ? domain.name : domain.nameEn}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'zh' ? domain.description : domain.descriptionEn}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {domain.tools.length} {t('tools_count', locale)} · {categories.length}{' '}
                      {t('categories_count', locale)}
                    </span>
                  </div>
                </div>

                {/* 能力类别 */}
                <div className="divide-y divide-border/20">
                  {categories.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    if (!meta) return null;
                    const catTools = domain.tools.filter((tool) => tool.category === cat);
                    const catKey = `${domain.id}-${cat}`;
                    const isExpanded = expandedCategories.has(catKey);

                    return (
                      <div key={cat}>
                        <button
                          onClick={() => toggleCategory(catKey)}
                          className="w-full px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-3.5 text-muted-foreground" />
                          )}
                          <div
                            className={`size-6 rounded flex items-center justify-center ${meta.color}`}
                          >
                            <meta.icon className="size-3" />
                          </div>
                          <span className="text-sm font-medium flex-1 text-left">
                            {locale === 'zh' ? meta.label : meta.labelEn}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {catTools.length} {t('tools_count', locale)}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-3 space-y-2">
                            {catTools.map((tool) => (
                              <ToolCard
                                key={tool.name}
                                tool={tool}
                                domainId={domain.id}
                                locale={locale}
                                isExpanded={expandedTools.has(`${domain.id}-${tool.name}`)}
                                onToggle={() => toggleTool(`${domain.id}-${tool.name}`)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  domainId,
  locale,
  isExpanded,
  onToggle,
}: {
  tool: MCPTool;
  domainId: string;
  locale: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const params = tool.parameters ? Object.entries(tool.parameters) as [string, MCPToolParameter][] : [];
  const meta = CATEGORY_META[tool.category];

  return (
    <div className="rounded-lg border border-border/30 bg-muted/20 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-muted/40 transition-colors"
      >
        <Wrench className="size-3.5 text-muted-foreground" />
        <span className="text-sm font-mono font-medium text-foreground flex-1 text-left">
          {tool.name}
        </span>
        {meta && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${meta.color}`}
          >
            {locale === 'zh' ? meta.label : meta.labelEn}
          </span>
        )}
        {isExpanded ? (
          <ChevronDown className="size-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2.5">
          <p className="text-xs text-muted-foreground">{tool.description}</p>

          {/* 参数列表 */}
          {params.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">
                {locale === 'zh' ? '参数' : 'Parameters'}
              </p>
              <div className="space-y-1">
                {params.map(([name, param]) => (
                  <div
                    key={name}
                    className="flex items-start gap-2 text-xs bg-background/50 rounded px-2 py-1.5"
                  >
                    <span className="font-mono text-primary font-medium">{name}</span>
                    <span className="text-muted-foreground">{param.type}</span>
                    {param.required && (
                      <span className="text-[10px] text-red-400">required</span>
                    )}
                    <span className="text-muted-foreground flex-1">— {param.description}</span>
                    {param.enum && (
                      <span className="text-[10px] text-muted-foreground/60">
                        [{param.enum.join(' | ')}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 快速测试按钮 */}
          <div className="pt-1">
            <a
              href={`/mcp-servers?domain=${domainId}&tool=${tool.name}`}
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              <Play className="size-2.5" />
              {locale === 'zh' ? '测试此工具' : 'Test this tool'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
