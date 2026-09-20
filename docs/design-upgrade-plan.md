# HalalNeo 设计全方位提升方案（Design Evolution Plan）

> 2026-09-20 基于 `docs/development-rules.md`（权威规则）与 `DESIGN.md`（现行 token）制定。
> 前提：项目暂为英语单语（Paraglide 2.0 架构保留，未来扩展多语言时本方案不冲突）。
> 性质：**规划文档**。每阶段落地时必须同步 DESIGN.md frontmatter（tokens == layout.css）与 compliance-checklist。

## 0. 现状基线（Scan 结论）

已达标、无需动：暖米色 light（hue 88）、深青 dark（hue 205）均非纯白/纯黑；认证绿为唯一主 accent；Almarai + Space Grotesk 双字族；oklch 暖调染影；reveal/enter/float/glow 动效体系；127 个 lucide 图标全部 per-icon import；tabular-nums 已覆盖核心价格/统计；skip-link、404、og:image、空/错/载三态齐备。

**核心诊断**：技术执行优秀，但视觉语言里**缺少一个「只属于清真贸易」的自有符号系统**——紫/玫两个装饰 accent 是最接近"通用后台感"的残留；图标 100% 依赖 lucide 通用库，没有品牌几何基因；认证信任（行业核心资产）没有专属视觉。

## 1. 色彩：light/dark 全面对齐（§1.3）

### 1.1 砍掉 accent-purple / accent-rose（最高优先）

- **问题**：紫与玫红在清真行业视觉语汇中无根基（传统上绿=合法/清真，金=尊贵，白=洁净），且违反"单一 accent"原则；当前散布于 stat-tile tone、region.ts 区块 chips、首页 tool/quick-link 卡片。
- **方案**：新增两个**家族内**语义 token 替补（色相与品牌同域）：
  - `--teal`（次级信息）：light `oklch(0.5 0.12 185)` / dark `oklch(0.72 0.12 185)`——承自现 chart-2，作 region/工具卡的区分色
  - `--gold`（尊贵/亮点）：light `oklch(0.6 0.11 80)` / dark `oklch(0.78 0.13 84)`——承自 chart-4，仅用于认证 seal、评分、特色徽记，**不做大面积**
- **替换映射**：purple→teal 或 info；rose→gold 或 warn；stat-tile Tone 类型同步收敛
- **验收**：grep `accent-purple|accent-rose` 全库 0 命中（token 从 @theme 一并移除）

### 1.2 dark 温度微调（低风险微调，非重做）

- dark 画布 hue 205 与 light 米色 hue 88 温差大，但深青+亮绿本身成立，**不做色相迁移**；仅两处对齐：
  - `--chart-3`（hue 227 偏蓝）降为 205 与画布同温
  - dark `--muted-foreground` 已 9.2:1 达标，维持
- **验收**：改动后跑 WCAG 对比度脚本复核全部文本/背景对（§3.5 AA）

## 2. 品牌几何符号系统（新设，替代阿文水印方案）

单语前提下，行业身份改由**几何语言**承载——八角星（rub el hizb，清真认证标志通用形）作为唯一品牌母题：

### 2.1 `site/mark.svelte`（新组件）

- 纯 SVG：八角星 + 中心留白，`stroke="currentColor"` 全 token 化，`size-*` 控制尺寸
- 三个变体：`outline`（侧栏/logo 徽记）、`solid`（认证 seal 内核）、`pattern`（见 2.3）
- 单一 path 常量收敛在组件内，禁止各页复制

### 2.2 `site/certification-seal.svelte`（新组件，信任视觉）

- 圆环 + 八角星 + 发证机构缩写；`status` 映射：certified=`--success`/primary、pending=`--warn`、expired=`--destructive`
- hover（desktop）：展开机构全名 + scope（Popover 或 title+CSS，不用 JS 库）
- 接入点：supplier/product 详情头、trust-badges 内部升级、verify 结果页
- 约束：零 backdrop-blur、动效仅 `duration-slow` 的 stroke-dashoffset/opacity

### 2.3 `pattern-girih` 纹理 token（layout.css）

- 八角星网格 SVG data-URI，`background-image` 实现（零 JS、零 GPU、无 blur）
- 透明度：light `4%` / dark `6%`（token：`--pattern-opacity`）
- **允许落点白名单**：hero 容器、footer 顶带、admin/supplier sidebar header、登录注册卡、404 页；**禁止**：列表卡片网格、表格、弹窗（§1.4 红线同款纪律）
- dark 模式 pattern 色用 `--on-dark` 派生，随主题自动切换

## 3. 图标体系升级（127 个 lucide 之上）

1. **品类图标语义升格**（icon.svelte 映射表）：清真行业品类不该全用通用食物图标——肉类→`Beef`+认证徽角标、乳品→`Milk`+十字盾等；实现方式：icon.svelte 支持 `verified` 布尔 prop，verified 时叠加 6px 八角星角标（右上角，`--success` 色），普通浏览无感知、认证供应商列表立刻可辨识
2. **图标风格纪律成文**（写入 DESIGN.md）：线性 stroke 2、圆帽端点、不做双色填充；禁止混用 fill 图标
3. **空状态品牌化**：Empty 组件图标位升级为 `mark.svelte` `pattern` 变体（低透明度大号八角星 + 前景 lucide 图标居中）——空状态从"通用"变"品牌"
4. **favicon / og:image**：以 mark.svelte 同款 path 生成静态 favicon set + 1200×630 默认 OG 图（认证绿底 + girih 纹 + 八角星 + wordmark），构建期一次性生成放 `/static`（非 R2，避免无谓 Class B）

## 4. 排版与数字（§1.2 / §3 微收尾）

- hero display 尝试 700 字重 + `letter-spacing -0.025em`（Space Grotesk 可变字重 400-700 已加载，零成本）；A/B 观感后定稿
- `text-wrap: balance` 用于所有 h1/h2（一行 utility 收尾）；`text-wrap: pretty` 用于正文段落
- tabular-nums 收尾扫描：认证有效期、trade-show 日期、RFQ 报价列
- 全大写标签维持现状（已克制）；不引入衬线（行业调性偏商务信任，无衬线正确）

## 5. 动效编排（§1.4 / §3.3 红线内）

- 首页 section 级 `--enter-delay` stagger（0/60/120/180ms），reveal 已支持，只补编排不新增机制
- 卡片 hover 统一规格：`shadow-md→shadow-lg + -translate-y-0.5`，`duration-base + ease-spring`；grep 现有 hover 残留的 magic number 一次性清洗
- **禁增**：视差、smooth-scroll 库、scroll-driven 大动画（违反性能红线与移动端纪律）

## 6. Admin / 三门户（§4.2 效率优先内做品牌）

- sidebar header logo 旁加 `mark.svelte outline` 徽记（size-5，`text-sidebar-primary`）——密度零损失
- collapsible-section 折叠箭头→旋转 90° spring（ease-spring），三门户统一
- 表格密度、布局不动

## 7. 实施批次与验证（每批独立 commit + docs sync）

| 批次 | 内容 | 文件面 | 验证 |
|---|---|---|---|
| B1 | ✅ **已完成 2026-09-20**：§1.1 token 替换（teal/gold 进 layout.css + DESIGN.md，purple/rose 移除，chart-2/4/5 同步收敛品牌色族）+ 使用点全量替换（stat-tile、region.ts、tile-colors.ts、首页/about/products/suppliers/tools/trade-shows/supplier/market-guides/admin-kb） | layout.css、DESIGN.md、stat-tile、region.ts、tile-colors.ts、12 个页面 | 红线 grep 0；svelte-check |
| B2 | ✅ **已完成 2026-09-20**：§2 mark.svelte（rub el hizb 三变体）+ pattern-girih token（`--pattern-opacity` 0.04/0.06，mask 纹理）+ 白名单落点 7 处（hero、footer、admin/supplier sidebar 品牌条、login、register、404） | layout.css、site/mark.svelte、6 个页面容器 | blur 红线 grep 0 新增；白名单外 0 使用；computed CSS 实测 mask/opacity 生效；light/dark 截图复核 |
| B3 | §2.2 certification-seal + §3.1 verified 角标 | trust-badges、详情头 3 处 | 真实认证数据回归 |
| B4 | §3.3/3.4 空状态 + favicon/OG 生成 | empty 状态组件、static/ | og 抓取预览 |
| B5 | §4 排版 + §5 动效 + §6 admin 徽记 | 零散小改 | PSI 抽查 |
| B6 | §9.2 逻辑属性迁移（存量 pl/pr、left/right、text-left/right → ps/pe/start/end/text-start） | header/mobile-tab/footer/breadcrumb/表单/详情头优先 | `dir="rtl"` devtools 冒烟不断版；svelte-check |

**每批完成后**：`pnpm run check`（0/0 门槛）+ 红线 grep（R2/色板/any/blur）+ DESIGN.md frontmatter 逐值比对 + 本文档勾销对应批次。

## 8. 文化适配红线（Halal / Muslim 群体合规，强制）

> 原则：**尊重且专业**。平台是清真贸易的商业工具，不是宗教宣介——既不冒犯，也不消费宗教符号。

### 8.1 审计结果（2026-09-20 全库扫描）

- ✅ 敏感品类内容（pork/alcohol/gelatin 等）全部存在于 glossary/KB/分类描述中，均为**定义与合规教育**语境——这正是行业平台的正确姿态，保留
- ✅ 无任何装饰性/推广性的 haram 元素（无酒瓶图、无猪肉类图标、无赌场意象）
- ✅ 图标全部为通用中性 lucide（utensils/drumstick/milk 等），无宗教符号滥用
- ✅ 绿色（主 accent）在伊斯兰视觉语境中为积极色（合法/清真），金=尊贵，白=洁净——色彩方向天然正确

### 8.2 强制红线（新增/未来变更均受约束）

1. **宗教符号不作 UI 装饰**：新月、清真寺、宣礼塔、古兰经文（含书法体 bismillah）一律不作为图标/插画/水印/加载动画。几何纹样（八角星/girih）是安全的行业母题——它是艺术传统而非宗教符号
2. **认证 seal 不模仿任何真实发证机构标志**（JAKIM/MUI/HFA 等均为注册商标）；机构名只以文本呈现
3. **图像内容审查**：分类/国家/供应商封面图不得出现酒类、猪肉制品、赌场等意象；用工厂、作物、市集、港口场景表达行业（`COUNTRY_IMAGES`、分类图库按此复核）
4. **haram 内容只以合规语境出现**：glossary/KB/检测工具中的引用须保持"定义 + 如何避免/验证"框架，禁止在营销文案、空状态插画、示例数据中把 haram 品类当作"正常商品"陈列（如示例 RFQ/产品 seed 数据不得含酒类/猪肉条目）
5. **称谓与文案**：使用 industry-standard 术语（halal-certified、Zabiha 可选注释、haram 定义引用 Arabic 原词时附英文），避免布道式语气；节日营销（Eid 等）仅作问候、不做促销噱头
6. **数字与日期**：Gregorian 历为主；未来面向 GCC 用户可评估 Hijri 对照显示（仅展示层，不进 schema）

## 9. 多语言 / RTL 就绪（未来阿语等，强制）

### 9.1 已就绪 ✅

- `app.html`：`lang="%paraglide.lang%" dir="%paraglide.dir%"`——Paraglide 驱动的 RTL 切换链路已存在
- Paraglide 2.0 `strategy: ['url', 'cookie', 'baseLocale']` + URL 策略，新增 locale 零架构改动
- 字体栈已双保险：阿语场景 `--font-heading` 自动降级 Almarai（Space Grotesk 无阿拉伯字形），无需新增字体加载
- 语义色/布局 token 与语言无关

### 9.2 缺口与迁移策略（CSS 物理属性 → 逻辑属性）

2026-09-20 实测：`pl/pr` 84 处、`left/right` 92 处、`text-left/right` 79 处，逻辑属性仅 1 处——**RTL 一开即碎的存量**。

**规则即刻生效**（新增代码部分）：
- 间距用 `ps-*/pe-*/ms-*/me-*`，定位用 `start-*/end-*`，对齐用 `text-start/text-end`、`items-start/end`、`justify-start/end`、`rounded-s*/e*`，边框用 `border-s/e`
- 绝对定位装饰性元素优先 `inset-inline-*`；镜像敏感的图标（箭头/分享/返回）用 `rtl:rotate-180`（Tailwind v4 内建 `rtl:` variant，由 `dir` 驱动）
- **例外白名单**：物理方向语义正确的场景保留 left/right（如 slider 轨道、地图标注、`background-position` 与方向无关的值）

**存量迁移**：按批次进行（B6），优先级 = 用户路径高频组件（header/mobile-tab/footer/breadcrumb/表单/详情头）→ 列表卡 → 长尾页面；每批迁移后用 `dir="rtl"` 手动冒烟（devtools 强制切 dir）验证不断版。

**验收**：阿语 locale 接入演练 = 新增 paraglide locale 配置 + 任一高流量页手动 dir 切换无布局错乱（文本可不译，结构必须不破）。

### 9.3 未来语言扩展清单（届时执行，现在不做的部分）

- 新 locale 的 messages 目录 + paraglide 编译（架构已就绪）
- Almarai 补充阿拉伯子集 `unicode-range`（当前刻意不限定——见 checklist §1.2，已天然支持）
- hreflang 输出（seo-meta.svelte 扩展）、sitemap 多语言条目
- 数字/货币格式化走 `Intl`（现有价格渲染处收口到统一 formatter）

