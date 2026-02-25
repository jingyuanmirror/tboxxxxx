'use client';

import React from 'react';

export default function KnowledgeView() {
  const groups = [
    {
      title: '2026 年 01 月',
      files: new Array(6).fill(0).map((_,i)=>({name:`image_${i}.png`, size: `${Math.round(100+Math.random()*500)} KB`}))
    },
    {
      title: '2025 年 12 月',
      files: new Array(3).fill(0).map((_,i)=>({name:`image_old_${i}.png`, size: `${Math.round(100+Math.random()*500)} KB`}))
    }
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] text-[#6e6e73] mb-2 font-medium block opacity-80">知识库</div>
          <div className="font-playfair-display text-[22px] font-bold text-[#1d1d1f] leading-[1.2]">Knowledge Base</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f3f4f6] px-3 py-2 rounded-lg">
            <input className="bg-transparent outline-none" placeholder="搜索文件名称" />
            <button className="text-sm text-gray-600 px-3 py-1 rounded hover:bg-[#e9e9ea]">搜索</button>
          </div>
        </div>
      </div>

      {groups.map((g,gi)=> (
        <div key={gi} className="mb-6">
          <div className="text-sm font-semibold text-gray-500 mb-3">{g.title} <span className="text-xs text-gray-400">{g.files.length} 个文件</span></div>
          <div className="grid grid-cols-3 gap-4">
            {g.files.map((f,fi)=> (
              <div key={fi} className="bg-[#fafafa] rounded-lg p-4 flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-orange-500 font-bold">IMG</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-400">{f.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
