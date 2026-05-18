import { describe, expect, it } from 'vitest'

import { DEFAULT_COMPARE } from '../../src/core/types.js'

describe('DEFAULT_COMPARE', () => {
  it('returns -1 when first argument is less', () => {
    expect(DEFAULT_COMPARE('a', 'b')).toBe(-1)
  })

  it('returns 1 when first argument is greater', () => {
    expect(DEFAULT_COMPARE('b', 'a')).toBe(1)
  })

  it('returns 0 when arguments are equal', () => {
    expect(DEFAULT_COMPARE('x', 'x')).toBe(0)
  })

  it('compares numbers by string representation', () => {
    expect(DEFAULT_COMPARE(1, 2)).toBe(-1)
    expect(DEFAULT_COMPARE(2, 1)).toBe(1)
    expect(DEFAULT_COMPARE(5, 5)).toBe(0)
  })

  it('compares different types by string representation', () => {
    expect(DEFAULT_COMPARE(1, '2')).toBe(-1)
    expect(DEFAULT_COMPARE('10', '2')).toBe(-1)
  })

  it('handles empty strings', () => {
    expect(DEFAULT_COMPARE('', 'a')).toBe(-1)
    expect(DEFAULT_COMPARE('a', '')).toBe(1)
  })

  it('handles null and undefined', () => {
    expect(DEFAULT_COMPARE(null, undefined)).toBe(-1)
    expect(DEFAULT_COMPARE(undefined, null)).toBe(1)
  })
})
