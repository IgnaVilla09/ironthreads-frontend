'use client';

import dynamic from 'next/dynamic';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chat-store';
import { useOfflineStore } from '@/stores/offline-store';

const ChatPanel = dynamic(() => import('@/components/ui/chat-panel').then((mod) => mod.ChatPanel), {
  ssr: false,
});

export function FloatingChatButton() {
  const isOpen = useChatStore((state) => state.isOpen);
  const setOpen = useChatStore((state) => state.setOpen);
  const offline = useOfflineStore((state) => state.offline);

  return (
    <>
      <Button
        data-agent-attention={!isOpen && !offline ? 'true' : undefined}
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-50 flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-2xl border border-primary/20 bg-black px-2 py-2 text-white shadow-lg hover:bg-black/80 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-400 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:h-12 sm:w-auto sm:flex-row sm:gap-2 sm:rounded-full sm:px-4"
        aria-label={offline ? 'Agent Iron requiere conexión' : 'Abrir chat Agent Iron'}
        title={offline ? 'Requiere conexión' : undefined}
        disabled={offline}
        onClick={() => setOpen(true)}
      >
        <Bot className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-center text-[11px] font-medium leading-tight sm:text-sm">
          Agent Iron{offline ? <span className="hidden sm:inline"> · sin conexión</span> : null}
        </span>
      </Button>
      {isOpen && !offline ? <ChatPanel /> : null}
    </>
  );
}
