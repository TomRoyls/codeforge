import { describe, expect, it } from 'vitest'

import { deepMerge, type DeepMergeOptions } from '../src/utils/deep-merge.js'

// ─── basic merging ────────────────────────────────────
describe('deepMerge basic', () => {
  it('merges flat objects', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('returns override when base is null', () => {
    const result = deepMerge({ a: 1 } as Record<string, unknown>, { b: 2 } as Record<string, unknown>)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('overrides primitive with primitive', () => {
    const result = deepMerge({ a: 'old' }, { a: 'new' })
    expect(result).toEqual({ a: 'new' })
  })

  it('keeps base keys not in override', () => {
    const result = deepMerge({ a: 1, b: 2, c: 3 }, { b: 20 })
    expect(result).toEqual({ a: 1, b: 20, c: 3 })
  })
})

// ─── nested merging ───────────────────────────────────
describe('deepMerge nested', () => {
  it('merges nested objects', () => {
    const result = deepMerge(
      { config: { debug: false, port: 3000 } },
      { config: { port: 8080 } },
    )
    expect(result).toEqual({ config: { debug: false, port: 8080 } })
  })

  it('merges deeply nested objects', () => {
    const result = deepMerge(
      { a: { b: { c: 1, d: 2 } } },
      { a: { b: { c: 10 } } },
    )
    expect(result).toEqual({ a: { b: { c: 10, d: 2 } } })
  })

  it('replaces object with primitive', () => {
    const result = deepMerge(
      { a: { b: 1 } } as Record<string, unknown>,
      { a: 'replaced' } as Record<string, unknown>,
    )
    expect(result).toEqual({ a: 'replaced' })
  })

  it('replaces primitive with object', () => {
    const result = deepMerge(
      { a: 'old' } as Record<string, unknown>,
      { a: { b: 1 } } as Record<string, unknown>,
    )
    expect(result).toEqual({ a: { b: 1 } })
  })
})

// ─── array handling ───────────────────────────────────
describe('deepMerge arrays', () => {
  it('replaces arrays by default', () => {
    const result = deepMerge(
      { items: [1, 2, 3] } as Record<string, unknown>,
      { items: [4, 5] } as Record<string, unknown>,
    )
    expect(result).toEqual({ items: [4, 5] })
  })

  it('replaces array with non-array', () => {
    const result = deepMerge(
      { items: [1, 2] } as Record<string, unknown>,
      { items: 'not-array' } as Record<string, unknown>,
    )
    expect(result).toEqual({ items: 'not-array' })
  })
})

// ─── edge cases ───────────────────────────────────────
describe('deepMerge edge cases', () => {
  it('does not mutate base object', () => {
    const base = { a: 1, b: { c: 2 } }
    const override = { b: { d: 3 } }
    deepMerge(base, override)
    expect(base).toEqual({ a: 1, b: { c: 2 } })
  })

  it('does not mutate override object', () => {
    const base = { a: 1 }
    const override = { b: { c: 2 } }
    deepMerge(base, override)
    expect(override).toEqual({ b: { c: 2 } })
  })

  it('respects maxDepth option', () => {
    const base = { a: { b: { c: { d: 1 } } } } as Record<string, unknown>
    const override = { a: { b: { c: { d: 2 } } } } as Record<string, unknown>
    const result = deepMerge(base, override, { maxDepth: 2 })
    expect((result as Record<string, unknown>).a).toEqual({ b: { c: { d: 2 } } })
  })

  it('handles null values in override', () => {
    const result = deepMerge(
      { a: 1, b: 2 } as Record<string, unknown>,
      { b: null } as Record<string, unknown>,
    )
    expect(result).toEqual({ a: 1, b: null })
  })
})
