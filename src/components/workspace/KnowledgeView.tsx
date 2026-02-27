'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, LayoutGrid, List,
  FolderOpen, FileText, FileSpreadsheet, Image, Video, Music,
  Archive, MoreHorizontal, Upload, FolderPlus, X, Check,
  Eye, Download, Trash2, ChevronUp, ArrowUpDown, File, MoveRight,
} from 'lucide-react';
import {
  albums, files, formatFileSize, FORMAT_CATEGORIES,
  type FileFormat, type KnowledgeFile,
} from '@/lib/knowledgeMock';

type ViewMode = 'grid' | 'list';
type SortField = 'uploadedAt' | 'name' | 'format' | 'size';
type SortDir = 'asc' | 'desc';
type DateFilter = 'all' | 'today' | 'week' | 'month';

/* ─── Format badge colors ─────────────────────────────────── */
const FORMAT_BADGE: Record<FileFormat, { bg: string; text: string }> = {
  PDF:  { bg: '#fef2f2', text: '#dc2626' },
  DOCX: { bg: '#eff6ff', text: '#2563eb' },
  XLSX: { bg: '#f0fdf4', text: '#16a34a' },
  PPTX: { bg: '#fff7ed', text: '#ea580c' },
  PNG:  { bg: '#faf5ff', text: '#9333ea' },
  JPG:  { bg: '#faf5ff', text: '#9333ea' },
  MP4:  { bg: '#fefce8', text: '#ca8a04' },
  MP3:  { bg: '#fdf4ff', text: '#c026d3' },
  ZIP:  { bg: '#f8fafc', text: '#64748b' },
  MD:   { bg: '#f0fdfa', text: '#0d9488' },
  TXT:  { bg: '#f8fafc', text: '#64748b' },
};

function FileIcon({ format, className = 'w-5 h-5' }: { format: FileFormat; className?: string }) {
  const p = { className };
  switch (format) {
    case 'PNG': case 'JPG': return <Image {...p} />;
    case 'MP4': return <Video {...p} />;
    case 'MP3': return <Music {...p} />;
    case 'ZIP': return <Archive {...p} />;
    case 'XLSX': return <FileSpreadsheet {...p} />;
    default: return <FileText {...p} />;
  }
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function inDateRange(iso: string, f: DateFilter) {
  if (f === 'all') return true;
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (f === 'today') return d >= today;
  if (f === 'week') { const w = new Date(today); w.setDate(today.getDate() - 7); return d >= w; }
  if (f === 'month') { const m = new Date(today); m.setMonth(today.getMonth() - 1); return d >= m; }
  return true;
}

function SortIcon({ field, active, dir }: { field: SortField; active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30 inline-block ml-0.5" />;
  return dir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline-block ml-0.5" />
    : <ChevronDown className="w-3 h-3 inline-block ml-0.5" />;
}

/* ─── Main component ─────────────────────────────────────── */
export default function KnowledgeView() {
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterFormats, setFilterFormats] = useState<FileFormat[]>([]);
  const [filterDate, setFilterDate] = useState<DateFilter>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const activeFilterCount = (filterFormats.length > 0 ? 1 : 0) + (filterDate !== 'all' ? 1 : 0) + (selectedAlbum !== 'all' ? 1 : 0);
  const albumOptions = albums.filter(a => a.id !== 'all');
  const selectedAlbumObj = albums.find(a => a.id === selectedAlbum);

  const filteredFiles: KnowledgeFile[] = useMemo(() => {
    let res = [...files];
    if (selectedAlbum !== 'all') res = res.filter(f => f.album === selectedAlbum);
    if (search.trim()) res = res.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    if (filterFormats.length > 0) res = res.filter(f => filterFormats.includes(f.format));
    if (filterDate !== 'all') res = res.filter(f => inDateRange(f.uploadedAt, filterDate));
    return res.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'uploadedAt') cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'zh');
      else if (sortField === 'format') cmp = a.format.localeCompare(b.format);
      else if (sortField === 'size') cmp = a.size - b.size;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [selectedAlbum, search, filterFormats, filterDate, sortField, sortDir]);

  const allSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedIds.has(f.id));

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }

  function toggleSelectAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredFiles.map(f => f.id)));
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── PAGE TITLE ── */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
        <div className="max-w-full">
          <div className="text-sm text-gray-400 mb-1">我的上传</div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight font-[family-name:var(--font-playfair-display)]">My Uploads</h1>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-[380px] bg-white rounded-lg px-4 py-2 border border-gray-100 shadow-sm focus-within:border-gray-300 transition-colors">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索文件名..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 min-w-0"
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              )}
            </div>

            {/* Album filter */}
            <div className="relative">
              <button
                onClick={() => setShowAlbumMenu(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors
                  ${selectedAlbum !== 'all'
                    ? 'border-gray-300 bg-white text-gray-900 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {selectedAlbumObj?.color && selectedAlbum !== 'all' && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedAlbumObj.color }} />
                )}
                {selectedAlbum === 'all' ? (
                  <FolderOpen className="w-3.5 h-3.5" />
                ) : null}
                <span>{selectedAlbumObj?.name ?? '全部专辑'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showAlbumMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40">
                  <button
                    onClick={() => { setSelectedAlbum('all'); setShowAlbumMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors
                      ${selectedAlbum === 'all' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-gray-400" /> 全部文件
                  </button>
                  {albumOptions.map(album => (
                    <button
                      key={album.id}
                      onClick={() => { setSelectedAlbum(album.id); setShowAlbumMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors
                        ${selectedAlbum === album.id ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: album.color }} />
                      {album.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors
                  ${showFilter || activeFilterCount > 0
                    ? 'border-gray-400 bg-gray-100 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                筛选
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {showFilter && (
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">筛选条件</span>
                    {activeFilterCount > 0 && (
                      <button
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => { setFilterFormats([]); setFilterDate('all'); }}
                      >清除全部</button>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-2">文件格式</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Object.entries(FORMAT_CATEGORIES).map(([cat, fmts]) => {
                      const isActive = fmts.some(f => filterFormats.includes(f));
                      return (
                        <button
                          key={cat}
                          onClick={() => setFilterFormats(prev => {
                            const next = [...prev];
                            if (isActive) return next.filter(f => !fmts.includes(f));
                            fmts.forEach(f => { if (!next.includes(f)) next.push(f); });
                            return next;
                          })}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-colors
                            ${isActive ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-2">上传时间</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'today', 'week', 'month'] as DateFilter[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setFilterDate(d)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors
                          ${filterDate === d ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {{ all: '全部', today: '今天', week: '近7天', month: '近30天' }[d]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort dropdown (grid mode only) */}
            {viewMode === 'grid' && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  排序
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 hidden group-hover:block">
                  {([
                    ['uploadedAt', '上传时间'],
                    ['name',       '名称'],
                    ['format',     '文件格式'],
                    ['size',       '文件大小'],
                  ] as [SortField, string][]).map(([f, label]) => (
                    <button
                      key={f}
                      onClick={() => toggleSort(f)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors
                        ${sortField === f ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
                    >
                      {label}
                      <SortIcon field={f} active={sortField === f} dir={sortDir} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2.5">
              <span className="text-sm text-gray-400">共 {filteredFiles.length} 个文件</span>
              <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  title="方块视图"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  title="列表视图"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              {/* + 新建 */}
              <div className="relative">
                <button
                  onClick={() => setShowNewMenu(v => !v)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors select-none"
                >
                  <span className="text-base leading-none">+</span> 新建
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showNewMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40">
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      onClick={() => { setShowNewMenu(false); setShowAlbumModal(true); }}
                    >
                      <FolderPlus className="w-4 h-4 text-gray-400" /> 新建专辑
                    </button>
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      onClick={() => { setShowNewMenu(false); setShowUploadModal(true); }}
                    >
                      <Upload className="w-4 h-4 text-gray-400" /> 上传文件
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Batch actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-900 text-white text-sm">
              <span className="font-semibold">已选 {selectedIds.size} 个</span>
              <button className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                <Download className="w-3.5 h-3.5" /> 批量下载
              </button>
              <button className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                <MoveRight className="w-3.5 h-3.5" /> 移动到专辑
              </button>
              <button className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
              <button className="ml-auto hover:text-gray-300 transition-colors" onClick={() => setSelectedIds(new Set())}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File content area */}
          <div className="overflow-auto px-5 py-4">

            {/* Empty state */}
            {filteredFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-52 text-center">
                <File className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm mb-2">
                  {search || activeFilterCount > 0 ? '没有符合条件的文件' : '暂无文件'}
                </p>
                {(search || activeFilterCount > 0) ? (
                  <button
                    className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
                    onClick={() => { setSearch(''); setFilterFormats([]); setFilterDate('all'); }}
                  >
                    清除筛选条件
                  </button>
                ) : (
                  <button
                    className="text-sm font-semibold text-gray-900 hover:underline"
                    onClick={() => setShowUploadModal(true)}
                  >
                    立即上传文件
                  </button>
                )}
              </div>
            )}

            {/* GRID VIEW */}
            {filteredFiles.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredFiles.map(file => {
                  const badge = FORMAT_BADGE[file.format];
                  const isSelected = selectedIds.has(file.id);
                  const isHovered = hoveredId === file.id;
                  return (
                    <div
                      key={file.id}
                      className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-150 group
                        ${isSelected
                          ? 'border-gray-900 ring-1 ring-gray-900 shadow-md'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}`}
                      onMouseEnter={() => setHoveredId(file.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Checkbox */}
                      <div
                        className={`absolute top-2 left-2 z-10 transition-opacity duration-100
                          ${isSelected || isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        onClick={e => { e.stopPropagation(); toggleSelect(file.id); }}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shadow-sm
                          ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white/90 border-gray-300'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div className="h-30 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center relative overflow-hidden">
                        <div className="text-gray-700 opacity-60">
                          <FileIcon format={file.format} className="w-10 h-10 text-current" />
                        </div>
                        {/* Hover overlay */}
                        <div className={`absolute inset-0 bg-black/10 flex items-center justify-center gap-2 transition-opacity duration-150
                          ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <button
                            className="bg-white rounded-lg p-1.5 shadow hover:bg-gray-100 transition-colors"
                            title="预览"
                            onClick={e => e.stopPropagation()}
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <button
                            className="bg-white rounded-lg p-1.5 shadow hover:bg-gray-100 transition-colors"
                            title="更多操作"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Card info */}
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-900 truncate mb-2 leading-snug" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-100 bg-white text-gray-800">
                            {file.format}
                          </span>
                          <span className="text-[12px] text-gray-500">{fmtDate(file.uploadedAt).slice(5)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(() => {
                            const album = albums.find(a => a.id === file.album);
                            return album ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-100 text-gray-800 bg-white leading-tight">
                                {album.name}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIST VIEW */}
            {filteredFiles.length > 0 && viewMode === 'list' && (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="py-3 px-2 w-8">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors
                            ${allSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300 hover:border-gray-500'}`}
                          onClick={toggleSelectAll}
                        >
                          {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </th>
                      <th
                        className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none"
                        onClick={() => toggleSort('name')}
                      >
                        名称 <SortIcon field="name" active={sortField === 'name'} dir={sortDir} />
                      </th>
                      <th
                        className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none"
                        onClick={() => toggleSort('format')}
                      >
                        格式 <SortIcon field="format" active={sortField === 'format'} dir={sortDir} />
                      </th>
                      <th className="py-3 px-2 font-medium text-gray-600 hidden md:table-cell">所属专辑</th>
                      <th
                        className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none"
                        onClick={() => toggleSort('uploadedAt')}
                      >
                        上传时间 <SortIcon field="uploadedAt" active={sortField === 'uploadedAt'} dir={sortDir} />
                      </th>
                      <th
                        className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none hidden sm:table-cell"
                        onClick={() => toggleSort('size')}
                      >
                        大小 <SortIcon field="size" active={sortField === 'size'} dir={sortDir} />
                      </th>
                      <th className="py-2.5 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map(file => {
                      const badge = FORMAT_BADGE[file.format];
                      const isSelected = selectedIds.has(file.id);
                      return (
                        <tr
                          key={file.id}
                          className={`border-b border-gray-100 group transition-colors
                            ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="py-3 px-2">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors
                                ${isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-200 group-hover:border-gray-400'}`}
                              onClick={() => toggleSelect(file.id)}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-gray-700 opacity-60">
                                <FileIcon format={file.format} className="w-5 h-5 text-current" />
                              </span>
                              <span className="font-medium text-gray-900 truncate max-w-[180px]" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-100 bg-white text-gray-800">
                              {file.format}
                            </span>
                          </td>
                          <td className="py-3 px-2 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                const album = albums.find(a => a.id === file.album);
                                return album ? (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-100 text-gray-800 bg-white">
                                    {album.name}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-sm whitespace-nowrap">
                            {fmtDate(file.uploadedAt)}
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-sm whitespace-nowrap hidden sm:table-cell">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="py-3 px-2">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100">
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>

      {/* ── UPLOAD MODAL ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[95vw] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="font-semibold text-gray-900 text-base">上传文件</span>
              <button onClick={() => setShowUploadModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2.5 group-hover:text-gray-400 transition-colors" />
                <p className="text-sm font-medium text-gray-600 mb-1">点击选择或拖拽文件到此处</p>
                <p className="text-xs text-gray-400">支持 PDF、DOCX、XLSX、PPTX、PNG、MP4 等格式，单文件最大 500 MB</p>
                <input ref={fileInputRef} type="file" multiple className="hidden" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">加入专辑（可选）</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:border-gray-400 transition-colors">
                  <option value="">选择专辑</option>
                  {albumOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors">取消</button>
              <button className="px-4 py-2 rounded-lg text-sm bg-black text-white font-semibold hover:bg-gray-800 transition-colors">开始上传</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW ALBUM MODAL ── */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="font-semibold text-gray-900 text-base">新建专辑</span>
              <button onClick={() => setShowAlbumModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  专辑名称 <span className="text-red-400">*</span>
                </label>
                <input
                  value={newAlbumName}
                  onChange={e => setNewAlbumName(e.target.value)}
                  placeholder="输入专辑名称"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">描述（选填）</label>
                <textarea
                  rows={2}
                  placeholder="添加描述..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">父专辑（选填）</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:border-gray-400 transition-colors">
                  <option value="">无（顶级专辑）</option>
                  {albumOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowAlbumModal(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors">取消</button>
              <button
                disabled={!newAlbumName.trim()}
                className="px-4 py-2 rounded-lg text-sm bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside overlay to close dropdowns */}
      {(showNewMenu || showFilter || showAlbumMenu) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowNewMenu(false); setShowFilter(false); setShowAlbumMenu(false); }} />
      )}
    </div>
  );
}
