export type Locale = 'en' | 'zh';
export type I18NKey = string;

export interface I18NStrings {
  // App
  app_title: string;
  app_subtitle: string;
  tab_designer: string;
  tab_interactive_demo: string;
  tab_architecture: string;
  tab_agent_details: string;
  // Buttons
  btn_generate_demo: string;
  btn_demo: string;
  btn_new_agent: string;
  btn_save: string;
  btn_export_json: string;
  btn_export_python: string;
  btn_demo_fullscreen: string;
  btn_close: string;
  btn_prev: string;
  btn_next: string;
  btn_reset: string;
  btn_auto_play: string;
  btn_pause: string;
  btn_back: string;
  btn_save_version: string;
  btn_edit: string;
  btn_delete: string;
  btn_add: string;
  btn_view_demo: string;
  btn_generate_scenarios: string;
  // Labels
  label_version: string;
  label_demo: string;
  label_demos: string;
  label_versions: string;
  label_description: string;
  label_intro: string;
  label_applicable_scenarios: string;
  label_capabilities: string;
  label_system_connections: string;
  label_business_impact: string;
  label_category: string;
  label_tools: string;
  label_rules: string;
  label_handoffs: string;
  label_applied_rules: string;
  label_triage_agent: string;
  label_spoke_agents: string;
  label_business_rules: string;
  label_handoff_matrix: string;
  label_active_agent: string;
  label_agent_routing: string;
  label_context: string;
  label_guardrails: string;
  label_runner_events: string;
  label_steps: string;
  label_generate_architecture: string;
  label_generate_scenarios: string;
  label_step1_description: string;
  label_step2_refine: string;
  label_step3_scenarios: string;
  label_no_agent_selected: string;
  label_no_version_selected: string;
  label_no_demo: string;
  label_no_demo_yet: string;
  label_no_demo_hint: string;
  label_generating: string;
  label_generation_failed: string;
  label_thinking: string;
  label_no_agents: string;
  label_no_agents_yet: string;
  label_no_demos: string;
  label_no_versions: string;
  label_generate_hint: string;
  label_no_preview: string;
  label_agents: string;
  label_empty: string;
  label_empty_description: string;
  label_click_to_fill: string;
  label_select_agent: string;
  label_or_create: string;
  btn_create_agent: string;
  label_scenarios: string;
  label_new_version: string;
  label_handoff_exists: string;
  label_no_handoff: string;
  section_agents: string;
  section_handoff_matrix: string;
  section_business_rules_detail: string;
  label_trigger_example: string;
  // Field labels
  field_intro: string;
  field_scenarios: string;
  field_capabilities: string;
  field_connections: string;
  field_impact: string;
  field_category: string;
  field_intro_placeholder: string;
  field_scenarios_placeholder: string;
  field_capabilities_placeholder: string;
  field_connections_placeholder: string;
  field_impact_placeholder: string;
  field_category_placeholder: string;
  // Placeholders
  label_agent_name: string;
  label_agent_icon: string;
  label_agent_color: string;
  label_agent_description: string;
  label_rule_name: string;
  label_rule_type: string;
  label_rule_description: string;
  label_rule_trigger: string;
  label_rule_applies_to: string;
  label_tool_name: string;
  label_tool_description: string;
  label_add_agent: string;
  label_add_version: string;
  label_add_demo: string;
  label_add_rule: string;
  label_add_tool: string;
  // Rule types
  rule_guardrail: string;
  rule_constraint: string;
  rule_escalation: string;
  rule_routing: string;
  // Messages
  msg_no_agent_selected: string;
  msg_generate_demo_first: string;
  msg_demo_generated: string;
  // Status
  status_passed: string;
  status_failed: string;
  status_pending: string;
  status_active: string;
  // Architecture
  label_concept_hub: string;
  label_concept_handoff: string;
  label_concept_guardrail: string;
  label_concept_rules: string;
  label_flow_step1: string;
  label_flow_step2: string;
  label_flow_step3: string;
  label_flow_step4: string;
  label_tech_stack: string;
  label_from: string;
  label_to: string;
  label_scenario: string;
  label_customer: string;
  label_agent_step: string;
  label_tool_call: string;
  // Badges
  tab_designer_badge: string;
  tab_interactive_demo_badge: string;
  tab_architecture_badge: string;
  tab_agent_details_badge: string;
  btn_generate_demo_badge: string;
  btn_new_agent_badge: string;
  btn_export_json_badge: string;
  btn_export_python_badge: string;
  label_tools_badge: string;
  label_rules_badge: string;
  label_handoffs_badge: string;
  label_applied_rules_badge: string;
  label_triage_agent_badge: string;
  label_spoke_agents_badge: string;
  label_business_rules_badge: string;
  label_handoff_matrix_badge: string;
  label_active_agent_badge: string;
  label_guardrails_badge: string;
  label_runner_events_badge: string;
  label_no_agent_selected_badge: string;
  label_no_demo_yet_badge: string;
  label_no_preview_badge: string;
  label_no_agents_yet_badge: string;
  label_generate_hint_badge: string;
  label_no_demo_hint_badge: string;
  section_agents_badge: string;
  section_handoff_matrix_badge: string;
  section_business_rules_detail_badge: string;
}

const i18nData: Record<Locale, I18NStrings> = {
  en: {
    app_title: 'Agent Architecture Designer',
    app_subtitle: 'Hub-and-Spoke Multi-Agent System Design Tool',
    tab_designer: 'Designer',
    tab_interactive_demo: 'Interactive Demo',
    tab_architecture: 'Architecture',
    tab_agent_details: 'Details',
    btn_generate_demo: 'Generate Demo',
    btn_demo: 'Demo',
    btn_new_agent: 'New Agent',
    btn_save: 'Save',
    btn_export_json: 'Export JSON',
    btn_export_python: 'Export Python',
    btn_demo_fullscreen: 'Fullscreen',
    btn_close: 'Close',
    btn_prev: 'Previous',
    btn_next: 'Next',
    btn_reset: 'Reset',
    btn_auto_play: 'Auto Play',
    btn_pause: 'Pause',
    btn_back: 'Back',
    btn_save_version: 'Save Version',
    btn_edit: 'Edit',
    btn_delete: 'Delete',
    btn_add: 'Add',
    btn_view_demo: 'View Demo',
    btn_generate_scenarios: 'Generate Scenarios',
    label_version: 'Version',
    label_demo: 'Demo',
    label_demos: 'Demos',
    label_versions: 'Versions',
    label_description: 'Description',
    label_intro: 'Introduction',
    label_applicable_scenarios: 'Applicable Scenarios',
    label_capabilities: 'Capabilities',
    label_system_connections: 'System Connections',
    label_business_impact: 'Business Impact',
    label_category: 'Category',
    label_tools: 'Tools',
    label_rules: 'Rules',
    label_handoffs: 'Handoffs',
    label_applied_rules: 'Applied Rules',
    label_triage_agent: 'Triage Agent',
    label_spoke_agents: 'Spoke Agents',
    label_business_rules: 'Business Rules',
    label_handoff_matrix: 'Handoff Matrix',
    label_active_agent: 'Active Agent',
    label_agent_routing: 'Agent Routing',
    label_context: 'Context',
    label_guardrails: 'Guardrails',
    label_runner_events: 'Runner Events',
    label_steps: 'Steps',
    label_generate_architecture: 'Generate Architecture',
    label_generate_scenarios: 'Generate Scenarios',
    label_step1_description: 'Step 1: Describe your Agent',
    label_step2_refine: 'Step 2: Edit & Refine',
    label_step3_scenarios: 'Step 3: Generate Scenarios',
    label_no_agent_selected: 'No Agent Selected',
    label_no_version_selected: 'No Version Selected',
    label_no_demo: 'No Demo',
    label_no_demo_yet: 'No demo yet',
    label_no_demo_hint: 'Click "Generate Demo" above to create',
    label_generating: 'Generating...',
    label_generation_failed: 'Generation failed',
    label_thinking: 'Thinking...',
    label_no_agents: 'No agents yet. Click "New Agent" to get started.',
    label_no_agents_yet: 'No agents yet',
    label_no_demos: 'No demos yet',
    label_no_versions: 'No versions yet',
    label_generate_hint: 'Click "Generate Demo" to create one',
    label_no_preview: 'Generate a demo to see the architecture preview',
    label_agents: 'Agents',
    label_empty: '—',
    label_empty_description: 'Click to fill in the description',
    label_click_to_fill: 'Click above to fill in description details',
    label_select_agent: 'Select an Agent',
    label_or_create: 'or create a new one',
    btn_create_agent: 'Create Agent',
    label_scenarios: 'scenarios',
    label_new_version: 'New Version',
    label_handoff_exists: 'Has Handoff',
    label_no_handoff: 'No Direct Handoff',
    section_agents: 'Agent List',
    section_handoff_matrix: 'Handoff Matrix',
    section_business_rules_detail: 'Business Rules',
    label_trigger_example: 'Trigger Example',
    field_intro: 'Introduction',
    field_scenarios: 'Applicable Scenarios',
    field_capabilities: 'Capabilities',
    field_connections: 'System Connections',
    field_impact: 'Business Impact',
    field_category: 'Category',
    field_intro_placeholder: 'e.g., AI-powered airline customer service assistant',
    field_scenarios_placeholder: 'e.g., Flight inquiries, booking changes, complaint handling',
    field_capabilities_placeholder: 'e.g., Real-time flight status, automatic refund processing',
    field_connections_placeholder: 'e.g., Airline booking system, luggage tracking system',
    field_impact_placeholder: 'e.g., Reduce call center workload by 60%, improve CSAT to 4.5+',
    field_category_placeholder: 'e.g., Airline / Customer Service',
    label_agent_name: 'Name',
    label_agent_icon: 'Icon',
    label_agent_color: 'Color',
    label_agent_description: 'Description',
    label_rule_name: 'Rule Name',
    label_rule_type: 'Rule Type',
    label_rule_description: 'Description',
    label_rule_trigger: 'Trigger Example',
    label_rule_applies_to: 'Applies To',
    label_tool_name: 'Tool Name',
    label_tool_description: 'Description',
    label_add_agent: 'Add Agent',
    label_add_version: 'Add Version',
    label_add_demo: 'Add Demo',
    label_add_rule: 'Add Rule',
    label_add_tool: 'Add Tool',
    rule_guardrail: 'Guardrail',
    rule_constraint: 'Constraint',
    rule_escalation: 'Escalation',
    rule_routing: 'Routing',
    msg_no_agent_selected: 'Please select or create an Agent first.',
    msg_generate_demo_first: 'Please generate a demo first.',
    msg_demo_generated: 'Demo generated successfully!',
    status_passed: 'PASSED',
    status_failed: 'FAILED',
    status_pending: 'PENDING',
    status_active: 'ACTIVE',
    label_concept_hub: 'Hub Mechanism',
    label_concept_handoff: 'Handoff Mechanism',
    label_concept_guardrail: 'Input Guardrails',
    label_concept_rules: 'Business Rules',
    label_flow_step1: 'User Message',
    label_flow_step2: 'Input Guardrails',
    label_flow_step3: 'Agent Processing',
    label_flow_step4: 'Handoff / Response',
    label_tech_stack: 'Technology Stack',
    label_from: 'From',
    label_to: 'To',
    label_scenario: 'Scenario',
    label_customer: 'Customer',
    label_agent_step: 'Agent',
    label_tool_call: 'Tool Call',
    // Badges
    tab_designer_badge: 'Design',
    tab_interactive_demo_badge: 'Demo',
    tab_architecture_badge: 'Architecture',
    tab_agent_details_badge: 'Details',
    btn_generate_demo_badge: '✨',
    btn_new_agent_badge: '+',
    btn_export_json_badge: '↓',
    btn_export_python_badge: '{ }',
    label_tools_badge: '🔧',
    label_rules_badge: '🛡',
    label_handoffs_badge: '🔀',
    label_applied_rules_badge: '📋',
    label_triage_agent_badge: '🎯',
    label_spoke_agents_badge: '⚡',
    label_business_rules_badge: '📐',
    label_handoff_matrix_badge: '🔗',
    label_active_agent_badge: '▶',
    label_guardrails_badge: '🛡',
    label_runner_events_badge: '📜',
    label_no_agent_selected_badge: '⚠',
    label_no_demo_yet_badge: '📭',
    label_no_preview_badge: '🔍',
    label_no_agents_yet_badge: '🤖',
    label_generate_hint_badge: '✨',
    label_no_demo_hint_badge: '💡',
    section_agents_badge: '📋',
    section_handoff_matrix_badge: '🔗',
    section_business_rules_detail_badge: '📐',
  },
  zh: {
    app_title: 'Agent 架构设计器',
    app_subtitle: 'Hub-and-Spoke 多智能体系统设计工具',
    tab_designer: '设计器',
    tab_interactive_demo: '交互演示',
    tab_architecture: '架构图',
    tab_agent_details: '详情',
    btn_generate_demo: '生成演示版',
    btn_demo: '演示',
    btn_new_agent: '新建 Agent',
    btn_save: '保存',
    btn_export_json: '导出 JSON',
    btn_export_python: '导出 Python',
    btn_demo_fullscreen: '全屏',
    btn_close: '关闭',
    btn_prev: '上一步',
    btn_next: '下一步',
    btn_reset: '重置',
    btn_auto_play: '自动播放',
    btn_pause: '暂停',
    btn_back: '返回',
    btn_save_version: '保存版本',
    btn_edit: '编辑',
    btn_delete: '删除',
    btn_add: '添加',
    btn_view_demo: '查看演示',
    btn_generate_scenarios: '生成场景',
    label_version: '版本',
    label_demo: '演示',
    label_demos: '演示列表',
    label_versions: '版本列表',
    label_description: '描述',
    label_intro: '简介',
    label_applicable_scenarios: '适用场景',
    label_capabilities: '能力描述',
    label_system_connections: '系统连接',
    label_business_impact: '业务效果',
    label_category: '所属板块',
    label_tools: '工具',
    label_rules: '规则',
    label_handoffs: 'Handoff',
    label_applied_rules: '适用规则',
    label_triage_agent: 'Triage Agent',
    label_spoke_agents: '子 Agent',
    label_business_rules: '业务规则',
    label_handoff_matrix: 'Handoff 矩阵',
    label_active_agent: '当前 Agent',
    label_agent_routing: 'Agent 路由',
    label_context: '对话上下文',
    label_guardrails: '护栏状态',
    label_runner_events: '运行器事件',
    label_steps: '步骤',
    label_generate_architecture: '生成架构',
    label_generate_scenarios: '生成场景',
    label_step1_description: '第一步：描述你的 Agent',
    label_step2_refine: '第二步：编辑微调',
    label_step3_scenarios: '第三步：生成场景',
    label_no_agent_selected: '未选择 Agent',
    label_no_version_selected: '未选择版本',
    label_no_demo: '无演示',
    label_no_demo_yet: '暂无演示',
    label_no_demo_hint: '点击上方"生成演示版"创建',
    label_generating: '生成中...',
    label_generation_failed: '生成失败',
    label_thinking: '思考中...',
    label_no_agents: '暂无 Agent，点击"新建 Agent"开始',
    label_no_agents_yet: '暂无智能体',
    label_no_demos: '暂无演示',
    label_no_versions: '暂无版本',
    label_generate_hint: '点击"生成演示版"创建',
    label_no_preview: '生成演示版后可预览架构图',
    label_agents: '智能体',
    label_empty: '—',
    label_empty_description: '点击填写描述内容',
    label_click_to_fill: '点击上方填写描述详情',
    label_select_agent: '选择一个智能体',
    label_or_create: '或创建一个新的',
    btn_create_agent: '创建智能体',
    label_scenarios: '个场景',
    label_new_version: '新建版本',
    label_handoff_exists: '有 Handoff 关系',
    label_no_handoff: '无直接 Handoff',
    section_agents: '智能体列表',
    section_handoff_matrix: 'Handoff 关系矩阵',
    section_business_rules_detail: '业务规则详情',
    label_trigger_example: '触发示例',
    field_intro: '简介',
    field_scenarios: '适用场景',
    field_capabilities: '能力描述',
    field_connections: '系统连接',
    field_impact: '业务效果',
    field_category: '所属板块',
    field_intro_placeholder: '例如：AI 驱动的航空客服助手',
    field_scenarios_placeholder: '例如：航班查询、机票改签、投诉处理',
    field_capabilities_placeholder: '例如：实时航班状态查询、自动退款处理',
    field_connections_placeholder: '例如：航空公司订票系统、行李追踪系统',
    field_impact_placeholder: '例如：降低客服中心60%工作量，CSAT提升至4.5+',
    field_category_placeholder: '例如：航空 / 客服',
    label_agent_name: '名称',
    label_agent_icon: '图标',
    label_agent_color: '颜色',
    label_agent_description: '描述',
    label_rule_name: '规则名称',
    label_rule_type: '规则类型',
    label_rule_description: '描述',
    label_rule_trigger: '触发示例',
    label_rule_applies_to: '适用于',
    label_tool_name: '工具名称',
    label_tool_description: '描述',
    label_add_agent: '添加 Agent',
    label_add_version: '添加版本',
    label_add_demo: '添加演示',
    label_add_rule: '添加规则',
    label_add_tool: '添加工具',
    rule_guardrail: '护栏',
    rule_constraint: '约束',
    rule_escalation: '升级',
    rule_routing: '路由',
    msg_no_agent_selected: '请先选择或创建一个 Agent',
    msg_generate_demo_first: '请先生成演示',
    msg_demo_generated: '演示生成成功！',
    status_passed: '通过',
    status_failed: '失败',
    status_pending: '待定',
    status_active: '活跃',
    label_concept_hub: 'Hub 机制',
    label_concept_handoff: 'Handoff 机制',
    label_concept_guardrail: '输入护栏',
    label_concept_rules: '业务规则',
    label_flow_step1: '用户消息',
    label_flow_step2: '输入护栏',
    label_flow_step3: 'Agent 处理',
    label_flow_step4: 'Handoff / 响应',
    label_tech_stack: '技术栈',
    label_from: '从',
    label_to: '到',
    label_scenario: '场景',
    label_customer: '客户',
    label_agent_step: 'Agent',
    label_tool_call: '工具调用',
    // Badges
    tab_designer_badge: '设计',
    tab_interactive_demo_badge: '演示',
    tab_architecture_badge: '架构',
    tab_agent_details_badge: '详情',
    btn_generate_demo_badge: '✨',
    btn_new_agent_badge: '+',
    btn_export_json_badge: '↓',
    btn_export_python_badge: '{ }',
    label_tools_badge: '🔧',
    label_rules_badge: '🛡',
    label_handoffs_badge: '🔀',
    label_applied_rules_badge: '📋',
    label_triage_agent_badge: '🎯',
    label_spoke_agents_badge: '⚡',
    label_business_rules_badge: '📐',
    label_handoff_matrix_badge: '🔗',
    label_active_agent_badge: '▶',
    label_guardrails_badge: '🛡',
    label_runner_events_badge: '📜',
    label_no_agent_selected_badge: '⚠',
    label_no_demo_yet_badge: '📭',
    label_no_preview_badge: '🔍',
    label_no_agents_yet_badge: '🤖',
    label_generate_hint_badge: '✨',
    label_no_demo_hint_badge: '💡',
    section_agents_badge: '📋',
    section_handoff_matrix_badge: '🔗',
    section_business_rules_detail_badge: '📐',
  },
};

// t() returns plain string for JSX rendering
export function t(key: I18NKey, locale: Locale): string {
  return i18nData[locale]?.[key as keyof I18NStrings] ??
    i18nData.en[key as keyof I18NStrings] ?? key;
}

// tBadge() returns the badge variant of a key
export function tBadge(key: I18NKey, locale: Locale): string {
  const badgeKey = `${key}_badge` as keyof I18NStrings;
  return i18nData[locale]?.[badgeKey] ??
    i18nData.en[badgeKey] ?? '•';
}

export function ts(key: I18NKey, locale: Locale): string {
  return i18nData[locale]?.[key as keyof I18NStrings] ??
    i18nData.en[key as keyof I18NStrings] ?? key;
}

export function getRuleTypeName(type: string, locale: Locale): string {
  const map: Record<string, Record<Locale, string>> = {
    guardrail: { zh: '护栏', en: 'Guardrail' },
    constraint: { zh: '约束', en: 'Constraint' },
    escalation: { zh: '升级', en: 'Escalation' },
    routing: { zh: '路由', en: 'Routing' },
  };
  return map[type]?.[locale] || type;
}

export function getRuleTypeColor(type: string): string {
  const colors: Record<string, string> = {
    guardrail: '#ef4444',
    constraint: '#eab308',
    escalation: '#f97316',
    routing: '#3b82f6',
  };
  return colors[type] || '#6b7280';
}

export { i18nData };

export function getAgentName(agent: { name?: string; id?: string } | null | undefined, locale: Locale): string {
  if (!agent) return '';
  return agent.name || agent.id || '';
}
