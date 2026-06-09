/**
 * MCP Client — 通过 HTTP Transport 与真实 MCP Server 通信
 * 保留 MockMCPClient 作为 fallback
 */

import type { MCPTool as DomainMCPTool, MCPToolResult } from '@/types/ontology';
import { HTTPTransport } from './mcp-server/http-transport';

// Re-export MCPToolResult so consumers use the canonical type
export type { MCPToolResult };

// ============ Types ============

/** mcp-client 使用的工具类型，兼容 DomainMCPTool */
export interface MCPTool {
  name: string;
  description: string;
  category: string;
  parameters?: Record<string, { type: string; description: string; required?: boolean; enum?: string[] }>;
}

export interface IMCPClient {
  callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult>;
  listTools(): MCPTool[];
  getDomainId(): string;
}

// ============ Type converters ============

function domainToolToClientTool(tool: DomainMCPTool): MCPTool {
  return {
    name: tool.name,
    description: tool.description,
    category: tool.category,
    parameters: tool.parameters ? Object.fromEntries(
      Object.entries(tool.parameters).map(([k, v]) => [k, {
        type: v.type,
        description: v.description,
        required: v.required,
        ...(v.enum ? { enum: v.enum } : {}),
      }])
    ) : undefined,
  };
}

// ============ HTTP MCP Client — 真实 MCP Server ============

export class HTTPMCPClient implements IMCPClient {
  private transport: HTTPTransport;
  private domainId: string;
  private toolsCache: MCPTool[] | null = null;

  constructor(domainId: string, baseUrl: string) {
    this.domainId = domainId;
    this.transport = new HTTPTransport(baseUrl, domainId);
  }

  async init(): Promise<void> {
    const serverInfo = await this.transport.initialize();
    console.log(`[MCP] Connected to ${serverInfo.name} v${serverInfo.version}`);
    const toolDefs = await this.transport.listTools();
    this.toolsCache = toolDefs.map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      parameters: Object.fromEntries(
        Object.entries(t.parameters).map(([k, v]) => [k, {
          type: v.type,
          description: v.description,
          required: v.required,
          ...(v.enum ? { enum: v.enum } : {}),
        }])
      ),
    }));
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const start = Date.now();
    const result = await this.transport.callTool(toolName, args);
    return {
      ...result,
      duration: Date.now() - start,
    };
  }

  listTools(): MCPTool[] {
    return this.toolsCache ?? [];
  }

  getDomainId(): string {
    return this.domainId;
  }
}

// ============ Mock MCP Client — 开发/演示 fallback ============

const MOCK_DELAY_MS = 300;

/** 通用 mock 结果 — 仅用于 general 领域或 fallback */
const GENERAL_RESULTS: Record<string, () => MCPToolResult> = {
  ontology_intent_parse: () => ({
    content: JSON.stringify({ intent: 'general_query', entities: [], confidence: 0.7 }),
  }),
};

export class MockMCPClient implements IMCPClient {
  private domainId: string;
  private tools: MCPTool[];

  constructor(domainId: string, tools: MCPTool[]) {
    this.domainId = domainId;
    this.tools = tools;
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const delay = MOCK_DELAY_MS + Math.random() * 200;
    await new Promise((r) => setTimeout(r, delay));

    const resultFn = GENERAL_RESULTS[toolName];
    if (resultFn) {
      return { ...resultFn(), duration: Math.round(delay) };
    }

    // Fallback: return args echo
    return {
      content: JSON.stringify({ tool: toolName, args, message: `Mock result for ${toolName}` }),
      duration: Math.round(delay),
    };
  }

  listTools(): MCPTool[] {
    return this.tools;
  }

  getDomainId(): string {
    return this.domainId;
  }
}

// ============ Client Factory ============

/**
 * 创建 HTTP MCP Client（连接真实 MCP Server）
 * 在服务器端（API Route）使用，通过 localhost 调用
 */
export async function createHTTPMCPClient(domainId: string): Promise<HTTPMCPClient> {
  const client = new HTTPMCPClient(domainId, 'http://localhost:5000');
  await client.init();
  return client;
}

/**
 * 创建 Mock MCP Client（fallback）
 */
export function createMockMCPClient(domainId: string, tools: DomainMCPTool[]): MockMCPClient {
  return new MockMCPClient(domainId, tools.map(domainToolToClientTool));
}
