'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useModelStore } from '../../lib/modelStore';
import { mockAgents, mockSkills, ROLE_LABELS, CATEGORY_LABELS } from '@/lib/marketMock';

/* ─── types ─── */
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  type: string;
  isImage: boolean;
  previewUrl?: string;
}
interface RepoFile { path: string; name: string }
interface SkillItem { key: string; name: string; color: string }
interface RecentSkill { key: string; name: string }
interface SubTool { key: string; name: string; promptPrefix: string; fileHint?: string; fileRequired?: boolean; icon?: () => JSX.Element }

/* ─── static config ─── */
const FILE_TYPE_ICONS: Record<string, { label: string; color: string }> = {
  pdf:  { label: 'PDF',  color: '#e74c3c' },
  doc:  { label: 'DOC',  color: '#2b579a' },
  docx: { label: 'DOC',  color: '#2b579a' },
  xls:  { label: 'XLS',  color: '#217346' },
  xlsx: { label: 'XLS',  color: '#217346' },
  ppt:  { label: 'PPT',  color: '#d24726' },
  pptx: { label: 'PPT',  color: '#d24726' },
  txt:  { label: 'TXT',  color: '#6b7280' },
  csv:  { label: 'CSV',  color: '#217346' },
  zip:  { label: 'ZIP',  color: '#f59e0b' },
  rar:  { label: 'RAR',  color: '#f59e0b' },
  mp4:  { label: 'MP4',  color: '#8b5cf6' },
  mp3:  { label: 'MP3',  color: '#ec4899' },
  default: { label: 'FILE', color: '#6b7280' },
};

const MODES = [
  {
    name: 'PPT 演示', iconKey: 'ppt', isSpecial: false,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    subTools: [
      { key: 'ppt_optimize', name: '旧PPT一键优化', promptPrefix: '请帮我全面优化这份 PPT，包括排版、配色、文字表达，输出新的 PPTX 文件。', fileHint: '.pptx', fileRequired: true },
      { key: 'ppt_research', name: '调研报告', promptPrefix: '请帮我制作一份{主题}调研报告 PPT，包含背景、数据、洞察与结论。' },
      { key: 'ppt_roadshow', name: '路演报告', promptPrefix: '请帮我制作一份路演 Deck，按照：Cover / Problem / Solution / Market / Product / Traction / Business Model / Competition / Team / Ask 结构输出。' },
      { key: 'ppt_training', name: '培训课件', promptPrefix: '请帮我制作一份{主题}培训课件 PPT，包含学习目标、核心知识点、案例和课后练习。' },
      { key: 'ppt_summary', name: '周报/月报', promptPrefix: '请将我提供的内容整理成一份简洁、专业的工作汇报 PPT，突出关键指标与成果。' },
    ],
  },
  {
    name: 'Web 搜索', iconKey: 'web', isSpecial: false,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    subTools: [
      { key: 'web_realtime',   name: '实时热点',   promptPrefix: '请搜索并整理今天{领域}最新热点新闻，按重要性排序并附简评。' },
      { key: 'web_research',   name: '深度研究',   promptPrefix: '请对{主题}进行深度调研，整理权威来源，输出含背景、现状、趋势与参考资料的报告。' },
      { key: 'web_competitor', name: '竞品情报',   promptPrefix: '请帮我收集{品牌/产品}的最新公开信息，包括定价、功能、口碑、动态，整理成竞品分析表。' },
      { key: 'web_academic',   name: '学术文献',   promptPrefix: '请帮我检索关于{研究主题}的近三年重要学术论文，列出标题、摘要、作者和来源。' },
      { key: 'web_fact_check', name: '事实核查',   promptPrefix: '请帮我核查以下说法的真实性，并给出可信来源：' },
    ],
  },
  {
    name: 'Excel 分析', iconKey: 'excel', isSpecial: false,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    subTools: [
      { key: 'excel_chart',   name: '数据可视化', promptPrefix: '请读取我上传的数据文件，生成合适的可视化图表，并简要说明数据趋势。', fileHint: '.xlsx/.csv', fileRequired: true },
      { key: 'excel_finance', name: '财务分析',   promptPrefix: '请分析我上传的财务报表，计算关键财务指标（增长率、毛利率、ROE 等），并标注异常点。', fileHint: '.xlsx', fileRequired: true },
      { key: 'excel_clean',   name: '数据清洗',   promptPrefix: '请检查并清洗我上传的数据表，处理缺失值、重复行和格式问题，输出清洗后的文件。', fileHint: '.xlsx/.csv', fileRequired: true },
      { key: 'excel_pivot',   name: '透视表',     promptPrefix: '请帮我对上传的数据表按{维度}进行数据透视，生成汇总表和分析说明。', fileHint: '.xlsx', fileRequired: true },
      { key: 'excel_formula', name: '公式/宏生成', promptPrefix: '请根据我的需求帮我生成 Excel 公式或 VBA 宏代码：' },
    ],
  },
  {
    name: 'Code 生成', iconKey: 'code', isSpecial: false,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    subTools: [
      { key: 'code_frontend', name: '前端页面',   promptPrefix: '请根据我的描述生成一个{框架}前端页面/组件，包含完整代码和样式。' },
      { key: 'code_api',      name: 'API 接口',   promptPrefix: '请帮我设计并生成{语言/框架}的 API 接口代码，包含路由、参数校验和错误处理。' },
      { key: 'code_review',   name: '代码审查',   promptPrefix: '请对以下代码进行审查，从安全性、性能、可读性、最佳实践角度提出改进建议：' },
      { key: 'code_test',     name: '单元测试',   promptPrefix: '请为以下代码生成完整的单元测试，覆盖正常路径、边界条件和异常情况：' },
      { key: 'code_script',   name: '脚本自动化', promptPrefix: '请帮我编写一个{语言}脚本实现以下自动化任务：' },
      { key: 'code_debug',    name: '错误排查',   promptPrefix: '我遇到了以下错误，请帮我分析原因并给出修复方案：' },
    ],
  },
  {
    name: 'Mail 撰写', iconKey: 'mail', isSpecial: false,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    subTools: [
      { key: 'mail_business',  name: '商务洽谈',   promptPrefix: '请帮我撰写一封商务邮件，主题：{主题}，收件人：{身份}，语气专业正式。' },
      { key: 'mail_complaint', name: '客诉回复',   promptPrefix: '请帮我撰写一封客户投诉回复邮件，问题描述：{描述}，需要表达歉意并提供解决方案。' },
      { key: 'mail_follow_up', name: '跟进邀约',   promptPrefix: '请帮我撰写一封跟进邮件，提醒对方{事项}，语气友好且不失专业。' },
      { key: 'mail_internal',  name: '内部通知',   promptPrefix: '请帮我撰写一封内部通知邮件，内容：{内容}，适合发送给全体员工/团队。' },
      { key: 'mail_cold',      name: '冷启动开发信', promptPrefix: '请帮我撰写一封冷邮件，向{目标群体}介绍{产品/服务}，突出价值主张，引发回复兴趣。' },
    ],
  },
  {
    name: '小红书', iconKey: 'xiaohongshu', isSpecial: true,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    subTools: [
      { key: 'xhs_recommend', name: '种草推荐', promptPrefix: '请帮我写一篇小红书种草笔记，产品/体验：{内容}，风格活泼，加入 emoji 和话题标签。' },
      { key: 'xhs_travel', name: '旅行攻略', promptPrefix: '请帮我写一篇{目的地}的小红书旅行攻略，包含行程安排、必打卡地点、美食推荐和实用 Tips。' },
      { key: 'xhs_food', name: '美食测评', promptPrefix: '请帮我写一篇小红书美食测评笔记，门店：{门店名}，突出环境、口味、性价比。' },
      { key: 'xhs_outfit', name: '穿搭分享', promptPrefix: '请帮我写一篇小红书穿搭笔记，风格：{风格}，包含单品介绍和搭配建议。' },
      { key: 'xhs_title', name: '爆款标题生成', promptPrefix: '请为以下主题生成 10 个小红书爆款标题，要求有吸引力、含情绪词和数字：{主题}' },
    ],
  },
  {
    name: '做图', iconKey: 'image', isSpecial: false,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.2 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    subTools: [
      { key: 'img_poster', name: '海报设计', promptPrefix: '请帮我生成一张{主题}海报，风格：{风格}，尺寸：{尺寸}，包含标题、正文和 Logo 位置。' },
      { key: 'img_comic', name: '漫画创作', promptPrefix: '请根据以下剧情生成{N}格漫画，风格：{风格（日漫/美漫/Q版）}，场景描述：{描述}' },
      { key: 'img_product', name: '产品效果图', promptPrefix: '请帮我生成{产品名}的产品效果图，背景：{场景}，风格：{风格（极简/科技感/生活感）}}' },
      { key: 'img_social', name: '社媒配图', promptPrefix: '请帮我生成一张适合{平台}发布的配图，主题：{主题}，尺寸自动适配该平台最佳比例。' },
      { key: 'img_infographic', name: '信息图表', promptPrefix: '请将以下数据/知识点转化为一张美观的信息图表：{内容}' },
      { key: 'img_avatar', name: '头像 & 表情包', promptPrefix: '请根据以下描述生成一个{风格}风格的头像/表情包：{描述}' },
    ],
  },
];

const MODELS = [
  { key: 'tbox',       name: 'Tbox',        avatar: '/mascot.png' },
  { key: 'ling-2.5',   name: 'Ling-2.5-1T', avatar: '/ling.png' },
  { key: 'gpt-4',      name: 'GPT-4',       avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/200px-ChatGPT_logo.svg.png' },
  { key: 'claude',     name: 'Claude',      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Claude_AI_logo.svg/200px-Claude_AI_logo.svg.png' },
];

const SKILLS: SkillItem[] = [
  { key: 'img_search', name: '图片搜索助手', color: 'from-indigo-500 to-pink-400' },
  { key: 'podcast',    name: '播客生成专家', color: 'from-emerald-400 to-cyan-500' },
  { key: 'maps',       name: '高德地图专家', color: 'from-yellow-400 to-orange-500' },
  { key: 'weather',    name: '天气助手',     color: 'from-sky-400 to-blue-600' },
];

/* ─── helpers ─── */
function fileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}
function extBadge(name: string) {
  const ext = fileExt(name);
  return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
}

/* ─── AgentPickerItem (needs own state for img error) ─── */
function AgentPickerItem({ agent, onSelect }: { agent: import('@/lib/marketMock').MarketAgent; onSelect: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <li
      onClick={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5f5f7] cursor-pointer transition-colors list-none"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
        {agent.avatarUrl && !imgErr
          ? <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
          : <span className="text-lg">{agent.avatar}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{agent.name}</div>
        <div className="text-[11px] text-[#8e8e93]">{ROLE_LABELS[agent.role]}</div>
      </div>
      <svg className="w-3.5 h-3.5 text-[#ccc] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    </li>
  );
}

/* ─── component ─── */
interface MagicInputProps {
  onSendMessage?: (message: string, model?: string) => void;
  onOpenMarket?: (tab: 'agents' | 'skills') => void;
}

export default function MagicInput({ onSendMessage, onOpenMarket }: MagicInputProps) {
  const [inputValue, setInputValue]       = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode]     = useState<typeof MODES[0] | null>(null);
  const [selectedSubTool, setSelectedSubTool] = useState<SubTool | null>(null);

  const [isModelOpen, setIsModelOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useModelStore();

  // Mention metadata: stores display `@name` + resolved id/type for send reconstruction
  interface MentionToken { placeholder: string; id: string; type: 'agent' | 'skill' | 'file'; name: string; }
  const [mentions, setMentions]           = useState<MentionToken[]>([]);

  const [isPickerOpen, setIsPickerOpen]   = useState(false);
  const [activeTab, setActiveTab]         = useState<'files' | 'agents' | 'skills'>('files');
  const [searchQuery, setSearchQuery]     = useState('');
  const [repoFiles, setRepoFiles]         = useState<RepoFile[]>([]);
  const [recentFiles, setRecentFiles]     = useState<RepoFile[]>([]);
  const [recentSkills, setRecentSkills]   = useState<RecentSkill[]>([]);
  const [hiredAgentIds, setHiredAgentIds] = useState<string[]>([]);
  const [mountedSkillIds, setMountedSkillIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const rf = JSON.parse(localStorage.getItem('recent_files') || '[]');
      const rs = JSON.parse(localStorage.getItem('recent_skills') || '[]');
      const ha = JSON.parse(localStorage.getItem('hired_agent_ids') || '[]');
      const ms = JSON.parse(localStorage.getItem('mounted_skill_ids') || '[]');
      if (Array.isArray(rf)) setRecentFiles(rf);
      if (Array.isArray(rs)) setRecentSkills(rs);
      if (Array.isArray(ha)) setHiredAgentIds(ha);
      if (Array.isArray(ms)) setMountedSkillIds(ms);
    } catch (_) {}
  }, []);

  const saveRecentFile = (f: RepoFile) => {
    setRecentFiles(prev => {
      const next = [f, ...prev.filter(p => p.path !== f.path)].slice(0, 10);
      try { localStorage.setItem('recent_files', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const saveRecentSkill = (s: RecentSkill) => {
    setRecentSkills(prev => {
      const next = [s, ...prev.filter(p => p.key !== s.key)].slice(0, 10);
      try { localStorage.setItem('recent_skills', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const openPicker = async (tab: 'files' | 'agents' | 'skills' = 'files') => {
    setActiveTab(tab);
    setSearchQuery('');
    setIsPickerOpen(true);
    if (tab === 'files' && repoFiles.length === 0) {
      try {
        const res = await fetch('/api/files');
        if (res.ok) {
          const data = await res.json();
          setRepoFiles(data.files || []);
        }
      } catch (e) {
        console.error('fetch files error', e);
      }
    }
  };

  // Insert a mention: store only display text (@name) in inputValue; metadata in mentions array
  const insertToken = (name: string, id: string, type: 'agent' | 'skill' | 'file') => {
    const placeholder = `@${name}`;
    setInputValue(v => {
      const idx = v.lastIndexOf('@');
      if (idx !== -1) {
        return v.slice(0, idx) + placeholder + v.slice(idx + 1);
      }
      return v ? `${v} ${placeholder}` : placeholder;
    });
    setMentions(prev => [
      ...prev.filter(m => !(m.placeholder === placeholder && m.id === id)),
      { placeholder, id, type, name },
    ]);
    setIsPickerOpen(false);
  };

  const insertFileRef = (f: RepoFile) => {
    saveRecentFile(f);
    insertToken(f.name, f.path, 'file');
  };

  const runSkill = async (skillKey: string) => {
    const meta = SKILLS.find(s => s.key === skillKey) || { key: skillKey, name: skillKey, color: '' };
    saveRecentSkill({ key: meta.key, name: meta.name });
    try {
      const res = await fetch('/api/skills/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skillKey, model: selectedModel.key }),
      });
      if (res.ok) {
        const data = await res.json();
        onSendMessage?.(data.result || `[已执行 ${skillKey}]`, selectedModel.key);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        name: file.name,
        type: fileExt(file.name),
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const f = prev.find(f => f.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleModeSelect = (mode: typeof MODES[0]) => {
    setSelectedMode(prev => prev?.iconKey === mode.iconKey ? null : mode);
    setSelectedSubTool(null);
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    // Reconstruct full mention syntax from metadata before sending
    let msg = inputValue;
    mentions.forEach(m => {
      const full = m.type === 'file'
        ? `@[${m.name}](${m.id})`
        : `@[${m.name}](${m.type}:${m.id})`;
      msg = msg.replaceAll(m.placeholder, full);
    });
    const metaPrefix = selectedMode ? `【tool_mode:${selectedMode.iconKey} sub_tool:${selectedSubTool?.key || ''}】 ` : '';
    onSendMessage?.(`${metaPrefix}${msg}`, selectedModel?.key);
    setInputValue('');
    setMentions([]);
  };

  const filteredFiles  = repoFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSkills = SKILLS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const hiredAgents = mockAgents.filter(a => hiredAgentIds.includes(a.id)).filter(a => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.slogan.toLowerCase().includes(searchQuery.toLowerCase()));
  const mountedSkills = mockSkills.filter(s => mountedSkillIds.includes(s.id)).filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render overlay HTML: known @mention chips are highlighted; {placeholders} get blue marks
  const renderOverlay = (val: string): string => {
    if (!val) return `<span style="color:#a1a1a6;">请直接吩咐任务：例如，将芯片报告初稿转化为高管演示 PPT...</span>`;
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const formatPlain = (s: string) =>
      esc(s)
        .replace(/\n/g, '<br/>')
        .replace(/\{([^}]+)\}/g, '<mark style="background:rgba(37,99,235,0.10);color:#1d4ed8;border-radius:4px;padding:1px 3px;font-style:normal;border:1px solid rgba(37,99,235,0.25);">$&</mark>');
    if (mentions.length === 0) return formatPlain(val);
    // Build regex from known mention placeholders (longest first to avoid partial matches)
    const sorted = [...mentions].sort((a, b) => b.placeholder.length - a.placeholder.length);
    const pattern = sorted.map(m => m.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const MENTION_RE = new RegExp(`(${pattern})`, 'g');
    const parts: string[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = MENTION_RE.exec(val)) !== null) {
      if (match.index > last) parts.push(formatPlain(val.slice(last, match.index)));
      const name = match[1].slice(1); // strip leading @
      // No extra padding/border so overlay character widths match textarea exactly (caret alignment)
      parts.push(`<mark style="background:rgba(37,99,235,0.09);color:#1d4ed8;font-weight:600;font-style:normal;border-radius:3px;padding:0;margin:0;border:none;">@${esc(name)}</mark>`);
      last = match.index + match[1].length;
    }
    if (last < val.length) parts.push(formatPlain(val.slice(last)));
    return parts.join('');
  };

  // Detect @ trigger; auto-remove mentions no longer present in text
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const cursor = e.target.selectionStart ?? newVal.length;

    // Remove mentions whose placeholder was deleted from the text
    setMentions(prev => prev.filter(m => newVal.includes(m.placeholder)));

    // Detect standalone @ being typed → open agent picker
    if (newVal.length > inputValue.length) {
      const charAdded = newVal.slice(0, cursor).slice(-1);
      if (charAdded === '@') {
        setInputValue(newVal);
        openPicker('agents');
        return;
      }
    }

    setInputValue(newVal);
  };

  return (
    <div
      className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] w-full max-w-[950px] min-h-[170px] rounded-[24px] p-[15px_25px_20px_25px] box-border flex flex-col justify-between relative transition-all duration-300 ease-in-out flex-shrink-0 mb-[30px] hover:-translate-y-[3px] z-[2]"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'; }}
    >
      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2.5 mb-1 border-b border-[rgba(0,0,0,0.06)]">
          {uploadedFiles.map(file => (
            <div
              key={file.id}
              className="group relative flex items-center gap-2 bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden transition-all hover:border-[rgba(0,0,0,0.12)]"
            >
              {file.isImage ? (
                <div className="w-[72px] h-[72px] flex-shrink-0">
                  <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded leading-none flex-shrink-0"
                    style={{ backgroundColor: extBadge(file.name).color }}
                  >
                    {extBadge(file.name).label}
                  </span>
                  <span className="text-[12px] text-[#444] max-w-[120px] truncate" title={file.name}>{file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-1 right-1 w-4 h-4 bg-[rgba(0,0,0,0.5)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Textarea with inline token highlighting via overlay */}
      <div className="relative w-full flex-1 min-h-[60px] mb-1.5">
        {/* Mirror layer: same font metrics, renders {tokens} highlighted */}
        <div
          aria-hidden="true"
          className="absolute inset-0 font-['Inter'] text-base leading-normal pointer-events-none select-none overflow-hidden"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.5',
          }}
          dangerouslySetInnerHTML={{ __html: renderOverlay(inputValue) }}
        />
        {/* Actual textarea: transparent text + visible caret */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          className="relative w-full border-none bg-transparent font-['Inter'] text-base resize-none outline-none min-h-[60px] pt-0"
          style={{ color: 'transparent', caretColor: '#1d1d1f', lineHeight: '1.5' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); return; }
            // Atomically delete entire @name mention token on Backspace/Delete
            if ((e.key === 'Backspace' || e.key === 'Delete') && mentions.length > 0) {
              const pos = textareaRef.current?.selectionStart ?? 0;
              const selEnd = textareaRef.current?.selectionEnd ?? pos;
              if (pos === selEnd) {
                for (const mn of mentions) {
                  const ph = mn.placeholder;
                  let searchFrom = 0;
                  while (true) {
                    const found = inputValue.indexOf(ph, searchFrom);
                    if (found === -1) break;
                    const end = found + ph.length;
                    const hitBackspace = e.key === 'Backspace' && pos > found && pos <= end;
                    const hitDelete    = e.key === 'Delete'    && pos >= found && pos < end;
                    if (hitBackspace || hitDelete) {
                      e.preventDefault();
                      const newVal = inputValue.slice(0, found) + inputValue.slice(end);
                      setInputValue(newVal);
                      setMentions(prev => prev.filter(m => m !== mn || newVal.includes(ph)));
                      return;
                    }
                    searchFrom = found + 1;
                  }
                }
              }
            }
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">

          {/* + Upload */}
          <label
            className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer text-[#86868b] hover:text-[#1d1d1f] hover:border-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.04)] transition-all relative -top-[3px]"
            title="上传文件"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      

              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => { handleFileUpload(e.target.files); e.target.value = ''; }} />
          </label>

          {selectedSubTool?.fileRequired && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] text-[11px] font-medium relative -top-[3px]">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              {selectedSubTool.fileHint || '文件'}
            </div>
          )}

          {/* @ Picker */}
          <div className="relative -top-[3px]">
            <button
              title="引用档案库文件 / 智能体"
              onClick={() => openPicker('files')}
              className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer text-[#86868b] hover:text-[#1d1d1f] hover:border-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.04)] transition-all"
            >
              <span className="text-[14px] font-semibold leading-none">@</span>
            </button>

            {/* @ Picker Popover */}
            {isPickerOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-0 bg-white rounded-2xl w-[460px] max-w-[calc(100vw-40px)] flex flex-col overflow-hidden z-[70]" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)' }}>

                {/* header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-semibold text-[#1d1d1f] whitespace-nowrap">选择引用内容</span>
                    <div className="flex items-center gap-0.5 bg-[#f2f2f4] rounded-lg p-0.5">
                      {(['files', 'agents', 'skills'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${activeTab === tab ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#666]'}`}
                        >
                          {tab === 'files' ? (
                            <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>文件</>
                          ) : tab === 'agents' ? (
                            <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>人才</>
                          ) : (
                            <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>技能</>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTab === 'files' ? (
                      <a href="/knowledge" className="text-[12px] text-[#2563eb] hover:underline whitespace-nowrap">进入知识库 →</a>
                    ) : activeTab === 'agents' ? (
                      <button onClick={() => { setIsPickerOpen(false); onOpenMarket?.('agents'); }} className="text-[12px] text-[#2563eb] hover:underline whitespace-nowrap">人才广场 →</button>
                    ) : (
                      <button onClick={() => { setIsPickerOpen(false); onOpenMarket?.('skills'); }} className="text-[12px] text-[#2563eb] hover:underline whitespace-nowrap">装备铺 →</button>
                    )}
                    <button onClick={() => setIsPickerOpen(false)} className="text-[#999] hover:text-[#1d1d1f] transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* search */}
                <div className="px-4 py-2.5 border-b">
                  <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-lg px-3 py-2">
                    <svg className="w-3.5 h-3.5 text-[#999] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={activeTab === 'files' ? '搜索文件名…' : activeTab === 'agents' ? '搜索已雇佣的人才…' : '搜索已挂载的技能…'}
                      className="flex-1 bg-transparent outline-none text-[13px] text-[#333] placeholder:text-[#aaa]"
                      autoFocus
                    />
                  </div>
                </div>

                {/* body */}
                <div className="overflow-y-auto p-4" style={{ maxHeight: '280px' }}>
                  {activeTab === 'files' ? (
                    <>
                      <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wide mb-2">最近使用</p>
                      {recentFiles.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-2">
                          <svg className="w-8 h-8 text-[#ddd]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                          <p className="text-sm text-[#bbb] text-center">暂无最近使用的文件</p>
                          <a href="/knowledge" className="text-[12px] text-[#2563eb] hover:underline">前往知识库选择文件 →</a>
                        </div>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {recentFiles.slice(0, 5).map(f => {
                            const badge = extBadge(f.name);
                            return (
                              <li key={f.path} onClick={() => insertFileRef(f)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5f5f7] cursor-pointer transition-colors">
                                <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-white text-[9px] font-bold" style={{ backgroundColor: badge.color }}>{badge.label}</span>
                                <span className="text-[13px] text-[#333] truncate flex-1">{f.name}</span>
                                <svg className="w-3.5 h-3.5 text-[#ccc] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : activeTab === 'agents' ? (
                    <>
                      <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wide mb-2">已雇佣 ({hiredAgents.length})</p>
                      {hiredAgents.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-2">
                          <svg className="w-8 h-8 text-[#ddd]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                          <p className="text-sm text-[#bbb] text-center">尚未雇佣任何人才</p>
                          <button onClick={() => { setIsPickerOpen(false); onOpenMarket?.('agents'); }} className="text-[12px] text-[#2563eb] hover:underline">前往人才广场 →</button>
                        </div>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {hiredAgents.map(agent => (
                            <AgentPickerItem
                              key={agent.id}
                              agent={agent}
                              onSelect={() => insertToken(agent.name, agent.id, 'agent')}
                            />
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wide mb-2">已挂载 ({mountedSkills.length})</p>
                      {mountedSkills.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-2">
                          <svg className="w-8 h-8 text-[#ddd]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          <p className="text-sm text-[#bbb] text-center">尚未挂载任何技能</p>
                          <button onClick={() => { setIsPickerOpen(false); onOpenMarket?.('skills'); }} className="text-[12px] text-[#2563eb] hover:underline">前往装备铺 →</button>
                        </div>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {mountedSkills.map(skill => (
                            <li key={skill.id}
                              onClick={() => insertToken(skill.name, skill.id, 'skill')}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5f5f7] cursor-pointer transition-colors">
                              <div className="w-8 h-8 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-xl flex-shrink-0">{skill.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{skill.name}</div>
                                <div className="text-[11px] text-[#8e8e93]">{CATEGORY_LABELS[skill.category]}</div>
                              </div>
                              <svg className="w-3.5 h-3.5 text-[#ccc] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mode dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(v => !v)}
              className="px-[10px] py-1.5 rounded-[10px] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors relative -top-[3px] text-[#555] hover:bg-[rgba(0,0,0,0.06)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ strokeWidth: 2 }}>
                <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                <line x1="4" y1="8" x2="8" y2="8" /><line x1="4" y1="16" x2="8" y2="16" />
                <line x1="16" y1="8" x2="20" y2="8" /><line x1="16" y1="16" x2="20" y2="16" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute bottom-full left-0 min-w-[160px] bg-white rounded-xl mb-1 overflow-hidden z-50"
                style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)', padding: '8px 0' }}
              >
                {MODES.map(mode => (
                  <div
                    key={mode.iconKey}
                    onClick={() => handleModeSelect(mode)}
                    className={`flex items-center px-[15px] py-2 text-sm cursor-pointer transition-colors font-medium gap-2.5 ${
                      selectedMode?.iconKey === mode.iconKey
                        ? 'bg-[rgba(0,0,0,0.04)] font-semibold text-[#1d1d1f]'
                        : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <span className={`w-4 h-4 flex-shrink-0 flex items-center justify-center ${mode.isSpecial ? 'bg-[#FF2D55] rounded-full text-white' : 'text-[#6a6e73]'}`}>
                      {mode.icon()}
                    </span>
                    {mode.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Mode Chip */}
          {selectedMode && (
            <div className="flex items-center gap-1.5 relative -top-[3px] text-[#1a73e8]">
              <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">{selectedMode.icon()}</span>
              <span className="text-[13px] font-medium">{selectedMode.name}</span>
              <button onClick={() => { setSelectedMode(null); setSelectedSubTool(null); }} className="w-4 h-4 flex items-center justify-center hover:text-[#174ea6] cursor-pointer transition-colors ml-0.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsModelOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 text-sm cursor-pointer transition-colors"
            >
              <img src={selectedModel.avatar} alt={selectedModel.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="text-[13px] font-medium text-[#333]">{selectedModel.name}</span>
              <svg className="w-3 h-3 text-[#888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isModelOpen && (
              <div
                className="absolute right-0 bottom-full mb-1.5 bg-white rounded-xl overflow-hidden z-50 min-w-[130px]"
                style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.05)', padding: '6px 0' }}
              >
                {MODELS.map(m => (
                  <div
                    key={m.key}
                    onClick={() => { setSelectedModel(m); setIsModelOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-[rgba(0,0,0,0.04)] ${selectedModel.key === m.key ? 'font-semibold' : ''}`}
                  >
                    <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                    {m.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            className="w-8 h-8 bg-[#1d1d1f] rounded-full flex justify-center items-center text-white cursor-pointer transition-all hover:scale-110 hover:bg-black"
            style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* SubTool pill bar — shown below toolbar when a mode with subTools is active */}
      {selectedMode && (selectedMode as { subTools?: SubTool[] }).subTools?.length ? (
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {((selectedMode as { subTools?: SubTool[] }).subTools ?? []).map((st: SubTool) => (
            <button
              key={st.key}
              onClick={() => {
                const isActive = selectedSubTool?.key === st.key;
                setSelectedSubTool(isActive ? null : st);
                setInputValue(isActive ? '' : st.promptPrefix);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap flex-shrink-0
                ${ selectedSubTool?.key === st.key
                  ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-sm'
                  : 'bg-white text-[#555] border-[rgba(0,0,0,0.12)] hover:border-[#1a73e8] hover:text-[#1a73e8]'
                }`}
            >
              {st.name}
              {selectedSubTool?.key === st.key && (
                <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
