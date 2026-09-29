'use client';

import dynamic from 'next/dynamic';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chat-store';

const ChatPanel = dynamic(() => import('@/components/ui/chat-panel').then((mod) => mod.ChatPanel), {
  ssr: false,
});

export function FloatingChatButton() {
  const isOpen = useChatStore((state) => state.isOpen);
  const setOpen = useChatStore((state) => state.setOpen);

  return (
    <>
      <Button
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-50 flex h-12 items-center gap-2 rounded-full border border-primary/20 bg-black px-4 py-2 text-white shadow-lg hover:bg-black/80"
        aria-label="Abrir chat Agent Iron"
        onClick={() => setOpen(true)}
      >
        <Bot className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Agent Iron</span>
      </Button>
      {isOpen ? <ChatPanel /> : null}
    </>
  );
}
