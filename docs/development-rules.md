# 项目开发规则（Project Development Rules）

> 本文件是项目开发要求的**权威全文**。AGENTS.md 收录同构摘要；两者冲突时以本文件为准。任何规则变更必须同时更新本文件与 AGENTS.md。

## 1. 设计系统（Design System）

### 1.1 Design Token（强制）

- 必须建立完整的 Design Token 体系，并通过 **CSS Variables + Tailwind 映射** 落地。
- Token 至少覆盖以下类别：
  - 颜色（背景、前景、主色、辅助色、边框、成功/警告/错误/信息）
  - 字体（family、size、weight、line-height、letter-spacing）
  - 圆角（radius）
  - 阴影（shadow）
  - 间距（spacing）
  - 毛玻璃 / 透明度（glass / opacity）
  - 动画（duration、easing）
  - 断点（screens）
- **禁止**在组件中硬编码颜色、字号、间距、圆角、阴影等值。
- 所有页面（前台 + 后台）必须严格遵循 Design Token。

### 1.2 字体规范

- 使用无衬线字体（Sans-serif）。
- Heading 与 Body 字体需根据项目气质精心选择，**禁止**使用 Inter、Roboto、Arial、系统默认字体堆栈作为主字体。
- 必须考虑不同语言的混排效果(如果有)、加载性能、可变字体支持及合理的 fallback。
- 字体加载需符合性能最佳实践（preload / font-display 等）。
- **极致要求**：
  - 仅加载实际使用的字重与字符子集（unicode-range 或子集化）。
  - 使用 `font-display: swap` 或 `optional`，避免 FOIT。
  - 关键字体必须 preload，非关键字体延迟加载。
  - 禁止在关键渲染路径中同步加载大字体文件。

### 1.3 颜色与主题

- **Light 模式**：非纯白，层次清晰，视觉舒适。
- **Dark 模式**：非纯黑，对比度达标。
- 所有组件（文字、标题、按钮、卡片、输入框、边框、图标等）在 Light / Dark 下均需完美适配。
- 前后台必须支持一键切换 Light / Dark，并保持视觉一致性。
- Theme 切换图标：
  - 前台：Header 右侧
  - 后台：Sidebar 底部固定区域

### 1.4 视觉风格

- 统一使用毛玻璃（backdrop-blur）、半透明、精致阴影与克制动画。
- 动效必须服务于体验，不得影响交互响应与性能。
- 风格在 Mobile / Tablet / Desktop 以及前台 / 后台之间保持高度一致。
- **性能红线**：backdrop-blur 与大面积半透明仅允许用于 Header、Modal、底部 Tab 等有限区域；禁止大面积或滚动时持续触发的毛玻璃，以免严重影响 PageSpeed 与低端设备性能。

---

## 2. 布局与响应式

### 2.1 内容宽度

- **前台页面**：内容默认居中，最大宽度使用 `max-w-7xl`（特殊页面可微调）。
- **后台 / Admin 页面**：不强制 `max-w-7xl`，以信息密度和操作效率优先，允许更宽或全宽布局。

### 2.2 响应式原则

- 严格遵循 **Mobile First & Mobile Responsive**。
- 必须在 Mobile、Tablet、Desktop 三种尺寸下均达到最佳布局与信息展示效果。
- 优先使用 svelte-shadcn 组件解决布局与信息密度问题，充分利用横向与纵向空间。

### 2.3 Header

- 必须为 Sticky，并带有半透明 + 毛玻璃效果。
- 结构统一：
  - 左侧：Logo
  - 中间: 各种Nav Items(仅限Desktop和Tablet)
  - 右侧：Theme 切换图标 + Account 图标
- Header 在所有前台页面保持一致。

### 2.4 Footer

- 尽量紧凑，减少不必要的 padding 与 margin。
- 版权信息区域进一步压缩。
- Mobile 端可考虑弱化或移除 Footer，原有链接通过底部 Tab 或侧边导航承接。

### 2.5 Mobile 底部 Tab（Sticky Tab）

- Mobile 端增加底部 Sticky Tab，用于承载高频导航，部分替代 Header 中的链接。
- 规格要求：
  - 宽度约为浏览器可视宽度的 80%-90%
  - 水平居中
  - 与底部保持较小间距
  - 按钮四周圆角
  - 具备透明感与过渡动画
- Header 仍然保留（Logo + Theme + Account）。
- 此 Tab 设计需为未来 Tauri 2.0 App 底部导航预留一致性。

### 2.6 空间利用率（Space Utilization）

必须充分利用不同设备（尤其是 Mobile）的横向与纵向空间，避免大面积留白或信息过于稀疏，同时防止拥挤。

**核心原则：**

- **Mobile 优先考虑信息密度**：在保证可读性与可点击性的前提下，尽量提高单位屏幕的信息承载效率。
- 横向与纵向空间均需被有意识地使用，而不是简单把桌面布局缩小。
- 不同断点采用不同的空间策略，而非同一套布局的简单缩放。

**具体要求：**

1. **Mobile**
   - 优先使用纵向堆叠，但要通过合理的卡片分区、分割线、折叠（Collapsible）、手风琴、Tabs、Sheet/Drawer 等组件避免页面过长且空洞。
   - 关键操作和关键信息尽量靠前，减少无效滚动。
   - 列表、卡片、详情字段需紧凑排列，控制卡片内边距与元素间距，避免"空"的感觉。
   - 善用全宽元素（按钮、卡片、图片），同时用内部网格或 flex 提高横向利用率。
   - 底部 Sticky Tab、Sticky Header 已占用的空间必须被计算在内，内容区域避免被遮挡。
2. **Tablet**
   - 开始引入适度的多栏布局（两栏为主）。
   - 在保持舒适间距的前提下，提高横向信息密度。
   - 详情页可考虑主内容 + 侧边关键信息的组合。
3. **Desktop**
   - 在 `max-w-7xl`（前台）框架下，充分利用宽度，避免内容全部挤在中间而两侧大量留白。
   - 合理使用多栏网格、侧边栏、分栏卡片、数据密集型表格等。
   - 后台页面更应注重信息密度，支持更高密度的表格与操作区。
4. **通用空间技巧（强制执行）**
   - 优先使用 svelte-shadcn 中有利于空间利用的组件：Card、Tabs、Accordion、Collapsible、Sheet、Drawer、Table、HoverCard、Popover 等。
   - 详情页字段展示必须根据内容类型选择最佳呈现方式（定义列表、键值对网格、分节卡片、横向标签 + 纵向内容等），禁止所有字段简单垂直罗列造成浪费。
   - 控制 section 之间的间距，避免过大的 margin/padding 导致页面松散。
   - 图片、图表、操作按钮区需与文字内容形成合理的视觉区块，而不是孤立存在。
   - 在 Light/Dark 模式下都要保持相同的空间节奏与密度。
5. **Mobile 横向滑动组件（强制鼓励使用）**
   - 在信息较多、又不适合全部垂直堆叠的场景下，必须优先考虑使用横向可滑动的内容组件，以充分利用屏幕横向空间。
   - 典型适用场景：
     - 分类入口 / 快捷导航
     - 推荐内容、相关内容、热门内容
     - 图片集 / 媒体缩略图
     - 标签（Tags）、筛选 Chip、状态标签
     - 小型数据卡片组、产品/文章卡片列表
   - 要求：
     - 横向滑动区域需有明显的可滑动视觉提示（如右边缘渐隐、卡片露出一部分等）。
     - 滑动需流畅，支持触摸惯性，兼容鼠标滚轮（桌面端可降级为网格或其他布局）。
     - 不得与页面垂直滚动产生手势冲突。
     - 组件样式必须遵循 Design Token（圆角、阴影、间距、毛玻璃等）。
     - 在 Tablet / Desktop 断点应自动降级为更合适的布局（网格、多列、Tabs 等），而不是继续强制横向滑动。
6. **禁止事项**
   - 禁止为了"好看"而在 Mobile 端制造大量无意义留白。
   - 禁止桌面端两侧出现明显的空旷感（内容没有有效展开）。
   - 禁止所有断点使用完全相同的单列布局。

**验收标准：**

- Mobile 端滑动时信息密度舒适，无明显大片空白。
- Tablet/Desktop 能明显感受到横向空间被有效利用。
- 同一页面在三端下都"看起来像为该设备专门设计的"，而不是简单适配。
- 横向滑动组件在 Mobile 端使用得当，并在更大屏幕上正确降级。

---

## 3. UI/UX 交互与体验规范

### 3.1 统一状态反馈（强制）

所有数据展示区域（列表、详情、卡片、表格等）必须统一处理以下三种状态，禁止出现空白或浏览器默认表现：

- **Loading 状态**：优先使用 Skeleton 骨架屏，禁止只用简单的转圈 Loading。
- **Empty 状态**：必须有明确的空状态插画/图标 + 文案 + 引导操作（如"去创建"按钮）。
- **Error 状态**：必须有错误提示 + 重试按钮，网络错误与业务错误需区分展示。
  以上状态组件必须基于 Design Token 开发，并在 Light/Dark 模式下表现一致。

### 3.2 操作反馈

- 所有写操作（创建、更新、删除、提交等）必须给予即时反馈。
- 统一使用 svelte-shadcn 的 Toast 作为轻量反馈，重要操作使用 AlertDialog 进行二次确认。
- Toast 需区分 success / error / warning / info 四种类型，颜色与图标遵循 Design Token。
- 禁止使用浏览器原生 alert / confirm。

### 3.3 微交互与反馈

- 所有可点击元素（按钮、卡片、Tab、列表项等）必须具备明确的 hover、active、focus 状态。
- 过渡动画统一使用 Design Token 中定义的 duration 与 easing，禁止随意编写 magic number。
- 交互反馈应迅速、克制，不能为了动效而牺牲响应速度。

### 3.4 表单体验规范

- 表单布局在 Mobile 下优先单列，Tablet/Desktop 可使用多列。
- 校验错误提示必须出现在对应字段下方，并在提交失败时自动聚焦到第一个错误字段。
- 提交过程中按钮需进入 Loading 状态并防止重复提交。
- 长表单应合理分组，必要时使用 Steps 或 Anchor 导航。
- 所有表单校验统一使用 Zod，前后端校验逻辑保持一致。

### 3.5 无障碍（a11y）基础要求

- 必须使用语义化标签（header、nav、main、section、button 等）。
- 所有图标按钮必须带有可访问名称（aria-label 或 sr-only 文本）。
- 焦点状态必须清晰可见，禁止 outline: none 且无替代方案。
- 文字与背景对比度需达到 WCAG AA 标准。
- 关键功能必须支持键盘操作。

### 3.6 通用交互原则

- 点击热区在 Mobile 下不小于 44x44px。
- 重要操作应有防误触设计（二次确认或 Undo）。
- 页面切换与数据加载应尽量保持当前滚动位置或给出明确预期。
- 任何会阻塞用户操作的过程，都必须有明确的视觉反馈。

---

## 4. 前后台差异化规范

### 4.1 前台

- 完整支持 Light / Dark。
- 严格遵循 SEO 与 GEO 最佳实践（见第 7 节）。
- 根据页面内容动态性合理使用 Cloudflare Workers Cache，在保证 SEO 与性能的前提下最大化降低 Workers 压力与成本。
- 图片在上传前必须进行质量可控的压缩和转换，降低 R2 存储与带宽成本。

### 4.2 后台 / Admin

- Sidebar 高度固定。
- Sidebar 底部固定区域必须包含：
  - 当前登录用户名称
  - Email
  - Theme 切换图标
  - 返回首页图标
  - 退出登录图标
- Admin 子页面高度固定，内容超出时在容器内部滚动（overflow-y-auto）。
- 所有 Admin 页面必须设置 `noindex, nofollow`，禁止被搜索引擎收录。
- 后台与前台保持同一套 Design Token 与视觉语言，但布局以效率优先。

---

## 5. 技术栈与工程规范

### 5.1 核心技术栈

- SvelteKit（当前目标版本：3.x）
- svelte-shadcn（最大化复用，禁止手写基础 UI 组件）
- Tailwind CSS
- Zod
- Better Auth
- Drizzle ORM
- Cloudflare D1（数据库）
- Cloudflare R2（存储，仅免费额度，见 5.12）
- Vercel AI SDK（AI 功能唯一实现：所有 LLM 调用必须走 AI SDK，provider 与模型统一在 `src/lib/server/ai/agnes.ts`（`AGNES_MODEL_ID` 当前为 `agnes-3.0-flash` —— **临时选型**，后续可能增加其他大模型，新增模型/供应商仍必须经 AI SDK provider 接入并收敛到该文件，禁止散落），禁止裸 fetch `chat/completions`；后端流式统一 `streamText` + `toUIMessageStream()` + `createUIMessageStreamResponse`（2026-09-20 起 Mastra 已移除，禁止再引入 agent 框架）；前端聊天消费统一用 `@ai-sdk/svelte` 的 `Chat` + `DefaultChatTransport`）
- Lucide for Svelte（图标）
- ParaglideJS（多语言）

### 5.2 项目结构与文件组织（强制）

必须遵循以下目录约定，禁止随意创建新顶层目录或破坏约定：

```
src/
├── lib/
│   ├── components/          # 可复用 UI 组件（业务组件 + 对 shadcn 的二次封装）
│   ├── server/              # 仅服务端可用的逻辑（数据库、auth、敏感工具）
│   ├── schemas/             # Zod Schema（前后端共用）
│   ├── utils/               # 纯工具函数
│   └── types/               # 全局类型定义
├── routes/
│   ├── (frontend)/          # 前台路由组（可选）
│   ├── (admin)/             # 后台路由组（可选）
│   └── api/                 # API 路由（如需要）
├── params.ts                # 路由参数 matchers（SvelteKit 3 统一文件）
├── hooks.server.ts
├── hooks.client.ts
├── app.html
└── ...
```

**强制规则：**

- 业务逻辑禁止直接写在 `+page.svelte` 中，复杂逻辑抽离到 `src/lib` 对应目录。
- 服务端专属代码必须放在 `src/lib/server` 或带 `server` 段的文件中，防止客户端误导入。
- 组件优先放在 `src/lib/components`，仅在单路由使用的组件可临时放在对应 `routes` 目录下。
- 配置必须写在 `vite.config.ts` 中（SvelteKit 3 已废弃独立的 `svelte.config.js`）。
- 导入共享代码统一使用 `#lib` 别名（Node 原生 subpath imports），并写完整扩展名（如 `#lib/utils/format.ts`）。
- 禁止在 `src/routes` 下创建与路由无关的深层业务目录。

### 5.3 命名约定（强制）

- **文件 / 目录**：
  - 组件文件：PascalCase（`UserCard.svelte`）
  - 工具 / 普通模块：kebab-case（`format-date.ts`）
  - 路由相关：严格遵循 SvelteKit 约定（`+page.svelte`、`+layout.server.ts` 等）
- **变量 / 函数**：camelCase
- **类型 / 接口 / Zod Schema**：PascalCase（`UserSchema`、`CreatePostInput`）
- **数据库表 / 字段**：snake_case，表名单数或复数保持项目内统一（推荐复数）；不可数名词（`media`、`knowledge_base`）与单例配置表（`site_settings` 等本就复数）记为已接受偏差，不做破坏性改名迁移
- **CSS / Design Token**：kebab-case，与 Tailwind 映射保持一致
- **禁止**：拼音命名、无意义缩写、单字母变量（循环除外）、混用命名风格

> 项目偏差记录：本仓库组件文件实际采用 kebab-case（shadcn 生态约定），全库一致，经确认作为可接受偏差保留（见 AGENTS.md）。

### 5.4 TypeScript 与代码质量强制规则

- 项目必须使用 **TypeScript 6**（SvelteKit 3 最低要求）。
- 严格禁止使用 `any`。必须使用 `unknown` + 类型守卫，或精确类型。
- 所有函数（尤其是 server load、form actions、API handlers）必须显式标注返回类型。
- 优先使用 `satisfies`、`as const`、discriminated unions 提升类型安全。
- `tsconfig` 必须继承 `$app/tsconfig`，并开启严格相关选项。
- 禁止在客户端代码中导入仅服务端模块（由目录约定 + 构建时检查双重保障）。
- 代码提交前必须通过类型检查，类型错误视为阻断问题。

### 5.5 组件使用与复用原则（强制）

- 基础 UI 组件必须使用 svelte-shadcn，**禁止手写** Button、Input、Dialog、Card、Table 等基础组件。
- 业务组件可自行封装，但样式必须完全基于 Design Token。
- **先搜后写原则（AI 与人工均强制）**：
  1. 创建任何新组件前，必须先检查 `src/lib/components` 是否已有可复用或可扩展的组件。
  2. 优先通过组合现有组件实现功能，禁止重复实现相似 UI。
  3. 仅在现有组件无法满足需求、且扩展成本明显高于新建时，才允许创建新组件。
- 最大化提高 svelte-shadcn 组件复用率。

### 5.6 AI 协作工作方式（强制）

AI 在执行任何代码修改任务时必须遵守：

1. **先阅读再修改**：修改前必须先查看相关现有文件与约定，禁止凭空假设项目结构。
2. **最小改动原则**：只做完成任务所需的最小变更，禁止未经明确要求的大规模重构或风格重写。
3. **自检清单**：生成或修改代码后，必须自检以下事项：
   - 是否硬编码了颜色、间距、字号、圆角、阴影？
   - 是否处理了 Loading / Empty / Error 状态？
   - 是否符合 Mobile First 与 Design Token？
   - 是否使用了 `#lib` 正确导入？
   - 是否引入了任何 R2 付费特性？
   - 是否符合 D1 / Workers / 图片极致优化规则？
4. 修改说明中必须简要说明本次改动如何符合本规则文档的关键要求。

### 5.7 版本与 API

- 所有依赖在兼容前提下保持较新稳定版本（TypeScript 等特殊情况除外）。
- 严格使用官方最新推荐 API 与最佳实践。

### 5.8 本地开发与测试

- 必须支持本地完整模拟 Cloudflare Workers 环境，实现前后端联调与真实测试。

### 5.9 D1 极致成本与性能优化（强制）

**目标**：把 D1 查询次数、读取行数、CPU 时间压到最低，杜绝全表扫描与 N+1。

**强制规则：**

1. **禁止全表扫描**：任何列表查询必须带有效 WHERE 或 LIMIT，并确保相关字段有索引。
2. **强制索引**：所有高频过滤、排序、关联字段必须建立索引；新增查询前必须评估是否需要新索引。
3. **禁止 SELECT ***：只查询业务真正需要的字段。
4. **分页强制**：所有可能返回多条记录的列表接口必须分页（推荐 cursor 或 limit+offset，并设合理上限）。
5. **杜绝 N+1**：关联数据优先使用 JOIN 或批量查询，禁止在循环中逐条查询。
6. **Prepared Statement**：所有动态参数查询必须使用参数化查询（Drizzle 默认支持，禁止拼接 SQL）。
7. **批量优先**：写入/更新尽量使用 batch 或事务，减少往返次数。
8. **读写分离意识**：高频只读数据优先考虑缓存（Workers Cache / 内存），降低 D1 压力。
9. **查询成本自检**：新增或修改查询时，必须在注释或 PR 中说明预估扫描行数与索引使用情况。

**验收标准**：

- 生产环境不出现全表扫描慢查询。
- 列表页与详情页 D1 调用次数可控且可解释。
- 月度 D1 用量保持在预期免费/低成本范围内。

### 5.10 Workers 极致成本与性能优化（强制）

**目标**：最小化 CPU 时间、子请求次数、冷启动影响与源站压力。

**强制规则：**

1. **缓存优先**：能缓存的响应必须缓存（Cloudflare Cache / Cache API），并设置合理的 `Cache-Control` / `s-maxage` / `stale-while-revalidate`。
2. **最小化子请求**：单次请求内对 D1、R2、外部 API 的调用次数必须克制；能合并的合并，能缓存的缓存。
3. **早期返回**：鉴权失败、参数错误、缓存命中等情况尽早 return，避免后续无用计算。
4. **禁止重计算**：Workers 内禁止做复杂计算、大数组处理、图片处理、加密挖矿级操作；这些应前移到构建时或客户端可控范围。
5. **流式与按需**：大响应优先考虑流式返回；非关键数据可延迟加载。
6. **冷启动友好**：减少顶层模块的重初始化逻辑；避免在模块顶层做 I/O。
7. **错误与超时**：所有外部调用必须有超时与降级策略，防止拖垮 Worker。
8. **可观测性**：关键路径需能统计缓存命中率、D1/R2 调用次数，便于持续优化。

**验收标准**：

- 缓存命中率持续提升，源站与 D1 压力下降。
- Worker CPU 时间与子请求数保持在合理低位。
- 无明显因 Worker 逻辑导致的性能瓶颈。

### 5.11 图片与静态资源极致优化（强制）

- 上传前必须压缩并转换为 WebP（或更优格式），质量与尺寸可控。
- 禁止直接上传原图到 R2。
- 响应式图片必须提供合适的 `srcset` / `sizes`，避免加载过大图片。
- 首屏关键图片使用高优先级（fetchpriority / preload），非首屏必须 lazy。
- 所有 R2 静态资源必须带长期 `Cache-Control`（见 5.12）。
- 禁止使用 Cloudflare Image Resizing 等付费能力。

### 5.12 R2 免费额度守护（强制）

所有项目的 Cloudflare R2 统一**只使用免费额度**，**严禁**启用任何付费 R2 特性。历史上一次误配 Infrequent Access（IA）转换规则曾直接产生 $9.92 意外账单（IA 无免费额度：Class A $9/百万次、Class B $0.9/百万次），本节为成本红线，优先级等同功能正确性。

**免费额度基准（月度）：**

- 存储：10 GB（全部 bucket 合计）
- Class A 操作：100 万次（Put / Copy / List / Multipart 上传）
- Class B 操作：1000 万次（Get / Head）
- 出口流量：免费，不限量

**严禁事项（红线）：**

- ❌ **禁止**添加任何 R2 lifecycle 存储类转换规则（transition to IA / Infrequent Access 等）—— IA 无免费额度
- ❌ **禁止**在代码中显式指定 `storageClass: "InfrequentAccess"`
- ❌ **禁止**在 `wrangler.jsonc` 中配置 `"images": {}`（Cloudflare Image Resizing，按变换计费）
- ❌ **禁止**开启 Smart Tiering 或任何自动分层存储特性
- ❌ **禁止**组合使用「自定义域 + Image Resizing」等付费链路
- ❌ **禁止**保留无项目引用的孤儿 bucket（项目下线时必须同步删除对应 bucket）
- ❌ **禁止**在项目内保留任何能重新启用上述付费特性的脚本、配置或模板文件

**允许事项：**

- ✅ 所有 bucket 的 `default_storage_class` 保持 `Standard`（默认值，不得修改）
- ✅ 仅允许保留默认的 multipart-abort lifecycle 规则（7 天清理未完成分片，免费且必要）
- ✅ Worker 代理读取 R2，配合强 `Cache-Control` 与 Cloudflare 缓存降低 Class B 消耗
- ✅ 图片上传前压缩 / 转 WebP，同时控制存储与读取成本

**代码级强制要求：**

1. **上传判重**：`put` 之前必须先 `head` 判重（head 是 Class B，远便宜于重复 put 的 Class A + 存储增长）
2. **缓存元数据**：所有 `put` 必须写入 `httpMetadata.cacheControl`（静态资源用 `public, max-age=31536000, immutable`）
3. **读路由优化**：R2 读接口必须实现 ETag / 304 / Range 按需返回，禁止全量重复拉取
4. **脚本安全默认**：批量管理脚本（audit / reconcile / backfill 等）默认 dry-run，`apply` 必须显式传参
5. **禁止复活付费配置**：新增依赖、脚本或生成配置时，不得引入「严禁事项」中的任何项

**监控与验收：**

- 每月固定核查 `wrangler r2 bucket info <bucket>`，确认 `default_storage_class: Standard`
- 每月固定核查 `wrangler r2 bucket lifecycle list <bucket>`，确认仅含 multipart-abort、无任何转换规则
- Cloudflare 后台开启 Usage 告警，R2 任何非 $0 计费项立即排查

**验收标准：**

- 所有 bucket `default_storage_class = Standard`
- 所有 bucket lifecycle 仅含 multipart-abort
- 全项目 grep 不到 `InfrequentAccess` / `"images": {` / `ia-transition`
- 所有上传路径 head 判重 + Cache-Control 齐全
- 月度账单 R2 各项均为 $0（免费额度内）

---

## 6. 内容与页面质量

### 6.1 数据完整性

- 每种内容类型必须定义完整字段（由 Zod Schema + Drizzle 模型共同保证）。
- 字段设计需合理、独立，符合业务实际需求。

### 6.2 详情页展示

- 详情页必须完整、清晰地展示所有字段。
- 在 Mobile / Tablet / Desktop 下使用最适合的 svelte-shadcn 组件与布局方式（横向或纵向），充分利用空间。

### 6.3 统一状态处理

- 必须统一处理并设计：
  - Loading 状态
  - Empty 状态
  - Error 状态
- 状态展示需符合 Design System，并在多端一致。

### 6.4 表单与校验

- 所有表单校验统一使用 Zod。
- 前后端校验逻辑保持一致性。

---

## 7. SEO、GEO 与性能标准（极致目标）

### 7.1 SEO 强制清单

前台所有页面必须满足：

- 唯一且描述准确的 `<title>` 与 meta description。
- 正确的 canonical URL。
- 语义化标题层级（h1 唯一，h2/h3 合理）。
- 图片具备有意义的 alt。
- 结构化数据（JSON-LD）在适用页面输出（Article、Breadcrumb、Organization、WebSite 等）。
- 多语言时正确使用 hreflang / 语言替代链接。
- Admin 页面全部 `noindex, nofollow`。
- 禁止故意隐藏内容或关键字堆砌。
- 页面可被正常爬取，关键内容不依赖仅客户端渲染。

### 7.2 GEO（Generative Engine Optimization）要求

- 内容结构清晰，优先回答用户核心问题（答案前置）。
- 重要实体、概念、数据使用明确、可被引用的表述。
- 避免关键信息只存在于图片或脚本中。
- 保持内容新鲜度与事实准确性，便于生成式引擎引用。
- 技术页面与文档类内容使用清晰的小标题与列表，提升可抽取性。

### 7.3 性能与 Google PageSpeed 极致目标

**目标**：在移动端与桌面端均尽可能接近或达到满分，核心指标必须达标。

**硬性指标（Mobile 优先）：**

- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1
- 首屏关键资源优先，非关键资源延迟。
- JS 体积持续受控，禁止无必要的大型依赖。
- 字体、图片、第三方脚本必须按本规则优化，不得成为分数瓶颈。

**强制执行手段：**

- 关键 CSS 内联或优先加载，避免渲染阻塞。
- 非关键 JS 使用 type="module" + defer 或动态导入。
- 第三方脚本必须评估必要性，能删则删，必须加载的使用延迟与隔离策略。
- 动画与毛玻璃严格受 1.4 与性能红线约束。
- 每次重大前端变更后，应使用 PageSpeed Insights 或同等工具验证核心指标。

### 7.4 缓存策略（与成本联动）

- 前端页面根据内容是否动态，合理应用 Cloudflare Workers Cache。
- 在保证 SEO 正确性与用户体验的前提下，最大化缓存命中率，降低源站与数据库压力。
- R2 读取链路配合 `Cache-Control` / ETag / 304，降低 Class B 用量（见 5.12）。
- 静态资源使用长期缓存 + 内容哈希，确保可缓存且可更新。

---

## 8. 可访问性与体验细节

- 基础可访问性（a11y）必须达标（语义化、对比度、焦点管理、键盘操作等）。
- 交互反馈清晰及时。
- 动画时长与缓动需统一使用 Design Token 中定义的值。

---

## 9. 未来扩展（非当前强制实现）

- 未来基于当前网站使用 **Tauri 2.0** 开发桌面 / 移动端 App 时，应最大程度复用现有页面、组件与 Design System。
- Mobile 底部 Tab 的设计需考虑与未来 App 底部导航的一致性。

---

## 10. 执行原则（最高优先级）

1. **一致性优先**：前后台、多端、Light/Dark 保持高度统一。
2. **Token 强制**：任何偏离 Design Token 的代码都视为不合规。
3. **Mobile First**：所有布局与交互优先保证移动端体验。
4. **性能与成本意识**：视觉效果不得以牺牲性能和成本为代价。
5. **组件复用**：优先使用 svelte-shadcn，拒绝重复造轮子；严格遵循「先搜后写」。
6. **数据完整性**：字段完整、展示完整、状态完整。
7. **可维护性**：代码清晰，规则可执行，便于长期迭代。
8. **成本红线**：R2 只用免费额度；Infrequent Access、Image Resizing 等任何付费 R2 特性一律禁止引入（见 5.12）。
9. **结构与命名强制**：必须遵循项目结构与命名约定，禁止随意偏离。
10. **类型安全强制**：禁止 `any`，TypeScript 严格模式不可妥协。
11. **极致优化强制**：D1、Workers、图片、SEO、GEO、PageSpeed 必须按第 5、7 节规则执行，不得以"以后再优化"为由跳过。
