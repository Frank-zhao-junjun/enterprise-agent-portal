# 企业 Agent 平台 — 项目规范

## 项目概览

企业 Agent 平台（Enterprise Agent Portal）是一个统一入口系统，主 Agent 通过 MCP 协议调用不同领域的本体模型 Server，为用户提供智能问答服务。采用 Hub-and-Spoke 架构，Triage Agent 作为唯一入口路由到专业领域。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **LLM SDK**: coze-coding-dev-sdk (LLMClient)
- **模型**: doubao-seed-1-8-251228

## 目录结构

```
├── public/                    # 静态资源
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/
│   │   │   ├── chat/route.ts          # SSE 流式聊天 API
│   │   │   ├── domains/route.ts       # 领域列表 API
│   │   │   └── mcp/[domain]/route.ts  # MCP Server HTTP 端点 (JSON-RPC)
│   │   ├── layout.tsx         # 根布局 (AppProvider + Header)
│   │   ├── page.tsx           # 主页面 (ChatClient + ArchitectureInfo)
│   │   └── globals.css        # 全局样式
│   ├── components/
│   │   ├── chat/ChatClient.tsx       # 聊天客户端（消息列表+输入+SSE解析）
│   │   ├── domain-selector/DomainSelector.tsx # 领域选择器侧边栏
│   │   ├── layout/
│   │   │   ├── Header.tsx            # 顶部导航
│   │   │   └── ArchitectureInfo.tsx  # 架构说明弹窗
│   │   ├── reasoning/ReasoningChain.tsx # 推理链可视化
│   │   └── ui/                        # shadcn/ui 组件
│   ├── contexts/
│   │   └── app-context.tsx    # 全局状态 (消息、领域、语言)
│   ├── lib/
│   │   ├── domain-registry.ts # 领域注册表 (从 MCP Server 动态获取工具)
│   │   ├── i18n.ts            # 国际化 (中/英)
│   │   ├── mcp-client.ts      # MCP 客户端 (HTTPTransport + MockMCPClient fallback)
│   │   ├── triage-agent.ts    # 主 Agent (LLM意图分类+路由+MCP工具调用+流式回复)
│   │   ├── mcp-server/        # MCP Server 框架
│   │   │   ├── protocol.ts    # JSON-RPC + MCP 协议类型
│   │   │   ├── server.ts      # MCPServer 基类 (工具注册+请求分发)
│   │   │   ├── registry.ts    # Server 注册表 (单例工厂)
│   │   │   ├── http-transport.ts # 客户端 HTTP Transport
│   │   │   └── domains/       # 领域 MCP Server 实现
│   │   │       ├── manufacturing/ # 制造业 (5 工具 + 产线/设备/质量/事件数据)
│   │   │       ├── customer-service/ # 客服 (5 工具 + 客户/工单/FAQ/事件数据)
│   │   │       └── supply-chain/ # 供应链 (5 工具 + 库存/物流/供应商/风险数据)
│   │   └── utils.ts           # cn 工具函数
│   └── types/
│       └── ontology.ts        # 核心类型定义
├── .coze                      # 部署配置
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 核心架构

### 数据流

```
用户输入 → ChatClient (fetch POST /api/chat) → Triage Agent
  → Step 1: LLM 意图分类 (callLLM via coze-coding-dev-sdk)
  → Step 2: 领域路由
  → Step 3: MCP 工具调用 (HTTPTransport → POST /api/mcp/[domain])
  → Step 4: LLM 流式回复生成 (callLLMStream)
← SSE 事件流 (reasoning/content/done/error) ← ChatClient 逐帧解析
```

### MCP Server 架构

每个领域 MCP Server 提供 5 大能力类别的工具，通过 JSON-RPC 2.0 协议通信：

| 领域 | 路径 | 工具数 | 数据集 |
|------|------|--------|--------|
| 制造业 | /api/mcp/manufacturing | 5 | 5产线+8设备+3产品+6事件 |
| 客服 | /api/mcp/customer-service | 5 | 4客户+3订单+4工单+5事件 |
| 供应链 | /api/mcp/supply-chain | 5 | 3仓库+4供应商+5库存+4物流+3风险 |

MCP 协议方法：
- `initialize` — 握手，返回 serverInfo + capabilities
- `tools/list` — 返回工具定义列表
- `tools/call` — 执行工具，传入 name + arguments

### SSE 事件格式

API 返回 `data: {...}\n\n` 格式的 SSE 流，事件类型：
- `reasoning`: 推理步骤更新（status: running/completed/error）
- `content`: 流式文本 chunk
- `done`: 完成事件（含 response、sessionId、domainId）
- `error`: 错误事件

### 领域注册

4 个领域：manufacturing / customer-service / supply-chain / general
每个领域有 5 大能力类别：semantic / behavior / event / governance / api

## 包管理规范

**仅允许使用 pnpm**，严禁 npm 或 yarn。

## 开发规范

### LLM 调用

- 后端统一使用 `coze-coding-dev-sdk` 的 `LLMClient`
- 非流式用 `client.invoke(messages, llmConfig)`
- 流式用 `client.stream(messages, llmConfig)` (AsyncGenerator)
- 必须通过 `HeaderUtils.extractForwardHeaders(request.headers)` 传入请求头
- SDK 仅限后端使用，禁止在前端代码中导入

### 类型安全

- `ReasoningStep.result` 类型为 `Record<string, unknown>`，渲染到 JSX 前必须类型收窄
- `ChatMessage.role` 支持 `'user' | 'assistant' | 'system' | 'agent'`
- MCP 工具调用通过 `IMCPClient` 接口抽象，MockMCPClient 为模拟实现

### 状态管理

全局状态通过 `AppContext` (useReducer) 管理：
- chatMessages: 消息列表
- activeDomainId: 当前选中领域（可选，null 表示自动路由）
- isThinking: Agent 是否正在思考
- locale: 语言切换 (zh/en)
- showArchitectureInfo: 架构说明弹窗

关键状态持久化到 localStorage（locale、activeDomainId）。

### Hydration 注意事项

- `formatTime` 使用 `new Date()`，仅在客户端组件中使用
- 布局中不直接使用 `Date.now()` / `Math.random()`

## 构建和测试命令

- 开发: `pnpm run dev` (端口 5000，HMR)
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`
- 构建: `pnpm run build`
- 生产启动: `pnpm run start`

## API 接口

1. `POST /api/chat` — 流式聊天 API (SSE)
   - Body: `{ message: string, sessionId?: string, forcedDomainId?: string, locale?: 'zh'|'en' }`
   - 返回: SSE 事件流

2. `GET /api/domains` — 获取所有领域
   - 返回: `{ domains: DomainOntology[] }`

3. `POST /api/mcp/[domain]` — MCP Server JSON-RPC 端点
   - Body: `{ jsonrpc: "2.0", id: number, method: string, params?: object }`
   - 方法: `initialize` / `tools/list` / `tools/call`
   - domain: `manufacturing` | `customer-service` | `supply-chain`
