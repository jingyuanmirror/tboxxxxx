'use client';

import React, { useState, useMemo } from 'react';
import { albums, files } from '@/lib/knowledgeMock';

type ViewMode = 'grid' | 'list';

export default function KnowledgeView() {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');

  // 过滤文件
  const filteredFiles = useMemo(() => {
    let res = files;
    if (selectedAlbum !== 'all') {
      res = res.filter(f => f.albums.includes(selectedAlbum));
    }
    if (search.trim()) {
      res = res.filter(f => f.name.toLowerCase().includes(search.trim().toLowerCase()));
    }
    return res;
  }, [selectedAlbum, search]);

  // 精选与最近分组（示例：前4为精选，后为最近）
  const featured = filteredFiles.slice(0, 4);
  const recent = filteredFiles.slice(4);

  return (
    <div className="w-full max-w-[1300px] mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      {/* 顶部专辑切换区 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {albums.map(album => (
          <button
            key={album.id}
            className={`px-5 py-2 rounded-full text-base font-medium border transition-all duration-150 ${selectedAlbum === album.id ? 'bg-[#f3f4f6] border-[#888] text-[#1d1d1f]' : 'bg-white border-gray-200 text-gray-500 hover:bg-[#f3f4f6]'}`}
            style={album.color ? { borderColor: album.color, color: selectedAlbum === album.id ? '#1d1d1f' : album.color } : {}}
            onClick={() => setSelectedAlbum(album.id)}
          >
            {album.name}
          </button>
        ))}
      </div>

      {/* 操作区 */}
      <div className="flex flex-wrap items-center gap-3 justify-end mb-4">
        <div className="flex gap-1 bg-[#f6f6f7] rounded-lg p-1">
          <button onClick={()=>setViewMode('grid')} className={`px-3 py-1 rounded-lg text-lg ${viewMode==='grid' ? 'bg-white shadow font-bold' : 'text-gray-500'}`}>▦</button>
          <button onClick={()=>setViewMode('list')} className={`px-3 py-1 rounded-lg text-lg ${viewMode==='list' ? 'bg-white shadow font-bold' : 'text-gray-500'}`}>≣</button>
        </div>
        <select className="px-3 py-1 rounded border text-sm text-gray-600 bg-white">
          <option>最近</option>
          <option>最旧</option>
          <option>按名称</option>
        </select>
        <button className="px-4 py-1.5 rounded-full bg-black text-white font-semibold text-base ml-2">＋ 新建</button>
      </div>

      {/* 精选分块 */}
      <div className="mb-8">
        <div className="text-xl font-bold mb-4">精选专辑</div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(f => (
              <div key={f.id} className="rounded-2xl overflow-hidden shadow bg-gradient-to-br from-[#ece9e6] to-[#fafafa] relative group cursor-pointer transition-transform hover:-translate-y-1">
                <div className="h-[120px] w-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 font-bold">
                  <span role="img" aria-label="cover">📄</span>
                </div>
                <div className="p-5">
                  <div className="text-base font-semibold text-[#1d1d1f] mb-1 truncate">{f.name}</div>
                  <div className="text-xs text-gray-500 mb-1">2025年7月3日 · 14个来源</div>
                  <div className="flex gap-1 flex-wrap">
                    {f.albums.map(aid => {
                      const album = albums.find(a => a.id === aid);
                      return album ? (
                        <span key={aid} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: album.color || '#ccc', color: album.color }}>{album.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-white/80 rounded-full p-1 text-gray-400 group-hover:text-black transition-colors cursor-pointer">⋮</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2">标题</th>
                  <th className="py-2">来源</th>
                  <th className="py-2">创建日期</th>
                  <th className="py-2">角色</th>
                </tr>
              </thead>
              <tbody>
                {featured.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{f.name}</td>
                    <td className="py-2">14个来源</td>
                    <td className="py-2">2025年7月3日</td>
                    <td className="py-2">Reader</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 最近分块 */}
      <div>
        <div className="text-xl font-bold mb-4">最近打开的文件</div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-[160px] cursor-pointer hover:bg-gray-50 transition">
              <span className="text-3xl text-gray-400 mb-2">＋</span>
              <span className="text-gray-500">新建文件</span>
            </div>
            {recent.map(f => (
              <div key={f.id} className="rounded-2xl overflow-hidden shadow bg-gradient-to-br from-[#ece9e6] to-[#fafafa] relative group cursor-pointer transition-transform hover:-translate-y-1">
                <div className="h-[100px] w-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400 font-bold">
                  <span role="img" aria-label="cover">📄</span>
                </div>
                <div className="p-4">
                  <div className="text-base font-semibold text-[#1d1d1f] mb-1 truncate">{f.name}</div>
                  <div className="text-xs text-gray-500 mb-1">2025年7月3日 · 14个来源</div>
                  <div className="flex gap-1 flex-wrap">
                    {f.albums.map(aid => {
                      const album = albums.find(a => a.id === aid);
                      return album ? (
                        <span key={aid} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: album.color || '#ccc', color: album.color }}>{album.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-white/80 rounded-full p-1 text-gray-400 group-hover:text-black transition-colors cursor-pointer">⋮</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2">标题</th>
                  <th className="py-2">来源</th>
                  <th className="py-2">创建日期</th>
                  <th className="py-2">角色</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{f.name}</td>
                    <td className="py-2">14个来源</td>
                    <td className="py-2">2025年7月3日</td>
                    <td className="py-2">Reader</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
