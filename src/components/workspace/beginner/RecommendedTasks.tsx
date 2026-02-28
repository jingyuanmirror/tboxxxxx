'use client';

export interface RecommendedTask {
  id: string;
  label: string;
  prompt: string;
  modeKey?: string;
}

// Map from last-completed task type → 2-3 recommended next tasks
const RECOMMENDATIONS: Record<string, RecommendedTask[]> = {
  research: [
    {
      id: 'ppt-from-report',
      label: '把报告整成 PPT，做成精美演示稿',
      prompt: '请把上面的分析报告转换成一份专业 PPT，结构清晰、重点突出，适合向管理层汇报',
      modeKey: 'ppt',
    },
    {
      id: 'mail-from-report',
      label: '写封汇报邮件，提炼核心结论发给领导',
      prompt: '请根据上面的报告内容，写一封向上级汇报核心结论与建议的商务邮件，语气专业简洁',
      modeKey: 'mail',
    },
    {
      id: 'plan-from-report',
      label: '基于报告做行动方案，落地具体计划',
      prompt: '请根据上面的分析报告，制定一份具体可执行的行动方案，包含优先级、负责人建议和时间节点',
    },
  ],
  search: [
    {
      id: 'report-from-search',
      label: '把搜索结果整理成完整分析报告',
      prompt: '请将刚才搜索到的内容整理成一份结构清晰的分析报告，包含背景、核心发现、结论与建议',
      modeKey: 'web',
    },
    {
      id: 'ppt-from-search',
      label: '把信息做成 PPT，方便团队展示',
      prompt: '请将刚才搜索到的信息制作成一份简洁的 PPT，重点突出关键数据和结论，适合团队分享',
      modeKey: 'ppt',
    },
    {
      id: 'plan-from-search',
      label: '制定对应策略方案，把信息变行动',
      prompt: '请根据刚才搜索的市场信息，制定一份针对性的策略方案，包括机会分析、行动步骤和预期效果',
    },
  ],
  ppt: [
    {
      id: 'mail-send-ppt',
      label: '写封推送 PPT 的邮件，顺利跟进',
      prompt: '请帮我写一封附上 PPT 的商务跟进邮件，简要说明本次演示的核心结论，并提出下一步合作建议',
      modeKey: 'mail',
    },
    {
      id: 'plan-support-ppt',
      label: '配套做个推广方案，推动落地执行',
      prompt: '请根据 PPT 中的内容，制定一份配套的落地推广方案，包括时间线、渠道策略和关键 KPI',
    },
    {
      id: 'research-for-ppt',
      label: '补充竞品数据，让 PPT 更有说服力',
      prompt: '请帮我搜索行业最新竞品数据和市场趋势，用于补充 PPT 中的论据，要求有具体数字和来源',
      modeKey: 'web',
    },
  ],
  email: [
    {
      id: 'plan-after-email',
      label: '搞个完整推广方案，把沟通升级为计划',
      prompt: '请帮我制定一份完整的推广方案，包含目标设定、渠道规划、内容策略和效果衡量指标',
    },
    {
      id: 'research-for-email',
      label: '做个市场调研报告，让后续沟通更有底气',
      prompt: '请帮我做一份市场调研报告，分析目标客户的核心痛点、竞品现状和我方差异化优势',
      modeKey: 'web',
    },
    {
      id: 'ppt-for-email',
      label: '做个提案 PPT，把邮件升级为正式演示',
      prompt: '请帮我将邮件中的提案内容制作成一份专业 PPT，突出核心价值主张和合作收益',
      modeKey: 'ppt',
    },
  ],
  plan: [
    {
      id: 'ppt-from-plan',
      label: '把方案整成 PPT，清晰呈现给相关方',
      prompt: '请将上面的方案内容制作成一份专业 PPT，结构包含背景、目标、执行步骤、预期效果和资源需求',
      modeKey: 'ppt',
    },
    {
      id: 'mail-from-plan',
      label: '写封方案推进邮件，推动落地执行',
      prompt: '请根据上面的方案内容，写一封向相关方同步计划、寻求资源支持的推进邮件，语气积极专业',
      modeKey: 'mail',
    },
    {
      id: 'research-for-plan',
      label: '补充行业数据，让方案更有说服力',
      prompt: '请搜索行业最新市场规模、增速和典型案例数据，用于为上面的方案提供数据支撑',
      modeKey: 'web',
    },
  ],
  chat: [
    {
      id: 'report-after-chat',
      label: '写一份正式报告，把想法整理成文档',
      prompt: '请帮我写一份完整的分析报告，将刚才讨论的核心内容整理成有逻辑、有数据支撑的正式文档',
    },
    {
      id: 'ppt-after-chat',
      label: '整理成 PPT，把思路做成可展示的幻灯片',
      prompt: '请将刚才我们讨论的主要内容制作成一份简洁的 PPT，突出重点，适合向团队展示',
      modeKey: 'ppt',
    },
    {
      id: 'plan-after-chat',
      label: '做个行动方案，把想法落地成具体计划',
      prompt: '请根据刚才讨论的内容，帮我制定一份具体的行动方案，包含目标、步骤、时间线和衡量标准',
    },
  ],
};

const DEFAULT_RECOMMENDATIONS: RecommendedTask[] = [
  {
    id: 'report-default',
    label: '写个分析报告，市场调研、竞品分析都行',
    prompt: '帮我写一份市场分析报告，包含行业背景、主要玩家竞争格局、用户需求和市场机会判断',
    modeKey: 'web',
  },
  {
    id: 'ppt-default',
    label: '整个 PPT，路演汇报、培训课件都能做',
    prompt: '请帮我制作一份专业的汇报 PPT（10页），风格简洁，包含封面、核心结论、数据图表和行动建议',
    modeKey: 'ppt',
  },
  {
    id: 'plan-default',
    label: '搞个方案，推广活动、运营计划都来吧',
    prompt: '帮我制定一份完整的执行方案，包含目标设定、策略规划、关键动作和效果衡量指标',
  },
];

interface Props {
  lastCompletedTask?: string;
  onSelect: (prompt: string, modeKey?: string) => void;
}

export default function RecommendedTasks({ lastCompletedTask, onSelect }: Props) {
  const tasks = lastCompletedTask
    ? (RECOMMENDATIONS[lastCompletedTask] ?? DEFAULT_RECOMMENDATIONS)
    : DEFAULT_RECOMMENDATIONS;

  return (
    <div className="w-full mb-4 animate-[fadeSlideIn_0.2s_ease-out]">
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelect(task.prompt, task.modeKey)}
            className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-[rgba(0,0,0,0.07)] bg-[rgba(255,255,255,0.85)] hover:border-[rgba(37,99,235,0.35)] hover:bg-[rgba(37,99,235,0.04)] transition-all cursor-pointer text-left"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <span className="w-5 h-5 flex-shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] group-hover:border-[rgba(37,99,235,0.4)] bg-white flex items-center justify-center transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db] group-hover:bg-[#2563eb] transition-colors" />
            </span>
            <span className="text-[13px] text-[#374151] group-hover:text-[#1d1d1f] leading-snug transition-colors">
              {task.label}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-[#c7c7cc] group-hover:text-[#2563eb] transition-colors opacity-0 group-hover:opacity-100">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
