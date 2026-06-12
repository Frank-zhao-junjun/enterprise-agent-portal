/**
 * MCP Server HTTP API 路由
 * POST /api/mcp/[domain] — JSON-RPC 请求处理
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMCPServer } from '@/lib/mcp-server/registry';

// Zod 校验 JSON-RPC 请求
const jsonRpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.number(), z.string()]).optional(),
  method: z.string().min(1).max(64),
  params: z.object({}).passthrough().optional(),
});

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

  // 解析 + Zod 校验 JSON-RPC 请求
  let rpcRequest: z.infer<typeof jsonRpcRequestSchema>;
  try {
    const body = await request.json();
    rpcRequest = jsonRpcRequestSchema.parse(body);
  } catch {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error: invalid JSON-RPC request' },
    });
  }

  // 处理请求
  const response = await server.handleRequest(rpcRequest);
  return NextResponse.json(response);
}
