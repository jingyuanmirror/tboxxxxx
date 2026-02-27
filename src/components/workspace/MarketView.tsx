'use client';

import React, { useState, useMemo } from 'react';
import {
  Star, Users, Zap, Search, ChevronRight, Check, X,
  ArrowLeft, Sparkles, TrendingUp, Clock, Filter,
} from 'lucide-react';
import {
  mockAgents, mockSkills, ROLE_LABELS, CATEGORY_LABELS,
  getLowestPrice, formatPrice,
  type MarketAgent, type MarketSkill, type AgentRole, type SkillCategory,
} from '@/lib/marketMock';

// ─── Sub-tab type ─────────────────────────────────────────────
type MarketTab = 'agents' | 'skills';
type SortMode = 'hot' | 'new' | 'rating';

// ─── Star Rating Display ──────────────────────────────────────
function StarRating({ score, count }: { score: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
      <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
      <span className="font-medium text-[#1d1d1f]">{score.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  );
}

// ─── Price Badge ──────────────────────────────────────────────
function PriceBadge({ label, highlight }: { label: string; highlight?: boolean }) {
  if (label === '免费') {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a]">
        免费
      </span>
    );
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${highlight ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}>
      {label}
    </span>
  );
}

// ─── Agent Card ───────────────────────────────────────────────
function AgentCard({ agent, onClick }: { agent: MarketAgent; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 relative overflow-hidden group"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
    >
      {/* Featured / New badge */}
      {agent.isFeatured && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff3cd] text-[#b45309]">
          精选
        </span>
      )}
      {agent.isNew && !agent.isFeatured && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb]">
          新上架
        </span>
      )}

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-2xl flex-shrink-0">
          {agent.avatar}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[14px] text-[#1d1d1f] truncate">{agent.name}</div>
          <div className="text-[11px] text-[#8e8e93] mt-0.5">{ROLE_LABELS[agent.role]}</div>
        </div>
      </div>

      {/* Slogan */}
      <p className="text-[12px] text-[#6a6e73] mb-3 line-clamp-2 leading-relaxed">{agent.slogan}</p>

      {/* Skills preview */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.skills.slice(0, 3).map(skill => (
          <span key={skill.id} className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73]">
            {skill.icon} {skill.name}
          </span>
        ))}
        {agent.skills.length > 3 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#8e8e93]">
            +{agent.skills.length - 3}
          </span>
        )}
      </div>

      {/* Stats + price */}
      <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
        <div className="flex items-center gap-3">
          <StarRating score={agent.rating.score} count={agent.rating.count} />
          <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
            <Users className="w-3 h-3" />
            {agent.hiredCount.toLocaleString()}
          </span>
        </div>
        <PriceBadge label={getLowestPrice(agent.pricing)} />
      </div>
    </div>
  );
}

// ─── Skill Card ───────────────────────────────────────────────
function SkillCard({ skill, onClick }: { skill: MarketSkill; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 relative overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
    >
      {skill.isFeatured && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff3cd] text-[#b45309]">
          精选
        </span>
      )}
      {skill.isNew && !skill.isFeatured && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb]">
          新上架
        </span>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-2xl flex-shrink-0">
          {skill.icon}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[14px] text-[#1d1d1f] truncate">{skill.name}</div>
          <div className="text-[11px] text-[#8e8e93] mt-0.5">{CATEGORY_LABELS[skill.category]}</div>
        </div>
      </div>

      <p className="text-[12px] text-[#6a6e73] mb-3 line-clamp-2 leading-relaxed">{skill.shortDesc}</p>

      <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
        <div className="flex items-center gap-3">
          <StarRating score={skill.rating.score} count={skill.rating.count} />
          <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
            <Zap className="w-3 h-3" />
            {skill.mountedCount.toLocaleString()}
          </span>
        </div>
        <PriceBadge label={getLowestPrice(skill.pricing)} />
      </div>
    </div>
  );
}

// ─── Agent Detail Modal ───────────────────────────────────────
function AgentDetail({ agent, onClose }: { agent: MarketAgent; onClose: () => void }) {
  const [hired, setHired] = useState(false);
  const featured = agent.pricing.find(p => p.isFeatured) ?? agent.pricing[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#f2f4f6] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <X className="w-4 h-4 text-[#6a6e73]" />
          </button>
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Agent 简历</span>
          <div className="w-8" />
        </div>

        <div className="p-6 space-y-6">
          {/* Profile */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-4xl flex-shrink-0">
              {agent.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#1d1d1f]">{agent.name}</h2>
                <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73]">{ROLE_LABELS[agent.role]}</span>
              </div>
              <p className="text-[13px] text-[#6a6e73] mt-1">{agent.slogan}</p>
              <div className="flex items-center gap-4 mt-2">
                <StarRating score={agent.rating.score} count={agent.rating.count} />
                <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
                  <Users className="w-3.5 h-3.5" /> 已被雇佣 {agent.hiredCount.toLocaleString()} 次
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-2">关于TA</h3>
            <p className="text-[13px] text-[#6a6e73] leading-relaxed">{agent.description}</p>
          </div>

          {/* Skills tree */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">携带技能 ({agent.skills.length})</h3>
            <div className="grid grid-cols-2 gap-2">
              {agent.skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-2 p-3 rounded-xl bg-[#f5f5f7]">
                  <span className="text-lg">{skill.icon}</span>
                  <div>
                    <div className="text-[12px] font-medium text-[#1d1d1f]">{skill.name}</div>
                    <div className="text-[11px] text-[#8e8e93]">{CATEGORY_LABELS[skill.category]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">擅长场景</h3>
            <div className="flex flex-wrap gap-2">
              {agent.scenarios.map(s => (
                <span key={s} className="text-[12px] px-3 py-1.5 rounded-xl bg-[#f5f5f7] text-[#6a6e73]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">定价方案</h3>
            <div className="space-y-2">
              {agent.pricing.map(plan => (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${plan.isFeatured ? 'border-[#1d1d1f] bg-[#f8f8f8]' : 'border-[#e5e5ea]'}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1d1d1f]">{plan.label}</span>
                      {plan.isFeatured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1d1d1f] text-white">推荐</span>}
                    </div>
                    {plan.limits?.callsPerMonth && (
                      <span className="text-[11px] text-[#8e8e93]">每月 {plan.limits.callsPerMonth} 次</span>
                    )}
                  </div>
                  <span className="text-[14px] font-bold text-[#1d1d1f]">{formatPrice(plan)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            {!hired ? (
              <>
                <button
                  onClick={() => setHired(true)}
                  className="flex-1 bg-[#1d1d1f] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#3a3a3c] transition-colors"
                >
                  雇佣TA · {formatPrice(featured)}
                </button>
                <button className="px-4 py-3 rounded-xl border border-[#e5e5ea] text-[14px] text-[#6a6e73] hover:bg-[#f5f5f7] transition-colors">
                  试用
                </button>
              </>
            ) : (
              <div className="flex-1 bg-[#f0fdf4] border border-[#16a34a] py-3 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold text-[#16a34a]">
                <Check className="w-4 h-4" /> 已雇佣 · 已添加到工作台
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skill Detail Modal ───────────────────────────────────────
function SkillDetail({ skill, onClose }: { skill: MarketSkill; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#f2f4f6] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <X className="w-4 h-4 text-[#6a6e73]" />
          </button>
          <span className="text-[13px] font-semibold text-[#1d1d1f]">技能详情</span>
          <div className="w-8" />
        </div>

        <div className="p-6 space-y-6">
          {/* Header card */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-4xl flex-shrink-0">
              {skill.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#1d1d1f]">{skill.name}</h2>
                <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73]">{CATEGORY_LABELS[skill.category]}</span>
              </div>
              <p className="text-[13px] text-[#6a6e73] mt-1">{skill.shortDesc}</p>
              <div className="flex items-center gap-4 mt-2">
                <StarRating score={skill.rating.score} count={skill.rating.count} />
                <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
                  <Zap className="w-3.5 h-3.5" /> 已挂载 {skill.mountedCount.toLocaleString()} 次
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-2">能力说明</h3>
            <p className="text-[13px] text-[#6a6e73] leading-relaxed">{skill.description}</p>
          </div>

          {/* Demo */}
          {skill.demos.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">效果演示</h3>
              {skill.demos.map((demo, i) => (
                <div key={i} className="rounded-2xl border border-[#e5e5ea] overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#f5f5f7] border-b border-[#e5e5ea]">
                    <span className="text-[12px] font-semibold text-[#6a6e73]">{demo.title}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <span className="text-[11px] font-bold text-[#8e8e93] uppercase w-8 flex-shrink-0 pt-0.5">输入</span>
                      <p className="text-[12px] text-[#6a6e73] bg-[#f5f5f7] rounded-xl px-3 py-2 flex-1 leading-relaxed">{demo.input}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] font-bold text-[#16a34a] uppercase w-8 flex-shrink-0 pt-0.5">输出</span>
                      <pre className="text-[12px] text-[#1d1d1f] bg-[#f0fdf4] rounded-xl px-3 py-2 flex-1 whitespace-pre-wrap leading-relaxed font-sans border border-[#bbf7d0]">{demo.output}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compatibility */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">兼容性</h3>
            <div className="flex flex-wrap gap-2">
              {skill.compatibility.agentTypes.map(role => (
                <span key={role} className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-xl bg-[#f0fdf4] text-[#16a34a]">
                  <Check className="w-3 h-3" /> {ROLE_LABELS[role]}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">定价方案</h3>
            <div className="space-y-2">
              {skill.pricing.map(plan => (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${plan.isFeatured ? 'border-[#1d1d1f] bg-[#f8f8f8]' : 'border-[#e5e5ea]'}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1d1d1f]">{plan.label}</span>
                      {plan.isFeatured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1d1d1f] text-white">推荐</span>}
                    </div>
                    {plan.limits?.callsPerMonth && (
                      <span className="text-[11px] text-[#8e8e93]">每月 {plan.limits.callsPerMonth} 次</span>
                    )}
                  </div>
                  <span className="text-[14px] font-bold text-[#1d1d1f]">{formatPrice(plan)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            {!mounted ? (
              <button
                onClick={() => setMounted(true)}
                className="w-full bg-[#1d1d1f] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#3a3a3c] transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> 挂载到我的 Agent
              </button>
            ) : (
              <div className="w-full bg-[#f0fdf4] border border-[#16a34a] py-3 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold text-[#16a34a]">
                <Check className="w-4 h-4" /> 已挂载 · Agent 已解锁此技能
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main MarketView ──────────────────────────────────────────
export default function MarketView() {
  const [tab, setTab] = useState<MarketTab>('agents');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('hot');
  const [roleFilter, setRoleFilter] = useState<AgentRole | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
  const [selectedAgent, setSelectedAgent] = useState<MarketAgent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<MarketSkill | null>(null);

  const agentRoles: Array<AgentRole | 'all'> = ['all', 'assistant', 'researcher', 'analyst', 'programmer', 'designer', 'customer_service'];
  const skillCategories: Array<SkillCategory | 'all'> = ['all', 'web', 'data', 'creative', 'file', 'integration', 'memory', 'code'];

  const filteredAgents = useMemo(() => {
    let list = [...mockAgents];
    if (search) list = list.filter(a => a.name.includes(search) || a.slogan.includes(search) || a.tags.some(t => t.includes(search)));
    if (roleFilter !== 'all') list = list.filter(a => a.role === roleFilter);
    if (sortMode === 'hot') list.sort((a, b) => b.hiredCount - a.hiredCount);
    if (sortMode === 'new') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    if (sortMode === 'rating') list.sort((a, b) => b.rating.score - a.rating.score);
    return list;
  }, [search, roleFilter, sortMode]);

  const filteredSkills = useMemo(() => {
    let list = [...mockSkills];
    if (search) list = list.filter(s => s.name.includes(search) || s.shortDesc.includes(search));
    if (categoryFilter !== 'all') list = list.filter(s => s.category === categoryFilter);
    if (sortMode === 'hot') list.sort((a, b) => b.mountedCount - a.mountedCount);
    if (sortMode === 'new') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    if (sortMode === 'rating') list.sort((a, b) => b.rating.score - a.rating.score);
    return list;
  }, [search, categoryFilter, sortMode]);

  return (
    <div className="w-full flex flex-col min-h-0">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#1d1d1f]" />
          <h1 className="text-[22px] font-bold text-[#1d1d1f]">锦囊集市</h1>
        </div>
        <p className="text-[13px] text-[#8e8e93]">雇一个 Agent，或给你的 Agent 挂载新技能</p>
      </div>

      {/* ── Tab Switch ── */}
      <div className="flex items-center gap-1 mb-5 bg-[#f5f5f7] p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('agents')}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${tab === 'agents' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6a6e73] hover:text-[#1d1d1f]'}`}
        >
          🧑‍💼 人才广场
        </button>
        <button
          onClick={() => setTab('skills')}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${tab === 'skills' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6a6e73] hover:text-[#1d1d1f]'}`}
        >
          ⚡ 装备铺
        </button>
      </div>

      {/* ── Search + Sort ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93]" />
          <input
            type="text"
            placeholder={tab === 'agents' ? '搜索 Agent…' : '搜索技能…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white rounded-xl border border-[#e5e5ea] outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#c7c7cc]"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-xl">
          {([['hot', '🔥 热门'], ['new', '✨ 最新'], ['rating', '⭐ 好评']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortMode(key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${sortMode === key ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6a6e73]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide flex-nowrap">
        {tab === 'agents'
          ? agentRoles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${roleFilter === role ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#6a6e73] hover:bg-[#f5f5f7]'}`}
                style={{ boxShadow: roleFilter === role ? undefined : '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                {role === 'all' ? '全部' : ROLE_LABELS[role]}
              </button>
            ))
          : skillCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${categoryFilter === cat ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#6a6e73] hover:bg-[#f5f5f7]'}`}
                style={{ boxShadow: categoryFilter === cat ? undefined : '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
              </button>
            ))
        }
      </div>

      {/* ── Results count ── */}
      <div className="text-[12px] text-[#8e8e93] mb-4">
        {tab === 'agents'
          ? `共 ${filteredAgents.length} 位 Agent`
          : `共 ${filteredSkills.length} 项技能`}
      </div>

      {/* ── Card Grid ── */}
      {tab === 'agents' ? (
        filteredAgents.length === 0 ? (
          <div className="text-center py-16 text-[#8e8e93] text-[13px]">没有找到匹配的 Agent</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
            ))}
          </div>
        )
      ) : (
        filteredSkills.length === 0 ? (
          <div className="text-center py-16 text-[#8e8e93] text-[13px]">没有找到匹配的技能</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {filteredSkills.map(skill => (
              <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />
            ))}
          </div>
        )
      )}

      {/* ── Detail Modals ── */}
      {selectedAgent && <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      {selectedSkill && <SkillDetail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
    </div>
  );
}
