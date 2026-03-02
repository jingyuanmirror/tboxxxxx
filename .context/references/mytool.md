# 我的技能 — Product Requirements Document

**版本**：v1.1  
**日期**：2026-03-02  
**状态**：草稿

---

## 一、背景与目标

用户在使用 Tbox 的过程中会持续积累两类核心资产：
- **Agent**：有名字、人设、能力配置的 AI 助手实体
- **Skill**：可被挂载到 Agent 或直接调用的原子能力单元（工具函数/API封装/流程片段）

这些资产目前散落在"集市"的购买记录中，没有统一的管理视图。**"我的技能"** 作为档案库下的二级菜单，承载用户全部 Agent & Skill 资产的管理中心，并通过对话式引导让新增流程轻松自然。

**核心目标**：
1. 集中展示用户所有 Agent 和 Skill，区分来源（自建 vs. 集市采购）
2. 提供快速检索、预览、编辑、启用/停用能力
3. 新增 Agent/Skill 时通过 Tbox 对话框引导，降低构建门槛

---

## 二、用户故事

| #  | 角色 | 需求 | 价值 |
|----|------|------|------|
| U1 | 普通用户 | 我想看我有哪些 Agent 和 Skill | 资产一览，心中有数 |
| U2 | 普通用户 | 我想区分哪些是我自己做的，哪些是买的 | 来源清晰，便于维护 |
| U3 | 普通用户 | 我想快速启用/停用某个 Skill | 灵活控制生效范围 |
| U4 | 高级用户 | 我想通过对话的方式创建一个新 Agent | 无需填表，更自然 |
| U5 | 高级用户 | 我想通过对话的方式构建一个新 Skill | 描述需求即可生成配置 |
| U6 | 任意用户 | 我想在 Agent/Skill 卡片上看到关键信息 | 快速判断是否满足需求 |
| U7 | 创作者 | 我想把自己构建的 Agent/Skill 上架到集市 | 让作品被更多人使用，获得收益 |
| U8 | 创作者 | 我想知道我的上架申请进展如何 | 审核透明，减少焦虑 |
| U9 | 创作者 | 我想在上架后随时下架或修改定价 | 灵活控制商业策略 |
| U10 | 创作者 | 我想在审核未通过时知道具体原因 | 快速修改重新提交 |

---

## 三、信息架构

```
左侧导航
└── 档案库
    ├── 最近上传
    ├── 我的作品
    ├── 我的模版
    └── 我的技能          ← 本功能入口
         └── MyToolsView  (中心区域全屏视图)
              ├── Tab: 我的 Agent
              │    ├── 子Tab: 我构建的
              │    └── 子Tab: 集市采购的
              └── Tab: 我的 Skill
                   ├── 子Tab: 我构建的
                   └── 子Tab: 集市采购的
```

---

## 四、功能详细说明

### 4.1 页面整体布局

- 沿用 `KnowledgeView` / `MarketView` 的全宽容器模式（`activeView` 字段新增 `'mytools'`）
- 顶部：页面标题 + 主 Tab 切换（Agent / Skill）+ 右侧「＋ 新增」按钮
- 主 Tab 下方：子 Tab 切换（我构建的 / 集市采购的）+ 搜索框
- 内容区：卡片网格（desktop 3列，tablet 2列，mobile 1列）

### 4.2 Agent 卡片

| 字段 | 说明 |
|------|------|
| 头像 | emoji 或用户上传图片 |
| 名称 | Agent 命名 |
| 角色标签 | 复用 `AgentRole` 枚举（助手、分析师等） |
| Slogan | 一句话描述 |
| 已挂载 Skill 数 | `N 个技能` |
| 来源徽章 | `自建` (蓝) / `集市` (橙) |
| 启用开关 | toggle，控制该 Agent 是否出现在对话选择器 |
| 操作菜单（…） | 编辑 / 复制 / 删除 |

### 4.3 Skill 卡片

| 字段 | 说明 |
|------|------|
| 图标 | 类别图标 + 颜色系统（复用 `SkillCategory`） |
| 名称 | Skill 命名 |
| 分类标签 | 网络/数据/创意/文件/集成/记忆/代码/其他 |
| 简介 | 不超过2行的功能描述 |
| 来源徽章 | `自建` / `集市` |
| 被引用数 | `已挂载到 N 个 Agent` |
| 启用开关 | toggle，控制该 Skill 是否处于激活状态 |
| 操作菜单（…） | 编辑 / 测试运行 / 复制 / 删除 |

### 4.4 空状态

- **我构建的（空）**：插图 + 文案「还没有构建过 Agent/Skill」+ 「立即创建」按钮
- **集市采购的（空）**：插图 + 文案「还没有从集市购买过 Agent/Skill」+ 「去集市逛逛」按钮（跳转 market 视图）

### 4.5 搜索与筛选

- 搜索框：按名称实时过滤卡片
- 筛选（Skill 页）：按分类 Tag 过滤
- 排序：最近使用 / 创建时间 / 名称 A-Z

---

## 五、新增 Agent/Skill — 对话式构建流程

### 5.1 触发方式

点击页面右上角「＋ 新增 Agent」或「＋ 新增 Skill」按钮，**弹出 Tbox 对话框**（复用 `ChatDialog` 组件），并注入对应的系统引导 Prompt。

### 5.2 Agent 构建对话流

```
Tbox（引导）：你好！我来帮你创建一个专属 Agent。先告诉我，你希望这个 Agent 主要
帮你做什么？（例如：整理会议纪要、分析财务数据、写周报……）

用户：帮我追踪竞品动态，每天早上推送摘要

Tbox：好的！我给你起个名字叫「情报官」，你觉得合适吗？或者你有其他想法？
→ 合适，就叫这个
→ 我来自己起名

Tbox：情报官需要哪些能力？我帮你匹配可用的 Skill：
  ☑ 网页搜索  ☑ 摘要生成  ☑ 定时推送
  你也可以添加自定义 Skill……

Tbox：最后，给情报官写一句 Slogan 吧？（可以跳过，我帮你生成）

Tbox：✅ 创建完成！「情报官」已出现在你的 Agent 列表。你现在要试用它吗？
```

**步骤归纳**：
1. 收集核心用途（自然语言描述）
2. 确认/修改名称 & 头像
3. 推荐并勾选 Skill
4. 确认 Slogan（可选）
5. 确认创建，返回列表并高亮新建卡片

### 5.3 Skill 构建对话流

```
Tbox：你想让这个 Skill 做什么事？可以描述你的场景，我来帮你配置。

用户：每次我提到竞品名字，就自动搜索最新新闻并整理成3条摘要

Tbox：明白了！这是一个「竞品情报搜索」技能，分类是「网络集成」。
  配置如下，你可以调整：
  - 触发词：[竞品名称]（支持多个）
  - 搜索来源：Google News、百度新闻
  - 输出格式：3条摘要，含标题 + 链接 + 一句话概要
  确认吗？

用户：可以，不过改成5条摘要

Tbox：好的，已调整为5条。✅「竞品情报搜索」技能创建成功！
  现在要把它挂载到某个 Agent 上吗？
```

**步骤归纳**：
1. 自然语言描述 Skill 功能
2. Tbox 生成配置草稿（名称、分类、参数）
3. 用户确认/微调
4. 保存，询问是否挂载到 Agent

---

## 六、数据模型

### 6.1 新增类型（`src/lib/myToolsMock.ts`）

```typescript
export type AssetSource = 'built' | 'purchased';

/**
 * 上架状态（仅 source === 'built' 的资产适用）
 * - unlisted  : 从未上架 / 已下架，默认值
 * - pending   : 已提交审核，等待平台审核
 * - listed    : 审核通过，已在集市公开展示
 * - rejected  : 审核未通过，附带拒绝原因
 */
export type ListingStatus = 'unlisted' | 'pending' | 'listed' | 'rejected';

export interface ListingInfo {
  status: ListingStatus;
  submittedAt?: string;       // 最近一次提交时间（ISO）
  listedAt?: string;          // 上架时间（ISO）
  rejectedReason?: string;    // 拒绝原因，status === 'rejected' 时存在
  marketId?: string;          // 上架后对应的集市 id（listed 后由平台赋予）
  pricing: ListingPricing;
  tags: string[];             // 用户填写的适用场景标签，最多 3 个
  coverDescription: string;   // 市场展示用简介（可与内部 slogan 不同）
}

export interface ListingPricing {
  type: 'free' | 'subscription' | 'pay_per_use';
  price?: number;             // 分为单位，type !== 'free' 时必填
  currency: 'CNY';
  period?: 'month' | 'year'; // type === 'subscription' 时使用
}

export interface MyAgent {
  id: string;
  name: string;
  avatar: string;            // emoji 或图片 URL
  avatarUrl?: string;        // 真实头像照片 URL
  role: AgentRole;
  slogan: string;
  mountedSkillIds: string[]; // 挂载的 Skill id 列表
  source: AssetSource;
  isEnabled: boolean;
  createdAt: string;         // ISO 日期字符串
  marketId?: string;         // 若来源为 purchased，关联集市 Agent id
  hireDuration?: string;     // 已雇佣时长，仅 purchased 使用
  projectCount?: number;     // 已参与项目数，仅 purchased 使用
  listing?: ListingInfo;     // 上架信息，仅 source === 'built' 时存在
}

export interface MySkill {
  id: string;
  name: string;
  icon: string;
  category: SkillCategory;
  description: string;
  source: AssetSource;
  isEnabled: boolean;
  usedByAgentIds: string[];  // 被哪些 Agent 引用
  createdAt: string;
  marketId?: string;
  config?: Record<string, unknown>; // Skill 运行时配置
  listing?: ListingInfo;     // 上架信息，仅 source === 'built' 时存在
}
```

### 6.2 路由/视图扩展

- `LeftSidebarProps.onOpenView` 新增 `'mytools'` 类型
- `CenterMain` 新增 `activeView === 'mytools'` 分支，渲染 `<MyToolsView />`
- 新增 `src/components/workspace/MyToolsView.tsx`

### 6.3 对话触发参数扩展

`ChatDialog` 新增可选 prop：

```typescript
interface ChatDialogProps {
  initialMessage?: string;
  onClose: () => void;
  mode?: 'chat' | 'build-agent' | 'build-skill'; // 新增
  onBuildComplete?: (asset: MyAgent | MySkill) => void; // 构建完成回调
}
```

---

## 七、交互细节

### 7.1 启用/停用 toggle 行为（自建 Agent）
- 自建 Agent 的开关为即时操作，无需二次确认
- 停用后卡片显示为低透明度（`opacity-50`）并显示「已停用」徽章
- 停用 Agent 不影响其挂载的 Skill 本身的状态
- 集市采购的 Agent/Skill 没有启用/停用概念，改为「退订」操作

### 7.2 删除行为
- 弹出行内确认（非 modal）：「确认删除？此操作不可恢复」+ 取消/确认
- 自建资产：永久删除；若资产已上架（status = `listed`），则自动触发下架后再删除，提示用户
- 集市采购资产（退订）：仅从我的列表移除，不影响集市中的记录

### 7.3 对话框关闭行为
- 构建流程未完成时关闭，弹出提示：「草稿将丢失，确认退出？」
- 构建完成后关闭，回到我的技能列表，新建项目**滚动进入视野**并高亮闪烁 1.5s

### 7.4 来源徽章样式
- `自建`：蓝色底 `bg-[#eff6ff] text-[#2563eb]`
- `集市`：橙色底 `bg-[#fff7ed] text-[#ea580c]`

---

## 八、上架集市功能设计

### 8.1 功能概述

自建的 Agent / Skill 可以由创作者主动申请上架到集市（人才广场 / 装备铺），供其他用户发现和购买。全流程分为：**配置 → 提交审核 → 审核结果 → 上架展示**。集市采购的资产不展示上架入口。

---

### 8.2 上架状态机

```
              ┌─────────────────┐
              │   unlisted      │  ← 默认状态（从未上架 / 已下架）
              └────────┬────────┘
                       │ 用户点击「上架集市」并提交
                       ▼
              ┌─────────────────┐
              │    pending      │  ← 等待平台审核（通常 24h 内）
              └────────┬────────┘
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
     ┌─────────────────┐  ┌─────────────────┐
     │    listed       │  │    rejected     │  ← 审核未通过，附带原因
     └────────┬────────┘  └────────┬────────┘
              │ 用户点击「下架」         │ 用户点击「修改后重新提交」
              ▼                         ▼
     ┌─────────────────┐        回到 pending
     │   unlisted      │
     └─────────────────┘
```

**状态说明：**

| 状态 | 含义 | 用户可执行操作 |
|------|------|----------------|
| `unlisted` | 未上架（初始 / 下架后） | 上架集市 |
| `pending` | 审核中 | 撤回申请 |
| `listed` | 已上架，集市可见 | 下架、查看集市页面、修改定价 |
| `rejected` | 审核未通过 | 查看原因、修改后重新提交 |

---

### 8.3 上架配置弹窗（ListingDialog）

点击「上架集市」后弹出上架配置 Sheet/Dialog，分两步完成：

#### 步骤一：填写展示信息

| 字段 | 说明 | 是否必填 |
|------|------|---------|
| 展示名称 | 默认继承 Agent/Skill 名称，可修改 | 必填 |
| 封面简介 | 面向集市买家的吸引力描述，≤ 80 字 | 必填 |
| 适用场景标签 | 最多 3 个，描述典型用途（如「周报整理」「数据分析」） | 选填 |
| 封面图 | 上传自定义封面图，或使用当前头像 | 选填 |

#### 步骤二：设置定价

| 定价类型 | 说明 | 参数 |
|---------|------|------|
| 免费 | 所有用户可直接使用 | 无 |
| 订阅制 | 月付 / 年付 | 价格（元），计费周期 |
| 按次付费 | 每次调用计费 | 单次价格（分） |

> 定价为参考意向，最终定价需经平台审核确认，平台收取交易额 15% 作为渠道费。

**提交前置检查项（前端 Validation）：**
- Agent 必须至少挂载 1 个 Skill
- Skill 必须填写了 `description` 字段
- 封面简介不为空

---

### 8.4 卡片 UI — 上架状态展示

自建 Agent/Skill 卡片的底部操作区根据 `listing.status` 呈现不同 UI：

#### `unlisted`（未上架）
```
底部操作区右侧：「上架集市」按钮（outline 风格，灰色边框）
操作菜单（…）：编辑 / 复制 / 删除
```

#### `pending`（审核中）
```
底部操作区右侧：🟡「审核中」状态徽章（黄底黄字）
操作菜单（…）：编辑 / 复制 / 撤回申请 / 删除
注：审核中仍可编辑，但修改后需重新提交审核
```

#### `listed`（已上架）
```
底部操作区右侧：🟢「已上架」状态徽章（绿底绿字）
操作菜单（…）：编辑 / 复制 / 查看集市页面 / 修改定价 / 下架 / 删除
卡片右上角：小型「推广」入口（可选，P3）
```

#### `rejected`（未通过）
```
底部操作区右侧：🔴「未通过」状态徽章（红底红字）+ hover 展示拒绝原因 tooltip
操作菜单（…）：编辑 / 复制 / 重新提交 / 删除
卡片底部额外展示：折叠的拒绝原因文案（可展开）
```

**徽章视觉规格：**

| 状态 | 背景色 | 文字色 | 图标 |
|------|-------|--------|------|
| 审核中 | `bg-[#fffbeb]` | `text-[#d97706]` | `⏳` 或 `Clock` |
| 已上架 | `bg-[#f0fdf4]` | `text-[#16a34a]` | `✓` 或 `CheckCircle` |
| 未通过 | `bg-[#fef2f2]` | `text-[#dc2626]` | `✗` 或 `XCircle` |

---

### 8.5 下架行为

- 点击「下架」触发行内确认：「下架后集市将不再展示此内容，已购用户不受影响。确认吗？」
- 确认后 `listing.status` 变为 `unlisted`，在集市中立即不可检索（已雇佣用户的使用权保留）

---

### 8.6 「修改定价」交互

- 已上架状态下支持单独修改定价，弹出轻量 Popover（无需重新走完整审核流程）
- 定价变更需平台异步生效，状态短暂变为 `pending`（快速审核，通常≤ 2h）

---

### 8.7 全局「上架进度」通知

- 审核结果通过站内通知推送（顶部 Toast 或通知中心）
- 通知文案示例：
  - 通过：「🎉 你的 Agent「情报官」已通过审核，现已上架集市！」
  - 拒绝：「「情报官」审核未通过，点击查看原因并修改」

---

## 九、UI 视觉规范

| 元素 | 规格 |
|------|------|
| 页面容器 | 全宽，与 `KnowledgeView` 一致 |
| 主 Tab 切换 | 胶囊式 tab，`bg-white rounded-full`，高度 36px |
| 子 Tab | 下划线式，字号 13px |
| 卡片圆角 | `rounded-2xl`（16px） |
| 卡片阴影 | `0 2px 12px rgba(0,0,0,0.06)` |
| 卡片 hover | `-translate-y-1` + 阴影加深 |
| 启用开关 | 系统原生 `<input type="checkbox">` 或自定义 toggle，宽 36px 高 20px |
| 空状态插图 | 使用 Lucide 大图标（`w-16 h-16 text-[#d1d5db]`）+ 居中文案 |

---

## 十、开发任务拆解

| # | 任务 | 涉及文件 | 优先级 |
|---|------|----------|---------|
| T1 | 创建 `myToolsMock.ts`，编写 Mock 数据 | `src/lib/myToolsMock.ts` | P0 |
| T2 | 创建 `MyToolsView.tsx` 主视图组件 | `src/components/workspace/MyToolsView.tsx` | P0 |
| T3 | 左侧菜单「我的技能」点击跳转接入 | `LeftSidebar.tsx`、`CenterMain.tsx`、`page.tsx` | P0 |
| T4 | 扩展 `ChatDialog` 支持 `mode` prop 和构建 Prompt | `ChatDialog.tsx` | P1 |
| T5 | 新增 Agent 对话流提示词设计与调试 | `route.ts` 或 prompt 配置 | P1 |
| T6 | 新增 Skill 对话流提示词设计与调试 | 同上 | P1 |
| T7 | 构建完成后回调，更新 Mock 数据或状态 | `MyToolsView.tsx`、Zustand store | P1 |
| T8 | 搜索、筛选、排序功能实现 | `MyToolsView.tsx` | P2 |
| T9 | 启用/停用、删除交互实现 | `MyToolsView.tsx` | P2 |
| T10 | 响应式适配（tablet / mobile） | `MyToolsView.tsx` | P2 |
| T11 | 新增 `ListingStatus`、`ListingInfo`、`ListingPricing` 类型 | `myToolsMock.ts` | P1 |
| T12 | AgentCard/SkillCard 底部根据 `listing.status` 渲染上架状态 UI | `MyToolsView.tsx` | P1 |
| T13 | 实现 `ListingDialog`（两步表单：展示信息 + 定价） | `MyToolsView.tsx` 或独立组件 | P1 |
| T14 | 上架/撤回/下架操作更新本地状态（Mock 模拟审核流转） | `MyToolsView.tsx` | P1 |
| T15 | 「已上架」状态下「查看集市页面」链接跳转 Market 对应条目 | `MyToolsView.tsx`、`CenterMain.tsx` | P2 |
| T16 | 「修改定价」Popover 实现 | `MyToolsView.tsx` | P2 |
| T17 | 删除已上架资产时自动触发下架提示 | `MyToolsView.tsx` | P2 |
| T18 | 审核结果 Toast 通知（Mock 定时器模拟） | `MyToolsView.tsx` | P3 |

---

## 十一、验收标准

**基础功能：**
- [ ] 点击左侧「我的技能」，中心区域切换到 `MyToolsView`
- [ ] 主 Tab 可在「我的 Agent」和「我的 Skill」之间切换
- [ ] 子 Tab 可在「我构建的」和「集市采购的」之间切换，内容正确过滤
- [ ] 每个卡片正确展示来源徽章、启用状态、操作菜单
- [ ] 空状态下展示对应文案和引导按钮
- [ ] 点击「＋ 新增 Agent/Skill」弹出 Tbox 对话框，注入对应引导 Prompt
- [ ] 对话框内完成构建后，新资产出现在「我构建的」子 Tab，并有高亮动效
- [ ] 未完成构建时关闭对话框有确认提示
- [ ] 搜索关键词可实时过滤卡片
- [ ] 启用/停用 toggle 和删除功能正常工作
- [ ] Desktop / mobile 布局适配均正常

**上架集市功能：**
- [ ] 自建卡片底部展示「上架集市」按钮（`unlisted` 状态）
- [ ] 点击「上架集市」弹出 ListingDialog，两步填写展示信息和定价
- [ ] 提交前校验：Agent 已挂载 Skill、简介不为空
- [ ] 提交后卡片状态变为「审核中」（黄色徽章），操作菜单展示「撤回申请」
- [ ] 点击「撤回申请」状态恢复 `unlisted`
- [ ] Mock 模拟审核通过：状态变为「已上架」（绿色徽章），操作菜单展示「下架」「查看集市页面」
- [ ] Mock 模拟审核未通过：状态变为「未通过」（红色徽章），可查看拒绝原因，可重新提交
- [ ] 点击「下架」触发行内确认，确认后状态恢复 `unlisted`
- [ ] 删除已上架资产时提示需先下架
- [ ] 集市采购的资产不展示上架相关入口

---

*End of Document*
