"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Plus, Sliders, Mic } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}

// Agent avatar component
function AgentAvatar() {
  return (
    <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden mt-0.5">
      <Image src="/mascot.png" alt="Tbox" width={28} height={28} className="w-full h-full object-cover" />
    </div>
  );
}

// Typing indicator dots animation
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* Agent avatar */}
      <AgentAvatar />
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function ChatDialog({
  initialMessage = '',
  onClose,
}: {
  initialMessage?: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSent = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialMessageSent.current) {
      initialMessageSent.current = true;
      const userMsg = { id: `m-${Date.now()}`, sender: 'user' as const, text: initialMessage };
      setMessages([userMsg]);
      setIsTyping(true);

      (async () => {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: initialMessage }] }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error || `Request failed: ${res.status}`);
          }

          const data = await res.json();
          const replyText = data?.reply || '抱歉，未收到回复。';
          setMessages((prev) => [
            ...prev,
            { id: `a-${Date.now()}`, sender: 'agent' as const, text: replyText },
          ]);
        } catch (e: any) {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              sender: 'agent' as const,
              text: '抱歉，无法连接到对话服务：' + (e?.message ?? String(e)),
            },
          ]);
        } finally {
          setIsTyping(false);
        }
      })();
    }
  }, [initialMessage]);

  const handleSend = () => {
    if (!input.trim()) return;
    const id = `m-${Date.now()}`;
    // append user message immediately
    const userMessage = { id, sender: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    (async () => {
      try {
        // Build messages for API: map local messages to OpenAI role/content
        const msgs = [...messages, userMessage].map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: msgs }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Request failed: ${res.status}`);
        }

        const data = await res.json();
        const replyText = data?.reply || '抱歉，未收到回复。';
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, sender: 'agent' as const, text: replyText },
        ]);
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'agent' as const,
            text: '抱歉，无法连接到对话服务：' + (e?.message ?? String(e)),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    })();
  };

  // Derive a short title from the first user message
  const title = messages.find((m) => m.sender === 'user')?.text.slice(0, 30) || '新对话';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <span className="text-sm font-medium text-gray-700 truncate max-w-[50%]">{title}</span>
        <div className="w-16" /> {/* Spacer for balance */}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 bg-white">
        <div className="max-w-[780px] mx-auto space-y-8">
          {messages.map((m) =>
            m.sender === 'user' ? (
              /* ---- User message ---- */
              <div key={m.id} className="flex justify-end">
                <div className="bg-[#f0f0f0] text-[#1d1d1f] rounded-2xl rounded-br-md px-5 py-3 max-w-[75%] text-[15px] leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            ) : (
              /* ---- Agent message ---- */
              <div key={m.id} className="flex items-start gap-3">
                {/* Agent tbox mascot icon */}
                <AgentAvatar />
                <div className="text-[15px] leading-[1.8] text-gray-800 max-w-[85%] whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            )
          )}

          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Bottom input bar */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
        <div className="max-w-[780px] mx-auto">
          <div className="bg-[#f3f4f6] rounded-2xl px-4 py-3 flex flex-col">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="继续对话..."
              className="w-full bg-transparent text-[15px] text-gray-800 outline-none resize-none placeholder:text-gray-400 leading-normal"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer text-xs font-medium">
                  <Sliders className="w-3.5 h-3.5" />
                  工具
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-200/60 font-medium">
                  快速
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
