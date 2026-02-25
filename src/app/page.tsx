'use client';

import { useState } from 'react';
import Header from '@/components/workspace/Header';
import LeftSidebar from '@/components/workspace/LeftSidebar';
import CenterMain from '@/components/workspace/CenterMain';
import RightSidebar from '@/components/workspace/RightSidebar';

export default function Home() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f2f4f6]">
      <Header 
        onToggleRightSidebar={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
        isRightSidebarVisible={isRightSidebarVisible}
      />
      
      <div className="flex flex-1 h-[calc(100vh-70px)] max-w-[1750px] mx-auto w-full overflow-hidden">
        <LeftSidebar 
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        />
        
        <CenterMain isLeftSidebarCollapsed={isLeftSidebarCollapsed} />
        
        <RightSidebar isVisible={isRightSidebarVisible} />
      </div>
    </div>
  );
}

