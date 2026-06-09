/**
 * MCP Server 基础框架
 * 提供工具注册、路由分发、JSON-RPC 处理
 */

import {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCError,
  MCPToolDefinition,
  MCPToolCallParams,
  MCPToolResult,
  MCPServerInfo,
  MCPInitializeResult,
  MCPToolsListResult,
  MCP_ERROR_CODES,
} from './protocol';

export type ToolHandler = (args: Record<string, unknown>) => Promise<MCPToolResult>;

export interface RegisteredTool {
  definition: MCPToolDefinition;
  handler: ToolHandler;
}

export class MCPServer {
  private tools: Map<string, RegisteredTool> = new Map();
  private serverInfo: MCPServerInfo;

  constructor(serverInfo: MCPServerInfo) {
    this.serverInfo = serverInfo;
  }

  /**
   * 注册一个工具
   */
  registerTool(definition: MCPToolDefinition, handler: ToolHandler): void {
    this.tools.set(definition.name, { definition, handler });
  }

  /**
   * 批量注册工具
   */
  registerTools(tools: Array<{ definition: MCPToolDefinition; handler: ToolHandler }>): void {
    for (const { definition, handler } of tools) {
      this.registerTool(definition, handler);
    }
  }

  /**
   * 处理 JSON-RPC 请求
   */
  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    const { id, method, params } = request;

    try {
      let result: unknown;

      switch (method) {
        case 'initialize':
          result = this.handleInitialize();
          break;

        case 'tools/list':
          result = this.handleToolsList();
          break;

        case 'tools/call':
          result = await this.handleToolsCall(params as unknown as MCPToolCallParams);
          break;

        default:
          return this.errorResponse(id, MCP_ERROR_CODES.METHOD_NOT_FOUND, `Method not found: ${method}`);
      }

      return { jsonrpc: '2.0', id, result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.errorResponse(id, MCP_ERROR_CODES.INTERNAL_ERROR, message);
    }
  }

  private handleInitialize(): MCPInitializeResult {
    return {
      serverInfo: this.serverInfo,
      capabilities: {
        tools: { listChanged: false },
      },
    };
  }

  private handleToolsList(): MCPToolsListResult {
    return {
      tools: Array.from(this.tools.values()).map((t) => t.definition),
    };
  }

  private async handleToolsCall(params: MCPToolCallParams): Promise<MCPToolResult> {
    const { name, arguments: args } = params;

    const tool = this.tools.get(name);
    if (!tool) {
      return {
        content: JSON.stringify({ error: `Tool not found: ${name}` }),
        isError: true,
      };
    }

    try {
      const result = await tool.handler(args);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tool execution failed';
      return {
        content: JSON.stringify({ error: message }),
        isError: true,
      };
    }
  }

  private errorResponse(id: string | number | undefined, code: number, message: string): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: { code, message },
    };
  }

  /**
   * 获取所有已注册工具的定义（供 domain-registry 使用）
   */
  getToolDefinitions(): MCPToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }
}
