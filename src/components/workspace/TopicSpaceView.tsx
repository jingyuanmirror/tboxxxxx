'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, MoreHorizontal, Plus, CheckCircle2, Circle,
  FileText, MessageSquare, Users, LayoutGrid, ClipboardList,
  Send, Bot, X, Upload, ChevronRight, Folder, Star,
  Flag, Clock, AlertCircle, Check,
  UserPlus, Trophy, Search, Zap, Sparkles, PenLine, Globe,
  BarChart2, Image, Code2, Pin,
} from 'lucide-react';
import {
  mockTopicSpaces, getSpaceById,
  STATUS_LABELS, STATUS_COLORS,
  TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS,
  type TopicSpace, type SpaceConversation, type SpaceTask, type SpaceDocument,
  type TaskStatus, type DocSource, type ProjectTbox, type TboxSkill,
} from '@/lib/topicSpaceMock';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AgentAvatar({ avatar, avatarUrl, size = 32 }: { avatar: string; avatarUrl?: string; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="rounded-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-md"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {avatarUrl && !err
        ? <img src={avatarUrl} alt="" width={size} height={size} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <span>{avatar}</span>
      }
    </div>
  );
}

// Look up a member by agent name and render their AgentAvatar
function AgentAvatarFromSpace({ space, name, size = 28 }: { space: TopicSpace; name?: string; size?: number }) {
  const m = space.members.find(mem => mem.name === name);
  return <AgentAvatar avatar={m?.avatar ?? '🤖'} avatarUrl={m?.avatarUrl} size={size} />;
}

function StatusBadge({ status }: { status: TopicSpace['status'] }) {
  const c = STATUS_COLORS[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

const FORMAT_COLORS: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: '#fef2f2', text: '#dc2626' },
  DOCX: { bg: '#eff6ff', text: '#2563eb' },
  XLSX: { bg: '#f0fdf4', text: '#16a34a' },
  PPTX: { bg: '#fff7ed', text: '#ea580c' },
  PNG:  { bg: '#faf5ff', text: '#9333ea' },
  MD:   { bg: '#f0fdfa', text: '#0d9488' },
  TXT:  { bg: '#f8fafc', text: '#64748b' },
};

// ─── Tab types ────────────────────────────────────────────────────────────────

type SpaceTab = 'overview' | 'documents' | 'conversations' | 'team' | 'tasks';

const TABS: { id: SpaceTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',       label: '概览',  icon: LayoutGrid },
  { id: 'conversations',  label: '对话',  icon: MessageSquare },
  { id: 'documents',      label: '文档',  icon: FileText },
  { id: 'team',           label: '成员',  icon: Users },
  { id: 'tasks',          label: '任务',  icon: ClipboardList },
];

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ space }: { space: TopicSpace }) {
  const [manifesto, setManifesto] = useState(space.manifesto);
  const [draftManifesto, setDraftManifesto] = useState(space.manifesto);
  const [roadmapItems, setRoadmapItems] = useState(space.roadmap);
  const [isEditingManifesto, setIsEditingManifesto] = useState(false);
  const [assetFilter, setAssetFilter] = useState<'all' | 'definition' | 'tech' | 'visual'>('all');
  const [ingestField, setIngestField] = useState<'intent' | 'standards' | 'constraints'>('intent');
  const [summaryLoadingId, setSummaryLoadingId] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [insight, setInsight] = useState(space.insight);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightActionState, setInsightActionState] = useState<string | null>(null);
  const [nextPhaseContext, setNextPhaseContext] = useState<string>(() => {
    const doneWithSummary = space.roadmap.filter(item => item.status === 'done' && item.stageSummary);
    if (doneWithSummary.length === 0) return '暂无已确认阶段总结，下一阶段将使用项目宪法作为默认背景。';
    return `已承接：${doneWithSummary[doneWithSummary.length - 1].stageSummary}`;
  });

  useEffect(() => {
    setManifesto(space.manifesto);
    setDraftManifesto(space.manifesto);
    setRoadmapItems(space.roadmap);
    setIsEditingManifesto(false);
    setAssetFilter('all');
    setIngestField('intent');
    setSummaryLoadingId(null);
    setSummaryError(null);
    setInsight(space.insight);
    setInsightLoading(false);
    setInsightError(null);
    setInsightActionState(null);
    const doneWithSummary = space.roadmap.filter(item => item.status === 'done' && item.stageSummary);
    if (doneWithSummary.length === 0) {
      setNextPhaseContext('暂无已确认阶段总结，下一阶段将使用项目宪法作为默认背景。');
    } else {
      setNextPhaseContext(`已承接：${doneWithSummary[doneWithSummary.length - 1].stageSummary}`);
    }
  }, [space.id, space.manifesto]);

  const filteredAssets = space.knowledgeAssets.filter(asset =>
    assetFilter === 'all' || asset.type === assetFilter
  );

  const ingestPresetText: Record<'intent' | 'standards' | 'constraints', string> = {
    intent: '- [来自对话沉淀] 当前阶段优先完成可配置化设置闭环，并保障 AI 上下文连续性。',
    standards: '- [来自对话沉淀] 里程碑节点必须绑定至少一个可追溯交付物（文档/对话）。',
    constraints: '- [来自对话沉淀] 禁止在概览页使用无来源“经验结论”。',
  };

  const handleIngestFromConversation = () => {
    const nextDraft = {
      ...draftManifesto,
      [ingestField]: `${draftManifesto[ingestField]}\n${ingestPresetText[ingestField]}`,
    };
    setDraftManifesto(nextDraft);
    setManifesto(nextDraft);
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    const milestone = roadmapItems.find(item => item.id === milestoneId);
    if (!milestone || milestone.status === 'done' || summaryLoadingId) return;

    setSummaryLoadingId(milestoneId);
    setSummaryError(null);

    try {
      const response = await fetch('/api/topic-space/milestone-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceName: space.name,
          spaceGoal: space.goal,
          milestone,
          manifesto,
          roadmap: roadmapItems,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || '自动总结失败');
      }

      const updatedRoadmap = roadmapItems.map(item =>
        item.id === milestoneId
          ? {
              ...item,
              status: 'done' as const,
              stageSummary: payload.stageSummary,
              summaryConfirmed: true,
            }
          : item
      );

      setRoadmapItems(updatedRoadmap);
      setNextPhaseContext(payload.nextPhaseContext || '已生成阶段总结，并将在下一阶段对话中优先注入。');
    } catch (error: unknown) {
      setSummaryError((error as Error)?.message || '自动总结失败，请稍后重试');
    } finally {
      setSummaryLoadingId(null);
    }
  };

  const handleRefreshInsight = async () => {
    if (insightLoading) return;
    setInsightLoading(true);
    setInsightError(null);

    try {
      const response = await fetch('/api/topic-space/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceName: space.name,
          spaceGoal: space.goal,
          manifesto,
          roadmap: roadmapItems,
          tasks: space.tasks,
          knowledgeAssets: space.knowledgeAssets,
          previousHealthScore: insight.healthScore,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || '洞察刷新失败');
      }

      setInsight({
        healthScore: payload.healthScore,
        trendDelta: payload.trendDelta,
        forecast: payload.forecast,
        confidence: payload.confidence,
        updatedAt: payload.updatedAt,
        risks: payload.risks,
        nextActions: payload.nextActions,
      });
      setInsightActionState('洞察已刷新，建议优先执行 P0 动作。');
    } catch (error: unknown) {
      setInsightError((error as Error)?.message || '洞察刷新失败，请稍后重试');
    } finally {
      setInsightLoading(false);
    }
  };

  const handleInsightAction = (actionTitle: string, actionType: 'task' | 'conversation') => {
    setInsightActionState(actionType === 'task'
      ? `已将「${actionTitle}」加入任务待办（演示态）。`
      : `已创建「${actionTitle}」对话入口（演示态）。`
    );
  };

  return (
    <div className="flex gap-6 w-full">
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-[#f4845f]" />
            <span className="text-[13.5px] font-semibold text-[#1d1d1f]">项目宪法（Project Manifesto）</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#fff5f2] text-[#f4845f] font-semibold">空间级 Prompt 来源</span>
            <span className="ml-auto text-[11px] text-[#8e8e93]">更新于 {manifesto.updatedAt}</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {isEditingManifesto ? (
              <>
                <button
                  onClick={() => {
                    setManifesto(draftManifesto);
                    setIsEditingManifesto(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-[#1d1d1f] hover:bg-black transition-colors cursor-pointer"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setDraftManifesto(manifesto);
                    setIsEditingManifesto(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#6a6e73] bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingManifesto(true)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
              >
                编辑 Markdown
              </button>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] text-[#8e8e93]">从对话一键沉淀</span>
              <select
                value={ingestField}
                onChange={e => setIngestField(e.target.value as 'intent' | 'standards' | 'constraints')}
                className="text-[11.5px] px-2 py-1 rounded-lg border border-[#e8e8e8] bg-white text-[#6a6e73] outline-none"
              >
                <option value="intent">项目意图</option>
                <option value="standards">设计标准</option>
                <option value="constraints">避雷指南</option>
              </select>
              <button
                onClick={handleIngestFromConversation}
                className="px-2.5 py-1 rounded-lg text-[11.5px] font-semibold text-[#f4845f] border border-[#f4845f]/30 hover:bg-[#fff5f2] transition-colors cursor-pointer"
              >
                加入宪法
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              { key: 'intent', label: '项目意图 Intent', value: draftManifesto.intent },
              { key: 'standards', label: '设计标准 Standards', value: draftManifesto.standards },
              { key: 'constraints', label: '避雷指南 Constraints', value: draftManifesto.constraints },
            ].map(section => (
              <div key={section.key} className="rounded-xl border border-[#f0f0f0] p-3.5 bg-[#fcfcfd]">
                <div className="text-[11px] font-semibold text-[#8e8e93] mb-2">{section.label}</div>
                {isEditingManifesto ? (
                  <textarea
                    value={section.value}
                    onChange={e => setDraftManifesto(prev => ({ ...prev, [section.key]: e.target.value }))}
                    className="w-full min-h-[140px] text-[12px] leading-[1.6] text-[#1d1d1f] bg-white border border-[#e8e8e8] rounded-lg p-2.5 outline-none focus:border-[#f4845f]"
                  />
                ) : (
                  <div className="text-[12px] leading-[1.7] text-[#1d1d1f] whitespace-pre-line">{section.value}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#f4845f]" />
            <span className="text-[13.5px] font-semibold text-[#1d1d1f]">知识资产磁贴（Knowledge Assets）</span>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { id: 'all', label: '全部' },
              { id: 'definition', label: '核心定义' },
              { id: 'tech', label: '技术选型' },
              { id: 'visual', label: '视觉快照' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setAssetFilter(item.id as 'all' | 'definition' | 'tech' | 'visual')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                  assetFilter === item.id
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-[#f5f5f7] text-[#6a6e73] hover:bg-[#ebebeb]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredAssets.length === 0 ? (
            <div className="text-[12.5px] text-[#8e8e93] py-8 text-center">当前筛选下暂无资产</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  className={`rounded-xl border p-3.5 ${asset.deprecated ? 'border-[#e5e7eb] bg-[#fafafa] opacity-70' : 'border-[#f0f0f0] bg-white'}`}
                >
                  {asset.thumbnailUrl && (
                    <div className="h-[100px] w-full rounded-lg overflow-hidden mb-2.5 bg-[#f5f5f7]">
                      <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {asset.type === 'visual' ? (
                      <Image className="w-3.5 h-3.5 text-[#a855f7]" />
                    ) : asset.type === 'tech' ? (
                      <Code2 className="w-3.5 h-3.5 text-[#2563eb]" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-[#0d9488]" />
                    )}
                    <span className="text-[12.5px] font-semibold text-[#1d1d1f] truncate">{asset.title}</span>
                    {asset.pinned && <Pin className="w-3 h-3 text-[#f4845f] ml-auto" />}
                  </div>
                  <div className="text-[11.5px] text-[#6a6e73] leading-[1.6]">{asset.description}</div>
                  {asset.value && <div className="text-[11.5px] font-semibold text-[#1d1d1f] mt-2">{asset.value}</div>}
                  <div className="flex items-center gap-2 mt-2.5 text-[10.5px] text-[#a1a1a6]">
                    {asset.frequency ? <span>高频 {asset.frequency} 次</span> : <span>已沉淀</span>}
                    <span>·</span>
                    <span>来源 {asset.sourceRef}</span>
                    <span>·</span>
                    <span>{asset.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[320px] flex-shrink-0 flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-3.5 h-3.5 text-[#2563eb]" />
            <span className="text-[12.5px] font-semibold text-[#1d1d1f]">AI 洞察看板</span>
            <button
              onClick={handleRefreshInsight}
              disabled={insightLoading}
              className="ml-auto px-2 py-1 rounded-md text-[10.5px] font-semibold text-[#2563eb] border border-[#2563eb]/25 hover:bg-[#eff6ff] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {insightLoading ? '刷新中…' : '刷新洞察'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-[#f8fafc] border border-[#e2e8f0] p-2.5">
              <div className="text-[10px] text-[#6b7280]">健康分</div>
              <div className="text-[18px] font-bold text-[#1d1d1f] leading-none mt-1">{insight.healthScore}</div>
              <div className={`text-[10px] mt-1 ${insight.trendDelta >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                {insight.trendDelta >= 0 ? `+${insight.trendDelta}` : insight.trendDelta} vs 上次
              </div>
            </div>
            <div className="rounded-lg bg-[#f8fafc] border border-[#e2e8f0] p-2.5">
              <div className="text-[10px] text-[#6b7280]">按期完成概率</div>
              <div className="text-[18px] font-bold text-[#1d1d1f] leading-none mt-1">{insight.forecast}%</div>
              <div className="text-[10px] text-[#6b7280] mt-1">置信度 {insight.confidence}%</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[11px] font-semibold text-[#6b7280] mb-1.5">风险雷达</div>
            <div className="flex flex-col gap-1.5">
              {insight.risks.slice(0, 2).map(risk => (
                <div key={risk.id} className="rounded-md border border-[#e5e7eb] bg-[#fafafa] px-2.5 py-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${risk.level === 'high' ? 'bg-[#ef4444]' : risk.level === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'}`} />
                    <span className="text-[10.5px] font-semibold text-[#1d1d1f]">{risk.title}</span>
                  </div>
                  <div className="text-[10px] text-[#6b7280] leading-[1.5]">{risk.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[#6b7280] mb-1.5">下一步引导</div>
            <div className="flex flex-col gap-1.5">
              {insight.nextActions.slice(0, 3).map(action => (
                <div key={action.id} className="rounded-md border border-[#e5e7eb] bg-white px-2.5 py-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-bold text-[#f4845f] bg-[#fff5f2] px-1.5 py-0.5 rounded-full">{action.priority}</span>
                    <span className="text-[10.5px] font-semibold text-[#1d1d1f] line-clamp-1">{action.title}</span>
                  </div>
                  <div className="text-[10px] text-[#6b7280] leading-[1.45]">{action.benefit} · 预计 {action.eta}</div>
                  <button
                    onClick={() => handleInsightAction(action.title, action.type)}
                    className="mt-1.5 text-[10px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] cursor-pointer"
                  >
                    {action.type === 'task' ? '一键转任务' : '一键发起对话'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 text-[10px] text-[#9ca3af]">更新时间：{insight.updatedAt}</div>
          {insightActionState && <div className="mt-1.5 text-[10px] text-[#2563eb]">{insightActionState}</div>}
          {insightError && <div className="mt-1.5 text-[10px] text-[#dc2626]">{insightError}</div>}
        </div>

        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <Flag className="w-3.5 h-3.5 text-[#f4845f]" />
            <span className="text-[12.5px] font-semibold text-[#1d1d1f]">项目目标</span>
          </div>
          <div className="rounded-xl px-3 py-2.5 border-l-[3px] border-[#f4845f] bg-[#fff5f2]">
            <p className="text-[12px] text-[#6a4a40] leading-[1.7] m-0">{space.goal}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-[#ff9500]" />
            <span className="text-[12.5px] font-semibold text-[#1d1d1f]">演进里程碑</span>
          </div>
          <div className="flex flex-col gap-0">
            {roadmapItems.map((item, index) => (
              <div key={item.id} className="relative pl-7 pb-4">
                {index < roadmapItems.length - 1 && (
                  <div className={`absolute left-[8px] top-5 bottom-0 w-px ${item.status === 'done' ? 'bg-[#d1d5db]' : 'bg-[#ececec]'}`} />
                )}
                <div className="absolute left-0 top-0.5">
                  {item.status === 'done' ? (
                    <CheckCircle2 className="w-[17px] h-[17px] text-[#9ca3af]" />
                  ) : item.status === 'in_progress' ? (
                    <Clock className="w-[17px] h-[17px] text-[#f4845f]" />
                  ) : (
                    <Circle className="w-[17px] h-[17px] text-[#d1d1d6]" />
                  )}
                </div>
                <div className={`text-[12px] font-medium leading-[1.5] ${item.status === 'done' ? 'text-[#8e8e93]' : 'text-[#1d1d1f]'}`}>
                  {item.title}
                </div>
                <div className="text-[10.5px] text-[#a1a1a6] mt-0.5">{item.targetDate}</div>

                <div className="mt-2 flex flex-col gap-1.5">
                  {item.deliverables.map(deliverable => (
                    <div key={deliverable.id} className="flex items-center gap-1.5 text-[10.5px] text-[#6a6e73] bg-[#f8f8f9] rounded-md px-2 py-1">
                      {deliverable.type === 'conversation' ? <MessageSquare className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      <span className="truncate">{deliverable.title}</span>
                    </div>
                  ))}
                </div>

                {item.status !== 'done' && (
                  <button
                    onClick={() => handleCompleteMilestone(item.id)}
                    disabled={summaryLoadingId !== null}
                    className="mt-2 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-[#f4845f] border border-[#f4845f]/30 hover:bg-[#fff5f2] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {summaryLoadingId === item.id ? 'AI 总结生成中…' : '标记完成并自动总结'}
                  </button>
                )}

                {item.status === 'done' && item.stageSummary && (
                  <div className="mt-2 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-2 py-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-[#6b7280] mb-0.5">
                      <Check className="w-3 h-3 text-[#22c55e]" />
                      AI 阶段总结已确认
                    </div>
                    <div className="text-[10.5px] text-[#6b7280] leading-[1.5]">{item.stageSummary}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="text-[12.5px] font-semibold text-[#1d1d1f]">AI 联动规则</span>
          </div>
          <div className="text-[11.5px] text-[#6a6e73] leading-[1.7] space-y-1.5">
            <p className="m-0">1) 新会话优先注入项目宪法，禁止项强制保留。</p>
            <p className="m-0">2) 里程碑标记完成后，自动生成阶段总结并供下一阶段引用。</p>
            <p className="m-0">3) 知识资产置顶项在回答时优先参考。</p>
          </div>
          <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
            <div className="text-[10.5px] font-semibold text-[#6b7280] mb-1">下一阶段背景输入（实时）</div>
            <div className="text-[11px] text-[#6a6e73] leading-[1.6]">{nextPhaseContext}</div>
          </div>
          {summaryError && (
            <div className="mt-2 text-[10.5px] text-[#dc2626]">{summaryError}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────────────────

type SourceFilter = 'all' | 'user_upload' | 'agent_output';

/* ─── Single document card ─── */
function DocCard({ doc, space }: { doc: SpaceDocument; space: TopicSpace }) {
  const fc = FORMAT_COLORS[doc.format] ?? { bg: '#f8fafc', text: '#64748b' };
  const conv = doc.conversationId ? space.conversations.find(c => c.id === doc.conversationId) : null;
  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] p-4 flex flex-col gap-3 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Format badge + source + NEW */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
          style={{ background: fc.bg, color: fc.text }}>{doc.format}</span>
        <div className="flex items-center gap-1.5">
          {doc.isNew && (
            <span className="text-[9.5px] font-bold text-white bg-[#f4845f] px-1.5 py-0.5 rounded-full">NEW</span>
          )}
          {doc.source === 'agent_output' && (
            <span className="text-[10.5px] text-[#8e8e93] flex items-center gap-1"><Bot className="w-3 h-3" /> Agent</span>
          )}
          {doc.source === 'user_upload' && (
            <span className="text-[10.5px] text-[#8e8e93] flex items-center gap-1"><Upload className="w-3 h-3" /> 上传</span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="text-[13px] font-semibold text-[#1d1d1f] leading-[1.4]">{doc.title}</div>

      {/* Agent name */}
      {doc.agentName && (
        <div className="flex items-center gap-1.5">
          <AgentAvatarFromSpace space={space} name={doc.agentName} size={18} />
          <span className="text-[11px] text-[#8e8e93]">{doc.agentName}</span>
        </div>
      )}

      {/* Source conversation (agent docs only) */}
      {conv && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f5f7] rounded-lg">
          <MessageSquare className="w-3 h-3 text-[#8e8e93] flex-shrink-0" />
          <span className="text-[11px] text-[#6e6e73] truncate">{conv.title}</span>
        </div>
      )}

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {doc.tags.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.05)] text-[#6e6e73] font-medium">{t}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[11px] text-[#a1a1a6]">{doc.size} · {doc.createdAt}</span>
      </div>
    </div>
  );
}

/* ─── DocumentsTab ─── */
function DocumentsTab({ space }: { space: TopicSpace }) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [activeTag, setActiveTag]       = useState<string | null>(null);

  const sourceFiltered = space.documents.filter(d =>
    sourceFilter === 'all' || d.source === sourceFilter
  );

  // Aggregate unique tags from source-filtered docs
  const allTags = Array.from(new Set(sourceFiltered.flatMap(d => d.tags)));

  const visible = sourceFiltered.filter(d =>
    !activeTag || d.tags.includes(activeTag)
  );

  const sourceFilters: { id: SourceFilter; label: string; count: number }[] = [
    { id: 'all',          label: '全部文档',   count: space.documents.length },
    { id: 'user_upload',  label: '我上传的',   count: space.documents.filter(d => d.source === 'user_upload').length },
    { id: 'agent_output', label: 'Agent 产出', count: space.documents.filter(d => d.source === 'agent_output').length },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Source filter + upload button */}
      <div className="flex items-center gap-2 flex-wrap">
        {sourceFilters.map(item => (
          <button
            key={item.id}
            onClick={() => { setSourceFilter(item.id); setActiveTag(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium cursor-pointer transition-all
              ${sourceFilter === item.id
                ? 'bg-[#1d1d1f] text-white'
                : 'bg-white border border-[#e8e8e8] text-[#6a6e73] hover:border-[#c8c8c8] hover:text-[#1d1d1f]'}`}
          >
            {item.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold leading-none
              ${sourceFilter === item.id ? 'bg-white/20 text-white' : 'bg-[rgba(0,0,0,0.06)] text-[#8e8e93]'}`}>
              {item.count}
            </span>
          </button>
        ))}
        <button className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium text-[#f4845f] border border-[#f4845f]/30 hover:bg-[#fff5f2] transition-all cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> 上传文档
        </button>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11.5px] text-[#8e8e93] font-medium flex-shrink-0">标签：</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium cursor-pointer transition-all
                ${activeTag === tag
                  ? 'bg-[#f4845f] text-white'
                  : 'bg-[rgba(0,0,0,0.05)] text-[#6e6e73] hover:bg-[rgba(0,0,0,0.10)]'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Document grid */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8e8e93]">
          <Folder className="w-12 h-12 mb-3 opacity-30" />
          <div className="text-[14px]">暂无文档</div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {visible.map(doc => <DocCard key={doc.id} doc={doc} space={space} />)}
        </div>
      )}
    </div>
  );
}

// ─── Conversations ────────────────────────────────────────────────────────────

/** Small picker shown when user clicks "+ New Conversation" */
function NewConvPicker({
  space,
  tbox,
  onSelect,
  onClose,
}: {
  space: TopicSpace;
  tbox: ProjectTbox;
  onSelect: (type: 'tbox' | 'agent', agentName?: string) => void;
  onClose: () => void;
}) {
  const tboxName = tbox.customName ?? `Tbox · ${space.name}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-[#e8e8e8] w-[340px] p-5 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#1d1d1f]">选择对话对象</span>
          <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center cursor-pointer">
            <X className="w-3.5 h-3.5 text-[#8e8e93]" />
          </button>
        </div>

        {/* Tbox option — default highlighted */}
        <button
          onClick={() => { onSelect('tbox'); onClose(); }}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fff5f2] border-2 border-[#f4845f] cursor-pointer hover:bg-[#f4845f]/10 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-[#f4845f] flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={tbox.avatarUrl ?? '/mascot.png'} alt="Tbox" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#1d1d1f] truncate">{tboxName}</span>
              <span className="text-[9px] font-bold text-[#f4845f] bg-[#f4845f]/15 px-1.5 py-0.5 rounded-full flex-shrink-0">默认</span>
            </div>
            <div className="text-[11px] text-[#8e8e93] mt-0.5">你的项目助手 · 已注入项目上下文</div>
          </div>
          <Check className="w-4 h-4 text-[#f4845f] flex-shrink-0" />
        </button>

        {/* Agent members */}
        {space.members.length > 0 && (
          <div>
            <div className="text-[11px] text-[#8e8e93] font-semibold mb-2 px-0.5">Agent 成员</div>
            <div className="flex flex-col gap-1.5">
              {space.members.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onSelect('agent', m.name); onClose(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-[#f5f5f7] hover:border-[#e8e8e8] cursor-pointer transition-all text-left"
                >
                  <AgentAvatar avatar={m.avatar} avatarUrl={m.avatarUrl} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-[#1d1d1f] truncate">{m.name}</div>
                    <div className="text-[10.5px] text-[#8e8e93]">{m.jobTitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { onSelect('tbox'); onClose(); }}
          className="w-full py-2.5 bg-[#f4845f] text-white text-[13px] font-semibold rounded-xl cursor-pointer hover:bg-[#e8714d] transition-colors"
        >
          开始对话
        </button>
      </div>
    </div>
  );
}

function ConversationsTab({ space, tbox, convId, onNewConv, showNamingGuide, onOpenNaming, onDismissNaming }: {
  space: TopicSpace;
  tbox: ProjectTbox;
  convId: string | null;
  onNewConv: () => void;
  showNamingGuide?: boolean;
  onOpenNaming?: () => void;
  onDismissNaming?: () => void;
}) {
  const [activeConv, setActiveConv] = useState<SpaceConversation | null>(
    convId ? (space.conversations.find(c => c.id === convId) ?? null) : null
  );
  const [isTboxActive, setIsTboxActive] = useState(!convId); // default to Tbox chat
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(
    activeConv?.messages ?? []
  );
  const [loading, setLoading] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (convId) {
      const c = space.conversations.find(x => x.id === convId) ?? null;
      React.startTransition(() => {
        setActiveConv(c);
        setIsTboxActive(c?.conversationType === 'tbox');
        setMessages(c?.messages ?? []);
      });
    }
  }, [convId, space]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: `u${Date.now()}`, role: 'user' as const, text: input.trim(), time: '刚刚' }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const tboxName = tbox.customName ?? `Tbox`;
      const agent = isTboxActive
        ? { name: tboxName, avatar: '🤖', avatarUrl: tbox.avatarUrl }
        : {
            name: activeConv?.agentName ?? space.members[0]?.name ?? '',
            avatar: activeConv?.agentAvatar ?? space.members[0]?.avatar ?? '',
            avatarUrl: space.members.find(m => m.name === activeConv?.agentName)?.avatarUrl,
          };
      setMessages(prev => [...prev, {
        id: `a${Date.now()}`, role: 'agent' as const,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        text: isTboxActive
          ? `收到！我已结合「${space.name}」的项目背景为您处理……稍后输出结果。`
          : '好的，我已理解您的需求，正在结合本项目上下文为您处理……',
        time: '刚刚',
      }]);
      setLoading(false);
    }, 1200);
  };

  const tboxName = tbox.customName ?? `Tbox · ${space.name}`;

  const placeholder = isTboxActive
    ? `向 ${tboxName} 发送消息…`
    : activeConv
      ? `向 ${activeConv.agentName} 发送消息…`
      : `向 ${space.members[0]?.name ?? 'Agent'} 发送消息…`;

  const headerAgent = isTboxActive
    ? { name: tboxName, avatar: '🤖', avatarUrl: tbox.avatarUrl }
    : {
        name: activeConv?.agentName ?? space.members[0]?.name ?? '',
        avatar: activeConv?.agentAvatar ?? space.members[0]?.avatar ?? '',
        avatarUrl: space.members.find(m => m.name === activeConv?.agentName)?.avatarUrl,
      };

  return (
    <div className="flex w-full bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden"
      style={{ height: 'calc(100vh - 120px)', minHeight: 500, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex-shrink-0 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center ring-2 ring-white shadow-md flex-shrink-0">
              {isTboxActive
                ? <img src={tbox.avatarUrl ?? '/mascot.png'} alt="Tbox" className="w-full h-full object-cover" />
                : (headerAgent.avatarUrl
                    ? <img src={headerAgent.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-base">{activeConv?.agentAvatar ?? '👤'}</span>)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#1d1d1f]">
                {activeConv?.title ?? (isTboxActive ? '新建对话' : `与 ${space.members[0]?.name ?? 'Agent'} 对话`)}
              </div>
              <div className="text-[11px] text-[#8e8e93] flex items-center gap-1.5">
                {headerAgent.name}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f0fdf4] text-[#16a34a] rounded-full text-[9.5px] font-semibold">
                  <span className="w-1 h-1 rounded-full bg-[#22c55e]" />已注入上下文
                </span>
              </div>
            </div>
          </div>
          {/* Naming guide — shown inside header when Tbox is active and not dismissed */}
          {isTboxActive && showNamingGuide && (
            <div className="mx-5 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#fff5f2] border border-[#f4845f]/25">
              <div className="flex-1 text-[12px] text-[#6e4c3e] leading-[1.5]">
                要不要给 {tboxName} 起一个专属的名字？命名后可保存为我的 Agent。
              </div>
              <button
                onClick={onOpenNaming}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#f4845f] text-white text-[11.5px] font-semibold rounded-lg cursor-pointer hover:bg-[#e8714d] transition-colors flex-shrink-0"
              >
                <PenLine className="w-3 h-3" /> 起名字
              </button>
              <button
                onClick={onDismissNaming}
                className="text-[11.5px] text-[#aeaeb2] hover:text-[#6e6e73] cursor-pointer transition-colors flex-shrink-0"
              >
                暂时不了
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8e8e93] gap-2 py-24">
              <MessageSquare className="w-10 h-10 opacity-15" />
              <div className="text-[13px]">发送消息开始对话</div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'agent' && (
                <div className="flex-shrink-0 mt-0.5">
                  {isTboxActive || msg.agentName === (tbox.customName ?? 'Tbox')
                    ? <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-md"><img src="/mascot.png" alt="Tbox" className="w-full h-full object-cover" /></div>
                    : <AgentAvatarFromSpace space={space} name={msg.agentName} size={28} />
                  }
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-[1.65] whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-[#1d1d1f] text-white rounded-tr-md'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] rounded-tl-md'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.hasDoc && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fff5f2] rounded-xl border border-[#f4845f]/20 cursor-pointer hover:bg-[#f4845f]/10 transition-colors">
                    <FileText className="w-3 h-3 text-[#f4845f]" />
                    <span className="text-[11px] font-medium text-[#f4845f]">{msg.docTitle}</span>
                    <ChevronRight className="w-3 h-3 text-[#f4845f]/50" />
                  </div>
                )}
                <span className="text-[10.5px] text-[#a1a1a6]">{msg.time}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-md"><img src="/mascot.png" alt="Tbox" className="w-full h-full object-cover" /></div>
              <div className="px-4 py-2.5 bg-[#f5f5f7] rounded-2xl rounded-tl-md flex gap-1 items-center">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-[#a1a1a6] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-[#f0f0f0] flex-shrink-0">
          <div className="flex items-end gap-3 bg-[#f5f5f7] rounded-2xl px-4 py-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={placeholder}
              rows={1}
              className="flex-1 bg-transparent text-[13.5px] text-[#1d1d1f] placeholder:text-[#a1a1a6] outline-none resize-none leading-[1.6]"
              style={{ maxHeight: 120 }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl bg-[#f4845f] flex items-center justify-center cursor-pointer hover:bg-[#e8714d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tbox Naming Dialog ───────────────────────────────────────────────────────

function TboxNamingDialog({
  tbox,
  spaceName,
  onSave,
  onClose,
}: {
  tbox: ProjectTbox;
  spaceName: string;
  onSave: (name: string, intro: string) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(tbox.customName ?? '');
  const [intro, setIntro] = useState(tbox.intro ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-[#e8e8e8] w-[380px] p-6 flex flex-col gap-5"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
            <img src="/mascot.png" alt="Tbox" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-[#1d1d1f]">给 Tbox 起个名字</div>
            <div className="text-[11.5px] text-[#8e8e93]">命名后将成为你的独立 Agent，可在其他项目使用</div>
          </div>
          <button onClick={onClose} className="ml-auto w-6 h-6 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center cursor-pointer flex-shrink-0">
            <X className="w-3.5 h-3.5 text-[#8e8e93]" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11.5px] font-semibold text-[#6a6e73] mb-1 block">Agent 名字 *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`例如：${spaceName.slice(0, 6)} 助手`}
              maxLength={20}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e8e8] text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none focus:border-[#f4845f] focus:ring-2 focus:ring-[#f4845f]/20 transition-all"
            />
            <div className="text-[10.5px] text-[#a1a1a6] mt-1 text-right">{name.length}/20</div>
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-[#6a6e73] mb-1 block">一句话介绍（可选）</label>
            <input
              value={intro}
              onChange={e => setIntro(e.target.value)}
              placeholder="例如：专注 Q4 营销策划的项目助手"
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e8e8] text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none focus:border-[#f4845f] focus:ring-2 focus:ring-[#f4845f]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-[12.5px] font-semibold rounded-xl bg-[#f5f5f7] text-[#6a6e73] cursor-pointer hover:bg-[#ebebeb] transition-colors">
            暂时不了
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), intro.trim())}
            disabled={!name.trim()}
            className="flex-1 py-2.5 text-[12.5px] font-semibold rounded-xl bg-[#f4845f] text-white cursor-pointer hover:bg-[#e8714d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存为 Agent
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skill Panel ──────────────────────────────────────────────────────────────

const PRESET_SKILLS: TboxSkill[] = [
  { id: 'ps1', name: '联网搜索', icon: '🌐', description: '实时搜索网络信息，获取最新资讯', source: 'system', command: '/search', addedAt: '' },
  { id: 'ps2', name: '数据分析', icon: '📊', description: '读取并分析 Excel / CSV，生成图表报告', source: 'system', command: '/analyze', addedAt: '' },
  { id: 'ps3', name: '图像生成', icon: '🎨', description: '通过文字描述生成高质量图片', source: 'market', command: '/image', addedAt: '' },
  { id: 'ps4', name: '代码执行', icon: '💻', description: '运行 Python 脚本，处理复杂数据', source: 'system', command: '/run', addedAt: '' },
  { id: 'ps5', name: '文件解析', icon: '📄', description: '解析 PDF、Word 等文档，提取关键信息', source: 'system', command: '/parse', addedAt: '' },
  { id: 'ps6', name: '日历读写', icon: '📅', description: '读取和写入日历事件，管理时间安排', source: 'system', command: '/calendar', addedAt: '' },
  { id: 'ps7', name: '邮件撰写', icon: '✉️', description: '基于项目背景起草各类专业邮件', source: 'market', command: '/email', addedAt: '' },
  { id: 'ps8', name: '翻译助手', icon: '🌍', description: '支持中英日韩等多语言互译', source: 'market', command: '/translate', addedAt: '' },
];

function SkillPanel({
  tbox,
  onAdd,
  onRemove,
  onClose,
}: {
  tbox: ProjectTbox;
  onAdd: (skill: TboxSkill) => void;
  onRemove: (skillId: string) => void;
  onClose: () => void;
}) {
  const addedIds = new Set(tbox.skills.map(s => s.id));
  const available = PRESET_SKILLS.filter(s => !addedIds.has(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-[#e8e8e8] w-[440px] max-h-[600px] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f5f5f7]">
          <div className="w-8 h-8 rounded-xl bg-[#fff5f2] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[#f4845f]" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#1d1d1f]">技能管理</div>
            <div className="text-[11px] text-[#8e8e93]">为 Tbox 添加或移除技能</div>
          </div>
          <button onClick={onClose} className="ml-auto w-6 h-6 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center cursor-pointer flex-shrink-0">
            <X className="w-3.5 h-3.5 text-[#8e8e93]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Active skills */}
          {tbox.skills.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2">已添加 ({tbox.skills.length})</div>
              <div className="flex flex-col gap-2">
                {tbox.skills.map(skill => (
                  <div key={skill.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#fff5f2] border border-[#f4845f]/15">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-[#1d1d1f]">{skill.name}</div>
                      <div className="text-[10.5px] text-[#8e8e93]">{skill.description}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#f4845f] bg-[#f4845f]/10 px-1.5 py-0.5 rounded flex-shrink-0">{skill.command}</span>
                    <button
                      onClick={() => onRemove(skill.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#f4845f]/20 cursor-pointer transition-colors flex-shrink-0"
                    ><X className="w-3 h-3 text-[#f4845f]" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available skills */}
          {available.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2">可添加</div>
              <div className="flex flex-col gap-2">
                {available.map(skill => (
                  <div key={skill.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#f9f9f9] border border-[#f0f0f0] hover:border-[#f4845f]/25 hover:bg-[#fff5f2] transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-[#1d1d1f]">{skill.name}</div>
                      <div className="text-[10.5px] text-[#8e8e93]">{skill.description}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8e8e93] bg-[rgba(0,0,0,0.06)] px-1.5 py-0.5 rounded flex-shrink-0">{skill.command}</span>
                    <button
                      onClick={() => onAdd({ ...skill, addedAt: new Date().toISOString().slice(0, 10) })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#f4845f] text-white text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-[#e8714d] transition-colors flex-shrink-0"
                    ><Plus className="w-3 h-3" />添加</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamTab({
  space,
  tbox,
  onOpenNaming,
  onOpenSkills,
}: {
  space: TopicSpace;
  tbox: ProjectTbox;
  onOpenNaming: () => void;
  onOpenSkills: () => void;
}) {
  const roleLabels: Record<string, string> = { lead: '负责 Agent', collaborator: '协作 Agent', observer: '观察者' };
  const roleColors: Record<string, { bg: string; text: string }> = {
    lead: { bg: '#fff5f2', text: '#f4845f' },
    collaborator: { bg: '#eff6ff', text: '#2563eb' },
    observer: { bg: '#f5f5f7', text: '#6a6e73' },
  };
  const statusLabel: Record<string, string> = { busy: '工作中', idle: '空闲', standby: '待命' };
  const statusColor: Record<string, string> = { busy: '#ff9500', idle: '#34c759', standby: '#8e8e93' };
  const tboxName = tbox.customName ?? `Tbox · ${space.name}`;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-5">
        <div className="text-[13px] font-semibold text-[#1d1d1f]">{space.members.length + 1} 位成员（含 Tbox）</div>
      </div>

      {/* ─── Tbox top card ─── */}
      <div className="w-full bg-gradient-to-br from-[#fff5f2] to-[#fff9f6] rounded-2xl border border-[#f4845f]/20 p-5 mb-5 flex gap-5"
        style={{ boxShadow: '0 4px 20px rgba(244,132,95,0.10)' }}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden ring-2 ring-white shadow-lg">
            <img src={tbox.avatarUrl ?? '/mascot.png'} alt="Tbox" className="w-full h-full object-cover" />
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[15px] font-bold text-[#1d1d1f]">{tboxName}</span>
          </div>
          <div className="text-[11.5px] text-[#8e8e93] mb-2.5">
            {tbox.intro ?? '你的项目专属助手，自动继承项目目标、文档与成员全量上下文'}
          </div>
          {/* Skills pills */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {tbox.skills.slice(0, 3).map(sk => (
              <span key={sk.id} className="text-[10.5px] font-medium text-[#f4845f] bg-[#f4845f]/10 px-2 py-0.5 rounded-full">
                {sk.name}
              </span>
            ))}
            {tbox.skills.length > 3 && (
              <span className="text-[10.5px] text-[#8e8e93] bg-[rgba(0,0,0,0.05)] px-2 py-0.5 rounded-full">
                +{tbox.skills.length - 3}
              </span>
            )}
            {tbox.skills.length === 0 && (
              <span className="text-[11px] text-[#a1a1a6] italic">暂无技能</span>
            )}
          </div>
          {/* Inline actions */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-[#f4845f]/15">
            <button
              onClick={onOpenSkills}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-semibold rounded-lg bg-[#f4845f] text-white cursor-pointer hover:bg-[#e8714d] transition-colors"
            >
              <Zap className="w-3 h-3" /> 技能管理
            </button>
            <button
              onClick={onOpenNaming}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium rounded-lg text-[#f4845f] hover:bg-[#f4845f]/10 cursor-pointer transition-colors"
            >
              <PenLine className="w-3 h-3" /> {tbox.customName ? '修改名字' : '给 Tbox 起名'}
            </button>
          </div>
        </div>
      </div>

      {/* Regular agent members */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {space.members.map(m => {
          const rc = roleColors[m.role];
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-5 flex flex-col gap-4"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              {/* Header */}
              <div className="flex items-start gap-3">
                <AgentAvatar avatar={m.avatar} avatarUrl={m.avatarUrl} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#1d1d1f]">{m.name}</div>
                  <div className="text-[11.5px] text-[#8e8e93]">{m.jobTitle}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: rc.bg, color: rc.text }}>{roleLabels[m.role]}</span>
                    <span className="flex items-center gap-1 text-[10.5px]" style={{ color: statusColor[m.status] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[m.status] }} />
                      {statusLabel[m.status]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-[#f5f5f7] pt-4">
                {[
                  { label: '任务', value: m.statTasks },
                  { label: '文档', value: m.statDocs },
                  { label: '对话', value: m.statChats },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-[18px] font-bold text-[#1d1d1f]">{s.value}</div>
                    <div className="text-[10.5px] text-[#8e8e93]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-[12px] font-semibold rounded-xl bg-[#fff5f2] text-[#f4845f] border border-[#f4845f]/20 cursor-pointer hover:bg-[#f4845f] hover:text-white hover:border-[#f4845f] transition-all flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> 发起对话
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#f5f5f7] text-[#8e8e93] cursor-pointer hover:bg-[#ebebeb] hover:text-[#1d1d1f] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add member card */}
        <div className="bg-white rounded-2xl border border-dashed border-[#d1d1d6] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#a1a1a6] hover:bg-[#fafafa] transition-all min-h-[200px]">
          <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center">
            <Plus className="w-4 h-4 text-[#8e8e93]" />
          </div>
          <div className="text-[12.5px] text-[#8e8e93] text-center">
            <div className="font-medium text-[#1d1d1f]">邀请 Agent</div>
            <div className="mt-0.5">从集市或我的清单选择</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

const KANBAN_COLS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'backlog',     label: '待分配', color: '#8e8e93' },
  { status: 'in_progress', label: '进行中', color: '#007aff' },
  { status: 'review',      label: '待审核', color: '#ff9500' },
  { status: 'done',        label: '已完成', color: '#34c759' },
];

function TasksTab({ space }: { space: TopicSpace }) {
  const [tasks, setTasks] = useState<SpaceTask[]>(space.tasks);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[13px] font-semibold text-[#1d1d1f]">{tasks.length} 项任务</div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f4845f] text-white text-[12.5px] font-semibold rounded-xl cursor-pointer hover:bg-[#e8714d] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          新建任务
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {KANBAN_COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-[12.5px] font-semibold text-[#1d1d1f]">{col.label}</span>
                <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.06)] text-[#8e8e93] font-semibold">{colTasks.length}</span>
              </div>

              {/* Task cards */}
              <div className="flex flex-col gap-2.5 min-h-[200px]">
                {colTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-4 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all"
                    style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    {/* Priority dot */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: TASK_PRIORITY_COLORS[task.priority] }} />
                      <span className="text-[10.5px] font-semibold" style={{ color: TASK_PRIORITY_COLORS[task.priority] }}>
                        {TASK_PRIORITY_LABELS[task.priority]}优先级
                      </span>
                    </div>
                    <div className="text-[12.5px] font-semibold text-[#1d1d1f] leading-[1.4] mb-3">{task.title}</div>
                    <div className="flex items-center gap-2">
                      <AgentAvatarFromSpace space={space} name={task.agentName} size={20} />
                      <span className="text-[11px] text-[#8e8e93] flex-1 truncate">{task.agentName}</span>
                      {task.docCount > 0 && (
                        <span className="flex items-center gap-0.5 text-[10.5px] text-[#8e8e93]">
                          <FileText className="w-2.5 h-2.5" />{task.docCount}
                        </span>
                      )}
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-1 mt-2 text-[10.5px] text-[#a1a1a6]">
                        <Clock className="w-2.5 h-2.5" />{task.deadline}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add card */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#d1d1d6] text-[11.5px] text-[#a1a1a6] cursor-pointer hover:border-[#a1a1a6] hover:text-[#8e8e93] transition-all">
                  <Plus className="w-3 h-3" />
                  添加任务
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Floating Chat Button ─────────────────────────────────────────────────────

function FloatingChat({ space, tbox }: { space: TopicSpace; tbox: ProjectTbox }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'agent'; text: string; time: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState<'tbox' | 'agent'>('tbox');
  const [targetAgentIdx, setTargetAgentIdx] = useState(0);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const tboxName = tbox.customName ?? `Tbox`;

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: `u${Date.now()}`, role: 'user', text: input.trim(), time: '刚刚' }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const agentLabel = targetType === 'tbox' ? tboxName : (space.members[targetAgentIdx]?.name ?? 'Agent');
      setMessages(prev => [...prev, {
        id: `a${Date.now()}`, role: 'agent',
        text: targetType === 'tbox'
          ? `收到！我已注入「${space.name}」的项目背景，正在为您处理……`
          : `收到！我是 ${agentLabel}，正在结合项目上下文处理……`,
        time: '刚刚',
      }]);
      setLoading(false);
    }, 1000);
  };

  const agent = targetType === 'tbox'
    ? { name: tboxName, avatar: '🤖', avatarUrl: tbox.avatarUrl }
    : { name: space.members[targetAgentIdx]?.name ?? '', avatar: space.members[targetAgentIdx]?.avatar ?? '', avatarUrl: space.members[targetAgentIdx]?.avatarUrl };

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[460px] bg-white rounded-2xl shadow-2xl border border-[#e8e8e8] z-50 flex flex-col overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#f0f0f0]">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0">
              {targetType === 'tbox'
                ? <img src={agent.avatarUrl ?? '/mascot.png'} alt="Tbox" className="w-full h-full object-cover" />
                : (agent.avatarUrl
                    ? <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-base">{agent.avatar}</span>)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-[#1d1d1f] truncate">{agent.name}</div>
              <div className="text-[10px] text-[#8e8e93]">
                已注入项目上下文
                <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f0fdf4] text-[#16a34a] rounded-full text-[9px] font-bold">
                  <span className="w-1 h-1 rounded-full bg-[#22c55e]" />就绪
                </span>
              </div>
            </div>
            {/* Target switcher */}
            <div className="flex items-center gap-1 mr-1">
              <button
                onClick={() => setTargetType('tbox')}
                className={`text-[10px] px-2 py-1 rounded-lg font-semibold cursor-pointer transition-all
                  ${targetType === 'tbox' ? 'bg-[#f4845f] text-white' : 'bg-[#f5f5f7] text-[#8e8e93] hover:bg-[#ebebeb]'}`}
              >Tbox</button>
              {space.members.length > 0 && (
                <button
                  onClick={() => setTargetType('agent')}
                  className={`text-[10px] px-2 py-1 rounded-lg font-semibold cursor-pointer transition-all
                    ${targetType === 'agent' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#8e8e93] hover:bg-[#ebebeb]'}`}
                >Agent</button>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] cursor-pointer">
              <X className="w-3.5 h-3.5 text-[#8e8e93]" />
            </button>
          </div>

          {/* Agent selector (when agent mode) */}
          {targetType === 'agent' && space.members.length > 1 && (
            <div className="flex gap-1.5 px-4 py-2 border-b border-[#f5f5f7] overflow-x-auto">
              {space.members.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setTargetAgentIdx(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer flex-shrink-0 transition-all
                    ${targetAgentIdx === i ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#6a6e73] hover:bg-[#ebebeb]'}`}
                >
                  <AgentAvatar avatar={m.avatar} avatarUrl={m.avatarUrl} size={18} />
                  {m.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-[12px] text-[#a1a1a6] mt-4 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#c7c7cc]" />
                </div>
                {targetType === 'tbox'
                  ? <>随时向 {tboxName} 发起对话，<br />自动携带项目背景</>
                  : <>向 {agent.name} 发起对话，<br />自动携带项目背景</>}
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'agent' && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center flex-shrink-0 ring-1 ring-white">
                    {targetType === 'tbox'
                      ? <img src={agent.avatarUrl ?? '/mascot.png'} alt="Tbox" className="w-full h-full object-cover" />
                      : (agent.avatarUrl
                          ? <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : <span className="text-xs">{agent.avatar}</span>)}
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[12.5px] leading-[1.6]
                  ${msg.role === 'user' ? 'bg-[#1d1d1f] text-white rounded-tr-sm' : 'bg-[#f5f5f7] text-[#1d1d1f] rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center text-xs flex-shrink-0">
                  {targetType === 'tbox' ? <img src="/mascot.png" alt="Tbox" className="w-full h-full object-cover" /> : agent.avatar}
                </div>
                <div className="px-3 py-2 bg-[#f5f5f7] rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-[#a1a1a6] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#f0f0f0]">
            <div className="flex items-center gap-2 bg-[#f5f5f7] rounded-xl px-3 py-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`向 ${agent.name} 发送消息…`}
                className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#a1a1a6] outline-none"
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              />
              <button onClick={handleSend} disabled={!input.trim()} className="w-7 h-7 rounded-lg bg-[#f4845f] flex items-center justify-center cursor-pointer hover:bg-[#e8714d] transition-colors disabled:opacity-30">
                <Send className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-50 cursor-pointer transition-all
          ${open ? 'bg-[#1d1d1f] text-white' : 'bg-[#f4845f] text-white hover:bg-[#e8714d] hover:scale-105'}`}
        style={{ boxShadow: '0 8px 30px rgba(244,132,95,0.35), 0 0 0 1px rgba(0,0,0,0.06)' }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface TopicSpaceViewProps {
  spaceId: string;
  onBack?: () => void;
}

export default function TopicSpaceView({ spaceId, onBack }: TopicSpaceViewProps) {
  const [activeTab, setActiveTab] = useState<SpaceTab>('overview');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showNewConvPicker, setShowNewConvPicker] = useState(false);
  const [showNamingDialog, setShowNamingDialog] = useState(false);
  const [showSkillPanel, setShowSkillPanel] = useState(false);
  const space = getSpaceById(spaceId);

  // Mutable tbox state (local copy so UI updates without backend)
  const [tboxState, setTboxState] = useState<ProjectTbox | null>(null);
  useEffect(() => {
    if (space) React.startTransition(() => setTboxState(space.tbox));
  }, [spaceId]); // reset when space changes

  if (!space) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#8e8e93]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-[#c7c7cc]" />
          </div>
          <div className="text-[14px]">未找到该空间</div>
          <button onClick={onBack} className="mt-4 text-[13px] text-[#f4845f] cursor-pointer hover:underline">
            ← 返回
          </button>
        </div>
      </div>
    );
  }

  const tbox = tboxState ?? space.tbox;
  const tboxName = tbox.customName ?? `Tbox`;
  const newDocs = space.documents.filter(d => d.isNew).length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTboxSave = (name: string, intro: string) => {
    setTboxState(prev => prev ? {
      ...prev,
      customName: name || null,
      intro: intro || undefined,
      savedAsAgent: true,
      agentId: prev.agentId ?? `my-agent-${Date.now()}`,
      namingGuideDismissed: true,
    } : prev);
    setShowNamingDialog(false);
  };

  const handleSkillAdd = (skill: TboxSkill) => {
    setTboxState(prev => prev ? {
      ...prev,
      skills: [...prev.skills, { ...skill, addedAt: new Date().toISOString() }],
    } : prev);
  };

  const handleSkillRemove = (skillId: string) => {
    setTboxState(prev => prev ? {
      ...prev,
      skills: prev.skills.filter(s => s.id !== skillId),
    } : prev);
  };

  const handleDismissNamingGuide = () => {
    setTboxState(prev => prev ? { ...prev, namingGuideDismissed: true } : prev);
  };

  const handleNewConvSelect = (type: 'tbox' | 'agent') => {
    setShowNewConvPicker(false);
    setActiveConvId(null);
    setActiveTab('conversations');
    // In a real app, we'd pass the selected type to ConversationsTab via state/URL
    // For now, navigating to conversations tab is sufficient
    void type;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-row overflow-hidden">

      {/* ── Left Sidebar ──────────────────────────────────────── */}
      <div className="w-[220px] flex-shrink-0 flex flex-col border-r border-black/[0.06] bg-white/60 backdrop-blur-[16px] overflow-y-auto">

        {/* Back + name */}
        <div className="px-5 pt-8 pb-5">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[11.5px] text-[#8e8e93] hover:text-[#1d1d1f] cursor-pointer transition-colors mb-4 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            话题空间
          </button>
          <h1 className="text-[16px] font-bold text-[#1d1d1f] leading-snug">{space.name}</h1>
          <p className="text-[11.5px] text-[#8e8e93] mt-1.5 leading-[1.5]">{space.description}</p>
        </div>

        {/* Members + Tbox summary */}
        <div className="px-5 pb-5">
          <div className="flex -space-x-1.5 mb-1">
            {/* Tbox avatar at front */}
            <div className="w-[26px] h-[26px] rounded-full overflow-hidden ring-2 ring-white flex-shrink-0 z-10">
              <img src="/mascot.png" alt="Tbox" className="w-full h-full object-cover" />
            </div>
            {space.members.slice(0, 4).map(m => (
              <AgentAvatar key={m.id} avatar={m.avatar} avatarUrl={m.avatarUrl} size={26} />
            ))}
            {space.members.length > 4 && (
              <div className="w-[26px] h-[26px] rounded-full bg-[#f5f5f7] ring-2 ring-white flex items-center justify-center text-[8px] font-semibold text-[#8e8e93]">
                +{space.members.length - 4}
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#aeaeb2]">{space.members.length + 1} 位成员（含 Tbox）</div>
          {tbox.skills.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[#f4845f]">
              <Zap className="w-3 h-3" />
              {tboxName} 已注入 {tbox.skills.length} 个技能
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="px-4 pb-5">
          <button
            onClick={() => setShowNewConvPicker(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#f4845f] text-white text-[12px] font-semibold rounded-xl cursor-pointer hover:bg-[#e8714d] transition-colors">
            <Plus className="w-3.5 h-3.5" />
            新建对话
          </button>
        </div>

        <div className="mx-4 mb-4 border-t border-black/[0.05]" />

        {/* Vertical tabs */}
        <nav className="flex flex-col gap-0.5 px-3 pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all
                  ${isActive
                    ? 'bg-[#f4845f]/10 text-[#f4845f] font-semibold'
                    : 'text-[#6e6e73] hover:bg-black/[0.04] hover:text-[#1d1d1f]'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
                {tab.id === 'documents' && newDocs > 0 && (
                  <span className="ml-auto w-[16px] h-[16px] rounded-full bg-[#f4845f] text-white text-[9px] font-bold flex items-center justify-center">
                    {newDocs}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* History conversations */}
        {space.conversations.length > 0 && (
          <div className="px-3 pb-6 mt-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-wide">历史对话</div>
            <div className="flex flex-col gap-0.5">
              {space.conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConvId(conv.id); setActiveTab('conversations'); }}
                  className={`w-full text-left px-3 py-2 rounded-xl cursor-pointer transition-all
                    ${activeConvId === conv.id && activeTab === 'conversations'
                      ? 'bg-[#f4845f]/10 text-[#f4845f]'
                      : 'text-[#6e6e73] hover:bg-black/[0.04] hover:text-[#1d1d1f]'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    {conv.conversationType === 'tbox'
                      ? <img src="/mascot.png" alt="Tbox" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                      : <span className="text-[10px]">👤</span>}
                    <div className="text-[12.5px] font-medium truncate">{conv.title}</div>
                  </div>
                  <div className="text-[10.5px] text-[#aeaeb2] truncate mt-0.5 pl-5">{conv.time}</div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1200px] mx-auto">

          {activeTab === 'overview'      && <OverviewTab       space={space} />}
          {activeTab === 'documents'     && <DocumentsTab      space={space} />}
          {activeTab === 'conversations' && <ConversationsTab  space={space} tbox={tbox} convId={activeConvId} onNewConv={() => setShowNewConvPicker(true)} showNamingGuide={!tbox.namingGuideDismissed} onOpenNaming={() => setShowNamingDialog(true)} onDismissNaming={handleDismissNamingGuide} />}
          {activeTab === 'team'          && <TeamTab           space={space} tbox={tbox} onOpenNaming={() => setShowNamingDialog(true)} onOpenSkills={() => setShowSkillPanel(true)} />}
          {activeTab === 'tasks'         && <TasksTab          space={space} />}
        </div>
      </div>

      {/* Floating chat (hidden during conversations tab) */}
      {activeTab !== 'conversations' && <FloatingChat space={space} tbox={tbox} />}

      {/* ── Dialogs / Modals ─────────────────────────────────── */}

      {showNewConvPicker && (
        <NewConvPicker
          space={space}
          tbox={tbox}
          onSelect={handleNewConvSelect}
          onClose={() => setShowNewConvPicker(false)}
        />
      )}

      {showNamingDialog && (
        <TboxNamingDialog
          tbox={tbox}
          spaceName={space.name}
          onSave={handleTboxSave}
          onClose={() => setShowNamingDialog(false)}
        />
      )}

      {showSkillPanel && (
        <SkillPanel
          tbox={tbox}
          onAdd={handleSkillAdd}
          onRemove={handleSkillRemove}
          onClose={() => setShowSkillPanel(false)}
        />
      )}
    </div>
  );
}
