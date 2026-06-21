'use client';

/**
 * @fileoverview AI Coach chat interface powered by Groq Llama 3.1.
 *
 * Accessibility notes:
 * - Chat messages use role="status" (polite) for assistant responses
 * - Typing indicator has aria-label="AI is typing"
 * - Textarea: aria-label, maxLength enforced
 * - Clear confirmation uses in-component state (no browser confirm())
 *   to preserve keyboard accessibility and avoid blocking the main thread
 * - Auto-scroll preserves focus position
 */

import { memo, useRef, useEffect, useState, useCallback, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Leaf, Trash2, X } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import { useChat } from '@/hooks/useChat';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const SUGGESTED_QUESTIONS = [
  'How can I reduce my food emissions?',
  'Is cycling better than taking the bus?',
  'How much CO₂ does a vegetarian diet save?',
  "What's the easiest way to start reducing my footprint?",
] as const;

/**
 * AI Coach chat interface powered by Groq Llama 3.1.
 * Accessible keyboard navigation; auto-scrolls to latest message.
 */
const AiCoach = memo(() => {
  const { chatMessages, clearChat } = useCarbonStore();
  const { sending, sendMessage }    = useChat();

  const [input,          setInput]          = useState('');
  const [confirmClear,   setConfirmClear]   = useState(false);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const confirmRef  = useRef<HTMLButtonElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, sending]);

  // Move focus to confirm button when it appears
  useEffect(() => {
    if (confirmClear) confirmRef.current?.focus();
  }, [confirmClear]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  }, [input, sending, sendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestion = useCallback((q: string) => {
    setInput(q);
    inputRef.current?.focus();
  }, []);

  const handleClearRequest = useCallback(() => setConfirmClear(true), []);
  const handleClearCancel  = useCallback(() => {
    setConfirmClear(false);
    inputRef.current?.focus();
  }, []);
  const handleClearConfirm = useCallback(() => {
    clearChat();
    setConfirmClear(false);
    inputRef.current?.focus();
  }, [clearChat]);

  const isEmpty = chatMessages.length === 0;

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                CarbonWise Coach
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>

          {/* Clear chat — uses accessible in-component confirmation */}
          {!isEmpty && !confirmClear && (
            <button
              onClick={handleClearRequest}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 px-1 py-0.5"
              aria-label="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Clear
            </button>
          )}

          {confirmClear && (
            <div
              role="alertdialog"
              aria-modal="false"
              aria-label="Confirm clear chat"
              className="flex items-center gap-2"
            >
              <span className="text-xs text-gray-600 dark:text-gray-300">Clear all?</span>
              <button
                ref={confirmRef}
                onClick={handleClearConfirm}
                className="text-xs text-red-600 hover:text-red-700 font-semibold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 px-1"
                aria-label="Confirm clear chat history"
              >
                Yes
              </button>
              <button
                onClick={handleClearCancel}
                className="text-xs text-gray-500 hover:text-gray-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 px-1"
                aria-label="Cancel clear chat"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto flex flex-col gap-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Bot className="w-10 h-10 text-brand-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Hi! I&apos;m your CarbonWise Coach.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ask me anything about reducing your carbon footprint.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs" role="list" aria-label="Suggested questions">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  role="listitem"
                  onClick={() => handleSuggestion(q)}
                  className="text-left text-xs text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {chatMessages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs ${
                    msg.role === 'user' ? 'bg-gray-400 dark:bg-gray-600' : 'bg-brand-600'
                  }`}
                  aria-hidden="true"
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Bot  className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}
                  // status for assistant (polite), nothing extra for user
                  role={msg.role === 'assistant' ? 'status' : undefined}
                  aria-label={
                    msg.role === 'user'
                      ? `You: ${msg.content}`
                      : `Coach: ${msg.content}`
                  }
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {sending && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                </div>
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1"
                  aria-label="AI is typing"
                  role="status"
                >
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </CardContent>

      {/* Input area */}
      <div className="px-6 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 items-end">
          <label htmlFor="chat-input" className="sr-only">
            Chat message
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sustainability…"
            rows={1}
            maxLength={500}
            className="flex-1 resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            aria-describedby="chat-input-hint"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="md"
            className="shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
        <p id="chat-input-hint" className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
});
AiCoach.displayName = 'AiCoach';

export default AiCoach;
