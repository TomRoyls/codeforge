import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import {
  buildCategoryCounts,
  buildFileCategoryCounts,
} from '../../src/commands/score-helpers.js'

// ─── Helpers ───

const makeViolation = (ruleId: string, filePath = 'test.ts'): RuleViolation => ({
  filePath,
  message: 'test violation',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  ruleId,
  severity: 'error',
})

const mockGetRuleCategory = (ruleId: string): string => {
  const map: Record<string, string> = {
    'max-params': 'complexity',
    'no-eval': 'security',
    'prefer-const': 'patterns',
    'no-eq-eq': 'correctness',
  }
  return map[ruleId] ?? 'patterns'
}

// ─── buildCategoryCounts ───

describe('buildCategoryCounts', () => {
  it('returns all zeros for empty violations array', () => {
    const result = buildCategoryCounts([], mockGetRuleCategory)
    expect(result).toEqual({
      complexity: 0,
      correctness: 0,
      patterns: 0,
      security: 0,
    })
  })

  it('counts a single complexity violation', () => {
    const violations = [makeViolation('max-params')]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.complexity).toBe(1)
    expect(result.correctness).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  it('counts a single security violation', () => {
    const violations = [makeViolation('no-eval')]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.security).toBe(1)
    expect(result.complexity).toBe(0)
  })

  it('counts a single patterns violation', () => {
    const violations = [makeViolation('prefer-const')]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.patterns).toBe(1)
    expect(result.complexity).toBe(0)
  })

  it('counts a single correctness violation', () => {
    const violations = [makeViolation('no-eq-eq')]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.correctness).toBe(1)
    expect(result.complexity).toBe(0)
  })

  it('counts violations across all four categories', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('no-eval'),
      makeViolation('prefer-const'),
      makeViolation('no-eq-eq'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({
      complexity: 1,
      correctness: 1,
      patterns: 1,
      security: 1,
    })
  })

  it('ignores unknown categories returned by getRuleCategoryFn', () => {
    const getCategory = (_ruleId: string): string => 'unknown-category'
    const violations = [makeViolation('some-rule'), makeViolation('another-rule')]
    const result = buildCategoryCounts(violations, getCategory)
    expect(result).toEqual({
      complexity: 0,
      correctness: 0,
      patterns: 0,
      security: 0,
    })
  })

  it('accumulates multiple violations in the same category', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('max-params'),
      makeViolation('max-params'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.complexity).toBe(3)
  })

  it('handles a mixed set of violations with repeated categories', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('no-eval'),
      makeViolation('max-params'),
      makeViolation('prefer-const'),
      makeViolation('no-eval'),
      makeViolation('prefer-const'),
      makeViolation('no-eq-eq'),
    ]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({
      complexity: 2,
      correctness: 1,
      patterns: 2,
      security: 2,
    })
  })

  it('calls getRuleCategoryFn with the ruleId from each violation', () => {
    const calls: string[] = []
    const trackingFn = (ruleId: string): string => {
      calls.push(ruleId)
      return 'patterns'
    }
    const violations = [makeViolation('rule-a'), makeViolation('rule-b')]
    buildCategoryCounts(violations, trackingFn)
    expect(calls).toEqual(['rule-a', 'rule-b'])
  })

  it('defaults unknown rules to patterns via the mock function', () => {
    const violations = [makeViolation('totally-unknown-rule')]
    const result = buildCategoryCounts(violations, mockGetRuleCategory)
    expect(result.patterns).toBe(1)
    expect(result.complexity).toBe(0)
  })
})

// ─── buildFileCategoryCounts ───

describe('buildFileCategoryCounts', () => {
  it('returns empty object for empty violations array', () => {
    const result = buildFileCategoryCounts([], mockGetRuleCategory)
    expect(result).toEqual({})
  })

  it('counts a single violation into its category', () => {
    const violations = [makeViolation('max-params')]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({ complexity: 1 })
  })

  it('accumulates multiple violations in the same category', () => {
    const violations = [makeViolation('max-params'), makeViolation('max-params')]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({ complexity: 2 })
  })

  it('tracks multiple categories independently', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('no-eval'),
      makeViolation('prefer-const'),
    ]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({
      complexity: 1,
      security: 1,
      patterns: 1,
    })
  })

  it('supports arbitrary category names not limited to the big four', () => {
    const getCategory = (_ruleId: string): string => 'performance'
    const violations = [makeViolation('slow-loop')]
    const result = buildFileCategoryCounts(violations, getCategory)
    expect(result).toEqual({ performance: 1 })
  })

  it('handles a large batch of mixed violations', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('max-params'),
      makeViolation('no-eval'),
      makeViolation('no-eval'),
      makeViolation('no-eval'),
      makeViolation('prefer-const'),
      makeViolation('no-eq-eq'),
      makeViolation('no-eq-eq'),
    ]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).toEqual({
      complexity: 2,
      security: 3,
      patterns: 1,
      correctness: 2,
    })
  })

  it('counts unknown-category rules as their own bucket', () => {
    const getCategory = (ruleId: string): string => ruleId
    const violations = [makeViolation('rule-x'), makeViolation('rule-y')]
    const result = buildFileCategoryCounts(violations, getCategory)
    expect(result).toEqual({ 'rule-x': 1, 'rule-y': 1 })
  })

  it('does not count categories with zero violations', () => {
    const violations = [makeViolation('no-eval')]
    const result = buildFileCategoryCounts(violations, mockGetRuleCategory)
    expect(result).not.toHaveProperty('complexity')
    expect(result).not.toHaveProperty('correctness')
  })
})
