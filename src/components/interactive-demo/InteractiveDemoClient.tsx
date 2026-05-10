'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/app-context';
import { t, getRuleTypeName } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { ScenarioStep, AgentDefinition, BusinessRule } from '@/types/architecture';

const RULE_ICONS: Record<string, string> = {
  guardrail: '🛡️',
  constraint: '📏',
  escalation: '⬆️',
  routing: '🔀',
};

interface RuleStatusColor {
  badge: string;
  statusPassed: string;
  statusFailed: string;
  statusPending: string;
}

const RULE_COLORS: Record<string, RuleStatusColor> = {
  guardrail: { badge: 'bg-red-100 text-red-700', statusPassed: 'text-green-600', statusFailed: 'text-red-600', statusPending: 'text-gray-400' },
  constraint: { badge: 'bg-yellow-100 text-yellow-700', statusPassed: 'text-green-600', statusFailed: 'text-yellow-600', statusPending: 'text-gray-400' },
  escalation: { badge: 'bg-orange-100 text-orange-700', statusPassed: 'text-green-600', statusFailed: 'text-orange-600', statusPending: 'text-gray-400' },
  routing: { badge: 'bg-blue-100 text-blue-700', statusPassed: 'text-green-600', statusFailed: 'text-blue-600', statusPending: 'text-gray-400' },
};

type I18NKey = Parameters<typeof t>[0];

const STEP_LABELS: Record<string, I18NKey> = {
  customer: 'step_customer',
  agent: 'step_agent',
  tool_call: 'step_tool_call',
  tool_result: 'step_tool_call',
  handoff: 'step_handoff',
  guardrail_check: 'step_guardrail',
  guardrail_trigger: 'step_guardrail',
  constraint: 'step_constraint',
  escalation: 'step_escalation',
  routing: 'step_routing',
};

const STEP_COLORS: Record<string, string> = {
  customer: 'bg-blue-500 text-white',
  agent: 'bg-emerald-500 text-white',
  tool_call: 'bg-violet-500 text-white',
  tool_result: 'bg-violet-300 text-white',
  handoff: 'bg-amber-500 text-white',
  guardrail_check: 'bg-sky-500 text-white',
  guardrail_trigger: 'bg-red-600 text-white',
  constraint: 'bg-yellow-500 text-white',
  escalation: 'bg-orange-500 text-white',
  routing: 'bg-cyan-500 text-white',
};

const STEP_ICONS: Record<string, string> = {
  customer: '👤',
  agent: '🤖',
  tool_call: '🔧',
  tool_result: '📋',
  handoff: '🔀',
  guardrail_check: '🔍',
  guardrail_trigger: '🚨',
  constraint: '📏',
  escalation: '⬆️',
  routing: '🔄',
};

export default function InteractiveDemoClient() {
  const { state, dispatch } = useApp();
  const locale: Locale = state.locale;
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDemo = state.selectedDemoId
    ? state.agents.find(a => a.id === state.selectedAgentId)
        ?.versions.find(v => v.id === state.selectedVersionId)
        ?.demos.find(d => d.id === state.selectedDemoId)
    : null;

  const scenarios = currentDemo?.scenarios ?? [];
  const scenarioIndex = Math.min(0, scenarios.length - 1);
  const activeScenario = scenarios[scenarioIndex] ?? null;

  useEffect(() => {
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  const startAutoPlay = () => {
    if (!activeScenario) return;
    dispatch({ type: 'SET_DEMO_AUTO_PLAY', payload: true });
    autoPlayRef.current = setInterval(() => {
      if (state.demoCurrentStep >= activeScenario.steps.length - 1) {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        dispatch({ type: 'SET_DEMO_AUTO_PLAY', payload: false });
      } else {
        dispatch({ type: 'SET_DEMO_STEP', payload: state.demoCurrentStep + 1 });
      }
    }, 1500);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    dispatch({ type: 'SET_DEMO_AUTO_PLAY', payload: false });
  };

  const handleNextStep = () => {
    if (!activeScenario) return;
    stopAutoPlay();
    if (state.demoCurrentStep < activeScenario.steps.length - 1) {
      dispatch({ type: 'SET_DEMO_STEP', payload: state.demoCurrentStep + 1 });
    }
  };

  const handlePrevStep = () => {
    stopAutoPlay();
    if (state.demoCurrentStep > 0) {
      dispatch({ type: 'SET_DEMO_STEP', payload: state.demoCurrentStep - 1 });
    }
  };

  const handleReset = () => {
    stopAutoPlay();
    dispatch({ type: 'RESET_DEMO' });
  };

  const handleAutoPlayToggle = () => {
    if (state.demoAutoPlay) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  };

  if (!currentDemo || !activeScenario) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-2">{t('label_no_demo', locale)}</p>
          <p className="text-sm text-muted-foreground">{t('label_no_demo_hint', locale)}</p>
        </div>
      </div>
    );
  }

  const steps = activeScenario.steps;
  const currentStepData = steps[state.demoCurrentStep];
  const triage = currentDemo.architecture.triage_agent;
  const spokeAgents = currentDemo.architecture.spoke_agents;
  const allAgents: AgentDefinition[] = [triage, ...spokeAgents];
  const rules: BusinessRule[] = currentDemo.architecture.business_rules ?? [];
  const inputGuardrails = currentDemo.architecture.input_guardrails ?? [];

  // Determine active agent from current step
  const activeAgentId = currentStepData?.agent
    ? allAgents.find(a => a.name === currentStepData.agent || a.nameEn === currentStepData.agent)?.id
      ?? allAgents[0]?.id
    : allAgents[0]?.id;

  const getRuleStatus = (rule: BusinessRule): 'passed' | 'failed' | 'pending' => {
    if (!currentStepData) return 'pending';
    const ruleRelatedTypes = ['guardrail_check', 'guardrail_trigger', 'guardrail', 'constraint', 'escalation', 'routing'];
    if (ruleRelatedTypes.includes(currentStepData.type)) {
      if (currentStepData.ruleName === rule.name) {
        return currentStepData.passed === true ? 'passed' : 'failed';
      }
    }
    return 'pending';
  };

  const getGuardrailStatus = (guardrail: { id: string; name: string }): 'passed' | 'failed' | 'pending' => {
    if (!currentStepData) return 'pending';
    if (currentStepData.guardrailName === guardrail.id || currentStepData.guardrailName === guardrail.name) {
      return currentStepData.passed === true ? 'passed' : 'failed';
    }
    return 'pending';
  };

  const visibleSteps = steps.slice(0, state.demoCurrentStep + 1);

  return (
    <div className="flex h-full">
      {/* Left: Chat Panel */}
      <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
        {/* Scenario Selector */}
        <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium shrink-0">{t('label_scenario', locale)}:</label>
          <select
            value={scenarioIndex}
            onChange={() => {
              dispatch({ type: 'RESET_DEMO' });
            }}
            className="flex-1 min-w-0 px-3 py-1.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {scenarios.map((s, i) => (
              <option key={s.id || i} value={i}>
                {locale === 'zh' ? s.name : (s.nameEn || s.name)} ({s.steps.length} {t('label_steps', locale)})
              </option>
            ))}
          </select>
        </div>

        {/* Scenario Name & Desc */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-medium text-sm">{locale === 'zh' ? activeScenario.name : (activeScenario.nameEn || activeScenario.name)}</h3>
          {(locale === 'zh' ? activeScenario.description : (activeScenario.descriptionEn || activeScenario.description)) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'zh' ? activeScenario.description : (activeScenario.descriptionEn || activeScenario.description)}
            </p>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {steps.map((step, i) => {
            const isVisible = i <= state.demoCurrentStep;
            const isActive = i === state.demoCurrentStep;
            const isCustomer = step.type === 'customer';
            const isAgentStep = step.type === 'agent';
            const isSystemStep = step.type === 'handoff' || step.type === 'tool_call' || step.type === 'tool_result'
              || step.type === 'guardrail_check' || step.type === 'guardrail_trigger'
              || step.type === 'constraint' || step.type === 'escalation' || step.type === 'routing';

            if (!isVisible) return null;

            // For guardrail_check and guardrail_trigger, show as system notification
            if (step.type === 'guardrail_check' || step.type === 'guardrail_trigger') {
              return (
                <div key={i} className={`flex justify-center animate-fadeIn`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                    step.type === 'guardrail_trigger'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                  } ${isActive ? 'ring-2 ring-offset-2 ring-primary/50' : 'opacity-80'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium mb-1">
                      <span>{step.type === 'guardrail_trigger' ? '🚨' : '🔍'}</span>
                      <span>{step.type === 'guardrail_trigger' ? (locale === 'zh' ? '护栏触发' : 'Guardrail Triggered') : (locale === 'zh' ? '护栏检查' : 'Guardrail Check')}</span>
                      <span className={`ml-auto font-bold ${step.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {step.passed ? '✓ PASS' : '✗ TRIPWIRE'}
                      </span>
                    </div>
                    <div>{locale === 'zh' ? step.content : (step.contentEn || step.content)}</div>
                    {step.reasoning && (
                      <div className="text-xs mt-1 opacity-70">{locale === 'zh' ? '原因' : 'Reasoning'}: {step.reasoning}</div>
                    )}
                  </div>
                </div>
              );
            }

            // For tool_result, show as a smaller follow-up to tool_call
            if (step.type === 'tool_result') {
              return (
                <div key={i} className={`flex justify-end animate-fadeIn`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 ${isActive ? 'ring-2 ring-offset-2 ring-primary/50' : 'opacity-70'}`}>
                    <div className="text-xs font-medium mb-1 flex items-center gap-1">
                      <span>📋</span>
                      <span>{locale === 'zh' ? '工具返回' : 'Tool Result'}</span>
                    </div>
                    <div>{step.toolResult || step.content}</div>
                  </div>
                </div>
              );
            }

            // For constraint/escalation/routing business rules
            if (step.type === 'constraint' || step.type === 'escalation' || step.type === 'routing') {
              return (
                <div key={i} className={`flex justify-center animate-fadeIn`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                    step.type === 'constraint' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200'
                      : step.type === 'escalation' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200'
                  } ${isActive ? 'ring-2 ring-offset-2 ring-primary/50' : 'opacity-80'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium mb-1">
                      <span>{RULE_ICONS[step.type]}</span>
                      <span>{step.ruleName}</span>
                      <span className="ml-auto font-bold">
                        {step.passed === false ? '✗ BLOCKED' : '⚠ ACTIVE'}
                      </span>
                    </div>
                    <div>{step.content}</div>
                  </div>
                </div>
              );
            }

            // For handoff
            if (step.type === 'handoff') {
              const targetAgent = allAgents.find(a => a.id === step.targetAgent);
              return (
                <div key={i} className={`flex justify-center animate-fadeIn`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 ${isActive ? 'ring-2 ring-offset-2 ring-primary/50' : 'opacity-80'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium mb-1">
                      <span>🔀</span>
                      <span>{locale === 'zh' ? 'Handoff 控制权转移' : 'Handoff Control Transfer'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{step.agent}</span>
                      <span>→</span>
                      <span className="font-medium flex items-center gap-1">
                        {targetAgent?.icon} {targetAgent ? (locale === 'zh' ? targetAgent.name : targetAgent.nameEn) : step.targetAgent}
                      </span>
                    </div>
                    <div className="text-xs mt-1">{locale === 'zh' ? step.content : (step.contentEn || step.content)}</div>
                  </div>
                </div>
              );
            }

            // For tool_call
            if (step.type === 'tool_call') {
              return (
                <div key={i} className={`flex justify-end animate-fadeIn`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm bg-violet-500 text-white rounded-br-sm ${isActive ? 'ring-2 ring-offset-2 ring-primary/50' : 'opacity-80'}`}>
                    <div className="text-xs opacity-80 mb-1 flex items-center gap-1">
                      <span>🔧</span>
                      <span>{step.agent} — {locale === 'zh' ? '工具调用' : 'Tool Call'}</span>
                    </div>
                    <div className="font-mono text-xs">{step.toolName}</div>
                    <div className="text-xs mt-1 opacity-80">{step.content}</div>
                  </div>
                </div>
              );
            }

            // Customer and Agent messages
            return (
              <div
                key={i}
                className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isCustomer
                      ? 'bg-blue-500 text-white rounded-bl-sm'
                      : 'bg-emerald-500 text-white rounded-br-sm'
                  } ${isActive ? 'ring-2 ring-offset-2 ring-primary/50' : 'opacity-80'}`}
                >
                  {step.agent && (
                    <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                      <span>{isCustomer ? '👤' : '🤖'}</span>
                      <span>{step.agent}</span>
                    </div>
                  )}
                  <div>{locale === 'zh' ? step.content : (step.contentEn || step.content)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-t border-border bg-card flex items-center justify-center gap-3">
          <button
            onClick={handlePrevStep}
            disabled={state.demoCurrentStep === 0}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ⏮ {t('btn_prev', locale)}
          </button>
          <button
            onClick={handleAutoPlayToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              state.demoAutoPlay
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {state.demoAutoPlay ? '⏸ ' + t('btn_pause', locale) : '▶ ' + t('btn_auto_play', locale)}
          </button>
          <button
            onClick={handleNextStep}
            disabled={state.demoCurrentStep >= steps.length - 1}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('btn_next', locale)} ⏭
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            ↺ {t('btn_reset', locale)}
          </button>
        </div>
        <div className="px-4 pb-3 text-center">
          <span className="text-xs text-muted-foreground">
            {t('label_step', locale)} {state.demoCurrentStep + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Right: Agent View */}
      <div className="w-96 flex flex-col overflow-hidden bg-muted/20">
        {/* Current Agent */}
        <div className="px-4 py-3 border-b border-border bg-card">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {t('label_current_agent', locale)}
          </h3>
          {activeAgentId && (() => {
            const agent = allAgents.find(a => a.id === activeAgentId);
            return agent ? (
              <div className="flex items-center gap-2">
                <span className="text-xl">{agent.icon}</span>
                <div>
                  <div className="font-medium text-sm">{locale === 'zh' ? agent.name : agent.nameEn}</div>
                  <div className="text-xs text-muted-foreground">{locale === 'zh' ? agent.description : agent.descriptionEn}</div>
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Agent Routing Grid */}
        <div className="px-4 py-3 border-b border-border bg-card">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {t('label_agent_routing', locale)}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {allAgents.map((agent) => {
              const isActive = agent.id === activeAgentId;
              const isTriage = agent.id === triage.id;
              return (
                <div
                  key={agent.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all ${
                    isActive
                      ? 'ring-2 ring-primary shadow-sm'
                      : 'hover:ring-1 ring-border'
                  }`}
                  style={{ backgroundColor: isActive ? agent.color + '15' : 'transparent' }}
                >
                  <span className="text-lg">{agent.icon}</span>
                  <span className="text-xs mt-0.5 font-medium truncate w-full">
                    {locale === 'zh' ? agent.name.split('')[0] : agent.nameEn.split(' ')[0]}
                  </span>
                  {isTriage && <span className="text-[10px] px-1 rounded bg-primary/10 text-primary">Hub</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Guardrails Status */}
        {inputGuardrails.length > 0 && (
          <div className="px-4 py-3 border-b border-border bg-card">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {locale === 'zh' ? '输入护栏 (Input Guardrails)' : 'Input Guardrails'}
            </h3>
            <div className="space-y-1.5">
              {inputGuardrails.map((gr) => {
                const status = getGuardrailStatus(gr);
                return (
                  <div key={gr.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0">{gr.type === 'relevance' ? '🔍' : '🔒'}</span>
                      <span className="text-xs truncate">{locale === 'zh' ? gr.name : gr.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-xs font-bold ${
                        status === 'passed' ? 'text-green-600' :
                        status === 'failed' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○'}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                        {gr.model}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Business Rules Status */}
        <div className="px-4 py-3 border-b border-border bg-card flex-1 overflow-y-auto">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {t('label_business_rules', locale)}
          </h3>
          <div className="space-y-1.5">
            {rules.map((rule: BusinessRule) => {
              const status = getRuleStatus(rule);
              const colors = RULE_COLORS[rule.type] ?? { badge: 'bg-gray-100 text-gray-600', statusPassed: 'text-green-600', statusFailed: 'text-red-600', statusPending: 'text-gray-400' };
              return (
                <div key={rule.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{RULE_ICONS[rule.type]}</span>
                    <span className="text-xs truncate">{rule.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xs font-medium ${
                      status === 'passed' ? colors.statusPassed :
                      status === 'failed' ? colors.statusFailed :
                      colors.statusPending
                    }`}>
                      {status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○'}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge}`}>
                      {getRuleTypeName(rule.type, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Runner Events */}
        <div className="px-4 py-3 bg-card flex-1 overflow-y-auto">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {t('label_events', locale)}
          </h3>
          <div className="space-y-1">
            {visibleSteps.map((step, i) => (
              <div key={i} className={`flex items-start gap-1.5 text-xs py-1 ${i === state.demoCurrentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                <span className={`shrink-0 w-1.5 h-1.5 mt-1 rounded-full ${STEP_COLORS[step.type]?.split(' ')[0] ?? 'bg-gray-400'}`} />
                <span className="min-w-0">
                  {STEP_ICONS[step.type]}{' '}
                  {step.agent && <span className="font-medium">{step.agent}</span>}
                  {step.agent && ': '}
                  {step.type === 'tool_call' && step.toolName
                    ? step.toolName
                    : step.type === 'tool_result'
                    ? (locale === 'zh' ? '工具返回' : 'Result')
                    : step.type === 'handoff'
                    ? `→ ${step.targetAgent}`
                    : step.type === 'guardrail_check'
                    ? (step.passed ? '✓ Check' : '✗ Check')
                    : step.type === 'guardrail_trigger'
                    ? '🚨 Tripwire!'
                    : t(STEP_LABELS[step.type] ?? 'step_agent', locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
