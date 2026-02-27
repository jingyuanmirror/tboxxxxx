'use client';

import React, { useState, useMemo } from 'react';
import {
  Star, Users, Zap, Search, Check, X, Store, ArrowRight, TrendingUp, Clock, Package,
  Globe, BarChart2, PenLine, FileText, Link2, Brain, Code2, Box, LayoutList, Briefcase,
} from 'lucide-react';
import {
  mockAgents, mockSkills, ROLE_LABELS, CATEGORY_LABELS,
  getLowestPrice, formatPrice,
  type MarketAgent, type MarketSkill, type AgentRole, type SkillCategory, type UserReview,
} from '@/lib/marketMock';
import TasksView from './TasksView';

type MarketTab = 'agents' | 'skills' | 'tasks';
type SortMode = 'hot' | 'new' | 'rating';

// ─── Helpers ─────────────────────────────────────────────────
function StarRating({ score, count }: { score: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
      <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
      <span className="font-semibold text-[#1d1d1f]">{score.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  );
}

// ─── My Panel ───────────────────────────────────────────────
function MyPanel({
  open, onClose,
  hiredAgents, mountedSkillIds,
}: {
  open: boolean; onClose: () => void;
  hiredAgents: MarketAgent[]; mountedSkillIds: Set<string>;
}) {
  const mountedSkills = mockSkills.filter(s => mountedSkillIds.has(s.id));
  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />}
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
          <span className="text-[15px] font-bold text-[#1a1a1a]">我的清单</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <X className="w-4 h-4 text-[#8e8e93]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Hired agents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-[#f4845f]" />
              <span className="text-[12px] font-bold text-[#8e8e93] uppercase tracking-wide">我的雇佣</span>
              <span className="ml-auto text-[11px] text-[#bbb]">{hiredAgents.length} 位</span>
            </div>
            {hiredAgents.length === 0 ? (
              <p className="text-[13px] text-[#bbb] py-4 text-center">还没有雇佣任何 Agent</p>
            ) : (
              <div className="space-y-2">
                {hiredAgents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                    <AgentAvatar agent={agent} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#1a1a1a] truncate">{agent.name}</div>
                      <div className="text-[11px] text-[#9a9a9a]">{ROLE_LABELS[agent.role]}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#f4845f]">{getLowestPrice(agent.pricing)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Mounted skills */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-3.5 h-3.5 text-[#f4845f]" />
              <span className="text-[12px] font-bold text-[#8e8e93] uppercase tracking-wide">我的挂载</span>
              <span className="ml-auto text-[11px] text-[#bbb]">{mountedSkills.length} 项</span>
            </div>
            {mountedSkills.length === 0 ? (
              <p className="text-[13px] text-[#bbb] py-4 text-center">还没有挂载任何技能</p>
            ) : (
              <div className="space-y-2">
                {mountedSkills.map(skill => {
                  const Icon = CATEGORY_ICONS[skill.category] ?? Box;
                  return (
                    <div key={skill.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                      <div className="w-9 h-9 rounded-xl bg-[#fff5f2] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#f4845f]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-[#1a1a1a] truncate">{skill.name}</div>
                        <div className="text-[11px] text-[#9a9a9a]">{CATEGORY_LABELS[skill.category]}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#1d1d1f]">{getLowestPrice(skill.pricing)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Agent Avatar (reusable) ───────────────────────────────────
function AgentAvatar({ agent, size = 52 }: { agent: MarketAgent; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden ring-2 ring-white shadow-md flex-shrink-0 bg-[#f5f5f7] flex items-center justify-center"
    >
      {agent.avatarUrl && !err ? (
        <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>{agent.avatar}</span>
      )}
    </div>
  );
}

// ─── Agent Card ─── NexusGPT-inspired: centered, circular avatar, tinted desc box
function AgentCard({ agent, onClick, onHire, hired }: { agent: MarketAgent; onClick: () => void; onHire: () => void; hired: boolean }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#ebebeb] p-5 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Top row: avatar + name/role + hire button */}
      <div className="flex items-center gap-3 mb-3">
        <AgentAvatar agent={agent} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-tight truncate">{agent.name}</h3>
            {agent.isFeatured && (
              <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1d1d1f] text-white">精选</span>
            )}
            {agent.isNew && !agent.isFeatured && (
              <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73] border border-[#e5e5ea]">新上架</span>
            )}
          </div>
          <p className="text-[12px] text-[#9a9a9a] mt-0.5">{ROLE_LABELS[agent.role]}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onHire(); }}
          className={`flex-shrink-0 px-3.5 py-1.5 text-[12px] font-semibold rounded-xl transition-all ${
            hired ? 'bg-[#f5f5f7] text-[#8e8e93]' : 'bg-[#f4845f] text-white hover:bg-[#e8714d]'
          }`}
        >
          {hired ? '已雇佣' : '雇佣'}
        </button>
      </div>

      {/* Description tinted box */}
      <div className="w-full rounded-xl px-3 py-2.5 mb-3 flex-1 border-l-[3px] border-[#f4845f] bg-[#fff5f2]">
        <p className="text-[12px] text-[#6a4a40] line-clamp-2 leading-relaxed">{agent.description}</p>
      </div>

      {/* Stats + 查看简历 row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[11.5px]">
            <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
            <span className="font-semibold text-[#1d1d1f]">{agent.rating.score.toFixed(1)}</span>
            <span className="text-[#9a9a9a]">({agent.rating.count})</span>
          </span>
          <span className="text-[#d9d9d9]">·</span>
          <span className="flex items-center gap-1 text-[11.5px] text-[#9a9a9a]">
            <Users className="w-3 h-3" />
            <span>{agent.hiredCount.toLocaleString()}</span>
          </span>
          <span className="text-[#d9d9d9]">·</span>
          <span className="text-[11.5px] font-semibold text-[#1d1d1f]">{getLowestPrice(agent.pricing)}</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#1a1a1a] group-hover:gap-1.5 transition-all">
          查看简历
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Category → Lucide Icon map ────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  web: Globe,
  data: BarChart2,
  creative: PenLine,
  file: FileText,
  integration: Link2,
  memory: Brain,
  code: Code2,
  other: Box,
};

// ─── Skill Card ───────────────────────────────────────────────
function SkillCard({ skill, onClick, onMount, mounted }: { skill: MarketSkill; onClick: () => void; onMount: () => void; mounted: boolean }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#ebebeb] p-5 cursor-pointer transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 relative overflow-hidden group"
    >
      {/* Top row: name/category + mount button */}
      <div className="flex items-center gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="font-semibold text-[14px] text-[#1d1d1f] truncate">{skill.name}</div>
            {skill.isFeatured && (
              <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1d1d1f] text-white">精选</span>
            )}
            {skill.isNew && !skill.isFeatured && (
              <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6a6e73] border border-[#e5e5ea]">新上架</span>
            )}
          </div>
          <div className="text-[11px] text-[#8e8e93] mt-0.5">{CATEGORY_LABELS[skill.category]}</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onMount(); }}
          className={`flex-shrink-0 px-3.5 py-1.5 text-[12px] font-semibold rounded-xl transition-all ${
            mounted ? 'bg-[#f5f5f7] text-[#8e8e93]' : 'bg-[#f4845f] text-white hover:bg-[#e8714d]'
          }`}
        >
          {mounted ? '已挂载' : '挂载'}
        </button>
      </div>

      <p className="text-[12.5px] text-[#6a6e73] mb-4 line-clamp-2 leading-relaxed">{skill.shortDesc}</p>

      <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
        <div className="flex items-center gap-3">
          <StarRating score={skill.rating.score} count={skill.rating.count} />
          <span className="flex items-center gap-1 text-[12px] text-[#8e8e93]">
            <Zap className="w-3 h-3" /> {skill.mountedCount.toLocaleString()}
          </span>
          <span className="text-[#d9d9d9]">·</span>
          <span className="text-[11.5px] font-semibold text-[#1d1d1f]">{getLowestPrice(skill.pricing)}</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#1a1a1a] group-hover:gap-1.5 transition-all">
          查看详情
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Agent Detail Modal ───────────────────────────────────────
function AgentDetail({ agent, onClose }: { agent: MarketAgent; onClose: () => void }) {
  const [hired, setHired] = useState(false);
  const [imgError, setImgError] = useState(false);
  const featured = agent.pricing.find(p => p.isFeatured) ?? agent.pricing[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[50rem] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
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
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#f5f5f7] flex-shrink-0 bg-[#f5f5f7] flex items-center justify-center">
              {agent.avatarUrl && !imgError ? (
                <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <span className="text-3xl">{agent.avatar}</span>
              )}
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

          {/* Self-introduction */}
          {agent.selfIntro && (
            <div>
              <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">自我介绍</h3>
              <div className="rounded-2xl bg-[#fafafa] border border-[#f0f0f0] p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  {agent.avatarUrl && (
                    <img src={agent.avatarUrl} alt={agent.name} className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span className="text-[12px] font-medium text-[#1d1d1f]">{agent.name}</span>
                  <span className="text-[11px] text-[#8e8e93]">· {ROLE_LABELS[agent.role]}</span>
                </div>
                {agent.selfIntro.split('\n\n').map((para, i) => (
                  <p key={i} className="text-[13px] text-[#3a3a3c] leading-[1.8]">{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* User reviews */}
          {agent.reviews && agent.reviews.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">
                用户评价
                <span className="ml-1.5 text-[12px] font-normal text-[#8e8e93]">({agent.reviews.length})</span>
              </h3>
              <div className="space-y-3">
                {agent.reviews.map((review, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#fafafa] border border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        {review.avatarUrl ? (
                          <img src={review.avatarUrl} alt={review.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[12px] font-bold text-[#6a6e73] flex-shrink-0">{review.name[0]}</div>
                        )}
                        <div>
                          <div className="text-[12px] font-medium text-[#1d1d1f] leading-none mb-0.5">{review.name}</div>
                          <div className="text-[11px] text-[#8e8e93]">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-[#f5a623] text-[#f5a623]' : 'fill-none text-[#e5e5ea]'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#3a3a3c] leading-[1.7]">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">擅长场景</h3>
            <div className="flex flex-wrap gap-2">
              {agent.scenarios.map(s => (
                <span key={s} className="text-[12px] px-3 py-1.5 rounded-xl bg-[#f5f5f7] text-[#6a6e73]">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">定价方案</h3>
            <div className="space-y-2">
              {agent.pricing.map(plan => (
                <div key={plan.id} className={`flex items-center justify-between p-3 rounded-xl border ${plan.isFeatured ? 'border-[#1d1d1f] bg-[#f8f8f8]' : 'border-[#e5e5ea]'}`}>
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

          <div className="flex gap-3 pt-2">
            {!hired ? (
              <>
                <button onClick={() => setHired(true)} className="flex-1 bg-[#1d1d1f] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#3a3a3c] transition-colors">
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
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[50rem] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#f2f4f6] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors">
            <X className="w-4 h-4 text-[#6a6e73]" />
          </button>
          <span className="text-[13px] font-semibold text-[#1d1d1f]">技能详情</span>
          <div className="w-8" />
        </div>

        <div className="p-6 space-y-6">
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

          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-2">能力说明</h3>
            <p className="text-[13px] text-[#6a6e73] leading-relaxed">{skill.description}</p>
          </div>

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

          <div>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] mb-3">定价方案</h3>
            <div className="space-y-2">
              {skill.pricing.map(plan => (
                <div key={plan.id} className={`flex items-center justify-between p-3 rounded-xl border ${plan.isFeatured ? 'border-[#1d1d1f] bg-[#f8f8f8]' : 'border-[#e5e5ea]'}`}>
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
export default function MarketView({ initialTab }: { initialTab?: MarketTab }) {
  const [tab, setTab] = useState<MarketTab>(initialTab ?? 'agents');

  // If parent updates initialTab after mount (e.g. user clicked sidebar), sync it.
  React.useEffect(() => {
    if (initialTab && initialTab !== tab) setTab(initialTab);
  }, [initialTab]);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('hot');
  const [roleFilter, setRoleFilter] = useState<AgentRole | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
  const [selectedAgent, setSelectedAgent] = useState<MarketAgent | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<MarketSkill | null>(null);
  const [showMyPanel, setShowMyPanel] = useState(false);
  const [hiredAgentIds, setHiredAgentIds] = useState<Set<string>>(new Set());
  const [mountedSkillIds, setMountedSkillIds] = useState<Set<string>>(new Set());

  const hiredAgents = mockAgents.filter(a => hiredAgentIds.has(a.id));

  function toggleHire(id: string) {
    setHiredAgentIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleMount(id: string) {
    setMountedSkillIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

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

  const totalCount = hiredAgentIds.size + mountedSkillIds.size;

  return (
    <div className="w-full flex flex-col min-h-0 -mt-6 relative">

      {/* ── My Panel ── */}
      <MyPanel open={showMyPanel} onClose={() => setShowMyPanel(false)} hiredAgents={hiredAgents} mountedSkillIds={mountedSkillIds} />

      {/* ── My List button (top-right of hero) ── */}
      <button
        onClick={() => setShowMyPanel(true)}
        className="absolute top-4 right-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e5e5ea] text-[12px] font-semibold text-[#555] hover:border-[#bbb] hover:text-[#1a1a1a] transition-all shadow-sm"
      >
        <LayoutList className="w-3.5 h-3.5" />
        我的清单
        {totalCount > 0 && (
          <span className="ml-0.5 w-4 h-4 rounded-full bg-[#f4845f] text-white text-[10px] font-bold flex items-center justify-center">{totalCount}</span>
        )}
      </button>

      {/* ── Hero Banner ── full-bleed, breaks out of CenterMain px-8 */}
      <div
        className="-mx-8 px-8 pt-14 pb-10 mb-8 text-center"
        style={{ background: 'linear-gradient(170deg, #ffffff 0%, #f7f7f8 50%, #f2f4f6 100%)' }}
      >
        <div className="flex items-center justify-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff5f2] border border-[#f4845f]/30 text-[#f4845f] text-[12px] font-semibold">
            <Store className="w-3.5 h-3.5" />
            锦囊集市
          </span>
        </div>
        <h1 className="text-[34px] font-black text-[#1a1a1a] mb-2 tracking-tight leading-none">
          {tab === 'agents' ? '雇一位 AI 助手' : tab === 'skills' ? '为你的 TBOX 装备技能' : '任务招募广场'}
        </h1>
        <p className="text-[15px] text-[#999] mb-8">
          {tab === 'agents' ? '发现各领域顶尖 AI Freelancer，立即雇佣' : tab === 'skills' ? '挑选 Skill 模块，一键挂载，解锁更强的 Agent' : '发布你的任务，让最合适的 Agent 来接单'}
        </p>

        {/* Search bar */}
        <div className="relative max-w-[600px] mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bbb]" />
          <input
            type="text"
            placeholder={tab === 'agents' ? 'Find a freelancer...' : tab === 'skills' ? '搜索技能...' : '搜索任务、标签…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-4 text-[15px] bg-white rounded-2xl border border-[#e8e8e8] outline-none focus:border-[#ccc] transition-colors placeholder:text-[#c8c8c8] shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
          />
        </div>

        {/* Tab switcher — underline style, no pill to avoid button clutter */}
        <div className="flex items-center justify-center gap-8 mt-7 border-b border-[#e8e8e8] pb-0 max-w-[600px] mx-auto">
          <button
            onClick={() => { setTab('agents'); setSearch(''); }}
            className={`flex items-center gap-1.5 pb-3 text-[14px] font-semibold transition-all border-b-2 -mb-px ${tab === 'agents' ? 'border-[#f4845f] text-[#1a1a1a]' : 'border-transparent text-[#999] hover:text-[#555]'}`}
          >
            <Users className="w-3.5 h-3.5" /> 人才广场
          </button>
          <button
            onClick={() => { setTab('skills'); setSearch(''); }}
            className={`flex items-center gap-1.5 pb-3 text-[14px] font-semibold transition-all border-b-2 -mb-px ${tab === 'skills' ? 'border-[#f4845f] text-[#1a1a1a]' : 'border-transparent text-[#999] hover:text-[#555]'}`}
          >
            <Package className="w-3.5 h-3.5" /> 装备铺
          </button>
          <button
            onClick={() => { setTab('tasks'); setSearch(''); }}
            className={`flex items-center gap-1.5 pb-3 text-[14px] font-semibold transition-all border-b-2 -mb-px ${tab === 'tasks' ? 'border-[#f4845f] text-[#1a1a1a]' : 'border-transparent text-[#999] hover:text-[#555]'}`}
          >
            <Briefcase className="w-3.5 h-3.5" /> 任务招募
          </button>
        </div>
      </div>

      {/* ── Tasks View ── */}
      {tab === 'tasks' && <TasksView search={search} onSearchChange={setSearch} />}

      {/* ── Filter + Sort Bar (agents / skills only) ── */}
      {tab !== 'tasks' && <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-2 flex-1 overflow-x-auto pb-0.5 flex-nowrap">
          {tab === 'agents'
            ? agentRoles.map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    roleFilter === role
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#bbb]'
                  }`}
                >
                  {role === 'all' ? '全部' : ROLE_LABELS[role]}
                </button>
              ))
            : skillCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    categoryFilter === cat
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#bbb]'
                  }`}
                >
                  {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
                </button>
              ))
          }
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-white border border-[#e0e0e0] p-1 rounded-full flex-shrink-0">
          {([['hot', TrendingUp, '热门'], ['new', Clock, '最新'], ['rating', Star, '好评']] as [SortMode, React.ElementType, string][]).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setSortMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${sortMode === key ? 'bg-[#1a1a1a] text-white' : 'text-[#777] hover:text-[#1a1a1a]'}`}
            >
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
      </div>}

      {/* Result count + Card Grid (agents / skills only) */}
      {tab !== 'tasks' && (
        <>
          <div className="text-[12px] text-[#bbb] mb-5">
            {tab === 'agents' ? `${filteredAgents.length} 位 Agent` : `${filteredSkills.length} 项技能`}
          </div>

          {/* ── Card Grid ── */}
          {tab === 'agents' ? (
            filteredAgents.length === 0 ? (
              <div className="text-center py-20 text-[#bbb] text-[14px]">没有找到匹配的 Agent</div>
            ) : (
              <div className="grid grid-cols-3 gap-5 pb-12">
                {filteredAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} onHire={() => toggleHire(agent.id)} hired={hiredAgentIds.has(agent.id)} />
                ))}
              </div>
            )
          ) : (
            filteredSkills.length === 0 ? (
              <div className="text-center py-20 text-[#bbb] text-[14px]">没有找到匹配的技能</div>
            ) : (
              <div className="grid grid-cols-3 gap-5 pb-12">
                {filteredSkills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} onMount={() => toggleMount(skill.id)} mounted={mountedSkillIds.has(skill.id)} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* ── Detail Modals ── */}
      {selectedAgent && <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      {selectedSkill && <SkillDetail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
    </div>
  );
}
