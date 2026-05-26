const app = {
  spec: null,
  activeTab: "interactive",
  activeScenario: 0,
  currentStep: 0,
  timer: null,
  autoPlaying: false,
};

const panels = {
  interactive: document.getElementById("tab-interactive"),
  architecture: document.getElementById("tab-architecture"),
  details: document.getElementById("tab-details"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function allAgents() {
  const architecture = app.spec.architecture;
  return [architecture.triage_agent, ...architecture.spoke_agents];
}

function agentById(id) {
  return allAgents().find((agent) => agent.id === id) || app.spec.architecture.triage_agent;
}

function rulesForAgent(agentId) {
  return app.spec.architecture.business_rules.filter((rule) => rule.applies_to.includes(agentId));
}

function toolsForAgent(agentId) {
  return agentById(agentId).tools || [];
}

function currentScenario() {
  return app.spec.scenarios[app.activeScenario] || app.spec.scenarios[0];
}

function scenarioActiveAgent() {
  const scenario = currentScenario();
  let active = "triage";
  for (let index = 0; index < app.currentStep && index < scenario.steps.length; index++) {
    const step = scenario.steps[index];
    if (step.targetAgent) active = step.targetAgent;
    else if (step.agent) active = step.agent;
  }
  return active;
}

function switchTab(tab) {
  app.activeTab = tab;
  document.querySelectorAll(".demo-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  Object.entries(panels).forEach(([key, panel]) => {
    panel.classList.toggle("active", key === tab);
  });
}

async function loadDemo() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    renderLoadError("缺少演示 slug。请从门户点击演示按钮进入。");
    return;
  }

  try {
    const response = await fetch(`/api/agent-demos/${encodeURIComponent(slug)}`);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "演示不存在");
    app.spec = result.data;
    renderShell();
    renderAllTabs();
  } catch (error) {
    renderLoadError(`加载失败：${error.message}`);
  }
}

function renderLoadError(message) {
  document.getElementById("demoSubtitle").textContent = message;
  panels.interactive.innerHTML = `<div class="empty-state"><h2>无法打开演示</h2><p>${escapeHtml(message)}</p></div>`;
}

function renderShell() {
  document.title = app.spec.title;
  document.getElementById("demoKicker").textContent = `${app.spec.source_agent.category_name} · Agent Demo`;
  document.getElementById("demoTitle").textContent = app.spec.title;
  document.getElementById("demoSubtitle").textContent = app.spec.source_agent.summary;
}

function renderAllTabs() {
  renderInteractive();
  renderArchitecture();
  renderDetails();
}

function renderInteractive() {
  const scenario = currentScenario();
  panels.interactive.innerHTML = `
    <div class="scenario-list">
      ${app.spec.scenarios.map((item, index) => `
        <button class="scenario-card ${index === app.activeScenario ? "active" : ""}" type="button" data-scenario="${index}">
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.description)}</p>
        </button>
      `).join("")}
    </div>
    <div class="interactive-layout">
      <section class="chat-panel">
        <div class="panel-head">
          <h2>${escapeHtml(scenario.name)}</h2>
          <div class="panel-actions">
            <button type="button" id="autoPlayButton">${app.autoPlaying ? "暂停" : "自动播放"}</button>
            <button type="button" id="nextStepButton">下一步</button>
            <button type="button" id="resetButton">重置</button>
          </div>
        </div>
        <div class="messages" id="messages"></div>
        <div class="progress-row">
          <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
          <span class="progress-text" id="progressText"></span>
        </div>
      </section>
      <aside class="side-panel">
        <div class="panel-head"><h3>Agent View</h3></div>
        <div class="side-content" id="sideContent"></div>
      </aside>
    </div>
  `;
  renderMessages();
  renderSidePanel();
  wireInteractive();
}

function wireInteractive() {
  panels.interactive.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      stopAutoPlay();
      app.activeScenario = Number(button.dataset.scenario);
      app.currentStep = 0;
      renderInteractive();
    });
  });
  document.getElementById("nextStepButton").addEventListener("click", nextStep);
  document.getElementById("resetButton").addEventListener("click", () => {
    stopAutoPlay();
    app.currentStep = 0;
    renderInteractive();
  });
  document.getElementById("autoPlayButton").addEventListener("click", toggleAutoPlay);
}

function renderMessages() {
  const scenario = currentScenario();
  const messages = document.getElementById("messages");
  const visibleSteps = scenario.steps.slice(0, app.currentStep);
  messages.innerHTML = visibleSteps.filter((step) => step.type === "customer" || step.type === "agent").map((step) => {
    const type = step.type === "customer" ? "customer" : "agent";
    const agent = step.agent ? agentById(step.agent) : null;
    return `
      <div class="msg ${type}">
        <div>
          ${agent ? `<div class="agent-label">${escapeHtml(agent.name)}</div>` : ""}
          <div class="msg-bubble">${escapeHtml(step.content)}</div>
        </div>
      </div>
    `;
  }).join("");
  messages.scrollTop = messages.scrollHeight;
  const total = scenario.steps.length;
  const pct = total ? Math.round((app.currentStep / total) * 100) : 0;
  document.getElementById("progressFill").style.width = `${pct}%`;
  document.getElementById("progressText").textContent = `${app.currentStep} / ${total}`;
}

function renderSidePanel() {
  const activeId = scenarioActiveAgent();
  const activeAgent = agentById(activeId);
  const events = currentScenario().steps.slice(0, app.currentStep).filter((step) => step.type !== "customer" && step.type !== "agent");
  document.getElementById("sideContent").innerHTML = `
    <section>
      <p class="section-title">Active Agent</p>
      <div class="active-agent">
        <div class="agent-icon" style="background:${activeAgent.color}">${escapeHtml(activeAgent.icon)}</div>
        <div><strong>${escapeHtml(activeAgent.name)}</strong><p>${escapeHtml(activeAgent.description)}</p></div>
      </div>
    </section>
    <section>
      <p class="section-title">Agent Routing</p>
      <div class="agent-grid-mini">
        ${allAgents().map((agent) => `<div class="agent-mini ${agent.id === activeId ? "active" : ""}">${escapeHtml(agent.icon)}<br>${escapeHtml(agent.name.replace(/ Agent|智能体|机器人|助手/g, ""))}</div>`).join("")}
      </div>
    </section>
    <section>
      <p class="section-title">Business Rules</p>
      <div class="event-list">
        ${app.spec.architecture.business_rules.map((rule) => `<div class="rule-item"><span class="event-badge">${escapeHtml(rule.type)}</span>${escapeHtml(rule.name)}</div>`).join("")}
      </div>
    </section>
    <section>
      <p class="section-title">Runner Events</p>
      <div class="event-list">
        ${events.length ? events.map((event) => `<div class="event-item"><span class="event-badge">${escapeHtml(event.type)}</span>${escapeHtml(event.content)}</div>`).join("") : `<div class="event-item">等待流程开始</div>`}
      </div>
    </section>
  `;
}

function nextStep() {
  const scenario = currentScenario();
  if (app.currentStep >= scenario.steps.length) return;
  app.currentStep += 1;
  renderMessages();
  renderSidePanel();
}

function toggleAutoPlay() {
  if (app.autoPlaying) {
    stopAutoPlay();
    renderInteractive();
    return;
  }
  app.autoPlaying = true;
  renderInteractive();
  app.timer = setInterval(() => {
    const scenario = currentScenario();
    if (app.currentStep >= scenario.steps.length) {
      stopAutoPlay();
      renderInteractive();
      return;
    }
    app.currentStep += 1;
    renderMessages();
    renderSidePanel();
  }, 850);
}

function stopAutoPlay() {
  app.autoPlaying = false;
  clearInterval(app.timer);
  app.timer = null;
}

function renderArchitecture() {
  const source = app.spec.source_agent;
  panels.architecture.innerHTML = `
    <div class="arch-grid">
      <div class="svg-card">${architectureSvg()}</div>
      <div class="card-list">
        <article class="card"><h3>Hub 机制</h3><p>${escapeHtml(app.spec.architecture.triage_agent.description)}</p></article>
        <article class="card"><h3>Handoff 机制</h3><p>中心调度 Agent 将任务分派给多个专家子 Agent；高频相邻专家可以直接交接，完成后仍可回到 Triage 汇总上下文。</p></article>
        <article class="card"><h3>Guardrails & Rules</h3><p>演示包含 guardrail、constraint、escalation 和 routing 四类规则，用于表达入口护栏、人工确认、升级和回补。</p></article>
        <article class="card"><h3>Runner Events</h3><p>Interactive Demo 会把客户消息、Agent 回复、Handoff、Tool Call 和规则触发统一呈现，便于观察内部流转。</p></article>
        <article class="card"><h3>业务来源</h3><p>${escapeHtml(source.scenario)}</p></article>
      </div>
    </div>
  `;
}

function architectureSvg() {
  const architecture = app.spec.architecture;
  const spokes = architecture.spoke_agents;
  const cx = 420;
  const cy = 285;
  const hubR = 50;
  const spokeR = 42;
  const orbit = 210;
  const points = spokes.map((agent, index) => {
    const angle = (-90 + (360 / spokes.length) * index) * Math.PI / 180;
    return { agent, x: cx + orbit * Math.cos(angle), y: cy + orbit * Math.sin(angle) };
  });
  return `
    <svg viewBox="0 0 840 570" role="img" aria-label="Agent architecture" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/></marker></defs>
      <rect width="840" height="570" rx="18" fill="#f8fbff"/>
      ${points.map(({x, y}) => {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        return `<line x1="${cx + nx * (hubR + 8)}" y1="${cy + ny * (hubR + 8)}" x2="${x - nx * (spokeR + 8)}" y2="${y - ny * (spokeR + 8)}" stroke="#b8c8db" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#arrow)"/>`;
      }).join("")}
      <circle cx="${cx}" cy="${cy}" r="${hubR + 22}" fill="none" stroke="#1f6fd6" opacity=".16"/>
      <circle cx="${cx}" cy="${cy}" r="${hubR}" fill="${architecture.triage_agent.color}"/>
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#fff" font-size="18" font-weight="900">${escapeHtml(architecture.triage_agent.icon)}</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#fff" font-size="10" font-weight="900">TRIAGE</text>
      ${points.map(({agent, x, y}) => `
        <circle cx="${x}" cy="${y}" r="${spokeR}" fill="${agent.color}"/>
        <text x="${x}" y="${y - 3}" text-anchor="middle" fill="#fff" font-size="15" font-weight="900">${escapeHtml(agent.icon)}</text>
        <text x="${x}" y="${y + 16}" text-anchor="middle" fill="#fff" font-size="9" font-weight="900">${escapeHtml(agent.name.slice(0, 8))}</text>
      `).join("")}
    </svg>
  `;
}

function renderDetails() {
  const agents = allAgents();
  panels.details.innerHTML = `
    <div class="agent-cards-grid">
      ${agents.map((agent) => `
        <article class="agent-card">
          <strong>${escapeHtml(agent.icon)} ${escapeHtml(agent.name)}</strong>
          <p>${escapeHtml(agent.description)}</p>
          <div class="tool-list">${toolsForAgent(agent.id).map((tool) => `<span class="chip">${escapeHtml(tool.name)}</span>`).join("")}</div>
          <div class="rule-list">${rulesForAgent(agent.id).map((rule) => `<span class="chip">${escapeHtml(rule.type)} · ${escapeHtml(rule.name)}</span>`).join("")}</div>
        </article>
      `).join("")}
    </div>
    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead><tr><th>From / To</th>${agents.map((agent) => `<th>${escapeHtml(agent.name.slice(0, 8))}</th>`).join("")}</tr></thead>
        <tbody>
          ${agents.map((from) => `<tr><td>${escapeHtml(from.name)}</td>${agents.map((to) => matrixCell(from, to)).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function matrixCell(from, to) {
  if (from.id === to.id) return `<td class="matrix-empty">·</td>`;
  const targets = app.spec.architecture.handoff_matrix[from.id] || [];
  return targets.includes(to.id) ? `<td class="matrix-hit">→</td>` : `<td class="matrix-empty">×</td>`;
}

document.querySelectorAll(".demo-tab").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

loadDemo();
