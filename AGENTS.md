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

### 1.3 颜色与主题
- **Light 模式**：非纯白，层次清晰，视觉舒适。**Dark 模式**：非纯黑，对比度达标。
- 所有组件在 Light / Dark 下均需完美适配。
- 前后台必须支持一键切换 Light / Dark，并保持视觉一致性。
- Theme 切换图标：前台 Header 右侧；后台 Sidebar 底部固定区域。

### 1.4 视觉风格
- 统一使用毛玻璃（backdrop-blur）、半透明、精致阴影与克制动画。
- 动效必须服务于体验，不得影响交互响应与性能。
- 风格在 Mobile / Tablet / Desktop 以及前台 / 后台之间保持高度一致。

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
SvelteKit / svelte-shadcn / Tailwind CSS / Zod / Better Auth / Drizzle ORM / Cloudflare D1 / Cloudflare R2 / Mastra.ai / Lucide for Svelte / ParaglideJS

### 5.2 组件使用原则
- 基础 UI 组件必须使用 svelte-shadcn，禁止手写。
- 业务组件可自行封装，但样式必须完全基于 Design Token。
- 最大化提高 svelte-shadcn 组件复用率。

### 5.3 成本与性能控制
- 严格控制 D1 查询，避免全表扫描。合理设计索引与查询方式。
- 图片、文件存储最大化压缩，降低 R2 成本。
- Workers 调用与缓存策略需以降低成本为目标进行设计。
- 渲染策略（SSG / SSR + Cache / 动态渲染）必须按页面类型精细划分。

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

### 7.1 SEO / GEO
- 前台所有页面必须按照 SEO 与 GEO 最佳实践进行优化。Admin 页面全部禁止收录。

### 7.2 性能目标
- 以 Google PageSpeed Insights 高分为优化目标。覆盖 Performance、Accessibility、Best Practices、SEO 四项。
- 字体、图片、第三方脚本、动画、毛玻璃等均需以性能为前提进行取舍。

### 7.3 缓存策略
- 前端页面根据内容是否动态，合理应用 Cloudflare Workers Cache。
- 在保证 SEO 正确性与用户体验的前提下，最大化缓存命中率。

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
5. **组件复用**：优先使用 svelte-shadcn，拒绝重复造轮子。
6. **数据完整性**：字段完整、展示完整、状态完整。
7. **可维护性**：代码清晰，规则可执行，便于长期迭代。

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
