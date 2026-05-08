import type { MetricPoint, MetricSummary } from './types.js'

export class MetricsRecorder {
  private metrics: Map<string, MetricPoint[]> = new Map()
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()

  increment(
    name: string,
    value: number = 1,
    tags: Record<string, string> = {},
  ): void {
    const current = this.counters.get(name) ?? 0
    this.counters.set(name, current + value)
    this.recordPoint(name, current + value, 'counter', tags)
  }

  decrement(
    name: string,
    value: number = 1,
    tags: Record<string, string> = {},
  ): void {
    const current = this.counters.get(name) ?? 0
    this.counters.set(name, current - value)
    this.recordPoint(name, current - value, 'counter', tags)
  }

  gauge(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    this.gauges.set(name, value)
    this.recordPoint(name, value, 'gauge', tags)
  }

  timing(
    name: string,
    durationMs: number,
    tags: Record<string, string> = {},
  ): void {
    this.recordPoint(name, durationMs, 'timer', tags)
  }

  histogram(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    this.recordPoint(name, value, 'histogram', tags)
  }

  getSummary(name: string): MetricSummary | null {
    const points = this.metrics.get(name)
    if (!points || points.length === 0) return null
    return this.computeSummary(name, points)
  }

  getAllMetrics(): Map<string, MetricPoint[]> {
    const copy = new Map<string, MetricPoint[]>()
    for (const [key, val] of this.metrics) {
      copy.set(key, [...val])
    }
    return copy
  }

  startTimer(name: string, tags: Record<string, string> = {}): () => void {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const durationMs = endTime - startTime
      this.timing(name, durationMs, tags)
    }
  }

  reset(): void {
    this.metrics.clear()
    this.counters.clear()
    this.gauges.clear()
  }

  getCounter(name: string): number {
    return this.counters.get(name) ?? 0
  }

  getGauge(name: string): number | undefined {
    return this.gauges.get(name)
  }

  getPointCount(name: string): number {
    return this.metrics.get(name)?.length ?? 0
  }

  private recordPoint(
    name: string,
    value: number,
    type: MetricPoint['type'],
    tags: Record<string, string>,
  ): void {
    const point: MetricPoint = {
      name,
      value,
      timestamp: Date.now(),
      tags: { ...tags },
      type,
    }
    const existing = this.metrics.get(name)
    if (existing) {
      existing.push(point)
    } else {
      this.metrics.set(name, [point])
    }
  }

  private computeSummary(
    name: string,
    points: MetricPoint[],
  ): MetricSummary {
    const values = points.map((p) => p.value)
    const sorted = [...values].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((a, b) => a + b, 0)
    const min = sorted[0]!
    const max = sorted[count - 1]!
    const mean = sum / count

    return {
      name,
      count,
      sum,
      min,
      max,
      mean,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    }
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 1) return sorted[0]!
    const index = (p / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sorted[lower]!
    const weight = index - lower
    return sorted[lower]! * (1 - weight) + sorted[upper]! * weight
  }
}
