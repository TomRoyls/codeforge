import type { Metric, AggregatedMetric, TimeRange } from './types.js'

export class MetricsAggregator {
  aggregate(metrics: Metric[], name: string): AggregatedMetric {
    const filtered = metrics.filter((m) => m.name === name)
    const values = filtered.map((m) => m.value)

    if (values.length === 0) {
      return {
        name,
        min: 0,
        max: 0,
        avg: 0,
        sum: 0,
        count: 0,
        percentiles: {},
      }
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      name,
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      avg: sum / values.length,
      sum,
      count: values.length,
      percentiles: {
        50: this.computePercentile(values, 50),
        90: this.computePercentile(values, 90),
        95: this.computePercentile(values, 95),
        99: this.computePercentile(values, 99),
      },
    }
  }

  aggregateByLabel(metrics: Metric[], label: string): Map<string, AggregatedMetric> {
    const groups = new Map<string, Metric[]>()

    for (const metric of metrics) {
      const labelValue = metric.labels[label]
      if (labelValue !== undefined) {
        const group = groups.get(labelValue)
        if (group) {
          group.push(metric)
        } else {
          groups.set(labelValue, [metric])
        }
      }
    }

    const result = new Map<string, AggregatedMetric>()
    for (const [labelValue, groupMetrics] of groups) {
      const values = groupMetrics.map((m) => m.value)
      const sorted = [...values].sort((a, b) => a - b)
      const sum = values.reduce((a, b) => a + b, 0)

      result.set(labelValue, {
        name: groupMetrics[0]!.name,
        min: sorted[0]!,
        max: sorted[sorted.length - 1]!,
        avg: sum / values.length,
        sum,
        count: values.length,
        percentiles: {
          50: this.computePercentile(values, 50),
          95: this.computePercentile(values, 95),
          99: this.computePercentile(values, 99),
        },
      })
    }

    return result
  }

  computePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0

    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const fraction = index - lower

    if (lower === upper) {
      return sorted[lower]!
    }

    return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!)
  }

  computeRate(metrics: Metric[], timeRange: TimeRange): number {
    const inRange = metrics.filter(
      (m) => m.timestamp >= timeRange.from && m.timestamp <= timeRange.to,
    )
    if (inRange.length < 2) return 0

    const sorted = [...inRange].sort((a, b) => a.timestamp - b.timestamp)
    const first = sorted[0]!
    const last = sorted[sorted.length - 1]!
    const duration = (last.timestamp - first.timestamp) / 1000
    if (duration === 0) return 0

    return (last.value - first.value) / duration
  }

  computeMovingAverage(values: number[], window: number): number[] {
    if (values.length === 0 || window <= 0) return []
    if (window > values.length) window = values.length

    const result: number[] = []
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1)
      const slice = values.slice(start, i + 1)
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length
      result.push(avg)
    }
    return result
  }

  trend(metrics: Metric[]): 'increasing' | 'decreasing' | 'stable' {
    if (metrics.length < 2) return 'stable'

    const sorted = [...metrics].sort((a, b) => a.timestamp - b.timestamp)
    const values = sorted.map((m) => m.value)

    let increases = 0
    let decreases = 0

    for (let i = 1; i < values.length; i++) {
      if (values[i]! > values[i - 1]!) increases++
      else if (values[i]! < values[i - 1]!) decreases++
    }

    const total = increases + decreases
    if (total === 0) return 'stable'

    const ratio = increases / total
    if (ratio > 0.6) return 'increasing'
    if (ratio < 0.4) return 'decreasing'
    return 'stable'
  }

  correlation(metrics1: Metric[], metrics2: Metric[]): number {
    if (metrics1.length === 0 || metrics2.length === 0) return 0

    const len = Math.min(metrics1.length, metrics2.length)
    const x = metrics1.slice(0, len).map((m) => m.value)
    const y = metrics2.slice(0, len).map((m) => m.value)

    const meanX = x.reduce((a, b) => a + b, 0) / len
    const meanY = y.reduce((a, b) => a + b, 0) / len

    let numSum = 0
    let denX = 0
    let denY = 0

    for (let i = 0; i < len; i++) {
      const dx = x[i]! - meanX
      const dy = y[i]! - meanY
      numSum += dx * dy
      denX += dx * dx
      denY += dy * dy
    }

    const denominator = Math.sqrt(denX * denY)
    if (denominator === 0) return 0

    return numSum / denominator
  }
}
