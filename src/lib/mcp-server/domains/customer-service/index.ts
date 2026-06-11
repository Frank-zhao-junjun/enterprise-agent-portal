/**
 * 客服领域 MCP Server
 * 覆盖：语义解析、工单处理、事件追踪、服务治理、API 集成
 */

import { MCPServer } from '../../server';
import { MCPToolResult } from '../../protocol';
import { customerServiceData } from './data';

// ============ 工具实现 ============

async function ontologyIntentParse(args: Record<string, unknown>): Promise<MCPToolResult> {
  const query = String(args.query || '');

  const entities: string[] = [];
  const intents: string[] = [];
  const sentiment = /差|烂|不满|投诉|退款|退货/.test(query) ? 'negative'
    : /好|满意|感谢|赞/.test(query) ? 'positive' : 'neutral';

  // 客户识别
  for (const c of customerServiceData.customers) {
    if (query.includes(c.name) || query.includes(c.id)) {
      entities.push(`客户:${c.name}(${c.tier})`);
    }
  }

  // 订单识别
  const orderMatch = query.match(/ORD-\d+/);
  if (orderMatch) {
    const order = customerServiceData.orders.find((o) => o.id === orderMatch[0]);
    if (order) entities.push(`订单:${order.id}(${order.status})`);
  }

  // 意图识别
  if (/退款|退货|换货/.test(query)) intents.push('退换货处理');
  if (/投诉|不满|差评/.test(query)) intents.push('投诉处理');
  if (/查询|进度|物流|到哪/.test(query)) intents.push('订单查询');
  if (/价格|优惠|折扣/.test(query)) intents.push('价格咨询');
  if (/使用|操作|教程|怎么/.test(query)) intents.push('使用指导');
  if (/故障|坏了|不工作|无法/.test(query)) intents.push('故障排查');
  if (intents.length === 0) intents.push('综合咨询');

  return {
    content: JSON.stringify({
      query,
      entities,
      intents,
      sentiment,
      suggestedActions: intents.map((i) => `触发${i}流程`),
      timestamp: new Date().toISOString(),
    }),
  };
}

async function ontologyPlanExecute(args: Record<string, unknown>): Promise<MCPToolResult> {
  const taskType = String(args.task_type || '');
  const result: Record<string, unknown> = { taskType, timestamp: new Date().toISOString() };

  switch (taskType) {
    case 'create_ticket': {
      const customerId = String(args.customer_id || '');
      const customer = customerServiceData.customers.find((c) => c.id === customerId) || customerServiceData.customers[0];
      const ticketId = `TK-${Date.now()}`;
      result.ticket = {
        id: ticketId,
        customerId: customer.id,
        customerName: customer.name,
        tier: customer.tier,
        status: 'created',
        assignTo: customer.tier === 'VIP' ? '高级客服组' : '普通客服组',
        sla: customer.tier === 'VIP' ? '2小时内响应' : '24小时内响应',
      };
      break;
    }

    case 'route_ticket': {
      const tickets = customerServiceData.tickets.filter((t) => t.status === 'open' || t.status === 'pending');
      result.routing = tickets.map((t) => {
        const customer = customerServiceData.customers.find((c) => c.id === t.customerId);
        return {
          ticketId: t.id,
          customerTier: customer?.tier || 'normal',
          assignTo: customer?.tier === 'VIP' ? '高级客服组' : '普通客服组',
          priority: t.priority,
          slaDeadline: t.slaDeadline,
        };
      });
      result.summary = `${tickets.length} 个待处理工单，${tickets.filter((t) => t.priority === 'high').length} 个高优先级`;
      break;
    }

    case 'auto_respond': {
      const question = String(args.question || '');
      const faqMatch = customerServiceData.faqs.find((f) => {
        const keywords = f.keywords.split(',').map((k) => k.trim());
        return keywords.some((k) => k.length > 0 && question.includes(k));
      });
      result.autoResponse = faqMatch
        ? { found: true, answer: faqMatch.answer, confidence: 0.92, source: 'FAQ' }
        : { found: false, suggestion: '转人工客服处理', reason: '未匹配到标准FAQ' };
      break;
    }

    default:
      result.plan = '未知任务类型，请指定: create_ticket / route_ticket / auto_respond';
  }

  return { content: JSON.stringify(result) };
}

async function ontologyEventLog(args: Record<string, unknown>): Promise<MCPToolResult> {
  const eventType = String(args.event_type || 'all');
  const limit = Number(args.limit) || 10;

  let events = [...customerServiceData.events];

  if (eventType !== 'all') {
    events = events.filter((e) => e.type === eventType);
  }

  events = events.slice(0, limit);

  return {
    content: JSON.stringify({
      total: events.length,
      events,
      timestamp: new Date().toISOString(),
    }),
  };
}

async function ontologyGovernanceCheck(args: Record<string, unknown>): Promise<MCPToolResult> {
  const checkType = String(args.check_type || 'sla');
  const result: Record<string, unknown> = { checkType, timestamp: new Date().toISOString() };

  switch (checkType) {
    case 'sla':
      result.checks = customerServiceData.tickets.map((t) => {
        const customer = customerServiceData.customers.find((c) => c.id === t.customerId);
        const slaHours = customer?.tier === 'VIP' ? 2 : 24;
        const created = new Date(t.createdAt);
        const now = new Date();
        const elapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return {
          ticketId: t.id,
          customerTier: customer?.tier,
          slaHours,
          elapsed: `${elapsed.toFixed(1)}h`,
          status: elapsed > slaHours ? 'SLA违规' : '正常',
        };
      });
      result.summary = `SLA达标率: ${((customerServiceData.tickets.filter((t) => t.status !== 'sla_breach').length / customerServiceData.tickets.length) * 100).toFixed(1)}%`;
      break;

    case 'privacy':
      result.checks = [
        { item: '客户数据加密存储', status: '合规', detail: 'AES-256 加密' },
        { item: '访问权限控制', status: '合规', detail: '基于角色的访问控制' },
        { item: '数据保留策略', status: '待优化', detail: '部分历史数据保留超期' },
        { item: '数据脱敏', status: '合规', detail: '日志中敏感信息已脱敏' },
      ];
      break;

    case 'service_quality':
      result.checks = [
        { metric: '平均响应时间', value: '3.2min', target: '<5min', status: '达标' },
        { metric: '首次解决率', value: '78%', target: '>75%', status: '达标' },
        { metric: '客户满意度', value: '4.3/5', target: '>4.0', status: '达标' },
        { metric: '工单积压', value: '12', target: '<20', status: '达标' },
      ];
      break;

    default:
      result.checks = '未知检查类型，请指定: sla / privacy / service_quality';
  }

  return { content: JSON.stringify(result) };
}

async function ontologyApiConnect(args: Record<string, unknown>): Promise<MCPToolResult> {
  const system = String(args.system || '');
  const result: Record<string, unknown> = { system, timestamp: new Date().toISOString() };

  switch (system) {
    case 'crm':
      result.connected = true;
      result.data = {
        totalCustomers: customerServiceData.customers.length,
        vipCustomers: customerServiceData.customers.filter((c) => c.tier === 'VIP').length,
        activeTickets: customerServiceData.tickets.filter((t) => t.status === 'open').length,
        systemStatus: 'online',
        version: 'Salesforce CRM v58',
      };
      break;

    case 'ticketing':
      result.connected = true;
      result.data = {
        openTickets: customerServiceData.tickets.filter((t) => t.status === 'open').length,
        pendingTickets: customerServiceData.tickets.filter((t) => t.status === 'pending').length,
        resolvedToday: customerServiceData.tickets.filter((t) => t.status === 'resolved').length,
        systemStatus: 'online',
      };
      break;

    case 'knowledge_base':
      result.connected = true;
      result.data = {
        totalArticles: 2340,
        faqCount: customerServiceData.faqs.length,
        lastUpdated: '2025-06-25',
        systemStatus: 'online',
      };
      break;

    default:
      result.connected = false;
      result.data = { error: `未知系统: ${system}，可选: crm / ticketing / knowledge_base` };
  }

  return { content: JSON.stringify(result) };
}

// ============ Server 工厂 ============

export function createCustomerServiceServer(): MCPServer {
  const server = new MCPServer({
    name: 'customer-service-ontology-server',
    version: '1.0.0',
    description: '客服领域本体 MCP Server',
  });

  server.registerTools([
    {
      definition: {
        name: 'ontology_intent_parse',
        description: '解析用户意图，识别客服场景中的实体、意图和情感',
        category: 'semantic',
        parameters: {
          query: { type: 'string', description: '用户查询文本', required: true },
        },
      },
      handler: ontologyIntentParse,
    },
    {
      definition: {
        name: 'ontology_plan_execute',
        description: '执行客服任务（创建工单、路由分配、自动回复）',
        category: 'behavior',
        parameters: {
          task_type: {
            type: 'string',
            description: '任务类型',
            required: true,
            enum: ['create_ticket', 'route_ticket', 'auto_respond'],
          },
          customer_id: { type: 'string', description: '客户ID（创建工单时必填）', required: false },
          question: { type: 'string', description: '用户问题（自动回复时必填）', required: false },
        },
      },
      handler: ontologyPlanExecute,
    },
    {
      definition: {
        name: 'ontology_event_log',
        description: '查询客服事件流（工单创建、SLA告警、客户投诉）',
        category: 'event',
        parameters: {
          event_type: {
            type: 'string',
            description: '事件类型过滤',
            required: false,
            enum: ['ticket_created', 'sla_warning', 'complaint', 'all'],
          },
          limit: { type: 'number', description: '返回条数', required: false },
        },
      },
      handler: ontologyEventLog,
    },
    {
      definition: {
        name: 'ontology_governance_check',
        description: '服务治理检查（SLA达标、隐私合规、服务质量）',
        category: 'governance',
        parameters: {
          check_type: {
            type: 'string',
            description: '检查类型',
            required: true,
            enum: ['sla', 'privacy', 'service_quality'],
          },
        },
      },
      handler: ontologyGovernanceCheck,
    },
    {
      definition: {
        name: 'ontology_api_connect',
        description: '连接后端客服系统（CRM/工单/知识库）',
        category: 'api',
        parameters: {
          system: {
            type: 'string',
            description: '目标系统',
            required: true,
            enum: ['crm', 'ticketing', 'knowledge_base'],
          },
          action: { type: 'string', description: '操作类型', required: false },
        },
      },
      handler: ontologyApiConnect,
    },
  ]);

  return server;
}
