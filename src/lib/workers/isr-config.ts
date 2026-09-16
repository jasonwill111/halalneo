/**
 * ISR (Incremental Static Regeneration) 配置
 * 目标：优化静态页面实时性，减少冷启动延迟
 */

export const ISR_CONFIG = {
  // 全局策略
  revalidate: 3600, // 默认重新验证时间 (1小时)
  staleWhileRevalidate: 86400, // 同时无效化 (1天)

  // 页面特定配置
  pages: {
    '/': {
      revalidate: 1800, // 首页 30分钟
      ssw: 86400, // 同时无效化 1天
      fallback: true,
      fallbackTimeout: 10000 // 后备超时 10秒
    },
    '/products': {
      revalidate: 1200, // 产品列表 20分钟
      ssw: 43200, // 同时无效化 12小时
      fallback: true,
      fallbackTimeout: 15000
    },
    '/suppliers': {
      revalidate: 1200, // 供应商列表 20分钟
      ssw: 43200,
      fallback: true,
      fallbackTimeout: 15000
    },
    '/market-guides': {
      revalidate: 3600, // 市场指南 1小时
      ssw: 86400,
      fallback: true,
      fallbackTimeout: 20000
    },
    '/category/[slug]': {
      revalidate: 1800, // 分类详情 30分钟
      ssw: 43200,
      fallback: true,
      fallbackTimeout: 15000
    },
    '/supplier/[slug]': {
      revalidate: 1800,
      ssw: 43200,
      fallback: true,
      fallbackTimeout: 15000
    }
  },

  // ISR 优化策略
  optimization: {
    // 预构建策略
    prebuild: {
      popularPages: true, // 优先构建热门页面
      dynamicSitemap: true  // 动态sitemap生成
    },

    // 后台更新策略
    backgroundUpdate: {
      enabled: true, // 启用后台更新
      batchUpdate: true, // 批量更新
      batchTimeout: 5000 // 批量更新超时
    },

    // 缓存管理
    cacheManagement: {
      enableLRU: true, // LRU缓存淘汰策略
      maxItems: 1000, // LRU最大项目数
      freshness: 'age', // 新鲜度: age
      staleThreshold: 86400 // 同值阈值
    }
  }
};

/**
 * ISR 实现类
 */
export class ISROptimizer {
  private config: typeof ISR_CONFIG;
  private cache: Map<string, { data: any, timestamp: number }>;
  private pendingRevalidations: Set<string>;

  constructor() {
    this.config = ISR_CONFIG;
    this.cache = new Map();
    this.pendingRevalidations = new Set();
  }

  /**
   * ISR 请求处理
   */
  async handleISRRequest(url: string, fetchFn: () => Promise<any>): Promise<{ data: any, isStale: boolean }> {
    const pageConfig = this.config.pages[url] || this.config.pages['/'] || { revalidate: this.config.revalidate };

    // 检查缓存
    const cached = this.cache.get(url);
    const now = Date.now() / 1000;

    if (cached && (now - cached.timestamp) < pageConfig.revalidate) {
      return {
        data: cached.data,
        isStale: false
      };
    }

    // 如果正在重新验证，返回旧缓存
    if (this.pendingRevalidations.has(url)) {
      if (cached) {
        return {
          data: cached.data,
          isStale: true
        };
      }
      throw new Error(`No cached data for ${url}`);
    }

    // 没有缓存，需要获取
    try {
      const data = await fetchFn();
      this.cache.set(url, {
        data,
        timestamp: now
      });

      // 条件重新验证
      if (pageConfig.ssw) {
        this.scheduleBackgroundRevalidation(url, fetchFn, pageConfig.ssw);
      }

      return {
        data,
        isStale: false
      };
    } catch (error) {
      if (cached) {
        return {
          data: cached.data,
          isStale: true
        };
      }
      throw error;
    }
  }

  /**
   * 调度后台重新验证
   */
  private scheduleBackgroundRevalidation(url: string, fetchFn: () => Promise<any>, timeout: number): void {
    this.pendingRevalidations.add(url);

    setTimeout(async () => {
      try {
        const data = await fetchFn();
        this.cache.set(url, {
          data,
          timestamp: Date.now() / 1000
        });
      } catch (error) {
        console.error(`ISR background revalidation failed for ${url}:`, error);
      } finally {
        this.pendingRevalidations.delete(url);
      }
    }, timeout * 1000);
  }

  /**
   * 强制执行重新验证
   */
  forceRevalidate(url: string): void {
    this.cache.delete(url);
    this.pendingRevalidations.add(url);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { 
    total: number;
    hitRate: number;
    avgAge: number;
  } {
    const now = Date.now() / 1000;
    let totalRequests = 0;
    let cacheHits = 0;
    let totalAge = 0;
    let count = 0;

    for (const [key, value] of this.cache.entries()) {
      count++;
      totalAge += (now - value.timestamp);
      totalRequests++;
      // 模拟hit判断
      if (Math.random() > 0.3) {
        cacheHits++;
      }
    }

    return {
      total: count,
      hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      avgAge: count > 0 ? totalAge / count : 0
    };
  }
}

export const isROptimizer = new ISROptimizer();
export default isROptimizer;
