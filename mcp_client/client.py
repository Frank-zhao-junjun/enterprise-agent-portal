"""
MCP Client - 核心入口
整合连接管理和路由配置，提供统一的 MCP Client 接口
"""

import logging
from typing import Any, Optional

from .connection import ConnectionManager, ServerConfig
from .routing import RoutingManager

logger = logging.getLogger(__name__)


class MCPClient:
    """MCP Client 统一入口"""

    def __init__(self):
        self.connection_manager = ConnectionManager()
        self.routing_manager = RoutingManager()

    async def initialize(self):
        """初始化：加载配置，连接所有已配置的 Server"""
        self.routing_manager.load_agents_config()
        self.routing_manager.load_servers_config()
        logger.info("MCP Client initialized")

    async def add_server(self, config: ServerConfig) -> dict:
        """添加 MCP Server 连接"""
        result = await self.connection_manager.add_server(config)
        if result["success"]:
            self.routing_manager._server_domain_map[config.server_id] = config.domain
        return result

    async def remove_server(self, server_id: str) -> dict:
        """移除 MCP Server 连接"""
        result = await self.connection_manager.remove_server(server_id)
        if result["success"]:
            self.routing_manager._server_domain_map.pop(server_id, None)
        return result

    async def reconnect_server(self, server_id: str) -> dict:
        """重新连接 MCP Server"""
        return await self.connection_manager.reconnect_server(server_id)

    # ---------- 查询接口 ----------

    def list_servers(self) -> list[dict]:
        """列出所有 Server 状态"""
        return self.connection_manager.list_servers()

    def list_agents(self) -> list[dict]:
        """列出所有 Agent 配置"""
        return self.routing_manager.list_agents()

    def list_all_tools(self) -> list[dict]:
        """列出所有可用工具"""
        return self.connection_manager.get_all_tools()

    def list_agent_tools(self, agent_id: str) -> dict:
        """列出指定 Agent 可用的工具"""
        agent = self.routing_manager.get_agent(agent_id)
        if not agent:
            return {"success": False, "error": f"Agent {agent_id} not found"}

        all_tools = self.connection_manager.get_all_tools()
        allowed_tools = self.routing_manager.get_agent_tools(agent_id, all_tools)
        return {
            "success": True,
            "agent_id": agent_id,
            "agent_name": agent.name,
            "domain": agent.domain,
            "tools": allowed_tools,
            "total_available": len(allowed_tools),
        }

    def list_tools_by_domain(self, domain: str) -> list[dict]:
        """按业务域列出工具"""
        return self.connection_manager.get_tools_by_domain(domain)

    # ---------- 工具调用 ----------

    async def call_tool(
        self,
        agent_id: str,
        server_id: str,
        tool_name: str,
        arguments: dict[str, Any],
        timeout: float = 60.0,
    ) -> dict:
        """通过 Agent 身份调用工具（含权限校验）"""
        # 1. 权限校验
        allowed, reason = self.routing_manager.check_permission(agent_id, server_id, tool_name)
        if not allowed:
            logger.warning(f"Permission denied: agent={agent_id}, server={server_id}, tool={tool_name}, reason={reason}")
            return {"success": False, "error": reason, "is_permission_error": True}

        # 2. 风险检查：写操作是否需要确认
        agent = self.routing_manager.get_agent(agent_id)
        if agent and agent.risk_limits.get("require_confirmation_for_write", True):
            # 简单启发式：工具名含 write/create/delete/update/submit/execute 视为写操作
            write_keywords = ["write", "create", "delete", "update", "submit", "execute", "approve", "reject", "cancel"]
            if any(kw in tool_name.lower() for kw in write_keywords):
                return {
                    "success": False,
                    "error": "Write operation requires user confirmation",
                    "requires_confirmation": True,
                    "agent_id": agent_id,
                    "server_id": server_id,
                    "tool_name": tool_name,
                    "arguments": arguments,
                }

        # 3. 执行调用
        logger.info(f"Tool call: agent={agent_id}, server={server_id}, tool={tool_name}")
        result = await self.connection_manager.call_tool(server_id, tool_name, arguments, timeout)

        # 4. 注入元信息
        result["agent_id"] = agent_id
        return result

    async def confirm_and_call(
        self,
        agent_id: str,
        server_id: str,
        tool_name: str,
        arguments: dict[str, Any],
        confirmed: bool = False,
        timeout: float = 60.0,
    ) -> dict:
        """确认后执行写操作"""
        if not confirmed:
            return {"success": False, "error": "User confirmation required"}

        # 跳过确认检查，直接调用
        logger.info(f"Confirmed tool call: agent={agent_id}, server={server_id}, tool={tool_name}")
        result = await self.connection_manager.call_tool(server_id, tool_name, arguments, timeout)
        result["agent_id"] = agent_id
        return result

    # ---------- 资源读取 ----------

    async def read_resource(self, agent_id: str, server_id: str, uri: str) -> dict:
        """读取资源"""
        allowed, reason = self.routing_manager.check_permission(agent_id, server_id, uri)
        if not allowed:
            return {"success": False, "error": reason}
        result = await self.connection_manager.read_resource(server_id, uri)
        result["agent_id"] = agent_id
        return result

    # ---------- 生命周期 ----------

    async def shutdown(self):
        """关闭所有连接"""
        logger.info("MCP Client shutting down")
        await self.connection_manager.disconnect_all()
