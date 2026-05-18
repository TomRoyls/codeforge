import { describe, expect, it } from 'vitest'
import { extractRuleOptions } from '../../src/utils/options-helpers.js'

// ─── extractRuleOptions ───

describe('extractRuleOptions', () => {
  it('returns default when no options provided', () => {
    const defaults = { max: 10, strict: true }
    expect(extractRuleOptions(undefined, defaults)).toEqual(defaults)
  })

  it('returns default when empty array', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions([], defaults)).toEqual(defaults)
  })

  it('merges options from array with object', () => {
    const defaults = { max: 10, strict: true }
    const result = extractRuleOptions([{ max: 20 }], defaults)
    expect(result).toEqual({ max: 20, strict: true })
  })

  it('overrides all defaults', () => {
    const defaults = { a: 1, b: 2 }
    const result = extractRuleOptions([{ a: 10, b: 20 }], defaults)
    expect(result).toEqual({ a: 10, b: 20 })
  })

  it('returns default for non-array input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions('string', defaults)).toEqual(defaults)
  })

  it('returns default for array with non-object', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(['string'], defaults)).toEqual(defaults)
  })

  it('adds new properties not in default', () => {
    const defaults = { a: 1 }
    const result = extractRuleOptions([{ b: 2 }], defaults)
    expect(result).toEqual({ a: 1, b: 2 })
  })
})
