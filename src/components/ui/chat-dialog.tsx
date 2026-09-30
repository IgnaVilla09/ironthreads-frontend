'use client';

import * as React from 'react';
import { useChatStore } from '@/stores/chat-store';
import { chatApiClient } from '@/lib/chat-api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Message } from '@/components/ui/card';
import { ChatThinkingIndicator } from '@/components/ui/chat-thinking-indicator';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export const ChatDialog = () => {
  const { messages, conversationId, addMessage } = useChatStore();
  const [isSending, setIsSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

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
    <DialogContent className="w-full max-w-2xl">
      <DialogHeader className="justify-end">
        <DialogTitle>Asistente de Remeras</DialogTitle>
        <DialogDescription>
          Consultá sobre stock y disponibilidad de remeras
        </DialogDescription>
      </DialogHeader>

      <div ref={scrollRef} className="h-64 overflow-y-auto space-y-2 px-2 pb-3">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))}
        {isSending ? <ChatThinkingIndicator /> : null}
      </div>

      <DialogFooter>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            type="text"
            name="message"
            placeholder="Escribí tu consulta..."
          />
          <Button type="submit" disabled={isSending}>Enviar</Button>
        </form>
      </DialogFooter>
    </DialogContent>
  );
};
