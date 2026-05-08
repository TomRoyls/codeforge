export interface TelemetryEvent {
  name: string
  timestamp: number
  properties: Record<string, unknown>
  duration?: number
  sessionId: string
}

export interface MetricPoint {
  name: string
  value: number
  timestamp: number
  tags: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'timer'
}

export interface MetricSummary {
  name: string
  count: number
  sum: number
  min: number
  max: number
  mean: number
  p50: number
  p95: number
  p99: number
}

export interface TelemetryConfig {
  enabled: boolean
  flushIntervalMs: number
  maxQueueSize: number
  anonymize: boolean
  endpoint?: string
}

export interface TelemetryReport {
  sessionId: string
  duration: number
  eventCount: number
  metricCount: number
  topEvents: Array<{ name: string; count: number }>
  metricsSummary: MetricSummary[]
  generatedAt: number
}

export interface PerformanceEntry {
  name: string
  startTime: number
  endTime: number
  duration: number
  metadata: Record<string, unknown>
}

export const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  enabled: true,
  flushIntervalMs: 5000,
  maxQueueSize: 1000,
  anonymize: false,
}
