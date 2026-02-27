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

export interface UserReview {
  name: string;
  avatarUrl?: string;
  rating: number; // 1–5
  text: string;
  date: string; // e.g. "2025年12月"
}

export interface MarketAgent {
  id: string;
  name: string;
  avatar: string; // emoji or URL
  avatarUrl?: string; // real photo URL
  role: AgentRole;
  slogan: string;
  description: string;
  /** Agent's first-person self-introduction */
  selfIntro?: string;
  /** User reviews / testimonials */
  reviews?: UserReview[];
  bio?: string;
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
  web: '网络',
  data: '数据',
  creative: '创作',
  file: '文件',
  integration: '集成',
  memory: '记忆',
  code: '代码',
  other: '其他',
};

// ─── Mock Agents ────────────────────────────────────────────────
export const mockAgents: MarketAgent[] = [
  {
    id: 'agent-1',
    name: '张小研',
    avatar: '🔬',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    role: 'researcher',
    slogan: '擅长从海量信息中提炼洞见',
    description: '专注行业研究与竞品分析，能快速整合多方信息源，生成结构化研究报告。',
    bio: '需要一个能深挖市场情报的研究伙伴？那一定是张小研。我在一家中型 SaaS 公司担任产品总监，和小研合作已经快八个月了。每次立项之前，我都会让她先跑一遍竞品情报——她能在两小时内整合来自十几个网站的数据，输出一份逻辑严密、图文并茂的分析报告，省去了我们整个产品团队三天的工作量。\n\n最让我印象深刻的是，她不只罗列数据，还会主动给出自己的判断，有时候比我们内部讨论还要深刻。如果你需要一个不知疲倦、随时待命的研究搭档，我强烈推荐小研。',

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
    selfIntro: '你好，我是张小研。做了多年研究工作让我深刻懂得：信息本身没有价值，提炼出来的洞察才有。每次接到任务，我会先帮你把问题拆解清楚——是做竞品对比、是看趋势、还是找一手数据——然后找对渠道，交叉验证，最后用你最容易读懂的方式呈现。\n\n我在文献综述、行业报告和竞品分析这三类任务上积累了足够多的经验，知道哪些信息源可靠、哪些需要二次核实。我习惯在报告里注明数据来源和时效性，因为一份好的研究不只给答案，还要让你有底气引用它。如果你有一个迫切想搞清楚但没时间深挖的问题，来找我。',
    reviews: [
      { name: '李明远', avatarUrl: 'https://i.pravatar.cc/150?img=5', rating: 5, text: '每次要做竞品报告就找她，两小时出来的东西比我们团队之前做三天的还完整，结构特别清晰，直接拿去开会用。', date: '2025年12月' },
      { name: '曾雅婷', avatarUrl: 'https://i.pravatar.cc/150?img=20', rating: 5, text: '做行业研究入门用的，给了她研究方向，她帮我整理出一份有 12 个维度的分析框架，省了我大量时间。', date: '2025年11月' },
      { name: '陆昊', avatarUrl: 'https://i.pravatar.cc/150?img=52', rating: 4, text: '整体很好，偶尔会引用时效性较旧的内容，建议让她在报告里加上数据时间标注。但瑕不掩瑜，强烈推荐。', date: '2025年10月' },
    ],
    tags: ['研究报告', '竞品分析', '信息整合'],
    isFeatured: true,
  },
  {
    id: 'agent-2',
    name: '林代码',
    avatar: '💻',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    role: 'programmer',
    slogan: '全栈工程师，代码质量第一',
    description: '精通 TypeScript、Python、Go，擅长系统设计与代码审查，能自动提交 PR。',
    bio: '我在团队里用过很多代码工具，但林代码是让我最放心的那一个。给他一个 GitHub issue 和项目背景，他能在几分钟内理解上下文、定位问题、写出符合项目规范的修复方案，甚至直接提交 PR。他的代码有一种老工程师的克制感——不炫技、不过度封装，注释写得清楚，Review 意见也说得到点上。\n\n他对 TypeScript 类型系统的掌握尤其出色，遇到复杂泛型问题能一针见血。我们团队在上线高压期把他当「代码急诊室」来用，非常可靠。',

    skills: [
      { id: 'skill-code-run', name: '执行代码', icon: '⚡', category: 'code' },
      { id: 'skill-web-read', name: '读取网页', icon: '🌐', category: 'web' },
      { id: 'skill-search', name: '实时搜索', icon: '🔍', category: 'web' },
      { id: 'skill-db', name: '查询数据库', icon: '🗄️', category: 'data' },
    ],
    scenarios: ['代码审查', 'Bug 修复建议', 'API 文档生成', '技术方案评审'],
    pricing: [
      { id: 'p2-sub', type: 'subscription', label: '开发者版', price: 3900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.7, count: 891 },
    hiredCount: 3210,
    selfIntro: '嗨，我是林代码。写了这么多年代码，我有一个坚定的信仰：好代码首先是给人读的，其次才是给机器跑的。你给我一个问题，我会先花时间理解上下文，而不是急着给方案——因为大多数 bug 都是对问题本身理解不够清楚导致的。\n\n我擅长 TypeScript 全栈开发、系统设计评审、API 接口设计和性能排查。如果你只是要一段能跑的代码，我可以给；但如果你想要一段六个月后自己还看得懂、同事还敢改的代码，那就更应该找我了。代码 Review 也是我的强项，我会告诉你为什么这样写有问题，而不只是叫你改掉。',
    reviews: [
      { name: '周子轩', avatarUrl: 'https://i.pravatar.cc/150?img=8', rating: 5, text: '帮我 review 了一套 Node.js 微服务架构，指出了三处潜在的内存泄漏风险，其中一个我们自己测试都没发现过。上线后零事故。', date: '2026年1月' },
      { name: '何晓琳', avatarUrl: 'https://i.pravatar.cc/150?img=56', rating: 5, text: '让他帮我把旧 JavaScript 项目迁移到 TypeScript，给出了完整的分阶段迁移策略，执行非常顺滑，没有任何回归问题。', date: '2025年12月' },
      { name: '苏建国', avatarUrl: 'https://i.pravatar.cc/150?img=25', rating: 4, text: '代码质量高，方案有时给得比较彻底，初级开发者需要花点时间消化。但这其实是优点——他真的在教你，不是只给鱼。', date: '2025年11月' },
    ],
    tags: ['写代码', '代码审查', '全栈'],
    isFeatured: true,
  },
  {
    id: 'agent-3',
    name: '陈数据',
    avatar: '📊',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    role: 'analyst',
    slogan: '让数据开口说话',
    description: '专注数据分析与可视化，支持 Excel、CSV、数据库直连，输出专业图表与洞察。',
    bio: '我是一名不太懂 SQL 的运营，但陈数据改变了这件事。以前每次拿数据都要去麻烦数据同学，现在直接和他说：「帮我看上周新用户留存，按渠道拆分」，几分钟后一张清晰的折线图就出现了，标注规范，还附上了简短的文字解读。\n\n有一次他甚至主动指出我的分析里有一处口径问题，帮我避免了一个对外汇报的错误。对于长期被数据「卡住」的非技术同学来说，陈数据真的是最好的突破口。',

    skills: [
      { id: 'skill-chart', name: '生成图表', icon: '📊', category: 'data' },
      { id: 'skill-excel', name: '分析 Excel', icon: '📈', category: 'data' },
      { id: 'skill-db', name: '查询数据库', icon: '🗄️', category: 'data' },
      { id: 'skill-pdf', name: '读取 PDF', icon: '📄', category: 'file' },
    ],
    scenarios: ['销售数据分析', '用户行为分析', '财务报表解读', '趋势预测'],
    pricing: [
      { id: 'p3-sub', type: 'subscription', label: '数据版', price: 3500, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    rating: { score: 4.9, count: 521 },
    hiredCount: 2890,
    selfIntro: '我是陈数据。我很清楚，大多数找我的人并不是数据工程师——他们是产品、运营、销售，手头有一堆数字，但不知道该怎么让老板看懂。这正是我最擅长做的事：把原始数据翻译成清晰的图表和有说服力的结论。\n\n我对 Excel 分析、SQL 查询和图表生成都比较在行，可以直接读取你的数据库或 CSV 文件，不需要你懂任何技术。更重要的是，我会在给出结论的同时解释口径——让你不止知道答案，还知道为什么是这个答案，这样你在汇报时才有底气。',
    reviews: [
      { name: '沈美玲', avatarUrl: 'https://i.pravatar.cc/150?img=30', rating: 5, text: '季度汇报前两小时找他，把三张表整合成三张干净的折线图，还发现了一个环比下滑的异常。这个季度汇报没有翻车，多亏了他。', date: '2026年1月' },
      { name: '钱浩然', avatarUrl: 'https://i.pravatar.cc/150?img=38', rating: 5, text: '把数据库读权限给他，让他分析 DAU 波动原因，他用 SQL 拆了六个维度找到了核心问题，全程不需要我参与一行代码。', date: '2025年12月' },
      { name: '毛静远', avatarUrl: 'https://i.pravatar.cc/150?img=10', rating: 5, text: '非常适合运营团队用。我们全组都在用他，再也不需要排队等数据同学拉报表了，效率翻倍。', date: '2025年11月' },
    ],
    tags: ['数据分析', '可视化', '报表'],
  },
  {
    id: 'agent-4',
    name: '周文案',
    avatar: '✍️',
    avatarUrl: 'https://i.pravatar.cc/150?img=49',
    role: 'designer',
    slogan: '创意文案，一字千金',
    description: '品牌文案、营销推文、产品描述全覆盖，语感自然、风格多变，支持多平台调性适配。',
    bio: '做内容营销的人都知道，写文案最难的不是动笔，而是找到那个「调」。周文案极其擅长揣摩品牌语气——哪怕只给她一句产品描述，她也能迅速拿捏住应该用什么语感。我们在做小红书矩阵账号时，让她负责日常帖子的初稿产出，每次给 4–5 个版本，角度各不相同，总有一个让我眼前一亮。\n\n她还非常会做趋势跟踪，会主动提醒我们什么话题在涨，哪种风格正在出圈。如果你不想在文案上耗费过多精力，周文案是非常可靠的选择。',

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
    selfIntro: '你好，我是周文案。在我看来，写文案这件事，难不在遣词造句，难在先把情绪和语境摸透。什么品牌、什么调性、什么平台、什么受众——这四个问题想清楚了，剩下的才是写。\n\n我的强项是快速切换语气风格：从高冷的高端美妆、到接地气的快消、再到专业感的 B2B SaaS，我都有处理经验。我会对自己写的每一稿给出理由——为什么这样用词、这样断句——这样你就不只是收到一个结果，而是理解了背后的逻辑。改稿效率也更高。',
    reviews: [
      { name: '施雨萌', avatarUrl: 'https://i.pravatar.cc/150?img=45', rating: 5, text: '新品发布会让她写主视觉文案，给了梗概，一小时后收到七个版本。选了第三个直接用于印刷，甲方老板没提任何修改意见。', date: '2026年1月' },
      { name: '褚恒宇', avatarUrl: 'https://i.pravatar.cc/150?img=16', rating: 4, text: '小红书内容产出机器，我的账号日更靠她支撑。细分行业内容需要补充背景，但配合起来非常流畅，粉丝量这三个月涨了 40%。', date: '2025年12月' },
      { name: '邵晴晴', avatarUrl: 'https://i.pravatar.cc/150?img=48', rating: 5, text: '品牌升级时让她重新梳理 slogan，她在动笔前问了很多关于品牌理念的问题——那些问题本身就让我们内部讨论受益匪浅，最后的稿子也非常准。', date: '2025年10月' },
    ],
    tags: ['文案', '营销', '创意写作'],
    isNew: true,
  },
  {
    id: 'agent-5',
    name: '王助理',
    avatar: '🤝',
    avatarUrl: 'https://i.pravatar.cc/150?img=44',
    role: 'assistant',
    slogan: '贴心助理，效率翻倍',
    description: '协助处理日程安排、邮件回复、会议纪要，支持接入飞书、钉钉、Notion 等协作工具。',
    bio: '王助理是那种越用越离不开的伙伴。我是一名独立顾问，日常需要同时管理多个客户的进度，以前总会漏掉一些邮件回复或截止日期。自从有了王助理，把日历、邮件和 Notion 都打通之后，每天早上她会主动梳理当天的重要任务和要跟进的消息，晚上帮我归档会议纪要。\n\n她有一个我特别喜欢的特质：记性好。不需要每次重新交代背景，她记得每个客户的项目状态和上次谈到哪里。对于同时身兼多职的人来说，她是最不容易焦虑的解法。',

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
    selfIntro: '你好，我是王助理。做一个好助理，我认为最重要的不是执行快，而是记性好、判断准。我在乎的是真正帮你减少认知负担——不是让你记得什么事要做，而是让你不需要记，因为我替你记着了。\n\n我和飞书、钉钉、Notion、Google 日历等协作工具都有接入经验，可以帮你把分散在各处的信息打通，形成统一的工作流。早上梳理待办、会后归档纪要、邮件初稿撰写——这些重复但消耗注意力的事，交给我来处理。',
    reviews: [
      { name: '傅宇晨', avatarUrl: 'https://i.pravatar.cc/150?img=22', rating: 5, text: '管三个项目的产品经理用起来太爽了。把飞书和 Notion 串联起来，每天早上一份待办摘要，最重要的是再也不焦虑了。', date: '2026年1月' },
      { name: '魏丽娜', avatarUrl: 'https://i.pravatar.cc/150?img=60', rating: 5, text: '她记得上次会议里说过的所有决策，我问起来直接给到结构化的结果。对于没时间整理的创业团队，这个能力太稀缺了。', date: '2025年12月' },
      { name: '佟磊峰', avatarUrl: 'https://i.pravatar.cc/150?img=28', rating: 4, text: '复杂的跨应用自动化任务偶尔需要多确认几次，但日常的日程和邮件处理已经非常稳定，算是我工作流里最依赖的一个。', date: '2025年11月' },
    ],
    tags: ['日程', '协作', '效率'],
  },
  {
    id: 'agent-6',
    name: '赵客服',
    avatar: '💬',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    role: 'customer_service',
    slogan: '7×24 在线，让客户满意',
    description: '处理常见问题、安抚情绪、升级工单，支持多轮对话与知识库检索，适合电商和 SaaS。',
    bio: '我们是一家做订阅制 SaaS 的小团队，引入赵客服之前，售前咨询基本靠创始人自己扛。接入之后，超过 60% 的常见问题他能直接处理，不需要人工介入。他懂得识别情绪，碰到明显不满的用户，会先共情再解决问题，而不是上来就套模板话术。\n\n还有一点让我们很意外：他在高频交互中会逐渐「学会」我们产品的说话风格，越用越顺滑，感觉不像在用工具，更像在培养一个新客服。',

    skills: [
      { id: 'skill-memory', name: '长期记忆', icon: '🧠', category: 'memory' },
      { id: 'skill-kb', name: '知识库检索', icon: '🔍', category: 'memory' },
      { id: 'skill-email', name: '发送邮件', icon: '📧', category: 'integration' },
    ],
    scenarios: ['FAQ 自动回复', '工单创建', '情绪识别与安抚', '售后跟进'],
    pricing: [
      { id: 'p6-ppu', type: 'pay_per_use', label: '按次付费', price: 50, currency: 'CNY', isFeatured: true },
      { id: 'p6-sub', type: 'subscription', label: '企业版', price: 4900, currency: 'CNY', period: 'month' },
    ],
    rating: { score: 4.4, count: 88 },
    hiredCount: 432,
    selfIntro: '我是赵客服。我觉得客服工作的核心不是「回答问题」，而是「理解用户当时的状态」。同样一个退款请求，背后可能是焦虑、可能是愤怒、也可能只是好奇——处理方式应该不一样。\n\n我熟悉电商和 SaaS 场景下的常见问题类型，支持多轮对话、知识库检索和工单系统接入。我会在每次对话结束后记录用户反馈中的高频问题，逐步帮你完善知识库——让我越来越懂你的产品，也越来越懂你的用户。用的时间越长，越像你自己团队里的人。',
    reviews: [
      { name: '任晓燕', avatarUrl: 'https://i.pravatar.cc/150?img=35', rating: 5, text: '电商店铺每天上百条咨询，接入他之后一线压力减少了 60%，剩下需要人工介入的都是真正的非标场景，他会自动识别并转交。', date: '2026年1月' },
      { name: '丁俊凯', avatarUrl: 'https://i.pravatar.cc/150?img=40', rating: 4, text: '遇到情绪激动的用户他处理得比预期好，安抚语气很自然。产品边界情况偶尔会有偏差，需要定期更新知识库保持准确。', date: '2025年12月' },
      { name: '贾思远', avatarUrl: 'https://i.pravatar.cc/150?img=1', rating: 5, text: '用了两个月，越来越像我们自己的客服，语气和产品口吻都适配了。感觉不是在用工具，更像在带一个新人成长。', date: '2025年11月' },
    ],
    tags: ['客服', '自动化', '知识库'],
    isNew: true,
  },
];

// ─── Mock Skills ────────────────────────────────────────────────
export const mockSkills: MarketSkill[] = [
  {
    id: 'skill-browser-auto',
    name: '浏览器自动化',
    icon: '🌐',
    category: 'web',
    description: 'AI 驱动的浏览器自动化技能，可操控真实浏览器完成网页交互、表单填写、截图采集、数据爬取等任务。支持动态渲染页面，绕过基本反爬机制。适用场景：网页自动化操作、页面功能验证、竞品价格监控、批量数据采集。',
    shortDesc: '操控浏览器完成网页自动化操作与数据采集',
    demos: [
      {
        title: '自动抓取竞品价格',
        input: '每天早上 9 点抓取京东 iPhone 16 的最新售价',
        output: '✅ 已设置定时任务\n今日采集结果：iPhone 16 128G — ¥5,999（降价 ¥200）\n[截图已保存] page_screenshot_20240227.png',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['researcher', 'analyst', 'programmer', 'other'], dependencies: [], conflicts: [] },
    pricing: [{ id: 'sk1-free', type: 'free', label: '永久免费', price: 0, currency: 'CNY' }],
    mountedCount: 8901,
    rating: { score: 4.9, count: 521 },
    isFeatured: true,
  },
  {
    id: 'skill-log-query',
    name: '日志智能查询',
    icon: '📋',
    category: 'data',
    description: '专门用于查询和检索应用日志系统中的日志数据。支持按时间范围、关键词、日志级别、服务名等多条件过滤。可自动识别异常堆栈、关联上下文链路，输出结构化分析报告。适用场景：线上故障排查、性能瓶颈定位、用户行为追踪。',
    shortDesc: '多条件检索应用日志，自动关联异常链路',
    demos: [
      {
        title: '故障快速定位',
        input: '查询昨天下午 2 点到 3 点之间支付服务的 ERROR 日志',
        output: '共找到 47 条 ERROR 日志\n高频错误：NullPointerException @ PaymentService:L234 (出现 31 次)\n关联 traceId：a3f9b2c1d...\n建议检查：订单金额为 0 的边界处理逻辑',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['programmer', 'analyst', 'other'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk2-free', type: 'free', label: '每日 500 次', price: 0, currency: 'CNY', limits: { callsPerMonth: 500 } },
      { id: 'sk2-sub', type: 'subscription', label: '企业版', price: 2900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 6532,
    rating: { score: 4.8, count: 389 },
    isFeatured: true,
  },
  {
    id: 'skill-chat-history',
    name: '对话历史检索',
    icon: '💬',
    category: 'memory',
    description: '查询用户历史对话记录。支持按用户 ID、时间范围、关键词、对话对象等条件精确检索，按对话场景分组展示内容、时间、摘要。适用于客服复盘、用户行为分析、个性化推荐数据挖掘。',
    shortDesc: '按用户 ID 与时间范围检索历史对话记录',
    demos: [
      {
        title: '检索指定用户对话',
        input: '查询用户 uid=10086 最近 7 天关于"退款"的所有对话',
        output: '找到 3 条相关对话\n[2024-02-21] 用户询问退款进度，客服已处理\n[2024-02-24] 用户再次追问，升级工单 #T20240224-09\n[2024-02-26] 退款到账确认，对话关闭',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['customer_service', 'analyst', 'assistant'], dependencies: ['长期记忆'], conflicts: [] },
    pricing: [{ id: 'sk3-free', type: 'free', label: '永久免费', price: 0, currency: 'CNY' }],
    mountedCount: 7823,
    rating: { score: 4.9, count: 634 },
    isFeatured: true,
  },
  {
    id: 'skill-code-locator',
    name: '代码智能定位',
    icon: '🔍',
    category: 'code',
    description: '企业级前端工程代码文件智能定位检索工具。根据用户明确的需求或问题，精准定位需要修改的代码文件位置、函数名称及上下文，减少开发者在大型代码仓库中的搜索时间，提升协作效率。',
    shortDesc: '在大型代码库中精准定位需要修改的文件与函数',
    demos: [
      {
        title: '功能代码定位',
        input: '用户登录失败后的错误提示弹窗逻辑在哪里？',
        output: '📁 src/components/auth/LoginForm.tsx — Line 87\n函数：handleLoginError()\n调用链：onSubmit → loginApi → handleLoginError\n关联文件：src/utils/errorMessages.ts (错误文案配置)',
        outputType: 'text',
      },
    ],
    compatibility: { agentTypes: ['programmer'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk4-ppu', type: 'pay_per_use', label: '按次计费', price: 10, currency: 'CNY' },
      { id: 'sk4-sub', type: 'subscription', label: '月度版', price: 2900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 1876,
    rating: { score: 4.6, count: 142 },
  },
  {
    id: 'skill-monitor-alert',
    name: '监控指标查询',
    icon: '📊',
    category: 'data',
    description: '接入应用监控平台，支持查询 CPU、内存、QPS、P99 延迟、错误率等核心指标。可指定时间区间、服务维度进行聚合分析，自动识别异常区间并给出根因推断。适用于故障复盘、容量规划、SLA 报告生成。',
    shortDesc: '查询服务监控指标，自动识别性能异常区间',
    demos: [
      {
        title: '服务性能分析',
        input: '查询订单服务昨天的 P99 延迟和错误率，有没有异常？',
        output: '订单服务 · 昨日概览\nP99 延迟：平均 42ms，峰值 318ms（21:34 出现尖刺）\n错误率：0.12%，正常水位\n⚠️ 异常：21:30–21:40 延迟上涨，关联数据库慢查询 3 条',
        outputType: 'chart',
      },
    ],
    compatibility: { agentTypes: ['programmer', 'analyst'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk5-free', type: 'free', label: '每月 1000 次', price: 0, currency: 'CNY', limits: { callsPerMonth: 1000 } },
      { id: 'sk5-sub', type: 'subscription', label: '无限版', price: 1900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 4210,
    rating: { score: 4.7, count: 298 },
    isFeatured: true,
  },
  {
    id: 'skill-image-gen',
    name: '文生图',
    icon: '🎨',
    category: 'creative',
    description: '基于文字描述生成高质量图片，支持多种风格：写实摄影、插画、商业海报、抽象艺术。内置品牌风格模板，支持参考图上传。每次生成可输出多种尺寸与比例，直接用于社交媒体、产品页面等场景。',
    shortDesc: '文字描述一键生成多风格高质量图片',
    demos: [
      {
        title: '品牌海报生成',
        input: '生成一张科技感产品发布会海报，蓝紫渐变，极简风格，中英文混排',
        output: '[图片] 已生成 1200×628 海报\n蓝紫渐变背景 · 中心光晕 · 极简排版\n可导出：PNG / SVG / WebP',
        outputType: 'image',
      },
    ],
    compatibility: { agentTypes: ['designer', 'assistant', 'other'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk6-ppu', type: 'pay_per_use', label: '每张 ¥0.5', price: 50, currency: 'CNY' },
      { id: 'sk6-sub', type: 'subscription', label: '月度 200 张', price: 3900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 3456,
    rating: { score: 4.5, count: 267 },
    isFeatured: true,
  },
  {
    id: 'skill-email',
    name: '邮件收发助手',
    icon: '📧',
    category: 'integration',
    description: '代理收发邮件，支持 Gmail、Outlook、企业邮箱（Exchange / 腾讯企业邮）。可智能起草回复、按主题归类、定时发送、设置跟进提醒。支持附件读取与内容摘要，让邮件处理效率提升 80%。',
    shortDesc: '智能起草、归类、定时发送企业邮件',
    demos: [
      {
        title: '自动起草会议邀请',
        input: '给产品团队发会议邀请，明天下午 3 点，讨论 Q2 roadmap，30 分钟',
        output: '✉️ 邮件已起草\n收件人：product-team@company.com\n主题：会议邀请 | Q2 Roadmap 对齐 | 明日 15:00–15:30\n正文：您好，诚邀参加 Q2 产品路线对齐会议…\n[发送] [定时发送] [修改]',
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
    id: 'skill-db-query',
    name: '数据库自然语言查询',
    icon: '🗄️',
    category: 'data',
    description: '连接 MySQL、PostgreSQL、ClickHouse、MongoDB，用自然语言描述查询意图，自动生成并执行 SQL / NoSQL 语句，结果以表格或图表形式呈现。支持只读安全模式，所有语句执行前需用户确认。',
    shortDesc: '用自然语言直接查询数据库，自动生成 SQL',
    demos: [
      {
        title: '自然语言转 SQL',
        input: '查询上个月 GMV 最高的 5 个品类',
        output: 'SELECT category, SUM(amount) AS gmv\nFROM orders\nWHERE created_at >= \'2024-01-01\'\nGROUP BY category ORDER BY gmv DESC LIMIT 5;\n\n结果：服装 ¥1.2M | 3C ¥980K | 美妆 ¥760K …',
        outputType: 'table',
      },
    ],
    compatibility: { agentTypes: ['analyst', 'programmer'], dependencies: [], conflicts: [] },
    pricing: [
      { id: 'sk8-ppu', type: 'pay_per_use', label: '¥0.1/次', price: 10, currency: 'CNY' },
      { id: 'sk8-sub', type: 'subscription', label: '月度版', price: 1900, currency: 'CNY', period: 'month', isFeatured: true },
    ],
    mountedCount: 5234,
    rating: { score: 4.8, count: 412 },
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
