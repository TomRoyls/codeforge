import { describe, expect, it } from 'vitest'
import { deepMerge } from '../../../src/utils/deep-merge.js'

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const base = { a: 1, b: 2 }
    const override = { b: 3, c: 4 }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('merges nested objects', () => {
    const base = { a: { x: 1, y: 2 } }
    const override = { a: { y: 3, z: 4 } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } })
  })

  it('replaces arrays', () => {
    const base = { arr: [1, 2, 3] }
    const override = { arr: [4, 5] }
    const result = deepMerge(base, override)
    expect(result.arr).toEqual([4, 5])
  })

  it('handles null base', () => {
    const base = null
    const override = { a: 1 }
    const result = deepMerge(base as any, override)
    expect(result).toEqual({ a: 1 })
  })

  it('handles null override', () => {
    const base = { a: 1 }
    const override = null
    const result = deepMerge(base, override as any)
    expect(result).toEqual(null)
  })

  it('handles undefined override value', () => {
    const base = { a: 1, b: 2 }
    const override = { b: undefined }
    const result = deepMerge(base, override)
    expect(result.b).toBe(undefined)
  })

  it('handles primitive overrides', () => {
    const base = { a: 1, b: 'hello', c: true }
    const override = { a: 2, b: 'world', c: false }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 2, b: 'world', c: false })
  })

  it('merges empty objects', () => {
    const base = {}
    const override = {}
    const result = deepMerge(base, override)
    expect(result).toEqual({})
  })

  it('merges empty override', () => {
    const base = { a: 1, b: 2 }
    const override = {}
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('merges empty base', () => {
    const base = {}
    const override = { a: 1, b: 2 }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('handles deep nesting at 3 levels', () => {
    const base = { a: { b: { c: 1, d: 2 } } }
    const override = { a: { b: { d: 3, e: 4 } } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: { b: { c: 1, d: 3, e: 4 } } })
  })

  it('handles deep nesting at 4 levels', () => {
    const base = { a: { b: { c: { d: 1 } } } }
    const override = { a: { b: { c: { d: 2, e: 3 } } } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: { b: { c: { d: 2, e: 3 } } } })
  })

  it('does not mutate base object', () => {
    const base = { a: { b: 1 }, c: 2 }
    const originalBase = JSON.parse(JSON.stringify(base))
    deepMerge(base, { a: { b: 3 }, d: 4 })
    expect(base).toEqual(originalBase)
  })

  it('does not mutate override object', () => {
    const override = { a: { b: 3 }, d: 4 }
    const originalOverride = JSON.parse(JSON.stringify(override))
    deepMerge({ a: { b: 1 }, c: 2 }, override)
    expect(override).toEqual(originalOverride)
  })

  it('returns new object', () => {
    const base = { a: 1 }
    const override = { b: 2 }
    const result = deepMerge(base, override)
    expect(result).not.toBe(base)
    expect(result).not.toBe(override)
  })

  it('handles number override for object base', () => {
    const base = { a: { b: 1 } }
    const override = { a: 5 }
    const result = deepMerge(base, override)
    expect(result.a).toBe(5)
  })

  it('handles object override for primitive base', () => {
    const base = { a: 5 }
    const override = { a: { b: 1 } }
    const result = deepMerge(base, override)
    expect(result.a).toEqual({ b: 1 })
  })

  it('handles string override for object base', () => {
    const base = { a: { b: 1 } }
    const override = { a: 'hello' }
    const result = deepMerge(base, override)
    expect(result.a).toBe('hello')
  })

  it('handles boolean override for object base', () => {
    const base = { a: { b: 1 } }
    const override = { a: true }
    const result = deepMerge(base, override)
    expect(result.a).toBe(true)
  })

  it('handles mixed nested structures', () => {
    const base = { a: { b: { c: 1 } }, d: [1, 2], e: 'hello' }
    const override = { a: { b: { f: 2 } }, d: [3, 4], e: 'world' }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: { b: { c: 1, f: 2 } }, d: [3, 4], e: 'world' })
  })

  it('handles multiple nested keys', () => {
    const base = { a: { x: 1 }, b: { y: 2 }, c: { z: 3 } }
    const override = { a: { x: 10 }, b: { y: 20 }, c: { z: 30 } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: { x: 10 }, b: { y: 20 }, c: { z: 30 } })
  })

  it('handles adding new nested keys', () => {
    const base = { a: { x: 1 } }
    const override = { a: { x: 1, y: 2 }, b: { z: 3 } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { z: 3 } })
  })

  it('respects maxDepth option', () => {
    const base = { a: { b: { c: 1 } } }
    const override = { a: { b: { c: 2, d: 3 } } }
    const result = deepMerge(base, override, { maxDepth: 2 })
    expect(result.a.b).toEqual({ c: 2, d: 3 })
  })

  it('stops merging at maxDepth', () => {
    const base = { a: { b: { c: { d: 1 } } } }
    const override = { a: { b: { c: { d: 2, e: 3 } } } }
    const result = deepMerge(base, override, { maxDepth: 1 })
    expect(result.a.b.c).toEqual({ d: 2, e: 3 })
  })

  it('handles arrayStrategy option', () => {
    const base = { arr: [1, 2, 3] }
    const override = { arr: [4, 5] }
    const result = deepMerge(base, override, { arrayStrategy: 'replace' })
    expect(result.arr).toEqual([4, 5])
  })

  it('preserves non-overridden base properties', () => {
    const base = { a: 1, b: 2, c: 3 }
    const override = { b: 20 }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: 20, c: 3 })
  })

  it('handles override with only new keys', () => {
    const base = { a: 1 }
    const override = { b: 2, c: 3 }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('handles object values at various depths', () => {
    const base = { level1: { level2: { level3: 'value' } } }
    const override = { level1: { level2: { newKey: 'new' } } }
    const result = deepMerge(base, override)
    expect(result.level1.level2).toEqual({ level3: 'value', newKey: 'new' })
  })
})