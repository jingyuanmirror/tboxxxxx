import { NextResponse } from 'next/server';

type RoadmapItem = {
  id: string;
  title: string;
  targetDate: string;
  status: 'todo' | 'in_progress' | 'done';
  deliverables?: Array<{ id: string; title: string; ref: string }>;
  stageSummary?: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
};

type Manifesto = {
  intent?: string;
  standards?: string;
  constraints?: string;
};

type KnowledgeAsset = {
  id: string;
  pinned?: boolean;
  deprecated?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseDateSafe(dateStr?: string) {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toInt(value: number) {
  return Math.round(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      spaceName,
      spaceGoal,
      manifesto,
      roadmap,
      tasks,
      knowledgeAssets,
      previousHealthScore,
    } = body as {
      spaceName?: string;
      spaceGoal?: string;
      manifesto?: Manifesto;
      roadmap?: RoadmapItem[];
      tasks?: TaskItem[];
      knowledgeAssets?: KnowledgeAsset[];
      previousHealthScore?: number;
    };

    if (!spaceName || !spaceGoal || !Array.isArray(roadmap)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const taskList = Array.isArray(tasks) ? tasks : [];
    const assetList = Array.isArray(knowledgeAssets) ? knowledgeAssets : [];

    const doneRoadmap = roadmap.filter(item => item.status === 'done').length;
    const inProgressRoadmap = roadmap.filter(item => item.status === 'in_progress').length;
    const roadmapProgressRaw = roadmap.length === 0 ? 60 : ((doneRoadmap + inProgressRoadmap * 0.6) / roadmap.length) * 100;

    const taskScoreMap: Record<TaskItem['status'], number> = {
      done: 100,
      review: 75,
      in_progress: 55,
      backlog: 25,
    };
    const taskProgressRaw = taskList.length === 0
      ? 65
      : taskList.reduce((sum, item) => sum + taskScoreMap[item.status], 0) / taskList.length;

    const progressScore = clamp(roadmapProgressRaw * 0.55 + taskProgressRaw * 0.45, 0, 100);

    const manifestoTextLength =
      (manifesto?.intent?.trim().length ?? 0) +
      (manifesto?.standards?.trim().length ?? 0) +
      (manifesto?.constraints?.trim().length ?? 0);
    const manifestoCompleteness = clamp((manifestoTextLength / 420) * 100, 20, 100);

    const summaryCoverage = roadmap.length === 0
      ? 70
      : (roadmap.filter(item => item.status === 'done' && !!item.stageSummary).length / roadmap.length) * 100;

    const pinnedAssets = assetList.filter(item => item.pinned && !item.deprecated).length;
    const deprecatedAssets = assetList.filter(item => item.deprecated).length;
    const consensusScore = clamp(
      manifestoCompleteness * 0.5 + summaryCoverage * 0.35 + clamp(pinnedAssets * 12 - deprecatedAssets * 8, 0, 100) * 0.15,
      0,
      100
    );

    const deliveryCoverage = roadmap.length === 0
      ? 70
      : (roadmap.filter(item => (item.deliverables?.length ?? 0) > 0).length / roadmap.length) * 100;

    const now = new Date();
    const overdueCount = roadmap.filter(item => {
      const date = parseDateSafe(item.targetDate);
      if (!date || item.status === 'done') return false;
      return date.getTime() < now.getTime();
    }).length;

    const inProgressWithoutDeliverables = roadmap.filter(item => item.status === 'in_progress' && (item.deliverables?.length ?? 0) === 0).length;
    const riskExposure = clamp(overdueCount * 28 + inProgressWithoutDeliverables * 18 + (manifesto?.constraints ? 0 : 12), 5, 95);

    const healthScoreRaw = 0.35 * progressScore + 0.25 * consensusScore + 0.2 * deliveryCoverage + 0.2 * (100 - riskExposure);
    const healthScore = toInt(clamp(healthScoreRaw, 0, 100));

    const forecastRaw = clamp(healthScore * 0.55 + progressScore * 0.25 + (100 - riskExposure) * 0.2, 0, 100);
    const forecast = toInt(forecastRaw);

    const confidenceRaw = clamp(50 + roadmap.length * 6 + assetList.length * 2 - overdueCount * 8, 30, 95);
    const confidence = toInt(confidenceRaw);

    const prevScore = typeof previousHealthScore === 'number' ? previousHealthScore : healthScore - 3;
    const trendDelta = toInt(healthScore - prevScore);

    const risks: Array<{ id: string; title: string; level: 'high' | 'medium' | 'low'; reason: string; sourceRef: string }> = [];

    if (overdueCount > 0) {
      const firstOverdue = roadmap.find(item => {
        const date = parseDateSafe(item.targetDate);
        return date && date.getTime() < now.getTime() && item.status !== 'done';
      });
      risks.push({
        id: 'risk-overdue',
        title: '里程碑逾期风险',
        level: 'high',
        reason: `当前有 ${overdueCount} 个里程碑超过目标日期仍未完成，可能影响整体节奏。`,
        sourceRef: firstOverdue?.id ?? 'roadmap',
      });
    }

    const missingDeliverable = roadmap.find(item => item.status !== 'done' && (item.deliverables?.length ?? 0) === 0);
    if (missingDeliverable) {
      risks.push({
        id: 'risk-deliverable',
        title: '关键交付物缺失',
        level: 'medium',
        reason: `阶段「${missingDeliverable.title}」尚未绑定交付物，难以保证结论可追溯。`,
        sourceRef: missingDeliverable.id,
      });
    }

    if ((manifesto?.constraints?.trim().length ?? 0) < 8) {
      risks.push({
        id: 'risk-constraint',
        title: '约束定义不足',
        level: 'medium',
        reason: '项目约束描述较弱，可能导致后续执行边界不一致。',
        sourceRef: 'manifesto.constraints',
      });
    }

    if (risks.length === 0) {
      risks.push({
        id: 'risk-low',
        title: '暂无高风险项',
        level: 'low',
        reason: '当前进度与交付覆盖稳定，建议保持节奏并持续校验关键结论。',
        sourceRef: 'overview',
      });
    }

    const topInProgress = roadmap.find(item => item.status === 'in_progress') ?? roadmap.find(item => item.status === 'todo');

    const nextActions: Array<{ id: string; title: string; priority: 'P0' | 'P1' | 'P2'; eta: string; benefit: string; type: 'task' | 'conversation'; sourceRef: string }> = [];

    if (topInProgress) {
      nextActions.push({
        id: 'action-focus-milestone',
        title: `推进「${topInProgress.title}」并确认交付物闭环`,
        priority: 'P0',
        eta: '20 分钟',
        benefit: '直接提升里程碑完成概率与可追溯性',
        type: 'conversation',
        sourceRef: topInProgress.id,
      });
    }

    nextActions.push({
      id: 'action-refresh-constraints',
      title: '复核项目约束并补充最新避雷项',
      priority: 'P1',
      eta: '10 分钟',
      benefit: '降低后续方案偏航与返工风险',
      type: 'task',
      sourceRef: 'manifesto.constraints',
    });

    if (assetList.length > 0) {
      nextActions.push({
        id: 'action-pin-assets',
        title: '确认并置顶本阶段关键知识资产',
        priority: 'P2',
        eta: '8 分钟',
        benefit: '提升下一轮 AI 输出的一致性',
        type: 'task',
        sourceRef: 'knowledge-assets',
      });
    }

    const trimmedActions = nextActions.slice(0, 3);

    return NextResponse.json({
      spaceName,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      healthScore,
      trendDelta,
      forecast,
      confidence,
      risks,
      nextActions: trimmedActions,
    });
  } catch (error) {
    console.error('[topic-space-insight] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
