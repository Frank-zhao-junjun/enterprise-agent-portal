import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: '本体模型平台 · Ontology Platform',
  description: 'Ontology Platform — MCP Server & Domain Ontology Management',
  keywords: ['ontology', 'MCP', 'semantic', 'enterprise', 'domain model', 'AI'],
  authors: [{ name: 'Frank Zhao', url: 'https://github.com/Frank-zhao-junjun' }],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: '本体模型平台',
    description: 'Ontology Platform — MCP Server & Domain Ontology Management',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider>
          <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
