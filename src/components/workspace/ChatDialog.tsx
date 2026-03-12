"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Sliders, ArrowUp, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  streaming?: boolean;
}

// Agent avatar component
function AgentAvatar() {
  return (
    <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden mt-0.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="Tbox" width={28} height={28} className="w-full h-full object-cover" />
    </div>
  );
}

// Typing indicator dots animation
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <AgentAvatar />
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// Cursor blink for streaming messages
function StreamingCursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] bg-gray-500 ml-0.5 align-middle animate-pulse" />
  );
}

/**
 * Calls /api/chat with the given messages, reads the SSE stream,
 * and calls onToken for each incremental text chunk, onDone when finished.
 */
async function streamChat(
  messages: { role: string; content: string }[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => `HTTP ${res.status}`);
      let errMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        // parsed.error may be a string or a nested object with .message
        const raw = parsed?.error;
        errMsg = typeof raw === 'string' ? raw : (raw?.message ?? errText);
      } catch {}
      // Map known status codes to friendly Chinese messages
      const status = res.status;
      if (status === 429) {
        errMsg = '请求太频繁，请稍等片刻再试 🙏';
      } else if (status === 401 || status === 403) {
        errMsg = '服务授权失败，请联系管理员';
      } else if (status >= 500) {
        errMsg = '服务暂时不可用，请稍后重试';
      }
      onError('抱歉，' + errMsg);
      return;
    }

    const contentType = res.headers.get('Content-Type') ?? '';
    // Non-streaming fallback (shouldn't happen in normal flow)
    if (!contentType.includes('text/event-stream')) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content ?? data?.reply ?? '抱歉，未收到回复。';
      onToken(text);
      onDone();
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // last partial line stays in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // comment/empty
        if (trimmed === 'data: [DONE]') { onDone(); return; }
        if (!trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const chunk = JSON.parse(jsonStr);
          const delta = chunk?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            onToken(delta);
          }
        } catch {
          // Malformed chunk — skip
        }
      }
    }
    onDone();
  } catch (e: any) {
    onError('抱歉，无法连接到对话服务：' + (e?.message ?? String(e)));
  }
}

/** Markdown renderer for agent messages */
function AgentMessageContent({ text, streaming }: { text: string; streaming?: boolean }) {
  return (
    <div className="max-w-[85%]">
      <div className="prose prose-sm prose-gray max-w-none text-[15px] leading-[1.8] [&_p]:mt-0 [&_p]:mb-2 [&_ul]:mt-1 [&_ol]:mt-1 [&_li]:my-0.5 [&_pre]:bg-gray-100 [&_pre]:rounded-xl [&_code]:text-sm [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
      {streaming && <StreamingCursor />}
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
  const welcomeMsg: Message = {
    id: 'welcome',
    sender: 'agent',
    text: '你好呀，我是 Tbox 👋\n\n你希望我怎么称呼你？你是从事什么行业的？\n\n当然，你也可以给我起个专属的昵称——你想怎么称呼我？😄',
  };
  const [messages, setMessages] = useState<Message[]>(initialMessage.trim() ? [] : [welcomeMsg]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false); // waiting for first token
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSent = useRef(false);

  // Auto-scroll to bottom on new messages / content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send initial message on mount
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialMessageSent.current) {
      initialMessageSent.current = true;
      doSend(initialMessage, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  /**
   * Core send logic — works for both initial message and user-typed messages.
   * `currentMessages` is the message history at the time of sending.
   */
  function doSend(text: string, currentMessages: Message[]) {
    const userMsg: Message = { id: `m-${Date.now()}`, sender: 'user', text };
    const updatedMsgs = [...currentMessages, userMsg];
    setMessages(updatedMsgs);
    setIsWaiting(true);

    const agentId = `a-${Date.now() + 1}`;
    let started = false;

    const apiMsgs = updatedMsgs.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    streamChat(
      apiMsgs,
      (token) => {
        if (!started) {
          started = true;
          setIsWaiting(false);
          // Insert the agent message placeholder
          setMessages((prev) => [...prev, { id: agentId, sender: 'agent', text: token, streaming: true }]);
        } else {
          // Append token to existing agent message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentId ? { ...m, text: m.text + token } : m
            )
          );
        }
      },
      () => {
        // Mark streaming as done; if no tokens ever arrived show a fallback
        setIsWaiting(false);
        if (!started) {
          setMessages((prev) => [
            ...prev,
            { id: agentId, sender: 'agent', text: '抱歉，暂时没有收到回复，请稍后重试。' },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === agentId ? { ...m, streaming: false } : m))
          );
        }
      },
      (errMsg) => {
        setIsWaiting(false);
        if (!started) {
          setMessages((prev) => [...prev, { id: agentId, sender: 'agent', text: errMsg }]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentId ? { ...m, text: m.text + '\n\n' + errMsg, streaming: false } : m
            )
          );
        }
      },
    );
  }

  const handleSend = () => {
    if (!input.trim() || isWaiting) return;
    const text = input.trim();
    setInput('');
    doSend(text, messages);
  };

  const title = messages.find((m) => m.sender === 'user')?.text.slice(0, 30) || '新对话';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800 cursor-pointer flex-shrink-0"
          aria-label="返回"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-700 truncate flex-1 text-center pr-8">{title}</span>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 bg-white">
        <div className="max-w-[780px] mx-auto space-y-8">
          {messages.map((m) =>
            m.sender === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <div className="bg-[#f0f0f0] text-[#1d1d1f] rounded-2xl rounded-br-md px-5 py-3 max-w-[75%] text-[15px] leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-3">
                <AgentAvatar />
                <AgentMessageContent text={m.text} streaming={m.streaming} />
              </div>
            )
          )}

          {isWaiting && <TypingIndicator />}
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
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isWaiting}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
