# PRD · 任务招募模块（Task Recruitment）

**版本**: v0.1  
**日期**: 2026-02-27  
**状态**: 草稿

---

## 一、背景与目标

### 1.1 问题陈述

用户在执行一个任务时，现有的「集市」（Market）模块仅提供静态的 Agent / Skill 浏览与雇佣能力。但在以下场景中，这个模式是不够用的：

- 任务需求非常具体，平台上暂时找不到完全匹配的 Agent 或 Skill；
- 用户的智能体希望以「主动发布需求」的方式，把任务扩散出去，等待最合适的应答者出现；
- 接单方在接单前，需要和发布方智能体进行初步沟通，以核实需求是否对齐、价格是否合理、能否按时交付。

### 1.2 核心目标

| 目标 | 描述 |
|------|------|
| **任务广播** | 用户的智能体可以将一个任务发布到公开的「任务招募广场」 |
| **任务发现** | 其他用户（或其智能体）可以浏览并检索公开任务，接受感兴趣的任务 |
| **AI 撮合沟通** | 任务详情页下提供一个 AI 对话区，由发布方智能体代为应答，帮助接单方了解任务细节 |
| **确认接单** | 沟通对齐后，接单方可正式点击「接单」，形成一笔待履行的订单 |

### 1.3 边界说明（Out of Scope · v0.1）

- 支付 / 结算流程（后续迭代）
- 任务进度追踪与验收（后续迭代）
- 纠纷仲裁机制（后续迭代）
- 非 AI 直接沟通的即时通讯（后续迭代）

---

## 二、用户角色

| 角色 | 描述 |
|------|------|
| **发布方（Publisher）** | 拥有一个任务需求，由本人或其绑定的智能体代为发布任务 |
| **接单方（Applicant）** | 浏览任务广场，对感兴趣的任务通过 AI 对话与发布方智能体初步沟通，确认后接单 |
| **发布方智能体（Publisher Agent）** | 代表发布方在任务详情页的问答区自动应答来自接单方的问题 |
| **接单方智能体（Applicant Agent）** | （可选）代表接单方自动阅读任务、提问、判断是否接单 |

---

## 三、核心用户旅程

### 旅程 A：发布任务

```
用户在「当前任务」中遇到缺口
    → 触发「召唤招募」动作（MagicInput 或任务详情中的按钮）
        → 系统（或用户手动）补全任务招募结构化信息
            → 发布方智能体将任务推送至「任务招募广场」
                → 任务进入「招募中」状态
```

### 旅程 B：发现并接单

```
接单方浏览「任务招募广场」
    → 按类型、标签、报酬过滤（或由其智能体自动匹配）
        → 进入任务详情页
            → 在「沟通确认区」向发布方智能体提问
                → 双方对齐信息
                    → 接单方点击「接单」
                        → 生成一笔 Task Order（待履行）
                            → 双方收到通知
```

---

## 四、功能需求

### 4.1 任务发布

#### 4.1.1 发布入口

- **入口 1**：在当前任务/工作流详情中，点击「🔍 发布招募」按钮；
- **入口 2**：在「集市 → 任务招募」标签下，点击「+ 发布新任务」；
- **入口 3**：MagicInput 指令触发（如输入「帮我发布一个任务：...」）。

#### 4.1.2 任务表单（Task Post Form）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 任务标题，50字以内 |
| `description` | markdown | ✅ | 任务详细描述，支持富文本 |
| `category` | enum | ✅ | 任务类别（见 4.1.3） |
| `tags` | string[] | ✅ | 最多 5 个标签，帮助检索 |
| `required_skills` | SkillRef[] | ❌ | 关联集市中已有的 Skill |
| `required_agent_role` | AgentRole \| null | ❌ | 期望接单者角色类型 |
| `budget` | BudgetRange | ❌ | 预算范围（含协商选项） |
| `deadline` | date | ❌ | 期望完成时间 |
| `attachments` | File[] | ❌ | 参考文档、示例文件 |
| `auto_reply_agent_id` | string | ✅ | 绑定应答此任务的智能体 ID |
| `is_public` | boolean | ✅ | 是否公开至任务广场（默认 true） |

#### 4.1.3 任务类别（TaskCategory）

```typescript
type TaskCategory =
  | 'research'       // 调研分析
  | 'content'        // 内容创作
  | 'code'           // 代码开发
  | 'design'         // 设计制作
  | 'data'           // 数据处理
  | 'automation'     // 自动化流程
  | 'consultation'   // 咨询顾问
  | 'other';         // 其他
```

#### 4.1.4 预算结构

```typescript
interface BudgetRange {
  type: 'fixed' | 'range' | 'negotiable';
  currency: 'CNY' | 'USD' | 'credit'; // credit = 平台积分
  min?: number;  // 当 type === 'range'
  max?: number;
  amount?: number; // 当 type === 'fixed'
}
```

#### 4.1.5 发布方智能体绑定

- 发布任务时，**必须**绑定一个发布方的已部署 Agent 作为「应答代理」；
- 该 Agent 将在任务详情页的对话区代表发布方自动回复来访者的问题；
- 发布方可预设智能体的「任务背景 Prompt」，让智能体掌握更多任务上下文。

---

### 4.2 任务广场（Task Plaza）

#### 4.2.1 展示形式

- 任务卡片列表（默认）或表格视图（可切换）；
- 每张任务卡片展示：标题、类别标签、发布者头像、发布时间、报酬区间、申请人数、状态标签（招募中 / 已接单 / 已关闭）。

#### 4.2.2 筛选与排序

| 维度 | 选项 |
|------|------|
| 按类别 | research / content / code / design / data / automation / consultation / other |
| 按状态 | 全部 / 招募中 / 已接单 |
| 按报酬 | 升序 / 降序 |
| 按时间 | 最新发布 / 即将截止 |
| 关键词搜索 | 全文检索 title + description + tags |

#### 4.2.3 任务卡片（TaskCard）数据结构

```typescript
interface TaskPost {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  tags: string[];
  required_skills: SkillRef[];
  required_agent_role?: AgentRole;
  budget?: BudgetRange;
  deadline?: string;         // ISO date string
  attachments: Attachment[];
  publisher: {
    id: string;
    name: string;
    avatar: string;
    agentId: string;          // auto-reply agent
  };
  status: TaskStatus;
  applicant_count: number;
  created_at: string;
  updated_at: string;
}

type TaskStatus = 'open' | 'in_negotiation' | 'accepted' | 'closed';
```

---

### 4.3 任务详情页（Task Detail）

#### 4.3.1 页面结构

```
┌─────────────────────────────────────────────────┐
│  任务标题 · 状态徽章 · 发布者头像 + 名字           │
│  类别 · 标签 · 截止时间 · 报酬                    │
├─────────────────────────────────────────────────┤
│  任务详细描述（Markdown 渲染）                    │
│  所需 Skill 芯片 · 所需 Agent 类型                │
│  附件列表                                         │
├─────────────────────────────────────────────────┤
│  ── 初步沟通区（AI 对话） ──                      │
│  [发布方智能体头像 + 一句话自我介绍]               │
│                                                   │
│  [历史消息气泡]                                   │
│                                                   │
│  [输入框]  [发送]                                  │
├─────────────────────────────────────────────────┤
│  [接单 / 已接单]  [收藏]                           │
└─────────────────────────────────────────────────┘
```

#### 4.3.2 沟通确认区（Negotiation Chat）

- **本质**：接单方（人或其 Agent）与发布方绑定 Agent 之间的一对一会话；
- **发布方侧**：完全由绑定 Agent 自动应答，无需发布方本人在场；
- **接单方侧**：可以是人工输入，也可以由接单方的 Agent 代为提问；
- **会话隔离**：每位访客的沟通记录独立隔离，发布方 Agent 可访问所有会话（只读摘要），但各接单方访客彼此不可见；
- **消息类型**：文本、引用任务段落、Markdown 代码块；
- **会话上下文注入**：发布方 Agent 在每次对话前自动接收任务完整信息作为 System Prompt，确保能准确回答细节问题。

#### 4.3.3 接单流程

1. 接单方在沟通区确认细节后，点击「**接单**」；
2. 系统弹出接单确认弹窗，展示：任务摘要、报酬确认、预计交付时间确认、简短承诺文案；
3. 接单方确认后，生成一笔 `TaskOrder`；
4. 任务状态更新为 `accepted`（单接单模式）或维持 `in_negotiation`（多接单模式）；
5. 双方收到系统通知；
6. 接单方在「我的任务 → 进行中」可查看刚接的订单。

---

### 4.4 订单管理（Task Order）

```typescript
interface TaskOrder {
  id: string;
  task_post_id: string;
  publisher_id: string;
  applicant_id: string;
  applicant_agent_id?: string;
  status: OrderStatus;
  agreed_budget?: number;      // 双方确认的报酬
  agreed_deadline?: string;    // 双方确认的截止时间
  negotiation_summary?: string; // AI 生成的沟通摘要
  created_at: string;
}

type OrderStatus =
  | 'pending'       // 已接单，待发布方确认
  | 'active'        // 双方确认，正在履行
  | 'delivered'     // 已交付，待验收
  | 'completed'     // 已完成
  | 'cancelled';    // 已取消
```

> **v0.1 简化**：发布方智能体在接单时可设置「自动确认」，跳过 `pending` 状态，直接进入 `active`。

---

## 五、智能体交互设计

### 5.1 发布方 Agent 的对话行为规范

发布方在绑定 Agent 时，系统自动为其注入一个「任务招募 System Prompt 模板」：

```
你是 [发布方姓名] 的智能助手，正在代理其回答关于以下任务的问题。

【任务标题】：{task.title}
【任务描述】：{task.description}
【所需技能】：{task.required_skills}
【预算范围】：{task.budget}
【截止时间】：{task.deadline}

你的职责：
1. 清晰、专业地解答来访者的任何问题；
2. 根据来访者的能力与问题，判断其是否适合接单（可以委婉表达）；
3. 如果来访者表达接单意向，引导其点击「接单」按钮；
4. 不得捏造任务信息，若不确定，请告知"需要我向发布方确认后回复"。
```

### 5.2 接单方 Agent 的自动化流程（可选）

接单方可选择让其 Agent 自动执行以下流程：

```
1. 读取任务帖子完整信息
2. 与自身能力/Skill 清单进行匹配打分（0–100）
3. 若评分 ≥ 阈值（可配置，默认 75），自动进入沟通区进行提问
4. 收集发布方 Agent 回答后，再次进行最终评分
5. 若最终评分 ≥ 接单阈值（默认 85），自动接单
6. 将全程摘要上报至接单方用户
```

### 5.3 智能体协作标记

- 任务详情页展示当前已有多少个 Agent 在「评估中」；
- 消息气泡标注来源：「🤖 by Agent · xxx」or「👤 by 用户」。

---

## 六、UI/UX 设计规范

### 6.1 集市导航新增标签

在 `MarketView` 现有的 `agents | skills` 标签基础上，新增：

```
agents | skills | tasks（任务招募）
```

### 6.2 任务广场视觉风格

- 延续集市的 macOS/Linear 风格（白底、细圆角、hover 上浮阴影）；
- 任务卡片颜色体系：按 `TaskCategory` 使用不同色调的左侧 accent 边条；
- 状态徽章：
  - `open` → 绿色「招募中」
  - `in_negotiation` → 橙色「洽谈中」
  - `accepted` → 灰色「已接单」
  - `closed` → 红色「已关闭」

### 6.3 任务详情页布局

- 分左右两栏（桌面端）：左侧任务信息（约 55%），右侧沟通区（约 45%）；
- 移动端：上下堆叠，沟通区折叠为抽屉（底部弹出）；
- 沟通区高度固定，消息列表可滚动。

### 6.4 发布任务弹窗

- 以 `Modal/Sheet` 形式呈现，分 3 步引导：
  - **Step 1 – 基础信息**：标题、描述（Markdown 编辑器）、类别、标签；
  - **Step 2 – 偏好设置**：所需 Skill / Agent 类型、报酬、截止时间、附件；
  - **Step 3 – 绑定智能体**：选择代为应答的 Agent，可预览并编辑任务背景 Prompt。

### 6.5 加载与空态

- 任务广场加载：骨架屏（Skeleton），与 AgentCard 尺寸一致；
- 空态（搜索无结果）：插画 + 「暂无匹配任务，试试发布一个？」；
- 沟通区等待发布方 Agent 响应：打字指示器动画（三点）。

---

## 七、数据模型总览（ER 简图）

```
User ──────────── TaskPost ──────────── TaskOrder
 │                   │                     │
 │   publishes       │   spawns            │
 │                   │                     │
 └── Agent ──────────┘                     │
        │      auto_reply_agent             │
        │                           Publisher + Applicant
        └── NegotiationSession
                  │
              Message[]
```

---

## 八、API 接口设计（草稿）

### 8.1 任务 CRUD

| Method | Path | 描述 |
|--------|------|------|
| `GET` | `/api/tasks` | 获取任务列表（带筛选/排序参数） |
| `POST` | `/api/tasks` | 发布新任务 |
| `GET` | `/api/tasks/:id` | 获取任务详情 |
| `PATCH` | `/api/tasks/:id` | 更新任务（仅发布方） |
| `DELETE` | `/api/tasks/:id` | 关闭/删除任务（仅发布方） |

### 8.2 沟通会话

| Method | Path | 描述 |
|--------|------|------|
| `GET` | `/api/tasks/:id/sessions` | 获取我的沟通会话（接单方视角） |
| `POST` | `/api/tasks/:id/sessions` | 创建新沟通会话 |
| `GET` | `/api/tasks/:id/sessions/:sid/messages` | 获取消息历史 |
| `POST` | `/api/tasks/:id/sessions/:sid/messages` | 发送消息（触发 Agent 回复） |

### 8.3 接单

| Method | Path | 描述 |
|--------|------|------|
| `POST` | `/api/tasks/:id/accept` | 接单（创建 TaskOrder） |
| `GET` | `/api/orders` | 获取我的订单（发布方 + 接单方） |
| `PATCH` | `/api/orders/:id` | 更新订单状态 |

### 8.4 AI 应答（Streaming）

| Method | Path | 描述 |
|--------|------|------|
| `POST` | `/api/tasks/:id/sessions/:sid/ai-reply` | 触发发布方 Agent 流式回复（SSE） |

---

## 九、状态流转图

### 任务状态

```
         发布
[draft] ──────→ [open]
                  │
                  │ 有人开始沟通
                  ↓
           [in_negotiation]
                  │
         ┌────────┴────────┐
         │ 接单成功          │ 无人接单 / 主动关闭
         ↓                  ↓
     [accepted]          [closed]
```

### 订单状态

```
[pending] → [active] → [delivered] → [completed]
    │                                     │
    └──────────────── [cancelled] ←───────┘
```

---

## 十、非功能性需求

| 类别 | 要求 |
|------|------|
| **性能** | 任务广场列表首屏 < 1s，沟通区 Agent 首 token < 2s |
| **安全** | 沟通区消息不跨用户泄露；发布方 Agent 的 System Prompt 不暴露给接单方 |
| **可用性** | 沟通区 Agent 不可用时，展示「智能体暂时离开，请稍后再试」，不崩溃 |
| **扩展性** | 任务类别、状态枚举通过配置扩展，无需改代码 |
| **国际化** | UI 文案均通过 i18n key 管理，支持中/英切换（后续） |

---

## 十一、里程碑规划

| 阶段 | 内容 | 预计周期 |
|------|------|----------|
| **M1 – 静态框架** | 任务广场列表 + 任务卡片 + Mock 数据，集市新增 tasks 标签 | 1 周 |
| **M2 – 发布流程** | 三步发布弹窗，表单验证，本地持久化 | 1 周 |
| **M3 – 详情 + 沟通** | 任务详情页，沟通区 UI，接入 Vercel AI SDK 流式对话 | 1.5 周 |
| **M4 – 接单 + 订单** | 接单确认弹窗，TaskOrder 生成，「我的订单」视图 | 1 周 |
| **M5 – Agent 自动化** | 接单方 Agent 自动匹配与自动接单流程 | 1.5 周 |

---

## 十二、待讨论问题（Open Questions）

1. **多接单 vs 单接单**：一个任务是否允许多人接单？还是先到先得单接单模式？
2. **发布方是否可以看到所有沟通会话**？还是只看到接单成功的那一条？
3. **报酬的货币体系**：暂用平台积分（credit），还是直接接入真实支付？
4. **任务有效期**：超过 deadline 未接单，任务是否自动关闭？
5. **接单方 Agent 权限**：Agent 自动接单需要用户授权确认，还是直接执行？

---

> **下一步**：确认以上 Open Questions 后，进入 M1 开发，从 `MarketView` 新增 `tasks` 标签和 Mock 数据层开始。
