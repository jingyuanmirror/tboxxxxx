'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/useOnboarding';

const OCCUPATIONS = [
  '产品经理', '运营', '销售', '创业者', '市场/品牌',
  '研究员', '设计师', '工程师', '学生', '其他',
];

const USE_CASES = [
  '写方案', '做报告', '写代码', '搜信息', '发邮件',
  '管项目', '做 PPT', '数据分析',
];

interface Props {
  defaultName?: string;
  onSave: (profile: UserProfile) => void;
  onSkip: () => void;
  onClose?: () => void;
  onUseCasesChange?: (useCases: string[]) => void;
}

export default function ProfileIntroCard({ defaultName = 'Lisa', onSave, onSkip, onClose, onUseCasesChange }: Props) {
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);

  const toggleUseCase = (tag: string) => {
    setUseCases(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      onUseCasesChange?.(next);
      return next;
    });
  };

  const canSave = name.trim().length > 0 || occupation.length > 0;

  return (
    <div
      className="w-full rounded-2xl border-2 border-dashed border-[rgba(37,99,235,0.25)] bg-[rgba(255,255,255,0.82)] backdrop-blur-[12px] p-6 mb-6"
      style={{ boxShadow: '0 4px 24px rgba(37,99,235,0.06)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">先认识一下你 👋</h3>
          <p className="text-[13px] text-[#86868b] leading-relaxed">
            填写后我能更好地帮到你，也可以随时跳过
          </p>
        </div>
        <button
          onClick={onClose ?? onSkip}
          className="flex-shrink-0 ml-4 mt-0.5 text-[#c7c7cc] hover:text-[#555] transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="text-[13.5px] font-semibold text-[#1d1d1f] mb-1.5 block">
            {defaultName}，你希望我怎么称呼你？
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`就叫 ${defaultName} 吧，或者告诉我你的昵称`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white text-[13.5px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[rgba(37,99,235,0.12)]"
          />
        </div>

        {/* Occupation */}
        <div>
          <label className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] mb-1.5 block">
            职业 / 行业
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCUPATIONS.map(occ => (
              <button
                key={occ}
                onClick={() => setOccupation(prev => prev === occ ? '' : occ)}
                className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer border ${
                  occupation === occ
                    ? 'bg-[#2563eb] text-white border-[#2563eb]'
                    : 'bg-white text-[#555] border-[rgba(0,0,0,0.1)] hover:border-[#2563eb] hover:text-[#2563eb]'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <label className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] mb-1.5 block">
            主要用来做什么（可多选）
          </label>
          <div className="flex flex-wrap gap-2">
            {USE_CASES.map(tag => (
              <button
                key={tag}
                onClick={() => toggleUseCase(tag)}
                className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer border ${
                  useCases.includes(tag)
                    ? 'bg-[rgba(37,99,235,0.1)] text-[#2563eb] border-[rgba(37,99,235,0.3)]'
                    : 'bg-white text-[#555] border-[rgba(0,0,0,0.1)] hover:border-[#2563eb] hover:text-[#2563eb]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — hidden when use cases are selected (task suggestions appear outside instead) */}
      {useCases.length === 0 && (
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => onSave({ name: name.trim(), occupation, useCases })}
            disabled={!canSave}
            className="px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-[13.5px] font-semibold transition-all cursor-pointer hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            开始体验 →
          </button>
        </div>
      )}
    </div>
  );
}
