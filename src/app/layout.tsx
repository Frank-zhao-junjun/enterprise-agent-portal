import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-context';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: '企业 Agent 平台 · Enterprise Agent Portal',
  description: 'Enterprise agent portal — unified entry calling domain ontologies via MCP',
  keywords: ['agent', 'enterprise', 'MCP', 'multi-domain', 'AI', 'ontology', 'semantic'],
  authors: [{ name: 'Frank Zhao', url: 'https://github.com/Frank-zhao-junjun' }],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: '企业 Agent 平台',
    description: 'Enterprise agent portal — unified entry calling domain ontologies via MCP',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider>
          <div className="flex h-screen flex-col bg-background text-foreground">
            <Header />
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
