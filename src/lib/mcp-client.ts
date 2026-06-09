// === MCP Client — 抽象传输层 + Mock 实现 ===
import type { MCPTransport, MCPTool, MCPToolResult, MCPToolParameter } from '@/types/ontology';

/** MCP 客户端接口 */
export interface IMCPClient {
  callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult>;
  listTools(): MCPTool[];
  getTransport(): MCPTransport;
}

// ============================================================
// Mock Transport — 硬编码结果，用于开发和演示
// ============================================================

const MOCK_DELAY_MS = 300;

/** 制造业 mock 结果 */
const MANUFACTURING_RESULTS: Record<string, () => MCPToolResult> = {
  ontology_intent_parse: () => ({
    success: true,
    data: {
      intent: 'query_production_status',
      entities: { product: 'widget-A', line: 'L3' },
      confidence: 0.92,
      semanticType: 'behavior',
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_plan_execute: () => ({
    success: true,
    data: {
      plan: ['check_inventory', 'verify_quality', 'schedule_production'],
      status: 'executing',
      progress: 0.6,
      estimatedCompletion: '2025-07-15T14:30:00Z',
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_event_log: () => ({
    success: true,
    data: {
      events: [
        { type: 'quality_alert', severity: 'warning', message: 'Batch #2891 deviation detected', timestamp: Date.now() - 3600000 },
        { type: 'maintenance_due', severity: 'info', message: 'Machine M7 maintenance scheduled', timestamp: Date.now() - 7200000 },
      ],
      total: 2,
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_rule_validate: () => ({
    success: true,
    data: {
      valid: true,
      rulesChecked: 4,
      violations: [],
      governanceScore: 95,
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_api_call: () => ({
    success: true,
    data: {
      endpoint: '/api/mes/production/status',
      method: 'GET',
      response: { line: 'L3', status: 'running', output: 1247, target: 1500 },
      latency: 45,
    },
    duration: MOCK_DELAY_MS,
  }),
};

/** 客服 mock 结果 */
const CUSTOMER_SERVICE_RESULTS: Record<string, () => MCPToolResult> = {
  ontology_intent_parse: () => ({
    success: true,
    data: {
      intent: 'flight_delay_compensation',
      entities: { flight: 'CA1234', date: '2025-07-10' },
      confidence: 0.88,
      semanticType: 'event',
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_rule_validate: () => ({
    success: true,
    data: {
      valid: true,
      rulesChecked: 3,
      violations: [],
      governanceScore: 100,
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_event_log: () => ({
    success: true,
    data: {
      events: [
        { type: 'flight_delay', severity: 'high', message: 'CA1234 delayed 3h due to weather', timestamp: Date.now() - 5400000 },
        { type: 'compensation_eligible', severity: 'info', message: 'Passenger eligible for voucher', timestamp: Date.now() - 3600000 },
      ],
      total: 2,
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_api_call: () => ({
    success: true,
    data: {
      endpoint: '/api/booking/lookup',
      method: 'POST',
      response: { confirmation: 'ABC123', status: 'delayed', seat: '12A' },
      latency: 120,
    },
    duration: MOCK_DELAY_MS,
  }),
};

/** 供应链 mock 结果 */
const SUPPLY_CHAIN_RESULTS: Record<string, () => MCPToolResult> = {
  ontology_intent_parse: () => ({
    success: true,
    data: {
      intent: 'supply_risk_assessment',
      entities: { supplier: 'TechParts Inc', region: 'SEA' },
      confidence: 0.85,
      semanticType: 'governance',
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_plan_execute: () => ({
    success: true,
    data: {
      plan: ['assess_supplier_risk', 'check_alternatives', 'update_procurement'],
      status: 'planning',
      progress: 0.3,
      estimatedCompletion: '2025-07-16T09:00:00Z',
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_rule_validate: () => ({
    success: true,
    data: {
      valid: true,
      rulesChecked: 5,
      violations: [{ rule: 'dual_source_required', severity: 'warning', detail: 'Supplier TechParts Inc is single-source for component X' }],
      governanceScore: 72,
    },
    duration: MOCK_DELAY_MS,
  }),
  ontology_api_call: () => ({
    success: true,
    data: {
      endpoint: '/api/erp/supplier/status',
      method: 'GET',
      response: { supplier: 'TechParts Inc', onTime: 0.82, qualityScore: 91 },
      latency: 200,
    },
    duration: MOCK_DELAY_MS,
  }),
};

/** 通用 mock 结果 */
const GENERAL_RESULTS: Record<string, () => MCPToolResult> = {
  ontology_intent_parse: () => ({
    success: true,
    data: { intent: 'general_query', entities: {}, confidence: 0.7, semanticType: 'semantic' },
    duration: MOCK_DELAY_MS,
  }),
};

/** 按领域分发 mock 结果 */
const DOMAIN_RESULTS: Record<string, Record<string, () => MCPToolResult>> = {
  manufacturing: MANUFACTURING_RESULTS,
  'customer-service': CUSTOMER_SERVICE_RESULTS,
  'supply-chain': SUPPLY_CHAIN_RESULTS,
  general: GENERAL_RESULTS,
};

export class MockMCPClient implements IMCPClient {
  private transport: MCPTransport;
  private tools: MCPTool[];
  private domainId: string;

  constructor(domainId: string, transport: MCPTransport, tools: MCPTool[]) {
    this.domainId = domainId;
    this.transport = transport;
    this.tools = tools;
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    // Simulate network delay
    const delay = MOCK_DELAY_MS + Math.random() * 200;
    await new Promise((r) => setTimeout(r, delay));

    const domainResults = DOMAIN_RESULTS[this.domainId];
    const resultFn = domainResults?.[toolName];

    if (resultFn) {
      return { ...resultFn(), duration: Math.round(delay) };
    }

    // Generic fallback for tools not in mock data
    const tool = this.tools.find((t) => t.name === toolName);
    return {
      success: true,
      data: {
        tool: toolName,
        category: tool?.category ?? 'semantic',
        message: `Mock result for ${toolName}`,
        args,
      },
      duration: Math.round(delay),
    };
  }

  listTools(): MCPTool[] {
    return this.tools;
  }

  getTransport(): MCPTransport {
    return this.transport;
  }
}

// ============================================================
// MCP Client Factory — 根据传输类型创建客户端
// ============================================================

export function createMCPClient(
  domainId: string,
  transport: MCPTransport,
  tools: MCPTool[],
): IMCPClient {
  switch (transport.type) {
    case 'mock':
      return new MockMCPClient(domainId, transport, tools);
    // TODO: implement real transports
    // case 'sse': return new SSEMCPClient(transport);
    // case 'streamable-http': return new StreamableHTTPMCPClient(transport);
    // case 'stdio': return new StdioMCPClient(transport);
    default:
      console.warn(`[MCP] Unknown transport type "${transport.type}", falling back to mock`);
      return new MockMCPClient(domainId, transport, tools);
  }
}
