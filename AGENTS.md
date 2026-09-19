## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, sveltekit-adapter, better-auth, drizzle, ai-tools
- **UI 组件纪律**: 所有 UI 原语（button、input、select、textarea、dialog、card、badge、table 等）必须来自 shadcn-svelte `src/lib/components/ui/`。禁止手写原语组件。页面组合级业务逻辑组件允许手写，但其内部 UI 原语必须来自 `ui/`。新增组件先 `pnpm dlx shadcn-svelte add <component>`。主题定制只动 `layout.css` CSS 变量，不动 `ui/` 组件内部。
- **共享站点组件**（`src/lib/components/site/`，优先复用，禁止在页面里重写）：`stat-tile`（统计瓦片）、`filter-pills`（ToggleGroup 筛选）、`collapsible-section`（后台折叠区）、`share-buttons`（分享）、`related-links`（相关链接卡）、`guide-hero`（指南缺图兜底）、`confirm-dialog`（危险操作确认，替代 window.confirm）、`account-nav` / `admin-sidebar` / `supplier-sidebar`（三门户导航）。
- **共享数据/工具**（优先复用）：`#lib/utils/tile-colors.js`（TILE_COLORS）、`#lib/utils/mandate.js`（MANDATE_STATUSES）、`#lib/utils/region.js`（getRegion）、`#lib/utils/forms.ts`（表单错误：`mergeServerDetails` + `focusFirstInvalid`，所有新表单必须复用，禁止手写错误映射）、`#lib/data/country-images.js`（COUNTRY_IMAGES）、`#lib/data/recognition.ts`（RECOGNITION_DATA + status helpers）、`#lib/data/navigation.ts`（全站导航唯一源）。
- **色板禁令**：禁止 Tailwind 原生色板（`green-*`/`emerald-*`/`slate-*`/`gray-*`/`zinc-*` 等）与十六进制硬编码；语义色一律走 tokens（`success`/`info`/`warn`/`destructive`/`primary`），`app.html` 的 `theme-color` 必须与 light/dark `--background` 同步。
- **表单纪律**（§3.4）：客户端 Zod 校验 + 字段下方 `FieldError` + 提交失败聚焦首个错误字段（`focusFirstInvalid`）；server 400 形状为 `{ error, details: { field: [message] } }`；提交按钮 disabled 防重；失败不清空用户输入。
- **动效纪律**：滚动显现只用 `reveal` attach（`layout.css` 的 `.reveal/.in`）；入场用 `.animate-enter` + `--enter-delay` stagger；装饰浮动用 `.animate-float` / `.animate-glow`；只许 opacity/transform（GPU 属性），backdrop-blur 仅用于 header/浮层/hero，禁止下放到列表卡片网格。`prefers-reduced-motion` 已全局兜底。
- **内容规范**：KB/blog 正文存 Markdown（渲染器转 HTML + 自动 TOC；禁止存裸 HTML）。新增市场指南必须同步：`COUNTRY_IMAGES`（无图用 GuideHero 兜底）、`RECOGNITION_DATA`（如涉及新认证机构）、sitemap 自动覆盖（DB 驱动）。市场指南 `status` 用 `'active'`（seed 约定）。
- **响应式/排版原则**（mobile 优先紧凑，2026-09 落定）：
  - 断点：base（<640 mobile）/ sm（≥640 tablet）/ lg（≥1024 desktop），xl 仅用于 4 列大屏。
  - 列表网格 mobile 一律 ≥2 列（`grid-cols-2` 起步），卡片图用小比例（`aspect-[16/10]` 或更小），mobile 藏次要描述（`hidden sm:block`）、标题 truncate、padding 降档（p-2.5 vs sm:p-4）。
  - 详情页 mobile 单列堆叠、桌面双栏（主内容 + sticky 侧栏）；容器 `max-w-6xl` 起步，禁止无故 `max-w-4xl` 留白。
  - 字号：标签 10-11px、正文 12-14px；mobile 禁止 text-base 以上装饰性大字（hero 标题除外）。
  - 间距：section 间 `space-y-4`（mobile）/`space-y-6`（sm+）；卡片内 `p-3`/`p-4`；网格 gap-2/gap-3。
  - 所有列表页必须分页：用共享 `site/paginator.svelte`（`bind:page` + `totalPages`），PAGE_SIZE 按网格列数取（2/3/4 列对应 8/9/12），筛选变化时 `$effect` 重置 page=1；只有 1 页时组件自动隐藏。
- **数据层纪律**：列表 API 必须 limit（上限 100）+ 列投影；结果依赖 query 参数的接口必须传显式 `cacheKey: queryCacheKey(url)`（path-only 键会污染所有筛选组合）；WHERE 列必须有 D1 索引覆盖；`LIKE '%x%'` 全表扫仅允许小表（<500 行），否则上 FTS。
- **文档同步纪律**（CONTEXT.md / DESIGN.md / 日历必须随时最新）：
  - 发布内容（blog/指南/KB/词条/认证机构）后 → 同步 `docs/content-calendar.md` 盘点表。
  - 改动组件/动效/色板/排版后 → 同步 `DESIGN.md` 对应章节（frontmatter tokens 必须 == `layout.css` 实际值）。
  - 新增路由/API/表后 → 同步 `CONTEXT.md` 路由表/API 表/schema 表。
  - 以上全部进同一 commit（`docs(sync)` 可单独成 commit），禁止"代码走了文档没走"。

---

> 项目开发规则权威全文见 `docs/development-rules.md`（含验收标准与红线细节）；本文件为同构摘要，冲突时以该文件为准。
> 逐条落地核对表见 `docs/compliance-checklist.md`：任何条款修复/验证后必须更新该表状态与证据；最终验收以清单全 ✅/➖ + 红线 grep 复跑为准。

## 1. 设计系统（Design System）

### 1.1 Design Token（强制）
- 必须建立完整的 Design Token 体系，并通过 **CSS Variables + Tailwind 映射** 落地。
- Token 至少覆盖以下类别：颜色（背景、前景、主色、辅助色、边框、成功/警告/错误/信息）、字体（family、size、weight、line-height、letter-spacing）、圆角（radius）、阴影（shadow）、间距（spacing）、毛玻璃/透明度（glass/opacity）、动画（duration、easing）、断点（screens）。
- **禁止**在组件中硬编码颜色、字号、间距、圆角、阴影等值。
- 所有页面（前台 + 后台）必须严格遵循 Design Token。

### 1.2 字体规范
- 使用无衬线字体（Sans-serif）。Heading 与 Body 字体需根据项目气质精心选择，**禁止**使用 Inter、Roboto、Arial、系统默认字体堆栈作为主字体。
- 必须考虑不同语言的混排效果（如果有）、加载性能、可变字体支持及合理的 fallback。
- 字体加载需符合性能最佳实践（preload / font-display 等）。
- **极致要求**：仅加载实际使用的字重与字符子集（unicode-range/子集化）；`font-display: swap|optional` 避免 FOIT；关键字体必须 preload、非关键延迟加载；禁止关键渲染路径同步加载大字体。

### 1.3 颜色与主题
- **Light 模式**：非纯白，层次清晰，视觉舒适。**Dark 模式**：非纯黑，对比度达标。
- 所有组件在 Light / Dark 下均需完美适配。
- 前后台必须支持一键切换 Light / Dark，并保持视觉一致性。
- Theme 切换图标：前台 Header 右侧；后台 Sidebar 底部固定区域。

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
- 结构统一：左侧 Logo；中间 Nav Items（仅限 Desktop 和 Tablet）；右侧 Theme 切换图标 + Account 图标。
- Header 在所有前台页面保持一致。

### 2.4 Footer
- 尽量紧凑，减少不必要的 padding 与 margin。版权信息区域进一步压缩。
- Mobile 端可考虑弱化或移除 Footer，原有链接通过底部 Tab 或侧边导航承接。

### 2.5 Mobile 底部 Tab（Sticky Tab）
- Mobile 端增加底部 Sticky Tab，用于承载高频导航，部分替代 Header 中的链接。
- 规格要求：宽度约为浏览器可视宽度的 80%-90%；水平居中；与底部保持较小间距；按钮四周圆角；具备透明感与过渡动画。
- Header 仍然保留（Logo + Theme + Account）。
- 此 Tab 设计需为未来 Tauri 2.0 App 底部导航预留一致性。

### 2.6 空间利用率（Space Utilization）
- **Mobile 优先考虑信息密度**：在保证可读性与可点击性的前提下，尽量提高单位屏幕的信息承载效率。
- 横向与纵向空间均需被有意识地使用，而不是简单把桌面布局缩小。
- 不同断点采用不同的空间策略，而非同一套布局的简单缩放。
- 优先使用 svelte-shadcn 中有利于空间利用的组件：Card、Tabs、Accordion、Collapsible、Sheet、Drawer、Table、HoverCard、Popover 等。
- 详情页字段展示必须根据内容类型选择最佳呈现方式（定义列表、键值对网格、分节卡片、横向标签 + 纵向内容等），禁止所有字段简单垂直罗列造成浪费。
- 控制 section 之间的间距，避免过大的 margin/padding 导致页面松散。
- Mobile 端横向滑动组件（强制鼓励使用）：分类入口、推荐内容、图片集、标签、小型数据卡片组等场景必须优先考虑横向可滑动。要求：明显的可滑动视觉提示、流畅触摸惯性、不与垂直滚动冲突、Tablet/Desktop 自动降级为网格。
- **禁止事项**：禁止为了"好看"而在 Mobile 端制造大量无意义留白；禁止桌面端两侧出现明显的空旷感；禁止所有断点使用完全相同的单列布局。

---

## 3. UI/UX 交互与体验规范

### 3.1 统一状态反馈（强制）
- **Loading 状态**：优先使用 Skeleton 骨架屏，禁止只用简单的转圈 Loading。
- **Empty 状态**：必须有明确的空状态插画/图标 + 文案 + 引导操作。
- **Error 状态**：必须有错误提示 + 重试按钮，网络错误与业务错误需区分展示。
- 以上状态组件必须基于 Design Token 开发，并在 Light/Dark 模式下表现一致。

### 3.2 操作反馈
- 所有写操作必须给予即时反馈。统一使用 Toast 作为轻量反馈，重要操作使用 AlertDialog 进行二次确认。
- Toast 需区分 success / error / warning / info 四种类型。
- 禁止使用浏览器原生 alert / confirm。

### 3.3 微交互与反馈
- 所有可点击元素必须具备明确的 hover、active、focus 状态。
- 过渡动画统一使用 Design Token 中定义的 duration 与 easing。
- 交互反馈应迅速、克制，不能为了动效而牺牲响应速度。

### 3.4 表单体验规范
- 表单布局在 Mobile 下优先单列，Tablet/Desktop 可使用多列。
- 校验错误提示必须出现在对应字段下方，并在提交失败时自动聚焦到第一个错误字段。
- 提交过程中按钮需进入 Loading 状态并防止重复提交。
- 长表单应合理分组，必要时使用 Steps 或 Anchor 导航。
- 所有表单校验统一使用 Zod，前后端校验逻辑保持一致。

### 3.5 无障碍（a11y）基础要求
- 必须使用语义化标签。所有图标按钮必须带有可访问名称（aria-label 或 sr-only 文本）。
- 焦点状态必须清晰可见。文字与背景对比度需达到 WCAG AA 标准。
- 关键功能必须支持键盘操作。

### 3.6 通用交互原则
- 点击热区在 Mobile 下不小于 44x44px。
- 重要操作应有防误触设计（二次确认或 Undo）。
- 任何会阻塞用户操作的过程，都必须有明确的视觉反馈。

---

## 4. 前后台差异化规范

### 4.1 前台
- 完整支持 Light / Dark。严格遵循 SEO 与 GEO 最佳实践。
- 根据页面内容动态性合理使用 Cloudflare Workers Cache。
- 图片在上传前必须进行质量可控的压缩和转换，降低 R2 存储与带宽成本。

### 4.2 后台 / Admin
- Sidebar 高度固定。底部固定区域必须包含：当前登录用户名称、Email、Theme 切换图标、返回首页图标、退出登录图标。
- Admin 子页面高度固定，内容超出时在容器内部滚动（overflow-y-auto）。
- 所有 Admin 页面必须设置 `noindex, nofollow`。
- 后台与前台保持同一套 Design Token 与视觉语言，但布局以效率优先。

---

## 5. 技术栈与工程规范

### 5.1 核心技术栈
- SvelteKit（当前目标版本：3.x）、svelte-shadcn（最大化复用，禁止手写基础 UI 组件）、Tailwind CSS、Zod、Better Auth、Drizzle ORM、Cloudflare D1、Cloudflare R2（仅免费额度，见 5.12）、Mastra.ai、Lucide for Svelte、ParaglideJS。

### 5.2 项目结构与文件组织（强制）
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
- 组件文件：PascalCase；工具/普通模块：kebab-case；路由文件：严格 SvelteKit 约定。
- 变量/函数 camelCase；类型/接口/Zod Schema PascalCase。
- 数据库表/字段 snake_case，表名统一复数。
- CSS/Design Token kebab-case，与 Tailwind 映射一致。
- **禁止**：拼音命名、无意义缩写、单字母变量（循环除外）、混用命名风格。

### 5.4 TypeScript 与代码质量强制规则
- 项目必须使用 **TypeScript 6**（SvelteKit 3 最低要求）。
- 严格禁止 `any`，必须 `unknown` + 类型守卫或精确类型。
- 所有函数（尤其 server load、form actions、API handlers）必须显式标注返回类型。
- 优先 `satisfies`、`as const`、discriminated unions。
- `tsconfig` 必须继承 `$app/tsconfig` 并开启严格选项。
- 禁止客户端导入仅服务端模块（目录约定 + 构建时检查双保障）。
- 提交前必须通过类型检查，类型错误视为阻断问题。

### 5.5 组件使用与复用原则（强制）
- 基础 UI 组件必须使用 svelte-shadcn，**禁止手写** Button、Input、Dialog、Card、Table 等。
- 业务组件可封装，但样式必须完全基于 Design Token。
- **先搜后写**：新建组件前必须检查 `src/lib/components` 是否已有可复用/可扩展组件；优先组合现有组件；仅扩展成本明显高于新建时才允许新组件。

### 5.6 AI 协作工作方式（强制）
1. **先阅读再修改**：修改前必须查看相关现有文件与约定，禁止凭空假设项目结构。
2. **最小改动原则**：只做任务所需最小变更，禁止未经要求的大规模重构。
3. **自检清单**：生成/修改代码后自检——是否硬编码颜色/间距/字号/圆角/阴影？是否处理 Loading/Empty/Error？是否符合 Mobile First 与 Design Token？是否用 `#lib` 正确导入？是否引入 R2 付费特性？是否符合 D1/Workers/图片优化规则？
4. 修改说明中必须简要说明改动如何符合本规则文档关键要求。

### 5.7 版本与 API
- 依赖在兼容前提下保持较新稳定版本；严格使用官方最新推荐 API 与最佳实践。

### 5.8 本地开发与测试
- 必须支持本地完整模拟 Cloudflare Workers 环境（miniflare/@cloudflare/vite-plugin），实现前后端联调与真实测试。

### 5.9 D1 极致成本与性能优化（强制）
1. 禁止全表扫描：列表查询必须带有效 WHERE 或 LIMIT，相关字段必须有索引。
2. 强制索引：高频过滤/排序/关联字段必须建索引；新查询前评估索引。
3. 禁止 SELECT *：只查业务真正需要的字段（列投影）。
4. 分页强制：所有多记录列表接口必须分页，上限 100。
5. 杜绝 N+1：关联数据用 JOIN 或批量查询，禁止循环内逐条查询。
6. 参数化查询：禁止拼接 SQL（Drizzle 默认支持）。
7. 批量优先：写入/更新用 batch 或事务。
8. 高频只读优先缓存（Workers Cache / 内存）。
9. 依赖 query 参数的接口必须传显式 `cacheKey: queryCacheKey(url)`；`LIKE '%x%'` 仅允许 <500 行小表，否则上 FTS。

### 5.10 Workers 极致成本与性能优化（强制）
1. 缓存优先：可缓存响应必须设置合理 `Cache-Control` / `s-maxage` / `stale-while-revalidate`。
2. 最小化子请求：D1/R2/外部 API 调用次数克制，能合并则合并。
3. 早期返回：鉴权失败、参数错误、缓存命中尽早 return。
4. 禁止重计算：Worker 内禁止复杂计算/图片处理，前移到构建时或客户端。
5. 流式与按需：大响应流式返回，非关键数据延迟加载。
6. 冷启动友好：模块顶层禁止 I/O 与重初始化。
7. 所有外部调用必须有超时与降级策略。
8. 可观测性：关键路径可统计缓存命中率与 D1/R2 调用次数。

### 5.11 图片与静态资源极致优化（强制）
- 上传前必须压缩并转 WebP（或更优格式），禁止原图直传 R2。
- 响应式图片提供 `srcset`/`sizes`；首屏图高优先级（fetchpriority/preload），非首屏必须 lazy。
- 所有 R2 静态资源带长期 `Cache-Control`（见 5.12）。
- **禁止**使用 Cloudflare Image Resizing 等付费能力。

### 5.12 R2 免费额度守护（强制 · 成本红线）
历史上误配 IA 转换规则曾产生 $9.92 意外账单（IA 无免费额度），本节优先级等同功能正确性。

**免费额度基准（月度）**：存储 10GB；Class A（Put/Copy/List）100 万次；Class B（Get/Head）1000 万次；出口流量免费。

**严禁事项（红线）：**
- ❌ 任何 R2 lifecycle 存储类转换规则（transition to IA 等）
- ❌ 代码中显式 `storageClass: "InfrequentAccess"`
- ❌ `wrangler.jsonc` 中配置 `"images": {}`（Image Resizing 计费）
- ❌ Smart Tiering 或任何自动分层存储
- ❌ 自定义域 + Image Resizing 组合付费链路
- ❌ 保留无项目引用的孤儿 bucket
- ❌ 保留任何能重新启用上述付费特性的脚本/配置/模板

**允许事项：**
- ✅ `default_storage_class` 保持 `Standard`（不得修改）
- ✅ 仅保留默认 multipart-abort lifecycle 规则（7 天）
- ✅ Worker 代理读 R2 + 强 Cache-Control 降低 Class B
- ✅ 图片上传前压缩/转 WebP

**代码级强制要求：**
1. 上传判重：`put` 前必须先 `head` 判重。
2. 缓存元数据：所有 `put` 必须写 `httpMetadata.cacheControl`（静态资源 `public, max-age=31536000, immutable`）。
3. 读路由：必须实现 ETag / 304 / Range 按需返回。
4. 批量脚本（audit/reconcile/backfill）默认 dry-run，`apply` 必须显式传参。
5. 新增依赖/脚本/生成配置不得引入严禁事项任何项。

**验收**：全项目 grep 不到 `InfrequentAccess` / `"images": {` / `ia-transition`；所有上传路径 head 判重 + Cache-Control 齐全；月度账单 R2 各项 $0。

---

## 6. 内容与页面质量

### 6.1 数据完整性
- 每种内容类型必须定义完整字段（由 Zod Schema + Drizzle 模型共同保证）。
- 字段设计需合理、独立，符合业务实际需求。

### 6.2 详情页展示
- 详情页必须完整、清晰地展示所有字段。
- 在 Mobile / Tablet / Desktop 下使用最适合的布局方式，充分利用空间。

### 6.3 统一状态处理
- 必须统一处理 Loading / Empty / Error 状态，状态展示需符合 Design System，并在多端一致。

### 6.4 表单与校验
- 所有表单校验统一使用 Zod。前后端校验逻辑保持一致性。

---

## 7. SEO、GEO 与性能标准

### 7.1 SEO 强制清单（前台所有页面）
- 唯一且描述准确的 `<title>` 与 meta description；正确的 canonical URL。
- 语义化标题层级（h1 唯一，h2/h3 合理）；图片具备有意义的 alt。
- 适用页面输出结构化数据 JSON-LD（Article、Breadcrumb、Organization、WebSite 等）。
- 多语言正确使用 hreflang / 语言替代链接；Admin 页面全部 `noindex, nofollow`。
- 禁止故意隐藏内容与关键词堆砌；关键内容不得仅依赖客户端渲染。

### 7.2 GEO（Generative Engine Optimization）
- 答案前置，内容结构清晰；重要实体/数据使用明确、可被引用的表述。
- 避免关键信息只存在于图片或脚本中；保持内容新鲜度与事实准确性。
- 技术/文档类内容使用清晰小标题与列表，提升可抽取性。

### 7.3 性能硬性指标（Mobile 优先）
- LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1；首屏关键资源优先，非关键资源延迟。
- JS 体积持续受控，禁止无必要大型依赖；字体/图片/第三方脚本不得成为分数瓶颈。
- 关键 CSS 内联或优先加载；非关键 JS 用 module+defer/动态导入；第三方脚本能删则删，必须加载的用延迟与隔离策略。
- 动画与毛玻璃严格受 §1.4 性能红线约束；重大前端变更后用 PageSpeed Insights 或同等工具验证。

### 7.4 缓存策略（与成本联动）
- 前端按内容动态性合理应用 Cloudflare Workers Cache，最大化命中率，降低源站与 D1 压力。
- R2 读取链路配合 `Cache-Control` / ETag / 304，降低 Class B 用量（见 5.12）。
- 静态资源长期缓存 + 内容哈希。

---

## 8. 可访问性与体验细节

- 基础可访问性（a11y）必须达标（语义化、对比度、焦点管理、键盘操作等）。
- 交互反馈清晰及时。动画时长与缓动需统一使用 Design Token 中定义的值。

---

## 9. 未来扩展（非当前强制实现）

- 未来基于当前网站使用 **Tauri 2.0** 开发桌面/移动端 App 时，应最大程度复用现有页面、组件与 Design System。
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

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Supports flexible search by title (e.g., "$state", "routing") or file path (e.g., "cli/overview"). Can accept a single section name or an array of sections. Before running this, make sure to analyze the users query, as well as the output from list-sections (which should be called first). Then ask for ALL relevant sections the user might require. For example, if the user asks to build anything interactive, you will need to fetch all relevant runes, and so on. Before calling this tool, try to implement Svelte components using your own knowledge and the `svelte-autofixer` tool, since calling this tool is token intensive.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if it wants a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

## Agent skills

### Issue tracker

Issues and specs for this repo live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
