import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import { AppProvider } from '@/contexts/app-context';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansSC = Noto_Sans_SC({ subsets: ['latin'], variable: '--font-noto-sc' });

export const metadata: Metadata = {
  title: {
    default: 'Agent Architecture Designer',
    template: '%s | Agent Architecture Designer',
  },
  description:
    'Design Hub-and-Spoke Multi-Agent architectures with LLM-powered generation and interactive demos.',
  keywords: [
    'Multi-Agent',
    'Agent Architecture',
    'Hub-and-Spoke',
    'LLM',
    'AI Agent',
    'Guardrails',
    'Agent Designer',
  ],
  authors: [{ name: 'Coze Code Team', url: 'https://code.coze.cn' }],
  generator: 'Coze Code',
  icons: {
    icon: '',
  },
  openGraph: {
    title: 'Agent Architecture Designer',
    description: 'Design Hub-and-Spoke Multi-Agent architectures',
    url: process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000',
    siteName: 'Agent Architecture Designer',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className={`antialiased font-sans`}>
        <AppProvider>
          {children}
          {process.env.NODE_ENV === 'development' && <Inspector />}
        </AppProvider>
      </body>
    </html>
  );
}
