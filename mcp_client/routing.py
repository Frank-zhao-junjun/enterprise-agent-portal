"""
MCP Client - Agent 路由配置
管理 Agent → Server → Tool 的映射关系
"""

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# 默认配置文件路径
CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config")
AGENTS_CONFIG_PATH = os.path.join(CONFIG_DIR, "agents.json")
SERVERS_CONFIG_PATH = os.path.join(CONFIG_DIR, "servers.json")


class AgentRouteConfig:
    """单个 Agent 的路由配置"""

    def __init__(
        self,
        agent_id: str,
        name: str,
        domain: str,
        description: str = "",
        allowed_servers: Optional[list[str]] = None,
        allowed_tools: Optional[list[str]] = None,  # 支持通配符 "finance.*"
        blocked_tools: Optional[list[str]] = None,
        risk_limits: Optional[dict] = None,
    ):
        self.agent_id = agent_id
        self.name = name
        self.domain = domain
        self.description = description
        self.allowed_servers = allowed_servers or []
        self.allowed_tools = allowed_tools or ["*"]  # 默认允许所有
        self.blocked_tools = blocked_tools or []
        self.risk_limits = risk_limits or {
            "max_calls_per_minute": 60,
            "max_concurrent_calls": 5,
            "require_confirmation_for_write": True,
        }

    def is_tool_allowed(self, tool_name: str, server_id: str) -> tuple[bool, str]:
        """检查 Agent 是否有权限调用指定工具"""
        # 先检查 server 级别
        if self.allowed_servers and server_id not in self.allowed_servers:
            return False, f"Agent {self.agent_id} not allowed to access server {server_id}"

        # 检查黑名单
        for pattern in self.blocked_tools:
            if self._match_pattern(tool_name, pattern):
                return False, f"Tool {tool_name} is blocked for agent {self.agent_id}"

        # 检查白名单
        for pattern in self.allowed_tools:
            if self._match_pattern(tool_name, pattern):
                return True, ""

        return False, f"Tool {tool_name} not in allowed list for agent {self.agent_id}"

    @staticmethod
    def _match_pattern(name: str, pattern: str) -> bool:
        """简单的通配符匹配"""
        if pattern == "*":
            return True
        if pattern.endswith(".*"):
            prefix = pattern[:-2]
            return name.startswith(prefix + ".") or name == prefix
        return name == pattern

    def to_dict(self) -> dict:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "domain": self.domain,
            "description": self.description,
            "allowed_servers": self.allowed_servers,
            "allowed_tools": self.allowed_tools,
            "blocked_tools": self.blocked_tools,
            "risk_limits": self.risk_limits,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "AgentRouteConfig":
        return cls(
            agent_id=data["agent_id"],
            name=data["name"],
            domain=data["domain"],
            description=data.get("description", ""),
            allowed_servers=data.get("allowed_servers"),
            allowed_tools=data.get("allowed_tools"),
            blocked_tools=data.get("blocked_tools"),
            risk_limits=data.get("risk_limits"),
        )


class RoutingManager:
    """管理所有 Agent 的路由配置"""

    def __init__(self):
        self._agents: dict[str, AgentRouteConfig] = {}
        self._server_domain_map: dict[str, str] = {}  # server_id → domain

    def load_agents_config(self, config_path: Optional[str] = None):
        """从配置文件加载 Agent 路由"""
        path = config_path or AGENTS_CONFIG_PATH
        if not os.path.exists(path):
            logger.warning(f"Agents config not found: {path}, using defaults")
            self._load_default_agents()
            return

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for agent_data in data.get("agents", []):
            config = AgentRouteConfig.from_dict(agent_data)
            self._agents[config.agent_id] = config

        logger.info(f"Loaded {len(self._agents)} agent configs from {path}")

    def load_servers_config(self, config_path: Optional[str] = None):
        """从配置文件加载 Server 配置"""
        path = config_path or SERVERS_CONFIG_PATH
        if not os.path.exists(path):
            logger.warning(f"Servers config not found: {path}")
            return

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for server_data in data.get("servers", []):
            self._server_domain_map[server_data["server_id"]] = server_data.get("domain", "")

        logger.info(f"Loaded {len(self._server_domain_map)} server configs from {path}")

    def _load_default_agents(self):
        """加载默认 Agent 配置（匹配前端 9 大板块）"""
        default_agents = [
            {
                "agent_id": "finance",
                "name": "财务 Agent",
                "domain": "finance",
                "description": "财务预算、核算、资金管理",
                "allowed_tools": ["finance.*", "budget.*", "accounting.*"],
            },
            {
                "agent_id": "sales_marketing",
                "name": "销售与营销 Agent",
                "domain": "sales_marketing",
                "description": "销售管理、营销策划、客户分析",
                "allowed_tools": ["sales.*", "marketing.*", "crm.*"],
            },
            {
                "agent_id": "manufacturing",
                "name": "制造与交付 Agent",
                "domain": "manufacturing",
                "description": "生产计划、质量管理、交付跟踪",
                "allowed_tools": ["manufacturing.*", "production.*", "quality.*"],
            },
            {
                "agent_id": "supply_chain",
                "name": "供应链 Agent",
                "domain": "supply_chain",
                "description": "库存管理、物流调度、供应商管理",
                "allowed_tools": ["supply_chain.*", "inventory.*", "logistics.*"],
            },
            {
                "agent_id": "procurement",
                "name": "采购 Agent",
                "domain": "procurement",
                "description": "采购订单、供应商评估、合同管理",
                "allowed_tools": ["procurement.*", "purchase.*", "vendor.*"],
            },
            {
                "agent_id": "hr",
                "name": "人力资源 Agent",
                "domain": "hr",
                "description": "招聘、薪酬、绩效管理",
                "allowed_tools": ["hr.*", "recruitment.*", "payroll.*"],
            },
            {
                "agent_id": "legal",
                "name": "法务合规 Agent",
                "domain": "legal",
                "description": "合同审查、合规检查、风险评估",
                "allowed_tools": ["legal.*", "compliance.*", "contract.*"],
            },
            {
                "agent_id": "customer_service",
                "name": "客服及售后品质 Agent",
                "domain": "customer_service",
                "description": "客户服务、售后管理、品质监控",
                "allowed_tools": ["customer_service.*", "after_sales.*", "quality_monitor.*"],
            },
            {
                "agent_id": "master_data",
                "name": "主数据和经营分析 Agent",
                "domain": "master_data",
                "description": "主数据治理、经营分析、数据质量",
                "allowed_tools": ["master_data.*", "analytics.*", "data_quality.*"],
            },
        ]

        for agent_data in default_agents:
            config = AgentRouteConfig.from_dict(agent_data)
            self._agents[config.agent_id] = config

    def get_agent(self, agent_id: str) -> Optional[AgentRouteConfig]:
        return self._agents.get(agent_id)

    def list_agents(self) -> list[dict]:
        return [agent.to_dict() for agent in self._agents.values()]

    def get_agent_tools(self, agent_id: str, all_tools: list[dict]) -> list[dict]:
        """获取 Agent 有权访问的工具列表"""
        agent = self._agents.get(agent_id)
        if not agent:
            return []

        allowed = []
        for tool in all_tools:
            is_allowed, _ = agent.is_tool_allowed(tool["name"], tool["server_id"])
            if is_allowed:
                allowed.append(tool)
        return allowed

    def check_permission(self, agent_id: str, server_id: str, tool_name: str) -> tuple[bool, str]:
        """检查 Agent 是否有权限调用指定工具"""
        agent = self._agents.get(agent_id)
        if not agent:
            return False, f"Agent {agent_id} not found"
        return agent.is_tool_allowed(tool_name, server_id)
