'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, LayoutGrid, List,
  FolderOpen, MoreHorizontal, Upload, FolderPlus, X, Check,
  Eye, Download, Trash2, ChevronUp, ArrowUpDown, MoveRight,
  ChevronLeft, ChevronRight, Folder, FileText, Play, Music,
  ZoomIn, ZoomOut,
} from 'lucide-react';
import {
  albums, files, formatFileSize, FORMAT_CATEGORIES,
  type FileFormat, type KnowledgeFile, type Album,
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

/* ─── File type SVG logos (Office-style) ─────────────────── */
function FileIcon({ format, className = 'w-5 h-5' }: { format: FileFormat; className?: string }) {
  // Derive pixel size from className for viewBox scaling
  const big = className.includes('w-10');
  const size = big ? 40 : 20;

  const base = (bg: string, label: string, textColor = '#fff', fontSize?: number) => (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill={bg} />
      <text
        x="50%" y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={textColor}
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="bold"
        fontSize={fontSize ?? (label.length > 2 ? 11 : 16)}
        letterSpacing={label.length > 2 ? '-0.5' : '0'}
      >{label}</text>
    </svg>
  );

  switch (format) {
    // Microsoft Word – blue gradient background, white W
    case 'DOCX': return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="docx-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2b7cd3"/>
            <stop offset="100%" stopColor="#185abd"/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="8" fill="url(#docx-bg)" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#fff"
          fontFamily="'Segoe UI', Arial, sans-serif" fontWeight="bold" fontSize="18">W</text>
      </svg>
    );
    // Microsoft Excel – green gradient, white X
    case 'XLSX': return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="xlsx-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#21a366"/>
            <stop offset="100%" stopColor="#107c41"/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="8" fill="url(#xlsx-bg)" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#fff"
          fontFamily="'Segoe UI', Arial, sans-serif" fontWeight="bold" fontSize="18">X</text>
      </svg>
    );
    // Microsoft PowerPoint – orange/red gradient, white P
    case 'PPTX': return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pptx-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ed6c47"/>
            <stop offset="100%" stopColor="#c43e1c"/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="8" fill="url(#pptx-bg)" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#fff"
          fontFamily="'Segoe UI', Arial, sans-serif" fontWeight="bold" fontSize="18">P</text>
      </svg>
    );
    // PDF – red background, white PDF
    case 'PDF': return base('#e53935', 'PDF', '#fff', 11);
    // Images – purple
    case 'PNG': case 'JPG': return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#7c3aed" />
        {/* Simple mountain/image icon */}
        <rect x="8" y="10" width="24" height="18" rx="2" fill="none" stroke="#fff" strokeWidth="2.5"/>
        <circle cx="15" cy="17" r="2.5" fill="#fff"/>
        <polyline points="8,28 16,19 22,25 27,20 32,28" fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    );
    // Video – amber
    case 'MP4': return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#d97706" />
        {/* Play triangle */}
        <polygon points="15,12 15,28 29,20" fill="#fff"/>
      </svg>
    );
    // Audio – fuchsia
    case 'MP3': return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#c026d3" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="#fff" strokeWidth="2.5"/>
        <circle cx="20" cy="20" r="3" fill="#fff"/>
        <line x1="20" y1="12" x2="20" y2="8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <line x1="26" y1="14" x2="29" y2="11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
    // ZIP – slate
    case 'ZIP': return base('#475569', 'ZIP', '#fff', 11);
    // Markdown – teal
    case 'MD': return base('#0d9488', 'MD', '#fff', 13);
    // Text – gray
    default: return base('#94a3b8', 'TXT', '#fff', 11);
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

/* ─── Format badge pill ──────────────────────────────────── */
function FormatPill({ format }: { format: FileFormat }) {
  const badge = FORMAT_BADGE[format];
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
      style={{ background: badge.bg, color: badge.text }}
    >
      {format}
    </span>
  );
}

/* ─── Format-aware file thumbnail ───────────────────────── */
function FileThumbnail({ format, snippet }: { format: FileFormat; snippet?: string }) {
  // ── XLSX: realistic spreadsheet with header + data rows ──
  if (format === 'XLSX') {
    // Parse snippet into table rows if formatted as TSV-like
    const rows = snippet
      ? snippet.split('\n').map(r => r.split('|').map(c => c.trim()).filter(Boolean)).filter(r => r.length > 1).slice(0, 7)
      : [];
    const headers = rows[0] ?? ['区域', '目标', '实际', '完成率'];
    const dataRows = rows.length > 1 ? rows.slice(1) : [
      ['华北', '820', '876', '106.8%'],
      ['华东', '1100', '1043', '94.8%'],
      ['华南', '950', '1021', '107.5%'],
      ['西南', '680', '712', '104.7%'],
      ['合计', '3550', '3652', '102.9%'],
    ];
    return (
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-white" style={{ fontSize: 7 }}>
        {/* Column headers */}
        <div className="flex shrink-0" style={{ backgroundColor: '#217346' }}>
          {headers.map((h, i) => (
            <div key={i} className="px-1.5 py-1 text-white font-bold truncate" style={{ flex: i === 0 ? '1.4 1 0' : '1 1 0', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{h}</div>
          ))}
        </div>
        {/* Data rows */}
        {dataRows.map((row, r) => (
          <div key={r} className="flex shrink-0" style={{ backgroundColor: r % 2 === 0 ? '#f0faf4' : '#ffffff', borderBottom: '1px solid #e2f0e8' }}>
            {row.map((cell, i) => (
              <div key={i} className="px-1.5 py-0.5 text-gray-700 truncate" style={{ flex: i === 0 ? '1.4 1 0' : '1 1 0', borderRight: '1px solid #e2f0e8', textAlign: i > 0 ? 'right' : 'left', color: cell.includes('%') ? (parseFloat(cell) >= 100 ? '#217346' : '#c0392b') : undefined }}>{cell}</div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── DOCX: Word-like document with heading + paragraphs ──
  if (format === 'DOCX') {
    const lines = snippet ? snippet.split('\n').filter(Boolean) : [];
    return (
      <div className="absolute inset-0 flex flex-col px-3 py-3 overflow-hidden bg-white">
        {/* Top blue rule */}
        <div className="h-[3px] rounded-full mb-2" style={{ backgroundColor: '#2b579a', width: '100%' }} />
        {lines.length > 0 ? (
          lines.map((line, i) => (
            <p key={i} className="truncate mb-[3px] leading-snug"
              style={{ fontSize: i === 0 ? 8 : 7, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#1a1a2e' : '#555' }}>
              {line}
            </p>
          ))
        ) : (
          <>
            <div className="h-[5px] rounded bg-gray-800/25 w-[58%] mb-2" />
            {[92, 76, 86, 64, 88, 70, 80, 54, 84].map((w, i) => (
              <div key={i} className="h-[3px] rounded-full bg-gray-200 mb-[4px]" style={{ width: `${w}%` }} />
            ))}
          </>
        )}
      </div>
    );
  }

  // ── PPTX: slide-like layout with big title + bullets ──
  if (format === 'PPTX') {
    const lines = snippet ? snippet.split('\n').filter(Boolean) : [];
    const title = lines[0] ?? 'Presentation';
    const subtitle = lines[1] ?? '';
    const bullets = lines.slice(2, 6);
    return (
      <div className="absolute inset-0 flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#c7304a 0%,#8b1a2e 100%)' }}>
        {/* Decorative shape */}
        <div className="absolute right-0 top-0 w-16 h-16 opacity-20 rounded-bl-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <div className="flex-1 flex flex-col justify-center px-4 py-3">
          <p className="font-black leading-tight mb-1 text-white" style={{ fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.7 }}>幻灯片</p>
          <p className="font-bold leading-tight text-white mb-1 break-words" style={{ fontSize: 11 }}>{title}</p>
          {subtitle && <p className="text-white/70 mb-2 truncate" style={{ fontSize: 7 }}>{subtitle}</p>}
          <div className="space-y-0.5">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-1">
                <div className="w-1 h-1 rounded-full bg-white/50 mt-[3px] shrink-0" />
                <p className="text-white/80 truncate" style={{ fontSize: 7 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom bar */}
        <div className="h-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
      </div>
    );
  }

  // ── PNG / JPG: gradient image placeholder ──
  if (format === 'PNG' || format === 'JPG') return (
    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#e0e7ff 0%,#f0fdf4 50%,#fdf4ff 100%)' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow">
          <FileIcon format={format} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  // ── MP4: cinema-dark with play, progress bar, timecode ──
  if (format === 'MP4') {
    const info = snippet ? snippet.split('\n') : [];
    const meta = info[0] ?? '';
    return (
      <div className="absolute inset-0 flex flex-col bg-gray-950 overflow-hidden">
        {/* Fake frame content */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Film grain texture */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.05) 2px,rgba(255,255,255,0.05) 4px)' }} />
          {/* Play button */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 bg-white/10 backdrop-blur-sm">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
          {/* Timestamps */}
          {meta && (
            <div className="absolute top-2 left-2 bg-black/60 rounded px-1.5 py-0.5">
              <p className="text-white/70" style={{ fontSize: 6 }}>{meta.split('|')[0]?.trim()}</p>
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="shrink-0 px-3 pb-2 pt-1">
          <div className="h-[3px] rounded-full bg-white/10 w-full relative">
            <div className="h-full rounded-full bg-red-500" style={{ width: '38%' }} />
            <div className="absolute top-[-2px] w-[7px] h-[7px] rounded-full bg-red-500 border-2 border-white/80" style={{ left: 'calc(38% - 3px)' }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-white/40" style={{ fontSize: 6 }}>1:44</span>
            <span className="text-white/40" style={{ fontSize: 6 }}>4:07</span>
          </div>
        </div>
      </div>
    );
  }

  // ── MP3: audio player with waveform ──
  if (format === 'MP3') {
    const info = snippet ? snippet.split('\n') : [];
    const meta = info[0] ?? '';
    const artist = info[1] ?? '';
    const bars = [6,10,16,22,14,28,20,8,24,18,12,26,10,20,16,24,8,18,22,14,10,20];
    return (
      <div className="absolute inset-0 flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#2d1b69 0%,#1a0936 100%)' }}>
        {/* Album art placeholder */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
          <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <Music className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {meta && <p className="text-white/80 truncate font-semibold" style={{ fontSize: 7 }}>{meta.split('|')[1]?.trim() ?? meta}</p>}
            {artist && <p className="text-white/50 truncate" style={{ fontSize: 6 }}>{artist.replace(/作曲|作词|：/g, '').trim().slice(0, 20)}</p>}
          </div>
        </div>
        {/* Waveform */}
        <div className="flex-1 flex items-end px-3 pb-2 gap-[2px]">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-full"
              style={{ height: `${h}px`, backgroundColor: i < 9 ? '#a78bfa' : 'rgba(167,139,250,0.3)' }} />
          ))}
        </div>
        {/* Progress */}
        <div className="px-3 pb-2.5 shrink-0">
          <div className="h-[2px] rounded-full bg-white/10 w-full">
            <div className="h-full rounded-full bg-violet-400" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── MD: markdown with heading indicator ──
  if (format === 'MD') {
    const lines = snippet ? snippet.split('\n').filter(Boolean) : [];
    return (
      <div className="absolute inset-0 flex flex-col px-3 py-3 gap-[3px] overflow-hidden bg-white">
        {lines.length > 0 ? (
          lines.map((line, i) => {
            const isH = line.startsWith('#');
            const text = line.replace(/^#+\s*/, '');
            return (
              <div key={i} className="flex items-baseline gap-1">
                {isH && <span className="shrink-0 font-bold" style={{ fontSize: 7, color: '#0d9488' }}>#</span>}
                <p className="truncate" style={{ fontSize: isH ? 8 : 7, fontWeight: isH ? 700 : 400, color: isH ? '#134e4a' : '#6b7280' }}>{text}</p>
              </div>
            );
          })
        ) : (
          <>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-bold text-teal-500" style={{ fontSize: 7 }}>#</span>
              <div className="h-[4px] rounded-full bg-gray-700/25 w-[52%]" />
            </div>
            {[84, 66, 76, 90, 58, 74, 82, 56].map((w, i) => (
              <div key={i} className="h-[3px] rounded-full bg-gray-200" style={{ width: `${w}%` }} />
            ))}
          </>
        )}
      </div>
    );
  }

  // ── Default (PDF, TXT, ZIP) ──
  return (
    <div className="absolute inset-0 flex flex-col px-3 py-3 gap-[4px] overflow-hidden bg-white">
      <div className="h-[5px] rounded-full bg-gray-400/30 w-[62%] mb-1.5" />
      {[92, 74, 86, 62, 90, 70, 80, 56, 84, 68].map((w, i) => (
        <div key={i} className={`h-[3px] rounded-full bg-gray-200 ${i % 4 === 3 ? 'mb-1' : ''}`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/* ─── Single file card thumbnail wrapper ─────────────────── */
function FileCardThumb({ format, snippet }: { format: FileFormat; snippet?: string }) {
  return (
    <div className="relative h-36 overflow-hidden" style={{ backgroundColor: format === 'MP4' ? '#030712' : format === 'MP3' ? '#1a0936' : format === 'PPTX' ? '#8b1a2e' : '#f9fafb' }}>
      {/* Format badge top-right (only for non-rich formats) */}
      {format !== 'MP4' && format !== 'MP3' && format !== 'PPTX' && (
        <div className="absolute top-2 right-2 z-10">
          <FileIcon format={format} className="w-4 h-4" />
        </div>
      )}
      <FileThumbnail format={format} snippet={snippet} />
    </div>
  );
}

/* ─── Album card ─────────────────────────────────────────── */
function AlbumCard({
  album,
  fileCount,
  albumFileList,
  latestDate,
  onOpen,
  onPreview,
  isSelected,
  isHovered,
  onSelect,
  onHoverEnter,
  onHoverLeave,
}: {
  album: Album;
  fileCount: number;
  albumFileList: KnowledgeFile[];
  latestDate: string;
  onOpen: () => void;
  onPreview: () => void;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}) {
  // Pick 3 files with varied formats for the stacked papers (back→front = index 2→1→0)
  // Pick the 3 most recently uploaded files
  const recent = albumFileList
    .slice()
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 3);
  while (recent.length < 3) recent.unshift(recent[0] ?? albumFileList[0]);
  // paperFiles[0]=back, [1]=middle, [2]=front
  const paperFiles = [recent[2], recent[1], recent[0]].filter(Boolean) as KnowledgeFile[];

  const paperBg = (fmt: FileFormat) => ({
    MP4: '#030712', MP3: '#1a0936', PPTX: '#8b1a2e',
    XLSX: '#f0faf4', DOCX: '#f8f9fa', MD: '#ffffff',
    PDF: '#f9fafb', PNG: '#f3f4f6', JPG: '#f3f4f6',
    TXT: '#fafafa', ZIP: '#fef9ec',
  }[fmt] ?? '#f5f5f5');

  return (
    <div
      className={`relative rounded-3xl cursor-pointer transition-all duration-200 group bg-white overflow-hidden
        ${isSelected ? 'ring-2 ring-gray-900 shadow-2xl' : 'shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.16)] hover:-translate-y-1'}`}
      style={{ border: `1.5px solid ${isSelected ? '#111' : 'rgba(0,0,0,0.07)'}`, height: 290 }}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      onClick={onOpen}
    >
      {/* ── Checkbox ── */}
      <div
        className={`absolute top-4 left-4 z-30 transition-opacity duration-100 ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => { e.stopPropagation(); onSelect(); }}
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors
          ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white/90 border-gray-300'}`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 px-5 pt-5 pb-2">
        <div className="flex items-start gap-2">
          <p className="text-[19px] font-bold text-gray-900 leading-tight tracking-tight flex-1 min-w-0 break-words">{album.name}</p>
          <span className="shrink-0 mt-0.5 min-w-[28px] h-[28px] rounded-full bg-gray-100 text-gray-500 text-[12px] font-semibold flex items-center justify-center px-1.5">
            {fileCount}
          </span>
        </div>
      </div>

      {/* ── Stacked papers — anchored bottom-right, blank space on bottom-left ── */}
      {/* The anchor point is bottom-right; cards fan left from there */}
      <div className="absolute" style={{ top: '30%', left: '30%', right: 8, bottom: 8 }}>
        {/* Back paper — most rotated left (-14°), fans out to the left; right side hidden so no right radius */}
        {paperFiles[0] && (
          <div className="absolute overflow-hidden"
            style={{
              inset: 0,
              zIndex: 1,
              transform: 'rotate(-14deg)',
              transformOrigin: '100% 100%',
              borderRadius: '16px 0 0 16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
              border: '1px solid rgba(0,0,0,0.07)',
              backgroundColor: paperBg(paperFiles[0].format),
            }}>
            <FileThumbnail format={paperFiles[0].format} snippet={paperFiles[0].snippet} />
          </div>
        )}
        {/* Middle paper — half rotation (-7°) */}
        {paperFiles[1] && (
          <div className="absolute rounded-2xl overflow-hidden"
            style={{
              inset: 0,
              zIndex: 2,
              transform: 'rotate(-7deg)',
              transformOrigin: '100% 100%',
              boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.07)',
              backgroundColor: paperBg(paperFiles[1].format),
            }}>
            <FileThumbnail format={paperFiles[1].format} snippet={paperFiles[1].snippet} />
          </div>
        )}
        {/* Front paper — upright (0°), right edge flat (clipped by card boundary) */}
        {paperFiles[2] && (
          <div className="absolute overflow-hidden"
            style={{
              inset: 0,
              zIndex: 3,
              borderRadius: '16px 0 0 16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.07)',
              backgroundColor: paperBg(paperFiles[2].format),
            }}>
            <FileThumbnail format={paperFiles[2].format} snippet={paperFiles[2].snippet} />
            <div className="absolute bottom-0 inset-x-0 px-3 py-2 z-10"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}>
              <p className="text-[9px] font-semibold text-white/90 truncate leading-tight drop-shadow">{paperFiles[2].name}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Hover overlay + buttons ── */}
      <div className={`absolute inset-0 z-20 transition-opacity duration-150 rounded-3xl ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.04)' }} />
      <div className={`absolute inset-x-0 top-[42%] flex justify-center gap-2 z-30 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          className="bg-white rounded-xl px-3 py-1.5 shadow-lg hover:bg-gray-50 transition-colors text-[11px] font-semibold text-gray-800 flex items-center gap-1.5 border border-gray-100"
          onClick={e => { e.stopPropagation(); onOpen(); }}
        >
          <FolderOpen className="w-3.5 h-3.5" /> 打开
        </button>
        <button
          className="bg-white rounded-xl p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-100"
          onClick={e => { e.stopPropagation(); onPreview(); }}
        >
          <Eye className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

/* ─── File preview modal ──────────────────────────────────── */
/* ─── Per-format preview content (large scale) ──────────── */
function PreviewContent({ file }: { file: KnowledgeFile }) {
  const { format, name, snippet, size, uploadedAt } = file;
  const lines = snippet ? snippet.split('\n').filter(Boolean) : [];
  const dateStr = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // ── XLSX ──────────────────────────────────────────────────────────────────
  if (format === 'XLSX') {
    const hasPipeData = lines.some(l => l.includes('|'));
    if (hasPipeData) {
      const rows = lines.map(r => r.split('|').map(c => c.trim()).filter(Boolean)).filter(r => r.length > 1);
      const headers = rows[0] ?? ['区域', '目标', '实际', '完成率'];
      const dataRows = rows.length > 1 ? rows.slice(1) : [];
      return (
        <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ maxWidth: 760, maxHeight: '72vh' }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <FileIcon format="XLSX" className="w-7 h-7" />
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(size)}</p>
            </div>
            <div className="ml-auto"><FormatPill format="XLSX" /></div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-white text-xs font-bold whitespace-nowrap" style={{ backgroundColor: '#217346', borderRight: '1px solid rgba(255,255,255,0.15)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, r) => (
                  <tr key={r} style={{ backgroundColor: r % 2 === 0 ? '#f0faf4' : '#fff' }}>
                    {row.map((cell, i) => {
                      const isPct = cell.includes('%');
                      const isGood = isPct && parseFloat(cell) >= 100;
                      const isBad = isPct && parseFloat(cell) < 100;
                      return (
                        <td key={i} className="px-4 py-2.5 border-b border-gray-100 whitespace-nowrap"
                          style={{ textAlign: i > 0 ? 'right' : 'left', color: isGood ? '#217346' : isBad ? '#c0392b' : '#374151', fontWeight: isPct ? 600 : 400 }}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {dataRows.length === 0 && (
                  <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400 text-sm">暂无数据行</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Metric/KPI visualization for · separated or plain snippet
    const segs = snippet ? snippet.split(/[·•]/).map(s => s.trim()).filter(Boolean) : [];
    const chartTitle = segs.length > 1 ? segs[0] : (name.replace(/\.xlsx?$/i, ''));
    const metrics = segs.length > 1
      ? segs.slice(1).map(s => {
          const m = s.match(/^(.*?)\s+([\d,.]+[%万千M]?)$/);
          return m ? { label: m[1].trim(), value: m[2] } : { label: s, value: '' };
        }).filter(m => m.value)
      : [];
    const hasPctMetrics = metrics.some(m => m.value.endsWith('%'));
    const barColors = ['#217346', '#4ade80', '#86efac', '#bbf7d0', '#d1fae5'];

    return (
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ width: '64vw', maxWidth: 740, height: '72vh' }}>
        {/* Excel-style title bar */}
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <FileIcon format="XLSX" className="w-6 h-6" />
          <span className="font-semibold text-gray-800 text-sm truncate flex-1">{name}</span>
          <FormatPill format="XLSX" />
        </div>
        {/* Spreadsheet grid background */}
        <div className="flex-1 overflow-auto px-8 py-7" style={{ backgroundImage: 'linear-gradient(rgba(33,115,70,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(33,115,70,0.04) 1px,transparent 1px)', backgroundSize: '40px 36px' }}>
          {/* Dashboard title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#217346' }} />
            <h2 className="font-bold text-gray-800 text-lg">{chartTitle}</h2>
            <span className="text-xs text-gray-400 ml-2">{dateStr}</span>
          </div>

          {hasPctMetrics ? (
            <>
              {/* Metric cards grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {metrics.map((m, i) => {
                  const pct = parseFloat(m.value);
                  const isOver = pct >= 100;
                  return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
                      <p className="text-gray-500 text-xs mb-1">{m.label}</p>
                      <p className="font-black text-xl mb-2.5" style={{ color: barColors[i % barColors.length] }}>{m.value}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isOver ? '#217346' : barColors[i % barColors.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Stacked bar overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
                <p className="text-xs text-gray-400 mb-3 font-medium">占比分布</p>
                <div className="flex h-6 rounded-lg overflow-hidden gap-px">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-center text-white text-[10px] font-bold transition-all" style={{ flex: parseFloat(m.value) || 1, backgroundColor: barColors[i % barColors.length] }}>
                      {parseFloat(m.value) > 12 ? m.value : ''}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 flex-wrap">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: barColors[i % barColors.length] }} />
                      <span className="text-xs text-gray-500">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Fallback: show as a simple styled data table */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              {lines.map((line, i) => (
                <p key={i} className="text-gray-700 text-sm leading-relaxed mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PPTX ──────────────────────────────────────────────────────────────────
  if (format === 'PPTX') {
    const title = lines[0] ?? name;
    const subtitle = lines[1] ?? '';
    const bullets = lines.slice(2);
    return (
      <div className="rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ width: '68vw', height: '56vh', background: 'linear-gradient(145deg,#c7304a 0%,#7a1428 100%)' }}>
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.35),transparent)' }} />
        <div className="flex-1 flex flex-col justify-center px-16 py-12">
          <p className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase mb-4">幻灯片预览</p>
          <h1 className="text-white font-black leading-tight mb-3" style={{ fontSize: 'clamp(22px,3vw,38px)' }}>{title}</h1>
          {subtitle && <p className="text-white/70 text-lg mb-8 leading-relaxed">{subtitle}</p>}
          {bullets.length > 0 && (
            <ul className="space-y-2.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-2 shrink-0" />
                  <span className="text-white/80 text-base leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {/* Fallback decoration when snippet is single-line */}
          {bullets.length === 0 && !subtitle && lines.length <= 1 && (
            <div className="space-y-2 mt-4">
              {[70, 55, 60, 48].map((w, i) => (
                <div key={i} className="h-2.5 rounded-full bg-white/10" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-8 py-3 border-t border-white/10">
          <span className="text-white/30 text-xs">{name.replace(/\.pptx?$/i, '')}</span>
          <span className="text-white/30 text-xs">1 / 1</span>
        </div>
      </div>
    );
  }

  // ── MP4 ───────────────────────────────────────────────────────────────────
  if (format === 'MP4') {
    const meta = lines[0] ?? '';
    const chapters = lines.slice(1);
    return (
      <div className="rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-black" style={{ width: '72vw', height: '60vh' }}>
        <div className="flex-1 relative flex items-center justify-center bg-gray-950">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.1) 3px,rgba(255,255,255,0.1) 4px)' }} />
          <div className="absolute top-0 left-0 right-0 h-8 bg-black" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black" />
          <div className="w-16 h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/25 transition-colors cursor-pointer">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
          {meta && (
            <div className="absolute top-10 left-4 bg-black/70 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <p className="text-white/70 text-xs font-mono">{meta}</p>
            </div>
          )}
          {chapters.length > 0 && (
            <div className="absolute right-4 top-10 bottom-10 w-44 bg-black/50 rounded-xl p-3 backdrop-blur-sm overflow-auto">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">章节</p>
              {chapters.map((ch, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-white/10 rounded px-1 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                  <span className="text-white/60 text-xs truncate">{ch}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 pt-3 pb-4 bg-gray-950 border-t border-white/5 shrink-0">
          <div className="relative h-1 bg-white/10 rounded-full mb-2 cursor-pointer group">
            <div className="h-full w-[38%] bg-red-500 rounded-full" />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow" style={{ left: 'calc(38% - 6px)' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-mono">1:44</span>
            <div className="flex items-center gap-3">
              <button className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                <Play className="w-3.5 h-3.5 text-white ml-0.5" />
              </div>
              <button className="text-white/40 hover:text-white/70 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <span className="text-white/40 text-xs font-mono">4:07</span>
          </div>
        </div>
      </div>
    );
  }

  // ── MP3 ───────────────────────────────────────────────────────────────────
  if (format === 'MP3') {
    const meta = lines[0] ?? '';
    const authorLine = lines[1] ?? '';
    const bars = [4,8,14,20,28,22,16,30,24,12,26,18,8,22,16,28,10,20,24,14,8,18,22,12,26,20];
    return (
      <div className="rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ width: 480, background: 'linear-gradient(160deg,#2d1b69 0%,#0f0720 100%)' }}>
        <div className="flex justify-center pt-10 pb-6">
          <div className="w-32 h-32 rounded-2xl shadow-2xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
            <Music className="w-14 h-14 text-white/80" />
          </div>
        </div>
        <div className="px-8 pb-4 text-center">
          <p className="text-white font-bold text-xl leading-tight mb-1 truncate">{name.replace(/\.mp3$/i, '')}</p>
          {authorLine && <p className="text-white/50 text-sm">{authorLine.replace(/作曲|作词|：/g, ' ').trim()}</p>}
          {meta && <p className="text-white/30 text-xs mt-1">{meta}</p>}
        </div>
        <div className="flex items-end px-8 gap-[3px] h-16">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-full transition-colors"
              style={{ height: `${h}px`, backgroundColor: i < 10 ? '#a78bfa' : 'rgba(167,139,250,0.2)' }} />
          ))}
        </div>
        <div className="px-8 pt-2 pb-2">
          <div className="h-1 bg-white/10 rounded-full relative">
            <div className="h-full w-[40%] bg-violet-400 rounded-full" />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-violet-400 rounded-full border-2 border-white shadow" style={{ left: 'calc(40% - 6px)' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/30 text-xs font-mono">1:17</span>
            <span className="text-white/30 text-xs font-mono">3:22</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 px-8 pb-8 pt-2">
          <button className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <Play className="w-5 h-5 text-gray-900 ml-0.5" />
          </div>
          <button className="text-white/40 hover:text-white/70 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    );
  }

  // ── PNG / JPG ──────────────────────────────────────────────────────────────
  if (format === 'PNG' || format === 'JPG') {
    return (
      <div className="rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center" style={{ width: '60vw', maxHeight: '70vh', background: 'linear-gradient(135deg,#e0e7ff,#fdf4ff,#f0fdf4)', minHeight: 360 }}>
        <div className="flex flex-col items-center gap-4 text-gray-400 p-16">
          <div className="w-20 h-20 rounded-2xl bg-white/70 shadow flex items-center justify-center">
            <FileIcon format={format} className="w-10 h-10" />
          </div>
          <p className="text-sm">{name}</p>
          <p className="text-xs text-gray-300">{formatFileSize(size)}</p>
        </div>
      </div>
    );
  }

  // ── PDF ────────────────────────────────────────────────────────────────────
  if (format === 'PDF') {
    const docTitle = name.replace(/\.pdf$/i, '');
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl flex flex-col" style={{ width: '64vw', maxWidth: 800, height: '78vh', backgroundColor: '#525659' }}>
        {/* PDF reader toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ backgroundColor: '#3d3d3d' }}>
          <FileIcon format="PDF" className="w-4 h-4" />
          <span className="text-white/75 text-xs truncate flex-1 font-medium">{name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-white/35 text-xs">{formatFileSize(size)}</span>
            <div className="w-px h-3 bg-white/20" />
            <span className="text-white/35 text-xs">1 / 1</span>
          </div>
        </div>
        {/* Page area */}
        <div className="flex-1 overflow-auto flex justify-center py-5 px-8">
          <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.55)] w-full max-w-[520px] min-h-full flex flex-col px-14 py-12">
            {/* Title section */}
            <div className="flex items-start gap-3 mb-7 pb-5 border-b border-gray-200">
              <div className="w-1.5 shrink-0 self-stretch rounded-full mt-1" style={{ backgroundColor: '#e44c3e' }} />
              <div>
                <h1 className="font-bold text-gray-900 text-[17px] leading-snug mb-1">{docTitle}</h1>
                {dateStr && <p className="text-gray-400 text-xs">{dateStr}</p>}
              </div>
            </div>
            {/* Snippet / abstract */}
            {lines.length > 0 && (
              <div className="mb-7">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">摘要</p>
                <div className="space-y-2.5">
                  {lines.map((line, i) => (
                    <p key={i} className="text-gray-700 text-[13.5px] leading-[1.85]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{line}</p>
                  ))}
                </div>
              </div>
            )}
            {/* Simulated body content */}
            <div className="space-y-1.5 flex-1">
              {[94, 88, 96, 72, 90, 83, 97, 65, 89, 78, 93, 70, 88, 42].map((w, i) => (
                <div key={i} className={`rounded ${i % 7 === 6 ? 'mb-4' : ''}`}
                  style={{ height: i % 7 === 0 ? '11px' : '9px', width: `${w}%`, backgroundColor: i % 7 === 0 ? '#e5e7eb' : '#f3f4f6' }} />
              ))}
            </div>
            {/* Footer */}
            <div className="mt-8 pt-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-gray-300 text-[10px]">{formatFileSize(size)}</span>
              <span className="text-gray-400 text-[10px] font-mono">— 1 —</span>
              <span className="text-gray-300 text-[10px]">{dateStr}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DOCX ──────────────────────────────────────────────────────────────────
  if (format === 'DOCX') {
    const docTitle = name.replace(/\.docx?$/i, '');
    const isRichSnippet = lines.length >= 3;
    return (
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ width: '58vw', maxWidth: 720, height: '72vh' }}>
        {/* Word-style toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/80 shrink-0">
          <FileIcon format="DOCX" className="w-6 h-6" />
          <span className="font-semibold text-gray-800 text-sm truncate flex-1">{name}</span>
          <FormatPill format="DOCX" />
        </div>
        {/* Page content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-8 px-6">
          <div className="bg-white shadow-md w-full max-w-[540px] min-h-full px-14 py-12 flex flex-col" style={{ fontFamily: 'Georgia, serif' }}>
            {/* Blue Word-style top accent */}
            <div className="h-[3px] mb-6 rounded" style={{ backgroundColor: '#2b579a' }} />
            {/* Document title */}
            <h1 className="font-bold text-gray-900 text-xl mb-2 leading-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>{docTitle}</h1>
            {dateStr && <p className="text-gray-400 text-xs mb-6" style={{ fontFamily: 'system-ui' }}>{dateStr} · {formatFileSize(size)}</p>}
            {isRichSnippet ? (
              // Rich multi-line snippet: render as styled document sections
              <div className="space-y-1">
                {lines.map((line, i) => {
                  const isSection = i === 0 || line.endsWith('：') || /^[一二三四五六七八九十\d]+[、.]/.test(line);
                  if (isSection) {
                    return (
                      <p key={i} className="font-bold text-gray-800 text-sm mt-5 first:mt-0" style={{ fontFamily: 'system-ui' }}>{line}</p>
                    );
                  }
                  return (
                    <p key={i} className="text-gray-600 text-[13px] leading-[1.85]">{line}</p>
                  );
                })}
              </div>
            ) : (
              // Short snippet: show as an "excerpt" callout + implied content
              <>
                {lines.length > 0 && (
                  <div className="border-l-4 pl-4 mb-6 py-1" style={{ borderColor: '#2b579a' }}>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">文档摘要</p>
                    {lines.map((line, i) => (
                      <p key={i} className="text-gray-700 text-sm leading-[1.9]">{line}</p>
                    ))}
                  </div>
                )}
                {/* Simulated document body */}
                <div className="space-y-1.5">
                  {[88, 92, 76, 95, 83, 90, 68, 87, 79, 93, 71, 85, 60, 88, 42].map((w, i) => (
                    <div key={i} className={`rounded ${i % 5 === 4 ? 'mb-4' : ''}`}
                      style={{ height: i % 5 === 0 ? '11px' : '9px', width: `${w}%`, backgroundColor: i % 5 === 0 ? '#e5e7eb' : '#f1f5f9' }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── MD ────────────────────────────────────────────────────────────────────
  if (format === 'MD') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ width: '58vw', maxWidth: 720, height: '72vh' }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <FileIcon format="MD" className="w-6 h-6" />
          <span className="font-semibold text-gray-800 text-sm truncate flex-1">{name}</span>
          <FormatPill format="MD" />
        </div>
        <div className="flex-1 overflow-auto px-12 py-8" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {lines.length > 0 ? (
            lines.map((line, i) => {
              const h1 = line.startsWith('# '); const h2 = line.startsWith('## '); const h3 = line.startsWith('### ');
              const bullet = line.startsWith('- ') || /^\d+\.\s/.test(line);
              const text = line.replace(/^#{1,3}\s/, '').replace(/^[-\d.]+\s/, '');
              if (h1) return <h1 key={i} className="text-2xl font-black text-gray-900 mb-4 pb-2 border-b border-gray-200">{text}</h1>;
              if (h2) return <h2 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-2">{text}</h2>;
              if (h3) return <h3 key={i} className="text-base font-semibold text-gray-700 mt-4 mb-2">{text}</h3>;
              if (bullet) return <li key={i} className="text-gray-600 text-sm leading-relaxed ml-4 mb-1.5 list-disc">{text}</li>;
              return <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{line}</p>;
            })
          ) : (
            <>
              <div className="h-7 bg-gray-200 rounded w-1/2 mb-5" />
              {[90,72,84,60,88,68,78,52].map((w, i) => (
                <div key={i} className="h-3 bg-gray-100 rounded mb-2" style={{ width: `${w}%` }} />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── TXT / ZIP / default ───────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ width: '56vw', maxWidth: 680, height: '72vh' }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <FileIcon format={format} className="w-6 h-6" />
        <span className="font-semibold text-gray-800 text-sm truncate flex-1">{name}</span>
        <FormatPill format={format} />
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-8 px-6">
        <div className="bg-white shadow-md w-full max-w-[500px] min-h-full px-12 py-10">
          <div className="h-[3px] mb-6 rounded bg-gray-300" />
          <h2 className="font-bold text-gray-800 text-base mb-1">{name.replace(/\.[^.]+$/, '')}</h2>
          {dateStr && <p className="text-gray-400 text-xs mb-6">{dateStr}</p>}
          {lines.length > 0 ? (
            <div className="border-l-4 border-gray-200 pl-4 mb-6">
              {lines.map((line, i) => (
                <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{line}</p>
              ))}
            </div>
          ) : null}
          <div className="space-y-1.5">
            {[90,75,88,62,84,70,92,54,80,68,88,72,60,84].map((w, i) => (
              <div key={i} className={`h-2.5 bg-gray-100 rounded ${i % 5 === 4 ? 'mb-4' : ''}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilePreviewModal({
  file,
  allFiles,
  onClose,
}: {
  file: KnowledgeFile;
  allFiles: KnowledgeFile[];
  onClose: () => void;
}) {
  const idx = allFiles.findIndex(f => f.id === file.id);
  const [currentIdx, setCurrentIdx] = useState(idx);
  const current = allFiles[currentIdx] ?? file;
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allFiles.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) setCurrentIdx(i => i - 1);
      if (e.key === 'ArrowRight' && hasNext) setCurrentIdx(i => i + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasPrev, hasNext, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(10,10,15,0.88)' }} onClick={onClose}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-6 py-3.5 shrink-0 border-b border-white/5"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white" onClick={onClose}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <FileIcon format={current.format} className="w-5 h-5 shrink-0" />
          <span className="text-white/90 font-medium text-sm truncate">{current.name}</span>
          <FormatPill format={current.format} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white/30 text-xs px-2">{currentIdx + 1} / {allFiles.length}</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/18 transition-colors text-white/80 text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> 下载
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center px-20 py-6 overflow-hidden" onClick={e => e.stopPropagation()}>
        <PreviewContent file={current} />
      </div>

      {/* ── Prev / Next ── */}
      {hasPrev && (
        <button
          className="fixed left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110 z-50 border border-white/10"
          onClick={e => { e.stopPropagation(); setCurrentIdx(i => i - 1); }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {hasNext && (
        <button
          className="fixed right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110 z-50 border border-white/10"
          onClick={e => { e.stopPropagation(); setCurrentIdx(i => i + 1); }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/* ─── Album preview drawer ────────────────────────────────── */
function AlbumPreviewDrawer({
  album,
  albumFiles,
  onClose,
  onOpen,
  onPreviewFile,
}: {
  album: Album;
  albumFiles: KnowledgeFile[];
  onClose: () => void;
  onOpen: () => void;
  onPreviewFile: (f: KnowledgeFile) => void;
}) {
  // Format distribution
  const fmtCount: Partial<Record<FileFormat, number>> = {};
  albumFiles.forEach(f => { fmtCount[f.format] = (fmtCount[f.format] ?? 0) + 1; });
  const fmtEntries = Object.entries(fmtCount) as [FileFormat, number][];

  const latest = [...albumFiles].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* Dim backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 360 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: album.color ?? '#94a3b8' }} />
              <h2 className="text-lg font-bold text-gray-900 truncate">{album.name}</h2>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0" onClick={onClose}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {album.description && (
            <p className="text-sm text-gray-400 mt-1.5 ml-5.5 leading-relaxed">{album.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 ml-0.5 text-sm text-gray-400">
            <span>{albumFiles.length} 个文件</span>
            {latest[0] && <span>最近更新 {fmtDate(latest[0].uploadedAt).slice(5)}</span>}
          </div>
        </div>

        {/* Thumbnail grid */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">文件预览</p>
          <div className="grid grid-cols-3 gap-2">
            {latest.slice(0, 6).map(f => (
              <button
                key={f.id}
                className="relative aspect-square rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden group"
                onClick={() => { onClose(); onPreviewFile(f); }}
              >
                <div className="absolute inset-2 flex flex-col gap-[2px] overflow-hidden">
                  {[80, 65, 75, 55, 70].map((w, i) => (
                    <div key={i} className="rounded-full bg-gray-200" style={{ height: 3, width: `${w}%` }} />
                  ))}
                </div>
                <div className="absolute top-1.5 right-1.5">
                  <FileIcon format={f.format} className="w-3.5 h-3.5" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100">
                  <Eye className="w-3 h-3 text-gray-500" />
                </div>
              </button>
            ))}
          </div>
          {albumFiles.length > 6 && (
            <p className="text-xs text-gray-400 mt-2 text-center">+{albumFiles.length - 6} 更多</p>
          )}
        </div>

        {/* Format distribution */}
        {fmtEntries.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">格式构成</p>
            <div className="flex gap-1.5 h-2 rounded-full overflow-hidden mb-2.5">
              {fmtEntries.map(([fmt, count]) => {
                const b = FORMAT_BADGE[fmt];
                const pct = Math.round((count / albumFiles.length) * 100);
                return <div key={fmt} className="rounded-full h-full transition-all" style={{ width: `${pct}%`, backgroundColor: b.text, opacity: 0.7 }} />;
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {fmtEntries.map(([fmt, count]) => {
                const b = FORMAT_BADGE[fmt];
                return (
                  <span key={fmt} className="text-[11px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: b.text, opacity: 0.7 }} />
                    <span className="text-gray-500">{fmt}</span>
                    <span className="text-gray-400">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent list */}
        <div className="px-6 py-3 border-t border-gray-100 flex-1 overflow-auto min-h-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">最近添加</p>
          <div className="space-y-3">
            {latest.slice(0, 5).map(f => (
              <button
                key={f.id}
                className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors group"
                onClick={() => { onClose(); onPreviewFile(f); }}
              >
                <FileIcon format={f.format} className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-sm text-gray-700 truncate text-left group-hover:text-gray-900">{f.name}</span>
                <span className="text-[11px] text-gray-400 shrink-0">{fmtDate(f.uploadedAt).slice(5)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
            onClick={onOpen}
          >
            打开专辑，查看全部文件
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function KnowledgeView() {
  // Navigation
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);

  // UI state
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
  const [hoveredAlbumId, setHoveredAlbumId] = useState<string | null>(null);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<Set<string>>(new Set());
  const [newAlbumName, setNewAlbumName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null);
  const [previewAlbum, setPreviewAlbum] = useState<Album | null>(null);

  /* ── Derived data ── */
  const albumOptions = albums.filter(a => a.id !== 'all');
  const currentAlbum = albumOptions.find(a => a.id === currentAlbumId) ?? null;

  // Files in the current album (for drill-in view)
  const albumFiles = useMemo(() =>
    currentAlbumId ? files.filter(f => f.album === currentAlbumId) : [],
    [currentAlbumId]
  );

  // Top-level: files NOT assigned to any album
  const unassignedFiles = useMemo(() => files.filter(f => !f.album), []);

  // Files to show in list/grid when inside an album
  const filteredAlbumFiles = useMemo(() => {
    let res = [...albumFiles];
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
  }, [albumFiles, search, filterFormats, filterDate, sortField, sortDir]);

  // Top-level filtered unassigned files
  const filteredUnassigned = useMemo(() => {
    let res = [...unassignedFiles];
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
  }, [unassignedFiles, search, filterFormats, filterDate, sortField, sortDir]);

  // Filtered albums at top level
  const filteredAlbums = useMemo(() => {
    if (!search.trim()) return albumOptions;
    return albumOptions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [albumOptions, search]);

  const activeFilterCount = (filterFormats.length > 0 ? 1 : 0) + (filterDate !== 'all' ? 1 : 0);
  const allSelected = filteredAlbumFiles.length > 0 && filteredAlbumFiles.every(f => selectedIds.has(f.id));

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }
  function toggleSelectAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAlbumFiles.map(f => f.id)));
  }
  function toggleSelect(id: number) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAlbum(id: string) {
    setSelectedAlbumIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function openAlbum(id: string) {
    setCurrentAlbumId(id);
    setSearch('');
    setSelectedIds(new Set());
  }
  function goBack() {
    setCurrentAlbumId(null);
    setSearch('');
    setSelectedIds(new Set());
  }
  function getAlbumFormats(albumId: string): FileFormat[] {
    const af = files.filter(f => f.album === albumId);
    const seen = new Set<FileFormat>();
    const result: FileFormat[] = [];
    for (const f of af) { if (!seen.has(f.format)) { seen.add(f.format); result.push(f.format); } }
    return result.slice(0, 3);
  }
  function getAlbumLatestDate(albumId: string): string {
    const af = files.filter(f => f.album === albumId);
    if (!af.length) return '';
    const latest = af.reduce((a, b) => new Date(a.uploadedAt) > new Date(b.uploadedAt) ? a : b);
    return fmtDate(latest.uploadedAt).slice(5);
  }
  function getAlbumFileCount(albumId: string): number {
    return files.filter(f => f.album === albumId).length;
  }
  function getAlbumFiles(albumId: string): KnowledgeFile[] {
    return files.filter(f => f.album === albumId);
  }

  const totalItems = currentAlbumId
    ? filteredAlbumFiles.length
    : filteredAlbums.length + filteredUnassigned.length;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── PAGE TITLE / BREADCRUMB ── */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
        {currentAlbumId ? (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <button className="hover:text-gray-600 transition-colors" onClick={goBack}>我的上传</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-700 font-medium">{currentAlbum?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                onClick={goBack}
                title="返回"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight font-[family-name:var(--font-playfair-display)]">
                {currentAlbum?.name}
              </h1>
              {currentAlbum?.color && (
                <span className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: currentAlbum.color }} />
              )}
            </div>
            {currentAlbum?.description && (
              <p className="text-sm text-gray-400 mt-1 ml-8">{currentAlbum.description}</p>
            )}
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-400 mb-1">我的上传</div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight font-[family-name:var(--font-playfair-display)]">My Uploads</h1>
          </div>
        )}
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
              placeholder={currentAlbumId ? '搜索专辑内文件...' : '搜索文件名或专辑...'}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 min-w-0"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors
                ${showFilter || activeFilterCount > 0 ? 'border-gray-400 bg-gray-100 text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              筛选
              {activeFilterCount > 0 && (
                <span className="ml-0.5 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
            {showFilter && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">筛选条件</span>
                  {activeFilterCount > 0 && (
                    <button className="text-xs text-gray-400 hover:text-red-500 transition-colors" onClick={() => { setFilterFormats([]); setFilterDate('all'); }}>清除全部</button>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-500 mb-2">文件格式</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Object.entries(FORMAT_CATEGORIES).map(([cat, fmts]) => {
                    const isActive = fmts.some(f => filterFormats.includes(f));
                    return (
                      <button key={cat}
                        onClick={() => setFilterFormats(prev => {
                          const next = [...prev];
                          if (isActive) return next.filter(f => !fmts.includes(f));
                          fmts.forEach(f => { if (!next.includes(f)) next.push(f); });
                          return next;
                        })}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${isActive ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >{cat}</button>
                    );
                  })}
                </div>
                <p className="text-xs font-medium text-gray-500 mb-2">上传时间</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'today', 'week', 'month'] as DateFilter[]).map(d => (
                    <button key={d} onClick={() => setFilterDate(d)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${filterDate === d ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >{{ all: '全部', today: '今天', week: '近7天', month: '近30天' }[d]}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort (grid mode only) */}
          {viewMode === 'grid' && (
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                <ArrowUpDown className="w-3.5 h-3.5" /> 排序 <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 hidden group-hover:block">
                {([['uploadedAt', '上传时间'], ['name', '名称'], ['format', '文件格式'], ['size', '文件大小']] as [SortField, string][]).map(([f, label]) => (
                  <button key={f} onClick={() => toggleSort(f)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${sortField === f ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
                  >
                    {label}
                    <SortIcon field={f} active={sortField === f} dir={sortDir} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2.5">
            <span className="text-sm text-gray-400">共 {totalItems} 项</span>
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`} title="方块视图">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`} title="列表视图">
                <List className="w-4 h-4" />
              </button>
            </div>
            {/* + 新建 */}
            <div className="relative">
              <button onClick={() => setShowNewMenu(v => !v)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors select-none">
                <span className="text-base leading-none">+</span> 新建 <ChevronDown className="w-3 h-3" />
              </button>
              {showNewMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors" onClick={() => { setShowNewMenu(false); setShowAlbumModal(true); }}>
                    <FolderPlus className="w-4 h-4 text-gray-400" /> 新建专辑
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors" onClick={() => { setShowNewMenu(false); setShowUploadModal(true); }}>
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
            <button className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"><Download className="w-3.5 h-3.5" /> 批量下载</button>
            <button className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"><MoveRight className="w-3.5 h-3.5" /> 移动到专辑</button>
            <button className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /> 删除</button>
            <button className="ml-auto hover:text-gray-300 transition-colors" onClick={() => setSelectedIds(new Set())}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* File content area */}
        <div className="overflow-auto px-5 py-5">

          {/* ═══ TOP-LEVEL GRID VIEW ═══ */}
          {!currentAlbumId && viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Album cards */}
              {filteredAlbums.map(album => {
                const count = getAlbumFileCount(album.id);
                if (count === 0) return null;
                return (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    fileCount={count}
                    albumFileList={getAlbumFiles(album.id)}
                    latestDate={getAlbumLatestDate(album.id)}
                    onOpen={() => openAlbum(album.id)}
                    onPreview={() => setPreviewAlbum(album)}
                    isSelected={selectedAlbumIds.has(album.id)}
                    isHovered={hoveredAlbumId === album.id}
                    onSelect={() => toggleSelectAlbum(album.id)}
                    onHoverEnter={() => setHoveredAlbumId(album.id)}
                    onHoverLeave={() => setHoveredAlbumId(null)}
                  />
                );
              })}
              {/* Unassigned file cards */}
              {filteredUnassigned.map(file => {
                const isSelected = selectedIds.has(file.id);
                const isHovered = hoveredId === file.id;
                return (
                  <div
                    key={file.id}
                    className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 group bg-white
                      ${isSelected ? 'border-gray-900 ring-1 ring-gray-900 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5'}`}
                    onMouseEnter={() => setHoveredId(file.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className={`absolute top-2 left-2 z-10 transition-opacity duration-100 ${isSelected || isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={e => { e.stopPropagation(); toggleSelect(file.id); }}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 shadow-sm ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white/90 border-gray-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <FileCardThumb format={file.format} snippet={file.snippet} />
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-150 z-10 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'rgba(0,0,0,0.07)' }} />
                    <div className={`absolute top-14 inset-x-0 flex items-center justify-center gap-2 transition-opacity duration-150 z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                      <button className="bg-white rounded-lg p-1.5 shadow hover:bg-gray-100 transition-colors" title="预览" onClick={e => { e.stopPropagation(); setPreviewFile(file); }}>
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <button className="bg-white rounded-lg p-1.5 shadow hover:bg-gray-100 transition-colors" title="更多操作" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-gray-900 truncate leading-snug" title={file.name}>{file.name}</p>
                      {file.snippet && (
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{file.snippet}</p>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <FormatPill format={file.format} />
                        <span className="text-[10px] text-gray-400">{fmtDate(file.uploadedAt).slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Empty state */}
              {filteredAlbums.filter(a => getAlbumFileCount(a.id) > 0).length === 0 && filteredUnassigned.length === 0 && (
                <div className="col-span-4 flex flex-col items-center justify-center h-52 text-center">
                  <Folder className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm mb-2">{search || activeFilterCount > 0 ? '没有符合条件的内容' : '暂无文件'}</p>
                  <button className="text-sm font-semibold text-gray-900 hover:underline" onClick={() => setShowUploadModal(true)}>立即上传文件</button>
                </div>
              )}
            </div>
          )}

          {/* ═══ TOP-LEVEL LIST VIEW ═══ */}
          {!currentAlbumId && viewMode === 'list' && (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="py-3 px-2 w-8" />
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none" onClick={() => toggleSort('name')}>
                      名称 <SortIcon field="name" active={sortField === 'name'} dir={sortDir} />
                    </th>
                    <th className="py-3 px-2 font-medium text-gray-600">类型</th>
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none hidden sm:table-cell" onClick={() => toggleSort('uploadedAt')}>
                      上传时间 <SortIcon field="uploadedAt" active={sortField === 'uploadedAt'} dir={sortDir} />
                    </th>
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 hidden sm:table-cell select-none" onClick={() => toggleSort('size')}>
                      大小 <SortIcon field="size" active={sortField === 'size'} dir={sortDir} />
                    </th>
                    <th className="py-2.5 px-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {/* Album rows */}
                  {albumOptions.filter(a => getAlbumFileCount(a.id) > 0).map(album => (
                    <tr key={album.id} className="border-b border-gray-100 group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openAlbum(album.id)}>
                      <td className="py-3 px-2">
                        <div className="w-4 h-4 rounded border-2 border-gray-200 flex items-center justify-center" />
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FolderOpen className="w-5 h-5 shrink-0" style={{ color: album.color ?? '#94a3b8' }} />
                          <span className="font-medium text-gray-900 truncate max-w-[200px]">{album.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-100 bg-white text-gray-500">专辑</span>
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-sm hidden sm:table-cell">{getAlbumLatestDate(album.id)}</td>
                      <td className="py-3 px-2 text-gray-400 text-sm hidden sm:table-cell">{getAlbumFileCount(album.id)} 个文件</td>
                      <td className="py-3 px-2">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                          onClick={e => { e.stopPropagation(); setPreviewAlbum(album); }}>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Unassigned file rows */}
                  {unassignedFiles.map(file => {
                    const isSelected = selectedIds.has(file.id);
                    return (
                      <tr key={file.id} className={`border-b border-gray-100 group transition-colors ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                        <td className="py-3 px-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-200 group-hover:border-gray-400'}`}
                            onClick={() => toggleSelect(file.id)}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileIcon format={file.format} className="w-5 h-5 shrink-0" />
                            <span className="font-medium text-gray-900 truncate max-w-[180px]">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2"><FormatPill format={file.format} /></td>
                        <td className="py-3 px-2 text-gray-500 text-sm hidden sm:table-cell">{fmtDate(file.uploadedAt)}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm hidden sm:table-cell">{formatFileSize(file.size)}</td>
                        <td className="py-3 px-2">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                            onClick={() => setPreviewFile(file)}>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ INSIDE ALBUM — GRID VIEW ═══ */}
          {currentAlbumId && viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAlbumFiles.map(file => {
                const isSelected = selectedIds.has(file.id);
                const isHovered = hoveredId === file.id;
                return (
                  <div
                    key={file.id}
                    className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 group bg-white
                      ${isSelected ? 'border-gray-900 ring-1 ring-gray-900 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5'}`}
                    onMouseEnter={() => setHoveredId(file.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className={`absolute top-2 left-2 z-10 transition-opacity duration-100 ${isSelected || isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={e => { e.stopPropagation(); toggleSelect(file.id); }}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 shadow-sm ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white/90 border-gray-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <FileCardThumb format={file.format} snippet={file.snippet} />
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-150 z-10 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'rgba(0,0,0,0.07)' }} />
                    <div className={`absolute top-14 inset-x-0 flex items-center justify-center gap-2 transition-opacity duration-150 z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                      <button className="bg-white rounded-lg p-1.5 shadow hover:bg-gray-100 transition-colors" title="预览" onClick={e => { e.stopPropagation(); setPreviewFile(file); }}>
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <button className="bg-white rounded-lg p-1.5 shadow hover:bg-gray-100 transition-colors" title="更多操作" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-gray-900 truncate leading-snug" title={file.name}>{file.name}</p>
                      {file.snippet && (
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{file.snippet}</p>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <FormatPill format={file.format} />
                        <span className="text-[10px] text-gray-400">{fmtDate(file.uploadedAt).slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredAlbumFiles.length === 0 && (
                <div className="col-span-4 flex flex-col items-center justify-center h-52 text-center">
                  <FileText className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">{search || activeFilterCount > 0 ? '没有符合条件的文件' : '专辑暂无文件'}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ INSIDE ALBUM — LIST VIEW ═══ */}
          {currentAlbumId && viewMode === 'list' && (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="py-3 px-2 w-8">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${allSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300 hover:border-gray-500'}`}
                        onClick={toggleSelectAll}>
                        {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </th>
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 select-none" onClick={() => toggleSort('name')}>
                      名称 <SortIcon field="name" active={sortField === 'name'} dir={sortDir} />
                    </th>
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 select-none" onClick={() => toggleSort('format')}>
                      格式 <SortIcon field="format" active={sortField === 'format'} dir={sortDir} />
                    </th>
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 select-none" onClick={() => toggleSort('uploadedAt')}>
                      上传时间 <SortIcon field="uploadedAt" active={sortField === 'uploadedAt'} dir={sortDir} />
                    </th>
                    <th className="py-3 px-2 font-medium text-gray-600 cursor-pointer hover:text-gray-800 hidden sm:table-cell select-none" onClick={() => toggleSort('size')}>
                      大小 <SortIcon field="size" active={sortField === 'size'} dir={sortDir} />
                    </th>
                    <th className="py-2.5 px-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filteredAlbumFiles.map(file => {
                    const isSelected = selectedIds.has(file.id);
                    return (
                      <tr key={file.id} className={`border-b border-gray-100 group transition-colors ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                        <td className="py-3 px-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-200 group-hover:border-gray-400'}`}
                            onClick={() => toggleSelect(file.id)}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileIcon format={file.format} className="w-5 h-5 shrink-0" />
                            <span className="font-medium text-gray-900 truncate max-w-[180px]">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2"><FormatPill format={file.format} /></td>
                        <td className="py-3 px-2 text-gray-500 text-sm">{fmtDate(file.uploadedAt)}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm hidden sm:table-cell">{formatFileSize(file.size)}</td>
                        <td className="py-3 px-2">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                            onClick={() => setPreviewFile(file)}>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAlbumFiles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                        {search || activeFilterCount > 0 ? '没有符合条件的文件' : '专辑暂无文件'}
                      </td>
                    </tr>
                  )}
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
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
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
                <label className="block text-xs font-medium text-gray-500 mb-1.5">专辑名称 <span className="text-red-400">*</span></label>
                <input value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} placeholder="输入专辑名称"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">描述（选填）</label>
                <textarea rows={2} placeholder="添加描述..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowAlbumModal(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors">取消</button>
              <button disabled={!newAlbumName.trim()}
                className="px-4 py-2 rounded-lg text-sm bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside to close dropdowns */}
      {(showNewMenu || showFilter) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowNewMenu(false); setShowFilter(false); }} />
      )}

      {/* ── FILE PREVIEW MODAL ── */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          allFiles={currentAlbumId ? albumFiles : unassignedFiles}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* ── ALBUM PREVIEW DRAWER ── */}
      {previewAlbum && (
        <AlbumPreviewDrawer
          album={previewAlbum}
          albumFiles={files.filter(f => f.album === previewAlbum.id)}
          onClose={() => setPreviewAlbum(null)}
          onOpen={() => { openAlbum(previewAlbum.id); setPreviewAlbum(null); }}
          onPreviewFile={f => { setPreviewAlbum(null); setPreviewFile(f); }}
        />
      )}
    </div>
  );
}
