/**
 * MCP Server 注册表
 * 统一管理所有领域的 MCP Server 实例
 */

import { MCPServer } from './server';
import { createManufacturingServer } from './domains/manufacturing';
import { createCustomerServiceServer } from './domains/customer-service';
import { createSupplyChainServer } from './domains/supply-chain';

const serverCache: Map<string, MCPServer> = new Map();

/**
 * 获取指定领域的 MCP Server 实例（单例）
 */
export function getMCPServer(domainId: string): MCPServer | null {
  if (serverCache.has(domainId)) {
    return serverCache.get(domainId)!;
  }

  let server: MCPServer;

  switch (domainId) {
    case 'manufacturing':
      server = createManufacturingServer();
      break;
    case 'customer-service':
      server = createCustomerServiceServer();
      break;
    case 'supply-chain':
      server = createSupplyChainServer();
      break;
    default:
      return null;
  }

  serverCache.set(domainId, server);
  return server;
}

/**
 * 获取所有已注册的领域 ID
 */
export function getRegisteredDomains(): string[] {
  return ['manufacturing', 'customer-service', 'supply-chain'];
}
