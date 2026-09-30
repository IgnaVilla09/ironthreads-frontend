'use client';

import * as React from 'react';
import { Bot, RotateCcw, Send } from 'lucide-react';
import { useChatStore, type Message as ChatMessage } from '@/stores/chat-store';
import { chatApiClient } from '@/lib/chat-api-client';
import { Message } from '@/components/ui/card';
import { ChatThinkingIndicator } from '@/components/ui/chat-thinking-indicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ChatScrollArea({ messages, isSending }: { messages: ChatMessage[]; isSending: boolean }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  return (
    <div ref={scrollRef} className="h-[26rem] space-y-3 overflow-x-hidden overflow-y-auto rounded-xl bg-zinc-50 p-3">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Bot className="h-10 w-10 text-primary/40" />
          <p>¡Hola! Soy Agent Iron 👋</p>
          <p>Preguntame por stock: por ejemplo, “¿Hay remera baseball negra en talle L?”</p>
        </div>
      ) : (
        messages.map((msg) => <Message key={msg.id} role={msg.role} content={msg.content} />)
      )}
      {isSending ? <ChatThinkingIndicator /> : null}
    </div>
  );
}

export function ChatPanel() {
  const conversationId = useChatStore((state) => state.conversationId);
  const messages = useChatStore((state) => state.messages);
  const setOpen = useChatStore((state) => state.setOpen);
  const addMessage = useChatStore((state) => state.addMessage);
  const resetConversation = useChatStore((state) => state.resetConversation);
  const [isSending, setIsSending] = React.useState(false);

  const handleClear = () => {
    if (conversationId) {
      void chatApiClient.clearConversation(conversationId).catch(() => {});
    }
    resetConversation();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.target as HTMLFormElement;
    const textInput = input.elements.namedItem('message') as HTMLInputElement;
    const messageText = textInput.value.trim();
    if (!messageText || isSending) return;

    addMessage({ role: 'user', content: messageText });
    textInput.value = '';
    setIsSending(true);

    try {
      const data = await chatApiClient.sendMessage(messageText, conversationId);
      addMessage({ role: 'assistant', content: data.response || 'Sin respuesta' });
    } catch (error) {
      addMessage({ role: 'assistant', content: error instanceof Error ? error.message : 'Error conectando con el servidor' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader className="justify-end">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Agent Iron
          </DialogTitle>
          <DialogDescription>Consultá sobre stock y disponibilidad de remeras</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-1.5 text-xs text-muted-foreground hover:text-primary"
            disabled={messages.length === 0 || isSending}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpiar conversación
          </Button>
        </div>

        <ChatScrollArea messages={messages} isSending={isSending} />

        <DialogFooter>
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input
              type="text"
              id="chat-message"
              name="message"
              aria-label="Consulta para Agent Iron"
              placeholder="Escribí tu consulta…"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isSending} aria-label="Enviar mensaje">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
