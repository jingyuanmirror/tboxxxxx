'use client';

import { useState } from 'react';
import Header from '@/components/workspace/Header';
import LeftSidebar from '@/components/workspace/LeftSidebar';
import CenterMain from '@/components/workspace/CenterMain';
import RightSidebar from '@/components/workspace/RightSidebar';

export default function Home() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [activeView, setActiveView] = useState<'home'|'knowledge'|'scheduled'|'market'|'mytools'|'topicSpace'>('home');
  const [marketInitialTab, setMarketInitialTab] = useState<'agents'|'skills'|'tasks'|undefined>(undefined);
  const [activeSpaceId, setActiveSpaceId] = useState<string | undefined>(undefined);
  const [appMode, setAppMode] = useState<'normal' | 'beginner' | 'openclaw' | 'student'>('normal');

  // Chat state lifted here so Header & RightSidebar can be hidden
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  const handleOpenChat = (message: string) => {
    setChatInitialMessage(message);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatInitialMessage('');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f2f4f6]">
      {!isChatOpen && activeView !== 'knowledge' && activeView !== 'market' && activeView !== 'mytools' && activeView !== 'topicSpace' && (
        <Header 
          onToggleRightSidebar={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
          isRightSidebarVisible={isRightSidebarVisible}
          activeView={activeView}
        />
      )}
      
      <div className={`flex flex-1 ${isChatOpen || activeView === 'knowledge' || activeView === 'market' || activeView === 'mytools' || activeView === 'topicSpace' ? 'h-screen' : 'h-[calc(100vh-70px)]'} max-w-[1750px] mx-auto w-full overflow-hidden`}>
        <LeftSidebar 
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          appMode={appMode}
          onSelectMode={(m) => setAppMode(m)}
          onOpenView={(v, tab, spaceId) => {
            // Close chat when navigating via sidebar
            if (isChatOpen) handleCloseChat();
            // ensure initial tab is set before switching view so MarketView mounts with correct tab
            if (v === 'market' && tab) setMarketInitialTab(tab);
            else setMarketInitialTab(undefined);
            if (v === 'topicSpace' && spaceId) setActiveSpaceId(spaceId);
            setActiveView(v as 'home'|'knowledge'|'scheduled'|'market'|'mytools'|'topicSpace');
          }}
        />

        <CenterMain
          isLeftSidebarCollapsed={isLeftSidebarCollapsed}
          activeView={activeView}
          activeSpaceId={activeSpaceId}
          marketInitialTab={marketInitialTab}
          appMode={appMode}
          onCloseScheduledTasks={() => setActiveView('home')}
          isChatOpen={isChatOpen}
          chatInitialMessage={chatInitialMessage}
          onOpenChat={handleOpenChat}
          onCloseChat={handleCloseChat}
          onNavigateTo={(v, tab) => {
            if (v === 'market' && tab) setMarketInitialTab(tab as 'agents' | 'skills' | 'tasks');
            else setMarketInitialTab(undefined);
            setActiveView(v);
          }}
          onOpenMarket={(tab) => {
            setMarketInitialTab(tab);
            setActiveView('market');
          }}
        />
        
        {!isChatOpen && activeView !== 'knowledge' && activeView !== 'market' && activeView !== 'mytools' && activeView !== 'topicSpace' && (appMode === 'normal' || appMode === 'student') && <RightSidebar isVisible={isRightSidebarVisible} />}
      </div>
    </div>
  );
}

