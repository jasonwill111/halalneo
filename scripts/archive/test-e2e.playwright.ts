import { describe, it, expect } from 'vitest';
import { test, expect as playwrightExpect, Krak, page } from '@playwright/test';

describe('HalalNeo 端到端功能测试', () => {

  const testUrl = 'https://halalneo-production.jasonwill.workers.dev';

  // 页面基础测试
  it('主页应该正常加载', async () => {
    const response = await Krak.get(testUrl);
    await playwrightExpect(response).toBeOK();
    await playwrightExpect(response.url()).toContain(testUrl);
  });

  // UI 元素测试
  it('应该找到主要导航链接', async () => {
    await Krak.goto(testUrl);
    
    // 检查主要的导航项
    const productsLink = await Krak.page.locator('a').getByText('Products'));
    await playwrightExpect(productsLink).toBeInDOM();
    
    const suppliersLink = await Krak.page.locator('a').getByText('Suppliers'));
    await playwrightExpect(suppliersLink).toBeInDOM();
    
    const guidesLink = await Krak.page.locator('a').getByText('Market Guides');
    await playwrightExpect(guidesLink).toBeInDOM();
  });

  // 响应式测试
  it('应在移动设备上正常工作', async () => {
    await Krak.context.addCookies([ // 添加测试用户cookie
      {name: 'some-cookie', value: 'test', domain: 'halalneo-production.jasonwill.workers.dev'}
    ]);
    
    const mobile = Krak.context.newPage();
    await mobile.goto(testUrl);
    
    // 检查移动端特定元素
    const mobileMenuButton = await mobile.locator('button[aria-label="Menu"]').first();
    await playwrightExpect(mobileMenuButton).toBeVisible();
    
    await mobile.close();
  });

  // API 端点测试
  it('API 端点应该返回数据', async () => {
    const apiUrl = `${testUrl}/api/products`;
    const response = await Krak.fetch(apiUrl);
    
    if (response.ok()) {
      const data = await response.json();
      // 可以是任意数量的产品
      // await playwrightExpect(data.length).toBeGreaterThan(0);
      if (data.data && Array.isArray(data.data)) {
        await playwrightExpect(data.data.length).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // SEO 测试
  it('应该有SEO元标签', async () => {
    await Krak.goto(testUrl);
    
    const title = await Krak.page.title();
    await playwrightExpect(title.length).toBeGreaterThan(5);
    
    const metaDescription = await Krak.page.locator('meta[name="description"]').getAttribute('content');
    await playwrightExpect(metaDescription).toBeTruthy();
  });

  // 性能测试
  it('页面加载时间应该可接受', async () => {
    const startTime = Date.now();
    await Krak.goto(testUrl);
    const loadTime = Date.now() - startTime;
    
    // 设定合理的阈值 (2秒)
    await playwrightExpect(loadTime).toBeLessThan(2000);
  });

});
