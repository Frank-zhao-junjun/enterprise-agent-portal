/**
 * MCP 客户端封装
 * MCP Client Wrapper
 *
 * 负责调用不同领域本体 MCP Server 的 tools。
 * 在演示环境中，使用 mock 实现模拟 MCP 响应。
 * 实际生产环境应使用 @modelcontextprotocol/sdk 的客户端。
 */

import type { MCPTool } from '@/types/ontology';
import { findToolById, getDomainById } from './domain-registry';
import type { DomainOntology } from '@/types/ontology';

/** MCP 工具调用结果 */
export interface MCPCallResult {
  success: boolean;
  result: Record<string, unknown>;
  /** 模拟的推导链（演示用） */
  reasoning?: string;
  /** 错误信息 */
  error?: string;
  /** 调用耗时（ms） */
  durationMs: number;
}

/**
 * 调用 MCP 工具
 * 演示环境下返回 mock 结果，生产环境应通过 MCP 协议调用真实 server
 */
export async function callMCPTool(
  toolId: string,
  args: Record<string, unknown>,
): Promise<MCPCallResult> {
  const startTime = Date.now();

  const found = findToolById(toolId);
  if (!found) {
    return {
      success: false,
      result: {},
      error: `Tool not found: ${toolId}`,
      durationMs: Date.now() - startTime,
    };
  }

  const { tool, domain } = found;

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  // 根据工具 ID 返回 mock 结果
  const mockResult = generateMockResult(domain, tool, args);

  return {
    success: true,
    result: mockResult,
    reasoning: `调用 ${domain.nameEn} MCP Server 的 ${tool.nameEn} 工具`,
    durationMs: Date.now() - startTime,
  };
}

/**
 * 生成 mock 结果
 * 基于工具的 example 字段生成类似的响应
 */
function generateMockResult(
  domain: DomainOntology,
  tool: MCPTool,
  args: Record<string, unknown>,
): Record<string, unknown> {
  // 制造业
  if (domain.id === 'manufacturing') {
    if (tool.id === 'mfg-intent-parse') {
      return {
        core_concept: 'ProductionOrder',
        related_concepts: ['Material', 'BOM', 'Inventory', 'Routing'],
        entities: extractEntities(String(args.query || '')),
        suggested_dimensions: ['material_readiness', 'schedule_status', 'quality_status'],
      };
    }
    if (tool.id === 'mfg-semantic-check') {
      const value = Number(args.value || 0);
      return {
        field_definition: `${args.data_type} = 业务计算公式`,
        threshold: value > 0.7 ? '> 0.7 为高风险' : '≤ 0.7 为正常',
        result: value > 0.7 ? '高风险' : '正常',
        data_quality: 'valid',
      };
    }
    if (tool.id === 'mfg-reason-execute') {
      return {
        rule_hit: `R-${String(args.rule_set || 'GEN').toUpperCase()}-001: 业务规则检查`,
        result: 'NOT_READY',
        missing: [
          { material: 'M-A001', required: 100, available: Math.floor(Math.random() * 80) },
        ],
        confidence: 0.92,
      };
    }
    if (tool.id === 'mfg-event-emit') {
      return {
        event_id: `EVT-${Date.now().toString().slice(-8)}`,
        event_type: args.event_type,
        routed_to: ['MES', 'WMS', 'QMS'],
        status: 'published',
      };
    }
    if (tool.id === 'mfg-api-invoke') {
      return {
        system: args.system,
        endpoint: args.endpoint,
        data: { status: 'IN_PROGRESS', completion: 0.65, station: 'ST-03' },
      };
    }
  }

  // 客服
  if (domain.id === 'customer-service') {
    if (tool.id === 'cs-flight-status') {
      const isDelayed = Math.random() > 0.5;
      return {
        flight: args.flight_number,
        status: isDelayed ? 'DELAYED' : 'ON_TIME',
        new_departure: isDelayed ? '14:30' : '12:00',
        gate: `B${Math.floor(Math.random() * 30)}`,
        delay_minutes: isDelayed ? 45 : 0,
      };
    }
    if (tool.id === 'cs-rebook') {
      return {
        status: 'REBOOKED',
        confirmation: args.confirmation_number,
        new_flight: args.new_flight,
        seat: '14A',
      };
    }
    if (tool.id === 'cs-compensation') {
      return {
        case_id: `CMP-${Date.now().toString().slice(-4)}`,
        vouchers: ['HOTEL-200', 'MEAL-50'],
        reason: args.reason,
      };
    }
    if (tool.id === 'cs-faq') {
      const q = String(args.question || '');
      if (q.includes('行李') || q.includes('baggage')) {
        return { answer: '经济舱可免费托运 1 件 23kg 以内的行李，三边之和 ≤ 158cm' };
      }
      if (q.includes('WiFi') || q.includes('wifi')) {
        return { answer: '所有航班均提供 WiFi 服务，商务舱免费，经济舱 8 USD/小时' };
      }
      return { answer: '请稍后，Agent 将为您查询具体政策' };
    }
    if (tool.id === 'cs-guardrail') {
      const input = String(args.user_input || '').toLowerCase();
      const isOffTopic = input.includes('诗') || input.includes('草莓') || input.includes('cooking');
      const isJailbreak = input.includes('系统指令') || input.includes('system prompt');
      return {
        is_relevant: !isOffTopic,
        is_safe: !isJailbreak,
        action: isOffTopic || isJailbreak ? 'REFUSE' : 'PROCEED',
        reason: isOffTopic ? '与航空客服无关' : isJailbreak ? '越狱尝试' : '通过',
      };
    }
  }

  // 供应链
  if (domain.id === 'supply-chain') {
    if (tool.id === 'sc-supplier-risk') {
      return {
        supplier_id: args.supplier_id,
        risk_level: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        financial: 0.3,
        delivery: 0.5,
        compliance: 0.2,
      };
    }
    if (tool.id === 'sc-inventory') {
      return {
        material_id: args.material_id,
        current: Math.floor(Math.random() * 200),
        safety_stock: 50,
        status: 'ABOVE_SAFETY',
      };
    }
    if (tool.id === 'sc-purchase-order') {
      return {
        po_id: args.po_id,
        status: ['IN_TRANSIT', 'DELIVERED', 'PENDING'][Math.floor(Math.random() * 3)],
        eta: '2024-06-15',
        supplier: 'SUP-001',
      };
    }
    if (tool.id === 'sc-event-subscribe') {
      return {
        subscription_id: `SUB-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
      };
    }
  }

  // 默认 mock
  return { tool: tool.id, args, status: 'OK' };
}

/** 从查询字符串中简单提取实体 */
function extractEntities(query: string): Array<{ id: string; type: string }> {
  const entities: Array<{ id: string; type: string }> = [];
  const poMatch = query.match(/PO-[\w-]+/);
  if (poMatch) entities.push({ id: poMatch[0], type: 'ProductionOrder' });
  const matMatch = query.match(/M-[\w-]+/);
  if (matMatch) entities.push({ id: matMatch[0], type: 'Material' });
  return entities;
}

/** 通过领域 ID 列出所有工具（带领域信息） */
export function listToolsForDomain(domainId: string): Array<{
  domain: DomainOntology;
  tool: MCPTool;
}> {
  const domain = getDomainById(domainId);
  if (!domain) return [];
  return domain.tools.map((tool) => ({ domain, tool }));
}
