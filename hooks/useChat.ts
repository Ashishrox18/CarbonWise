'use client';

/**
 * @fileoverview Hook managing the AI Coach chat session.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';

/** Shape of the chat API response. */
interface ChatApiResponse {
  response?: string;
  error?: string;
}

/** Return type of {@link useChat}. */
export interface UseChatReturn {
  /** Whether a message is currently being sent / awaiting response. */
  sending: boolean;
  /**
   * Sends a user message to the AI coach and appends the response.
   * Handles errors gracefully by showing a fallback message.
   *
   * @param text - The user's message text.
   */
  sendMessage: (text: string) => Promise<void>;
}

/**
 * Sends messages to the Groq AI coach and manages the chat state.
 *
 * @returns Sending state and send callback.
 */
export function useChat(): UseChatReturn {
  const { chatMessages, addChatMessage } = useCarbonStore();
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id:        uuidv4(),
        role:      'user',
        content:   trimmed,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(userMsg);
      setSending(true);

      try {
        const history = chatMessages.slice(-10).map(m => ({
          role:    m.role,
          content: m.content,
        }));

        const res  = await fetch('/api/chat', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ message: trimmed, history }),
        });

        const data = await res.json() as ChatApiResponse;

        addChatMessage({
          id:        uuidv4(),
          role:      'assistant',
          content:   data.response ?? data.error ?? "Sorry, I couldn't respond right now.",
          timestamp: new Date().toISOString(),
        });
      } catch {
        addChatMessage({
          id:        uuidv4(),
          role:      'assistant',
          content:   "I'm having trouble connecting right now. Please try again in a moment.",
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
