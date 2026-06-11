# 本体模型平台 (Ontology Platform)

企业 Agent 平台的核心：MCP Server + 领域本体模型。通过 MCP 协议对外提供语义、行为、事件、治理、API 连接等能力。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 类型检查
pnpm ts-check

# 构建生产版本
pnpm run build
```

## 页面

| 路由 | 说明 |
|------|------|
| `/` | 仪表盘 — 平台概览、Server 状态、能力类别统计 |
| `/ontology` | 本体模型 — 浏览领域/类别/工具定义 |
| `/mcp-servers` | MCP Server — Server 状态监控 + 交互式工具测试 |
| `/showcase` | Agent Showcase — 聊天界面测试入口 |

## API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | SSE 流式聊天（Triage Agent） |
| `/api/domains` | GET | 获取所有领域 |
| `/api/mcp/[domain]` | POST | MCP Server JSON-RPC 端点 |

## 领域 MCP Server

| 领域 | 工具数 | 能力类别 |
|------|--------|----------|
| 制造业 (manufacturing) | 5 | 语义/行为/事件/治理/API连接 |
| 客服 (customer-service) | 5 | 语义/行为/事件/治理/API连接 |
| 供应链 (supply-chain) | 5 | 语义/行为/事件/治理/API连接 |

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19, TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **LLM**: coze-coding-dev-sdk (doubao-seed-1-8-251228)
- **Protocol**: MCP (Model Context Protocol) over JSON-RPC 2.0
