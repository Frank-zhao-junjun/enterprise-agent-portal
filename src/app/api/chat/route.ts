// === POST /api/chat — 真正的流式 SSE 聊天 API ===
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { runMainAgent } from '@/lib/triage-agent';
import type { ReasoningStep } from '@/types/ontology';

/** 全局 LLM 超时（60s），防止 LLM 挂起导致 SSE 永不关闭 */
const LLM_TIMEOUT_MS = 60_000;

/** SSE 事件类型 */
interface SSEEvent {
  type: 'reasoning' | 'content' | 'error' | 'done';
  data: unknown;
}

// ── Zod 输入校验 ──────────────────────────────────────────────
const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().max(128).optional(),
  forcedDomainId: z.string().max(64).optional(),
  locale: z.enum(['zh', 'en']).optional(),
});

// ── 会话存储（内存级，生产环境应替换为 Redis/DB）──────────────
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 分钟无活动自动过期
const SESSION_CLEANUP_INTERVAL = 5 * 60 * 1000; // 每 5 分钟清理
const MAX_SESSIONS = 500; // 会话数量上限

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

// ── 简易 IP 限流 ──────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 分钟窗口
const RATE_LIMIT_MAX_REQUESTS = 20; // 每窗口最多 20 次请求
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT_CLEANUP_KEY = Symbol.for('hermes-rate-limit-cleanup');
if (typeof globalThis !== 'undefined' && !(globalThis as Record<symbol, unknown>)[RATE_LIMIT_CLEANUP_KEY]) {
  (globalThis as Record<symbol, unknown>)[RATE_LIMIT_CLEANUP_KEY] = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequestCounts) {
      if (now - data.windowStart > RATE_LIMIT_WINDOW_MS * 2) ipRequestCounts.delete(ip);
    }
  }, RATE_LIMIT_WINDOW_MS);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return true;
  }
  record.count++;
  return record.count <= RATE_LIMIT_MAX_REQUESTS;
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
  // ── 1. IP 限流检查 ──
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 2. Zod 输入校验 ──
  let parsed: z.infer<typeof chatRequestSchema>;
  try {
    const body = await request.json();
    parsed = chatRequestSchema.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, forcedDomainId, locale = 'zh' } = parsed;
  const sessionId = parsed.sessionId || `session-${crypto.randomUUID()}`;

  // ── 3. 会话数量上限检查 ──
  if (!sessions.has(sessionId) && sessions.size >= MAX_SESSIONS) {
    // 清理最旧的会话腾出空间
    let oldestKey = '';
    let oldestTime = Infinity;
    for (const [id, s] of sessions) {
      if (s.lastAccess < oldestTime) {
        oldestTime = s.lastAccess;
        oldestKey = id;
      }
    }
    if (oldestKey) sessions.delete(oldestKey);
  }

  // 获取或创建会话（带 lastAccess 时间戳）
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [], lastAccess: Date.now() });
  }
  const session = sessions.get(sessionId)!;
  session.lastAccess = Date.now();

  // ── 4. 创建 SSE 流 ──
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
          withSessionLock(sessionId, async () => {
            if (!sessions.has(sessionId)) {
              sessions.set(sessionId, { history: [], lastAccess: Date.now() });
            }
            const session = sessions.get(sessionId)!;
            session.lastAccess = Date.now();

            const agentResult = await runMainAgent({
              userMessage: message,
              sessionId,
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
          `LLM processing for session ${sessionId}`,
        );

        // 发送完成事件
        sendEvent({ type: 'done', data: { response: result.response, sessionId, domainId: result.domainId } });
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
