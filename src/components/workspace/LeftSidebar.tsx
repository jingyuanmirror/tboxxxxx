'use client';

import { useState } from 'react';

interface ChatHistoryItem {
  id: string;
  title: string;
  initialMessage: string;
}

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenView?: (view: 'home'|'knowledge'|'scheduled'|'market'|'mytools'|'topicSpace', tab?: 'agents'|'skills'|'tasks', spaceId?: string) => void;
  chatHistory?: ChatHistoryItem[];
  onOpenChat?: (message: string) => void;
  appMode?: 'normal' | 'beginner' | 'openclaw' | 'student';
  onSelectMode?: (mode: 'normal' | 'beginner' | 'openclaw' | 'student') => void;
  tboxSkillCount?: number;
}

export default function LeftSidebar({ isCollapsed, onToggleCollapse, onOpenView, chatHistory = [], onOpenChat, appMode = 'normal', onSelectMode, tboxSkillCount = 0 }: LeftSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModePickerOpen, setIsModePickerOpen] = useState(false);

  return (
    <div 
      className={`flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col relative z-[5] ${
        isCollapsed ? 'w-[90px] px-0' : 'w-[220px]'
      } pt-6 pb-5`}
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
      `}</style>

      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-[30px] right-[30px] w-[30px] h-[30px] bg-white rounded-full cursor-pointer flex items-center justify-center z-[100] transition-all hover:bg-[#1d1d1f] hover:text-white text-[#1d1d1f]"
        style={{ boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)' }}
        title="Toggle Sidebar"
      >
        <svg 
          className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
          viewBox="0 0 24 24" 
          width="16" 
          height="16" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>

      {/* Navigation Content */}
      <div className={`flex-grow pb-5 overflow-y-auto transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        {/* Home */}
        <div className="mb-[30px]">
          <div
            onClick={() => onOpenView && onOpenView('home')}
            className="px-[15px] py-2 mx-0 my-0.5 cursor-pointer text-[13px] rounded-lg transition-all text-[#1d1d1f] flex items-center gap-0 relative whitespace-nowrap bg-[rgba(255,255,255,0.6)] backdrop-blur-[5px] font-semibold" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <span className="absolute left-[15px] top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-[#1d1d1f] rounded-sm" />
            首页
          </div>
        </div>

        {/* 空间 */}
        <div className="mb-[30px]">
          <div className="flex justify-between items-center mb-2 px-[15px] whitespace-nowrap">
            <div className="text-[12.5px] tracking-[0.5px] text-[#8e8e93] font-semibold cursor-default">话题空间</div>
            <div className="text-sm text-[#a1a1a6] cursor-pointer w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-[rgba(0,0,0,0.1)] hover:text-black" title="新建空间">＋</div>
          </div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('topicSpace', undefined, 'space-1')}>Q4 产品推广方案</div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('topicSpace', undefined, 'space-2')}>芯片市场竞品分析</div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('topicSpace', undefined, 'space-3')}>销售团队 Q3 复盘</div>
        </div>

        {/* 档案库 */}
        <div className="mb-[30px]">
          <div className="flex justify-between items-center mb-2 px-[15px] whitespace-nowrap">
            <div className="text-[12.5px] tracking-[0.5px] text-[#8e8e93] font-semibold cursor-default">档案库</div>
            <div className="text-sm text-[#a1a1a6] cursor-pointer w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-[rgba(0,0,0,0.1)] hover:text-black" title="Upload File">＋</div>
          </div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('knowledge')}>最近上传</div>
          <div className="nav-item">我的作品</div>
          <div className="nav-item">我的模版</div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('mytools')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>我的技能</span>
            {tboxSkillCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#f4845f', color: 'white', fontSize: 9, fontWeight: 700, lineHeight: 1 }}>{tboxSkillCount}</span>
            )}
          </div>
        </div>

        {/* 锦囊集市 */}
        <div className="mb-[30px]">
          <div className="flex justify-between items-center mb-2 px-[15px] whitespace-nowrap">
            <div className="text-[12.5px] tracking-[0.5px] text-[#8e8e93] font-semibold cursor-default">集市</div>
            <div
              onClick={() => onOpenView && onOpenView('market')}
              className="text-sm text-[#a1a1a6] cursor-pointer w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-[rgba(0,0,0,0.1)] hover:text-black"
              title="查看锦囊集市"
            >→</div>
          </div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('market', 'agents')}>人才广场</div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('market', 'skills')}>装备铺</div>
          <div className="nav-item" onClick={() => onOpenView && onOpenView('market', 'tasks')}>任务招募</div>
        </div>

        {/* 定时任务 */}
        <div className="mb-[30px]">
          <div className="flex justify-between items-center mb-2 px-[15px] whitespace-nowrap">
            <div className="text-[12.5px] tracking-[0.5px] text-[#8e8e93] font-semibold cursor-default">定时任务</div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('[LeftSidebar] Scheduled settings clicked');
                  if (!onOpenView) {
                    if (typeof window !== 'undefined') window.location.href = '/scheduled-tasks';
                    return;
                  }
                  onOpenView('scheduled');
                }}
                title="Open Scheduled Tasks"
                aria-label="Open Scheduled Tasks"
                className="ml-2 text-sm text-[#a1a1a6] cursor-pointer w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-[rgba(0,0,0,0.06)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" style={{ strokeWidth: 1.6 }}>
                  <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.28-.41 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.24 2.1l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9.91 2V1a2 2 0 0 1 4 0v.09c.7 0 1.28.41 1.51 1 .26.6.91 1 .09 1.82l.06.06a2 2 0 0 1 2.83 2.83l-.06.06c-.43.43-.6 1.06-.33 1.82.22.59.8 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.7 0-1.28.41-1.51 1z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
          </div>
          <div className="nav-item">AI大事件提醒 (09:30)</div>
          <div className="nav-item">每周总结 (周五)</div>
        </div>

        {/* 历史对话 */}
        <div className="mb-[30px]">
          <div className="flex justify-between items-center mb-2 px-[15px] whitespace-nowrap">
            <div className="text-[12.5px] tracking-[0.5px] text-[#8e8e93] font-semibold cursor-default">历史对话</div>
          </div>
          {chatHistory.length === 0 ? (
            <div className="px-[25px] py-2 text-[12px] text-[#a1a1a6] italic">暂无历史对话</div>
          ) : (
            chatHistory.map((item) => (
              <div
                key={item.id}
                className="nav-item"
                onClick={() => onOpenChat?.(item.initialMessage)}
                title={item.initialMessage}
              >
                {item.title}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Settings Area */}
      <div className={`flex-shrink-0 border-t border-[rgba(0,0,0,0.06)] pt-2.5 relative z-10 ${isCollapsed ? 'px-2.5' : 'px-2.5'}`}>

        {/* Mode Picker — upward popup */}
        {isModePickerOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsModePickerOpen(false)} />
            <div
              className={`absolute ${isCollapsed ? 'left-[50px]' : 'left-2.5 right-2.5'} bottom-[calc(100%+4px)] bg-white rounded-2xl p-2 z-50`}
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)' }}
            >
              <div className="px-3 pb-1.5 pt-1">
                <span className="text-[10px] font-semibold text-[#a1a1a6] uppercase tracking-[0.6px]">选择模式</span>
              </div>
              {([
                {
                  id: 'normal' as const,
                  label: '专家模式',
                  desc: '全功能，适合进阶用户',
                  color: '#6a6e73',
                  activeBg: 'rgba(0,0,0,0.06)',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  ),
                },
                {
                  id: 'beginner' as const,
                  label: '新手模式',
                  desc: '引导式体验，新用户友好',
                  color: '#2563eb',
                  activeBg: 'rgba(59,130,246,0.1)',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                  ),
                },
                {
                  id: 'openclaw' as const,
                  label: 'Open Claw',
                  desc: '开放爪子模式',
                  color: '#ea580c',
                  activeBg: 'rgba(234,88,12,0.1)',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
                      <path d="M9 10.5C9 9.12 7.88 8 6.5 8S4 9.12 4 10.5c0 1.2.8 2.2 1.9 2.45L5 17h3l-.5-4.5A2.5 2.5 0 0 0 9 10.5z" />
                      <path d="M14.5 8C13.12 8 12 9.12 12 10.5a2.5 2.5 0 0 0 1.5 2.28L13 17h3l-.9-4.05A2.5 2.5 0 0 0 17 10.5C17 9.12 15.88 8 14.5 8z" />
                      <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2" />
                      <path d="M13 7c0-1.1.9-2 2-2s2 .9 2 2" />
                    </svg>
                  ),
                },
                {
                  id: 'student' as const,
                  label: '学生模式',
                  desc: '专为在校学生定制',
                  color: '#16a34a',
                  activeBg: 'rgba(22,163,74,0.1)',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  ),
                },
              ]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { onSelectMode?.(opt.id); setIsModePickerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left"
                  style={{
                    background: appMode === opt.id ? opt.activeBg : 'transparent',
                    color: appMode === opt.id ? opt.color : '#1d1d1f',
                  }}
                  onMouseEnter={e => { if (appMode !== opt.id) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = appMode === opt.id ? opt.activeBg : 'transparent'; }}
                >
                  <span style={{ color: appMode === opt.id ? opt.color : '#6a6e73' }}>{opt.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight">{opt.label}</span>
                    {!isCollapsed && <span className="block text-[11px] text-[#a1a1a6] leading-tight mt-0.5">{opt.desc}</span>}
                  </span>
                  {appMode === opt.id && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0" style={{ strokeWidth: 2.5, color: opt.color }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Mode Button — click opens picker */}
        <button
          onClick={() => { setIsModePickerOpen(p => !p); setIsSettingsOpen(false); }}
          className={`w-full mb-1 px-[15px] py-2 cursor-pointer text-[13px] rounded-lg transition-all flex items-center gap-2.5 font-medium
            ${
              appMode === 'beginner'  ? 'bg-[rgba(59,130,246,0.1)]  text-[#2563eb] hover:bg-[rgba(59,130,246,0.18)]' :
              appMode === 'openclaw' ? 'bg-[rgba(234,88,12,0.1)]   text-[#ea580c] hover:bg-[rgba(234,88,12,0.18)]' :
              appMode === 'student'  ? 'bg-[rgba(22,163,74,0.1)]   text-[#16a34a] hover:bg-[rgba(22,163,74,0.18)]' :
              'text-[#6a6e73] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1d1d1f]'
            }
            ${isCollapsed ? 'justify-center px-2.5' : ''}
            ${isModePickerOpen ? 'ring-2 ring-[rgba(0,0,0,0.08)]' : ''}
          `}
        >
          {/* Icon by current mode */}
          {appMode === 'beginner' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
          ) : appMode === 'openclaw' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
              <path d="M9 10.5C9 9.12 7.88 8 6.5 8S4 9.12 4 10.5c0 1.2.8 2.2 1.9 2.45L5 17h3l-.5-4.5A2.5 2.5 0 0 0 9 10.5z" />
              <path d="M14.5 8C13.12 8 12 9.12 12 10.5a2.5 2.5 0 0 0 1.5 2.28L13 17h3l-.9-4.05A2.5 2.5 0 0 0 17 10.5C17 9.12 15.88 8 14.5 8z" />
              <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2" />
              <path d="M13 7c0-1.1.9-2 2-2s2 .9 2 2" />
            </svg>
          ) : appMode === 'student' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.8 }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          )}
          {!isCollapsed && (
            <span className="truncate flex-1">
              {appMode === 'beginner' ? '新手模式' : appMode === 'openclaw' ? 'Open Claw' : appMode === 'student' ? '学生模式' : '专家模式'}
            </span>
          )}
          {!isCollapsed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isModePickerOpen ? 'rotate-180' : ''}`}
              style={{ strokeWidth: 2, opacity: 0.5 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>

        <button
          onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsModePickerOpen(false); }}
          className={`px-[15px] py-2 cursor-pointer text-[13px] rounded-lg transition-all text-[#6a6e73] flex items-center gap-2.5 font-medium hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1d1d1f] ${isCollapsed ? 'justify-center w-fit px-2.5 h-8' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8 }}>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          {!isCollapsed && <span>设置</span>}
        </button>

        {/* Settings Popover */}
        {isSettingsOpen && (
          <div className={`absolute ${isCollapsed ? 'left-[50px]' : 'left-2.5'} bottom-[calc(100%+5px)] w-[180px] bg-white rounded-xl p-2 opacity-100 visible translate-y-0 transition-all z-50`} style={{ boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)' }}>
          <div className="popover-group-title">风格及记忆</div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Tbox 设置
          </div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            用户档案
          </div>
          <div className="popover-group-title">权限与账号</div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            成员管理
          </div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
            </svg>
            账户与安全
          </div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            数据与隐私
          </div>
          <div className="popover-group-title">其他</div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            工作区/通用
          </div>
          <div className="popover-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#6a6e73' }}>
              <path d="M20.5 14.5L14 18l-6.5-3.5L1 18V6l6.5 3.5L14 6l6.5 3.5V18z"></path>
              <line x1="14" y1="6" x2="14" y2="18"></line>
            </svg>
            快捷键与定制
          </div>
          <div className="popover-item text-[#e54c4c] mt-2 pt-3 pb-2 border-t border-[rgba(0,0,0,0.08)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ strokeWidth: 1.8, color: '#e54c4c' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            退出
          </div>
        </div>
        )}
      </div>

      <style jsx>{`
        .nav-item {
          padding: 8px 15px 8px 25px;
          margin: 2px 0;
          cursor: pointer;
          font-size: 13px;
          border-radius: 8px;
          transition: all 0.2s;
          color: #6a6e73;
          display: flex;
          align-items: center;
          gap: 0;
          position: relative;
          white-space: nowrap;
        }
        .nav-item:hover {
          background-color: rgba(0,0,0,0.04);
          color: #1d1d1f;
        }
        .popover-group-title {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #a1a1a6;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 12px 15px 4px 15px;
          margin-top: 8px;
          pointer-events: none;
        }
        .popover-group-title:first-child {
          margin-top: 0;
        }
        .popover-item {
          display: flex;
          align-items: center;
          padding: 8px 15px;
          font-size: 14px;
          color: #1d1d1f;
          cursor: pointer;
          gap: 12px;
          transition: background 0.15s;
        }
        .popover-item:hover {
          background: #f5f5f7;
        }
      `}</style>
    </div>
  );
}
