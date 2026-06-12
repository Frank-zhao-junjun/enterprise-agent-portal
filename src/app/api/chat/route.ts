// === POST /api/chat — 真正的流式 SSE 聊天 API ===
import { NextRequest } from 'next/server';
import { runMainAgent } from '@/lib/triage-agent';
import type { ReasoningStep } from '@/types/ontology';

/** 全局 LLM 超时（60s），防止 LLM 挂起导致 SSE 永不关闭 */
const LLM_TIMEOUT_MS = 60_000;

/** SSE 事件类型 */
interface SSEEvent {
  type: 'reasoning' | 'content' | 'error' | 'done';
  data: unknown;
}

// 会话存储（内存级，生产环境应替换为 Redis/DB）
// 带 TTL 过期防止内存泄漏
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 分钟无活动自动过期
const SESSION_CLEANUP_INTERVAL = 5 * 60 * 1000; // 每 5 分钟清理

interface SessionData {
  history: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  lastAccess: number;
}

const sessions = new Map<string, SessionData>();

// 定期清理过期会话（用 Symbol 避免全局命名冲突）
const SESSION_CLEANUP_KEY = Symbol.for('hermes-session-cleanup');
if (typeof globalThis !== 'undefined' && !(globalThis as Record<symbol, unknown>)[SESSION_CLEANUP_KEY]) {
  (globalThis as Record<symbol, unknown>)[SESSION_CLEANUP_KEY] = setInterval(() => {
    const now = Date.now();
    for (const [id, s] of sessions) {
      if (now - s.lastAccess > SESSION_TTL_MS) sessions.delete(id);
    }
  }, SESSION_CLEANUP_INTERVAL);
}

/**
 * 基于 Promise 链的 Session 锁，避免 busy-wait
 * 同一 sessionId 的请求会排队依次执行
 */
const sessionQueues = new Map<string, Promise<unknown>>();

async function withSessionLock<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
  const prev = sessionQueues.get(sessionId) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  sessionQueues.set(sessionId, next);
  try {
    return await Promise.race([
      next,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Session lock timeout: ${sessionId}`)), LLM_TIMEOUT_MS),
      ),
    ]);
  } finally {
    if (sessionQueues.get(sessionId) === next) {
      sessionQueues.delete(sessionId);
    }
  }
}

/**
 * 带超时的 Promise 包装
 * 如果 promise 在 timeoutMs 内未完成，AbortError 会被抛出
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new DOMException(`${label} timed out after ${timeoutMs}ms`, 'AbortError')), timeoutMs),
    ),
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, sessionId, forcedDomainId, locale = 'zh' } = body as {
    message: string;
    sessionId?: string;
    forcedDomainId?: string;
    locale?: string;
  };

  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sid = sessionId || `session-${Date.now()}`;

  // 获取或创建会话（带 lastAccess 时间戳）
  if (!sessions.has(sid)) {
    sessions.set(sid, { history: [], lastAccess: Date.now() });
  }
  let session = sessions.get(sid)!;
  session.lastAccess = Date.now();

  // 创建 SSE 流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: SSEEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // controller might be closed
        }
      };

      try {
        // 运行主 Agent（带超时），每步即时推送
        const result = await withTimeout(
          withSessionLock(sid, async () => {
            if (!sessions.has(sid)) {
              sessions.set(sid, { history: [], lastAccess: Date.now() });
            }
            const session = sessions.get(sid)!;
            session.lastAccess = Date.now();

            const agentResult = await runMainAgent({
              userMessage: message,
              sessionId: sid,
              forcedDomainId: forcedDomainId || null,
              locale,
              history: session.history,
              onStep: (step: ReasoningStep) => {
                sendEvent({ type: 'reasoning', data: step });
              },
              onChunk: (chunk: string) => {
                sendEvent({ type: 'content', data: { chunk } });
              },
              requestHeaders: request.headers,
            });

            // 保存对话历史，只保留最近 20 条
            session.history = agentResult.updatedHistory.slice(-20);

            return agentResult;
          }),
          LLM_TIMEOUT_MS,
          `LLM processing for session ${sid}`,
        );

        // 发送完成事件
        sendEvent({ type: 'done', data: { response: result.response, sessionId: sid, domainId: result.domainId } });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        sendEvent({ type: 'error', data: { error: errorMsg } });
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
