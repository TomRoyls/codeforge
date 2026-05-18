import type { FileStats, ProjectStats, TrendAnalysis, StatsReport, Distribution, SnapshotDiff, StatsSnapshot } from './types.js'
import { percentile } from './percentile.js'
import { clampPercent } from '../../utils/math-helpers.js'
import { groupBy, sortedByDesc } from '../../utils/array-helpers.js'

// ─── Health Score Thresholds ───
const VERY_HIGH_AVG_COMPLEXITY = 20
const HIGH_AVG_COMPLEXITY = 15
const MEDIUM_AVG_COMPLEXITY = 10
const LOW_AVG_COMPLEXITY = 5
const VERY_HIGH_MAX_COMPLEXITY = 30
const HIGH_MAX_COMPLEXITY = 20
const MEDIUM_MAX_COMPLEXITY = 15
const LARGE_FILE_LINE_THRESHOLD = 500
const MEDIUM_FILE_LINE_THRESHOLD = 300
const MANY_LANGUAGES_THRESHOLD = 8
const SEVERAL_LANGUAGES_THRESHOLD = 5

export class StatsAnalyzer {
  findLargestFiles(stats: FileStats[], count: number): FileStats[] {
    const sorted = sortedByDesc(stats, s => s.totalLines)
    return sorted.slice(0, count)
  }

  findMostComplexFiles(stats: FileStats[], count: number): FileStats[] {
    const sorted = sortedByDesc(stats, s => s.complexity)
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
    let sum = 0
    for (const val of sorted) {
      sum += val
    }

    return {
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      mean: sum / sorted.length,
      median: percentile(sorted, 50),
      p90: percentile(sorted, 90),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
    }
  }

  groupByLanguage(stats: FileStats[]): Map<string, FileStats[]> {
    return groupBy(stats, (s) => s.language)
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

      if (projectStats.averageComplexity > VERY_HIGH_AVG_COMPLEXITY) {
        score -= 25
      } else if (projectStats.averageComplexity > HIGH_AVG_COMPLEXITY) {
        score -= 15
      } else if (projectStats.averageComplexity > MEDIUM_AVG_COMPLEXITY) {
        score -= 10
      } else if (projectStats.averageComplexity > LOW_AVG_COMPLEXITY) {
        score -= 5
      }

      const topComplex = projectStats.topComplexFiles
      if (topComplex.length > 0 && topComplex[0]!) {
        const maxComplexity = topComplex[0]!.complexity
        if (maxComplexity > VERY_HIGH_MAX_COMPLEXITY) {
          score -= 20
        } else if (maxComplexity > HIGH_MAX_COMPLEXITY) {
          score -= 10
        } else if (maxComplexity > MEDIUM_MAX_COMPLEXITY) {
          score -= 5
        }
      }

      if (projectStats.averageFileLength > LARGE_FILE_LINE_THRESHOLD) {
        score -= 15
      } else if (projectStats.averageFileLength > MEDIUM_FILE_LINE_THRESHOLD) {
        score -= 5
      }

      if (projectStats.languages.size > MANY_LANGUAGES_THRESHOLD) {
        score -= 15
      } else if (projectStats.languages.size > SEVERAL_LANGUAGES_THRESHOLD) {
        score -= 5
      }

      const blankRatio = projectStats.totalBlankLines / (projectStats.totalLinesOfCode + projectStats.totalCommentLines + projectStats.totalBlankLines)
      if (blankRatio > 0.4) {
        score -= 15
      } else if (blankRatio > 0.3) {
        score -= 5
      }
    }

    return clampPercent(score)
  }
}
