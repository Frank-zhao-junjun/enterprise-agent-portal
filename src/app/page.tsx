'use client';

import { ChatClient } from '@/components/chat/ChatClient';
import { ArchitectureInfo } from '@/components/layout/ArchitectureInfo';

export default function Page() {
  return (
    <>
      <ChatClient />
      <ArchitectureInfo />
    </>
  );
}
