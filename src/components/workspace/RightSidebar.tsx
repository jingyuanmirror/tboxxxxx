'use client';

import { useState } from 'react';

interface RightSidebarProps {
  isVisible: boolean;
}

const TABS = [
  { id: 'insight',  label: '环境感知', icon: '✦', badge: 3 },
  { id: 'reminder', label: '私人提醒', icon: '⏰', badge: 1 },
  { id: 'collab',   label: '协作进度', icon: '👥', badge: 2 },
] as const;

type TabId = typeof TABS[number]['id'];

export default function RightSidebar({ isVisible }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>('insight');
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [collabExpanded, setCollabExpanded] = useState(false);

  return (
    <div
      className={`flex-shrink-0 pt-6 pb-5 transition-all duration-300 ease-in-out flex flex-col relative z-[5] ${
        isVisible ? 'w-[240px] px-4' : 'w-[50px] px-2.5 overflow-y-hidden'
      }`}
    >
      <div className={`transition-opacity duration-300 flex flex-col gap-3 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible h-0'}`}>

        {/* ── Tab bar — underline style ── */}
        <div className="flex items-center border-b border-[rgba(0,0,0,0.07)]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-2 text-[12px] font-semibold transition-all duration-200 cursor-pointer border-b-[2px] -mb-px ${
                activeTab === tab.id
                  ? 'text-[#1d1d1f] border-[#1d1d1f]'
                  : 'text-[#aaa] border-transparent hover:text-[#666]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── 环境感知 panel ── */}
        {activeTab === 'insight' && (
          <div
            className="bg-white/80 backdrop-blur-[16px] border border-black/[0.05] rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            {/* first item */}
            <div className="p-4">
              <p className="text-[13px] text-[#333] leading-relaxed m-0">
                AI 领域正转向<strong className="text-[#1d1d1f]">垂直应用</strong>，建议聚焦竞品分析的差异化，同时利用 Agent Hub 中的"数据分析师"来验证成本模型。
              </p>
              <span className="text-[10px] bg-blue-50 text-blue-500 font-semibold px-2 py-0.5 rounded-full mt-2 inline-block">
                Insight · AI 趋势
              </span>
            </div>

            {/* expanded items */}
            {insightExpanded && (
              <>
                <div className="px-4 pb-4 border-t border-dashed border-black/[0.06] pt-3 flex flex-col gap-3">
                  <div>
                    <p className="text-[13px] text-[#333] leading-relaxed m-0">
                      市场趋势：Q4 订单量环比增长 10%，中高端竞争加剧。推广方案需有效区分目标客户群。
                    </p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full mt-2 inline-block">
                      Market · 增长
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#333] leading-relaxed m-0">
                      系统检测到您近期打开 15 份"低功耗"文档，已纳入<strong className="text-[#1d1d1f]">核心关注点</strong>记忆。
                    </p>
                    <span className="text-[10px] bg-purple-50 text-purple-500 font-semibold px-2 py-0.5 rounded-full mt-2 inline-block">
                      Memory · 重点关注
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* expand toggle */}
            <button
              onClick={() => setInsightExpanded((v) => !v)}
              className="w-full py-2.5 text-[11px] text-[#bbb] hover:text-[#888] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer border-t border-black/[0.04] bg-black/[0.015]"
            >
              <span className={`transition-transform duration-200 inline-block text-[10px] ${insightExpanded ? 'rotate-180' : ''}`}>▾</span>
              {insightExpanded ? '收起' : '展开全部 2 条'}
            </button>
          </div>
        )}

        {/* ── 私人提醒 panel ── */}
        {activeTab === 'reminder' && (
          <div
            className="bg-white/80 backdrop-blur-[16px] border border-black/[0.05] rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div className="p-4">
              {/* priority row */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block flex-shrink-0" />
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">优先</span>
              </div>
              <p className="text-[13px] text-[#333] leading-relaxed m-0">
                享受这片刻的光影，但别忘了<strong className="text-[#1d1d1f]">竞品报告</strong>截止时间是明天。需将完成的邮件发送给所有经理。
              </p>
            </div>
            <div className="px-4 py-2.5 border-t border-black/[0.04] bg-black/[0.015] flex items-center justify-between">
              <span className="text-[11px] text-[#bbb]">截止：明天</span>
              <button className="text-[11px] text-[#007AFF] font-semibold hover:opacity-60 transition-opacity cursor-pointer">
                标记完成
              </button>
            </div>
          </div>
        )}

        {/* ── 协作进度 panel ── */}
        {activeTab === 'collab' && (
          <div
            className="bg-white/80 backdrop-blur-[16px] border border-black/[0.05] rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div className="p-4">
              <p className="text-[13px] text-[#333] leading-relaxed m-0">
                <strong className="text-[#1d1d1f]">《Q4 产品推广方案》</strong> 核心设计稿已完成，市场部等待最终确认。
              </p>
              {/* progress bar */}
              <div className="mt-3 mb-1 flex items-center justify-between">
                <span className="text-[10px] text-[#aaa] font-medium">完成进度</span>
                <span className="text-[10px] font-bold text-emerald-500">80%</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: '80%' }} />
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full mt-2.5 inline-block">
                Project Update
              </span>
            </div>

            {collabExpanded && (
              <div className="px-4 pb-4 border-t border-dashed border-black/[0.06] pt-3">
                <p className="text-[13px] text-[#333] leading-relaxed m-0">
                  您有一封未处理的 Gmail：关于<strong className="text-[#1d1d1f]">预算审批</strong>的回复，标记为紧急。
                </p>
                <span className="text-[10px] bg-rose-50 text-rose-400 font-semibold px-2 py-0.5 rounded-full mt-2 inline-block">
                  Email Alert
                </span>
              </div>
            )}

            <button
              onClick={() => setCollabExpanded((v) => !v)}
              className="w-full py-2.5 text-[11px] text-[#bbb] hover:text-[#888] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer border-t border-black/[0.04] bg-black/[0.015]"
            >
              <span className={`transition-transform duration-200 inline-block text-[10px] ${collabExpanded ? 'rotate-180' : ''}`}>▾</span>
              {collabExpanded ? '收起' : '查看邮件提醒'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
