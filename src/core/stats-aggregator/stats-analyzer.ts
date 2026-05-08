import type { FileStats, ProjectStats, TrendAnalysis, StatsReport, Distribution, SnapshotDiff, StatsSnapshot } from './types.js'

export class StatsAnalyzer {
  findLargestFiles(stats: FileStats[], count: number): FileStats[] {
    const sorted = [...stats].sort((a, b) => b.totalLines - a.totalLines)
    return sorted.slice(0, count)
  }

  findMostComplexFiles(stats: FileStats[], count: number): FileStats[] {
    const sorted = [...stats].sort((a, b) => b.complexity - a.complexity)
    return sorted.slice(0, count)
  }

  calculateDistribution(stats: FileStats[], metric: keyof FileStats): Distribution {
    const values = stats
      .map((s) => s[metric])
      .filter((v): v is number => typeof v === 'number')

    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, p90: 0, p95: 0, p99: 0 }
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      mean: sum / sorted.length,
      median: this.percentile(sorted, 50),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    }
  }

  groupByLanguage(stats: FileStats[]): Map<string, FileStats[]> {
    const groups = new Map<string, FileStats[]>()
    for (const stat of stats) {
      const group = groups.get(stat.language) ?? []
      group.push(stat)
      groups.set(stat.language, group)
    }
    return groups
  }

  compareSnapshots(before: StatsSnapshot, after: StatsSnapshot): SnapshotDiff {
    const beforeFiles = new Map(before.fileStats.map((f) => [f.filePath, f]))
    const afterFiles = new Map(after.fileStats.map((f) => [f.filePath, f]))

    let added = 0
    let removed = 0
    const changed: FileStats[] = []

    for (const [path] of afterFiles) {
      if (!beforeFiles.has(path)) {
        added++
      }
    }

    for (const [path] of beforeFiles) {
      if (!afterFiles.has(path)) {
        removed++
      }
    }

    for (const [path, afterStat] of afterFiles) {
      const beforeStat = beforeFiles.get(path)
      if (beforeStat) {
        if (
          beforeStat.linesOfCode !== afterStat.linesOfCode ||
          beforeStat.complexity !== afterStat.complexity ||
          beforeStat.functions !== afterStat.functions ||
          beforeStat.classes !== afterStat.classes
        ) {
          changed.push(afterStat)
        }
      }
    }

    return { added, removed, changed }
  }

  generateReport(projectStats: ProjectStats, fileStats: FileStats[], trends: TrendAnalysis[]): StatsReport {
    return {
      project: projectStats,
      files: [...fileStats],
      trends: [...trends],
      generatedAt: Date.now(),
    }
  }

  getHealthScore(projectStats: ProjectStats): number {
    let score = 100

    if (projectStats.totalFiles > 0) {
      const commentRatio = projectStats.totalCommentLines / (projectStats.totalLinesOfCode + projectStats.totalCommentLines)
      if (commentRatio < 0.05) {
        score -= 15
      } else if (commentRatio < 0.1) {
        score -= 5
      }

      if (projectStats.averageComplexity > 20) {
        score -= 25
      } else if (projectStats.averageComplexity > 15) {
        score -= 15
      } else if (projectStats.averageComplexity > 10) {
        score -= 10
      } else if (projectStats.averageComplexity > 5) {
        score -= 5
      }

      const topComplex = projectStats.topComplexFiles
      if (topComplex.length > 0 && topComplex[0]!) {
        const maxComplexity = topComplex[0]!.complexity
        if (maxComplexity > 30) {
          score -= 20
        } else if (maxComplexity > 20) {
          score -= 10
        } else if (maxComplexity > 15) {
          score -= 5
        }
      }

      if (projectStats.averageFileLength > 500) {
        score -= 15
      } else if (projectStats.averageFileLength > 300) {
        score -= 5
      }

      if (projectStats.languages.size > 8) {
        score -= 15
      } else if (projectStats.languages.size > 5) {
        score -= 5
      }

      const blankRatio = projectStats.totalBlankLines / (projectStats.totalLinesOfCode + projectStats.totalCommentLines + projectStats.totalBlankLines)
      if (blankRatio > 0.4) {
        score -= 15
      } else if (blankRatio > 0.3) {
        score -= 5
      }
    }

    return Math.max(0, Math.min(100, score))
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
}
