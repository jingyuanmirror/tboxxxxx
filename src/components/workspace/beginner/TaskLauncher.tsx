'use client';

export interface TaskChip {
  /** Short label shown in the suggestion list */
  label: string;
  /** Detailed prompt filled into the input box on click */
  text: string;
  /** iconKey of the MagicInput mode to activate (ppt | web | excel | code | mail) */
  modeKey?: string;
}

export interface TaskScenario {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  modeKey: string;
  chips: TaskChip[];
}

export const TASK_SCENARIOS: TaskScenario[] = [
  {
    id: 'research',
    label: '写个报告',
    emoji: '📊',
    desc: '市场调研、竞品分析都行',
    modeKey: 'web_research',
    chips: [
      {
        label: '调研新能源汽车市场趋势',
        text: '帮我调研2026年新能源汽车市场趋势，重点分析市场规模与增速、主要玩家竞争格局（比亚迪/特斯拉/华为）、纯电与混动技术路线对比，以及消费者核心购买因素，输出结构清晰的分析报告',
        modeKey: 'web',
      },
      {
        label: '整理 AI 编程助手竞品对比',
        text: '请对国内 AI 编程助手市场做竞品对比分析，重点覆盖 GitHub Copilot、Cursor、通义灵码、Marscode，从功能完整度、定价策略、用户口碑、适用场景四个维度对比，并给出针对独立开发者的选型建议',
        modeKey: 'web',
      },
      {
        label: '写代餐品牌推广市场分析报告',
        text: '帮我撰写一份代餐市场品牌分析报告，包括行业背景与规模、目标人群画像（健身/减脂/白领）、主流品牌（若饭/Smeal/ffit8）的产品策略与营销打法对比，以及2026年市场机会判断',
        modeKey: 'web',
      },
    ],
  },
  {
    id: 'search',
    label: '帮我搜搜',
    emoji: '🔍',
    desc: '热点资讯、数据查询随时找',
    modeKey: 'web_realtime',
    chips: [
      {
        label: '搜索最近一周 AI 领域重要新闻',
        text: '请实时搜索过去7天 AI 领域的重要事件，包括新产品发布、大额融资、政策动向、技术突破，每条附来源链接并写一句关键洞察，按重要性从高到低排列',
        modeKey: 'web',
      },
      {
        label: '整理今天抖音热门话题和内容趋势',
        text: '帮我整理今日抖音、微博、小红书三个平台的热门话题，分析当前内容消费趋势和用户情绪，识别出适合品牌借势的 2-3 个内容方向并给出选题建议',
        modeKey: 'web',
      },
      {
        label: '查特斯拉最新销量数据和市场动态',
        text: '查询特斯拉最新季度在全球及中国市场的交付量数据，同步对比比亚迪、理想、小鹏同期数据，分析各家市场份额变化及背后原因',
        modeKey: 'web',
      },
    ],
  },
  {
    id: 'ppt',
    label: '整个PPT',
    emoji: '📑',
    desc: '路演汇报、培训课件都能做',
    modeKey: 'ppt_roadshow',
    chips: [
      {
        label: '帮我制作一份 AI SaaS 产品的路演 Deck',
        text: '请帮我制作一份 AI SaaS 产品的融资路演 Deck（12页），结构依次为：封面、核心痛点、解决方案、产品演示截图、市场规模（TAM/SAM/SOM）、商业模式、竞争壁垒、现有客户与数据、团队介绍、里程碑与融资用途',
        modeKey: 'ppt',
      },
      {
        label: '做一份 Q1 工作汇报 PPT，突出核心亮点',
        text: '帮我制作一份 Q1 工作汇报 PPT（10页），风格简洁专业，包含：关键指标大图、重点项目进展甘特图、未达成目标及原因分析、Q2 核心计划与资源诉求，每页配讲师备注',
        modeKey: 'ppt',
      },
      {
        label: '生成一份新员工入职培训课件',
        text: '生成一份新员工入职培训课件（12页），内容覆盖：公司使命与文化价值观、产品核心逻辑与用户故事、常用工具与工作流程、跨部门协作规范、常见 FAQ 及联系人，每页有清晰的视觉重点',
        modeKey: 'ppt',
      },
    ],
  },
  {
    id: 'email',
    label: '写封邮件',
    emoji: '📧',
    desc: '商务沟通、客诉跟进都顺手',
    modeKey: 'mail_business',
    chips: [
      {
        label: '写一封向潜在合作方介绍产品的商务邮件',
        text: '帮我写一封 B2B 合作邀约邮件，向目标方简要介绍我们的产品价值（帮助企业提升工作效率40%、已服务200+客户），主动提出安排15分钟在线 demo，语气专业有温度，结尾附上日程预约链接占位',
        modeKey: 'mail',
      },
      {
        label: '写一封催款邮件，语气友好但明确',
        text: '写一封应收账款催款提醒邮件，说明合同编号、款项金额和约定付款日期，语气礼貌但立场明确，注明逾期超过10天将启动正式催收流程，并请对方确认处理时间',
        modeKey: 'mail',
      },
      {
        label: '回复一位客户的投诉，表达歉意并给出方案',
        text: '帮我回复一位因产品关键功能缺失而投诉的客户邮件，表达真诚歉意，说明该功能已在开发中预计6周内上线，作为补偿提供3个月延期服务或9折续费优惠，请求客户确认方案',
        modeKey: 'mail',
      },
    ],
  },
  {
    id: 'plan',
    label: '搞个方案',
    emoji: '📋',
    desc: '推广活动、运营计划都来吧',
    modeKey: 'general',
    chips: [
      {
        label: '帮我写一份五一活动的推广方案',
        text: '帮我制定一份五一假期（5天）的品牌社媒整合营销方案，包含节日借势主题创意、各平台内容矩阵（小红书图文/抖音短视频/微信朋友圈）、KOL 合作层级建议、整体预算分配及 ROI 衡量指标',
      },
      {
        label: '制定一个新产品上线的运营计划',
        text: '为新产品上线制定一份30天冷启动运营计划，分三阶段：第1-10天（种子用户邀请与内测反馈）、第11-20天（裂变活动设计与社群运营）、第21-30天（付费转化与留存优化），每阶段明确核心 KPI',
      },
      {
        label: '规划一场 100 人公司年会的活动方案',
        text: '规划一场100人规模的公司年会，包括：场地类型建议与预算区间、流程设计（开场视频/领导致辞/颁奖/才艺表演/互动游戏/抽奖）、供应商采购清单、以及30天倒计时筹备时间表',
      },
    ],
  },
  {
    id: 'chat',
    label: '随便聊聊',
    emoji: '💬',
    desc: '啥都能问，不用客气',
    modeKey: 'general',
    chips: [
      {
        label: '帮我想想怎么和老板提加薪',
        text: '我想和老板谈加薪，帮我分析当前谈判的最佳时机和策略，并准备一套话术框架：如何用数据展示过去半年贡献、如何表达薪资期望区间、以及应对"现在预算紧张"等常见反驳的回应方式',
      },
      {
        label: '我的 Excel 公式报错了，帮我排查一下',
        text: '我的 Excel VLOOKUP 公式报错 #N/A，数据表有两个 Sheet，查找列是文本型的客户ID，请帮我排查可能原因（格式不匹配/空格/大小写等）并给出修正后的公式或替代方案',
      },
      {
        label: '帮我想几个适合 Z 世代的营销口号',
        text: '请为一款面向18-28岁Z世代的新派茶饮品牌生成10条营销口号，要求：有网感、接地气、适合小红书和抖音传播，避免老套鸡汤风格，最好能引发自发分享欲',
      },
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
export function getPreferredChips(useCases: string[]): TaskChip[] {
  const ids = getPreferredScenarioIds(useCases);
  const scenarios = ids.length > 0
    ? TASK_SCENARIOS.filter(s => ids.includes(s.id))
    : TASK_SCENARIOS;
  // Return up to 3 chips from the first matched scenario, then 2 from the next
  const chips: TaskChip[] = [];
  scenarios.slice(0, 2).forEach((s, i) => {
    const take = i === 0 ? 3 : 2;
    chips.push(...s.chips.slice(0, take));
  });
  return chips.slice(0, 4);
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
  /** When true, show the "让咱们一起开启新手体验" header text */
  showIntroHeader?: boolean;
  /** When provided, show a "认识一下" collapsed card at the top of the grid */
  introCard?: IntroCardProps;
}

export default function TaskLauncher({ selectedId, onSelect, priorityIds = [], showIntroHeader = false, introCard }: Props) {
  // Reorder: priority ids first, then the rest
  const ordered = priorityIds.length > 0
    ? [
        ...TASK_SCENARIOS.filter(s => priorityIds.includes(s.id)),
        ...TASK_SCENARIOS.filter(s => !priorityIds.includes(s.id)),
      ]
    : TASK_SCENARIOS;

  // When introCard is present we have 6 slots total (introCard + 5 scenarios).
  // Always keep 'chat' (随便聊聊) as the last scenario card.
  const chatScenario = TASK_SCENARIOS.find(s => s.id === 'chat')!;
  const displayScenarios = introCard
    ? [...ordered.filter(s => s.id !== 'chat').slice(0, 4), chatScenario]
    : ordered;

  return (
    <div className="w-full mb-4">
      {(showIntroHeader || priorityIds.length > 0) && (
        <div className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-[0.6px] mb-3">
          {priorityIds.length > 0
            ? '根据你的目标，推荐先试试：'
            : '让咱们一起开启新手体验吧～今天想先做哪一件事？'}
        </div>
      )}
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
              先让我认识一下你 👋
            </span>
            <span className="text-[11.5px] text-[#86868b] leading-snug">填写后我能更好地帮到你</span>
          </button>
        )}

        {displayScenarios.map((scenario, idx) => {
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
