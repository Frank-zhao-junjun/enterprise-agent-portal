'use client';

import { useState, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { Locale, AgentRecord, AgentVersion, DemoVersion, BusinessRule, AgentDefinition, BusinessRuleType, ToolDefinition, AgentDescription, ArchitectureOutput } from '@/types/architecture';
import { generateId, getNextDemoVersion } from '@/lib/data-service';

// ===== Constants =====
const AGENT_COLORS = [
  '#2563eb', '#059669', '#7c3aed', '#dc2626', '#d97706',
  '#0891b2', '#4f46e5', '#0d9488', '#c2410c', '#9333ea',
];
const RULE_TYPES: BusinessRuleType[] = ['guardrail', 'constraint', 'escalation', 'routing'];

type I18NKey = Parameters<typeof t>[0];

// ===== Rule helpers =====
const RULE_TYPE_LABELS: Record<BusinessRuleType, I18NKey> = {
  guardrail: 'rule_guardrail',
  constraint: 'rule_constraint',
  escalation: 'rule_escalation',
  routing: 'rule_routing',
};

const RULE_TYPE_ICONS: Record<BusinessRuleType, string> = {
  guardrail: '🛡️',
  constraint: '📏',
  escalation: '⬆️',
  routing: '🔀',
};

const ruleTypeColor = (type: BusinessRuleType) => {
  switch (type) {
    case 'guardrail': return 'text-red-500 bg-red-50 border-red-200';
    case 'constraint': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'escalation': return 'text-orange-500 bg-orange-50 border-orange-200';
    case 'routing': return 'text-blue-500 bg-blue-50 border-blue-200';
  }
};

export default function AgentDesignerClient() {
  const { state, dispatch, selectedAgent, selectedVersion, selectedDemo, createAgent, addVersion } = useApp();

  const locale: Locale = state.locale;
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [expandedDemoId, setExpandedDemoId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // ===== Agent Operations =====
  const handleCreateAgent = useCallback(() => {
    createAgent(locale === 'zh' ? '新智能体' : 'New Agent');
  }, [createAgent, locale]);

  const handleDeleteAgent = useCallback((agentId: string) => {
    dispatch({ type: 'DELETE_AGENT', payload: agentId });
  }, [dispatch]);

  const handleCreateVersion = useCallback(() => {
    if (!selectedAgent) return;
    addVersion(selectedAgent.id, {
      intro: '',
      applicable_scenarios: '',
      capabilities: '',
      system_connections: '',
      business_impact: '',
      category: '',
    });
  }, [selectedAgent, addVersion]);

  // ===== Demo Operations =====
  const handleGenerateDemo = useCallback(async () => {
    if (!selectedAgent || !selectedVersion) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: [
            selectedVersion.description.intro,
            selectedVersion.description.applicable_scenarios,
            selectedVersion.description.capabilities,
          ].filter(Boolean).join('\n'),
          locale,
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) { setGenerating(false); return; }
      const decoder = new TextDecoder();
      let buffer = '';
      let architecture: ArchitectureOutput | null = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; content: ArchitectureOutput };
              if (data.type === 'complete' && data.content) {
                architecture = data.content;
              }
            } catch { /* skip */ }
          }
        }
      }
      if (architecture) {
        // Build demo version with known ID
        const currentDemos = state.agents.find(a => a.id === selectedAgent.id)
          ?.versions.find(v => v.id === selectedVersion.id)?.demos ?? [];
        const demoVersionStr = getNextDemoVersion(currentDemos);
        const newDemoId = generateId();
        const newDemo: DemoVersion = {
          id: newDemoId,
          version: demoVersionStr,
          createdAt: Date.now(),
          architecture,
          scenarios: [],
        };
        dispatch({ type: 'ADD_DEMO', payload: { agentId: selectedAgent.id, versionId: selectedVersion.id, demo: newDemo } });
        dispatch({ type: 'SELECT_DEMO', payload: { agentId: selectedAgent.id, versionId: selectedVersion.id, demoId: newDemoId } });
      }
    } catch (e) {
      console.error('Generation failed:', e);
    } finally {
      setGenerating(false);
    }
  }, [selectedAgent, selectedVersion, locale, dispatch, state]);

  // ===== Field Updates =====
  const updateVersionField = useCallback((field: keyof AgentDescription, value: string) => {
    if (!selectedAgent || !selectedVersion) return;
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: { description: { ...selectedVersion.description, [field]: value } },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion]);

  const updateAgentName = useCallback((name: string) => {
    if (!selectedAgent) return;
    dispatch({ type: 'UPDATE_AGENT', payload: { agentId: selectedAgent.id, updates: { name } } });
  }, [dispatch, selectedAgent]);

  // ===== Business Rule CRUD =====
  const addBusinessRule = useCallback(() => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const triage = selectedDemo.architecture.triage_agent;
    const rule: BusinessRule = {
      id: generateId(),
      name: locale === 'zh' ? '新规则' : 'New Rule',
      type: 'guardrail',
      description: '',
      applies_to: [triage.id],
      trigger_example: '',
    };
    const rules = [...(selectedDemo.architecture.business_rules ?? []), rule];
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: {
          demos: selectedVersion.demos.map((d: DemoVersion) =>
            d.id === selectedDemo.id
              ? { ...d, architecture: { ...d.architecture, business_rules: rules } }
              : d
          ),
        },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo, locale]);

  const updateBusinessRule = useCallback((ruleId: string, updates: Partial<BusinessRule>) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const rules = selectedDemo.architecture.business_rules.map((r: BusinessRule) =>
      r.id === ruleId ? { ...r, ...updates } : r
    );
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: {
          demos: selectedVersion.demos.map((d: DemoVersion) =>
            d.id === selectedDemo.id
              ? { ...d, architecture: { ...d.architecture, business_rules: rules } }
              : d
          ),
        },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo]);

  const deleteBusinessRule = useCallback((ruleId: string) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const rules = selectedDemo.architecture.business_rules.filter((r: BusinessRule) => r.id !== ruleId);
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: {
          demos: selectedVersion.demos.map((d: DemoVersion) =>
            d.id === selectedDemo.id
              ? { ...d, architecture: { ...d.architecture, business_rules: rules } }
              : d
          ),
        },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo]);

  // ===== Tool CRUD =====
  const addTool = useCallback((agentDef: AgentDefinition) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const triage = selectedDemo.architecture.triage_agent;
    const tool: ToolDefinition = {
      name: 'new_tool',
      description: locale === 'zh' ? '新工具描述' : 'New tool description',
    };
    if (agentDef.id === triage.id) {
      dispatch({
        type: 'UPDATE_VERSION',
        payload: {
          agentId: selectedAgent.id,
          versionId: selectedVersion.id,
          updates: {
            demos: selectedVersion.demos.map((d: DemoVersion) =>
              d.id === selectedDemo.id
                ? { ...d, architecture: { ...d.architecture, triage_agent: { ...triage, tools: [...triage.tools, tool] } } }
                : d
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'UPDATE_VERSION',
        payload: {
          agentId: selectedAgent.id,
          versionId: selectedVersion.id,
          updates: {
            demos: selectedVersion.demos.map((d: DemoVersion) =>
              d.id === selectedDemo.id
                ? {
                    ...d,
                    architecture: {
                      ...d.architecture,
                      spoke_agents: d.architecture.spoke_agents.map((a: AgentDefinition) =>
                        a.id === agentDef.id ? { ...a, tools: [...a.tools, tool] } : a
                      ),
                    },
                  }
                : d
            ),
          },
        },
      });
    }
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo, locale]);

  const deleteTool = useCallback((agentDef: AgentDefinition, toolIndex: number) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const triage = selectedDemo.architecture.triage_agent;
    if (agentDef.id === triage.id) {
      dispatch({
        type: 'UPDATE_VERSION',
        payload: {
          agentId: selectedAgent.id,
          versionId: selectedVersion.id,
          updates: {
            demos: selectedVersion.demos.map((d: DemoVersion) =>
              d.id === selectedDemo.id
                ? { ...d, architecture: { ...d.architecture, triage_agent: { ...triage, tools: triage.tools.filter((_: ToolDefinition, i: number) => i !== toolIndex) } } }
                : d
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'UPDATE_VERSION',
        payload: {
          agentId: selectedAgent.id,
          versionId: selectedVersion.id,
          updates: {
            demos: selectedVersion.demos.map((d: DemoVersion) =>
              d.id === selectedDemo.id
                ? {
                    ...d,
                    architecture: {
                      ...d.architecture,
                      spoke_agents: d.architecture.spoke_agents.map((a: AgentDefinition) =>
                        a.id === agentDef.id ? { ...a, tools: a.tools.filter((_: ToolDefinition, i: number) => i !== toolIndex) } : a
                      ),
                    },
                  }
                : d
            ),
          },
        },
      });
    }
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo]);

  const updateToolName = useCallback((agentDef: AgentDefinition, toolIndex: number, name: string) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const triage = selectedDemo.architecture.triage_agent;
    if (agentDef.id === triage.id) {
      dispatch({
        type: 'UPDATE_VERSION',
        payload: {
          agentId: selectedAgent.id,
          versionId: selectedVersion.id,
          updates: {
            demos: selectedVersion.demos.map((d: DemoVersion) =>
              d.id === selectedDemo.id
                ? { ...d, architecture: { ...d.architecture, triage_agent: { ...triage, tools: triage.tools.map((tool: ToolDefinition, i: number) => i === toolIndex ? { ...tool, name } : tool) } } }
                : d
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'UPDATE_VERSION',
        payload: {
          agentId: selectedAgent.id,
          versionId: selectedVersion.id,
          updates: {
            demos: selectedVersion.demos.map((d: DemoVersion) =>
              d.id === selectedDemo.id
                ? {
                    ...d,
                    architecture: {
                      ...d.architecture,
                      spoke_agents: d.architecture.spoke_agents.map((a: AgentDefinition) =>
                        a.id === agentDef.id ? { ...a, tools: a.tools.map((tool: ToolDefinition, i: number) => i === toolIndex ? { ...tool, name } : tool) } : a
                      ),
                    },
                  }
                : d
            ),
          },
        },
      });
    }
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo]);

  // ===== Spoke Agent CRUD =====
  const addSpokeAgent = useCallback(() => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const triage = selectedDemo.architecture.triage_agent;
    const agent: AgentDefinition = {
      id: generateId(),
      name: locale === 'zh' ? '新子 Agent' : 'New Spoke Agent',
      description: '',
      icon: '🤖',
      color: AGENT_COLORS[selectedDemo.architecture.spoke_agents.length % AGENT_COLORS.length],
      tools: [],
      handoffs: [triage.id],
    };
    const spokes = [...selectedDemo.architecture.spoke_agents, agent];
    const matrix = { ...selectedDemo.architecture.handoff_matrix };
    matrix[triage.id] = [...(matrix[triage.id] ?? []), agent.id];
    matrix[agent.id] = [triage.id];
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: {
          demos: selectedVersion.demos.map((d: DemoVersion) =>
            d.id === selectedDemo.id
              ? { ...d, architecture: { ...d.architecture, spoke_agents: spokes, handoff_matrix: matrix } }
              : d
          ),
        },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo, locale]);

  const updateSpokeAgent = useCallback((agentId: string, updates: Partial<AgentDefinition>) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: {
          demos: selectedVersion.demos.map((d: DemoVersion) =>
            d.id === selectedDemo.id
              ? { ...d, architecture: { ...d.architecture, spoke_agents: d.architecture.spoke_agents.map((a: AgentDefinition) => a.id === agentId ? { ...a, ...updates } : a) } }
              : d
          ),
        },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo]);

  const deleteSpokeAgent = useCallback((agentId: string) => {
    if (!selectedAgent || !selectedVersion || !selectedDemo) return;
    const spokes = selectedDemo.architecture.spoke_agents.filter((a: AgentDefinition) => a.id !== agentId);
    const matrix = { ...selectedDemo.architecture.handoff_matrix };
    delete matrix[agentId];
    Object.keys(matrix).forEach((k) => {
      matrix[k] = matrix[k].filter((id: string) => id !== agentId);
    });
    dispatch({
      type: 'UPDATE_VERSION',
      payload: {
        agentId: selectedAgent.id,
        versionId: selectedVersion.id,
        updates: {
          demos: selectedVersion.demos.map((d: DemoVersion) =>
            d.id === selectedDemo.id
              ? { ...d, architecture: { ...d.architecture, spoke_agents: spokes, handoff_matrix: matrix } }
              : d
          ),
        },
      },
    });
  }, [dispatch, selectedAgent, selectedVersion, selectedDemo]);

  // ===== Derived =====
  const allAgents: AgentDefinition[] = selectedDemo
    ? [selectedDemo.architecture.triage_agent, ...selectedDemo.architecture.spoke_agents]
    : [];

  // ===== Field definitions =====
  const DESCRIPTION_FIELDS: Array<{ field: keyof AgentDescription; labelKey: I18NKey; placeholderKey: I18NKey }> = [
    { field: 'intro', labelKey: 'field_intro', placeholderKey: 'field_intro_placeholder' },
    { field: 'applicable_scenarios', labelKey: 'field_scenarios', placeholderKey: 'field_scenarios_placeholder' },
    { field: 'capabilities', labelKey: 'field_capabilities', placeholderKey: 'field_capabilities_placeholder' },
    { field: 'system_connections', labelKey: 'field_connections', placeholderKey: 'field_connections_placeholder' },
    { field: 'business_impact', labelKey: 'field_impact', placeholderKey: 'field_impact_placeholder' },
    { field: 'category', labelKey: 'field_category', placeholderKey: 'field_category_placeholder' },
  ];

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <button
            onClick={handleCreateAgent}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
          >
            + {t('btn_new_agent', locale)}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {state.agents.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">{t('label_no_agents', locale)}</p>
          ) : (
            state.agents.map((agent: AgentRecord) => (
              <div key={agent.id} className="mb-1 relative group">
                <button
                  onClick={() => {
                    dispatch({ type: 'SELECT_AGENT', payload: agent.id });
                    setExpandedAgent(expandedAgent === agent.id ? null : agent.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    state.selectedAgentId === agent.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                  }`}
                >
                  <span className="truncate">{agent.name}</span>
                  <span className="text-xs text-muted-foreground ml-1 shrink-0">{agent.versions.length}v</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id); }}
                  className="absolute top-1 right-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-sm transition-opacity w-6 h-6 flex items-center justify-center rounded"
                  title={t('btn_delete', locale)}
                >
                  ×
                </button>
                {expandedAgent === agent.id && (
                  <div className="ml-3 mt-1 space-y-1">
                    {agent.versions.map((version: AgentVersion) => (
                      <button
                        key={version.id}
                        onClick={() => {
                          dispatch({ type: 'SELECT_VERSION', payload: { agentId: agent.id, versionId: version.id } });
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                          state.selectedVersionId === version.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {version.version}
                      </button>
                    ))}
                    <button
                      onClick={() => { dispatch({ type: 'SELECT_AGENT', payload: agent.id }); handleCreateVersion(); }}
                      className="w-full text-left px-3 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted"
                    >
                      + {t('label_add_version', locale)}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedAgent ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-2">{t('label_no_agent_selected', locale)}</p>
              <p className="text-sm text-muted-foreground">{t('label_select_agent', locale)}</p>
            </div>
          </div>
        ) : !selectedVersion ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-2">{t('label_no_version_selected', locale)}</p>
              <button onClick={handleCreateVersion} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                + {t('label_add_version', locale)}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Agent Header */}
            <div className="mb-6 flex items-center gap-4">
              <input
                value={selectedAgent.name}
                onChange={(e) => updateAgentName(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none px-1"
              />
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
                {selectedVersion.version}
              </span>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {DESCRIPTION_FIELDS.map(({ field, labelKey, placeholderKey }) => (
                <div key={field}>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {t(labelKey, locale)}
                  </label>
                  <textarea
                    value={selectedVersion.description[field]}
                    onChange={(e) => updateVersionField(field, e.target.value)}
                    placeholder={t(placeholderKey, locale)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* Demo Section */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('label_demos', locale)}</h2>
                <button
                  onClick={handleGenerateDemo}
                  disabled={generating}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {generating ? t('label_generating', locale) : t('btn_generate_demo', locale)}
                </button>
              </div>

              {selectedVersion.demos.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground mb-2">{t('label_no_demo_yet', locale)}</p>
                  <p className="text-sm text-muted-foreground">{t('label_generate_hint', locale)}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedVersion.demos.map((demo: DemoVersion) => (
                    <div key={demo.id} className="border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 flex-wrap gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => dispatch({ type: 'SELECT_DEMO', payload: { agentId: selectedAgent.id, versionId: selectedVersion.id, demoId: demo.id } })}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {demo.version}
                          </button>
                          <span className="text-xs text-muted-foreground">{new Date(demo.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">{demo.architecture.spoke_agents.length + 1} agents</span>
                          <span className="text-xs text-muted-foreground">{demo.architecture.business_rules.length} rules</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              dispatch({ type: 'SELECT_DEMO', payload: { agentId: selectedAgent.id, versionId: selectedVersion.id, demoId: demo.id } });
                              dispatch({ type: 'SET_DEMO_PLAYING', payload: true });
                              dispatch({ type: 'SET_ACTIVE_TAB', payload: 1 });
                            }}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90"
                          >
                            {t('btn_demo', locale)}
                          </button>
                          <button
                            onClick={() => {
                              const currentDemos = state.agents.find(a => a.id === selectedAgent.id)
                                ?.versions.find(v => v.id === selectedVersion.id)?.demos ?? [];
                              const demoVersionStr = getNextDemoVersion(currentDemos);
                              const newDemo: DemoVersion = {
                                id: generateId(),
                                version: demoVersionStr,
                                createdAt: Date.now(),
                                architecture: demo.architecture,
                                scenarios: demo.scenarios,
                              };
                              dispatch({ type: 'ADD_DEMO', payload: { agentId: selectedAgent.id, versionId: selectedVersion.id, demo: newDemo } });
                              dispatch({ type: 'SELECT_DEMO', payload: { agentId: selectedAgent.id, versionId: selectedVersion.id, demoId: newDemo.id } });
                            }}
                            className="px-3 py-1 border border-border rounded text-xs hover:bg-muted"
                          >
                            + {t('btn_generate_demo', locale)}
                          </button>
                        </div>
                      </div>

                      {state.selectedDemoId === demo.id && (
                        <div className="p-4 space-y-4 border-t border-border">
                          {/* Triage Agent */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">{t('label_triage_agent', locale)}</h4>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{demo.architecture.triage_agent.icon}</span>
                              <span className="font-medium text-sm">{demo.architecture.triage_agent.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{demo.architecture.triage_agent.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {demo.architecture.triage_agent.tools.map((tool: ToolDefinition, i: number) => (
                                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                                  {tool.name}
                                  <button onClick={() => deleteTool(demo.architecture.triage_agent, i)} className="text-blue-400 hover:text-red-500 ml-1">×</button>
                                </span>
                              ))}
                              <button onClick={() => addTool(demo.architecture.triage_agent)} className="text-xs text-primary hover:underline">+ {t('label_add_tool', locale)}</button>
                            </div>
                          </div>

                          {/* Spoke Agents */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium">{t('label_spoke_agents', locale)}</h4>
                              <button onClick={addSpokeAgent} className="text-xs text-primary hover:underline">+ {t('label_add_agent', locale)}</button>
                            </div>
                            <div className="space-y-2">
                              {demo.architecture.spoke_agents.map((agent: AgentDefinition) => (
                                <div key={agent.id} className="border border-border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{agent.icon}</span>
                                      <input
                                        value={agent.name}
                                        onChange={(e) => updateSpokeAgent(agent.id, { name: e.target.value })}
                                        className="font-medium text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none"
                                      />
                                    </div>
                                    <button onClick={() => deleteSpokeAgent(agent.id)} className="text-xs text-destructive hover:underline">{t('btn_delete', locale)}</button>
                                  </div>
                                  <textarea
                                    value={agent.description}
                                    onChange={(e) => updateSpokeAgent(agent.id, { description: e.target.value })}
                                    placeholder={t('label_agent_description', locale)}
                                    className="w-full text-xs bg-muted border border-border rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 mb-1"
                                    rows={1}
                                  />
                                  <div className="flex flex-wrap gap-1">
                                    {agent.tools.map((tool: ToolDefinition, i: number) => (
                                      <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded flex items-center gap-1">
                                        <input
                                          value={tool.name}
                                          onChange={(e) => updateToolName(agent, i, e.target.value)}
                                          className="bg-transparent outline-none w-20"
                                        />
                                        <button onClick={() => deleteTool(agent, i)} className="text-muted-foreground hover:text-red-500">×</button>
                                      </span>
                                    ))}
                                    <button onClick={() => addTool(agent)} className="text-xs text-primary hover:underline">+ {t('label_add_tool', locale)}</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Business Rules */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium">{t('label_business_rules', locale)}</h4>
                              <button onClick={addBusinessRule} className="text-xs text-primary hover:underline">+ {t('label_add_rule', locale)}</button>
                            </div>
                            <div className="space-y-2">
                              {(demo.architecture.business_rules ?? []).map((rule: BusinessRule) => (
                                <div key={rule.id} className={`border rounded-lg p-3 ${ruleTypeColor(rule.type)}`}>
                                  <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                    <div className="flex items-center gap-2">
                                      <span>{RULE_TYPE_ICONS[rule.type]}</span>
                                      <input
                                        value={rule.name}
                                        onChange={(e) => updateBusinessRule(rule.id, { name: e.target.value })}
                                        className="font-medium text-sm bg-transparent border-b border-transparent hover:border-border focus:border-border outline-none"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={rule.type}
                                        onChange={(e) => updateBusinessRule(rule.id, { type: e.target.value as BusinessRuleType })}
                                        className="text-xs border rounded px-1 py-0.5"
                                      >
                                        {RULE_TYPES.map((rt: BusinessRuleType) => (
                                          <option key={rt} value={rt}>{t(RULE_TYPE_LABELS[rt], locale)}</option>
                                        ))}
                                      </select>
                                      <button onClick={() => deleteBusinessRule(rule.id)} className="text-xs text-destructive hover:underline">{t('btn_delete', locale)}</button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={rule.description}
                                    onChange={(e) => updateBusinessRule(rule.id, { description: e.target.value })}
                                    placeholder={t('label_rule_description', locale)}
                                    className="w-full text-xs bg-white/50 border border-border rounded px-2 py-1 resize-none focus:outline-none mb-1"
                                    rows={1}
                                  />
                                  <input
                                    value={rule.trigger_example}
                                    onChange={(e) => updateBusinessRule(rule.id, { trigger_example: e.target.value })}
                                    placeholder={t('label_rule_trigger', locale)}
                                    className="w-full text-xs bg-white/50 border border-border rounded px-2 py-1 focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Handoff Matrix */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">{t('label_handoff_matrix', locale)}</h4>
                            <div className="overflow-x-auto">
                              <table className="text-xs border-collapse">
                                <thead>
                                  <tr>
                                    <th className="border p-1 bg-muted"></th>
                                    {allAgents.map((a: AgentDefinition) => (
                                      <th key={a.id} className="border p-1 bg-muted text-center w-8">
                                        <span>{a.icon}</span>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {allAgents.map((from: AgentDefinition) => (
                                    <tr key={from.id}>
                                      <td className="border p-1 bg-muted text-center w-8">
                                        <span>{from.icon}</span>
                                      </td>
                                      {allAgents.map((to: AgentDefinition) => {
                                        const can = (demo.architecture.handoff_matrix[from.id] ?? []).includes(to.id);
                                        return (
                                          <td key={to.id} className="border p-1 text-center">
                                            {from.id === to.id
                                              ? <span className="text-muted-foreground">·</span>
                                              : can
                                              ? <span className="text-green-500 font-bold">→</span>
                                              : <span className="text-muted-foreground">✕</span>}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
