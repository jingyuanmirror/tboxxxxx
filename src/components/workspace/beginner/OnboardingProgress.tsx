'use client';

import type { OnboardingStage } from '@/lib/useOnboarding';

const STEPS = [
  { id: 'intro',    label: '认识一下',     stages: ['introduced', 'first_task_started', 'first_task_done', 'growing'] },
  { id: 'task',     label: '完成第一件事', stages: ['first_task_done', 'growing'] },
  { id: 'discover', label: '解锁更多玩法', stages: ['growing'] },
] as const;

interface Props {
  stage: OnboardingStage;
}

export default function OnboardingProgress({ stage }: Props) {
  const stageOrder: OnboardingStage[] = [
    'new_user', 'introduced', 'first_task_started', 'first_task_done', 'growing',
  ];
  const currentIdx = stageOrder.indexOf(stage);

  return (
    <div className="w-full mt-6 mb-2">
      <div className="flex items-center gap-0 w-full">
        {STEPS.map((step, i) => {
          const isDone = step.stages.includes(stage as never);
          const isActive = !isDone && (
            (step.id === 'intro' && currentIdx >= 0 && currentIdx < 2) ||
            (step.id === 'task' && (currentIdx === 2 || currentIdx === 3)) ||
            (step.id === 'discover' && currentIdx === 4)
          );

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone
                      ? 'bg-[#22c55e] border-[#22c55e]'
                      : isActive
                      ? 'bg-white border-[#2563eb]'
                      : 'bg-white border-[#e5e7eb]'
                  }`}
                >
                  {isDone ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#2563eb]' : 'bg-[#d1d5db]'}`} />
                  )}
                </div>
                <span className={`text-[11px] font-medium whitespace-nowrap ${
                  isDone ? 'text-[#22c55e]' : isActive ? 'text-[#2563eb]' : 'text-[#9ca3af]'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mb-5 mx-1 rounded-full overflow-hidden bg-[#e5e7eb]">
                  <div
                    className="h-full bg-[#22c55e] transition-all duration-500"
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
