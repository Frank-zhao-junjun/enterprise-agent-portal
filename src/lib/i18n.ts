/**
 * 国际化系统 - Ontology Hub
 * 支持中文/英文双语切换
 */

import type { ReasoningStepType } from '@/types/ontology';

export type Locale = 'zh' | 'en';

export const dictionaries: Record<string, Record<Locale, string>> = {
  // 顶部
  app_title: { zh: '本体模型平台', en: 'Ontology Platform' },
  app_subtitle: {
    zh: 'MCP Server 与领域本体模型管理',
    en: 'MCP Server & Domain Ontology Management',
  },

  // 侧边栏导航
  nav_platform: { zh: '平台', en: 'Platform' },
  nav_testing: { zh: '测试', en: 'Testing' },
  nav_dashboard: { zh: '仪表盘', en: 'Dashboard' },
  nav_ontology: { zh: '本体模型', en: 'Ontology Models' },
  nav_mcp_servers: { zh: 'MCP Server', en: 'MCP Servers' },
  nav_showcase: { zh: 'Agent Showcase', en: 'Agent Showcase' },
  expand: { zh: '展开', en: 'Expand' },
  collapse: { zh: '收起', en: 'Collapse' },

  // 仪表盘
  dashboard_title: { zh: '平台概览', en: 'Platform Overview' },
  dashboard_subtitle: {
    zh: 'MCP Server 与领域本体模型运行状态',
    en: 'MCP Server & Domain Ontology runtime status',
  },
  stat_mcp_servers: { zh: 'MCP 服务器', en: 'MCP Servers' },
  stat_online: { zh: '在线', en: 'online' },
  stat_ontology_domains: { zh: '本体领域', en: 'Ontology Domains' },
  stat_domains_desc: { zh: '个领域已注册', en: 'domains registered' },
  stat_total_tools: { zh: '工具总数', en: 'Total Tools' },
  stat_tools_desc: { zh: '个 MCP 工具可用', en: 'MCP tools available' },
  stat_categories: { zh: '能力类别', en: 'Capability Categories' },
  stat_categories_desc: { zh: '大能力类别', en: 'major capability types' },
  mcp_server_status: { zh: 'MCP Server 状态', en: 'MCP Server Status' },
  ontology_capabilities: { zh: '本体模型能力', en: 'Ontology Capabilities' },
  view_all: { zh: '查看全部', en: 'View All' },
  view_details: { zh: '查看详情', en: 'Details' },
  quick_start: { zh: '快速开始', en: 'Quick Start' },
  browse_ontology: { zh: '浏览本体模型', en: 'Browse Ontology' },
  manage_servers: { zh: '管理 MCP Server', en: 'Manage MCP Servers' },
  agent_showcase: { zh: 'Agent Showcase 测试', en: 'Agent Showcase Test' },

  // 本体模型页
  ontology_title: { zh: '本体模型', en: 'Ontology Models' },
  ontology_subtitle: {
    zh: '浏览各领域本体模型的语义、行为、事件、治理和 API 能力',
    en: 'Browse semantic, behavior, event, governance & API capabilities across domains',
  },
  all_domains: { zh: '全部领域', en: 'All Domains' },
  categories_count: { zh: '个类别', en: 'categories' },

  // MCP Server 页
  mcp_servers_title: { zh: 'MCP Server 管理', en: 'MCP Server Management' },
  mcp_servers_subtitle: {
    zh: '查看服务器状态，交互式测试 MCP 工具',
    en: 'View server status, interactively test MCP tools',
  },

  // 侧边栏 - 领域列表
  domains_title: { zh: '领域本体', en: 'Domain Ontologies' },
  domains_subtitle: {
    zh: '选择领域查看可用 MCP 工具',
    en: 'Select a domain to view available MCP tools',
  },
  mcp_server: { zh: 'MCP Server', en: 'MCP Server' },
  applicable_scenarios: { zh: '适用场景', en: 'Applicable Scenarios' },
  select_domain: { zh: '选择领域', en: 'Select Domain' },

  // 工具分类
  cat_semantic: { zh: '语义', en: 'Semantic' },
  cat_behavior: { zh: '行为', en: 'Behavior' },
  cat_event: { zh: '事件', en: 'Event' },
  cat_governance: { zh: '治理', en: 'Governance' },
  cat_api: { zh: 'API', en: 'API' },

  // 聊天区
  chat_placeholder: {
    zh: '输入您的问题，主 Agent 将自动路由到合适的领域...',
    en: 'Type your question, the main agent will route to the right domain...',
  },
  chat_send: { zh: '发送', en: 'Send' },
  chat_empty_title: { zh: '开始对话', en: 'Start a Conversation' },
  chat_empty_desc: {
    zh: '点击下方示例问题或直接输入您的问题',
    en: 'Click an example question below or type your own',
  },
  chat_thinking: { zh: '主 Agent 正在推理...', en: 'Main agent is reasoning...' },
  chat_reasoning_chain: { zh: '推理链', en: 'Reasoning Chain' },
  chat_user: { zh: '用户', en: 'You' },
  chat_agent: { zh: '主 Agent', en: 'Main Agent' },

  // 推理步骤
  step_intent_recognition: { zh: '意图识别', en: 'Intent Recognition' },
  step_domain_routing: { zh: '领域路由', en: 'Domain Routing' },
  step_mcp_call: { zh: 'MCP 工具调用', en: 'MCP Tool Call' },
  step_semantic_lookup: { zh: '语义查询', en: 'Semantic Lookup' },
  step_rule_reasoning: { zh: '规则推理', en: 'Rule Reasoning' },
  step_event_emit: { zh: '事件发布', en: 'Event Emission' },
  step_governance_check: { zh: '治理检查', en: 'Governance Check' },
  step_api_invoke: { zh: '后端 API 调用', en: 'Backend API Invoke' },
  step_aggregation: { zh: '结果聚合', en: 'Result Aggregation' },
  step_response: { zh: '回复', en: 'Response' },

  // 推理步骤详情
  step_confidence: { zh: '置信度', en: 'Confidence' },
  step_duration: { zh: '耗时', en: 'Duration' },
  step_tool_args: { zh: '工具参数', en: 'Tool Args' },
  step_tool_result: { zh: '工具结果', en: 'Tool Result' },

  // 示例问题
  examples_title: { zh: '示例问题', en: 'Example Questions' },
  examples_subtitle: {
    zh: '点击下方问题快速开始',
    en: 'Click a question to start quickly',
  },

  // 工具详情
  tools_title: { zh: 'MCP 工具', en: 'MCP Tools' },
  tools_count: { zh: '个工具', en: 'tools' },
  tool_parameters: { zh: '参数', en: 'Parameters' },
  tool_example: { zh: '示例', en: 'Example' },

  // 架构说明
  arch_title: { zh: '架构说明', en: 'Architecture' },
  arch_main_agent: { zh: '主 Agent', en: 'Main Agent' },
  arch_main_agent_desc: {
    zh: '唯一的入口，识别用户意图并路由到合适的领域',
    en: 'The single entry point, identifies user intent and routes to the right domain',
  },
  arch_mcp: { zh: 'MCP 协议', en: 'MCP Protocol' },
  arch_mcp_desc: {
    zh: '主 Agent 通过 MCP 调用领域 Server 的 tools',
    en: 'Main Agent calls domain server tools via MCP',
  },
  arch_capabilities: { zh: '五大能力', en: 'Five Capabilities' },
  arch_cap_semantic: { zh: '语义', en: 'Semantic' },
  arch_cap_behavior: { zh: '行为', en: 'Behavior' },
  arch_cap_event: { zh: '事件', en: 'Event' },
  arch_cap_governance: { zh: '治理', en: 'Governance' },
  arch_cap_api: { zh: '后端 API', en: 'Backend API' },

  // 错误
  error_general: {
    zh: '处理请求时发生错误',
    en: 'An error occurred while processing the request',
  },
  error_empty_message: {
    zh: '请输入消息',
    en: 'Please enter a message',
  },
};

/** 翻译函数 */
export function t(key: string, locale: Locale = 'zh'): string {
  return dictionaries[key]?.[locale] ?? key;
}

/** 翻译函数别名 */
export function ts(key: string, locale: Locale = 'zh'): string {
  return t(key, locale);
}

/** 获取推理步骤标题 */
export function getReasoningStepTitle(type: ReasoningStepType, locale: Locale): string {
  const map: Record<ReasoningStepType, string> = {
    intent: 'step_intent_recognition',
    routing: 'step_domain_routing',
    tool_call: 'step_mcp_call',
    tool_result: 'step_mcp_call',
    guardrail: 'step_governance_check',
    semantic_lookup: 'step_semantic_lookup',
    rule_reasoning: 'step_rule_reasoning',
    event_emit: 'step_event_emit',
    governance_check: 'step_governance_check',
    api_invoke: 'step_api_invoke',
    aggregation: 'step_aggregation',
    response: 'step_response',
  };
  return t(map[type] ?? type, locale);
}

/** 获取工具分类名称 */
export function getToolCategoryName(
  category: 'semantic' | 'behavior' | 'event' | 'governance' | 'api',
  locale: Locale,
): string {
  const map = {
    semantic: 'cat_semantic',
    behavior: 'cat_behavior',
    event: 'cat_event',
    governance: 'cat_governance',
    api: 'cat_api',
  };
  return t(map[category], locale);
}

/** 获取工具分类颜色 */
export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    semantic: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    behavior: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    event: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    governance: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
    api: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  };
  return map[category] ?? 'bg-gray-500/10 text-gray-700 border-gray-500/20';
}

/** 格式化消息时间 */
export function formatTime(timestamp: number, locale: Locale): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
