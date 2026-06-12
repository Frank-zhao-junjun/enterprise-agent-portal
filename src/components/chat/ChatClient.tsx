'use client';

/**
 * 主聊天客户端
 * 包含：领域选择、聊天输入、消息流、推理链展示
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { t, formatTime } from '@/lib/i18n';
import { getAllDomains, getDomainById } from '@/lib/domain-registry';
import type { ChatMessage, ReasoningStep, DomainOntology } from '@/types/ontology';
import { DomainSelector } from '@/components/domain-selector/DomainSelector';
import { ReasoningChain } from '@/components/reasoning/ReasoningChain';
import {
  Send,
  Sparkles,
  ChevronRight,
  Bot,
  User,
  Loader2,
  Lightbulb,
  Layers,
} from 'lucide-react';

export function ChatClient() {
  const { state, dispatch } = useApp();
  const { locale, chatMessages, isThinking } = state;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text || input).trim();
      if (!messageText || isThinking) return;

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMessage });
      setInput('');
      dispatch({ type: 'SET_THINKING', isThinking: true });

      // 准备 agent 消息占位
      const agentMessageId = `agent-${Date.now()}`;
      const placeholderMessage: ChatMessage = {
        id: agentMessageId,
        role: 'agent',
        content: '',
        reasoning: [],
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: placeholderMessage });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            forcedDomainId: state.activeDomainId,
            locale,
          }),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedContent = '';
        const reasoningSteps: ReasoningStep[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE：每个事件格式为 `data: {...}\n\n`
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // 最后一部分可能不完整，保留

          for (const part of parts) {
            const lines = part.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              const jsonStr = line.slice(6);
              try {
                const event = JSON.parse(jsonStr) as {
                  type: 'reasoning' | 'content' | 'error' | 'done';
                  data: unknown;
                };

                if (event.type === 'reasoning') {
                  const step = event.data as ReasoningStep;
                  reasoningSteps.push(step);
                  dispatch({
                    type: 'UPDATE_CHAT_MESSAGE',
                    messageId: agentMessageId,
                    updates: { reasoning: [...reasoningSteps] },
                  });
                } else if (event.type === 'content') {
                  const data = event.data as { chunk: string };
                  accumulatedContent += data.chunk;
                  dispatch({
                    type: 'UPDATE_CHAT_MESSAGE',
                    messageId: agentMessageId,
                    updates: { content: accumulatedContent },
                  });
                } else if (event.type === 'done') {
                  const data = event.data as { response?: string; sessionId?: string; domainId?: string };
                  dispatch({
                    type: 'UPDATE_CHAT_MESSAGE',
                    messageId: agentMessageId,
                    updates: {
                      content: data.response || accumulatedContent,
                      domainId: data.domainId,
                      reasoning: [...reasoningSteps],
                    },
                  });
                } else if (event.type === 'error') {
                  const data = event.data as { error: string };
                  dispatch({
                    type: 'UPDATE_CHAT_MESSAGE',
                    messageId: agentMessageId,
                    updates: {
                      content: `${t('error_general', locale)}: ${data.error}`,
                    },
                  });
                }
              } catch (e) {
                console.error('Failed to parse SSE event', e);
              }
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        dispatch({
          type: 'UPDATE_CHAT_MESSAGE',
          messageId: agentMessageId,
          updates: { content: `${t('error_general', locale)}: ${errorMsg}` },
        });
      } finally {
        dispatch({ type: 'SET_THINKING', isThinking: false });
      }
    },
    [input, isThinking, locale, state.activeDomainId, dispatch],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="flex h-full">
      {/* 左侧：领域选择器 */}
      <aside className="hidden md:flex w-80 border-r border-border/50 bg-card/30 flex-col overflow-y-auto">
        <DomainSelector />
      </aside>

      {/* 中间：聊天区 */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {chatMessages.length === 0 ? (
            <EmptyState onSelectExample={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {chatMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区 */}
        <div className="border-t border-border/50 bg-card/30 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat_placeholder', locale)}
                className="w-full resize-none rounded-2xl border border-border/60 bg-background/80 px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 min-h-[52px] max-h-32"
                rows={1}
                disabled={isThinking}
              />
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isThinking}
                className="absolute right-2 bottom-2 p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                aria-label={t('chat_send', locale)}
              >
                {isThinking ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** 消息气泡 */
function MessageBubble({ message }: { message: ChatMessage }) {
  const { state } = useApp();
  const locale = state.locale;
  const isUser = message.role === 'user';
  const domain = message.domainId ? getDomainById(message.domainId) : undefined;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像 */}
      <div
        className={`flex-shrink-0 size-9 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20'
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* 内容 */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? t('chat_user', locale) : t('chat_agent', locale)}
          </span>
          {domain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {locale === 'zh' ? domain.name : domain.nameEn}
            </span>
          )}
          <span className="text-xs text-muted-foreground/60">
            {formatTime(message.timestamp, locale)}
          </span>
        </div>

        {/* 推理链（仅 Agent 消息且有推理步骤时显示） */}
        {!isUser && message.reasoning && message.reasoning.length > 0 && (
          <details className="mb-2 group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 select-none">
              <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
              <span className="font-medium">{t('chat_reasoning_chain', locale)}</span>
              <span className="text-muted-foreground/60">
                · {message.reasoning.length} steps
              </span>
            </summary>
            <div className="mt-2">
              <ReasoningChain steps={message.reasoning} />
            </div>
          </details>
        )}

        {/* 消息内容 */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
              isUser
                ? 'bg-primary text-primary-foreground max-w-[80%]'
                : 'bg-card border border-border/60 text-foreground'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Agent 正在思考但无内容时显示加载 */}
        {!isUser && !message.content && message.reasoning && message.reasoning.length === 0 && (
          <div className="rounded-2xl px-4 py-2.5 text-sm bg-card border border-border/60 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {t('chat_thinking', locale)}
          </div>
        )}
      </div>
    </div>
  );
}

/** 空状态 */
function EmptyState({ onSelectExample }: { onSelectExample: (q: string) => void }) {
  const { state } = useApp();
  const locale = state.locale;
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-10">
        <div className="inline-flex size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center mb-4 border border-primary/20">
          <Sparkles className="size-7 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">{t('chat_empty_title', locale)}</h2>
        <p className="text-muted-foreground text-sm">{t('chat_empty_desc', locale)}</p>
      </div>

      <div className="space-y-4">
        {getAllDomains().map((domain) => (
          <DomainExampleCard
            key={domain.id}
            domain={domain}
            onSelect={onSelectExample}
          />
        ))}
      </div>
    </div>
  );
}

/** 领域示例卡片 */
function DomainExampleCard({
  domain,
  onSelect,
}: {
  domain: DomainOntology;
  onSelect: (q: string) => void;
}) {
  const { state } = useApp();
  const locale = state.locale;
  const examples = domain.exampleQuestions?.length
    ? locale === 'zh'
      ? domain.exampleQuestions
      : domain.exampleQuestionsEn ?? domain.exampleQuestions
    : [];
  const name = locale === 'zh' ? domain.name : domain.nameEn;
  const desc = locale === 'zh' ? domain.description : domain.descriptionEn;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Layers className="size-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {domain.tools.length} {t('tools_count', locale)}
        </span>
      </div>
      {examples.length > 0 && (
        <div className="space-y-1.5">
          {examples.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelect(q)}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-colors flex items-center gap-2 group"
            >
              <Lightbulb className="size-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              <span className="text-foreground/80 group-hover:text-foreground">{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
