import type { MetricPoint, MetricSummary } from './types.js'
import { percentile } from '../stats-aggregator/percentile.js'
import { append } from '../../utils/map-helpers.js'

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
    append(this.metrics, name, point)
  }

  private computeSummary(
    name: string,
    points: MetricPoint[],
  ): MetricSummary {
    const values = points.map((p) => p.value)
    const sorted = [...values].sort((a, b) => a - b)
    let sum = 0
    for (let i = 0; i < sorted.length; i++) {
      sum += sorted[i]!
    }
    const count = sorted.length
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
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
    }
  }
}
