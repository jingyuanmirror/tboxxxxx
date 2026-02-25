'use client';

import { useState } from 'react';
import Header from '@/components/workspace/Header';
import LeftSidebar from '@/components/workspace/LeftSidebar';
import CenterMain from '@/components/workspace/CenterMain';
import RightSidebar from '@/components/workspace/RightSidebar';

export default function Home() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [activeView, setActiveView] = useState<'home'|'knowledge'|'scheduled'>('home');

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
      {!isChatOpen && (
        <Header 
          onToggleRightSidebar={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
          isRightSidebarVisible={isRightSidebarVisible}
        />
      )}
      
      <div className={`flex flex-1 ${isChatOpen ? 'h-screen' : 'h-[calc(100vh-70px)]'} max-w-[1750px] mx-auto w-full overflow-hidden`}>
        <LeftSidebar 
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          onOpenView={(v) => setActiveView(v)}
        />

        <CenterMain
          isLeftSidebarCollapsed={isLeftSidebarCollapsed}
          activeView={activeView}
          onCloseScheduledTasks={() => setActiveView('home')}
          isChatOpen={isChatOpen}
          chatInitialMessage={chatInitialMessage}
          onOpenChat={handleOpenChat}
          onCloseChat={handleCloseChat}
        />
        
        {!isChatOpen && <RightSidebar isVisible={isRightSidebarVisible} />}
      </div>
    </div>
  );
}

