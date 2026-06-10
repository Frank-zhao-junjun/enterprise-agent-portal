'use client';

import { ChatClient } from '@/components/chat/ChatClient';
import { ArchitectureInfo } from '@/components/layout/ArchitectureInfo';

export default function ShowcasePage() {
  return (
    <>
      <ChatClient />
      <ArchitectureInfo />
    </>
  );
}
