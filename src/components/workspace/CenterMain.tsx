'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MagicInput from './MagicInput';
import ChatDialog from './ChatDialog';
import { Check, ChevronDown, MessageSquare, Send, X } from 'lucide-react';

const ScheduledTasksClient = dynamic(() => import('./ScheduledTasks'), { ssr: false });
const KnowledgeView = dynamic(() => import('./KnowledgeView'), { ssr: false });
const MarketView = dynamic(() => import('./MarketView'), { ssr: false });

type ConfirmItemStatus = 'pending' | 'confirmed' | 'replied';

interface ConfirmItem {
  id: number;
  text: string;
  status: ConfirmItemStatus;
  replyText?: string;
}

const initialItems: ConfirmItem[] = [
  { id: 1, text: '本周三上海的会议改成了下午，我将给你换一班回来的航班，但是预算会提高200-400元', status: 'pending' },
  { id: 2, text: '我发现你的信用卡有接机权益没有用，我将在你本次出差时使用该权益', status: 'pending' },
];

interface CenterMainProps {
  isLeftSidebarCollapsed: boolean;
  activeView?: 'home' | 'knowledge' | 'scheduled' | 'market';
  marketInitialTab?: 'agents' | 'skills' | 'tasks';
  onCloseScheduledTasks?: () => void;
  isChatOpen?: boolean;
  chatInitialMessage?: string;
  onOpenChat?: (message: string) => void;
  onCloseChat?: () => void;
  onOpenMarket?: (tab: 'agents' | 'skills') => void;
}

export default function CenterMain({ isLeftSidebarCollapsed, activeView = 'home', marketInitialTab, onCloseScheduledTasks, isChatOpen = false, chatInitialMessage = '', onOpenChat, onCloseChat, onOpenMarket }: CenterMainProps) {
  const [items, setItems] = useState<ConfirmItem[]>(initialItems);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyingId !== null && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingId]);

  const handleConfirm = (id: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'confirmed' } : item));
    if (replyingId === id) {
      setReplyingId(null);
      setReplyDraft('');
    }
  };

  const handleStartReply = (id: number) => {
    setReplyingId(id);
    setReplyDraft('');
  };

  const handleCancelReply = () => {
    setReplyingId(null);
    setReplyDraft('');
  };

  const handleSendReply = (id: number) => {
    if (!replyDraft.trim()) return;
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'replied', replyText: replyDraft.trim() } : item));
    setReplyingId(null);
    setReplyDraft('');
  };

  const [isListCollapsed, setIsListCollapsed] = useState(false);

  const pendingCount = items.filter(item => item.status === 'pending').length;

  const handleMagicInputSend = (message: string) => {
    onOpenChat?.(message);
  };

  // If chat is open, render the full-page Gemini-style chat view
  if (isChatOpen) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <ChatDialog
          initialMessage={chatInitialMessage}
          onClose={() => onCloseChat?.()}
        />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col items-center pt-6 pb-5 relative overflow-y-auto overflow-x-hidden bg-[#f2f4f6] z-[1] ${activeView === 'knowledge' || activeView === 'market' ? 'px-8' : 'px-[60px] pl-10'}`}>
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

      {/* Knowledge view: full width, outside the narrow content column */}
      {activeView === 'knowledge' && (
        <div className="w-full relative z-[2]">
          <KnowledgeView />
        </div>
      )}

      {/* Market view: full width */}
      {activeView === 'market' && (
        <div className="w-full relative z-[2]">
          <MarketView initialTab={marketInitialTab} />
        </div>
      )}

      {/* Main content area: render based on activeView */}
      <div className="w-full max-w-[950px] flex flex-col items-start relative z-[2]">
        {activeView === 'knowledge' || activeView === 'market' ? null : activeView === 'scheduled' ? (
          <div className="w-full">
            <React.Suspense fallback={<div className="py-10 text-center text-gray-500">加载中…</div>}>
              <ScheduledTasksClient />
            </React.Suspense>
          </div>
        ) : (
          <>
            {/* Home greeting */}
            <div className="bg-none backdrop-blur-none border-none shadow-none p-0 w-full max-w-[950px] leading-relaxed mb-0 self-start rounded-none">
              <div className="text-[13px] text-[#6e6e73] mb-2 font-medium block opacity-80">周四，04:22 PM</div>
              <div className="font-[family-name:var(--font-dancing-script)] text-[24px] font-semibold text-[#1d1d1f] mb-2.5 leading-[1.5] pb-3 border-b border-dashed border-[rgba(0,0,0,0.1)] w-full flex items-center gap-3">
                <img
                  src="/mascot.png"
                  alt="Tbox mascot"
                  className="w-[42px] h-[42px] object-contain flex-shrink-0"
                />
                Hi Lisa，午后好。今天天气真不错，适合深度思考
              </div>
              <div className="text-base text-[#444] pt-0 border-t-0 mt-0 leading-[1.7]">
                昨天的《Q4 推广方案》已经完成，今天会帮你完成本周周报。
              </div>

              {/* Pending Confirmation List */}
              <div className="mt-4 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">以下事项需要您确认</span>
                  {pendingCount > 0 && (
                    <span className="text-[11px] bg-[#ff6b35] text-white px-1.5 py-0.5 rounded-full font-medium leading-none min-w-[18px] text-center">
                      {pendingCount}
                    </span>
                  )}
                  <button
                    onClick={() => setIsListCollapsed(!isListCollapsed)}
                    className="ml-auto flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#333] transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    <span>{isListCollapsed ? '展开' : '收起'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isListCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                </div>
                <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${isListCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col">
                      {/* Item Row */}
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          item.status !== 'pending'
                            ? 'bg-[rgba(0,0,0,0.02)]'
                            : 'bg-[rgba(255,255,255,0.75)] backdrop-blur-sm'
                        }`}
                        style={{
                          boxShadow: item.status === 'pending' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                        }}
                      >
                        {/* Status Indicator */}
                        <div className={`flex-shrink-0 w-[7px] h-[7px] rounded-full ${
                          item.status === 'pending' ? 'bg-[#ff9500]' : item.status === 'confirmed' ? 'bg-[#34c759]' : 'bg-[#007aff]'
                        }`} />

                        {/* Text */}
                        <span className={`flex-1 text-[13.5px] leading-[1.5] transition-all duration-200 ${
                          item.status !== 'pending' ? 'text-[#999]' : 'text-[#333]'
                        }`}>
                          {item.text}
                        </span>

                        {/* Action Buttons */}
                        {item.status === 'pending' && (
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <button
                              onClick={() => handleStartReply(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#666] bg-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.08)] transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              回复
                            </button>
                            <button
                              onClick={() => handleConfirm(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium text-white bg-[#1d1d1f] hover:bg-black transition-colors cursor-pointer"
                            >
                              <Check className="w-3 h-3" strokeWidth={2.5} />
                              确认
                            </button>
                          </div>
                        )}

                        {/* Confirmed Badge */}
                        {item.status === 'confirmed' && (
                          <span className="flex items-center gap-1 text-[11px] text-[#34c759] font-medium flex-shrink-0">
                            <Check className="w-3 h-3" strokeWidth={2.5} />
                            已确认
                          </span>
                        )}

                        {/* Replied Badge */}
                        {item.status === 'replied' && (
                          <span className="flex items-center gap-1 text-[11px] text-[#007aff] font-medium flex-shrink-0">
                            <MessageSquare className="w-3 h-3" />
                            已回复
                          </span>
                        )}
                      </div>

                      {/* Inline Reply Input */}
                      {replyingId === item.id && (
                        <div className="mt-1.5 ml-[19px] flex flex-col gap-2 bg-[rgba(255,255,255,0.85)] backdrop-blur-sm rounded-xl px-4 py-3 border border-[rgba(0,0,0,0.06)]"
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                        >
                          <textarea
                            ref={replyInputRef}
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                            placeholder="输入您的建议或回复..."
                            className="w-full text-[13px] text-[#333] bg-transparent border-none outline-none resize-none leading-[1.6] placeholder:text-[#aaa] min-h-[60px]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply(item.id);
                              }
                              if (e.key === 'Escape') {
                                handleCancelReply();
                              }
                            }}
                          />
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={handleCancelReply}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#666] hover:bg-[rgba(0,0,0,0.05)] transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              取消
                            </button>
                            <button
                              onClick={() => handleSendReply(item.id)}
                              disabled={!replyDraft.trim()}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg text-[12px] font-medium text-white bg-[#1d1d1f] hover:bg-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Send className="w-3 h-3" />
                              发送
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Show reply content after replied */}
                      {item.status === 'replied' && item.replyText && (
                        <div className="mt-1 ml-[19px] px-3.5 py-2 bg-[rgba(0,122,255,0.04)] rounded-lg border border-[rgba(0,122,255,0.08)]">
                          <p className="text-[12px] text-[#555] leading-[1.5] m-0">我的回复：{item.replyText}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Magic Input — with comfortable spacing below greeting */}
            <div className="w-full mt-10">
              <MagicInput onSendMessage={handleMagicInputSend} onOpenMarket={onOpenMarket} />
            </div>
          </>
        )}
      </div>

      {activeView === 'home' && (
      <>
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
      </>
      )}
    </div>
  );
}
