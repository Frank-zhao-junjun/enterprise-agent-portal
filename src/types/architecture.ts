// ============================================================
// Agent Architecture Designer - Type Definitions
// ============================================================

// --- Input Guardrail ---
export interface InputGuardrail {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  type: 'relevance' | 'jailbreak';
  model: string; // e.g., "gpt-4.1-mini"
}

// --- Tool Definition ---
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  shared_with?: string[];     // Agent IDs that also use this tool
  updates_context?: string;   // Context field name this tool updates
}

// --- Business Rule ---
export type BusinessRuleType = 'guardrail' | 'constraint' | 'escalation' | 'routing';

export interface BusinessRule {
  id: string;
  name: string;
  type: BusinessRuleType;
  description: string;
  applies_to: string[]; // Agent IDs
  trigger_example: string;
}

// --- Handoff Target (with hook info) ---
export interface HandoffTarget {
  agentId: string;
  label: string;
  hasHook?: boolean;        // Whether this handoff has an on_handoff callback
  hookDescription?: string; // What the hook does (e.g., "Pre-fill confirmation_number and flight_number")
}

// --- Agent ---
export interface AgentDefinition {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  handoff_description: string; // Description for LLM routing decisions
  tools: ToolDefinition[];
  handoffs: HandoffTarget[];
  input_guardrails: InputGuardrail[]; // Guardrails applied to this agent
}

// --- Architecture ---
export interface ArchitectureOutput {
  schema_version: string;
  triage_agent: AgentDefinition;
  spoke_agents: AgentDefinition[];
  input_guardrails: InputGuardrail[];     // SDK-level safety guardrails
  business_rules: BusinessRule[];
  handoff_matrix: Record<string, string[]>; // Agent ID -> [target Agent IDs]
  shared_context: SharedContextDefinition;  // Shared context across agents
}

// --- Shared Context ---
export interface SharedContextField {
  name: string;
  type: string;           // e.g., "str | None"
  description: string;
  descriptionEn: string;
  written_by: string[];   // Agent IDs that write to this field
  read_by: string[];      // Agent IDs that read this field
}

export interface SharedContextDefinition {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  fields: SharedContextField[];
  hydration_methods: ContextHydrationMethod[];
}

export interface ContextHydrationMethod {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  example: string;
}

// --- Scenario Step ---
export type ScenarioStepType =
  | 'customer'
  | 'agent'
  | 'tool_call'
  | 'tool_result'
  | 'handoff'
  | 'guardrail_check'
  | 'guardrail_trigger'
  | 'constraint'
  | 'escalation'
  | 'routing';

export interface ScenarioStep {
  type: ScenarioStepType;
  agent?: string;
  content: string;
  contentEn?: string;
  targetAgent?: string;
  toolName?: string;
  toolResult?: string;
  ruleName?: string;
  ruleType?: BusinessRuleType;
  guardrailName?: string;    // For guardrail_check / guardrail_trigger
  guardrailType?: 'relevance' | 'jailbreak';
  passed?: boolean;
  reasoning?: string;        // Guardrail reasoning
}

// --- Scenario ---
export interface Scenario {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  type: string;
  steps: ScenarioStep[];
}

// --- Demo Version ---
export interface DemoVersion {
  id: string;
  version: string; // "v1", "v2"...
  createdAt: number;
  architecture: ArchitectureOutput;
  scenarios: Scenario[];
}

// --- Agent Version ---
export interface AgentDescription {
  intro: string;
  applicable_scenarios: string;
  capabilities: string;
  system_connections: string;
  business_impact: string;
  category: string;
}

export interface AgentVersion {
  id: string;
  version: string; // "v1.0", "v1.1"...
  createdAt: number;
  description: AgentDescription;
  demos: DemoVersion[];
}

// --- Agent Record ---
export interface AgentRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  versions: AgentVersion[];
}

// --- App State ---
export type Locale = 'en' | 'zh';

export interface AppState {
  agents: AgentRecord[];
  selectedAgentId: string | null;
  selectedVersionId: string | null;
  selectedDemoId: string | null;
  activeTab: 0 | 1 | 2 | 3; // 0=Designer, 1=Demo, 2=Architecture, 3=Details
  locale: Locale;
  // Demo playback state
  demoPlaying: boolean;
  demoCurrentStep: number;
  demoAutoPlay: boolean;
}

// --- UI State ---
export type UIAction =
  | { type: 'SET_AGENTS'; payload: AgentRecord[] }
  | { type: 'ADD_AGENT'; payload: AgentRecord }
  | { type: 'UPDATE_AGENT'; payload: { agentId: string; updates: Partial<AgentRecord> } }
  | { type: 'DELETE_AGENT'; payload: string }
  | { type: 'SELECT_AGENT'; payload: string }
  | { type: 'ADD_VERSION'; payload: { agentId: string; version: AgentVersion } }
  | { type: 'UPDATE_VERSION'; payload: { agentId: string; versionId: string; updates: Partial<AgentVersion> } }
  | { type: 'SELECT_VERSION'; payload: { agentId: string; versionId: string } }
  | { type: 'ADD_DEMO'; payload: { agentId: string; versionId: string; demo: DemoVersion } }
  | { type: 'SELECT_DEMO'; payload: { agentId: string; versionId: string; demoId: string } }
  | { type: 'SET_ACTIVE_TAB'; payload: 0 | 1 | 2 | 3 }
  | { type: 'SET_LOCALE'; payload: Locale }
  | { type: 'TOGGLE_LOCALE' }
  | { type: 'SET_DEMO_PLAYING'; payload: boolean }
  | { type: 'SET_DEMO_STEP'; payload: number }
  | { type: 'SET_DEMO_AUTO_PLAY'; payload: boolean }
  | { type: 'RESET_DEMO' };

// --- API Request/Response ---
export interface GenerateArchitectureRequest {
  description: AgentDescription;
  locale: Locale;
}

export interface GenerateScenariosRequest {
  architecture: ArchitectureOutput;
  locale: Locale;
}

// --- SSE Event Types ---
export type SSEEventType = 'thinking' | 'partial' | 'complete' | 'error';

export interface SSEThinkingEvent {
  type: 'thinking';
  content: string;
}

export interface SSEPartialEvent {
  type: 'partial';
  content: string;
}

export interface SSECompleteEvent<T> {
  type: 'complete';
  content: T;
}

export interface SSEErrorEvent {
  type: 'error';
  content: string;
}

export type SSEEvent<T = unknown> = SSEThinkingEvent | SSEPartialEvent | SSECompleteEvent<T> | SSEErrorEvent;
