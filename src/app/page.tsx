'use client';

/**
 * 仪表盘主页面
 * 展示 MCP Server 概览、本体模型统计、快速操作
 */

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { getAllDomains } from '@/lib/domain-registry';
import type { DomainOntology } from '@/types/ontology';
import {
  Server,
  Network,
  Wrench,
  Activity,
  ArrowRight,
  CircleDot,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Cpu,
  Truck,
  HeadphonesIcon,
} from 'lucide-react';
import Link from 'next/link';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  manufacturing: Cpu,
  'customer-service': HeadphonesIcon,
  'supply-chain': Truck,
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  zh: {
    semantic: '语义理解',
    behavior: '行为执行',
    event: '事件查询',
    governance: '合规治理',
    api: 'API 连接',
  },
  en: {
    semantic: 'Semantic',
    behavior: 'Behavior',
    event: 'Event',
    governance: 'Governance',
    api: 'API Connection',
  },
};

export default function DashboardPage() {
  const { state } = useApp();
  const { locale } = state;
  const [domains, setDomains] = useState<DomainOntology[]>([]);
  const [mcpStatus, setMcpStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({});

  useEffect(() => {
    const all = getAllDomains();
    setDomains(all);

    // Check MCP Server status
    const checkStatus = async () => {
      const statusMap: Record<string, 'online' | 'offline' | 'checking'> = {};
      for (const domain of all) {
        statusMap[domain.id] = 'checking';
        try {
          const res = await fetch(`/api/mcp/${domain.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
          });
          if (res.ok) {
            statusMap[domain.id] = 'online';
          } else {
            statusMap[domain.id] = 'offline';
          }
        } catch {
          statusMap[domain.id] = 'offline';
        }
      }
      setMcpStatus(statusMap);
    };
    checkStatus();
  }, []);

  const totalTools = domains.reduce((acc, d) => acc + d.tools.length, 0);
  const onlineServers = Object.values(mcpStatus).filter((s) => s === 'online').length;
  const totalServers = domains.length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* 标题区 */}
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard_title', locale)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard_subtitle', locale)}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Server}
            label={t('stat_mcp_servers', locale)}
            value={`${onlineServers}/${totalServers}`}
            sublabel={t('stat_online', locale)}
            color="blue"
          />
          <StatCard
            icon={Network}
            label={t('stat_ontology_domains', locale)}
            value={String(domains.length)}
            sublabel={t('stat_domains_desc', locale)}
            color="purple"
          />
          <StatCard
            icon={Wrench}
            label={t('stat_total_tools', locale)}
            value={String(totalTools)}
            sublabel={t('stat_tools_desc', locale)}
            color="green"
          />
          <StatCard
            icon={Activity}
            label={t('stat_categories', locale)}
            value="5"
            sublabel={t('stat_categories_desc', locale)}
            color="orange"
          />
        </div>

        {/* MCP Server 状态 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('mcp_server_status', locale)}</h2>
            <Link
              href="/mcp-servers"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {t('view_all', locale)} <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {domains.map((domain) => {
              const Icon = DOMAIN_ICONS[domain.id] || Boxes;
              const status = mcpStatus[domain.id] || 'checking';
              return (
                <div
                  key={domain.id}
                  className="rounded-xl border border-border/50 bg-card/50 p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">
                          {locale === 'zh' ? domain.name : domain.nameEn}
                        </h3>
                        <p className="text-xs text-muted-foreground">{domain.id}</p>
                      </div>
                    </div>
                    <StatusBadge status={status} locale={locale} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {locale === 'zh' ? domain.description : domain.descriptionEn}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {domain.tools.length} {t('tools_count', locale)}
                    </span>
                    <Link
                      href={`/mcp-servers?domain=${domain.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('view_details', locale)}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 本体模型能力类别 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('ontology_capabilities', locale)}</h2>
            <Link
              href="/ontology"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {t('view_all', locale)} <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(Object.keys(CATEGORY_LABELS.zh) as Array<keyof typeof CATEGORY_LABELS.zh>).map(
              (cat) => {
                const catTools = domains.flatMap((d) => d.tools.filter((tool) => tool.category === cat));
                return (
                  <div
                    key={cat}
                    className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/30 transition-colors"
                  >
                    <h3 className="text-sm font-semibold mb-1">
                      {CATEGORY_LABELS[locale]?.[cat] || cat}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {catTools.length} {t('tools_count', locale)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {domains.map((d) => {
                        const hasCat = d.tools.some((tool) => tool.category === cat);
                        return hasCat ? (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary"
                          >
                            {d.icon} {locale === 'zh' ? d.name : d.nameEn}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* 快速入口 */}
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6">
          <h2 className="text-sm font-semibold mb-3">{t('quick_start', locale)}</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ontology"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Network className="size-4" />
              {t('browse_ontology', locale)}
            </Link>
            <Link
              href="/mcp-servers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <Server className="size-4" />
              {t('manage_servers', locale)}
            </Link>
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              <Activity className="size-4" />
              {t('agent_showcase', locale)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`size-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="size-4.5" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
    </div>
  );
}

function StatusBadge({
  status,
  locale,
}: {
  status: 'online' | 'offline' | 'checking';
  locale: string;
}) {
  if (status === 'checking') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        <CircleDot className="size-2.5 animate-pulse" />
        {locale === 'zh' ? '检测中' : 'Checking'}
      </span>
    );
  }
  if (status === 'online') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
        <CheckCircle2 className="size-2.5" />
        {locale === 'zh' ? '在线' : 'Online'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
      <AlertCircle className="size-2.5" />
      {locale === 'zh' ? '离线' : 'Offline'}
    </span>
  );
}
