import { describe, it, expect } from 'vitest'

import {
  formatDisplayOutput,
  formatScore,
  generateSuggestions,
  getGrade,
  getScoreColor,
} from '../src/commands/score-formatting.js'
import type { FileScore, ScoreReport } from '../src/commands/score-helpers.js'

// ─── formatScore ─────────────────────────────────────────
describe('score-formatting - formatScore', () => {
  it('formats score with weight percentage', () => {
    const result = formatScore(85, 0.3)
    expect(result).toContain('85')
    expect(result).toContain('100')
    expect(result).toContain('30%')
  })

  it('pads score to field width', () => {
    const result = formatScore(5, 0.15)
    expect(result).toContain('5')
  })
})

// ─── generateSuggestions ─────────────────────────────────
describe('score-formatting - generateSuggestions', () => {
  const makeCategories = (overrides?: Partial<ScoreReport['categories']>): ScoreReport['categories'] => ({
    complexity: { score: 80, violations: 2, weight: 0.3 },
    correctness: { score: 90, violations: 1, weight: 0.25 },
    patterns: { score: 85, violations: 1, weight: 0.15 },
    security: { score: 95, violations: 0, weight: 0.3 },
    ...overrides,
  })

  it('returns empty array when all scores are good', () => {
    const suggestions = generateSuggestions(makeCategories(), [], [])
    expect(suggestions).toHaveLength(0)
  })

  it('suggests reducing complexity when score < 70', () => {
    const categories = makeCategories({ complexity: { score: 60, violations: 8, weight: 0.3 } })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some(s => s.includes('complexity'))).toBe(true)
  })

  it('suggests improving correctness when score < 70', () => {
    const categories = makeCategories({ correctness: { score: 50, violations: 10, weight: 0.25 } })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some(s => s.includes('correctness'))).toBe(true)
  })

  it('suggests addressing security when score < 80', () => {
    const categories = makeCategories({ security: { score: 70, violations: 6, weight: 0.3 } })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some(s => s.includes('security'))).toBe(true)
  })

  it('suggests refactoring patterns when score < 70', () => {
    const categories = makeCategories({ patterns: { score: 60, violations: 8, weight: 0.15 } })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some(s => s.includes('pattern'))).toBe(true)
  })

  it('suggests focusing on file with > 10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'bad.ts', score: 50, violations: 15, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions.some(s => s.includes('bad.ts'))).toBe(true)
  })

  it('does not suggest file with <= 10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'ok.ts', score: 90, violations: 5, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions.some(s => s.includes('ok.ts'))).toBe(false)
  })
})

// ─── formatDisplayOutput ─────────────────────────────────
describe('score-formatting - formatDisplayOutput', () => {
  const makeReport = (overrides?: Partial<ScoreReport>): ScoreReport => ({
    categories: {
      complexity: { score: 80, violations: 2, weight: 0.3 },
      correctness: { score: 90, violations: 1, weight: 0.25 },
      patterns: { score: 85, violations: 1, weight: 0.15 },
      security: { score: 95, violations: 0, weight: 0.3 },
    },
    overall: 88,
    path: '.',
    suggestions: [],
    summary: {
      filesAnalyzed: 10,
      totalViolations: 4,
      violationsPerFile: 0.4,
    },
    topFiles: [],
    ...overrides,
  })

  it('calls logFn with score header', () => {
    const logs: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => logs.push(msg))
    expect(logs.some(l => l.includes('Code Quality Score'))).toBe(true)
  })

  it('shows category scores', () => {
    const logs: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('Complexity')
    expect(output).toContain('Correctness')
    expect(output).toContain('Security')
    expect(output).toContain('Patterns')
  })

  it('shows summary', () => {
    const logs: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('10')
    expect(output).toContain('4')
  })

  it('shows top files in verbose mode', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'bad.ts', score: 50, violations: 15, categories: { complexity: 5 } }],
    })
    const logs: string[] = []
    formatDisplayOutput(report, true, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('bad.ts')
    expect(output).toContain('15')
  })

  it('does not show top files when not verbose', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'bad.ts', score: 50, violations: 15, categories: {} }],
    })
    const logs: string[] = []
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).not.toContain('Top Problematic Files')
  })

  it('shows suggestions when present', () => {
    const report = makeReport({ suggestions: ['Fix complexity issues'] })
    const logs: string[] = []
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('Fix complexity issues')
  })
})

// ─── re-exports ──────────────────────────────────────────
describe('score-formatting - re-exports', () => {
  it('exports getGrade from formatting utils', () => {
    expect(typeof getGrade).toBe('function')
    expect(getGrade(95)).toBe('(A)')
    expect(getGrade(30)).toBe('(F)')
  })

  it('exports getScoreColor from formatting utils', () => {
    expect(typeof getScoreColor).toBe('function')
    expect(typeof getScoreColor(90)).toBe('function')
  })
})
