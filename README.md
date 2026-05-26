# Enterprise Agent Portal

面向企业核心业务板块的 AI Agent 展示门户，覆盖财务、销售与营销、制造与交付、供应链、采购、人力资源、法务合规、客服及售后品质、主数据和经营分析。

## 功能

- 按业务板块浏览企业 Agent 图谱
- 跨全部板块搜索 Agent、场景、业务效果和系统连接
- 以产品化详情页形式查看 Agent 的 Overview、Benefits、Business Value、Additional Information、Required Assets 和相关推荐
- 为每个 Agent 生成固定可分享的多子 Agent 协作演示页，包含 Interactive Demo、Architecture 和 Agent Details
- 使用 SQLite 保存生成结果；同一 Agent 再次生成会覆盖旧演示内容并保持固定入口
- 参考 OpenAI 客服 Agents Demo 的 Hub-and-Spoke 思路，展示 Triage、Handoff、Guardrails、Tool Calls 和 Runner Events
- 提供 `/v1/ping` 健康检查端点，便于生产环境探活

## 使用方式

直接在浏览器中打开 `index.html` 可查看静态门户；如需使用“演示”生成、保存和动态演示页，请通过服务启动：

```bash
python server.py
```

默认端口为 `5000`，也可以通过环境变量覆盖，例如 `PORT=5055 python server.py`。

## 演示生成接口

- `POST /api/agent-demos/generate`：根据 Agent 名称、简介、场景、业务效果和系统连接生成并保存演示
- `GET /api/agent-demos/status?agentId=...`：查询某个 Agent 是否已有已保存演示
- `GET /api/agent-demos/{slug}`：读取固定演示页所需的完整 `AgentDemoSpec`

生成的数据保存在 `data/agent_demos.db`，该文件属于本地运行产物，已被 `.gitignore` 忽略。

生成接口仅接受门户中已注册的 `category:index` 形式 Agent ID，并要求同源请求；这能避免外部请求随意覆盖固定演示页。

## 文件结构

- `index.html`：页面结构
- `styles.css`：视觉样式与响应式布局
- `app.js`：Agent 数据、页签交互、全局搜索、详情弹窗和演示生成入口
- `demo.html`：固定演示页结构
- `demo.css`：演示页三栏、架构图、Agent 卡片和响应式样式
- `demo.js`：从后端读取 `AgentDemoSpec` 并渲染三类演示视图
- `server.py`：静态资源服务、健康检查端点、演示生成 API 和 SQLite 持久化
- `schemas/architecture-output.v1.json`：Hub-and-Spoke 架构输出约束
- `v1/ping`：健康检查静态文件
