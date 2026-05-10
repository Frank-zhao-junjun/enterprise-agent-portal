'use client';

import { t } from '@/lib/i18n';
import { useApp } from '@/contexts/app-context';
import type { AgentRecord, AgentVersion, DemoVersion, ArchitectureOutput, Locale } from '@/types/architecture';

function ArchitectureDiagramInner({ architecture }: { architecture: ArchitectureOutput }) {
  const { state } = useApp();
  const locale: Locale = state.locale;

  const triageAgent = architecture.triage_agent;
  const spokeAgents = architecture.spoke_agents;
  const allAgents = [triageAgent, ...spokeAgents];
  const inputGuardrails = architecture.input_guardrails ?? [];
  const sharedContext = architecture.shared_context;

  const cx = 340, cy = 280, radius = 180;

  const getAgentPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const spokePositions = spokeAgents.map((_, i) => getAgentPosition(i, spokeAgents.length));

  // Build cross-spoke handoff pairs (excluding triage as source)
  const crossSpokeHandoffs: { from: number; to: number; fromId: string; toId: string }[] = [];
  spokeAgents.forEach((spoke, i) => {
    const handoffIds = spoke.handoffs.map(h => h.agentId);
    handoffIds.forEach(targetId => {
      if (targetId === triageAgent.id) return; // skip return-to-triage
      const targetIdx = spokeAgents.findIndex(s => s.id === targetId);
      if (targetIdx >= 0) {
        crossSpokeHandoffs.push({ from: i, to: targetIdx, fromId: spoke.id, toId: targetId });
      }
    });
  });

  const stepColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const getAgentDisplayName = (agent: { name: string; nameEn: string }) => {
    return locale === 'zh' ? agent.name : agent.nameEn;
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-muted/20">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* SVG Architecture Diagram */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">{t('label_architecture', locale)}</h2>
          <svg viewBox="0 0 680 560" className="w-full h-auto">
            {/* Triage to Spoke lines (Hub outward) */}
            {spokeAgents.map((spoke, i) => {
              const target = spokePositions[i];
              const midX = (cx + target.x) / 2;
              const midY = (cy + target.y) / 2;
              const hasHook = triageAgent.handoffs.find(h => h.agentId === spoke.id)?.hasHook;
              return (
                <g key={`line-${spoke.id}`}>
                  <line x1={cx} y1={cy} x2={target.x} y2={target.y} stroke="#e2e8f0" strokeWidth="2" />
                  <polygon
                    points={`${target.x},${target.y} ${target.x - 8},${target.y - 14} ${target.x + 8},${target.y - 14}`}
                    fill="#e2e8f0"
                    transform={`rotate(${Math.atan2(target.y - cy, target.x - cx) * 180 / Math.PI + 90}, ${target.x}, ${target.y})`}
                  />
                  <text x={midX} y={midY - 8} textAnchor="middle" fontSize="10" fill="#64748b">
                    Handoff{hasHook ? ' 🔧' : ''}
                  </text>
                </g>
              );
            })}

            {/* Spoke to Triage return lines (dashed) */}
            {spokeAgents.map((spoke, i) => {
              const source = spokePositions[i];
              // Offset the return line slightly
              const angle = Math.atan2(source.y - cy, source.x - cx);
              const offset = 12;
              const offX = offset * Math.cos(angle + Math.PI / 2);
              const offY = offset * Math.sin(angle + Math.PI / 2);
              return (
                <g key={`back-${spoke.id}`}>
                  <line
                    x1={source.x + offX} y1={source.y + offY}
                    x2={cx + offX * 0.3} y2={cy + offY * 0.3}
                    stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3"
                  />
                </g>
              );
            })}

            {/* Cross-spoke handoff lines (colored, curved) */}
            {crossSpokeHandoffs.map((h, idx) => {
              const from = spokePositions[h.from];
              const to = spokePositions[h.to];
              // Create a curved path
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              // Offset control point toward center
              const cpX = midX + (cx - midX) * 0.4;
              const cpY = midY + (cy - midY) * 0.4;
              const fromAgent = spokeAgents[h.from];
              const hook = fromAgent.handoffs.find(fh => fh.agentId === h.toId);
              const lineColor = hook?.hasHook ? '#f59e0b' : '#6366f1';
              return (
                <g key={`cross-${idx}`}>
                  <path
                    d={`M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`}
                    fill="none" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6,3"
                  />
                  <circle cx={to.x} cy={to.y} r="3" fill={lineColor} />
                  <text
                    x={cpX} y={cpY - 6}
                    textAnchor="middle" fontSize="9" fill={lineColor}
                  >
                    {hook?.hasHook ? 'hook' : 'direct'}
                  </text>
                </g>
              );
            })}

            {/* Hub (Triage) */}
            <g>
              <circle cx={cx} cy={cy} r="44" fill={triageAgent.color} opacity="0.1" />
              <circle cx={cx} cy={cy} r="38" fill={triageAgent.color} />
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20">{triageAgent.icon}</text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">Triage</text>
              <text x={cx} y={cy + 22} textAnchor="middle" fontSize="7" fill="white" opacity="0.8">(Hub)</text>
            </g>

            {/* Input Guardrails shield around Triage */}
            <g>
              <path
                d={`M ${cx - 55} ${cy - 55} Q ${cx} ${cy - 75} ${cx + 55} ${cy - 55}`}
                fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2"
              />
              <text x={cx} y={cy - 62} textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="500">
                🛡️ Input Guardrails
              </text>
            </g>

            {/* Spoke Agents */}
            {spokeAgents.map((spoke, i) => {
              const pos = spokePositions[i];
              const guardrailCount = spoke.input_guardrails?.length ?? 0;
              return (
                <g key={spoke.id}>
                  <circle cx={pos.x} cy={pos.y} r="32" fill={spoke.color} opacity="0.1" />
                  <circle cx={pos.x} cy={pos.y} r="27" fill={spoke.color} />
                  <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="16">{spoke.icon}</text>
                  <text x={pos.x} y={pos.y + 12} textAnchor="middle" fontSize="7" fill="white" fontWeight="500">
                    {getAgentDisplayName(spoke).length > 12 ? getAgentDisplayName(spoke).slice(0, 11) + '…' : getAgentDisplayName(spoke).split(' ').slice(0, 2).join(' ')}
                  </text>
                  {guardrailCount > 0 && (
                    <text x={pos.x + 22} y={pos.y - 18} textAnchor="middle" fontSize="7" fill="#ef4444">
                      🛡️
                    </text>
                  )}
                </g>
              );
            })}

            {/* Shared Context indicator */}
            <g>
              <rect x={cx - 70} y={cy + 50} width="140" height="22" rx="11" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1" />
              <text x={cx} y={cy + 65} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="500">
                📦 Shared Context
              </text>
            </g>
          </svg>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><span className="text-slate-400">—</span> Hub→Spoke Handoff</span>
            <span className="flex items-center gap-1"><span style={{ color: '#94a3b8' }}>- -</span> Return to Hub</span>
            <span className="flex items-center gap-1"><span style={{ color: '#6366f1' }}>- -</span> Cross-Spoke Direct</span>
            <span className="flex items-center gap-1"><span style={{ color: '#f59e0b' }}>- - 🔧</span> With Hook</span>
            <span className="flex items-center gap-1">🛡️ Input Guardrails</span>
          </div>
        </div>

        {/* Concept Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: t('label_hub', locale), desc: t('desc_hub', locale), color: '#3b82f6', icon: '🔄' },
            { title: t('label_handoff_mech', locale), desc: t('desc_handoff', locale), color: '#10b981', icon: '🔀' },
            { title: t('label_guardrail', locale), desc: t('desc_guardrail', locale), color: '#ef4444', icon: '🛡️' },
            { title: t('label_business_rules', locale), desc: t('desc_business_rules', locale), color: '#f59e0b', icon: '📋' },
          ].map(card => (
            <div key={card.title} className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{card.icon}</span>
                <h3 className="font-semibold text-sm" style={{ color: card.color }}>{card.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Input Guardrails Detail */}
        {inputGuardrails.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>🛡️</span>
              <span>{locale === 'zh' ? '输入护栏 (Input Guardrails)' : 'Input Guardrails'}</span>
            </h3>
            <div className="space-y-4">
              {inputGuardrails.map(gr => (
                <div key={gr.id} className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{gr.type === 'relevance' ? '🔍' : '🔒'}</span>
                    <h4 className="font-semibold text-sm">{locale === 'zh' ? gr.name : gr.nameEn}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-mono">{gr.model}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{gr.description}</p>
                </div>
              ))}
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {locale === 'zh'
                    ? '💡 所有Agent都挂载了相同的 Input Guardrails（包括 FAQ Agent）。OpenAI 选择了"全链路 Guardrail"策略，即使理论上某些节点可以省略。Tripwire 触发后 Runner 抛出 InputGuardrailTripwireTriggered 异常，返回标准拒绝消息。'
                    : '💡 All agents have the same Input Guardrails (including FAQ Agent). OpenAI chose "full-chain Guardrail" strategy. When Tripwire triggers, Runner throws InputGuardrailTripwireTriggered exception and returns a standard refusal message.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shared Context */}
        {sharedContext && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📦</span>
              <span>{locale === 'zh' ? sharedContext.name : sharedContext.nameEn}</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {locale === 'zh' ? sharedContext.description : sharedContext.descriptionEn}
            </p>

            {/* Context Fields Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">{locale === 'zh' ? '字段' : 'Field'}</th>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">{locale === 'zh' ? '类型' : 'Type'}</th>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">{locale === 'zh' ? '说明' : 'Description'}</th>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">✍️</th>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">👁️</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedContext.fields.map((field) => {
                    const writerAgents = field.written_by.map(id => allAgents.find(a => a.id === id)).filter(Boolean);
                    const readerAgents = field.read_by.map(id => allAgents.find(a => a.id === id)).filter(Boolean);
                    return (
                      <tr key={field.name} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3 font-mono font-medium">{field.name}</td>
                        <td className="py-2 px-3 text-muted-foreground font-mono">{field.type}</td>
                        <td className="py-2 px-3">{locale === 'zh' ? field.description : field.descriptionEn}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-0.5">
                            {writerAgents.map(a => a && <span key={a.id} title={locale === 'zh' ? a.name : a.nameEn}>{a.icon}</span>)}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex gap-0.5">
                            {readerAgents.map(a => a && <span key={a.id} title={locale === 'zh' ? a.name : a.nameEn}>{a.icon}</span>)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Hydration Methods */}
            {sharedContext.hydration_methods && sharedContext.hydration_methods.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {locale === 'zh' ? '上下文水合方式 (Context Hydration)' : 'Context Hydration Methods'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sharedContext.hydration_methods.map((method) => (
                    <div key={method.name} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                      <h5 className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                        {locale === 'zh' ? method.name : method.nameEn}
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {locale === 'zh' ? method.description : method.descriptionEn}
                      </p>
                      <code className="text-[10px] bg-muted px-2 py-1 rounded font-mono block">{method.example}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flow Steps */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">{t('label_flow', locale)}</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { step: '1', title: t('label_flow_step1', locale), color: stepColors[0] },
              { step: '2', title: t('label_flow_step2', locale), color: stepColors[1] },
              { step: '3', title: t('label_flow_step3', locale), color: stepColors[2] },
              { step: '4', title: t('label_flow_step4', locale), color: stepColors[3] },
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2" style={{ backgroundColor: item.color }}>
                  {item.step}
                </div>
                <span className="text-xs font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">{t('label_tech_stack', locale)}</h3>
          <div className="flex flex-wrap gap-2">
            {['OpenAI Agents SDK', 'FastAPI + Uvicorn', 'Next.js 15 + React 19', 'GPT-4o / GPT-5.2', 'GPT-4.1-mini (Guardrails)', '@openai/chatkit-react', 'Tailwind CSS', 'REST + SSE'].map(tech => (
              <span key={tech} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArchitectureDiagramClient() {
  const { state } = useApp();
  const selectedAgent = state.agents.find((a: AgentRecord) => a.id === state.selectedAgentId);
  const selectedVersion = selectedAgent?.versions.find(
    (v: AgentVersion) => v.version === state.selectedVersionId
  );
  const selectedDemo = selectedVersion?.demos.find(
    (d: DemoVersion) => d.version === state.selectedDemoId
  ) ?? selectedVersion?.demos[0];

  if (selectedDemo?.architecture) {
    return <ArchitectureDiagramInner architecture={selectedDemo.architecture} />;
  }

  if (selectedVersion?.demos?.[0]?.architecture) {
    return <ArchitectureDiagramInner architecture={selectedVersion.demos[0].architecture} />;
  }

  const locale: Locale = state.locale;

  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <span className="text-4xl mb-3 block">🔗</span>
        <p className="text-sm">{t('label_no_demo_hint', locale)}</p>
      </div>
    </div>
  );
}
