'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const makeConversationId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface ChatState {
  conversationId: string;
  messages: Message[];
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  clearMessages: () => void;
  resetConversation: () => void;
}

export const useChatStore = create(
  persist<ChatState>(
    (set) => ({
      conversationId: makeConversationId(),
      messages: [],
      isOpen: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { id: Date.now().toString(), createdAt: new Date(), ...message }],
        })),
      clearMessages: () => set({ messages: [] }),
      resetConversation: () =>
        set({ conversationId: makeConversationId(), messages: [] }),
    }),
    {
      name: 'iron-chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);