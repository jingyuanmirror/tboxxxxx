'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/lib/useOnboarding';
import ProfileIntroCard from './beginner/ProfileIntroCard';
import TaskLauncher, { getPreferredScenarioIds, getPreferredChips, type TaskScenario } from './beginner/TaskLauncher';
import SmartInputHints from './beginner/SmartInputHints';
import MagicInput from './MagicInput';
import UnlockBanner from './beginner/UnlockBanner';
import type { UserProfile } from '@/lib/useOnboarding';

function buildGreeting(stage: string, profile: UserProfile | null, introSkipped: boolean): { title: string; subtitle: string } {
  if (profile?.name && profile?.occupation) {
    const occupationMap: Record<string, string> = {
      '产品经理': '作为一位产品经理，PRD、竞品分析、需求梳理，我都能帮你搞定。',
      '运营': '运营日常确实很忙——内容选题、活动方案、数据分析，交给我试试。',
      '销售': '客户跟进、商务邮件、方案准备，我来帮你节省时间，专注成交。',
      '创业者': '从市场调研到路演 Deck，我是你最省心的 AI 合伙人。',
      '市场/品牌': '品牌策划、推广方案、内容创作，我们一起把故事讲好。',
      '研究员': '文献整理、数据分析、报告撰写，我来处理繁琐的信息工作。',
      '设计师': '创意文案、需求对接、竞品灵感，我来配合你的设计思维。',
      '工程师': '代码审查、文档生成、技术调研，把这些杂事交给我。',
      '学生': '论文资料、课程笔记、学习规划，我是你的 AI 学习搭子。',
    };
    return {
      title: `嗨 ${profile.name}，欢迎来到 Tbox！`,
      subtitle: occupationMap[profile.occupation] ?? '我已经准备好帮你处理日常琐事了。来尝试一件事吧 ↓',
    };
  }
  if (profile?.name) {
    return {
      title: `嗨 ${profile.name}，很高兴认识你！`,
      subtitle: '告诉我你平时主要做什么，我可以为你量身定制建议。',
    };
  }
  if (introSkipped) {
    return {
      title: '嗨，我是 Tbox 👋',
      subtitle: '你的 AI 工作搭子，专门帮你处理那些繁琐但重要的事。来，选一件你想做的事 ↓',
    };
  }
  return {
    title: '嗨，我是 Tbox 👋',
    subtitle: '你的 AI 搭子，专门帮你处理那些繁琐但重要的事，今后请多多指教',
  };
}

interface BeginnerHomeProps {
  onOpenChat: (message: string) => void;
  onOpenView?: (view: 'home' | 'knowledge' | 'scheduled' | 'market', tab?: 'agents' | 'skills' | 'tasks') => void;
}

export default function BeginnerHome({ onOpenChat, onOpenView }: BeginnerHomeProps) {
  const {
    stage, profile, introSkipped,
    saveProfile, skipIntro, markTaskStarted, markTaskDone,
  } = useOnboarding();

  const { selectedModel: _unusedModelRef } = { selectedModel: null } as never;

  const [selectedScenario, setSelectedScenario] = useState<TaskScenario | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [liveUseCases, setLiveUseCases] = useState<string[]>([]);
  const [liveOccupation, setLiveOccupation] = useState('');
  const [introExpanded, setIntroExpanded] = useState(false);
  const [prefillValue, setPrefillValue] = useState('');
  const [prefillMode, setPrefillMode] = useState('');

  const handlePrefill = (text: string, modeKey?: string) => {
    setPrefillValue(text);
    setPrefillMode(modeKey ?? '');
  };

  const OCCUPATION_USE_CASES: Record<string, string[]> = {
    '产品经理': ['写方案', '做报告', '搜信息'],
    '运营':    ['写方案', '做报告', '做 PPT'],
    '销售':    ['发邮件', '写方案', '搜信息'],
    '创业者':  ['做报告', '做 PPT', '写方案'],
    '市场/品牌': ['写方案', '做 PPT', '做报告'],
    '研究员':  ['做报告', '数据分析', '搜信息'],
    '设计师':  ['搜信息', '写方案', '做 PPT'],
    '工程师':  ['写代码', '搜信息', '做报告'],
    '学生':    ['搜信息', '做报告', '写方案'],
  };

  // Show unlock banner when first_task_done triggers
  useEffect(() => {
    if (stage === 'first_task_done' || stage === 'growing') {
      setShowBanner(true);
    }
  }, [stage]);

  const handleScenarioSelect = (scenario: TaskScenario) => {
    if (scenario.id === 'chat') {
      handleSend('我想随便聊聊先');
      return;
    }
    setSelectedScenario(prev => prev?.id === scenario.id ? null : scenario);
  };

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;
    markTaskStarted();
    onOpenChat(msg);
    setTimeout(() => markTaskDone(selectedScenario?.id ?? 'chat'), 1000);
  };

  const showIntroCard = stage === 'new_user' && !introSkipped;
  const greeting = buildGreeting(stage, profile, introSkipped);

  return (
    <div className="w-full max-w-[950px] mx-auto flex flex-col pb-10">
      {/* ── Hero greeting ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <img src="/mascot.png" alt="Tbox" className="w-10 h-10 object-contain flex-shrink-0" />
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] leading-tight">
            {greeting.title}
          </h1>
        </div>
        <p className="text-[14px] text-[#6e6e73] leading-[1.7] pl-[52px]">
          {greeting.subtitle}
        </p>
      </div>

      {/* ── Profile intro card: shown when user clicked "先认识一下" in the grid ── */}
      {showIntroCard && introExpanded && (
        <div className="mb-4">
          <ProfileIntroCard
            defaultName="Lisa"
            onSave={(p: UserProfile) => { saveProfile(p); setIntroExpanded(false); }}
            onSkip={() => { skipIntro(); setIntroExpanded(false); }}
            onClose={() => setIntroExpanded(false)}
            onUseCasesChange={setLiveUseCases}
            onOccupationChange={setLiveOccupation}
          />
          {/* Task suggestions appear when occupation or use cases are selected */}
          {(liveUseCases.length > 0 || liveOccupation) && (
            <SmartInputHints
              chips={getPreferredChips(liveUseCases.length > 0 ? liveUseCases : (OCCUPATION_USE_CASES[liveOccupation] ?? []))}
              onSelect={(text, modeKey) => {
                setIntroExpanded(false);
                handlePrefill(text, modeKey);
              }}
            />
          )}
        </div>
      )}

      {/* Task Launcher — hidden while intro card is open */}
      {!introExpanded && (
        <TaskLauncher
          selectedId={selectedScenario?.id ?? null}
          onSelect={handleScenarioSelect}
          priorityIds={getPreferredScenarioIds(profile?.useCases ?? liveUseCases)}
          introCard={showIntroCard ? { expanded: introExpanded, onToggle: () => setIntroExpanded(e => !e) } : undefined}
        />
      )}

      {/* Smart Input Area */}
      <div className="w-full mt-2">
        {/* Hint chips: shown when a scenario is selected — clicking fills the input */}
        {selectedScenario && (
          <SmartInputHints
            chips={selectedScenario.chips}
            onSelect={(text, modeKey) => handlePrefill(text, modeKey)}
          />
        )}

        <MagicInput
          compact
          onSendMessage={handleSend}
          prefillValue={prefillValue}
          prefillMode={prefillMode}
        />

        <p className="text-[11.5px] text-[#a1a1a6] mt-2 text-center">
          告诉我你的需求，越具体越好 · 按 Enter 发送
        </p>
      </div>

      {/* Unlock Banner */}
      {showBanner && (
        <UnlockBanner
          onDismiss={() => setShowBanner(false)}
          onOpenScheduled={() => { setShowBanner(false); onOpenView?.('scheduled'); }}
          onOpenKnowledge={() => { setShowBanner(false); onOpenView?.('knowledge'); }}
          onOpenMarket={() => { setShowBanner(false); onOpenView?.('market'); }}
          onTryAnother={() => { setShowBanner(false); setSelectedScenario(null); }}
        />
      )}
    </div>
  );
}
