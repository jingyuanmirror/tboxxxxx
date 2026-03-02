'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Plus, X, MoreHorizontal, Zap, Bot,
  Trash2, Copy, Play, Pencil, ArrowRight,
  ShoppingBag, Wrench, Users, Star, Clock, FolderOpen,
  Globe, BarChart2, PenLine, FileText, Link2, Brain, Code2, Box,
  Store, CheckCircle2, XCircle, ExternalLink,
} from 'lucide-react';
import {
  myAgents as initialAgents,
  mySkills as initialSkills,
  ROLE_LABELS_ZH,
  CATEGORY_LABELS_ZH,
  CATEGORY_BADGE,
  type MyAgent,
  type MySkill,
  type AssetSource,
  type ListingStatus,
  type ListingInfo,
  type ListingPricing,
} from '@/lib/myToolsMock';
import {
  mockAgents, ROLE_LABELS, getLowestPrice,
  type MarketAgent, type SkillCategory,
} from '@/lib/marketMock';

// ─── Types ─────────────────────────────────────────
type MainTab = 'agents' | 'skills';
type SubTab = 'built' | 'purchased';

// ─── Build chat ────────────────────────────────────
interface BuildMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  streaming?: boolean;
}

const AGENT_SYSTEM_PROMPT = `你是 Tbox，帮用户通过对话创建一个专属 Agent。
对话流程（严格按步骤走，每次只问一件事）：
1. 询问 Agent 的核心用途（用自然语言描述）
2. 根据用途推荐2-3个名字，让用户选择或自定义
3. 推荐3-5个相关 Skill（网页搜索/表格解析/定时推送/摘要生成/代码审查等），让用户勾选
4. 让用户确认或修改 Slogan（可生成建议）
5. 汇总配置后确认创建

语气：简洁、友好、引导感强。每条消息不超过100字。`;

const SKILL_SYSTEM_PROMPT = `你是 Tbox，帮用户通过对话创建一个新的 Skill（能力单元）。
对话流程（严格按步骤走，每次只问一件事）：
1. 询问这个 Skill 要做什么（自然语言描述场景）
2. 根据描述生成配置草稿（名称、分类、参数），展示后让用户确认或调整
3. 询问是否要立即挂载到某个已有 Agent
4. 确认创建

语气：简洁、专业、有引导感。每条消息不超过100字。`;

// Streaming chat call
async function streamBuild(
  messages: { role: string; content: string }[],
  onToken: (t: string) => void,
  onDone: () => void,
  onError: (e: string) => void,
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) { onError('抱歉，服务暂时不可用'); return; }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        const t = line.trim();
        if (!t || t === 'data: [DONE]') { if (t === 'data: [DONE]') { onDone(); return; } continue; }
        if (!t.startsWith('data: ')) continue;
        try {
          const chunk = JSON.parse(t.slice(6));
          const delta = chunk?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) onToken(delta);
        } catch { /* skip */ }
      }
    }
    onDone();
  } catch (e: unknown) {
    onError('无法连接到对话服务：' + (e instanceof Error ? e.message : String(e)));
  }
}

// ─── Build Dialog ───────────────────────────────────
function BuildDialog({
  mode,
  onClose,
  onCreated,
}: {
  mode: 'agent' | 'skill';
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const [messages, setMessages] = useState<BuildMessage[]>([]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);

  const systemPrompt = mode === 'agent' ? AGENT_SYSTEM_PROMPT : SKILL_SYSTEM_PROMPT;
  const greetText = mode === 'agent'
    ? '你好！我来帮你创建一个专属 Agent ✨\n\n你希望这个 Agent 主要帮你做什么？（例如：整理会议纪要、追踪竞品动态……）'
    : '你好！我来帮你构建一个新的 Skill 🔧\n\n请描述这个 Skill 的使用场景，比如：每次提到竞品名字就自动搜索最新新闻……';

  useEffect(() => {
    if (initialSent.current) return;
    initialSent.current = true;
    // Show greeting as bot message directly (no API call for greeting)
    setMessages([{ id: `b-${Date.now()}`, sender: 'bot', text: greetText }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isWaiting]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSend = useCallback((text: string, history: BuildMessage[]) => {
    const userMsg: BuildMessage = { id: `u-${Date.now()}`, sender: 'user', text };
    const updated = [...history, userMsg];
    setMessages(updated);
    setIsWaiting(true);

    const botId = `b-${Date.now() + 1}`;
    let started = false;

    const apiMsgs = [
      { role: 'system', content: systemPrompt },
      ...updated.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
    ];

    streamBuild(
      apiMsgs,
      (token) => {
        if (!started) {
          started = true;
          setIsWaiting(false);
          setMessages((prev) => [...prev, { id: botId, sender: 'bot', text: token, streaming: true }]);
        } else {
          setMessages((prev) => prev.map((m) => m.id === botId ? { ...m, text: m.text + token } : m));
        }
      },
      () => {
        setIsWaiting(false);
        setMessages((prev) => prev.map((m) => m.id === botId ? { ...m, streaming: false } : m));
      },
      (err) => {
        setIsWaiting(false);
        setMessages((prev) => [...prev, { id: botId, sender: 'bot', text: err }]);
      },
    );
  }, [systemPrompt]);

  const handleSend = () => {
    if (!input.trim() || isWaiting) return;
    const text = input.trim();
    setInput('');
    doSend(text, messages);
  };

  const handleClose = () => {
    if (messages.length > 1 && !confirmClose) { setConfirmClose(true); return; }
    onClose();
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={handleClose}>
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" />
      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-[640px] h-[580px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-5 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="Tbox" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#1a1a1a]">
              Tbox · {mode === 'agent' ? '创建 Agent' : '构建 Skill'}
            </div>
            <div className="text-[11px] text-[#a0a0a8] mt-0.5">对话式引导，轻松完成配置</div>
          </div>
          <button onClick={handleClose} className="ml-auto w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] transition-colors cursor-pointer flex-shrink-0">
            <X className="w-4 h-4 text-[#8e8e93]" />
          </button>
        </div>

        {/* Confirm close banner */}
        {confirmClose && (
          <div className="flex items-center gap-3 px-5 py-3 bg-[#fff7ed] border-b border-[#fed7aa] flex-shrink-0">
            <span className="text-[13px] text-[#92400e] flex-1">草稿将丢失，确认退出？</span>
            <button onClick={onClose} className="text-[12px] font-semibold text-[#dc2626] hover:underline cursor-pointer">确认退出</button>
            <button onClick={() => setConfirmClose(false)} className="text-[12px] text-[#8e8e93] hover:underline cursor-pointer">继续构建</button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.map((m) => m.sender === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="bg-[#f0f0f0] text-[#1d1d1f] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-[14px] leading-relaxed whitespace-pre-wrap">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot.png" alt="Tbox" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div className="text-[14px] leading-[1.8] text-[#1d1d1f] max-w-[85%] whitespace-pre-wrap">
                {m.text}
                {m.streaming && <span className="inline-block w-[2px] h-[1em] bg-gray-400 ml-0.5 align-middle animate-pulse" />}
              </div>
            </div>
          ))}
          {isWaiting && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot.png" alt="Tbox" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1 px-1 py-2.5">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-[#f0f0f0] px-4 py-3">
          <div className="bg-[#f3f4f6] rounded-2xl px-4 py-2.5 flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
              placeholder="输入你的想法…"
              className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] outline-none resize-none placeholder:text-[#a0a0a8] leading-normal max-h-[120px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isWaiting}
              className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-colors cursor-pointer flex-shrink-0 mb-0.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 rotate-90"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </button>
          </div>
          <p className="text-[11px] text-[#b0b0b8] text-center mt-2">
            完成对话后，在对话中告诉 Tbox「创建完成」即可保存
          </p>
        </div>

        {/* Quick-create bar (mock) */}
        <div className="flex-shrink-0 border-t border-[#f5f5f7] px-5 py-3 flex items-center justify-between bg-[#fafafa]">
          <span className="text-[12px] text-[#a0a0a8]">或者快速创建一个默认配置的{mode === 'agent' ? ' Agent' : ' Skill'}</span>
          <button
            onClick={() => {
              const name = mode === 'agent' ? '新 Agent' : '新 Skill';
              onCreated(name);
            }}
            className="text-[12px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
          >
            快速创建 →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category icon map (mirrors MarketView) ──────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  web: Globe, data: BarChart2, creative: PenLine, file: FileText,
  integration: Link2, memory: Brain, code: Code2, other: Box,
};

// ─── Market Agent Avatar (mirrors MarketView's AgentAvatar exactly) ──────────
function MarketAgentAvatar({ agent, size = 52 }: { agent: MarketAgent; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden ring-2 ring-white shadow-md flex-shrink-0 bg-[#f5f5f7] flex items-center justify-center"
    >
      {agent.avatarUrl && !err ? (
        <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>{agent.avatar}</span>
      )}
    </div>
  );
}

// ─── Purchased Agent Card ─────────────────────────────────────
// 100% identical to MarketView's AgentCard, with management controls instead of hire button
function PurchasedAgentCard({
  agent,
  marketAgent,
  highlight,
  onToggle,
  onDelete,
}: {
  agent: MyAgent;
  marketAgent: MarketAgent;
  highlight: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`group bg-white rounded-2xl border border-[#ebebeb] p-5 flex flex-col transition-all duration-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 relative overflow-hidden ${
        highlight ? 'ring-2 ring-[#2563eb]' : ''
      }`}
      style={{ minHeight: 210 }}
    >
      {/* Top row: real avatar + name/role/badges + management controls */}
      <div className="flex items-center gap-3 mb-3">
        <MarketAgentAvatar agent={marketAgent} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-tight truncate">{marketAgent.name}</h3>
            {marketAgent.isFeatured && (
              <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1d1d1f] text-white">精选</span>
            )}
            {marketAgent.isNew && !marketAgent.isFeatured && (
              <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73] border border-[#e5e5ea]">新上架</span>
            )}
          </div>
          <p className="text-[12px] text-[#9a9a9a] mt-0.5">{ROLE_LABELS[marketAgent.role]}</p>
        </div>
        {/* 退订 button + more menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="px-3 py-1 text-[11.5px] font-semibold rounded-lg border border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2] transition-colors cursor-pointer"
          >
            退订
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] cursor-pointer transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-[#8e8e93]" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-[#f0f0f0] py-1 z-20"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description tinted box — exact Market style */}
      <div className="w-full rounded-xl px-3 py-2.5 mb-3 flex-1 border-l-[3px] border-[#f4845f] bg-[#fff5f2]">
        <p className="text-[12px] text-[#6a4a40] line-clamp-2 leading-relaxed">{marketAgent.description}</p>
      </div>

      {/* Stats + 查看简历 row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[11.5px] text-[#9a9a9a]">
            <Clock className="w-3 h-3" />
            <span>已雇佣 {agent.hireDuration ?? '—'}</span>
          </span>
          <span className="text-[#d9d9d9]">·</span>
          <span className="flex items-center gap-1 text-[11.5px] text-[#9a9a9a]">
            <FolderOpen className="w-3 h-3" />
            <span>参与 {agent.projectCount ?? 0} 个项目</span>
          </span>
          <span className="text-[#d9d9d9]">·</span>
          <span className="text-[11.5px] font-semibold text-[#1d1d1f]">{getLowestPrice(marketAgent.pricing)}</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#1a1a1a] group-hover:gap-1.5 transition-all">
          查看简历
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Inline delete confirm overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
          <Trash2 className="w-8 h-8 text-[#dc2626] opacity-80" />
          <p className="text-[13px] font-semibold text-[#1a1a1a]">确认退订「{marketAgent.name}」？</p>
          <p className="text-[11px] text-[#8e8e93]">退订后将从我的 Agent 中移除</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-1.5 rounded-xl text-[12px] bg-[#f5f5f7] text-[#333] hover:bg-[#eee] cursor-pointer">取消</button>
            <button onClick={() => onDelete(agent.id)} className="px-4 py-1.5 rounded-xl text-[12px] bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer">退订</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Listing Status Badge ───────────────────────────────────────────────────
function RejectedBadge({ rejectedReason }: { rejectedReason?: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-[#fef2f2] text-[#dc2626] cursor-help select-none">
        <XCircle className="w-3 h-3" /> 未通过
      </span>
      {rejectedReason && show && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#1a1a1a] text-white text-[11px] rounded-xl px-3 py-2 leading-relaxed z-30 pointer-events-none">
          {rejectedReason}
        </div>
      )}
    </div>
  );
}

function ListingStatusBadge({ status, rejectedReason, subscriberCount }: { status: ListingStatus; rejectedReason?: string; subscriberCount?: number }) {
  if (status === 'pending') return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-[#fffbeb] text-[#d97706]">
      <Clock className="w-3 h-3" /> 审核中
    </span>
  );
  if (status === 'listed') return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-[#f0fdf4] text-[#16a34a]">
      <CheckCircle2 className="w-3 h-3" /> 已上架
      {subscriberCount !== undefined && (
        <span className="ml-1 text-[#16a34a] opacity-70 font-normal">{subscriberCount.toLocaleString()} 订阅</span>
      )}
    </span>
  );
  if (status === 'rejected') return (
    <RejectedBadge rejectedReason={rejectedReason} />
  );
  return null;
}

// ─── Listing Dialog ──────────────────────────────────────────────────────────
function ListingDialog({
  assetName,
  defaultDescription,
  defaultTags,
  defaultPricing,
  onClose,
  onSubmit,
}: {
  assetName: string;
  defaultDescription: string;
  defaultTags: string[];
  defaultPricing: ListingPricing;
  onClose: () => void;
  onSubmit: (info: { coverDescription: string; tags: string[]; pricing: ListingPricing }) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [coverDescription, setCoverDescription] = useState(defaultDescription);
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [tagInput, setTagInput] = useState('');
  const [pricingType, setPricingType] = useState<ListingPricing['type']>(defaultPricing.type);
  const [price, setPrice] = useState(defaultPricing.price ?? 29);
  const [period, setPeriod] = useState<'month' | 'year'>(defaultPricing.period ?? 'month');

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t || tags.length >= 3 || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  };

  const buildPricing = (): ListingPricing => {
    if (pricingType === 'free') return { type: 'free', currency: 'CNY' };
    if (pricingType === 'subscription') return { type: 'subscription', price, currency: 'CNY', period };
    return { type: 'pay_per_use', price, currency: 'CNY' };
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">上架集市</h2>
            <p className="text-[12px] text-[#8e8e93] mt-0.5">「{assetName}」· 步骤 {step} / 2</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] cursor-pointer transition-colors">
            <X className="w-4 h-4 text-[#8e8e93]" />
          </button>
        </div>
        {/* Step bar */}
        <div className="flex gap-2 mb-5">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#1d1d1f]' : 'bg-[#e5e5ea]'}`} />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#555] mb-1.5">
                封面简介 <span className="text-[#dc2626]">*</span>
              </label>
              <textarea
                value={coverDescription}
                onChange={(e) => setCoverDescription(e.target.value.slice(0, 80))}
                placeholder="面向集市买家的吸引力描述，让别人快速了解你的作品能做什么……"
                className="w-full h-[88px] px-3 py-2.5 rounded-xl text-[13px] border border-[#e5e5ea] outline-none focus:border-[#a0a0a8] resize-none leading-relaxed placeholder:text-[#c0c0c8]"
              />
              <p className="text-[11px] text-[#b0b0b8] text-right mt-0.5">{coverDescription.length}/80</p>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#555] mb-1.5">
                适用场景标签 <span className="text-[#b0b0b8]">最多 3 个</span>
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[28px] mb-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#f0f0f5] text-[#333]">
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))} className="cursor-pointer text-[#8e8e93] hover:text-[#dc2626] leading-none">&times;</button>
                  </span>
                ))}
              </div>
              {tags.length < 3 && (
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="输入标签后按 Enter 或点击添加"
                    className="flex-1 px-3 py-2 rounded-xl text-[12px] border border-[#e5e5ea] outline-none focus:border-[#a0a0a8] placeholder:text-[#c0c0c8]"
                  />
                  <button onClick={handleAddTag} className="px-3 py-2 rounded-xl text-[12px] bg-[#f5f5f7] text-[#555] hover:bg-[#ebebeb] cursor-pointer">
                    添加
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => { if (coverDescription.trim()) setStep(2); }}
              disabled={!coverDescription.trim()}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#1d1d1f] text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer mt-2"
            >
              下一步：设置定价 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#555] mb-2">定价方式 <span className="text-[#dc2626]">*</span></label>
              <div className="space-y-2">
                {([
                  ['free', '免费', '所有用户可直接使用，无需付费'],
                  ['subscription', '订阅制', '月付或年付，持续订阅使用'],
                  ['pay_per_use', '按次付费', '每次调用单独计费'],
                ] as const).map(([type, label, desc]) => (
                  <label key={type} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${pricingType === type ? 'border-[#1d1d1f] bg-[#fafafa]' : 'border-[#e5e5ea] hover:border-[#c0c0c8]'}`}>
                    <input type="radio" name="pricing" value={type} checked={pricingType === type} onChange={() => setPricingType(type)} className="mt-0.5 accent-[#1d1d1f]" />
                    <div>
                      <div className="text-[13px] font-semibold text-[#1a1a1a]">{label}</div>
                      <div className="text-[11px] text-[#8e8e93] mt-0.5">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {pricingType !== 'free' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[12px] font-semibold text-[#555] mb-1.5">价格（元）</label>
                  <input
                    type="number" min={1} value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-[13px] border border-[#e5e5ea] outline-none focus:border-[#a0a0a8]"
                  />
                </div>
                {pricingType === 'subscription' && (
                  <div>
                    <label className="block text-[12px] font-semibold text-[#555] mb-1.5">周期</label>
                    <select value={period} onChange={(e) => setPeriod(e.target.value as 'month' | 'year')} className="px-3 py-2 rounded-xl text-[13px] border border-[#e5e5ea] outline-none focus:border-[#a0a0a8] bg-white cursor-pointer">
                      <option value="month">月付</option>
                      <option value="year">年付</option>
                    </select>
                  </div>
                )}
              </div>
            )}
            <p className="text-[11px] text-[#8e8e93] bg-[#f9f9f9] rounded-xl px-3 py-2 leading-relaxed">
              💡 平台收取交易额 15% 作为渠道费。定价为参考意向，最终需经平台确认。
            </p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-[#f5f5f7] text-[#333] hover:bg-[#ebebeb] cursor-pointer transition-colors">
                ← 上一步
              </button>
              <button
                onClick={() => onSubmit({ coverDescription, tags, pricing: buildPricing() })}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-[#f4845f] text-white hover:bg-[#e8714d] transition-colors cursor-pointer"
              >
                提交审核
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Agent Card ──────────────────────────────────────────────
// Layout mirrors the Market 人才广场 AgentCard exactly
function AgentCard({
  agent,
  mySkills,
  highlight,
  onToggle,
  onDelete,
  onListingAction,
}: {
  agent: MyAgent;
  mySkills: MySkill[];
  highlight: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onListingAction: (action: 'open' | 'withdraw' | 'unlist' | 'resubmit') => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);
  const mounted = mySkills.filter((s) => agent.mountedSkillIds.includes(s.id));

  return (
    <div
      className={`group bg-white rounded-2xl border border-[#ebebeb] p-5 flex flex-col transition-all duration-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 relative overflow-hidden ${
        !agent.isEnabled ? 'opacity-50' : ''
      } ${highlight ? 'ring-2 ring-[#2563eb]' : ''}`}
      style={{ minHeight: 210 }}
    >
      {/* Top row: avatar + name/role + source badge — matches Market AgentCard */}
      <div className="flex items-center gap-3 mb-3">
        {/* Circular avatar: same ring+shadow treatment as Market AgentAvatar */}
        <div
          className="rounded-full overflow-hidden ring-2 ring-white shadow-md flex-shrink-0 bg-[#f5f5f7] flex items-center justify-center"
          style={{ width: 52, height: 52 }}
        >
          {agent.avatarUrl && !avatarErr ? (
            <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" onError={() => setAvatarErr(true)} />
          ) : (
            <span style={{ fontSize: 24, lineHeight: 1 }}>{agent.avatar}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-tight truncate">{agent.name}</h3>
            {/* Source badge inline with name — mirrors Market's 精选 badge position */}
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              agent.source === 'built' ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#fff7ed] text-[#ea580c]'
            }`}>
              {agent.source === 'built' ? '自建' : '集市'}
            </span>
          </div>
          <p className="text-[12px] text-[#9a9a9a] mt-0.5">{ROLE_LABELS_ZH[agent.role]}</p>
        </div>
      </div>

      {/* Description tinted box — exact match to Market: border-l-[3px] + bg-[#fff5f2], flex-1 for equal-height cards */}
      <div className="w-full rounded-xl px-3 py-2.5 mb-3 flex-1 border-l-[3px] border-[#f4845f] bg-[#fff5f2]" style={{ minHeight: 52 }}>
        <p className="text-[12px] text-[#6a4a40] line-clamp-2 leading-relaxed">{agent.slogan}</p>
      </div>

      {/* Skills chips row */}
      {mounted.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {mounted.slice(0, 3).map((s) => (
            <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73]">
              {s.name}
            </span>
          ))}
          {mounted.length > 3 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#8e8e93]">+{mounted.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[11.5px] text-[#9a9a9a]">
            <Zap className="w-3 h-3" />
            <span>{mounted.length} 个技能</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Listing status badge or button (built agents only) */}
          {(() => {
            const ls = agent.listing?.status;
            if (!ls || ls === 'unlisted') return (
              <button
                onClick={(e) => { e.stopPropagation(); onListingAction('open'); }}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-[#d0d0d8] text-[#6a6e73] hover:border-[#a0a0a8] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                <Store className="w-3 h-3" /> 上架集市
              </button>
            );
            return <ListingStatusBadge status={ls} rejectedReason={agent.listing?.rejectedReason} subscriberCount={agent.listing?.subscriberCount} />;
          })()}
          {/* More menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] cursor-pointer transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-[#8e8e93]" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-xl border border-[#f0f0f0] py-1 z-20"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> 编辑
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer">
                  <Copy className="w-3.5 h-3.5" /> 复制
                </button>
                {agent.listing?.status === 'pending' && (
                  <button
                    onClick={() => { setMenuOpen(false); onListingAction('withdraw'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#d97706] hover:bg-[#fffbeb] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> 撤回申请
                  </button>
                )}
                {agent.listing?.status === 'listed' && (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> 查看集市
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onListingAction('unlist'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" /> 下架
                    </button>
                  </>
                )}
                {agent.listing?.status === 'rejected' && (
                  <button
                    onClick={() => { setMenuOpen(false); onListingAction('resubmit'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#f4845f] hover:bg-[#fff5f2] cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" /> 重新提交
                  </button>
                )}
                <div className="h-px bg-[#f0f0f0] my-1" />
                <button
                  onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline delete confirm overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
          <Trash2 className="w-8 h-8 text-[#dc2626] opacity-80" />
          <p className="text-[13px] font-semibold text-[#1a1a1a]">确认删除「{agent.name}」？</p>
          <p className="text-[11px] text-[#8e8e93]">
            {agent.listing?.status === 'listed' ? '该 Agent 已上架，删除后将自动下架。' : '此操作不可恢复'}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-1.5 rounded-xl text-[12px] bg-[#f5f5f7] text-[#333] hover:bg-[#eee] cursor-pointer">取消</button>
            <button onClick={() => onDelete(agent.id)} className="px-4 py-1.5 rounded-xl text-[12px] bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer">删除</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skill Card ──────────────────────────────────────────────
// Layout mirrors the Market 装备铺 SkillCard exactly
function SkillCard({
  skill,
  agentCount,
  highlight,
  onToggle,
  onDelete,
  onListingAction,
}: {
  skill: MySkill;
  agentCount: number;
  highlight: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onListingAction: (action: 'open' | 'withdraw' | 'unlist' | 'resubmit') => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const badge = CATEGORY_BADGE[skill.category];
  const Icon = CATEGORY_ICONS[skill.category] ?? Box;

  return (
    <div
      className={`bg-white rounded-2xl border border-[#ebebeb] p-5 transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 relative overflow-hidden group ${
        !skill.isEnabled ? 'opacity-50' : ''
      } ${highlight ? 'ring-2 ring-[#2563eb]' : ''}`}
    >
      {/* Top row: icon + name/category + source badge — mirrors Market top row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: badge.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: badge.text }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[14px] text-[#1d1d1f] truncate">{skill.name}</div>
          <div className="text-[11px] text-[#8e8e93] mt-0.5">{CATEGORY_LABELS_ZH[skill.category]}</div>
        </div>
        {/* Source badge — replacing the mount button slot */}
        <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-xl ${
          skill.source === 'built' ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#fff7ed] text-[#ea580c]'
        }`}>
          {skill.source === 'built' ? '自建' : '集市'}
        </span>
      </div>

      {/* Description — same as Market shortDesc */}
      <p className="text-[12.5px] text-[#6a6e73] mb-4 line-clamp-2 leading-relaxed">{skill.description}</p>

      {/* Footer — mirrors Market skill footer with border-t */}
      <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
            <Users className="w-3 h-3" /> {agentCount} 个 Agent
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Purchased: 退订 button; Built: listing status/button */}
          {skill.source === 'purchased' ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="px-3 py-1 text-[11.5px] font-semibold rounded-lg border border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2] transition-colors cursor-pointer"
            >
              退订
            </button>
          ) : (
            (() => {
              const ls = skill.listing?.status;
              if (!ls || ls === 'unlisted') return (
                <button
                  onClick={(e) => { e.stopPropagation(); onListingAction('open'); }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-[#d0d0d8] text-[#6a6e73] hover:border-[#a0a0a8] hover:text-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <Store className="w-3 h-3" /> 上架集市
                </button>
              );
              return <ListingStatusBadge status={ls} rejectedReason={skill.listing?.rejectedReason} subscriberCount={skill.listing?.subscriberCount} />;
            })()
          )}
          {/* More menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] cursor-pointer transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-[#8e8e93]" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-xl border border-[#f0f0f0] py-1 z-20"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> 编辑
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer">
                  <Play className="w-3.5 h-3.5" /> 测试运行
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer">
                  <Copy className="w-3.5 h-3.5" /> 复制
                </button>
                {skill.source === 'built' && skill.listing?.status === 'pending' && (
                  <button
                    onClick={() => { setMenuOpen(false); onListingAction('withdraw'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#d97706] hover:bg-[#fffbeb] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> 撤回申请
                  </button>
                )}
                {skill.source === 'built' && skill.listing?.status === 'listed' && (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> 查看集市
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onListingAction('unlist'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" /> 下架
                    </button>
                  </>
                )}
                {skill.source === 'built' && skill.listing?.status === 'rejected' && (
                  <button
                    onClick={() => { setMenuOpen(false); onListingAction('resubmit'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#f4845f] hover:bg-[#fff5f2] cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" /> 重新提交
                  </button>
                )}
                <div className="h-px bg-[#f0f0f0] my-1" />
                <button
                  onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
          <Trash2 className="w-8 h-8 text-[#dc2626] opacity-80" />
          <p className="text-[13px] font-semibold text-[#1a1a1a]">确认删除「{skill.name}」？</p>
          <p className="text-[11px] text-[#8e8e93]">此操作不可恢复</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-1.5 rounded-xl text-[12px] bg-[#f5f5f7] text-[#333] hover:bg-[#eee] cursor-pointer">取消</button>
            <button onClick={() => onDelete(skill.id)} className="px-4 py-1.5 rounded-xl text-[12px] bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer">删除</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────
function EmptyState({ type, source, onAction }: { type: MainTab; source: SubTab; onAction: () => void }) {
  const isBuilt = source === 'built';
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
        {type === 'agents' ? (
          <Bot className="w-8 h-8 text-[#d1d5db]" />
        ) : (
          <Zap className="w-8 h-8 text-[#d1d5db]" />
        )}
      </div>
      <p className="text-[14px] font-semibold text-[#8e8e93]">
        {isBuilt
          ? `还没有构建过${type === 'agents' ? ' Agent' : ' Skill'}`
          : `还没有从集市购买过${type === 'agents' ? ' Agent' : ' Skill'}`}
      </p>
      <button
        onClick={onAction}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors cursor-pointer"
      >
        {isBuilt ? (
          <><Plus className="w-4 h-4" />立即创建</>
        ) : (
          <><ShoppingBag className="w-4 h-4" />去集市逛逛</>
        )}
      </button>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────
export default function MyToolsView({ onNavigateTo }: { onNavigateTo?: (view: 'market', tab?: 'agents' | 'skills') => void }) {
  const [mainTab, setMainTab] = useState<MainTab>('agents');
  const [subTab, setSubTab] = useState<SubTab>('built');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<SkillCategory | 'all'>('all');
  const [buildMode, setBuildMode] = useState<'agent' | 'skill' | null>(null);
  const [agents, setAgents] = useState<MyAgent[]>(initialAgents);
  const [skills, setSkills] = useState<MySkill[]>(initialSkills);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [listingTarget, setListingTarget] = useState<{ type: 'agent' | 'skill'; id: string } | null>(null);

  // Highlight animation: clear after 1.5s
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 1500);
    return () => clearTimeout(t);
  }, [highlightId]);

  const handleToggleAgent = (id: string) => setAgents((prev) => prev.map((a) => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
  const handleDeleteAgent = (id: string) => setAgents((prev) => prev.filter((a) => a.id !== id));
  const handleToggleSkill = (id: string) => setSkills((prev) => prev.map((s) => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
  const handleDeleteSkill = (id: string) => setSkills((prev) => prev.filter((s) => s.id !== id));

  const handleListingSubmit = (info: { coverDescription: string; tags: string[]; pricing: ListingPricing }) => {
    const now = new Date().toISOString().slice(0, 10);
    if (!listingTarget) return;
    if (listingTarget.type === 'agent') {
      setAgents((prev) => prev.map((a) => a.id === listingTarget.id ? {
        ...a,
        listing: { status: 'pending', submittedAt: now, pricing: info.pricing, tags: info.tags, coverDescription: info.coverDescription },
      } : a));
      const targetId = listingTarget.id;
      setTimeout(() => {
        setAgents((prev) => prev.map((a) => {
          if (a.id !== targetId) return a;
          const pass = a.mountedSkillIds.length >= 1;
          return {
            ...a,
            listing: {
              ...a.listing!,
              status: pass ? 'listed' : 'rejected',
              listedAt: pass ? now : undefined,
              rejectedReason: pass ? undefined : '该 Agent 未挂载任何 Skill，请至少配置一个能力后再上架。',
            },
          };
        }));
      }, 4000);
    } else {
      setSkills((prev) => prev.map((s) => s.id === listingTarget.id ? {
        ...s,
        listing: { status: 'pending', submittedAt: now, pricing: info.pricing, tags: info.tags, coverDescription: info.coverDescription },
      } : s));
      const targetId = listingTarget.id;
      setTimeout(() => {
        setSkills((prev) => prev.map((s) => s.id === targetId ? { ...s, listing: { ...s.listing!, status: 'listed', listedAt: now, subscriberCount: 0 } } : s));
      }, 3000);
    }
    setListingTarget(null);
  };

  const handleAgentListingAction = (id: string, action: 'open' | 'withdraw' | 'unlist' | 'resubmit') => {
    if (action === 'open' || action === 'resubmit') { setListingTarget({ type: 'agent', id }); return; }
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, listing: a.listing ? { ...a.listing, status: 'unlisted' } : undefined } : a));
  };

  const handleSkillListingAction = (id: string, action: 'open' | 'withdraw' | 'unlist' | 'resubmit') => {
    if (action === 'open' || action === 'resubmit') { setListingTarget({ type: 'skill', id }); return; }
    setSkills((prev) => prev.map((s) => s.id === id ? { ...s, listing: s.listing ? { ...s.listing, status: 'unlisted' } : undefined } : s));
  };

  const handleCreated = (name: string) => {
    const now = new Date().toISOString().slice(0, 10);
    if (buildMode === 'agent') {
      const newAgent: MyAgent = {
        id: `ma-new-${Date.now()}`,
        name,
        avatar: '🤖',
        role: 'assistant',
        slogan: '由 Tbox 对话创建',
        mountedSkillIds: [],
        source: 'built',
        isEnabled: true,
        createdAt: now,
      };
      setAgents((prev) => [newAgent, ...prev]);
      setMainTab('agents');
      setSubTab('built');
      setHighlightId(newAgent.id);
    } else {
      const newSkill: MySkill = {
        id: `ms-new-${Date.now()}`,
        name,
        icon: '⚡',
        category: 'other',
        description: '由 Tbox 对话构建',
        source: 'built',
        isEnabled: true,
        usedByAgentIds: [],
        createdAt: now,
      };
      setSkills((prev) => [newSkill, ...prev]);
      setMainTab('skills');
      setSubTab('built');
      setHighlightId(newSkill.id);
    }
    setBuildMode(null);
  };

  // Filtered agents
  const filteredAgents = agents.filter((a) => {
    const matchSub = a.source === (subTab === 'built' ? 'built' : 'purchased');
    const matchSearch = !search || a.name.includes(search) || a.slogan.includes(search);
    return matchSub && matchSearch;
  });

  // Filtered skills
  const filteredSkills = skills.filter((s) => {
    const matchSub = s.source === (subTab === 'built' ? 'built' : 'purchased');
    const matchSearch = !search || s.name.includes(search) || s.description.includes(search);
    const matchCat = catFilter === 'all' || s.category === catFilter;
    return matchSub && matchSearch && matchCat;
  });

  const allSkillCats = Array.from(new Set(skills.map((s) => s.category))) as SkillCategory[];

  return (
    <div className="w-full min-h-full pb-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1a1a]">我的技能</h1>
          <p className="text-[13px] text-[#8e8e93] mt-0.5">管理你的 Agent 与 Skill 资产</p>
        </div>
        <button
          onClick={() => setBuildMode(mainTab === 'agents' ? 'agent' : 'skill')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新增{mainTab === 'agents' ? ' Agent' : ' Skill'}
        </button>
      </div>

      {/* Main Tab */}
      <div className="flex items-center gap-1 p-1 bg-[rgba(255,255,255,0.7)] backdrop-blur-sm rounded-2xl w-fit mb-5 shadow-sm">
        {([['agents', Bot, 'Agent'], ['skills', Zap, 'Skill']] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => { setMainTab(key); setSearch(''); setCatFilter('all'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              mainTab === key ? 'bg-[#1d1d1f] text-white shadow' : 'text-[#6e6e73] hover:text-[#1a1a1a] hover:bg-white/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            我的 {label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ml-0.5 ${
              mainTab === key ? 'bg-white/20 text-white' : 'bg-[#f0f0f2] text-[#8e8e93]'
            }`}>
              {key === 'agents' ? agents.length : skills.length}
            </span>
          </button>
        ))}
      </div>

      {/* Sub Tab + Search row */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        {/* Sub tabs */}
        <div className="flex items-center gap-0 border-b border-[rgba(0,0,0,0.08)]">
          {([['built', Wrench, '我构建的'], ['purchased', ShoppingBag, '集市采购的']] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                subTab === key
                  ? 'border-[#1d1d1f] text-[#1a1a1a]'
                  : 'border-transparent text-[#8e8e93] hover:text-[#1a1a1a]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="relative flex-1 max-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b0b0b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`搜索${mainTab === 'agents' ? ' Agent' : ' Skill'}…`}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white text-[13px] text-[#1d1d1f] outline-none border border-[rgba(0,0,0,0.07)] placeholder:text-[#b0b0b8] focus:border-[#a0a0a8] transition-colors"
            />
          </div>
          {/* Category filter (skills only) */}
          {mainTab === 'skills' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setCatFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${catFilter === 'all' ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#555] border border-[rgba(0,0,0,0.07)] hover:border-[#a0a0a8]'}`}
              >
                全部
              </button>
              {allSkillCats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${catFilter === cat ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#555] border border-[rgba(0,0,0,0.07)] hover:border-[#a0a0a8]'}`}
                >
                  {CATEGORY_LABELS_ZH[cat]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cards grid */}
      {mainTab === 'agents' ? (
        filteredAgents.length === 0 ? (
          <EmptyState
            type="agents"
            source={subTab}
            onAction={() => subTab === 'built' ? setBuildMode('agent') : onNavigateTo?.('market', 'agents')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              if (agent.source === 'purchased' && agent.marketId) {
                const marketAgent = mockAgents.find((a) => a.id === agent.marketId);
                if (marketAgent) {
                  return (
                    <PurchasedAgentCard
                      key={agent.id}
                      agent={agent}
                      marketAgent={marketAgent}
                      highlight={highlightId === agent.id}
                      onToggle={handleToggleAgent}
                      onDelete={handleDeleteAgent}
                    />
                  );
                }
              }
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  mySkills={skills}
                  highlight={highlightId === agent.id}
                  onToggle={handleToggleAgent}
                  onDelete={handleDeleteAgent}
                  onListingAction={(action) => handleAgentListingAction(agent.id, action)}
                />
              );
            })}
          </div>
        )
      ) : (
        filteredSkills.length === 0 ? (
          <EmptyState
            type="skills"
            source={subTab}
            onAction={() => subTab === 'built' ? setBuildMode('skill') : onNavigateTo?.('market', 'skills')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                agentCount={skill.usedByAgentIds.length}
                highlight={highlightId === skill.id}
                onToggle={handleToggleSkill}
                onDelete={handleDeleteSkill}
                onListingAction={(action) => handleSkillListingAction(skill.id, action)}
              />
            ))}
          </div>
        )
      )}

      {/* Listing dialog */}
      {listingTarget && (() => {
        const asset = listingTarget.type === 'agent'
          ? agents.find((a) => a.id === listingTarget.id)
          : skills.find((s) => s.id === listingTarget.id);
        if (!asset) return null;
        const defaultDesc = listingTarget.type === 'agent'
          ? (asset as MyAgent).slogan
          : (asset as MySkill).description;
        return (
          <ListingDialog
            assetName={asset.name}
            defaultDescription={asset.listing?.coverDescription || defaultDesc}
            defaultTags={asset.listing?.tags ?? []}
            defaultPricing={asset.listing?.pricing ?? { type: 'free', currency: 'CNY' }}
            onClose={() => setListingTarget(null)}
            onSubmit={handleListingSubmit}
          />
        );
      })()}

      {/* Build dialog */}
      {buildMode && (
        <BuildDialog
          mode={buildMode}
          onClose={() => setBuildMode(null)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
