// ============================================================
// API Route: POST /api/generate-scenarios
// Generates demo scenarios from architecture using LLM (SSE streaming)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { GenerateScenariosRequest } from '@/types/architecture';
import { buildScenariosPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  let body: GenerateScenariosRequest;
  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  const { architecture, locale = 'en' } = body;

  if (!architecture?.triage_agent) {
    return new NextResponse('Missing architecture', { status: 400 });
  }

  const config = new Config();
  const client = new LLMClient(config, customHeaders);
  const prompt = buildScenariosPrompt(architecture, locale);

  const thinkingMessages = locale === 'zh'
    ? ['正在分析架构...', '正在设计业务场景...', '正在生成对话流程...', '正在完善场景细节...']
    : ['Analyzing architecture...', 'Designing business scenarios...', 'Generating dialogue flows...', 'Finalizing scenario details...'];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Step 1: Send thinking events
      for (const thought of thinkingMessages) {
        controller.enqueue(encoder.encode(sseEvent({ type: 'thinking', content: thought })));
        await new Promise(r => setTimeout(r, 400));
      }

      // Step 2: Call LLM
      try {
        let fullResponse = '';

        for await (const chunk of client.stream(
          [{ role: 'user', content: prompt }],
          { model: 'kimi-k2-5-260127', temperature: 0.8 }
        )) {
          if (chunk.content) {
            const text = chunk.content.toString();
            fullResponse += text;
            controller.enqueue(encoder.encode(sseEvent({ type: 'partial', content: text })));
          }
        }

        // Step 3: Parse JSON
        controller.enqueue(encoder.encode(sseEvent({ type: 'thinking', content: locale === 'zh' ? '正在解析场景数据...' : 'Parsing scenario data...' })));

        let jsonStr = fullResponse.trim();
        const fenceMatch = jsonStr.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        if (fenceMatch) jsonStr = fenceMatch[1].trim();

        const result = JSON.parse(jsonStr);

        if (!result.scenarios || !Array.isArray(result.scenarios)) {
          throw new Error('Invalid scenarios structure');
        }

        controller.enqueue(encoder.encode(sseEvent({ type: 'complete', content: result.scenarios })));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(sseEvent({ type: 'error', content: errorMsg })));
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
