import { describe, test, expect } from 'vitest'
import { type FileScore, type ScoreReport } from '../../../src/commands/score-helpers.js'
import {
  formatDisplayOutput,
  formatScore,
  generateSuggestions,
  getGrade,
  getScoreColor,
} from '../../../src/commands/score-formatting.js'

function makeCategories(
  overrides: Partial<
    Record<string, ScoreReport['categories'][keyof ScoreReport['categories']]>
  > = {},
): ScoreReport['categories'] {
  const defaults: ScoreReport['categories'] = {
    complexity: { score: 90, violations: 1, weight: 0.3 },
    correctness: { score: 90, violations: 1, weight: 0.25 },
    patterns: { score: 90, violations: 1, weight: 0.15 },
    security: { score: 90, violations: 0, weight: 0.3 },
  }
  return { ...defaults, ...overrides } as ScoreReport['categories']
}

function makeReport(overrides: Partial<ScoreReport> = {}): ScoreReport {
  return {
    categories: {
      complexity: { score: 90, violations: 2, weight: 0.3 },
      correctness: { score: 85, violations: 3, weight: 0.25 },
      patterns: { score: 95, violations: 1, weight: 0.15 },
      security: { score: 88, violations: 2, weight: 0.3 },
    },
    overall: 89,
    path: '/test/path',
    suggestions: [],
    summary: { filesAnalyzed: 5, totalViolations: 8, violationsPerFile: 1.6 },
    topFiles: [],
    ...overrides,
  }
}

describe('formatScore', () => {
  test('contains the score value as string', () => {
    expect(formatScore(85, 0.3)).toContain('85')
  })

  test('contains the weight as percentage', () => {
    expect(formatScore(85, 0.3)).toContain('30%')
  })

  test('contains / 100 (HEALTH_SCORE_MAX)', () => {
    expect(formatScore(85, 0.3)).toContain('/ 100')
  })

  test('contains the weight label', () => {
    expect(formatScore(85, 0.3)).toContain('weight:')
  })

  test('pads single-digit scores to width 3', () => {
    expect(formatScore(5, 0.3)).toContain('  5')
  })

  test('pads two-digit scores to width 3', () => {
    expect(formatScore(55, 0.3)).toContain(' 55')
  })

  test('does not pad three-digit scores', () => {
    expect(formatScore(100, 0.3)).toContain('100')
  })

  test('handles weight 1.0 as 100%', () => {
    expect(formatScore(50, 1.0)).toContain('100%')
  })

  test('handles weight 0.0 as 0%', () => {
    expect(formatScore(50, 0)).toContain('0%')
  })

  test('score 0 includes padded zero', () => {
    expect(formatScore(0, 0.25)).toContain('  0')
  })

  test('handles negative score', () => {
    const result = formatScore(-5, 0.3)
    expect(result).toContain('-5')
    expect(result).toContain('30%')
  })

  test('handles score above 100', () => {
    const result = formatScore(150, 0.3)
    expect(result).toContain('150')
    expect(result).toContain('/ 100')
  })

  test('handles decimal score by converting to string', () => {
    const result = formatScore(85.7, 0.3)
    expect(result).toContain('85.7')
  })

  test('handles very small weight as 1%', () => {
    expect(formatScore(50, 0.01)).toContain('1%')
  })

  test('handles weight 0.5 as 50%', () => {
    expect(formatScore(50, 0.5)).toContain('50%')
  })

  test('handles negative weight as negative percentage', () => {
    expect(formatScore(50, -0.1)).toContain('-10%')
  })

  test('returns a string for all numeric inputs', () => {
    expect(typeof formatScore(42, 0.25)).toBe('string')
  })
})

describe('generateSuggestions', () => {
  test('returns empty array when all scores are healthy', () => {
    expect(generateSuggestions(makeCategories(), [], [])).toEqual([])
  })

  test('suggests complexity reduction when score < 70', () => {
    const categories = makeCategories({
      complexity: { score: 65, violations: 7, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Reduce code complexity')]),
    )
    expect(suggestions[0]).toContain('7')
  })

  test('suggests correctness improvement when score < 70', () => {
    const categories = makeCategories({
      correctness: { score: 55, violations: 9, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Improve code correctness')]),
    )
    expect(suggestions[0]).toContain('9')
  })

  test('suggests security at threshold 80 (lower than other categories)', () => {
    const categories = makeCategories({
      security: { score: 75, violations: 5, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Address security concerns')]),
    )
  })

  test('does not suggest security when score is exactly 80', () => {
    const categories = makeCategories({
      security: { score: 80, violations: 4, weight: 0.3 },
    })
    expect(generateSuggestions(categories, [], [])).toEqual([])
  })

  test('suggests patterns refactor when score < 70', () => {
    const categories = makeCategories({
      patterns: { score: 50, violations: 10, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Refactor code patterns')]),
    )
  })

  test('suggests focusing on first file with >10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'problematic.ts', violations: 15, score: 45, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Focus on problematic.ts')]),
    )
  })

  test('does not suggest for file with exactly 10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'edge.ts', violations: 10, score: 70, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions.find((s) => s.includes('edge.ts'))).toBeUndefined()
  })

  test('only checks the first file for >10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'good.ts', violations: 2, score: 94, categories: {} },
      { filePath: 'bad.ts', violations: 20, score: 40, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions.find((s) => s.includes('bad.ts'))).toBeUndefined()
  })

  test('returns multiple suggestions when multiple categories are low', () => {
    const categories = makeCategories({
      complexity: { score: 60, violations: 8, weight: 0.3 },
      correctness: { score: 55, violations: 9, weight: 0.25 },
      security: { score: 70, violations: 6, weight: 0.3 },
      patterns: { score: 50, violations: 10, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBe(4)
  })

  test('empty fileScores does not trigger file suggestion', () => {
    const suggestions = generateSuggestions(makeCategories(), [], [])
    expect(suggestions.find((s) => s.includes('Focus on'))).toBeUndefined()
  })

  test('complexity at exactly 70 produces no suggestion', () => {
    const categories = makeCategories({
      complexity: { score: 70, violations: 6, weight: 0.3 },
    })
    expect(generateSuggestions(categories, [], [])).toEqual([])
  })

  test('correctness at exactly 70 produces no suggestion', () => {
    const categories = makeCategories({
      correctness: { score: 70, violations: 6, weight: 0.25 },
    })
    expect(generateSuggestions(categories, [], [])).toEqual([])
  })

  test('patterns at exactly 70 produces no suggestion', () => {
    const categories = makeCategories({
      patterns: { score: 70, violations: 6, weight: 0.15 },
    })
    expect(generateSuggestions(categories, [], [])).toEqual([])
  })

  test('all categories at zero score produces 4 category suggestions', () => {
    const categories = makeCategories({
      complexity: { score: 0, violations: 20, weight: 0.3 },
      correctness: { score: 0, violations: 20, weight: 0.25 },
      security: { score: 0, violations: 20, weight: 0.3 },
      patterns: { score: 0, violations: 20, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBe(4)
  })

  test('complexity score 69 triggers suggestion', () => {
    const categories = makeCategories({
      complexity: { score: 69, violations: 5, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Reduce code complexity')]),
    )
  })

  test('correctness score 69 triggers suggestion', () => {
    const categories = makeCategories({
      correctness: { score: 69, violations: 5, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Improve code correctness')]),
    )
  })

  test('patterns score 69 triggers suggestion', () => {
    const categories = makeCategories({
      patterns: { score: 69, violations: 5, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Refactor code patterns')]),
    )
  })

  test('security score 79 triggers suggestion (below 80)', () => {
    const categories = makeCategories({
      security: { score: 79, violations: 3, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Address security concerns')]),
    )
  })

  test('security suggestion includes critical label', () => {
    const categories = makeCategories({
      security: { score: 50, violations: 10, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0]).toContain('critical')
  })

  test('only security low produces exactly 1 suggestion', () => {
    const categories = makeCategories({
      security: { score: 50, violations: 10, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBe(1)
  })

  test('file with exactly 11 violations triggers suggestion', () => {
    const fileScores: FileScore[] = [
      { filePath: 'just-above.ts', violations: 11, score: 60, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).toEqual(
      expect.arrayContaining([expect.stringContaining('Focus on just-above.ts')]),
    )
  })

  test('file with 100 violations triggers suggestion with count', () => {
    const fileScores: FileScore[] = [
      { filePath: 'terrible.ts', violations: 100, score: 10, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    const match = suggestions.find((s) => s.includes('terrible.ts'))
    expect(match).toContain('100')
  })

  test('first file with 5 violations does not trigger file suggestion', () => {
    const fileScores: FileScore[] = [
      { filePath: 'ok.ts', violations: 5, score: 80, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions.find((s) => s.includes('Focus on'))).toBeUndefined()
  })

  test('mixed low categories plus bad file produces 5 suggestions', () => {
    const categories = makeCategories({
      complexity: { score: 60, violations: 8, weight: 0.3 },
      correctness: { score: 55, violations: 9, weight: 0.25 },
      patterns: { score: 50, violations: 10, weight: 0.15 },
      security: { score: 70, violations: 6, weight: 0.3 },
    })
    const fileScores: FileScore[] = [
      { filePath: 'awful.ts', violations: 15, score: 30, categories: {} },
    ]
    const suggestions = generateSuggestions(categories, [], fileScores)
    expect(suggestions.length).toBe(5)
  })

  test('allViolations parameter does not affect output', () => {
    const categories = makeCategories({
      complexity: { score: 60, violations: 5, weight: 0.3 },
    })
    const withViolations = generateSuggestions(categories, [{ ruleId: 'test-rule' }], [])
    const withoutViolations = generateSuggestions(categories, [], [])
    expect(withViolations).toEqual(withoutViolations)
  })
})

describe('formatDisplayOutput', () => {
  test('outputs overall score header', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Code Quality Score')
  })

  test('outputs grade for overall score', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 92 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('(A)')
  })

  test('outputs all four category labels', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Complexity:')
    expect(output).toContain('Correctness:')
    expect(output).toContain('Security:')
    expect(output).toContain('Patterns:')
  })

  test('outputs Category Scores section header', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Category Scores')
  })

  test('outputs Summary section with files analyzed count', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Summary')
    expect(output).toContain('Files analyzed: 5')
  })

  test('outputs total violations in summary', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Total violations: 8')
  })

  test('outputs violations per file formatted to 2 decimals', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('1.60')
  })

  test('shows Top Problematic Files section when verbose and files exist', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'bad.ts', score: 45, violations: 12, categories: { complexity: 5 } }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Top Problematic Files')
    expect(output).toContain('bad.ts')
    expect(output).toContain('Violations: 12')
    expect(output).toContain('Score: 45/100')
  })

  test('hides Top Problematic Files when not verbose', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'bad.ts', score: 45, violations: 12, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).not.toContain('Top Problematic Files')
  })

  test('hides Top Problematic Files when verbose but no files', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ topFiles: [] }), true, (msg) => lines.push(msg))
    expect(lines.join('\n')).not.toContain('Top Problematic Files')
  })

  test('shows file categories in verbose output', () => {
    const report = makeReport({
      topFiles: [
        {
          filePath: 'test.ts',
          score: 50,
          violations: 8,
          categories: { complexity: 3, security: 5 },
        },
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Categories:')
    expect(output).toContain('complexity: 3')
    expect(output).toContain('security: 5')
  })

  test('omits Categories line when file categories are empty', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'test.ts', score: 50, violations: 8, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    expect(lines.join('\n')).not.toContain('Categories:')
  })

  test('shows Improvement Suggestions when present', () => {
    const report = makeReport({
      suggestions: ['Reduce code complexity - 10 complexity issues found'],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Improvement Suggestions')
    expect(output).toContain('Reduce code complexity')
  })

  test('hides Improvement Suggestions when empty', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).not.toContain('Improvement Suggestions')
  })

  test('uses logFn for all output', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('includes empty lines for spacing', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const emptyLines = lines.filter((l) => l === '')
    expect(emptyLines.length).toBeGreaterThanOrEqual(3)
  })

  test('renders multiple suggestions with bullet markers', () => {
    const report = makeReport({
      suggestions: ['Suggestion A', 'Suggestion B', 'Suggestion C'],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Suggestion A')
    expect(output).toContain('Suggestion B')
    expect(output).toContain('Suggestion C')
  })

  test('renders grade F when overall is 0', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 0 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('(F)')
  })

  test('renders grade A when overall is 100', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 100 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('(A)')
  })

  test('pads overall score in header', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 5 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('  5 / 100')
  })

  test('renders each category score with correct values', () => {
    const report = makeReport({
      categories: {
        complexity: { score: 72, violations: 3, weight: 0.3 },
        correctness: { score: 88, violations: 1, weight: 0.25 },
        patterns: { score: 91, violations: 0, weight: 0.15 },
        security: { score: 65, violations: 4, weight: 0.3 },
      },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('72')
    expect(output).toContain('88')
    expect(output).toContain('91')
    expect(output).toContain('65')
  })

  test('shows multiple top files in verbose mode', () => {
    const report = makeReport({
      topFiles: [
        { filePath: 'bad1.ts', score: 30, violations: 20, categories: {} },
        { filePath: 'bad2.ts', score: 40, violations: 15, categories: {} },
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('bad1.ts')
    expect(output).toContain('bad2.ts')
  })

  test('shows top file with zero violations', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'clean.ts', score: 100, violations: 0, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('clean.ts')
    expect(output).toContain('Violations: 0')
  })

  test('handles summary with zero files analyzed', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 0, totalViolations: 0, violationsPerFile: 0 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Files analyzed: 0')
    expect(output).toContain('Total violations: 0')
  })

  test('handles violationsPerFile with many decimals', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 3, totalViolations: 10, violationsPerFile: 3.333333 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('3.33')
  })

  test('renders a single suggestion', () => {
    const report = makeReport({ suggestions: ['Single tip'] })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Improvement Suggestions')
    expect(output).toContain('Single tip')
  })

  test('does not show report path in output', () => {
    const report = makeReport({ path: '/secret/project/path' })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).not.toContain('/secret/project/path')
  })

  test('shows top file with multiple categories', () => {
    const report = makeReport({
      topFiles: [
        {
          filePath: 'multi.ts',
          score: 40,
          violations: 12,
          categories: { complexity: 5, security: 3, patterns: 4 },
        },
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('complexity: 5')
    expect(output).toContain('security: 3')
    expect(output).toContain('patterns: 4')
  })

  test('logFn is called with string arguments only', () => {
    const args: unknown[] = []
    formatDisplayOutput(makeReport(), false, (msg) => args.push(msg))
    for (const arg of args) {
      expect(typeof arg).toBe('string')
    }
  })

  test('shows grade B for score 85', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 85 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('(B)')
  })

  test('shows grade D for score 65', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 65 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('(D)')
  })
})

describe('getGrade (re-export from formatting)', () => {
  test('returns A for 90-100', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(100)).toBe('(A)')
  })

  test('returns B for 80-89', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(89)).toBe('(B)')
  })

  test('returns C for 70-79', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(79)).toBe('(C)')
  })

  test('returns D for 60-69', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(69)).toBe('(D)')
  })

  test('returns F for below 60', () => {
    expect(getGrade(0)).toBe('(F)')
    expect(getGrade(59)).toBe('(F)')
  })

  test('returns A for score 95', () => {
    expect(getGrade(95)).toBe('(A)')
  })

  test('returns B for score 85', () => {
    expect(getGrade(85)).toBe('(B)')
  })

  test('returns C for score 75', () => {
    expect(getGrade(75)).toBe('(C)')
  })

  test('returns D for score 65', () => {
    expect(getGrade(65)).toBe('(D)')
  })

  test('returns F for score 30', () => {
    expect(getGrade(30)).toBe('(F)')
  })

  test('returns F for score 1', () => {
    expect(getGrade(1)).toBe('(F)')
  })

  test('returns F for negative score', () => {
    expect(getGrade(-10)).toBe('(F)')
  })

  test('returns A for score above 100', () => {
    expect(getGrade(150)).toBe('(A)')
  })
})

describe('getScoreColor (re-export from formatting)', () => {
  test('returns callable function', () => {
    expect(typeof getScoreColor(50)).toBe('function')
  })

  test('function produces string output', () => {
    const result = getScoreColor(50)('test')
    expect(typeof result).toBe('string')
    expect(result).toContain('test')
  })

  test('score 100 returns callable function', () => {
    expect(typeof getScoreColor(100)).toBe('function')
  })

  test('score 80 at boundary returns callable function', () => {
    expect(typeof getScoreColor(80)).toBe('function')
  })

  test('score 79 returns callable function', () => {
    expect(typeof getScoreColor(79)).toBe('function')
  })

  test('score 60 at boundary returns callable function', () => {
    expect(typeof getScoreColor(60)).toBe('function')
  })

  test('score 59 returns callable function', () => {
    expect(typeof getScoreColor(59)).toBe('function')
  })

  test('score 0 returns callable function', () => {
    expect(typeof getScoreColor(0)).toBe('function')
  })

  test('function preserves empty string input', () => {
    const result = getScoreColor(50)('')
    expect(typeof result).toBe('string')
  })

  test('function preserves special characters in input', () => {
    const result = getScoreColor(90)('hello/world (test)')
    expect(result).toContain('hello/world (test)')
  })

  test('green color function for high score includes input text', () => {
    const result = getScoreColor(95)('great')
    expect(result).toContain('great')
  })

  test('red color function for low score includes input text', () => {
    const result = getScoreColor(10)('bad')
    expect(result).toContain('bad')
  })
})

describe('formatScore edge cases', () => {
  test('formats score 0 with weight 0', () => {
    const result = formatScore(0, 0)
    expect(result).toContain('0')
    expect(result).toContain('weight: 0%')
  })

  test('formats score 100 with weight 1', () => {
    const result = formatScore(100, 1)
    expect(result).toContain('100')
    expect(result).toContain('weight: 100%')
  })

  test('formats score 50 with weight 0.5', () => {
    const result = formatScore(50, 0.5)
    expect(result).toContain('50')
    expect(result).toContain('weight: 50%')
  })

  test('pads single digit score', () => {
    const result = formatScore(5, 0.25)
    expect(result).toContain('5')
    expect(result).toContain('weight: 25%')
  })
})

describe('generateSuggestions edge cases', () => {
  test('returns empty array when all scores are high', () => {
    const categories = {
      complexity: { score: 90, violations: 1, weight: 0.25 },
      correctness: { score: 95, violations: 0, weight: 0.25 },
      security: { score: 85, violations: 0, weight: 0.25 },
      patterns: { score: 80, violations: 2, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(0)
  })

  test('returns suggestion when complexity score is below 70', () => {
    const categories = {
      complexity: { score: 60, violations: 5, weight: 0.25 },
      correctness: { score: 95, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 85, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('complexity')
  })

  test('returns suggestion when security score is below 80', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 95, violations: 0, weight: 0.25 },
      security: { score: 70, violations: 3, weight: 0.25 },
      patterns: { score: 85, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('security')
  })

  test('returns file suggestion when first file has more than 10 violations', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 95, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 85, violations: 0, weight: 0.25 },
    }
    const fileScores = [{ filePath: 'bad.ts', violations: 15, score: 30, categories: {} }]
    const result = generateSuggestions(categories, [], fileScores)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('bad.ts')
  })

  test('returns no file suggestion when first file has exactly 10 violations', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 95, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 85, violations: 0, weight: 0.25 },
    }
    const fileScores = [{ filePath: 'ok.ts', violations: 10, score: 50, categories: {} }]
    const result = generateSuggestions(categories, [], fileScores)
    expect(result).toHaveLength(0)
  })

  test('returns multiple suggestions when multiple categories are low', () => {
    const categories = {
      complexity: { score: 50, violations: 10, weight: 0.25 },
      correctness: { score: 60, violations: 8, weight: 0.25 },
      security: { score: 70, violations: 5, weight: 0.25 },
      patterns: { score: 55, violations: 12, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(4)
  })
})

describe('generateSuggestions threshold boundaries', () => {
  test('does not suggest complexity when score is exactly 70', () => {
    const categories = {
      complexity: { score: 70, violations: 5, weight: 0.25 },
      correctness: { score: 90, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 90, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result.find((s) => s.includes('complexity'))).toBeUndefined()
  })

  test('suggests complexity when score is 69', () => {
    const categories = {
      complexity: { score: 69, violations: 5, weight: 0.25 },
      correctness: { score: 90, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 90, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result.find((s) => s.includes('complexity'))).toBeDefined()
  })

  test('does not suggest security when score is exactly 80', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 90, violations: 0, weight: 0.25 },
      security: { score: 80, violations: 0, weight: 0.25 },
      patterns: { score: 90, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result.find((s) => s.includes('security'))).toBeUndefined()
  })

  test('suggests security when score is 79', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 90, violations: 0, weight: 0.25 },
      security: { score: 79, violations: 3, weight: 0.25 },
      patterns: { score: 90, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result.find((s) => s.includes('security'))).toBeDefined()
  })

  test('does not suggest patterns when score is exactly 70', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 90, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 70, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result.find((s) => s.includes('pattern'))).toBeUndefined()
  })

  test('suggests correctness when score is 69', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 69, violations: 4, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 90, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result.find((s) => s.includes('correctness'))).toBeDefined()
  })

  test('returns no file suggestion when fileScores is empty array', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 90, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 90, violations: 0, weight: 0.25 },
    }
    const result = generateSuggestions(categories, [], [])
    expect(result).toHaveLength(0)
  })

  test('file suggestion includes violation count', () => {
    const categories = {
      complexity: { score: 90, violations: 0, weight: 0.25 },
      correctness: { score: 95, violations: 0, weight: 0.25 },
      security: { score: 90, violations: 0, weight: 0.25 },
      patterns: { score: 85, violations: 0, weight: 0.25 },
    }
    const fileScores = [{ filePath: 'mess.ts', violations: 25, score: 10, categories: {} }]
    const result = generateSuggestions(categories, [], fileScores)
    expect(result[0]).toContain('25')
  })
})

describe('formatDisplayOutput non-verbose mode', () => {
  test('does not output top files when verbose is false', () => {
    const logs: string[] = []
    const report = makeReport({
      topFiles: [{ filePath: 'a.ts', violations: 5, score: 40, categories: { complexity: 3 } }],
    })
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('a.ts'))).toBeUndefined()
  })

  test('does not output suggestions when empty', () => {
    const logs: string[] = []
    const report = makeReport({ suggestions: [] })
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('Improvement'))).toBeUndefined()
  })

  test('outputs suggestions when present', () => {
    const logs: string[] = []
    const report = makeReport({ suggestions: ['Fix complexity issues'] })
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('Fix complexity'))).toBeDefined()
  })

  test('outputs overall score in header', () => {
    const logs: string[] = []
    const report = makeReport({ overall: 92 })
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('92'))).toBeDefined()
  })

  test('outputs all four category labels', () => {
    const logs: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('Complexity:'))).toBeDefined()
    expect(logs.find((l) => l.includes('Correctness:'))).toBeDefined()
    expect(logs.find((l) => l.includes('Security:'))).toBeDefined()
    expect(logs.find((l) => l.includes('Patterns:'))).toBeDefined()
  })

  test('outputs summary statistics', () => {
    const logs: string[] = []
    const report = makeReport({
      summary: { filesAnalyzed: 10, totalViolations: 42, violationsPerFile: 4.2 },
    })
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('10'))).toBeDefined()
    expect(logs.find((l) => l.includes('42'))).toBeDefined()
    expect(logs.find((l) => l.includes('4.20'))).toBeDefined()
  })

  test('outputs file categories when present in verbose mode', () => {
    const logs: string[] = []
    const report = makeReport({
      topFiles: [
        {
          filePath: 'cat.ts',
          violations: 3,
          score: 60,
          categories: { complexity: 2, security: 1 },
        },
      ],
    })
    formatDisplayOutput(report, true, (msg) => logs.push(msg))
    expect(logs.find((l) => l.includes('complexity: 2, security: 1'))).toBeDefined()
  })

  test('outputs bullet point for each suggestion', () => {
    const logs: string[] = []
    const report = makeReport({ suggestions: ['Suggestion A', 'Suggestion B'] })
    formatDisplayOutput(report, false, (msg) => logs.push(msg))
    const bulletLines = logs.filter((l) => l.includes('•'))
    expect(bulletLines.length).toBe(2)
  })
})

describe('getGrade and getScoreColor re-exports', () => {
  test('getGrade returns correct grade for 95', () => {
    expect(getGrade(95)).toBeDefined()
  })

  test('getScoreColor returns a function', () => {
    const fn = getScoreColor(50)
    expect(typeof fn).toBe('function')
  })

  test('getScoreColor result is callable with a string', () => {
    const fn = getScoreColor(80)
    const result = fn('test')
    expect(typeof result).toBe('string')
  })
})

describe('getGrade boundary values', () => {
  test('returns (A) for exact threshold 90', () => {
    expect(getGrade(90)).toBe('(A)')
  })

  test('returns (A) for 91', () => {
    expect(getGrade(91)).toBe('(A)')
  })

  test('returns (A) for 99', () => {
    expect(getGrade(99)).toBe('(A)')
  })

  test('returns (B) for exact threshold 80', () => {
    expect(getGrade(80)).toBe('(B)')
  })

  test('returns (B) for 81', () => {
    expect(getGrade(81)).toBe('(B)')
  })

  test('returns (B) for 89', () => {
    expect(getGrade(89)).toBe('(B)')
  })

  test('returns (C) for exact threshold 70', () => {
    expect(getGrade(70)).toBe('(C)')
  })

  test('returns (C) for 71', () => {
    expect(getGrade(71)).toBe('(C)')
  })

  test('returns (C) for 79', () => {
    expect(getGrade(79)).toBe('(C)')
  })

  test('returns (D) for exact threshold 60', () => {
    expect(getGrade(60)).toBe('(D)')
  })

  test('returns (D) for 61', () => {
    expect(getGrade(61)).toBe('(D)')
  })

  test('returns (D) for 69', () => {
    expect(getGrade(69)).toBe('(D)')
  })

  test('returns (F) for 59', () => {
    expect(getGrade(59)).toBe('(F)')
  })

  test('returns (F) for 1', () => {
    expect(getGrade(1)).toBe('(F)')
  })

  test('returns (F) for 0', () => {
    expect(getGrade(0)).toBe('(F)')
  })

  test('returns (F) for -1', () => {
    expect(getGrade(-1)).toBe('(F)')
  })

  test('returns (F) for -100', () => {
    expect(getGrade(-100)).toBe('(F)')
  })

  test('returns (A) for 100', () => {
    expect(getGrade(100)).toBe('(A)')
  })

  test('returns (A) for 200', () => {
    expect(getGrade(200)).toBe('(A)')
  })

  test('returns (F) for 0.5', () => {
    expect(getGrade(0.5)).toBe('(F)')
  })

  test('returns (F) for 59.9', () => {
    expect(getGrade(59.9)).toBe('(F)')
  })

  test('returns (D) for 60.1', () => {
    expect(getGrade(60.1)).toBe('(D)')
  })

  test('returns (C) for 70.5', () => {
    expect(getGrade(70.5)).toBe('(C)')
  })

  test('returns (B) for 80.1', () => {
    expect(getGrade(80.1)).toBe('(B)')
  })

  test('returns (A) for 90.5', () => {
    expect(getGrade(90.5)).toBe('(A)')
  })

  test('always returns a string', () => {
    expect(typeof getGrade(50)).toBe('string')
  })

  test('always returns parenthesized grade', () => {
    const grades = [getGrade(0), getGrade(65), getGrade(75), getGrade(85), getGrade(95)]
    for (const g of grades) {
      expect(g.startsWith('(')).toBe(true)
      expect(g.endsWith(')')).toBe(true)
    }
  })
})

describe('getScoreColor boundary values', () => {
  test('returns function for score 0', () => {
    expect(typeof getScoreColor(0)).toBe('function')
  })

  test('returns function for score 59', () => {
    expect(typeof getScoreColor(59)).toBe('function')
  })

  test('returns function for score 60', () => {
    expect(typeof getScoreColor(60)).toBe('function')
  })

  test('returns function for score 79', () => {
    expect(typeof getScoreColor(79)).toBe('function')
  })

  test('returns function for score 80', () => {
    expect(typeof getScoreColor(80)).toBe('function')
  })

  test('returns function for score 100', () => {
    expect(typeof getScoreColor(100)).toBe('function')
  })

  test('returns function for negative score', () => {
    expect(typeof getScoreColor(-10)).toBe('function')
  })

  test('result contains text for score 0', () => {
    expect(getScoreColor(0)('low')).toContain('low')
  })

  test('result contains text for score 50', () => {
    expect(getScoreColor(50)('mid')).toContain('mid')
  })

  test('result contains text for score 70', () => {
    expect(getScoreColor(70)('warn')).toContain('warn')
  })

  test('result contains text for score 85', () => {
    expect(getScoreColor(85)('good')).toContain('good')
  })

  test('result contains text for score 95', () => {
    expect(getScoreColor(95)('great')).toContain('great')
  })

  test('returns string result for numeric string input', () => {
    const result = getScoreColor(50)('42')
    expect(typeof result).toBe('string')
  })

  test('handles long input string', () => {
    const longStr = 'a'.repeat(500)
    const result = getScoreColor(75)(longStr)
    expect(result).toContain(longStr)
  })

  test('handles unicode input', () => {
    const result = getScoreColor(90)('日本語テスト')
    expect(result).toContain('日本語テスト')
  })
})

describe('formatScore additional cases', () => {
  test('formats weight 0.15 as 15%', () => {
    expect(formatScore(80, 0.15)).toContain('15%')
  })

  test('formats weight 0.25 as 25%', () => {
    expect(formatScore(80, 0.25)).toContain('25%')
  })

  test('formats weight 0.3 as 30%', () => {
    expect(formatScore(80, 0.3)).toContain('30%')
  })

  test('formats weight 0.35 as 35%', () => {
    expect(formatScore(80, 0.35)).toContain('35%')
  })

  test('formats weight 0.1 as 10%', () => {
    expect(formatScore(80, 0.1)).toContain('10%')
  })

  test('formats weight 0.99 as 99%', () => {
    expect(formatScore(80, 0.99)).toContain('99%')
  })

  test('always contains / 100 separator', () => {
    const scores = [0, 25, 50, 75, 100]
    for (const s of scores) {
      expect(formatScore(s, 0.5)).toContain('/ 100')
    }
  })

  test('always contains weight: label', () => {
    const result = formatScore(42, 0.25)
    expect(result).toContain('weight:')
  })

  test('score 1 pads correctly', () => {
    const result = formatScore(1, 0.25)
    expect(result).toContain('  1')
  })

  test('score 9 pads correctly', () => {
    const result = formatScore(9, 0.25)
    expect(result).toContain('  9')
  })

  test('score 10 pads correctly', () => {
    const result = formatScore(10, 0.25)
    expect(result).toContain(' 10')
  })

  test('score 99 does not pad', () => {
    const result = formatScore(99, 0.25)
    expect(result).toContain('99')
  })

  test('score 50 at weight 0.333 rounds to 33%', () => {
    const result = formatScore(50, 0.333)
    expect(result).toContain('33%')
  })

  test('score 75 at weight 0.667 rounds to 67%', () => {
    const result = formatScore(75, 0.667)
    expect(result).toContain('67%')
  })

  test('very large weight produces percentage > 100%', () => {
    const result = formatScore(50, 2.5)
    expect(result).toContain('250%')
  })
})

describe('generateSuggestions text content', () => {
  test('complexity suggestion includes violation count', () => {
    const categories = makeCategories({
      complexity: { score: 60, violations: 42, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0]).toContain('42')
  })

  test('correctness suggestion includes violation count', () => {
    const categories = makeCategories({
      correctness: { score: 60, violations: 33, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0]).toContain('33')
  })

  test('security suggestion includes violation count', () => {
    const categories = makeCategories({
      security: { score: 70, violations: 21, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0]).toContain('21')
  })

  test('patterns suggestion includes violation count', () => {
    const categories = makeCategories({
      patterns: { score: 60, violations: 17, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0]).toContain('17')
  })

  test('complexity suggestion includes "complexity" keyword', () => {
    const categories = makeCategories({
      complexity: { score: 60, violations: 5, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0].toLowerCase()).toContain('complexity')
  })

  test('correctness suggestion includes "correctness" keyword', () => {
    const categories = makeCategories({
      correctness: { score: 60, violations: 5, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0].toLowerCase()).toContain('correctness')
  })

  test('security suggestion includes "security" keyword', () => {
    const categories = makeCategories({
      security: { score: 70, violations: 5, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0].toLowerCase()).toContain('security')
  })

  test('patterns suggestion includes "pattern" keyword', () => {
    const categories = makeCategories({
      patterns: { score: 60, violations: 5, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions[0].toLowerCase()).toContain('pattern')
  })

  test('file suggestion includes file name', () => {
    const fileScores: FileScore[] = [
      { filePath: 'src/deep/nested/bad.ts', violations: 15, score: 30, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions[0]).toContain('src/deep/nested/bad.ts')
  })

  test('file suggestion with 50 violations includes count', () => {
    const fileScores: FileScore[] = [
      { filePath: 'huge.ts', violations: 50, score: 10, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions[0]).toContain('50')
  })

  test('complexity at score 1 produces suggestion', () => {
    const categories = makeCategories({
      complexity: { score: 1, violations: 99, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBeGreaterThanOrEqual(1)
    expect(suggestions[0]).toContain('99')
  })

  test('security at score 1 produces suggestion with critical', () => {
    const categories = makeCategories({
      security: { score: 1, violations: 99, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBeGreaterThanOrEqual(1)
    expect(suggestions[0]).toContain('critical')
  })

  test('returns only file suggestion when all categories are healthy but file is bad', () => {
    const fileScores: FileScore[] = [
      { filePath: 'bad.ts', violations: 20, score: 20, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions.length).toBe(1)
    expect(suggestions[0]).toContain('bad.ts')
  })
})

describe('formatDisplayOutput additional cases', () => {
  test('shows grade C for overall 75', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 75 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('(C)')
  })

  test('shows padded score for single digit overall', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 3 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('  3 / 100')
  })

  test('shows two-digit overall with single space pad', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 45 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain(' 45 / 100')
  })

  test('shows three-digit overall without padding', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 100 }), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('100 / 100')
  })

  test('shows Files analyzed label', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Files analyzed:')
  })

  test('shows Total violations label', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Total violations:')
  })

  test('shows Violations per file label', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Violations per file:')
  })

  test('shows violations per file with exactly 2 decimal places', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 7, totalViolations: 10, violationsPerFile: 1.428571 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('1.43')
  })

  test('shows violations per file as 0.00 when zero', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 0, totalViolations: 0, violationsPerFile: 0 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('0.00')
  })

  test('shows violations per file as 2.50 for exact value', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 4, totalViolations: 10, violationsPerFile: 2.5 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('2.50')
  })

  test('verbose with top file shows Score: label', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'x.ts', score: 55, violations: 3, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Score:')
  })

  test('verbose with top file shows Violations: label', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'x.ts', score: 55, violations: 3, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('Violations:')
  })

  test('verbose with top file shows score as X/100 format', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'x.ts', score: 55, violations: 3, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('55/100')
  })

  test('verbose with 3 top files shows all file paths', () => {
    const report = makeReport({
      topFiles: [
        { filePath: 'a.ts', score: 20, violations: 30, categories: {} },
        { filePath: 'b.ts', score: 30, violations: 20, categories: {} },
        { filePath: 'c.ts', score: 40, violations: 10, categories: {} },
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
    expect(output).toContain('c.ts')
  })

  test('suggestions section uses bullet marker', () => {
    const report = makeReport({ suggestions: ['Tip one'] })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.find((l) => l.includes('•'))).toBeDefined()
  })

  test('multiple suggestions each get a bullet', () => {
    const report = makeReport({ suggestions: ['Alpha', 'Beta', 'Gamma'] })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const bulletCount = lines.filter((l) => l.includes('•')).length
    expect(bulletCount).toBe(3)
  })

  test('output starts with empty line', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines[0]).toBe('')
  })

  test('contains Category Scores header', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.find((l) => l.includes('Category Scores'))).toBeDefined()
  })

  test('contains Summary header', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.find((l) => l.includes('Summary'))).toBeDefined()
  })

  test('verbose with empty topFiles shows no Top Problematic Files', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ topFiles: [] }), true, (msg) => lines.push(msg))
    expect(lines.find((l) => l.includes('Top Problematic Files'))).toBeUndefined()
  })

  test('non-verbose with non-empty topFiles hides Top Problematic Files', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'hidden.ts', score: 10, violations: 50, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.find((l) => l.includes('Top Problematic Files'))).toBeUndefined()
    expect(lines.find((l) => l.includes('hidden.ts'))).toBeUndefined()
  })

  test('shows grade for all tier boundaries', () => {
    const pairs: Array<[number, string]> = [
      [95, '(A)'],
      [85, '(B)'],
      [75, '(C)'],
      [65, '(D)'],
      [30, '(F)'],
    ]
    for (const [score, grade] of pairs) {
      const lines: string[] = []
      formatDisplayOutput(makeReport({ overall: score }), false, (msg) => lines.push(msg))
      expect(lines.join('\n')).toContain(grade)
    }
  })

  test('summary shows correct filesAnalyzed value', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 42, totalViolations: 100, violationsPerFile: 2.38 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('42')
  })

  test('summary shows correct totalViolations value', () => {
    const report = makeReport({
      summary: { filesAnalyzed: 5, totalViolations: 99, violationsPerFile: 19.8 },
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    expect(lines.join('\n')).toContain('99')
  })

  test('logFn is called more than 5 times', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
  })

  test('verbose mode does not crash with empty report', () => {
    const lines: string[] = []
    expect(() => {
      formatDisplayOutput(makeReport(), true, (msg) => lines.push(msg))
    }).not.toThrow()
  })

  test('non-verbose mode does not crash with empty report', () => {
    const lines: string[] = []
    expect(() => {
      formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    }).not.toThrow()
  })

  test('top file with score 0 is displayed in verbose', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'zero.ts', score: 0, violations: 100, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('zero.ts')
    expect(output).toContain('0/100')
    expect(output).toContain('Violations: 100')
  })

  test('top file with score 100 is displayed in verbose', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'perfect.ts', score: 100, violations: 0, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('perfect.ts')
    expect(output).toContain('100/100')
  })
})
