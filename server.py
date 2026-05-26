from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, unquote, urlparse
import hashlib
import json
import os
import re
import sqlite3

PORT = int(os.environ.get("DEPLOY_RUN_PORT") or os.environ.get("PORT", "5000"))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(DIRECTORY, "data")
DB_PATH = os.path.join(DATA_DIR, "agent_demos.db")
MAX_JSON_BODY_BYTES = 256 * 1024
AGENT_ID_PATTERN = re.compile(r"^[a-z0-9-]+:\d{1,4}$")
PORTAL_AGENT_COUNTS = {
    "analytics": 3,
    "delivery": 12,
    "finance": 10,
    "hr": 4,
    "legal": 2,
    "mdm": 5,
    "procurement": 12,
    "sales": 13,
    "service": 4,
    "supply-chain": 8,
}


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def json_dumps(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def safe_slug(value, fallback):
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", str(value or "").lower()).strip("-")
    if normalized:
        return normalized[:96]
    digest = hashlib.sha1(str(fallback or value or "agent-demo").encode("utf-8")).hexdigest()[:10]
    return f"agent-{digest}"


def validate_portal_agent_identity(raw_agent_id, category_id):
    if not AGENT_ID_PATTERN.fullmatch(raw_agent_id):
        raise ValueError("agentId must be a portal agent id such as finance:1")
    agent_category, index_text = raw_agent_id.split(":", 1)
    if agent_category != category_id:
        raise ValueError("agentId category must match categoryId")
    agent_count = PORTAL_AGENT_COUNTS.get(agent_category)
    if agent_count is None:
        raise ValueError("agentId category is not registered")
    if int(index_text) >= agent_count:
        raise ValueError("agentId index is not registered")


def demo_handoff_matrix(spoke_ids):
    matrix = {"triage": spoke_ids}
    for spoke_id in spoke_ids:
        matrix[spoke_id] = ["triage"]
    direct_paths = [
        ("intake_context", "data_verification"),
        ("data_verification", "rule_analysis"),
        ("rule_analysis", "action_planning"),
        ("action_planning", "closure_audit"),
    ]
    for source_id, target_id in direct_paths:
        if source_id in matrix and target_id in spoke_ids:
            matrix[source_id].append(target_id)
    return matrix


def snake_id(value, fallback):
    normalized = re.sub(r"[^a-zA-Z0-9]+", "_", str(value or "").lower()).strip("_")
    if not normalized:
        normalized = hashlib.sha1(str(fallback or value or "agent").encode("utf-8")).hexdigest()[:10]
    if not re.match(r"^[a-z]", normalized):
        normalized = f"agent_{normalized}"
    return normalized[:64]


def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
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
            )
            """
        )
        conn.commit()


def get_demo_by_slug(slug):
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT demo_spec_json FROM agent_demos WHERE slug = ?",
            (slug,),
        ).fetchone()
    if not row:
        return None
    return json.loads(row[0])


def get_demo_status(agent_id):
    init_db()
    normalized_agent_id = safe_slug(agent_id, agent_id)
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT slug, updated_at FROM agent_demos WHERE agent_id IN (?, ?)",
            (agent_id, normalized_agent_id),
        ).fetchone()
    if not row:
        return {"exists": False, "agentId": agent_id}
    return {
        "exists": True,
        "agentId": agent_id,
        "slug": row[0],
        "demoUrl": f"/demo.html?slug={row[0]}",
        "updatedAt": row[1],
    }


def upsert_demo(source_profile, demo_spec):
    init_db()
    now = utc_now()
    with sqlite3.connect(DB_PATH) as conn:
        slug_owner = conn.execute(
            "SELECT agent_id FROM agent_demos WHERE slug = ? AND agent_id != ?",
            (demo_spec["slug"], demo_spec["agent_id"]),
        ).fetchone()
        if slug_owner:
            raise ValueError("slug is already used by another agent demo")
        existing = conn.execute(
            "SELECT created_at FROM agent_demos WHERE agent_id = ?",
            (demo_spec["agent_id"],),
        ).fetchone()
        created_at = existing[0] if existing else now
        conn.execute(
            """
            INSERT INTO agent_demos (
              agent_id, slug, agent_name, category_id, category_name,
              source_profile_json, demo_spec_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(agent_id) DO UPDATE SET
              slug = excluded.slug,
              agent_name = excluded.agent_name,
              category_id = excluded.category_id,
              category_name = excluded.category_name,
              source_profile_json = excluded.source_profile_json,
              demo_spec_json = excluded.demo_spec_json,
              updated_at = excluded.updated_at
            """,
            (
                demo_spec["agent_id"],
                demo_spec["slug"],
                source_profile["name"],
                source_profile["category_id"],
                source_profile["category_name"],
                json_dumps(source_profile),
                json_dumps(demo_spec),
                created_at,
                now,
            ),
        )
        conn.commit()


def normalize_source_profile(payload):
    name = str(payload.get("agentName") or payload.get("name") or "业务智能体").strip()
    category_id = str(payload.get("categoryId") or payload.get("category_id") or "general").strip()
    raw_agent_id = str(payload.get("agentId") or payload.get("agent_id") or f"{category_id}:{name}").strip()
    validate_portal_agent_identity(raw_agent_id, category_id)
    agent_id = safe_slug(raw_agent_id, f"{category_id}-{name}")
    slug = agent_id
    systems = payload.get("systems") or []
    if isinstance(systems, str):
        systems = [item.strip() for item in re.split(r"[,，、/]", systems) if item.strip()]
    if not systems:
        systems = ["核心业务系统"]
    return {
        "agent_id": agent_id,
        "slug": slug,
        "name": name,
        "category_id": category_id,
        "category_name": str(payload.get("categoryName") or payload.get("category") or payload.get("category_name") or "企业业务").strip(),
        "summary": str(payload.get("summary") or payload.get("capability") or "识别业务状态、判断风险并生成可执行建议。").strip(),
        "scenario": str(payload.get("scenario") or "业务人员提交待处理事项后，系统自动完成识别、校验、分流和闭环跟进。").strip(),
        "impact": str(payload.get("impact") or "提升处理效率，降低人工排查和跨部门沟通成本。").strip(),
        "systems": systems[:8],
    }


def make_tool(name, description):
    return {"name": snake_id(name, name), "description": description}


def build_demo_spec(source):
    focus = re.sub(r"\s*(Agent|机器人|助手|智能体)\s*", "", source["name"]).strip() or source["name"]
    systems_text = "、".join(source["systems"])
    now = utc_now()

    triage_agent = {
        "id": "triage",
        "name": f"{focus}调度 Agent",
        "description": f"接收{source['category_name']}场景中的请求，识别意图、检查边界，并把任务分派给合适的子 Agent。",
        "icon": "◇",
        "color": "#2563eb",
        "tools": [
            make_tool("collect_request_context", f"汇总来自{systems_text}的请求、单据、流程状态和历史记录。"),
            make_tool("route_to_specialist", "根据意图、风险和数据完整性选择下一个处理 Agent。"),
        ],
    }

    spoke_agents = [
        {
            "id": "intake_context",
            "name": "请求受理与上下文 Agent",
            "description": f"围绕“{focus}”收集业务对象、发起人、附件、时间、金额或影响范围等上下文。",
            "icon": "IN",
            "color": "#0891b2",
            "tools": [make_tool("extract_business_fields", f"从{systems_text}中抽取关键字段和流程状态。")],
        },
        {
            "id": "data_verification",
            "name": "数据核验 Agent",
            "description": "检查数据完整性、一致性、重复项和跨系统差异，输出可解释的核验结论。",
            "icon": "CK",
            "color": "#059669",
            "tools": [make_tool("verify_cross_system_data", f"核验{systems_text}之间的关键字段一致性。")],
        },
        {
            "id": "rule_analysis",
            "name": "规则判断 Agent",
            "description": f"结合{source['category_name']}规则、历史案例和当前上下文判断风险、机会或处理路径。",
            "icon": "RL",
            "color": "#7c3aed",
            "tools": [make_tool("evaluate_business_rules", "运行规则库并返回命中的规则、原因和置信度。")],
        },
        {
            "id": "action_planning",
            "name": "行动建议 Agent",
            "description": "将判断结果转化为优先级、责任人、处理动作和对业务用户可读的建议。",
            "icon": "GO",
            "color": "#d97706",
            "tools": [make_tool("generate_action_plan", "生成处理建议、任务分派和下一步动作。")],
        },
        {
            "id": "closure_audit",
            "name": "闭环与审计 Agent",
            "description": "追踪执行结果，沉淀证据链、复盘结论和后续优化建议。",
            "icon": "AU",
            "color": "#dc2626",
            "tools": [make_tool("write_audit_trail", "回写处理结果、证据和复盘记录。")],
        },
    ]

    spoke_ids = [agent["id"] for agent in spoke_agents]
    architecture = {
        "schema_version": "1.0",
        "triage_agent": triage_agent,
        "spoke_agents": spoke_agents,
        "business_rules": [
            {
                "name": "业务范围护栏",
                "type": "guardrail",
                "description": f"仅处理与{source['category_name']}和“{focus}”相关的请求，超出范围时给出边界说明。",
                "applies_to": ["triage"],
                "trigger_example": "用户提出与当前业务无关的请求。",
            },
            {
                "name": "关键动作人工确认",
                "type": "constraint",
                "description": "涉及审批、付款、放行、承诺或法务意见等关键动作时，Agent 只能建议，不能自动越权执行。",
                "applies_to": ["triage", "action_planning"],
                "trigger_example": "建议需要改变流程状态或对外承诺。",
            },
            {
                "name": "高风险升级",
                "type": "escalation",
                "description": "当金额、交付、合规或客户影响超过阈值时，升级给负责人确认。",
                "applies_to": ["rule_analysis", "closure_audit"],
                "trigger_example": "发现高风险异常或跨部门阻塞。",
            },
            {
                "name": "证据不足回补",
                "type": "routing",
                "description": "当上下文或关键字段不足时，路由回请求受理与上下文 Agent 补齐材料。",
                "applies_to": ["triage", "intake_context", "data_verification"],
                "trigger_example": "缺少单据、附件、流程状态或系统记录。",
            },
        ],
        "handoff_matrix": {
            **demo_handoff_matrix(spoke_ids),
        },
    }

    scenarios = [
        {
            "id": "standard-processing",
            "name": f"{focus}标准处理演示",
            "description": source["scenario"],
            "steps": [
                {"type": "customer", "content": f"请帮我处理这个{focus}事项：{source['scenario']}"},
                {"type": "guardrail", "agent": "triage", "ruleName": "业务范围护栏", "ruleType": "guardrail", "passed": True, "content": "请求属于当前业务范围，允许进入处理流程。"},
                {"type": "agent", "agent": "triage", "content": f"我会先读取{systems_text}中的上下文，再分派给专业子 Agent。"},
                {"type": "handoff", "agent": "triage", "targetAgent": "intake_context", "content": "分派上下文采集任务。"},
                {"type": "tool_call", "agent": "intake_context", "toolName": "extract_business_fields", "content": f"抽取{focus}相关字段、附件和流程状态。"},
                {"type": "handoff", "agent": "intake_context", "targetAgent": "data_verification", "content": "将已抽取信息交给数据核验。"},
                {"type": "tool_call", "agent": "data_verification", "toolName": "verify_cross_system_data", "content": f"核对{systems_text}中的记录一致性。"},
                {"type": "handoff", "agent": "data_verification", "targetAgent": "rule_analysis", "content": "核验通过，进入规则判断。"},
                {"type": "tool_call", "agent": "rule_analysis", "toolName": "evaluate_business_rules", "content": "运行规则库并解释命中原因。"},
                {"type": "handoff", "agent": "rule_analysis", "targetAgent": "action_planning", "content": "生成处理建议。"},
                {"type": "agent", "agent": "action_planning", "content": f"建议优先处理该事项，并给出责任人、依据和下一步动作。预期价值：{source['impact']}"},
                {"type": "tool_call", "agent": "closure_audit", "toolName": "write_audit_trail", "content": "记录处理结果和复盘信息，形成闭环。"},
            ],
        },
        {
            "id": "risk-escalation",
            "name": f"{focus}高风险升级演示",
            "description": "演示数据异常或风险超阈值时的升级路径。",
            "steps": [
                {"type": "customer", "content": f"这个{focus}事项比较紧急，请判断是否需要升级处理。"},
                {"type": "agent", "agent": "triage", "content": "收到，我会先完成范围检查和风险识别。"},
                {"type": "handoff", "agent": "triage", "targetAgent": "rule_analysis", "content": "请求规则判断 Agent 评估风险等级。"},
                {"type": "tool_call", "agent": "rule_analysis", "toolName": "evaluate_business_rules", "content": "检测到影响范围较大，需要升级确认。"},
                {"type": "escalation", "agent": "rule_analysis", "ruleName": "高风险升级", "ruleType": "escalation", "content": "触发高风险升级，建议提交负责人确认。"},
                {"type": "constraint", "agent": "action_planning", "ruleName": "关键动作人工确认", "ruleType": "constraint", "content": "Agent 生成建议，不自动执行关键业务动作。"},
                {"type": "agent", "agent": "action_planning", "content": "已生成升级说明、影响范围、建议动作和需要人工确认的节点。"},
            ],
        },
    ]

    demo_spec = {
        "schema_version": "1.0",
        "agent_id": source["agent_id"],
        "slug": source["slug"],
        "title": f"{source['name']}演示",
        "source_agent": {
            "name": source["name"],
            "category_id": source["category_id"],
            "category_name": source["category_name"],
            "summary": source["summary"],
            "scenario": source["scenario"],
            "impact": source["impact"],
            "systems": source["systems"],
        },
        "architecture": architecture,
        "scenarios": scenarios,
        "generated_at": now,
    }
    validate_architecture(architecture)
    validate_scenarios(architecture, scenarios)
    return demo_spec


def validate_architecture(architecture):
    triage = architecture.get("triage_agent") or {}
    spokes = architecture.get("spoke_agents") or []
    all_ids = [triage.get("id")] + [agent.get("id") for agent in spokes]
    if triage.get("id") != "triage":
        raise ValueError("triage_agent.id must be triage")
    if len(all_ids) != len(set(all_ids)):
        raise ValueError("agent ids must be unique")
    id_set = set(all_ids)
    handoff = architecture.get("handoff_matrix") or {}
    for source_id, targets in handoff.items():
        if source_id not in id_set:
            raise ValueError(f"unknown handoff source: {source_id}")
        for target_id in targets:
            if target_id not in id_set:
                raise ValueError(f"unknown handoff target: {target_id}")
    spoke_ids = {agent["id"] for agent in spokes}
    if not spoke_ids.issubset(set(handoff.get("triage", []))):
        raise ValueError("triage must hand off to every spoke")
    for spoke_id in spoke_ids:
        if "triage" not in handoff.get(spoke_id, []):
            raise ValueError(f"{spoke_id} must hand off back to triage")
    rules = architecture.get("business_rules") or []
    if not any(rule.get("type") == "guardrail" and "triage" in rule.get("applies_to", []) for rule in rules):
        raise ValueError("at least one triage guardrail is required")


def validate_scenarios(architecture, scenarios):
    agents = [architecture["triage_agent"], *architecture["spoke_agents"]]
    agent_ids = {agent["id"] for agent in agents}
    tool_names = {tool["name"] for agent in agents for tool in agent.get("tools", [])}
    rule_types = {rule["name"]: rule["type"] for rule in architecture.get("business_rules", [])}
    handoff = architecture.get("handoff_matrix") or {}
    for scenario in scenarios:
        for step in scenario.get("steps", []):
            if step.get("agent") and step["agent"] not in agent_ids:
                raise ValueError(f"unknown scenario agent: {step['agent']}")
            if step.get("targetAgent") and step["targetAgent"] not in agent_ids:
                raise ValueError(f"unknown scenario target agent: {step['targetAgent']}")
            if step.get("type") == "handoff" and step.get("agent") and step.get("targetAgent"):
                allowed_targets = handoff.get(step["agent"], [])
                if step["targetAgent"] not in allowed_targets:
                    raise ValueError(f"handoff not allowed: {step['agent']} -> {step['targetAgent']}")
            if step.get("toolName") and step["toolName"] not in tool_names:
                raise ValueError(f"unknown scenario tool: {step['toolName']}")
            if step.get("ruleName"):
                rule_type = rule_types.get(step["ruleName"])
                if not rule_type:
                    raise ValueError(f"unknown scenario rule: {step['ruleName']}")
                if step.get("ruleType") and step["ruleType"] != rule_type:
                    raise ValueError(f"scenario rule type mismatch: {step['ruleName']}")


def build_and_save_demo(payload):
    source = normalize_source_profile(payload)
    demo_spec = build_demo_spec(source)
    upsert_demo(source, demo_spec)
    return demo_spec

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_json(self, status, payload):
        body = (json_dumps(payload) + "\n").encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0") or "0")
        except ValueError as exc:
            raise ValueError("Invalid Content-Length") from exc
        if length <= 0:
            return {}
        if length > MAX_JSON_BODY_BYTES:
            raise OverflowError("JSON body is too large")
        raw_body = self.rfile.read(length).decode("utf-8")
        return json.loads(raw_body or "{}")

    def is_same_origin_post(self):
        origin = self.headers.get("Origin")
        referer = self.headers.get("Referer")
        host = self.headers.get("Host")
        if not host:
            return False
        allowed_prefixes = {f"http://{host}", f"https://{host}"}
        if origin:
            return origin in allowed_prefixes
        if referer:
            return any(referer.startswith(prefix + "/") or referer == prefix for prefix in allowed_prefixes)
        return False

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        if path == "/v1/ping":
            self.send_json(200, {"status": "ok"})
            return
        if path == "/api/agent-demos/status":
            params = parse_qs(parsed.query)
            agent_id = (params.get("agentId") or params.get("agent_id") or [""])[0]
            if not agent_id:
                self.send_json(400, {"success": False, "error": "agentId is required"})
                return
            self.send_json(200, {"success": True, "data": get_demo_status(agent_id)})
            return
        if path.startswith("/api/agent-demos/"):
            slug = unquote(path.split("/api/agent-demos/", 1)[1])
            demo_spec = get_demo_by_slug(slug)
            if not demo_spec:
                self.send_json(404, {"success": False, "error": "Demo not found"})
                return
            self.send_json(200, {"success": True, "data": demo_spec})
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        if path == "/api/agent-demos/generate":
            try:
                if not self.is_same_origin_post():
                    self.send_json(403, {"success": False, "error": "Same-origin request required"})
                    return
                payload = self.read_json_body()
                demo_spec = build_and_save_demo(payload)
                self.send_json(200, {
                    "success": True,
                    "data": {
                        "agentId": demo_spec["agent_id"],
                        "slug": demo_spec["slug"],
                        "demoUrl": f"/demo.html?slug={demo_spec['slug']}",
                        "updatedAt": demo_spec["generated_at"],
                        "demoSpec": demo_spec,
                    },
                })
            except json.JSONDecodeError:
                self.send_json(400, {"success": False, "error": "Invalid JSON body"})
            except OverflowError as exc:
                self.send_json(413, {"success": False, "error": str(exc)})
            except ValueError as exc:
                self.send_json(400, {"success": False, "error": str(exc)})
            except Exception as exc:
                self.send_json(500, {"success": False, "error": f"Failed to generate demo: {exc}"})
            return
        self.send_json(404, {"success": False, "error": "Not found"})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()

if __name__ == "__main__":
    init_db()
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Serving on port {PORT}", flush=True)
    server.serve_forever()
