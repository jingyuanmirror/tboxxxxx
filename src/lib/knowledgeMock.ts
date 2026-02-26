export type FileFormat = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'PNG' | 'JPG' | 'MP4' | 'MP3' | 'ZIP' | 'MD' | 'TXT';

export interface Album {
  id: string;
  name: string;
  color?: string;
  parentId?: string;
}

export interface KnowledgeFile {
  id: number;
  name: string;
  album: string; // single album id
  format: FileFormat;
  size: number; // bytes
  uploadedAt: string; // ISO date string
}

export const albums: Album[] = [
  { id: 'all', name: '全部' },
  { id: 'market', name: '市场研究', color: '#6366f1' },
  { id: 'product', name: '产品规划', color: '#0ea5e9' },
  { id: 'finance', name: '财务分析', color: '#10b981' },
  { id: 'tech', name: '技术文档', color: '#f59e0b' },
  { id: 'hr', name: '人力资源', color: '#ec4899' },
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
  { id: 1,  name: 'Q4 推广方案预算分配表',     album: 'market',   format: 'XLSX', size: 1153433,   uploadedAt: '2026-02-25T09:10:00Z' },
  { id: 2,  name: '芯片市场竞品分析报告终稿',   album: 'market',   format: 'PDF',  size: 2411724,   uploadedAt: '2026-02-24T14:22:00Z' },
  { id: 3,  name: '2025 年产品路线图规划',      album: 'product',  format: 'PPTX', size: 5242880,   uploadedAt: '2026-02-23T11:05:00Z' },
  { id: 4,  name: '用户增长漏斗分析',           album: 'market',   format: 'PDF',  size: 892928,    uploadedAt: '2026-02-22T16:44:00Z' },
  { id: 5,  name: '技术架构评审文档 v2.3',      album: 'tech',     format: 'DOCX', size: 3145728,   uploadedAt: '2026-02-21T08:30:00Z' },
  { id: 6,  name: '员工绩效考核模板',           album: 'hr',       format: 'XLSX', size: 471040,    uploadedAt: '2026-02-20T10:15:00Z' },
  { id: 7,  name: '年度财务审计报告',           album: 'finance',  format: 'PDF',  size: 7340032,   uploadedAt: '2026-02-19T13:00:00Z' },
  { id: 8,  name: '新功能需求说明书',           album: 'product',  format: 'MD',   size: 25600,     uploadedAt: '2026-02-18T09:50:00Z' },
  { id: 9,  name: '供应链风险评估报告',         album: 'finance',  format: 'DOCX', size: 2097152,   uploadedAt: '2026-02-17T15:30:00Z' },
  { id: 10, name: '团队 OKR 2025 Q3',           album: 'hr',       format: 'PPTX', size: 4194304,   uploadedAt: '2026-02-16T11:20:00Z' },
  { id: 11, name: '产品截图合集',               album: 'product',  format: 'ZIP',  size: 52428800,  uploadedAt: '2026-02-15T08:00:00Z' },
  { id: 12, name: '品牌 Logo 原图',             album: 'market',   format: 'PNG',  size: 1048576,   uploadedAt: '2026-02-14T14:10:00Z' },
  { id: 13, name: '用户访谈录音汇总',           album: 'market',   format: 'MP3',  size: 21757952,  uploadedAt: '2026-02-13T10:00:00Z' },
  { id: 14, name: '演示视频 Demo v1',           album: 'tech',     format: 'MP4',  size: 104857600, uploadedAt: '2026-02-12T16:00:00Z' },
  { id: 15, name: '合同范本 2026',              album: 'hr',       format: 'DOCX', size: 163840,    uploadedAt: '2026-02-11T09:30:00Z' },
];
