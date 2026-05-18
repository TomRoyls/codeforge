import type { StatsSnapshot, TrendPoint, TrendAnalysis } from './types.js'
import { sortedBy } from '../../utils/array-helpers.js'

const NUMERIC_PROJECT_METRICS: Record<string, (s: StatsSnapshot) => number> = {
  totalFiles: (s) => s.projectStats.totalFiles,
  totalLinesOfCode: (s) => s.projectStats.totalLinesOfCode,
  totalCommentLines: (s) => s.projectStats.totalCommentLines,
  totalBlankLines: (s) => s.projectStats.totalBlankLines,
  averageComplexity: (s) => s.projectStats.averageComplexity,
  averageFileLength: (s) => s.projectStats.averageFileLength,
}

export class TimeSeries {
  private snapshots: StatsSnapshot[] = []

  addPoint(snapshot: StatsSnapshot): void {
    this.snapshots.push(snapshot)
    this.snapshots = sortedBy(this.snapshots, s => s.timestamp)
  }

  getPoints(metric: string): TrendPoint[] {
    const extractor = NUMERIC_PROJECT_METRICS[metric]
    if (!extractor) return []

    return this.snapshots.map((s) => ({
      timestamp: s.timestamp,
      value: extractor(s),
      label: new Date(s.timestamp).toISOString(),
    }))
  }

  analyzeTrend(metric: string): TrendAnalysis {
    const points = this.getPoints(metric)

    if (points.length < 2) {
      return {
        metric,
        points,
        direction: 'stable',
        changeRate: 0,
      }
    }

    const changeRate = this.calculateChangeRate(points)
    const direction = this.determineDirection(changeRate)

    return {
      metric,
      points,
      direction,
      changeRate,
    }
  }

  getLatest(): StatsSnapshot | null {
    if (this.snapshots.length === 0) return null
    return this.snapshots[this.snapshots.length - 1]!
  }

  getHistory(): StatsSnapshot[] {
    return [...this.snapshots]
  }

  clear(): void {
    this.snapshots = []
  }

  private calculateChangeRate(points: TrendPoint[]): number {
    if (points.length < 2) return 0

    const n = points.length
    const values = points.map((p) => p.value)

    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0
    for (let i = 0; i < n; i++) {
      const y = values[i]!
      sumX += i
      sumY += y
      sumXY += i * y
      sumXX += i * i
    }

    const denominator = n * sumXX - sumX * sumX
    if (denominator === 0) return 0

    const slope = (n * sumXY - sumX * sumY) / denominator

    const meanValue = sumY / n
    if (meanValue === 0) return 0

    return slope / meanValue
  }

  private determineDirection(changeRate: number): 'increasing' | 'decreasing' | 'stable' {
    const threshold = 0.01
    if (changeRate > threshold) return 'increasing'
    if (changeRate < -threshold) return 'decreasing'
    return 'stable'
  }
}
