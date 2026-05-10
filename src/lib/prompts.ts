// ============================================================
// LLM Prompts for Architecture and Scenario Generation
// ============================================================
import { AgentDescription, Locale } from '@/types/architecture';

const ARCHITECTURE_PROMPT_EN = `You are an expert Multi-Agent System Architect specializing in the Hub-and-Spoke architecture pattern.

Based on the user's Agent description, generate a complete Agent architecture that follows the OpenAI Agents SDK Hub-and-Spoke model with Guardrails.

## User's Agent Description:
- Introduction: {intro}
- Applicable Scenarios: {applicable_scenarios}
- Capabilities: {capabilities}
- System Connections: {system_connections}
- Business Impact: {business_impact}
- Category: {category}

## Output Format (JSON only, no other text):
{
  "triage_agent": {
    "id": "triage",
    "name": "...",
    "description": "...",
    "icon": "🔀",
    "color": "#2563eb",
    "tools": [{"name": "...", "description": "..."}],
    "handoffs": ["spoke1_id", "spoke2_id", ...]
  },
  "spoke_agents": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "icon": "...",
      "color": "...",
      "tools": [{"name": "...", "description": "..."}],
      "handoffs": ["triage"]
    }
  ],
  "business_rules": [
    {
      "id": "rule_1",
      "name": "...",
      "type": "guardrail|constraint|escalation|routing",
      "description": "...",
      "applies_to": ["agent_id", ...],
      "trigger_example": "..."
    }
  ],
  "handoff_matrix": {
    "triage": ["spoke1_id", "spoke2_id", ...],
    "spoke1_id": ["triage"],
    ...
  }
}

## Requirements:
1. Generate 3-6 spoke agents based on the capabilities described
2. Each spoke agent should have 1-3 tools
3. Triage agent should have at least 1 tool for getting conversation context
4. Include at least 1 guardrail, 1 constraint, 1 escalation, and 1 routing rule
5. Handoff follows Hub-and-Spoke: Triage → all Spokes, each Spoke → Triage
6. IDs must be lowercase with underscores (snake_case)
7. Icons should be relevant emoji
8. Colors should be distinct hex values (one per agent)
9. Output ONLY valid JSON, no markdown fences, no explanation`;

const ARCHITECTURE_PROMPT_ZH = `你是 Multi-Agent 系统架构专家，精通 Hub-and-Spoke 架构模式。

根据用户的 Agent 描述，生成符合 OpenAI Agents SDK Hub-and-Spoke 模型（含 Guardrails）的完整 Agent 架构。

## 用户的 Agent 描述：
- 简介：{intro}
- 适用场景：{applicable_scenarios}
- 能力描述：{capabilities}
- 系统连接：{system_connections}
- 业务效果：{business_impact}
- 所属板块：{category}

## 输出格式（仅 JSON，无需其他文字）：
{
  "triage_agent": {
    "id": "triage",
    "name": "...",
    "description": "...",
    "icon": "🔀",
    "color": "#2563eb",
    "tools": [{"name": "...", "description": "..."}],
    "handoffs": ["spoke1_id", "spoke2_id", ...]
  },
  "spoke_agents": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "icon": "...",
      "color": "...",
      "tools": [{"name": "...", "description": "..."}],
      "handoffs": ["triage"]
    }
  ],
  "business_rules": [
    {
      "id": "rule_1",
      "name": "...",
      "type": "guardrail|constraint|escalation|routing",
      "description": "...",
      "applies_to": ["agent_id", ...],
      "trigger_example": "..."
    }
  ],
  "handoff_matrix": {
    "triage": ["spoke1_id", "spoke2_id", ...],
    "spoke1_id": ["triage"],
    ...
  }
}

## 要求：
1. 根据描述的能力生成 3-6 个 spoke agent
2. 每个 spoke agent 应有 1-3 个工具
3. Triage agent 至少有一个用于获取对话上下文的工具
4. 包含至少 1 条 guardrail、1 条 constraint、1 条 escalation、1 条 routing 规则
5. Handoff 遵循 Hub-and-Spoke：Triage → 所有 Spoke，每个 Spoke → Triage
6. ID 必须小写下划线格式（snake_case）
7. 图标使用相关 emoji
8. 颜色使用不同的十六进制值（每个 agent 一个）
9. 仅输出有效 JSON，不要 markdown 代码块，不要解释`;

const SCENARIOS_PROMPT_EN = `Based on the following Agent architecture, generate 2-3 typical business scenario dialogues.

## Architecture:
{architecture}

## Output Format (JSON only):
{
  "scenarios": [
    {
      "id": "scenario_1",
      "name": "...",
      "description": "...",
      "steps": [
        {
          "type": "customer",
          "content": "..."
        },
        {
          "type": "agent",
          "agent": "triage",
          "content": "..."
        },
        {
          "type": "handoff",
          "agent": "triage",
          "targetAgent": "spoke_id",
          "content": "Handing off to {spoke_name}..."
        },
        {
          "type": "agent",
          "agent": "spoke_id",
          "content": "..."
        },
        {
          "type": "tool_call",
          "agent": "spoke_id",
          "toolName": "tool_name",
          "content": "Calling tool: tool_name..."
        },
        {
          "type": "guardrail",
          "ruleName": "rule_name",
          "ruleType": "guardrail",
          "passed": true,
          "content": "Guardrail check: {rule_name} - PASSED"
        },
        {
          "type": "constraint",
          "ruleName": "rule_name",
          "ruleType": "constraint",
          "passed": true,
          "content": "Constraint check: {rule_name} - PASSED"
        }
      ]
    }
  ]
}

## Requirements:
1. Each scenario should have 8-15 steps
2. Include at least one handoff per scenario
3. Include at least one tool_call per scenario
4. Include at least one business rule check (guardrail/constraint/escalation/routing) per scenario
5. Scenario names should be descriptive and in the user's language
6. Output ONLY valid JSON`;

const SCENARIOS_PROMPT_ZH = `根据以下 Agent 架构，生成 2-3 个典型业务场景对话。

## 架构：
{architecture}

## 输出格式（仅 JSON）：
{
  "scenarios": [
    {
      "id": "scenario_1",
      "name": "...",
      "description": "...",
      "steps": [
        {
          "type": "customer",
          "content": "..."
        },
        {
          "type": "agent",
          "agent": "triage",
          "content": "..."
        },
        {
          "type": "handoff",
          "agent": "triage",
          "targetAgent": "spoke_id",
          "content": "正在转接至 {spoke_name}..."
        },
        {
          "type": "agent",
          "agent": "spoke_id",
          "content": "..."
        },
        {
          "type": "tool_call",
          "agent": "spoke_id",
          "toolName": "tool_name",
          "content": "调用工具: tool_name..."
        },
        {
          "type": "guardrail",
          "ruleName": "rule_name",
          "ruleType": "guardrail",
          "passed": true,
          "content": "护栏检查: {rule_name} - 通过"
        }
      ]
    }
  ]
}

## 要求：
1. 每个场景应有 8-15 个步骤
2. 每个场景至少包含一次 handoff
3. 每个场景至少包含一次 tool_call
4. 每个场景至少包含一次业务规则检查
5. 场景名称使用中文
6. 仅输出有效 JSON`;

export function buildArchitecturePrompt(description: AgentDescription, locale: Locale): string {
  const template = locale === 'zh' ? ARCHITECTURE_PROMPT_ZH : ARCHITECTURE_PROMPT_EN;
  return template
    .replace('{intro}', description.intro)
    .replace('{applicable_scenarios}', description.applicable_scenarios)
    .replace('{capabilities}', description.capabilities)
    .replace('{system_connections}', description.system_connections)
    .replace('{business_impact}', description.business_impact)
    .replace('{category}', description.category);
}

export function buildScenariosPrompt(architecture: object, locale: Locale): string {
  const template = locale === 'zh' ? SCENARIOS_PROMPT_ZH : SCENARIOS_PROMPT_EN;
  return template.replace('{architecture}', JSON.stringify(architecture, null, 2));
}
