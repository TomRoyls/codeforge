import { describe, expect, it } from 'vitest'
import { deepClone } from '../../../src/utils/deep-clone.js'

describe('deepClone', () => {
  it('should clone null', () => {
    const result = deepClone(null)
    expect(result).toBe(null)
  })

  it('should clone undefined', () => {
    const result = deepClone(undefined)
    expect(result).toBe(undefined)
  })

  it('should clone boolean', () => {
    expect(deepClone(true)).toBe(true)
    expect(deepClone(false)).toBe(false)
  })

  it('should clone number', () => {
    expect(deepClone(42)).toBe(42)
    expect(deepClone(-42)).toBe(-42)
    expect(deepClone(3.14)).toBe(3.14)
    expect(deepClone(0)).toBe(0)
    expect(deepClone(Infinity)).toBe(Infinity)
    expect(deepClone(-Infinity)).toBe(-Infinity)
  })

  it('should clone string', () => {
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone('')).toBe('')
  })

  it('should clone empty object', () => {
    const obj = {}
    const cloned = deepClone(obj)
    expect(cloned).toEqual({})
    expect(cloned).not.toBe(obj)
  })

  it('should clone simple object', () => {
    const obj = { a: 1, b: 'test', c: true }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
  })

  it('should clone nested object', () => {
    const obj = { a: { b: { c: 1 } } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.a).not.toBe(obj.a)
    expect(cloned.a.b).not.toBe(obj.a.b)
  })

  it('should clone array', () => {
    const arr = [1, 2, 3]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('should clone nested array', () => {
    const arr = [[1, 2], [3, 4]]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
    expect(cloned[0]).not.toBe(arr[0])
    expect(cloned[1]).not.toBe(arr[1])
  })

  it('should clone array with objects', () => {
    const arr = [{ a: 1 }, { b: 2 }]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
    expect(cloned[0]).not.toBe(arr[0])
    expect(cloned[1]).not.toBe(arr[1])
  })

  it('should clone object with arrays', () => {
    const obj = { arr: [1, 2, 3] }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.arr).not.toBe(obj.arr)
  })

  it('should clone Date', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    const cloned = deepClone(date)
    expect(cloned).toBeInstanceOf(Date)
    expect(cloned.getTime()).toBe(date.getTime())
    expect(cloned).not.toBe(date)
  })

  it('should clone RegExp', () => {
    const regex = /test/gi
    const cloned = deepClone(regex)
    expect(cloned).toBeInstanceOf(RegExp)
    expect(cloned.source).toBe(regex.source)
    expect(cloned.flags).toBe(regex.flags)
    expect(cloned).not.toBe(regex)
  })

  it('should clone Map', () => {
    const map = new Map([['key1', 'value1'], ['key2', 'value2']])
    const cloned = deepClone(map)
    expect(cloned).toBeInstanceOf(Map)
    expect(cloned.size).toBe(map.size)
    expect(cloned.get('key1')).toBe('value1')
    expect(cloned.get('key2')).toBe('value2')
    expect(cloned).not.toBe(map)
  })

  it('should clone Set', () => {
    const set = new Set([1, 2, 3])
    const cloned = deepClone(set)
    expect(cloned).toBeInstanceOf(Set)
    expect(cloned.size).toBe(set.size)
    expect(cloned.has(1)).toBe(true)
    expect(cloned.has(2)).toBe(true)
    expect(cloned.has(3)).toBe(true)
    expect(cloned).not.toBe(set)
  })

  it('should clone nested Map', () => {
    const map = new Map([['key1', { a: 1 }]])
    const cloned = deepClone(map)
    expect(cloned).toBeInstanceOf(Map)
    expect(cloned.get('key1')).toEqual({ a: 1 })
    expect(cloned.get('key1')).not.toBe(map.get('key1'))
  })

  it('should clone nested Set', () => {
    const set = new Set([{ a: 1 }])
    const cloned = deepClone(set)
    expect(cloned).toBeInstanceOf(Set)
    const clonedValue = Array.from(cloned)[0]
    const originalValue = Array.from(set)[0]
    expect(clonedValue).toEqual(originalValue)
    expect(clonedValue).not.toBe(originalValue)
  })

  it('should handle circular object references', () => {
    const obj: any = { a: 1 }
    obj.self = obj
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.self).toBe(cloned)
    expect(cloned.self.self).toBe(cloned)
  })

  it('should handle circular array references', () => {
    const arr: any[] = [1, 2]
    arr.push(arr)
    const cloned = deepClone(arr)
    expect(cloned[0]).toBe(1)
    expect(cloned[1]).toBe(2)
    expect(cloned[2]).toBe(cloned)
    expect(cloned).not.toBe(arr)
  })

  it('should handle circular Map references', () => {
    const map = new Map()
    map.set('self', map)
    const cloned = deepClone(map)
    expect(cloned).toBeInstanceOf(Map)
    expect(cloned.get('self')).toBe(cloned)
    expect(cloned).not.toBe(map)
  })

  it('should handle circular Set references', () => {
    const set = new Set()
    set.add(set)
    const cloned = deepClone(set)
    expect(cloned).toBeInstanceOf(Set)
    expect(cloned.has(cloned)).toBe(true)
    expect(cloned).not.toBe(set)
  })

  it('should handle mixed circular references', () => {
    const obj: any = { a: 1 }
    const arr: any = [obj]
    obj.arr = arr
    const cloned = deepClone(obj)
    expect(cloned.a).toBe(1)
    expect(cloned.arr[0]).toBe(cloned)
    expect(cloned).not.toBe(obj)
    expect(cloned.arr).not.toBe(arr)
  })

  it('should not modify original object when clone is modified', () => {
    const obj = { a: 1, b: { c: 2 } }
    const cloned = deepClone(obj)
    cloned.a = 10
    cloned.b.c = 20
    expect(obj.a).toBe(1)
    expect(obj.b.c).toBe(2)
  })

  it('should not modify original array when clone is modified', () => {
    const arr = [1, 2, 3]
    const cloned = deepClone(arr)
    cloned[0] = 10
    cloned.push(4)
    expect(arr).toEqual([1, 2, 3])
    expect(arr.length).toBe(3)
  })

  it('should not modify original Date when clone is modified', () => {
    const date = new Date('2024-01-01')
    const cloned = deepClone(date)
    cloned.setFullYear(2025)
    expect(date.getFullYear()).toBe(2024)
    expect(cloned.getFullYear()).toBe(2025)
  })

  it('should clone object with null and undefined values', () => {
    const obj = { a: null, b: undefined, c: 1 }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned.a).toBe(null)
    expect(cloned.b).toBe(undefined)
  })

  it('should clone array with mixed types', () => {
    const arr = [1, 'test', true, null, undefined, { a: 1 }]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('should clone object with symbol keys', () => {
    const sym = Symbol('test')
    const obj: any = {}
    obj[sym] = 'value'
    const cloned = deepClone(obj)
    expect(cloned[sym]).toBeUndefined()
  })

  it('should respect maxDepth option', () => {
    const obj = { a: { b: { c: 1 } } }
    const cloned = deepClone(obj, { maxDepth: 2 })
    expect(cloned.a.b).toBe(obj.a.b)
    expect(cloned.a).not.toBe(obj.a)
  })

  it('should respect default maxDepth', () => {
    const obj = { a: { b: { c: { d: { e: 1 } } } } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
  })

  it('should clone ArrayBuffer', () => {
    const buffer = new ArrayBuffer(8)
    const view = new Uint8Array(buffer)
    view[0] = 42
    const cloned = deepClone(buffer)
    expect(cloned).toBeInstanceOf(ArrayBuffer)
    expect(cloned.byteLength).toBe(buffer.byteLength)
    expect(cloned).not.toBe(buffer)
  })

  it('should clone Uint8Array', () => {
    const arr = new Uint8Array([1, 2, 3])
    const cloned = deepClone(arr)
    expect(cloned).toBeInstanceOf(Uint8Array)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('should clone Int32Array', () => {
    const arr = new Int32Array([1, -2, 3])
    const cloned = deepClone(arr)
    expect(cloned).toBeInstanceOf(Int32Array)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('should clone Float64Array', () => {
    const arr = new Float64Array([1.5, 2.5, 3.5])
    const cloned = deepClone(arr)
    expect(cloned).toBeInstanceOf(Float64Array)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('should clone object with prototype', () => {
    class TestClass {
      constructor(public value: number) {}
    }
    const obj = new TestClass(42)
    const cloned = deepClone(obj)
    expect(cloned.value).toBe(42)
    expect(cloned).not.toBe(obj)
  })
})