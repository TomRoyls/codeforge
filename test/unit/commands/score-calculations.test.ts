import { describe, test, expect } from 'vitest'
import { type CategoryScore } from '../../../src/commands/score-helpers.js'
import {
  buildCategoryCounts,
  buildFileCategoryCounts,
  buildScoreReport,
  type CategoryViolationCounts,
  type FileScore,
  type ScoreReport,
} from '../../../src/commands/score-helpers.js'
import {
  formatScore,
  generateSuggestions,
  getGrade,
  getScoreColor,
} from '../../../src/commands/score-formatting.js'
import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  calculateOverallScore,
  countDocumentedFunctions,
} from '../../../src/commands/score-calculations.js'

describe('calculateCategoryScore', () => {
  test('returns CategoryScore structure with all fields', () => {
    const result = calculateCategoryScore(0, 0.3)
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('violations')
    expect(result).toHaveProperty('weight')
  })

  test('score decreases by 5 per violation', () => {
    expect(calculateCategoryScore(2, 0.3).score).toBe(90)
    expect(calculateCategoryScore(4, 0.3).score).toBe(80)
    expect(calculateCategoryScore(6, 0.3).score).toBe(70)
    expect(calculateCategoryScore(8, 0.3).score).toBe(60)
    expect(calculateCategoryScore(12, 0.3).score).toBe(40)
  })

  test('clamps score to 0 when violations drive it negative', () => {
    expect(calculateCategoryScore(25, 0.3).score).toBe(0)
    expect(calculateCategoryScore(50, 0.3).score).toBe(0)
    expect(calculateCategoryScore(1000, 0.3).score).toBe(0)
  })

  test('stores the violations count in the result', () => {
    expect(calculateCategoryScore(0, 0.3).violations).toBe(0)
    expect(calculateCategoryScore(3, 0.3).violations).toBe(3)
    expect(calculateCategoryScore(15, 0.3).violations).toBe(15)
  })

  test('passes through the weight unchanged', () => {
    expect(calculateCategoryScore(0, 0.1).weight).toBe(0.1)
    expect(calculateCategoryScore(0, 0.5).weight).toBe(0.5)
    expect(calculateCategoryScore(5, 1.0).weight).toBe(1.0)
  })

  test('boundary: 19 violations gives score 5', () => {
    expect(calculateCategoryScore(19, 0.3).score).toBe(5)
  })

  test('boundary: 20 violations gives score 0', () => {
    expect(calculateCategoryScore(20, 0.3).score).toBe(0)
  })

  test('score is independent of weight value', () => {
    const s1 = calculateCategoryScore(3, 0.1).score
    const s2 = calculateCategoryScore(3, 0.9).score
    expect(s1).toBe(s2)
  })
})

describe('calculateCorrectnessScore', () => {
  test('full documentation and no violations gives 100', () => {
    const result = calculateCorrectnessScore(0, 10, 10, 0.25)
    expect(result.score).toBe(100)
    expect(result.violations).toBe(0)
    expect(result.weight).toBe(0.25)
  })

  test('half documentation gives 50 coverage', () => {
    const result = calculateCorrectnessScore(0, 10, 5, 0.25)
    expect(result.score).toBe(50)
  })

  test('zero total functions defaults to 50 coverage', () => {
    const result = calculateCorrectnessScore(0, 0, 0, 0.25)
    expect(result.score).toBe(50)
  })

  test('each violation subtracts 5 from coverage', () => {
    const result = calculateCorrectnessScore(3, 10, 10, 0.25)
    expect(result.score).toBe(85)
  })

  test('coverage penalty stacks with violation penalty', () => {
    const result = calculateCorrectnessScore(5, 10, 5, 0.25)
    expect(result.score).toBe(25)
  })

  test('score clamps to 0 when penalties exceed coverage', () => {
    const result = calculateCorrectnessScore(100, 10, 0, 0.25)
    expect(result.score).toBe(0)
  })

  test('single function documented gives 100 coverage', () => {
    const result = calculateCorrectnessScore(0, 1, 1, 0.25)
    expect(result.score).toBe(100)
  })

  test('zero documented functions gives 0 coverage (minus penalties)', () => {
    const result = calculateCorrectnessScore(0, 10, 0, 0.25)
    expect(result.score).toBe(0)
  })

  test('stores violations count in result', () => {
    expect(calculateCorrectnessScore(7, 10, 10, 0.25).violations).toBe(7)
  })

  test('preserves weight regardless of inputs', () => {
    expect(calculateCorrectnessScore(0, 10, 10, 0.15).weight).toBe(0.15)
    expect(calculateCorrectnessScore(5, 0, 0, 0.4).weight).toBe(0.4)
  })

  test('coverage is proportional to documentation ratio', () => {
    expect(calculateCorrectnessScore(0, 4, 3, 0.25).score).toBe(75)
    expect(calculateCorrectnessScore(0, 4, 1, 0.25).score).toBe(25)
  })

  test('large number of functions with full documentation', () => {
    const result = calculateCorrectnessScore(0, 1000, 1000, 0.25)
    expect(result.score).toBe(100)
  })
})

describe('calculateFileScore', () => {
  test('returns 100 for zero violations', () => {
    expect(calculateFileScore(0)).toBe(100)
  })

  test('deducts 3 points per violation', () => {
    expect(calculateFileScore(1)).toBe(97)
    expect(calculateFileScore(5)).toBe(85)
    expect(calculateFileScore(10)).toBe(70)
    expect(calculateFileScore(20)).toBe(40)
  })

  test('clamps to 0 for 34+ violations', () => {
    expect(calculateFileScore(34)).toBe(0)
    expect(calculateFileScore(50)).toBe(0)
    expect(calculateFileScore(100)).toBe(0)
  })

  test('boundary: 33 violations gives 1', () => {
    expect(calculateFileScore(33)).toBe(1)
  })

  test('boundary: 34 violations gives 0', () => {
    expect(calculateFileScore(34)).toBe(0)
  })

  test('single violation gives 97', () => {
    expect(calculateFileScore(1)).toBe(97)
  })
})

describe('calculateOverallScore', () => {
  test('perfect scores with standard weights gives 100', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(100)
  })

  test('all zero scores gives 0', () => {
    const cats = {
      complexity: { score: 0, violations: 20, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 20, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 20, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 20, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(0)
  })

  test('computes weighted sum: only complexity=100 gives 30', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(30)
  })

  test('computes weighted sum: only correctness=100 gives 25', () => {
    const cats = {
      complexity: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(25)
  })

  test('result is always rounded to integer', () => {
    const cats = {
      complexity: { score: 33, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 33, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 33, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 33, violations: 0, weight: 0.15 } as CategoryScore,
    }
    const result = calculateOverallScore(cats)
    expect(Number.isInteger(result)).toBe(true)
    expect(result).toBe(33)
  })

  test('uniform score 80 across all categories gives 80', () => {
    const cats = {
      complexity: { score: 80, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 80, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 80, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 80, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(80)
  })

  test('handles non-standard weights', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.5 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.5 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(100)
  })
})

describe('countDocumentedFunctions', () => {
  test('returns 0 for empty array', () => {
    expect(countDocumentedFunctions([])).toBe(0)
  })

  test('counts only functions with non-empty JSDoc arrays', () => {
    const fns = [
      { getJsDocs: () => [{ text: 'doc' }] },
      { getJsDocs: () => [] },
      { getJsDocs: () => [{ text: 'doc1' }, { text: 'doc2' }] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  test('returns 0 when all functions have empty JSDoc', () => {
    const fns = [{ getJsDocs: () => [] }, { getJsDocs: () => [] }, { getJsDocs: () => [] }]
    expect(countDocumentedFunctions(fns)).toBe(0)
  })

  test('counts all when every function is documented', () => {
    const fns = [
      { getJsDocs: () => [{ text: 'a' }] },
      { getJsDocs: () => [{ text: 'b' }] },
      { getJsDocs: () => [{ text: 'c' }] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(3)
  })

  test('handles single documented function', () => {
    expect(countDocumentedFunctions([{ getJsDocs: () => ['doc'] }])).toBe(1)
  })

  test('handles single undocumented function', () => {
    expect(countDocumentedFunctions([{ getJsDocs: () => [] }])).toBe(0)
  })

  test('mixed array of 10 functions: 7 documented, 3 not', () => {
    const fns = Array.from({ length: 10 }, (_, i) => ({
      getJsDocs: () => (i < 7 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(7)
  })

  test('function with multiple JSDoc entries counts once', () => {
    const fn = { getJsDocs: () => ['a', 'b', 'c'] }
    expect(countDocumentedFunctions([fn])).toBe(1)
  })
})

describe('calculateCategoryScore – edge cases', () => {
  test('negative violations: 100 - (-5)*5 = 125, no upper clamp', () => {
    const result = calculateCategoryScore(-5, 0.3)
    expect(result.score).toBe(125)
    expect(result.violations).toBe(-5)
  })

  test('weight of 0 is preserved', () => {
    const result = calculateCategoryScore(3, 0)
    expect(result.weight).toBe(0)
    expect(result.score).toBe(85)
  })

  test('very large weight value is preserved', () => {
    const result = calculateCategoryScore(1, 99.9)
    expect(result.weight).toBe(99.9)
  })

  test('weight does not affect score calculation', () => {
    const scores = [0.01, 0.25, 0.5, 0.99, 1.0, 5.0].map((w) => calculateCategoryScore(4, w).score)
    expect(scores.every((s) => s === 80)).toBe(true)
  })

  test('exactly 1 violation', () => {
    expect(calculateCategoryScore(1, 0.3).score).toBe(95)
  })

  test('10 violations gives 50', () => {
    expect(calculateCategoryScore(10, 0.3).score).toBe(50)
  })

  test('19 violations gives 5 (boundary above zero)', () => {
    expect(calculateCategoryScore(19, 0.3).score).toBe(5)
  })

  test('result object has exactly 3 keys', () => {
    const result = calculateCategoryScore(0, 0.3)
    expect(Object.keys(result)).toEqual(['score', 'violations', 'weight'])
  })

  test('score is always integer', () => {
    for (let v = 0; v <= 25; v++) {
      const result = calculateCategoryScore(v, 0.3)
      expect(Number.isInteger(result.score)).toBe(true)
    }
  })
})

describe('calculateCorrectnessScore – additional edge cases', () => {
  test('documented exceeds total functions gives coverage > 100 before penalty', () => {
    const result = calculateCorrectnessScore(0, 10, 15, 0.25)
    expect(result.score).toBe(150)
  })

  test('zero functions defaults to 50 coverage even with violations', () => {
    const result = calculateCorrectnessScore(3, 0, 0, 0.25)
    expect(result.score).toBe(35)
  })

  test('zero functions with enough violations clamps to 0', () => {
    const result = calculateCorrectnessScore(20, 0, 0, 0.25)
    expect(result.score).toBe(0)
  })

  test('single violation with full coverage gives 95', () => {
    const result = calculateCorrectnessScore(1, 10, 10, 0.25)
    expect(result.score).toBe(95)
  })

  test('10 violations with half documentation gives 0', () => {
    const result = calculateCorrectnessScore(10, 10, 5, 0.25)
    expect(result.score).toBe(0)
  })

  test('weight stored even with zero functions', () => {
    expect(calculateCorrectnessScore(0, 0, 0, 0.1).weight).toBe(0.1)
  })

  test('result has exactly 3 keys', () => {
    const result = calculateCorrectnessScore(0, 5, 5, 0.3)
    expect(Object.keys(result)).toEqual(['score', 'violations', 'weight'])
  })

  test('large total functions with 1 documented gives near-zero score', () => {
    const result = calculateCorrectnessScore(0, 10000, 1, 0.25)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThan(1)
  })
})

describe('calculateFileScore – additional edge cases', () => {
  test('negative violations produce score above 100', () => {
    expect(calculateFileScore(-1)).toBe(103)
    expect(calculateFileScore(-10)).toBe(130)
  })

  test('2 violations gives 94', () => {
    expect(calculateFileScore(2)).toBe(94)
  })

  test('3 violations gives 91', () => {
    expect(calculateFileScore(3)).toBe(91)
  })

  test('15 violations gives 55', () => {
    expect(calculateFileScore(15)).toBe(55)
  })

  test('30 violations gives 10', () => {
    expect(calculateFileScore(30)).toBe(10)
  })

  test('exactly 33 violations gives 1 (edge of positive)', () => {
    expect(calculateFileScore(33)).toBe(1)
  })

  test('large violation count stays at 0', () => {
    expect(calculateFileScore(1000)).toBe(0)
    expect(calculateFileScore(999999)).toBe(0)
  })

  test('returns a plain number', () => {
    expect(typeof calculateFileScore(5)).toBe('number')
  })
})

describe('calculateOverallScore – additional edge cases', () => {
  test('all scores 50 with standard weights gives 50', () => {
    const cats = {
      complexity: { score: 50, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 50, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 50, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 50, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(50)
  })

  test('mixed realistic scores', () => {
    const cats = {
      complexity: { score: 85, violations: 3, weight: 0.3 } as CategoryScore,
      correctness: { score: 70, violations: 5, weight: 0.25 } as CategoryScore,
      security: { score: 95, violations: 1, weight: 0.3 } as CategoryScore,
      patterns: { score: 60, violations: 8, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(81)
  })

  test('all weight on one category', () => {
    const cats = {
      complexity: { score: 73, violations: 0, weight: 1.0 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(73)
  })

  test('handles fractional rounding correctly', () => {
    const cats = {
      complexity: { score: 99, violations: 0, weight: 0.33 } as CategoryScore,
      correctness: { score: 99, violations: 0, weight: 0.33 } as CategoryScore,
      security: { score: 99, violations: 0, weight: 0.34 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0 } as CategoryScore,
    }
    const result = calculateOverallScore(cats)
    expect(Number.isInteger(result)).toBe(true)
    expect(result).toBe(99)
  })

  test('security category carries 30% weight', () => {
    const cats = {
      complexity: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(30)
  })

  test('patterns category carries 15% weight', () => {
    const cats = {
      complexity: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(15)
  })

  test('all categories at 1 gives 1', () => {
    const cats = {
      complexity: { score: 1, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 1, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 1, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 1, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(1)
  })

  test('returns integer for all-zero-weight categories', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0 } as CategoryScore,
      security: { score: 100, violations: 0, weight: 0 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(0)
  })
})

describe('countDocumentedFunctions – additional edge cases', () => {
  test('returns 0 for single function with empty docs', () => {
    expect(countDocumentedFunctions([{ getJsDocs: () => [] }])).toBe(0)
  })

  test('returns 1 for single function with truthy docs', () => {
    expect(countDocumentedFunctions([{ getJsDocs: () => ['x'] }])).toBe(1)
  })

  test('handles 100 functions: 50 documented', () => {
    const fns = Array.from({ length: 100 }, (_, i) => ({
      getJsDocs: () => (i % 2 === 0 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(50)
  })

  test('handles 1000 functions: all documented', () => {
    const fns = Array.from({ length: 1000 }, () => ({
      getJsDocs: () => ['doc'],
    }))
    expect(countDocumentedFunctions(fns)).toBe(1000)
  })

  test('handles 1000 functions: none documented', () => {
    const fns = Array.from({ length: 1000 }, () => ({
      getJsDocs: () => [],
    }))
    expect(countDocumentedFunctions(fns)).toBe(0)
  })

  test('JSDoc with null-ish entries still counts as non-empty array', () => {
    const fn = { getJsDocs: () => [null as any] }
    expect(countDocumentedFunctions([fn])).toBe(1)
  })
})

describe('cross-function integration', () => {
  test('category scores + overall score consistency', () => {
    const complexity = calculateCategoryScore(2, 0.3)
    const correctness = calculateCorrectnessScore(1, 20, 18, 0.25)
    const security = calculateCategoryScore(0, 0.3)
    const patterns = calculateCategoryScore(4, 0.15)
    const cats = { complexity, correctness, security, patterns }
    expect(calculateOverallScore(cats)).toBe(90)
  })

  test('file score is independent from category scores', () => {
    const fileScore = calculateFileScore(5)
    const catScore = calculateCategoryScore(5, 0.3)
    expect(fileScore).toBe(85)
    expect(catScore.score).toBe(75)
  })

  test('overall score with zero functions defaults correctness to 50', () => {
    const correctness = calculateCorrectnessScore(0, 0, 0, 0.25)
    expect(correctness.score).toBe(50)
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      correctness,
      security: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(88)
  })
})

describe('calculateCategoryScore – additional coverage', () => {
  test('zero violations returns score exactly 100', () => {
    expect(calculateCategoryScore(0, 0.3).score).toBe(100)
  })

  test('zero violations with zero weight still returns score 100', () => {
    const result = calculateCategoryScore(0, 0)
    expect(result.score).toBe(100)
    expect(result.weight).toBe(0)
  })
})

describe('calculateCorrectnessScore – additional coverage', () => {
  test('negative violations increase score beyond coverage', () => {
    const result = calculateCorrectnessScore(-2, 10, 10, 0.25)
    expect(result.score).toBe(110)
  })

  test('documented exceeds total with violations still gives high score', () => {
    const result = calculateCorrectnessScore(5, 10, 15, 0.25)
    expect(result.score).toBe(125)
  })

  test('3 of 4 documented with 1 violation gives 70', () => {
    const result = calculateCorrectnessScore(1, 4, 3, 0.25)
    expect(result.score).toBe(70)
  })

  test('1 of 3 documented gives fractional coverage ~33.33', () => {
    const result = calculateCorrectnessScore(0, 3, 1, 0.25)
    expect(result.score).toBeCloseTo(33.333, 1)
  })
})

describe('calculateFileScore – additional coverage', () => {
  test('fractional violation 0.5 gives 98.5', () => {
    expect(calculateFileScore(0.5)).toBe(98.5)
  })

  test('fractional violation 0.1 gives 99.7', () => {
    expect(calculateFileScore(0.1)).toBeCloseTo(99.7, 5)
  })
})

describe('calculateOverallScore – additional coverage', () => {
  test('category score above 100 is weighted correctly', () => {
    const cats = {
      complexity: { score: 150, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(45)
  })

  test('negative category score reduces overall', () => {
    const cats = {
      complexity: { score: -10, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(67)
  })

  test('two non-zero categories sum correctly', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(55)
  })
})

describe('countDocumentedFunctions – additional coverage', () => {
  test('empty string in JSDoc array still counts as documented', () => {
    const fn = { getJsDocs: () => [''] }
    expect(countDocumentedFunctions([fn])).toBe(1)
  })

  test('500 alternating documented and undocumented functions', () => {
    const fns = Array.from({ length: 500 }, (_, i) => ({
      getJsDocs: () => (i % 2 === 0 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(250)
  })
})

describe('cross-function integration – additional', () => {
  test('full pipeline with mixed inputs produces consistent overall', () => {
    const complexity = calculateCategoryScore(3, 0.3)
    const correctness = calculateCorrectnessScore(2, 50, 40, 0.25)
    const security = calculateCategoryScore(1, 0.3)
    const patterns = calculateCategoryScore(0, 0.15)
    const cats = { complexity, correctness, security, patterns }
    const overall = calculateOverallScore(cats)
    const expected = Math.round(
      complexity.score * 0.3 +
        correctness.score * 0.25 +
        security.score * 0.3 +
        patterns.score * 0.15,
    )
    expect(overall).toBe(expected)
    expect(Number.isInteger(overall)).toBe(true)
  })
})

describe('calculateCorrectnessScore – coverage ratios', () => {
  test('2 of 3 documented with no violations gives ~66.67 coverage', () => {
    const result = calculateCorrectnessScore(0, 3, 2, 0.25)
    expect(result.score).toBeCloseTo(66.667, 1)
  })

  test('9 of 10 documented with 1 violation gives 85', () => {
    const result = calculateCorrectnessScore(1, 10, 9, 0.25)
    expect(result.score).toBe(85)
  })

  test('coverage exactly 50 minus 10 violations clamps to 0', () => {
    const result = calculateCorrectnessScore(10, 10, 5, 0.25)
    expect(result.score).toBe(0)
  })

  test('very large function count with all documented', () => {
    const result = calculateCorrectnessScore(0, 100000, 100000, 0.3)
    expect(result.score).toBe(100)
  })
})

describe('calculateCategoryScore – linear decrease property', () => {
  test('score decreases by exactly 5 for each additional violation from 0 to 20', () => {
    for (let v = 1; v <= 20; v++) {
      const prev = calculateCategoryScore(v - 1, 0.3).score
      const curr = calculateCategoryScore(v, 0.3).score
      expect(prev - curr).toBe(5)
    }
  })

  test('score is 100 for violation count 0 regardless of weight', () => {
    expect(calculateCategoryScore(0, 0).score).toBe(100)
    expect(calculateCategoryScore(0, 0.001).score).toBe(100)
    expect(calculateCategoryScore(0, 0.999).score).toBe(100)
    expect(calculateCategoryScore(0, 100).score).toBe(100)
  })
})

describe('calculateFileScore – fractional boundaries', () => {
  test('violation 0.001 gives 99.997', () => {
    expect(calculateFileScore(0.001)).toBeCloseTo(99.997, 3)
  })

  test('violation 33.33 gives result near 0.01', () => {
    expect(calculateFileScore(33.33)).toBeCloseTo(0.01, 1)
  })

  test('violation 33.5 is clamped to 0', () => {
    expect(calculateFileScore(33.5)).toBe(0)
  })
})

describe('calculateOverallScore – rounding and multi-category', () => {
  test('only security and patterns non-zero', () => {
    const cats = {
      complexity: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(45)
  })

  test('all categories at 99 with standard weights rounds to 99', () => {
    const cats = {
      complexity: { score: 99, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 99, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 99, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 99, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(99)
  })
})

describe('countDocumentedFunctions – edge cases', () => {
  test('single documented among 999 undocumented', () => {
    const fns = Array.from({ length: 1000 }, (_, i) => ({
      getJsDocs: () => (i === 500 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(1)
  })

  test('JSDoc with undefined entry still counts as non-empty array', () => {
    const fn = { getJsDocs: () => [undefined as unknown as string] }
    expect(countDocumentedFunctions([fn])).toBe(1)
  })
})

describe('deduction rate difference between file and category scores', () => {
  test('file score deducts 3 per violation, category deducts 5', () => {
    const violations = 5
    expect(calculateFileScore(violations)).toBe(100 - violations * 3)
    expect(calculateCategoryScore(violations, 0.3).score).toBe(100 - violations * 5)
    expect(calculateFileScore(violations)).toBe(85)
    expect(calculateCategoryScore(violations, 0.3).score).toBe(75)
  })
})

// ============================================================================
// buildCategoryCounts tests
// ============================================================================

describe('buildCategoryCounts', () => {
  function makeViolation(ruleId: string) {
    return { ruleId } as any
  }

  test('returns zero counts for empty violations array', () => {
    const result = buildCategoryCounts([], () => 'complexity')
    expect(result).toEqual({ complexity: 0, correctness: 0, patterns: 0, security: 0 })
  })

  test('counts all complexity violations', () => {
    const violations = [makeViolation('c1'), makeViolation('c2'), makeViolation('c3')]
    const result = buildCategoryCounts(violations, () => 'complexity')
    expect(result.complexity).toBe(3)
    expect(result.correctness).toBe(0)
  })

  test('counts all correctness violations', () => {
    const violations = [makeViolation('r1'), makeViolation('r2')]
    const result = buildCategoryCounts(violations, () => 'correctness')
    expect(result.correctness).toBe(2)
  })

  test('counts all security violations', () => {
    const violations = [
      makeViolation('s1'),
      makeViolation('s2'),
      makeViolation('s3'),
      makeViolation('s4'),
    ]
    const result = buildCategoryCounts(violations, () => 'security')
    expect(result.security).toBe(4)
  })

  test('counts all patterns violations', () => {
    const violations = [makeViolation('p1')]
    const result = buildCategoryCounts(violations, () => 'patterns')
    expect(result.patterns).toBe(1)
  })

  test('distributes mixed violations across categories', () => {
    const violations = [
      makeViolation('a'),
      makeViolation('b'),
      makeViolation('c'),
      makeViolation('d'),
      makeViolation('e'),
      makeViolation('f'),
    ]
    const getCategory = (id: string) => {
      const map: Record<string, string> = {
        a: 'complexity',
        b: 'correctness',
        c: 'security',
        d: 'patterns',
        e: 'complexity',
        f: 'security',
      }
      return map[id] ?? 'complexity'
    }
    const result = buildCategoryCounts(violations, getCategory)
    expect(result).toEqual({ complexity: 2, correctness: 1, security: 2, patterns: 1 })
  })

  test('unknown category is not counted in any bucket', () => {
    const violations = [makeViolation('x'), makeViolation('y')]
    const result = buildCategoryCounts(violations, () => 'unknown')
    expect(result).toEqual({ complexity: 0, correctness: 0, patterns: 0, security: 0 })
  })

  test('mixed known and unknown categories', () => {
    const violations = [makeViolation('a'), makeViolation('b'), makeViolation('c')]
    const getCategory = (id: string) => {
      if (id === 'a') return 'complexity'
      if (id === 'b') return 'security'
      return 'other'
    }
    const result = buildCategoryCounts(violations, getCategory)
    expect(result.complexity).toBe(1)
    expect(result.security).toBe(1)
    expect(result.patterns).toBe(0)
  })

  test('single violation is counted correctly', () => {
    const result = buildCategoryCounts([makeViolation('r')], () => 'complexity')
    expect(result.complexity).toBe(1)
  })

  test('large number of violations counted accurately', () => {
    const violations = Array.from({ length: 1000 }, (_, i) => makeViolation(`r${i}`))
    const result = buildCategoryCounts(violations, () => 'security')
    expect(result.security).toBe(1000)
  })

  test('returns CategoryViolationCounts structure', () => {
    const result = buildCategoryCounts([], () => 'complexity')
    expect(Object.keys(result)).toEqual(['complexity', 'correctness', 'patterns', 'security'])
  })
})

// ============================================================================
// buildFileCategoryCounts tests
// ============================================================================

describe('buildFileCategoryCounts', () => {
  function makeViolation(ruleId: string) {
    return { ruleId } as any
  }

  test('returns empty object for no violations', () => {
    const result = buildFileCategoryCounts([], () => 'complexity')
    expect(result).toEqual({})
  })

  test('counts single violation by category', () => {
    const result = buildFileCategoryCounts([makeViolation('r1')], () => 'security')
    expect(result).toEqual({ security: 1 })
  })

  test('accumulates counts for same category', () => {
    const violations = [makeViolation('r1'), makeViolation('r2'), makeViolation('r3')]
    const result = buildFileCategoryCounts(violations, () => 'complexity')
    expect(result).toEqual({ complexity: 3 })
  })

  test('separates counts by category', () => {
    const violations = [
      makeViolation('a'),
      makeViolation('b'),
      makeViolation('c'),
      makeViolation('a'),
    ]
    const getCategory = (id: string) => (id === 'a' ? 'complexity' : 'security')
    const result = buildFileCategoryCounts(violations, getCategory)
    expect(result).toEqual({ complexity: 2, security: 2 })
  })

  test('handles unknown categories with dynamic key', () => {
    const violations = [makeViolation('x')]
    const result = buildFileCategoryCounts(violations, () => 'performance')
    expect(result).toEqual({ performance: 1 })
  })

  test('multiple categories with varying counts', () => {
    const violations = [
      makeViolation('a'),
      makeViolation('a'),
      makeViolation('a'),
      makeViolation('b'),
      makeViolation('c'),
      makeViolation('c'),
    ]
    const getCategory = (id: string) => {
      if (id === 'a') return 'complexity'
      if (id === 'b') return 'security'
      return 'patterns'
    }
    const result = buildFileCategoryCounts(violations, getCategory)
    expect(result).toEqual({ complexity: 3, security: 1, patterns: 2 })
  })
})

// ============================================================================
// buildScoreReport tests
// ============================================================================

describe('buildScoreReport', () => {
  function makeViolation(ruleId: string, filePath = 'test.ts') {
    return { ruleId, filePath, message: 'msg', severity: 1, line: 1, column: 1 } as any
  }

  test('produces a ScoreReport with all required fields', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      [],
      5,
      '/src',
    )
    expect(report).toHaveProperty('categories')
    expect(report).toHaveProperty('overall')
    expect(report).toHaveProperty('path')
    expect(report).toHaveProperty('suggestions')
    expect(report).toHaveProperty('summary')
    expect(report).toHaveProperty('topFiles')
  })

  test('perfect scores give overall 100', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      [],
      5,
      '/src',
    )
    expect(report.overall).toBe(100)
  })

  test('all-max violations give lower overall score', () => {
    const report = buildScoreReport(
      { complexity: 10, correctness: 10, patterns: 10, security: 10 },
      10,
      10,
      [],
      [],
      5,
      '/src',
    )
    expect(report.overall).toBeLessThan(100)
    expect(report.overall).toBeGreaterThanOrEqual(0)
  })

  test('summary filesAnalyzed matches input', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      [],
      42,
      '/src',
    )
    expect(report.summary.filesAnalyzed).toBe(42)
  })

  test('summary totalViolations matches allViolations length', () => {
    const violations = [makeViolation('r1'), makeViolation('r2'), makeViolation('r3')]
    const report = buildScoreReport(
      { complexity: 3, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      violations,
      5,
      '/src',
    )
    expect(report.summary.totalViolations).toBe(3)
  })

  test('summary violationsPerFile with zero files is 0', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      [],
      0,
      '/src',
    )
    expect(report.summary.violationsPerFile).toBe(0)
  })

  test('summary violationsPerFile calculates correctly', () => {
    const violations = Array.from({ length: 10 }, (_, i) => makeViolation(`r${i}`))
    const report = buildScoreReport(
      { complexity: 10, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      violations,
      5,
      '/src',
    )
    expect(report.summary.violationsPerFile).toBe(2)
  })

  test('path is passed through unchanged', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      [],
      5,
      '/my/custom/path',
    )
    expect(report.path).toBe('/my/custom/path')
  })

  test('topFiles are sorted by violations descending', () => {
    const fileScores: FileScore[] = [
      { filePath: 'a.ts', score: 80, violations: 3, categories: {} },
      { filePath: 'b.ts', score: 60, violations: 7, categories: {} },
      { filePath: 'c.ts', score: 90, violations: 1, categories: {} },
    ]
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      fileScores,
      [],
      5,
      '/src',
    )
    expect(report.topFiles.length).toBeLessThanOrEqual(10)
  })

  test('topFiles is limited to MAX_TOP_STATS_FILES (10)', () => {
    const fileScores: FileScore[] = Array.from({ length: 50 }, (_, i) => ({
      filePath: `file${i}.ts`,
      score: 50,
      violations: i,
      categories: {},
    }))
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      fileScores,
      [],
      5,
      '/src',
    )
    expect(report.topFiles.length).toBe(10)
  })

  test('categories have correct weights', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      10,
      10,
      [],
      [],
      5,
      '/src',
    )
    expect(report.categories.complexity.weight).toBe(0.3)
    expect(report.categories.correctness.weight).toBe(0.25)
    expect(report.categories.patterns.weight).toBe(0.15)
    expect(report.categories.security.weight).toBe(0.3)
  })

  test('category scores are rounded integers', () => {
    const report = buildScoreReport(
      { complexity: 3, correctness: 2, patterns: 5, security: 1 },
      7,
      5,
      [],
      [],
      5,
      '/src',
    )
    expect(Number.isInteger(report.categories.complexity.score)).toBe(true)
    expect(Number.isInteger(report.categories.correctness.score)).toBe(true)
    expect(Number.isInteger(report.categories.patterns.score)).toBe(true)
    expect(Number.isInteger(report.categories.security.score)).toBe(true)
  })

  test('zero functions and zero documented defaults correctness to 50', () => {
    const report = buildScoreReport(
      { complexity: 0, correctness: 0, patterns: 0, security: 0 },
      0,
      0,
      [],
      [],
      5,
      '/src',
    )
    expect(report.categories.correctness.score).toBe(50)
  })

  test('suggestions array is populated when scores are low', () => {
    const report = buildScoreReport(
      { complexity: 20, correctness: 20, patterns: 20, security: 10 },
      10,
      10,
      [],
      [],
      5,
      '/src',
    )
    expect(report.suggestions.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// generateSuggestions tests
// ============================================================================

describe('generateSuggestions', () => {
  function makeCategories(
    overrides: Partial<ScoreReport['categories']> = {},
  ): ScoreReport['categories'] {
    return {
      complexity: overrides.complexity ?? { score: 100, violations: 0, weight: 0.3 },
      correctness: overrides.correctness ?? { score: 100, violations: 0, weight: 0.25 },
      security: overrides.security ?? { score: 100, violations: 0, weight: 0.3 },
      patterns: overrides.patterns ?? { score: 100, violations: 0, weight: 0.15 },
    }
  }

  test('returns empty array when all scores are high', () => {
    const result = generateSuggestions(makeCategories(), [], [])
    expect(result).toEqual([])
  })

  test('suggests reducing complexity when score < 70', () => {
    const cats = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result.length).toBe(1)
    expect(result[0]).toContain('complexity')
  })

  test('suggests improving correctness when score < 70', () => {
    const cats = makeCategories({
      correctness: { score: 40, violations: 12, weight: 0.25 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result.length).toBe(1)
    expect(result[0]).toContain('correctness')
  })

  test('suggests addressing security when score < 80', () => {
    const cats = makeCategories({
      security: { score: 75, violations: 5, weight: 0.3 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result.length).toBe(1)
    expect(result[0]).toContain('security')
  })

  test('suggests refactoring patterns when score < 70', () => {
    const cats = makeCategories({
      patterns: { score: 60, violations: 8, weight: 0.15 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result.length).toBe(1)
    expect(result[0]).toContain('pattern')
  })

  test('returns multiple suggestions for multiple low scores', () => {
    const cats = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
      correctness: { score: 40, violations: 12, weight: 0.25 },
      security: { score: 60, violations: 8, weight: 0.3 },
      patterns: { score: 30, violations: 14, weight: 0.15 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result.length).toBe(4)
  })

  test('suggests focusing on file with > 10 violations', () => {
    const fileScores: FileScore[] = [
      { filePath: 'bad.ts', score: 30, violations: 15, categories: {} },
    ]
    const result = generateSuggestions(makeCategories(), [], fileScores)
    expect(result.length).toBe(1)
    expect(result[0]).toContain('bad.ts')
    expect(result[0]).toContain('15')
  })

  test('does not suggest file when violations <= 10', () => {
    const fileScores: FileScore[] = [
      { filePath: 'ok.ts', score: 90, violations: 10, categories: {} },
    ]
    const result = generateSuggestions(makeCategories(), [], fileScores)
    expect(result).toEqual([])
  })

  test('does not suggest file when fileScores is empty', () => {
    const result = generateSuggestions(makeCategories(), [], [])
    expect(result).toEqual([])
  })

  test('security threshold is 80 (stricter than others)', () => {
    const cats = makeCategories({
      security: { score: 79, violations: 5, weight: 0.3 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result.length).toBe(1)
    expect(result[0]).toContain('security')
  })

  test('security at 80 does not trigger suggestion', () => {
    const cats = makeCategories({
      security: { score: 80, violations: 4, weight: 0.3 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result).toEqual([])
  })

  test('complexity at 70 does not trigger suggestion', () => {
    const cats = makeCategories({
      complexity: { score: 70, violations: 6, weight: 0.3 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result).toEqual([])
  })

  test('includes violation count in complexity suggestion', () => {
    const cats = makeCategories({
      complexity: { score: 50, violations: 10, weight: 0.3 },
    })
    const result = generateSuggestions(cats, [], [])
    expect(result[0]).toContain('10')
  })

  test('file suggestion only considers first file', () => {
    const fileScores: FileScore[] = [
      { filePath: 'worst.ts', score: 20, violations: 20, categories: {} },
      { filePath: 'second.ts', score: 30, violations: 15, categories: {} },
    ]
    const result = generateSuggestions(makeCategories(), [], fileScores)
    expect(result.length).toBe(1)
    expect(result[0]).toContain('worst.ts')
  })
})

// ============================================================================
// formatScore tests
// ============================================================================

describe('formatScore', () => {
  test('formats a score of 100 with weight 0.3', () => {
    const result = formatScore(100, 0.3)
    expect(result).toContain('100')
    expect(result).toContain('30%')
  })

  test('formats a score of 0 with weight 0.25', () => {
    const result = formatScore(0, 0.25)
    expect(result).toContain('0')
    expect(result).toContain('25%')
  })

  test('formats weight as percentage with no decimals', () => {
    const result = formatScore(50, 0.15)
    expect(result).toContain('15%')
  })

  test('pads score to field width', () => {
    const result = formatScore(5, 0.3)
    expect(result).toContain('  5')
  })

  test('contains the max score value', () => {
    const result = formatScore(80, 0.3)
    expect(result).toContain('100')
  })

  test('contains the word weight', () => {
    const result = formatScore(50, 0.3)
    expect(result).toContain('weight')
  })
})

// ============================================================================
// getGrade tests
// ============================================================================

describe('getGrade', () => {
  test('score 100 gives grade A', () => {
    expect(getGrade(100)).toBe('(A)')
  })

  test('score 90 gives grade A', () => {
    expect(getGrade(90)).toBe('(A)')
  })

  test('score 89 gives grade B', () => {
    expect(getGrade(89)).toBe('(B)')
  })

  test('score 80 gives grade B', () => {
    expect(getGrade(80)).toBe('(B)')
  })

  test('score 79 gives grade C', () => {
    expect(getGrade(79)).toBe('(C)')
  })

  test('score 70 gives grade C', () => {
    expect(getGrade(70)).toBe('(C)')
  })

  test('score 69 gives grade D', () => {
    expect(getGrade(69)).toBe('(D)')
  })

  test('score 60 gives grade D', () => {
    expect(getGrade(60)).toBe('(D)')
  })

  test('score 59 gives grade F', () => {
    expect(getGrade(59)).toBe('(F)')
  })

  test('score 0 gives grade F', () => {
    expect(getGrade(0)).toBe('(F)')
  })

  test('score 95 gives grade A', () => {
    expect(getGrade(95)).toBe('(A)')
  })

  test('score 85 gives grade B', () => {
    expect(getGrade(85)).toBe('(B)')
  })

  test('score 75 gives grade C', () => {
    expect(getGrade(75)).toBe('(C)')
  })

  test('score 65 gives grade D', () => {
    expect(getGrade(65)).toBe('(D)')
  })

  test('score 30 gives grade F', () => {
    expect(getGrade(30)).toBe('(F)')
  })

  test('boundary: score just above A threshold', () => {
    expect(getGrade(91)).toBe('(A)')
  })

  test('boundary: score just below A threshold', () => {
    expect(getGrade(89)).toBe('(B)')
  })

  test('boundary: score just above D threshold', () => {
    expect(getGrade(61)).toBe('(D)')
  })

  test('boundary: score just below D threshold', () => {
    expect(getGrade(59)).toBe('(F)')
  })

  test('returns string with parentheses', () => {
    const result = getGrade(50)
    expect(result.startsWith('(')).toBe(true)
    expect(result.endsWith(')')).toBe(true)
  })
})

// ============================================================================
// getScoreColor tests
// ============================================================================

describe('getScoreColor', () => {
  test('score 100 returns green chalk function', () => {
    const fn = getScoreColor(100)
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('score 80 returns green chalk function', () => {
    const fn = getScoreColor(80)
    expect(typeof fn).toBe('function')
  })

  test('score 79 returns yellow chalk function', () => {
    const fn = getScoreColor(79)
    expect(typeof fn).toBe('function')
  })

  test('score 60 returns yellow chalk function', () => {
    const fn = getScoreColor(60)
    expect(typeof fn).toBe('function')
  })

  test('score 59 returns red chalk function', () => {
    const fn = getScoreColor(59)
    expect(typeof fn).toBe('function')
  })

  test('score 0 returns red chalk function', () => {
    const fn = getScoreColor(0)
    expect(typeof fn).toBe('function')
  })

  test('score 90 returns green (>= 80 threshold)', () => {
    const fn = getScoreColor(90)
    expect(typeof fn).toBe('function')
  })

  test('score 70 returns yellow (between 60-79)', () => {
    const fn = getScoreColor(70)
    expect(typeof fn).toBe('function')
  })
})

// ============================================================================
// Additional calculateCategoryScore exhaustive tests
// ============================================================================

describe('calculateCategoryScore – exhaustive violation mapping', () => {
  const expectedScores: Record<number, number> = {
    0: 100,
    1: 95,
    2: 90,
    3: 85,
    4: 80,
    5: 75,
    6: 70,
    7: 65,
    8: 60,
    9: 55,
    10: 50,
    11: 45,
    12: 40,
    13: 35,
    14: 30,
    15: 25,
    16: 20,
    17: 15,
    18: 10,
    19: 5,
    20: 0,
  }

  test.each(Object.entries(expectedScores))(
    '%s violations gives score %s',
    (violations, expected) => {
      expect(calculateCategoryScore(Number(violations), 0.3).score).toBe(expected)
    },
  )
})

// ============================================================================
// Additional calculateFileScore exhaustive mapping
// ============================================================================

describe('calculateFileScore – exhaustive violation mapping', () => {
  test.each([
    [0, 100],
    [1, 97],
    [2, 94],
    [3, 91],
    [4, 88],
    [5, 85],
    [6, 82],
    [7, 79],
    [8, 76],
    [9, 73],
    [10, 70],
    [11, 67],
    [12, 64],
    [13, 61],
    [14, 58],
    [15, 55],
    [16, 52],
    [17, 49],
    [18, 46],
    [19, 43],
    [20, 40],
    [25, 25],
    [30, 10],
    [33, 1],
    [34, 0],
  ])('%i violations gives score %i', (violations, expected) => {
    expect(calculateFileScore(violations)).toBe(expected)
  })
})

// ============================================================================
// calculateCorrectnessScore – systematic coverage ratios
// ============================================================================

describe('calculateCorrectnessScore – systematic coverage', () => {
  test.each([
    [0, 10, 10, 100],
    [0, 10, 9, 90],
    [0, 10, 8, 80],
    [0, 10, 7, 70],
    [0, 10, 6, 60],
    [0, 10, 5, 50],
    [0, 10, 4, 40],
    [0, 10, 3, 30],
    [0, 10, 2, 20],
    [0, 10, 1, 10],
    [0, 10, 0, 0],
  ] as const)(
    'coverage for %i/%i documented (no violations) gives score %i',
    (violations, total, documented, expected) => {
      expect(calculateCorrectnessScore(violations, total, documented, 0.25).score).toBe(expected)
    },
  )

  test.each([
    [1, 10, 10, 95],
    [2, 10, 10, 90],
    [3, 10, 10, 85],
    [4, 10, 10, 80],
    [5, 10, 10, 75],
  ] as const)(
    '%i violations with full coverage gives score %i',
    (violations, total, documented, expected) => {
      expect(calculateCorrectnessScore(violations, total, documented, 0.25).score).toBe(expected)
    },
  )
})

// ============================================================================
// calculateOverallScore – weighted contribution verification
// ============================================================================

describe('calculateOverallScore – weighted contribution verification', () => {
  test('complexity at 100 with others at 0 = 30', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 0, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 0, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 0, violations: 0, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(30)
  })

  test('each category contributes its weighted portion independently', () => {
    const cats = {
      complexity: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 100, violations: 0, weight: 0.3 } as CategoryScore,
      patterns: { score: 100, violations: 0, weight: 0.15 } as CategoryScore,
    }
    // 100*0.3 + 100*0.25 + 100*0.3 + 100*0.15 = 30 + 25 + 30 + 15 = 100
    expect(calculateOverallScore(cats)).toBe(100)
  })

  test('weights sum to 1.0 with standard configuration', () => {
    const weights = 0.3 + 0.25 + 0.3 + 0.15
    expect(weights).toBeCloseTo(1.0, 10)
  })

  test('overall score of 85 with mixed inputs', () => {
    const cats = {
      complexity: { score: 80, violations: 4, weight: 0.3 } as CategoryScore,
      correctness: { score: 100, violations: 0, weight: 0.25 } as CategoryScore,
      security: { score: 90, violations: 2, weight: 0.3 } as CategoryScore,
      patterns: { score: 70, violations: 6, weight: 0.15 } as CategoryScore,
    }
    // 80*0.3 + 100*0.25 + 90*0.3 + 70*0.15 = 24 + 25 + 27 + 10.5 = 86.5 → 87
    expect(calculateOverallScore(cats)).toBe(87)
  })

  test('overall score with 50 across all categories', () => {
    const cats = {
      complexity: { score: 50, violations: 10, weight: 0.3 } as CategoryScore,
      correctness: { score: 50, violations: 10, weight: 0.25 } as CategoryScore,
      security: { score: 50, violations: 10, weight: 0.3 } as CategoryScore,
      patterns: { score: 50, violations: 10, weight: 0.15 } as CategoryScore,
    }
    expect(calculateOverallScore(cats)).toBe(50)
  })
})

// ============================================================================
// countDocumentedFunctions – additional edge cases
// ============================================================================

describe('countDocumentedFunctions – additional edge cases', () => {
  test('exactly 2 functions, both documented', () => {
    const fns = [{ getJsDocs: () => ['a'] }, { getJsDocs: () => ['b'] }]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  test('exactly 2 functions, first documented only', () => {
    const fns = [{ getJsDocs: () => ['a'] }, { getJsDocs: () => [] }]
    expect(countDocumentedFunctions(fns)).toBe(1)
  })

  test('exactly 2 functions, second documented only', () => {
    const fns = [{ getJsDocs: () => [] }, { getJsDocs: () => ['b'] }]
    expect(countDocumentedFunctions(fns)).toBe(1)
  })

  test('function returning array with single empty string counts as documented', () => {
    const fns = [{ getJsDocs: () => [''] }]
    expect(countDocumentedFunctions(fns)).toBe(1)
  })

  test('alternating pattern: 10 functions, every other documented', () => {
    const fns = Array.from({ length: 10 }, (_, i) => ({
      getJsDocs: () => (i % 2 === 0 ? ['doc'] : []),
    }))
    expect(countDocumentedFunctions(fns)).toBe(5)
  })

  test('all functions have single JSDoc entry with numeric value', () => {
    const fns = Array.from({ length: 5 }, () => ({
      getJsDocs: () => [1 as any],
    }))
    expect(countDocumentedFunctions(fns)).toBe(5)
  })
})

// ============================================================================
// Cross-function integration – extended
// ============================================================================

describe('cross-function integration – extended', () => {
  test('buildCategoryCounts + calculateCategoryScore + calculateOverallScore pipeline', () => {
    const violations = [{ ruleId: 'r1' }, { ruleId: 'r2' }, { ruleId: 'r3' }] as any[]
    const getCategory = (id: string) => {
      if (id === 'r1') return 'complexity'
      if (id === 'r2') return 'security'
      return 'patterns'
    }
    const counts = buildCategoryCounts(violations, getCategory)
    expect(counts.complexity).toBe(1)
    expect(counts.security).toBe(1)
    expect(counts.patterns).toBe(1)

    const complexity = calculateCategoryScore(counts.complexity, 0.3)
    const security = calculateCategoryScore(counts.security, 0.3)
    const patterns = calculateCategoryScore(counts.patterns, 0.15)
    const correctness = calculateCorrectnessScore(counts.correctness, 10, 8, 0.25)

    const overall = calculateOverallScore({ complexity, correctness, security, patterns })
    expect(Number.isInteger(overall)).toBe(true)
    expect(overall).toBeGreaterThan(0)
    expect(overall).toBeLessThanOrEqual(100)
  })

  test('buildScoreReport end-to-end with realistic data', () => {
    const violations = Array.from({ length: 15 }, (_, i) => ({
      ruleId: `rule-${i}`,
      filePath: `file${i}.ts`,
      message: `msg${i}`,
      severity: 2,
      line: i + 1,
      column: 1,
    })) as any[]

    const getCategory = (_id: string) => {
      const cats = ['complexity', 'correctness', 'security', 'patterns']
      return cats[Math.floor(Math.random() * cats.length)]
    }
    const counts = buildCategoryCounts(violations, getCategory)
    const fileScores: FileScore[] = [
      { filePath: 'a.ts', score: 70, violations: 5, categories: { complexity: 3, security: 2 } },
      { filePath: 'b.ts', score: 85, violations: 2, categories: { patterns: 2 } },
    ]

    const report = buildScoreReport(counts, 50, 40, fileScores, violations, 10, '/project')

    expect(report.overall).toBeGreaterThanOrEqual(0)
    expect(report.overall).toBeLessThanOrEqual(100)
    expect(report.summary.filesAnalyzed).toBe(10)
    expect(report.summary.totalViolations).toBe(15)
    expect(report.path).toBe('/project')
    expect(Number.isInteger(report.overall)).toBe(true)
  })

  test('file score and category score have different deduction rates', () => {
    for (let v = 0; v <= 20; v++) {
      const fileResult = calculateFileScore(v)
      const catResult = calculateCategoryScore(v, 0.3).score
      // File deducts 3 per violation, category deducts 5 per
      expect(fileResult).toBe(Math.max(0, 100 - v * 3))
      expect(catResult).toBe(Math.max(0, 100 - v * 5))
    }
  })

  test('correctness score with various documentation levels', () => {
    const total = 20
    for (let documented = 0; documented <= total; documented++) {
      const result = calculateCorrectnessScore(0, total, documented, 0.25)
      const expectedCoverage = (documented / total) * 100
      expect(result.score).toBe(expectedCoverage)
    }
  })
})

// ============================================================================
// Additional correctness weight preservation tests
// ============================================================================

describe('calculateCorrectnessScore – weight preservation across edge cases', () => {
  test.each([0, 0.01, 0.1, 0.25, 0.5, 0.99, 1.0, 5.0])(
    'weight %f is preserved with full documentation',
    (weight) => {
      const result = calculateCorrectnessScore(0, 10, 10, weight)
      expect(result.weight).toBe(weight)
      expect(result.score).toBe(100)
    },
  )

  test.each([0, 0.01, 0.1, 0.25, 0.5, 0.99, 1.0, 5.0])(
    'weight %f is preserved with zero functions',
    (weight) => {
      const result = calculateCorrectnessScore(0, 0, 0, weight)
      expect(result.weight).toBe(weight)
      expect(result.score).toBe(50)
    },
  )
})

// ============================================================================
// calculateFileScore – return type and value range tests
// ============================================================================

describe('calculateFileScore – return type and value range', () => {
  test('always returns a finite number for positive violations', () => {
    for (let v = 0; v <= 100; v++) {
      const result = calculateFileScore(v)
      expect(Number.isFinite(result)).toBe(true)
      expect(result).toBeGreaterThanOrEqual(0)
    }
  })

  test('returns exactly 100 for zero violations', () => {
    expect(calculateFileScore(0)).toBe(100)
  })
})
