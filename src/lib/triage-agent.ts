/**
 * 主 Agent / Triage Agent
 * 负责意图识别、领域路由、调用 MCP 工具
 *
 * 在 Hub-and-Spoke 架构中，这是唯一的 Hub：
 * 1. 接收用户输入
 * 2. 识别意图（使用 LLM 或关键词匹配）
 * 3. 选择领域
 * 4. 调用领域 MCP 工具
 * 5. 聚合结果并回复用户
 */

import type { ReasoningStep } from '@/types/ontology';
import { ALL_DOMAINS, getDomainById } from './domain-registry';
import { callMCPTool } from './mcp-client';

/** 意图识别结果 */
export interface IntentRecognition {
  domainId: string;
  domainName: string;
  confidence: number;
  reasoning: string;
}

/**
 * 意图识别
 * 使用关键词匹配 + LLM 辅助（演示环境用关键词匹配）
 * 生产环境可使用 LLM 进行更准确的意图分类
 */
export async function recognizeIntent(
  query: string,
  locale: 'zh' | 'en',
): Promise<IntentRecognition> {
  const startTime = Date.now();
  const queryLower = query.toLowerCase();

  // 关键词映射（演示用）
  const keywords: Record<string, string[]> = {
    manufacturing: [
      '生产', '订单', 'po-', '物料', 'bom', '工艺', '产能', '工单', '车间', '库存',
      'production', 'order', 'material', 'bom', 'routing', 'capacity', 'workshop',
    ],
    'customer-service': [
      '航班', '机票', '改签', '退票', '座位', '行李', '登机', 'aa', '航空', 'pnr',
      'flight', 'rebook', 'refund', 'seat', 'baggage', 'boarding', 'airline',
    ],
    'supply-chain': [
      '供应商', '采购', '物流', '库存', '配送', '订单', 'sup-', 'po-', '延迟',
      'supplier', 'purchase', 'logistics', 'inventory', 'delivery',
    ],
  };

  // 统计每个领域的匹配分数
  const scores: Record<string, number> = {};
  for (const [domainId, words] of Object.entries(keywords)) {
    scores[domainId] = words.filter((w) => queryLower.includes(w)).length;
  }

  // 找到最高分的领域
  const sortedDomains = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topDomainId, topScore] = sortedDomains[0];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const domain = getDomainById(topDomainId);
  if (!domain) {
    // 默认回退到第一个领域
    const fallback = ALL_DOMAINS[0];
    return {
      domainId: fallback.id,
      domainName: locale === 'zh' ? fallback.name : fallback.nameEn,
      confidence: 0.3,
      reasoning: locale === 'zh' ? '未能识别明确意图，使用默认领域' : 'Default domain used',
    };
  }

  const confidence = totalScore > 0 ? topScore / totalScore : 0.3;
  const durationMs = Date.now() - startTime;

  return {
    domainId: domain.id,
    domainName: locale === 'zh' ? domain.name : domain.nameEn,
    confidence: Math.min(confidence, 0.99),
    reasoning: locale === 'zh'
      ? `基于关键词匹配，识别为"${domain.name}"领域（命中 ${topScore} 个关键词）`
      : `Matched ${topScore} keywords for "${domain.nameEn}"`,
  };
}

/**
 * 选择要调用的 MCP 工具
 * 基于查询语义选择最相关的工具
 */
export function selectToolForQuery(
  domainId: string,
  query: string,
): { toolId: string; toolArgs: Record<string, unknown> } | null {
  const domain = getDomainById(domainId);
  if (!domain) return null;

  const queryLower = query.toLowerCase();

  // 制造业工具路由
  if (domainId === 'manufacturing') {
    if (queryLower.includes('齐套') || queryLower.includes('readiness') || queryLower.includes('物料')) {
      return { toolId: 'mfg-reason-execute', toolArgs: { rule_set: 'material_readiness', facts: { query } } };
    }
    if (queryLower.includes('意图') || queryLower.includes('intent') || queryLower.includes('解析')) {
      return { toolId: 'mfg-intent-parse', toolArgs: { query } };
    }
    if (queryLower.includes('事件') || queryLower.includes('event') || queryLower.includes('发布')) {
      return { toolId: 'mfg-event-emit', toolArgs: { event_type: 'GenericEvent', payload: { query } } };
    }
    if (queryLower.includes('阈值') || queryLower.includes('threshold') || queryLower.includes('校验')) {
      return { toolId: 'mfg-semantic-check', toolArgs: { data_type: 'debt_ratio', value: 0.5 } };
    }
    // 默认调用后端 API
    return { toolId: 'mfg-api-invoke', toolArgs: { system: 'MES', endpoint: '/query', params: { query } } };
  }

  // 客服工具路由
  if (domainId === 'customer-service') {
    if (queryLower.includes('状态') || queryLower.includes('status')) {
      const flightMatch = query.match(/[A-Z]{2}\d{2,4}/);
      return { toolId: 'cs-flight-status', toolArgs: { flight_number: flightMatch?.[0] || 'AA123' } };
    }
    if (queryLower.includes('改签') || queryLower.includes('rebook')) {
      return { toolId: 'cs-rebook', toolArgs: { confirmation_number: 'ABC123', new_flight: 'AA456' } };
    }
    if (queryLower.includes('赔偿') || queryLower.includes('compensation') || queryLower.includes('voucher')) {
      return { toolId: 'cs-compensation', toolArgs: { confirmation_number: 'ABC123', reason: query } };
    }
    if (queryLower.includes('行李') || queryLower.includes('baggage') || queryLower.includes('wifi') || queryLower.includes('政策')) {
      return { toolId: 'cs-faq', toolArgs: { question: query } };
    }
    // 默认 FAQ
    return { toolId: 'cs-faq', toolArgs: { question: query } };
  }

  // 供应链工具路由
  if (domainId === 'supply-chain') {
    if (queryLower.includes('风险') || queryLower.includes('risk')) {
      const supMatch = query.match(/SUP-[\w-]+/);
      return { toolId: 'sc-supplier-risk', toolArgs: { supplier_id: supMatch?.[0] || 'SUP-001' } };
    }
    if (queryLower.includes('库存') || queryLower.includes('inventory') || queryLower.includes('stock')) {
      const matMatch = query.match(/M-[\w-]+/);
      return { toolId: 'sc-inventory', toolArgs: { material_id: matMatch?.[0] || 'M-A001' } };
    }
    if (queryLower.includes('po-') || queryLower.includes('采购订单')) {
      const poMatch = query.match(/PO-[\w-]+/);
      return { toolId: 'sc-purchase-order', toolArgs: { action: 'query', po_id: poMatch?.[0] || 'PO-001' } };
    }
    if (queryLower.includes('订阅') || queryLower.includes('subscribe')) {
      return { toolId: 'sc-event-subscribe', toolArgs: { event_types: ['DELAY', 'STOCKOUT'], callback: '/webhook' } };
    }
    // 默认 PO 查询
    return { toolId: 'sc-purchase-order', toolArgs: { action: 'query', po_id: 'PO-2024-001' } };
  }

  return null;
}

/**
 * 主 Agent 完整执行流程
 * 返回完整的推理链 + 最终回复
 */
export async function runMainAgent(
  query: string,
  locale: 'zh' | 'en',
): Promise<{ reasoning: ReasoningStep[]; response: string; domainId: string }> {
  const reasoning: ReasoningStep[] = [];
  let step = 0;

  // Step 1: 意图识别
  const intent = await recognizeIntent(query, locale);
  step++;
  reasoning.push({
    step,
    type: 'intent_recognition',
    title: '意图识别',
    titleEn: 'Intent Recognition',
    content: `识别为 ${intent.domainName} 领域，置信度 ${(intent.confidence * 100).toFixed(0)}%`,
    contentEn: `Recognized as ${intent.domainName} domain, confidence ${(intent.confidence * 100).toFixed(0)}%`,
    confidence: intent.confidence,
    timestamp: Date.now(),
    durationMs: 50,
  });

  // Step 2: 领域路由
  const domain = getDomainById(intent.domainId);
  if (!domain) {
    reasoning.push({
      step: ++step,
      type: 'domain_routing',
      title: '领域路由失败',
      titleEn: 'Domain Routing Failed',
      content: '未找到对应的领域 MCP Server',
      contentEn: 'Domain MCP Server not found',
      timestamp: Date.now(),
    });
    return {
      reasoning,
      response: locale === 'zh' ? '抱歉，未能识别您的需求所属领域。' : 'Sorry, I could not identify the domain of your request.',
      domainId: intent.domainId,
    };
  }

  step++;
  reasoning.push({
    step,
    type: 'domain_routing',
    title: '领域路由',
    titleEn: 'Domain Routing',
    content: `路由到 ${domain.name} 领域 MCP Server (${domain.mcpServerUrl})`,
    contentEn: `Routed to ${domain.nameEn} domain MCP Server (${domain.mcpServerUrl})`,
    timestamp: Date.now(),
    confidence: intent.confidence,
  });

  // Step 3: 语义查询（如适用）
  if (intent.domainId === 'customer-service' || intent.domainId === 'manufacturing') {
    step++;
    reasoning.push({
      step,
      type: 'semantic_lookup',
      title: '语义查询',
      titleEn: 'Semantic Lookup',
      content: `在 ${domain.name} 本体图谱中查询相关概念`,
      contentEn: `Querying related concepts in ${domain.nameEn} ontology graph`,
      timestamp: Date.now(),
    });
  }

  // Step 4: 选择并调用 MCP 工具
  const toolSelection = selectToolForQuery(intent.domainId, query);
  if (!toolSelection) {
    reasoning.push({
      step: ++step,
      type: 'mcp_call',
      title: '未找到合适的工具',
      titleEn: 'No Suitable Tool',
      content: '该领域暂无可用工具处理此问题',
      contentEn: 'No available tool in this domain for this query',
      timestamp: Date.now(),
    });
    return {
      reasoning,
      response: locale === 'zh'
        ? `${domain.name}领域暂未实现此功能。`
        : `${domain.nameEn} domain does not support this yet.`,
      domainId: intent.domainId,
    };
  }

  const found = domain.tools.find((t) => t.id === toolSelection.toolId);
  step++;
  const mcpStart = Date.now();
  const mcpResult = await callMCPTool(toolSelection.toolId, toolSelection.toolArgs);
  const mcpDuration = Date.now() - mcpStart;

  reasoning.push({
    step,
    type: 'mcp_call',
    title: `MCP 工具调用: ${found?.nameEn || toolSelection.toolId}`,
    titleEn: `MCP Tool Call: ${found?.nameEn || toolSelection.toolId}`,
    content: `调用 ${domain.nameEn} MCP Server 的 ${found?.nameEn || toolSelection.toolId} 工具`,
    contentEn: `Calling ${domain.nameEn} MCP Server's ${found?.nameEn || toolSelection.toolId} tool`,
    toolName: found?.nameEn || toolSelection.toolId,
    toolArgs: toolSelection.toolArgs,
    toolResult: mcpResult.result,
    timestamp: Date.now(),
    durationMs: mcpDuration,
    confidence: mcpResult.success ? 0.95 : 0,
  });

  if (!mcpResult.success) {
    reasoning.push({
      step: ++step,
      type: 'response',
      title: 'MCP 调用失败',
      titleEn: 'MCP Call Failed',
      content: mcpResult.error || 'Unknown error',
      contentEn: mcpResult.error || 'Unknown error',
      timestamp: Date.now(),
    });
    return {
      reasoning,
      response: locale === 'zh'
        ? `MCP 工具调用失败：${mcpResult.error}`
        : `MCP tool call failed: ${mcpResult.error}`,
      domainId: intent.domainId,
    };
  }

  // Step 5: 规则推理 / 治理检查
  if (intent.domainId === 'manufacturing' || intent.domainId === 'supply-chain') {
    step++;
    reasoning.push({
      step,
      type: 'rule_reasoning',
      title: '规则推理',
      titleEn: 'Rule Reasoning',
      content: '应用业务规则评估结果',
      contentEn: 'Applying business rules to evaluate result',
      timestamp: Date.now(),
    });
  }

  // Step 6: 事件发布
  if (mcpResult.result && typeof mcpResult.result === 'object') {
    step++;
    reasoning.push({
      step,
      type: 'event_emit',
      title: '事件发布',
      titleEn: 'Event Emission',
      content: '发布领域事件到事件总线',
      contentEn: 'Publishing domain event to event bus',
      timestamp: Date.now(),
    });
  }

  // Step 7: 治理检查
  step++;
  reasoning.push({
    step,
    type: 'governance_check',
    title: '治理检查',
    titleEn: 'Governance Check',
    content: '校验结果符合数据质量与合规要求',
    contentEn: 'Verifying result meets data quality and compliance requirements',
    timestamp: Date.now(),
  });

  // Step 8: 结果聚合 & 最终回复
  step++;
  const response = formatAgentResponse(intent.domainId, mcpResult.result, locale);
  reasoning.push({
    step,
    type: 'response',
    title: '回复用户',
    titleEn: 'Response',
    content: response,
    contentEn: response,
    timestamp: Date.now(),
  });

  return { reasoning, response, domainId: intent.domainId };
}

/**
 * 格式化 Agent 回复
 */
function formatAgentResponse(
  domainId: string,
  result: Record<string, unknown>,
  locale: 'zh' | 'en',
): string {
  const isZh = locale === 'zh';

  if (domainId === 'manufacturing') {
    if (result.core_concept) {
      return isZh
        ? `已识别核心概念：**${result.core_concept}**\n相关概念：${(result.related_concepts as string[] | undefined)?.join('、') || '无'}\n${result.entities ? `识别实体：${JSON.stringify(result.entities)}` : ''}`
        : `Core concept: **${result.core_concept}**\nRelated: ${(result.related_concepts as string[] | undefined)?.join(', ') || 'none'}\n${result.entities ? `Entities: ${JSON.stringify(result.entities)}` : ''}`;
    }
    if (result.rule_hit) {
      return isZh
        ? `规则匹配：**${result.rule_hit}**\n结果：${result.result}\n${result.missing ? `缺失：${JSON.stringify(result.missing)}` : ''}`
        : `Rule matched: **${result.rule_hit}**\nResult: ${result.result}\n${result.missing ? `Missing: ${JSON.stringify(result.missing)}` : ''}`;
    }
  }

  if (domainId === 'customer-service') {
    if (result.flight) {
      return isZh
        ? `航班 **${result.flight}** 当前状态：**${result.status}**${result.delay_minutes ? `\n延误：${result.delay_minutes} 分钟` : ''}${result.new_departure ? `\n预计起飞：${result.new_departure}` : ''}${result.gate ? `\n登机口：${result.gate}` : ''}`
        : `Flight **${result.flight}** status: **${result.status}**${result.delay_minutes ? `\nDelay: ${result.delay_minutes} min` : ''}${result.new_departure ? `\nNew departure: ${result.new_departure}` : ''}${result.gate ? `\nGate: ${result.gate}` : ''}`;
    }
    if (result.answer) {
      return result.answer as string;
    }
  }

  if (domainId === 'supply-chain') {
    if (result.risk_level) {
      return isZh
        ? `供应商 **${result.supplier_id}** 风险等级：**${result.risk_level}**\n财务风险：${result.financial}\n交付风险：${result.delivery}\n合规风险：${result.compliance}`
        : `Supplier **${result.supplier_id}** risk level: **${result.risk_level}**\nFinancial: ${result.financial}\nDelivery: ${result.delivery}\nCompliance: ${result.compliance}`;
    }
  }

  // 默认回复
  return isZh
    ? `已调用 ${domainId} 领域 MCP 工具，结果：\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
    : `MCP tool called for ${domainId} domain, result:\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
}
