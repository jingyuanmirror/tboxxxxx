'use client';

interface HeaderProps {
  onToggleRightSidebar: () => void;
  isRightSidebarVisible: boolean;
  activeView?: 'home' | 'knowledge' | 'scheduled';
}

export default function Header({ onToggleRightSidebar, isRightSidebarVisible, activeView }: HeaderProps) {
  return (
    <div className="flex justify-between items-center px-10 py-4 flex-shrink-0">
      <div className="logo font-['Dancing_Script'] text-4xl font-semibold text-[#1d1d1f] tracking-normal" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        Tbox
      </div>
      
      <div className="flex items-center gap-5">
        {activeView !== 'knowledge' && (
          <div className="flex items-center gap-2.5">
            <div className="text-sm font-medium text-[#1d1d1f]">通知面板</div>
            <label className="toggle-switch" title="Toggle Sidebar">
              <input 
                type="checkbox" 
                checked={isRightSidebarVisible}
                onChange={onToggleRightSidebar}
                className="hidden"
              />
              <div className={`w-[34px] h-5 rounded-[10px] relative cursor-pointer transition-colors ${isRightSidebarVisible ? 'bg-[#1d1d1f]' : 'bg-[#d1d1d6]'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isRightSidebarVisible ? 'translate-x-[14px]' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>
        )}
        
        <img 
          className="w-8 h-8 rounded-full object-cover shadow-sm" 
          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTd8fHdveG1hbiUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW5sb3x8fHwxNzAzNDQ0MjM1fDA&lib=rb-4.0.3&q=80&w=400" 
          alt="User Avatar" 
        />
        <span className="text-sm text-[#1d1d1f] font-medium">Lisa</span>
      </div>
    </div>
  );
}
