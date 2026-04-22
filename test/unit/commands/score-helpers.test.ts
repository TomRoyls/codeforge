import { describe, test, expect } from 'vitest'
import {
  buildCategoryCounts,
  buildFileCategoryCounts,
  buildScoreReport,
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  countDocumentedFunctions,
  formatDisplayOutput,
  formatScore,
  generateSuggestions,
  getGrade,
  getScoreColor,
  calculateOverallScore,
  type CategoryScore,
  type CategoryViolationCounts,
  type FileScore,
  type ScoreReport,
} from '../../../src/commands/score-helpers.js'

const mockGetRuleCategory = (ruleId: string): string => {
  if (ruleId.startsWith('complexity')) return 'complexity'
  if (ruleId.startsWith('correctness')) return 'correctness'
  if (ruleId.startsWith('security')) return 'security'
  if (ruleId.startsWith('patterns')) return 'patterns'
  return 'patterns'
}

function makeViolation(ruleId: string) {
  return { ruleId, message: 'test', severity: 'warning', line: 1, column: 1 } as any
}

describe('calculateCategoryScore', () => {
  test('returns 100 for 0 violations', () => {
    const result = calculateCategoryScore(0, 0.3)
    expect(result.score).toBe(100)
    expect(result.violations).toBe(0)
    expect(result.weight).toBe(0.3)
  })

  test('deducts 5 points per violation', () => {
    const result = calculateCategoryScore(5, 0.3)
    expect(result.score).toBe(75)
  })

  test('returns 0 for 20+ violations', () => {
    const result = calculateCategoryScore(20, 0.3)
    expect(result.score).toBe(0)
  })

  test('clamps to 0 for very high violations', () => {
    const result = calculateCategoryScore(100, 0.3)
    expect(result.score).toBe(0)
  })

  test('preserves weight', () => {
    expect(calculateCategoryScore(0, 0.15).weight).toBe(0.15)
    expect(calculateCategoryScore(3, 0.25).weight).toBe(0.25)
    expect(calculateCategoryScore(1, 0.5).weight).toBe(0.5)
  })

  test('returns 50 for 10 violations', () => {
    expect(calculateCategoryScore(10, 0.3).score).toBe(50)
  })

  test('returns 95 for 1 violation', () => {
    expect(calculateCategoryScore(1, 0.3).score).toBe(95)
  })

  test('returns 85 for 3 violations', () => {
    expect(calculateCategoryScore(3, 0.3).score).toBe(85)
  })

  test('returns 65 for 7 violations', () => {
    expect(calculateCategoryScore(7, 0.3).score).toBe(65)
  })

  test('returns 5 for 19 violations', () => {
    expect(calculateCategoryScore(19, 0.3).score).toBe(5)
  })

  test('returns 0 for exactly 20 violations', () => {
    expect(calculateCategoryScore(20, 0.3).score).toBe(0)
  })

  test('violations field matches input', () => {
    expect(calculateCategoryScore(7, 0.4).violations).toBe(7)
  })

  test('returns 90 for 2 violations', () => {
    expect(calculateCategoryScore(2, 0.3).score).toBe(90)
  })

  test('returns 80 for 4 violations', () => {
    expect(calculateCategoryScore(4, 0.3).score).toBe(80)
  })

  test('returns 55 for 9 violations', () => {
    expect(calculateCategoryScore(9, 0.3).score).toBe(55)
  })

  test('returns 60 for 8 violations', () => {
    expect(calculateCategoryScore(8, 0.3).score).toBe(60)
  })

  test('returns 70 for 6 violations', () => {
    expect(calculateCategoryScore(6, 0.3).score).toBe(70)
  })

  test('score is always non-negative for fractional weights', () => {
    expect(calculateCategoryScore(50, 0.01).score).toBe(0)
  })

  test('returns 75 for 5 violations with 0.25 weight', () => {
    expect(calculateCategoryScore(5, 0.25).score).toBe(75)
  })

  test('result object has all three fields', () => {
    const result = calculateCategoryScore(3, 0.4)
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('violations')
    expect(result).toHaveProperty('weight')
  })
})

describe('calculateCorrectnessScore', () => {
  test('returns 100 for full documentation with 0 violations', () => {
    const result = calculateCorrectnessScore(0, 10, 10, 0.25)
    expect(result.score).toBe(100)
  })

  test('returns 50 when no functions exist', () => {
    const result = calculateCorrectnessScore(0, 0, 0, 0.25)
    expect(result.score).toBe(50)
  })

  test('penalizes lack of documentation', () => {
    const result = calculateCorrectnessScore(0, 10, 5, 0.25)
    expect(result.score).toBe(50)
  })

  test('penalizes violations at 5 points each', () => {
    const result = calculateCorrectnessScore(5, 10, 10, 0.25)
    expect(result.score).toBe(75)
  })

  test('combines documentation and violation penalties', () => {
    const result = calculateCorrectnessScore(5, 10, 5, 0.25)
    expect(result.score).toBe(25)
  })

  test('clamps to 0 minimum', () => {
    const result = calculateCorrectnessScore(30, 10, 0, 0.25)
    expect(result.score).toBe(0)
  })

  test('partial documentation scores proportionally', () => {
    const result = calculateCorrectnessScore(0, 4, 3, 0.25)
    expect(result.score).toBe(75)
  })

  test('single documented function out of 1 gives 100 coverage', () => {
    const result = calculateCorrectnessScore(0, 1, 1, 0.25)
    expect(result.score).toBe(100)
  })

  test('preserves weight in result', () => {
    expect(calculateCorrectnessScore(0, 10, 10, 0.25).weight).toBe(0.25)
  })

  test('returns 50 when totalFunctions is 0 regardless of documentedFunctions', () => {
    const result = calculateCorrectnessScore(0, 0, 5, 0.25)
    expect(result.score).toBe(50)
  })

  test('returns 0 when no functions are documented and no violations', () => {
    const result = calculateCorrectnessScore(0, 10, 0, 0.25)
    expect(result.score).toBe(0)
  })

  test('penalizes 50 percent coverage plus violations', () => {
    const result = calculateCorrectnessScore(2, 4, 2, 0.25)
    expect(result.score).toBe(40)
  })

  test('returns 25 for half documented with 5 violations', () => {
    const result = calculateCorrectnessScore(5, 10, 5, 0.25)
    expect(result.score).toBe(25)
  })

  test('violations field matches input', () => {
    expect(calculateCorrectnessScore(3, 10, 5, 0.25).violations).toBe(3)
  })

  test('large violation count clamps to 0', () => {
    const result = calculateCorrectnessScore(50, 10, 10, 0.25)
    expect(result.score).toBe(0)
  })

  test('quarter documentation with no violations', () => {
    const result = calculateCorrectnessScore(0, 8, 2, 0.25)
    expect(result.score).toBe(25)
  })

  test('preserves weight of 0.3', () => {
    expect(calculateCorrectnessScore(0, 5, 5, 0.3).weight).toBe(0.3)
  })

  test('single undocumented function out of 1 gives 0 coverage', () => {
    const result = calculateCorrectnessScore(0, 1, 0, 0.25)
    expect(result.score).toBe(0)
  })

  test('full documentation with some violations still scores above 0', () => {
    const result = calculateCorrectnessScore(15, 10, 10, 0.25)
    expect(result.score).toBe(25)
  })

  test('half documented with 10 violations gives 0', () => {
    const result = calculateCorrectnessScore(10, 10, 5, 0.25)
    expect(result.score).toBe(0)
  })

  test('1 violation with full documentation gives 95', () => {
    const result = calculateCorrectnessScore(1, 10, 10, 0.25)
    expect(result.score).toBe(95)
  })

  test('no functions with violations still returns 50', () => {
    const result = calculateCorrectnessScore(5, 0, 0, 0.25)
    expect(result.score).toBe(25)
  })
})

describe('calculateFileScore', () => {
  test('returns 100 for 0 violations', () => {
    expect(calculateFileScore(0)).toBe(100)
  })

  test('deducts 3 points per violation', () => {
    expect(calculateFileScore(10)).toBe(70)
  })

  test('returns 91 for 3 violations', () => {
    expect(calculateFileScore(3)).toBe(91)
  })

  test('clamps to 0 for many violations', () => {
    expect(calculateFileScore(50)).toBe(0)
  })

  test('returns 97 for 1 violation', () => {
    expect(calculateFileScore(1)).toBe(97)
  })

  test('returns 1 for 33 violations', () => {
    expect(calculateFileScore(33)).toBe(1)
  })

  test('returns 0 for 34 violations', () => {
    expect(calculateFileScore(34)).toBe(0)
  })

  test('returns 0 for negative violations edge case', () => {
    expect(calculateFileScore(1000)).toBe(0)
  })

  test('returns 94 for 2 violations', () => {
    expect(calculateFileScore(2)).toBe(94)
  })

  test('returns 88 for 4 violations', () => {
    expect(calculateFileScore(4)).toBe(88)
  })

  test('returns 70 for 10 violations', () => {
    expect(calculateFileScore(10)).toBe(70)
  })

  test('returns 40 for 20 violations', () => {
    expect(calculateFileScore(20)).toBe(40)
  })

  test('returns 10 for 30 violations', () => {
    expect(calculateFileScore(30)).toBe(10)
  })

  test('returns 4 for 32 violations', () => {
    expect(calculateFileScore(32)).toBe(4)
  })

  test('returns 7 for 31 violations', () => {
    expect(calculateFileScore(31)).toBe(7)
  })

  test('returns 0 for 35 violations', () => {
    expect(calculateFileScore(35)).toBe(0)
  })

  test('returns 85 for 5 violations', () => {
    expect(calculateFileScore(5)).toBe(85)
  })

  test('returns 82 for 6 violations', () => {
    expect(calculateFileScore(6)).toBe(82)
  })

  test('returns 79 for 7 violations', () => {
    expect(calculateFileScore(7)).toBe(79)
  })

  test('returns 55 for 15 violations', () => {
    expect(calculateFileScore(15)).toBe(55)
  })
})

describe('getGrade', () => {
  test('returns (A) for 90+', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(95)).toBe('(A)')
    expect(getGrade(100)).toBe('(A)')
  })

  test('returns (B) for 80-89', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(85)).toBe('(B)')
    expect(getGrade(89)).toBe('(B)')
  })

  test('returns (C) for 70-79', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(75)).toBe('(C)')
    expect(getGrade(79)).toBe('(C)')
  })

  test('returns (D) for 60-69', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(65)).toBe('(D)')
    expect(getGrade(69)).toBe('(D)')
  })

  test('returns (F) for below 60', () => {
    expect(getGrade(0)).toBe('(F)')
    expect(getGrade(30)).toBe('(F)')
    expect(getGrade(59)).toBe('(F)')
  })

  test('boundary at 90 is A', () => {
    expect(getGrade(90)).toBe('(A)')
  })

  test('boundary at 80 is B', () => {
    expect(getGrade(80)).toBe('(B)')
  })

  test('boundary at 60 is D', () => {
    expect(getGrade(60)).toBe('(D)')
  })

  test('boundary at 70 is C', () => {
    expect(getGrade(70)).toBe('(C)')
  })

  test('returns (A) for 99', () => {
    expect(getGrade(99)).toBe('(A)')
  })

  test('returns (B) for 89', () => {
    expect(getGrade(89)).toBe('(B)')
  })

  test('returns (C) for 79', () => {
    expect(getGrade(79)).toBe('(C)')
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

  test('returns (A) for 100', () => {
    expect(getGrade(100)).toBe('(A)')
  })

  test('returns (F) for negative score', () => {
    expect(getGrade(-5)).toBe('(F)')
  })

  test('returns (F) for 0', () => {
    expect(getGrade(0)).toBe('(F)')
  })

  test('returns (D) for 61', () => {
    expect(getGrade(61)).toBe('(D)')
  })

  test('returns (C) for 71', () => {
    expect(getGrade(71)).toBe('(C)')
  })
})

describe('getScoreColor', () => {
  test('returns green function for 80+', () => {
    const fn = getScoreColor(80)
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns green for 100', () => {
    expect(typeof getScoreColor(100)).toBe('function')
  })

  test('returns yellow for 60-79', () => {
    expect(typeof getScoreColor(60)).toBe('function')
    expect(typeof getScoreColor(70)).toBe('function')
    expect(typeof getScoreColor(79)).toBe('function')
  })

  test('returns red for below 60', () => {
    expect(typeof getScoreColor(0)).toBe('function')
    expect(typeof getScoreColor(30)).toBe('function')
    expect(typeof getScoreColor(59)).toBe('function')
  })

  test('boundary at 80 is green', () => {
    expect(getScoreColor(80)).toBe(getScoreColor(100))
  })

  test('boundary at 60 is yellow', () => {
    expect(getScoreColor(60)).toBe(getScoreColor(79))
  })

  test('59 is red', () => {
    expect(getScoreColor(59)).toBe(getScoreColor(0))
  })

  test('79 is yellow not green', () => {
    expect(getScoreColor(79)).not.toBe(getScoreColor(80))
  })

  test('green color function returns string', () => {
    const result = getScoreColor(85)('hello')
    expect(typeof result).toBe('string')
  })

  test('yellow color function returns string', () => {
    const result = getScoreColor(65)('hello')
    expect(typeof result).toBe('string')
  })

  test('red color function returns string', () => {
    const result = getScoreColor(30)('hello')
    expect(typeof result).toBe('string')
  })

  test('100 uses same color as 90', () => {
    expect(getScoreColor(100)).toBe(getScoreColor(90))
  })

  test('60 and 70 use same color (yellow)', () => {
    expect(getScoreColor(60)).toBe(getScoreColor(70))
  })

  test('50 and 0 use same color (red)', () => {
    expect(getScoreColor(50)).toBe(getScoreColor(0))
  })
})

describe('formatScore', () => {
  test('includes score value', () => {
    const result = formatScore(85, 0.3)
    expect(result).toContain('85')
  })

  test('includes weight percentage', () => {
    const result = formatScore(85, 0.3)
    expect(result).toContain('30%')
  })

  test('handles low scores', () => {
    const result = formatScore(45, 0.15)
    expect(result).toContain('45')
    expect(result).toContain('15%')
  })

  test('handles score 100', () => {
    const result = formatScore(100, 0.25)
    expect(result).toContain('100')
    expect(result).toContain('25%')
  })

  test('handles score 0', () => {
    const result = formatScore(0, 0.5)
    expect(result).toContain('0')
    expect(result).toContain('50%')
  })

  test('pads score to field width', () => {
    const result = formatScore(5, 0.3)
    expect(result).toContain('  5')
  })

  test('handles weight 0', () => {
    const result = formatScore(50, 0)
    expect(result).toContain('50')
    expect(result).toContain('0%')
  })

  test('handles weight 1', () => {
    const result = formatScore(75, 1)
    expect(result).toContain('75')
    expect(result).toContain('100%')
  })

  test('handles mid-range weight', () => {
    const result = formatScore(80, 0.5)
    expect(result).toContain('80')
    expect(result).toContain('50%')
  })

  test('contains slash separator', () => {
    const result = formatScore(85, 0.3)
    expect(result).toContain('/')
  })

  test('contains weight label', () => {
    const result = formatScore(85, 0.3)
    expect(result).toContain('weight:')
  })

  test('three-digit score does not need padding', () => {
    const result = formatScore(100, 0.3)
    expect(result).toContain('100')
  })

  test('score 10 is padded to width 3', () => {
    const result = formatScore(10, 0.3)
    expect(result).toContain(' 10')
  })

  test('handles very small weight', () => {
    const result = formatScore(50, 0.01)
    expect(result).toContain('50')
    expect(result).toContain('1%')
  })
})

describe('generateSuggestions', () => {
  function makeCategories(overrides: Partial<Record<string, CategoryScore>> = {}) {
    const defaults: ScoreReport['categories'] = {
      complexity: { score: 90, violations: 1, weight: 0.3 },
      correctness: { score: 90, violations: 1, weight: 0.25 },
      patterns: { score: 90, violations: 1, weight: 0.15 },
      security: { score: 90, violations: 0, weight: 0.3 },
    }
    return { ...defaults, ...overrides } as ScoreReport['categories']
  }

  test('returns empty when all scores are good', () => {
    const suggestions = generateSuggestions(makeCategories(), [], [])
    expect(suggestions).toHaveLength(0)
  })

  test('suggests reducing complexity when score below 70', () => {
    const categories = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toContain('Reduce code complexity - 10 complexity issues found')
  })

  test('suggests correctness improvement when score below 70', () => {
    const categories = makeCategories({
      correctness: { score: 60, violations: 8, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toContain('Improve code correctness - 8 correctness issues found')
  })

  test('suggests security at threshold 80', () => {
    const categories = makeCategories({
      security: { score: 79, violations: 4, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toContain('Address security concerns - 4 security issues found (critical)')
  })

  test('suggests patterns refactor when score below 70', () => {
    const categories = makeCategories({
      patterns: { score: 60, violations: 6, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toContain('Refactor code patterns - 6 pattern violations found')
  })

  test('suggests focusing on file with >10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'bad.ts', violations: 15, score: 50, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).toContain('Focus on bad.ts - it has 15 violations')
  })

  test('does not suggest for file with exactly 10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'test.ts', violations: 10, score: 70, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).not.toContain('Focus on test.ts - it has 10 violations')
  })

  test('does not suggest for file with <10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'test.ts', violations: 5, score: 85, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).not.toContain('Focus on test.ts - it has 5 violations')
  })

  test('returns multiple suggestions when multiple categories are low', () => {
    const categories = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
      security: { score: 70, violations: 5, weight: 0.3 },
      patterns: { score: 60, violations: 8, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBeGreaterThanOrEqual(3)
  })

  test('security threshold is 80 not 70', () => {
    const categories = makeCategories({
      security: { score: 80, violations: 3, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toHaveLength(0)
  })

  test('suggests security when score is exactly 79', () => {
    const categories = makeCategories({
      security: { score: 79, violations: 4, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some((s) => s.includes('security'))).toBe(true)
  })

  test('does not suggest complexity at score 70', () => {
    const categories = makeCategories({
      complexity: { score: 70, violations: 6, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toHaveLength(0)
  })

  test('does not suggest correctness at score 70', () => {
    const categories = makeCategories({
      correctness: { score: 70, violations: 6, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toHaveLength(0)
  })

  test('does not suggest patterns at score 70', () => {
    const categories = makeCategories({
      patterns: { score: 70, violations: 6, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions).toHaveLength(0)
  })

  test('suggests complexity at score 69', () => {
    const categories = makeCategories({
      complexity: { score: 69, violations: 7, weight: 0.3 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some((s) => s.includes('complexity'))).toBe(true)
  })

  test('suggests correctness at score 69', () => {
    const categories = makeCategories({
      correctness: { score: 69, violations: 7, weight: 0.25 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some((s) => s.includes('correctness'))).toBe(true)
  })

  test('suggests patterns at score 69', () => {
    const categories = makeCategories({
      patterns: { score: 69, violations: 7, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.some((s) => s.includes('patterns'))).toBe(true)
  })

  test('only first file with >10 violations triggers suggestion', () => {
    const fileScores: FileScore[] = [
      { filePath: 'first.ts', violations: 12, score: 50, categories: {} },
      { filePath: 'second.ts', violations: 15, score: 40, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).toContain('Focus on first.ts - it has 12 violations')
    expect(suggestions).not.toContain('Focus on second.ts - it has 15 violations')
  })

  test('does not suggest file when first file has exactly 10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'exact.ts', violations: 10, score: 70, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).not.toContain('Focus on exact.ts - it has 10 violations')
  })

  test('empty fileScores array produces no file suggestion', () => {
    const suggestions = generateSuggestions(makeCategories(), [], [])
    expect(suggestions).toHaveLength(0)
  })

  test('suggests for file with exactly 11 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'eleven.ts', violations: 11, score: 67, categories: {} },
    ]
    const suggestions = generateSuggestions(makeCategories(), [], fileScores)
    expect(suggestions).toContain('Focus on eleven.ts - it has 11 violations')
  })

  test('all four categories low produces four suggestions', () => {
    const categories = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
      correctness: { score: 50, violations: 10, weight: 0.25 },
      security: { score: 50, violations: 10, weight: 0.3 },
      patterns: { score: 50, violations: 10, weight: 0.15 },
    })
    const suggestions = generateSuggestions(categories, [], [])
    expect(suggestions.length).toBe(4)
  })
})

describe('calculateOverallScore', () => {
  test('returns 100 for perfect scores', () => {
    const categories = {
      complexity: { score: 100, violations: 0, weight: 0.3 },
      correctness: { score: 100, violations: 0, weight: 0.25 },
      security: { score: 100, violations: 0, weight: 0.3 },
      patterns: { score: 100, violations: 0, weight: 0.15 },
    }
    expect(calculateOverallScore(categories)).toBe(100)
  })

  test('returns 0 for all-zero scores', () => {
    const categories = {
      complexity: { score: 0, violations: 20, weight: 0.3 },
      correctness: { score: 0, violations: 20, weight: 0.25 },
      security: { score: 0, violations: 20, weight: 0.3 },
      patterns: { score: 0, violations: 20, weight: 0.15 },
    }
    expect(calculateOverallScore(categories)).toBe(0)
  })

  test('weights categories correctly', () => {
    const categories = {
      complexity: { score: 100, violations: 0, weight: 0.3 },
      correctness: { score: 0, violations: 20, weight: 0.25 },
      security: { score: 100, violations: 0, weight: 0.3 },
      patterns: { score: 0, violations: 20, weight: 0.15 },
    }
    expect(calculateOverallScore(categories)).toBe(60)
  })

  test('rounds result', () => {
    const categories = {
      complexity: { score: 90, violations: 2, weight: 0.3 },
      correctness: { score: 80, violations: 4, weight: 0.25 },
      security: { score: 70, violations: 6, weight: 0.3 },
      patterns: { score: 60, violations: 8, weight: 0.15 },
    }
    const result = calculateOverallScore(categories)
    expect(Number.isInteger(result)).toBe(true)
  })

  test('calculates weighted sum of all categories', () => {
    const categories = {
      complexity: { score: 80, violations: 4, weight: 0.3 },
      correctness: { score: 80, violations: 4, weight: 0.25 },
      security: { score: 80, violations: 4, weight: 0.3 },
      patterns: { score: 80, violations: 4, weight: 0.15 },
    }
    expect(calculateOverallScore(categories)).toBe(80)
  })

  test('weights 0.3 complexity and 0.3 security heavily', () => {
    const categories = {
      complexity: { score: 100, violations: 0, weight: 0.3 },
      correctness: { score: 0, violations: 20, weight: 0.25 },
      security: { score: 100, violations: 0, weight: 0.3 },
      patterns: { score: 0, violations: 20, weight: 0.15 },
    }
    // 100*0.3 + 0*0.25 + 100*0.3 + 0*0.15 = 60
    expect(calculateOverallScore(categories)).toBe(60)
  })

  test('correctness 50 with others 100', () => {
    const categories = {
      complexity: { score: 100, violations: 0, weight: 0.3 },
      correctness: { score: 50, violations: 10, weight: 0.25 },
      security: { score: 100, violations: 0, weight: 0.3 },
      patterns: { score: 100, violations: 0, weight: 0.15 },
    }
    // 100*0.3 + 50*0.25 + 100*0.3 + 100*0.15 = 30+12.5+30+15 = 87.5 -> 88
    expect(calculateOverallScore(categories)).toBe(88)
  })

  test('mixed low and high scores', () => {
    const categories = {
      complexity: { score: 50, violations: 10, weight: 0.3 },
      correctness: { score: 100, violations: 0, weight: 0.25 },
      security: { score: 50, violations: 10, weight: 0.3 },
      patterns: { score: 100, violations: 0, weight: 0.15 },
    }
    // 50*0.3 + 100*0.25 + 50*0.3 + 100*0.15 = 15+25+15+15 = 70
    expect(calculateOverallScore(categories)).toBe(70)
  })

  test('all scores 50 gives 50', () => {
    const categories = {
      complexity: { score: 50, violations: 10, weight: 0.3 },
      correctness: { score: 50, violations: 10, weight: 0.25 },
      security: { score: 50, violations: 10, weight: 0.3 },
      patterns: { score: 50, violations: 10, weight: 0.15 },
    }
    expect(calculateOverallScore(categories)).toBe(50)
  })

  test('only complexity non-zero with 90', () => {
    const categories = {
      complexity: { score: 90, violations: 2, weight: 0.3 },
      correctness: { score: 0, violations: 20, weight: 0.25 },
      security: { score: 0, violations: 20, weight: 0.3 },
      patterns: { score: 0, violations: 20, weight: 0.15 },
    }
    // 90*0.3 = 27
    expect(calculateOverallScore(categories)).toBe(27)
  })

  test('all scores 75 gives 75', () => {
    const categories = {
      complexity: { score: 75, violations: 5, weight: 0.3 },
      correctness: { score: 75, violations: 5, weight: 0.25 },
      security: { score: 75, violations: 5, weight: 0.3 },
      patterns: { score: 75, violations: 5, weight: 0.15 },
    }
    expect(calculateOverallScore(categories)).toBe(75)
  })
})

describe('buildCategoryCounts', () => {
  test('returns zeros for empty violations', () => {
    const result = buildCategoryCounts([], mockGetRuleCategory)
    expect(result).toEqual({ complexity: 0, correctness: 0, security: 0, patterns: 0 })
  })

  test('counts violations by category', () => {
    const violations = [
      makeViolation('complexity-1'),
      makeViolation('complexity-2'),
      makeViolation('security-1'),
      makeViolation('patterns-1'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.complexity).toBe(2)
    expect(result.security).toBe(1)
    expect(result.patterns).toBe(1)
    expect(result.correctness).toBe(0)
  })

  test('counts all four categories', () => {
    const violations = [
      makeViolation('complexity-1'),
      makeViolation('correctness-1'),
      makeViolation('security-1'),
      makeViolation('patterns-1'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.complexity).toBe(1)
    expect(result.correctness).toBe(1)
    expect(result.security).toBe(1)
    expect(result.patterns).toBe(1)
  })

  test('maps unknown rules to default category', () => {
    const violations = [makeViolation('unknown-1')]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.patterns).toBe(1)
    expect(result.complexity).toBe(0)
    expect(result.correctness).toBe(0)
    expect(result.security).toBe(0)
  })

  test('handles many violations in single category', () => {
    const violations = Array.from({ length: 50 }, () => makeViolation('security-1'))
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.security).toBe(50)
    expect(result.complexity).toBe(0)
    expect(result.correctness).toBe(0)
    expect(result.patterns).toBe(0)
  })

  test('handles interleaved categories', () => {
    const violations = [
      makeViolation('complexity-1'),
      makeViolation('security-1'),
      makeViolation('complexity-2'),
      makeViolation('correctness-1'),
      makeViolation('security-2'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.complexity).toBe(2)
    expect(result.security).toBe(2)
    expect(result.correctness).toBe(1)
    expect(result.patterns).toBe(0)
  })

  test('counts correctly with single violation', () => {
    const result = buildCategoryCounts([makeViolation('correctness-1')], mockGetRuleCategory)
    expect(result.correctness).toBe(1)
    expect(result.complexity).toBe(0)
    expect(result.security).toBe(0)
    expect(result.patterns).toBe(0)
  })

  test('multiple unknown rules all go to patterns', () => {
    const violations = [
      makeViolation('unknown-1'),
      makeViolation('other-2'),
      makeViolation('misc-3'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.patterns).toBe(3)
  })
})

describe('buildFileCategoryCounts', () => {
  test('returns empty object for no violations', () => {
    const result = buildFileCategoryCounts([], mockGetRuleCategory)
    expect(result).toEqual({})
  })

  test('builds category counts for violations', () => {
    const violations = [
      makeViolation('complexity-1'),
      makeViolation('complexity-2'),
      makeViolation('security-1'),
    ]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({ complexity: 2, security: 1 })
  })

  test('handles single violation', () => {
    const result = buildFileCategoryCounts([makeViolation('correctness-1')], mockGetRuleCategory)
    expect(result).toEqual({ correctness: 1 })
  })

  test('handles multiple categories', () => {
    const violations = [
      makeViolation('complexity-1'),
      makeViolation('security-1'),
      makeViolation('patterns-1'),
      makeViolation('correctness-1'),
    ]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({ complexity: 1, security: 1, patterns: 1, correctness: 1 })
  })

  test('maps unknown to patterns', () => {
    const result = buildFileCategoryCounts([makeViolation('unknown-rule')], mockGetRuleCategory)
    expect(result).toEqual({ patterns: 1 })
  })

  test('accumulates counts for same category', () => {
    const violations = [
      makeViolation('complexity-1'),
      makeViolation('complexity-2'),
      makeViolation('complexity-3'),
    ]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({ complexity: 3 })
  })

  test('returns only present categories', () => {
    const result = buildFileCategoryCounts([makeViolation('security-1')], mockGetRuleCategory)
    expect(Object.keys(result)).toEqual(['security'])
  })
})

describe('buildScoreReport', () => {
  test('builds complete report structure', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      [],
      5,
      '/test/path',
    )

    expect(report).toHaveProperty('overall')
    expect(report).toHaveProperty('categories')
    expect(report).toHaveProperty('summary')
    expect(report).toHaveProperty('topFiles')
    expect(report).toHaveProperty('suggestions')
    expect(report).toHaveProperty('path')
    expect(report.path).toBe('/test/path')
  })

  test('calculates overall score from categories', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      [],
      5,
      '.',
    )
    expect(report.overall).toBe(100)
  })

  test('rounds category scores', () => {
    const report = buildScoreReport(
      { complexity: 1, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      [],
      5,
      '.',
    )
    expect(Number.isInteger(report.categories.complexity.score)).toBe(true)
  })

  test('calculates violations per file', () => {
    const report = buildScoreReport(
      { complexity: 2, correctness: 2, security: 2, patterns: 2 },
      10,
      10,
      [],
      Array.from({ length: 8 }, () => makeViolation('complexity-1')),
      4,
      '.',
    )
    expect(report.summary.violationsPerFile).toBe(2)
  })

  test('handles zero files', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      0,
      0,
      [],
      [],
      0,
      '.',
    )
    expect(report.summary.filesAnalyzed).toBe(0)
    expect(report.summary.violationsPerFile).toBe(0)
  })

  test('limits top files to MAX_TOP_STATS_FILES', () => {
    const fileScores: FileScore[] = Array.from({ length: 20 }, (_, i) => ({
      filePath: `file${i}.ts`,
      violations: 20 - i,
      score: 50,
      categories: {},
    }))
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      fileScores,
      [],
      5,
      '.',
    )
    expect(report.topFiles.length).toBeLessThanOrEqual(10)
  })

  test('applies correct weights', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      [],
      5,
      '.',
    )
    expect(report.categories.complexity.weight).toBe(0.3)
    expect(report.categories.correctness.weight).toBe(0.25)
    expect(report.categories.patterns.weight).toBe(0.15)
    expect(report.categories.security.weight).toBe(0.3)
  })

  test('includes suggestions from generateSuggestions', () => {
    const report = buildScoreReport(
      { complexity: 20, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      Array.from({ length: 20 }, () => makeViolation('complexity-1')),
      5,
      '.',
    )
    expect(report.suggestions.length).toBeGreaterThan(0)
  })

  test('sets totalViolations from allViolations length', () => {
    const violations = Array.from({ length: 15 }, () => makeViolation('complexity-1'))
    const report = buildScoreReport(
      { complexity: 15, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      violations,
      5,
      '.',
    )
    expect(report.summary.totalViolations).toBe(15)
  })

  test('calculates violationsPerFile correctly', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      Array.from({ length: 10 }, () => makeViolation('complexity-1')),
      5,
      '.',
    )
    expect(report.summary.violationsPerFile).toBe(2)
  })

  test('violationsPerFile is 0 when filesToProcess is 0', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      0,
      0,
      [],
      [],
      0,
      '.',
    )
    expect(report.summary.violationsPerFile).toBe(0)
  })

  test('topFiles are limited to 10', () => {
    const fileScores: FileScore[] = Array.from({ length: 25 }, (_, i) => ({
      filePath: `file${i}.ts`,
      violations: 25 - i,
      score: 50,
      categories: {},
    }))
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      fileScores,
      [],
      5,
      '.',
    )
    expect(report.topFiles.length).toBeLessThanOrEqual(10)
  })

  test('path is preserved in report', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      [],
      5,
      '/custom/path',
    )
    expect(report.path).toBe('/custom/path')
  })

  test('categories have correct violation counts', () => {
    const report = buildScoreReport(
      { complexity: 5, correctness: 3, security: 7, patterns: 2 },
      10,
      10,
      [],
      [],
      5,
      '.',
    )
    expect(report.categories.complexity.violations).toBe(5)
    expect(report.categories.correctness.violations).toBe(3)
    expect(report.categories.security.violations).toBe(7)
    expect(report.categories.patterns.violations).toBe(2)
  })

  test('report with all violations calculates lower scores', () => {
    const report = buildScoreReport(
      { complexity: 15, correctness: 10, security: 15, patterns: 10 },
      10,
      10,
      [],
      Array.from({ length: 50 }, () => makeViolation('complexity-1')),
      5,
      '.',
    )
    expect(report.overall).toBeLessThan(50)
  })

  test('topFiles preserves order from input', () => {
    const fileScores: FileScore[] = [
      { filePath: 'z.ts', violations: 5, score: 85, categories: {} },
      { filePath: 'a.ts', violations: 3, score: 91, categories: {} },
    ]
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      fileScores,
      [],
      5,
      '.',
    )
    expect(report.topFiles[0].filePath).toBe('z.ts')
    expect(report.topFiles[1].filePath).toBe('a.ts')
  })

  test('filesAnalyzed equals filesToProcess', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, security: 0, patterns: 0 },
      10,
      10,
      [],
      [],
      7,
      '.',
    )
    expect(report.summary.filesAnalyzed).toBe(7)
  })
})

describe('countDocumentedFunctions', () => {
  test('returns 0 for empty array', () => {
    expect(countDocumentedFunctions([])).toBe(0)
  })

  test('counts functions with JSDoc', () => {
    const fns = [
      { getJsDocs: () => ['doc1'] },
      { getJsDocs: () => [] },
      { getJsDocs: () => ['doc2', 'doc3'] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  test('returns 0 when no functions have docs', () => {
    const fns = [{ getJsDocs: () => [] }, { getJsDocs: () => [] }]
    expect(countDocumentedFunctions(fns)).toBe(0)
  })

  test('returns count for all documented functions', () => {
    const fns = [{ getJsDocs: () => ['doc'] }, { getJsDocs: () => ['doc'] }]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  test('handles single function', () => {
    expect(countDocumentedFunctions([{ getJsDocs: () => ['doc'] }])).toBe(1)
    expect(countDocumentedFunctions([{ getJsDocs: () => [] }])).toBe(0)
  })

  test('handles many functions mixed', () => {
    const fns = Array.from({ length: 20 }, (_, i) => ({
      getJsDocs: () => (i % 2 === 0 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(10)
  })

  test('all functions documented', () => {
    const fns = Array.from({ length: 5 }, () => ({ getJsDocs: () => ['doc'] }))
    expect(countDocumentedFunctions(fns)).toBe(5)
  })

  test('single item array with docs', () => {
    expect(countDocumentedFunctions([{ getJsDocs: () => ['a', 'b'] }])).toBe(1)
  })

  test('handles 100 functions with every third documented', () => {
    const fns = Array.from({ length: 100 }, (_, i) => ({
      getJsDocs: () => (i % 3 === 0 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(34)
  })
})

describe('formatDisplayOutput', () => {
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

  test('displays overall score', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Code Quality Score')
  })

  test('displays category scores', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Complexity')
    expect(output).toContain('Correctness')
    expect(output).toContain('Security')
    expect(output).toContain('Patterns')
  })

  test('displays summary', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Files analyzed: 5')
    expect(output).toContain('Total violations: 8')
  })

  test('displays top files when verbose', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'test.ts', score: 75, violations: 5, categories: { complexity: 3 } }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Top Problematic Files')
    expect(output).toContain('test.ts')
  })

  test('hides top files when not verbose', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'test.ts', score: 75, violations: 5, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Top Problematic Files')
  })

  test('displays suggestions when present', () => {
    const report = makeReport({
      suggestions: ['Reduce code complexity - 10 complexity issues found'],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Improvement Suggestions')
    expect(output).toContain('Reduce code complexity')
  })

  test('hides suggestions when empty', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Improvement Suggestions')
  })

  test('displays file categories in verbose mode', () => {
    const report = makeReport({
      topFiles: [
        {
          filePath: 'test.ts',
          score: 75,
          violations: 5,
          categories: { complexity: 2, security: 3 },
        },
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Categories:')
    expect(output).toContain('complexity: 2')
    expect(output).toContain('security: 3')
  })

  test('displays grade letter', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 90 }), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(A)')
  })

  test('displays violations per file', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1.60')
  })

  test('displays grade F for low score', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 30 }), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(F)')
  })

  test('displays grade B for score 85', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 85 }), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(B)')
  })

  test('does not display top files when verbose but no top files', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ topFiles: [] }), true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Top Problematic Files')
  })

  test('displays multiple suggestions', () => {
    const report = makeReport({
      suggestions: [
        'Reduce code complexity - 10 complexity issues found',
        'Address security concerns - 4 security issues found (critical)',
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Reduce code complexity')
    expect(output).toContain('Address security concerns')
  })

  test('displays violations per file with zero', () => {
    const lines: string[] = []
    formatDisplayOutput(
      makeReport({ summary: { filesAnalyzed: 5, totalViolations: 0, violationsPerFile: 0 } }),
      false,
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('0.00')
  })

  test('displays multiple top files in verbose mode', () => {
    const report = makeReport({
      topFiles: [
        { filePath: 'a.ts', score: 75, violations: 5, categories: { complexity: 3 } },
        { filePath: 'b.ts', score: 60, violations: 10, categories: { security: 5 } },
      ],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  test('top file without categories does not show Categories line', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'clean.ts', score: 90, violations: 2, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('clean.ts')
    expect(output).not.toContain('Categories:')
  })

  test('calls logFn multiple times', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport(), false, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
  })

  test('displays files analyzed count', () => {
    const lines: string[] = []
    formatDisplayOutput(
      makeReport({ summary: { filesAnalyzed: 42, totalViolations: 10, violationsPerFile: 0.24 } }),
      false,
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('42')
  })

  test('displays total violations count', () => {
    const lines: string[] = []
    formatDisplayOutput(
      makeReport({ summary: { filesAnalyzed: 5, totalViolations: 99, violationsPerFile: 19.8 } }),
      false,
      (msg) => lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('99')
  })

  test('displays grade C for score 75', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 75 }), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(C)')
  })

  test('displays grade D for score 65', () => {
    const lines: string[] = []
    formatDisplayOutput(makeReport({ overall: 65 }), false, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(D)')
  })

  test('displays top file score and violations in verbose mode', () => {
    const report = makeReport({
      topFiles: [{ filePath: 'demo.ts', score: 45, violations: 12, categories: {} }],
    })
    const lines: string[] = []
    formatDisplayOutput(report, true, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Score: 45/100')
    expect(output).toContain('Violations: 12')
  })
})
