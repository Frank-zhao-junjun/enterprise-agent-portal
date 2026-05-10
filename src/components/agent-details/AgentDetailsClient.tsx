'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { t, getRuleTypeName } from '@/lib/i18n';
import { AgentDefinition, ArchitectureOutput, Locale, BusinessRule } from '@/types/architecture';

function AgentCard({ agent, allAgents, businessRules, locale }: {
  agent: AgentDefinition;
  allAgents: AgentDefinition[];
  businessRules: BusinessRule[];
  locale: Locale;
}) {
  const [expanded, setExpanded] = useState(false);
  const isTriage = agent === allAgents[0];

  const appliedRules = businessRules.filter(r => r.applies_to?.includes(agent.id));

  const handoffTargets = (agent.handoffs || [])
    .map(h => allAgents.find(a => a.id === h))
    .filter((a): a is AgentDefinition => a !== undefined);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: agent.color + '20' }}>
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            {isTriage && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                Hub
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{agent.description}</p>
        </div>
        <span className={`text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border space-y-4 pt-3">
          {/* Tools */}
          {agent.tools && agent.tools.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('label_tools', locale)}</h4>
              <div className="space-y-1.5">
                {agent.tools.map((tool, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <span className="text-sm mt-0.5">⚙️</span>
                    <div>
                      <p className="text-xs font-medium font-mono">{tool.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Handoffs */}
          {handoffTargets.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('label_handoffs', locale)}</h4>
              <div className="flex flex-wrap gap-1.5">
                {handoffTargets.map(target => (
                  <span key={target.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: target.color + '15', color: target.color }}>
                    {target.icon} {target.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Applied Rules */}
          {appliedRules.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('section_business_rules_detail', locale)}</h4>
              <div className="space-y-1.5">
                {appliedRules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-l-2" style={{ borderLeftColor: ruleTypeColor(rule.type) }}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{rule.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{getRuleTypeName(rule.type, locale)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ruleTypeColor(type: string): string {
  const map: Record<string, string> = {
    guardrail: '#ef4444',
    constraint: '#f59e0b',
    escalation: '#f97316',
    routing: '#3b82f6',
  };
  return map[type] || '#94a3b8';
}

function HandoffMatrix({ allAgents, handoffMatrix, locale }: {
  allAgents: AgentDefinition[];
  handoffMatrix: Record<string, string[]>;
  locale: Locale;
}) {
  const hasHandoff = (fromId: string, toId: string): boolean => {
    return (handoffMatrix[fromId] || []).includes(toId);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-x-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">{t('section_handoff_matrix', locale)}</h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-muted-foreground sticky left-0 bg-white dark:bg-slate-900 z-10 min-w-[80px]">{t('label_from', locale)}</th>
            {allAgents.map(a => (
              <th key={a.id} className="p-2 text-center font-medium min-w-[100px]">
                <div className="flex items-center justify-center gap-1">
                  <span>{a.icon}</span>
                  <span className="truncate max-w-[80px]">{a.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allAgents.map(row => (
            <tr key={row.id} className="border-t border-border/50">
              <td className="p-2 font-medium sticky left-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-1">
                  <span>{row.icon}</span>
                  <span className="truncate max-w-[80px]">{row.name}</span>
                </div>
              </td>
              {allAgents.map(col => {
                if (row.id === col.id) {
                  return (
                    <td key={col.id} className="p-2 text-center">
                      <span className="text-slate-300">·</span>
                    </td>
                  );
                }
                const connected = hasHandoff(row.id, col.id);
                return (
                  <td key={col.id} className="p-2 text-center">
                    {connected ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: col.color + '15', color: col.color }}>
                        →{col.icon}
                      </span>
                    ) : (
                      <span className="text-slate-300">✕</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="text-slate-300">✕</span> {t('label_no_handoff', locale)}</span>
        <span>· {t('label_empty', locale)} = N/A</span>
      </div>
    </div>
  );
}

export default function AgentDetailsClient() {
  const { state } = useApp();
  const locale: Locale = state.locale;
  const selectedAgent = state.agents.find(a => a.id === state.selectedAgentId);
  const selectedVersion = selectedAgent?.versions.find(
    v => v.version === state.selectedVersionId
  );
  const selectedDemo = selectedVersion?.demos.find(
    d => d.version === state.selectedDemoId
  ) ?? selectedVersion?.demos[0];

  let architecture: ArchitectureOutput | null = null;

  if (selectedDemo?.architecture) {
    architecture = selectedDemo.architecture;
  } else if (selectedVersion?.demos?.[0]?.architecture) {
    architecture = selectedVersion.demos[0].architecture;
  }

  if (!architecture) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-sm">{t('label_no_demo_hint', locale)}</p>
        </div>
      </div>
    );
  }

  const allAgents = [architecture.triage_agent, ...architecture.spoke_agents];
  const handoffMatrix = architecture.handoff_matrix || {};

  return (
    <div className="h-full overflow-y-auto p-6 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section: Agents */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>{t('section_agents', locale)}</span>
            <span className="text-xs font-normal text-muted-foreground">({allAgents.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                allAgents={allAgents}
                businessRules={architecture.business_rules || []}
                locale={locale}
              />
            ))}
          </div>
        </section>

        {/* Section: Handoff Matrix */}
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('section_handoff_matrix', locale)}</h2>
          <HandoffMatrix allAgents={allAgents} handoffMatrix={handoffMatrix} locale={locale} />
        </section>
      </div>
    </div>
  );
}
