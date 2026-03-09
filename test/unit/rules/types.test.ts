import { describe, test, expect } from 'vitest'
import { createViolation } from '../../../src/rules/types'

describe('createViolation', () => {
  describe('with simple range format', () => {
    test('creates violation with { line, column } format', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test violation message',
        { line: 10, column: 5 },
        'test-rule',
      )

      expect(violation).toEqual({
        filePath: '/test/file.ts',
        message: 'Test violation message',
        ruleId: 'test-rule',
        severity: 'error',
        range: {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 6 },
        },
        suggestion: undefined,
      })
    })

    test('normalizes simple range to start and end positions', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 5, column: 12 },
        'rule-1',
      )

      expect(violation.range.start).toEqual({ line: 5, column: 12 })
      expect(violation.range.end).toEqual({ line: 5, column: 13 })
    })

    test('handles zero column value', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.range.start.column).toBe(0)
      expect(violation.range.end.column).toBe(1)
    })

    test('handles large line and column values', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 9999, column: 1000 },
        'rule-1',
      )

      expect(violation.range.start.line).toBe(9999)
      expect(violation.range.start.column).toBe(1000)
      expect(violation.range.end.line).toBe(9999)
      expect(violation.range.end.column).toBe(1001)
    })
  })

  describe('with Range object format', () => {
    test('creates violation with { start, end } Range format', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test violation message',
        {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 15 },
        },
        'test-rule',
      )

      expect(violation).toEqual({
        filePath: '/test/file.ts',
        message: 'Test violation message',
        ruleId: 'test-rule',
        severity: 'error',
        range: {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 15 },
        },
        suggestion: undefined,
      })
    })

    test('preserves Range object without modification', () => {
      const range = {
        start: { line: 3, column: 2 },
        end: { line: 5, column: 10 },
      }
      const violation = createViolation('/test/file.ts', 'Test', range, 'rule-1')

      expect(violation.range).toEqual(range)
    })

    test('handles multi-line Range object', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        {
          start: { line: 10, column: 0 },
          end: { line: 20, column: 50 },
        },
        'rule-1',
      )

      expect(violation.range.start.line).toBe(10)
      expect(violation.range.end.line).toBe(20)
    })
  })

  describe('severity levels', () => {
    test('defaults to "error" severity when not specified', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.severity).toBe('error')
    })

    test('creates violation with "error" severity', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
      )

      expect(violation.severity).toBe('error')
    })

    test('creates violation with "warning" severity', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'warning',
      )

      expect(violation.severity).toBe('warning')
    })

    test('creates violation with "info" severity', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'info',
      )

      expect(violation.severity).toBe('info')
    })
  })

  describe('suggestion parameter', () => {
    test('creates violation with suggestion', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
        'Consider using const instead of let',
      )

      expect(violation.suggestion).toBe('Consider using const instead of let')
    })

    test('creates violation without suggestion when omitted', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.suggestion).toBeUndefined()
    })

    test('handles empty string suggestion', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
        '',
      )

      expect(violation.suggestion).toBe('')
    })

    test('handles multiline suggestion text', () => {
      const suggestion = 'Line 1 suggestion\nLine 2 suggestion\nLine 3 suggestion'
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
        suggestion,
      )

      expect(violation.suggestion).toBe(suggestion)
    })
  })

  describe('required parameters', () => {
    test('includes filePath in violation', () => {
      const violation = createViolation(
        '/path/to/file.ts',
        'Test',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.filePath).toBe('/path/to/file.ts')
    })

    test('includes message in violation', () => {
      const violation = createViolation(
        '/test.ts',
        'Custom violation message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.message).toBe('Custom violation message')
    })

    test('includes ruleId in violation', () => {
      const violation = createViolation(
        '/test.ts',
        'Test',
        { line: 1, column: 0 },
        'custom-rule-id',
      )

      expect(violation.ruleId).toBe('custom-rule-id')
    })

    test('handles empty string for required parameters', () => {
      const violation = createViolation('', '', { line: 0, column: 0 }, '')

      expect(violation.filePath).toBe('')
      expect(violation.message).toBe('')
      expect(violation.ruleId).toBe('')
    })
  })

  describe('return value structure', () => {
    test('returns complete RuleViolation object', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 5, column: 10 },
        'test-rule',
        'warning',
        'Fix suggestion',
      )

      expect(violation).toHaveProperty('filePath')
      expect(violation).toHaveProperty('message')
      expect(violation).toHaveProperty('ruleId')
      expect(violation).toHaveProperty('severity')
      expect(violation).toHaveProperty('range')
      expect(violation).toHaveProperty('suggestion')
    })

    test('range object has start and end properties', () => {
      const violation = createViolation('/test.ts', 'Test', { line: 1, column: 0 }, 'rule-1')

      expect(violation.range).toHaveProperty('start')
      expect(violation.range).toHaveProperty('end')
    })

    test('range start and end have line and column properties', () => {
      const violation = createViolation('/test.ts', 'Test', { line: 10, column: 5 }, 'rule-1')

      expect(violation.range.start).toHaveProperty('line')
      expect(violation.range.start).toHaveProperty('column')
      expect(violation.range.end).toHaveProperty('line')
      expect(violation.range.end).toHaveProperty('column')
    })
  })
})
