/**
 * IntelligentCacheWrapper - 将智能缓存集成到现有代码
 * 提供与原cachedQuery相同的API，但功能更强大
 */

import { IntelligentCacheSystem } from '../workers/cache-optimization.js';
import { getBindings } from './bindings.js';

// 创建智能缓存单例
const smartCache = new IntelligentCacheSystem();

interface CacheStrategy {
  ttl: number;
  staleWhileRevalidate?: number;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * 优化的缓存查询函数
 * 集成智能缓存系统，增强原有功能
 */
export async function smartQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  strategy: CacheStrategy = { ttl: 3600 }
): Promise<T> {
  try {
    // 从智能缓存系统加载
    const result = await smartCache.loadIntelligentContent<T>(cacheKey, undefined, strategy.ttl, strategy.priority || 'medium');
    
    return result.data;
  } catch (error) {
    console.error('💾 智能缓存加载失败，使用备用查询:', error);
    
    // 如果智能缓存失败，使用传统缓存
    try {
      // 这里可以导入原有cachedQuery
      const { cachedQuery, cacheMedium } = await import('./cache.js');
      const data = await cachedQuery(cacheKey, queryFn, cacheMedium());
      return data;
    } catch (fallbackError) {
      console.error('❌ 备用查询也失败，直接执行查询:', fallbackError);
      return queryFn(); // 回退到原始查询
    }
  }
}

/**
 * 批量查询优化
 * 对多个查询进行批量处理，减少网络往返
 */
export async function smartBatchQuery<T>(
  queries: Array<{
    cacheKey: string;
    queryFn: () => Promise<T>;
    strategy?: CacheStrategy;
  }>,
  maxBatchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  // 分组处理，避免单个查询阻塞
  for (let i = 0; i < queries.length; i += maxBatchSize) {
    const batch = queries.slice(i, i + maxBatchSize);
    const batchResults = await Promise.allSettled(
      batch.map(query => smartQuery(query.cacheKey, query.queryFn, query.strategy))
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('💾 批量查询失败:', result.reason);
        results.push(null as any); // 添加null占位符
      }
    }
  }
  
  return results;
}

/**
 * 缓存无效化增强
 * 支持更细粒度的缓存管理
 */
export async function smartInvalidate(...patterns: string[]): Promise<void> {
  // 尝试从智能缓存清除
  const cache = smartCache.getCache();
  if (cache) {
    for (const pattern of patterns) {
      for (const [key, value] of cache.entries()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    }
  }
  
  // 同时清除传统缓存
  try {
    const { invalidateCache } = await import('./cache.js');
    await invalidateCache(...patterns);
  } catch (error) {
    console.error('❌ 传统缓存清除失败:', error);
  }
}

/**
 * 缓存统计和分析
 */
export function getCacheStats(): {
  memoryHitRate: number;
  d1HitRate: number;
  totalRequests: number;
  totalSavings: number;
  predictions: number;
} {
  const stats = smartCache.getStatistics();
  
  return {
    memoryHitRate: stats.hits.get('memory') || 0,
    d1HitRate: stats.hits.get('d1') || 0,
    totalRequests: stats.requests.size,
    totalSavings: stats.costSavings,
    predictions: stats.predictions.size
  };
}

// 导出为默认
export default {
  smartQuery,
  smartBatchQuery,
  smartInvalidate,
  getCacheStats
};
