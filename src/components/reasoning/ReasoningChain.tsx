'use client';

/**
 * 推理链展示组件
 * 展示主 Agent 的完整推理过程
 */

import { useApp } from '@/contexts/app-context';
import { getReasoningStepTitle, t } from '@/lib/i18n';
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
} from 'lucide-react';

/** 步骤类型 → 图标 */
const stepIcons: Record<string, typeof Brain> = {
  intent_recognition: Brain,
  domain_routing: Compass,
  mcp_call: Wrench,
  semantic_lookup: Search,
  rule_reasoning: GitBranch,
  event_emit: Zap,
  governance_check: Shield,
  api_invoke: Plug,
  aggregation: Combine,
  response: MessageSquare,
};

/** 步骤类型 → 颜色 */
const stepColors: Record<string, string> = {
  intent_recognition: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
  domain_routing: 'text-purple-600 bg-purple-500/10 border-purple-500/30',
  mcp_call: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/30',
  semantic_lookup: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
  rule_reasoning: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  event_emit: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
  governance_check: 'text-red-600 bg-red-500/10 border-red-500/30',
  api_invoke: 'text-green-600 bg-green-500/10 border-green-500/30',
  aggregation: 'text-pink-600 bg-pink-500/10 border-pink-500/30',
  response: 'text-primary bg-primary/10 border-primary/30',
};

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
          const content = locale === 'zh' ? step.content : step.contentEn;

          return (
            <div key={idx} className="relative pl-10">
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
                    {getReasoningStepTitle(step.type, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground">#{step.step}</span>
                  {step.confidence !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                      <Gauge className="size-2.5" />
                      {t('step_confidence', locale)} {(step.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {step.durationMs !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {t('step_duration', locale)} {step.durationMs}ms
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/80 mb-1">{content}</p>
                {title !== content && (
                  <p className="text-xs text-muted-foreground">{title}</p>
                )}

                {/* 工具参数 */}
                {step.toolArgs && (
                  <details className="mt-1.5">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      {t('step_tool_args', locale)}
                    </summary>
                    <pre className="mt-1 text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(step.toolArgs, null, 2)}
                    </pre>
                  </details>
                )}

                {/* 工具结果 */}
                {step.toolResult && (
                  <details className="mt-1.5">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      {t('step_tool_result', locale)}
                    </summary>
                    <pre className="mt-1 text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(step.toolResult, null, 2)}
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
