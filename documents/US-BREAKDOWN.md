# US Breakdown: Agent Architecture Designer

> 基于 Ralph Loop 方法论 — 最小可交付单元、独立可测、快速反馈循环

## Ralph Loop 核心原则

```
Plan(US) → Implement → Test → Feedback → Next US
     ↑_________________________↓
          每个 US 都可独立交付验证
```

关键约束：
- 每个 US 可独立部署验证，不依赖后续 US
- 每个 US 有明确的验收条件（AC）
- 优先纵向切（一个功能端到端打通），而非横向切（一层做完再做一层）

---

## Sprint 0: 项目基础（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-001 | 初始化 Next.js 项目 | `coze init` nextjs 模板，确认 5000 端口可访问默认页 | `curl localhost:5000` 返回 200 | 无 |
| US-002 | 定义 TypeScript 类型 | 创建 `src/types/architecture.ts`，包含 ArchitectureOutput、AgentDefinition、ToolDefinition、BusinessRule、Scenario、ScenarioStep、AppState 全部接口 | `pnpm ts-check` 无类型错误 | US-001 |
| US-003 | AppState Context 搭建 | 创建 React Context + useReducer，提供 dispatch 和 selector，初始状态为 null/空数组 | 导入 Context 不报错，渲染组件可读取初始 AppState | US-002 |

---

## Sprint 1: LLM 生成架构 — 端到端打通（4 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-010 | API Route: /api/generate-architecture | 后端接收 description + locale，调用 Kimi，返回 SSE 流式 ArchitectureOutput JSON | `curl -X POST -d '{"description":"airline customer service"}' localhost:5000/api/generate-architecture` 返回 SSE 流 + 有效 JSON | US-002, 加载 LLM Skill |
| US-011 | Step 1 输入区 UI | 多行文本框 + "AI 生成架构" 按钮，点击调用 /api/generate-architecture | 页面可输入文本，点击按钮触发 fetch | US-001 |
| US-012 | SSE 流式读取 + loading 状态 | 前端用 getReader 读取 SSE，显示 "正在分析..." 打字机效果 | 点击生成后，页面流式显示思考过程文本 | US-010, US-011 |
| US-013 | LLM 响应解析 + 填充 AppState | SSE 完成后解析 JSON，dispatch 到 AppState，触发其他组件重渲染 | 生成完成后，AppState.architecture 非空，控制台可打印结构 | US-003, US-012 |

**Ralph Loop 里程碑 1：用户输入一句话 → 看到 LLM 生成的完整架构 JSON**

---

## Sprint 2: 表单微调（6 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-020 | Triage Agent 编辑表单 | 显示 Triage Agent 名称、描述、工具列表，字段可编辑，修改即更新 AppState | 修改名称后 AppState.architecture.triage_agent.name 同步变更 | US-013 |
| US-021 | Spoke Agent 增删 | Spoke Agent 列表 + "添加"按钮 + 每项"删除"按钮 | 添加后 AppState 多一个 spoke_agent；删除后少一个且关联 Handoff/Rules 清除 | US-013 |
| US-022 | Spoke Agent 编辑 | 点击 Spoke Agent 展开编辑：名称、描述、图标、颜色 | 修改字段后 AppState 同步 | US-021 |
| US-023 | Tool 增删改 | Agent 详情内工具列表 + 添加/删除/编辑 | 增删改后 AppState 对应 Agent.tools 同步 | US-020 或 US-022 |
| US-024 | Business Rules 增删改 | 规则列表 + 添加按钮，每条规则可编辑 name/type/description/applies_to/trigger_example，可删除 | 增删改后 AppState.architecture.business_rules 同步 | US-013 |
| US-025 | Handoff 矩阵编辑 | NxN 复选框矩阵，勾选切换 Handoff 关系 | 勾选/取消后 AppState.architecture.handoff_matrix 同步 | US-013 |

**Ralph Loop 里程碑 2：用户可手动增删改 Agent/工具/规则/Handoff，AppState 实时一致**

---

## Sprint 3: 实时预览（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-030 | 右侧迷你架构图 SVG | 读取 AppState，动态绘制中心 Triage + 圆周 Spoke + Handoff 连线 | Agent 数量变化时 SVG 自动重绘，连线反映 Handoff 关系 | US-025 |
| US-031 | Agent 列表摘要 | 右侧显示 Agent 卡片列表（名称+图标+颜色），可快速删除 | 删除后 AppState 和 SVG 同步 | US-021 |
| US-032 | 表单 ↔ 预览双向同步 | 表单任意修改 → 右侧预览即时更新 | 修改名称/颜色后 SVG 和摘要 500ms 内刷新 | US-030, US-031 |

**Ralph Loop 里程碑 3：左侧编辑，右侧实时预览，所见即所得**

---

## Sprint 4: LLM 生成场景（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-040 | API Route: /api/generate-scenarios | 后端接收 architecture + locale，调用 Kimi，返回 SSE 流式 Scenario[] | `curl -X POST -d '{...architecture...}' localhost:5000/api/generate-scenarios` 返回有效 Scenario JSON | US-010, 加载 LLM Skill |
| US-041 | Step 3 场景生成按钮 | "AI 生成示例对话" 按钮，调用 API，流式 loading | 点击后流式显示生成过程 | US-040 |
| US-042 | 场景数据填充 AppState | 解析场景 JSON，dispatch 到 AppState.scenarios | 生成完成后 AppState.scenarios 非空 | US-003, US-041 |

**Ralph Loop 里程碑 4：用户点击生成场景，Tab 1 场景选择器可选**

---

## Sprint 5: Tab 1 交互式 Demo — 数据驱动改造（5 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-050 | 聊天面板动态渲染 | 根据 AppState.scenarios 选中场景渲染对话气泡 | 选择场景后显示对应对话 | US-042 |
| US-051 | Agent 视图 — 活跃 Agent 高亮 | 根据当前 step 的 agent 字段高亮对应 Agent | 播放步骤时正确 Agent 高亮 | US-050 |
| US-052 | Agent 视图 — 路由网格 | 从 AppState.architecture 动态生成 Agent 路由网格 | Agent 增减时网格自动调整 | US-013 |
| US-053 | Agent 视图 — Business Rules 状态 | 新增 Rules 面板，4 种类型分色显示当前步骤触发状态 | guardrail 红色、constraint 黄色、escalation 橙色、routing 蓝色 | US-024, US-050 |
| US-054 | Auto Play / Next Step / Reset | 场景播放控制，逐步推进 currentStep | 点击 Next 推进一步，Auto 自动播放，Reset 归零 | US-050 |

**Ralph Loop 里程碑 5：Tab 1 完全数据驱动，可播放 LLM 生成的场景**

---

## Sprint 6: Tab 2 架构图 — 动态生成（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-060 | 动态 SVG 架构图 | 从 AppState 读取 Agent 和 Handoff，动态生成 Hub-and-Spoke 图 | Agent 数量变化时 SVG 正确重绘 | US-030 |
| US-061 | 概念卡片 + Business Rules 卡片 | Hub/Handoff/Guardrails/Business Rules 四个概念卡片 | Business Rules 卡片展示 4 种规则类型 | US-024 |
| US-062 | 4 步流程图 + 技术栈 | 迁移现有流程图和技术栈展示 | 渲染正确 | US-001 |

**Ralph Loop 里程碑 6：Tab 2 完全数据驱动，架构随设计变化实时更新**

---

## Sprint 7: Tab 3 Agent 详情 — 动态生成（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-070 | 动态 Agent 卡片网格 | 从 AppState 生成卡片，点击展开详情 | Agent 数量变化时卡片自动增减 | US-013 |
| US-071 | 卡片详情 — Tools + Handoffs + Applied Rules | 展开后显示工具列表、Handoff 目标、适用的 Business Rules | Applied Rules 正确过滤 applies_to 包含当前 Agent 的规则 | US-024, US-070 |
| US-072 | 动态 Handoff 矩阵 | NxN 矩阵从 AppState 动态生成，有关系的显示箭头徽章 | Agent 增减时矩阵维度正确 | US-025 |

**Ralph Loop 里程碑 7：Tab 3 完全数据驱动，三个 Tab 均反映当前设计**

---

## Sprint 8: 全局功能（5 条）

| US | 标题 | 描述 | AC | 依赖 |
|---|------|------|-----|------|
| US-080 | i18n — 静态文案 | 所有 UI 静态文案支持 EN/ZH 切换 | 切换语言后所有按钮/标题/placeholder 变更 | 全部 Tab |
| US-081 | i18n — LLM locale 参数 | API 请求携带 locale，LLM 生成对应语言内容 | 切换中文后重新生成，返回中文描述 | US-010, US-040 |
| US-082 | 导出 JSON | 按钮点击，下载完整 ArchitectureOutput + Scenarios 的 JSON 文件 | 下载的 JSON 可被重新导入恢复 | US-013 |
| US-083 | 导出 Python | 生成 OpenAI Agents SDK 代码框架，下载 .py | 下载的 .py 包含 Agent/Tool/Handoff 定义 | US-013 |
| US-084 | localStorage 自动保存/恢复 | 每次 AppState 变更自动存储，刷新后自动恢复 | F5 刷新后数据不丢失 | US-003 |

---

## Unit Test 策略

### 测试分层

```
┌─────────────────────────────────────┐
│        E2E Test (test_run)          │  ← API curl 验证
├─────────────────────────────────────┤
│     Component Test (轻量)           │  ← 关键组件渲染验证
├─────────────────────────────────────┤
│     Pure Function Test              │  ← 数据转换 / reducer 逻辑
└─────────────────────────────────────┘
```

### 按 US 类型的测试方法

| US 类型 | 测试方式 | 工具 | 示例 |
|---------|---------|------|------|
| **API Route** | `test_run` + curl | curl | US-010, US-040 |
| **AppState Reducer** | 纯函数测试 | Node.js 脚本 | US-013, US-020~025 |
| **数据转换/解析** | 纯函数测试 | Node.js 脚本 | US-082, US-083 |
| **React 组件渲染** | DOM 验证 | `test_run` curl 抓页面 | US-011, US-050 |
| **SSE 流式** | 集成测试 | curl --no-buffer | US-010, US-040 |
| **SVG 动态生成** | 快照对比 | 目视 + curl | US-030, US-060 |

### 具体 Test Case 对应

**US-010: /api/generate-architecture**

```bash
# TC1: 正常请求返回 SSE
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"description":"airline customer service","locale":"en"}' \
  http://localhost:5000/api/generate-architecture
# 期望: SSE 流，包含 data: {"type":"complete",...}

# TC2: 缺少 description 参数
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"locale":"en"}' \
  http://localhost:5000/api/generate-architecture
# 期望: 400 错误
```

**US-013: AppState 填充（纯函数测试）**

```javascript
// tests/reducer.test.js
const result = appReducer(initialState, {
  type: 'SET_ARCHITECTURE',
  payload: mockArchitectureOutput
});
assert(result.architecture !== null);
assert(result.architecture.triage_agent.name === 'Order Triage');
assert(result.architecture.spoke_agents.length === 3);
```

**US-024: Business Rules 增删改**

```javascript
// 添加规则
const state1 = appReducer(state, {
  type: 'ADD_BUSINESS_RULE',
  payload: { name: 'Test Rule', type: 'guardrail', ... }
});
assert(state1.architecture.business_rules.length === prev + 1);

// 删除规则时关联检查
const state2 = appReducer(state1, { type: 'REMOVE_AGENT', payload: 'Refund Agent' });
// 该 Agent 关联的 Business Rule 的 applies_to 应自动移除该 Agent
```

**US-050: 聊天面板渲染**

```bash
# 通过 curl 验证页面包含场景相关 DOM 结构
curl -s http://localhost:5000 | grep -o 'chat-panel'
```

### 测试执行节奏（Ralph Loop 每轮）

```
实现 US-XXX
    ↓
1. 纯函数测试 (Node.js 脚本) → 快速验证逻辑
2. API 测试 (test_run curl) → 验证后端
3. 页面验证 (curl / 目视) → 验证前端
4. 静态检查 (pnpm ts-check / lint) → 验证类型
    ↓
全部通过 → 标记 completed → 下一个 US
```

---

## 总结

| Sprint | US 数量 | 里程碑 | 核心验证点 |
|--------|---------|--------|-----------|
| Sprint 0 | 3 | 项目基础 | 类型检查通过 |
| Sprint 1 | 4 | LLM 生成架构端到端 | curl 返回有效 JSON |
| Sprint 2 | 6 | 表单微调 | AppState 同步一致 |
| Sprint 3 | 3 | 实时预览 | SVG 动态重绘 |
| Sprint 4 | 3 | LLM 生成场景 | 场景数据填充 |
| Sprint 5 | 5 | Tab 1 数据驱动 | 场景可播放 |
| Sprint 6 | 3 | Tab 2 动态生成 | 架构图随数据变化 |
| Sprint 7 | 3 | Tab 3 动态生成 | 矩阵/卡片正确 |
| Sprint 8 | 5 | 全局功能 | i18n/导出/存储 |
| **合计** | **35** | | |
