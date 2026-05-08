export interface MetricDataPoint {
  timestamp: number
  value: number
  tags: Record<string, string>
}

export interface MetricSeries {
  name: string
  points: MetricDataPoint[]
  unit: string
}

export interface TimeBucket {
  start: number
  end: number
  count: number
  sum: number
  avg: number
  min: number
  max: number
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

export interface HealthCheck {
  name: string
  check: (series: MetricSeries) => boolean
  status: HealthStatus
}

export interface DashboardConfig {
  retentionPeriod: number
  bucketSize: number
  maxSeries: number
}
