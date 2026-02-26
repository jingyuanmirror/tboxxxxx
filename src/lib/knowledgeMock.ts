export interface Album {
  id: string;
  name: string;
  color?: string;
}

export interface KnowledgeFile {
  id: number;
  name: string;
  albums: string[];
}

export const albums: Album[] = [
  { id: 'all', name: '全部' },
  { id: 'market', name: '市场研究', color: '#6366f1' },
  { id: 'product', name: '产品规划', color: '#0ea5e9' },
  { id: 'finance', name: '财务分析', color: '#10b981' },
  { id: 'tech', name: '技术文档', color: '#f59e0b' },
  { id: 'hr', name: '人力资源', color: '#ec4899' },
];

export const files: KnowledgeFile[] = [
  { id: 1, name: 'Q4 推广方案预算分配表', albums: ['market', 'finance'] },
  { id: 2, name: '芯片市场竞品分析报告终稿', albums: ['market', 'tech'] },
  { id: 3, name: '2025 年产品路线图规划', albums: ['product'] },
  { id: 4, name: '用户增长漏斗分析', albums: ['market', 'product'] },
  { id: 5, name: '技术架构评审文档 v2.3', albums: ['tech'] },
  { id: 6, name: '员工绩效考核模板', albums: ['hr'] },
  { id: 7, name: '年度财务审计报告', albums: ['finance'] },
  { id: 8, name: '新功能需求说明书', albums: ['product', 'tech'] },
  { id: 9, name: '供应链风险评估报告', albums: ['finance', 'market'] },
  { id: 10, name: '团队 OKR 2025 Q3', albums: ['hr', 'product'] },
];
