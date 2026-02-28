'use client';

interface UnlockItem {
  emoji: string;
  title: string;
  desc: string;
  action?: () => void;
}

interface Props {
  onDismiss: () => void;
  onOpenScheduled?: () => void;
  onOpenKnowledge?: () => void;
  onOpenMarket?: () => void;
  onTryAnother?: () => void;
}

export default function UnlockBanner({ onDismiss, onOpenScheduled, onOpenKnowledge, onOpenMarket, onTryAnother }: Props) {
  const items: UnlockItem[] = [
    { emoji: '🗓', title: '设置定时任务', desc: '让 AI 每天自动为你工作', action: onOpenScheduled },
    { emoji: '🧠', title: '上传你的档案', desc: '让 AI 理解你的业务背景', action: onOpenKnowledge },
    { emoji: '🛒', title: '逛逛集市 Agent', desc: '找到你的专属 AI 助手', action: onOpenMarket },
    { emoji: '🔁', title: '试试另一种任务', desc: '还有 5 种能力等你探索', action: onTryAnother },
  ];

  return (
    <div
      className="w-full mt-5 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-[rgba(255,255,255,0.92)] backdrop-blur-[12px] p-5 animate-[slideUp_0.25s_ease-out]"
      style={{ boxShadow: '0 8px 32px rgba(37,99,235,0.08)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[15px] font-semibold text-[#1d1d1f]">🎉 太棒了，第一件事搞定！</div>
          <div className="text-[13px] text-[#86868b] mt-0.5">来看看 Tbox 还能做什么</div>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#c7c7cc] hover:text-[#86868b] transition-colors cursor-pointer mt-0.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(0,0,0,0.07)] bg-[rgba(248,250,255,0.8)] hover:border-[rgba(37,99,235,0.3)] hover:bg-[rgba(37,99,235,0.04)] transition-all cursor-pointer text-left"
          >
            <span className="text-xl leading-none mt-0.5">{item.emoji}</span>
            <div>
              <div className="text-[13px] font-semibold text-[#1d1d1f]">{item.title}</div>
              <div className="text-[11.5px] text-[#86868b] mt-0.5">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onDismiss}
        className="mt-4 w-full text-center text-[12px] text-[#a1a1a6] hover:text-[#555] transition-colors cursor-pointer py-1"
      >
        我知道了，继续使用
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
