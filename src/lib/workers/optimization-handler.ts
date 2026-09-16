/**
 * Cloudflare Workers Optimization Handler
 * 
 * Implements the edge computing and caching layer for:
 * - Intelligent request routing
 * - Cache lookup & pre-warming
 * - Request optimization
 * - Response compression
 * - Real-time analytics
 */

import { IntelligentCacheSystem } from '../workers/cache-optimization.js';
import { D1_SCHEMA } from './d1-schema.js';

/**
 * Configure Workers for optimal cost-performance
 */
interface WorkersConfig {
  memoryCacheSize: number; // Max items in memory cache
  d1CacheSize: number; // Max items in D1 cache
  maxAgeSeconds: number; // Default cache TTL
  prefetchConcurrency: number; // Background prefetch workers
  maxPriority: number;
}

const DEFAULT_WORKERS_CONFIG: WorkersConfig = {
  memoryCacheSize: 1000,
  d1CacheSize: 5000,
  maxAgeSeconds: 3600,
  prefetchConcurrency: 3,
  maxPriority: 3
};

/**
 * Edge Computing Intelligence System
 * Optimizes edge-computing by caching less frequently changing data
 */
class EdgeComputingOptimizer {
  private cacheSystem: IntelligentCacheSystem;
  private config: WorkersConfig;

  constructor() {
    this.cacheSystem = new IntelligentCacheSystem();
    this.config = DEFAULT_WORKERS_CONFIG;
  }

  /**
   * Main Request Handler
   * Optimizes every incoming request for speed and cost efficiency
   */
  async handleRequest(request: Request, event: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const startTime = Date.now();
    
    try {
      // 1. Analyze request for optimization opportunities
      const requestId = this.generateRequestId(request);
      const requestOptimization = this.analyzeRequestForOptimization(request, url);
      
      // 2. Check edge cache first
      const cacheKey = this.generateEdgeCacheKey(request);
      const cachedResponse = await caches.default.match(request);
      
      if (cachedResponse) {
        // Hit from edge cache
        const timing = Date.now() - startTime;
        this.logHit(url.pathname, 'edge-cache', timing);
        
        // Update headers for client-side caching
        const enhancedResponse = this.enhanceCacheResponse(cachedResponse);
        return enhancedResponse;
      }
      
      // 3. Use intelligent cache system
      const result = await this.cacheSystem.loadIntelligentContent(
        url.toString(),
        requestOptimization.params,
        this.config.maxAgeSeconds
      );
      
      // 4. Build optimized response
      const response = new Response(
        JSON.stringify(result.data || { success: true }), 
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${this.config.maxAgeSeconds},` + 
                             `stale-while-revalidate=86400,` +
                             `stale-if-error=43200,` +
                             `s-maxage=${this.config.maxAgeSeconds}`,
            'X-Cache-Type': result.cacheType,
            'X-Request-Id': requestId,
            'X-Edge-Optimized': 'true',
            'X-Response-Time': String(Date.now() - startTime)
          },
          status: 200
        }
      );
      
      // 5. Store in edge cache
      await caches.default.put(request, response.clone());
      
      return response;
      
    } catch (error) {
      console.error('Handler Error:', error);
      
      // Serve fallback with optimization
      return new Response(
        JSON.stringify({ 
          error: 'Service temporarily unavailable',
          requestId: this.generateRequestId(request),
          timestamp: Date.now() 
        }), 
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '30',
            'X-Error-Optimized': 'true'
          }
        }
      );
    }
  }

  /**
   * Background Prefetch Service
   * Runs in the background to pre-warm edge cache with predictive content
   */
  async backgroundPrefetch(): Promise<void> {
    const predictions = this.cacheSystem.getTopPredictions();
    
    for (const prediction of predictions.take(5)) {
      const prefetchUrl = this.optimizeUrlForPrefetch(prediction.url);
      
      try {
        const prefetchResponse = await fetch(prefetchUrl, {
          priority: prediction.priority === 'high' ? 'high' : 'low',
          keepalive: true,
        }).catch(() => null);
        
        if (prefetchResponse) {
          await caches.default.put(new Request(prefetchUrl), prefetchResponse.clone());
        }
      } catch (e) {
        // Log prediction failure but don't fail the batch
        console.warn(`Prefetch failed for ${prefetchUrl}`);
      }
    }
  }

  /**
   * Analytics & Metrics Collection
   * Collects performance and cost data for continuous optimization
   */
  collectMetrics(
    url: string,
    cacheType: 'memory' | 'd1' | 'fetch' | 'edge-cache',
    responseTime: number,
    requestId: string
  ): void {
    // This would typically send to analytics backend
    const metrics = {
      url,
      cacheType,
      responseTime,
      requestId,
      timestamp: Date.now(),
      resourceTrace: {
        energy: 0.1 * responseTime, // microjoules per ms
        bandwidth: 1  // 1 KB assumed per request
      }
    };
    
    // In production, use analytics functions to send to backends
    console.log('📊 Metrics:', metrics);
  }

  // Request analysis utilities
  private generateRequestId(request: Request): string {
    const mockedId = Math.random().toString(36).substring(2, 15);
    return `req_${Date.now()}_${mockedId}`;
  }

  private generateEdgeCacheKey(request: Request): string {
    const url = new URL(request.url);
    return `${url.pathname}?${Array.from(url.searchParams).join('&')}`;
  }

  private analyzeRequestForOptimization(
    request: Request,
    url: URL
  ): { params: any; optimizations: any[] } {
    // Extract and optimize request parameters
    const paramsArray = Array.from(url.searchParams.entries());
    const params = Object.fromEntries(paramsArray);
    
    // Determine optimizations based on request characteristics
    const optimizations = [];
    
    if (params.size === 0) {
      optimizations.push({ type: 'remove_content_negotiation_header' });
    }
    
    if (url.pathname.startsWith('/api/') && request.method === 'GET') {
      optimizations.push({ type: 'enable_response_compression', algorithm: 'gzip' });
    }
    
    return { params, optimizations };
  }

  private optimizeUrlForPrefetch(url: string): string {
    // Simplify query parameters for prefetch URLs
    const parsed = new URL(url);
    parsed.search = parsed.search ? parsed.search.replace(/[&?]page=\d+/, '') : '';
    return parsed.toString();
  }

  private enhanceCacheResponse(response: Response): Response {
    // Enhance cached response with additional metadata
    const headers = new Headers(response.headers);
    headers.set('X-Enhanced-Edge', 'true');
    headers.set('X-CDN-Origin', 'halal-neo-edge');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  private logHit(path: string, cacheType: string, timing: number): void {
    // Log cache hit for monitoring
    console.log(`✅ Cache Hit (${path}): ${cacheType} - ${timing}ms`);
  }
}

// Export singleton instance
export const edgeOptimizer = new EdgeComputingOptimizer();
