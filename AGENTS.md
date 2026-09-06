## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, sveltekit-adapter, better-auth, drizzle, ai-tools
- **UI 组件纪律**: 所有 UI 原语（button、input、select、textarea、dialog、card、badge、table 等）必须来自 shadcn-svelte `src/lib/components/ui/`。禁止手写原语组件。页面组合级业务逻辑组件允许手写，但其内部 UI 原语必须来自 `ui/`。新增组件先 `pnpm dlx shadcn-svelte add <component>`。主题定制只动 `layout.css` CSS 变量，不动 `ui/` 组件内部。
- **共享站点组件**（`src/lib/components/site/`，优先复用，禁止在页面里重写）：`stat-tile`（统计瓦片）、`filter-pills`（ToggleGroup 筛选）、`collapsible-section`（后台折叠区）、`share-buttons`（分享）、`related-links`（相关链接卡）、`guide-hero`（指南缺图兜底）、`account-nav` / `admin-sidebar` / `supplier-sidebar`（三门户导航）。
- **共享数据/工具**（优先复用）：`#lib/utils/tile-colors.js`（TILE_COLORS）、`#lib/utils/mandate.js`（MANDATE_STATUSES）、`#lib/utils/region.js`（getRegion）、`#lib/data/country-images.js`（COUNTRY_IMAGES）、`#lib/data/recognition.ts`（RECOGNITION_DATA + status helpers）、`#lib/data/navigation.ts`（全站导航唯一源）。
- **动效纪律**：滚动显现只用 `reveal` attach（`layout.css` 的 `.reveal/.in`）；入场用 `.animate-enter` + `--enter-delay` stagger；装饰浮动用 `.animate-float` / `.animate-glow`；只许 opacity/transform（GPU 属性），backdrop-blur 仅用于 header/浮层/hero，禁止下放到列表卡片网格。`prefers-reduced-motion` 已全局兜底。
- **内容规范**：KB/blog 正文存 Markdown（渲染器转 HTML + 自动 TOC；禁止存裸 HTML）。新增市场指南必须同步：`COUNTRY_IMAGES`（无图用 GuideHero 兜底）、`RECOGNITION_DATA`（如涉及新认证机构）、sitemap 自动覆盖（DB 驱动）。市场指南 `status` 用 `'active'`（seed 约定）。

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
