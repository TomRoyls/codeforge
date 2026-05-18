import { describe, expect, it } from 'vitest'

import { createViolation } from '../../src/rules/types.js'

// ─── Range normalization ───

describe('createViolation', () => {
  it('creates violation with single position range (expands column+1 for end)', () => {
    const result = createViolation(
      'src/index.ts',
      'Unexpected console statement',
      { column: 5, line: 10 },
      'no-console',
    )
    expect(result.range).toEqual({
      end: { column: 6, line: 10 },
      start: { column: 5, line: 10 },
    })
  })

  it('creates violation with Range object (uses as-is)', () => {
    const result = createViolation(
      'src/index.ts',
      'Unexpected console statement',
      {
        end: { column: 20, line: 10 },
        start: { column: 5, line: 10 },
      },
      'no-console',
    )
    expect(result.range).toEqual({
      end: { column: 20, line: 10 },
      start: { column: 5, line: 10 },
    })
  })

  // ─── Severity defaults ───

  it('defaults severity to error', () => {
    const result = createViolation(
      'src/index.ts',
      'Some message',
      { column: 0, line: 1 },
      'some-rule',
    )
    expect(result.severity).toBe('error')
  })

  it('sets custom severity to warning', () => {
    const result = createViolation(
      'src/index.ts',
      'Some message',
      { column: 0, line: 1 },
      'some-rule',
      'warning',
    )
    expect(result.severity).toBe('warning')
  })

  it('sets custom severity to info', () => {
    const result = createViolation(
      'src/index.ts',
      'Some message',
      { column: 0, line: 1 },
      'some-rule',
      'info',
    )
    expect(result.severity).toBe('info')
  })

  // ─── Suggestion handling ───

  it('includes suggestion when provided', () => {
    const result = createViolation(
      'src/app.ts',
      'Use strict equality',
      { column: 3, line: 7 },
      'eq-eq-eq',
      'error',
      'Use === instead of ==',
    )
    expect(result.suggestion).toBe('Use === instead of ==')
  })

  it('omits suggestion when not provided', () => {
    const result = createViolation(
      'src/app.ts',
      'Use strict equality',
      { column: 3, line: 7 },
      'eq-eq-eq',
    )
    expect(result.suggestion).toBeUndefined()
  })

  // ─── Field preservation ───

  it('preserves filePath', () => {
    const result = createViolation(
      'src/deep/module.ts',
      'msg',
      { column: 0, line: 1 },
      'rule-id',
    )
    expect(result.filePath).toBe('src/deep/module.ts')
  })

  it('preserves message', () => {
    const result = createViolation(
      'file.ts',
      'Expected const instead of let',
      { column: 0, line: 1 },
      'prefer-const',
    )
    expect(result.message).toBe('Expected const instead of let')
  })

  it('preserves ruleId', () => {
    const result = createViolation(
      'file.ts',
      'msg',
      { column: 0, line: 1 },
      'no-eval',
    )
    expect(result.ruleId).toBe('no-eval')
  })

  it('preserves all fields together with Range input', () => {
    const result = createViolation(
      'src/main.ts',
      'Avoid eval',
      {
        end: { column: 15, line: 5 },
        start: { column: 10, line: 5 },
      },
      'no-eval',
      'warning',
      'Use a safer alternative',
    )
    expect(result).toEqual({
      filePath: 'src/main.ts',
      message: 'Avoid eval',
      range: {
        end: { column: 15, line: 5 },
        start: { column: 10, line: 5 },
      },
      ruleId: 'no-eval',
      severity: 'warning',
      suggestion: 'Use a safer alternative',
    })
  })
})
