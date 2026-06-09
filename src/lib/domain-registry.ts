/**
 * 本体领域注册表
 * Ontology Domain Registry
 *
 * 每个领域代表一个行业/业务域，对应一个 MCP Server，
 * 提供语义、行为、事件、治理、API 五类能力。
 */

import type { DomainOntology } from '@/types/ontology';

/** 制造业领域 */
export const MANUFACTURING_DOMAIN: DomainOntology = {
  id: 'manufacturing',
  name: '制造业',
  nameEn: 'Manufacturing',
  description: '生产订单、物料、BOM、工艺路线、库存、质量、设备等制造业核心知识',
  descriptionEn: 'Production orders, materials, BOM, routing, inventory, quality, equipment',
  icon: 'Factory',
  color: 'blue',
  mcpServerUrl: 'mcp://ontology-platform/manufacturing',
  tools: [
    {
      id: 'mfg-intent-parse',
      name: '意图解析',
      nameEn: 'intent_parse',
      description: '将自然语言查询映射到制造业本体概念图谱',
      descriptionEn: 'Map natural language queries to manufacturing ontology concepts',
      category: 'semantic',
      parameters: [
        { name: 'query', type: 'string', description: '用户查询', required: true, defaultValue: null },
      ],
      example: {
        input: { query: '查询上海工厂生产订单 PO-2024-001 的物料齐套情况' },
        output: {
          core_concept: 'ProductionOrder',
          related_concepts: ['Material', 'BOM', 'Inventory'],
          entities: [{ id: 'PO-2024-001', type: 'ProductionOrder' }],
          suggested_dimensions: ['material_readiness', 'schedule_status'],
        },
      },
    },
    {
      id: 'mfg-semantic-check',
      name: '语义校验',
      nameEn: 'semantic_check',
      description: '校验数据是否符合制造业业务标准与阈值',
      descriptionEn: 'Validate data against manufacturing business standards and thresholds',
      category: 'governance',
      parameters: [
        { name: 'data_type', type: 'string', description: '数据类型（如 debt_ratio）', required: true, defaultValue: null },
        { name: 'value', type: 'number', description: '数据值', required: true, defaultValue: null },
      ],
      example: {
        input: { data_type: 'debt_ratio', value: 0.75 },
        output: {
          field_definition: '资产负债率 = 总负债 / 总资产',
          threshold: '> 0.7 为高风险',
          result: '高风险',
          data_quality: 'valid',
        },
      },
    },
    {
      id: 'mfg-reason-execute',
      name: '规则推理',
      nameEn: 'reason_execute',
      description: '执行制造业业务规则推理（齐套检查、产能评估等）',
      descriptionEn: 'Execute manufacturing business rule reasoning (kitting check, capacity eval)',
      category: 'behavior',
      parameters: [
        { name: 'rule_set', type: 'string', description: '规则集名称', required: true, defaultValue: null },
        { name: 'facts', type: 'object', description: '事实数据', required: true, defaultValue: null },
      ],
      example: {
        input: { rule_set: 'material_readiness', facts: { order_id: 'PO-2024-001' } },
        output: {
          rule_hit: 'R-KIT-001: 所有关键物料库存 >= BOM 用量',
          result: 'NOT_READY',
          missing: [{ material: 'M-A001', required: 100, available: 60 }],
        },
      },
    },
    {
      id: 'mfg-event-emit',
      name: '事件发布',
      nameEn: 'event_emit',
      description: '发布制造业领域事件（订单下达、技术关闭、完工等）',
      descriptionEn: 'Emit manufacturing domain events (order released, tech closed, finished)',
      category: 'event',
      parameters: [
        { name: 'event_type', type: 'string', description: '事件类型', required: true, defaultValue: null },
        { name: 'payload', type: 'object', description: '事件负载', required: true, defaultValue: null },
      ],
      example: {
        input: { event_type: 'ProductionOrderReleased', payload: { order_id: 'PO-2024-001' } },
        output: { event_id: 'EVT-20240609-001', routed_to: ['MES', 'WMS'], status: 'published' },
      },
    },
    {
      id: 'mfg-api-invoke',
      name: '后端 API',
      nameEn: 'api_invoke',
      description: '调用 ERP/MES/WMS/QMS 后端 API 获取实时数据',
      descriptionEn: 'Invoke ERP/MES/WMS/QMS backend APIs for real-time data',
      category: 'api',
      parameters: [
        { name: 'system', type: 'string', description: '系统名（ERP/MES/WMS/QMS）', required: true, defaultValue: null },
        { name: 'endpoint', type: 'string', description: 'API 端点', required: true, defaultValue: null },
      ],
      example: {
        input: { system: 'MES', endpoint: '/orders/PO-2024-001/status' },
        output: { status: 'IN_PROGRESS', completion: 0.65, station: 'ST-03' },
      },
    },
  ],
  applicableScenarios: ['生产订单进度跟踪', '物料齐套检查', '产能评估', '质量异常分析', '设备 OEE 分析'],
  applicableScenariosEn: ['Production order tracking', 'Material kitting check', 'Capacity evaluation', 'Quality analysis', 'Equipment OEE'],
  exampleQuestions: [
    '查询 PO-2024-001 的物料齐套情况',
    '上海工厂本月产能利用率如何？',
    '近 7 天质量异常事件有哪些？',
  ],
  exampleQuestionsEn: [
    'Check material readiness for PO-2024-001',
    'What is the capacity utilization of Shanghai factory this month?',
    'What quality anomalies occurred in the last 7 days?',
  ],
};

/** 客户服务领域 */
export const CUSTOMER_SERVICE_DOMAIN: DomainOntology = {
  id: 'customer-service',
  name: '客户服务',
  nameEn: 'Customer Service',
  description: '航空客服多 Agent 系统：航班查询、改签、座位、退款、FAQ',
  descriptionEn: 'Airline customer service multi-agent: flight info, rebooking, seats, refunds, FAQ',
  icon: 'Headphones',
  color: 'purple',
  mcpServerUrl: 'mcp://ontology-platform/customer-service',
  tools: [
    {
      id: 'cs-flight-status',
      name: '航班状态',
      nameEn: 'flight_status',
      description: '查询航班实时状态（准点/延误/取消、登机口、起降时间）',
      descriptionEn: 'Query real-time flight status (on-time/delayed/cancelled, gate, times)',
      category: 'api',
      parameters: [
        { name: 'flight_number', type: 'string', description: '航班号', required: true, defaultValue: null },
      ],
      example: {
        input: { flight_number: 'AA123' },
        output: { status: 'DELAYED', new_departure: '14:30', gate: 'B12', delay_minutes: 45 },
      },
    },
    {
      id: 'cs-rebook',
      name: '改签',
      nameEn: 'rebook',
      description: '为受影响的旅客改签到备选航班',
      descriptionEn: 'Rebook affected passengers to alternative flights',
      category: 'behavior',
      parameters: [
        { name: 'confirmation_number', type: 'string', description: 'PNR 确认号', required: true, defaultValue: null },
        { name: 'new_flight', type: 'string', description: '新航班号', required: true, defaultValue: null },
      ],
      example: {
        input: { confirmation_number: 'ABC123', new_flight: 'AA456' },
        output: { status: 'REBOOKED', new_confirmation: 'XYZ789', seat: '14A' },
      },
    },
    {
      id: 'cs-compensation',
      name: '赔偿',
      nameEn: 'compensation',
      description: '为受延误/取消影响的旅客发放代金券',
      descriptionEn: 'Issue compensation vouchers for delayed/cancelled passengers',
      category: 'event',
      parameters: [
        { name: 'confirmation_number', type: 'string', description: 'PNR 确认号', required: true, defaultValue: null },
        { name: 'reason', type: 'string', description: '赔偿原因', required: true, defaultValue: null },
      ],
      example: {
        input: { confirmation_number: 'ABC123', reason: '延误导致错过转机' },
        output: { case_id: 'CMP-001', vouchers: ['HOTEL-200', 'MEAL-50'] },
      },
    },
    {
      id: 'cs-faq',
      name: 'FAQ 查询',
      nameEn: 'faq_lookup',
      description: '查询常见政策问题（行李、座位、WiFi、赔偿）',
      descriptionEn: 'Lookup FAQ policies (baggage, seats, WiFi, compensation)',
      category: 'semantic',
      parameters: [
        { name: 'question', type: 'string', description: '用户问题', required: true, defaultValue: null },
      ],
      example: {
        input: { question: '可以带多大的行李箱？' },
        output: { answer: '经济舱可免费托运 1 件 23kg 以内的行李，三边之和 ≤ 158cm' },
      },
    },
    {
      id: 'cs-guardrail',
      name: '护栏检查',
      nameEn: 'guardrail',
      description: '检查用户输入是否相关（避免越狱与无关问题）',
      descriptionEn: 'Check user input relevance (jailbreak & off-topic prevention)',
      category: 'governance',
      parameters: [
        { name: 'user_input', type: 'string', description: '用户输入', required: true, defaultValue: null },
      ],
      example: {
        input: { user_input: '写一首关于草莓的诗' },
        output: { is_relevant: false, is_safe: true, action: 'REFUSE', reason: '与航空客服无关' },
      },
    },
  ],
  applicableScenarios: ['航班状态查询', '机票改签', '座位变更', '行李/退票/赔偿政策', '客服转接'],
  applicableScenariosEn: ['Flight status', 'Rebooking', 'Seat changes', 'Baggage/refund policies', 'Agent transfer'],
  exampleQuestions: [
    'AA123 航班现在什么状态？',
    '我的航班延误了，能改签吗？',
    '经济舱可以带多少行李？',
  ],
  exampleQuestionsEn: [
    'What is the current status of flight AA123?',
    'My flight is delayed, can I rebook?',
    'How much baggage can I bring in economy?',
  ],
};

/** 供应链领域 */
export const SUPPLY_CHAIN_DOMAIN: DomainOntology = {
  id: 'supply-chain',
  name: '供应链',
  nameEn: 'Supply Chain',
  description: '供应商管理、采购订单、库存、物流、风险评估',
  descriptionEn: 'Supplier management, purchase orders, inventory, logistics, risk assessment',
  icon: 'Truck',
  color: 'green',
  mcpServerUrl: 'mcp://ontology-platform/supply-chain',
  tools: [
    {
      id: 'sc-supplier-risk',
      name: '供应商风险',
      nameEn: 'supplier_risk',
      description: '评估供应商风险等级（财务/交付/合规）',
      descriptionEn: 'Evaluate supplier risk level (financial/delivery/compliance)',
      category: 'governance',
      parameters: [
        { name: 'supplier_id', type: 'string', description: '供应商 ID', required: true, defaultValue: null },
      ],
      example: {
        input: { supplier_id: 'SUP-001' },
        output: { risk_level: 'MEDIUM', financial: 0.6, delivery: 0.3, compliance: 0.1 },
      },
    },
    {
      id: 'sc-inventory',
      name: '库存查询',
      nameEn: 'inventory_check',
      description: '查询物料库存量与安全库存对比',
      descriptionEn: 'Query material inventory vs safety stock',
      category: 'api',
      parameters: [
        { name: 'material_id', type: 'string', description: '物料 ID', required: true, defaultValue: null },
      ],
      example: {
        input: { material_id: 'M-A001' },
        output: { current: 60, safety_stock: 50, status: 'ABOVE_SAFETY' },
      },
    },
    {
      id: 'sc-purchase-order',
      name: '采购订单',
      nameEn: 'purchase_order',
      description: '创建/查询采购订单',
      descriptionEn: 'Create/query purchase orders',
      category: 'behavior',
      parameters: [
        { name: 'action', type: 'string', description: 'create/query', required: true, defaultValue: 'query' },
        { name: 'po_id', type: 'string', description: '订单 ID', required: false, defaultValue: null },
      ],
      example: {
        input: { action: 'query', po_id: 'PO-2024-001' },
        output: { status: 'IN_TRANSIT', eta: '2024-06-15', supplier: 'SUP-001' },
      },
    },
    {
      id: 'sc-event-subscribe',
      name: '事件订阅',
      nameEn: 'event_subscribe',
      description: '订阅供应链事件（延迟、缺货、风险升级）',
      descriptionEn: 'Subscribe to supply chain events (delay, stockout, risk escalation)',
      category: 'event',
      parameters: [
        { name: 'event_types', type: 'array', description: '事件类型列表', required: true, defaultValue: null },
        { name: 'callback', type: 'string', description: '回调地址', required: true, defaultValue: null },
      ],
      example: {
        input: { event_types: ['DELAY', 'STOCKOUT'], callback: '/webhook' },
        output: { subscription_id: 'SUB-001', status: 'ACTIVE' },
      },
    },
  ],
  applicableScenarios: ['供应商风险评估', '库存预警', '采购订单跟踪', '物流延误预警'],
  applicableScenariosEn: ['Supplier risk', 'Inventory alert', 'PO tracking', 'Logistics delay'],
  exampleQuestions: [
    '供应商 SUP-001 的风险等级是多少？',
    '物料 M-A001 当前库存是否充足？',
    'PO-2024-001 的物流状态？',
  ],
  exampleQuestionsEn: [
    'What is the risk level of supplier SUP-001?',
    'Is the current inventory of M-A001 sufficient?',
    'What is the logistics status of PO-2024-001?',
  ],
};

/** 所有领域 */
export const ALL_DOMAINS: DomainOntology[] = [
  MANUFACTURING_DOMAIN,
  CUSTOMER_SERVICE_DOMAIN,
  SUPPLY_CHAIN_DOMAIN,
];

/** 按 ID 获取领域 */
export function getDomainById(id: string): DomainOntology | undefined {
  return ALL_DOMAINS.find((d) => d.id === id);
}

/** 按工具 ID 在所有领域中找到工具 */
export function findToolById(
  toolId: string,
): { domain: DomainOntology; tool: DomainOntology['tools'][number] } | undefined {
  for (const domain of ALL_DOMAINS) {
    const tool = domain.tools.find((t) => t.id === toolId);
    if (tool) return { domain, tool };
  }
  return undefined;
}
