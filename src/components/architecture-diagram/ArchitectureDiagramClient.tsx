'use client';

import { t } from '@/lib/i18n';
import { useApp } from '@/contexts/app-context';
import type { AgentRecord, AgentVersion, DemoVersion, ArchitectureOutput, Locale } from '@/types/architecture';

function ArchitectureDiagramInner({ architecture }: { architecture: ArchitectureOutput }) {
  const { state } = useApp();
  const locale: Locale = state.locale;

  const spokeAgents = architecture.spoke_agents;
  const cx = 340, cy = 260, radius = 180;

  const getAgentPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const spokePositions = spokeAgents.map((_, i) => getAgentPosition(i, spokeAgents.length));

  const stepColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="h-full overflow-y-auto p-6 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* SVG Architecture Diagram */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">{t('label_architecture', locale)}</h2>
          <svg viewBox="0 0 680 520" className="w-full h-auto">
            {/* Triage to Spoke lines */}
            {spokeAgents.map((spoke, i) => {
              const target = spokePositions[i];
              const midX = (cx + target.x) / 2;
              const midY = (cy + target.y) / 2;
              return (
                <g key={`line-${spoke.id}`}>
                  <line x1={cx} y1={cy} x2={target.x} y2={target.y} stroke="#e2e8f0" strokeWidth="2" />
                  <polygon
                    points={`${target.x},${target.y} ${target.x - 8},${target.y - 14} ${target.x + 8},${target.y - 14}`}
                    fill="#e2e8f0"
                    transform={`rotate(${Math.atan2(target.y - cy, target.x - cx) * 180 / Math.PI + 90}, ${target.x}, ${target.y})`}
                  />
                  <text x={midX} y={midY - 6} textAnchor="middle" fontSize="11" fill="#64748b">Handoff</text>
                </g>
              );
            })}
            {/* Spoke to Triage lines */}
            {spokeAgents.map((spoke, i) => {
              const source = spokePositions[i];
              const midX = (cx + source.x) / 2;
              const midY = (cy + source.y) / 2;
              return (
                <g key={`back-${spoke.id}`}>
                  <line x1={source.x} y1={source.y} x2={cx} y2={cy} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3" />
                </g>
              );
            })}
            {/* Hub (Triage) */}
            <g>
              <circle cx={cx} cy={cy} r="40" fill={architecture.triage_agent.color} opacity="0.1" />
              <circle cx={cx} cy={cy} r="36" fill={architecture.triage_agent.color} />
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20">{architecture.triage_agent.icon}</text>
              <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">Triage</text>
            </g>
            {/* Spoke Agents */}
            {spokeAgents.map((spoke, i) => {
              const pos = spokePositions[i];
              return (
                <g key={spoke.id}>
                  <circle cx={pos.x} cy={pos.y} r="30" fill={spoke.color} opacity="0.1" />
                  <circle cx={pos.x} cy={pos.y} r="26" fill={spoke.color} />
                  <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="16">{spoke.icon}</text>
                  <text x={pos.x} y={pos.y + 14} textAnchor="middle" fontSize="8" fill="white" fontWeight="500">
                    {spoke.name.length > 10 ? spoke.name.slice(0, 9) + '…' : spoke.name}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="text-slate-400">—</span> {t('label_handoff', locale)}</span>
            <span className="flex items-center gap-1"><span style={{ color: '#94a3b8' }}>- -</span> {t('label_return_handoff', locale)}</span>
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
            {['OpenAI Agents SDK', 'FastAPI', 'Next.js + Tailwind', 'GPT-4o'].map(tech => (
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
