/**
 * MCP Server HTTP API 路由
 * POST /api/mcp/[domain] — JSON-RPC 请求处理
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMCPServer } from '@/lib/mcp-server/registry';
import { JSONRPCRequest } from '@/lib/mcp-server/protocol';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;

  // 查找对应的 MCP Server
  const server = getMCPServer(domain);
  if (!server) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: { code: -32601, message: `Unknown domain: ${domain}` },
      },
      { status: 404 }
    );
  }

  // 解析 JSON-RPC 请求
  let rpcRequest: JSONRPCRequest;
  try {
    rpcRequest = await request.json();
  } catch {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error: invalid JSON' },
    });
  }

  // 处理请求
  const response = await server.handleRequest(rpcRequest);
  return NextResponse.json(response);
}
