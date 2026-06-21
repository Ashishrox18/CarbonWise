'use client';

/**
 * @fileoverview Hook managing the AI Coach chat session.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';

interface UseChatReturn {
  sending:  boolean;
  sendMessage: (text: string) => Promise<void>;
}

/**
 * Sends a message to the Groq AI coach and stores the response.
 */
export function useChat(): UseChatReturn {
  const { chatMessages, addChatMessage } = useCarbonStore();
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id:        uuidv4(),
        role:      'user',
        content:   text.trim(),
        timestamp: new Date().toISOString(),
      };
      addChatMessage(userMsg);
      setSending(true);

      try {
        const history = chatMessages.slice(-10).map(m => ({
          role:    m.role,
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ message: text.trim(), history }),
        });

        const data = await res.json() as { response?: string; error?: string };

        const assistantMsg: ChatMessage = {
          id:        uuidv4(),
          role:      'assistant',
          content:   data.response ?? data.error ?? 'Sorry, I couldn\'t respond right now.',
          timestamp: new Date().toISOString(),
        };
        addChatMessage(assistantMsg);
      } catch {
        addChatMessage({
          id:        uuidv4(),
          role:      'assistant',
          content:   'I\'m having trouble connecting right now. Please try again in a moment.',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setSending(false);
      }
    },
    [chatMessages, addChatMessage]
  );

  return { sending, sendMessage };
}
