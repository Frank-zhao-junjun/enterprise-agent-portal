'use client';

import { t, getAgentName } from '@/lib/i18n';
import { useApp } from '@/contexts/app-context';
import type { AgentRecord, AgentVersion, DemoVersion, ArchitectureOutput, AgentDefinition, Locale } from '@/types/architecture';

function AgentCard({ agent, allAgents, locale }: { agent: AgentDefinition; allAgents: AgentDefinition[]; locale: Locale }) {
  const displayName = getAgentName(agent, locale);
  const handoffTargets = agent.handoffs.map(h => {
    const target = allAgents.find(a => a.id === h.agentId);
    return { ...h, target };
  }).filter(h => h.target);

  const guardrails = agent.input_guardrails ?? [];
  const toolCount = agent.tools.length;

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Agent Header */}
      <div className="p-4 flex items-center gap-3" style={{ backgroundColor: agent.color + '15' }}>
        <span className="text-2xl">{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          <p className="text-xs text-muted-foreground">{agent.handoff_description}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
            {toolCount} {locale === 'zh' ? '工具' : 'tools'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
            {handoffTargets.length} {locale === 'zh' ? '转接' : 'handoffs'}
          </span>
          {guardrails.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
              🛡️ {guardrails.length}
            </span>
          )}
        </div>
      </div>

      {/* Tools */}
      <div className="p-4 border-t border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {locale === 'zh' ? '工具 (Tools)' : 'Tools'}
        </h4>
        <div className="space-y-2">
          {agent.tools.map(tool => (
            <div key={tool.id} className="flex items-start gap-2">
              <span className="text-xs mt-0.5">🔧</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium">{tool.name}</span>
                  {tool.shared_with && tool.shared_with.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                      {locale === 'zh' ? '共享' : 'shared'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{tool.description}</p>
                {tool.updates_context && (
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    ✏️ {locale === 'zh' ? '更新上下文' : 'Updates context'}: <code className="font-mono">{tool.updates_context}</code>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Handoff Targets */}
      <div className="p-4 border-t border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {locale === 'zh' ? '转接目标 (Handoff Targets)' : 'Handoff Targets'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {handoffTargets.map(h => (
            <div key={h.agentId} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30">
              <span className="text-sm">{h.target!.icon}</span>
              <span className="text-xs font-medium">{getAgentName(h.target!, locale)}</span>
              {h.hasHook && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700" title={locale === 'zh' ? '有 on_handoff 钩子' : 'Has on_handoff hook'}>
                  🔧 hook
                </span>
              )}
              {h.agentId === allAgents[0]?.id && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {locale === 'zh' ? '回Hub' : '→ Hub'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input Guardrails */}
      {guardrails.length > 0 && (
        <div className="p-4 border-t border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            🛡️ {locale === 'zh' ? '输入护栏 (Input Guardrails)' : 'Input Guardrails'}
          </h4>
          <div className="space-y-1.5">
            {guardrails.map(gr => (
              <div key={gr.id} className="flex items-center gap-2 text-xs">
                <span>{gr.type === 'relevance' ? '🔍' : '🔒'}</span>
                <span className="font-medium">{locale === 'zh' ? gr.name : gr.nameEn}</span>
                <span className="text-muted-foreground">({gr.model})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HandoffMatrix({ architecture, locale }: { architecture: ArchitectureOutput; locale: Locale }) {
  const triageAgent = architecture.triage_agent;
  const spokeAgents = architecture.spoke_agents;
  const allAgents = [triageAgent, ...spokeAgents];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
      <h3 className="font-semibold mb-4">{locale === 'zh' ? '转接关系矩阵 (Handoff Matrix)' : 'Handoff Matrix'}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-2 text-left font-medium text-muted-foreground border-b border-border">
                {locale === 'zh' ? '来源 ↓ / 目标 →' : 'From ↓ / To →'}
              </th>
              {allAgents.map(a => (
                <th key={a.id} className="py-2 px-2 text-center font-medium border-b border-border">
                  <span className="block">{a.icon}</span>
                  <span className="text-[10px]">{getAgentDisplayName(a, locale)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allAgents.map(fromAgent => (
              <tr key={fromAgent.id} className="hover:bg-muted/30">
                <td className="py-2 px-2 font-medium border-b border-border/50 whitespace-nowrap">
                  <span className="mr-1">{fromAgent.icon}</span>
                  {getAgentDisplayName(fromAgent, locale)}
                </td>
                {allAgents.map(toAgent => {
                  if (fromAgent.id === toAgent.id) {
                    return (
                      <td key={toAgent.id} className="py-2 px-2 text-center border-b border-border/50">
                        <span className="text-slate-300">·</span>
                      </td>
                    );
                  }
                  const handoff = fromAgent.handoffs.find(h => h.agentId === toAgent.id);
                  if (handoff) {
                    const isTriageSource = fromAgent.id === triageAgent.id;
                    const isBackToHub = toAgent.id === triageAgent.id && fromAgent.id !== triageAgent.id;
                    const isCrossSpoke = fromAgent.id !== triageAgent.id && toAgent.id !== triageAgent.id;
                    let bgClass = 'bg-green-100 text-green-700';
                    let label = '✓';
                    if (isBackToHub) {
                      bgClass = 'bg-slate-100 text-slate-600';
                      label = '↩';
                    } else if (isCrossSpoke) {
                      bgClass = handoff.hasHook ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700';
                      label = handoff.hasHook ? '🔧' : '⟶';
                    } else if (isTriageSource) {
                      bgClass = handoff.hasHook ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
                      label = handoff.hasHook ? '🔧' : '✓';
                    }
                    return (
                      <td key={toAgent.id} className="py-2 px-2 text-center border-b border-border/50">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${bgClass}`}>
                          {label}
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td key={toAgent.id} className="py-2 px-2 text-center border-b border-border/50">
                      <span className="text-slate-300">✕</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-700 text-[8px]">✓</span> {locale === 'zh' ? 'Hub→Spoke' : 'Hub→Spoke'}</span>
        <span className="flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[8px]">↩</span> {locale === 'zh' ? '回Hub' : '→Hub'}</span>
        <span className="flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[8px]">⟶</span> {locale === 'zh' ? '跨Spoke直连' : 'Cross-Spoke'}</span>
        <span className="flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[8px]">🔧</span> {locale === 'zh' ? '有Hook' : 'With Hook'}</span>
        <span className="flex items-center gap-1"><span className="text-slate-300">✕</span> {locale === 'zh' ? '无转接' : 'No handoff'}</span>
      </div>
    </div>
  );
}

function getAgentDisplayName(agent: AgentDefinition, locale: Locale): string {
  const name = getAgentName(agent, locale);
  return name.length > 10 ? name.split(' ').slice(0, 2).join(' ') : name;
}

function AgentDetailsInner({ architecture }: { architecture: ArchitectureOutput }) {
  const { state } = useApp();
  const locale: Locale = state.locale;

  const allAgents = [architecture.triage_agent, ...architecture.spoke_agents];

  return (
    <div className="h-full overflow-y-auto p-6 bg-muted/20">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* IROP Chain Highlight */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>✈️</span>
            <span>{locale === 'zh' ? 'IROP 完整链路 (航班不正常运营)' : 'IROP Full Chain (Irregular Operations)'}</span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
              {architecture.triage_agent.icon} {getAgentDisplayName(architecture.triage_agent, locale)}
            </span>
            <span className="text-muted-foreground">→</span>
            {architecture.spoke_agents.map((agent, i) => {
              const isIROP = ['flight', 'booking', 'refund'].some(k => agent.id.toLowerCase().includes(k));
              return (
                <span key={agent.id} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isIROP ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                  {agent.icon} {getAgentDisplayName(agent, locale)}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {locale === 'zh'
              ? 'IROP链路: 航班信息Agent(检测延误) → 预订取消Agent(改签) → 退款赔偿Agent(赔偿)'
              : 'IROP Chain: Flight Info (detect delay) → Booking (rebook) → Refunds (compensate)'}
          </p>
        </div>

        {/* Agent Cards */}
        <div className="space-y-4">
          {allAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} allAgents={allAgents} locale={locale} />
          ))}
        </div>

        {/* Handoff Matrix */}
        <HandoffMatrix architecture={architecture} locale={locale} />
      </div>
    </div>
  );
}

export default function AgentDetailsClient() {
  const { state } = useApp();
  const selectedAgent = state.agents.find((a: AgentRecord) => a.id === state.selectedAgentId);
  const selectedVersion = selectedAgent?.versions.find(
    (v: AgentVersion) => v.version === state.selectedVersionId
  );
  const selectedDemo = selectedVersion?.demos.find(
    (d: DemoVersion) => d.version === state.selectedDemoId
  ) ?? selectedVersion?.demos[0];

  if (selectedDemo?.architecture) {
    return <AgentDetailsInner architecture={selectedDemo.architecture} />;
  }

  if (selectedVersion?.demos?.[0]?.architecture) {
    return <AgentDetailsInner architecture={selectedVersion.demos[0].architecture} />;
  }

  const locale: Locale = state.locale;

  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <span className="text-4xl mb-3 block">📋</span>
        <p className="text-sm">{t('label_no_demo_hint', locale)}</p>
      </div>
    </div>
  );
}
