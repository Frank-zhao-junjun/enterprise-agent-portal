"""
MCP Client - 连接管理器
管理到多个 MCP Server 的连接生命周期
"""

import asyncio
import logging
from enum import Enum
from typing import Any, Optional

from mcp import ClientSession
from mcp.client.sse import sse_client
from mcp.client.streamable_http import streamablehttp_client
from mcp.client.stdio import stdio_client, StdioServerParameters

logger = logging.getLogger(__name__)


class ConnectionStatus(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    RECONNECTING = "reconnecting"
    ERROR = "error"


class ServerConfig:
    """MCP Server 连接配置"""

    def __init__(
        self,
        server_id: str,
        name: str,
        transport: str,  # "sse" | "streamable_http" | "stdio"
        domain: str,
        url: Optional[str] = None,
        command: Optional[str] = None,
        args: Optional[list[str]] = None,
        env: Optional[dict[str, str]] = None,
        headers: Optional[dict[str, str]] = None,
        timeout: float = 30.0,
    ):
        self.server_id = server_id
        self.name = name
        self.transport = transport
        self.domain = domain
        self.url = url
        self.command = command
        self.args = args or []
        self.env = env or {}
        self.headers = headers or {}
        self.timeout = timeout

    def to_dict(self) -> dict:
        return {
            "server_id": self.server_id,
            "name": self.name,
            "transport": self.transport,
            "domain": self.domain,
            "url": self.url,
            "timeout": self.timeout,
        }


class MCPConnection:
    """单个 MCP Server 连接"""

    def __init__(self, config: ServerConfig):
        self.config = config
        self.status = ConnectionStatus.DISCONNECTED
        self.session: Optional[ClientSession] = None
        self._read_stream = None
        self._write_stream = None
        self._context_managers = []  # keep refs to prevent GC
        self._tools_cache: list[dict] = []
        self._resources_cache: list[dict] = []
        self._retry_count = 0
        self._max_retries = 3

    async def connect(self) -> bool:
        """建立连接"""
        try:
            self.status = ConnectionStatus.RECONNECTING
            logger.info(f"Connecting to MCP Server: {self.config.server_id} ({self.config.transport})")

            if self.config.transport == "sse":
                transport = sse_client(
                    url=self.config.url,
                    headers=self.config.headers,
                    timeout=self.config.timeout,
                )
            elif self.config.transport == "streamable_http":
                transport = streamablehttp_client(
                    url=self.config.url,
                    headers=self.config.headers,
                    timeout=self.config.timeout,
                )
            elif self.config.transport == "stdio":
                server_params = StdioServerParameters(
                    command=self.config.command,
                    args=self.config.args,
                    env=self.config.env if self.config.env else None,
                )
                transport = stdio_client(server=server_params)
            else:
                raise ValueError(f"Unsupported transport: {self.config.transport}")

            # Enter the transport context
            read_write = await transport.__aenter__()
            self._read_stream, self._write_stream = read_write
            self._context_managers.append(transport)

            # Create and initialize session
            session = ClientSession(self._read_stream, self._write_stream)
            await session.__aenter__()
            self._context_managers.append(session)

            await session.initialize()
            self.session = session
            self.status = ConnectionStatus.CONNECTED
            self._retry_count = 0

            # Cache tools and resources
            await self._refresh_cache()

            logger.info(f"Connected to MCP Server: {self.config.server_id}, tools: {len(self._tools_cache)}")
            return True

        except Exception as e:
            self.status = ConnectionStatus.ERROR
            logger.error(f"Failed to connect to {self.config.server_id}: {e}")
            await self._cleanup()
            return False

    async def disconnect(self):
        """断开连接"""
        logger.info(f"Disconnecting from MCP Server: {self.config.server_id}")
        await self._cleanup()
        self.status = ConnectionStatus.DISCONNECTED

    async def _cleanup(self):
        """清理资源"""
        for cm in reversed(self._context_managers):
            try:
                await cm.__aexit__(None, None, None)
            except Exception:
                pass
        self._context_managers.clear()
        self.session = None
        self._read_stream = None
        self._write_stream = None

    async def _refresh_cache(self):
        """刷新工具和资源缓存"""
        if not self.session:
            return
        try:
            tools_result = await self.session.list_tools()
            self._tools_cache = [
                {
                    "name": t.name,
                    "description": t.description or "",
                    "inputSchema": t.inputSchema or {},
                    "server_id": self.config.server_id,
                    "domain": self.config.domain,
                }
                for t in tools_result.tools
            ]
        except Exception as e:
            logger.warning(f"Failed to list tools from {self.config.server_id}: {e}")
            self._tools_cache = []

        try:
            resources_result = await self.session.list_resources()
            self._resources_cache = [
                {
                    "uri": str(r.uri),
                    "name": r.name,
                    "description": r.description or "",
                    "mimeType": r.mimeType,
                    "server_id": self.config.server_id,
                    "domain": self.config.domain,
                }
                for r in resources_result.resources
            ]
        except Exception as e:
            logger.warning(f"Failed to list resources from {self.config.server_id}: {e}")
            self._resources_cache = []

    async def reconnect(self) -> bool:
        """重新连接"""
        self._retry_count += 1
        if self._retry_count > self._max_retries:
            logger.error(f"Max retries exceeded for {self.config.server_id}")
            self.status = ConnectionStatus.ERROR
            return False

        # Exponential backoff
        delay = min(2 ** self._retry_count, 30)
        logger.info(f"Reconnecting to {self.config.server_id} in {delay}s (attempt {self._retry_count})")
        await asyncio.sleep(delay)
        return await self.connect()

    def get_tools(self) -> list[dict]:
        return self._tools_cache

    def get_resources(self) -> list[dict]:
        return self._resources_cache

    def get_status(self) -> dict:
        return {
            "server_id": self.config.server_id,
            "name": self.config.name,
            "domain": self.config.domain,
            "status": self.status.value,
            "tools_count": len(self._tools_cache),
            "resources_count": len(self._resources_cache),
        }


class ConnectionManager:
    """管理多个 MCP Server 连接"""

    def __init__(self):
        self._connections: dict[str, MCPConnection] = {}

    async def add_server(self, config: ServerConfig) -> dict:
        """添加并连接一个 MCP Server"""
        if config.server_id in self._connections:
            return {"success": False, "error": f"Server {config.server_id} already exists"}

        conn = MCPConnection(config)
        success = await conn.connect()
        if success:
            self._connections[config.server_id] = conn
            return {"success": True, "server_id": config.server_id, "tools_count": len(conn.get_tools())}
        else:
            return {"success": False, "error": f"Failed to connect to {config.server_id}"}

    async def remove_server(self, server_id: str) -> dict:
        """断开并移除一个 MCP Server"""
        conn = self._connections.pop(server_id, None)
        if not conn:
            return {"success": False, "error": f"Server {server_id} not found"}
        await conn.disconnect()
        return {"success": True, "server_id": server_id}

    async def reconnect_server(self, server_id: str) -> dict:
        """重新连接指定 Server"""
        conn = self._connections.get(server_id)
        if not conn:
            return {"success": False, "error": f"Server {server_id} not found"}
        success = await conn.reconnect()
        if success:
            return {"success": True, "server_id": server_id, "tools_count": len(conn.get_tools())}
        return {"success": False, "error": f"Reconnect failed for {server_id}"}

    def get_connection(self, server_id: str) -> Optional[MCPConnection]:
        return self._connections.get(server_id)

    def list_servers(self) -> list[dict]:
        """列出所有 Server 及其状态"""
        return [conn.get_status() for conn in self._connections.values()]

    def get_all_tools(self) -> list[dict]:
        """获取所有 Server 的工具"""
        tools = []
        for conn in self._connections.values():
            tools.extend(conn.get_tools())
        return tools

    def get_tools_by_domain(self, domain: str) -> list[dict]:
        """按业务域获取工具"""
        return [t for t in self.get_all_tools() if t["domain"] == domain]

    def get_tools_by_server(self, server_id: str) -> list[dict]:
        """按 Server 获取工具"""
        conn = self._connections.get(server_id)
        return conn.get_tools() if conn else []

    async def call_tool(
        self,
        server_id: str,
        tool_name: str,
        arguments: dict[str, Any],
        timeout: float = 60.0,
    ) -> dict:
        """调用指定 Server 的工具"""
        conn = self._connections.get(server_id)
        if not conn:
            return {"success": False, "error": f"Server {server_id} not connected"}

        if conn.status != ConnectionStatus.CONNECTED:
            # Try reconnect
            success = await conn.reconnect()
            if not success:
                return {"success": False, "error": f"Server {server_id} is not connected and reconnect failed"}

        if not conn.session:
            return {"success": False, "error": f"Server {server_id} session not available"}

        try:
            result = await asyncio.wait_for(
                conn.session.call_tool(tool_name, arguments),
                timeout=timeout,
            )
            # result is CallToolResult with content list and isError flag
            content = []
            for item in result.content:
                if hasattr(item, "text"):
                    content.append({"type": "text", "text": item.text})
                elif hasattr(item, "data"):
                    content.append({"type": "data", "data": item.data, "mimeType": getattr(item, "mimeType", "")})
                else:
                    content.append({"type": "unknown", "repr": repr(item)})

            return {
                "success": not result.isError,
                "server_id": server_id,
                "tool_name": tool_name,
                "content": content,
                "is_error": result.isError,
            }
        except asyncio.TimeoutError:
            return {"success": False, "error": f"Tool call timed out after {timeout}s"}
        except Exception as e:
            logger.error(f"Tool call error: {e}")
            return {"success": False, "error": str(e)}

    async def read_resource(self, server_id: str, uri: str) -> dict:
        """读取指定 Server 的资源"""
        conn = self._connections.get(server_id)
        if not conn or conn.status != ConnectionStatus.CONNECTED or not conn.session:
            return {"success": False, "error": f"Server {server_id} not connected"}

        try:
            result = await conn.session.read_resource(uri)
            contents = []
            for item in result.contents:
                contents.append({
                    "uri": str(item.uri),
                    "mimeType": getattr(item, "mimeType", ""),
                    "text": getattr(item, "text", None),
                    "blob": getattr(item, "blob", None),
                })
            return {"success": True, "contents": contents}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def disconnect_all(self):
        """断开所有连接"""
        for conn in self._connections.values():
            await conn.disconnect()
        self._connections.clear()
