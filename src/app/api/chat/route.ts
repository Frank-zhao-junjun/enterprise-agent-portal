// === POST /api/chat — 真正的流式 SSE 聊天 API ===
import { NextRequest } from 'next/server';
import { runMainAgent } from '@/lib/triage-agent';
import type { ReasoningStep } from '@/types/ontology';

/** SSE 事件类型 */
interface SSEEvent {
  type: 'reasoning' | 'content' | 'error' | 'done';
  data: unknown;
}

// 会话存储（内存级，生产环境应替换为 Redis/DB）
const sessions = new Map<string, { history: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> }>();

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

  // 获取或创建会话
  if (!sessions.has(sid)) {
    sessions.set(sid, { history: [] });
  }
  const session = sessions.get(sid)!;

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
        // 运行主 Agent，每步即时推送
        const { response, updatedHistory, domainId } = await runMainAgent({
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

        // 保存对话历史
        session.history = updatedHistory.slice(-20); // 保留最近 20 条

        // 发送完成事件
        sendEvent({ type: 'done', data: { response, sessionId: sid, domainId } });
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
