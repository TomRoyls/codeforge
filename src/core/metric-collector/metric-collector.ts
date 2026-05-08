import { MetricAggregator } from './metric-aggregator.js'
import {
  DEFAULT_METRIC_COLLECTOR_CONFIG,
} from './types.js'
import type {
  MetricSample,
  MetricSummary,
  MetricQuery,
  MetricReport,
  MetricCollectorConfig,
} from './types.js'

export class MetricCollector {
  private config: MetricCollectorConfig
  private aggregator: MetricAggregator
  private flushCallbacks: Array<(samples: MetricSample[]) => void> = []
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private pendingSamples: MetricSample[] = []

  constructor(config?: Partial<MetricCollectorConfig>) {
    this.config = {
      ...DEFAULT_METRIC_COLLECTOR_CONFIG,
      ...config,
      defaultTags: { ...(config?.defaultTags ?? DEFAULT_METRIC_COLLECTOR_CONFIG.defaultTags) },
    }
    this.aggregator = new MetricAggregator(this.config.percentileEnabled)
    if (this.config.flushInterval > 0) {
      this.startFlushTimer()
    }
  }

  counter(name: string, value = 1, tags?: Record<string, string>): void {
    const mergedTags = this.mergeTags(tags)
    const sample = this.createSample(name, 'counter', value, mergedTags)
    this.addSample(sample)
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const mergedTags = this.mergeTags(tags)
    const sample = this.createSample(name, 'gauge', value, mergedTags)
    this.addSample(sample)
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const mergedTags = this.mergeTags(tags)
    const sample = this.createSample(name, 'histogram', value, mergedTags)
    this.addSample(sample)
  }

  timer(name: string, fn: () => unknown, tags?: Record<string, string>): unknown {
    const mergedTags = this.mergeTags(tags)
    const start = performance.now()
    try {
      return fn()
    } finally {
      const elapsed = performance.now() - start
      const sample = this.createSample(name, 'timer', elapsed, mergedTags)
      this.addSample(sample)
    }
  }

  async timeAsync(name: string, fn: () => Promise<unknown>, tags?: Record<string, string>): Promise<unknown> {
    const mergedTags = this.mergeTags(tags)
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const elapsed = performance.now() - start
      const sample = this.createSample(name, 'timer', elapsed, mergedTags)
      this.addSample(sample)
    }
  }

  getMetric(name: string): MetricSummary | null {
    return this.aggregator.getSummary(name)
  }

  getAllMetrics(): MetricSummary[] {
    return this.aggregator.getAllSummaries()
  }

  report(): MetricReport {
    const summaries = this.aggregator.getAllSummaries()
    const allSamples = this.aggregator.query({})
    const totalSamples = allSamples.length
    let timeRange: { start: number; end: number } | null = null
    if (totalSamples > 0) {
      const timestamps = allSamples.map((s) => s.timestamp)
      const start = Math.min(...timestamps)
      const end = Math.max(...timestamps)
      timeRange = { start, end }
    }
    return {
      summaries,
      totalSamples,
      timeRange,
      generatedAt: Date.now(),
    }
  }

  query(query: MetricQuery): MetricSample[] {
    return this.aggregator.query(query)
  }

  reset(): void {
    this.aggregator.reset()
    this.pendingSamples = []
  }

  getConfig(): MetricCollectorConfig {
    return { ...this.config, defaultTags: { ...this.config.defaultTags } }
  }

  onFlush(callback: (samples: MetricSample[]) => void): void {
    this.flushCallbacks.push(callback)
  }

  flush(): MetricSample[] {
    const samples = this.aggregator.query({})
    for (const cb of this.flushCallbacks) {
      cb(samples)
    }
    this.pendingSamples = []
    return samples
  }

  private addSample(sample: MetricSample): void {
    this.aggregator.addSample(sample)
    this.pendingSamples.push(sample)
    if (this.aggregator.getSampleCount() > this.config.maxSamples) {
      this.aggregator.reset()
    }
  }

  private createSample(
    name: string,
    type: MetricSample['type'],
    value: number,
    tags: Record<string, string>,
  ): MetricSample {
    return {
      name,
      type,
      value,
      timestamp: Date.now(),
      tags,
    }
  }

  private mergeTags(tags?: Record<string, string>): Record<string, string> {
    return { ...this.config.defaultTags, ...tags }
  }

  private startFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer)
    }
    this.flushTimer = setInterval(() => {
      if (this.pendingSamples.length > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }

  destroy(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }
}
