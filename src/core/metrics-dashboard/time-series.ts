import type { MetricDataPoint, MetricSeries, TimeBucket } from './types.js'

const SPARKLINE_CHARS = '\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588'

export interface SeriesStats {
  count: number
  sum: number
  avg: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
}

export class TimeSeries {
  private series: Map<string, MetricSeries> = new Map()

  addPoint(name: string, point: MetricDataPoint): void {
    const existing = this.series.get(name)
    if (existing) {
      existing.points.push(point)
      existing.points.sort((a, b) => a.timestamp - b.timestamp)
    } else {
      this.series.set(name, {
        name,
        points: [point],
        unit: '',
      })
    }
  }

  getSeries(name: string): MetricSeries | undefined {
    return this.series.get(name)
  }

  getAllSeries(): MetricSeries[] {
    return [...this.series.values()]
  }

  bucketize(name: string, bucketSize: number): TimeBucket[] {
    const s = this.series.get(name)
    if (!s || s.points.length === 0) return []

    const sortedPoints = [...s.points].sort((a, b) => a.timestamp - b.timestamp)
    const minTime = sortedPoints[0]!.timestamp
    const maxTime = sortedPoints[sortedPoints.length - 1]!.timestamp

    const buckets: TimeBucket[] = []
    for (let bucketStart = minTime; bucketStart <= maxTime; bucketStart += bucketSize) {
      const bucketEnd = bucketStart + bucketSize
      const bucketPoints = sortedPoints.filter(
        (p) => p.timestamp >= bucketStart && p.timestamp < bucketEnd,
      )

      if (bucketPoints.length > 0) {
        const values = bucketPoints.map((p) => p.value)
        const sum = values.reduce((a, b) => a + b, 0)
        buckets.push({
          start: bucketStart,
          end: bucketEnd,
          count: values.length,
          sum,
          avg: sum / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        })
      }
    }

    return buckets
  }

  prune(olderThan: number): void {
    const cutoff = Date.now() - olderThan
    for (const [, s] of this.series) {
      s.points = s.points.filter((p) => p.timestamp >= cutoff)
    }
  }

  getStats(name: string): SeriesStats | undefined {
    const s = this.series.get(name)
    if (!s || s.points.length === 0) return undefined

    const values = s.points.map((p) => p.value)
    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      count: sorted.length,
      sum,
      avg: sum / sorted.length,
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    }
  }

  getSparkline(name: string, width: number = 20): string {
    const s = this.series.get(name)
    if (!s || s.points.length === 0) return ''

    const values = s.points.map((p) => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    const sampled = this.sample(values, width)

    if (range === 0) {
      return sampled.map(() => SPARKLINE_CHARS[4]!).join('')
    }

    return sampled
      .map((v) => {
        const normalized = (v - min) / range
        const charIndex = Math.min(
          Math.floor(normalized * SPARKLINE_CHARS.length),
          SPARKLINE_CHARS.length - 1,
        )
        return SPARKLINE_CHARS[charIndex]!
      })
      .join('')
  }

  removeSeries(name: string): boolean {
    return this.series.delete(name)
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0
    if (sorted.length === 1) return sorted[0]!

    const index = (p / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const fraction = index - lower

    if (lower === upper) {
      return sorted[lower]!
    }

    return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!)
  }

  private sample(values: number[], width: number): number[] {
    if (values.length <= width) return values

    const step = values.length / width
    const result: number[] = []
    for (let i = 0; i < width; i++) {
      const idx = Math.floor(i * step)
      result.push(values[idx]!)
    }
    return result
  }
}
