/**
 * 缓存预热系统
 * 目标：通过预测性加载减少冷启动延迟
 */

import { IntelligentCacheSystem } from './cache-optimization.js';
import { smartQuery } from './smart-cache-wrapper.js';

interface PredictionModel {
  predict(url: string): Promise<Set<string>>;
}

// 热门页面预测模型
class PopularPagesPredictor {
  private static popularPatterns = [
    '/products',
    '/suppliers', 
    '/market-guides',
    '/categories',
    '/about',
    '/contact'
  ];

  async predict(): Promise<Set<string>> {
    // 冷水期和热门页面
    return new Set(this.popularPatterns);
  }
}

// 用户行为预测模型
class UserBehaviorPredictor {
  private userHistory: Map<string, string[]> = new Map();

  loadUserBehavior(userId: string): void {
    // 从数据库加载用户历史行为
    // 记录用户访问过的页面和顺序
  }

  async predictForUser(userId: string): Promise<Set<string>> {
    const history = this.userHistory.get(userId) || [];
    
    // 预测下一个可能访问的页面
    if (history.includes('/products')) {
      return new Set(['/suppliers', '/market-guides']);
    }
    
    if (history.includes('/market-guides')) {
      return new Set(['/suppliers', '/product']);
    }
    
    return new Set(['/products', '/suppliers']);
  }
}

// 时间模式预测模型
class TimeBasedPredictor {
  async predictByTime(): Promise<Set<string>> {
    const hour = new Date().getHours();
    
    if (hour >= 9 && hour <= 12) {
      // 上午 - 倾向于搜索和查询
      return new Set(['/products', '/suppliers', '/market-guides']);
    }
    
    if (hour >= 13 && hour <= 17) {
      // 下午 - 倾向于深入研究
      return new Set(['/market-guides', '/categories', '/about']);
    }
    
    if (hour >= 18 && hour <= 22) {
      // 晚上 - 倾向于娱乐和浏览
      return new Set(['/products', '/suppliers']);
    }
    
    return new Set(['/products', '/suppliers']);
  }
}

// 缓存预热执行器
class CacheWarmer {
  private cacheSystem: IntelligentCacheSystem;
  private predictors: PredictionModel[];

  constructor() {
    this.cacheSystem = new IntelligentCacheSystem();
    this.predictors = [
      new PopularPagesPredictor(),
      new UserBehaviorPredictor(),
      new TimeBasedPredictor()
    ];
  }

  async warmCacheFor(page: string): Promise<void> {
    console.log(`🔥 预热页面: ${page}`);
    
    try {
      await this.cacheSystem.loadIntelligentContent(page, undefined, 3600, 'high');
      console.log(`✅ 页面 ${page} 预热完成`);
    } catch (error) {
      console.error(`❌ 预热失败: ${page}`, error);
    }
  }

  async warmPopularPages(): Promise<void> {
    const popular = await new PopularPagesPredictor().predict();
    
    for (const page of popular) {
      await this.warmCacheFor(page);
    }
  }

  async warmForUser(userId: string): Promise<void> {
    const predictor = this.predictors.find(p => p instanceof UserBehaviorPredictor);
    if (predictor) {
      const predicted = await (predictor as UserBehaviorPredictor).predictForUser(userId);
      for (const page of predicted) {
        await this.warmCacheFor(page);
      }
    }
  }

  async warmAllPredictors(): Promise<void> {
    // 主动预热所有预测模型推荐的页面
    const allPages = new Set<string>();
    
    for (const predictor of this.predictors) {
      const predicted = await predictor.predict();
      for (const page of predicted) {
        allPages.add(page);
      }
    }
    
    for (const page of allPages) {
      await this.warmCacheFor(page);
    }
  }

  async warmScheduled(): Promise<void> {
    // 定时预热（每分钟）
    setInterval(async () => {
      const timeBased = this.predictors.find(p => p instanceof TimeBasedPredictor);
      if (timeBased) {
        const predicted = await (timeBased as TimeBasedPredictor).predictByTime();
        for (const page of predicted) {
          await this.warmCacheFor(page);
        }
      }
    }, 60000); // 每分钟执行
  }
}

// 导出使用
export const cacheWarmer = new CacheWarmer();
export default cacheWarmer;
