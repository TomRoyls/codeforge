import type {
  TrendSnapshot,
  TrendSummary,
  TrendAnalysis,
  TrendDataPoint,
  TrendAnomaly,
  MetricComparison,
  FileTrend,
} from './types.js'
import { roundTo } from '../../utils/math-helpers.js'

export class TrendAnalyzer {
  analyzeTrend(snapshots: TrendSnapshot[], metric: keyof TrendSummary): TrendAnalysis {
    const dataPoints = snapshots.map(s => ({
      timestamp: s.timestamp,
      value: s.summary[metric] as number,
    }))

    const changePercent = this.calculateChangeRate(dataPoints)
    const anomalies = this.detectAnomalies(snapshots, metric)
    const forecast = this.forecast(snapshots, metric, 3)

    let direction: TrendAnalysis['direction'] = 'stable'
    if (Math.abs(changePercent) > 5) {
      direction = changePercent > 0 ? 'degrading' : 'improving'
    }

    if (this.isPositiveMetric(metric)) {
      if (Math.abs(changePercent) > 5) {
        direction = changePercent > 0 ? 'improving' : 'degrading'
      }
    }

    return {
      direction,
      changePercent,
      dataPoints,
      anomalies,
      forecast,
    }
  }

  calculateChangeRate(dataPoints: TrendDataPoint[]): number {
    if (dataPoints.length < 2) return 0

    const n = dataPoints.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    for (let i = 0; i < n; i++) {
      const x = i
      const y = dataPoints[i]!.value
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    const firstValue = dataPoints[0]!.value
    if (firstValue === 0) return 0

    return (slope / firstValue) * 100 * (n - 1)
  }

  detectAnomalies(snapshots: TrendSnapshot[], metric: string, threshold = 2): TrendAnomaly[] {
    const anomalies: TrendAnomaly[] = []

    if (snapshots.length < 3) return anomalies

    const values = snapshots.map(s => {
      const summary = s.summary as unknown as Record<string, unknown>
      return summary[metric] as number
    })

    const windowSize = Math.max(3, Math.floor(snapshots.length / 3))
    const halfWindow = Math.floor(windowSize / 2)

    for (let i = halfWindow; i < snapshots.length - halfWindow; i++) {
      const start = Math.max(0, i - halfWindow)
      const end = Math.min(snapshots.length, i + halfWindow + 1)
      const windowVals: number[] = []
      for (let j = start; j < end; j++) {
        if (j !== i) windowVals.push(values[j]!)
      }

      let wSum = 0
      let wSumSq = 0
      for (let j = 0; j < windowVals.length; j++) {
        const v = windowVals[j]!
        wSum += v
        wSumSq += v * v
      }
      const mean = wSum / windowVals.length
      const variance = wSumSq / windowVals.length - mean * mean
      const stdDev = Math.sqrt(variance)

      const actualValue = values[i]!
      let deviation: number
      if (stdDev === 0) {
        deviation = actualValue !== mean ? Infinity : 0
      } else {
        deviation = Math.abs(actualValue - mean) / stdDev
      }

      if (deviation > threshold) {
        anomalies.push({
          timestamp: snapshots[i]!.timestamp,
          metric,
          expectedValue: roundTo(mean, 2),
          actualValue,
          deviation: roundTo(deviation, 2),
        })
      }
    }

    return anomalies
  }

  forecast(snapshots: TrendSnapshot[], metric: keyof TrendSummary, periods: number): TrendDataPoint[] {
    if (snapshots.length < 2) return []

    const dataPoints = snapshots.map(s => ({
      timestamp: s.timestamp,
      value: s.summary[metric] as number,
    }))

    const n = dataPoints.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    for (let i = 0; i < n; i++) {
      const x = i
      const y = dataPoints[i]!.value
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const lastTimestamp = dataPoints[n - 1]!.timestamp
    const avgInterval = n > 1
      ? (dataPoints[n - 1]!.timestamp - dataPoints[0]!.timestamp) / (n - 1)
      : 86400000

    const forecast: TrendDataPoint[] = []
    for (let i = 1; i <= periods; i++) {
      const predictedValue = slope * (n - 1 + i) + intercept
      forecast.push({
        timestamp: lastTimestamp + avgInterval * i,
        value: Math.round(Math.max(0, predictedValue) * 100) / 100,
        label: `Forecast +${i}`,
      })
    }

    return forecast
  }

  compareSnapshots(a: TrendSnapshot, b: TrendSnapshot): MetricComparison[] {
    const metrics: (keyof TrendSummary)[] = [
      'avgCyclomatic',
      'avgCognitive',
      'avgMaintainability',
      'totalLOC',
      'totalEffectiveLOC',
      'totalFunctions',
    ]

    return metrics.map(metric => {
      const previous = a.summary[metric] as number
      const current = b.summary[metric] as number
      const change = current - previous
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0

      let direction: MetricComparison['direction'] = 'stable'
      if (Math.abs(changePercent) > 5) {
        direction = change > 0 ? 'degrading' : 'improving'
      }

      if (this.isPositiveMetric(metric)) {
        if (Math.abs(changePercent) > 5) {
          direction = change > 0 ? 'improving' : 'degrading'
        }
      }

      return {
        metric,
        previous,
        current,
        change,
        changePercent: roundTo(changePercent, 2),
        direction,
      }
    })
  }

  getTopDegradingFiles(snapshots: TrendSnapshot[], limit = 10): FileTrend[] {
    return this.getFileTrends(snapshots)
      .filter(f => f.direction === 'degrading')
      .sort((a, b) => b.change - a.change)
      .slice(0, limit)
  }

  getTopImprovingFiles(snapshots: TrendSnapshot[], limit = 10): FileTrend[] {
    return this.getFileTrends(snapshots)
      .filter(f => f.direction === 'improving')
      .sort((a, b) => a.change - b.change)
      .slice(0, limit)
  }

  getComplexityDistribution(snapshot: TrendSnapshot): Record<string, number> {
    const distribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }

    for (const m of snapshot.metrics) {
      const cc = m.cyclomaticComplexity
      if (cc <= 10) {
        distribution['low']!++
      } else if (cc <= 20) {
        distribution['medium']!++
      } else if (cc <= 30) {
        distribution['high']!++
      } else {
        distribution['critical']!++
      }
    }

    return distribution
  }

  private getFileTrends(snapshots: TrendSnapshot[]): FileTrend[] {
    if (snapshots.length < 2) return []

    const first = snapshots[0]!
    const last = snapshots[snapshots.length - 1]!

    const firstMap = new Map<string, number>()
    for (const m of first.metrics) {
      firstMap.set(m.filePath, m.cyclomaticComplexity)
    }

    const trends: FileTrend[] = []
    for (const m of last.metrics) {
      const previousComplexity = firstMap.get(m.filePath)
      if (previousComplexity === undefined) continue

      const change = m.cyclomaticComplexity - previousComplexity
      let direction: FileTrend['direction'] = 'stable'
      if (Math.abs(change) > 0) {
        direction = change > 0 ? 'degrading' : 'improving'
      }

      trends.push({
        filePath: m.filePath,
        previousComplexity,
        currentComplexity: m.cyclomaticComplexity,
        change,
        direction,
      })
    }

    return trends
  }

  private isPositiveMetric(metric: keyof TrendSummary): boolean {
    return metric === 'avgMaintainability'
  }
}
