import { describe, it, expect } from 'vitest'
import { ResizableArray } from '../src/core/resizable-array/index.js'

// ─── Construction and Basic Properties ───

describe('ResizableArray: construction and basic properties', () => {
  it('constructs with default capacity', () => {
    const arr = new ResizableArray<number>()
    expect(arr.length).toBe(0)
    expect(arr.capacity).toBe(8)
    expect(arr.isEmpty()).toBe(true)
  })

  it('constructs with specified initial capacity', () => {
    const arr = new ResizableArray<number>(16)
    expect(arr.capacity).toBe(16)
  })

  it('constructs with minimum capacity of 1', () => {
    const arr = new ResizableArray<number>(0)
    expect(arr.capacity).toBe(1)
  })

  it('constructs with custom options', () => {
    const arr = new ResizableArray<number>(4, { growthFactor: 3, shrinkThreshold: 0.1 })
    expect(arr.capacity).toBe(4)
  })

  it('fromArray creates a ResizableArray from a regular array', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    expect(arr.length).toBe(3)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('utilization reports correct ratio', () => {
    const arr = new ResizableArray<number>(8)
    arr.push(1)
    arr.push(2)
    expect(arr.utilization).toBeCloseTo(0.25)
  })
})

// ─── Push, Pop, Get, Set ───

describe('ResizableArray: push, pop, get, set', () => {
  it('push adds elements and grows capacity', () => {
    const arr = new ResizableArray<number>(2)
    arr.push(1)
    arr.push(2)
    expect(arr.length).toBe(2)
    expect(arr.capacity).toBe(2)
    arr.push(3)
    expect(arr.length).toBe(3)
    expect(arr.capacity).toBeGreaterThan(2)
  })

  it('pop removes and returns last element', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    expect(arr.pop()).toBe(3)
    expect(arr.length).toBe(2)
  })

  it('pop throws on empty array', () => {
    const arr = new ResizableArray<number>()
    expect(() => arr.pop()).toThrow(RangeError)
  })

  it('get returns element at index', () => {
    const arr = ResizableArray.fromArray([10, 20, 30])
    expect(arr.get(0)).toBe(10)
    expect(arr.get(1)).toBe(20)
    expect(arr.get(2)).toBe(30)
  })

  it('get throws on out of bounds', () => {
    const arr = ResizableArray.fromArray([1])
    expect(() => arr.get(-1)).toThrow(RangeError)
    expect(() => arr.get(1)).toThrow(RangeError)
  })

  it('set updates element at index', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    arr.set(1, 99)
    expect(arr.get(1)).toBe(99)
  })

  it('set throws on out of bounds', () => {
    const arr = ResizableArray.fromArray([1])
    expect(() => arr.set(1, 5)).toThrow(RangeError)
  })
})

// ─── Insert, Remove ───

describe('ResizableArray: insertAt and removeAt', () => {
  it('insertAt inserts element at given position', () => {
    const arr = ResizableArray.fromArray([1, 3, 4])
    arr.insertAt(1, 2)
    expect(arr.toArray()).toEqual([1, 2, 3, 4])
  })

  it('insertAt can insert at the end', () => {
    const arr = ResizableArray.fromArray([1, 2])
    arr.insertAt(2, 3)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('insertAt throws on out of bounds', () => {
    const arr = ResizableArray.fromArray([1])
    expect(() => arr.insertAt(-1, 5)).toThrow(RangeError)
    expect(() => arr.insertAt(2, 5)).toThrow(RangeError)
  })

  it('removeAt removes and returns element', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    expect(arr.removeAt(1)).toBe(2)
    expect(arr.toArray()).toEqual([1, 3])
  })

  it('removeAt throws on out of bounds', () => {
    const arr = ResizableArray.fromArray([1])
    expect(() => arr.removeAt(1)).toThrow(RangeError)
  })
})

// ─── Search Operations ───

describe('ResizableArray: search operations', () => {
  it('indexOf finds first occurrence', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 2])
    expect(arr.indexOf(2)).toBe(1)
    expect(arr.indexOf(99)).toBe(-1)
  })

  it('lastIndexOf finds last occurrence', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 2])
    expect(arr.lastIndexOf(2)).toBe(3)
    expect(arr.lastIndexOf(99)).toBe(-1)
  })

  it('includes returns correct boolean', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    expect(arr.includes(2)).toBe(true)
    expect(arr.includes(99)).toBe(false)
  })

  it('first and last return boundary elements', () => {
    const arr = ResizableArray.fromArray([10, 20, 30])
    expect(arr.first()).toBe(10)
    expect(arr.last()).toBe(30)
  })

  it('first and last throw on empty', () => {
    const arr = new ResizableArray<number>()
    expect(() => arr.first()).toThrow(RangeError)
    expect(() => arr.last()).toThrow(RangeError)
  })
})

// ─── Functional Methods ───

describe('ResizableArray: functional methods', () => {
  it('map transforms elements', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    const mapped = arr.map(x => x * 2)
    expect(mapped.toArray()).toEqual([2, 4, 6])
  })

  it('filter selects matching elements', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4, 5])
    const filtered = arr.filter(x => x % 2 === 0)
    expect(filtered.toArray()).toEqual([2, 4])
  })

  it('reduce accumulates values', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4])
    expect(arr.reduce((sum, x) => sum + x, 0)).toBe(10)
  })

  it('forEach iterates all elements with index', () => {
    const arr = ResizableArray.fromArray([10, 20])
    const pairs: [number, number][] = []
    arr.forEach((v, i) => pairs.push([v, i]))
    expect(pairs).toEqual([[10, 0], [20, 1]])
  })

  it('find returns first matching element', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4])
    expect(arr.find(x => x > 2)).toBe(3)
    expect(arr.find(x => x > 10)).toBeUndefined()
  })

  it('findIndex returns index of first matching element', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4])
    expect(arr.findIndex(x => x > 2)).toBe(2)
    expect(arr.findIndex(x => x > 10)).toBe(-1)
  })

  it('every returns true when all match', () => {
    const arr = ResizableArray.fromArray([2, 4, 6])
    expect(arr.every(x => x % 2 === 0)).toBe(true)
    expect(arr.every(x => x > 5)).toBe(false)
  })

  it('some returns true when any matches', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    expect(arr.some(x => x > 2)).toBe(true)
    expect(arr.some(x => x > 10)).toBe(false)
  })
})

// ─── Mutation Methods ───

describe('ResizableArray: mutation methods', () => {
  it('reverse reverses the array in place', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4])
    arr.reverse()
    expect(arr.toArray()).toEqual([4, 3, 2, 1])
  })

  it('sort orders elements', () => {
    const arr = ResizableArray.fromArray([3, 1, 4, 1, 5])
    arr.sort((a, b) => a - b)
    expect(arr.toArray()).toEqual([1, 1, 3, 4, 5])
  })

  it('fill sets a range of elements', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4, 5])
    arr.fill(0, 1, 4)
    expect(arr.toArray()).toEqual([1, 0, 0, 0, 5])
  })

  it('slice returns a new sub-array', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4, 5])
    const sliced = arr.slice(1, 4)
    expect(sliced.toArray()).toEqual([2, 3, 4])
  })

  it('slice handles negative indices', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4, 5])
    expect(arr.slice(-2).toArray()).toEqual([4, 5])
  })

  it('splice removes and inserts elements', () => {
    const arr = ResizableArray.fromArray([1, 2, 3, 4])
    const removed = arr.splice(1, 2, 10, 20, 30)
    expect(removed).toEqual([2, 3])
    expect(arr.toArray()).toEqual([1, 10, 20, 30, 4])
  })

  it('join returns string representation', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    expect(arr.join('-')).toBe('1-2-3')
    expect(new ResizableArray<number>().join()).toBe('')
  })

  it('concat merges multiple arrays', () => {
    const a = ResizableArray.fromArray([1, 2])
    const b = ResizableArray.fromArray([3, 4])
    const c = a.concat(b)
    expect(c.toArray()).toEqual([1, 2, 3, 4])
  })
})

// ─── Capacity Management ───

describe('ResizableArray: capacity management', () => {
  it('trimToSize reduces capacity to match length', () => {
    const arr = new ResizableArray<number>(16)
    arr.push(1)
    arr.push(2)
    arr.trimToSize()
    expect(arr.capacity).toBe(2)
  })

  it('trimToSize on empty sets capacity to 1', () => {
    const arr = new ResizableArray<number>(16)
    arr.trimToSize()
    expect(arr.capacity).toBe(1)
  })

  it('ensureCapacity expands buffer when needed', () => {
    const arr = new ResizableArray<number>(4)
    arr.ensureCapacity(20)
    expect(arr.capacity).toBeGreaterThanOrEqual(20)
  })

  it('ensureCapacity does nothing if already sufficient', () => {
    const arr = new ResizableArray<number>(16)
    arr.ensureCapacity(10)
    expect(arr.capacity).toBe(16)
  })

  it('clear empties the array but keeps capacity', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    const cap = arr.capacity
    arr.clear()
    expect(arr.length).toBe(0)
    expect(arr.isEmpty()).toBe(true)
    expect(arr.capacity).toBe(cap)
  })

  it('clone creates an independent copy', () => {
    const arr = ResizableArray.fromArray([1, 2, 3])
    const copy = arr.clone()
    arr.set(0, 99)
    expect(copy.get(0)).toBe(1)
  })

  it('is iterable with for-of', () => {
    const arr = ResizableArray.fromArray([10, 20, 30])
    const collected: number[] = []
    for (const v of arr) collected.push(v)
    expect(collected).toEqual([10, 20, 30])
  })
})
