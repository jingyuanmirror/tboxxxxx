'use client';

interface DiscoveryTask {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  view: 'home' | 'knowledge' | 'scheduled' | 'market';
}

interface Props {
  onOpenView: (view: 'home' | 'knowledge' | 'scheduled' | 'market', tab?: 'agents' | 'skills' | 'tasks') => void;
  visitedIds?: string[];
  onVisit?: (id: string) => void;
}

const TASKS: DiscoveryTask[] = [
  {
    id: 'scheduled',
    label: '设置定时任务',
    emoji: '⏰',
    desc: '让 AI 按时自动完成重复工作',
    view: 'scheduled',
  },
  {
    id: 'knowledge',
    label: '上传你的档案',
    emoji: '📂',
    desc: '让我更了解你，回答更精准',
    view: 'knowledge',
  },
  {
    id: 'market',
    label: '逛逛集市',
    emoji: '🛒',
    desc: '发现更多专属 AI 工具和技能',
    view: 'market',
  },
];

export default function DiscoveryTasks({ onOpenView, visitedIds = [], onVisit }: Props) {
  return (
    <div className="w-full mb-4">
      <div className="grid grid-cols-3 gap-2.5">
        {TASKS.map((task) => {
          const visited = visitedIds.includes(task.id);
          return (
            <button
              key={task.id}
              onClick={() => {
                onVisit?.(task.id);
                onOpenView(task.view);
              }}
              className={`flex flex-col items-start gap-1 p-4 rounded-2xl border text-left
                transition-all duration-200 cursor-pointer active:scale-[0.97]
                ${
                  visited
                    ? 'bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.3)]'
                    : 'bg-[rgba(255,255,255,0.8)] border-[rgba(0,0,0,0.07)] hover:border-[rgba(37,99,235,0.3)] hover:bg-[rgba(255,255,255,0.95)]'
                }`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[14px] font-semibold leading-tight ${
                  visited ? 'text-[#16a34a]' : 'text-[#1d1d1f]'
                }`}>
                  {task.label}
                </span>
                {visited && (
                  <span className="text-[10px] font-medium text-[#16a34a] bg-[rgba(34,197,94,0.12)] px-1.5 py-0.5 rounded-full">
                    已访问
                  </span>
                )}
              </div>
              <span className="text-[11.5px] text-[#86868b] leading-snug">{task.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
