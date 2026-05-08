import type { MetricSample, MetricSummary, MetricQuery, MetricType } from './types.js'

interface MetricBucket {
  samples: MetricSample[]
  tags: Record<string, string>
}

export class MetricAggregator {
  private buckets: Map<string, MetricBucket> = new Map()
  private allSamples: MetricSample[] = []
  private percentileEnabled: boolean

  constructor(percentileEnabled = true) {
    this.percentileEnabled = percentileEnabled
  }

  addSample(sample: MetricSample): void {
    const key = this.getBucketKey(sample.name, sample.tags)
    let bucket = this.buckets.get(key)
    if (!bucket) {
      bucket = { samples: [], tags: { ...sample.tags } }
      this.buckets.set(key, bucket)
    }
    bucket.samples.push(sample)
    this.allSamples.push(sample)
  }

  getSummary(name: string): MetricSummary | null {
    for (const bucket of this.buckets.values()) {
      if (bucket.samples.length > 0 && bucket.samples[0]!.name === name) {
        return this.computeSummary(name, bucket)
      }
    }
    return null
  }

  getAllSummaries(): MetricSummary[] {
    const seen = new Set<string>()
    const summaries: MetricSummary[] = []
    for (const bucket of this.buckets.values()) {
      if (bucket.samples.length === 0) continue
      const name = bucket.samples[0]!.name
      if (seen.has(name)) continue
      seen.add(name)
      const summary = this.computeSummary(name, bucket)
      summaries.push(summary)
    }
    return summaries
  }

  query(query: MetricQuery): MetricSample[] {
    let results = this.allSamples

    if (query.name !== undefined) {
      results = results.filter((s) => s.name === query.name)
    }

    if (query.type !== undefined) {
      results = results.filter((s) => s.type === query.type)
    }

    if (query.startTime !== undefined) {
      results = results.filter((s) => s.timestamp >= query.startTime!)
    }

    if (query.endTime !== undefined) {
      results = results.filter((s) => s.timestamp <= query.endTime!)
    }

    if (query.tags !== undefined) {
      const queryTags = query.tags
      results = results.filter((s) => {
        for (const [key, value] of Object.entries(queryTags)) {
          if (s.tags[key] !== value) return false
        }
        return true
      })
    }

    if (query.limit !== undefined && query.limit > 0) {
      results = results.slice(-query.limit)
    }

    return results
  }

  calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sorted[lower]!
    const fraction = index - lower
    return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!)
  }

  reset(): void {
    this.buckets.clear()
    this.allSamples = []
  }

  getSampleCount(): number {
    return this.allSamples.length
  }

  setPercentileEnabled(enabled: boolean): void {
    this.percentileEnabled = enabled
  }

  private getBucketKey(name: string, tags: Record<string, string>): string {
    const tagEntries = Object.entries(tags).sort(([a], [b]) => a.localeCompare(b))
    const tagStr = tagEntries.map(([k, v]) => `${k}=${v}`).join(',')
    return `${name}|${tagStr}`
  }

  private computeSummary(name: string, bucket: MetricBucket): MetricSummary {
    const samples = bucket.samples
    const values = samples.map((s) => s.value)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = count > 0 ? sum / count : 0
    const lastValue = values[count - 1]!
    const metricType: MetricType | undefined = samples[0]?.type

    let p50 = 0
    let p95 = 0
    let p99 = 0

    if (this.percentileEnabled && count > 0) {
      p50 = this.calculatePercentile(values, 50)
      p95 = this.calculatePercentile(values, 95)
      p99 = this.calculatePercentile(values, 99)
    }

    return {
      name,
      type: metricType ?? 'counter',
      count,
      sum,
      min,
      max,
      avg,
      lastValue,
      p50,
      p95,
      p99,
      tags: { ...bucket.tags },
    }
  }
}
