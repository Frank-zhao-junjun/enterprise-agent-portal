// ============================================================
// Agent Architecture Designer - Type Definitions
// ============================================================

// --- Tool Definition ---
export interface ToolDefinition {
  name: string;
  description: string;
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

// --- Agent ---
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: ToolDefinition[];
  handoffs: string[]; // Agent IDs this agent can hand off to
}

// --- Architecture ---
export interface ArchitectureOutput {
  triage_agent: AgentDefinition;
  spoke_agents: AgentDefinition[];
  business_rules: BusinessRule[];
  handoff_matrix: Record<string, string[]>; // Agent ID -> [target Agent IDs]
}

// --- Scenario Step ---
export type ScenarioStepType =
  | 'customer'
  | 'agent'
  | 'tool_call'
  | 'handoff'
  | 'guardrail'
  | 'constraint'
  | 'escalation'
  | 'routing';

// --- Handoff ---
export interface HandoffTarget {
  agentId: string;
  agentName: string;
  agentIcon: string;
  agentColor: string;
  reason?: string;
}

export interface ScenarioStep {
  type: ScenarioStepType;
  agent?: string;
  content: string;
  targetAgent?: string;
  toolName?: string;
  ruleName?: string;
  ruleType?: BusinessRuleType;
  passed?: boolean;
}

// --- Scenario ---
export interface Scenario {
  id: string;
  name: string;
  description: string;
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
