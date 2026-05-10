// ============================================================
// Data Service - Agent CRUD + localStorage persistence
// ============================================================
import { AgentRecord } from '@/types/architecture';

const STORAGE_KEY = 'agent_designer_agents';

export function loadAgents(): AgentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as AgentRecord[];
  } catch {
    return [];
  }
}

export function saveAgents(agents: AgentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error('Failed to save agents:', e);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getNextVersion(versions: { version: string }[]): string {
  if (versions.length === 0) return 'v1.0';
  const last = versions[versions.length - 1].version; // e.g. "v1.0"
  const [major, minor] = last.replace('v', '').split('.').map(Number);
  return `v${major}.${minor + 1}`;
}

export function getNextDemoVersion(demos: { version: string }[]): string {
  if (demos.length === 0) return 'v1';
  const last = demos[demos.length - 1].version; // e.g. "v1"
  const num = parseInt(last.replace('v', '')) + 1;
  return `v${num}`;
}

// Deep clone to avoid mutation
export function cloneAgent(agent: AgentRecord): AgentRecord {
  return JSON.parse(JSON.stringify(agent));
}
