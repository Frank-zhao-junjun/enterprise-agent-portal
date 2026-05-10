# Agent Demo Integration Design

Date: 2026-05-10
Project: Enterprise Agent Portal

## Goal

Merge the reusable demo experience from `D:\AI\EnterpriseAgent\Agent-sample` into the existing `portal` project so the product becomes a single integrated website:

- The portal lists enterprise Agents by business domain.
- Each Agent card exposes a clear demo action.
- Clicking the demo action opens a confirmation and generation flow.
- The backend generates, saves, and updates a fixed demo for that Agent.
- The user is redirected to a stable, shareable demo page after generation.

The first version should prioritize an end-to-end working experience over a full framework migration.

## Current State

### Portal

`portal` is a lightweight static website served by `server.py`.

- `index.html` contains the portal shell.
- `app.js` contains business domain data, Agent data, search, tab rendering, and detail modal logic.
- `styles.css` contains the portal visual system.
- `server.py` serves static files and exposes `/v1/ping`.

There is no database, no generation API, and no demo page yet.

### Agent-sample

`Agent-sample` is a single-file static demo prototype.

- It has a polished three-tab Agent demo experience.
- It hardcodes airline Agents, scenarios, tool calls, guardrails, and handoffs.
- It has no backend API, database, or dynamic data loading.
- Its `schemas/architecture-output.v1.json` is reusable as a contract for generated Agent architectures.

## Product Decision

The Agent name should continue to mean "view Agent details". The generated workflow demo should be a separate explicit action.

Each Agent card should include a demo entry point:

- If no demo exists: `生成演示`
- If a demo exists: `查看演示`
- In the generation modal: `重新生成` is allowed and overwrites the saved demo content.

The user flow is:

1. User clicks `演示` on an Agent card or in the Agent detail modal.
2. Portal opens a confirmation modal showing the selected Agent profile.
3. User confirms generation.
4. Modal switches to a generation progress state.
5. Frontend calls `POST /api/agent-demos/generate`.
6. Backend generates an `AgentDemoSpec` and persists it.
7. If a record already exists for the Agent slug, backend updates it in place.
8. Backend returns a stable URL.
9. Frontend redirects to the demo page.

## Recommended V1 Architecture

Keep the project as a Python-served vanilla HTML/CSS/JS application for V1.

```text
portal/
  index.html
  app.js
  styles.css
  server.py
  demo.html
  demo.js
  demo.css
  schemas/
    architecture-output.v1.json
  data/
    agent_demos.db
  docs/
    superpowers/
      specs/
        2026-05-10-agent-demo-integration-design.md
```

Rationale:

- It matches the current portal implementation style.
- It avoids a premature Next.js migration.
- Python stdlib includes `sqlite3`, so persistence can be added without package installation.
- The demo can be validated quickly in the existing port 5000 flow.

## Backend Design

Upgrade `server.py` from static-only serving into a small API server.

### Storage

Use SQLite at `portal/data/agent_demos.db`.

Table: `agent_demos`

```sql
CREATE TABLE IF NOT EXISTS agent_demos (
  agent_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  source_profile_json TEXT NOT NULL,
  demo_spec_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

The `agent_id` is stable and derived from `categoryId:index` or a generated slug. The `slug` is used in the shareable URL.

### API Endpoints

```text
GET  /api/agent-demos/status?agentId=...
POST /api/agent-demos/generate
GET  /api/agent-demos/{slug}
```

`GET /api/agent-demos/status` returns whether a saved demo exists.

`POST /api/agent-demos/generate` receives the selected Agent profile, generates a new demo, and upserts it by `agent_id`.

`GET /api/agent-demos/{slug}` returns the saved `AgentDemoSpec` for `demo.html`.

## AgentDemoSpec Contract

Use one wrapper object around the reusable architecture and scenarios.

```json
{
  "schema_version": "1.0",
  "agent_id": "finance-1",
  "slug": "finance-expense-review",
  "title": "报销审核机器人演示",
  "source_agent": {
    "name": "报销审核机器人",
    "category_id": "finance",
    "category_name": "财务",
    "summary": "...",
    "scenario": "...",
    "impact": "...",
    "systems": ["OA", "费控", "电子发票"]
  },
  "architecture": {
    "schema_version": "1.0",
    "triage_agent": {},
    "spoke_agents": [],
    "business_rules": [],
    "handoff_matrix": {}
  },
  "scenarios": [],
  "generated_at": "2026-05-10T00:00:00Z"
}
```

The inner `architecture` should align with `schemas/architecture-output.v1.json`.

## Demo Generation Strategy

V1 should use deterministic rule-based generation first. This makes the UI, persistence, and routing testable before any LLM dependency is introduced.

Given an Agent profile, generate:

- One Triage Agent
- Four to six Spoke Agents
- A Hub-and-Spoke handoff matrix
- Business rules covering guardrail, constraint, escalation, and routing
- Two to three scenarios
- Workflow steps including user message, guardrail check, triage response, handoff, tool call, tool output, expert response, and closure

The generated content should use the source Agent's systems, scenario, summary, impact, and category name to stay business-specific.

Later V2 can replace or augment the deterministic generator with an LLM call while keeping the same `AgentDemoSpec` contract.

## Frontend Portal Changes

### Agent Identity

Add stable identity fields when rendering cards:

- `agentId`
- `categoryId`
- `agentIndex`
- `slug`

### Card Actions

Keep card click behavior for details. Add a separate demo button inside each card.

The demo button click handler must stop event propagation so it does not open the detail modal accidentally.

### Generation Modal

Add a dedicated demo generation modal, separate from the existing Agent detail modal.

States:

- Confirming: show Agent name, domain, summary, scenario, systems, and overwrite notice if a demo exists.
- Generating: show progress messages.
- Error: show API error and allow retry.
- Complete: redirect automatically to `demo.html?slug=...`.

## Demo Page Changes

Create `demo.html`, `demo.css`, and `demo.js` from the useful parts of `Agent-sample/index.html`.

Required adaptations:

- Load `slug` from the URL query string.
- Fetch `/api/agent-demos/{slug}`.
- Render all Agents from `AgentDemoSpec.architecture` instead of hardcoded airline data.
- Render scenarios from `AgentDemoSpec.scenarios`.
- Make the architecture SVG dynamic for any spoke count.
- Make context items generic instead of airline-specific.
- Support business rule types: guardrail, constraint, escalation, routing.
- Keep Auto Play, Next Step, Reset, Agent highlighting, event stream, architecture diagram, and handoff matrix.

## Validation

V1 validation should include:

- `GET /v1/ping` still returns 200 JSON.
- `POST /api/agent-demos/generate` creates or updates a saved demo.
- Repeating generation for the same Agent overwrites the existing record.
- `GET /api/agent-demos/{slug}` returns the current saved demo.
- Portal demo button opens the generation modal and redirects after success.
- Demo page loads from saved data and can play a scenario.
- Existing portal search, tabs, and Agent detail modal still work.

## Out Of Scope For V1

- User accounts
- Permissions
- Multi-user collaboration
- Manual demo editor
- LLM provider integration
- Next.js migration
- Cloud database migration

## Implementation Sequence

1. Add schemas and SQLite persistence helpers to `server.py`.
2. Add rule-based `AgentDemoSpec` generator.
3. Add `/api/agent-demos/*` endpoints.
4. Add portal demo button and generation modal.
5. Extract and adapt demo viewer files.
6. Validate with one finance Agent, then test a few Agents across categories.

## Open Questions

1. Should the stable `agent_id` be derived from `categoryId:index`, or should each Agent definition get an explicit id field in `app.js`?
2. Should the share URL be `demo.html?slug=...` for V1, or should `server.py` also support cleaner `/demo/{slug}` paths?
3. Should V1 show `查看演示` status by checking each Agent on page load, or only after the user clicks `演示`?

## Recommendation

Use explicit ids in `app.js` eventually, but for the first implementation derive ids from `categoryId:index` to minimize data churn. Use `demo.html?slug=...` for V1 because it works cleanly with the current static server model. Check demo status lazily when the user clicks the demo button, then improve to eager status badges later.
