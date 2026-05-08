import type { StatsSnapshot, TrendPoint, TrendAnalysis } from './types.js'

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
    this.snapshots.sort((a, b) => a.timestamp - b.timestamp)
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
    const indices = points.map((_, i) => i)
    const values = points.map((p) => p.value)

    const sumX = indices.reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = indices.reduce((acc, x, i) => acc + x * values[i]!, 0)
    const sumXX = indices.reduce((acc, x) => acc + x * x, 0)

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
