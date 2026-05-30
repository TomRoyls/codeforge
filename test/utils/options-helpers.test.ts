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

  it('handles null input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(null, defaults)).toEqual(defaults)
  })

  it('handles numeric input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(42, defaults)).toEqual(defaults)
  })

  it('handles boolean input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(true, defaults)).toEqual(defaults)
  })

  it('preserves undefined values from override', () => {
    const defaults = { a: 1, b: 2 }
    const result = extractRuleOptions([{ a: 1, b: undefined }], defaults)
    expect(result).toEqual({ a: 1, b: undefined })
  })

  it('handles multiple objects in array (uses first)', () => {
    const defaults = { a: 1 }
    const result = extractRuleOptions([{ a: 2 }, { a: 3 }], defaults)
    expect(result.a).toBe(2)
  })

  it('handles nested object in options', () => {
    const defaults = { config: { x: 1 } }
    const result = extractRuleOptions([{ config: { x: 5 } }], defaults)
    expect(result.config).toEqual({ x: 5 })
  })

  it('handles empty object in array', () => {
    const defaults = { a: 1 }
    const result = extractRuleOptions([{}], defaults)
    expect(result).toEqual({ a: 1 })
  })

  it('preserves all default properties', () => {
    const defaults = { a: 1, b: 2, c: 3 }
    const result = extractRuleOptions([{ a: 10 }], defaults)
    expect(result.b).toBe(2)
    expect(result.c).toBe(3)
  })

  it('overrides multiple properties', () => {
    const defaults = { x: 0, y: 0, z: 0 }
    const result = extractRuleOptions([{ x: 1, y: 2 }], defaults)
    expect(result).toEqual({ x: 1, y: 2, z: 0 })
  })

  it('handles empty defaults', () => {
    const result = extractRuleOptions([{ a: 1 }], {})
    expect(result).toEqual({ a: 1 })
  })
})
