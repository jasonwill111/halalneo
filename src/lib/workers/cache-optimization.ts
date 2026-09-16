/**
 * Intelligent Workers Caching & Optimization Infrastructure
 * 
 * Implements advanced caching strategies for Cloudflare Workers:
 * - Multi-level cache (memory → D1 → origin)
 * - Predictive pre-warming for popular content
 * - Request payload optimization
 * - Edge-computing intelligence
 * - Network RTT optimization
 */

interface CacheMinMax {
  maxessos?: number;
  maxAge?: number;
}

interface PredictivePrewarmRequest {
  url: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-1, how likely to be requested
}

interface CacheStatistics {
  requests: Map<string, Set<string>>; // url -> response types
  hitrates: Map<string, number>;
  costsavings: number;
  predictions: Map<string, number>;
}

/**
 * Multi-level Intelligent Cache System
 * Implements predictive pre-warming and request header optimization
 */
class IntelligentCacheSystem {
  private memoryCache: Map<string, { data: any, timestamp: number, metadata: any }>;
  private d1Cache: string[]; // Set of frequently queried URLs
  private prefetchQueue: PriorityQueue;
  private statistics: CacheStatistics;

  constructor() {
    this.memoryCache = new Map();
    this.d1Cache = [];
    this.prefetchQueue = new PriorityQueue();
    this.statistics = {
      requests: new Map(),
      hitrates: new Map(),
      costsavings: 0,
      predictions: new Map()
    };
  }

  /**
   * Smart Content Loading with Intelligence
   * Returns cached response if available, predicts future requests,
   * optimizes request payload
   */
  async loadIntelligentContent<T>(
    url: string,
    requestParams?: any,
    maxAge: number = 3600, // 1 hour default
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<{ data: T, cacheType: 'memory' | 'd1' | 'fetch' }> {
    // 1. Check memory cache (fastest)
    const memoryCacheKey = this.generateCacheKey(url, requestParams);
    const memoryResult = this.memoryCache.get(memoryCacheKey);
    if (memoryResult && Date.now() - memoryResult.timestamp < maxAge * 1000) {
      // Update statistics
      this.updateHitRate(url, 'memory');
      this.addCostSavings(0.05); // Energy savings from memory access
      
      // Predictive pre-warm adjacent content
      await this.predictivePrewarm(url, priority);
      
      return {
        data: memoryResult.data as T,
        cacheType: 'memory'
      };
    }

    // 2. Check D1 cache (faster than origin)
    const d1CacheKey = this.generateD1CacheKey(url);
    const d1Result = await this.cacheD1Get(d1CacheKey);
    if (d1Result) {
      this.updateHitRate(url, 'd1');
      this.addCostSavings(0.25); // 75% cheaper than origin
      
      // Refresh memory cache
      this.memoryCache.set(memoryCacheKey, {
        data: d1Result,
        timestamp: Date.now(),
        metadata: { cacheType: 'd1' }
      });
      
      return {
        data: d1Result as T,
        cacheType: 'd1'
      };
    }

    // 3. Fetch from origin (fallback)
    const response = await this.optimizedOriginFetch(url, requestParams);
    this.addCostSavings(0); // Full cost for origin fetch
    
    // Cache in both D1 and memory
    await this.cacheD1Set(d1CacheKey, response.data, maxAge);
    this.memoryCache.set(memoryCacheKey, {
      data: response.data,
      timestamp: Date.now(),
      metadata: { cacheType: 'origin', url }
    });
    
    // Predictive pre-warm for related content
    await this.predictivePrewarm(url, priority);
    
    return {
      data: response.data as T,
      cacheType: 'fetch'
    };
  }

  /**
   * Predictive Pre-warming based on patterns
   * Proactively loads content likely to be requested
   */
  private async predictivePrewarm(
    sourceUrl: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<void> {
    const predictions = this.analysisPredictionModel(sourceUrl);
    for (const prediction of predictions) {
      if (prediction.confidence > 0.7) {
        this.prefetchQueue.add(prediction, priority);
      }
    }
    
    // Process a few high-confidence predictions per source access
    await this.processPrefetchQueue(3);
  }

  /**
   * Predictive Pre-warming Batch Processor
   * Efficiently handles batch pre-warming requests
   */
  private async processPrefetchQueue(limit: number = 5): Promise<void> {
    while (limit > 0 && this.prefetchQueue.size() > 0) {
      const prediction = this.prefetchQueue.poll();
      if (prediction) {
        try {
          await this.loadIntelligentContent(prediction.url, undefined, 300).catch(() => {});
          limit--;
        } catch (error) {
          // Silently ignore pre-fetch failures
        }
      }
    }
  }

  /**
   * Optimized Origin Fetch with Payload Optimization
   * Reduces network overlay and response size
   */
  private async optimizedOriginFetch(
    url: string,
    params: any = {}
  ): Promise<Response> {
    const optimizationHeaders = {
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Origin': 'https://halalneo.com',
      'Referer': 'https://halalneo.com/'
    };
    
    // Add minimal request parameters
    const queryString = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
      return acc;
    }, []).join('&');
    
    const fullUrl = `${url}${queryString ? '?' + querystring : ''}`;
    
    const response = await fetch(fullUrl, {
      headers: optimizationHeaders,
      method: 'GET',
      keepalive: true, // Keep connection alive
    });
    
    // Optimize response by converting to preferred format
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const jsonData = await response.json();
      
      // Apply response optimization
      return new Response(JSON.stringify(this.optimizeResponse(jsonData)), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Optimized': 'true'
        }
      });
    }
    
    return response;
  }

  /**
   * Response Optimization: Remove unnecessary fields, compress data structure
   */
  private optimizeResponse(data: any): any {
    // Deep removal of null/undefined fields
    const clean = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined;
      if (Array.isArray(obj)) return obj.map(clean).filter(item => item !== undefined);
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = clean(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
        return cleaned;
      }
      return obj;
    };
    
    return clean(data);
  }

  /**
   * Cost Analysis & Reporting
   * Tracks costs, savings, and optimization effectiveness
   */
  analyzeCostImpact(): void {
    let totalRequests = 0;
    let totalSavings = 0;
    
    for (const [url, hitrates] of this.statistics.hits) {
      const hits = Number(hitrates.get('total') || 0);
      const memoryHits = Number(hitrates.get('memory') || 0);
      const d1Hits = Number(hitrates.get('d1') || 0);
      
      // Calculate cost savings
      const savings = (memoryHits * 0.01 + d1Hits * 0.05); // $0.01 per memory access, $0.05 per d1 access
      totalSavings += savings;
      
      // Predict future costs
      const probability = hits > 10 ? 0.9 : hits > 1 ? 0.5 : 0.1;
      this.statistics.predictions.set(url, probability);
    }
    
    console.log(`🔍 Cost Migration Analysis:`);
    console.log(`Total Requests Analyzed: ${totalRequests}`);
    console.log(`Total Savings Achieved: $${totalSavings.toFixed(4)}`);
    console.log(`Optimization Success Rate: ${(totalSavings / (totalRequests * 0.1)) * 100}%`);
  }

  /**
   * Cache Key generation utility
   */
  private generateCacheKey(url: string, params: any): string {
    const sortedParams = JSON.stringify(params);
    const normalizedUrl = url.replace(/\?/g, '_');
    return `${normalizedUrl}_${sortedParams}`;
  }

  /**
   * D1 cache key generation
   */
  private generateD1CacheKey(url: string): string {
    return `cache_${url.replace(/\//g, '_')}`;
  }

  // Statistics tracking methods
  private updateHitRate(url: string, cacheType: 'memory' | 'd1' | 'fetch') {
    const hitrates = this.statistics.hitrates.get(url) ?? new Map<string, number>();
    for (const type of hitrates.keys()) {
      hitrates.set(type, (hitrates.get(type) || 0) + (type === cacheType ? 1 : 0));
    }
    this.statistics.hitrates.set(url, hitrates);
  }

  private addCostSavings(savings: number): void {
    this.statistics.costsavings = (this.statistics.costsavings || 0) + savings;
  }

  /**
   * Administrative functions for monitoring and maintenance
   */
  async clearStaleMemoryCache(): Promise<void> {
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 7; // 7 days
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < cutoff) {
        this.memoryCache.delete(key);
      }
    }
    console.log(`✅ Memory cache cleared (removed ${this.memoryCache.size} entries)`);
  }

  async getSystemStatistics(): Promise<Readonly<CacheStatistics>> {
    return { ...this.statistics };
  }
}

/**
 * PriorityQueue for predictive pre-warming
 */
class PriorityQueue {
  private items: Array<{ url: string, priority: number, confidence: number }>;
  
  constructor() {
    this.items = [];
  }
  
  add(prediction: { url: string, priority: 'high' | 'medium' | 'low' }, priority: string): void {
    const priorityValue = { high: 3, medium: 2, low: 1 };
    
    this.items.push({
      url: prediction.url,
      priority: priorityValue[priority.val],
      confidence: prediction.confidence || 0,
    });
    
    // Keep sorted by confidence (highest first)
    this.items.sort((a, b) => b.confidence - a.confidence);
  }
  
  poll(): { url: string, priority: number, confidence: number } | undefined {
    if (this.items.length === 0) return undefined;
    return this.items.shift();
  }
  
  size(): number {
    return this.items.length;
  }
  
  clear(): void {
    this.items = [];
  }
}

// Export for use in Workers
export { IntelligentCacheSystem, PriorityQueue };
