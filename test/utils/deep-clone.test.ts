import { describe, it, expect } from 'vitest'
import { deepClone } from '../../src/utils/deep-clone.js'

// ─── Primitives ───────────────────────────────────────────
describe('deepClone - primitives', () => {
  it('clones numbers', () => {
    expect(deepClone(42)).toBe(42)
  })

  it('clones strings', () => {
    expect(deepClone('hello')).toBe('hello')
  })

  it('clones null and undefined', () => {
    expect(deepClone(null)).toBeNull()
    expect(deepClone(undefined)).toBeUndefined()
  })

  it('clones booleans', () => {
    expect(deepClone(true)).toBe(true)
  })
})

// ─── Objects ──────────────────────────────────────────────
describe('deepClone - objects', () => {
  it('deep clones nested objects', () => {
    const obj = { a: { b: { c: 1 } } }
    const clone = deepClone(obj)
    expect(clone).toEqual(obj)
    clone.a.b.c = 99
    expect(obj.a.b.c).toBe(1)
  })

  it('clones arrays', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const clone = deepClone(arr)
    expect(clone).toEqual(arr)
    expect(clone).not.toBe(arr)
    expect(clone[1]).not.toBe(arr[1])
  })

  it('clones Date objects', () => {
    const date = new Date('2024-01-01')
    const clone = deepClone(date)
    expect(clone.getTime()).toBe(date.getTime())
    expect(clone).not.toBe(date)
  })

  it('clones RegExp', () => {
    const regex = /test/gi
    const clone = deepClone(regex)
    expect(clone.source).toBe(regex.source)
    expect(clone.flags).toBe(regex.flags)
  })

  it('clones Map', () => {
    const map = new Map([['a', 1], ['b', 2]])
    const clone = deepClone(map)
    expect(clone.get('a')).toBe(1)
    expect(clone).not.toBe(map)
  })

  it('clones Set', () => {
    const set = new Set([1, 2, 3])
    const clone = deepClone(set)
    expect(clone.has(1)).toBe(true)
    expect(clone).not.toBe(set)
  })
})

// ─── Circular refs ────────────────────────────────────────
describe('deepClone - circular refs', () => {
  it('handles circular references', () => {
    const obj: Record<string, unknown> = { a: 1 }
    obj.self = obj
    const clone = deepClone(obj)
    expect(clone.a).toBe(1)
    expect(clone.self).toBe(clone)
  })
})

// ─── maxDepth ─────────────────────────────────────────────
describe('deepClone - maxDepth', () => {
  it('stops at maxDepth', () => {
    const obj = { a: { b: { c: { d: 'deep' } } } }
    const clone = deepClone(obj, { maxDepth: 2 })
    expect((clone.a as Record<string, unknown>).b).toBe(obj.a.b)
  })
})

describe('deepClone - edge cases', () => {
  it('clones empty objects', () => {
    const clone = deepClone({})
    expect(clone).toEqual({})
  })

  it('clones empty arrays', () => {
    const clone = deepClone([])
    expect(clone).toEqual([])
  })

  it('clones nested arrays', () => {
    const arr = [[1, 2], [3, 4]]
    const clone = deepClone(arr)
    expect(clone).toEqual(arr)
    expect(clone[0]).not.toBe(arr[0])
  })

  it('handles mixed object with all types', () => {
    const obj = {
      num: 42,
      str: 'hello',
      bool: true,
      nil: null,
      arr: [1, 2],
      nested: { x: 1 },
    }
    const clone = deepClone(obj)
    expect(clone).toEqual(obj)
    expect(clone).not.toBe(obj)
    expect(clone.arr).not.toBe(obj.arr)
    expect(clone.nested).not.toBe(obj.nested)
  })

  it('clones sparse arrays', () => {
    const arr: (number | undefined)[] = [1, , , 4]
    const clone = deepClone(arr)
    expect(clone[0]).toBe(1)
    expect(clone[3]).toBe(4)
  })

  it('clones nested objects', () => {
    const obj = { a: { b: 1 } }
    const clone = deepClone(obj)
    expect(clone.a.b).toBe(1)
    clone.a.b = 2
    expect(obj.a.b).toBe(1)
  })

  it('clones arrays deeply', () => {
    const obj = { arr: [1, 2, 3] }
    const clone = deepClone(obj)
    expect(clone.arr).toEqual([1, 2, 3])
    clone.arr.push(4)
    expect(obj.arr).toEqual([1, 2, 3])
  })

  it('clones nested objects', () => {
    const obj = { a: { b: 1 } }
    const clone = deepClone(obj)
    clone.a.b = 99
    expect(obj.a.b).toBe(1)
  })

  it('clones array', () => {
    const arr = [1, 2, 3]
    const clone = deepClone(arr)
    expect(clone).toEqual([1, 2, 3])
    clone.push(4)
    expect(arr.length).toBe(3)
  })
})
