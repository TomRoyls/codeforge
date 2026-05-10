import { describe, it, expect } from 'vitest'
import { HashedArrayTree } from '../../src/core/hashed-array-tree/hashed-array-tree.js'
import { DEFAULT_HASHED_ARRAY_TREE_OPTIONS } from '../../src/core/hashed-array-tree/types.js'

describe('HashedArrayTree', () => {
  describe('construction', () => {
    it('constructs with default options', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.size).toBe(0)
      expect(hat.isEmpty).toBe(true)
      expect(hat.capacity).toBeGreaterThanOrEqual(16)
    })

    it('constructs with custom initialCapacity', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 64 })
      expect(hat.capacity).toBeGreaterThanOrEqual(64)
    })

    it('constructs with custom growthFactor', () => {
      const hat = new HashedArrayTree<number>({ growthFactor: 4 })
      expect(hat.size).toBe(0)
    })

    it('constructs with both options', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 32, growthFactor: 3 })
      expect(hat.size).toBe(0)
      expect(hat.capacity).toBeGreaterThanOrEqual(32)
    })

    it('handles initialCapacity of 1', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 1 })
      expect(hat.capacity).toBeGreaterThanOrEqual(1)
    })

    it('handles initialCapacity of 0 by clamping to 1', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 0 })
      expect(hat.capacity).toBeGreaterThanOrEqual(1)
    })

    it('handles negative initialCapacity by clamping', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: -5 })
      expect(hat.capacity).toBeGreaterThanOrEqual(1)
    })
  })

  describe('DEFAULT_HASHED_ARRAY_TREE_OPTIONS', () => {
    it('has initialCapacity 16', () => {
      expect(DEFAULT_HASHED_ARRAY_TREE_OPTIONS.initialCapacity).toBe(16)
    })

    it('has growthFactor 2', () => {
      expect(DEFAULT_HASHED_ARRAY_TREE_OPTIONS.growthFactor).toBe(2)
    })
  })

  describe('push', () => {
    it('pushes a single element', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(42)
      expect(hat.size).toBe(1)
      expect(hat.get(0)).toBe(42)
    })

    it('pushes multiple elements', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 10; i++) hat.push(i)
      expect(hat.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })

    it('pushes beyond initial capacity (auto-grow)', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 20; i++) hat.push(i)
      expect(hat.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })

    it('pushes strings', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('hello')
      hat.push('world')
      expect(hat.get(0)).toBe('hello')
      expect(hat.get(1)).toBe('world')
    })

    it('pushes objects', () => {
      const hat = new HashedArrayTree<{ id: number }>()
      hat.push({ id: 1 })
      hat.push({ id: 2 })
      expect(hat.get(0)?.id).toBe(1)
      expect(hat.get(1)?.id).toBe(2)
    })

    it('pushes null and undefined values', () => {
      const hat = new HashedArrayTree<number | null | undefined>()
      hat.push(null!)
      hat.push(undefined!)
      hat.push(3)
      expect(hat.get(0)).toBeNull()
      expect(hat.get(1)).toBeUndefined()
      expect(hat.get(2)).toBe(3)
    })

    it('maintains order after many pushes', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 100; i++) hat.push(i)
      const arr = hat.toArray()
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i)
      }
    })
  })

  describe('pop', () => {
    it('returns undefined on empty tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.pop()).toBeUndefined()
    })

    it('pops a single element', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(42)
      expect(hat.pop()).toBe(42)
      expect(hat.size).toBe(0)
    })

    it('pops in LIFO order', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      expect(hat.pop()).toBe(3)
      expect(hat.pop()).toBe(2)
      expect(hat.pop()).toBe(1)
    })

    it('shrinks when mostly empty', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 20; i++) hat.push(i)
      const capBefore = hat.capacity
      for (let i = 0; i < 18; i++) hat.pop()
      expect(hat.size).toBe(2)
    })

    it('pop and push interleaved', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      expect(hat.pop()).toBe(2)
      hat.push(3)
      expect(hat.pop()).toBe(3)
      expect(hat.pop()).toBe(1)
      expect(hat.isEmpty).toBe(true)
    })

    it('pops all elements', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 10; i++) hat.push(i)
      for (let i = 9; i >= 0; i--) {
        expect(hat.pop()).toBe(i)
      }
      expect(hat.size).toBe(0)
      expect(hat.isEmpty).toBe(true)
    })
  })

  describe('get/set', () => {
    it('get returns undefined for out of bounds', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.get(-1)).toBeUndefined()
      expect(hat.get(0)).toBeUndefined()
      expect(hat.get(100)).toBeUndefined()
    })

    it('set throws RangeError for out of bounds', () => {
      const hat = new HashedArrayTree<number>()
      expect(() => hat.set(-1, 5)).toThrow(RangeError)
      expect(() => hat.set(0, 5)).toThrow(RangeError)
    })

    it('get and set work correctly', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(10)
      hat.push(20)
      hat.set(0, 100)
      hat.set(1, 200)
      expect(hat.get(0)).toBe(100)
      expect(hat.get(1)).toBe(200)
    })

    it('set updates existing value', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('a')
      hat.set(0, 'b')
      expect(hat.get(0)).toBe('b')
    })

    it('get works after growth', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 30; i++) hat.push(i)
      expect(hat.get(0)).toBe(0)
      expect(hat.get(15)).toBe(15)
      expect(hat.get(29)).toBe(29)
    })
  })

  describe('insert/delete', () => {
    it('insert at beginning', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.insert(0, 0)
      expect(hat.toArray()).toEqual([0, 1, 2])
    })

    it('insert at end', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.insert(2, 3)
      expect(hat.toArray()).toEqual([1, 2, 3])
    })

    it('insert in middle', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(3)
      hat.insert(1, 2)
      expect(hat.toArray()).toEqual([1, 2, 3])
    })

    it('insert throws for out of bounds', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      expect(() => hat.insert(-1, 0)).toThrow(RangeError)
      expect(() => hat.insert(2, 0)).toThrow(RangeError)
    })

    it('insert into empty tree', () => {
      const hat = new HashedArrayTree<number>()
      hat.insert(0, 42)
      expect(hat.size).toBe(1)
      expect(hat.get(0)).toBe(42)
    })

    it('delete from beginning', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      expect(hat.delete(0)).toBe(1)
      expect(hat.toArray()).toEqual([2, 3])
    })

    it('delete from end', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      expect(hat.delete(2)).toBe(3)
      expect(hat.toArray()).toEqual([1, 2])
    })

    it('delete from middle', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      expect(hat.delete(1)).toBe(2)
      expect(hat.toArray()).toEqual([1, 3])
    })

    it('delete returns undefined for out of bounds', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.delete(-1)).toBeUndefined()
      expect(hat.delete(0)).toBeUndefined()
    })

    it('multiple insert and delete', () => {
      const hat = new HashedArrayTree<number>()
      hat.insert(0, 10)
      hat.insert(1, 20)
      hat.insert(1, 15)
      expect(hat.toArray()).toEqual([10, 15, 20])
      hat.delete(1)
      expect(hat.toArray()).toEqual([10, 20])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.toArray()).toEqual([])
    })

    it('returns array with all elements', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      expect(hat.toArray()).toEqual([1, 2, 3])
    })

    it('returns copy (not internal reference)', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      const arr = hat.toArray()
      arr[0] = 999
      expect(hat.get(0)).toBe(1)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(10)
      hat.push(20)
      hat.push(30)
      const collected: number[] = []
      hat.forEach((v) => collected.push(v))
      expect(collected).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('a')
      hat.push('b')
      const indices: number[] = []
      hat.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('provides tree reference', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.forEach((_v, _i, tree) => {
        expect(tree).toBe(hat)
      })
    })

    it('does not iterate on empty tree', () => {
      const hat = new HashedArrayTree<number>()
      let count = 0
      hat.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates with for-of', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      const collected: number[] = []
      for (const v of hat) collected.push(v)
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(4)
      hat.push(5)
      expect([...hat]).toEqual([4, 5])
    })

    it('empty tree yields nothing', () => {
      const hat = new HashedArrayTree<number>()
      const collected = [...hat]
      expect(collected).toEqual([])
    })
  })

  describe('indexOf', () => {
    it('finds existing element', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(10)
      hat.push(20)
      hat.push(30)
      expect(hat.indexOf(20)).toBe(1)
    })

    it('returns -1 for missing element', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(10)
      expect(hat.indexOf(99)).toBe(-1)
    })

    it('returns first occurrence', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(5)
      hat.push(10)
      hat.push(5)
      expect(hat.indexOf(5)).toBe(0)
    })

    it('works on empty tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.indexOf(1)).toBe(-1)
    })

    it('uses strict equality', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      expect(hat.indexOf(1)).toBe(0)
    })
  })

  describe('includes', () => {
    it('returns true for existing element', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('hello')
      expect(hat.includes('hello')).toBe(true)
    })

    it('returns false for missing element', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('hello')
      expect(hat.includes('world')).toBe(false)
    })

    it('returns false on empty tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.includes(1)).toBe(false)
    })
  })

  describe('map', () => {
    it('maps numbers to doubled values', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      const mapped = hat.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('maps to different type', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      const mapped = hat.map((v) => `num:${v}`)
      expect(mapped.toArray()).toEqual(['num:1', 'num:2'])
    })

    it('provides correct index', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('a')
      hat.push('b')
      const mapped = hat.map((v, i) => `${i}:${v}`)
      expect(mapped.toArray()).toEqual(['0:a', '1:b'])
    })

    it('returns new tree without modifying original', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(5)
      const mapped = hat.map((v) => v + 1)
      expect(hat.get(0)).toBe(5)
      expect(mapped.get(0)).toBe(6)
    })

    it('handles empty tree', () => {
      const hat = new HashedArrayTree<number>()
      const mapped = hat.map((v) => v)
      expect(mapped.size).toBe(0)
    })
  })

  describe('filter', () => {
    it('filters even numbers', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 1; i <= 6; i++) hat.push(i)
      const filtered = hat.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('returns empty when nothing matches', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(3)
      const filtered = hat.filter((v) => v % 2 === 0)
      expect(filtered.size).toBe(0)
    })

    it('returns all when all match', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(2)
      hat.push(4)
      const filtered = hat.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('does not modify original', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.filter((v) => v > 1)
      expect(hat.size).toBe(2)
    })

    it('provides correct index in callback', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(10)
      hat.push(20)
      hat.push(30)
      const indices: number[] = []
      hat.filter((_v, i) => {
        indices.push(i)
        return true
      })
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('reduce', () => {
    it('sums all elements', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      const sum = hat.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(6)
    })

    it('concatenates strings', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('a')
      hat.push('b')
      hat.push('c')
      const result = hat.reduce((acc, v) => acc + v, '')
      expect(result).toBe('abc')
    })

    it('returns initial value for empty tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('builds an object from entries', () => {
      const hat = new HashedArrayTree<[string, number]>()
      hat.push(['a', 1])
      hat.push(['b', 2])
      const result = hat.reduce(
        (acc, [k, v]) => ({ ...acc, [k]: v }),
        {} as Record<string, number>,
      )
      expect(result).toEqual({ a: 1, b: 2 })
    })
  })

  describe('slice', () => {
    it('slices entire tree', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 5; i++) hat.push(i)
      const sliced = hat.slice()
      expect(sliced.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('slices with start only', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 5; i++) hat.push(i)
      const sliced = hat.slice(2)
      expect(sliced.toArray()).toEqual([2, 3, 4])
    })

    it('slices with start and end', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 5; i++) hat.push(i)
      const sliced = hat.slice(1, 4)
      expect(sliced.toArray()).toEqual([1, 2, 3])
    })

    it('handles negative indices', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 5; i++) hat.push(i)
      const sliced = hat.slice(-2)
      expect(sliced.toArray()).toEqual([3, 4])
    })

    it('returns empty for out-of-range', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      const sliced = hat.slice(5, 10)
      expect(sliced.size).toBe(0)
    })

    it('does not modify original', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 5; i++) hat.push(i)
      hat.slice(1, 3)
      expect(hat.size).toBe(5)
    })
  })

  describe('concat', () => {
    it('concatenates two trees', () => {
      const a = new HashedArrayTree<number>()
      a.push(1)
      a.push(2)
      const b = new HashedArrayTree<number>()
      b.push(3)
      b.push(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concatenates with empty tree', () => {
      const a = new HashedArrayTree<number>()
      a.push(1)
      const b = new HashedArrayTree<number>()
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1])
    })

    it('concatenates two empty trees', () => {
      const a = new HashedArrayTree<number>()
      const b = new HashedArrayTree<number>()
      const result = a.concat(b)
      expect(result.size).toBe(0)
    })

    it('does not modify original trees', () => {
      const a = new HashedArrayTree<number>()
      a.push(1)
      const b = new HashedArrayTree<number>()
      b.push(2)
      a.concat(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })
  })

  describe('reverse', () => {
    it('reverses elements', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      hat.reverse()
      expect(hat.toArray()).toEqual([3, 2, 1])
    })

    it('reverses in place (returns same tree)', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      const result = hat.reverse()
      expect(result).toBe(hat)
    })

    it('handles empty tree', () => {
      const hat = new HashedArrayTree<number>()
      hat.reverse()
      expect(hat.size).toBe(0)
    })

    it('handles single element', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(42)
      hat.reverse()
      expect(hat.get(0)).toBe(42)
    })

    it('handles even number of elements', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      hat.push(4)
      hat.reverse()
      expect(hat.toArray()).toEqual([4, 3, 2, 1])
    })
  })

  describe('sort', () => {
    it('sorts numbers ascending', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(3)
      hat.push(1)
      hat.push(2)
      hat.sort((a, b) => a - b)
      expect(hat.toArray()).toEqual([1, 2, 3])
    })

    it('sorts numbers descending', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(3)
      hat.push(2)
      hat.sort((a, b) => b - a)
      expect(hat.toArray()).toEqual([3, 2, 1])
    })

    it('sorts in place (returns same tree)', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      const result = hat.sort((a, b) => a - b)
      expect(result).toBe(hat)
    })

    it('handles empty tree', () => {
      const hat = new HashedArrayTree<number>()
      hat.sort((a, b) => a - b)
      expect(hat.size).toBe(0)
    })

    it('handles single element', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.sort((a, b) => a - b)
      expect(hat.get(0)).toBe(1)
    })

    it('sorts strings', () => {
      const hat = new HashedArrayTree<string>()
      hat.push('banana')
      hat.push('apple')
      hat.push('cherry')
      hat.sort((a, b) => a.localeCompare(b))
      expect(hat.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('reserve', () => {
    it('reserves capacity', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      hat.reserve(100)
      expect(hat.capacity).toBeGreaterThanOrEqual(100)
    })

    it('preserves existing elements', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.reserve(50)
      expect(hat.get(0)).toBe(1)
      expect(hat.get(1)).toBe(2)
    })

    it('does nothing if already has enough capacity', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 64 })
      const capBefore = hat.capacity
      hat.reserve(10)
      expect(hat.capacity).toBe(capBefore)
    })
  })

  describe('shrinkToFit', () => {
    it('shrinks to fit used space', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 100 })
      hat.push(1)
      hat.push(2)
      hat.shrinkToFit()
      expect(hat.capacity).toBeLessThanOrEqual(20)
      expect(hat.get(0)).toBe(1)
      expect(hat.get(1)).toBe(2)
    })

    it('handles empty tree', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 100 })
      hat.shrinkToFit()
      expect(hat.size).toBe(0)
      expect(hat.capacity).toBeGreaterThanOrEqual(1)
    })

    it('preserves all elements', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 20; i++) hat.push(i)
      hat.shrinkToFit()
      expect(hat.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })
  })

  describe('compact', () => {
    it('is alias for shrinkToFit', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 100 })
      hat.push(1)
      hat.compact()
      expect(hat.capacity).toBeLessThanOrEqual(20)
      expect(hat.get(0)).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('returns correct stats for empty tree', () => {
      const hat = new HashedArrayTree<number>()
      const stats = hat.getStatistics()
      expect(stats.resizes).toBe(0)
      expect(stats.totalCapacity).toBeGreaterThanOrEqual(16)
      expect(stats.wastedSpace).toBe(stats.totalCapacity)
    })

    it('returns correct stats after pushes', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 10; i++) hat.push(i)
      const stats = hat.getStatistics()
      expect(stats.resizes).toBeGreaterThanOrEqual(0)
      expect(stats.totalCapacity).toBeGreaterThanOrEqual(10)
      expect(stats.wastedSpace).toBe(stats.totalCapacity - 10)
    })

    it('tracks resizes', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 2 })
      const initialResizes = hat.getStatistics().resizes
      for (let i = 0; i < 20; i++) hat.push(i)
      expect(hat.getStatistics().resizes).toBeGreaterThan(initialResizes)
    })
  })

  describe('getWastePercentage', () => {
    it('returns 100 for empty tree', () => {
      const hat = new HashedArrayTree<number>()
      const waste = hat.getWastePercentage()
      expect(waste).toBe(100)
    })

    it('returns 0 when full', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < hat.capacity; i++) hat.push(i)
      expect(hat.getWastePercentage()).toBe(0)
    })

    it('returns correct percentage', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 100 })
      hat.push(1)
      const waste = hat.getWastePercentage()
      expect(waste).toBeGreaterThan(0)
      expect(waste).toBeLessThanOrEqual(100)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 10; i++) hat.push(i)
      hat.clear()
      expect(hat.size).toBe(0)
      expect(hat.isEmpty).toBe(true)
    })

    it('allows pushing after clear', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.clear()
      hat.push(2)
      expect(hat.size).toBe(1)
      expect(hat.get(0)).toBe(2)
    })

    it('get returns undefined after clear', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(42)
      hat.clear()
      expect(hat.get(0)).toBeUndefined()
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for new tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.size).toBe(0)
    })

    it('isEmpty is true for new tree', () => {
      const hat = new HashedArrayTree<number>()
      expect(hat.isEmpty).toBe(true)
    })

    it('isEmpty is false after push', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      expect(hat.isEmpty).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(42)
      expect(hat.size).toBe(1)
      expect(hat.get(0)).toBe(42)
      expect(hat.pop()).toBe(42)
      expect(hat.size).toBe(0)
      expect(hat.isEmpty).toBe(true)
    })

    it('handles 200+ elements', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 250; i++) hat.push(i)
      expect(hat.size).toBe(250)
      for (let i = 0; i < 250; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })

    it('handles push-pop-push cycle', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.pop()
      hat.push(3)
      expect(hat.toArray()).toEqual([1, 3])
    })

    it('handles insert-grow scenario', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 10; i++) hat.push(i)
      hat.insert(5, 100)
      expect(hat.get(5)).toBe(100)
      expect(hat.get(6)).toBe(5)
      expect(hat.size).toBe(11)
    })

    it('handles delete-shrink scenario', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 20; i++) hat.push(i)
      for (let i = 0; i < 18; i++) hat.delete(0)
      expect(hat.size).toBe(2)
    })

    it('handles large sort', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 100; i >= 0; i--) hat.push(i)
      hat.sort((a, b) => a - b)
      for (let i = 0; i <= 100; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })

    it('handles large filter and reduce', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 100; i++) hat.push(i)
      const evens = hat.filter((v) => v % 2 === 0)
      const sum = evens.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(2450)
    })
  })

  describe('growth behavior', () => {
    it('capacity increases on growth', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      const initialCap = hat.capacity
      for (let i = 0; i <= initialCap; i++) hat.push(i)
      expect(hat.capacity).toBeGreaterThan(initialCap)
    })

    it('growth preserves all elements', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4 })
      for (let i = 0; i < 50; i++) hat.push(i)
      for (let i = 0; i < 50; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })

    it('resizes counter increments on growth', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 2, growthFactor: 2 })
      const before = hat.getStatistics().resizes
      for (let i = 0; i < 20; i++) hat.push(i)
      const after = hat.getStatistics().resizes
      expect(after).toBeGreaterThan(before)
    })

    it('shrink on pop reduces capacity', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 20; i++) hat.push(i)
      const grownCap = hat.capacity
      for (let i = 0; i < 18; i++) hat.pop()
      expect(hat.capacity).toBeLessThanOrEqual(grownCap)
    })

    it('growth factor 4 works correctly', () => {
      const hat = new HashedArrayTree<number>({ initialCapacity: 4, growthFactor: 4 })
      for (let i = 0; i < 100; i++) hat.push(i)
      expect(hat.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(hat.get(i)).toBe(i)
      }
    })
  })

  describe('chained operations', () => {
    it('reverse then sort', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      hat.reverse().sort((a, b) => a - b)
      expect(hat.toArray()).toEqual([1, 2, 3])
    })

    it('filter then map', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 6; i++) hat.push(i)
      const result = hat.filter((v) => v % 2 === 0).map((v) => v * 10)
      expect(result.toArray()).toEqual([0, 20, 40])
    })

    it('slice then concat', () => {
      const hat = new HashedArrayTree<number>()
      for (let i = 0; i < 5; i++) hat.push(i)
      const a = hat.slice(0, 2)
      const b = hat.slice(3, 5)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([0, 1, 3, 4])
    })

    it('map then reduce', () => {
      const hat = new HashedArrayTree<number>()
      hat.push(1)
      hat.push(2)
      hat.push(3)
      const sum = hat.map((v) => v * 2).reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(12)
    })
  })
})
