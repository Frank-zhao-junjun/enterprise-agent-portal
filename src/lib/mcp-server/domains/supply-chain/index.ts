/**
 * 供应链领域 MCP Server
 * 覆盖：语义解析、库存/物流操作、事件追踪、合规治理、API 集成
 */

import { MCPServer } from '../../server';
import { MCPToolResult } from '../../protocol';
import { supplyChainData } from './data';

// ============ 工具实现 ============

async function ontologyIntentParse(args: Record<string, unknown>): Promise<MCPToolResult> {
  const query = String(args.query || '');

  const entities: string[] = [];
  const intents: string[] = [];

  // 仓库识别
  for (const wh of supplyChainData.warehouses) {
    if (query.includes(wh.name) || query.includes(wh.id)) {
      entities.push(`仓库:${wh.name}(${wh.location})`);
    }
  }

  // 供应商识别
  for (const sup of supplyChainData.suppliers) {
    if (query.includes(sup.name)) {
      entities.push(`供应商:${sup.name}(${sup.rating}星)`);
    }
  }

  // 物料识别
  for (const mat of supplyChainData.inventory) {
    if (query.includes(mat.name)) {
      entities.push(`物料:${mat.name}(库存${mat.quantity}${mat.unit})`);
    }
  }

  // 意图识别
  if (/库存|存量|余量|缺货/.test(query)) intents.push('库存查询');
  if (/物流|运输|发货|配送|延迟/.test(query)) intents.push('物流管理');
  if (/供应商|采购|供货/.test(query)) intents.push('供应商管理');
  if (/风险|预警|异常/.test(query)) intents.push('风险评估');
  if (/订单|下达|排产/.test(query)) intents.push('订单管理');
  if (intents.length === 0) intents.push('综合查询');

  return {
    content: JSON.stringify({
      query,
      entities,
      intents,
      suggestedActions: intents.map((i) => `执行${i}相关操作`),
      timestamp: new Date().toISOString(),
    }),
  };
}

async function ontologyPlanExecute(args: Record<string, unknown>): Promise<MCPToolResult> {
  const taskType = String(args.task_type || '');
  const result: Record<string, unknown> = { taskType, timestamp: new Date().toISOString() };

  switch (taskType) {
    case 'inventory_check': {
      const lowStock = supplyChainData.inventory.filter((i) => i.quantity <= i.reorderPoint);
      result.inventory = {
        totalItems: supplyChainData.inventory.length,
        lowStockItems: lowStock.length,
        items: lowStock.map((i) => ({
          name: i.name,
          current: i.quantity,
          unit: i.unit,
          reorderPoint: i.reorderPoint,
          status: i.quantity <= i.safetyStock ? '紧急' : '预警',
          suggestedOrder: i.reorderPoint * 2 - i.quantity,
        })),
      };
      break;
    }

    case 'logistics_schedule': {
      const shipments = supplyChainData.shipments.map((s) => ({
        id: s.id,
        origin: s.origin,
        destination: s.destination,
        status: s.status,
        eta: s.eta,
        delay: s.delayHours ? `延迟${s.delayHours}小时` : '正常',
        carrier: s.carrier,
      }));
      result.shipments = shipments;
      result.summary = {
        total: shipments.length,
        inTransit: shipments.filter((s) => s.status === 'in_transit').length,
        delayed: shipments.filter((s) => s.delay !== '正常').length,
        delivered: shipments.filter((s) => s.status === 'delivered').length,
      };
      break;
    }

    case 'supplier_review': {
      result.suppliers = supplyChainData.suppliers.map((s) => ({
        name: s.name,
        rating: s.rating,
        onTimeDelivery: s.onTimeDelivery,
        qualityScore: s.qualityScore,
        status: s.rating >= 4 && s.onTimeDelivery >= 95 ? '优质' : s.rating >= 3 ? '合格' : '待改善',
      }));
      result.summary = `供应商 ${supplyChainData.suppliers.length} 家，优质 ${supplyChainData.suppliers.filter((s) => s.rating >= 4).length} 家`;
      break;
    }

    case 'risk_management': {
      const risks = supplyChainData.risks.filter((r) => r.level === 'high' || r.level === 'critical');
      result.risks = risks.map((r) => ({
        type: r.type,
        description: r.description,
        level: r.level,
        affectedSuppliers: r.affectedSuppliers,
        mitigation: r.mitigation,
      }));
      result.summary = `${risks.length} 个高风险项需要关注`;
      break;
    }

    default:
      result.plan = '未知任务类型，请指定: inventory_check / logistics_schedule / supplier_review / risk_management';
  }

  return { content: JSON.stringify(result) };
}

async function supplyChainEventLog(args: Record<string, unknown>): Promise<MCPToolResult> {
  const eventType = String(args.event_type || 'all');
  const limit = Number(args.limit) || 10;

  let events = [...supplyChainData.events];

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

async function supplyChainGovernanceCheck(args: Record<string, unknown>): Promise<MCPToolResult> {
  const checkType = String(args.check_type || 'supplier_compliance');
  const result: Record<string, unknown> = { checkType, timestamp: new Date().toISOString() };

  switch (checkType) {
    case 'supplier_compliance':
      result.checks = supplyChainData.suppliers.map((s) => ({
        name: s.name,
        complianceStatus: s.complianceStatus,
        lastAudit: s.lastAudit,
        certifications: s.certifications,
      }));
      result.summary = `${supplyChainData.suppliers.filter((s) => s.complianceStatus === 'compliant').length}/${supplyChainData.suppliers.length} 合规`;
      break;

    case 'trade_regulation':
      result.checks = [
        { regulation: '进出口管制合规', status: '合规', lastReview: '2025-06-01' },
        { regulation: '关税申报', status: '合规', lastReview: '2025-05-15' },
        { regulation: '原产地证明', status: '待更新', detail: '3 份证明即将过期', lastReview: '2025-04-20' },
        { regulation: '贸易制裁筛查', status: '合规', lastReview: '2025-06-10' },
      ];
      break;

    case 'sustainability':
      result.checks = [
        { metric: '碳排放追踪', value: '同比降低12%', target: '年降10%', status: '达标' },
        { metric: '绿色采购比例', value: '35%', target: '>30%', status: '达标' },
        { metric: '供应商ESG评分', value: 'B+', target: '>B', status: '达标' },
        { metric: '包装回收率', value: '62%', target: '>50%', status: '达标' },
      ];
      break;

    default:
      result.checks = '未知检查类型，请指定: supplier_compliance / trade_regulation / sustainability';
  }

  return { content: JSON.stringify(result) };
}

async function supplyChainApiConnect(args: Record<string, unknown>): Promise<MCPToolResult> {
  const system = String(args.system || '');
  const result: Record<string, unknown> = { system, timestamp: new Date().toISOString() };

  switch (system) {
    case 'erp':
      result.connected = true;
      result.data = {
        purchaseOrders: supplyChainData.purchaseOrders.length,
        pendingPO: supplyChainData.purchaseOrders.filter((p) => p.status === 'pending').length,
        inventoryItems: supplyChainData.inventory.length,
        systemStatus: 'online',
        version: 'SAP S/4HANA',
      };
      break;

    case 'wms':
      result.connected = true;
      result.data = {
        warehouses: supplyChainData.warehouses.length,
        totalSKU: supplyChainData.inventory.length,
        utilization: supplyChainData.warehouses.map((w) => ({
          name: w.name,
          utilization: w.utilization,
        })),
        systemStatus: 'online',
      };
      break;

    case 'tms':
      result.connected = true;
      result.data = {
        activeShipments: supplyChainData.shipments.filter((s) => s.status === 'in_transit').length,
        delayedShipments: supplyChainData.shipments.filter((s) => s.delayHours).length,
        onTimeRate: '94.2%',
        systemStatus: 'online',
      };
      break;

    default:
      result.connected = false;
      result.data = { error: `未知系统: ${system}，可选: erp / wms / tms` };
  }

  return { content: JSON.stringify(result) };
}

// ============ Server 工厂 ============

export function createSupplyChainServer(): MCPServer {
  const server = new MCPServer({
    name: 'supply-chain-ontology-server',
    version: '1.0.0',
    description: '供应链领域本体 MCP Server',
  });

  server.registerTools([
    {
      definition: {
        name: 'ontology_intent_parse',
        description: '解析用户意图，识别供应链场景中的实体和语义',
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
        description: '执行供应链任务（库存检查、物流调度、供应商评审、风险管理）',
        category: 'behavior',
        parameters: {
          task_type: {
            type: 'string',
            description: '任务类型',
            required: true,
            enum: ['inventory_check', 'logistics_schedule', 'supplier_review', 'risk_management'],
          },
        },
      },
      handler: ontologyPlanExecute,
    },
    {
      definition: {
        name: 'supply_chain_event_log',
        description: '查询供应链事件流（物流延迟、库存告警、供应商变更）',
        category: 'event',
        parameters: {
          event_type: {
            type: 'string',
            description: '事件类型过滤',
            required: false,
            enum: ['shipment_delay', 'inventory_alert', 'supplier_change', 'all'],
          },
          limit: { type: 'number', description: '返回条数', required: false },
        },
      },
      handler: supplyChainEventLog,
    },
    {
      definition: {
        name: 'supply_chain_governance_check',
        description: '供应链合规治理（供应商合规、贸易法规、可持续性）',
        category: 'governance',
        parameters: {
          check_type: {
            type: 'string',
            description: '检查类型',
            required: true,
            enum: ['supplier_compliance', 'trade_regulation', 'sustainability'],
          },
        },
      },
      handler: supplyChainGovernanceCheck,
    },
    {
      definition: {
        name: 'supply_chain_api_connect',
        description: '连接后端供应链系统（ERP/WMS/TMS）',
        category: 'api',
        parameters: {
          system: {
            type: 'string',
            description: '目标系统',
            required: true,
            enum: ['erp', 'wms', 'tms'],
          },
          action: { type: 'string', description: '操作类型', required: false },
        },
      },
      handler: supplyChainApiConnect,
    },
  ]);

  return server;
}
