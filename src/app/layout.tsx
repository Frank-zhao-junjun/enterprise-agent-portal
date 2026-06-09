import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-context';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Ontology Hub · Multi-Domain Agent',
  description: 'Frontend main agent that calls different domain ontology models via MCP',
  keywords: ['ontology', 'agent', 'MCP', 'multi-domain', 'AI', 'semantic'],
  authors: [{ name: 'Frank Zhao', url: 'https://github.com/Frank-zhao-junjun' }],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Ontology Hub',
    description: 'Frontend main agent calling domain ontologies via MCP',
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
