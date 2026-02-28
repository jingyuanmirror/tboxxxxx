'use client';

export interface TaskScenario {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  modeKey: string;
  chips: string[];
}

export const TASK_SCENARIOS: TaskScenario[] = [
  {
    id: 'research',
    label: '写个报告',
    emoji: '📊',
    desc: '市场调研、竞品分析都行',
    modeKey: 'web_research',
    chips: [
      '帮我调研2026年新能源汽车市场趋势',
      '整理国内 AI 编程助手的竞品对比分析',
      '写一份关于代餐品牌推广的市场分析报告',
    ],
  },
  {
    id: 'search',
    label: '帮我搜搜',
    emoji: '🔍',
    desc: '热点资讯、数据查询随时找',
    modeKey: 'web_realtime',
    chips: [
      '搜索最近一周 AI 领域的重要新闻',
      '整理今天抖音热门话题和内容趋势',
      '查一下特斯拉最新的销量数据和市场动态',
    ],
  },
  {
    id: 'ppt',
    label: '整个PPT',
    emoji: '📑',
    desc: '路演汇报、培训课件都能做',
    modeKey: 'ppt_roadshow',
    chips: [
      '帮我制作一份 AI SaaS 产品的路演 Deck',
      '做一份 Q1 工作汇报 PPT，突出核心亮点',
      '生成一份新员工入职培训课件',
    ],
  },
  {
    id: 'email',
    label: '写封邮件',
    emoji: '📧',
    desc: '商务沟通、客诉跟进都顺手',
    modeKey: 'mail_business',
    chips: [
      '帮我写一封向潜在合作方介绍产品的商务邮件',
      '写一封催款邮件，语气友好但明确',
      '帮我回复一位客户的投诉，表达歉意并给出方案',
    ],
  },
  {
    id: 'plan',
    label: '搞个方案',
    emoji: '📋',
    desc: '推广活动、运营计划都来吧',
    modeKey: 'general',
    chips: [
      '帮我写一份五一活动的推广方案',
      '制定一个新产品上线的运营计划',
      '规划一场 100 人公司年会的活动方案',
    ],
  },
  {
    id: 'chat',
    label: '随便聊聊',
    emoji: '💬',
    desc: '啥都能问，不用客气',
    modeKey: 'general',
    chips: [
      '帮我想想怎么和老板提加薪',
      '我的 Excel 公式报错了，帮我排查一下',
      '帮我想几个适合 Z 世代的营销口号',
    ],
  },
];

// Map from use-case tags → preferred scenario ids
const USE_CASE_TO_SCENARIO: Record<string, string> = {
  '写方案': 'plan',
  '做报告': 'research',
  '写代码': 'chat',
  '搜信息': 'search',
  '发邮件': 'email',
  '管项目': 'plan',
  '做 PPT': 'ppt',
  '数据分析': 'research',
};

export function getPreferredScenarioIds(useCases: string[]): string[] {
  const ids = useCases.map(u => USE_CASE_TO_SCENARIO[u]).filter(Boolean);
  return [...new Set(ids)];
}

/** Get concrete task chips from the scenarios that match the user's use cases */
export function getPreferredChips(useCases: string[]): string[] {
  const ids = getPreferredScenarioIds(useCases);
  const scenarios = ids.length > 0
    ? TASK_SCENARIOS.filter(s => ids.includes(s.id))
    : TASK_SCENARIOS;
  // Return up to 3 chips from the first matched scenario, then 1 from the next
  const chips: string[] = [];
  scenarios.slice(0, 2).forEach((s, i) => {
    const take = i === 0 ? 3 : 2;
    chips.push(...s.chips.slice(0, take));
  });
  return [...new Set(chips)].slice(0, 4);
}

interface IntroCardProps {
  /** Whether ProfileIntroCard is currently expanded above the grid */
  expanded: boolean;
  onToggle: () => void;
}

interface Props {
  selectedId: string | null;
  onSelect: (scenario: TaskScenario) => void;
  priorityIds?: string[];
  /** When provided, show a "认识一下" collapsed card at the top of the grid */
  introCard?: IntroCardProps;
}

export default function TaskLauncher({ selectedId, onSelect, priorityIds = [], introCard }: Props) {
  // Reorder: priority ids first, then the rest
  const ordered = priorityIds.length > 0
    ? [
        ...TASK_SCENARIOS.filter(s => priorityIds.includes(s.id)),
        ...TASK_SCENARIOS.filter(s => !priorityIds.includes(s.id)),
      ]
    : TASK_SCENARIOS;

  return (
    <div className="w-full mb-4">
      <div className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-[0.6px] mb-3">
        {priorityIds.length > 0 ? '根据你的目标，推荐先试试：' : '你今天想先做哪一件事？'}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {/* "认识一下" intro card — first cell in the grid, same size as scenario cards */}
        {introCard && (
          <button
            onClick={introCard.onToggle}
            className={`
              flex flex-col items-start p-4 rounded-2xl border text-left
              transition-all duration-200 cursor-pointer active:scale-[0.97]
              ${introCard.expanded
                ? 'bg-[rgba(37,99,235,0.07)] border-[rgba(37,99,235,0.4)] shadow-[0_0_0_1px_rgba(37,99,235,0.2)]'
                : 'bg-[rgba(255,255,255,0.8)] border-dashed border-[rgba(37,99,235,0.25)] hover:border-[rgba(37,99,235,0.45)] hover:bg-[rgba(255,255,255,0.95)]'
              }
            `}
            style={{ boxShadow: introCard.expanded ? undefined : '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <span className={`text-[14px] font-semibold leading-tight mb-1 ${introCard.expanded ? 'text-[#2563eb]' : 'text-[#1d1d1f]'}`}>
              先认识一下你 👋
            </span>
            <span className="text-[11.5px] text-[#86868b] leading-snug">填写后我能更好地帮到你</span>
          </button>
        )}

        {ordered.slice(0, introCard ? 5 : ordered.length).map((scenario, idx) => {
          const isSelected = selectedId === scenario.id;
          const isDimmed = selectedId !== null && !isSelected;
          const isPriority = priorityIds.includes(scenario.id);
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={`
                flex flex-col items-start gap-1 p-4 rounded-2xl border text-left
                transition-all duration-200 cursor-pointer
                active:scale-[0.97]
                ${isSelected
                  ? 'bg-[rgba(37,99,235,0.07)] border-[rgba(37,99,235,0.4)] shadow-[0_0_0_1px_rgba(37,99,235,0.2)]'
                  : isPriority
                  ? 'bg-[rgba(255,255,255,0.95)] border-[rgba(37,99,235,0.2)] hover:border-[rgba(37,99,235,0.4)]'
                  : 'bg-[rgba(255,255,255,0.8)] border-[rgba(0,0,0,0.07)] hover:border-[rgba(37,99,235,0.3)] hover:bg-[rgba(255,255,255,0.95)]'
                }
                ${isDimmed ? 'opacity-40' : 'opacity-100'}
              `}
              style={{ boxShadow: isSelected ? undefined : '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              {isPriority && !isSelected && idx < priorityIds.length && (
                <div className="flex items-center w-full mb-0.5">
                  <span className="ml-auto text-[9px] font-bold text-[#2563eb] bg-[rgba(37,99,235,0.1)] px-1.5 py-0.5 rounded-full tracking-wide">推荐</span>
                </div>
              )}
              <span className={`text-[14px] font-semibold leading-tight ${isSelected ? 'text-[#2563eb]' : 'text-[#1d1d1f]'}`}>
                {scenario.label}
              </span>
              <span className="text-[11.5px] text-[#86868b] leading-snug">{scenario.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
