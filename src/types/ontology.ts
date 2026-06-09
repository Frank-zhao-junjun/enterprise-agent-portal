/**
 * 本体领域模型类型定义
 * Ontology Domain Model Type Definitions
 *
 * 参考：ontology-platform/docs/PRD-本体模型语义行为事件平台-v1.0.md
 * 参考：ontology-platform/docs/mcp-agent-ontology-interaction.md
 */

/** MCP 工具参数 */
export interface MCPToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: string | number | boolean | null;
}

/** MCP 工具定义 */
export interface MCPTool {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: 'semantic' | 'behavior' | 'event' | 'governance' | 'api';
  parameters: MCPToolParameter[];
  /** 示例输入 */
  example: {
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  };
}

/** 本体领域 */
export interface DomainOntology {
  id: string;
  /** 领域名称（中文） */
  name: string;
  /** 领域名称（英文） */
  nameEn: string;
  /** 领域描述（中文） */
  description: string;
  /** 领域描述（英文） */
  descriptionEn: string;
  /** 领域图标（Lucide icon name） */
  icon: string;
  /** 领域颜色（Tailwind class） */
  color: string;
  /** MCP Server 地址（演示用 mock URL） */
  mcpServerUrl: string;
  /** 该领域提供的 MCP 工具列表 */
  tools: MCPTool[];
  /** 适用场景（中文） */
  applicableScenarios: string[];
  /** 适用场景（英文） */
  applicableScenariosEn: string[];
  /** 预置示例问题 */
  exampleQuestions: string[];
  /** 预置示例问题（英文） */
  exampleQuestionsEn: string[];
}

/** 推理链步骤类型 */
export type ReasoningStepType =
  | 'intent_recognition' // 意图识别
  | 'domain_routing'     // 领域路由
  | 'mcp_call'           // MCP 工具调用
  | 'semantic_lookup'    // 语义查询
  | 'rule_reasoning'     // 规则推理
  | 'event_emit'         // 事件发布
  | 'governance_check'   // 治理检查
  | 'api_invoke'         // 后端 API 调用
  | 'aggregation'        // 结果聚合
  | 'response';          // 最终回复

/** 推理链步骤 */
export interface ReasoningStep {
  /** 步骤序号 */
  step: number;
  /** 步骤类型 */
  type: ReasoningStepType;
  /** 步骤标题 */
  title: string;
  /** 步骤标题（英文） */
  titleEn: string;
  /** 步骤内容/输出 */
  content: string;
  /** 步骤内容/输出（英文） */
  contentEn: string;
  /** 调用的 MCP 工具名（如有） */
  toolName?: string;
  /** 工具参数（如有） */
  toolArgs?: Record<string, unknown>;
  /** 工具返回结果（如有） */
  toolResult?: Record<string, unknown>;
  /** 时间戳 */
  timestamp: number;
  /** 执行耗时（ms） */
  durationMs?: number;
  /** 置信度 0-1 */
  confidence?: number;
}

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  /** 关联的领域 ID */
  domainId?: string;
  /** 推理链步骤 */
  reasoning?: ReasoningStep[];
  /** 时间戳 */
  timestamp: number;
}

/** 聊天会话 */
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  /** 当前激活的领域 */
  activeDomainId?: string;
  /** 创建时间 */
  createdAt: number;
}

/** 聊天 API 请求 */
export interface ChatRequest {
  message: string;
  /** 强制指定领域（可选，让 Triage Agent 自动选择） */
  forcedDomainId?: string;
  /** 会话 ID（用于多轮对话上下文） */
  sessionId?: string;
  /** 语言 */
  locale: 'zh' | 'en';
}

/** 聊天 API 响应（SSE 事件） */
export type ChatSSEEvent =
  | { type: 'reasoning'; step: ReasoningStep }
  | { type: 'content'; delta: string }
  | { type: 'done'; fullContent: string; reasoningChain: ReasoningStep[]; domainId: string }
  | { type: 'error'; message: string };
