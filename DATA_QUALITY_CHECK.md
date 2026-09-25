# HalalNeo 数据完整性自动化检查指南

## 概述

本文档描述对 HalalNeo 平台13种内容类型进行自动化数据完整性检查的脚本和流程。通过验证字段是否存在、格式是否正确、关系是否完整，确保平台数据质量达到顶级标准。

## 检查维度

### 1. 必填字段验证

验证每种内容类型的必需字段是否都存在且不为空。

### 2. 格式验证

检查日期、邮箱、URL等字段的格式正确性。

### 3. 业务规则验证

确保数据符合业务逻辑（价格>0，产品状态有效等）。

### 4. 关系完整性

验证外键关系是否完整（产品-供应商、产品-分类等）。

### 5. 内容质量评分

基于数据完整程度给出质量评分（0-100）。

## 检查脚本设计

### 1. 数据库迁移检查脚本

```typescript
// scripts/check-data-integrity.ts
import { db } from './db/index';
import { products, suppliers, categories, etc } from './db/schema';

interface CheckResult {
	type: 'success' | 'warning' | 'error';
	message: string;
	suggestions?: string[];
}

export async function checkDataIntegrity(): Promise<CheckResult[]> {
	const results: CheckResult[] = [];

	// 1. 产品类型检查
	const productsCount = await db.select({ count: products.count }).from(products);
	const invalidProducts = await db
		.select()
		.from(products)
		.where(
			and(
				or(eq(products.name, ''), isNull(products.name)),
				or(eq(products.priceMin, 0), isNull(products.priceMin))
			)
		);

	if (invalidProducts.length > 0) {
		results.push({
			type: 'error',
			message: `Found ${invalidProducts.length} products with missing/invalid data`,
			suggestions: [
				'Review and update missing product information',
				'Ensure all products have valid prices and names',
				'Check suppliers have complete profiles before product creation'
			]
		});
	}

	// 2. 供应商类型检查
	const suppliersCount = await db.select({ count: suppliers.count }).from(suppliers);
	const invalidSuppliers = await db
		.select()
		.from(suppliers)
		.where(
			and(
				or(eq(suppliers.name, ''), isNull(suppliers.name)),
				or(eq(suppliers.country, ''), isNull(suppliers.country))
			)
		);

	if (invalidSuppliers.length > 0) {
		results.push({
			type: 'error',
			message: `Found ${invalidSuppliers.length} suppliers with missing/invalid data`,
			suggestions: ['Update supplier contact information and descriptions']
		});
	}

	// 3. 分类检查
	const categoriesCount = await db.select({ count: categories.count }).from(categories);
	const invalidCategories = await db
		.select()
		.from(categories)
		.where(or(eq(categories.name, ''), isNull(categories.name)));

	if (invalidCategories.length > 0) {
		results.push({
			type: 'error',
			message: `Found ${invalidCategories.length} categories with missing names`,
			suggestions: ['Review category names and structure']
		});
	}

	// 4. 市场指南检查
	const guidesCount = await db.select({ count: marketGuides.count }).from(marketGuides);
	const invalidGuides = await db
		.select()
		.from(marketGuides)
		.where(
			or(
				eq(marketGuides.country, ''),
				isNull(marketGuides.country),
				or(eq(marketGuides.muslimPopulation, ''), isNull(marketGuides.muslimPopulation))
			)
		);

	if (invalidGuides.length > 0) {
		results.push({
			type: 'error',
			message: `Found ${invalidGuides.length} market guides with missing data`,
			suggestions: ['Ensure each market guide has country and population data']
		});
	}

	// 5. 博客文章检查
	// 需要创建专门的 blog_posts 表后运行

	return results;
}

// 运行所有检查
async function runAllChecks() {
	const checks = await checkDataIntegrity();
	console.table(checks);

	// 发送报告通知
	// The App 会为成功、警告和错误生成详细报告
}

runAllChecks().catch(console.error);
```

### 2. Quality Scoring Engine

```typescript
interface QualityScore {
	content: string;
	score: number; // 0-100
	issues: Issue[];
	recommendations: string[];
}

interface Issue {
	type: 'missing-field' | 'invalid-format' | 'business-rule' | 'relationship';
	field: string;
	value: any;
	expected: string;
}

export function calculateQualityScore(content: any, type: string): QualityScore {
	const issues: Issue[] = [];

	switch (type) {
		case 'product':
			return checkProductQuality(content, issues);
		case 'supplier':
			return checkSupplierQuality(content, issues);
		// ... 其他类型
	}
}

function checkProductQuality(product: any, issues: Issue[]): QualityScore {
	const score = 100;

	// 必填字段
	if (!product.name) {
		issues.push({
			type: 'missing-field',
			field: 'name',
			value: null,
			expected: 'string (required)'
		});
		score -= 20;
	}

	if (!product.priceMin || product.priceMin <= 0) {
		issues.push({
			type: 'invalid-format',
			field: 'priceMin',
			value: product.priceMin,
			expected: 'positive number'
		});
		score -= 15;
	}

	if (!product.image) {
		issues.push({ type: 'missing-field', field: 'image', value: null, expected: 'string (URL)' });
		score -= 10;
	}

	// 业务规则
	if (product.priceUnit && product.priceUnit.length > 50) {
		issues.push({
			type: 'business-rule',
			field: 'priceUnit',
			value: product.priceUnit,
			expected: '≤50 characters'
		});
		score -= 5;
	}

	return {
		content: `${product.name || 'Unknown Product'}`,
		score: Math.max(0, score),
		issues,
		recommendations: generateRecommendations(issues)
	};
}

function generateRecommendations(issues: Issue[]): string[] {
	const recs: string[] = [];

	issues.forEach((issue) => {
		switch (issue.type) {
			case 'missing-field':
				recs.push(
					`Complete the "${issue.field}" field in ${issue.value ? 'this product' : 'all products'}`
				);
				break;
			case 'invalid-format':
				recs.push(`Provide valid ${issue.field} format`);
				break;
			case 'business-rule':
				recs.push(`Follow business rule for ${issue.field}`);
				break;
		}
	});

	return recs;
}
```

### 3. Relations Validation

```typescript
async function checkRelations() {
	const issues: Issue[] = [];

	// Check product-supplier
	const orphanProducts = await db
		.select()
		.from(products)
		.leftJoin(suppliers, eq(products.supplierSlug, suppliers.slug))
		.where(isNull(suppliers.slug));

	if (orphanProducts.length > 0) {
		issues.push({
			type: 'relationship',
			field: 'supplier_slug',
			value: 'orphan產品的列表',
			expected: 'valid supplier商品の存在'
		});
	}

	// Check supplier-certificate body
	const suppliersMissingBodies = await db
		.select()
		.from(suppliers)
		.leftJoin(certifyingBodies, eq(suppliers.certifications, certifyingBodies.id))
		.where(isNull(certifyingBodies.slug));

	if (suppliersMissingBodies.length > 0) {
		issues.push({
			type: 'relationship',
			field: 'certifications',
			value: 'suppliers without valid bodies',
			expected: 'valid certifying bodies'
		});
	}

	return issues;
}
```

## 4. Content Quality Dashboard

创建一个管理仪表板来显示内容质量状况：

```html
<!-- src/routes/admin/dashboard/+page.svelte -->
<script>
	import { contentQuality } from '#lib/utils/content-quality';

	let { data } = $props();

	const qualityStats = contentQuality.calculateOverallStats(data);

	const qualityColor = (score) => {
		if (score >= 90) return 'text-success';
		if (score >= 70) return 'text-warn';
		return 'text-destructive';
	};
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardContent class="p-6">
			<div class="text-sm font-medium text-muted-foreground">Products</div>
			<div class="{qualityColor(qualityStats.productAverages)} text-2xl font-bold">
				{qualityStats.productAverages}
			</div>
			<p class="text-xs text-muted-foreground">Average quality score</p>
		</CardContent>
	</Card>

	<!-- 其他卡片 -->
</div>

<table>
	<TableHeader>
		<TableRow>
			<TableHead>Content Type</TableHead>
			<TableHead>Count</TableHead>
			<TableHead>Average Score</TableHead>
			<TableHead>Issues</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{#each qualityStats.breakdown as stat (stat.type)}
		<TableRow>
			<TableCell>{stat.type}</TableCell>
			<TableCell>{stat.count}</TableCell>
			<TableCell class="{qualityColor(stat.score)}"> {stat.score}% </TableCell>
			<TableCell>
				<Badge variant="{stat.issues">
					10 ? 'destructive' : 'secondary'}> {stat.issues.length} issues
				</Badge>
			</TableCell>
		</TableRow>
		{/each}
	</TableBody>
</table>
```

## 5. Automated Checks on Create/Update

### Zod Schema Validation (前端)

```typescript
// src/lib/validations/product-schema.ts
import { z } from 'zod';

export const productSchema = z.object({
	name: z.string().min(1, 'Product name is required'),
	slug: z.string().min(1, 'Slug is required'),
	supplierSlug: z.string().min(1, 'Supplier is required'),
	categorySlug: z.string().min(1, 'Category is required'),
	priceMin: z.number().positive('Price must be positive'),
	priceMax: z.number().positive().optional(),
	priceUnit: z.string().min(1, 'Price unit is required'),
	image: z.string().url('Image URL is required'),
	certifications: z
		.array(
			z.object({
				name: z.string(),
				status: z.enum(['certified', 'pending', 'expired'])
			})
		)
		.optional()
});

// 表单提交时的验证
async function submitProduct(formData: FormData) {
	const parsed = productSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		const errors = parsed.error.issues.map((i) => i.message);
		// 显示错误
		return errors;
	}

	// 保存至数据库
	await db.insert(products).values(parsed.data);
}
```

### 数据库触发器

虽然 SQLite 不支持触发器，我们可以在应用层实现：

```typescript
// src/lib/hooks/before-save.ts
export function validateBeforeSave(data: any, type: string) {
	switch (type) {
		case 'product':
			if (data.priceMin <= 0) {
				throw new Error('Price must be positive');
			}
			if (!data.name) {
				throw new Error('Product name is required');
			}
			break;
		case 'supplier':
			if (!data.country) {
				throw new Error('Country is required');
			}
			break;
		// 其他类型
	}
}
```

## 6. Scheduled Quality Reports

### 每日质量报告

```typescript
// scripts/daily-quality-report.ts
import { checkDataIntegrity } from './check-data-integrity';
import { sendReport } from '#lib/utils/notification';

export async function dailyQualityReport() {
	const results = await checkDataIntegrity();

	const report = {
		date: new Date().toISOString(),
		summary: {
			totalItems: results.reduce((sum, r) => sum + r.count, 0),
			criticalIssues: results.filter((r) => r.type === 'error').length,
			warnings: results.filter((r) => r.type === 'warning').length
		},
		details: results
	};

	// 发送通知
	await sendReport({
		type: 'quality-report',
		recipients: ['admin@halalneo.com', 'content@halalneo.com'],
		data: report
	});

	return report;
}

// 设置 cron 作业
import { schedule } from 'node-cron';

schedule('0 6 * * *', async () => {
	console.log('Running daily quality check...');
	await dailyQualityReport();
});
```

## 7. Check Integration Points

### API 层集成

```typescript
// routes/api/products/+server.ts
import { validateBeforeSave } from '#lib/hooks/before-save';
import { productSchema } from '#lib/validations/product-schema';

export async function POST(request: Request) {
	const data = await request.json();

	try {
		// 验证字段格式
		const parsed = productSchema.safeParse(data);
		if (!parsed.success) {
			return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
		}

		// 业务规则检查
		validateBeforeSave(parsed.data, 'product');

		// 保存到数据库
		const saved = await db.insert(products).values(parsed.data).returning();

		return json(saved[0]);
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
```

### 管理后台集成

```html
<!-- src/routes/admin/products/+page.svelte -->
<script>
	let { products } = $props();

	const qualityStats = computed(() => {
		return products.map((product) => ({
			...product,
			qualityScore: calculateQualityScore(product, 'product')
		}));
	});
</script>

<table>
	<TableHeader>
		<TableRow>
			<TableHead>Product</TableHead>
			<TableHead>Quality Score</TableHead>
			<TableHead>Issues</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{#each qualityStats as item (item.slug)}
		<TableRow>
			<TableCell>{item.name}</TableCell>
			<TableCell>
				<Badge variant="{item.qualityScore"
					>= 80 ? 'success' : 'destructive'}> {item.qualityScore}%
				</Badge>
			</TableCell>
			<TableCell>
				{#if item.qualityScore < 80}
				<button size="sm" variant="outline" onclick="{()" ="">
					navigateTo(`/admin/products/${item.slug}/edit`)}> Fix Issues
				</button>
				{/if}
			</TableCell>
		</TableRow>
		{/each}
	</TableBody>
</table>
```

## 8. Monitoring and Alerts

### 关键指标监控

```typescript
// src/lib/utils/monitoring.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function monitorDataQuality() {
	const thresholds = {
		productQuality: 80,
		supplierQuality: 85,
		marketGuideQuality: 90
	};

	const qualityData = await fetch('/api/quality-stats').then((r) => r.json());

	const alerts = [];

	if (qualityData.product.avg < thresholds.productQuality) {
		alerts.push({
			type: 'warning',
			message: 'Product quality below threshold',
			value: qualityData.product.avg,
			threshold: thresholds.productQuality
		});
	}

	if (alerts.length > 0) {
		await supabase.table('alerts').insert({
			type: 'quality',
			data: alerts,
			severity: alerts.some((a) => a.type === 'error') ? 'high' : 'medium'
		});
	}
}
```

## 9. 执行计划

### 2周内完成

- [ ] **Week 1**: 基础验证脚本开发
  - 数据库字段验证
  - 关系完整性检查
  - 格式验证逻辑

- [ ] **Week 2**: 质量评分与仪表板集成
  - 质量评分引擎
  - 管理后台仪表板
  - 自动化报告

### 1-2月完成

- [ ] **Week 3-4**: 前端集成
  - 表单验证升级
  - API 层质量检查
  - 实时质量反馈

- [ ] **Week 5-6**: 监控与通知
  - 每日报告系统
  - 告警机制
  - 质量趋势分析

## 工具依赖

- **Drizzle ORM**: 数据库查询
- **Zod**: 字段验证
- **Supabase/Firebase**: 监控数据存储
- **node-cron**: 定时任务
- **Serversent Events (SSE)**: 实时通知

---

**实施日期**: 2026-09-XX  
**负责人**: 开发团队  
**状态**: 待实施
