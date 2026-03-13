'use client';

import { useState } from 'react';
import MagicInput from './MagicInput';

// ─── Types ────────────────────────────────────────────────────────────────────

type Grade = 'freshman' | 'sophomore' | 'junior' | 'senior' | 'master' | 'phd' | '';
type Major = 'stem' | 'humanities' | 'business' | 'medical' | 'arts' | 'other' | '';
type Goal  = 'paper' | 'exam' | 'job' | 'presentation' | 'english' | 'other' | '';

interface StudentProfile {
  name: string;
  grade: Grade;
  major: Major;
  goal: Goal;
}

interface DDLItem {
  id: string;
  label: string;
  daysLeft: number;
}

interface TaskChip {
  label: string;
  text: string;
  modeKey?: string;
}

interface TaskScenario {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  chips: TaskChip[];
}

// ─── Student Task Scenarios ───────────────────────────────────────────────────

const ALL_SCENARIOS: TaskScenario[] = [
  {
    id: 'paper',
    label: '写论文 / 作业',
    emoji: '📝',
    desc: '课程论文、实验报告、毕业设计',
    chips: [
      {
        label: '写一篇文献综述',
        text: '请帮我写一篇关于「[主题]」的文献综述，要求：梳理近5年主要研究方向和代表性成果，分析研究现状与争议，指出研究空白，字数约3000字，引用格式使用 GB/T 7714',
        modeKey: 'web',
      },
      {
        label: '生成实验报告',
        text: '请按照标准实验报告格式，帮我撰写一份「[实验名称]」实验报告，包含：实验目的、实验原理、实验装置与步骤、数据记录与处理、误差分析、结论与讨论',
      },
      {
        label: '优化我的论文段落',
        text: '请帮我改写以下段落，使其更符合学术写作规范：逻辑更严密、语言更精准、去除口语化表达，保留原意。[粘贴段落]',
      },
    ],
  },
  {
    id: 'research',
    label: '查资料 / 搜文献',
    emoji: '🔍',
    desc: '学术搜索、知识点解析、题目查证',
    chips: [
      {
        label: '搜索这个领域的最新研究进展',
        text: '请帮我搜索「[研究方向]」近两年的最新研究进展，重点整理：核心研究问题、主流方法、代表性论文（附来源），并用中文总结各篇核心贡献',
        modeKey: 'web',
      },
      {
        label: '解释一个我不懂的知识点',
        text: '请用通俗易懂的方式解释「[知识点名称]」，先给出定义，再举一个具体例子，最后说明它在[学科]中的重要意义',
      },
      {
        label: '帮我找这道题的解题思路',
        text: '请帮我分析以下题目的解题思路，给出详细步骤，并解释每一步的原理：[题目内容]',
      },
    ],
  },
  {
    id: 'ppt',
    label: '做汇报 PPT',
    emoji: '📊',
    desc: '课堂展示、组会汇报、毕业答辩',
    chips: [
      {
        label: '制作课堂展示PPT',
        text: '请帮我制作一份课堂展示 PPT（8-10页），主题是「[主题]」，风格简洁学术，包含：研究背景与意义、核心内容介绍、关键数据/案例、个人观点、参考文献页',
        modeKey: 'ppt',
      },
      {
        label: '做组会进展汇报PPT',
        text: '请帮我制作一份研究组会进展汇报 PPT（6-8页），内容包括：上阶段工作回顾（含数据）、遇到的问题与解决思路、本阶段计划、需要导师指导的问题',
        modeKey: 'ppt',
      },
      {
        label: '生成毕业答辩PPT',
        text: '请帮我生成一份毕业论文答辩 PPT（15页），结构包含：封面、研究背景与动机、研究问题与目标、研究方法、核心实验/案例、结果与发现、结论与展望、致谢页，风格正式学术',
        modeKey: 'ppt',
      },
    ],
  },
  {
    id: 'job',
    label: '实习 / 求职准备',
    emoji: '💼',
    desc: '简历、求职信、面试问答一条龙',
    chips: [
      {
        label: '优化我的简历',
        text: '请帮我优化以下简历，使其更符合「[目标岗位]」的招聘要求：突出相关经历、量化成果数据、优化措辞表达，并指出需要补充的内容。[粘贴简历]',
      },
      {
        label: '写一封求职信',
        text: '请帮我写一封申请「[岗位名称]」的求职信，公司是「[公司名称]」，结合我的背景「[简要描述]」，突出我的核心优势与热情，字数 400-600 字',
      },
      {
        label: '准备面试常见问题',
        text: '请帮我准备「[岗位/行业]」面试的常见问题清单，并给出每道题的回答思路和示例，包括：自我介绍、职业规划、能力类问题、压力测试类问题',
      },
    ],
  },
  {
    id: 'study',
    label: '整理笔记 / 备考',
    emoji: '📖',
    desc: '课堂笔记整理、知识提纲、考前冲刺',
    chips: [
      {
        label: '整理课堂笔记生成提纲',
        text: '请帮我整理以下课堂笔记，生成一份结构清晰的知识提纲：归纳核心概念与定义、梳理知识点之间的逻辑关系、标注重点难点。[粘贴笔记]',
      },
      {
        label: '生成考前复习卡片',
        text: '请根据以下内容，生成20张「问题 - 答案」格式的复习卡片，覆盖核心知识点，问题从简单到复杂排列：[粘贴资料/提纲]',
      },
      {
        label: '帮我制定备考计划',
        text: '我需要在「[X天]」内准备「[科目名称]」考试，复习材料包括「[内容描述]」，请帮我制定每日备考计划，合理分配时间并留出复盘时间',
      },
    ],
  },
  {
    id: 'english',
    label: '学英语 / 英文写作',
    emoji: '🌐',
    desc: '英语写作、学术润色、翻译改写',
    chips: [
      {
        label: '润色我的英文段落',
        text: '请润色以下英文段落，使其更符合学术英语规范：语法正确、表达地道、逻辑清晰，保留原意，并指出主要修改点：[粘贴内容]',
      },
      {
        label: '翻译中文段落为学术英文',
        text: '请将以下中文段落翻译为学术英文，要求：用词准确专业、句式多样、符合该领域写作惯例：[粘贴内容]',
      },
      {
        label: '写英文 Abstract',
        text: '请帮我写一篇英文论文 Abstract，关键词为「[关键词]」，研究内容概述如下：「[内容摘要]」，字数 250 词以内，结构包含：研究背景、目的、方法、主要发现、结论',
      },
    ],
  },
];

const GRADE_SCENARIO_ORDER: Record<string, string[]> = {
  freshman:  ['paper', 'study', 'ppt', 'research', 'english', 'job'],
  sophomore: ['paper', 'study', 'ppt', 'research', 'english', 'job'],
  junior:    ['job', 'paper', 'ppt', 'research', 'study', 'english'],
  senior:    ['paper', 'job', 'ppt', 'research', 'study', 'english'],
  master:    ['paper', 'research', 'ppt', 'english', 'job', 'study'],
  phd:       ['english', 'paper', 'research', 'ppt', 'job', 'study'],
};

function getSortedScenarios(grade: Grade): TaskScenario[] {
  const order = GRADE_SCENARIO_ORDER[grade] ?? ['paper', 'research', 'ppt', 'job', 'study', 'english'];
  return [...ALL_SCENARIOS].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

// ─── Greeting Logic ───────────────────────────────────────────────────────────

const GRADE_LABELS: Record<string, string> = {
  freshman: '大一', sophomore: '大二', junior: '大三',
  senior: '大四', master: '研究生', phd: '博士',
};

function buildStudentGreeting(profile: StudentProfile | null): { title: string; subtitle: string } {
  if (!profile?.grade) {
    return {
      title: '嗨，我是你的 AI 学习搭子 👋',
      subtitle: '帮你搞定论文、查资料、做PPT、备考……告诉我你是几年级的，我来帮你量身定制 ↓',
    };
  }
  const name = profile.name ? `${profile.name}，` : '';
  const gradeLabel = GRADE_LABELS[profile.grade] ?? '';
  switch (profile.grade) {
    case 'freshman':
    case 'sophomore':
      return {
        title: `${name}${gradeLabel}加油！`,
        subtitle: '课堂汇报、作业笔记、学习规划，我来帮你搞定 ↓',
      };
    case 'junior':
      return {
        title: `${name}实习求职季来了`,
        subtitle: '简历打磨、求职信、面试常见问题，先从一件事开始 ↓',
      };
    case 'senior':
      return {
        title: `${name}毕业冲刺阶段，我来陪你冲！`,
        subtitle: '你可能需要我来帮助你完成以下的工作 ↓',
      };
    case 'master':
      return {
        title: `${name}科研路上有我`,
        subtitle: '文献速读、实验报告、组会汇报PPT，交给我 ↓',
      };
    case 'phd':
      return {
        title: `${name}搞学术就找我`,
        subtitle: '英文论文润色、文献精读、投稿 Cover Letter，随时可以开工 ↓',
      };
    default:
      return {
        title: `${name}欢迎来到 Tbox 学生版！`,
        subtitle: '你的 AI 学习搭子，帮你搞定一切学业任务 ↓',
      };
  }
}

// ─── Mock DDL items ───────────────────────────────────────────────────────────

const MOCK_DDLS: DDLItem[] = [
  { id: '1', label: '数据结构课程论文', daysLeft: 3 },
  { id: '2', label: '操作系统期末考试', daysLeft: 12 },
  { id: '3', label: '毕业论文初稿提交', daysLeft: 21 },
];

// ─── Onboarding Component ─────────────────────────────────────────────────────

const GRADE_OPTIONS: { value: Grade; label: string }[] = [
  { value: 'freshman',  label: '大一' },
  { value: 'sophomore', label: '大二' },
  { value: 'junior',    label: '大三' },
  { value: 'senior',    label: '大四（应届）' },
  { value: 'master',    label: '硕士研究生' },
  { value: 'phd',       label: '博士研究生' },
];

const MAJOR_OPTIONS: { value: Major; label: string }[] = [
  { value: 'stem',       label: '工科 / 理科' },
  { value: 'humanities', label: '文科 / 社科' },
  { value: 'business',   label: '商科 / 经管' },
  { value: 'medical',    label: '医学 / 生命科学' },
  { value: 'arts',       label: '艺术 / 设计' },
  { value: 'other',      label: '其他' },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'paper',        label: '论文 / 作业' },
  { value: 'exam',         label: '备考 / 期末' },
  { value: 'job',          label: '实习 / 求职' },
  { value: 'presentation', label: '课堂汇报' },
  { value: 'english',      label: '学英语 / 写作' },
  { value: 'other',        label: '其他' },
];

interface OnboardingCardProps {
  onComplete: (profile: StudentProfile) => void;
  onSkip: () => void;
}

function OnboardingCard({ onComplete, onSkip }: OnboardingCardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName]   = useState('');
  const [grade, setGrade] = useState<Grade>('');
  const [major, setMajor] = useState<Major>('');
  const [goal, setGoal]   = useState<Goal>('');

  const handleNext = () => {
    if (step === 1 && grade) setStep(2);
    else if (step === 2 && major) setStep(3);
    else if (step === 3 && goal) onComplete({ name, grade, major, goal });
  };

  const canNext = step === 1 ? !!grade : step === 2 ? !!major : !!goal;

  return (
    <div className="w-full rounded-2xl border-2 border-dashed border-[rgba(34,197,94,0.3)] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] p-6 mb-6" style={{ boxShadow: '0 4px 24px rgba(34,197,94,0.08)' }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">先认识一下你 🎓</h3>
          <p className="text-[13px] text-[#86868b]">回答 3 个问题，帮我为你定制学习建议</p>
        </div>
        <div className="flex items-center gap-2">
          {([1, 2, 3] as const).map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-[#16a34a]' : 'bg-[#e5e7eb]'}`} />
          ))}
        </div>
      </div>

      {/* Step 1: Name + Grade */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <label className="flex-shrink-0 text-[13.5px] font-semibold text-[#1d1d1f] whitespace-nowrap">怎么称呼你？</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：小明"
              className="flex-1 px-3.5 py-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white text-[13.5px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[rgba(22,163,74,0.12)]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] mb-2 block">你现在是几年级？</label>
            <div className="flex flex-wrap gap-2">
              {GRADE_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setGrade(o.value)}
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-medium border transition-all cursor-pointer ${grade === o.value ? 'border-[#16a34a] bg-[rgba(22,163,74,0.09)] text-[#16a34a]' : 'border-[rgba(0,0,0,0.1)] text-[#6a6e73] hover:border-[#16a34a] hover:text-[#16a34a]'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Major */}
      {step === 2 && (
        <div>
          <label className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] mb-2 block">你的专业大方向是？</label>
          <div className="flex flex-wrap gap-2">
            {MAJOR_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setMajor(o.value)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-medium border transition-all cursor-pointer ${major === o.value ? 'border-[#16a34a] bg-[rgba(22,163,74,0.09)] text-[#16a34a]' : 'border-[rgba(0,0,0,0.1)] text-[#6a6e73] hover:border-[#16a34a] hover:text-[#16a34a]'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Goal */}
      {step === 3 && (
        <div>
          <label className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.5px] mb-2 block">最近最想搞定哪件事？</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setGoal(o.value)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-medium border transition-all cursor-pointer ${goal === o.value ? 'border-[#16a34a] bg-[rgba(22,163,74,0.09)] text-[#16a34a]' : 'border-[rgba(0,0,0,0.1)] text-[#6a6e73] hover:border-[#16a34a] hover:text-[#16a34a]'}`}>
              {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="px-5 py-2 rounded-xl bg-[#16a34a] text-white text-[13.5px] font-semibold transition-all hover:bg-[#15803d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {step === 3 ? '完成，开始吧！' : '下一步'}
        </button>
        <button onClick={onSkip} className="text-[13px] text-[#a1a1a6] hover:text-[#555] transition-colors cursor-pointer">
          跳过
        </button>
      </div>
    </div>
  );
}

// ─── DDL Banner ───────────────────────────────────────────────────────────────

function DDLBanner({ items }: { items: DDLItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="w-full flex items-center gap-3 rounded-xl bg-white/75 backdrop-blur-sm border border-[rgba(0,0,0,0.06)] px-3.5 py-2.5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] font-semibold text-[#a1a1a6] whitespace-nowrap flex-shrink-0">近期DDL</span>
      <div className="flex items-center gap-2 flex-wrap">
        {items.map(item => (
          <span key={item.id} className={`inline-flex items-center gap-1.5 text-[12px] px-2.5 py-0.5 rounded-lg whitespace-nowrap ${
            item.daysLeft <= 3 ? 'bg-[rgba(239,68,68,0.07)] text-[#dc2626]' :
            item.daysLeft <= 7 ? 'bg-[rgba(234,179,8,0.08)] text-[#ca8a04]' :
            'bg-[rgba(0,0,0,0.04)] text-[#6a6e73]'
          }`}>
            <span className="font-medium">{item.label}</span>
            <span className="opacity-40">·</span>
            <span className="font-semibold">{item.daysLeft <= 0 ? '今天截止' : `${item.daysLeft}天后`}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Scenario Card Grid ───────────────────────────────────────────────────────

function ScenarioGrid({
  scenarios, selectedId, onSelect,
}: {
  scenarios: TaskScenario[];
  selectedId: string | null;
  onSelect: (s: TaskScenario) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {scenarios.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className={`text-left rounded-xl p-3.5 border transition-all cursor-pointer ${
            selectedId === s.id
              ? 'border-[#16a34a] bg-[rgba(22,163,74,0.08)] shadow-sm'
              : 'border-[rgba(0,0,0,0.07)] bg-white/70 hover:border-[rgba(22,163,74,0.35)] hover:bg-white'
          }`}
          style={{ boxShadow: selectedId === s.id ? '0 2px 12px rgba(22,163,74,0.12)' : '0 1px 6px rgba(0,0,0,0.03)' }}
        >
          <div className={`text-[13px] font-semibold mb-0.5 ${selectedId === s.id ? 'text-[#16a34a]' : 'text-[#1d1d1f]'}`}>{s.label}</div>
          <div className="text-[11.5px] text-[#8e8e93] leading-snug">{s.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Chip Hints ───────────────────────────────────────────────────────────────

function ChipHints({ chips, onSelect }: { chips: TaskChip[]; onSelect: (text: string, modeKey?: string) => void }) {
  return (
    <div className="w-full rounded-2xl border border-[rgba(22,163,74,0.14)] bg-[rgba(255,255,255,0.78)] px-4 py-3.5">
      <div className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-[0.5px] mb-2.5">推荐快速启动</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {chips.map(chip => (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.text, chip.modeKey)}
            className="text-left px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(0,0,0,0.07)] text-[13px] text-[#1d1d1f] hover:border-[#16a34a] hover:bg-[rgba(22,163,74,0.04)] transition-all cursor-pointer"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StudentHomeProps {
  onOpenChat: (message: string) => void;
  onOpenMarket?: (tab: 'agents' | 'skills') => void;
}

function getCurrentDateLabel() {
  const now = new Date();
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const day = days[now.getDay()];
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const period = now.getHours() < 12 ? 'AM' : 'PM';
  const h12 = now.getHours() % 12 || 12;
  return `${day}，${h12.toString().padStart(2, '0')}:${m} ${period}`;
}

export default function StudentHome({ onOpenChat, onOpenMarket }: StudentHomeProps) {
  const [profile, setProfile]   = useState<StudentProfile | null>(null);
  const [skipped, setSkipped]   = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<TaskScenario | null>(null);
  const [prefillValue, setPrefillValue] = useState('');
  const [prefillMode, setPrefillMode]   = useState('');

  const saveProfile = (p: StudentProfile) => {
    setProfile(p);
  };

  const handleSkip = () => {
    setSkipped(true);
  };

  const greeting  = buildStudentGreeting(profile);
  const scenarios = getSortedScenarios(profile?.grade ?? '');

  const showOnboarding = !profile && !skipped;

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;
    onOpenChat(msg);
  };

  const handlePrefill = (text: string, modeKey?: string) => {
    setPrefillValue(text);
    setPrefillMode(modeKey ?? '');
  };

  const handleScenarioSelect = (s: TaskScenario) => {
    setSelectedScenario(prev => prev?.id === s.id ? null : s);
  };

  return (
    <div className="w-full flex flex-col pb-10">
      {/* Hero Greeting — matches expert mode style */}
      <div className="bg-none backdrop-blur-none border-none shadow-none p-0 w-full max-w-[950px] leading-relaxed mb-1 self-start rounded-none">
        <div className="text-[13px] text-[#6e6e73] mb-2 font-medium block opacity-80">{getCurrentDateLabel()}</div>
        <div className="font-[family-name:var(--font-dancing-script)] text-[24px] font-semibold text-[#1d1d1f] mb-2.5 leading-[1.5] pb-3 border-b border-dashed border-[rgba(0,0,0,0.1)] w-full flex items-center gap-3">
          <img src="/mascot.png" alt="Tbox" className="w-[42px] h-[42px] object-contain flex-shrink-0" />
          {greeting.title}
        </div>
        <div className="text-base text-[#444] pt-0 border-t-0 mt-0 leading-[1.7]">
          {greeting.subtitle}
        </div>
      </div>

      {/* Onboarding Card */}
      {showOnboarding && <OnboardingCard onComplete={saveProfile} onSkip={handleSkip} />}

      {!showOnboarding && (
        <>
          <div className="w-full mt-3 mb-4">
            <DDLBanner items={MOCK_DDLS} />
          </div>

          <div className="text-[13px] font-medium text-[#8e8e93] mb-2">我可以帮你做这些事</div>

          {/* Scenario Grid */}
          <ScenarioGrid
            scenarios={scenarios}
            selectedId={selectedScenario?.id ?? null}
            onSelect={handleScenarioSelect}
          />

          {/* Chip Hints when scenario selected */}
          {selectedScenario && (
            <div className="w-full mt-3 mb-1">
              <ChipHints chips={selectedScenario.chips} onSelect={handlePrefill} />
            </div>
          )}
        </>
      )}

      {/* Input Area — full-size, matches expert mode spacing */}
      <div className="w-full mt-6">
        <MagicInput
          onSendMessage={handleSend}
          onOpenMarket={onOpenMarket}
          prefillValue={prefillValue}
          prefillMode={prefillMode}
        />
      </div>

      {/* Footer hint — matches expert mode footer style */}
      <div
        className="mt-3 mb-[30px] text-[#86868b] text-xs text-center leading-tight max-w-[600px] self-center"
        style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
      >
        告诉我你的学习需求，越具体越好 — Tbox 为你量身定制
      </div>
    </div>
  );
}
