/**
 * MCP (Model Context Protocol) 类型定义
 * 基于 JSON-RPC 2.0 规范的简化实现
 */

// ============ JSON-RPC 2.0 ============

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: unknown;
  error?: JSONRPCError;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: unknown;
}

// ============ MCP Protocol ============

export interface MCPToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  category: 'semantic' | 'behavior' | 'event' | 'governance' | 'api';
  parameters: Record<string, MCPToolParameter>;
}

export interface MCPToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  content: string;
  isError?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  description?: string;
}

export interface MCPInitializeResult {
  serverInfo: MCPServerInfo;
  capabilities: {
    tools: { listChanged?: boolean };
  };
}

export interface MCPToolsListResult {
  tools: MCPToolDefinition[];
}

// ============ MCP Method Types ============

export type MCPMethod =
  | 'initialize'
  | 'tools/list'
  | 'tools/call';

export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  TOOL_NOT_FOUND: -32001,
  TOOL_EXECUTION_ERROR: -32002,
} as const;
