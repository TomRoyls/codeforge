import { describe, it, expect } from 'vitest'
import { FibonacciArray } from '../../src/core/fibonacci-array/fibonacci-array.js'

describe('FibonacciArray constructor', () => {
  it('creates with default options', () => {
    const fa = new FibonacciArray()
    expect(fa.length).toBe(0)
    expect(fa.isEmpty).toBe(true)
  })

  it('creates with custom initial capacity', () => {
    const fa = new FibonacciArray({ initialCapacity: 20 })
    expect(fa.length).toBe(0)
    expect(fa.isEmpty).toBe(true)
  })

  it('creates with initial capacity of 1', () => {
    const fa = new FibonacciArray({ initialCapacity: 1 })
    expect(fa.length).toBe(0)
  })

  it('creates with initial capacity of 0', () => {
    const fa = new FibonacciArray({ initialCapacity: 0 })
    expect(fa.length).toBe(0)
  })

  it('creates with large initial capacity', () => {
    const fa = new FibonacciArray({ initialCapacity: 1000 })
    expect(fa.length).toBe(0)
    expect(fa.isEmpty).toBe(true)
  })

  it('has positive capacity after construction', () => {
    const fa = new FibonacciArray()
    const stats = fa.getStats()
    expect(stats.capacity).toBeGreaterThan(0)
  })

  it('has at least one bucket', () => {
    const fa = new FibonacciArray()
    const stats = fa.getStats()
    expect(stats.bucketCount).toBeGreaterThanOrEqual(1)
  })
})

describe('FibonacciArray push', () => {
  it('pushes a single element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(fa.length).toBe(1)
    expect(fa.get(0)).toBe(1)
  })

  it('pushes multiple elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.length).toBe(3)
    expect(fa.get(0)).toBe(1)
    expect(fa.get(1)).toBe(2)
    expect(fa.get(2)).toBe(3)
  })

  it('grows capacity when needed', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 2 })
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.length).toBe(3)
    expect(fa.get(2)).toBe(3)
  })

  it('pushes strings', () => {
    const fa = new FibonacciArray<string>()
    fa.push('hello')
    fa.push('world')
    expect(fa.length).toBe(2)
    expect(fa.get(0)).toBe('hello')
  })

  it('pushes objects', () => {
    const fa = new FibonacciArray<{ id: number }>()
    fa.push({ id: 1 })
    expect(fa.get(0)).toEqual({ id: 1 })
  })

  it('pushes null values', () => {
    const fa = new FibonacciArray<null>()
    fa.push(null)
    expect(fa.length).toBe(1)
  })

  it('pushes undefined after growth', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 1 })
    fa.push(10)
    fa.push(20)
    expect(fa.length).toBe(2)
  })

  it('maintains order after many pushes', () => {
    const fa = new FibonacciArray<number>()
    for (let i = 0; i < 50; i++) {
      fa.push(i)
    }
    expect(fa.length).toBe(50)
    expect(fa.get(0)).toBe(0)
    expect(fa.get(49)).toBe(49)
  })
})

describe('FibonacciArray pop', () => {
  it('returns undefined on empty array', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.pop()).toBeUndefined()
  })

  it('pops the last element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.pop()).toBe(3)
    expect(fa.length).toBe(2)
  })

  it('pops all elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    expect(fa.pop()).toBe(2)
    expect(fa.pop()).toBe(1)
    expect(fa.pop()).toBeUndefined()
    expect(fa.length).toBe(0)
  })

  it('can push after pop', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.pop()
    fa.push(2)
    expect(fa.length).toBe(1)
    expect(fa.get(0)).toBe(2)
  })

  it('pops single element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(42)
    expect(fa.pop()).toBe(42)
    expect(fa.isEmpty).toBe(true)
  })

  it('returns values in LIFO order', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.pop()).toBe(3)
    expect(fa.pop()).toBe(2)
    expect(fa.pop()).toBe(1)
  })
})

describe('FibonacciArray get', () => {
  it('returns undefined for out of bounds index', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.get(0)).toBeUndefined()
    expect(fa.get(-1)).toBeUndefined()
  })

  it('returns element at valid index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    fa.push(30)
    expect(fa.get(0)).toBe(10)
    expect(fa.get(1)).toBe(20)
    expect(fa.get(2)).toBe(30)
  })

  it('returns undefined for index equal to length', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(fa.get(1)).toBeUndefined()
  })

  it('returns undefined for negative index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(fa.get(-1)).toBeUndefined()
  })

  it('returns correct values across bucket boundaries', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 3 })
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.push(4)
    expect(fa.get(0)).toBe(1)
    expect(fa.get(1)).toBe(2)
    expect(fa.get(2)).toBe(3)
    expect(fa.get(3)).toBe(4)
  })
})

describe('FibonacciArray set', () => {
  it('sets value at valid index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.set(0, 100)
    expect(fa.get(0)).toBe(100)
  })

  it('throws on out of bounds index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(() => fa.set(1, 2)).toThrow(RangeError)
  })

  it('throws on negative index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(() => fa.set(-1, 2)).toThrow(RangeError)
  })

  it('throws on empty array', () => {
    const fa = new FibonacciArray<number>()
    expect(() => fa.set(0, 1)).toThrow(RangeError)
  })

  it('overwrites existing value', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.set(0, 99)
    expect(fa.get(0)).toBe(99)
  })

  it('sets value at last index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.set(2, 300)
    expect(fa.get(2)).toBe(300)
  })
})

describe('FibonacciArray insert', () => {
  it('inserts at beginning', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.insert(0, 0)
    expect(fa.get(0)).toBe(0)
    expect(fa.get(1)).toBe(1)
    expect(fa.get(2)).toBe(2)
    expect(fa.length).toBe(3)
  })

  it('inserts at end', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.insert(2, 3)
    expect(fa.get(2)).toBe(3)
    expect(fa.length).toBe(3)
  })

  it('inserts in middle', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(3)
    fa.insert(1, 2)
    expect(fa.get(0)).toBe(1)
    expect(fa.get(1)).toBe(2)
    expect(fa.get(2)).toBe(3)
  })

  it('inserts into empty array at index 0', () => {
    const fa = new FibonacciArray<number>()
    fa.insert(0, 42)
    expect(fa.get(0)).toBe(42)
    expect(fa.length).toBe(1)
  })

  it('throws on out of bounds index', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(() => fa.insert(2, 5)).toThrow(RangeError)
  })

  it('throws on negative index', () => {
    const fa = new FibonacciArray<number>()
    expect(() => fa.insert(-1, 5)).toThrow(RangeError)
  })

  it('shifts elements correctly', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    fa.push(30)
    fa.insert(1, 15)
    expect(fa.toArray()).toEqual([10, 15, 20, 30])
  })
})

describe('FibonacciArray remove', () => {
  it('removes from beginning', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.remove(0)).toBe(1)
    expect(fa.toArray()).toEqual([2, 3])
  })

  it('removes from end', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.remove(2)).toBe(3)
    expect(fa.toArray()).toEqual([1, 2])
  })

  it('removes from middle', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.remove(1)).toBe(2)
    expect(fa.toArray()).toEqual([1, 3])
  })

  it('returns undefined for out of bounds', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.remove(0)).toBeUndefined()
    expect(fa.remove(-1)).toBeUndefined()
  })

  it('removes single element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(42)
    expect(fa.remove(0)).toBe(42)
    expect(fa.isEmpty).toBe(true)
  })

  it('removes and length decreases', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.remove(1)
    expect(fa.length).toBe(2)
  })
})

describe('FibonacciArray indexOf', () => {
  it('finds existing element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    fa.push(30)
    expect(fa.indexOf(20)).toBe(1)
  })

  it('returns -1 for missing element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    expect(fa.indexOf(99)).toBe(-1)
  })

  it('returns -1 on empty array', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.indexOf(1)).toBe(-1)
  })

  it('finds first occurrence', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(1)
    expect(fa.indexOf(1)).toBe(0)
  })

  it('finds element at start', () => {
    const fa = new FibonacciArray<number>()
    fa.push(5)
    fa.push(6)
    expect(fa.indexOf(5)).toBe(0)
  })

  it('finds element at end', () => {
    const fa = new FibonacciArray<number>()
    fa.push(5)
    fa.push(6)
    expect(fa.indexOf(6)).toBe(1)
  })

  it('works with strings', () => {
    const fa = new FibonacciArray<string>()
    fa.push('a')
    fa.push('b')
    fa.push('c')
    expect(fa.indexOf('b')).toBe(1)
  })
})

describe('FibonacciArray contains', () => {
  it('returns true for existing element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    expect(fa.contains(1)).toBe(true)
  })

  it('returns false for missing element', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(fa.contains(99)).toBe(false)
  })

  it('returns false on empty array', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.contains(1)).toBe(false)
  })
})

describe('FibonacciArray length', () => {
  it('returns 0 on empty', () => {
    const fa = new FibonacciArray()
    expect(fa.length).toBe(0)
  })

  it('increments on push', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(fa.length).toBe(1)
    fa.push(2)
    expect(fa.length).toBe(2)
  })

  it('decrements on pop', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.pop()
    expect(fa.length).toBe(1)
  })
})

describe('FibonacciArray isEmpty', () => {
  it('is true on new array', () => {
    const fa = new FibonacciArray()
    expect(fa.isEmpty).toBe(true)
  })

  it('is false after push', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    expect(fa.isEmpty).toBe(false)
  })

  it('is true after clearing all elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.pop()
    expect(fa.isEmpty).toBe(true)
  })
})

describe('FibonacciArray isFull', () => {
  it('reflects capacity usage', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 2 })
    fa.push(1)
    expect(fa.isFull).toBe(false)
    fa.push(2)
    expect(fa.isFull).toBe(true)
  })

  it('is false when capacity grows', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 2 })
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.isFull).toBe(false)
  })
})

describe('FibonacciArray clear', () => {
  it('clears all elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.clear()
    expect(fa.length).toBe(0)
    expect(fa.isEmpty).toBe(true)
  })

  it('clear on empty array is no-op', () => {
    const fa = new FibonacciArray<number>()
    fa.clear()
    expect(fa.length).toBe(0)
  })

  it('allows push after clear', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.clear()
    fa.push(2)
    expect(fa.length).toBe(1)
    expect(fa.get(0)).toBe(2)
  })
})

describe('FibonacciArray toArray', () => {
  it('returns empty array for empty container', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.toArray()).toEqual([])
  })

  it('returns all elements in order', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.toArray()).toEqual([1, 2, 3])
  })

  it('returns new array each call', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    const a = fa.toArray()
    const b = fa.toArray()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('FibonacciArray forEach', () => {
  it('iterates over all elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    const result: number[] = []
    fa.forEach((v) => result.push(v))
    expect(result).toEqual([1, 2, 3])
  })

  it('provides correct indices', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    const indices: number[] = []
    fa.forEach((_v, i) => indices.push(i))
    expect(indices).toEqual([0, 1])
  })

  it('does not iterate on empty', () => {
    const fa = new FibonacciArray<number>()
    let count = 0
    fa.forEach(() => count++)
    expect(count).toBe(0)
  })
})

describe('FibonacciArray map', () => {
  it('maps values', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    const mapped = fa.map((v) => v * 2)
    expect(mapped.toArray()).toEqual([2, 4, 6])
  })

  it('returns new FibonacciArray', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    const mapped = fa.map((v) => String(v))
    expect(mapped).toBeInstanceOf(FibonacciArray)
    expect(mapped.get(0)).toBe('1')
  })

  it('maps empty array', () => {
    const fa = new FibonacciArray<number>()
    const mapped = fa.map((v) => v * 2)
    expect(mapped.length).toBe(0)
  })

  it('provides correct indices', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    const mapped = fa.map((v, i) => v + i)
    expect(mapped.toArray()).toEqual([10, 21])
  })
})

describe('FibonacciArray filter', () => {
  it('filters elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.push(4)
    const filtered = fa.filter((v) => v % 2 === 0)
    expect(filtered.toArray()).toEqual([2, 4])
  })

  it('returns empty when no match', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(3)
    const filtered = fa.filter((v) => v % 2 === 0)
    expect(filtered.length).toBe(0)
  })

  it('filters empty array', () => {
    const fa = new FibonacciArray<number>()
    const filtered = fa.filter(() => true)
    expect(filtered.length).toBe(0)
  })

  it('provides correct indices', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    fa.push(30)
    const indices: number[] = []
    fa.filter((_v, i) => {
      indices.push(i)
      return true
    })
    expect(indices).toEqual([0, 1, 2])
  })
})

describe('FibonacciArray reduce', () => {
  it('sums elements', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(fa.reduce((acc, v) => acc + v, 0)).toBe(6)
  })

  it('returns initial value for empty', () => {
    const fa = new FibonacciArray<number>()
    expect(fa.reduce((acc, v) => acc + v, 42)).toBe(42)
  })

  it('builds string from elements', () => {
    const fa = new FibonacciArray<string>()
    fa.push('a')
    fa.push('b')
    fa.push('c')
    expect(fa.reduce((acc, v) => acc + v, '')).toBe('abc')
  })

  it('provides correct indices', () => {
    const fa = new FibonacciArray<number>()
    fa.push(10)
    fa.push(20)
    const result = fa.reduce<number[]>((acc, _v, i) => {
      acc.push(i)
      return acc
    }, [])
    expect(result).toEqual([0, 1])
  })
})

describe('FibonacciArray iteration', () => {
  it('iterates with for...of', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    const result: number[] = []
    for (const v of fa) {
      result.push(v)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('spreads into array', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    expect([...fa]).toEqual([1, 2])
  })

  it('iterates empty array', () => {
    const fa = new FibonacciArray<number>()
    const result: number[] = []
    for (const v of fa) {
      result.push(v)
    }
    expect(result).toEqual([])
  })

  it('works with Array.from', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    expect(Array.from(fa)).toEqual([1, 2, 3])
  })
})

describe('FibonacciArray clone', () => {
  it('clones the array', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    const cloned = fa.clone()
    expect(cloned.toArray()).toEqual([1, 2])
    expect(cloned).not.toBe(fa)
  })

  it('modifying clone does not affect original', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    const cloned = fa.clone()
    cloned.push(2)
    expect(fa.length).toBe(1)
    expect(cloned.length).toBe(2)
  })

  it('clones empty array', () => {
    const fa = new FibonacciArray<number>()
    const cloned = fa.clone()
    expect(cloned.length).toBe(0)
  })
})

describe('FibonacciArray.from', () => {
  it('creates from array', () => {
    const fa = FibonacciArray.from([1, 2, 3])
    expect(fa.toArray()).toEqual([1, 2, 3])
  })

  it('creates from empty array', () => {
    const fa = FibonacciArray.from([])
    expect(fa.length).toBe(0)
  })

  it('creates from single element', () => {
    const fa = FibonacciArray.from([42])
    expect(fa.get(0)).toBe(42)
  })

  it('creates from string array', () => {
    const fa = FibonacciArray.from(['a', 'b', 'c'])
    expect(fa.toArray()).toEqual(['a', 'b', 'c'])
  })
})

describe('FibonacciArray getStats', () => {
  it('returns correct stats for empty', () => {
    const fa = new FibonacciArray()
    const stats = fa.getStats()
    expect(stats.length).toBe(0)
    expect(stats.capacity).toBeGreaterThan(0)
    expect(stats.bucketCount).toBeGreaterThanOrEqual(1)
    expect(stats.utilizationRatio).toBe(0)
  })

  it('returns correct stats after push', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    const stats = fa.getStats()
    expect(stats.length).toBe(2)
    expect(stats.utilizationRatio).toBeGreaterThan(0)
  })

  it('utilizationRatio is between 0 and 1', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    const stats = fa.getStats()
    expect(stats.utilizationRatio).toBeGreaterThan(0)
    expect(stats.utilizationRatio).toBeLessThanOrEqual(1)
  })
})

describe('FibonacciArray edge cases', () => {
  it('handles 1000+ elements', () => {
    const fa = new FibonacciArray<number>()
    for (let i = 0; i < 1000; i++) {
      fa.push(i)
    }
    expect(fa.length).toBe(1000)
    expect(fa.get(0)).toBe(0)
    expect(fa.get(999)).toBe(999)
    expect(fa.get(500)).toBe(500)
  })

  it('handles mixed push and pop', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.pop()
    fa.push(3)
    fa.push(4)
    fa.pop()
    expect(fa.toArray()).toEqual([1, 3])
  })

  it('handles insert at boundary', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.insert(2, 3)
    expect(fa.toArray()).toEqual([1, 2, 3])
  })

  it('handles remove at boundary', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    expect(fa.remove(1)).toBe(2)
    expect(fa.toArray()).toEqual([1])
  })

  it('handles get across multiple bucket boundaries', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 1 })
    for (let i = 0; i < 20; i++) {
      fa.push(i)
    }
    for (let i = 0; i < 20; i++) {
      expect(fa.get(i)).toBe(i)
    }
  })

  it('handles large sequential operations', () => {
    const fa = new FibonacciArray<number>()
    for (let i = 0; i < 100; i++) {
      fa.push(i)
    }
    for (let i = 99; i >= 0; i--) {
      expect(fa.pop()).toBe(i)
    }
    expect(fa.isEmpty).toBe(true)
  })

  it('handles push after removing all', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.remove(0)
    fa.remove(0)
    expect(fa.isEmpty).toBe(true)
    fa.push(3)
    expect(fa.get(0)).toBe(3)
  })

  it('handles map to different type', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    const mapped = fa.map((v) => `val:${v}`)
    expect(mapped.toArray()).toEqual(['val:1', 'val:2'])
  })

  it('handles filter that removes all', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    const filtered = fa.filter(() => false)
    expect(filtered.length).toBe(0)
  })

  it('handles reduce with object accumulator', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    const result = fa.reduce<{ sum: number; count: number }>(
      (acc, v) => ({ sum: acc.sum + v, count: acc.count + 1 }),
      { sum: 0, count: 0 },
    )
    expect(result).toEqual({ sum: 6, count: 3 })
  })

  it('handles boolean values', () => {
    const fa = new FibonacciArray<boolean>()
    fa.push(true)
    fa.push(false)
    fa.push(true)
    expect(fa.get(0)).toBe(true)
    expect(fa.get(1)).toBe(false)
    expect(fa.indexOf(false)).toBe(1)
  })

  it('handles remove followed by insert', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.remove(1)
    fa.insert(1, 20)
    expect(fa.toArray()).toEqual([1, 20, 3])
  })

  it('handles cloning after modifications', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.pop()
    const cloned = fa.clone()
    expect(cloned.toArray()).toEqual([1])
  })

  it('handles from static with large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => i)
    const fa = FibonacciArray.from(arr)
    expect(fa.length).toBe(500)
    expect(fa.get(499)).toBe(499)
  })

  it('handles set after growth', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 2 })
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.set(2, 300)
    expect(fa.get(2)).toBe(300)
  })

  it('handles many insert operations', () => {
    const fa = new FibonacciArray<number>()
    fa.insert(0, 3)
    fa.insert(0, 1)
    fa.insert(1, 2)
    expect(fa.toArray()).toEqual([1, 2, 3])
  })

  it('handles many remove operations', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.push(4)
    fa.remove(0)
    fa.remove(0)
    fa.remove(0)
    expect(fa.toArray()).toEqual([4])
  })

  it('capacity getter returns positive number', () => {
    const fa = new FibonacciArray<number>()
    const stats = fa.getStats()
    expect(stats.capacity).toBeGreaterThan(0)
  })

  it('bucketCount increases with growth', () => {
    const fa = new FibonacciArray<number>({ initialCapacity: 1 })
    const initial = fa.getStats().bucketCount
    for (let i = 0; i < 50; i++) {
      fa.push(i)
    }
    expect(fa.getStats().bucketCount).toBeGreaterThan(initial)
  })

  it('handles forEach after insert and remove', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(3)
    fa.insert(1, 2)
    fa.remove(0)
    const result: number[] = []
    fa.forEach((v) => result.push(v))
    expect(result).toEqual([2, 3])
  })

  it('iterator works after modifications', () => {
    const fa = new FibonacciArray<number>()
    fa.push(1)
    fa.push(2)
    fa.push(3)
    fa.pop()
    const result: number[] = []
    for (const v of fa) {
      result.push(v)
    }
    expect(result).toEqual([1, 2])
  })

  it('handles indexOf with objects by reference', () => {
    const fa = new FibonacciArray<object>()
    const obj = { x: 1 }
    fa.push(obj)
    expect(fa.indexOf(obj)).toBe(0)
    expect(fa.indexOf({ x: 1 })).toBe(-1)
  })

  it('handles clear and re-use repeatedly', () => {
    const fa = new FibonacciArray<number>()
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < 10; i++) fa.push(i)
      expect(fa.length).toBe(10)
      fa.clear()
      expect(fa.isEmpty).toBe(true)
    }
  })
})
