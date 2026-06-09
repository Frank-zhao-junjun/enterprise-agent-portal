import { NextRequest } from 'next/server';
import { runMainAgent } from '@/lib/triage-agent';

/**
 * 主聊天 API
 * POST /api/chat
 * 接收用户消息，调用主 Agent 处理，返回 SSE 流式响应
 */
export async function POST(req: NextRequest) {
  let body: { message?: string; forcedDomainId?: string; locale?: 'zh' | 'en' } = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const message = body.message?.trim();
  if (!message) {
    return new Response(
      JSON.stringify({ error: 'Message is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const locale = body.locale === 'en' ? 'en' : 'zh';

  // 创建 SSE 流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 调用主 Agent
        const { reasoning, response, domainId } = await runMainAgent(message, locale);

        // 发送推理链每个步骤
        for (const step of reasoning) {
          const event = `event: reasoning\ndata: ${JSON.stringify(step)}\n\n`;
          controller.enqueue(encoder.encode(event));
          // 小延迟让前端有时间显示
          await new Promise((r) => setTimeout(r, 100));
        }

        // 发送最终响应
        const doneEvent = `event: done\ndata: ${JSON.stringify({
          fullContent: response,
          reasoningChain: reasoning,
          domainId,
        })}\n\n`;
        controller.enqueue(encoder.encode(doneEvent));

        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorEvent = `event: error\ndata: ${JSON.stringify({ message: errorMessage })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
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
