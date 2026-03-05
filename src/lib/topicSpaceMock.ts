// ─── Types ────────────────────────────────────────────────────────────────────

export type SpaceStatus = 'active' | 'completed' | 'paused' | 'planned';
export type MemberRole = 'tbox' | 'lead' | 'collaborator' | 'observer';
export type DocSource = 'user_upload' | 'agent_output';
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type SkillSource = 'system' | 'market' | 'custom';
export type RoadmapStatus = 'todo' | 'in_progress' | 'done';
export type KnowledgeAssetType = 'definition' | 'tech' | 'visual';
export type InsightRiskLevel = 'high' | 'medium' | 'low';
export type InsightActionType = 'task' | 'conversation';

export interface TboxSkill {
  id: string;
  name: string;
  icon: string;             // emoji or lucide icon name
  description: string;
  source: SkillSource;
  command: string;          // e.g. '/search'
  addedAt: string;
}

export interface ProjectTbox {
  /** Display name; null means unnamed ("Tbox · [space name]") */
  customName: string | null;
  avatarUrl?: string;
  intro?: string;
  skills: TboxSkill[];
  /** true once user has named and saved as Agent */
  savedAsAgent: boolean;
  agentId?: string;
  /** true once user dismisses the naming guide bubble */
  namingGuideDismissed: boolean;
}

export interface SpaceTag {
  id: string;
  label: string;
  color: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ProjectManifesto {
  intent: string;
  standards: string;
  constraints: string;
  updatedAt: string;
  sourceConversations?: string[];
}

export interface RoadmapDeliverable {
  id: string;
  title: string;
  type: 'document' | 'conversation' | 'pull_request';
  ref: string;
}

export interface EvolutionMilestone {
  id: string;
  title: string;
  targetDate: string;
  status: RoadmapStatus;
  deliverables: RoadmapDeliverable[];
  stageSummary?: string;
  summaryConfirmed?: boolean;
}

export interface KnowledgeAsset {
  id: string;
  type: KnowledgeAssetType;
  title: string;
  description: string;
  value?: string;
  frequency?: number;
  sourceRef: string;
  thumbnailUrl?: string;
  pinned?: boolean;
  deprecated?: boolean;
  updatedAt: string;
}

export interface InsightRisk {
  id: string;
  title: string;
  level: InsightRiskLevel;
  reason: string;
  sourceRef: string;
}

export interface InsightAction {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  eta: string;
  benefit: string;
  type: InsightActionType;
  sourceRef: string;
}

export interface ProjectInsight {
  healthScore: number;
  trendDelta: number;
  forecast: number;
  confidence: number;
  updatedAt: string;
  risks: InsightRisk[];
  nextActions: InsightAction[];
}

export interface SpaceMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;       // emoji fallback
  avatarUrl?: string;
  jobTitle: string;
  statTasks: number;
  statDocs: number;
  statChats: number;
  status: 'busy' | 'idle' | 'standby';
  joinedAt: string;
}

export interface SpaceDocument {
  id: string;
  title: string;
  format: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'MD' | 'PNG' | 'TXT';
  source: DocSource;
  agentName?: string;
  agentAvatar?: string;
  conversationId?: string;
  /** true = user has not yet viewed this document since it appeared */
  isNew: boolean;
  createdAt: string;
  size: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  agentName?: string;
  agentAvatar?: string;
  text: string;
  time: string;
  hasDoc?: boolean;
  docTitle?: string;
}

export interface SpaceConversation {
  id: string;
  title: string;
  /** 'tbox' = conversation with project Tbox; 'agent' = conversation with an invited Agent */
  conversationType: 'tbox' | 'agent';
  agentName: string;
  agentAvatar: string;
  lastMessage: string;
  time: string;
  messageCount: number;
  docCount: number;
  messages: ChatMessage[];
}

export interface SpaceTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  agentName: string;
  agentAvatar: string;
  deadline: string;
  category: string;
  docCount: number;
}

export interface ActivityItem {
  id: string;
  type: 'doc_created' | 'conv_started' | 'task_done' | 'member_joined' | 'milestone';
  text: string;
  time: string;
  agentAvatar?: string;
  agentName?: string;
}

export interface TopicSpace {
  id: string;
  name: string;
  description: string;
  emoji: string;
  coverGradient: string;
  tags: SpaceTag[];
  status: SpaceStatus;
  goal: string;
  manifesto: ProjectManifesto;
  roadmap: EvolutionMilestone[];
  insight: ProjectInsight;
  knowledgeAssets: KnowledgeAsset[];
  milestones: Milestone[];
  members: SpaceMember[];
  tbox: ProjectTbox;
  documents: SpaceDocument[];
  conversations: SpaceConversation[];
  tasks: SpaceTask[];
  activity: ActivityItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const space1Members: SpaceMember[] = [
  {
    id: 'm1', name: '策划助理 Aria', role: 'lead', avatar: '🎯',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    jobTitle: '内容策划 Agent', statTasks: 12, statDocs: 8, statChats: 34,
    status: 'busy', joinedAt: '2025-11-01',
  },
  {
    id: 'm2', name: '数据分析师 Sage', role: 'collaborator', avatar: '📊',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    jobTitle: '数据分析 Agent', statTasks: 6, statDocs: 5, statChats: 18,
    status: 'idle', joinedAt: '2025-11-05',
  },
  {
    id: 'm3', name: '设计师 Nova', role: 'collaborator', avatar: '🎨',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    jobTitle: '视觉设计 Agent', statTasks: 4, statDocs: 9, statChats: 11,
    status: 'standby', joinedAt: '2025-11-10',
  },
];

const space1Docs: SpaceDocument[] = [
  {
    id: 'd1', title: 'Q4 推广方案 v3.0', format: 'PPTX', source: 'agent_output',
    agentName: '策划助理 Aria', agentAvatar: '🎯',
    conversationId: 'c1', isNew: false, createdAt: '2026-02-28', size: '4.2 MB',
    tags: ['方案', '最终版'],
  },
  {
    id: 'd2', title: '竞品投放分析报告', format: 'PDF', source: 'agent_output',
    agentName: '数据分析师 Sage', agentAvatar: '📊',
    conversationId: 'c3', isNew: true, createdAt: '2026-03-01', size: '2.8 MB',
    tags: ['竞品', '分析'],
  },
  {
    id: 'd3', title: '媒介费用预算表', format: 'XLSX', source: 'agent_output',
    agentName: '数据分析师 Sage', agentAvatar: '📊',
    conversationId: 'c2', isNew: true, createdAt: '2026-03-01', size: '0.9 MB',
    tags: ['预算', '媒介'],
  },
  {
    id: 'd4', title: 'Q3 历史数据.xlsx', format: 'XLSX', source: 'user_upload',
    isNew: false, createdAt: '2025-11-02', size: '1.1 MB', tags: ['原始数据'],
  },
  {
    id: 'd5', title: '品牌视觉规范 2025', format: 'PDF', source: 'user_upload',
    isNew: false, createdAt: '2025-11-02', size: '8.3 MB', tags: ['品牌', '规范'],
  },
  {
    id: 'd6', title: '活动视觉稿 v1', format: 'PNG', source: 'agent_output',
    agentName: '设计师 Nova', agentAvatar: '🎨',
    isNew: true, createdAt: '2026-03-02', size: '3.5 MB',
    tags: ['设计', '视觉'],
  },
];

const space1Convs: SpaceConversation[] = [
  {
    id: 'c0', title: '项目规划讨论',
    conversationType: 'tbox',
    agentName: 'Tbox', agentAvatar: '🤖',
    lastMessage: '好的，已帮你梳理了本项目的核心目标和关键里程碑',
    time: '今天 09:00', messageCount: 4, docCount: 0,
    messages: [
      { id: 'tc1', role: 'user', text: '帮我整理一下这个项目的核心目标', time: '09:00' },
      { id: 'tc2', role: 'agent', agentName: 'Tbox', agentAvatar: '🤖', text: '根据项目背景，核心目标是：在 Q4 期间实现品牌声量提升 40%，新客转化提升 25%，ROI ≥ 3.0。\n\n建议先完成媒介策略方案，再推进竞品分析和视觉物料制作。', time: '09:01' },
    ],
  },
  {
    id: 'c1', title: '推广渠道策略讨论',
    conversationType: 'agent',
    agentName: '策划助理 Aria', agentAvatar: '🎯',
    lastMessage: '建议将 40% 预算集中在抖音信息流，ROI 预测更高',
    time: '今天 14:32', messageCount: 18, docCount: 2,
    messages: [
      { id: 'msg1', role: 'user', text: '帮我分析一下 Q4 应该重点在哪几个渠道投放，预算 200 万', time: '14:10' },
      { id: 'msg2', role: 'agent', agentName: '策划助理 Aria', agentAvatar: '🎯', text: '根据去年 Q4 数据和本次目标人群（25-35岁女性），建议重点布局以下三个渠道：\n\n1. **抖音信息流**（建议占比 40%）：目标用户覆盖率最高，CPM 约 15-20 元\n2. **小红书种草**（建议占比 30%）：适合产品口碑建设，KOC 合作性价比高\n3. **微博热点借势**（建议占比 20%）：节点营销配套，提升品牌声量', time: '14:15' },
      { id: 'msg3', role: 'user', text: '好，帮我出一版详细的媒介排期方案', time: '14:20' },
      { id: 'msg4', role: 'agent', agentName: '策划助理 Aria', agentAvatar: '🎯', text: '已为您生成《Q4 媒介排期方案》，包含各渠道节点、投放时间轴和预算分配表，请查收。', time: '14:28', hasDoc: true, docTitle: 'Q4 推广方案 v3.0' },
    ],
  },
  {
    id: 'c2', title: 'Q4 预算拆解核算',
    conversationType: 'agent',
    agentName: '数据分析师 Sage', agentAvatar: '📊',
    lastMessage: '媒介费用表已更新，请确认第三行数据',
    time: '今天 10:14', messageCount: 7, docCount: 1,
    messages: [
      { id: 'msg5', role: 'user', text: '把 200 万预算按渠道拆解成 Excel', time: '10:00' },
      { id: 'msg6', role: 'agent', agentName: '数据分析师 Sage', agentAvatar: '📊', text: '已完成预算拆解，生成《媒介费用预算表》，其中第三行（微博）数据基于去年均价估算，建议您与媒介团队确认最新报价。', time: '10:10', hasDoc: true, docTitle: '媒介费用预算表' },
    ],
  },
  {
    id: 'c3', title: '竞品活动案例研究',
    conversationType: 'agent',
    agentName: '数据分析师 Sage', agentAvatar: '📊',
    lastMessage: '已整理 5 个竞品 Q4 活动案例，报告生成中',
    time: '昨天 16:45', messageCount: 12, docCount: 1,
    messages: [
      { id: 'msg7', role: 'user', text: '帮我调研一下竞品去年 Q4 都做了什么', time: '16:30' },
      { id: 'msg8', role: 'agent', agentName: '数据分析师 Sage', agentAvatar: '📊', text: '已整理5个核心竞品（A品牌、B品牌等）的Q4活动数据，涵盖渠道组合、创意策略和声量表现，《竞品投放分析报告》已发布至文档区，请审核。', time: '16:45', hasDoc: true, docTitle: '竞品投放分析报告' },
    ],
  },
];

const space1Tasks: SpaceTask[] = [
  {
    id: 't1', title: '撰写 Q4 媒介策略完整报告', description: '包含渠道分析、预算分配、执行时间轴，输出 PDF',
    status: 'done', priority: 'high',
    agentName: '策划助理 Aria', agentAvatar: '🎯',
    deadline: '2026-02-28', category: '内容创作', docCount: 1,
  },
  {
    id: 't2', title: '竞品 Q4 投放案例研究', description: '调研 5 个主要竞品去年 Q4 的推广策略与效果',
    status: 'review', priority: 'high',
    agentName: '数据分析师 Sage', agentAvatar: '📊',
    deadline: '2026-03-03', category: '数据分析', docCount: 1,
  },
  {
    id: 't3', title: '制作活动主视觉 KV', description: '根据品牌规范出 3 套风格方向，每套提供 Banner+海报',
    status: 'in_progress', priority: 'medium',
    agentName: '设计师 Nova', agentAvatar: '🎨',
    deadline: '2026-03-05', category: '设计', docCount: 0,
  },
  {
    id: 't4', title: '小红书 KOC 合作名单筛选', description: '筛选粉丝量 5-50 万、女性受众为主的美妆 KOC 共 20 位',
    status: 'in_progress', priority: 'medium',
    agentName: '策划助理 Aria', agentAvatar: '🎯',
    deadline: '2026-03-06', category: '数据分析', docCount: 0,
  },
  {
    id: 't5', title: '拟定各渠道文案模板', description: '为抖音、小红书、微博分别产出 5 套备用文案',
    status: 'backlog', priority: 'low',
    agentName: '策划助理 Aria', agentAvatar: '🎯',
    deadline: '2026-03-10', category: '内容创作', docCount: 0,
  },
  {
    id: 't6', title: '预算执行跟踪模板搭建', description: '建立可按周更新的预算执行追踪 Excel 表',
    status: 'backlog', priority: 'low',
    agentName: '数据分析师 Sage', agentAvatar: '📊',
    deadline: '2026-03-12', category: '数据分析', docCount: 0,
  },
];

const space1Activity: ActivityItem[] = [
  { id: 'a1', type: 'doc_created', text: '设计师 Nova 产出了《活动视觉稿 v1》', time: '刚刚', agentAvatar: '🎨', agentName: '设计师 Nova' },
  { id: 'a2', type: 'doc_created', text: '数据分析师 Sage 产出了《竞品投放分析报告》', time: '2小时前', agentAvatar: '📊', agentName: '数据分析师 Sage' },
  { id: 'a3', type: 'task_done', text: '任务「撰写 Q4 媒介策略完整报告」已完成', time: '昨天', agentAvatar: '🎯', agentName: '策划助理 Aria' },
  { id: 'a4', type: 'conv_started', text: '新建对话「竞品活动案例研究」', time: '昨天', agentAvatar: '📊', agentName: '数据分析师 Sage' },
  { id: 'a5', type: 'milestone', text: '里程碑「完成媒介策略方案」已达成 🎉', time: '2天前' },
  { id: 'a6', type: 'member_joined', text: '设计师 Nova 加入了空间', time: '3天前', agentAvatar: '🎨', agentName: '设计师 Nova' },
];

// ─── Space 2 ──────────────────────────────────────────────────────────────────

const space2Members: SpaceMember[] = [
  {
    id: 's2m1', name: '研究员 Atlas', role: 'lead', avatar: '🔬',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    jobTitle: '市场研究 Agent', statTasks: 8, statDocs: 11, statChats: 22,
    status: 'busy', joinedAt: '2025-10-15',
  },
  {
    id: 's2m2', name: '技术分析师 Helix', role: 'collaborator', avatar: '⚡',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    jobTitle: '技术研究 Agent', statTasks: 5, statDocs: 7, statChats: 14,
    status: 'idle', joinedAt: '2025-10-20',
  },
];

const space2Docs: SpaceDocument[] = [
  {
    id: 's2d1', title: '芯片市场全景报告 2025', format: 'PDF', source: 'agent_output',
    agentName: '研究员 Atlas', agentAvatar: '🔬',
    conversationId: 's2c1', isNew: false, createdAt: '2026-02-20', size: '6.1 MB',
    tags: ['报告', '市场'],
  },
  {
    id: 's2d2', title: '竞品技术路线对比', format: 'PPTX', source: 'agent_output',
    agentName: '技术分析师 Helix', agentAvatar: '⚡',
    isNew: true, createdAt: '2026-03-01', size: '3.4 MB',
    tags: ['技术', '竞品'],
  },
  {
    id: 's2d3', title: '英伟达 & AMD 产品线资料', format: 'PDF', source: 'user_upload',
    isNew: false, createdAt: '2025-10-16', size: '12.5 MB', tags: ['原始资料'],
  },
];

const space2Tasks: SpaceTask[] = [
  { id: 's2t1', title: '撰写芯片市场全景报告', description: '', status: 'done', priority: 'high', agentName: '研究员 Atlas', agentAvatar: '🔬', deadline: '2026-02-20', category: '研究', docCount: 1 },
  { id: 's2t2', title: '竞品技术路线对比分析', description: '', status: 'review', priority: 'high', agentName: '技术分析师 Helix', agentAvatar: '⚡', deadline: '2026-03-05', category: '研究', docCount: 1 },
  { id: 's2t3', title: '供应链风险雷达图制作', description: '', status: 'in_progress', priority: 'medium', agentName: '研究员 Atlas', agentAvatar: '🔬', deadline: '2026-03-08', category: '数据', docCount: 0 },
];

const space2Activity: ActivityItem[] = [
  { id: 's2a1', type: 'doc_created', text: '技术分析师 Helix 产出了《竞品技术路线对比》', time: '1天前', agentAvatar: '⚡', agentName: '技术分析师 Helix' },
  { id: 's2a2', type: 'task_done', text: '任务「撰写芯片市场全景报告」已完成', time: '10天前', agentAvatar: '🔬', agentName: '研究员 Atlas' },
];

// ─── Space 3 ──────────────────────────────────────────────────────────────────

const space3Members: SpaceMember[] = [
  {
    id: 's3m1', name: '销售教练 Rex', role: 'lead', avatar: '💼',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    jobTitle: '销售分析 Agent', statTasks: 10, statDocs: 6, statChats: 28,
    status: 'idle', joinedAt: '2025-09-01',
  },
];

const space3Docs: SpaceDocument[] = [
  {
    id: 's3d1', title: 'Q3 销售团队复盘报告', format: 'PDF', source: 'agent_output',
    agentName: '销售教练 Rex', agentAvatar: '💼',
    isNew: false, createdAt: '2025-10-05', size: '2.2 MB',
    tags: ['复盘', 'Q3'],
  },
  {
    id: 's3d2', title: 'Q3 销售数据原始表', format: 'XLSX', source: 'user_upload',
    isNew: false, createdAt: '2025-09-30', size: '0.7 MB', tags: ['数据'],
  },
];

const space3Tasks: SpaceTask[] = [
  { id: 's3t1', title: '产出 Q3 销售复盘报告', description: '', status: 'done', priority: 'high', agentName: '销售教练 Rex', agentAvatar: '💼', deadline: '2025-10-05', category: '报告', docCount: 1 },
  { id: 's3t2', title: 'Q4 销售目标拆解建议', description: '', status: 'backlog', priority: 'medium', agentName: '销售教练 Rex', agentAvatar: '💼', deadline: '2026-03-15', category: '策略', docCount: 0 },
];

const space3Activity: ActivityItem[] = [
  { id: 's3a1', type: 'task_done', text: '任务「产出 Q3 销售复盘报告」已完成', time: '5个月前', agentAvatar: '💼', agentName: '销售教练 Rex' },
];

// ─── Exported Spaces List ─────────────────────────────────────────────────────

const space1Tbox: ProjectTbox = {
  customName: null,
  skills: [
    { id: 'sk1', name: '联网搜索', icon: '🌐', description: '实时搜索网络信息', source: 'system', command: '/search', addedAt: '2026-01-10' },
    { id: 'sk2', name: '数据分析', icon: '📊', description: '读取并分析 Excel / CSV 文件', source: 'system', command: '/analyze', addedAt: '2026-01-15' },
    { id: 'sk3', name: '图像生成', icon: '🎨', description: '通过文字描述生成图片', source: 'market', command: '/image', addedAt: '2026-02-01' },
  ],
  savedAsAgent: false,
  namingGuideDismissed: false,
};

const space2Tbox: ProjectTbox = {
  customName: '芯片观察员',
  intro: '专注于芯片行业深度研究，已积累大量半导体领域知识。',
  avatarUrl: 'https://i.pravatar.cc/150?img=60',
  skills: [
    { id: 'sk4', name: '联网搜索', icon: '🌐', description: '实时搜索网络信息', source: 'system', command: '/search', addedAt: '2025-10-20' },
    { id: 'sk5', name: '代码执行', icon: '💻', description: '运行 Python 脚本，处理数据', source: 'system', command: '/run', addedAt: '2025-11-01' },
  ],
  savedAsAgent: true,
  agentId: 'my-agent-chip-watcher',
  namingGuideDismissed: true,
};

const space3Tbox: ProjectTbox = {
  customName: null,
  skills: [
    { id: 'sk6', name: '联网搜索', icon: '🌐', description: '实时搜索网络信息', source: 'system', command: '/search', addedAt: '2025-09-05' },
  ],
  savedAsAgent: false,
  namingGuideDismissed: true,
};

export const mockTopicSpaces: TopicSpace[] = [
  {
    id: 'space-1',
    name: 'Q4 产品推广方案',
    description: '制定并执行 2025 年 Q4 品牌推广策略，预算 200 万，覆盖全渠道媒介投放与创意执行。',
    emoji: '🚀',
    coverGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    status: 'active',
    tags: [
      { id: 'tag1', label: '推广', color: '#5856d6' },
      { id: 'tag2', label: 'Q4', color: '#ff9500' },
      { id: 'tag3', label: '媒介', color: '#34c759' },
    ],
    goal: '在 Q4 期间实现品牌声量提升 40%，新客转化提升 25%，控制 ROI ≥ 3.0。',
    manifesto: {
      intent: '- 完成 v8.33 设置页配置化重构\n- 让 AI 在任意新会话都继承项目背景\n- 将阶段结论自动沉淀为后续输入',
      standards: '- UI：保持简洁卡片式布局，突出首屏核心信息\n- 代码：优先复用现有组件与类型，避免破坏现有路由\n- 逻辑：所有结论必须有来源对话/文档可追溯',
      constraints: '- 严禁使用三级菜单\n- 不新增与概览无关的入口\n- 不在概览页展示噪音级活动流水',
      updatedAt: '2026-03-03 09:20',
      sourceConversations: ['c0', 'c1'],
    },
    roadmap: [
      {
        id: 'rm1',
        title: '完成信息架构重构方案',
        targetDate: '2026-02-28',
        status: 'done',
        deliverables: [
          { id: 'rmd1', title: '《Q4 推广方案 v3.0》', type: 'document', ref: 'd1' },
          { id: 'rmd2', title: '项目规划讨论', type: 'conversation', ref: 'c0' },
        ],
        stageSummary: '确认以“项目宪法 + 里程碑 + 知识资产”作为概览页主结构，弃用活动流水主导的信息组织方式。',
        summaryConfirmed: true,
      },
      {
        id: 'rm2',
        title: '竞品分析报告审核与修订',
        targetDate: '2026-03-05',
        status: 'in_progress',
        deliverables: [
          { id: 'rmd3', title: '《竞品投放分析报告》', type: 'document', ref: 'd2' },
          { id: 'rmd4', title: '竞品活动案例研究', type: 'conversation', ref: 'c3' },
        ],
      },
      {
        id: 'rm3',
        title: '主视觉 KV 定稿与投放准备',
        targetDate: '2026-03-08',
        status: 'todo',
        deliverables: [
          { id: 'rmd5', title: '《活动视觉稿 v1》', type: 'document', ref: 'd6' },
        ],
      },
    ],
    insight: {
      healthScore: 74,
      trendDelta: 6,
      forecast: 78,
      confidence: 84,
      updatedAt: '2026-03-03 11:10',
      risks: [
        {
          id: 'ir1',
          title: '竞品报告审核延迟风险',
          level: 'high',
          reason: '当前阶段核心交付物仍处于审核中，可能影响后续主视觉定稿节奏。',
          sourceRef: 'rm2',
        },
        {
          id: 'ir2',
          title: '预算数据口径未二次确认',
          level: 'medium',
          reason: '媒介费用预算表存在估算项，尚未完成外部报价确认。',
          sourceRef: 'd3',
        },
      ],
      nextActions: [
        {
          id: 'ia1',
          title: '发起“竞品报告终审”对话并锁定修订截止时间',
          priority: 'P0',
          eta: '20 分钟',
          benefit: '可直接降低里程碑 rm2 延误概率',
          type: 'conversation',
          sourceRef: 'rm2',
        },
        {
          id: 'ia2',
          title: '将“预算第三行报价复核”转为任务并指定负责人',
          priority: 'P1',
          eta: '15 分钟',
          benefit: '提升投放测算可信度，减少后续返工',
          type: 'task',
          sourceRef: 'd3',
        },
        {
          id: 'ia3',
          title: '同步主视觉输入约束给设计协作链路',
          priority: 'P2',
          eta: '10 分钟',
          benefit: '避免视觉方案与项目宪法冲突',
          type: 'conversation',
          sourceRef: 'ka3',
        },
      ],
    },
    knowledgeAssets: [
      {
        id: 'ka1',
        type: 'definition',
        title: 'ROI 目标口径',
        description: '本项目 ROI 统一以投放周期内新增收入 / 媒介总投入计算。',
        value: '目标 ≥ 3.0',
        frequency: 18,
        sourceRef: 'c0',
        pinned: true,
        updatedAt: '2026-03-02',
      },
      {
        id: 'ka2',
        type: 'tech',
        title: '渠道投放优先级',
        description: '抖音信息流 > 小红书种草 > 微博节点借势。',
        value: '40% / 30% / 20%',
        frequency: 12,
        sourceRef: 'c1',
        pinned: true,
        updatedAt: '2026-03-01',
      },
      {
        id: 'ka3',
        type: 'visual',
        title: '活动视觉稿 v1',
        description: '暖色高对比风格，适配首页 Banner 与信息流封面。',
        thumbnailUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=600&auto=format&fit=crop',
        sourceRef: 'd6',
        updatedAt: '2026-03-02',
      },
      {
        id: 'ka4',
        type: 'definition',
        title: '高价值新客定义',
        description: '首单金额 > 299 且 30 天内二次访问用户。',
        frequency: 9,
        sourceRef: 'c0',
        updatedAt: '2026-02-28',
      },
    ],
    milestones: [
      { id: 'ms1', title: '完成媒介策略方案', dueDate: '2026-02-28', completed: true },
      { id: 'ms2', title: '竞品分析报告审核通过', dueDate: '2026-03-05', completed: false },
      { id: 'ms3', title: '主视觉 KV 定稿', dueDate: '2026-03-08', completed: false },
      { id: 'ms4', title: '全部物料交付完成', dueDate: '2026-03-15', completed: false },
    ],
    members: space1Members,
    tbox: space1Tbox,
    documents: space1Docs,
    conversations: space1Convs,
    tasks: space1Tasks,
    activity: space1Activity,
    createdAt: '2025-11-01',
    updatedAt: '2026-03-02',
  },
  {
    id: 'space-2',
    name: '芯片市场竞品分析',
    description: '系统梳理当前主流芯片厂商的产品路线、市场份额与竞争态势，为产品战略提供决策依据。',
    emoji: '⚙️',
    coverGradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    status: 'active',
    tags: [
      { id: 'tag4', label: '研究', color: '#007aff' },
      { id: 'tag5', label: '竞品', color: '#ff2d55' },
    ],
    goal: '完成覆盖英伟达、AMD、英特尔、高通四家主要厂商的全面竞品分析报告，识别关键机会与威胁。',
    manifesto: {
      intent: '- 形成可用于 2026 产品战略评审的竞品研究基线',
      standards: '- 所有结论需附数据来源与采样时间\n- 图表使用统一口径',
      constraints: '- 不输出无来源结论\n- 不混用训练芯片与推理芯片统计口径',
      updatedAt: '2026-03-01 14:20',
      sourceConversations: ['s2c1'],
    },
    roadmap: [
      {
        id: 's2rm1',
        title: '市场全景报告完成',
        targetDate: '2026-02-20',
        status: 'done',
        deliverables: [{ id: 's2rmd1', title: '芯片市场全景报告 2025', type: 'document', ref: 's2d1' }],
        stageSummary: '确认英伟达在训练市场保持主导，后续重点转向推理场景差异化。',
        summaryConfirmed: true,
      },
      {
        id: 's2rm2',
        title: '技术路线对比审核',
        targetDate: '2026-03-05',
        status: 'in_progress',
        deliverables: [{ id: 's2rmd2', title: '竞品技术路线对比', type: 'document', ref: 's2d2' }],
      },
    ],
    insight: {
      healthScore: 69,
      trendDelta: 2,
      forecast: 71,
      confidence: 80,
      updatedAt: '2026-03-03 10:20',
      risks: [
        {
          id: 's2ir1',
          title: '技术路线审核节点压力',
          level: 'medium',
          reason: '当前只有单份对比文档，缺少补充实验数据支撑。',
          sourceRef: 's2rm2',
        },
      ],
      nextActions: [
        {
          id: 's2ia1',
          title: '补充推理场景 benchmark 数据对比',
          priority: 'P0',
          eta: '40 分钟',
          benefit: '显著提高审核通过概率',
          type: 'task',
          sourceRef: 's2d2',
        },
        {
          id: 's2ia2',
          title: '发起与研究员 Atlas 的审稿对话',
          priority: 'P1',
          eta: '15 分钟',
          benefit: '减少关键结论争议',
          type: 'conversation',
          sourceRef: 's2c1',
        },
      ],
    },
    knowledgeAssets: [
      {
        id: 's2ka1',
        type: 'definition',
        title: '训练芯片市占口径',
        description: '仅统计数据中心训练场景，不包含边缘推理。',
        sourceRef: 's2c1',
        frequency: 7,
        pinned: true,
        updatedAt: '2026-03-01',
      },
    ],
    milestones: [
      { id: 'ms5', title: '市场全景报告完成', dueDate: '2026-02-20', completed: true },
      { id: 'ms6', title: '技术路线对比审核', dueDate: '2026-03-05', completed: false },
      { id: 'ms7', title: '最终战略建议书', dueDate: '2026-03-20', completed: false },
    ],
    members: space2Members,
    tbox: space2Tbox,
    documents: space2Docs,
    conversations: [
      {
        id: 's2c1', title: '市场份额与增长趋势分析',
        conversationType: 'agent',
        agentName: '研究员 Atlas', agentAvatar: '🔬',
        lastMessage: '2024 年 AI 芯片市场规模约 670 亿美元，英伟达市占率超 80%',
        time: '2天前', messageCount: 14, docCount: 1,
        messages: [
          { id: 'm1', role: 'user', text: '给我分析一下当前 AI 芯片市场的份额分布', time: '10:00' },
          { id: 'm2', role: 'agent', agentName: '研究员 Atlas', agentAvatar: '🔬', text: '2024 年全球 AI 训练芯片市场：英伟达 ~83%，AMD ~10%，其他（英特尔 Gaudi、谷歌 TPU 等）~7%。推理芯片竞争更为多元化，ARM 生态快速崛起。完整报告已产出，请查收。', time: '10:15', hasDoc: true, docTitle: '芯片市场全景报告 2025' },
        ],
      },
    ],
    tasks: space2Tasks,
    activity: space2Activity,
    createdAt: '2025-10-15',
    updatedAt: '2026-03-01',
  },
  {
    id: 'space-3',
    name: '销售团队 Q3 复盘',
    description: '回顾 2025 年 Q3 销售团队表现，总结方法论，制定 Q4 提升计划。',
    emoji: '📈',
    coverGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    status: 'completed',
    tags: [
      { id: 'tag6', label: '销售', color: '#f5576c' },
      { id: 'tag7', label: '复盘', color: '#8e8e93' },
    ],
    goal: '系统复盘 Q3 销售表现，识别 Top 3 增长杠杆和 Top 3 改进项，形成方法论沉淀。',
    manifesto: {
      intent: '- 沉淀 Q3 可复用打法并指导 Q4 团队执行',
      standards: '- 复盘必须包含结论、原因、行动项三段式',
      constraints: '- 不使用未经验证的销售线索样本',
      updatedAt: '2025-10-08 17:40',
    },
    roadmap: [
      {
        id: 's3rm1',
        title: '完成 Q3 复盘报告',
        targetDate: '2025-10-05',
        status: 'done',
        deliverables: [{ id: 's3rmd1', title: 'Q3 销售团队复盘报告', type: 'document', ref: 's3d1' }],
        stageSummary: '完成增长杠杆识别，后续进入 Q4 指标拆解阶段。',
        summaryConfirmed: true,
      },
    ],
    insight: {
      healthScore: 86,
      trendDelta: 1,
      forecast: 89,
      confidence: 77,
      updatedAt: '2026-03-03 08:50',
      risks: [
        {
          id: 's3ir1',
          title: 'Q4 目标拆解尚未启动',
          level: 'low',
          reason: '复盘已完成，但后续执行拆解动作尚未排期。',
          sourceRef: 'ms10',
        },
      ],
      nextActions: [
        {
          id: 's3ia1',
          title: '将 Q4 目标拆解建议转化为执行计划',
          priority: 'P1',
          eta: '25 分钟',
          benefit: '保持复盘成果持续转化',
          type: 'task',
          sourceRef: 'ms10',
        },
      ],
    },
    knowledgeAssets: [
      {
        id: 's3ka1',
        type: 'definition',
        title: 'Top Sales Playbook',
        description: '高绩效销售流程拆解模板（开场-诊断-方案-收口）。',
        sourceRef: 's3d1',
        pinned: true,
        updatedAt: '2025-10-05',
      },
    ],
    milestones: [
      { id: 'ms8', title: '收集 Q3 全量数据', dueDate: '2025-10-01', completed: true },
      { id: 'ms9', title: '完成复盘报告', dueDate: '2025-10-05', completed: true },
      { id: 'ms10', title: 'Q4 目标拆解建议', dueDate: '2026-03-15', completed: false },
    ],
    members: space3Members,
    tbox: space3Tbox,
    documents: space3Docs,
    conversations: [],
    tasks: space3Tasks,
    activity: space3Activity,
    createdAt: '2025-09-01',
    updatedAt: '2025-10-10',
  },
];

export function getSpaceById(id: string): TopicSpace | undefined {
  return mockTopicSpaces.find(s => s.id === id);
}

export const STATUS_LABELS: Record<SpaceStatus, string> = {
  active: '进行中',
  completed: '已完成',
  paused: '已暂停',
  planned: '计划中',
};

export const STATUS_COLORS: Record<SpaceStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
  completed: { bg: '#f0f9ff', text: '#0369a1', dot: '#38bdf8' },
  paused: { bg: '#fff7ed', text: '#c2410c', dot: '#fb923c' },
  planned: { bg: '#faf5ff', text: '#7c3aed', dot: '#a78bfa' },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: '待分配', in_progress: '进行中', review: '待审核', done: '已完成',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高', medium: '中', low: '低',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#ff3b30', medium: '#ff9500', low: '#34c759',
};


