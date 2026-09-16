/**
 * Cloudflare Cost Monitoring & Analytics Infrastructure
 * 
 * Implements real-time cost tracking, anomaly detection, and performance monitoring
 * for Cloudflare Workers, D1, and R2
 */

interface CostMetrics {
  workers: {
    invocations: number;
    executionTime: number;
    memoryUsage: number;
    egressBytes: number;
    cpu: number;
    costs: {
      invocations: number;
      executionTime: number;
      memory: number;
      egress: number;
      total: number;
    };
  };
  d1: {
    queries: number;
    slowQueries: number;
    executionTime: number;
    storageUsed: number;
    costs: {
      queries: number;
      storage: number;
      total: number;
    };
  };
  r2: {
    requests: number;
    storageBytes: number;
    egressBytes: number;
    costs: {
      storage: number;
      requests: number;
      egress: number;
      total: number;
    };
  };
  total: number;
  savings: {
    workers: number;
    d1: number;
    r2: number;
    total: number;
  };
}

interface AlertConfig {
  thresholdPercentage: number;
  checkInterval: number;
  enableEmail: boolean;
  enableSlack: boolean;
  enableWebhook: boolean;
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  thresholdPercentage: 20,
  checkInterval: 300000, // 5 minutes
  enableEmail: false,
  enableSlack: false,
  enableWebhook: false,
};

/**
 * Cloudflare Cost Monitoring System
 * Tracks real-time usage and implements anomaly detection
 */
class CloudflareCostMonitor {
  private metrics: CostMetrics;
  private alertConfig: AlertConfig;
  private trends: { metrics: CostMetrics[]; startTime: number }[];
  private history: { timestamp: number; metrics: CostMetrics }[];
  
  constructor() {
    this.metrics = this.initializeEmptyMetrics();
    this.alertConfig = DEFAULT_ALERT_CONFIG;
    this.trends = [];
    this.history = [];
    this.setupMonitoring();
  }

  private initializeEmptyMetrics(): CostMetrics {
    return {
      workers: {
        invocations: 0,
        executionTime: 0,
        memoryUsage: 0,
        egressBytes: 0,
        cpu: 0,
        costs: { invocations: 0, executionTime: 0, memory: 0, egress: 0, total: 0 },
      },
      d1: {
        queries: 0,
        slowQueries: 0,
        executionTime: 0,
        storageUsed: 0,
        costs: { queries: 0, storage: 0, total: 0 },
      },
      r2: {
        requests: 0,
        storageBytes: 0,
        egressBytes: 0,
        costs: { storage: 0, requests: 0, egress: 0, total: 0 },
      },
      total: 0,
      savings: { workers: 0, d1: 0, r2: 0, total: 0 },
    };
  }

  /**
   * Setup Monitoring Infrastructure
   * Configures all monitoring endpoints and alerts
   */
  private setupMonitoring(): void {
    // Set up analytics endpoint
    this.setupAnalyticsEndpoint();
    
    // Set up anomaly detection
    this.setupAnomalyDetection();
    
    // Set up cost trending
    this.setupCostTrending();
    
    // Set up health checks
    this.setupHealthChecks();
  }

  /**
   * Analytics Endpoint
   * Provides real-time metrics via API
   */
  private setupAnalyticsEndpoint(): void {
    // Create /api/monitoring/costs endpoint
    // In production, this would be a Workers route
    // For testing:
    this.getMetrics = () => ({
      success: true,
      data: this.metrics,
      timestamp: Date.now(),
    });

    // Expose for testing
    (global as any).getMetrics = this.getMetrics.bind(this);
  }

  /**
   * Anomaly Detection System
   * Monitors for unusual patterns in usage
   */
  private setupAnomalyDetection(): void {
    // Simple anomaly detection using statistical bounds
    setInterval(() => {
      const anomalies = this.detectAnomalies();
      if (anomalies.length > 0) {
        this.triggerAlerts(anomalies);
      }
    }, this.alertConfig.checkInterval);
  }

  /**
   * Detect Anomalies in Metrics
   * Uses statistical analysis to identify unusual patterns
   */
  private detectAnomalies(): { type: string, severity: string, description: string, current: number, expected: number }[] {
    const anomalies: { type: string, severity: string, description: string, current: number, expected: number }[] = [];
    
    // Check for unusual invocation spikes
    const avgInvocations = this.calculateMovingAverage('invocations', 24); // 24 hour average
    if (this.metrics.workers.invocations > avgInvocations * 1.5) {
      anomalies.push({
        type: 'invocation_spike',
        severity: 'medium',
        description: `Unusually high request count: ${this.metrics.workers.invocations} vs expected ${avgInvocations}`,
        current: this.metrics.workers.invocations,
        expected: avgInvocations,
      });
    }
    
    // Check for sudden cost increases
    const hourlyCost = this.metrics.workers.costs.total + this.metrics.d1.costs.total + this.metrics.r2.costs.total;
    const dailyBudget = 50; // $50 daily budget baseline
    if (hourlyCost > dailyBudget / 24 * 3) { // More than 3 hours of budget consumed
      anomalies.push({
        type: 'cost_spike',
        severity: 'high',
        description: `Cost increase detected: $${hourlyCost.toFixed(2)} in last 3 hours`,
        current: hourlyCost,
        expected: dailyBudget / 24 * 3,
      });
    }
    
    return anomalies;
  }

  /**
   * Trigger Alerts
   * Sends notifications based on configured alert channels
   */
  private triggerAlerts(anomalies: any[]): void {
    // In production, implement:
    // - Email notifications
    // - Slack webhook alerts
    // - PagerDuty escalation
    // - SMS for critical issues
    
    // For now, log to console
    console.warn(`🚨 Cost Monitoring Alert: ${anomalies.length} anomalies detected`);
    for (const anomaly of anomalies) {
      console.warn(`[${anomaly.severity}] ${anomaly.type}: ${anomaly.description}`);
    }
  }

  /**
   * Cost Trending Analysis
   * Tracks historical trends and forecasts
   */
  private setupCostTrending(): void {
    // Log metrics every hour for trend analysis
    setInterval(() => {
      this.logMetricsSnapshot();
    }, 3600000); // 1 hour
    
    // Analyze trends daily and report
    setInterval(() => {
      this.analyzeTrends();
    }, 86400000); // 24 hours
  }

  /**
   * Log Metrics Snapshot
   * Records current metrics for trend analysis
   */
  private logMetricsSnapshot(): void {
    const snapshot = {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
    };
    
    this.history.push(snapshot);
    
    // Keep last 7 days of data
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.history = this.history.filter(h => h.timestamp > oneWeekAgo);
    
    // Log summary
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recent = this.history.filter(h => h.timestamp > oneHourAgo);
    if (recent.length > 0) {
      const totalUsage = recent.reduce((sum: number, h: any) => 
        sum + h.metrics.workers.invocations, 0
      );
      const totalCost = recent.reduce((sum: number, h: any) => 
        sum + h.metrics.total, 0
      );
      
      console.log(`📊 Hourly summary: ${totalUsage} invocations, $${totalCost.toFixed(2)} costs`);
    }
  }

  /**
   * Analyze Trends
   * Processes historical data to identify trends
   */
  private analyzeTrends(): void {
    if (this.history.length < 24) return; // Need at least 24 hours of data
    
    // Calculate daily metrics
    const days = this.getDaysCovered();
    const totalCost = this.history.reduce((sum: number, h: any) => sum + h.metrics.total, 0);
    const avgDailyCost = totalCost / days;
    
    // Compare with previous period
    const previousPeriod = this.history.filter(h => 
      h.timestamp < Date.now() - 24 * 60 * 60 * 1000
    );
    const prevCost = previousPeriod.reduce((sum: number, h: any) => sum + h.metrics.total, 0);
    const prevDays = previousPeriod.length > 0 ? Math.max(1, this.getDaysCoveredBetween(previousPeriod)) : 1;
    const prevAvgDailyCost = prevCost / prevDays;
    
    // Calculate trend
    const trend = prevAvgDailyCost > 0 
      ? ((avgDailyCost - prevAvgDailyCost) / prevAvgDailyCost) * 100
      : 0;
    
    // Log trend
    console.log(`📈 Daily Cost Trend: $${avgDailyCost.toFixed(2)} (trend: ${trend.toFixed(2)}%)`);
    
    // Store trends for reporting
    this.trends.push({
      metrics: { ...this.metrics },
      timestamp: Date.now(),
    });
  }

  /**
   * Calculate Moving Average
   * Computes average over specified number of periods
   */
  private calculateMovingAverage(field: string, periods: number): number {
    const cutoff = Date.now() - periods * 60 * 60 * 1000; // Last N hours
    
    const relevant = this.history.filter(h => h.timestamp > cutoff);
    if (relevant.length === 0) return 0;
    
    return relevant.reduce((sum: number, h: any) => sum + h.metrics.workers[field as keyof CostMetrics['workers']] as number, 0) / relevant.length;
  }

  /**
   * Health Check
   * Verifies monitoring system is working correctly
   */
  private setupHealthChecks(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 300000); // 5 minutes
  }

  private performHealthCheck(): void {
    // Check if metrics are being updated
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recent = this.history.filter(h => h.timestamp > oneMinuteAgo);
    
    if (recent.length === 0) {
      console.warn('🏥 Health Check: No metrics updated in last minute');
    }
    
    // Check for any error states
    if (this.metrics.workers.invocations < 0) {
      console.error('🏥 Health Check: Negative invocations detected!');
    }
  }

  /**
   * Get Days Covered by History
   */
  private getDaysCovered(): number {
    if (this.history.length === 0) return 0;
    const oldest = this.history[0].timestamp;
    const newest = this.history[this.history.length - 1].timestamp;
    return Math.max(1, Math.ceil((newest - oldest) / (24 * 60 * 60 * 1000)));
  }

  /**
   * Get Days Covered Between Two History Arrays
   */
  private getDaysCoveredBetween(history: any[]): number {
    if (history.length === 0) return 0;
    const oldest = history[0].timestamp;
    const newest = history[history.length - 1].timestamp;
    return Math.max(1, Math.ceil((newest - oldest) / (24 * 60 * 60 * 1000)));
  }

  /**
   * Update Metrics from Source
   * In production, this would fetch from Cloudflare APIs
   * For now, simulates metric updates
   */
  updateMetrics(): void {
    // Simulate metrics update
    this.metrics.workers.invocations += Math.floor(Math.random() * 1000);
    this.metrics.workers.executionTime = Math.random() * 50 + 10; // 10-60ms
    
    // Calculate costs
    this.metrics.workers.costs.invocations = this.metrics.workers.invocations * 0.0000004;
    this.metrics.workers.costs.executionTime = this.metrics.workers.executionTime * 0.0000001;
    this.metrics.workers.costs.egress = this.metrics.workers.egressBytes * 0.00001; // $0.01 per GB
    
    // Simplified D1 costs
    this.metrics.d1.queries = Math.floor(Math.random() * 500);
    this.metrics.d1.costs.queries = this.metrics.d1.queries * 0.001; // $0.001 per query
    this.metrics.d1.storage = Math.random() * 500 * 1024 * 1024; // 0-500 MB
    
    // Simplified R2 costs
    this.metrics.r2.requests = Math.floor(Math.random() * 5000);
    this.metrics.r2.storageBytes = Math.random() * 500 * 1024 * 1024; // 0-500 MB
    this.metrics.r2.egressBytes = Math.random() * 10 * 1024 * 1024; // 0-10 MB
    
    // Update total
    this.metrics.total = 
      this.metrics.workers.costs.invocations +
      this.metrics.workers.costs.executionTime +
      this.metrics.workers.costs.egress +
      this.metrics.d1.costs.queries +
      this.metrics.d1.costs.storage +
      this.metrics.r2.costs.requests +
      this.metrics.r2.costs.storage +
      this.metrics.r2.costs.egress;
    
    // Update savings
    this.metrics.savings.total = this.calculateSavings();
  }

  /**
   * Calculate Savings
   * Calculates cost savings from optimisations
   */
  private calculateSavings(): number {
    // Base costs would come from original estimates
    const originalWorkersCost = 72; // $72/month estimate
    const originalD1Cost = 4.85;
    const originalR2Cost = 5.60;
    const originalTotal = originalWorkersCost + originalD1Cost + originalR2Cost;
    
    // Optimised costs (example: 40% reduction)
    const optimisedWorkersCost = originalWorkersCost * 0.6;
    const optimisedD1Cost = originalD1Cost * 0.8; // 20% reduction
    const optimisedR2Cost = originalR2Cost * 0.7; // 30% reduction
    const optimisedTotal = optimisedWorkersCost + optimisedD1Cost + optimisedR2Cost;
    
    const savings = originalTotal - optimisedTotal;
    
    // Update individual categories
    this.metrics.savings.workers = originalWorkersCost - optimisedWorkersCost;
    this.metrics.savings.d1 = originalD1Cost - optimisedD1Cost;
    this.metrics.savings.r2 = originalR2Cost - optimisedR2Cost;
    
    return savings;
  }

  /**
   * Get Current Metrics
   * For API consumption
   */
  getMetrics(): { success: boolean; data: CostMetrics; timestamp: number } {
    return {
      success: true,
      data: this.metrics,
      timestamp: Date.now(),
    };
  }

  /**
   * Get Trending Data
   * For trend analysis dashboards
   */
  getTrendingData(): { metrics: CostMetrics; timestamp: number }[] {
    return [...this.trends];
  }

  /**
   * Reset Metrics
   * For testing purposes
   */
  resetMetrics(): void {
    this.metrics = this.initializeEmptyMetrics();
    this.history = [];
    this.trends = [];
  }
}

// Export singleton instance
export const costMonitor = new CloudflareCostMonitor();

// Export for testing
export { CloudflareCostMonitor };
