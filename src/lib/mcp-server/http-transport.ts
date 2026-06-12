/**
 * MCP HTTP Transport — 客户端侧
 * 通过 HTTP POST 与 MCP Server 通信
 */

import { JSONRPCRequest, JSONRPCResponse, MCPToolDefinition } from './protocol';
import type { MCPToolResult } from '@/types/ontology';

export class HTTPTransport {
  private baseUrl: string;
  private domainId: string;
  private requestId = 0;

  constructor(baseUrl: string, domainId: string) {
    this.baseUrl = baseUrl;
    this.domainId = domainId;
  }

  private async sendRequest(method: string, params?: Record<string, unknown>): Promise<JSONRPCResponse> {
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params,
    };

    const response = await fetch(`${this.baseUrl}/api/mcp/${this.domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`MCP Server HTTP error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 初始化连接
   */
  async initialize(): Promise<{ name: string; version: string }> {
    const res = await this.sendRequest('initialize');
    if (res.error) {
      throw new Error(`MCP initialize failed: ${res.error.message}`);
    }
    const result = res.result as { serverInfo: { name: string; version: string } };
    return result.serverInfo;
  }

  /**
   * 获取工具列表
   */
  async listTools(): Promise<MCPToolDefinition[]> {
    const res = await this.sendRequest('tools/list');
    if (res.error) {
      throw new Error(`MCP tools/list failed: ${res.error.message}`);
    }
    const result = res.result as { tools: MCPToolDefinition[] };
    return result.tools;
  }

  /**
   * 调用工具
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const res = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    });

    if (res.error) {
      return {
        content: JSON.stringify({ error: res.error.message }),
        isError: true,
      };
    }

    return res.result as MCPToolResult;
  }

  /**
   * 断开连接（HTTP 无状态，无需操作）
   */
  async disconnect(): Promise<void> {
    // HTTP transport is stateless, no cleanup needed
  }
}
