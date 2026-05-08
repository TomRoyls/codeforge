import type { DashboardConfig, HealthCheck, HealthStatus, MetricDataPoint } from './types.js'
import { TimeSeries } from './time-series.js'

const DEFAULT_CONFIG: DashboardConfig = {
  retentionPeriod: 3600000,
  bucketSize: 60000,
  maxSeries: 100,
}

export class MetricsDashboard {
  private config: DashboardConfig
  private ts: TimeSeries
  private checks: HealthCheck[] = []

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.ts = new TimeSeries()
  }

  record(metric: string, value: number, tags: Record<string, string> = {}): void {
    const point: MetricDataPoint = {
      timestamp: Date.now(),
      value,
      tags,
    }
    this.ts.addPoint(metric, point)
  }

  getSeries(metric: string) {
    return this.ts.getSeries(metric)
  }

  getStats(metric: string) {
    return this.ts.getStats(metric)
  }

  getSparkline(metric: string): string {
    return this.ts.getSparkline(metric)
  }

  getBuckets(metric: string, bucketSize?: number): import('./types.js').TimeBucket[] {
    return this.ts.bucketize(metric, bucketSize ?? this.config.bucketSize)
  }

  registerHealthCheck(check: HealthCheck): void {
    this.checks.push(check)
  }

  getHealth(): Map<string, HealthStatus> {
    const result = new Map<string, HealthStatus>()

    for (const hc of this.checks) {
      const series = this.ts.getSeries(hc.name)
      if (!series || series.points.length === 0) {
        result.set(hc.name, 'unknown')
        continue
      }
      const passed = hc.check(series)
      result.set(hc.name, passed ? 'healthy' : hc.status)
    }

    return result
  }

  getOverallHealth(): HealthStatus {
    if (this.checks.length === 0) return 'unknown'

    const health = this.getHealth()
    const severity: Record<HealthStatus, number> = {
      healthy: 0,
      degraded: 1,
      unhealthy: 2,
      unknown: 3,
    }

    let worst: HealthStatus = 'healthy'
    for (const [, status] of health) {
      if (severity[status] > severity[worst]) {
        worst = status
      }
    }

    return worst
  }

  getAllMetrics(): string[] {
    return this.ts.getAllSeries().map((s) => s.name)
  }

  getConfig(): DashboardConfig {
    return { ...this.config }
  }
}
