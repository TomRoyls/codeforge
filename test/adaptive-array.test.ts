import { AdaptiveArray, DEFAULT_ADAPTIVE_ARRAY_OPTIONS } from '../src/core/adaptive-array/adaptive-array.js'
import type { AdaptiveArrayOptions, AdaptiveArrayStatistics, GrowthStrategy } from '../src/core/adaptive-array/types.js'

// ─── Constructor & Defaults ──────────────────────────────────────────────────

describe('AdaptiveArray - Constructor and Defaults', () => {
  it('creates an empty array with default options', () => {
    const arr = new AdaptiveArray<number>()
    expect(arr.size()).toBe(0)
    expect(arr.capacity()).toBe(DEFAULT_ADAPTIVE_ARRAY_OPTIONS.initialCapacity)
    expect(arr.isEmpty()).toBe(true)
  })

  it('respects custom initialCapacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.capacity()).toBe(4)
  })

  it('uses default growthFactor of 2', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 2 })
    arr.push(1)
    arr.push(2)
    arr.push(3) // triggers grow from 2 → 4
    expect(arr.capacity()).toBe(4)
  })

  it('applies partial options over defaults', () => {
    const arr = new AdaptiveArray<number>({ strategy: 'linear', growthFactor: 5 })
    expect(arr.getStrategy()).toBe('linear')
    // growthFactor 5 is used for linear growth
    expect(arr.capacity()).toBe(DEFAULT_ADAPTIVE_ARRAY_OPTIONS.initialCapacity)
  })

  it('exports correct DEFAULT_ADAPTIVE_ARRAY_OPTIONS', () => {
    expect(DEFAULT_ADAPTIVE_ARRAY_OPTIONS).toEqual({
      initialCapacity: 16,
      growthFactor: 2,
      shrinkThreshold: 0.25,
      strategy: 'exponential',
    })
  })
})

// ─── Push / Pop ─────────────────────────────────────────────────────────────

describe('AdaptiveArray - Push and Pop', () => {
  it('pushes values and reports correct size', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(10)
    arr.push(20)
    arr.push(30)
    expect(arr.size()).toBe(3)
    expect(arr.isEmpty()).toBe(false)
  })

  it('pops values in LIFO order', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.pop()).toBe(3)
    expect(arr.pop()).toBe(2)
    expect(arr.pop()).toBe(1)
  })

  it('returns undefined when popping from empty array', () => {
    const arr = new AdaptiveArray<number>()
    expect(arr.pop()).toBeUndefined()
  })

  it('handles push after pop correctly', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.pop()
    arr.push(99)
    expect(arr.toArray()).toEqual([1, 99])
  })

  it('pops all elements to empty', () => {
    const arr = new AdaptiveArray<string>({ initialCapacity: 2 })
    arr.push('a')
    arr.push('b')
    expect(arr.pop()).toBe('b')
    expect(arr.pop()).toBe('a')
    expect(arr.size()).toBe(0)
    expect(arr.isEmpty()).toBe(true)
  })
})

// ─── Get / Set ───────────────────────────────────────────────────────────────

describe('AdaptiveArray - Get and Set', () => {
  it('gets value at valid index', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(10)
    arr.push(20)
    expect(arr.get(0)).toBe(10)
    expect(arr.get(1)).toBe(20)
  })

  it('returns undefined for out-of-bounds get', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    expect(arr.get(5)).toBeUndefined()
    expect(arr.get(-1)).toBeUndefined()
  })

  it('sets value at valid index and returns true', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    expect(arr.set(0, 100)).toBe(true)
    expect(arr.get(0)).toBe(100)
  })

  it('returns false for out-of-bounds set', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.set(0, 1)).toBe(false)
    expect(arr.set(-1, 1)).toBe(false)
    arr.push(1)
    expect(arr.set(5, 1)).toBe(false)
  })
})

// ─── Insert / Delete ─────────────────────────────────────────────────────────

describe('AdaptiveArray - Insert and Delete', () => {
  it('inserts at beginning', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(2)
    arr.push(3)
    expect(arr.insert(0, 1)).toBe(true)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('inserts at end (equivalent to push)', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    expect(arr.insert(1, 2)).toBe(true)
    expect(arr.toArray()).toEqual([1, 2])
  })

  it('inserts in the middle', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(3)
    expect(arr.insert(1, 2)).toBe(true)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('returns false for invalid insert index', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.insert(-1, 1)).toBe(false)
    expect(arr.insert(5, 1)).toBe(false)
  })

  it('deletes from beginning', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.delete(0)).toBe(1)
    expect(arr.toArray()).toEqual([2, 3])
  })

  it('deletes from end', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    expect(arr.delete(1)).toBe(2)
    expect(arr.toArray()).toEqual([1])
  })

  it('deletes from middle', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.delete(1)).toBe(2)
    expect(arr.toArray()).toEqual([1, 3])
  })

  it('returns undefined for invalid delete index', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.delete(-1)).toBeUndefined()
    expect(arr.delete(0)).toBeUndefined()
    arr.push(1)
    expect(arr.delete(5)).toBeUndefined()
  })
})

// ─── Growth Strategies ───────────────────────────────────────────────────────

describe('AdaptiveArray - Growth Strategies', () => {
  it('exponential strategy doubles capacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: 'exponential', growthFactor: 2 })
    for (let i = 0; i < 5; i++) arr.push(i)
    expect(arr.capacity()).toBe(8) // 4 * 2 = 8
  })

  it('linear strategy adds growthFactor capacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: 'linear', growthFactor: 4 })
    for (let i = 0; i < 5; i++) arr.push(i)
    expect(arr.capacity()).toBe(8) // 4 + 4 = 8
  })

  it('fibonacci strategy grows using fibonacci sequence', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: 'fibonacci' })
    arr.push(1)
    arr.push(2)
    arr.push(3) // triggers grow; fib starts 1,1 → next=2 → max(3,2)=3
    const cap1 = arr.capacity()
    expect(cap1).toBeGreaterThanOrEqual(3)
  })

  it('fixed strategy adds growthFactor like linear', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: 'fixed', growthFactor: 3 })
    for (let i = 0; i < 5; i++) arr.push(i)
    expect(arr.capacity()).toBe(7) // 4 + 3 = 7
  })

  it('exponential with growthFactor=3 triples capacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: 'exponential', growthFactor: 3 })
    arr.push(1)
    arr.push(2)
    arr.push(3) // triggers grow from 2 → 6
    expect(arr.capacity()).toBe(6)
  })
})

// ─── Shrinking ───────────────────────────────────────────────────────────────

describe('AdaptiveArray - Shrinking', () => {
  it('shrinks when size falls below threshold', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, shrinkThreshold: 0.25, growthFactor: 2 })
    for (let i = 0; i < 4; i++) arr.push(i) // size=4, cap=4
    arr.push(4) // triggers grow: cap=8, size=5
    // Pop 4 elements → size=1, 1 < 8*0.25=2 → shrink
    arr.pop()
    arr.pop()
    arr.pop()
    arr.pop()
    expect(arr.size()).toBe(1)
    expect(arr.capacity()).toBeLessThan(8)
  })

  it('does not shrink when above threshold', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, shrinkThreshold: 0.25, growthFactor: 2 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    const capBefore = arr.capacity()
    arr.pop() // 2/4 = 0.5 > 0.25, no shrink
    expect(arr.capacity()).toBe(capBefore)
  })

  it('capacity never drops below 1 after shrinking', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 2, shrinkThreshold: 0.25, growthFactor: 2 })
    arr.push(1)
    arr.push(2)
    arr.push(3) // grow
    arr.pop()
    arr.pop()
    arr.pop()
    expect(arr.capacity()).toBeGreaterThanOrEqual(1)
  })
})

// ─── Iteration / Conversion ─────────────────────────────────────────────────

describe('AdaptiveArray - Iteration and Conversion', () => {
  it('toArray returns correct elements', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates all elements with correct indices', () => {
    const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
    arr.push('a')
    arr.push('b')
    arr.push('c')
    const result: string[] = []
    arr.forEach((v, i) => {
      result.push(`${i}:${v}`)
    })
    expect(result).toEqual(['0:a', '1:b', '2:c'])
  })

  it('is iterable with for-of', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(10)
    arr.push(20)
    arr.push(30)
    const collected: number[] = []
    for (const v of arr) {
      collected.push(v)
    }
    expect(collected).toEqual([10, 20, 30])
  })

  it('spreads into array with spread operator', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    expect([...arr]).toEqual([1, 2])
  })

  it('clear empties the array but keeps capacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    const capBefore = arr.capacity()
    arr.clear()
    expect(arr.size()).toBe(0)
    expect(arr.isEmpty()).toBe(true)
    expect(arr.toArray()).toEqual([])
    expect(arr.capacity()).toBe(capBefore)
  })
})

// ─── Higher-Order Methods ────────────────────────────────────────────────────

describe('AdaptiveArray - Higher-Order Methods', () => {
  it('map transforms elements', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    const mapped = arr.map(x => x * 10)
    expect(mapped.toArray()).toEqual([10, 20, 30])
    expect(mapped).toBeInstanceOf(AdaptiveArray)
  })

  it('map passes index to callback', () => {
    const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
    arr.push('a')
    arr.push('b')
    const mapped = arr.map((v, i) => `${v}${i}`)
    expect(mapped.toArray()).toEqual(['a0', 'b1'])
  })

  it('filter keeps matching elements', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(4)
    const filtered = arr.filter(x => x % 2 === 0)
    expect(filtered.toArray()).toEqual([2, 4])
  })

  it('filter returns empty when nothing matches', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(3)
    const filtered = arr.filter(x => x % 2 === 0)
    expect(filtered.size()).toBe(0)
  })

  it('reduce accumulates values', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.reduce((sum, x) => sum + x, 0)).toBe(6)
  })

  it('reduce works with string concatenation', () => {
    const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
    arr.push('a')
    arr.push('b')
    arr.push('c')
    expect(arr.reduce((acc, s) => acc + s, '')).toBe('abc')
  })

  it('find returns first matching element', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.find(x => x > 1)).toBe(2)
  })

  it('find returns undefined when nothing matches', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    expect(arr.find(x => x > 10)).toBeUndefined()
  })

  it('findIndex returns first matching index', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(10)
    arr.push(20)
    arr.push(30)
    expect(arr.findIndex(x => x > 15)).toBe(1)
  })

  it('findIndex returns -1 when nothing matches', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    expect(arr.findIndex(x => x > 100)).toBe(-1)
  })

  it('indexOf finds element', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(10)
    arr.push(20)
    arr.push(30)
    expect(arr.indexOf(20)).toBe(1)
  })

  it('indexOf returns -1 for missing element', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    expect(arr.indexOf(999)).toBe(-1)
  })

  it('includes returns true for existing element', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(5)
    arr.push(10)
    expect(arr.includes(5)).toBe(true)
    expect(arr.includes(10)).toBe(true)
  })

  it('includes returns false for missing element', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    expect(arr.includes(99)).toBe(false)
  })

  it('lastIndexOf finds last occurrence', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(2)
    expect(arr.lastIndexOf(2)).toBe(3)
  })

  it('lastIndexOf returns -1 when not found', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.lastIndexOf(1)).toBe(-1)
  })
})

// ─── Slice / Concat / Splice ─────────────────────────────────────────────────

describe('AdaptiveArray - Slice, Concat, Splice', () => {
  it('slice returns subset with positive indices', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(4)
    arr.push(5)
    expect(arr.slice(1, 4)!.toArray()).toEqual([2, 3, 4])
  })

  it('slice handles negative indices', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(4)
    expect(arr.slice(-2)!.toArray()).toEqual([3, 4])
  })

  it('slice without args returns full copy', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    const sliced = arr.slice()
    expect(sliced.toArray()).toEqual([1, 2])
    expect(sliced).not.toBe(arr)
  })

  it('concat merges arrays', () => {
    const a = new AdaptiveArray<number>({ initialCapacity: 4 })
    a.push(1)
    a.push(2)
    const b = new AdaptiveArray<number>({ initialCapacity: 4 })
    b.push(3)
    b.push(4)
    const result = a.concat(b)
    expect(result.toArray()).toEqual([1, 2, 3, 4])
  })

  it('concat with multiple arrays', () => {
    const a = new AdaptiveArray<number>({ initialCapacity: 2 })
    a.push(1)
    const b = new AdaptiveArray<number>({ initialCapacity: 2 })
    b.push(2)
    const c = new AdaptiveArray<number>({ initialCapacity: 2 })
    c.push(3)
    expect(a.concat(b, c).toArray()).toEqual([1, 2, 3])
  })

  it('concat with empty arrays', () => {
    const a = new AdaptiveArray<number>({ initialCapacity: 2 })
    a.push(1)
    const empty = new AdaptiveArray<number>({ initialCapacity: 2 })
    expect(a.concat(empty).toArray()).toEqual([1])
  })

  it('splice removes elements', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(4)
    const removed = arr.splice(1, 2)
    expect(removed.toArray()).toEqual([2, 3])
    expect(arr.toArray()).toEqual([1, 4])
  })

  it('splice inserts without removing', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(4)
    arr.splice(1, 0, 2, 3)
    expect(arr.toArray()).toEqual([1, 2, 3, 4])
  })

  it('splice replaces elements', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    const removed = arr.splice(1, 1, 20)
    expect(removed.toArray()).toEqual([2])
    expect(arr.toArray()).toEqual([1, 20, 3])
  })

  it('splice with negative start', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.splice(-1, 1)
    expect(arr.toArray()).toEqual([1, 2])
  })

  it('splice defaults deleteCount to remaining elements', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    const removed = arr.splice(1)
    expect(removed.toArray()).toEqual([2, 3])
    expect(arr.toArray()).toEqual([1])
  })
})

// ─── Reverse / Sort ──────────────────────────────────────────────────────────

describe('AdaptiveArray - Reverse and Sort', () => {
  it('reverses elements in place', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    const result = arr.reverse()
    expect(arr.toArray()).toEqual([3, 2, 1])
    expect(result).toBe(arr) // returns this
  })

  it('reverse handles single element', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(42)
    arr.reverse()
    expect(arr.toArray()).toEqual([42])
  })

  it('sorts without compareFn (default string sort)', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(3)
    arr.push(1)
    arr.push(2)
    arr.sort()
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('sorts with compareFn', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(3)
    arr.push(1)
    arr.push(2)
    arr.sort((a, b) => b - a) // descending
    expect(arr.toArray()).toEqual([3, 2, 1])
  })

  it('sort returns this for chaining', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(2)
    arr.push(1)
    const result = arr.sort()
    expect(result).toBe(arr)
  })
})

// ─── Compact / ShrinkToFit / Reserve / Resize ───────────────────────────────

describe('AdaptiveArray - Compact, ShrinkToFit, Reserve, Resize', () => {
  it('compact reduces capacity to size', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    expect(arr.capacity()).toBe(16)
    arr.compact()
    expect(arr.capacity()).toBe(3)
    expect(arr.toArray()).toEqual([1, 2, 3])
  })

  it('compact does nothing when size equals capacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(4)
    arr.compact()
    expect(arr.capacity()).toBe(4)
  })

  it('shrinkToFit reduces capacity to size (minimum 1)', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
    arr.push(1)
    arr.shrinkToFit()
    expect(arr.capacity()).toBe(1)
    expect(arr.toArray()).toEqual([1])
  })

  it('shrinkToFit on empty array sets capacity to 1', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
    arr.shrinkToFit()
    expect(arr.capacity()).toBe(1)
  })

  it('reserve increases capacity if needed', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.reserve(100)
    expect(arr.capacity()).toBe(100)
    expect(arr.toArray()).toEqual([1, 2])
  })

  it('reserve does nothing if n <= current capacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
    arr.reserve(10)
    expect(arr.capacity()).toBe(16)
  })

  it('resize grows the array', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.resize(10)
    expect(arr.size()).toBe(10)
    expect(arr.capacity()).toBeGreaterThanOrEqual(10)
    expect(arr.get(0)).toBe(1)
  })

  it('resize shrinks the array', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.resize(1)
    expect(arr.size()).toBe(1)
    expect(arr.toArray()).toEqual([1])
  })

  it('resize ignores negative values', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.resize(-5)
    expect(arr.size()).toBe(2)
  })

  it('resize to 0 empties the array', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.resize(0)
    expect(arr.size()).toBe(0)
    expect(arr.isEmpty()).toBe(true)
  })
})

// ─── Statistics ──────────────────────────────────────────────────────────────

describe('AdaptiveArray - Statistics', () => {
  it('returns initial statistics', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    const stats = arr.getStatistics()
    expect(stats.resizeCount).toBe(0)
    expect(stats.copyCount).toBe(0)
    expect(stats.totalElementsMoved).toBe(0)
    expect(stats.currentCapacity).toBe(4)
    expect(stats.currentSize).toBe(0)
    expect(stats.strategy).toBe('exponential')
    expect(stats.growthCount).toBe(0)
    expect(stats.shrinkCount).toBe(0)
  })

  it('tracks growth in statistics', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: 'exponential', growthFactor: 2 })
    arr.push(1)
    arr.push(2)
    arr.push(3) // triggers grow
    const stats = arr.getStatistics()
    expect(stats.growthCount).toBe(1)
    expect(stats.resizeCount).toBe(1)
    expect(stats.copyCount).toBe(1)
    expect(stats.totalElementsMoved).toBe(2)
    expect(stats.currentSize).toBe(3)
  })

  it('tracks shrink in statistics', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, growthFactor: 2, shrinkThreshold: 0.25 })
    for (let i = 0; i < 5; i++) arr.push(i) // triggers grow: cap=8
    arr.pop()
    arr.pop()
    arr.pop()
    arr.pop() // size=1 < 8*0.25=2 → shrink
    const stats = arr.getStatistics()
    expect(stats.shrinkCount).toBeGreaterThanOrEqual(1)
  })

  it('statistics reflect compact operations', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
    arr.push(1)
    arr.compact()
    const stats = arr.getStatistics()
    expect(stats.resizeCount).toBe(1)
    expect(stats.copyCount).toBe(1)
    expect(stats.totalElementsMoved).toBe(1)
  })
})

// ─── Strategy Switching ──────────────────────────────────────────────────────

describe('AdaptiveArray - Strategy Switching', () => {
  it('getStrategy returns current strategy', () => {
    const arr = new AdaptiveArray<number>({ strategy: 'linear' })
    expect(arr.getStrategy()).toBe('linear')
  })

  it('setStrategy changes the strategy', () => {
    const arr = new AdaptiveArray<number>({ strategy: 'exponential' })
    arr.setStrategy('fibonacci')
    expect(arr.getStrategy()).toBe('fibonacci')
  })

  it('strategy change affects subsequent growth', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: 'exponential', growthFactor: 2 })
    arr.setStrategy('linear')
    for (let i = 0; i < 5; i++) arr.push(i) // linear: 4+2=6
    expect(arr.capacity()).toBe(6)
  })

  it('can cycle through all strategies', () => {
    const strategies: GrowthStrategy[] = ['exponential', 'linear', 'fibonacci', 'fixed']
    const arr = new AdaptiveArray<number>({ strategy: 'exponential' })
    for (const s of strategies) {
      arr.setStrategy(s)
      expect(arr.getStrategy()).toBe(s)
    }
  })
})

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe('AdaptiveArray - Edge Cases', () => {
  it('handles empty array operations gracefully', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.toArray()).toEqual([])
    expect(arr.size()).toBe(0)
    expect(arr.isEmpty()).toBe(true)
    expect(arr.pop()).toBeUndefined()
    expect(arr.get(0)).toBeUndefined()
    expect(arr.indexOf(1)).toBe(-1)
    expect(arr.includes(1)).toBe(false)
    expect(arr.findIndex(() => true)).toBe(-1)
    expect(arr.find(() => true)).toBeUndefined()
    expect(arr.lastIndexOf(1)).toBe(-1)
  })

  it('handles single element operations', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(42)
    expect(arr.get(0)).toBe(42)
    expect(arr.indexOf(42)).toBe(0)
    expect(arr.includes(42)).toBe(true)
    expect(arr.lastIndexOf(42)).toBe(0)
    arr.reverse()
    expect(arr.toArray()).toEqual([42])
  })

  it('handles zero initialCapacity', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 0 })
    arr.push(1)
    expect(arr.size()).toBe(1)
    expect(arr.get(0)).toBe(1)
  })

  it('slice with out-of-range indices clamps correctly', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    expect(arr.slice(10, 20).toArray()).toEqual([])
    expect(arr.slice(-10, 1).toArray()).toEqual([1])
  })

  it('splice beyond size clamps start', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    const removed = arr.splice(100, 5, 99)
    expect(removed.toArray()).toEqual([])
    expect(arr.toArray()).toEqual([1, 2, 99])
  })

  it('works with string elements', () => {
    const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
    arr.push('hello')
    arr.push('world')
    expect(arr.toArray()).toEqual(['hello', 'world'])
    expect(arr.get(0)).toBe('hello')
  })

  it('works with object elements', () => {
    const arr = new AdaptiveArray<{ id: number }>({ initialCapacity: 4 })
    arr.push({ id: 1 })
    arr.push({ id: 2 })
    expect(arr.get(0)!.id).toBe(1)
    expect(arr.get(1)!.id).toBe(2)
  })

  it('reduce on empty array returns initial value', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    expect(arr.reduce((sum, x) => sum + x, 42)).toBe(42)
  })

  it('filter on empty array returns empty', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    const filtered = arr.filter(() => true)
    expect(filtered.size()).toBe(0)
  })

  it('map on empty array returns empty', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    const mapped = arr.map(x => x * 2)
    expect(mapped.size()).toBe(0)
  })

  it('multiple pushes trigger multiple growths', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 2, growthFactor: 2, strategy: 'exponential' })
    for (let i = 0; i < 20; i++) arr.push(i)
    expect(arr.size()).toBe(20)
    const stats = arr.getStatistics()
    expect(stats.growthCount).toBeGreaterThanOrEqual(2)
  })

  it('does not lose data across various operations', () => {
    const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
    arr.push(1)
    arr.push(2)
    arr.push(3)
    arr.push(4)
    arr.push(5) // triggers growth
    arr.delete(2) // remove 3
    arr.insert(1, 99)
    arr.set(0, 0)
    expect(arr.toArray()).toEqual([0, 99, 2, 4, 5])
  })
})
