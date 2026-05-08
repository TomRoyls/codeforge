import type { Metric, MetricDefinition, MetricsSnapshot, MetricsRegistry } from './types.js'
import { MetricType } from './types.js'

const BUILTIN_DEFINITIONS: MetricDefinition[] = [
  { name: 'codeforge_files_analyzed_total', type: MetricType.COUNTER, description: 'Total number of files analyzed', labels: [] },
  { name: 'codeforge_violations_total', type: MetricType.COUNTER, description: 'Total violations found', labels: ['severity'] },
  { name: 'codeforge_analysis_duration_seconds', type: MetricType.HISTOGRAM, description: 'Analysis duration in seconds', labels: [] },
  { name: 'codeforge_file_complexity', type: MetricType.GAUGE, description: 'Complexity score per file', labels: ['file'] },
  { name: 'codeforge_rules_executed_total', type: MetricType.COUNTER, description: 'Total rules executed', labels: [] },
  { name: 'codeforge_cache_hits_total', type: MetricType.COUNTER, description: 'Total cache hits', labels: [] },
  { name: 'codeforge_cache_misses_total', type: MetricType.COUNTER, description: 'Total cache misses', labels: [] },
]

export class MetricsCollector {
  private registry: MetricsRegistry
  private metrics: Map<string, Metric>

  constructor(registry?: MetricsRegistry) {
    this.registry = registry ?? new Map()
    this.metrics = new Map()
    for (const def of BUILTIN_DEFINITIONS) {
      if (!this.registry.has(def.name)) {
        this.registry.set(def.name, def)
      }
    }
  }

  counter(name: string, labels?: Record<string, string>): void {
    const key = this.makeKey(name, labels)
    const existing = this.metrics.get(key)
    if (existing) {
      existing.value += 1
      existing.timestamp = Date.now()
    } else {
      this.metrics.set(key, {
        name,
        type: MetricType.COUNTER,
        value: 1,
        labels: labels ?? {},
        timestamp: Date.now(),
      })
    }
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.makeKey(name, labels)
    this.metrics.set(key, {
      name,
      type: MetricType.GAUGE,
      value,
      labels: labels ?? {},
      timestamp: Date.now(),
    })
  }

  histogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.makeKey(name, labels)
    const existing = this.metrics.get(key)
    if (existing) {
      existing.value += value
      existing.timestamp = Date.now()
    } else {
      this.metrics.set(key, {
        name,
        type: MetricType.HISTOGRAM,
        value,
        labels: labels ?? {},
        timestamp: Date.now(),
      })
    }
  }

  timer(name: string, labels?: Record<string, string>): () => number {
    const start = performance.now()
    return () => {
      const elapsed = (performance.now() - start) / 1000
      this.histogram(name, elapsed, labels)
      return elapsed
    }
  }

  getMetric(name: string): Metric | undefined {
    for (const metric of this.metrics.values()) {
      if (metric.name === name) {
        return metric
      }
    }
    return undefined
  }

  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values())
  }

  getMetricsByPrefix(prefix: string): Metric[] {
    return this.getAllMetrics().filter((m) => m.name.startsWith(prefix))
  }

  getMetricsByLabel(key: string, value: string): Metric[] {
    return this.getAllMetrics().filter((m) => m.labels[key] === value)
  }

  reset(): void {
    this.metrics.clear()
  }

  snapshot(source?: string): MetricsSnapshot {
    return {
      timestamp: Date.now(),
      metrics: this.getAllMetrics(),
      source: source ?? 'metrics-collector',
      version: '1.0.0',
    }
  }

  getRegistry(): MetricsRegistry {
    return this.registry
  }

  private makeKey(name: string, labels?: Record<string, string>): string {
    const labelPart = labels
      ? Object.entries(labels)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`)
          .join(',')
      : ''
    return `${name}{${labelPart}}`
  }
}
