// Mock data for the 锦囊集市 (Market) feature

export type AgentRole =
  | 'assistant'
  | 'researcher'
  | 'designer'
  | 'programmer'
  | 'analyst'
  | 'customer_service'
  | 'other';

export type SkillCategory =
  | 'web'
  | 'data'
  | 'creative'
  | 'file'
  | 'integration'
  | 'memory'
  | 'code'
  | 'other';

export type PricingType = 'free' | 'pay_per_use' | 'subscription' | 'one_time';

export interface PricingPlan {
  id: string;
  type: PricingType;
  label: string;
  price: number; // in cents (fen)
  currency: 'CNY';
  period?: 'month' | 'year';
  isFeatured?: boolean;
  limits?: {
    callsPerMonth?: number;
    features?: string[];
  };
}

export interface SkillRef {
  id: string;
  name: string;
  icon: string;
  category: SkillCategory;
}

export interface MarketAgent {
  id: string;
  name: string;
  avatar: string; // emoji or URL
  role: AgentRole;
  slogan: string;
  description: string;
  skills: SkillRef[];
  scenarios: string[];
  pricing: PricingPlan[];
  rating: { score: number; count: number };
  hiredCount: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface Demo {
  title: string;
  input: string;
  output: string;
  outputType: 'text' | 'image' | 'chart' | 'table';
}

export interface MarketSkill {
  id: string;
  name: string;
  icon: string; // emoji
  category: SkillCategory;
  description: string;
  shortDesc: string;
  demos: Demo[];
  compatibility: { agentTypes: AgentRole[]; dependencies: string[]; conflicts: string[] };
  pricing: PricingPlan[];
  mountedCount: number;
  rating: { score: number; count: number };
  isFeatured?: boolean;
  isNew?: boolean;
}

// ─── Agent Role labels ──────────────────────────────────────────
export const ROLE_LABELS: Record<AgentRole, string> = {
  assistant: '工作助理',
  researcher: '研究员',
  designer: '设计师',
  programmer: '程序员',
  analyst: '数据分析师',
  customer_service: '客服',
  other: '其他',
};

// ─── Skill Category labels ──────────────────────────────────────
export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  web: '🌐 网络',
  data: '📊 数据',
  creative: '✍️ 创作',
  file: '📁 文件',
  integration: '🔗 集成',
  memory: '🧠 记忆',
  code: '💻 代码',
  other: '其他',
};

// ─── Mock Agents ────────────────────────────────────────────────
export const mockAgents: MarketAgent[] = [
  {
    id: 'agent-1',
    name: '张小研',
    avatar: '🔬',
    role: 'researcher',
    slogan: '擅长从海量信息中提炼洞见',
    description: '专注行业研究与竞品分析，能快速整合多方信息源，生成结构化研究报告。',
    skills: [
      { id: 'skill-web-read', name: '读取网页', icon: '🌐', category: 'web' },
      { id: 'skill-search', name: '实时搜索', icon: '🔍', category: 'web' },
      { id: 'skill-chart', name: '生成图表', icon: '📊', category: 'data' },
      { id: 'skill-pdf', name: '读取 PDF', icon: '📄', category: 'file' },
      { id: 'skill-memory', name: '长期记忆', icon: '🧠', category: 'memory' },
    ],
    scenarios: ['竞品分析报告', '行业趋势研究', '文献综述整理', '市场调研摘要'],
    pricing: [
      { id: 'p1-free', type: 'free', label: '免费体验', price: 0, currency: 'CNY', limits: { callsPerMonth: 20 } },
      { id: 'p1-sub', type: 'subscription', label: '专业版', price: 2900, currency: 'CNY', period: 'month', isFeatured: true },
      { id: 'p1-year', type: 'subscription', label: '年度版', price: 19900, currency: 'CNY', period: 'year' },
    ],
    rating: { score: 4.8, count: 312 },
    hiredCount: 1234,
    tags: ['研究报告', '竞品分析', '信息整合'],
    isFeatured: true,
  },
  {
    id: 'agent-2',
    name: '林代码',
    avatar: '💻',
    role: 'programmer',
    slogan: '全栈工程师，代码质量第一',
    description: '精通 TypeScript、Python、Go，擅长系统设计与代码审查，能自动提交 PR。',
    skills: [
      { id: 'skill-code-run', name: '执行代码', icon: '⚡', category: 'code' },
      { id: 'skill-web-read', name: '读取网页', icon: '🌐', category: 'web' },
      { id: 'skill-search', name: '实时搜索', icon: '🔍', category: 'web' },
      { id: 'skill-db', name: '查询数据库', icon: '🗄️', category: 'data' },
    ],
    scenarios: ['代码审查', 'Bug 修复建议', 'API 文档生成', '技术方案评审'],
    pricing: [
      { id: 'p2-free', type: 'free', label: '免费', price: 0, currency: 'CNY', limits: { callsPerMonth: 10 } },
      { id: 'p2-sub', type: 'subscription', label: '开发者版', price: 3900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.7, count: 891 },
    hiredCount: 3210,
    tags: ['写代码', '代码审查', '全栈'],
    isFeatured: true,
  },
  {
    id: 'agent-3',
    name: '陈数据',
    avatar: '📊',
    role: 'analyst',
    slogan: '让数据开口说话',
    description: '专注数据分析与可视化，支持 Excel、CSV、数据库直连，输出专业图表与洞察。',
    skills: [
      { id: 'skill-chart', name: '生成图表', icon: '📊', category: 'data' },
      { id: 'skill-excel', name: '分析 Excel', icon: '📈', category: 'data' },
      { id: 'skill-db', name: '查询数据库', icon: '🗄️', category: 'data' },
      { id: 'skill-pdf', name: '读取 PDF', icon: '📄', category: 'file' },
    ],
    scenarios: ['销售数据分析', '用户行为分析', '财务报表解读', '趋势预测'],
    pricing: [
      { id: 'p3-free', type: 'free', label: '免费版', price: 0, currency: 'CNY', limits: { callsPerMonth: 15 } },
      { id: 'p3-sub', type: 'subscription', label: '数据版', price: 3500, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.9, count: 521 },
    hiredCount: 2890,
    tags: ['数据分析', '可视化', '报表'],
  },
  {
    id: 'agent-4',
    name: '周文案',
    avatar: '✍️',
    role: 'designer',
    slogan: '创意文案，一字千金',
    description: '品牌文案、营销推文、产品描述全覆盖，语感自然、风格多变，支持多平台调性适配。',
    skills: [
      { id: 'skill-search', name: '实时搜索', icon: '🔍', category: 'web' },
      { id: 'skill-image', name: '生成图片', icon: '🎨', category: 'creative' },
      { id: 'skill-memory', name: '长期记忆', icon: '🧠', category: 'memory' },
    ],
    scenarios: ['品牌 Slogan', '小红书推文', '产品发布文案', '活动策划方案'],
    pricing: [
      { id: 'p4-free', type: 'free', label: '免费试用', price: 0, currency: 'CNY', limits: { callsPerMonth: 20 } },
      { id: 'p4-sub', type: 'subscription', label: '创作者版', price: 1900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.6, count: 203 },
    hiredCount: 987,
    tags: ['文案', '营销', '创意写作'],
    isNew: true,
  },
  {
    id: 'agent-5',
    name: '王助理',
    avatar: '🤝',
    role: 'assistant',
    slogan: '贴心助理，效率翻倍',
    description: '协助处理日程安排、邮件回复、会议纪要，支持接入飞书、钉钉、Notion 等协作工具。',
    skills: [
      { id: 'skill-calendar', name: '读写日历', icon: '📅', category: 'integration' },
      { id: 'skill-email', name: '发送邮件', icon: '📧', category: 'integration' },
      { id: 'skill-notion', name: '接入 Notion', icon: '📝', category: 'integration' },
      { id: 'skill-memory', name: '长期记忆', icon: '🧠', category: 'memory' },
    ],
    scenarios: ['日程管理', '邮件草稿', '会议纪要整理', '跨平台信息同步'],
    pricing: [
      { id: 'p5-free', type: 'free', label: '免费', price: 0, currency: 'CNY', limits: { callsPerMonth: 30 } },
      { id: 'p5-sub', type: 'subscription', label: '助理版', price: 1500, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.5, count: 156 },
    hiredCount: 654,
    tags: ['日程', '协作', '效率'],
  },
  {
    id: 'agent-6',
    name: '赵客服',
    avatar: '💬',
    role: 'customer_service',
    slogan: '7×24 在线，让客户满意',
    description: '处理常见问题、安抚情绪、升级工单，支持多轮对话与知识库检索，适合电商和 SaaS。',
    skills: [
      { id: 'skill-memory', name: '长期记忆', icon: '🧠', category: 'memory' },
      { id: 'skill-kb', name: '知识库检索', icon: '🔍', category: 'memory' },
      { id: 'skill-email', name: '发送邮件', icon: '📧', category: 'integration' },
    ],
    scenarios: ['FAQ 自动回复', '工单创建', '情绪识别与安抚', '售后跟进'],
    pricing: [
      { id: 'p6-free', type: 'free', label: '免费体验', price: 0, currency: 'CNY', limits: { callsPerMonth: 50 } },
      { id: 'p6-sub', type: 'subscription', label: '企业版', price: 4900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.4, count: 88 },
    hiredCount: 432,
    tags: ['客服', '自动化', '知识库'],
    isNew: true,
  },
];

// ─── Mock Skills ────────────────────────────────────────────────
export const mockSkills: MarketSkill[] = [
  {
    id: 'skill-web-read',
    name: '读取网页',
    icon: '🌐',
    category: 'web',
    description: '让 Agent 能够访问并理解任意网页内容，自动提取正文、去除广告，支持动态页面。',
    shortDesc: '访问并理解任意网页内容',
    demos: [
      {
        title: '提取文章要点',
        input: '帮我总结这篇文章的核心观点：https://example.com/article',
        output: '该文章主要讲述了3个核心观点：\n1. AI 将重塑工作模式\n2. 人机协作是未来趋势\n3. 技能升级比工具更重要',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['assistant', 'researcher', 'analyst', 'programmer', 'other'], dependencies: [], conflicts: [] },
    pricing: [{ id: 'sk1-free', type: 'free', label: '永久免费', price: 0, currency: 'CNY' }],
    mountedCount: 8901,
    rating: { score: 4.9, count: 521 },
    isFeatured: true,
  },
  {
    id: 'skill-search',
    name: '实时搜索',
    icon: '🔍',
    category: 'web',
    description: '接入实时搜索引擎，获取最新资讯、价格、新闻，突破训练数据的时效限制。',
    shortDesc: '获取互联网实时信息',
    demos: [
      {
        title: '最新行业资讯',
        input: '今天 AI 行业有什么重要动态？',
        output: '今日 AI 行业要闻：\n• OpenAI 发布新版模型，推理能力提升 40%\n• 国内大模型备案数量突破 200 个\n• Anthropic 完成新一轮 20 亿美元融资',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['assistant', 'researcher', 'analyst', 'programmer', 'designer', 'customer_service', 'other'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk2-free', type: 'free', label: '每月 100 次', price: 0, currency: 'CNY', limits: { callsPerMonth: 100 } },
      { id: 'sk2-sub', type: 'subscription', label: '无限版', price: 900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 6532,
    rating: { score: 4.8, count: 389 },
    isFeatured: true,
  },
  {
    id: 'skill-chart',
    name: '生成图表',
    icon: '📊',
    category: 'data',
    description: '根据数据自动生成柱状图、折线图、饼图等可视化图表，支持导出 PNG / SVG。',
    shortDesc: '将数据转化为可视化图表',
    demos: [
      {
        title: '销售数据可视化',
        input: '帮我把这份季度销售数据做成折线图：Q1:120万, Q2:185万, Q3:210万, Q4:298万',
        output: '[折线图] 四季度销售额增长趋势图（单位：万元）\nQ1→Q2: +54% | Q2→Q3: +13.5% | Q3→Q4: +41.9%',
        outputType: 'chart',
      },
    ],
    compatibility: { agentTypes: ['analyst', 'researcher', 'assistant'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk3-free', type: 'free', label: '每月 50 次', price: 0, currency: 'CNY', limits: { callsPerMonth: 50 } },
      { id: 'sk3-sub', type: 'subscription', label: '无限版', price: 1200, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 4210,
    rating: { score: 4.7, count: 298 },
    isFeatured: true,
  },
  {
    id: 'skill-db',
    name: '查询数据库',
    icon: '🗄️',
    category: 'data',
    description: '连接 MySQL、PostgreSQL、SQLite、MongoDB，用自然语言生成并执行查询语句。',
    shortDesc: '自然语言直连数据库查询',
    demos: [
      {
        title: '自然语言查询',
        input: '查询上个月销售额最高的 5 款产品',
        output: 'SELECT product_name, SUM(amount) as total\nFROM orders\nWHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)\nGROUP BY product_name\nORDER BY total DESC LIMIT 5;\n\n结果：产品A ¥92,340 | 产品B ¥78,100 | ...',
        outputType: 'table',
      },
    ],
    compatibility: { agentTypes: ['analyst', 'programmer'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk4-ppu', type: 'pay_per_use', label: '按次计费', price: 10, currency: 'CNY' },
      { id: 'sk4-sub', type: 'subscription', label: '月度版', price: 2900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 1876,
    rating: { score: 4.6, count: 142 },
  },
  {
    id: 'skill-image',
    name: '生成图片',
    icon: '🎨',
    category: 'creative',
    description: '基于文字描述生成高质量图片，支持多种风格：写实、插画、商业摄影、抽象艺术。',
    shortDesc: '文字描述一键生成图片',
    demos: [
      {
        title: '品牌海报生成',
        input: '生成一张科技感十足的产品发布会海报，蓝紫色调，简约风格',
        output: '[图片] 已生成 1024×1024 海报，蓝紫渐变背景，中心光晕效果，极简排版',
        outputType: 'image',
      },
    ],
    compatibility: { agentTypes: ['designer', 'assistant', 'other'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk5-ppu', type: 'pay_per_use', label: '每张 ¥0.5', price: 50, currency: 'CNY' },
      { id: 'sk5-sub', type: 'subscription', label: '月度 100 张', price: 3900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 3456,
    rating: { score: 4.5, count: 267 },
    isFeatured: true,
  },
  {
    id: 'skill-pdf',
    name: '读取 PDF',
    icon: '📄',
    category: 'file',
    description: '解析 PDF 文档，提取正文、表格、图注，支持学术论文、合同、财报等复杂格式。',
    shortDesc: '解析并理解 PDF 文档内容',
    demos: [
      {
        title: '合同要点提取',
        input: '帮我找出这份劳动合同中关于竞业限制的条款',
        output: '**竞业限制条款摘录（第八条）**\n- 限制期：离职后 24 个月\n- 适用范围：同类型互联网企业\n- 补偿标准：离职前月薪的 30%/月\n- 违约金：月均薪资 × 限制月数 × 3',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['researcher', 'analyst', 'assistant', 'customer_service', 'other'], dependencies: [], conflicts: [] },
    pricing: [{ id: 'sk6-free', type: 'free', label: '永久免费', price: 0, currency: 'CNY' }],
    mountedCount: 5234,
    rating: { score: 4.8, count: 412 },
  },
  {
    id: 'skill-email',
    name: '发送邮件',
    icon: '📧',
    category: 'integration',
    description: '代理发送和接收邮件，支持 Gmail、Outlook、企业邮箱，可拟稿、定时发送、自动分类。',
    shortDesc: '自动发送和管理邮件',
    demos: [
      {
        title: '自动起草会议邀请',
        input: '给团队发会议邀请，明天下午 3 点，讨论 Q2 OKR，30 分钟',
        output: '邮件已起草 ✉️\n收件人：[team@company.com]\n主题：会议邀请 | Q2 OKR 讨论 | 明日 15:00-15:30\n正文：您好，诚邀参加 Q2 OKR 对齐会议...',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['assistant', 'customer_service'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk7-free', type: 'free', label: '每月 200 封', price: 0, currency: 'CNY', limits: { callsPerMonth: 200 } },
      { id: 'sk7-sub', type: 'subscription', label: '无限版', price: 800, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 2109,
    rating: { score: 4.4, count: 178 },
    isNew: true,
  },
  {
    id: 'skill-memory',
    name: '长期记忆',
    icon: '🧠',
    category: 'memory',
    description: '跨会话保存用户偏好、工作习惯、历史结论，让 Agent 越用越懂你。',
    shortDesc: '跨会话记住用户偏好与历史',
    demos: [
      {
        title: '记住用户习惯',
        input: '我偏好简洁的 bullet point 格式，不喜欢长段落',
        output: '✅ 已记住！以后我的回复将默认使用简洁的要点格式，避免长段落。这个偏好会在所有会话中生效。',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['assistant', 'researcher', 'designer', 'analyst', 'customer_service', 'programmer', 'other'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk8-free', type: 'free', label: '100 条记忆', price: 0, currency: 'CNY' },
      { id: 'sk8-sub', type: 'subscription', label: '无限记忆', price: 1500, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 7823,
    rating: { score: 4.9, count: 634 },
    isFeatured: true,
  },
];

// ─── Helper functions ────────────────────────────────────────────
export function formatPrice(plan: PricingPlan): string {
  if (plan.price === 0) return '免费';
  const yuan = plan.price / 100;
  if (plan.type === 'subscription') {
    return `¥${yuan}/${plan.period === 'year' ? '年' : '月'}`;
  }
  if (plan.type === 'pay_per_use') {
    return `¥${yuan}/次`;
  }
  return `¥${yuan}`;
}

export function getLowestPrice(plans: PricingPlan[]): string {
  const free = plans.find(p => p.price === 0);
  if (free) return '免费';
  const sorted = [...plans].sort((a, b) => a.price - b.price);
  return formatPrice(sorted[0]);
}
