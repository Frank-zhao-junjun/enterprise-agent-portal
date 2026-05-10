// ============================================================
// API Route: POST /api/generate-architecture
// Generates Agent architecture from description using LLM (SSE streaming)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { GenerateArchitectureRequest, ArchitectureOutput } from '@/types/architecture';
import { buildArchitecturePrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  let body: GenerateArchitectureRequest;
  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  const { description, locale = 'en' } = body;

  if (!description?.intro && !description?.capabilities) {
    return new NextResponse('Missing description', { status: 400 });
  }

  const config = new Config();
  const client = new LLMClient(config, customHeaders);
  const prompt = buildArchitecturePrompt(description, locale);

  const thinkingMessages = locale === 'zh'
    ? ['正在分析业务场景...', '正在设计 Agent 架构...', '正在定义工具和规则...', '正在生成 Handoff 关系...']
    : ['Analyzing business scenario...', 'Designing agent architecture...', 'Defining tools and rules...', 'Generating handoff relationships...'];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Step 1: Send thinking events
      for (const thought of thinkingMessages) {
        controller.enqueue(encoder.encode(sseEvent({ type: 'thinking', content: thought })));
        await new Promise(r => setTimeout(r, 400));
      }

      // Step 2: Call LLM and stream response
      try {
        let fullResponse = '';

        for await (const chunk of client.stream(
          [{ role: 'user', content: prompt }],
          { model: 'kimi-k2-5-260127', temperature: 0.7 }
        )) {
          if (chunk.content) {
            const text = chunk.content.toString();
            fullResponse += text;
            controller.enqueue(encoder.encode(sseEvent({ type: 'partial', content: text })));
          }
        }

        // Step 3: Parse and validate JSON
        controller.enqueue(encoder.encode(sseEvent({ type: 'thinking', content: locale === 'zh' ? '正在解析架构数据...' : 'Parsing architecture data...' })));

        // Try to extract JSON from response
        let jsonStr = fullResponse.trim();
        // Remove markdown fences if present
        const fenceMatch = jsonStr.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        if (fenceMatch) jsonStr = fenceMatch[1].trim();

        const architecture: ArchitectureOutput = JSON.parse(jsonStr);

        // Validate structure
        if (!architecture.triage_agent || !Array.isArray(architecture.spoke_agents)) {
          throw new Error('Invalid architecture structure');
        }

        controller.enqueue(encoder.encode(sseEvent({ type: 'complete', content: architecture })));
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
