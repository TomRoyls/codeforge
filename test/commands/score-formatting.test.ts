import chalk from 'chalk'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  formatDisplayOutput,
  formatScore,
  generateSuggestions,
} from '../../src/commands/score-formatting.js'
import type { FileScore, ScoreReport } from '../../src/commands/score-helpers.js'

const strip = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

beforeEach(() => {
  chalk.level = 1
})

function makeCategories(overrides: Partial<ScoreReport['categories']> = {}): ScoreReport['categories'] {
  return {
    complexity: { score: 85, violations: 2, weight: 0.3 },
    correctness: { score: 90, violations: 1, weight: 0.25 },
    security: { score: 95, violations: 0, weight: 0.3 },
    patterns: { score: 88, violations: 3, weight: 0.15 },
    ...overrides,
  }
}

function makeReport(overrides: Partial<ScoreReport> = {}): ScoreReport {
  return {
    overall: 90,
    path: '.',
    categories: makeCategories(),
    summary: { filesAnalyzed: 10, totalViolations: 6, violationsPerFile: 0.6 },
    topFiles: [],
    suggestions: [],
    ...overrides,
  }
}

// ─── formatScore ───

describe('formatScore', () => {
  it('returns formatted string with score, max, and weight percentage', () => {
    const result = strip(formatScore(85, 0.3))
    expect(result).toContain('85')
    expect(result).toContain('/ 100')
    expect(result).toContain('weight: 30%')
  })

  it('pads single-digit score to width 3', () => {
    const result = strip(formatScore(5, 0.15))
    expect(result.startsWith('  5')).toBe(true)
  })

  it('pads double-digit score to width 3', () => {
    const result = strip(formatScore(55, 0.25))
    expect(result.startsWith(' 55')).toBe(true)
  })

  it('wraps output with color function based on score', () => {
    const result = formatScore(90, 0.3)
    const stripped = strip(result)
    expect(stripped).toContain('90')
    expect(stripped).toContain('/ 100')
    expect(stripped).toContain('weight: 30%')
  })

  it('formatScore output differs by score level', () => {
    const high = strip(formatScore(90, 0.3))
    const low = strip(formatScore(40, 0.3))
    expect(high).toContain('90')
    expect(low).toContain('40')
  })
})

// ─── generateSuggestions ───

describe('generateSuggestions', () => {
  it('returns empty array when all scores are good', () => {
    const categories = makeCategories()
    const result = generateSuggestions(categories, [], [])
    expect(result).toEqual([])
  })

  it('returns suggestion when complexity < 70', () => {
    const categories = makeCategories({
      complexity: { score: 60, violations: 5, weight: 0.3 },
    })
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Reduce code complexity')
    expect(result[0]).toContain('5 complexity issues')
  })

  it('returns suggestion when correctness < 70', () => {
    const categories = makeCategories({
      correctness: { score: 55, violations: 8, weight: 0.25 },
    })
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Improve code correctness')
    expect(result[0]).toContain('8 correctness issues')
  })

  it('returns suggestion when security < 80', () => {
    const categories = makeCategories({
      security: { score: 75, violations: 3, weight: 0.3 },
    })
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Address security concerns')
    expect(result[0]).toContain('3 security issues')
    expect(result[0]).toContain('critical')
  })

  it('returns suggestion when patterns < 70', () => {
    const categories = makeCategories({
      patterns: { score: 65, violations: 12, weight: 0.15 },
    })
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Refactor code patterns')
    expect(result[0]).toContain('12 pattern violations')
  })

  it('returns suggestion for file with > 10 violations', () => {
    const categories = makeCategories()
    const fileScores: FileScore[] = [
      { filePath: 'src/bad.ts', violations: 15, score: 30, categories: {} },
    ]
    const result = generateSuggestions(categories, [], fileScores)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('src/bad.ts')
    expect(result[0]).toContain('15 violations')
  })

  it('does not suggest file when violations <= 10', () => {
    const categories = makeCategories()
    const fileScores: FileScore[] = [
      { filePath: 'src/ok.ts', violations: 10, score: 80, categories: {} },
    ]
    const result = generateSuggestions(categories, [], fileScores)
    expect(result).toEqual([])
  })

  it('returns multiple suggestions for multiple issues', () => {
    const categories = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
      security: { score: 70, violations: 5, weight: 0.3 },
      patterns: { score: 60, violations: 8, weight: 0.15 },
    })
    const fileScores: FileScore[] = [
      { filePath: 'src/terrible.ts', violations: 20, score: 10, categories: {} },
    ]
    const result = generateSuggestions(categories, [], fileScores)
    expect(result.length).toBeGreaterThanOrEqual(3)
    expect(result.some((s) => s.includes('complexity'))).toBe(true)
    expect(result.some((s) => s.includes('security'))).toBe(true)
    expect(result.some((s) => s.includes('pattern'))).toBe(true)
    expect(result.some((s) => s.includes('terrible.ts'))).toBe(true)
  })
})

// ─── formatDisplayOutput ───

describe('formatDisplayOutput', () => {
  it('prints overall score and grade', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({ overall: 92 })
    formatDisplayOutput(report, false, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Code Quality Score'))).toBe(true)
    expect(stripped.some((l) => l.includes('92') && l.includes('/ 100'))).toBe(true)
    expect(stripped.some((l) => l.includes('(A)'))).toBe(true)
  })

  it('prints all four category scores', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport()
    formatDisplayOutput(report, false, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Complexity:'))).toBe(true)
    expect(stripped.some((l) => l.includes('Correctness:'))).toBe(true)
    expect(stripped.some((l) => l.includes('Security:'))).toBe(true)
    expect(stripped.some((l) => l.includes('Patterns:'))).toBe(true)
  })

  it('prints summary stats', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({
      summary: { filesAnalyzed: 25, totalViolations: 40, violationsPerFile: 1.6 },
    })
    formatDisplayOutput(report, false, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Files analyzed: 25'))).toBe(true)
    expect(stripped.some((l) => l.includes('Total violations: 40'))).toBe(true)
    expect(stripped.some((l) => l.includes('1.60'))).toBe(true)
  })

  it('prints file details when verbose and topFiles has entries', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({
      topFiles: [
        { filePath: 'src/mess.ts', violations: 8, score: 45, categories: { complexity: 5 } },
      ],
    })
    formatDisplayOutput(report, true, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Top Problematic Files'))).toBe(true)
    expect(stripped.some((l) => l.includes('src/mess.ts'))).toBe(true)
    expect(stripped.some((l) => l.includes('Violations: 8'))).toBe(true)
    expect(stripped.some((l) => l.includes('Score: 45/100'))).toBe(true)
    expect(stripped.some((l) => l.includes('complexity: 5'))).toBe(true)
  })

  it('omits file details when verbose is false', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({
      topFiles: [
        { filePath: 'src/mess.ts', violations: 8, score: 45, categories: {} },
      ],
    })
    formatDisplayOutput(report, false, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Top Problematic Files'))).toBe(false)
    expect(stripped.some((l) => l.includes('src/mess.ts'))).toBe(false)
  })

  it('omits file details when topFiles is empty even if verbose', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({ topFiles: [] })
    formatDisplayOutput(report, true, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Top Problematic Files'))).toBe(false)
  })

  it('prints suggestions when they exist', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({
      suggestions: ['Fix complexity issues', 'Address security concerns'],
    })
    formatDisplayOutput(report, false, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Improvement Suggestions'))).toBe(true)
    expect(stripped.some((l) => l.includes('Fix complexity issues'))).toBe(true)
    expect(stripped.some((l) => l.includes('Address security concerns'))).toBe(true)
  })

  it('omits suggestions section when suggestions are empty', () => {
    const logs: string[] = []
    const logFn = (msg: string) => { logs.push(msg) }
    const report = makeReport({ suggestions: [] })
    formatDisplayOutput(report, false, logFn)
    const stripped = logs.map(strip)
    expect(stripped.some((l) => l.includes('Improvement Suggestions'))).toBe(false)
  })
})
