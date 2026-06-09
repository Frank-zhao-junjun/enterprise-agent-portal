'use client';

/**
 * 推理链展示组件
 * 展示主 Agent 的完整推理过程
 */

import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import type { ReasoningStep } from '@/types/ontology';
import {
  Brain,
  Compass,
  Wrench,
  Search,
  GitBranch,
  Zap,
  Shield,
  Plug,
  Combine,
  MessageSquare,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/** 步骤类型 → 图标 */
const stepIcons: Record<string, typeof Brain> = {
  intent: Brain,
  routing: Compass,
  tool_call: Wrench,
  tool_result: CheckCircle2,
  guardrail: Shield,
  response: MessageSquare,
  semantic_lookup: Search,
  rule_reasoning: GitBranch,
  event_emit: Zap,
  governance_check: Shield,
  api_invoke: Plug,
  aggregation: Combine,
};

/** 步骤类型 → 颜色 */
const stepColors: Record<string, string> = {
  intent: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
  routing: 'text-purple-600 bg-purple-500/10 border-purple-500/30',
  tool_call: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/30',
  tool_result: 'text-green-600 bg-green-500/10 border-green-500/30',
  guardrail: 'text-red-600 bg-red-500/10 border-red-500/30',
  response: 'text-primary bg-primary/10 border-primary/30',
  semantic_lookup: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
  rule_reasoning: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  event_emit: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
  governance_check: 'text-red-600 bg-red-500/10 border-red-500/30',
  api_invoke: 'text-green-600 bg-green-500/10 border-green-500/30',
  aggregation: 'text-pink-600 bg-pink-500/10 border-pink-500/30',
};

/** 步骤状态 → 指示器 */
function StepStatusIndicator({ status }: { status: ReasoningStep['status'] }) {
  switch (status) {
    case 'running':
      return <Loader2 className="size-3 animate-spin text-primary" />;
    case 'completed':
      return <CheckCircle2 className="size-3 text-green-500" />;
    case 'error':
      return <AlertCircle className="size-3 text-red-500" />;
    default:
      return <Clock className="size-3 text-muted-foreground" />;
  }
}

export function ReasoningChain({ steps }: { steps: ReasoningStep[] }) {
  const { state } = useApp();
  const locale = state.locale;

  return (
    <div className="relative">
      {/* 时间线 */}
      <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const Icon = stepIcons[step.type] || Brain;
          const colorClass = stepColors[step.type] || 'text-gray-600 bg-gray-500/10 border-gray-500/30';
          const title = locale === 'zh' ? step.title : step.titleEn;

          return (
            <div key={step.id || idx} className="relative pl-10">
              {/* 节点 */}
              <div
                className={`absolute left-0 top-0.5 size-8 rounded-lg border flex items-center justify-center ${colorClass}`}
              >
                <Icon className="size-3.5" />
              </div>

              {/* 内容 */}
              <div className="rounded-lg border border-border/40 bg-background/60 p-2.5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">
                    {title}
                  </span>
                  <StepStatusIndicator status={step.status} />
                  {step.result?.confidence !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                      <Gauge className="size-2.5" />
                      {t('step_confidence', locale)} {((step.result.confidence as number) * 100).toFixed(0)}%
                    </span>
                  )}
                  {step.duration !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {t('step_duration', locale)} {step.duration}ms
                    </span>
                  )}
                  {step.domain && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {step.domain}
                    </span>
                  )}
                </div>

                {/* 推理说明 */}
                {(() => {
                  const reasoningStr = step.result?.reasoning;
                  if (typeof reasoningStr === 'string' && reasoningStr) {
                    return <p className="text-xs text-muted-foreground mb-1">{reasoningStr}</p>;
                  }
                  return null;
                })()}

                {/* 工具参数 */}
                {step.args && Object.keys(step.args).length > 0 && (
                  <details className="mt-1.5">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      {t('step_tool_args', locale)}
                    </summary>
                    <pre className="mt-1 text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(step.args, null, 2)}
                    </pre>
                  </details>
                )}

                {/* 工具结果 */}
                {step.result && !step.result.reasoning && !step.result.confidence && (
                  <details className="mt-1.5">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      {t('step_tool_result', locale)}
                    </summary>
                    <pre className="mt-1 text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
