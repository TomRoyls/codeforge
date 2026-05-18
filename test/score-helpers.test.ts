import { describe, it, expect } from 'vitest'
import {
  buildCategoryCounts,
  buildFileCategoryCounts,
  buildScoreReport,
  type CategoryViolationCounts,
} from '../src/commands/score-helpers.js'

// ─── buildCategoryCounts ────────────────────────────────
describe('buildCategoryCounts', () => {
  const getCat = (ruleId: string) => {
    if (ruleId.startsWith('complexity')) return 'complexity'
    if (ruleId.startsWith('security')) return 'security'
    if (ruleId.startsWith('pattern')) return 'patterns'
    return 'correctness'
  }

  it('returns zeros for empty violations array', () => {
    const result = buildCategoryCounts([], getCat)
    expect(result).toEqual({ complexity: 0, correctness: 0, patterns: 0, security: 0 })
  })

  it('counts violations per category correctly', () => {
    const violations = [
      { ruleId: 'complexity-1' },
      { ruleId: 'complexity-2' },
      { ruleId: 'security-1' },
      { ruleId: 'other-rule' },
    ] as any
    const result = buildCategoryCounts(violations, getCat)
    expect(result.complexity).toBe(2)
    expect(result.security).toBe(1)
    expect(result.correctness).toBe(1)
    expect(result.patterns).toBe(0)
  })

  it('ignores violations with unknown categories', () => {
    const violations = [
      { ruleId: 'unknown-rule' },
    ] as any
    const result = buildCategoryCounts(violations, getCat)
    expect(result.complexity).toBe(0)
    expect(result.correctness).toBe(1)
  })
})

// ─── buildFileCategoryCounts ────────────────────────────
describe('buildFileCategoryCounts', () => {
  const getCat = (ruleId: string) => ruleId.split('-')[0] ?? 'unknown'

  it('returns empty object for no violations', () => {
    const result = buildFileCategoryCounts([], getCat)
    expect(result).toEqual({})
  })

  it('counts categories as generic string keys', () => {
    const violations = [
      { ruleId: 'foo-1' },
      { ruleId: 'foo-2' },
      { ruleId: 'bar-1' },
    ] as any
    const result = buildFileCategoryCounts(violations, getCat)
    expect(result).toEqual({ foo: 2, bar: 1 })
  })
})

// ─── buildScoreReport ───────────────────────────────────
describe('buildScoreReport', () => {
  it('builds a complete score report', () => {
    const categoryViolations: CategoryViolationCounts = {
      complexity: 2,
      correctness: 0,
      patterns: 1,
      security: 0,
    }
    const report = buildScoreReport(
      categoryViolations,
      10,
      8,
      [],
      [],
      5,
      '/project',
    )

    expect(report.path).toBe('/project')
    expect(report.summary.filesAnalyzed).toBe(5)
    expect(report.summary.totalViolations).toBe(0)
    expect(report.summary.violationsPerFile).toBe(0)
    expect(report.topFiles).toEqual([])
    expect(report.categories.complexity.violations).toBe(2)
    expect(report.categories.correctness.violations).toBe(0)
    expect(report.categories.patterns.violations).toBe(1)
    expect(report.categories.security.violations).toBe(0)
  })

  it('calculates violationsPerFile correctly', () => {
    const violations = [{ ruleId: 'x' }, { ruleId: 'y' }, { ruleId: 'z' }] as any
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      0,
      0,
      [],
      violations,
      3,
      '.',
    )
    expect(report.summary.violationsPerFile).toBeCloseTo(1, 5)
  })

  it('handles zero files gracefully', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      0,
      0,
      [],
      [],
      0,
      '.',
    )
    expect(report.summary.violationsPerFile).toBe(0)
    expect(report.summary.filesAnalyzed).toBe(0)
  })

  it('limits topFiles to MAX_TOP_STATS_FILES', () => {
    const fileScores = Array.from({ length: 20 }, (_, i) => ({
      categories: {},
      filePath: `file${i}.ts`,
      score: 100 - i,
      violations: i,
    }))
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      0,
      0,
      fileScores,
      [],
      1,
      '.',
    )
    expect(report.topFiles.length).toBeLessThanOrEqual(10)
  })

  it('contains suggestions array', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      0,
      0,
      [],
      [],
      1,
      '.',
    )
    expect(Array.isArray(report.suggestions)).toBe(true)
  })
})
