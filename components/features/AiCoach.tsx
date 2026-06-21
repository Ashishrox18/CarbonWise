'use client';

import { memo, useRef, useEffect, useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Leaf, Trash2 } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import { useChat } from '@/hooks/useChat';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const SUGGESTED_QUESTIONS = [
  'How can I reduce my food emissions?',
  'Is cycling better than taking the bus?',
  'How much CO₂ does a vegetarian diet save?',
  'What\'s the easiest way to start reducing my footprint?',
];

/**
 * AI Coach chat interface powered by Groq Llama 3.1.
 * Accessible keyboard navigation, auto-scroll to latest message.
 */
const AiCoach = memo(() => {
  const { chatMessages, clearChat } = useCarbonStore();
  const { sending, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, sending]);

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

  const handleClear = useCallback(() => {
    if (confirm('Clear chat history?')) clearChat();
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
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">CarbonWise Coach</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>
          {!isEmpty && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              aria-label="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
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
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="text-left text-xs text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-xl px-3 py-2.5 transition-colors"
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
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}
                  role={msg.role === 'assistant' ? 'status' : undefined}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {sending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1" aria-label="Typing">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </CardContent>

      {/* Input */}
      <div className="px-6 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sustainability…"
            rows={1}
            className="flex-1 resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            aria-label="Chat message"
            aria-multiline="true"
            maxLength={500}
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
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
});
AiCoach.displayName = 'AiCoach';

export default AiCoach;
