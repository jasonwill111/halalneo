# HalalNeo SEO 与 GEO 内容增强指南

## 当前 SEO 状态分析

### ✅ 已实现

- **Meta 标签**: 所有页面头文件 (`svelte:head`) 都有标题、描述、关键词
- **结构化数据**: JSON-LD 语义标记 (Product, Organization, FAQPage)
- **Sitemap**: `sitemap.xml` 自动生成
- **robots.txt**: 已配置
- **Rel=canonical**: 潜在实现

### ⚠️ 需要增强

- **Open Graph/Twitter Card**: 社交媒体分享元数据不足
- **Content Gateway Optimization (GEO)**: 多语言支持未实施
- **Image SEO**: 图片 alt、picing、WebP 支持有待提高
- **Internal Linking**: 内容间连接优化
- **Performance SEO**: 核心 Web 指标优化

## P0 优先级：核心 SEO 增强

### 1. 社交媒体元数据增强

#### Open Graph (FB, LinkedIn, Slack)

```html
<meta property="og:title" content="HalalNeo - 产品名 | 网站名" />
<meta property="og:description" content="产品描述" />
<meta property="og:image" content="https://halalneo.com/api/media/og- producto.webp" />
<meta property="og:url" content="https://halalneo.com/product/产品名" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="HalalNeo" />
<meta property="og:locale" content="en_US" />
```

#### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="HalalNeo - 产品名" />
<meta name="twitter:description" content="产品描述" />
<meta name="twitter:image" content="https://halalneo.com/api/media/twitter- producto.jpg" />
```

#### 实施位置

在所有内容的 `svelte:head` 中动态添加：

- `src/routes/product/[slug]/+page.svelte`
- `src/routes/supplier/[slug]/+page.svelte`
- `src/routes/blog/[slug]/+page.svelte`
- `src/routes/market-guides/[country]/+page.svelte`

### 2. 多语言 SEO 与 GEO 优化

#### ParaglideJS 集成

预计本项目已配置 `@inlang/paraglide-js`，我们需要按地区优化内容：

##### a. 语言指示元数据

```html
<link rel="alternate" hreflang="en" href="https://halalneo.com/product/产品名" />
<link rel="alternate" hreflang="ar" href="https://halalneo.com/ar/product/产品名" />
<link rel="alternate" hreflang="zh" href="https://halalneo.com/zh/product/产品名" />
<link rel="alternate" hreflang="x-default" href="https://halalneo.com/product/产品名" />
```

##### b. 区域化内容

对于市场指南，根据用户位置自动切换内容：

```typescript
// src/lib/utils/geolocation.ts
export function getPreferredRegion(userCountry: string): string {
	const regionMap: Record<string, string> = {
		MY: 'Southeast Asia',
		SG: 'Southeast Asia',
		ID: 'Southeast Asia',
		SA: 'Middle East',
		AE: 'Middle East'
		// 更多映射
	};
	return regionMap[userCountry] || 'Global';
}
```

##### c. 本地化图片

为不同地区提供特定图片，提升相关性：

```html
<picture>
	<!-- 移动端首选 WebP -->
	<source srcset="/api/media/market-malaysia-own-mobile.webp" media="(max-width: 640px)" />
	<!-- 桌面端 -->
	<img
		src="/api/media/market-malaysia.webp"
		alt="马尔代夫市场指南"
		sizes="(max-width: 640px) 100vw, 600px"
	/>
</picture>
```

### 3. 图片 SEO 增强

#### 响应式图片 + 格式

```html
<picture>
	<source
		type="image/avif"
		srcset="
			/api/media/product.webp?format=avif&w=480   480w,
			/api/media/product.webp?format=avif&w=1200 1200w
		"
		sizes="(max-width: 640px) 100vw, 400px"
	/>
	<source
		type="image/webp"
		srcset="
			/api/media/product.webp?format=webp&w=480   480w,
			/api/media/product.webp?format=webp&w=1200 1200w
		"
		sizes="(max-width: 640px) 100vw, 400px"
	/>
	<img
		src="/api/media/product.jpg"
		alt="产品名 - 所属类别 - 供应商名称"
		loading="lazy"
		decoding="async"
		width="600"
		height="400"
	/>
</picture>
```

#### 结构化图片元数据

```html
<script type="application/ld+json">
	{
		"@context": "https://schema.org/",
		"@type": "ImageObject",
		"contentUrl": "https://halalneo.com/api/media/product.webp",
		"caption": "产品名称"
	}
</script>
```

### 4. 站点内部链接优化

#### 自动相关组件

目前已有 `RelatedLinks`，但可以增加：

##### Products Related

通过 Product 页面自动显示：

- 同供应商产品
- 同类别产品
- 同认证机构产品

```html
<!-- src/lib/components/site/product-related.svelte -->
<script>
	let { products } = $props();

	const relatedProducts = $derived(products.filter((p) => p.categorySlug === currentCategory));
</script>
```

##### Breadcrumb Schema

确保面包屑有结构化数据：

```html
<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{
				"@type": "ListItem",
				"position": 1,
				"name": "Products",
				"item": "/products"
			},
			{
				"@type": "ListItem",
				"position": 2,
				"name": "Category",
				"item": "/category/organic"
			},
			{
				"@type": "ListItem",
				"position": 3,
				"name": "Product",
				"item": "/product/organic-oil"
			}
		]
	}
</script>
```

### 5. 性能 SEO 优化

#### 核心 Web 指标目标

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **INP (Interaction to Next Paint)**: < 200ms

#### 具体优化措施

##### 图片懒加载优化

```html
<picture>
	<source srcset="image.avif" type="image/avif" />
	<source srcset="image.webp" type="image/webp" />
	<img src="image.jpg" loading="lazy" alt="..." decoding="async" width="600" height="400" />
</picture>
```

##### Critical CSS

提取首屏 CSS 内联，减少关键路径：

```html
<style>
	#critical {
		/* 首屏必需的样式 */
	}
</style>
```

##### 预加载关键资源

```html
<link rel="preconnect" href="https://api.halalneo.com" crossorigin />
<link rel="dns-prefetch" href="https://cdn.cloudflare.com" />
```

## P1 优先级：高级 SEO 策略

### 1. 内容营销优化

#### 博客文章 SEO 结构

```html
<!-- src/routes/blog/[slug]/+page.svelte -->
<svelte:head>
	<title>{post.title} - {post.category} | HalalNeo</title>
	<meta name="description" content="{post.excerpt}" />

	<!-- Author Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			"author": {
				"@type": "Person",
				"name": "{{post.author}}"
			}
		}
	</script>

	<!-- TOC Schema (if applicable) -->
	<script type="application/ld+json">
		{
			"@type": "Article",
			"headline": "{{post.title}}",
			"datePublished": "{{post.date}}"
		}
	</script>
</svelte:head>
```

### 2. 关键字策略

#### 行业特定关键词列表

为每个内容类型维护关键词库：

- **Products**: "halal supplier Malaysia", "halal food products", "organic halal"
- **Blog**: "halal certification process", "halal export requirements", "Muslim market trends"
- **Market Guides**: "halal market Saudi Arabia", "importing halal products to UAE"

#### lokalasiya miting

根据地区显示关键词：

```typescript
const regionKeywords = {
	Malaysia: 'halal certification Malaysia, Jakim halal',
	'Saudi Arabia': 'halal certification Saudi Arabia, SFDA halal',
	UAE: 'halal certification UAE, MOIAT halal'
	// ...
};
```

### 3. 链接建设

#### 反向链接优化

- 定向外部链接到权威来源
- 内部链接锚文本多样化
- 分享按钮社交信号

### 4. 可访问性 SEO

#### 语义化 HTML

确保所有层次结构化：

```html
<aside aria-labelledby="related-products">
	<h3 id="related-products" class="sr-only">Related Products</h3>
</aside>
```

## 实施计划

### Week 1-2: 核心社交媒体元数据

- 为所有产品页面添加 Open Graph/Twitter Card
- 生成分享图片 (OG Images)
- 验证所有 meta 标签正确性

### Week 3-4: 性能优化

- 实施 WebP/AVIF 格式
- 优化临界路径 CSS
- 改进图片懒加载
- 确保 LCP < 2.5s

### Week 5-6: GEO 优化

- 集成 ParaglideJS 多语言
- 设置 hreflang 标签
- 地区化内容切换
- 本地化数字资产

### Week 7-8: 高级策略

- 内容营销 SEO 模板
- 结构化数据扩展
- 可访问性检查
- 反向链接策略

## 质量保证

### 钩子检查清单

- [ ] 所有页面都有正确 meta 标签
- [ ] 图片 alt 文本完整
- [ ] 结构化数据验证通过
- [ ] 移动端友好测试通过
- [ ] 核心 Web 指标达标
- [ ] 本地化 hreflang 正确

### 测试工具

- **Google PageSpeed Insights**: 性能评分
- **Rich Results Test**: 结构化数据
- **Mobile-Friendly Test**: 移动端
- **Ahrefs/Semrush**: 关键字排名
- **Firefox Accessibility**: 可访问性

---

**更新日期**: 2026-09-XX
**负责人**: 内容团队 + 开发团队
**状态**: 规划中
