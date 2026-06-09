// === Triage Agent — LLM 驱动意图分类 + 领域路由 + 工具调用 ===
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import type { NextRequest } from 'next/server';
import type { DomainRouteResult, LLMMessage, ReasoningStep, MCPToolResult } from '@/types/ontology';
import { DOMAINS, getDomainById } from './domain-registry';
import { createMCPClient } from './mcp-client';

// ============================================================
// LLM 调用封装 (coze-coding-dev-sdk)
// ============================================================

/** 创建 LLM 客户端（可传入 NextRequest headers 用于转发） */
function createLLMClient(requestHeaders?: Headers): LLMClient {
  const config = new Config();
  const customHeaders = requestHeaders
    ? HeaderUtils.extractForwardHeaders(requestHeaders)
    : undefined;
  return new LLMClient(config, customHeaders);
}

/** 非流式 LLM 调用 */
async function callLLM(
  messages: LLMMessage[],
  options?: { model?: string; temperature?: number; requestHeaders?: Headers },
): Promise<string> {
  const client = createLLMClient(options?.requestHeaders);
  const response = await client.invoke(messages, {
    model: options?.model ?? 'doubao-seed-1-8-251228',
    temperature: options?.temperature ?? 0.7,
  });
  return response.content;
}

/** 流式 LLM 调用，逐 chunk 回调 */
async function callLLMStream(
  messages: LLMMessage[],
  onChunk: (chunk: string) => void,
  options?: { model?: string; temperature?: number; requestHeaders?: Headers },
): Promise<string> {
  const client = createLLMClient(options?.requestHeaders);
  const stream = client.stream(messages, {
    model: options?.model ?? 'doubao-seed-1-8-251228',
    temperature: options?.temperature ?? 0.7,
  });

  let fullContent = '';
  for await (const chunk of stream) {
    if (chunk.content) {
      const text = chunk.content.toString();
      fullContent += text;
      onChunk(text);
    }
  }
  return fullContent;
}

// ============================================================
// 意图分类 Prompt
// ============================================================

function buildClassificationPrompt(userMessage: string, locale: string): LLMMessage[] {
  const domainList = DOMAINS.map(
    (d) => `- ${d.id}: ${locale === 'zh' ? d.name : d.nameEn} — ${locale === 'zh' ? d.description : d.descriptionEn}`,
  ).join('\n');

  return [
    {
      role: 'system',
      content: `You are a domain classification agent. Your job is to classify the user's message into one of the available domains and determine which tools to call.

Available domains:
${domainList}

You MUST respond with a JSON object in this exact format:
{
  "domainId": "<domain_id>",
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation of why this domain>",
  "toolsToCall": ["<tool_name_1>", "<tool_name_2>"]
}

Rules:
1. Choose the domain that best matches the user's intent
2. If unsure, use "general" domain
3. Select tools that are relevant to answer the user's question
4. Always include "ontology_intent_parse" as the first tool
5. Respond ONLY with valid JSON, no other text`,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
}

// ============================================================
// 回复生成 Prompt
// ============================================================

function buildResponsePrompt(
  userMessage: string,
  route: DomainRouteResult,
  toolResults: Array<{ toolName: string; result: MCPToolResult }>,
  locale: string,
): LLMMessage[] {
  const domain = getDomainById(route.domainId);
  const domainName = locale === 'zh' ? (domain?.name ?? '通用') : (domain?.nameEn ?? 'General');
  const resultsText = toolResults
    .map((tr) => `### ${tr.toolName}\n\`\`\`json\n${JSON.stringify(tr.result.data, null, 2)}\n\`\`\``)
    .join('\n\n');

  return [
    {
      role: 'system',
      content: `You are a knowledgeable assistant specialized in the "${domainName}" domain. You have access to an ontology MCP server that provides structured data.

Based on the tool results below, provide a clear, helpful response to the user.
- Respond in ${locale === 'zh' ? 'Chinese' : 'English'}
- Reference the specific data from tool results
- If there are issues (violations, alerts, errors), highlight them
- Keep the response concise but informative

Domain: ${domainName} (${route.domainId})
Confidence: ${(route.confidence * 100).toFixed(0)}%
Reasoning: ${route.reasoning}`,
    },
    {
      role: 'user',
      content: `${userMessage}\n\n--- Tool Results ---\n${resultsText || '(no tool results)'}`,
    },
  ];
}

// ============================================================
// 主 Agent 运行器
// ============================================================

export interface RunAgentOptions {
  userMessage: string;
  sessionId: string;
  forcedDomainId?: string | null;
  locale: string;
  history: LLMMessage[];
  onStep: (step: ReasoningStep) => void;
  onChunk: (chunk: string) => void;
  requestHeaders?: Headers;
}

export async function runMainAgent(options: RunAgentOptions): Promise<{
  response: string;
  steps: ReasoningStep[];
  updatedHistory: LLMMessage[];
  domainId: string;
}> {
  const { userMessage, forcedDomainId, locale, history, onStep, onChunk, requestHeaders } = options;
  const steps: ReasoningStep[] = [];
  const stepTimestamp = Date.now();

  // === Step 1: 意图分类 ===
  const intentStep: ReasoningStep = {
    id: `step-intent-${stepTimestamp}`,
    type: 'intent',
    title: '意图识别',
    titleEn: 'Intent Classification',
    status: 'running',
    timestamp: stepTimestamp,
  };
  onStep(intentStep);
  steps.push(intentStep);

  let route: DomainRouteResult;

  if (forcedDomainId) {
    // 用户手动指定了领域，跳过分类
    const domain = getDomainById(forcedDomainId);
    route = {
      domainId: forcedDomainId,
      confidence: 1.0,
      reasoning:
        locale === 'zh'
          ? `用户手动选择领域: ${domain?.name ?? forcedDomainId}`
          : `User selected domain: ${domain?.nameEn ?? forcedDomainId}`,
      toolsToCall: domain?.tools.map((t) => t.name).slice(0, 3) ?? ['ontology_intent_parse'],
    };
  } else {
    // LLM 驱动意图分类
    try {
      const classifyMessages = buildClassificationPrompt(userMessage, locale);
      const classifyResult = await callLLM(classifyMessages, { requestHeaders });

      // 解析 LLM 返回的 JSON
      let parsed: DomainRouteResult;
      try {
        const jsonMatch = classifyResult.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] ?? '{}') as DomainRouteResult;
      } catch {
        parsed = {
          domainId: 'general',
          confidence: 0.5,
          reasoning: 'Fallback: could not parse LLM output',
          toolsToCall: ['ontology_intent_parse'],
        };
      }

      // 验证 domainId 有效
      if (!getDomainById(parsed.domainId)) {
        parsed.domainId = 'general';
        parsed.confidence = 0.3;
      }
      route = parsed;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      route = {
        domainId: 'general',
        confidence: 0.3,
        reasoning: `LLM error: ${errorMsg}`,
        toolsToCall: ['ontology_intent_parse'],
      };
    }
  }

  // 完成意图步骤
  intentStep.status = 'completed';
  intentStep.result = { domainId: route.domainId, confidence: route.confidence, reasoning: route.reasoning };
  intentStep.duration = Date.now() - stepTimestamp;
  intentStep.domain = route.domainId;
  onStep({ ...intentStep });

  // === Step 2: 路由 ===
  const routingStep: ReasoningStep = {
    id: `step-route-${Date.now()}`,
    type: 'routing',
    title: `路由到${getDomainById(route.domainId)?.name ?? '通用'}领域`,
    titleEn: `Routing to ${getDomainById(route.domainId)?.nameEn ?? 'General'} domain`,
    status: 'completed',
    result: { domainId: route.domainId, toolsToCall: route.toolsToCall },
    timestamp: Date.now(),
    domain: route.domainId,
    duration: 10,
  };
  onStep(routingStep);
  steps.push(routingStep);

  // === Step 3: MCP 工具调用 ===
  const domain = getDomainById(route.domainId);
  const toolResults: Array<{ toolName: string; result: MCPToolResult }> = [];

  if (domain) {
    const client = createMCPClient(domain.id, domain.transport, domain.tools);

    for (const toolName of route.toolsToCall) {
      const toolStartTime = Date.now();
      const toolStep: ReasoningStep = {
        id: `step-tool-${toolStartTime}`,
        type: 'tool_call',
        title: `调用 ${toolName}`,
        titleEn: `Calling ${toolName}`,
        status: 'running',
        args: { query: userMessage },
        timestamp: toolStartTime,
        domain: route.domainId,
        toolName,
      };
      onStep(toolStep);
      steps.push(toolStep);

      try {
        const result = await client.callTool(toolName, { query: userMessage });
        toolResults.push({ toolName, result });

        toolStep.status = 'completed';
        toolStep.result = result.data as Record<string, unknown>;
        toolStep.duration = Date.now() - toolStartTime;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        toolStep.status = 'error';
        toolStep.result = { error: errorMsg };
        toolStep.duration = Date.now() - toolStartTime;
      }
      onStep({ ...toolStep });
    }
  }

  // === Step 4: 生成回复 ===
  const responseStep: ReasoningStep = {
    id: `step-response-${Date.now()}`,
    type: 'response',
    title: '生成回复',
    titleEn: 'Generating Response',
    status: 'running',
    timestamp: Date.now(),
    domain: route.domainId,
  };
  onStep(responseStep);
  steps.push(responseStep);

  let responseText: string;
  const responseStartTime = Date.now();

  try {
    const responseMessages = buildResponsePrompt(userMessage, route, toolResults, locale);
    responseText = await callLLMStream(responseMessages, onChunk, { requestHeaders });

    if (!responseText || responseText.trim().length === 0) {
      responseText = generateFallbackResponse(route, toolResults, locale);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    responseText = generateFallbackResponse(route, toolResults, locale);
    responseStep.result = { llmError: errorMsg, usedFallback: true };
  }

  responseStep.status = 'completed';
  responseStep.duration = Date.now() - responseStartTime;
  onStep({ ...responseStep });

  // === 更新对话历史 ===
  const updatedHistory: LLMMessage[] = [
    ...history,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: responseText },
  ];

  return { response: responseText, steps, updatedHistory, domainId: route.domainId };
}

// ============================================================
// Fallback 回复生成
// ============================================================

function generateFallbackResponse(
  route: DomainRouteResult,
  toolResults: Array<{ toolName: string; result: MCPToolResult }>,
  locale: string,
): string {
  const domain = getDomainById(route.domainId);
  const domainName = locale === 'zh' ? (domain?.name ?? '通用') : (domain?.nameEn ?? 'General');

  if (locale === 'zh') {
    let resp = `**${domainName}领域分析结果**\n\n`;
    resp += `意图识别置信度: ${(route.confidence * 100).toFixed(0)}%\n\n`;

    if (toolResults.length > 0) {
      for (const { toolName, result } of toolResults) {
        resp += `**${toolName}**:\n`;
        if (result.success) {
          resp += `- ${JSON.stringify(result.data, null, 2)}\n`;
        } else {
          resp += `- 错误: ${result.error ?? 'unknown'}\n`;
        }
      }
    } else {
      resp += '暂无工具调用结果。\n';
    }

    return resp;
  }

  let resp = `**${domainName} Domain Analysis**\n\n`;
  resp += `Intent confidence: ${(route.confidence * 100).toFixed(0)}%\n\n`;

  if (toolResults.length > 0) {
    for (const { toolName, result } of toolResults) {
      resp += `**${toolName}**:\n`;
      if (result.success) {
        resp += `- ${JSON.stringify(result.data, null, 2)}\n`;
      } else {
        resp += `- Error: ${result.error ?? 'unknown'}\n`;
      }
    }
  } else {
    resp += 'No tool results available.\n';
  }

  return resp;
}
