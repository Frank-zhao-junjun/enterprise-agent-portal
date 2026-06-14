"""
FastAPI 应用 - MCP Client Layer + 静态文件服务
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from mcp_client import MCPClient, ServerConfig

logger = logging.getLogger(__name__)

# ---------- 全局 MCP Client 实例 ----------
mcp_client = MCPClient()


# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动时初始化 MCP Client"""
    logger.info("Initializing MCP Client...")
    await mcp_client.initialize()
    logger.info("MCP Client ready")
    yield
    logger.info("Shutting down MCP Client...")
    await mcp_client.shutdown()


# ---------- FastAPI App ----------
app = FastAPI(
    title="Enterprise Agent Portal - MCP Client Layer",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 静态文件服务
# ============================================================
STATIC_DIR = Path(__file__).parent


@app.get("/")
async def serve_index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/styles.css")
async def serve_css():
    return FileResponse(STATIC_DIR / "styles.css", media_type="text/css")


@app.get("/app.js")
async def serve_js():
    return FileResponse(STATIC_DIR / "app.js", media_type="application/javascript")


# ============================================================
# Health Check
# ============================================================


@app.get("/v1/ping")
async def health_check():
    return {"status": "ok"}


# ============================================================
# MCP Client API - Server 管理
# ============================================================


class AddServerRequest(BaseModel):
    server_id: str
    server_name: str
    domain: str
    transport: str = "sse"  # stdio | sse | streamable-http
    url: str | None = None
    command: str | None = None
    args: list[str] | None = None
    env: dict[str, str] | None = None
    headers: dict[str, str] | None = None


@app.post("/api/mcp/servers")
async def add_server(req: AddServerRequest):
    """添加 MCP Server 连接"""
    config = ServerConfig(
        server_id=req.server_id,
        name=req.server_name,
        domain=req.domain,
        transport=req.transport,
        url=req.url,
        command=req.command,
        args=req.args or [],
        env=req.env or {},
        headers=req.headers or {},
    )
    result = await mcp_client.add_server(config)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to add server"))
    return result


@app.delete("/api/mcp/servers/{server_id}")
async def remove_server(server_id: str):
    """移除 MCP Server 连接"""
    result = await mcp_client.remove_server(server_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("error", "Server not found"))
    return result


@app.post("/api/mcp/servers/{server_id}/reconnect")
async def reconnect_server(server_id: str):
    """重新连接 MCP Server"""
    result = await mcp_client.reconnect_server(server_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Reconnect failed"))
    return result


@app.get("/api/mcp/servers")
async def list_servers():
    """列出所有 Server 状态"""
    return {"servers": mcp_client.list_servers()}


# ============================================================
# MCP Client API - Agent 查询
# ============================================================


@app.get("/api/mcp/agents")
async def list_agents():
    """列出所有 Agent"""
    return {"agents": mcp_client.list_agents()}


@app.get("/api/mcp/agents/{agent_id}/tools")
async def list_agent_tools(agent_id: str):
    """列出 Agent 可用的工具"""
    result = mcp_client.list_agent_tools(agent_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("error", "Agent not found"))
    return result


# ============================================================
# MCP Client API - 工具查询
# ============================================================


@app.get("/api/mcp/tools")
async def list_all_tools(domain: str | None = None):
    """列出所有可用工具，可按 domain 过滤"""
    if domain:
        tools = mcp_client.list_tools_by_domain(domain)
    else:
        tools = mcp_client.list_all_tools()
    return {"tools": tools}


# ============================================================
# MCP Client API - 工具调用
# ============================================================


class CallToolRequest(BaseModel):
    agent_id: str
    server_id: str
    tool_name: str
    arguments: dict = {}
    timeout: float = 60.0


class ConfirmCallRequest(BaseModel):
    agent_id: str
    server_id: str
    tool_name: str
    arguments: dict = {}
    timeout: float = 60.0


@app.post("/api/mcp/call")
async def call_tool(req: CallToolRequest):
    """调用工具（含权限校验和风险确认）"""
    result = await mcp_client.call_tool(
        agent_id=req.agent_id,
        server_id=req.server_id,
        tool_name=req.tool_name,
        arguments=req.arguments,
        timeout=req.timeout,
    )
    if result.get("is_permission_error"):
        raise HTTPException(status_code=403, detail=result.get("error"))
    if result.get("requires_confirmation"):
        return JSONResponse(status_code=202, content=result)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Tool call failed"))
    return result


@app.post("/api/mcp/call/confirm")
async def confirm_and_call(req: ConfirmCallRequest):
    """确认后执行写操作"""
    result = await mcp_client.confirm_and_call(
        agent_id=req.agent_id,
        server_id=req.server_id,
        tool_name=req.tool_name,
        arguments=req.arguments,
        confirmed=True,
        timeout=req.timeout,
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Tool call failed"))
    return result


# ============================================================
# MCP Client API - 资源读取
# ============================================================


class ReadResourceRequest(BaseModel):
    agent_id: str
    server_id: str
    uri: str


@app.post("/api/mcp/resource")
async def read_resource(req: ReadResourceRequest):
    """读取 MCP 资源"""
    result = await mcp_client.read_resource(
        agent_id=req.agent_id,
        server_id=req.server_id,
        uri=req.uri,
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to read resource"))
    return result


# ============================================================
# 启动入口
# ============================================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("DEPLOY_RUN_PORT", "5000"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
