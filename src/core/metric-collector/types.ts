export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer'

export interface MetricSample {
  name: string
  type: MetricType
  value: number
  timestamp: number
  tags: Record<string, string>
}

export interface MetricSummary {
  name: string
  type: MetricType
  count: number
  sum: number
  min: number
  max: number
  avg: number
  lastValue: number
  p50: number
  p95: number
  p99: number
  tags: Record<string, string>
}

export interface MetricQuery {
  name?: string
  type?: MetricType
  startTime?: number
  endTime?: number
  tags?: Record<string, string>
  limit?: number
}

export interface MetricReport {
  summaries: MetricSummary[]
  totalSamples: number
  timeRange: { start: number; end: number } | null
  generatedAt: number
}

export interface MetricCollectorConfig {
  maxSamples: number
  defaultTags: Record<string, string>
  flushInterval: number
  percentileEnabled: boolean
}

export const DEFAULT_METRIC_COLLECTOR_CONFIG: MetricCollectorConfig = {
  maxSamples: 10000,
  defaultTags: {},
  flushInterval: 0,
  percentileEnabled: true,
}
