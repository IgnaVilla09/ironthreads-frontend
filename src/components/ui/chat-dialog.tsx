'use client';

import * as React from 'react';
import { useChatStore } from '@/stores/chat-store';
import { apiClient } from '@/lib/api-client';
import { renderChatContent } from '@/lib/chat-content';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Message } from '@/components/ui/card';
import { Dialog, DialogOverlay, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

export const ChatDialog = () => {
  const { messages, addMessage, clearMessages } = useChatStore();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.target as HTMLFormElement;
    const textInput = input.elements.namedItem('message') as HTMLInputElement;
    const messageText = textInput.value.trim();
    if (!messageText) return;

    addMessage({ role: 'user', content: messageText });
    textInput.value = '';

    try {
      const data = await apiClient.post<{ response: string }>('/api/v1/chat/message', {
        message: messageText,
      });
      addMessage({ role: 'assistant', content: data.data?.response || 'Sin respuesta' });
    } catch (err) {
      addMessage({ role: 'assistant', content: 'Error conectando con el servidor' });
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

      <div className="h-64 overflow-y-auto space-y-2 px-2 pb-3">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))}
      </div>

      <DialogFooter>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            type="text"
            name="message"
            placeholder="Escribí tu consulta..."
          />
          <Button type="submit">Enviar</Button>
        </form>
      </DialogFooter>
    </DialogContent>
  );
};