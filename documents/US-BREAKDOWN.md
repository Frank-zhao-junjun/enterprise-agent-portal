# US-BREAKDOWN: Agent Architecture Designer

基于 Ralph Loop 方法论 — 最小可交付单元、独立可测、快速反馈循环。

---

## 核心数据流

```
Agent 描述性内容（版本）
         ↓
┌─────────────────────────────────────┐
│       LLM 生成演示版                  │
│  (Triage + Spoke + Handoff + 场景)   │
└─────────────────────────────────────┘
         ↓
    Demo 版本（可演示）
         ↓
   交互式演示播放
```

---

## Sprint 0: 项目基础（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-001 | 初始化 Next.js 项目 | `coze init nextjs`，确认 5000 端口可访问默认页 | `curl localhost:5000` 返回 200 | 无 |
| US-002 | 定义 TypeScript 类型 | 创建 `src/types/agent.ts`，包含 AgentRecord / AgentVersion / AgentDescription / DemoVersion / ArchitectureOutput 等全部接口 | `pnpm ts-check` 无类型错误 | US-001 |
| US-003 | 加载 Agent 数据 | 页面初始化时从 `data/agents.json` 加载 Agent 列表，预置航空客服助手可查看 | 页面加载后 Agent 列表非空 | US-002 |

---

## Sprint 1: Agent 管理 — 增删改查（5 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-010 | Agent 列表侧边栏 | 左侧栏展示 Agent 列表，支持点击选中高亮 | 点击后右侧主内容区显示对应 Agent | US-003 |
| US-011 | 新建 Agent | "新建 Agent"按钮 → 创建新 AgentRecord，name 可编辑，初始为空版本 | 新 Agent 出现在列表中，可选中 | US-003 |
| US-012 | 删除 Agent | 每个 Agent 右侧显示删除按钮，点击确认后删除 | 删除后列表更新，localStorage 同步 | US-010 |
| US-013 | Agent 重命名 | Agent 名称可直接编辑，实时保存 | 编辑后名称更新，所有引用处同步 | US-010 |
| US-014 | 保存到 agents.json | 每次 Agent 数据变更自动/手动保存到 `data/agents.json` | 文件内容与页面状态一致 | US-002 |

---

## Sprint 2: 版本内容管理 — 描述性内容（5 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-020 | 版本列表展示 | Tab 1 顶部显示版本下拉列表，当前版本高亮 | 版本切换后表单内容更新 | US-010 |
| US-021 | 新建描述性内容版本 | "新建版本"按钮 → 创建新 AgentVersion，初始复制当前版本内容 | 新版本出现在下拉列表 | US-020 |
| US-022 | 描述性内容表单 | 6个字段（简介/适用场景/能力描述/系统连接/业务效果/所属板块），多行文本框，实时保存 | 填写内容后 AppState 同步 | US-020 |
| US-023 | 描述性内容版本对比 | 可切换查看历史版本的描述内容（只读） | 历史版本内容正确展示 | US-021 |
| US-024 | 删除描述性内容版本 | 删除非当前版本，保留至少一个版本 | 删除后版本列表正确 | US-020 |

---

## Sprint 3: LLM 生成演示版（4 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-030 | API Route: /api/generate-demo | 接收 description + locale，调用 Kimi，返回 SSE 流式 ArchitectureOutput + Scenarios | `curl -X POST -d '{"description":{...}}' localhost:5000/api/generate-demo` 返回有效 SSE JSON | US-002, LLM Skill |
| US-031 | "生成演示版"按钮 UI | Tab 1 底部显示"✨ 生成演示版"按钮，点击触发 LLM 调用 | 按钮可点击，触发后显示 loading | US-022 |
| US-032 | SSE 流式读取 + 打字机效果 | 前端用 getReader 读取 SSE，流式显示 LLM 思考过程文本 | 页面实时显示"正在分析业务能力..."等过程文本 | US-030 |
| US-033 | Demo 版本创建 | LLM 返回完成后，解析 JSON，创建新 DemoVersion，追加到当前 AgentVersion.demos[] | 新 Demo 版本出现在 Tab 2 列表 | US-003, US-032 |

**里程碑 1：用户填写描述 → 点击生成 → 看到完整的 Agent 架构演示**

---

## Sprint 4: Demo 版本管理（4 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-040 | Demo 版本列表（Tab 2） | Tab 2 展示当前描述性内容版本下的所有 Demo 版本 | Demo 列表正确展示 | US-033 |
| US-041 | Demo 版本详情 | 每个 Demo 显示：版本号/时间/包含内容摘要（Agent数量/场景数量） | 摘要信息准确 | US-040 |
| US-042 | 删除 Demo 版本 | 每个 Demo 可删除，保留至少一个 Demo | 删除后列表正确 | US-040 |
| US-043 | 重新生成演示版 | 同一描述性内容版本可多次"生成演示版"，生成新 Demo 版本（不覆盖旧版） | 每次生成创建新 DemoVersion | US-033 |

---

## Sprint 5: Tab 3 — 架构图动态生成（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-050 | 动态 SVG 架构图 | 从当前 DemoVersion.architecture 读取，动态生成 Hub-and-Spoke 图（Triage 中心 + Spoke 圆周） | Agent 数量变化时 SVG 重绘 | US-033 |
| US-051 | Handoff 连线动态绘制 | 根据 handoffMatrix 绘制连线（Triage → Spoke, Spoke → Triage），动态计算连线起点终点 | 连线正确反映 Handoff 关系 | US-050 |
| US-052 | 概念卡片（4个） | Hub机制 / Handoff机制 / Input Guardrails / Business Rules（4种类型） | 卡片内容正确，Business Rules 卡片展示4种颜色 | US-024 |

---

## Sprint 6: Tab 4 — 详情（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-060 | Agent 卡片网格 | 从 architecture 动态生成 Agent 卡片，点击展开详情 | Agent 数量变化时网格自动调整 | US-033 |
| US-061 | 卡片详情 — Tools/Handoffs/Applied Rules | 展开后显示：工具列表（名称+描述）、Handoff 目标列表、适用于该 Agent 的 Business Rules | Applied Rules 正确过滤 applies_to | US-024, US-060 |
| US-062 | 动态 Handoff 矩阵 + 业务场景列表 | NxN 矩阵从 architecture 动态生成，业务场景从 scenarios 读取列表 | 场景点击可查看详情 | US-033, US-042 |

---

## Sprint 7: 交互式演示播放（Tab 1 演示模式）（5 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-070 | 进入演示模式 | 点击"演示"按钮 → 全屏覆盖层，显示当前 Demo 的第一个场景 | 演示界面正确渲染 | US-033 |
| US-071 | 左侧聊天面板 | 根据当前 step.type 渲染：customer(客户消息) / agent(Agent回复) / tool_call(工具调用) / handoff(转接) / guardrail(constraint/escalation/routing)(规则触发) | 所有 step 类型正确显示 | US-033 |
| US-072 | 右侧 Agent 视图 | 当前活跃 Agent 高亮、路由网格、上下文状态、Business Rules 状态（4色）、Runner 事件流 | 高亮和状态随 step 正确切换 | US-071 |
| US-073 | 播放控制 | Auto Play / 暂停 / Next Step / Reset，currentStep 控制 | 播放/暂停/步进/重置正确工作 | US-071 |
| US-074 | 场景切换 | 顶部下拉切换当前 Demo 的不同场景 | 切换后聊天从头开始，Agent 视图重置 | US-033 |

**里程碑 2：点击演示 → 看到 Agent 完整工作流程的交互式展示**

---

## Sprint 8: 中英文国际化（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-080 | i18n — 静态 UI 文案 | 右上角 EN/中文 切换，所有 UI 静态文案支持 | 切换后所有按钮/标题/标签变更 | 全部 Tab |
| US-081 | i18n — LLM locale 参数 | API 请求携带 locale，LLM 生成对应语言内容 | 中文模式下重新生成返回中文 | US-030 |
| US-082 | i18n — 数据内容显示 | Agent 描述性内容、场景名称等按当前语言显示 | 切换语言后数据内容同步 | US-080 |

---

## Sprint 9: 导出功能（3 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-090 | 导出 JSON | 按钮导出完整 AgentRecord JSON 文件 | 下载的 JSON 可重新加载恢复 | US-014 |
| US-091 | 导出 Python | 生成 OpenAI Agents SDK 代码框架 .py 文件 | 下载的 .py 包含 Agent/Tool/Handoff 定义 | US-033 |
| US-092 | 导出 HTML | 生成可独立分享的静态演示 HTML 文件 | 下载的 HTML 可离线打开运行 | US-071 |

---

## Sprint 10: 预置 Agent 完善（2 条）

| US | 标题 | 描述 | AC | 依赖 |
|----|------|------|-----|------|
| US-100 | 航空客服助手完善 | 完善 `data/agents.json` 中航空客服助手的数据：5个Spoke Agent + 3个场景 + 4条业务规则 | 数据完整，可演示 | 无（预置） |
| US-101 | 更多预置 Agent 示例 | 添加 1-2 个其他行业的预置 Agent 示例（如：报销审核机器人、HR助手） | 列表有多个 Agent 可选 | US-003 |

---

## US 汇总

| Sprint | US 数量 | 里程碑 | 关键验证点 |
|--------|---------|--------|-----------|
| Sprint 0 | 3 | 项目基础 | 类型检查通过，数据加载 |
| Sprint 1 | 5 | Agent 增删改查 | 列表增删改，保存成功 |
| Sprint 2 | 5 | 版本内容管理 | 版本增删改，表单联动 |
| Sprint 3 | 4 | LLM 生成演示 | SSE 流式输出，Demo 创建 |
| Sprint 4 | 4 | Demo 版本管理 | Demo 增删，不覆盖 |
| Sprint 5 | 3 | 架构图动态生成 | SVG 随 Agent 数量变化 |
| Sprint 6 | 3 | Agent 详情动态 | 矩阵/卡片正确 |
| Sprint 7 | 5 | 交互式演示 | 场景播放流畅 |
| Sprint 8 | 3 | 国际化 | 中英文切换正确 |
| Sprint 9 | 3 | 导出功能 | JSON/Python/HTML 导出 |
| Sprint 10 | 2 | 预置 Agent | 预置示例完整 |
| **合计** | **40** | | |

---

## Unit Test 策略

### 测试分层

```
┌─────────────────────────────────────┐
│        API E2E (test_run curl)       │
├─────────────────────────────────────┤
│     组件渲染 (页面 DOM 验证)           │
├─────────────────────────────────────┤
│     Reducer 纯函数 (Node.js)          │
├─────────────────────────────────────┤
│     数据转换/导出 (Node.js)            │
└─────────────────────────────────────┘
```

### 关键 Test Case

**US-030: /api/generate-demo**
```bash
# TC1: 正常请求
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"description":{"intro":"测试","applicableScenarios":"...","capabilities":"...","systemConnections":"...","businessImpact":"...","category":"客服"},"locale":"zh"}' \
  http://localhost:5000/api/generate-demo
# 期望: SSE 流，data:{"type":"complete",...} 包含 triageAgent + spokeAgents + scenarios

# TC2: 缺少必填字段
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"description":{"intro":"测试"},"locale":"zh"}' \
  http://localhost:5000/api/generate-demo
# 期望: 400 错误或 LLM 提示字段缺失
```

**US-022: 描述性内容表单**
```javascript
// TC: 6个字段均保存成功
const newState = updateDescription(state, {
  intro: "新简介",
  applicableScenarios: "新场景",
  capabilities: "新能力",
  systemConnections: "新系统",
  businessImpact: "新效果",
  category: "新板块"
});
assert(newState.currentVersion.description.intro === "新简介");
assert(newState.currentVersion.description.category === "新板块");
```

**US-033: Demo 版本创建（不覆盖）**
```javascript
// TC: 生成新 Demo 后旧 Demo 仍存在
const stateBefore = mockState; // 已有 Demo v1
const stateAfter = addDemoVersion(stateBefore, newDemo);
// stateAfter.demos.length === stateBefore.demos.length + 1
assert(stateAfter.demos[0].version === "v1"); // 旧版保留
assert(stateAfter.demos[1].version === "v2"); // 新版新增
```

**US-061: Applied Rules 过滤**
```javascript
// TC: 规则正确过滤到只包含指定 Agent
const appliedRules = filterRules(allRules, "refund-agent");
// appliedRules 应包含 rule-refund-limit 和 rule-compensation-policy
// 不应包含 rule-escalation（appliesTo 为 triage-agent 和 faq-agent）
```

**US-071: Step 类型渲染**
```javascript
// TC: 每种 step type 正确映射到渲染类型
const stepTypes = ["customer", "agent", "tool_call", "handoff", "guardrail", "constraint", "escalation", "routing"];
stepTypes.forEach(type => {
  const rendered = renderStep({ type, content: "test" });
  assert(rendered !== null); // 每种类型都能渲染
});
```

### 测试执行节奏

```
实现 US-XXX
    ↓
1. 纯函数测试 (Node.js) → 验证逻辑
2. API 测试 (test_run curl) → 验证后端
3. 页面验证 (curl / 目视) → 验证前端
4. 静态检查 (pnpm ts-check) → 验证类型
    ↓
全部通过 → 下一个 US
```
