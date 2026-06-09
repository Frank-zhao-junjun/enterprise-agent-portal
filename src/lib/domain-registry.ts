// === Domain Registry — 领域注册表 ===
import type { DomainOntology } from '@/types/ontology';

export const SHARED_CATEGORIES = [
  { id: 'semantic', name: '语义', nameEn: 'Semantic', description: '意图理解、实体识别、语义映射', descriptionEn: 'Intent understanding, entity recognition, semantic mapping' },
  { id: 'behavior', name: '行为', nameEn: 'Behavior', description: '任务规划、执行编排、流程驱动', descriptionEn: 'Task planning, execution orchestration, process driving' },
  { id: 'event', name: '事件', nameEn: 'Event', description: '事件捕获、流处理、状态变更通知', descriptionEn: 'Event capture, stream processing, state change notification' },
  { id: 'governance', name: '治理', nameEn: 'Governance', description: '规则校验、合规检查、护栏执行', descriptionEn: 'Rule validation, compliance checking, guardrail execution' },
  { id: 'api', name: 'API', nameEn: 'API', description: '后端系统集成、数据读写、服务调用', descriptionEn: 'Backend integration, data R/W, service invocation' },
] as const;

export const DOMAINS: DomainOntology[] = [
  {
    id: 'manufacturing',
    name: '制造业',
    nameEn: 'Manufacturing',
    icon: '🏭',
    description: '智能制造领域本体，覆盖生产排程、质量管控、设备运维等场景',
    descriptionEn: 'Smart manufacturing ontology covering production scheduling, quality control, and equipment maintenance',
    transport: { type: 'mock' },
    tools: [
      { name: 'ontology_intent_parse', description: '解析用户意图，识别制造场景中的实体和语义', category: 'semantic', parameters: { query: { type: 'string', description: '用户查询文本', required: true } } },
      { name: 'ontology_plan_execute', description: '制定并执行制造任务计划（排程、质检、维护）', category: 'behavior', parameters: { task_type: { type: 'string', description: '任务类型', required: true } } },
      { name: 'ontology_event_log', description: '查询生产事件流（质量告警、设备异常、维护到期）', category: 'event', parameters: { severity: { type: 'string', description: '严重级别过滤' } } },
      { name: 'ontology_rule_validate', description: '校验制造规则合规（安全规程、质量标准、SOP）', category: 'governance', parameters: { rule_set: { type: 'string', description: '规则集标识' } } },
      { name: 'ontology_api_call', description: '调用后端 MES/ERP 系统 API', category: 'api', parameters: { endpoint: { type: 'string', description: 'API 端点', required: true }, method: { type: 'string', description: 'HTTP 方法' } } },
    ],
    categories: SHARED_CATEGORIES.map((c) => ({ ...c, toolCount: 1 })),
    exampleQuestions: ['L3产线今天的产量达标了吗？', '最近有哪些质量告警？', '设备M7的维护计划是什么？'],
    exampleQuestionsEn: ['Is the L3 production line meeting today\'s target?', 'What quality alerts have occurred recently?', 'What is the maintenance plan for machine M7?'],
  },
  {
    id: 'customer-service',
    name: '客服',
    nameEn: 'Customer Service',
    icon: '🎧',
    description: '智能客服领域本体，覆盖航班服务、酒店预订、投诉处理等场景',
    descriptionEn: 'Smart customer service ontology covering flight services, hotel bookings, and complaint handling',
    transport: { type: 'mock' },
    tools: [
      { name: 'ontology_intent_parse', description: '解析客户意图，识别服务场景和请求类型', category: 'semantic', parameters: { query: { type: 'string', description: '客户消息', required: true } } },
      { name: 'ontology_rule_validate', description: '校验服务规则（退改政策、赔偿标准、升级条件）', category: 'governance', parameters: { scenario: { type: 'string', description: '服务场景' } } },
      { name: 'ontology_event_log', description: '查询客户服务事件（航班变更、投诉记录、赔偿案例）', category: 'event', parameters: { event_type: { type: 'string', description: '事件类型' } } },
      { name: 'ontology_api_call', description: '调用后端 CRM/订票系统 API', category: 'api', parameters: { endpoint: { type: 'string', description: 'API 端点', required: true } } },
    ],
    categories: SHARED_CATEGORIES.filter((c) => c.id !== 'behavior').map((c) => ({ ...c, toolCount: 1 })),
    exampleQuestions: ['航班CA1234延误了，我可以申请赔偿吗？', '我想改签到明天的航班', '最近有哪些航班变更通知？'],
    exampleQuestionsEn: ['Flight CA1234 is delayed, can I claim compensation?', 'I want to change my flight to tomorrow', 'What flight change notifications are there recently?'],
  },
  {
    id: 'supply-chain',
    name: '供应链',
    nameEn: 'Supply Chain',
    icon: '📦',
    description: '供应链领域本体，覆盖供应商管理、风险评估、采购决策等场景',
    descriptionEn: 'Supply chain ontology covering supplier management, risk assessment, and procurement decisions',
    transport: { type: 'mock' },
    tools: [
      { name: 'ontology_intent_parse', description: '解析供应链查询意图，识别供应商、物料、区域等实体', category: 'semantic', parameters: { query: { type: 'string', description: '查询文本', required: true } } },
      { name: 'ontology_plan_execute', description: '制定采购/物流计划，评估替代方案', category: 'behavior', parameters: { plan_type: { type: 'string', description: '计划类型', required: true } } },
      { name: 'ontology_rule_validate', description: '校验供应链规则（双源要求、合规检查、ESG 评分）', category: 'governance', parameters: { supplier_id: { type: 'string', description: '供应商 ID' } } },
      { name: 'ontology_api_call', description: '调用后端 ERP/WMS 系统 API', category: 'api', parameters: { endpoint: { type: 'string', description: 'API 端点', required: true } } },
    ],
    categories: SHARED_CATEGORIES.filter((c) => c.id !== 'event').map((c) => ({ ...c, toolCount: 1 })),
    exampleQuestions: ['供应商A的ESG评分是多少？', '帮我制定备选采购方案', '当前供应链合规检查结果如何？'],
    exampleQuestionsEn: ['What is the ESG score of supplier A?', 'Help me create an alternative procurement plan', 'What are the current supply chain compliance check results?'],
  },
  {
    id: 'general',
    name: '通用',
    nameEn: 'General',
    icon: '💬',
    description: '通用对话兜底，处理闲聊和不属于特定领域的请求',
    descriptionEn: 'General conversation fallback for chitchat and non-domain requests',
    transport: { type: 'mock' },
    tools: [
      { name: 'ontology_intent_parse', description: '基础意图解析', category: 'semantic', parameters: { query: { type: 'string', description: '用户消息', required: true } } },
    ],
    categories: [{ ...SHARED_CATEGORIES[0], toolCount: 1 }],
    exampleQuestions: ['你好，你能做什么？', '帮我解释一下什么是本体模型'],
    exampleQuestionsEn: ['Hello, what can you do?', 'Explain what an ontology model is'],
  },
];

export function getDomainById(id: string): DomainOntology | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export const ALL_DOMAINS = DOMAINS;

export function getToolByName(domainId: string, toolName: string) {
  const domain = getDomainById(domainId);
  return domain?.tools.find((t) => t.name === toolName);
}
