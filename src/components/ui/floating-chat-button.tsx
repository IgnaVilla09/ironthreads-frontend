'use client';

import * as React from 'react';
import { Bot, RotateCcw, Send } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { apiClient } from '@/lib/api-client';
import { Message } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ChatScrollArea = ({ messages }: { messages: ChatMessage[] }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-[26rem] space-y-3 overflow-x-hidden overflow-y-auto rounded-xl bg-zinc-50 p-3">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Bot className="h-10 w-10 text-primary/40" />
          <p>¡Hola! Soy Agent Iron 👋</p>
          <p>Preguntame por stock: ej. "¿Hay remera baseball negra en talla L?"</p>
        </div>
      ) : (
        messages.map((msg) => (
          <Message
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))
      )}
    </div>
  );
};

export const FloatingChatButton = () => {
  const { conversationId, messages, isOpen, toggle, addMessage, resetConversation } = useChatStore();
  const [isSending, setIsSending] = React.useState(false);

  const handleClear = () => {
    if (conversationId) {
      apiClient.delete(`/api/v1/chat/messages/${conversationId}`).catch(() => {});
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
      const data = await apiClient.post<{ response: string }>('/api/v1/chat/message', {
        message: messageText,
        conversationId,
      });
      addMessage({ role: 'assistant', content: data.data?.response || 'Sin respuesta' });
    } catch {
      addMessage({ role: 'assistant', content: 'Error conectando con el servidor' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full border border-primary/20 bg-zinc-900 px-4 py-2 text-white shadow-lg hover:bg-zinc-800"
          aria-label="Abrir chat Agent Iron"
        >
          <Bot className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Agent Iron</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogHeader className="justify-end">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Agent Iron
          </DialogTitle>
          <DialogDescription>
            Consultá sobre stock y disponibilidad de remeras
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-1.5 text-xs text-muted-foreground hover:text-primary"
            disabled={messages.length === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpiar conversación
          </Button>
        </div>

        <ChatScrollArea messages={messages} />

        <DialogFooter>
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input
              type="text"
              name="message"
              placeholder="Escribí tu consulta..."
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
};