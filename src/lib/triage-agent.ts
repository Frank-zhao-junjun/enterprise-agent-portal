/**
 * Triage Agent — LLM 驱动意图分类 + 领域路由 + MCP 工具调用
 *
 * 数据流: 用户输入 → LLM 意图分类 → 领域路由 → MCP 工具调用 → LLM 流式回复
 */

import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import type { DomainRouteResult, LLMMessage, ReasoningStep, MCPToolResult } from '@/types/ontology';
import { getDomainById, getAllDomains } from './domain-registry';
import { createLocalMCPClient, createMockMCPClient } from './mcp-client';

// ============================================================
// 常量
// ============================================================

const DEFAULT_LLM_MODEL = 'doubao-seed-1-8-251228';

// ============================================================
// LLM 调用封装 (coze-coding-dev-sdk)
// ============================================================

function createLLMClient(requestHeaders?: Headers): LLMClient {
  const config = new Config();
  const customHeaders = requestHeaders
    ? HeaderUtils.extractForwardHeaders(requestHeaders)
    : undefined;
  return new LLMClient(config, customHeaders);
}

async function callLLM(
  messages: LLMMessage[],
  options?: { model?: string; temperature?: number; requestHeaders?: Headers },
): Promise<string> {
  const client = createLLMClient(options?.requestHeaders);
  const response = await client.invoke(messages, {
    model: options?.model ?? DEFAULT_LLM_MODEL,
    temperature: options?.temperature ?? 0.7,
  });
  return response.content;
}

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
  const domains = getAllDomains();
  const domainList = domains.map(
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
4. Always include the intent parse tool as the first tool for the selected domain
5. Respond ONLY with valid JSON, no other text`
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

  // 工具结果现在是 { content: string } 格式
  const resultsText = toolResults
    .map((tr) => `### ${tr.toolName}\n\`\`\`json\n${tr.result.content}\n\`\`\``)
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
- Format with markdown for readability

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
// MCP 客户端创建
// ============================================================

async function getMCPClientForDomain(domainId: string) {
  const domain = getDomainById(domainId);

  // 优先使用本地 MCP Server 直接调用（快，无 HTTP 自引用）
  if (domain && domainId !== 'general') {
    try {
      const client = await createLocalMCPClient(domainId);
      return client;
    } catch (err) {
      console.warn(`[Triage] Local MCP failed for ${domainId}, falling back to mock:`, err);
    }
  }

  // Fallback to Mock client
  const domainData = getDomainById(domainId);
  return createMockMCPClient(domainId, domainData?.tools ?? []);
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
    const domain = getDomainById(forcedDomainId);
    route = {
      domainId: forcedDomainId,
      confidence: 1.0,
      reasoning: locale === 'zh'
        ? `用户手动选择领域: ${domain?.name ?? forcedDomainId}`
        : `User selected domain: ${domain?.nameEn ?? forcedDomainId}`,
      toolsToCall: domain?.tools.map((t) => t.name).slice(0, 3) ?? ['ontology_intent_parse'],
    };
  } else {
    try {
      const classifyMessages = buildClassificationPrompt(userMessage, locale);
      const classifyResult = await callLLM(classifyMessages, { requestHeaders });

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

  intentStep.status = 'completed';
  intentStep.result = { domainId: route.domainId, confidence: route.confidence, reasoning: route.reasoning };
  intentStep.duration = Date.now() - stepTimestamp;
  intentStep.domain = route.domainId;
  onStep({ ...intentStep });

  // === Step 2: 路由 ===
  const domain = getDomainById(route.domainId);
  const routingStep: ReasoningStep = {
    id: `step-route-${Date.now()}`,
    type: 'routing',
    title: `路由到${domain?.name ?? '通用'}领域`,
    titleEn: `Routing to ${domain?.nameEn ?? 'General'} domain`,
    status: 'completed',
    result: { domainId: route.domainId, toolsToCall: route.toolsToCall },
    timestamp: Date.now(),
    domain: route.domainId,
    duration: 10,
  };
  onStep(routingStep);
  steps.push(routingStep);

  // === Step 3: MCP 工具调用 ===
  const toolResults: Array<{ toolName: string; result: MCPToolResult }> = [];

  if (route.domainId !== 'general') {
    const mcpClient = await getMCPClientForDomain(route.domainId);

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
        // 根据 toolName 决定传什么参数
        const toolArgs = buildToolArgs(toolName, userMessage, route);
        const result = await mcpClient.callTool(toolName, toolArgs);
        toolResults.push({ toolName, result });

        toolStep.status = 'completed';
        toolStep.result = safeParseJSON(result.content);
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
// 工具参数构建（动态匹配）
// ============================================================

/**
 * 根据工具的 parameter schema 动态构建默认参数
 * 不再依赖硬编码的 toolName 模式匹配
 */
function buildToolArgs(
  toolName: string,
  userMessage: string,
  route: DomainRouteResult,
): Record<string, unknown> {
  const domain = getDomainById(route.domainId);
  const toolDef = domain?.tools.find((t) => t.name === toolName);

  // 有完整的 parameter schema，动态构建默认值
  if (toolDef?.parameters && Object.keys(toolDef.parameters).length > 0) {
    const args: Record<string, unknown> = {};
    for (const [name, param] of Object.entries(toolDef.parameters)) {
      if (param.required) {
        if (param.enum && param.enum.length > 0) {
          args[name] = param.enum[0];
        } else if (param.type === 'string') {
          // 字符串类型且含 query/keyword → 传入用户消息
          if (param.description.toLowerCase().includes('query') || name.includes('query') || name.includes('keyword')) {
            args[name] = userMessage;
          } else {
            args[name] = '';
          }
        } else if (param.type === 'number') {
          args[name] = 10;
        } else {
          args[name] = null;
        }
      }
    }
    return args;
  }

  // 无 schema 时 fallback：根据 toolName 推断（向后兼容）
  if (toolName.includes('intent_parse') || toolName.includes('query') || toolName.includes('search')) {
    return { query: userMessage };
  }

  return { query: userMessage };
}

// ============================================================
// 辅助函数
// ============================================================

function safeParseJSON(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return { rawContent: content };
  }
}

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
        if (result.isError) {
          resp += `- 错误: ${result.content}\n`;
        } else {
          resp += `- ${result.content}\n`;
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
      if (result.isError) {
        resp += `- Error: ${result.content}\n`;
      } else {
        resp += `- ${result.content}\n`;
      }
    }
  } else {
    resp += 'No tool results available.\n';
  }

  return resp;
}
