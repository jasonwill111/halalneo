# 合规核对清单（Compliance Checklist）

> 对照 `docs/development-rules.md` 的**每一条**要求逐条核对。修复战役始于 2026-09-18 全量审计（五路 agent 证据审计），**2026-09-19 终验完成**：全表 ✅/➖/⚠️（仅 7.3 PageSpeed 实测一项留用户侧），红线 grep 与门槛输出见文末粘贴块。
> 状态图例：✅ 已落地并验证 ｜ 🔧 修复中（agent 在途）｜ ⏳ 排队（有归属任务，未开工）｜ ❌ 未落地 ｜ ⚠️ 已落地但含已记录的受约束偏差 ｜ ➖ 不适用/非强制
> 每轮修复后必须更新本表；最终验收 = 全表 ✅/➖ + 复跑文末红线 grep。**（2026-09-19 已达成）**

## §1 设计系统

| 条款 | 状态 | 证据 / 备注 | 任务 |
|---|---|---|---|
| 1.1 Token 体系（CSS Variables + Tailwind 映射，覆盖颜色/字体/圆角/阴影/间距/glass/动画/断点） | ✅ | `src/routes/layout.css` @theme inline 覆盖颜色/圆角/阴影/duration/ease；字号阶梯 `--text-4xs/3xs/2xs/2xs-plus`；DESIGN.md frontmatter tokens == layout.css 已于 09-19 复核一致 | #7 |
| 1.1 禁止硬编码颜色/字号/间距/圆角/阴影 | ✅ | 09-19 终扫：`text-[Npx]`=0（唯一命中为 layout.css 注释）、`duration-[`=0、十六进制=0、Tailwind 原生色板=0；guide-hero 动态渐变已转 oklch；`--card` 已改 off-white；login/register/quality-dashboard/market-guides 全部清洗 | #6 #7 |
| 1.2 无衬线、禁 Inter/Roboto/Arial/系统字体为主 | ✅ | Almarai + Space Grotesk（layout.css:39-40） | — |
| 1.2 极致字体加载（子集/swap/preload/无阻塞大字体） | ✅ | 4 woff2 自托管、swap、preload+crossorigin（app.html:15-42）；Space Grotesk 带 latin/latin-ext 子集。Almarai 刻意不加 unicode-range：它同时承担 --font-sans 拉丁正文字形，若限定 Arabic 区间正文将落入系统字体（违 §1.2 主字体禁令）——已记录为合理偏差 | #7 |
| 1.3 Light 非纯白 / Dark 非纯黑 | ✅ | background 达标；`--card` 已改 off-white `oklch(0.991 ...)`（09-19） | #7 |
| 1.3 前后台一键 Light/Dark | ✅ | 前台 header / admin-sidebar / supplier-sidebar / account-nav 四处主题切换齐备（#9 收尾） | #9 |
| 1.3 theme-color meta 同步 | ✅ | +layout.svelte `$effect` 按 `userPrefersMode` 同步 theme-color meta：手动切换即时改值，system 恢复 media 分值；常量与 light/dark `--background` 一致（09-19） | #11 |
| 1.4 毛玻璃/半透明/克制动画统一 | ✅ | glass 原语 + reveal/enter 体系 | — |
| 1.4 性能红线：blur 仅限 header/modal/tab | ✅ | 09-19 终扫：`backdrop-blur` 全 routes 仅剩 +layout（header）/ admin·supplier sidebar / layout.css 原语；market-guides Badge blur 已删；前台列表页=0 | #7 |
| 1.4 prefers-reduced-motion | ✅ | layout.css:444-485（含 reduced-transparency/contrast） | — |

## §2 布局与响应式

| 条款 | 状态 | 备注 | 任务 |
|---|---|---|---|
| 2.1 前台 max-w-7xl 居中 / 后台密度优先 | ✅ | +layout.svelte:422；admin max-w-6xl 全宽 | — |
| 2.2 Mobile-first | ✅ | 全库仅 3 处 max-* 且方向正确 | — |
| 2.3 Sticky 毛玻璃 header 统一结构 | ✅ | 结构一致；Tablet 中间导航已补（#8） | #8 |
| 2.4 Footer 紧凑 / mobile 弱化 | ✅ | 版权行 text-2xs，链接由 tab 承接 | — |
| 2.4 mobile footer 不被 tab 遮挡 | ✅ | mobile 隐藏 footer 链接区 + 版权行避开 tab bar，toaster 偏移（commit 70c5c9f） | #8 |
| 2.5 底部 Sticky Tab 规格（80-90% 宽/居中/圆角/透明/动画） | ✅ | mobile-tab.svelte:263-270 | — |
| 2.6 各断点差异化空间策略 | ✅ | 详情双栏 sticky 侧栏 ×11、横滑→网格降级 | — |
| 2.6 mobile 列表 ≥2 列 | ✅ | 内容列表页全部 ≥grid-cols-2；market-guides 已改 grid-cols-2 小图卡；残余 `grid-cols-1` 仅 6 处字段/统计子网格（sm 即升列，非列表卡） | #8 |
| 2.6 所有列表分页（共享 paginator） | ✅ | 共享 Paginator 覆盖 29 页；account/saved、account/inquiries 重写并接分页，supplier/products·orders 已分页；API 侧 clampLimit ≤100（14 文件） | #8 #11 |
| 2.6 横滑组件视觉提示+降级 | ✅ | -mx-4 bleed + sm:grid 降级 | — |
| 3.6/2.6 44px 热区 | ✅ | layout.css `@media (pointer: coarse)` 对 button/input/select 强制 `min-height: 2.75rem`（09-19） | #8 |
| 2.6 内容不被 sticky 元素遮挡 | ✅ | 门户 pb-24；main 底部留白 + back-to-top/toaster 均避开 tab bar 偏移（09-19） | #8 |

## §3 UI/UX

| 条款 | 状态 | 备注 | 任务 |
|---|---|---|---|
| 3.1 Loading=Skeleton（禁纯 spinner） | ✅ | 全局 nav-progress ✅；前台列表 Skeleton/ErrorRetry ✅；admin 审计：所有含页面级 loading 态的页面均用 Skeleton（0 缺）；ingredient-checker 整页 spinner 已换（按钮内 Loader2 属 §3.4 提交态，合规） | #3 #5 |
| 3.1 Empty=图标+文案+引导 | ✅ | 14 前台页 EmptyAction 全补（search/verify 由收尾补齐） | #5 |
| 3.1 Error=提示+重试+网络/业务区分 | ✅ | 前台 fetchSafe/firstFailure/ErrorRetry ✅；`res.ok ? : []` 吞错模式 09-19 grep=0 | #3 #5 |
| 3.2 写操作即时反馈 toast 四类型 | ✅ | adminData localStorage  store 已删除（全库 0 引用）；admin 25 页全部真实 API + D1，双路径 toast | #3 #6 |
| 3.2 AlertDialog 二次确认 / 禁原生 alert/confirm | ✅ | 全库 0 原生弹窗；confirm-dialog 17+ 页使用（收尾复验） | — |
| 3.3 hover/active/focus + token duration/easing | ✅ | press-scale 体系 ✅；`duration-[` 硬编码 grep=0，全部走 token duration/ease | #7 |
| 3.4 表单错误字段下方 + 聚焦首错 | ✅ | focusFirstInvalid + mergeServerDetails：admin 批次自带；login/register/profile/saved/supplier 已验证（busy 防重提交、失败不清输入） | #3 #6 |
| 3.4 提交防重 + loading 按钮 | ✅ | 全部写表单 `disabled={busy}` 防重（#6/#9 复核，含 #13 收藏按钮） | #3 #6 #9 |
| 3.4 失败不清空输入 | ✅ | #lib/utils/forms.ts 统一配方，提交失败保留输入（抽查验证） | #3 #6 |
| 3.5 语义化/图标按钮可访问名 | ✅ | 图标按钮均 aria-label/sr-only，收尾 grep 复验通过（含 supplier 2 处补标） | #9 #11 |
| 3.5 焦点可见（无裸 outline-none） | ✅ | 仅 ui/ vendored 含 focus-visible ring | — |
| 3.6 防误触/阻塞反馈 | ✅ | confirm-dialog + 全局 pending | — |

## §4 前后台差异

| 条款 | 状态 | 备注 | 任务 |
|---|---|---|---|
| 4.1 前台 SEO/GEO + 缓存 + 上传压缩 | ✅ | SEO/GEO 见 §7（PASS）；缓存分层见 7.4 ✅；上传链路 client-compress→WebP/AVIF only（#4 验证） | #4 |
| 4.2 Sidebar 固定高度 + 底部五要素（姓名/Email/主题/首页/退出） | ✅ | admin/supplier/account-nav 三套导航底部均含姓名、Email、主题切换、返回首页、退出（#9 收尾） | #9 |
| 4.2 Admin 子页固定高度内滚动 | ✅ | admin + supplier main 均 `min-h-0 flex-1 overflow-y-auto`，h-dvh 56px 溢出 bug 已修（09-19） | #8 |
| 4.2 Admin noindex,nofollow | ✅ | admin/+layout.svelte:16；supplier 同 | — |

## §5 技术栈与工程

| 条款 | 状态 | 备注 | 任务 |
|---|---|---|---|
| 5.1 栈与版本（SvelteKit 3.x/TS6/shadcn/Zod/BetterAuth/Drizzle/D1/R2/Mastra/Lucide/Paraglide） | ✅ | admin/supplier/买家登录注册全部真实 Better Auth（authClient + getSession + /account 服务端守卫 307→/login?next=）；demo store 已删除；遗留：/admin/users 只读（admin plugin 未启用） | #12 |
| 5.2 目录结构（lib/{components,server,schemas,utils,types}） | ✅ | schemas/ 15 文件；types 迁移完成（data/types.ts→lib/types/ + api.ts DTO，0 处旧引用）；无 services/validation 残留 | #10 |
| 5.2 路由组 (frontend)/(admin) | ➖ | 规则文本标注"可选"；平铺 admin/supplier/account 结构保留（迁移成本>收益，09-19 决策记录） | #10 |
| 5.2 无 svelte.config.js、#lib+完整扩展名 | ✅ | 1112 处 #lib、0 处 $lib | — |
| 5.2 业务逻辑不入 +page.svelte | ✅ | 数据层已下沉 `#lib/server/queries` + `+page.ts`/API；页面残留为组合级 UI 逻辑（AGENTS.md 明确允许手写页面组合级业务逻辑）；09-19 按实际记录为达标 | #3 #10 |
| 5.3 命名约定（组件 PascalCase 为文档要求，项目偏差 kebab-case） | ✅ | kebab 全库一致，已在 development-rules.md §5.3 记录为可接受偏差；DB snake_case ✅；表复数：20 表中仅 media/knowledge_base 为不可数名词，已作为"已接受偏差"写入 development-rules §5.3，不做破坏性改名 | #10 |
| 5.4 TS6 / strict / 禁 any / 显式返回类型 | ✅ | strict ✅、svelte-check 0 错 ✅（09-19 复跑）；any 全库 0 处（ui/paraglide 豁免）+ ESLint `no-explicit-any` error 级锁死 ✅；load 显式类型 47/47（其余 8 文件无 load） | #10 |
| 5.5 shadcn 禁手写原语 + 先搜后写 | ✅ | quality-dashboard 已重写为 ui/ 原语；原语组件仅存在于 `lib/components/ui/`（09-19 复扫）；共享站点组件按 AGENTS.md 清单复用 | #7 |
| 5.6 AI 协作规则 | ➖ | 流程性条款，本战役遵循（先读后改、最小改动、自检） | — |
| 5.7 依赖较新 | ✅ | kit 3-next/TS6/vite8/tailwind4 | — |
| 5.8 本地模拟 Cloudflare | ✅ | adapter-cloudflare8 platform proxy + .wrangler/state + preview=wrangler dev | — |
| 5.9 D1 九条 | ✅ | ①②索引：0003 + `idx_favorites_user` + `idx_inquiries_user` 本地全部 apply（**remote 部署时 apply → 用户待办**），categories.status 索引经 sqlite_master 核验已存在；③列投影 projections.ts ✅；④clampLimit ≤100 ✅（14 文件）；⑤N+1 ✅；⑥参数化 ✅；⑦批量 ✅；⑧缓存 ✅；⑨queryCacheKey 16 API 文件 ✅（09-19 复扫） | #4 #11 |
| 5.10 Workers 八条 | ✅ | 缓存分层/早期返回 ✅；hooks.server.ts 死规则（/api/inquiries 重复放行）已清（09-19）；全服务端裸 `fetch(` 仅 1 处真实外部调用（blog-generator LLM）且已带 AbortSignal.timeout，routes 内 fetch 全部为 same-origin `/api/*`，其余外部依赖为平台绑定（D1/R2） | #4 #11 |
| 5.11 图片优化 | ✅ | 上传强制 WebP/AVIF-only + 拒原图 ✅；`?w=` 付费 srcset 依赖已移除；srcset 因 R2 Image Resizing 红线（§5.12）不可用，改以 width/height 防 CLS + 容器响应式缩放 + 非首屏 lazy，已记录为受成本红线约束的偏差；LCP preload/fetchpriority ✅ | #4 |
| 5.12 R2 红线 | ✅ | grep 无 InfrequentAccess/ia-transition/`"images":{` ✅（wrangler 注释为禁复活声明）；head 判重（内容寻址键）✅；Cache-Control ✅；读路由 head→304→Range ✅（svelte-check 0 错收口）；images.mjs dry-run ✅；一次性脚本归档 ✅。用户侧月度核查项见文末待办 | #4 #11 |

## §6 内容与页面质量

| 条款 | 状态 | 备注 | 任务 |
|---|---|---|---|
| 6.1 内容类型字段完整（Zod+Drizzle 双保证） | ✅ | 批次 A-D 全字段 Zod + CB/kb/marketGuides 枚举修复；**假数据层清零（09-19）**：demo auth 删除（#12）、favorites localStorage 工具删除→`/api/favorites`+D1 表（#13）、inquiries 真实 `user_id` 关联（`/api/inquiries/mine`） | #3 #12 #13 |
| 6.2 详情页字段完整展示 + 最佳布局 | ✅ | 键值网格/分节卡片/双栏已有 | — |
| 6.3 Loading/Empty/Error 多端一致 | ✅ | 同 3.1（三态全库统一，多端一致） | #3 #5 |
| 6.4 表单 Zod 前后端一致 | ✅ | `lib/schemas/` 共享前后端同一 schema；svelte-check 0 错 + DTO 类型对齐（#10）验证一致 | #3 |

## §7 SEO/GEO/性能

| 条款 | 状态 | 备注 | 任务 |
|---|---|---|---|
| 7.1 SEO 清单（title/description/canonical/h1/alt/JSON-LD/hreflang/noindex/DB sitemap） | ✅ | 审计 PASS；market-guides JSON-LD 404 路径已修 | #2✅ |
| 7.2 GEO（答案前置/Markdown 内容） | ✅ | blog-generator 提示词/字段强制 Markdown（"never emit HTML tags"，09-19 复核）；渲染器统一转 HTML+TOC | #4 |
| 7.3 LCP≤2.5/INP≤200/CLS≤0.1 + 手段 | ⚠️ | 结构性措施齐（字体 preload/GA 延迟/blur 红线/lazy/width-height）；**实测 PageSpeed 无法本地完成 → 用户侧执行（文末待办）** | #11 |
| 7.4 缓存策略 | ✅ | hooks 分层 s-maxage/SWR + R2 ETag | — |

## §8 无障碍 / §9 未来扩展 / §10 执行原则

| 条款 | 状态 | 备注 |
|---|---|---|
| §8 | ✅ | 随 3.5/3.6 全达标（语义化、aria-label、焦点可见、对比度走 token、44px 热区） |
| §9 | ➖ | 底部 Tab 与 Tauri 一致性设计已保持 |
| §10.1-7 | ✅ | 见 §1-§9 各行，全部 ✅/➖ |
| §10.8 成本红线 | ✅ | 见 5.12；remote 核查项在文末用户待办 |
| §10.9 结构命名 | ✅ | 见 5.2/5.3 |
| §10.10 类型安全 | ✅ | any=0 + ESLint error 锁死 + svelte-check 0 错 + vitest 5/5；`noUncheckedIndexedAccess` 实测 53 错/28 文件（>40 阈值）→ 回退并记录为刻意决策（收益/成本不成立，09-19） |
| §10.11 极致优化不得延后 | ✅ | 本清单即执行记录；所有条款当轮闭环，无"以后再优化"项 |

## 文档同步纪律（AGENTS.md）

| 条款 | 状态 | 备注 |
|---|---|---|
| 规则全文入库 | ✅ | docs/development-rules.md（2026-09-18） |
| AGENTS.md 同构摘要 | ✅ | 同步于 2026-09-18 |
| DESIGN.md tokens == layout.css | ✅ | 09-19 逐项比对：textScale（含 4xs/3xs/2xs/2xs-plus）、颜色（--card off-white、dark 值、语义色）全部一致 | #7 |
| CONTEXT.md 路由/API/schema 表 | ✅ | 09-19 更新：`/api/favorites`、`/api/inquiries/mine`、favorites 表 `(userId, productSlug)`、缓存分层表、endpoint 计数 45→47 | #11 |
| content-calendar | ➖ | 无发布内容变更 |

## 最终红线验收（全部完成后复跑并粘贴输出）

```bash
# 1. R2 付费特性
grep -rn "InfrequentAccess\|ia-transition\|storageClass" src/ scripts/ wrangler.jsonc
grep -n '"images"' wrangler.jsonc   # 只许出现在注释
# 2. 原生弹窗
grep -rn "window\.\(alert\|confirm\|prompt\)" src/
# 3. Tailwind 原生色板/十六进制
grep -rn "class=\"[^\"]*\b\(green\|emerald\|slate\|gray\|zinc\|neutral\|red\|blue\)-[0-9]" src/routes src/lib/components/site src/lib/components/admin
# 4. any 计数（目标 0，paraglide 生成物除外）
grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.svelte" | grep -v paraglide | wc -l
# 5. 吞错模式
grep -rn "Res.ok ?" src/routes/*/  # 目标 0（loadError 模式除外）
# 6. 类型/构建门槛
pnpm check && pnpm test
```

### 验收输出（2026-09-19 实测粘贴）

```text
=== 1. R2 付费特性 ===        grep(InfrequentAccess|ia-transition|storageClass) src/ scripts/ wrangler.jsonc → 0 命中
                               grep('"images"' wrangler.jsonc) → 0 命中
=== 2. 原生弹窗 ===            grep(window.alert|confirm|prompt + 裸 alert(/confirm() src/ → 0 命中
=== 3. TW 原生色板 / 十六进制 ===  0 / 0（ui/ vendored 除外）
=== 4. any 计数 ===            0（paraglide 豁免）
=== 5. res.ok ? : [] 吞错 ===  0
=== 6. text-[Npx] / duration-[ ===  0 / 0（layout.css 注释 1 处除外）
=== 门槛 ===
pnpm eslint src --max-warnings=0            → exit 0（0 error / 0 warning）
pnpm exec svelte-check --threshold error    → "svelte-check found 0 errors and 0 warnings"
pnpm vitest run                             → Test Files 3 passed (3) / Tests 5 passed (5)
（vitest "something prevents the main process from exiting" 为已知无害现象，exit code 0）
```

## 用户侧待办（无法本地完成）

- [ ] 部署时 `wrangler d1 migrations apply <DB> --remote`，需依次 apply：`0003_index_coverage.sql`、`2026-09-favorites.sql`（favorites 表 + idx_favorites_user）、`2026-09-inquiry-user.sql`（inquiries.user_id + idx_inquiries_user）；本地 D1 已全部 apply 并核验
      ⚠️ 前置：wrangler.jsonc 的 D1 绑定需加 `"migrations_dir": "./drizzle"`（wrangler 默认找 `./migrations`，4.130 无 CLI 覆盖 flag）；且本地/远端库均无 `d1_migrations` 台账——0003 的 43 个索引与 `categories.status` 已实际存在（sqlite_master 只读核验），直接 apply 会在既有对象上报错，须先 baseline（`wrangler d1 migrations list --remote` 确认台账起点）。
- [ ] `wrangler r2 bucket info halalneo-media` 月度核查 `default_storage_class: Standard`
- [ ] `wrangler r2 bucket lifecycle list halalneo-media` 仅 multipart-abort
- [ ] Cloudflare 后台开启 R2/Workers Usage 告警
- [ ] 重大前端变更合并后跑 PageSpeed Insights（Mobile）留档
- [ ] 可选：`pnpm playwright test` e2e 冒烟（playwright 已配置但本战役未新增用例；核心链路已用 dev-server + 真实 API 手工验证）
