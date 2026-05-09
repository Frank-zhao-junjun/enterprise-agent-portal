# SPEC: Agent Architecture Designer

## 1. 项目概述

### 1.1 产品名称
Agent Architecture Designer — 基于 Hub-and-Spoke Multi-Agent Architecture with Guardrails 的交互式架构设计工具

### 1.2 产品定位
帮助用户创建、管理 Agent 的描述性内容（简介/适用场景/能力描述等），自动生成该 Agent 的专属 Multi-Agent 架构演示（主控 Agent + 子 Agent + Handoff 流程 + 业务场景），并支持版本管理与交互式演示。

### 1.3 目标用户
- 希望设计 Multi-Agent 系统的工程师和架构师
- 对 Agent 架构感兴趣的产品经理和技术决策者
- 学习 OpenAI Agents SDK 模式的开发者

### 1.4 核心价值
- Agent 描述性内容按版本保存，不丢失历史
- Demo 按版本生成，同一 Agent 可生成多个演示版本，不覆盖
- LLM 生成 + 人工微调的混合模式（C 模式），兼顾效率与可控性
- 一键演示，交互式展示 Agent 工作流程

---

## 2. 核心概念

### 2.1 Agent（智能体）
用户创建的智能体，是最高级别的容器。一个 Agent 包含：
- 多版本描述性内容
- 每个版本的多个 Demo 版本

### 2.2 Agent Version（描述性内容版本）
Agent 的一个版本快照，包含用户填写的业务描述信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| intro | 简介 | 航空客服助手是一个基于Hub-and-Spoke多智能体架构的客户服务系统... |
| applicableScenarios | 适用场景 | 航班信息查询、客票改签与取消、座位选择与升级... |
| capabilities | 能力描述 | 航班信息查询、座位管理、退款与补偿... |
| systemConnections | 系统连接 | GDS航班管理系统、SEATMAP座位系统、PNR订单系统... |
| businessImpact | 业务效果 | 客服效率提升60%、客户满意度提升25%... |
| category | 所属板块 | 客户服务 |

### 2.3 Demo Version（演示版本）
基于某描述性内容版本，由 LLM 自动生成的完整架构演示，包含：

| 组成部分 | 说明 |
|----------|------|
| 主控 / Triage Agent | 根据 Agent 描述自动生成，作为路由中枢 |
| 子 Agent（Spoke） | 根据业务能力拆分的专业处理 Agent |
| 工具定义 | 每个子 Agent 的工具名称和描述 |
| Handoff 流程 | Agent 之间的转接关系 |
| 业务场景（2-3个） | 典型的用户交互流程 |
| 业务规则 | Guardrail / Constraint / Escalation / Routing 四类规则 |

### 2.4 版本关系示意

```
Agent: 航空客服助手
│
├── 描述性内容版本 v1.0 (2025-05-10)
│   ├── Demo 版本 v1
│   │   ├── Triage Agent + 5 个子 Agent
│   │   └── 3 个业务场景（座位变更/延误补偿/超额退款）
│   └── Demo 版本 v2 (未来重新生成)
│       ├── ...
│
└── 描述性内容版本 v1.1 (未来用户编辑)
    ├── Demo 版本 v1
    └── Demo 版本 v1 (未来重新生成)
```

---

## 3. 数据结构

### 3.1 AgentRecord

```typescript
interface AgentRecord {
  id: string;                        // 唯一标识
  name: string;                      // Agent 展示名称
  createdAt: string;                 // ISO 时间戳
  updatedAt: string;                 // ISO 时间戳
  currentVersion: string;            // 当前激活的描述性内容版本
  versions: AgentVersion[];          // 描述性内容版本列表
}
```

### 3.2 AgentVersion

```typescript
interface AgentVersion {
  version: string;                   // "v1.0", "v1.1"...
  createdAt: string;                 // 创建时间
  description: AgentDescription;   // 描述性内容
  demos: DemoVersion[];            // Demo 版本列表
}
```

### 3.3 AgentDescription

```typescript
interface AgentDescription {
  intro: string;                    // 简介
  applicableScenarios: string;     // 适用场景
  capabilities: string;             // 能力描述
  systemConnections: string;        // 系统连接
  businessImpact: string;          // 业务效果
  category: string;                 // 所属板块
}
```

### 3.4 DemoVersion

```typescript
interface DemoVersion {
  version: string;                  // "v1", "v2"...
  createdAt: string;
  architecture: ArchitectureOutput; // 生成的完整架构
  scenarios: Scenario[];            // 业务场景
}
```

### 3.5 ArchitectureOutput（对齐 JSON Schema v1.0）

符合 `schemas/architecture-output.v1.json` 规范：

```typescript
interface ArchitectureOutput {
  schemaVersion: "1.0";
  triageAgent: SpokeAgent;          // 主控 Agent（Triage）
  spokeAgents: SpokeAgent[];       // 子 Agent 列表
  businessRules: BusinessRule[];   // 业务规则
  handoffMatrix: HandoffMatrix;    // Handoff 关系矩阵
}
```

### 3.6 数据存储

- **本地文件**: `data/agents.json` — 所有 Agent 数据的主副本
- **localStorage**: 浏览器端缓存，加速页面加载
- **V2 扩展**: 后续可接入数据库支持多端同步

---

## 4. 页面结构

### 4.1 整体布局

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + 标题 + [语言切换] [导出]                      │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Agent 列表   │  主内容区（根据选中 Agent 和 Tab 显示）       │
│  ──────────  │                                              │
│              │                                              │
│  [+ 新建]    │                                              │
│              │                                              │
│  📋 航空客服  │                                              │
│  📋 报销审核  │                                              │
│  📋 客服助手  │                                              │
│              │                                              │
│  ──────────  │                                              │
│              │                                              │
│  [保存]      │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 4.2 Agent 选中后 — 主内容区

```
┌─────────────────────────────────────────────────────────────┐
│  航空客服助手                                    [保存]      │
├─────────────────────────────────────────────────────────────┤
│  版本列表: [v1.0✓] [+ 新建版本]                              │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Tab [版本内容] [演示管理] [架构图] [详情]                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Tab 1: 版本内容 — Agent 的描述性内容（可编辑）           ││
│  │  Tab 2: 演示管理 — Demo 版本列表 + 生成新演示            ││
│  │  Tab 3: 架构图 — 当前 Demo 版本的 SVG 架构图            ││
│  │  Tab 4: 详情 — Agent/场景/规则/矩阵的完整信息           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Tab 详细规格

### 5.1 Tab 1 — 版本内容（Agent 描述性内容编辑）

**左侧：版本内容表单（可编辑）**

| 字段 | 类型 | 说明 |
|------|------|------|
| 简介 | 多行文本框 | Agent 的整体描述 |
| 适用场景 | 多行文本框 | 描述适用场景 |
| 能力描述 | 多行文本框 | 核心能力列表 |
| 系统连接 | 多行文本框 | 关联的外部系统 |
| 业务效果 | 多行文本框 | 预期达成的业务指标 |
| 所属板块 | 下拉选择 | 如：客户服务/运营/财务/HR |

**右侧：当前 Demo 版本快捷入口**
- 显示当前 Demo 版本列表
- 点击"演示"按钮直接进入演示模式
- "重新生成演示版"按钮 → 调用 LLM

**底部操作**
- [✨ 生成演示版] — 调用 LLM，基于描述性内容生成新 Demo
- [保存版本] — 保存当前描述性内容（自动创建新版本）

### 5.2 Tab 2 — 演示管理

**Demo 版本列表**

```
┌────────────────────────────────────────────────────────────┐
│ Demo 版本 v1                              2025-05-10       │
│ [演示] [查看架构] [查看场景] [导出] [删除]                 │
│                                                            │
│ 包含: Triage Agent + 5个子Agent, 3个业务场景               │
├────────────────────────────────────────────────────────────┤
│ Demo 版本 v2                              2025-05-12       │
│ [演示] [查看架构] [查看场景] [导出] [删除]                 │
│                                                            │
│ 包含: Triage Agent + 4个子Agent, 2个业务场景               │
└────────────────────────────────────────────────────────────┘
```

**"生成演示版"流程**
1. 点击按钮，显示 loading 状态
2. 调用 LLM，读取当前版本的描述性内容
3. LLM 流式输出思考过程（打字机效果）
4. 生成完成 → 新增 Demo 版本到列表
5. 新版本自动高亮

### 5.3 Tab 3 — 架构图

**动态 SVG 架构图**
- 中心：Triage Agent（主控）
- 周围：子 Agent 按圆周均匀分布
- 连线：Handoff 关系（Triage → 子Agent，子Agent → Triage）
- 颜色：每个 Agent 使用其定义的颜色

**概念卡片（4个）**
- Hub 机制
- Handoff 机制
- Input Guardrails
- Business Rules（4种规则类型）

**4步流程图**（保持）
**技术栈展示**（保持）

### 5.4 Tab 4 — 详情

**Agent 卡片网格**
- 动态数量，从 architecture 读取
- 每个卡片：名称 + 图标 + 颜色 + 描述
- 点击展开：Tools / Handoffs / Applied Rules

**业务场景列表**
- 从 scenarios 读取
- 每个场景：名称 + 步骤数 + 规则触发数
- 点击查看完整对话流程

**Handoff 关系矩阵**
- NxN 动态生成
- 有关系：箭头徽章
- 无关系：浅灰 ✕ 图标

---

## 6. 演示模式

### 6.1 进入演示

从任意 Tab 点击"演示"按钮 → 进入全屏演示模式（覆盖层）

### 6.2 演示界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  [返回] 航空客服助手 - Demo v1 - 座位变更场景     [场景▼]   │
├─────────────────────────────┬───────────────────────────────┤
│                             │                                │
│  聊天面板（左侧 45%）        │  Agent 视图（右侧 55%）        │
│                             │                                │
│  对话气泡（客户/Agent/工具）  │  当前活跃 Agent 高亮          │
│                             │  Agent 路由网格                │
│                             │  上下文状态                    │
│                             │  Business Rules 状态           │
│                             │  Runner 事件流                 │
│                             │                                │
├─────────────────────────────┴───────────────────────────────┤
│  [Auto Play] [⏸ 暂停] [▶ Next Step] [↺ Reset]  Step: 3/10 │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 业务规则状态显示

| 规则类型 | 颜色 | 触发时显示 |
|----------|------|-----------|
| guardrail | 红色 | "❌ 护栏触发：xxx"，流程中断 |
| constraint | 黄色 | "⚠️ 约束触发：xxx"，操作受限 |
| escalation | 橙色 | "🔶 升级触发：xxx"，转人工 |
| routing | 蓝色 | "🔵 路由切换：从 A → B" |

---

## 7. LLM 集成

### 7.1 两次调用时机

| 时机 | 调用内容 | LLM 输入 | LLM 输出 |
|------|----------|---------|---------|
| 生成演示版 | 基于描述性内容生成架构 | description 全部字段 + system prompt | ArchitectureOutput + Scenarios[] |
| 微调辅助（可选） | 优化描述性内容 | 用户粗糙描述 + system prompt | 规范化描述性内容 |

### 7.2 LLM System Prompt 要点

```
你是 Hub-and-Spoke Multi-Agent 架构设计师。
根据 Agent 的描述性内容，设计该 Agent 的专属 Multi-Agent 演示系统：
1. 1个 Triage Agent（路由中枢）+ N个 Spoke Agent（专业处理）
2. 每个 Spoke Agent 的名称、描述、图标、颜色、工具
3. Handoff 关系：Triage ↔ 各 Spoke
4. 业务规则（4种类型）：至少 guardrail x1, constraint x1, escalation x1
5. 2-3个典型业务场景的完整对话流程

返回严格 JSON 格式（符合 schemas/architecture-output.v1.json）
```

### 7.3 API Routes

| 端点 | 方法 | 请求体 | 响应 |
|------|------|--------|------|
| `/api/generate-demo` | POST | `{ description: AgentDescription, locale: "zh" \| "en" }` | SSE 流式 ArchitectureOutput + Scenarios |
| `/api/refine-description` | POST | `{ roughDescription: string, locale: string }` | SSE 流式 AgentDescription（可选 V2） |

---

## 8. 中英文国际化

### 8.1 静态 UI 文案
- 右上角 [EN / 中文] 切换按钮
- 所有按钮、标题、标签、placeholder 支持中英文

### 8.2 数据内容
- Agent 描述性内容以用户输入语言保存
- Demo 架构生成时携带 `locale` 参数，LLM 输出对应语言
- 多语言模式下，UI 显示对应语言版本的字段

---

## 9. 导出功能

| 导出类型 | 格式 | 内容 |
|----------|------|------|
| JSON | `.json` | AgentRecord 完整数据（含所有版本） |
| Python | `.py` | OpenAI Agents SDK 代码框架 |
| HTML | `.html` | 可独立分享的静态演示页 |

---

## 10. 技术栈（与 SPEC.md 旧版一致）

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | 前后端一体，API Routes |
| 语言 | TypeScript 5 | 类型安全 |
| UI | React 19 + shadcn/ui + Tailwind CSS 4 | 组件库 + 样式 |
| 图标 | Lucide Icons | 统一图标风格 |
| LLM | Kimi (Moonshot) | 演示生成 |
| LLM 集成 | coze-coding-dev-sdk (LLM Skill) | 调用 Kimi API |
| 数据存储 | `data/agents.json` + localStorage | 本地文件 + 浏览器缓存 |
| 端口 | 5000 | 唯一服务端口 |

---

## 11. 非功能性要求

| 维度 | 要求 |
|------|------|
| 首屏加载 | ≤ 2s |
| LLM 响应 | 流式输出，首 token ≤ 3s |
| 中英文 | 全覆盖 |
| 响应式 | 最小支持 1280px |
| 数据持久化 | 每次变更自动保存到 `data/agents.json` |
| 错误处理 | LLM 失败时友好提示，不阻断已生成数据 |

---

## 12. 第一版范围（V1）

**包含**
- Agent 增删改查（描述性内容 + Demo 版本）
- LLM 生成演示版（架构 + 场景）
- 交互式演示播放（Tab 1 的演示模式）
- 架构图动态生成
- Agent 详情动态展示
- Handoff 矩阵可视化
- 中英文切换
- 数据持久化到 `data/agents.json`
- 预置 Agent 示例（航空客服助手）

**不包含（V2）**
- Tool 参数定义
- 多 Agent 场景下的跨 Agent 协作
- 数据库后端
- 用户账号系统
- 多人协作
- 自定义场景编辑器（用户手写对话步骤）

---

## 13. 已有数据示例

### 13.1 航空客服助手（预置）

参见 `data/agents.json`，包含：
- **1个 Triage Agent**: 报销受理路由
- **5个 Spoke Agent**: 发票识别 / 费用政策校验 / 重复报销检测 / 预算占用检查 / 异常升级
- **3个 Demo 场景**: 座位变更 / 航班延误 / 护栏触发（超额退款）
- **4条业务规则**: 退款上限 / 延误补偿 / 重复问题升级 / 复杂订单路由

### 13.2 JSON Schema

完整数据结构定义参见 `schemas/architecture-output.v1.json`
