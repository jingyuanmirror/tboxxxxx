'use client';

import { useState } from 'react';

const MODES = [
  { name: 'PPT 演示', iconKey: 'ppt', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )},
  { name: 'Web 搜索', iconKey: 'web', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )},
  { name: 'Excel 分析', iconKey: 'excel', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )},
  { name: 'Code 生成', iconKey: 'code', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )},
  { name: 'Mail 撰写', iconKey: 'mail', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )},
  { 
    name: '小红书', 
    iconKey: 'xiaohongshu', 
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    isSpecial: true
  },
];

export default function MagicInput() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [inputValue, setInputValue] = useState('');

  const handleModeSelect = (mode: typeof MODES[0]) => {
    setSelectedMode(mode);
    setIsDropdownOpen(false);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('Sending message:', inputValue);
      // Add your send logic here
      setInputValue('');
    }
  };

  return (
    <div 
      className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] w-full max-w-[950px] h-[170px] rounded-[24px] p-[15px_25px_20px_25px] box-border flex flex-col justify-between relative transition-all duration-300 ease-in-out flex-shrink-0 mb-[30px] hover:-translate-y-[3px] z-[2]"
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)';
      }}
    >
      {/* Mode Selector Bar - V8.33 恢复模式选择条 */}
      <div className="flex justify-end items-center pb-2.5 mb-2.5 border-b border-[rgba(0,0,0,0.06)] flex-shrink-0">
        {/* Mode Dropdown */}
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-[#1d1d1f] text-white px-[15px] py-1.5 rounded-[10px] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors hover:bg-black"
            style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
          >
            <span>{selectedMode.name}</span>
            <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ strokeWidth: 2 }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div 
              className="absolute top-full right-0 min-w-[160px] bg-white rounded-xl mt-1 overflow-hidden z-50"
              style={{ 
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                padding: '8px 0'
              }}
            >
              {MODES.map((mode) => (
                <div
                  key={mode.iconKey}
                  onClick={() => handleModeSelect(mode)}
                  className={`flex items-center px-[15px] py-2 text-sm cursor-pointer transition-colors font-medium gap-2.5 ${
                    selectedMode.iconKey === mode.iconKey 
                      ? 'bg-[rgba(0,0,0,0.04)] font-semibold text-[#1d1d1f]' 
                      : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                  }`}
                >
                  <span 
                    className={`w-4 h-4 flex-shrink-0 flex items-center justify-center ${
                      mode.isSpecial 
                        ? 'bg-[#FF2D55] rounded-full' 
                        : ''
                    } ${
                      mode.isSpecial ? 'text-white' : 'text-[#6a6e73]'
                    }`}
                  >
                    {mode.icon && mode.icon()}
                  </span>
                  {mode.name}{mode.isSpecial ? ' (Agent)' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full border-none bg-transparent font-['Inter'] text-base leading-normal text-[#1d1d1f] resize-none outline-none flex-1 mb-1.5 pt-0 placeholder:text-[#a1a1a6] placeholder:font-normal"
        placeholder="请直接吩咐任务：例如，将芯片报告初稿转化为高管演示 PPT..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {/* Input Tools - V8.33 恢复文件徽章位置 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="inline-flex items-center bg-[rgba(0,0,0,0.04)] px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#555] border border-[rgba(0,0,0,0.05)] relative -top-[5px] mr-[15px]">
            3 files attached
          </div>
          <span className="text-lg cursor-pointer text-[#86868b] transition-all opacity-80 hover:text-black hover:opacity-100 hover:scale-110" title="Settings">⚙️</span>
          <span className="text-lg cursor-pointer text-[#86868b] transition-all opacity-80 hover:text-black hover:opacity-100 hover:scale-110" title="Attach File">📎</span>
        </div>
        <button
          onClick={handleSend}
          className="w-8 h-8 bg-[#1d1d1f] rounded-full flex justify-center items-center text-white cursor-pointer transition-all hover:scale-110 hover:bg-black"
          style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
