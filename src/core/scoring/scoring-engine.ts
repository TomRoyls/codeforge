import type { QualityDimension } from './types.js'
import type { DimensionScore, DimensionFinding } from './types.js'
import type { QualityScore, QualitySnapshot, QualityTrend } from './types.js'
import type { QualityReport, QualityRecommendation } from './types.js'
import {
  QUALITY_DIMENSIONS,
  GRADE_THRESHOLDS,
} from './types.js'
import { roundTo, clamp } from '../../utils/math-helpers.js'

// ─── Scoring Thresholds ───
const GOOD_DIMENSION_PERCENTAGE = 80
const POOR_DIMENSION_PERCENTAGE = 40
const MEDIUM_DIMENSION_PERCENTAGE = 60
const HIGH_CHANGE_RATE_THRESHOLD = 2
const CYCLOMATIC_COMPLEXITY_THRESHOLD = 10
const MAX_CYCLOMATIC_COMPLEXITY_THRESHOLD = 20
const COGNITIVE_COMPLEXITY_THRESHOLD = 15
const LONG_FUNCTION_LINE_COUNT = 50
const LONG_FUNCTION_PENALTY_CAP = 50
const ANY_TYPE_PERCENT_THRESHOLD = 5
const ANY_TYPE_PENALTY = 20
const IMPLICIT_ANY_PENALTY_CAP = 50
const TYPE_ASSERTION_PENALTY_CAP = 50
const NON_NULL_ASSERTION_PENALTY_CAP = 50
const CRITICAL_COVERAGE_THRESHOLD = 40
const LOW_COVERAGE_THRESHOLD = 60
const TARGET_COVERAGE_THRESHOLD = 80

export class ScoringEngine {
  private dimensions: QualityDimension[]
  private history: QualitySnapshot[]

  constructor(dimensions?: QualityDimension[]) {
    this.dimensions = dimensions ?? [...QUALITY_DIMENSIONS]
    this.history = []
  }

  calculateScore(metrics: Record<string, number>, filePath?: string): QualityScore {
    const dimensionScores: DimensionScore[] = this.dimensions.map((dim) =>
      this.calculateDimensionScore(dim.id, metrics),
    )

    const overall = this.calculateOverallScore(dimensionScores)
    const percentage = roundTo(overall, 2)

    return {
      overall,
      maxScore: 100,
      percentage,
      grade: this.getGrade(percentage),
      dimensions: dimensionScores,
      timestamp: Date.now(),
      filePath,
      metadata: {},
    }
  }

  calculateDimensionScore(dimensionId: string, metrics: Record<string, number>): DimensionScore {
    const dimension = this.dimensions.find((d) => d.id === dimensionId)
    if (!dimension) {
      throw new Error(`Unknown dimension: ${dimensionId}`)
    }

    const findings: DimensionFinding[] = []
    let score = dimension.maxScore

    switch (dimensionId) {
      case 'complexity':
        score = this.calculateComplexity(metrics, findings)
        break
      case 'type-safety':
        score = this.calculateTypeSafety(metrics, findings)
        break
      case 'security':
        score = this.calculateSecurity(metrics, findings)
        break
      case 'maintainability':
        score = this.calculateMaintainability(metrics, findings)
        break
      case 'performance':
        score = this.calculatePerformance(metrics, findings)
        break
      case 'testing':
        score = this.calculateTesting(metrics, findings)
        break
      default:
        score = metrics[dimensionId] ?? 0
        break
    }

    score = clamp(score, 0, dimension.maxScore)
    const percentage = dimension.maxScore > 0 ? Math.round((score / dimension.maxScore) * 10000) / 100 : 0

    return {
      dimension,
      score,
      maxScore: dimension.maxScore,
      percentage,
      grade: this.getGrade(percentage),
      findings,
    }
  }

  calculateOverallScore(dimensionScores: DimensionScore[]): number {
    let totalWeight = 0
    let weightedSum = 0

    for (const ds of dimensionScores) {
      weightedSum += ds.percentage * ds.dimension.weight
      totalWeight += ds.dimension.weight
    }

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0
  }

  getGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (percentage >= (GRADE_THRESHOLDS['A'] ?? 90)) return 'A'
    if (percentage >= (GRADE_THRESHOLDS['B'] ?? 75)) return 'B'
    if (percentage >= (GRADE_THRESHOLDS['C'] ?? 60)) return 'C'
    if (percentage >= (GRADE_THRESHOLDS['D'] ?? 40)) return 'D'
    return 'F'
  }

  generateRecommendations(score: QualityScore): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = []

    for (const ds of score.dimensions) {
      if (ds.percentage < GOOD_DIMENSION_PERCENTAGE) {
        let priority: QualityRecommendation['priority']
        if (ds.percentage < POOR_DIMENSION_PERCENTAGE) {
          priority = 'critical'
        } else if (ds.percentage < MEDIUM_DIMENSION_PERCENTAGE) {
          priority = 'high'
        } else {
          priority = 'medium'
        }

        recommendations.push({
          dimension: ds.dimension.id,
          priority,
          message: `${ds.dimension.name} score is ${ds.percentage}% (${ds.grade})`,
          impact: Math.round((100 - ds.percentage) * ds.dimension.weight / 100),
          effort: Math.round((100 - ds.percentage) / 20),
          suggestion: this.getSuggestion(ds.dimension.id, ds.percentage),
        })
      }
    }

    recommendations.sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
    })

    return recommendations
  }

  createReport(metrics: Record<string, number>, filePath?: string): QualityReport {
    const score = this.calculateScore(metrics, filePath)
    const recommendations = this.generateRecommendations(score)

    return {
      score,
      recommendations,
      trends: this.history.length > 0 ? this.getTrend() : undefined,
    }
  }

  saveSnapshot(
    score: QualityScore,
    options?: { filePath?: string; tags?: string[]; branch?: string; commit?: string },
  ): QualitySnapshot {
    const snapshot: QualitySnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      score,
      filePath: options?.filePath,
      createdAt: Date.now(),
      tags: options?.tags ?? [],
      branch: options?.branch,
      commit: options?.commit,
    }

    this.history.push(snapshot)
    return snapshot
  }

  getTrend(period?: { from: number; to: number }): QualityTrend {
    let snapshots = this.history
    if (period) {
      snapshots = snapshots.filter(
        (s) => s.createdAt >= period.from && s.createdAt <= period.to,
      )
    }

    if (snapshots.length === 0) {
      return {
        snapshots: [],
        direction: 'stable',
        changeRate: 0,
        period: period ?? { from: 0, to: Date.now() },
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
      }
    }

    const scores = snapshots.map((s) => s.score.percentage)
    let sum = 0
    let bestScore = scores[0]!
    let worstScore = scores[0]!
    for (let i = 0; i < scores.length; i++) {
      sum += scores[i]!
      if (scores[i]! > bestScore) bestScore = scores[i]!
      if (scores[i]! < worstScore) worstScore = scores[i]!
    }
    const averageScore = sum / scores.length

    let changeRate = 0
    if (snapshots.length >= 2) {
      let changeSum = 0
      for (let i = 1; i < snapshots.length; i++) {
        changeSum += snapshots[i]!.score.percentage - snapshots[i - 1]!.score.percentage
      }
      changeRate = changeSum / (snapshots.length - 1)
    }

    let direction: QualityTrend['direction']
    if (changeRate > HIGH_CHANGE_RATE_THRESHOLD) {
      direction = 'improving'
    } else if (changeRate < -HIGH_CHANGE_RATE_THRESHOLD) {
      direction = 'declining'
    } else {
      direction = 'stable'
    }

    const fromTime = snapshots[0]!.createdAt
    const toTime = snapshots[snapshots.length - 1]!.createdAt

    return {
      snapshots,
      direction,
      changeRate: roundTo(changeRate, 2),
      period: { from: fromTime, to: toTime },
      averageScore: roundTo(averageScore, 2),
      bestScore: roundTo(bestScore, 2),
      worstScore: roundTo(worstScore, 2),
    }
  }

  getSnapshots(): QualitySnapshot[] {
    return [...this.history]
  }

  getSnapshotsByTag(tag: string): QualitySnapshot[] {
    return this.history.filter((s) => s.tags.includes(tag))
  }

  getSnapshotsByFile(filePath: string): QualitySnapshot[] {
    return this.history.filter((s) => s.filePath === filePath)
  }

  compareSnapshots(
    old: QualitySnapshot,
    current: QualitySnapshot,
  ): { improved: string[]; declined: string[]; unchanged: string[] } {
    const improved: string[] = []
    const declined: string[] = []
    const unchanged: string[] = []

    const oldMap = new Map<string, DimensionScore>()
    for (const ds of old.score.dimensions) {
      oldMap.set(ds.dimension.id, ds)
    }

    for (const currentDs of current.score.dimensions) {
      const oldDs = oldMap.get(currentDs.dimension.id)
      if (!oldDs) {
        unchanged.push(currentDs.dimension.id)
        continue
      }

      if (currentDs.percentage > oldDs.percentage) {
        improved.push(currentDs.dimension.id)
      } else if (currentDs.percentage < oldDs.percentage) {
        declined.push(currentDs.dimension.id)
      } else {
        unchanged.push(currentDs.dimension.id)
      }
    }

    return { improved, declined, unchanged }
  }

  clearHistory(): void {
    this.history = []
  }

  private calculateComplexity(metrics: Record<string, number>, findings: DimensionFinding[]): number {
    let score = 100

    const avgCyclomatic = metrics['avgCyclomatic'] ?? 0
    if (avgCyclomatic > CYCLOMATIC_COMPLEXITY_THRESHOLD) {
      score -= 10
      findings.push({
        type: 'negative',
        message: `Average cyclomatic complexity (${avgCyclomatic}) exceeds threshold (${CYCLOMATIC_COMPLEXITY_THRESHOLD})`,
        impact: -10,
      })
    } else {
      findings.push({
        type: 'positive',
        message: `Average cyclomatic complexity (${avgCyclomatic}) is within acceptable range`,
        impact: 0,
      })
    }

    const maxCyclomatic = metrics['maxCyclomatic'] ?? 0
    if (maxCyclomatic > MAX_CYCLOMATIC_COMPLEXITY_THRESHOLD) {
      score -= 15
      findings.push({
        type: 'negative',
        message: `Max cyclomatic complexity (${maxCyclomatic}) exceeds threshold (${MAX_CYCLOMATIC_COMPLEXITY_THRESHOLD})`,
        impact: -15,
      })
    }

    const avgCognitive = metrics['avgCognitive'] ?? 0
    if (avgCognitive > COGNITIVE_COMPLEXITY_THRESHOLD) {
      score -= 10
      findings.push({
        type: 'negative',
        message: `Average cognitive complexity (${avgCognitive}) exceeds threshold (${COGNITIVE_COMPLEXITY_THRESHOLD})`,
        impact: -10,
      })
    }

    const longFunctions = metrics['longFunctions'] ?? 0
    if (longFunctions > 0) {
      const penalty = Math.min(longFunctions * 5, LONG_FUNCTION_PENALTY_CAP)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${longFunctions} functions exceed ${LONG_FUNCTION_LINE_COUNT} lines`,
        impact: -penalty,
      })
    }

    return score
  }

  private calculateTypeSafety(metrics: Record<string, number>, findings: DimensionFinding[]): number {
    let score = 100

    const anyPercent = metrics['anyPercent'] ?? 0
    if (anyPercent > ANY_TYPE_PERCENT_THRESHOLD) {
      score -= ANY_TYPE_PENALTY
      findings.push({
        type: 'negative',
        message: `Any type usage (${anyPercent}%) exceeds threshold (${ANY_TYPE_PERCENT_THRESHOLD}%)`,
        impact: -ANY_TYPE_PENALTY,
      })
    } else {
      findings.push({
        type: 'positive',
        message: `Any type usage (${anyPercent}%) is within acceptable range`,
        impact: 0,
      })
    }

    const implicitAny = metrics['implicitAny'] ?? 0
    if (implicitAny > 0) {
      const penalty = Math.min(implicitAny * 5, IMPLICIT_ANY_PENALTY_CAP)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${implicitAny} implicit any types found`,
        impact: -penalty,
      })
    }

    const typeAssertions = metrics['typeAssertions'] ?? 0
    if (typeAssertions > 0) {
      const penalty = Math.min(typeAssertions * 3, TYPE_ASSERTION_PENALTY_CAP)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${typeAssertions} type assertions found`,
        impact: -penalty,
      })
    }

    const nonNullAssertions = metrics['nonNullAssertions'] ?? 0
    if (nonNullAssertions > 0) {
      const penalty = Math.min(nonNullAssertions * 2, NON_NULL_ASSERTION_PENALTY_CAP)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${nonNullAssertions} non-null assertions found`,
        impact: -penalty,
      })
    }

    return score
  }

  private calculateSecurity(metrics: Record<string, number>, findings: DimensionFinding[]): number {
    let score = 100

    const critical = metrics['criticalVulns'] ?? 0
    if (critical > 0) {
      const penalty = Math.min(critical * 25, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${critical} critical security vulnerabilities found`,
        impact: -penalty,
      })
    }

    const high = metrics['highVulns'] ?? 0
    if (high > 0) {
      const penalty = Math.min(high * 15, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${high} high security vulnerabilities found`,
        impact: -penalty,
      })
    }

    const medium = metrics['mediumVulns'] ?? 0
    if (medium > 0) {
      const penalty = Math.min(medium * 5, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${medium} medium security vulnerabilities found`,
        impact: -penalty,
      })
    }

    const low = metrics['lowVulns'] ?? 0
    if (low > 0) {
      const penalty = Math.min(low * 2, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${low} low security vulnerabilities found`,
        impact: -penalty,
      })
    }

    if (critical === 0 && high === 0 && medium === 0 && low === 0) {
      findings.push({
        type: 'positive',
        message: 'No security vulnerabilities detected',
        impact: 0,
      })
    }

    return score
  }

  private calculateMaintainability(metrics: Record<string, number>, findings: DimensionFinding[]): number {
    let score = 100

    const circularDeps = metrics['circularDeps'] ?? 0
    if (circularDeps > 0) {
      const penalty = Math.min(circularDeps * 10, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${circularDeps} circular dependencies detected`,
        impact: -penalty,
      })
    }

    const deadModules = metrics['deadModules'] ?? 0
    if (deadModules > 0) {
      const penalty = Math.min(deadModules * 5, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${deadModules} dead modules detected`,
        impact: -penalty,
      })
    }

    const coupling = metrics['coupling'] ?? 0
    if (coupling > 10) {
      score -= 15
      findings.push({
        type: 'negative',
        message: `Coupling score (${coupling}) exceeds threshold (10)`,
        impact: -15,
      })
    }

    const unusedExports = metrics['unusedExports'] ?? 0
    if (unusedExports > 0) {
      const penalty = Math.min(unusedExports * 2, 50)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${unusedExports} unused exports detected`,
        impact: -penalty,
      })
    }

    return score
  }

  private calculatePerformance(metrics: Record<string, number>, findings: DimensionFinding[]): number {
    let score = 100

    const syncFileReads = metrics['syncFileReads'] ?? 0
    if (syncFileReads > 0) {
      const penalty = Math.min(syncFileReads * 10, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${syncFileReads} synchronous file reads detected`,
        impact: -penalty,
      })
    }

    const unboundedLoops = metrics['unboundedLoops'] ?? 0
    if (unboundedLoops > 0) {
      const penalty = Math.min(unboundedLoops * 15, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${unboundedLoops} unbounded loops detected`,
        impact: -penalty,
      })
    }

    const memoryLeaks = metrics['memoryLeaks'] ?? 0
    if (memoryLeaks > 0) {
      const penalty = Math.min(memoryLeaks * 20, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${memoryLeaks} potential memory leaks detected`,
        impact: -penalty,
      })
    }

    const blockingCalls = metrics['blockingCalls'] ?? 0
    if (blockingCalls > 0) {
      const penalty = Math.min(blockingCalls * 5, 100)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${blockingCalls} blocking calls detected`,
        impact: -penalty,
      })
    }

    return score
  }

  private calculateTesting(metrics: Record<string, number>, findings: DimensionFinding[]): number {
    let score = 100

    const coverage = metrics['coverage'] ?? 100

    if (coverage < CRITICAL_COVERAGE_THRESHOLD) {
      score -= 40
      findings.push({
        type: 'negative',
        message: `Test coverage (${coverage}%) is critically low (<${CRITICAL_COVERAGE_THRESHOLD}%)`,
        impact: -40,
      })
    } else if (coverage < LOW_COVERAGE_THRESHOLD) {
      score -= 30
      findings.push({
        type: 'negative',
        message: `Test coverage (${coverage}%) is below recommended level (<${LOW_COVERAGE_THRESHOLD}%)`,
        impact: -30,
      })
    } else if (coverage < TARGET_COVERAGE_THRESHOLD) {
      score -= 20
      findings.push({
        type: 'negative',
        message: `Test coverage (${coverage}%) is below target (<${TARGET_COVERAGE_THRESHOLD}%)`,
        impact: -20,
      })
    } else {
      findings.push({
        type: 'positive',
        message: `Test coverage (${coverage}%) meets target (>=${TARGET_COVERAGE_THRESHOLD}%)`,
        impact: 0,
      })
    }

    const skippedTests = metrics['skippedTests'] ?? 0
    if (skippedTests > 0) {
      const penalty = Math.min(skippedTests * 3, 50)
      score -= penalty
      findings.push({
        type: 'negative',
        message: `${skippedTests} skipped tests detected`,
        impact: -penalty,
      })
    }

    return score
  }

  private getSuggestion(dimensionId: string, percentage: number): string {
    const suggestions: Record<string, Record<string, string>> = {
      complexity: {
        low: 'Refactor complex functions into smaller, focused units. Consider extracting helper methods and reducing nesting depth.',
        medium: 'Review functions with high cyclomatic complexity. Break down complex conditionals and consider using early returns.',
        high: 'Critical: Simplify highly complex code immediately. Functions with excessive complexity are error-prone and hard to maintain.',
      },
      'type-safety': {
        low: 'Replace `any` types with proper TypeScript types. Use generics and utility types for better type coverage.',
        medium: 'Reduce implicit any usage and type assertions. Enable strict mode compiler options.',
        high: 'Critical: Address widespread type safety issues. Strong typing prevents runtime errors and improves code reliability.',
      },
      security: {
        low: 'Update dependencies with known vulnerabilities. Review and fix remaining security issues.',
        medium: 'Address high and critical security vulnerabilities immediately. Review input validation and sanitization.',
        high: 'Critical: Urgent security issues detected. Fix critical vulnerabilities before deployment.',
      },
      maintainability: {
        low: 'Remove unused exports and reduce coupling between modules.',
        medium: 'Break circular dependencies and refactor tightly coupled code.',
        high: 'Critical: Codebase has severe maintainability issues. Major refactoring needed to reduce coupling and dead code.',
      },
      performance: {
        low: 'Review identified performance anti-patterns and optimize where possible.',
        medium: 'Replace synchronous operations with async alternatives. Fix memory leak patterns.',
        high: 'Critical: Significant performance issues detected that may impact production stability.',
      },
      testing: {
        low: 'Add tests for uncovered code paths. Review skipped tests.',
        medium: 'Increase test coverage to at least 80%. Focus on critical business logic.',
        high: 'Critical: Very low test coverage. Writing tests should be the top priority.',
      },
    }

    const level = percentage < POOR_DIMENSION_PERCENTAGE ? 'high' : percentage < MEDIUM_DIMENSION_PERCENTAGE ? 'medium' : 'low'
    const dimensionSuggestions = suggestions[dimensionId]
    if (dimensionSuggestions) {
      return dimensionSuggestions[level] ?? 'Review and improve this area.'
    }
    return 'Review and improve this area.'
  }
}
