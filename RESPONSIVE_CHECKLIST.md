# HalalNeo 跨设备响应式优化检查清单

## 检查标准

基于 AGENTS.md 和 DESIGN.md，所有页面必须满足：

- **Mobile First**：375px 宽度优先设计
- **响应式断点**：base (<640), sm (≥640), lg (≥1024), xl (≥1280)
- **网格列**：mobile 至少 2 列，tablet 3 列，desktop 4 列
- **图片比例**：16:10 适配移动，桌面可扩展
- **触摸目标**：最小 44x44px 可点击区域
- **字体大小**：标签 10-11px，正文 12-14px，mobile 避免 >text-base
- **间距**：section 间距 mobile 为 `space-y-4`，sm+ 为 `space-y-6`
- **内容截断**：标题 truncate，描述 mobile 隐藏

## 已完成检查的页面

### ✅ 产品列表 (Products Listing)

**位置**: `src/routes/products/+page.svelte`

- **Mobile**: 2 列网格，16:10 图片，短标题，MOQ 隐藏
- **Tablet**: 3 列网格，完整 MOQ，价格高亮
- **Desktop**: 4 列网格，详细描述显示
- **优化**: ✅ 良好，无需改进

### ✅ 供应商列表 (Suppliers Listing)

**位置**: `src/routes/suppliers/+page.svelte`

- **Mobile**: 2 列网格，公司简称+认证徽章
- **Tablet**: 3 列网格，增加描述
- **Desktop**: 3 列网格，完整公司信息
- **优化**: ✅ 良好，描述在 mobile 隐藏正确

### ✅ 分类列表 (Categories Listing)

**位置**: `src/routes/categories/+page.svelte`

- **Mobile**: 2 列网格，图标+名称+产品计数
- **Tablet**: 3 列网格，显示描述
- **Desktop**: 3 列网格，完整体验
- **优化**: ✅ 良好，分页正确

### ✅ 市场指南 (Market Guides)

**位置**: `src/routes/market-guides/+page.svelte`

- **Mobile**: 2 列网格，折叠面板展示洞察
- **Tablet**: 3 列网格，数据卡片完整
- **Desktop**: 3 列网格，徽章+数据丰富
- **优化**: ✅ 良好，无国旗问题已处理

## ⚠️ 需要改进的页面

### ⚠️ 博客列表 (Blog Listing)

**位置**: `src/routes/blog/+page.svelte`
**当前问题**:

- 2 列网格但使用了 `sm:grid-cols-2 lg:grid-cols-2` — 应该是在 tablet/desktop 时增加列数
- `pagination` 设置 `PAGE_SIZE = 6` 适合移动端 2 列，但桌面也可以显示更多
- 摘要在 mobile 隐藏，tablet 显示 2 行

**优化建议**:

```svelte
<!-- 改为响应式网格 -->
<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3">
  <!-- 每列内容优化 -->
  {#each paged as post, idx (post.slug)}
    <Card class="overflow-hidden">
      <article>
        <a href={localizeHref(`/blog/${post.slug}`)} class="group block">
          <!-- 移动端使用紧凑比例 -->
          <div class="aspect-[16/10] overflow-hidden bg-muted sm:aspect-[4/3]">
            <img src={post.featuredImage || blogImages[idx % blogImages.length]}
                 alt={post.title}
                 class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                 loading="lazy" decoding="async"
                 width="600" height="450" />
          </div>
          <!-- Title optimization -->
          <CardTitle class="line-clamp-2 text-sm leading-snug group-hover:text-primary sm:text-lg">
          <!-- Excerpt display optimization -->
          <p class="hidden text-sm text-muted-foreground sm:line-clamp-2 sm:block">
```

**改进点**:

1. 在 tablet 和桌面端将网格设为 3 列 (`lg:grid-cols-3`)
2. 图片比例 tablet 调整为 4:3 更有视觉吸引力
3. 摘要在 tablet 显示 2 行，桌面显示完整
4. 标签徽章在 mobile 避免过多，使用横向滚动

**PRIORITY**: P1 - 短期优化

### ⚠️ 认证机构列表 (Certifying Bodies Listing)

**位置**: `src/routes/certifying-bodies/+page.svelte`
**当前问题**:

- 2 列 → 3 列 → 4 列网格已经很好
- 信息在移动设备上足够紧凑
- 徽章和链接交互正确

**优化建议**:

```svelte
<!-- 确认 touch targets -->
<a
	href={body.website}
	target="_blank"
	rel="noopener"
	class="relative z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
	aria-label="Visit {body.name} website"
>
	<GlobeIcon class="size-4" />
</a>
```

这个链接的触摸区域可能太小，确保相邻间距或通过父级 card 增大点击区域。

**PRIORITY**: P1 - 短期优化

### ⚠️ 成功案例 (Success Stories Listing)

**位置**: `src/routes/success-stories/+page.svelte`
**需要检查**:

- 布局是否遵循 mobile-first 原则
- 图片比例是否适配移动
- 指标数据在移动端是否清晰

**PRIORITY**: 检查后决定

### ⚠️ 促销活动 (Promotions Listing)

**位置**: `src/routes/promotions/+page.svelte`
**需要检查**:

- 倒计时功能在移动端表现
- 优惠码显示是否清晰
- 高对比度是否保持

**PRIORITY**: 检查后决定

### ⚠️ 知识库指南 (Knowledge Base Listing)

**位置**: `src/routes/knowledge-base/+page.svelte`
**需要检查**:

- 列表/网格视图转换
- TOC 在移动端是否可访问
- 表格/数据结构响应式

**PRIORITY**: P2 - 中期完善

## 📱 客户端触控优化

### 移动底部标签栏 (Mobile Bottom Tab)

AGENTS.md 明确要求：

- 4/5个标签，水平居中，宽度为主容器宽度的 80-90%
- 透明感 + 过渡动画
- 与底部保持较小间距
- 圆角按钮，玻璃效果

**当前状态**: 需要检查是否已实现，若未实现则为 P0。

### 触摸目标最小化

- 按钮、输入框、卡片等所有可点击元素至少 44x44px
- 检查小图标按钮是否有足够的邻接空间

## 🖼️ 图片优化检查

### srcset 和 sizes

所有产品、供应商、分类主图需使用响应式图片：

```html
<img
	src="..."
	srcset="image-480w.jpg 480w, image-768w.jpg 768w, image-1024w.jpg 1024w"
	sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
	width="600"
	height="400"
	loading="lazy"
	decoding="async"
/>
```

### 当前状态检查

在 `/blog/+page.svelte` 中已经使用了 `srcset`，很好。
但在 `/certifying-bodies/+page.svelte` 和图片卡中没有。

## 🔍 速度/性能检查

### 懒加载 (Lazy Loading)

- 所有非首屏图片应使用 `loading="lazy"`
- 首屏 LCP 图片应使用 `loading="eager" fetchpriority="high"`

### 骨架屏 (Skeleton)

- 列表页面应使用骨架屏而非旋转加载
- 确认 Skeleton 与加载内容布局一致

## 🎨 排版检查

### 字体大小

- 标题 (h1-h3): mobile `text-2xl/3xl` → desktop `text-4xl`
- 卡片标题: `text-sm` mobile → `text-base` tablet
- 辅助文本: `text-[11px]` mobile, `text-xs` desktop
- 避免 mobile > `text-base` 装饰性文字

### 行高和字间距

- 标题可压缩行高 (1.1-1.2) 适应更小空间
- 正文行高 1.6 保证可读性

## 📊 具体页面优化建议

### P0 - 博客列表 (Blog Listing)

1. **网格增加列数**: `lg:grid-cols-3` 用于 tablet/desktop
2. **图片比例优化**: 移动端 16:10，桌面 4:3
3. **摘要策略**: 移动端隐藏，tablet 2行截断，桌面完整显示
4. **标签处理**: 移动限制显示，使用横向滚动避免挤占空间
5. **分页大小**: 移动到 6 (2列), tablet/desktop 设为 9 或 12 (3列)

### P0 - 认证机构列表 (Certifying Bodies)

1. **触摸目标**: 确保链接按钮的点击区域至少 44x44px
2. **徽章优化**: 移动端字体 10px，区域徽章使用 pill 形状
3. **信息层级**: 确保 Name, Country, Standard, Region 的信息层次

### P1 - 市场指南 (Market Guides)

1. **国旗显示**: 所有国家应包含国旗图片，单色 SVG 作为 fallback
2. **数据可视化**: 移动端使用紧凑图标+文字，桌面可扩展
3. **折叠内容**: 洞察和挑战在移动端可折叠为详情按钮

## ✅ 检查清单 - 每页验证

对于每个页面，验证：

- [ ] 至少有 3 个断点设计 (mobile, tablet, desktop)
- [ ] 图片比例在移动友好且桌面不压缩
- [ ] 触摸目标 >= 44x44px
- [ ] 标题 truncate 截断显示，无溢出
- [ ] 次要描述在移动隐藏 (`hidden sm:block`)
- [ ] 按钮、链接、表单元素的间距足够
- [ ] 表格使用滚动封装或转换为卡片
- [ ] 图片 `width/height` 避免重排
- [ ] 卡片 padding 在移动减少 (p-2.5)，桌面增加 (sm:p-4)
- [ ] 表单错误提示在移动位置正确
- [ ] 分页在桌面显示 `PAGE_SIZE` 更优化
- [ ] 空状态在 mobile 有清晰引导

## 🛠️ 自动化测试建议

### Playwright E2E 测试

```bash
# Mobile view
npx playwright screenshot http://localhost:5173/screenshot-mobile.png --viewport-size=375,667

# Tablet view
npx playwright screenshot http://localhost:5173/screenshot-tablet.png --viewport-size=768,1024

# Desktop view
npx playwright screenshot http://localhost:5173/screenshot-desktop.png --viewport-size=1440,900
```

### 响应式组件测试

使用 shadcn-svelte 组件时，测试所有 `sm:`、`md:`、`lg:` 前缀类名的正确组合。

---

**修订日期**: 2026-09-XX  
**优先级**: P0 立即优化博客列表，P1 优化其他页面，P2 增强体验
