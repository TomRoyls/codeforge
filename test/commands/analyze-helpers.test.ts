import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { generateSummary } from '../../src/commands/analyze-helpers.js'

// ─── Helpers ───

const makeViolation = (severity: RuleViolation['severity']): RuleViolation => ({
  filePath: 'test.ts',
  message: 'test violation',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  ruleId: 'test-rule',
  severity,
})

// ─── generateSummary ───

describe('generateSummary', () => {
  it('returns all zero counts for empty violations', () => {
    const result = generateSummary([], 0, 0)
    expect(result).toEqual({
      duration: 0,
      errors: 0,
      info: 0,
      totalFiles: 0,
      totalViolations: 0,
      warnings: 0,
    })
  })

  it('counts a single error violation', () => {
    const violations = [makeViolation('error')]
    const result = generateSummary(violations, 1, 100)
    expect(result.errors).toBe(1)
    expect(result.warnings).toBe(0)
    expect(result.info).toBe(0)
    expect(result.totalViolations).toBe(1)
  })

  it('counts a single warning violation', () => {
    const violations = [makeViolation('warning')]
    const result = generateSummary(violations, 1, 50)
    expect(result.warnings).toBe(1)
    expect(result.errors).toBe(0)
    expect(result.info).toBe(0)
  })

  it('counts a single info violation', () => {
    const violations = [makeViolation('info')]
    const result = generateSummary(violations, 1, 25)
    expect(result.info).toBe(1)
    expect(result.errors).toBe(0)
    expect(result.warnings).toBe(0)
  })

  it('counts mixed severities correctly', () => {
    const violations = [
      makeViolation('error'),
      makeViolation('warning'),
      makeViolation('info'),
    ]
    const result = generateSummary(violations, 3, 200)
    expect(result).toEqual({
      duration: 200,
      errors: 1,
      info: 1,
      totalFiles: 3,
      totalViolations: 3,
      warnings: 1,
    })
  })

  it('passes through duration value', () => {
    const result = generateSummary([], 5, 1234)
    expect(result.duration).toBe(1234)
  })

  it('passes through totalFiles value', () => {
    const result = generateSummary([], 42, 0)
    expect(result.totalFiles).toBe(42)
  })

  it('totalViolations equals sum of all severity counts', () => {
    const violations = [
      makeViolation('error'),
      makeViolation('error'),
      makeViolation('warning'),
      makeViolation('info'),
      makeViolation('info'),
      makeViolation('info'),
    ]
    const result = generateSummary(violations, 2, 500)
    expect(result.totalViolations).toBe(6)
    expect(result.errors).toBe(2)
    expect(result.warnings).toBe(1)
    expect(result.info).toBe(3)
  })

  it('handles a large number of violations', () => {
    const violations: RuleViolation[] = []
    for (let i = 0; i < 100; i++) violations.push(makeViolation('error'))
    for (let i = 0; i < 50; i++) violations.push(makeViolation('warning'))
    for (let i = 0; i < 25; i++) violations.push(makeViolation('info'))

    const result = generateSummary(violations, 10, 3000)
    expect(result.totalViolations).toBe(175)
    expect(result.errors).toBe(100)
    expect(result.warnings).toBe(50)
    expect(result.info).toBe(25)
  })

  it('returns zero duration and zero files when passed zeros', () => {
    const result = generateSummary([], 0, 0)
    expect(result.duration).toBe(0)
    expect(result.totalFiles).toBe(0)
    expect(result.totalViolations).toBe(0)
  })

  it('does not mutate the input violations array', () => {
    const violations = [makeViolation('error'), makeViolation('warning')]
    const copy = [...violations]
    generateSummary(violations, 1, 100)
    expect(violations).toEqual(copy)
    expect(violations.length).toBe(2)
  })
})
