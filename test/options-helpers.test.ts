import { describe, it, expect } from 'vitest'
import { extractRuleOptions } from '../src/utils/options-helpers.js'

// ─── extractRuleOptions ───────────────────────────────
describe('extractRuleOptions', () => {
  it('returns default for null input', () => {
    expect(extractRuleOptions(null, { a: 1 })).toEqual({ a: 1 })
  })

  it('returns default for undefined input', () => {
    expect(extractRuleOptions(undefined, { a: 1 })).toEqual({ a: 1 })
  })

  it('returns default for empty array', () => {
    expect(extractRuleOptions([], { a: 1 })).toEqual({ a: 1 })
  })

  it('returns default for array with non-object', () => {
    expect(extractRuleOptions(['string'], { a: 1 })).toEqual({ a: 1 })
  })

  it('merges object from array with defaults', () => {
    expect(extractRuleOptions([{ a: 2 }], { a: 1, b: 2 })).toEqual({ a: 2, b: 2 })
  })

  it('adds missing keys from default', () => {
    expect(extractRuleOptions([{ x: 10 }], { x: 0, y: 0 })).toEqual({ x: 10, y: 0 })
  })

  it('overrides all keys', () => {
    expect(extractRuleOptions([{ a: 99, b: 99 }], { a: 1, b: 2 })).toEqual({ a: 99, b: 99 })
  })

  it('returns default for non-array input', () => {
    expect(extractRuleOptions({ a: 2 }, { a: 1 })).toEqual({ a: 1 })
  })

  it('returns default for number input', () => {
    expect(extractRuleOptions(42, { a: 1 })).toEqual({ a: 1 })
  })

  it('handles empty object in array', () => {
    expect(extractRuleOptions([{}], { a: 1 })).toEqual({ a: 1 })
  })
})
