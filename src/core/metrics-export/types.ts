export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

export interface Metric {
  name: string
  type: MetricType
  value: number
  labels: Record<string, string>
  timestamp: number
  unit?: string
}

export interface MetricDefinition {
  name: string
  type: MetricType
  description: string
  unit?: string
  labels: string[]
}

export interface MetricsSnapshot {
  timestamp: number
  metrics: Metric[]
  source: string
  version: string
}

export interface AggregatedMetric {
  name: string
  min: number
  max: number
  avg: number
  sum: number
  count: number
  percentiles: Record<number, number>
}

export type ExportFormat = 'prometheus' | 'statsd' | 'json' | 'csv' | 'openmetrics'

export interface ExportConfig {
  format: ExportFormat
  includeTimestamps: boolean
  prefix: string
  labelSeparator: string
  metricSeparator: string
}

export interface TimeRange {
  from: number
  to: number
}

export type MetricsRegistry = Map<string, MetricDefinition>
