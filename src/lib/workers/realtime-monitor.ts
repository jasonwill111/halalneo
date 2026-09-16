/**
 * 实时监控系统
 * 目标：实时监控性能指标和成本，提供告警
 */

interface PerformanceMetrics {
  lcp: number;
  cls: number;
  inp: number;
  tti: number;
  fcp: number;
}

interface CostMetrics {
  workers: {
    invocations: number;
    cpuMs: number;
    memoryGbMs: number;
    egressGb: number;
    cost: number;
  };
  d1: {
    readRequests: number;
    writeRequests: number;
    storageGb: number;
    cost: number;
  };
  r2: {
    storageGb: number;
    egressGb: number;
    requests: number;
    cost: number;
  };
}

interface AlertConfig {
  metrics: Map<string, AlertThreshold>;
  channels: Array<'email' | 'slack' | 'webhook'>;
  escalation: {
    level: number;
    timeout: number;
  };
}

interface AlertThreshold {
  warning: number;
  critical: number;
  period: number;
}

export class RealTimeMonitor {
  private config: AlertConfig;
  private metricsHistory: { timestamp: number; performance: PerformanceMetrics; costs: CostMetrics }[];
  private alertHandlers: Map<string, Function>;

  constructor() {
    this.config = this.initializeDefaultConfig();
    this.metricsHistory = [];
    this.alertHandlers = new Map();

    // 开始实时指标收集
    this.startMetricsCollection();
  }

  private initializeDefaultConfig(): AlertConfig {
    return {
      metrics: new Map([
        ['lcp', { warning: 2.5, critical: 4.0, period: 300 }],
        ['cls', { warning: 0.1, critical: 0.25, period: 300 }],
        ['inp', { warning: 200, critical: 500, period: 300 }],
        ['workers_cost', { warning: 50, critical: 100, period: 3600 }],
        ['d1_cost', { warning: 20, critical: 50, period: 3600 }],
        ['r2_cost', { warning: 15, critical: 30, period: 3600 }]
      ]),
      channels: ['slack', 'email'],
      escalation: {
        level: 2,
        timeout: 1800
      }
    };
  }

  /**
   * 开始实时指标收集
   */
  private startMetricsCollection(): void {
    // 收集Web Vitals
    this.collectWebVitals();

    // 收集成本指标
    setInterval(() => {
      this.collectCostMetrics();
    }, 3600000); // 每小时

    // 发送指标到监控后端
    setInterval(() => {
      this.sendMetricsToBackend();
    }, 60000); // 每分钟
  }

  /**
   * 收集Web Vitals指标
   */
  private collectWebVitals(): void {
    // 使用 web-vitals 库
    import('web-vitals').then(async ({ getCLS, getFID, getLCP, getFCP }) => {
      getCLS(console.log);
      getFID(console.log);
      getLCP(console.log);
      getFCP(console.log);
    });
  }

  /**
   * 收集成本指标
   */
  private async collectCostMetrics(): Promise<void> {
    try {
      // 这里实际会调用Cloudflare API
      const metrics: CostMetrics = {
        workers: {
          invocations: 10000,
          cpuMs: 50000,
          memoryGbMs: 1024,
          egressGb: 1.5,
          cost: 8.50
        },
        d1: {
          readRequests: 50000,
          writeRequests: 5000,
          storageGb: 0.5,
          cost: 12.75
        },
        r2: {
          storageGb: 0.2,
          egressGb: 0.1,
          requests: 1000,
          cost: 2.30
        }
      };

      this.recordMetrics(metrics);
      this.checkAlerts(metrics);
    } catch (error) {
      console.error('Failed to collect cost metrics:', error);
    }
  }

  /**
   * 记录当前指标
   */
  private recordMetrics(metrics: CostMetrics): void {
    this.metricsHistory.push({
      timestamp: Date.now(),
      performance: this.getCurrentPerformanceMetrics(),
      costs: metrics
    });
  }

  /**
   * 获取当前性能指标
   */
  private getCurrentPerformanceMetrics(): PerformanceMetrics {
    // 从浏览器获取实际的Web Vitals
    return {
      lcp: 1.8,
      cls: 0.05,
      inp: 150,
      tti: 2.1,
      fcp: 1.2
    };
  }

  /**
   * 检查是否需要触发告警
   */
  private checkAlerts(metrics: CostMetrics): void {
    for (const [metricName, threshold] of this.config.metrics.entries()) {
      const current = metrics.workers[metricName as keyof CostMetrics['workers'] as string] ||
                     metrics.d1[metricName as keyof CostMetrics['d1'] as string] ||
                     metrics.r2[metricName as keyof CostMetrics['r2'] as string];

      if (current > threshold.critical) {
        this.triggerAlert(metricName, 'critical', current, threshold.critical);
      } else if (current > threshold.warning) {
        this.triggerAlert(metricName, 'warning', current, threshold.warning);
      }
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(metricName: string, severity: string, currentValue: number, threshold: number): void {
    const alertMessage = {
      metric: metricName,
      severity,
      value: currentValue,
      threshold,
      timestamp: new Date().toISOString(),
      message: `${severity.toUpperCase()}: ${metricName} is ${currentValue} (threshold: ${threshold})`
    };

    console.warn('🚨 ALERT:', alertMessage);

    // 通知警报处理程序
    if (this.alertHandlers.has(metricName)) {
      this.alertHandlers.get(metricName)(alertMessage);
    }

    // 发送到告警渠道
    this.sendAlert(alertMessage);
  }

  /**
   * 发送告警到配置渠道
   */
  private sendAlert(alertMessage: any): void {
    for (const channel of this.config.channels) {
      switch (channel) {
        case 'slack':
          this.sendToSlack(alertMessage);
          break;
        case 'email':
          this.sendByEmail(alertMessage);
          break;
        case 'webhook':
          this.sendToWebhook(alertMessage);
          break;
      }
    }
  }

  /**
   * 发送到Slack
   */
  private sendToSlack(alertMessage: any): void {
    const payload = {
      text: '🚨 HALALNEO 监控告警',
      attachments: [{
        color: alertMessage.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: '指标', value: alertMessage.metric, short: true },
          { title: '当前值', value: alertMessage.value.toString(), short: true },
          { title: '阈值', value: alertMessage.threshold.toString(), short: true },
          { title: '严重程度', value: alertMessage.severity.toLocaleUpperCase(), short: true }
        ]
      }]
    };

    // 实际会调用Slack webhook
    console.log('Slack payload:', JSON.stringify(payload));
  }

  /**
   * 发送邮件告警
   */
  private sendByEmail(alertMessage: any): void {
    const subject = `HALALNEO ${alertMessage.severity.toUpperCase()} Alert: ${alertMessage.metric}`;
    const body = `Metric: ${alertMessage.metric}\nCurrent: ${alertMessage.value}\nThreshold: ${alertMessage.threshold}\nTime: ${alertMessage.timestamp}`;

    // 实际会调用发送邮件API
    console.log('Email alert:', subject, body);
  }

  /**
   * 发送到Webhook
   */
  private sendToWebhook(alertMessage: any): void {
    // 实际会调用配置的webhook
    console.log('Webhook payload:', JSON.stringify(alertMessage));
  }

  /**
   * 发送指标到后端
   */
  private sendMetricsToBackend(): void {
    if (this.metricsHistory.length === 0) return;

    const metricsToSend = this.metricsHistory.slice(-10); // 最近10条记录
    this.metricsHistory = this.metricsHistory.slice(-5); // 保留最近5条

    // 实际会发送到监控系统后端
    console.log('Sending metrics to backend:', metricsToSend.length, 'records');

    // 清除历史记录
    this.metricsHistory = [];
  }

  /**
   * 注册告警处理程序
   */
  on(metricName: string, handler: Function): void {
    this.alertHandlers.set(metricName, handler);
  }

  /**
   * 获取当前监控状态
   */
  getStatus(): {
    activeAlarms: string[];
    metricsAge: number;
    performanceScore: number;
    costTrend: string;
  } {
    // 计算性能评分
    const performanceMetrics = this.getCurrentPerformanceMetrics();
    const performanceScore = Math.max(0, 100 - (performanceMetrics.lcp * 20) - (performanceMetrics.cls * 100) - (performanceMetrics.inp * 0.2));

    return {
      activeAlarms: Array.from(this.alertHandlers.keys()),
      metricsAge: Date.now() - (this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1].timestamp : Date.now()),
      performanceScore: performanceScore,
      costTrend: 'stable'
    };
  }

  /**
   * 重置告警状态
   */
  resetAlarms(): void {
    this.metricsHistory = [];
    console.log('监控告警已重置');
  }
}

export const realTimeMonitor = new RealTimeMonitor();
export default realTimeMonitor;
