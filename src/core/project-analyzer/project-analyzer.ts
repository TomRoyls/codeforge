import type { FileInfo } from './types.js'
import type { ProjectStats } from './types.js'
import type { ComplexityMetrics } from './types.js'
import type { DependencyMetrics } from './types.js'
import type { ProjectHealth, HealthIssue } from './types.js'
import type { AnalysisResult } from './types.js'
import { clampPercent, roundTo } from '../../utils/math-helpers.js'
import { sortedBy, sortedByDesc } from '../../utils/array-helpers.js'

const GRADE_A_THRESHOLD = 90
const GRADE_B_THRESHOLD = 75
const GRADE_C_THRESHOLD = 60
const GRADE_D_THRESHOLD = 40

export class ProjectAnalyzer {
  analyze(files: FileInfo[]): AnalysisResult {
    const stats = this.computeStats(files)
    const complexity = this.computeComplexity(files)
    const dependencies = this.computeDependencies(files)
    const health = this.computeHealth(stats, complexity, dependencies)

    return {
      stats,
      complexity,
      dependencies,
      health,
      timestamp: Date.now(),
    }
  }

  computeStats(files: FileInfo[]): ProjectStats {
    const totalFiles = files.length
    const totalLines = files.reduce((sum, f) => sum + f.lines, 0)
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)

    const languages: Record<string, number> = {}
    const extensions: Record<string, number> = {}

    for (const file of files) {
      languages[file.language] = (languages[file.language] ?? 0) + 1
      extensions[file.extension] = (extensions[file.extension] ?? 0) + 1
    }

    return {
      totalFiles,
      totalLines,
      totalSize,
      languages,
      extensions,
      avgFileSize: totalFiles > 0 ? totalSize / totalFiles : 0,
      avgFileLines: totalFiles > 0 ? totalLines / totalFiles : 0,
    }
  }

  computeComplexity(files: FileInfo[]): ComplexityMetrics {
    let totalFunctions = 0
    let totalClasses = 0
    let totalImports = 0
    let totalExports = 0
    let totalLines = 0

    for (const file of files) {
      totalLines += file.lines
      totalFunctions += Math.max(0, Math.floor(file.lines / 15))
      totalClasses += Math.max(0, Math.floor(file.lines / 100))
      totalImports += Math.max(0, Math.floor(file.lines / 20))
      totalExports += Math.max(0, Math.floor(file.lines / 25))
    }

    const linesOfCode = Math.floor(totalLines * 0.7)
    const commentLines = Math.floor(totalLines * 0.15)
    const blankLines = totalLines - linesOfCode - commentLines
    const cyclomaticComplexity = totalFunctions * 2

    const metrics: ComplexityMetrics = {
      cyclomaticComplexity,
      linesOfCode,
      commentLines,
      blankLines,
      functions: totalFunctions,
      classes: totalClasses,
      imports: totalImports,
      exports: totalExports,
      maintainabilityIndex: 0,
    }

    metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(metrics)

    return metrics
  }

  private computeDependencies(files: FileInfo[]): DependencyMetrics {
    const totalImports = files.reduce(
      (sum, f) => sum + Math.max(0, Math.floor(f.lines / 20)),
      0,
    )
    const externalDeps = Math.floor(totalImports * 0.4)
    const internalDeps = totalImports - externalDeps

    return {
      totalDependencies: totalImports,
      externalDependencies: externalDeps,
      internalDependencies: internalDeps,
      circularDependencies: 0,
      dependencyDepth:
        files.length > 0 ? Math.min(Math.ceil(Math.log2(files.length + 1)), 10) : 0,
    }
  }

  computeHealth(
    stats: ProjectStats,
    complexity: ComplexityMetrics,
    deps: DependencyMetrics,
  ): ProjectHealth {
    const issues: HealthIssue[] = []
    let score = 100

    if (stats.totalFiles === 0) {
      const health: ProjectHealth = {
        score: 0,
        grade: 'F',
        issues: [{ category: 'general', severity: 'error', message: 'No files found in project' }],
        suggestions: [],
      }
      health.suggestions = this.generateSuggestions(health)
      return health
    }

    const avgComplexity =
      complexity.functions > 0
        ? complexity.cyclomaticComplexity / complexity.functions
        : 0

    if (avgComplexity > 10) {
      score -= 15
      issues.push({
        category: 'complexity',
        severity: 'error',
        message: 'Average cyclomatic complexity exceeds threshold',
      })
    } else if (avgComplexity > 5) {
      score -= 5
      issues.push({
        category: 'complexity',
        severity: 'warning',
        message: 'Average cyclomatic complexity is above recommended level',
      })
    }

    if (stats.avgFileLines > 500) {
      score -= 10
      issues.push({
        category: 'size',
        severity: 'warning',
        message: 'Average file size exceeds recommended limit',
      })
    }

    const commentRatio =
      complexity.linesOfCode > 0
        ? complexity.commentLines / complexity.linesOfCode
        : 0
    if (commentRatio < 0.1 && complexity.linesOfCode > 0) {
      score -= 10
      issues.push({
        category: 'documentation',
        severity: 'warning',
        message: 'Low comment ratio detected',
      })
    }

    if (deps.circularDependencies > 0) {
      score -= 20
      issues.push({
        category: 'dependencies',
        severity: 'error',
        message: `${deps.circularDependencies} circular dependencies detected`,
      })
    }

    if (deps.externalDependencies > 50) {
      score -= 10
      issues.push({
        category: 'dependencies',
        severity: 'warning',
        message: 'High number of external dependencies',
      })
    }

    if (stats.totalFiles < 3) {
      score -= 5
      issues.push({
        category: 'size',
        severity: 'info',
        message: 'Project has very few files',
      })
    }

    score = clampPercent(score)

    const health: ProjectHealth = {
      score,
      grade: this.getGrade(score),
      issues,
      suggestions: [],
    }

    health.suggestions = this.generateSuggestions(health)

    return health
  }

  getLanguageDistribution(
    stats: ProjectStats,
  ): Array<{ language: string; count: number; percentage: number }> {
    const total = stats.totalFiles
    const entries = Object.entries(stats.languages)

    return entries
      .map(([language, count]) => ({
        language,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }

  getExtensionDistribution(
    stats: ProjectStats,
  ): Array<{ extension: string; count: number; percentage: number }> {
    const total = stats.totalFiles
    const entries = Object.entries(stats.extensions)

    return entries
      .map(([extension, count]) => ({
        extension,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }

  getLargestFiles(files: FileInfo[], n: number): FileInfo[] {
    return sortedByDesc(files, f => f.size).slice(0, n)
  }

  getSmallestFiles(files: FileInfo[], n: number): FileInfo[] {
    return sortedBy(files, f => f.size).slice(0, n)
  }

  getMostComplexFiles(files: FileInfo[], n: number): FileInfo[] {
    return [...files]
      .sort((a, b) => {
        const complexityA = Math.max(0, Math.floor(a.lines / 15)) * 2
        const complexityB = Math.max(0, Math.floor(b.lines / 15)) * 2
        return complexityB - complexityA
      })
      .slice(0, n)
  }

  getFileDistributionBySize(files: FileInfo[]): {
    small: number
    medium: number
    large: number
    huge: number
  } {
    const distribution = { small: 0, medium: 0, large: 0, huge: 0 }

    for (const file of files) {
      if (file.lines < 100) {
        distribution.small++
      } else if (file.lines < 500) {
        distribution.medium++
      } else if (file.lines < 1000) {
        distribution.large++
      } else {
        distribution.huge++
      }
    }

    return distribution
  }

  calculateMaintainabilityIndex(complexity: ComplexityMetrics): number {
    if (complexity.linesOfCode === 0) {
      return 100
    }

    const avgLines =
      complexity.functions > 0
        ? complexity.linesOfCode / complexity.functions
        : complexity.linesOfCode
    const avgComplexity =
      complexity.functions > 0
        ? complexity.cyclomaticComplexity / complexity.functions
        : 0
    const commentPercent =
      (complexity.commentLines / complexity.linesOfCode) * 100

    const logLines = Math.log(Math.max(1, avgLines))
    const logComments = Math.log(Math.max(1, commentPercent))

    const raw =
      (171 - 5.2 * logLines - 0.23 * avgComplexity - 16.2 * logComments) *
      100 /
      171

    return clampPercent(roundTo(raw, 2))
  }

  getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= GRADE_A_THRESHOLD) return 'A'
    if (score >= GRADE_B_THRESHOLD) return 'B'
    if (score >= GRADE_C_THRESHOLD) return 'C'
    if (score >= GRADE_D_THRESHOLD) return 'D'
    return 'F'
  }

  generateSuggestions(health: ProjectHealth): string[] {
    const suggestions: string[] = []
    const categories = new Set(health.issues.map((i) => i.category))

    if (categories.has('complexity')) {
      suggestions.push(
        'Consider refactoring complex functions into smaller units',
      )
    }

    if (categories.has('size')) {
      suggestions.push(
        'Break down large files into smaller, focused modules',
      )
    }

    if (categories.has('documentation')) {
      suggestions.push(
        'Add more comments and documentation to improve code readability',
      )
    }

    if (categories.has('dependencies')) {
      const hasCircular = health.issues.some((i) =>
        i.message.includes('circular'),
      )
      if (hasCircular) {
        suggestions.push(
          'Resolve circular dependencies to improve module structure',
        )
      }
      const hasExternal = health.issues.some((i) =>
        i.message.includes('external'),
      )
      if (hasExternal) {
        suggestions.push(
          'Review and reduce external dependencies where possible',
        )
      }
    }

    if (categories.has('general')) {
      suggestions.push('Add source files to the project')
    }

    if (health.score >= GRADE_A_THRESHOLD) {
      suggestions.push(
        'Great code quality! Consider sharing best practices with the team',
      )
    }

    return suggestions
  }
}
