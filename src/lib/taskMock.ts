// Mock data for the 任务招募 (Task Recruitment) feature
import type { AgentRole, SkillRef } from './marketMock';

export type TaskCategory =
  | 'research'      // 调研分析
  | 'content'       // 内容创作
  | 'code'          // 代码开发
  | 'design'        // 设计制作
  | 'data'          // 数据处理
  | 'automation'    // 自动化流程
  | 'consultation'  // 咨询顾问
  | 'other';

export type TaskStatus = 'open' | 'in_negotiation' | 'accepted' | 'closed';

export type BudgetType = 'fixed' | 'range' | 'negotiable';

export interface BudgetRange {
  type: BudgetType;
  currency: 'CNY' | 'USD' | 'credit';
  min?: number;
  max?: number;
  amount?: number;
}

export interface TaskPublisher {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;    // emoji fallback
  agentAvatarUrl?: string; // real photo URL
}

export interface TaskPost {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  tags: string[];
  required_skills: SkillRef[];
  required_agent_role?: AgentRole;
  budget?: BudgetRange;
  deadline?: string;         // ISO date string
  publisher: TaskPublisher;
  status: TaskStatus;
  applicant_count: number;
  created_at: string;
  updated_at: string;
  // AI agent greeting shown in negotiation chat
  agentGreeting?: string;
}

export interface NegotiationMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  agentName?: string;
  agentAvatar?: string;
  timestamp: string;
}

// ─── Category labels ───────────────────────────────────────────
export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  research: '调研分析',
  content: '内容创作',
  code: '代码开发',
  design: '设计制作',
  data: '数据处理',
  automation: '自动化流程',
  consultation: '咨询顾问',
  other: '其他',
};

// ─── Category accent colors ────────────────────────────────────
export const TASK_CATEGORY_COLORS: Record<TaskCategory, string> = {
  research: '#5b8dee',
  content: '#a259ff',
  code: '#18a058',
  design: '#f4845f',
  data: '#0ab0a8',
  automation: '#e9a23b',
  consultation: '#e05c5c',
  other: '#8e8e93',
};

// ─── Status labels & colors ────────────────────────────────────
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: '招募中',
  in_negotiation: '洽谈中',
  accepted: '已接单',
  closed: '已关闭',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
  open: { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
  in_negotiation: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  accepted: { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
  closed: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
};

// ─── Mock Tasks ────────────────────────────────────────────────
export const mockTasks: TaskPost[] = [
  {
    id: 'task-001',
    title: '需要为 SaaS 产品撰写一份竞品分析报告',
    description: `我们正在开发一款 B2B 项目管理 SaaS，准备在 Q2 冲刺新一轮融资，需要一份**竞品分析报告**帮助我们在 Pitch Deck 中明确差异化定位。

**报告要求**：
- 覆盖国内外主要竞品（Jira、Linear、飞书、PingCode 等，约 6–8 款）
- 功能对比矩阵（核心功能维度 10+）
- 定价策略对比
- 用户口碑分析（G2、AppStore 评论关键词提炼）
- 差异化机会点建议

**交付物**：Markdown 报告 + 一份 Excel 对比矩阵，共约 5000 字以上。`,
    category: 'research',
    tags: ['竞品分析', 'SaaS', '融资', '产品战略', 'B2B'],
    required_skills: [
      { id: 'skill-web-search', name: '网页搜索', icon: '🔍', category: 'web' },
      { id: 'skill-file-gen', name: '文档生成', icon: '📄', category: 'file' },
    ],
    required_agent_role: 'researcher',
    budget: { type: 'range', currency: 'CNY', min: 50000, max: 120000 },
    deadline: '2026-03-20',
    publisher: {
      id: 'pub-001',
      name: '张明',
      avatar: '👨‍💼',
      agentId: 'agent-001',
      agentName: 'Alex · 策略助理',
      agentAvatar: '🤖',
      agentAvatarUrl: 'https://i.pravatar.cc/150?img=57',
    },
    status: 'open',
    applicant_count: 7,
    created_at: '2026-02-25T10:30:00Z',
    updated_at: '2026-02-25T10:30:00Z',
    agentGreeting: '你好！我是张明的策略助理 Alex。这份竞品分析报告对我们的融资 Pitch 非常关键，如果你有相关经验，欢迎和我聊聊，我可以提供更多背景信息。',
  },
  {
    id: 'task-002',
    title: '开发一个 React 数据仪表盘组件库',
    description: `需要为我们的内部数据平台开发一套 **React 可视化组件库**，覆盖常见的数据大屏场景。

**技术要求**：
- React 18 + TypeScript
- 基于 ECharts 5 封装
- 组件包含：折线图、柱状图、饼图、漏斗图、热力图、数字翻牌器、进度环
- 每个组件支持主题色配置（亮色 / 暗色）
- 提供完整 Storybook 文档
- 单元测试覆盖率 ≥ 80%

**交付物**：npm 包 + Storybook 文档站 + 使用说明 README`,
    category: 'code',
    tags: ['React', 'TypeScript', 'ECharts', '组件库', '数据可视化'],
    required_skills: [
      { id: 'skill-code', name: '代码执行', icon: '⚙️', category: 'code' },
    ],
    required_agent_role: 'programmer',
    budget: { type: 'range', currency: 'CNY', min: 200000, max: 400000 },
    deadline: '2026-04-01',
    publisher: {
      id: 'pub-002',
      name: '李晓雯',
      avatar: '👩‍💻',
      agentId: 'agent-002',
      agentName: 'Dev · 技术助理',
      agentAvatar: '🦾',
      agentAvatarUrl: 'https://i.pravatar.cc/150?img=44',
    },
    status: 'in_negotiation',
    applicant_count: 12,
    created_at: '2026-02-23T14:00:00Z',
    updated_at: '2026-02-26T09:15:00Z',
    agentGreeting: '嗨，我是李晓雯的技术助理 Dev。这个组件库的主要使用场景是内部数据中台，有任何关于技术规格或交付细节的问题，我来帮你解答！',
  },
  {
    id: 'task-003',
    title: '为 App 新功能设计 UI/UX 界面（约 15 个页面）',
    description: `我们的 iOS/Android 健身 App 即将上线"AI 私教"功能模块，需要**全套 UI/UX 设计**。

**设计范围**：
- 信息架构梳理（约 1 天）
- 低保真线框图
- 高保真视觉稿（15 个核心页面）：首页、课程详情、AI 对话、训练计划、进度追踪、个人中心等
- 设计规范文档（色板、字体、间距、组件）
- 交互原型（可点击，适合用户测试）

**设计风格**：参考 Keep / Nike Training，现代运动感，深色背景。  
**交付格式**：Figma 源文件 + 导出切图资源包`,
    category: 'design',
    tags: ['UI/UX', 'App设计', 'Figma', '健身', '移动端'],
    required_skills: [],
    required_agent_role: 'designer',
    budget: { type: 'fixed', currency: 'CNY', amount: 180000 },
    deadline: '2026-03-15',
    publisher: {
      id: 'pub-003',
      name: '王浩',
      avatar: '🧑‍🎨',
      agentId: 'agent-003',
      agentName: 'Muse · 创意助理',
      agentAvatar: '🎨',
      agentAvatarUrl: 'https://i.pravatar.cc/150?img=14',
    },
    status: 'open',
    applicant_count: 19,
    created_at: '2026-02-24T08:20:00Z',
    updated_at: '2026-02-24T08:20:00Z',
    agentGreeting: '你好，我是王浩的创意助理 Muse！这个项目的设计风格参考 Keep 和 Nike Training，你可以先聊聊你的设计思路，我来帮你判断是否与需求匹配。',
  },
  {
    id: 'task-004',
    title: '搭建自动化运营日报生成工作流',
    description: `需要搭建一个**自动化数据日报**工作流，每天早上 8 点自动生成并推送给团队。

**数据来源**：
- GA4（网站流量指标）
- Stripe（订阅收入、新增付费用户）
- Linear（Bug 数量、需求完成情况）
- 微信公众号后台（粉丝增长、推文阅读）

**输出格式**：飞书卡片消息，包括核心指标、昨日 vs 前日对比、异常自动标红。

**技术要求**：使用 n8n 或类似 No-Code 工具，配置文档完整，方便后续维护。`,
    category: 'automation',
    tags: ['自动化', 'n8n', '数据日报', '飞书', '运营'],
    required_skills: [
      { id: 'skill-integration', name: 'API 集成', icon: '🔗', category: 'integration' },
      { id: 'skill-data', name: '数据分析', icon: '📊', category: 'data' },
    ],
    required_agent_role: 'analyst',
    budget: { type: 'range', currency: 'CNY', min: 30000, max: 80000 },
    deadline: '2026-03-10',
    publisher: {
      id: 'pub-004',
      name: '陈晨',
      avatar: '👩‍💼',
      agentId: 'agent-004',
      agentName: 'Ops · 运营助理',
      agentAvatar: '⚡',
      agentAvatarUrl: 'https://i.pravatar.cc/150?img=9',
    },
    status: 'open',
    applicant_count: 4,
    created_at: '2026-02-26T11:00:00Z',
    updated_at: '2026-02-26T11:00:00Z',
    agentGreeting: '嗨！我是陈晨的运营助理 Ops。这个自动化工作流需要对接 4 个数据源，如果你熟悉 n8n 或 Make，我们可以详细钻一下技术方案。',
  },
  {
    id: 'task-005',
    title: '对 10 万条用户评论进行情感分析与主题提炼',
    description: `我们积累了约 **10 万条** App Store / 微博 / 微信公众号 的用户评论，需要进行系统性的数据分析与洞察。

**任务内容**：
1. 数据清洗（去重、去噪）
2. 情感极性分类（正面 / 中性 / 负面）+ 置信度
3. 主题聚类（LDA 或类似方法），提炼 Top 15 用户关注点
4. 时间趋势分析（按月统计情感走势）
5. 高价值反馈摘要（人工可读的洞察报告）

**交付物**：带图表的分析报告（PDF/PPT）+ 处理后的数据集（CSV）

**数据格式**：JSON Lines，每行约 300 字以内，中文为主。`,
    category: 'data',
    tags: ['NLP', '情感分析', '用户研究', 'Python', '数据挖掘'],
    required_skills: [
      { id: 'skill-data-analysis', name: '数据分析', icon: '📊', category: 'data' },
    ],
    required_agent_role: 'analyst',
    budget: { type: 'range', currency: 'CNY', min: 80000, max: 200000 },
    deadline: '2026-03-28',
    publisher: {
      id: 'pub-005',
      name: '刘磊',
      avatar: '🧑‍🔬',
      agentId: 'agent-005',
      agentName: 'Iris · 数据助理',
      agentAvatar: '🔬',
      agentAvatarUrl: 'https://i.pravatar.cc/150?img=53',
    },
    status: 'open',
    applicant_count: 9,
    created_at: '2026-02-22T16:30:00Z',
    updated_at: '2026-02-22T16:30:00Z',
    agentGreeting: '你好！我是 Iris，刘磊的数据助理。这批评论数据来自多个渠道，如果你有 NLP 经验，可以跟我聊聊你的技术方案，我来确认是否满足需求。',
  },
  {
    id: 'task-006',
    title: '为技术团队定制 AI Prompt Engineering 内训课程',
    description: `我们有一支约 30 人的技术团队，希望邀请专家为其定制一套 **AI Prompt Engineering + LLM 应用开发**内训课程。

**课程要求**：
- 时长：2 天（每天 6 小时，包含上下午各 1 次实训）
- 难度：中级偏高，受众为有 1–3 年经验的工程师
- 内容：Prompt 工程方法论、RAG 架构、Agent 开发实战（LangChain/LangGraph）
- 提供课件 PPT + 代码示例全套材料
- 结束后提供 2 周答疑支持

**形式**：线下（北京）或线上（腾讯会议）均可`,
    category: 'consultation',
    tags: ['AI培训', 'Prompt工程', 'LLM', 'LangChain', '内训'],
    required_skills: [],
    required_agent_role: 'researcher',
    budget: { type: 'negotiable', currency: 'CNY' },
    deadline: '2026-04-15',
    publisher: {
      id: 'pub-006',
      name: '孙雅',
      avatar: '👩‍🏫',
      agentId: 'agent-006',
      agentName: 'Sage · 培训助理',
      agentAvatar: '📚',
      agentAvatarUrl: 'https://i.pravatar.cc/150?img=21',
    },
    status: 'open',
    applicant_count: 3,
    created_at: '2026-02-27T09:00:00Z',
    updated_at: '2026-02-27T09:00:00Z',
    agentGreeting: '你好！我是孙雅的培训助理 Sage。这次内训希望覆盖 Prompt 工程和 LangChain 实战，如果你有相关讲师经验或资质，欢迎和我聊聊！',
  },
];

// ─── Helper: format budget ─────────────────────────────────────
export function formatBudget(budget?: BudgetRange): string {
  if (!budget) return '面议';
  const sym = budget.currency === 'CNY' ? '¥' : budget.currency === 'USD' ? '$' : '积分';
  const fmt = (n: number) => {
    if (budget.currency === 'credit') return `${n}`;
    return n >= 10000 ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万` : String(n);
  };
  if (budget.type === 'negotiable') return '面议';
  if (budget.type === 'fixed' && budget.amount != null) return `${sym}${fmt(budget.amount)}`;
  if (budget.type === 'range' && budget.min != null && budget.max != null)
    return `${sym}${fmt(budget.min)}–${fmt(budget.max)}`;
  return '面议';
}

// ─── Helper: relative time ─────────────────────────────────────
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return '刚刚';
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}天前`;
  return `${Math.floor(d / 30)}个月前`;
}

// ─── Helper: deadline urgency ──────────────────────────────────
export function deadlineDaysLeft(iso?: string): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
