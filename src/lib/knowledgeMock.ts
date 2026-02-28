export type FileFormat = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'PNG' | 'JPG' | 'MP4' | 'MP3' | 'ZIP' | 'MD' | 'TXT';

export interface Album {
  id: string;
  name: string;
  color?: string;
  parentId?: string;
  description?: string;
}

export interface KnowledgeFile {
  id: number;
  name: string;
  album: string;
  format: FileFormat;
  size: number; // bytes
  uploadedAt: string; // ISO date string
  snippet?: string; // Short text preview
}

export const albums: Album[] = [
  { id: 'all',     name: '全部' },
  { id: 'market',  name: '市场研究',  color: '#6366f1', description: '竞品分析、用户调研、推广方案' },
  { id: 'product', name: '产品规划',  color: '#0ea5e9', description: '路线图、需求文档、设计稿' },
  { id: 'finance', name: '财务分析',  color: '#10b981', description: '审计报告、预算规划、供应链' },
  { id: 'tech',    name: '技术文档',  color: '#f59e0b', description: '架构评审、API 文档、演示视频' },
  { id: 'hr',      name: '人力资源',  color: '#ec4899', description: '绩效模板、OKR、合同范本' },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const FORMAT_CATEGORIES: Record<string, FileFormat[]> = {
  '图片': ['PNG', 'JPG'],
  '文档': ['PDF', 'DOCX', 'XLSX', 'PPTX', 'MD', 'TXT'],
  '视频': ['MP4'],
  '音频': ['MP3'],
  '压缩包': ['ZIP'],
};

export const files: KnowledgeFile[] = [
  // ── 市场研究 ──────────────────────────────────────────────────
  {
    id: 1, name: 'Q4 推广方案预算分配表', album: 'market', format: 'XLSX',
    size: 1153433, uploadedAt: '2026-02-25T09:10:00Z',
    snippet: '渠道预算分配 · 搜索 42% · 社交 28% · 内容 18% · 其他 12%',
  },
  {
    id: 2, name: '芯片市场竞品分析报告终稿', album: 'market', format: 'PDF',
    size: 2411724, uploadedAt: '2026-02-24T14:22:00Z',
    snippet: '本报告覆盖国内前十大芯片厂商，重点分析其产品线、定价策略及市占率变化趋势。',
  },
  {
    id: 4, name: '用户增长漏斗分析 2026 Q1', album: 'market', format: 'PDF',
    size: 892928, uploadedAt: '2026-02-22T16:44:00Z',
    snippet: '注册→激活→留存→付费各阶段转化率对比，识别关键流失节点及优化建议。',
  },
  {
    id: 12, name: '品牌 Logo 原图 2026版', album: 'market', format: 'PNG',
    size: 1048576, uploadedAt: '2026-02-14T14:10:00Z',
  },
  {
    id: 13, name: 'Q1 用户访谈录音合集', album: 'market', format: 'MP3',
    size: 21757952, uploadedAt: '2026-02-13T10:00:00Z',
    snippet: '共 12 位受访用户，时长 3.5h，围绕产品核心功能使用习惯与痛点展开。',
  },
  {
    id: 19, name: '2026 年品牌传播策略', album: 'market', format: 'PPTX',
    size: 6291456, uploadedAt: '2026-02-10T11:00:00Z',
    snippet: '全年品牌节奏规划，包含线上线下联动、KOL 矩阵、内容日历三大模块。',
  },

  // ── 产品规划 ──────────────────────────────────────────────────
  {
    id: 3, name: '2026 年产品路线图规划', album: 'product', format: 'PPTX',
    size: 5242880, uploadedAt: '2026-02-23T11:05:00Z',
    snippet: 'H1 聚焦核心工作流打磨，H2 开放第三方集成与协作功能，年底 2.0 大版本发布。',
  },
  {
    id: 8, name: '新功能需求说明书 v4.2', album: 'product', format: 'MD',
    size: 25600, uploadedAt: '2026-02-18T09:50:00Z',
    snippet: '## 知识库 2.0\n### 背景\n当前知识库功能覆盖率 43%，用户需要更高效的文件组织与检索能力。',
  },
  {
    id: 11, name: '产品截图合集 v3', album: 'product', format: 'ZIP',
    size: 52428800, uploadedAt: '2026-02-15T08:00:00Z',
    snippet: '包含 Dashboard、知识库、任务中心、设置页共 86 张高清截图，2x 分辨率。',
  },
  {
    id: 20, name: 'UX 评审会议纪要 0221', album: 'product', format: 'DOCX',
    size: 204800, uploadedAt: '2026-02-21T15:30:00Z',
    snippet: '评审结论：导航层级过深，建议将二级菜单压缩至一级；输入框响应速度需优化至 < 100ms。',
  },
  {
    id: 21, name: 'DAU MAU 留存分析表', album: 'product', format: 'XLSX',
    size: 819200, uploadedAt: '2026-02-19T10:00:00Z',
    snippet: '2月 DAU 均值 12,480，环比 +8.3%；7日留存 61%，30日留存 38%，达成季度目标。',
  },

  // ── 财务分析 ──────────────────────────────────────────────────
  {
    id: 7, name: '2025 年度财务审计报告', album: 'finance', format: 'PDF',
    size: 7340032, uploadedAt: '2026-02-19T13:00:00Z',
    snippet: '总营收 ¥128.4M，同比增长 34.2%；毛利率 62.1%；经营现金流净额 ¥21.6M。',
  },
  {
    id: 9, name: '供应链风险评估报告 Q4', album: 'finance', format: 'DOCX',
    size: 2097152, uploadedAt: '2026-02-17T15:30:00Z',
    snippet: '识别高风险供应商 3 家，建议建立双供应商体系；原材料库存安全水位需提升至 45 天。',
  },
  {
    id: 22, name: '2026 年预算规划草案', album: 'finance', format: 'XLSX',
    size: 1572864, uploadedAt: '2026-02-16T09:00:00Z',
    snippet: '研发预算 ¥35M (+22%)，市场预算 ¥18M (+15%)，人力成本 ¥42M (+10%)。',
  },
  {
    id: 23, name: 'Q1 融资路演 Deck', album: 'finance', format: 'PPTX',
    size: 8388608, uploadedAt: '2026-02-12T14:00:00Z',
    snippet: 'Pre-B 轮融资材料，估值 ¥850M，本轮目标融资金额 ¥120M，投向产品与海外扩张。',
  },

  // ── 技术文档 ──────────────────────────────────────────────────
  {
    id: 5, name: '微服务架构评审文档 v2.3', album: 'tech', format: 'DOCX',
    size: 3145728, uploadedAt: '2026-02-21T08:30:00Z',
    snippet: '网关层引入 gRPC，服务间通信延迟降低 40%；建议将认证服务从 monolith 中剥离。',
  },
  {
    id: 14, name: '演示视频 Demo v2.1', album: 'tech', format: 'MP4',
    size: 104857600, uploadedAt: '2026-02-12T16:00:00Z',
    snippet: '时长 4分32秒，完整覆盖核心工作流：上传→解析→问答→导出，适用于销售演示场景。',
  },
  {
    id: 24, name: 'API 接口文档 v3', album: 'tech', format: 'MD',
    size: 51200, uploadedAt: '2026-02-20T10:00:00Z',
    snippet: '## REST API v3\n新增 `/v3/knowledge/search` 端点，支持语义搜索与元数据过滤，响应格式兼容 OpenAI。',
  },
  {
    id: 25, name: '数据库 ER 图 2026', album: 'tech', format: 'PNG',
    size: 2097152, uploadedAt: '2026-02-09T11:00:00Z',
  },

  // ── 人力资源 ──────────────────────────────────────────────────
  {
    id: 6, name: '2026 H1 员工绩效考核模板', album: 'hr', format: 'XLSX',
    size: 471040, uploadedAt: '2026-02-20T10:15:00Z',
    snippet: '覆盖研发、产品、市场、运营四大部门，KPI 权重：目标达成 50%、协作 30%、成长 20%。',
  },
  {
    id: 10, name: '团队 OKR 2026 Q1', album: 'hr', format: 'PPTX',
    size: 4194304, uploadedAt: '2026-02-16T11:20:00Z',
    snippet: '公司级 O1：成为行业领先的AI工作流平台；KR1 DAU 2万；KR2 NPS ≥ 52；KR3 MRR ¥6M。',
  },
  {
    id: 15, name: '劳动合同范本 2026版', album: 'hr', format: 'DOCX',
    size: 163840, uploadedAt: '2026-02-11T09:30:00Z',
    snippet: '更新第十二条：远程办公条款；附件三：知识产权归属协议已更新至 2026 年版。',
  },
  {
    id: 26, name: '2月新员工入职材料', album: 'hr', format: 'PDF',
    size: 2621440, uploadedAt: '2026-02-18T09:00:00Z',
    snippet: '2月共入职 8 人，含培训计划、工具权限清单、试用期考核标准三份附件。',
  },

  // ── 未归档散列文件（每种格式各一个样例） ─────────────────────────────────
  {
    id: 100, name: 'Q1 销售数据汇总表', album: '', format: 'XLSX',
    size: 1843200, uploadedAt: '2026-02-28T09:00:00Z',
    snippet: '区域 | 目标 (万) | 实际 (万) | 完成率\n华北 | 820 | 876 | 106.8%\n华东 | 1100 | 1043 | 94.8%\n华南 | 950 | 1021 | 107.5%\n西南 | 680 | 712 | 104.7%\n合计 | 3550 | 3652 | 102.9%',
  },
  {
    id: 101, name: '客户成功案例：大鹏集团', album: '', format: 'DOCX',
    size: 983040, uploadedAt: '2026-02-27T16:30:00Z',
    snippet: '项目背景\n大鹎集团将内部文档管理切换至本平台，作业周期从 9 天卓8.5 天\n核心成果\n须知搜索响应 < 200ms；多层权限䯕诚全面落地；自动标签准确率 91%\n用户反馈\n“找文件终于不用兄弟了” --- 业务总监 Edward',
  },
  {
    id: 102, name: '2026 品牌升级发布会 PPT', album: '', format: 'PPTX',
    size: 11534336, uploadedAt: '2026-02-26T14:00:00Z',
    snippet: 'NEW BRAND IDENTITY 2026\n重新定义我们与用户的连接\n课题一：品牌色彩升级\n课题二：全新 Slogan 发布\n课题三：战略规划 2026—2028',
  },
  {
    id: 103, name: '产品演示视频 v2.mp4', album: '', format: 'MP4',
    size: 209715200, uploadedAt: '2026-02-25T11:00:00Z',
    snippet: '时长 4′7 | 分辨率 1920×1080 | H.264\n00:00 开場动画 + Logo\n00:18 核心功能演示\n01:42 客户证言切片\n03:05 CTA 结尾',
  },
  {
    id: 104, name: '品牌宣传曲 - 春潮来了.mp3', album: '', format: 'MP3',
    size: 8388608, uploadedAt: '2026-02-24T10:00:00Z',
    snippet: '时长 3′2 | 比特率 320kbps | 44.1kHz\n作曲：李明远 | 作词：赵馨\n用途：发布会背景音乐 / 宣传片配乐\n版权：公司自有，不得对外使用',
  },
];


