'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, Clock, Users, Tag, ChevronRight, X, Send, Bot,
  Briefcase, Code2, PenLine, BarChart2, Zap, MessageSquare,
  FlaskConical, LayoutGrid, TrendingUp, CheckCircle2, Circle,
  CalendarDays, DollarSign, Sparkles, ArrowLeft, Loader2,
} from 'lucide-react';
import {
  mockTasks, TASK_CATEGORY_LABELS, TASK_CATEGORY_COLORS,
  TASK_STATUS_LABELS, TASK_STATUS_COLORS,
  formatBudget, formatRelativeTime, deadlineDaysLeft,
  type TaskPost, type TaskCategory, type TaskStatus, type NegotiationMessage,
} from '@/lib/taskMock';

// ─── Category Icons ────────────────────────────────────────────
const CATEGORY_ICONS: Record<TaskCategory, React.ElementType> = {
  research: FlaskConical,
  content: PenLine,
  code: Code2,
  design: Sparkles,
  data: BarChart2,
  automation: Zap,
  consultation: MessageSquare,
  other: Briefcase,
};

// ─── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: TaskStatus }) {
  const c = TASK_STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Avatar Fallback ───────────────────────────────────────────
function PublisherAvatar({ avatar, avatarUrl, size = 36 }: { avatar: string; avatarUrl?: string; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="rounded-full overflow-hidden ring-2 ring-white bg-[#f5f5f7] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {avatarUrl && !err ? (
        <img src={avatarUrl} alt="" style={{ width: size, height: size }} className="object-cover" onError={() => setErr(true)} />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>{avatar}</span>
      )}
    </div>
  );
}

// ─── Task Card ─────────────────────────────────────────────────
function TaskCard({ task, onClick }: { task: TaskPost; onClick: () => void }) {
  const accent = TASK_CATEGORY_COLORS[task.category];
  const daysLeft = deadlineDaysLeft(task.deadline);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#ebebeb] px-5 py-4 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 relative overflow-hidden"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: accent }} />

      {/* Header row: avatar + chips (left) | time · count · budget (right) */}
      <div className="flex items-center gap-3 pl-2">
        {/* Agent avatar */}
        <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden">
          {task.publisher.agentAvatarUrl ? (
            <img src={task.publisher.agentAvatarUrl} alt={task.publisher.agentName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[18px]" style={{ background: `${accent}18` }}>
              {task.publisher.agentAvatar}
            </div>
          )}
        </div>

        {/* Category + status chips */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${accent}18`, color: accent }}>
            {TASK_CATEGORY_LABELS[task.category]}
          </span>
          <StatusBadge status={task.status} />
        </div>

        {/* Right: meta info */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
            <span className="text-[11px] font-semibold text-[#dc2626]">
              {daysLeft === 0 ? '今日截止' : `${daysLeft}天截止`}
            </span>
          )}
          <span className="text-[11px] text-[#bbb]">{formatRelativeTime(task.created_at)}</span>
          <span className="text-[#e5e5e5]">·</span>
          <Users className="w-3 h-3 text-[#bbb]" />
          <span className="text-[11px] text-[#bbb]">{task.applicant_count} 人</span>
          <span className="text-[#e5e5e5]">·</span>
          <span className="text-[13px] font-bold text-[#1d1d1f]">{formatBudget(task.budget)}</span>
          <span className="flex items-center gap-0.5 text-[11.5px] font-semibold text-[#f4845f] opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            查看 <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-bold text-[#1a1a1a] leading-snug line-clamp-1 group-hover:text-[#333] mt-2 pl-2">
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-[12.5px] text-[#6b7280] line-clamp-1 leading-relaxed mt-1 pl-2">
        {task.description.replace(/[#*`\[\]]/g, '').slice(0, 160)}
      </p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 pl-2">
          {task.tags.slice(0, 5).map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6b7280]">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Negotiation Chat ──────────────────────────────────────────
function NegotiationChat({ task, onAccept }: { task: TaskPost; onAccept: () => void }) {
  const [messages, setMessages] = useState<NegotiationMessage[]>([
    {
      id: 'greeting',
      role: 'agent',
      content: task.agentGreeting ?? `你好！我是 ${task.publisher.name} 的助理 ${task.publisher.agentName}，有任何关于任务的问题欢迎问我！`,
      agentName: task.publisher.agentName,
      agentAvatar: task.publisher.agentAvatar,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: NegotiationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // placeholder for streaming reply
    const agentMsgId = (Date.now() + 1).toString();
    const agentMsg: NegotiationMessage = {
      id: agentMsgId,
      role: 'agent',
      content: '',
      agentName: task.publisher.agentName,
      agentAvatar: task.publisher.agentAvatar,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, agentMsg]);

    try {
      const apiMessages = messages
        .filter(m => m.id !== 'greeting')
        .concat(userMsg)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const resp = await fetch('/api/tasks/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          taskContext: {
            publisherName: task.publisher.name,
            agentName: task.publisher.agentName,
            title: task.title,
            description: task.description,
            category: TASK_CATEGORY_LABELS[task.category],
            requiredSkills: task.required_skills.map(s => s.name).join('、') || null,
            budget: formatBudget(task.budget),
            deadline: task.deadline
              ? new Date(task.deadline).toLocaleDateString('zh-CN')
              : null,
          },
        }),
      });

      if (!resp.ok || !resp.body) {
        setMessages(prev =>
          prev.map(m =>
            m.id === agentMsgId ? { ...m, content: '抱歉，智能体暂时无法回复，请稍后再试。' } : m
          )
        );
        setLoading(false);
        return;
      }

      // Stream reading
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const json = JSON.parse(raw);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              accumulated += delta;
              setMessages(prev =>
                prev.map(m => (m.id === agentMsgId ? { ...m, content: accumulated } : m))
              );
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === agentMsgId ? { ...m, content: '网络异常，请稍后重试。' } : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa] rounded-t-2xl">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          {task.publisher.agentAvatarUrl ? (
            <img src={task.publisher.agentAvatarUrl} alt={task.publisher.agentName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#f0f0f0] flex items-center justify-center text-[18px]">{task.publisher.agentAvatar}</div>
          )}
        </div>
        <div>
          <div className="text-[13px] font-bold text-[#1a1a1a]">{task.publisher.agentName}</div>
          <div className="text-[11px] text-[#9a9a9a]">代表 {task.publisher.name} · 自动应答</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[11px] text-[#22c55e] font-medium">在线</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'agent' && (
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                {task.publisher.agentAvatarUrl ? (
                  <img src={task.publisher.agentAvatarUrl} alt={task.publisher.agentName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f0f0f0] flex items-center justify-center text-[14px]">{task.publisher.agentAvatar}</div>
                )}
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#1a1a1a] text-white rounded-tr-sm'
                  : 'bg-[#f5f5f7] text-[#1a1a1a] rounded-tl-sm'
              }`}
            >
              {msg.content || (
                <span className="flex items-center gap-1.5 text-[#9a9a9a]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>正在思考…</span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[#f0f0f0]">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="向智能体提问，了解任务细节…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[#e0e0e0] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#aaa] transition-colors placeholder:text-[#c8c8c8]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-[#333] transition-colors mb-0.5"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* Accept button */}
        <button
          onClick={onAccept}
          className="w-full mt-2.5 py-2.5 rounded-xl bg-[#f4845f] text-white text-[13.5px] font-bold hover:bg-[#e8714d] transition-colors flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          立即接单
        </button>
      </div>
    </div>
  );
}

// ─── Accept Confirm Modal ──────────────────────────────────────
function AcceptModal({ task, onClose }: { task: TaskPost; onClose: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-[#22c55e]" />
            </div>
            <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-1">接单成功！</h3>
            <p className="text-[13px] text-[#9a9a9a] mb-4">已生成订单，可在「我的任务 → 进行中」查看</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#1a1a1a] text-white text-[14px] font-bold">
              好的
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-4">确认接单</h3>
            <div className="bg-[#fafafa] rounded-xl p-4 mb-4 space-y-2.5 border border-[#f0f0f0]">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#9a9a9a]">任务</span>
                <span className="font-semibold text-[#1a1a1a] text-right max-w-[220px] line-clamp-1">{task.title}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#9a9a9a]">发布方</span>
                <span className="font-semibold text-[#1a1a1a]">{task.publisher.name}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#9a9a9a]">报酬</span>
                <span className="font-bold text-[#f4845f]">{formatBudget(task.budget)}</span>
              </div>
              {task.deadline && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#9a9a9a]">截止</span>
                  <span className="font-semibold text-[#1a1a1a]">{new Date(task.deadline).toLocaleDateString('zh-CN')}</span>
                </div>
              )}
            </div>
            <p className="text-[12px] text-[#9a9a9a] mb-4">接单后，发布方将收到通知。请确保你有能力按时完成。</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] font-semibold text-[#555] hover:bg-[#f5f5f7] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setDone(true)}
                className="flex-1 py-2.5 rounded-xl bg-[#f4845f] text-white text-[13.5px] font-bold hover:bg-[#e8714d] transition-colors"
              >
                确认接单
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Task Detail Modal ─────────────────────────────────────────
function TaskDetail({ task, onClose }: { task: TaskPost; onClose: () => void }) {
  const [showAccept, setShowAccept] = useState(false);
  const CategoryIcon = CATEGORY_ICONS[task.category];
  const accent = TASK_CATEGORY_COLORS[task.category];
  const daysLeft = deadlineDaysLeft(task.deadline);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-stretch bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative ml-auto w-full max-w-[960px] bg-white h-full flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'slideInRight 0.25s ease' }}
        >
          {/* Header bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0f0f0]">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#555]" />
            </button>
            <span className="text-[14px] font-bold text-[#1a1a1a] flex-1 truncate">{task.title}</span>
            <StatusBadge status={task.status} />
            <button onClick={onClose} className="ml-2 w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-[#8e8e93]" />
            </button>
          </div>

          {/* Body: 2 columns */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: task info */}
            <div className="flex-1 overflow-y-auto px-6 py-5 border-r border-[#f0f0f0]">
              {/* Meta row */}
              <div className="flex flex-wrap gap-3 mb-5">
                {task.budget && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
                    <DollarSign className="w-3.5 h-3.5 text-[#f4845f]" />
                    <span className="text-[13px] font-bold text-[#1a1a1a]">{formatBudget(task.budget)}</span>
                  </div>
                )}
                {task.deadline && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
                    <CalendarDays className="w-3.5 h-3.5 text-[#5b8dee]" />
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">
                      {new Date(task.deadline).toLocaleDateString('zh-CN')}
                    </span>
                    {daysLeft !== null && (
                      <span className={`text-[11px] font-semibold ${daysLeft <= 7 ? 'text-[#dc2626]' : 'text-[#22c55e]'}`}>
                        ({daysLeft <= 0 ? '已截止' : `还剩 ${daysLeft} 天`})
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
                  <Users className="w-3.5 h-3.5 text-[#9a9a9a]" />
                  <span className="text-[13px] text-[#555]">{task.applicant_count} 人在洽谈</span>
                </div>
              </div>

              {/* Publisher */}
              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTd8fHdveG1hbiUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW5sb3x8fHwxNzAzNDQ0MjM1fDA&lib=rb-4.0.3&q=80&w=400"
                  alt="Lisa"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                />
                <div>
                  <div className="text-[14px] font-bold text-[#1a1a1a]">Lisa</div>
                  <div className="text-[12px] text-[#9a9a9a]">发布于 {formatRelativeTime(task.created_at)}</div>
                </div>
              </div>

              {/* Description */}
              <h4 className="text-[13px] font-bold text-[#555] uppercase tracking-wide mb-3">任务描述</h4>
              <div className="prose prose-sm max-w-none text-[13.5px] text-[#333] leading-relaxed mb-5">
                {task.description.split('\n').map((line, i) => {
                  // Very basic markdown rendering for bold and list items
                  const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex gap-2 mb-1">
                        <span className="text-[#f4845f] mt-1 flex-shrink-0">•</span>
                        <span dangerouslySetInnerHTML={{ __html: boldLine.slice(2) }} />
                      </div>
                    );
                  }
                  if (line.startsWith('#')) {
                    return <div key={i} className="font-bold text-[#1a1a1a] mt-3 mb-1" dangerouslySetInnerHTML={{ __html: boldLine.replace(/^#+\s/, '') }} />;
                  }
                  if (!line.trim()) return <div key={i} className="h-2" />;
                  return <p key={i} className="mb-1.5" dangerouslySetInnerHTML={{ __html: boldLine }} />;
                })}
              </div>

              {/* Required Skills */}
              {task.required_skills.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-[13px] font-bold text-[#555] uppercase tracking-wide mb-2.5">所需技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.required_skills.map(skill => (
                      <span
                        key={skill.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-[#f5f5f7] text-[#555] border border-[#e8e8e8]"
                      >
                        <span>{skill.icon}</span>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-[13px] font-bold text-[#555] uppercase tracking-wide mb-2.5">标签</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-[12px] bg-[#f5f5f7] text-[#6b7280]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: AI negotiation chat */}
            <div className="w-[380px] flex-shrink-0 flex flex-col">
              <NegotiationChat task={task} onAccept={() => setShowAccept(true)} />
            </div>
          </div>
        </div>
      </div>

      {showAccept && <AcceptModal task={task} onClose={() => setShowAccept(false)} />}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Publish Task Modal ────────────────────────────────────────
const PUBLISH_CATEGORIES: TaskCategory[] = ['research', 'content', 'code', 'design', 'data', 'automation', 'consultation', 'other'];

function PublishModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'research' as TaskCategory,
    tag: '',
    tags: [] as string[],
    budgetType: 'range' as 'fixed' | 'range' | 'negotiable',
    budgetMin: '',
    budgetMax: '',
    budgetFixed: '',
    deadline: '',
    agentName: '',
    agentPrompt: '',
  });
  const [published, setPublished] = useState(false);

  function addTag() {
    const t = form.tag.trim().replace(/^#/, '');
    if (t && !form.tags.includes(t) && form.tags.length < 5) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, t], tag: '' }));
    }
  }

  const stepLabel = ['基础信息', '偏好设置', '绑定智能体'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl mx-4 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
          <Briefcase className="w-5 h-5 text-[#f4845f]" />
          <span className="text-[16px] font-bold text-[#1a1a1a]">发布招募任务</span>
          <button onClick={onClose} className="ml-auto w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <X className="w-4 h-4 text-[#8e8e93]" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-[#f0f0f0]">
          {stepLabel.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    step > i + 1 ? 'bg-[#22c55e] text-white' : step === i + 1 ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0f0f0] text-[#bbb]'
                  }`}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-[12px] font-medium ${step === i + 1 ? 'text-[#1a1a1a]' : 'text-[#bbb]'}`}>{label}</span>
              </div>
              {i < stepLabel.length - 1 && <div className="flex-1 h-px bg-[#e8e8e8] mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {published ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-1">任务发布成功！</h3>
              <p className="text-[13px] text-[#9a9a9a]">智能体将代表你在任务广场接受咨询</p>
            </div>
          ) : step === 1 ? (
            <>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">任务标题 *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="用一句话描述你的需求…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors placeholder:text-[#ccc]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">任务类别 *</label>
                <div className="grid grid-cols-4 gap-2">
                  {PUBLISH_CATEGORIES.map(cat => {
                    const Icon = CATEGORY_ICONS[cat];
                    const accent = TASK_CATEGORY_COLORS[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setForm(p => ({ ...p, category: cat }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[11.5px] font-medium transition-all ${
                          form.category === cat
                            ? 'border-[#1a1a1a] bg-[#f5f5f7] text-[#1a1a1a]'
                            : 'border-[#e8e8e8] text-[#9a9a9a] hover:border-[#ccc]'
                        }`}
                      >
                        <Icon className="w-4 h-4" style={{ color: form.category === cat ? accent : '#bbb' }} />
                        {TASK_CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">任务描述 *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="详细描述任务背景、要求和交付物，支持 Markdown 格式…"
                  rows={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors resize-none placeholder:text-[#ccc]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">
                  标签（最多 5 个）
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#555]">
                      #{t}
                      <button onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={form.tag}
                    onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="输入标签按 Enter 添加"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#e0e0e0] text-[13px] outline-none focus:border-[#aaa] transition-colors placeholder:text-[#ccc]"
                  />
                  <button
                    onClick={addTag}
                    className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] text-[#555] text-[13px] font-medium hover:bg-[#e8e8e8] transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">预算类型</label>
                <div className="flex gap-2">
                  {([['range', '区间'], ['fixed', '固定'], ['negotiable', '面议']] as const).map(([t, l]) => (
                    <button
                      key={t}
                      onClick={() => setForm(p => ({ ...p, budgetType: t }))}
                      className={`flex-1 py-2 rounded-xl border text-[13px] font-medium transition-all ${
                        form.budgetType === t ? 'border-[#1a1a1a] bg-[#f5f5f7] text-[#1a1a1a]' : 'border-[#e0e0e0] text-[#9a9a9a] hover:border-[#ccc]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {form.budgetType !== 'negotiable' && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">
                    {form.budgetType === 'fixed' ? '固定金额（元）' : '预算范围（元）'}
                  </label>
                  {form.budgetType === 'fixed' ? (
                    <input
                      type="number"
                      value={form.budgetFixed}
                      onChange={e => setForm(p => ({ ...p, budgetFixed: e.target.value }))}
                      placeholder="如：5000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={form.budgetMin}
                        onChange={e => setForm(p => ({ ...p, budgetMin: e.target.value }))}
                        placeholder="最低（如 3000）"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors"
                      />
                      <span className="text-[#bbb]">–</span>
                      <input
                        type="number"
                        value={form.budgetMax}
                        onChange={e => setForm(p => ({ ...p, budgetMax: e.target.value }))}
                        placeholder="最高（如 10000）"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">期望截止日期</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#fafafa] rounded-xl p-4 border border-[#f0f0f0]">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-[#f4845f]" />
                  <span className="text-[13px] font-bold text-[#1a1a1a]">绑定应答智能体</span>
                </div>
                <p className="text-[12px] text-[#9a9a9a]">该智能体将代你在任务详情页自动接待来访的接单方，回答任务相关问题。</p>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">智能体名称 *</label>
                <input
                  value={form.agentName}
                  onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))}
                  placeholder="如：Alex · 招募助理"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors placeholder:text-[#ccc]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#555] mb-1.5">任务背景提示词（可选）</label>
                <textarea
                  value={form.agentPrompt}
                  onChange={e => setForm(p => ({ ...p, agentPrompt: e.target.value }))}
                  placeholder="补充任务背景、接单要求、注意事项等，帮助智能体更准确地回答…"
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] outline-none focus:border-[#aaa] transition-colors resize-none placeholder:text-[#ccc]"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!published && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-[#f0f0f0]">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-[13.5px] font-semibold text-[#555] hover:bg-[#f5f5f7] transition-colors"
              >
                上一步
              </button>
            )}
            <button
              className="ml-auto px-6 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-[13.5px] font-bold hover:bg-[#333] transition-colors disabled:opacity-40"
              disabled={step === 1 && (!form.title || !form.description)}
              onClick={() => {
                if (step < 3) setStep(s => s + 1);
                else setPublished(true);
              }}
            >
              {step < 3 ? '下一步' : '发布任务'}
            </button>
          </div>
        )}
        {published && (
          <div className="px-6 py-4 border-t border-[#f0f0f0]">
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#1a1a1a] text-white text-[14px] font-bold">
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main TasksView ────────────────────────────────────────────
const ALL_CATEGORIES: Array<TaskCategory | 'all'> = [
  'all', 'research', 'content', 'code', 'design', 'data', 'automation', 'consultation',
];
const ALL_STATUSES: Array<TaskStatus | 'all'> = ['all', 'open', 'in_negotiation', 'accepted'];

type SortKey = 'newest' | 'budget_desc' | 'deadline' | 'hot';

export default function TasksView({ search = '', onSearchChange }: { search?: string; onSearchChange?: (v: string) => void }) {
  const [catFilter, setCatFilter] = useState<TaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [selectedTask, setSelectedTask] = useState<TaskPost | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  const filtered = useMemo(() => {
    let list = [...mockTasks];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (catFilter !== 'all') list = list.filter(t => t.category === catFilter);
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
    if (sortKey === 'newest') list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sortKey === 'hot') list.sort((a, b) => b.applicant_count - a.applicant_count);
    if (sortKey === 'budget_desc') {
      list.sort((a, b) => {
        const va = a.budget?.amount ?? a.budget?.max ?? a.budget?.min ?? 0;
        const vb = b.budget?.amount ?? b.budget?.max ?? b.budget?.min ?? 0;
        return vb - va;
      });
    }
    if (sortKey === 'deadline') {
      list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    }
    return list;
  }, [search, catFilter, statusFilter, sortKey]);

  return (
    <div className="w-full flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        {/* Status filter – left */}
        <div className="flex gap-1.5">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all border ${
                statusFilter === s
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#bbb]'
              }`}
            >
              {s === 'all' ? '全部状态' : TASK_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Sort + Publish – right */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="px-3 py-2 rounded-xl border border-[#e0e0e0] text-[12.5px] text-[#555] outline-none bg-white cursor-pointer"
          >
            <option value="newest">最新发布</option>
            <option value="hot">洽谈最多</option>
            <option value="budget_desc">报酬最高</option>
            <option value="deadline">即将截止</option>
          </select>
          <button
            onClick={() => setShowPublish(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f4845f] text-white text-[13px] font-bold hover:bg-[#e8714d] transition-colors"
          >
            <Plus className="w-4 h-4" /> 发布任务
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 flex-nowrap">
        {ALL_CATEGORIES.map(cat => {
          const Icon = cat === 'all' ? LayoutGrid : CATEGORY_ICONS[cat];
          const accent = cat === 'all' ? '#1a1a1a' : TASK_CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                catFilter === cat
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#bbb]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: catFilter === cat ? 'white' : accent }} />
              {cat === 'all' ? '全部类型' : TASK_CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <div className="text-[12px] text-[#bbb] mb-4">{filtered.length} 个任务</div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-[#ccc]" />
          </div>
          <p className="text-[14px] text-[#bbb] mb-2">暂无匹配任务</p>
          <button onClick={() => setShowPublish(true)} className="text-[13px] font-semibold text-[#f4845f] hover:underline">
            试试发布一个？
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 pb-12">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* Publish Modal */}
      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}
    </div>
  );
}
