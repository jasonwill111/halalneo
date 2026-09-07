## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, sveltekit-adapter, better-auth, drizzle, ai-tools
- **UI 组件纪律**: 所有 UI 原语（button、input、select、textarea、dialog、card、badge、table 等）必须来自 shadcn-svelte `src/lib/components/ui/`。禁止手写原语组件。页面组合级业务逻辑组件允许手写，但其内部 UI 原语必须来自 `ui/`。新增组件先 `pnpm dlx shadcn-svelte add <component>`。主题定制只动 `layout.css` CSS 变量，不动 `ui/` 组件内部。
- **共享站点组件**（`src/lib/components/site/`，优先复用，禁止在页面里重写）：`stat-tile`（统计瓦片）、`filter-pills`（ToggleGroup 筛选）、`collapsible-section`（后台折叠区）、`share-buttons`（分享）、`related-links`（相关链接卡）、`guide-hero`（指南缺图兜底）、`account-nav` / `admin-sidebar` / `supplier-sidebar`（三门户导航）。
- **共享数据/工具**（优先复用）：`#lib/utils/tile-colors.js`（TILE_COLORS）、`#lib/utils/mandate.js`（MANDATE_STATUSES）、`#lib/utils/region.js`（getRegion）、`#lib/data/country-images.js`（COUNTRY_IMAGES）、`#lib/data/recognition.ts`（RECOGNITION_DATA + status helpers）、`#lib/data/navigation.ts`（全站导航唯一源）。
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

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

## Agent skills

### Issue tracker

Issues and specs for this repo live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
