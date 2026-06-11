/**
 * 制造业领域 MCP Server
 * 覆盖：语义解析、生产排程、事件监控、合规治理、API 集成
 */

import { MCPServer } from '../../server';
import { MCPToolResult } from '../../protocol';
import { manufacturingData } from './data';

// ============ 工具实现 ============

async function ontologyIntentParse(args: Record<string, unknown>): Promise<MCPToolResult> {
  const query = String(args.query || '');

  // 语义解析：识别实体和意图
  const entities: string[] = [];
  const intents: string[] = [];

  // 产线识别
  for (const line of manufacturingData.productionLines) {
    if (query.includes(line.id) || query.includes(line.name)) {
      entities.push(`产线:${line.name}`);
    }
  }

  // 设备识别
  for (const eq of manufacturingData.equipment) {
    if (query.includes(eq.id) || query.includes(eq.name)) {
      entities.push(`设备:${eq.name}(${eq.status})`);
    }
  }

  // 产品识别
  for (const prod of manufacturingData.products) {
    if (query.includes(prod.name)) {
      entities.push(`产品:${prod.name}`);
    }
  }

  // 意图识别
  if (/产量|生产|达标|完成/.test(query)) intents.push('产量查询');
  if (/质量|合格|不良|缺陷/.test(query)) intents.push('质量查询');
  if (/设备|故障|维护|维修/.test(query)) intents.push('设备状态');
  if (/排程|计划|排产/.test(query)) intents.push('排程查询');
  if (/告警|异常|报警/.test(query)) intents.push('告警查询');
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
    case 'production_schedule':
      result.plan = manufacturingData.productionLines.map((line) => ({
        line: line.name,
        target: line.dailyTarget,
        current: line.todayOutput,
        progress: `${Math.round((line.todayOutput / line.dailyTarget) * 100)}%`,
        status: line.todayOutput >= line.dailyTarget ? '达标' : '进行中',
      }));
      result.summary = `今日 ${manufacturingData.productionLines.length} 条产线运行中，${manufacturingData.productionLines.filter((l) => l.todayOutput >= l.dailyTarget).length} 条已达标`;
      break;

    case 'quality_inspection':
      result.plan = manufacturingData.qualityMetrics.map((m) => ({
        product: m.product,
        passRate: m.passRate,
        defectRate: m.defectRate,
        status: m.passRate >= 98 ? '合格' : '需关注',
      }));
      result.summary = `质检总览：平均合格率 ${(
        manufacturingData.qualityMetrics.reduce((s, m) => s + m.passRate, 0) /
        manufacturingData.qualityMetrics.length
      ).toFixed(1)}%`;
      break;

    case 'maintenance_plan':
      result.plan = manufacturingData.equipment
        .filter((e) => e.status !== 'running')
        .map((e) => ({
          equipment: e.name,
          status: e.status,
          nextMaintenance: e.nextMaintenance,
          priority: e.status === 'fault' ? '紧急' : '普通',
        }));
      result.summary = `${manufacturingData.equipment.filter((e) => e.status === 'fault').length} 台设备故障，${manufacturingData.equipment.filter((e) => e.status === 'maintenance').length} 台维护中`;
      break;

    default:
      result.plan = '未知任务类型，请指定: production_schedule / quality_inspection / maintenance_plan';
  }

  return { content: JSON.stringify(result) };
}

async function ontologyEventLog(args: Record<string, unknown>): Promise<MCPToolResult> {
  const eventType = String(args.event_type || 'all');
  const limit = Number(args.limit) || 10;

  let events = [...manufacturingData.events];

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
  const checkType = String(args.check_type || 'compliance');
  const result: Record<string, unknown> = { checkType, timestamp: new Date().toISOString() };

  switch (checkType) {
    case 'compliance':
      result.checks = [
        { item: 'ISO 9001 质量管理体系', status: '合规', lastAudit: '2025-05-15' },
        { item: 'ISO 14001 环境管理体系', status: '合规', lastAudit: '2025-04-20' },
        { item: '安全生产标准化', status: '合规', lastAudit: '2025-06-01' },
        { item: '设备安全年检', status: '部分待检', detail: 'CNC-003 待年检', lastAudit: '2024-12-10' },
      ];
      result.summary = '3/4 合规，1 项待处理';
      break;

    case 'quality_standard':
      result.checks = manufacturingData.qualityMetrics.map((m) => ({
        product: m.product,
        passRate: m.passRate,
        standard: m.standard,
        compliant: m.passRate >= m.standard,
      }));
      result.summary = `${manufacturingData.qualityMetrics.filter((m) => m.passRate >= m.standard).length}/${manufacturingData.qualityMetrics.length} 达标`;
      break;

    case 'safety':
      result.checks = [
        { item: '消防设施检查', status: '正常', nextCheck: '2025-07-15' },
        { item: '危险品存储', status: '正常', nextCheck: '2025-07-01' },
        { item: '人员安全培训', status: '待执行', nextCheck: '2025-06-30', detail: '新入职 3 人未完成培训' },
        { item: '设备安全防护', status: '异常', detail: '冲压机 A2 安全光幕故障', nextCheck: '立即' },
      ];
      result.summary = '2/4 正常，2 项需处理';
      break;

    default:
      result.checks = '未知检查类型，请指定: compliance / quality_standard / safety';
  }

  return { content: JSON.stringify(result) };
}

async function ontologyApiConnect(args: Record<string, unknown>): Promise<MCPToolResult> {
  const system = String(args.system || '');
  const action = String(args.action || 'status');
  const result: Record<string, unknown> = { system, action, timestamp: new Date().toISOString() };

  switch (system) {
    case 'mes':
      result.connected = true;
      result.data = {
        workOrders: 47,
        activeOrders: 12,
        completedToday: 8,
        systemStatus: 'online',
        version: 'MES v4.2.1',
      };
      break;

    case 'scada':
      result.connected = true;
      result.data = {
        monitoredDevices: manufacturingData.equipment.length,
        onlineDevices: manufacturingData.equipment.filter((e) => e.status === 'running').length,
        alerts: manufacturingData.equipment.filter((e) => e.status === 'fault').length,
        systemStatus: 'online',
      };
      break;

    case 'erp':
      result.connected = true;
      result.data = {
        pendingPO: 15,
        completedPO: 230,
        inventoryItems: 1250,
        systemStatus: 'online',
        version: 'SAP S/4HANA',
      };
      break;

    default:
      result.connected = false;
      result.data = { error: `未知系统: ${system}，可选: mes / scada / erp` };
  }

  return { content: JSON.stringify(result) };
}

// ============ Server 工厂 ============

export function createManufacturingServer(): MCPServer {
  const server = new MCPServer({
    name: 'manufacturing-ontology-server',
    version: '1.0.0',
    description: '制造业领域本体 MCP Server',
  });

  server.registerTools([
    {
      definition: {
        name: 'ontology_intent_parse',
        description: '解析用户意图，识别制造场景中的实体和语义',
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
        description: '制定并执行制造任务计划（排程、质检、维护）',
        category: 'behavior',
        parameters: {
          task_type: {
            type: 'string',
            description: '任务类型',
            required: true,
            enum: ['production_schedule', 'quality_inspection', 'maintenance_plan'],
          },
        },
      },
      handler: ontologyPlanExecute,
    },
    {
      definition: {
        name: 'ontology_event_log',
        description: '查询生产事件流（质量告警、设备异常、维护到期）',
        category: 'event',
        parameters: {
          event_type: {
            type: 'string',
            description: '事件类型过滤',
            required: false,
            enum: ['quality_alert', 'equipment_fault', 'maintenance_due', 'all'],
          },
          limit: { type: 'number', description: '返回条数', required: false },
        },
      },
      handler: ontologyEventLog,
    },
    {
      definition: {
        name: 'ontology_governance_check',
        description: '合规治理检查（质量标准、安全规范、体系审核）',
        category: 'governance',
        parameters: {
          check_type: {
            type: 'string',
            description: '检查类型',
            required: true,
            enum: ['compliance', 'quality_standard', 'safety'],
          },
        },
      },
      handler: ontologyGovernanceCheck,
    },
    {
      definition: {
        name: 'ontology_api_connect',
        description: '连接后端制造系统（MES/SCADA/ERP）',
        category: 'api',
        parameters: {
          system: {
            type: 'string',
            description: '目标系统',
            required: true,
            enum: ['mes', 'scada', 'erp'],
          },
          action: { type: 'string', description: '操作类型', required: false },
        },
      },
      handler: ontologyApiConnect,
    },
  ]);

  return server;
}
