/**
 * MCP Client — 提供 MCP 工具调用的统一接口
 * 
 * 架构改进:
 * 1. LocalMCPClient — 直接调用本进程中 MCP Server（避免自引用 HTTP 往返）
 * 2. HTTPMCPClient — 远程 HTTP 调用（仅用于连接外部独立 MCP Server）
 * 3. MockMCPClient — 开发/演示 fallback
 */

import type { MCPTool as DomainMCPTool, MCPToolResult } from '@/types/ontology';
import { HTTPTransport } from './mcp-server/http-transport';
import { getMCPServer } from './mcp-server/registry';
import type { MCPToolDefinition } from './mcp-server/protocol';

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

function mcpDefToClientTool(t: MCPToolDefinition): MCPTool {
  return {
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
  };
}

// ============ Local MCP Client — 直接调用本进程 MCP Server ============

/**
 * 直接调用本进程中注册的 MCPServer，避免通过 HTTP 自引用
 * 这是默认推荐方式，比 HTTPMCPClient 快 10-50x
 */
export class LocalMCPClient implements IMCPClient {
  private domainId: string;
  private toolsCache: MCPTool[] | null = null;

  constructor(domainId: string) {
    this.domainId = domainId;
  }

  async init(): Promise<void> {
    const server = getMCPServer(this.domainId);
    if (!server) {
      throw new Error(`No MCP Server registered for domain: ${this.domainId}`);
    }
    const toolDefs = server.getToolDefinitions();
    this.toolsCache = toolDefs.map(mcpDefToClientTool);
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const start = Date.now();
    const server = getMCPServer(this.domainId);
    if (!server) {
      return {
        content: JSON.stringify({ error: `No MCP Server for domain: ${this.domainId}` }),
        isError: true,
      };
    }

    const response = await server.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    });

    if (response.error) {
      return {
        content: JSON.stringify({ error: response.error.message }),
        isError: true,
        duration: Date.now() - start,
      };
    }

    const result = response.result as MCPToolResult;
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

// ============ HTTP MCP Client — 连接远程/独立 MCP Server ============

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
    console.log(`[MCP] Connected to remote ${serverInfo.name} v${serverInfo.version}`);
    const toolDefs = await this.transport.listTools();
    this.toolsCache = toolDefs.map(mcpDefToClientTool);
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
 * 创建最佳的 MCP Client（按优先级）：
 * 1. LocalMCPClient — 本进程内注册的 MCP Server（最快）
 * 2. HTTPMCPClient — 外部远程 MCP Server（当 MCP_SERVER_URL 环境变量设置时）
 * 3. MockMCPClient — fallback
 */
export async function createLocalMCPClient(domainId: string): Promise<LocalMCPClient> {
  const server = getMCPServer(domainId);
  if (!server) {
    throw new Error(`No MCP Server registered for domain: ${domainId}`);
  }
  const client = new LocalMCPClient(domainId);
  await client.init();
  return client;
}

/**
 * 创建 HTTP MCP Client（连接远程独立 MCP Server）
 */
export async function createHTTPMCPClient(domainId: string): Promise<HTTPMCPClient> {
  const baseUrl = process.env.MCP_SERVER_URL ?? 'http://localhost:5000';
  const client = new HTTPMCPClient(domainId, baseUrl);
  await client.init();
  return client;
}

/**
 * 创建 Mock MCP Client（fallback）
 */
export function createMockMCPClient(domainId: string, tools: DomainMCPTool[]): MockMCPClient {
  return new MockMCPClient(domainId, tools.map(domainToolToClientTool));
}
