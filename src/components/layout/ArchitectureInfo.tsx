'use client';

/**
 * 架构说明弹窗
 * 展示主 Agent 调用 MCP 的整体架构
 */

import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { X, User, Bot, Server, Cpu, Database, ArrowRight } from 'lucide-react';

export function ArchitectureInfo() {
  const { state, dispatch } = useApp();
  const { locale, showArchitectureInfo } = state;
  if (!showArchitectureInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => dispatch({ type: 'TOGGLE_ARCHITECTURE_INFO' })}
    >
      <div
        className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="size-5 text-primary" />
              {t('arch_title', locale)}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === 'zh'
                ? '企业 Agent 平台：主 Agent 通过 MCP 协议调用不同领域的本体模型'
                : 'Enterprise Agent Portal: main agent calling domain ontologies via MCP'}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_ARCHITECTURE_INFO' })}
            className="p-1.5 rounded-lg hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 架构图 */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-5 mb-5">
          <div className="flex flex-col items-center gap-3">
            {/* 用户层 */}
            <ArchNode
              icon={<User className="size-4" />}
              title={locale === 'zh' ? '用户' : 'User'}
              color="bg-muted"
            />
            <Arrow />

            {/* 主 Agent 层 */}
            <ArchNode
              icon={<Bot className="size-4" />}
              title={t('arch_main_agent', locale)}
              subtitle={t('arch_main_agent_desc', locale)}
              color="bg-primary text-primary-foreground"
              highlight
            />
            <Arrow />

            {/* MCP 协议层 */}
            <ArchNode
              icon={<Server className="size-4" />}
              title={t('arch_mcp', locale)}
              subtitle={t('arch_mcp_desc', locale)}
              color="bg-cyan-500/10 text-cyan-700 border-cyan-500/30"
            />
            <Arrow />

            {/* 领域本体层 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              {[
                { id: 'manufacturing', name: '制造业本体', nameEn: 'Manufacturing', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
                { id: 'customer-service', name: '客服本体', nameEn: 'Customer Service', color: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
                { id: 'supply-chain', name: '供应链本体', nameEn: 'Supply Chain', color: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
              ].map((d) => (
                <div
                  key={d.id}
                  className={`rounded-lg border p-2.5 text-center text-xs font-medium ${d.color}`}
                >
                  {locale === 'zh' ? d.name : d.nameEn}
                </div>
              ))}
            </div>
            <Arrow />

            {/* 后端系统层 */}
            <ArchNode
              icon={<Database className="size-4" />}
              title={locale === 'zh' ? '后端系统 (MES / SCADA / CRM / ERP / WMS / TMS)' : 'Backend Systems (MES/SCADA/CRM/ERP/WMS/TMS)'}
              color="bg-muted"
            />
          </div>
        </div>

        {/* 五大能力 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            {t('arch_capabilities', locale)}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { key: 'semantic', desc: { zh: '语义解析、概念查询、实体抽取', en: 'Semantic parse, concept query, entity extraction' } },
              { key: 'behavior', desc: { zh: '行为规则、决策执行、流程编排', en: 'Behavior rules, decision execution, process orchestration' } },
              { key: 'event', desc: { zh: '领域事件、状态变更、订阅通知', en: 'Domain events, state changes, subscriptions' } },
              { key: 'governance', desc: { zh: '阈值校验、合规审计、质量检查', en: 'Threshold validation, compliance audit, quality check' } },
              { key: 'api', desc: { zh: '后端 API 调用、数据读写', en: 'Backend API calls, data read/write' } },
            ].map((cap) => (
              <div
                key={cap.key}
                className="rounded-lg border border-border/60 bg-background/50 p-2.5"
              >
                <div className="text-xs font-medium text-primary mb-1">
                  {t(`arch_cap_${cap.key}`, locale)}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {locale === 'zh' ? cap.desc.zh : cap.desc.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchNode({
  icon,
  title,
  subtitle,
  color,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-2.5 min-w-[200px] text-center ${color} ${
        highlight ? 'shadow-md ring-2 ring-primary/30' : ''
      }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
    </div>
  );
}

function Arrow() {
  return <ArrowRight className="size-3.5 text-muted-foreground rotate-90" />;
}
