'use client';

import { useState } from 'react';
import MagicInput from './MagicInput';

interface CenterMainProps {
  isLeftSidebarCollapsed: boolean;
}

export default function CenterMain({ isLeftSidebarCollapsed }: CenterMainProps) {
  return (
    <div className="flex-1 flex flex-col items-center px-[60px] pl-10 pt-6 pb-5 relative overflow-y-auto overflow-x-hidden bg-[#f2f4f6] z-[1]">
      {/* Background Image */}
      <div 
        className={`fixed top-0 right-0 bottom-0 opacity-50 pointer-events-none -z-[1] transition-all duration-300 ${
          isLeftSidebarCollapsed ? 'left-[90px]' : 'left-[220px]'
        }`}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566041510394-cf7c8d968e4e?q=80&w=2671&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
          filter: 'blur(2px) contrast(1.05)',
        }}
      />

      {/* Dialogue History */}
      <div className="w-full max-w-[950px] mb-[70px] flex flex-col items-start relative z-[2]">
        {/* Initial Greeting */}
        <div className="bg-none backdrop-blur-none border-none shadow-none p-0 w-full max-w-[950px] leading-relaxed mb-0 self-start rounded-none">
          <div className="text-[13px] text-[#6e6e73] mb-2 font-medium block opacity-80">周四，04:22 PM</div>
          <div className="font-playfair-display text-[28px] font-bold text-[#1d1d1f] mb-2.5 leading-[1.3] pb-3 border-b border-dashed border-[rgba(0,0,0,0.1)] w-full">
            Hi Lisa，午后好。享受这片刻的宁静了吗？
          </div>
          <div className="text-base text-[#444] pt-0 border-t-0 mt-0 leading-[1.7]">
            昨天的《Q4 推广方案》已经存档。今天光线不错，非常适合进行深度思考工作。
          </div>
        </div>
      </div>

      {/* Magic Input Container */}
      <MagicInput />

      {/* Footer Hint */}
      <div className="mb-[30px] text-[#86868b] text-xs text-center leading-tight max-w-[600px]" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
        Complex bureaucracy just got simple. Add any files, give any task.
      </div>

      {/* Discovery Section */}
      <div className="w-full max-w-[950px] pb-[30px] mt-20 relative z-[2]">
        <div className="flex items-center justify-center mb-6 text-[#86868b] text-[11px] tracking-[1.5px] font-semibold uppercase opacity-80">
          <div className="h-px w-10 bg-[rgba(0,0,0,0.1)] mr-[15px]" />
          探索精选案例
          <div className="h-px w-10 bg-[rgba(0,0,0,0.1)] ml-[15px]" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 w-full">
          {[
            { cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60', title: 'Gemini 3.0: AI新纪元', author: '技术专家', tag: 'PPT' },
            { cover: 'https://images.unsplash.com/photo-1549682522-d7842e47c1b7?w=500&auto=format&fit=crop&q=60', title: '疯狂动物城2分析', author: '电影市场', tag: 'Report' },
            { cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60', title: 'Z世代职场沟通分析', author: '组织研究', tag: 'Research' },
            { cover: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&auto=format&fit=crop&q=60', title: '搭子社交文化', author: '社会学', tag: 'Research' },
          ].map((card, index) => (
            <div 
              key={index}
              className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] rounded-[18px] overflow-hidden transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1.5"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)';
              }}
            >
              <div 
                className="h-[120px] w-full relative bg-cover bg-center opacity-95"
                style={{ backgroundImage: `url('${card.cover}')` }}
              />
              <div className="p-[15px]">
                <div className="text-sm font-semibold text-[#1d1d1f] mb-1.5 leading-tight">{card.title}</div>
                <div className="text-[11px] text-[#666] flex justify-between items-center">
                  <span>{card.author}</span>
                  <span className="text-[10px] bg-[rgba(0,0,0,0.05)] px-2 py-0.5 rounded-xl text-[#555] font-medium">{card.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
