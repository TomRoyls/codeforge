import { describe, it, expect } from 'vitest'

import { createViolation, type RuleSeverity } from '../src/rules/types.js'

// ─── createViolation with Position range ────────────────
describe('createViolation with Position range', () => {
  it('creates violation with start/end range', () => {
    const range = {
      end: { column: 15, line: 3 },
      start: { column: 5, line: 3 },
    }
    const v = createViolation('test.ts', 'test message', range, 'test-rule')
    expect(v.filePath).toBe('test.ts')
    expect(v.message).toBe('test message')
    expect(v.ruleId).toBe('test-rule')
    expect(v.range.start.line).toBe(3)
    expect(v.range.start.column).toBe(5)
    expect(v.range.end.line).toBe(3)
    expect(v.range.end.column).toBe(15)
    expect(v.severity).toBe('error')
    expect(v.suggestion).toBeUndefined()
  })

  it('uses custom severity', () => {
    const v = createViolation('f.ts', 'msg', { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, 'r', 'warning')
    expect(v.severity).toBe('warning')
  })

  it('includes suggestion when provided', () => {
    const v = createViolation('f.ts', 'msg', { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, 'r', 'error', 'fix it')
    expect(v.suggestion).toBe('fix it')
  })
})

// ─── createViolation with simple line/column ────────────
describe('createViolation with simple line/column', () => {
  it('normalizes single position to range', () => {
    const v = createViolation('f.ts', 'msg', { column: 5, line: 10 }, 'r')
    expect(v.range.start.line).toBe(10)
    expect(v.range.start.column).toBe(5)
    expect(v.range.end.line).toBe(10)
    expect(v.range.end.column).toBe(6)
  })
})

// ─── createViolation defaults ──────────────────────────
describe('createViolation defaults', () => {
  it('defaults severity to error', () => {
    const v = createViolation('f.ts', 'msg', { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, 'r')
    expect(v.severity).toBe('error')
  })

  it('defaults suggestion to undefined', () => {
    const v = createViolation('f.ts', 'msg', { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, 'r')
    expect(v.suggestion).toBeUndefined()
  })
})
