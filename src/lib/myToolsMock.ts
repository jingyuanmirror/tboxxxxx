// Mock data for "我的技能" (My Tools) — agents & skills owned by the current user
import type { AgentRole, SkillCategory } from './marketMock';

export type AssetSource = 'built' | 'purchased';

/** Status of a listing on the marketplace */
export type ListingStatus = 'unlisted' | 'pending' | 'listed' | 'rejected';

export interface ListingPricing {
  type: 'free' | 'subscription' | 'pay_per_use';
  price?: number;       // CNY yuan
  currency: 'CNY';
  period?: 'month' | 'year';
}

export interface ListingInfo {
  status: ListingStatus;
  submittedAt?: string;   // ISO date
  listedAt?: string;      // ISO date
  subscriberCount?: number; // cumulative subscribers
  rejectedReason?: string;
  marketId?: string;      // assigned after listing is approved
  pricing: ListingPricing;
  tags: string[];         // up to 3 scenario tags
  coverDescription: string; // marketplace-facing description
}

export interface MyAgent {
  id: string;
  name: string;
  avatar: string;      // emoji fallback
  avatarUrl?: string;  // real photo url
  role: AgentRole;
  slogan: string;
  mountedSkillIds: string[];
  source: AssetSource;
  isEnabled: boolean;
  createdAt: string;   // ISO date string
  marketId?: string;   // set when source === 'purchased'
  hireDuration?: string;  // e.g. '12 天' — only for purchased agents
  projectCount?: number;  // projects this agent has participated in
  listing?: ListingInfo;  // only for source === 'built'
}

export interface MySkill {
  id: string;
  name: string;
  icon: string;        // emoji or lucide icon name
  category: SkillCategory;
  description: string;
  source: AssetSource;
  isEnabled: boolean;
  usedByAgentIds: string[];
  createdAt: string;
  marketId?: string;
  config?: Record<string, unknown>;
  listing?: ListingInfo;  // only for source === 'built'
}

// ─── Mock My Agents ────────────────────────────────────────────────────────
export const myAgents: MyAgent[] = [
  {
    id: 'ma-1',
    name: '情报官',
    avatar: '🕵️',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    role: 'researcher',
    slogan: '每天早上为你推送最新竞品动态',
    mountedSkillIds: ['ms-1', 'ms-2', 'ms-5'],
    source: 'built',
    isEnabled: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'ma-2',
    name: '周报小助手',
    avatar: '📝',
    avatarUrl: 'https://i.pravatar.cc/150?img=56',
    role: 'assistant',
    slogan: '每周五自动汇总本周工作，生成周报草稿',
    mountedSkillIds: ['ms-3', 'ms-4'],
    source: 'built',
    isEnabled: true,
    createdAt: '2026-01-20',
    listing: {
      status: 'listed',
      listedAt: '2026-01-25',
      subscriberCount: 128,
      pricing: { type: 'subscription', price: 19, currency: 'CNY', period: 'month' },
      tags: ['周报整理', '效率提升', '职场必备'],
      coverDescription: '智能周报助手，每周五自动汇总工作内容，一键生成规范周报草稿，适合需要定期汇报的职场人。',
    },
  },
  {
    id: 'ma-3',
    name: '数据分析师 Ava',
    avatar: '📊',
    role: 'analyst',
    slogan: '上传表格，一键生成洞察报告',
    mountedSkillIds: ['ms-4', 'ms-6'],
    source: 'purchased',
    isEnabled: true,
    createdAt: '2026-02-18',
    marketId: 'agent-3',
    hireDuration: '12 天',
    projectCount: 8,
  },
  {
    id: 'ma-4',
    name: '代码审查官',
    avatar: '🔍',
    role: 'programmer',
    slogan: '专注代码质量、安全漏洞与性能优化',
    mountedSkillIds: ['ms-7'],
    source: 'purchased',
    isEnabled: true,
    createdAt: '2026-02-25',
    marketId: 'agent-2',
    hireDuration: '5 天',
    projectCount: 3,
  },
];

// ─── Mock My Skills ────────────────────────────────────────────────────────
export const mySkills: MySkill[] = [
  {
    id: 'ms-1',
    name: '竞品情报搜索',
    icon: '🔍',
    category: 'web',
    description: '根据竞品名称实时抓取最新新闻，整理成5条摘要推送',
    source: 'built',
    isEnabled: true,
    usedByAgentIds: ['ma-1'],
    createdAt: '2026-02-10',
    config: { resultCount: 5, sources: ['Google News', '百度新闻'] },
    listing: {
      status: 'pending',
      submittedAt: '2026-03-01',
      pricing: { type: 'free', currency: 'CNY' },
      tags: ['竞品监控', '情报搜集'],
      coverDescription: '实时抓取竞品最新动态，自动整理成摘要报告，追踪市场变化一条不漏。',
    },
  },
  {
    id: 'ms-2',
    name: '定时推送',
    icon: '⏰',
    category: 'integration',
    description: '按设定时间将内容推送到指定渠道（邮件/企微/飞书）',
    source: 'built',
    isEnabled: true,
    usedByAgentIds: ['ma-1'],
    createdAt: '2026-02-11',
  },
  {
    id: 'ms-3',
    name: '日程摘要',
    icon: '📅',
    category: 'memory',
    description: '读取日历事件，提炼本周工作与会议要点',
    source: 'built',
    isEnabled: true,
    usedByAgentIds: ['ma-2'],
    createdAt: '2026-01-20',
    listing: {
      status: 'rejected',
      submittedAt: '2026-02-28',
      rejectedReason: '功能描述过于简短，请补充更多使用场景说明（建议至少50字）。',
      pricing: { type: 'free', currency: 'CNY' },
      tags: ['日历', '周报'],
      coverDescription: '日历归纳助手',
    },
  },
  {
    id: 'ms-4',
    name: '表格解析',
    icon: '📊',
    category: 'data',
    description: '解析 Excel/CSV 文件，提取关键数据并生成摘要',
    source: 'built',
    isEnabled: true,
    usedByAgentIds: ['ma-2', 'ma-3'],
    createdAt: '2026-01-22',
  },
  {
    id: 'ms-5',
    name: '网页截图',
    icon: '🖼️',
    category: 'web',
    description: '对指定 URL 进行全页截图，支持定时抓取',
    source: 'purchased',
    isEnabled: true,
    usedByAgentIds: ['ma-1'],
    createdAt: '2026-02-15',
    marketId: 'skill-market-screenshot',
  },
  {
    id: 'ms-6',
    name: 'AI 图表生成',
    icon: '📈',
    category: 'data',
    description: '根据结构化数据自动生成折线图、柱状图、饼图',
    source: 'purchased',
    isEnabled: false,
    usedByAgentIds: ['ma-3'],
    createdAt: '2026-02-18',
    marketId: 'skill-market-chart',
  },
  {
    id: 'ms-7',
    name: '代码静态分析',
    icon: '🧪',
    category: 'code',
    description: '检测 Python/TypeScript 代码中的安全漏洞与性能问题',
    source: 'purchased',
    isEnabled: true,
    usedByAgentIds: ['ma-4'],
    createdAt: '2026-02-25',
    marketId: 'skill-market-codecheck',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
export const ROLE_LABELS_ZH: Record<AgentRole, string> = {
  assistant: '助手',
  researcher: '研究员',
  designer: '设计师',
  programmer: '程序员',
  analyst: '分析师',
  customer_service: '客服',
  other: '其他',
};

export const CATEGORY_LABELS_ZH: Record<SkillCategory, string> = {
  web: '网络',
  data: '数据',
  creative: '创意',
  file: '文件',
  integration: '集成',
  memory: '记忆',
  code: '代码',
  other: '其他',
};

// Category badge colors (bg / text)
export const CATEGORY_BADGE: Record<SkillCategory, { bg: string; text: string }> = {
  web:         { bg: '#eff6ff', text: '#2563eb' },
  data:        { bg: '#f0fdf4', text: '#16a34a' },
  creative:    { bg: '#faf5ff', text: '#9333ea' },
  file:        { bg: '#fff7ed', text: '#ea580c' },
  integration: { bg: '#fefce8', text: '#ca8a04' },
  memory:      { bg: '#fdf4ff', text: '#c026d3' },
  code:        { bg: '#f0fdfa', text: '#0d9488' },
  other:       { bg: '#f8fafc', text: '#64748b' },
};
