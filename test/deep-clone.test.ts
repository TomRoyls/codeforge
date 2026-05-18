import { describe, expect, it } from 'vitest'

import { deepClone } from '../src/utils/deep-clone.js'

// ─── primitives ───────────────────────────────────────
describe('deepClone primitives', () => {
  it('clones numbers', () => {
    expect(deepClone(42)).toBe(42)
  })

  it('clones strings', () => {
    expect(deepClone('hello')).toBe('hello')
  })

  it('clones booleans', () => {
    expect(deepClone(true)).toBe(true)
  })

  it('clones null', () => {
    expect(deepClone(null)).toBe(null)
  })

  it('clones undefined', () => {
    expect(deepClone(undefined)).toBe(undefined)
  })
})

// ─── objects ──────────────────────────────────────────
describe('deepClone objects', () => {
  it('clones flat objects', () => {
    const obj = { a: 1, b: 'two', c: true }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
  })

  it('clones nested objects', () => {
    const obj = { a: { b: { c: 42 } } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned.a).not.toBe(obj.a)
    expect(cloned.a!.b).not.toBe(obj.a!.b)
  })

  it('handles circular references', () => {
    const obj: Record<string, unknown> = { name: 'root' }
    obj.self = obj
    const cloned = deepClone(obj)
    expect(cloned.name).toBe('root')
    expect(cloned.self).toBe(cloned)
  })

  it('preserves prototype chain', () => {
    class Foo {
      public value = 42
    }
    const foo = new Foo()
    const cloned = deepClone(foo)
    expect(cloned).toBeInstanceOf(Foo)
    expect(cloned.value).toBe(42)
  })
})

// ─── arrays ───────────────────────────────────────────
describe('deepClone arrays', () => {
  it('clones flat arrays', () => {
    const arr = [1, 2, 3]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('clones nested arrays', () => {
    const arr = [[1, 2], [3, 4]]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned[0]).not.toBe(arr[0])
  })

  it('clones arrays with mixed types', () => {
    const arr = [1, 'two', { three: 3 }, [4]]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned[2]).not.toBe(arr[2])
  })
})

// ─── special types ────────────────────────────────────
describe('deepClone special types', () => {
  it('clones Date', () => {
    const date = new Date('2024-01-15')
    const cloned = deepClone(date)
    expect(cloned.getTime()).toBe(date.getTime())
    expect(cloned).not.toBe(date)
  })

  it('clones RegExp', () => {
    const re = /test/gi
    const cloned = deepClone(re)
    expect(cloned.source).toBe(re.source)
    expect(cloned.flags).toBe(re.flags)
    expect(cloned).not.toBe(re)
  })

  it('clones Map', () => {
    const map = new Map([['a', 1], ['b', { c: 2 }]])
    const cloned = deepClone(map)
    expect(cloned.get('a')).toBe(1)
    expect(cloned.get('b')).toEqual({ c: 2 })
    expect(cloned.get('b')).not.toBe(map.get('b'))
  })

  it('clones Set', () => {
    const set = new Set([1, 2, 3])
    const cloned = deepClone(set)
    expect(cloned.has(1)).toBe(true)
    expect(cloned).not.toBe(set)
  })

  it('clones ArrayBuffer', () => {
    const buf = new ArrayBuffer(8)
    const cloned = deepClone(buf)
    expect(cloned.byteLength).toBe(8)
    expect(cloned).not.toBe(buf)
  })
})

// ─── maxDepth ─────────────────────────────────────────
describe('deepClone maxDepth', () => {
  it('stops cloning at maxDepth', () => {
    const obj = { a: { b: { c: { d: 1 } } } }
    const cloned = deepClone(obj, { maxDepth: 2 })
    expect(cloned.a!.b).toBe(obj.a!.b)
  })
})
