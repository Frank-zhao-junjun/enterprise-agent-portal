# SPEC: Agent Architecture Designer

## 1. 项目概述

### 1.1 产品名称
Agent Architecture Designer — 基于 Hub-and-Spoke Multi-Agent Architecture with Guardrails 的交互式架构设计工具

### 1.2 产品定位
帮助用户通过自然语言描述业务场景，自动生成符合 Hub-and-Spoke 模式的 Multi-Agent 架构，并提供可视化预览、交互式微调和导出能力。

### 1.3 目标用户
- 希望设计 Multi-Agent 系统的工程师和架构师
- 对 Agent 架构感兴趣的产品经理和技术决策者
- 学习 OpenAI Agents SDK 模式的开发者

### 1.4 核心价值
- 从一句话描述到完整架构，降低 Multi-Agent 系统的设计门槛
- 所见即所得的可视化架构预览
- LLM 生成 + 人工微调的混合模式（C 模式），兼顾效率与可控性

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | 前后端一体，API Routes 支持 |
| 语言 | TypeScript 5 | 类型安全 |
| UI | React 19 + shadcn/ui + Tailwind CSS 4 | 组件库 + 样式 |
| 图标 | Lucide Icons | 统一图标风格 |
| LLM | Kimi (Moonshot) | 架构生成 + 场景生成 |
| LLM 集成 | coze-coding-dev-sdk (LLM Skill) | 调用 Kimi API |
| 本地存储 | localStorage | 保存/加载用户设计 |
| 端口 | 5000 | 唯一服务端口 |

---

## 3. 功能规格

### 3.1 Tab 0 — Agent Designer（核心新增）

#### 3.1.1 Step 1: 场景描述 + AI 生成

**输入区：**
- 多行文本框，placeholder 提示用户描述业务场景
- "✨ AI 生成架构" 按钮
- 生成中显示流式 loading 状态（打字机效果展示 LLM 思考过程）

**LLM 输出结构：**

```typescript
interface ArchitectureOutput {
  triage_agent: AgentDefinition;
  spoke_agents: AgentDefinition[];
  business_rules: BusinessRule[];
  handoff_matrix: Record<string, string[]>;
}

interface AgentDefinition {
  name: string;
  description: string;
  icon: string;           // emoji 图标
  color: string;          // hex 色值
  tools: ToolDefinition[];
}

interface ToolDefinition {
  name: string;
  description: string;
  // params 暂不做，后续迭代
}

interface BusinessRule {
  name: string;
  type: 'guardrail' | 'constraint' | 'escalation' | 'routing';
  description: string;
  applies_to: string[];      // Agent 名称列表
  trigger_example: string;
}
```

**LLM Prompt 规范：**

第一次调用（生成架构）：
- System Prompt 明确要求输出严格 JSON，符合上述结构
- 要求包含至少 1 条 guardrail、1 条 constraint、1 条 escalation 规则
- 要求工具名称使用 snake_case，描述使用自然语言
- 要求 Handoff 遵循 Hub-and-Spoke 模式：Triage → 所有 Spoke，所有 Spoke → Triage

第二次调用（生成场景）：
- 接收已确认的架构 JSON
- 生成 3 个典型交互场景（包含对话步骤、Agent 路由、工具调用、业务规则触发）

**后端 API：**

| 端点 | 方法 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| `/api/generate-architecture` | POST | `{ "description": string, "locale": "en" \| "zh" }` | SSE 流式 JSON | 生成 Agent 架构 |
| `/api/generate-scenarios` | POST | `{ "architecture": ArchitectureOutput, "locale": "en" \| "zh" }` | SSE 流式 JSON | 生成示例场景 |

两个 API 均使用 SSE 流式输出，Content-Type: `text/event-stream`。

#### 3.1.2 Step 2: 表单微调

**左侧表单区（可编辑）：**

| 区域 | 字段 | 操作 |
|------|------|------|
| Triage Agent | 名称、描述 | 编辑 |
| Triage Agent Tools | 工具列表（名称+描述） | 增/删/改 |
| Spoke Agents | Agent 列表 | 增/删 |
| Spoke Agent 详情 | 名称、描述、图标、颜色、工具 | 编辑 |
| Business Rules | 规则列表 | 增/删 |
| Business Rule 详情 | 名称、类型、描述、适用Agent、触发示例 | 编辑 |
| Handoff 关系 | 矩阵复选框 | 勾选切换 |

**右侧实时预览区：**
- 迷你架构图 SVG（动态更新）
- Agent 列表摘要（可快速增删）

**交互规则：**
- 表单任意字段修改 → 立即更新 AppState → 右侧预览刷新 + 其他 Tab 同步
- 删除 Agent 时自动清除相关 Handoff 和 Business Rule 关联
- 切换 Agent 图标/颜色时预览即时更新

#### 3.1.3 Step 3: 生成示例场景

- "✨ AI 生成示例对话" 按钮
- 基于当前架构调用 `/api/generate-scenarios`
- 生成结果自动填充到 Tab 1 的场景列表中

### 3.2 Tab 1 — 交互式 Demo（改造为数据驱动）

**与现有功能一致，但数据来源从硬编码改为 AppState：**

- 左侧聊天面板：根据选中场景的对话数据渲染
- 右侧 Agent 视图：
  - 当前活跃 Agent 高亮（来自 AppState）
  - Agent 路由网格（来自 AppState.agents）
  - 对话上下文状态
  - Business Rules 状态面板（新增，4 种类型分色显示）
    - Guardrail 触发 → 红色拦截
    - Constraint 触发 → 黄色警告
    - Escalation 触发 → 橙色转人工
    - Routing 触发 → 蓝色 Agent 切换
  - Runner 事件列表

- 场景选择器：下拉选择不同场景（LLM 生成的 + 用户自建的）
- Auto Play / Next Step / Reset 控制（保持不变）

### 3.3 Tab 2 — 架构图（改造为动态生成）

**与现有布局一致，内容动态化：**

- Hub-and-Spoke SVG 架构图：
  - 中心 Triage Agent
  - 周围 Spoke Agent 数量不固定，按圆周均匀分布
  - 连线表示 Handoff 关系，Triage→Spoke 单向，Spoke→Triage 双向
  - 动态生成 SVG，Agent 数量变化时自动调整布局

- 概念卡片（3+1 个）：
  - Hub 机制
  - Handoff 机制
  - Input Guardrails
  - **Business Rules**（新增）— 展示 4 种规则类型及说明

- 4 步流程图（保持不变）
- 技术栈展示（保持不变）

### 3.4 Tab 3 — Agent 详情（改造为数据驱动）

- Agent 卡片网格：数量不固定，根据 AppState 动态生成
- 卡片展开详情：
  - Tools 列表（名称 + 描述）
  - Handoff 目标列表
  - **Applied Rules**（新增）— 列出作用于该 Agent 的业务规则
- Handoff 关系矩阵：NxN 动态生成，行列为当前所有 Agent

### 3.5 全局功能

#### 3.5.1 中英文切换
- 右上角语言切换按钮（EN / 中文）
- 覆盖所有 UI 文案、LLM 生成的描述文本
- LLM 请求携带 `locale` 参数，生成对应语言的内容

#### 3.5.2 导出

| 导出类型 | 格式 | 说明 |
|----------|------|------|
| JSON | `.json` | 完整架构数据，可重新导入 |
| Python | `.py` | OpenAI Agents SDK 代码框架 |
| HTML | `.html` | 可独立分享的静态展示页 |

#### 3.5.3 本地存储
- 自动保存当前设计到 localStorage
- 页面刷新后自动恢复
- 支持多个设计方案的管理（列表 + 加载 + 删除）

---

## 4. 页面列表

| 页面文件路径 | 标题 | 说明 |
|-------------|------|------|
| `/` (home) | Agent Architecture Designer | 单页应用，4 个 Tab 切换 |

单页应用，所有功能在一个页面内通过 Tab 切换完成。

---

## 5. 数据流

```
用户输入描述
    │
    ▼
POST /api/generate-architecture (SSE 流式)
    │
    ▼
LLM (Kimi) 返回 ArchitectureOutput JSON
    │
    ▼
填充 AppState ──────────────────────────┐
    │                                    │
    ▼                                    ▼
表单可编辑                    Tab 1/2/3 实时预览
    │
    │ 用户微调
    ▼
AppState 更新 ─────────────── Tab 1/2/3 实时刷新
    │
    │ 点击"生成场景"
    ▼
POST /api/generate-scenarios (SSE 流式)
    │
    ▼
LLM (Kimi) 返回场景数据
    │
    ▼
填充 AppState.scenarios → Tab 1 场景选择器更新
```

---

## 6. AppState 完整结构

```typescript
interface AppState {
  // 架构数据
  architecture: ArchitectureOutput | null;

  // 场景数据
  scenarios: Scenario[];

  // UI 状态
  activeTab: 0 | 1 | 2 | 3;
  activeScenario: number;
  currentStep: number;
  isAutoPlaying: boolean;
  locale: 'en' | 'zh';

  // 设计方案管理
  savedDesigns: SavedDesign[];
}

interface Scenario {
  name: string;
  description: string;
  steps: ScenarioStep[];
}

interface ScenarioStep {
  type: 'customer' | 'agent' | 'tool_call' | 'handoff' | 'guardrail' | 'constraint' | 'escalation' | 'routing';
  agent?: string;
  content: string;
  targetAgent?: string;
  toolName?: string;
  ruleName?: string;
  ruleType?: 'guardrail' | 'constraint' | 'escalation' | 'routing';
  passed?: boolean;        // for guardrail
}

interface SavedDesign {
  id: string;
  name: string;
  createdAt: number;
  architecture: ArchitectureOutput;
  scenarios: Scenario[];
}
```

---

## 7. API 规格

### 7.1 POST /api/generate-architecture

**请求：**

```json
{
  "description": "电商客服系统，处理退款、物流查询、商品咨询",
  "locale": "zh"
}
```

**响应：** SSE 流式

```
data: {"type":"thinking","content":"正在分析业务场景..."}

data: {"type":"partial","content":{"triage_agent":{"name":"Order Triage"...}}}

data: {"type":"complete","content":{...完整 ArchitectureOutput}}
```

### 7.2 POST /api/generate-scenarios

**请求：**

```json
{
  "architecture": { ... ArchitectureOutput },
  "locale": "zh"
}
```

**响应：** SSE 流式，格式同上，最终输出 `Scenario[]`

---

## 8. 非功能性要求

| 维度 | 要求 |
|------|------|
| 首屏加载 | ≤ 2s（骨架屏 + 懒加载非首屏内容） |
| LLM 响应 | 流式输出，首 token ≤ 3s |
| 中英文 | 全覆盖，无遗漏 |
| 响应式 | 最小支持 1280px 宽度，Tab 0 左右分栏在小屏下堆叠 |
| 数据持久化 | localStorage 自动保存，刷新不丢失 |
| 错误处理 | LLM 调用失败时显示友好错误提示，不阻断已生成的数据 |

---

## 9. 不在第一版范围内

| 功能 | 原因 | 计划 |
|------|------|------|
| Tool params（参数定义） | 降低复杂度 | V2 |
| 多人协作 | 需要数据库 | V2 |
| 用户账号系统 | 需要鉴权 | V3 |
| 数据库持久化 | localStorage 足够 V1 | V2 |
| 自定义场景编辑器（用户手写对话步骤） | 复杂度高 | V2 |
