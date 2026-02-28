'use client';

interface Chip {
  label: string;
  text: string;
  modeKey?: string;
}

interface Props {
  chips: Chip[];
  onSelect: (text: string, modeKey?: string) => void;
}

export default function SmartInputHints({ chips, onSelect }: Props) {
  if (chips.length === 0) return null;
  return (
    <div className="w-full mb-3 animate-[fadeSlideIn_0.2s_ease-out]">
      <div className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-[0.6px] mb-2.5">
        根据你的需求，让我们一起先试试：
      </div>
      <div className="flex flex-col gap-2">
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelect(chip.text, chip.modeKey)}
            className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-[rgba(0,0,0,0.07)] bg-[rgba(255,255,255,0.85)] hover:border-[rgba(37,99,235,0.35)] hover:bg-[rgba(37,99,235,0.04)] transition-all cursor-pointer text-left"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <span className="w-5 h-5 flex-shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] group-hover:border-[rgba(37,99,235,0.4)] bg-white flex items-center justify-center transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db] group-hover:bg-[#2563eb] transition-colors" />
            </span>
            <span className="text-[13px] text-[#374151] group-hover:text-[#1d1d1f] leading-snug transition-colors">
              {chip.label}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-[#c7c7cc] group-hover:text-[#2563eb] transition-colors opacity-0 group-hover:opacity-100">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
