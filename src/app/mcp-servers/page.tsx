'use client';

/**
 * MCP Server 管理页面
 * 展示服务器状态、工具列表、交互式测试
 */

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/app-context';
import { t } from '@/lib/i18n';
import { getAllDomains } from '@/lib/domain-registry';
import type { DomainOntology, MCPTool, MCPToolParameter } from '@/types/ontology';
import {
  Server,
  Play,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  Cpu,
  Truck,
  HeadphonesIcon,
  Boxes,
  Send,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  manufacturing: Cpu,
  'customer-service': HeadphonesIcon,
  'supply-chain': Truck,
};

type ServerStatus = 'online' | 'offline' | 'checking';

interface ToolTestResult {
  success: boolean;
  content: string;
  duration: number;
}

export default function MCPServersPage() {
  const { state } = useApp();
  const { locale } = state;
  const [domains, setDomains] = useState<DomainOntology[]>([]);
  const [serverStatus, setServerStatus] = useState<Record<string, ServerStatus>>({});
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [testArgs, setTestArgs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<ToolTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const all = getAllDomains();
    setDomains(all);
    if (all.length > 0 && !selectedDomain) {
      setSelectedDomain(all[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      for (const domain of domains) {
        setServerStatus((prev) => ({ ...prev, [domain.id]: 'checking' }));
        try {
          const res = await fetch(`/api/mcp/${domain.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
          });
          setServerStatus((prev) => ({
            ...prev,
            [domain.id]: res.ok ? 'online' : 'offline',
          }));
        } catch {
          setServerStatus((prev) => ({ ...prev, [domain.id]: 'offline' }));
        }
      }
    };
    if (domains.length > 0) checkStatus();
  }, [domains]);

  const currentDomain = domains.find((d) => d.id === selectedDomain);
  const currentTools = currentDomain?.tools || [];
  const currentTool = currentTools.find((tool) => tool.name === selectedTool);

  useEffect(() => {
    if (currentTools.length > 0 && !currentTools.find((t) => t.name === selectedTool)) {
      setSelectedTool(currentTools[0].name);
      setTestArgs({});
      setTestResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomain]);

  useEffect(() => {
    if (currentTool && currentTool.parameters) {
      const defaultArgs: Record<string, string> = {};
      (Object.entries(currentTool.parameters) as [string, MCPToolParameter][]).forEach(([name, param]) => {
        if (param.required) {
          if (param.enum && param.enum.length > 0) {
            defaultArgs[name] = param.enum[0];
          } else if (param.type === 'number') {
            defaultArgs[name] = '10';
          } else {
            defaultArgs[name] = '';
          }
        }
      });
      setTestArgs(defaultArgs);
      setTestResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTool]);

  const handleTest = useCallback(async () => {
    if (!selectedDomain || !selectedTool) return;
    setTesting(true);
    setTestResult(null);
    const startTime = Date.now();
    try {
      const res = await fetch(`/api/mcp/${selectedDomain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: selectedTool, arguments: testArgs },
        }),
      });
      const data = await res.json();
      const duration = Date.now() - startTime;
      if (data.result) {
        setTestResult({
          success: !data.result.isError,
          content: data.result.content,
          duration,
        });
      } else if (data.error) {
        setTestResult({
          success: false,
          content: JSON.stringify(data.error, null, 2),
          duration,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        content: String(err),
        duration: Date.now() - startTime,
      });
    } finally {
      setTesting(false);
    }
  }, [selectedDomain, selectedTool, testArgs]);

  const handleCopy = useCallback(() => {
    if (testResult) {
      navigator.clipboard.writeText(testResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [testResult]);

  const formatJson = (str: string): string => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* 标题 */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="size-6 text-primary" />
            {t('mcp_servers_title', locale)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('mcp_servers_subtitle', locale)}</p>
        </div>

        {/* 服务器列表 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {domains.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.id] || Boxes;
            const status = serverStatus[domain.id] || 'checking';
            const isSelected = selectedDomain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 bg-card/50 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {locale === 'zh' ? domain.name : domain.nameEn}
                    </span>
                  </div>
                  <StatusBadge status={status} locale={locale} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">/{domain.id}</p>
                <p className="text-xs text-muted-foreground">
                  {domain.tools.length} {t('tools_count', locale)}
                </p>
              </button>
            );
          })}
        </div>

        {/* 工具测试区 */}
        {currentDomain && (
          <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/30">
              <h2 className="text-base font-semibold">
                {locale === 'zh' ? '工具测试' : 'Tool Testing'} —{' '}
                {locale === 'zh' ? currentDomain.name : currentDomain.nameEn}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/30">
              {/* 左侧：工具选择和参数 */}
              <div className="p-5 space-y-4">
                {/* 工具选择 */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {locale === 'zh' ? '选择工具' : 'Select Tool'}
                  </label>
                  <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {currentTools.map((tool) => (
                      <option key={tool.name} value={tool.name}>
                        {tool.name} — {tool.description.slice(0, 40)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 工具描述 */}
                {currentTool && (
                  <p className="text-xs text-muted-foreground">{currentTool.description}</p>
                )}

                {/* 参数输入 */}
                {currentTool && currentTool.parameters &&
                  (Object.entries(currentTool.parameters) as [string, MCPToolParameter][]).map(([name, param]) => (
                    <div key={name}>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        <span className="font-mono text-primary">{name}</span>
                        <span className="text-muted-foreground/60 ml-1">({param.type})</span>
                        {param.required && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      {param.enum ? (
                        <select
                          value={testArgs[name] || ''}
                          onChange={(e) => setTestArgs((prev) => ({ ...prev, [name]: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="">--</option>
                          {param.enum.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={testArgs[name] || ''}
                          onChange={(e) => setTestArgs((prev) => ({ ...prev, [name]: e.target.value }))}
                          placeholder={param.description}
                          className="w-full px-3 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      )}
                    </div>
                  ))}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Play className="size-3.5" />
                    {testing
                      ? locale === 'zh'
                        ? '执行中...'
                        : 'Running...'
                      : locale === 'zh'
                        ? '执行测试'
                        : 'Run Test'}
                  </button>
                  <button
                    onClick={() => {
                      setTestResult(null);
                      setTestArgs({});
                    }}
                    className="px-3 py-2 rounded-lg border border-border/60 text-sm hover:bg-muted/50 transition-colors"
                    title={locale === 'zh' ? '重置' : 'Reset'}
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* 右侧：测试结果 */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {locale === 'zh' ? '测试结果' : 'Test Result'}
                  </label>
                  {testResult && (
                    <button
                      onClick={handleCopy}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copied
                        ? locale === 'zh'
                          ? '已复制'
                          : 'Copied'
                        : locale === 'zh'
                          ? '复制'
                          : 'Copy'}
                    </button>
                  )}
                </div>

                {!testResult && !testing && (
                  <div className="flex items-center justify-center h-48 text-muted-foreground/40 text-xs">
                    {locale === 'zh' ? '选择工具并执行测试' : 'Select a tool and run test'}
                  </div>
                )}

                {testing && (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    <CircleDot className="size-4 animate-pulse mr-2" />
                    {locale === 'zh' ? '执行中...' : 'Running...'}
                  </div>
                )}

                {testResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="size-4 text-green-500" />
                      ) : (
                        <AlertCircle className="size-4 text-red-500" />
                      )}
                      <span className="text-xs font-medium">
                        {testResult.success
                          ? locale === 'zh'
                            ? '执行成功'
                            : 'Success'
                          : locale === 'zh'
                            ? '执行失败'
                            : 'Failed'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {testResult.duration}ms
                      </span>
                    </div>
                    <pre className="text-xs bg-background rounded-lg p-3 overflow-auto max-h-64 border border-border/30 font-mono whitespace-pre-wrap break-all">
                      {formatJson(testResult.content)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, locale }: { status: ServerStatus; locale: string }) {
  if (status === 'checking') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
        <CircleDot className="size-2 animate-pulse" />
        {locale === 'zh' ? '检测中' : 'Checking'}
      </span>
    );
  }
  if (status === 'online') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600">
        <CheckCircle2 className="size-2" />
        {locale === 'zh' ? '在线' : 'Online'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">
      <AlertCircle className="size-2" />
      {locale === 'zh' ? '离线' : 'Offline'}
    </span>
  );
}
