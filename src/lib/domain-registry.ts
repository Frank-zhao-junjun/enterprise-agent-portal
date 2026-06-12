/**
 * Domain Registry — 领域注册表
 * 工具定义从 MCP Server 动态获取，静态数据保留描述/图标/示例问题
 */

import type { DomainOntology, MCPToolParameter } from '@/types/ontology';
import { getMCPServer } from './mcp-server/registry';
import type { MCPToolDefinition } from './mcp-server/protocol';

export const SHARED_CATEGORIES = [
  { id: 'semantic', name: '语义', nameEn: 'Semantic', description: '意图理解、实体识别、语义映射', descriptionEn: 'Intent understanding, entity recognition, semantic mapping' },
  { id: 'behavior', name: '行为', nameEn: 'Behavior', description: '任务规划、执行编排、流程驱动', descriptionEn: 'Task planning, execution orchestration, process driving' },
  { id: 'event', name: '事件', nameEn: 'Event', description: '事件捕获、流处理、状态变更通知', descriptionEn: 'Event capture, stream processing, state change notification' },
  { id: 'governance', name: '治理', nameEn: 'Governance', description: '规则校验、合规检查、护栏执行', descriptionEn: 'Rule validation, compliance checking, guardrail execution' },
  { id: 'api', name: 'API', nameEn: 'API', description: '后端系统集成、数据读写、服务调用', descriptionEn: 'Backend integration, data R/W, service invocation' },
] as const;

// ============ 领域元数据（静态） ============

interface DomainMeta {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  exampleQuestions: string[];
  exampleQuestionsEn: string[];
}

const DOMAIN_METAS: DomainMeta[] = [
  {
    id: 'manufacturing',
    name: '制造业',
    nameEn: 'Manufacturing',
    icon: '🏭',
    description: '智能制造领域本体，覆盖生产排程、质量管控、设备运维等场景',
    descriptionEn: 'Smart manufacturing ontology covering production scheduling, quality control, and equipment maintenance',
    exampleQuestions: ['L3产线今天的产量达标了吗？', '最近有哪些质量告警？', '设备R2的维护计划是什么？', '连接MES系统查看工单状态'],
    exampleQuestionsEn: ['Is the L3 production line meeting today\'s target?', 'What quality alerts have occurred recently?', 'What is the maintenance plan for robot R2?', 'Connect to MES to check work order status'],
  },
  {
    id: 'customer-service',
    name: '客服',
    nameEn: 'Customer Service',
    icon: '🎧',
    description: '智能客服领域本体，覆盖工单处理、客户路由、SLA 管理等场景',
    descriptionEn: 'Smart customer service ontology covering ticket processing, customer routing, and SLA management',
    exampleQuestions: ['帮我创建一个退款工单', '哪些工单即将违反 SLA？', '客户张伟的投诉处理了吗？', '连接CRM查看客户信息'],
    exampleQuestionsEn: ['Create a refund ticket for me', 'Which tickets are about to breach SLA?', 'Has customer Zhang Wei\'s complaint been handled?', 'Connect to CRM to check customer info'],
  },
  {
    id: 'supply-chain',
    name: '供应链',
    nameEn: 'Supply Chain',
    icon: '📦',
    description: '供应链领域本体，覆盖库存管理、物流调度、供应商评估等场景',
    descriptionEn: 'Supply chain ontology covering inventory management, logistics scheduling, and supplier assessment',
    exampleQuestions: ['当前有哪些物料库存不足？', '物流延迟怎么处理？', '供应商合规检查结果如何？', '连接WMS查看仓库利用率'],
    exampleQuestionsEn: ['Which materials are running low?', 'How to handle logistics delays?', 'What are the supplier compliance check results?', 'Connect to WMS to check warehouse utilization'],
  },
  {
    id: 'general',
    name: '通用',
    nameEn: 'General',
    icon: '💬',
    description: '通用对话兜底，处理闲聊和不属于特定领域的请求',
    descriptionEn: 'General conversation fallback for chitchat and non-domain requests',
    exampleQuestions: ['你好，你能做什么？', '帮我解释一下什么是本体模型'],
    exampleQuestionsEn: ['Hello, what can you do?', 'Explain what an ontology model is'],
  },
];

// ============ 工具定义转换 ============

function mcpToolToDomainTool(tool: MCPToolDefinition): DomainOntology['tools'][number] {
  return {
    name: tool.name,
    description: tool.description,
    category: tool.category,
    parameters: Object.fromEntries(
      Object.entries(tool.parameters).map(([k, v]) => [k, {
        type: v.type as MCPToolParameter['type'],
        description: v.description,
        required: v.required,
        ...(v.enum ? { enum: v.enum } : {}),
      }])
    ) as Record<string, MCPToolParameter>,
  };
}

function buildCategories(tools: MCPToolDefinition[]): DomainOntology['categories'] {
  return SHARED_CATEGORIES.map((c) => ({
    ...c,
    toolCount: tools.filter((t) => t.category === c.id).length,
  }));
}

// ============ 动态领域构建（带可刷新缓存）============

let cachedDomains: DomainOntology[] | null = null;
let cacheBuildCount = 0;

/**
 * 获取所有领域（从 MCP Server 注册表动态获取工具，带缓存）
 */
export function getAllDomains(): DomainOntology[] {
  if (cachedDomains) return cachedDomains;
  return rebuildCache();
}

/**
 * 强制刷新缓存（热加载新注册的 Server）
 * 当 MCP Server 注册表变化后调用此函数使数据生效
 */
export function invalidateDomainCache(): DomainOntology[] {
  cachedDomains = null;
  return rebuildCache();
}

function rebuildCache(): DomainOntology[] {
  cachedDomains = DOMAIN_METAS.map((meta) => {
    let toolDefs: MCPToolDefinition[] = [];
    try {
      const server = getMCPServer(meta.id);
      toolDefs = server ? server.getToolDefinitions() : [];
    } catch (err) {
      console.warn(`[domain-registry] Failed to get tools for domain "${meta.id}":`, err);
    }

    return {
      id: meta.id,
      name: meta.name,
      nameEn: meta.nameEn,
      icon: meta.icon,
      description: meta.description,
      descriptionEn: meta.descriptionEn,
      transport: { type: 'http' as const },
      tools: toolDefs.map(mcpToolToDomainTool),
      categories: buildCategories(toolDefs),
      exampleQuestions: meta.exampleQuestions,
      exampleQuestionsEn: meta.exampleQuestionsEn,
    };
  });
  cacheBuildCount++;
  return cachedDomains;
}

/** 获取缓存构建次数（用于依赖追踪/调试） */
export function getCacheBuildCount(): number {
  return cacheBuildCount;
}

/**
 * 按ID获取领域（使用 getAllDomains() 确保拿到最新缓存）
 */
export function getDomainById(id: string): DomainOntology | undefined {
  return getAllDomains().find((d) => d.id === id);
}

/**
 * 模块加载时的快照 — 用于静态 context。
 * 推荐优先使用 getAllDomains() 获取最新缓存。
 * @deprecated 请改用 getAllDomains() 以确保缓存一致性
 */
export const ALL_DOMAINS = /* @deprecated */ getAllDomains();

export function getToolByName(domainId: string, toolName: string) {
  const domain = getDomainById(domainId);
  return domain?.tools.find((t) => t.name === toolName);
}
