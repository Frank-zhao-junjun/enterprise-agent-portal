// === Ontology Hub - Core Type Definitions ===

/** MCP Transport 接口 — 可插拔传输层 */
export interface MCPTransport {
  type: 'mock' | 'stdio' | 'sse' | 'streamable-http';
  serverUrl?: string;
  headers?: Record<string, string>;
}

/** 本体领域中的工具定义 */
export interface MCPTool {
  name: string;
  description: string;
  category: 'semantic' | 'behavior' | 'event' | 'governance' | 'api';
  parameters?: Record<string, MCPToolParameter>;
}

export interface MCPToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: unknown;
}

/** 本体领域定义 */
export interface DomainOntology {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  transport: MCPTransport;
  tools: MCPTool[];
  categories: OntologyCategory[];
  exampleQuestions?: string[];
  exampleQuestionsEn?: string[];
}

/** 本体能力类别 */
export interface OntologyCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  toolCount: number;
}

/** 推理步骤 */
export interface ReasoningStep {
  id: string;
  type: ReasoningStepType;
  title: string;
  titleEn: string;
  args?: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number; // ms
  domain?: string;
  toolName?: string;
  timestamp: number;
}

export type ReasoningStepType = 'intent' | 'routing' | 'tool_call' | 'tool_result' | 'guardrail' | 'response' | 'semantic_lookup' | 'rule_reasoning' | 'event_emit' | 'governance_check' | 'api_invoke' | 'aggregation';

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  timestamp: number;
  reasoning?: ReasoningStep[];
  domainId?: string;
  isStreaming?: boolean;
}

/** 会话 */
export interface ChatSession {
  id: string;
  createdAt: number;
  messages: ChatMessage[];
  history: LLMMessage[]; // LLM 对话历史
}

/** LLM 消息格式 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 领域路由结果 */
export interface DomainRouteResult {
  domainId: string;
  confidence: number;
  reasoning: string;
  toolsToCall: string[];
}

/** MCP 工具调用结果 */
export interface MCPToolResult {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
  duration: number;
}

/** SSE 事件 */
export interface SSEEvent {
  type: 'reasoning' | 'content' | 'error' | 'done';
  data: unknown;
}

/** App 状态 */
export interface AppState {
  locale: 'en' | 'zh';
  activeDomainId: string | null;
  isThinking: boolean;
  sessionId: string;
}

/** App Action */
export type AppAction =
  | { type: 'SET_LOCALE'; payload: 'en' | 'zh' }
  | { type: 'SET_ACTIVE_DOMAIN'; payload: string | null }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: string };
