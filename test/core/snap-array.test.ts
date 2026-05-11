import { describe, it, expect } from 'vitest'
import { SnapArray } from '../../src/core/snap-array/index.js'

describe('SnapArray', () => {
  describe('constructor', () => {
    it('creates empty array with no arguments', () => {
      const arr = new SnapArray()
      expect(arr.length).toBe(0)
      expect(arr.isEmpty).toBe(true)
    })

    it('creates array from provided elements', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.length).toBe(3)
      expect(arr.isEmpty).toBe(false)
    })

    it('creates array from empty input array', () => {
      const arr = new SnapArray([])
      expect(arr.length).toBe(0)
      expect(arr.isEmpty).toBe(true)
    })

    it('does not mutate the input array', () => {
      const input = [1, 2, 3]
      const arr = new SnapArray(input)
      expect(arr.toArray()).toEqual([1, 2, 3])
      input.push(4)
      expect(arr.length).toBe(3)
    })

    it('creates independent copy of input', () => {
      const input = [10, 20]
      const arr = new SnapArray(input)
      input[0] = 99
      expect(arr.get(0)).toBe(10)
    })
  })

  describe('get', () => {
    it('returns element at valid index', () => {
      const arr = new SnapArray(['a', 'b', 'c'])
      expect(arr.get(0)).toBe('a')
      expect(arr.get(1)).toBe('b')
      expect(arr.get(2)).toBe('c')
    })

    it('throws on negative index', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(() => arr.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to length', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(() => arr.get(3)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const arr = new SnapArray([1])
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new SnapArray()
      expect(() => arr.get(0)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('returns new array with value set', () => {
      const arr = new SnapArray([1, 2, 3])
      const arr2 = arr.set(1, 99)
      expect(arr2.get(1)).toBe(99)
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      const arr2 = arr.set(1, 99)
      expect(arr.get(1)).toBe(2)
      expect(arr2.get(1)).toBe(99)
    })

    it('sets first element', () => {
      const arr = new SnapArray([10, 20, 30])
      const arr2 = arr.set(0, 5)
      expect(arr2.toArray()).toEqual([5, 20, 30])
    })

    it('sets last element', () => {
      const arr = new SnapArray([10, 20, 30])
      const arr2 = arr.set(2, 5)
      expect(arr2.toArray()).toEqual([10, 20, 5])
    })

    it('throws on negative index', () => {
      const arr = new SnapArray([1, 2])
      expect(() => arr.set(-1, 0)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = new SnapArray([1, 2])
      expect(() => arr.set(5, 0)).toThrow(RangeError)
    })

    it('preserves length', () => {
      const arr = new SnapArray([1, 2, 3])
      const arr2 = arr.set(1, 99)
      expect(arr2.length).toBe(3)
    })
  })

  describe('push', () => {
    it('appends element and returns new array', () => {
      const arr = new SnapArray([1, 2])
      const arr2 = arr.push(3)
      expect(arr2.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2])
      const arr2 = arr.push(3)
      expect(arr.toArray()).toEqual([1, 2])
      expect(arr2.toArray()).toEqual([1, 2, 3])
    })

    it('pushes to empty array', () => {
      const arr = new SnapArray<number>()
      const arr2 = arr.push(42)
      expect(arr2.length).toBe(1)
      expect(arr2.get(0)).toBe(42)
    })

    it('increments length', () => {
      const arr = new SnapArray([1])
      const arr2 = arr.push(2)
      expect(arr.length).toBe(1)
      expect(arr2.length).toBe(2)
    })

    it('chains multiple pushes', () => {
      const arr = new SnapArray<number>()
        .push(1)
        .push(2)
        .push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('pop', () => {
    it('returns tuple of new array and popped value', () => {
      const arr = new SnapArray([1, 2, 3])
      const [arr2, val] = arr.pop()
      expect(val).toBe(3)
      expect(arr2.toArray()).toEqual([1, 2])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      const [arr2] = arr.pop()
      expect(arr.toArray()).toEqual([1, 2, 3])
      expect(arr2.toArray()).toEqual([1, 2])
    })

    it('pops single element to empty', () => {
      const arr = new SnapArray([42])
      const [arr2, val] = arr.pop()
      expect(val).toBe(42)
      expect(arr2.isEmpty).toBe(true)
    })

    it('throws on empty array', () => {
      const arr = new SnapArray()
      expect(() => arr.pop()).toThrow(RangeError)
    })

    it('decrements length', () => {
      const arr = new SnapArray([1, 2])
      const [arr2] = arr.pop()
      expect(arr.length).toBe(2)
      expect(arr2.length).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const arr = new SnapArray([2, 3])
      const arr2 = arr.insert(0, 1)
      expect(arr2.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const arr = new SnapArray([1, 2])
      const arr2 = arr.insert(2, 3)
      expect(arr2.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const arr = new SnapArray([1, 3])
      const arr2 = arr.insert(1, 2)
      expect(arr2.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 3])
      arr.insert(1, 2)
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('throws on negative index', () => {
      const arr = new SnapArray([1, 2])
      expect(() => arr.insert(-1, 0)).toThrow(RangeError)
    })

    it('throws on index beyond length', () => {
      const arr = new SnapArray([1, 2])
      expect(() => arr.insert(3, 0)).toThrow(RangeError)
    })

    it('allows inserting at length (append)', () => {
      const arr = new SnapArray([1, 2])
      const arr2 = arr.insert(2, 3)
      expect(arr2.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('remove', () => {
    it('removes from beginning', () => {
      const arr = new SnapArray([1, 2, 3])
      const arr2 = arr.remove(0)
      expect(arr2.toArray()).toEqual([2, 3])
    })

    it('removes from end', () => {
      const arr = new SnapArray([1, 2, 3])
      const arr2 = arr.remove(2)
      expect(arr2.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const arr = new SnapArray([1, 2, 3])
      const arr2 = arr.remove(1)
      expect(arr2.toArray()).toEqual([1, 3])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      arr.remove(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('throws on negative index', () => {
      const arr = new SnapArray([1, 2])
      expect(() => arr.remove(-1)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = new SnapArray([1, 2])
      expect(() => arr.remove(2)).toThrow(RangeError)
    })
  })

  describe('length', () => {
    it('returns 0 for empty', () => {
      expect(new SnapArray().length).toBe(0)
    })

    it('returns correct count', () => {
      expect(new SnapArray([1, 2, 3]).length).toBe(3)
    })

    it('reflects after modifications', () => {
      const arr = new SnapArray([1]).push(2).push(3)
      expect(arr.length).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty', () => {
      expect(new SnapArray().isEmpty).toBe(true)
    })

    it('returns false for non-empty', () => {
      expect(new SnapArray([1]).isEmpty).toBe(false)
    })

    it('returns true after removing all elements', () => {
      const arr = new SnapArray([1]).remove(0)
      expect(arr.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns plain array copy', () => {
      const arr = new SnapArray([1, 2, 3])
      const plain = arr.toArray()
      expect(plain).toEqual([1, 2, 3])
      expect(Array.isArray(plain)).toBe(true)
    })

    it('returns mutable copy', () => {
      const arr = new SnapArray([1, 2, 3])
      const plain = arr.toArray()
      plain.push(4)
      expect(arr.length).toBe(3)
    })

    it('returns empty array for empty SnapArray', () => {
      const arr = new SnapArray()
      expect(arr.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const arr = new SnapArray([1, 2, 3])
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent from original', () => {
      const arr = new SnapArray([1, 2, 3])
      const cloned = arr.clone()
      const modified = cloned.set(0, 99)
      expect(arr.get(0)).toBe(1)
      expect(cloned.get(0)).toBe(1)
      expect(modified.get(0)).toBe(99)
    })

    it('preserves all elements', () => {
      const arr = new SnapArray(['x', 'y', 'z'])
      const cloned = arr.clone()
      expect(cloned.length).toBe(3)
      expect(cloned.get(0)).toBe('x')
      expect(cloned.get(2)).toBe('z')
    })
  })

  describe('snapshot and restore', () => {
    it('snapshot captures current state', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const restored = arr.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('snapshot is not affected by set', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const arr2 = arr.set(0, 99)
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('snapshot is not affected by push', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const arr2 = arr.push(4)
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('snapshot is not affected by pop', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const [arr2] = arr.pop()
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('snapshot is not affected by insert', () => {
      const arr = new SnapArray([1, 3])
      const snap = arr.snapshot()
      const arr2 = arr.insert(1, 2)
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 3])
    })

    it('snapshot is not affected by remove', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const arr2 = arr.remove(1)
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('snapshot is not affected by filter', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      const snap = arr.snapshot()
      const arr2 = arr.filter(x => x % 2 === 0)
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3, 4])
    })

    it('snapshot is not affected by map', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const arr2 = arr.map(x => x * 2)
      const restored = arr2.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('can take multiple snapshots', () => {
      const arr = new SnapArray([1])
      const snap1 = arr.snapshot()
      const arr2 = arr.push(2)
      const snap2 = arr2.snapshot()
      const arr3 = arr2.push(3)
      expect(arr3.restore(snap1).toArray()).toEqual([1])
      expect(arr3.restore(snap2).toArray()).toEqual([1, 2])
    })

    it('can chain snapshot and restore', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const modified = arr.push(4).push(5).set(0, 99)
      const restored = modified.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('restored array is independent', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const restored = arr.restore(snap)
      const modified = restored.set(0, 99)
      expect(restored.get(0)).toBe(1)
      expect(modified.get(0)).toBe(99)
    })

    it('snapshot of empty array', () => {
      const arr = new SnapArray<number>()
      const snap = arr.snapshot()
      const arr2 = arr.push(1)
      const restored = arr2.restore(snap)
      expect(restored.isEmpty).toBe(true)
    })

    it('snapshot preserves element types', () => {
      const arr = new SnapArray(['a', 'b'])
      const snap = arr.snapshot()
      const restored = arr.push('c').restore(snap)
      expect(restored.get(0)).toBe('a')
      expect(restored.get(1)).toBe('b')
    })

    it('snapshot is O(1) - returns frozen reference', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      expect(snap.data.length).toBe(3)
      expect(snap.data[0]).toBe(1)
      expect(snap.data[1]).toBe(2)
      expect(snap.data[2]).toBe(3)
    })
  })

  describe('forEach', () => {
    it('iterates all elements in order', () => {
      const arr = new SnapArray([10, 20, 30])
      const result: number[] = []
      arr.forEach(v => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const arr = new SnapArray(['a', 'b', 'c'])
      const indices: number[] = []
      arr.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing on empty array', () => {
      const arr = new SnapArray()
      let count = 0
      arr.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable with for-of', () => {
      const arr = new SnapArray([1, 2, 3])
      const result: number[] = []
      for (const val of arr) {
        result.push(val)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const arr = new SnapArray([4, 5, 6])
      expect([...arr]).toEqual([4, 5, 6])
    })

    it('works with Array.from', () => {
      const arr = new SnapArray([7, 8, 9])
      expect(Array.from(arr)).toEqual([7, 8, 9])
    })
  })

  describe('map', () => {
    it('transforms elements', () => {
      const arr = new SnapArray([1, 2, 3])
      const mapped = arr.map(x => x * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      arr.map(x => x * 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const arr = new SnapArray(['a', 'b'])
      const mapped = arr.map((_v, i) => i)
      expect(mapped.toArray()).toEqual([0, 1])
    })

    it('can change type', () => {
      const arr = new SnapArray([1, 2, 3])
      const mapped = arr.map(x => String(x))
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })

    it('handles empty array', () => {
      const arr = new SnapArray<number>()
      const mapped = arr.map(x => x * 2)
      expect(mapped.isEmpty).toBe(true)
    })
  })

  describe('filter', () => {
    it('filters elements', () => {
      const arr = new SnapArray([1, 2, 3, 4, 5])
      const filtered = arr.filter(x => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      arr.filter(x => x > 1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const arr = new SnapArray([10, 20, 30])
      const filtered = arr.filter((_v, i) => i !== 1)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('returns empty when nothing matches', () => {
      const arr = new SnapArray([1, 3, 5])
      const filtered = arr.filter(x => x % 2 === 0)
      expect(filtered.isEmpty).toBe(true)
    })

    it('returns all when everything matches', () => {
      const arr = new SnapArray([2, 4, 6])
      const filtered = arr.filter(x => x % 2 === 0)
      expect(filtered.length).toBe(3)
    })
  })

  describe('reduce', () => {
    it('sums elements', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      expect(arr.reduce((a, b) => a + b, 0)).toBe(10)
    })

    it('concatenates strings', () => {
      const arr = new SnapArray(['a', 'b', 'c'])
      expect(arr.reduce((a, b) => a + b, '')).toBe('abc')
    })

    it('provides correct indices', () => {
      const arr = new SnapArray([10, 20, 30])
      const result = arr.reduce((acc, _v, i) => acc + i, 0)
      expect(result).toBe(3)
    })

    it('returns initial value for empty array', () => {
      const arr = new SnapArray<number>()
      expect(arr.reduce((a, b) => a + b, 42)).toBe(42)
    })

    it('builds an object', () => {
      const arr = new SnapArray(['a', 'bb', 'ccc'])
      const result = arr.reduce<Record<string, number>>((acc, v) => {
        acc[v] = v.length
        return acc
      }, {})
      expect(result).toEqual({ a: 1, bb: 2, ccc: 3 })
    })
  })

  describe('find', () => {
    it('finds matching element', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      expect(arr.find(x => x > 2)).toBe(3)
    })

    it('returns undefined when not found', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.find(x => x > 10)).toBeUndefined()
    })

    it('returns first match', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      expect(arr.find(x => x % 2 === 0)).toBe(2)
    })
  })

  describe('findIndex', () => {
    it('finds index of matching element', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      expect(arr.findIndex(x => x > 2)).toBe(2)
    })

    it('returns -1 when not found', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.findIndex(x => x > 10)).toBe(-1)
    })

    it('returns first matching index', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      expect(arr.findIndex(x => x % 2 === 0)).toBe(1)
    })
  })

  describe('every', () => {
    it('returns true when all match', () => {
      const arr = new SnapArray([2, 4, 6])
      expect(arr.every(x => x % 2 === 0)).toBe(true)
    })

    it('returns false when some do not match', () => {
      const arr = new SnapArray([2, 3, 6])
      expect(arr.every(x => x % 2 === 0)).toBe(false)
    })

    it('returns true for empty array', () => {
      const arr = new SnapArray<number>()
      expect(arr.every(x => x > 0)).toBe(true)
    })
  })

  describe('some', () => {
    it('returns true when at least one matches', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.some(x => x % 2 === 0)).toBe(true)
    })

    it('returns false when none match', () => {
      const arr = new SnapArray([1, 3, 5])
      expect(arr.some(x => x % 2 === 0)).toBe(false)
    })

    it('returns false for empty array', () => {
      const arr = new SnapArray<number>()
      expect(arr.some(x => x > 0)).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('finds index of existing element', () => {
      const arr = new SnapArray([10, 20, 30])
      expect(arr.indexOf(20)).toBe(1)
    })

    it('returns -1 for missing element', () => {
      const arr = new SnapArray([10, 20, 30])
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('finds first occurrence', () => {
      const arr = new SnapArray([1, 2, 2, 3])
      expect(arr.indexOf(2)).toBe(1)
    })

    it('finds undefined elements', () => {
      const arr = new SnapArray<number | undefined>([1, undefined, 3])
      expect(arr.indexOf(undefined)).toBe(1)
    })
  })

  describe('includes', () => {
    it('returns true for existing element', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false for missing element', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.includes(5)).toBe(false)
    })

    it('returns false for empty array', () => {
      const arr = new SnapArray<number>()
      expect(arr.includes(1)).toBe(false)
    })
  })

  describe('slice', () => {
    it('slices with start and end', () => {
      const arr = new SnapArray([1, 2, 3, 4, 5])
      const sliced = arr.slice(1, 4)
      expect(sliced.toArray()).toEqual([2, 3, 4])
    })

    it('slices with only start', () => {
      const arr = new SnapArray([1, 2, 3, 4, 5])
      const sliced = arr.slice(2)
      expect(sliced.toArray()).toEqual([3, 4, 5])
    })

    it('slices with no arguments returns full copy', () => {
      const arr = new SnapArray([1, 2, 3])
      const sliced = arr.slice()
      expect(sliced.toArray()).toEqual([1, 2, 3])
      expect(sliced).not.toBe(arr)
    })

    it('handles negative indices', () => {
      const arr = new SnapArray([1, 2, 3, 4, 5])
      const sliced = arr.slice(-2)
      expect(sliced.toArray()).toEqual([4, 5])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      arr.slice(0, 1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('concat', () => {
    it('concatenates two SnapArrays', () => {
      const arr1 = new SnapArray([1, 2])
      const arr2 = new SnapArray([3, 4])
      const result = arr1.concat(arr2)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concatenates with plain array', () => {
      const arr = new SnapArray([1, 2])
      const result = arr.concat([3, 4])
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2])
      arr.concat([3, 4])
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('concatenates empty arrays', () => {
      const arr1 = new SnapArray<number>()
      const arr2 = new SnapArray<number>()
      const result = arr1.concat(arr2)
      expect(result.isEmpty).toBe(true)
    })

    it('concatenates with empty right side', () => {
      const arr = new SnapArray([1, 2])
      const result = arr.concat([])
      expect(result.toArray()).toEqual([1, 2])
    })
  })

  describe('reverse', () => {
    it('reverses elements', () => {
      const arr = new SnapArray([1, 2, 3])
      const reversed = arr.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([1, 2, 3])
      arr.reverse()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('handles single element', () => {
      const arr = new SnapArray([42])
      expect(arr.reverse().toArray()).toEqual([42])
    })

    it('handles empty array', () => {
      const arr = new SnapArray<number>()
      expect(arr.reverse().isEmpty).toBe(true)
    })
  })

  describe('sort', () => {
    it('sorts with comparator', () => {
      const arr = new SnapArray([3, 1, 2])
      const sorted = arr.sort((a, b) => a - b)
      expect(sorted.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original', () => {
      const arr = new SnapArray([3, 1, 2])
      arr.sort((a, b) => a - b)
      expect(arr.toArray()).toEqual([3, 1, 2])
    })

    it('sorts strings', () => {
      const arr = new SnapArray(['banana', 'apple', 'cherry'])
      const sorted = arr.sort((a, b) => a.localeCompare(b))
      expect(sorted.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles empty array', () => {
      const arr = new SnapArray<number>()
      const sorted = arr.sort((a, b) => a - b)
      expect(sorted.isEmpty).toBe(true)
    })

    it('handles single element', () => {
      const arr = new SnapArray([42])
      const sorted = arr.sort((a, b) => a - b)
      expect(sorted.toArray()).toEqual([42])
    })
  })

  describe('join', () => {
    it('joins with comma by default', () => {
      const arr = new SnapArray([1, 2, 3])
      expect(arr.join()).toBe('1,2,3')
    })

    it('joins with custom separator', () => {
      const arr = new SnapArray(['a', 'b', 'c'])
      expect(arr.join('-')).toBe('a-b-c')
    })

    it('joins with empty separator', () => {
      const arr = new SnapArray(['a', 'b', 'c'])
      expect(arr.join('')).toBe('abc')
    })

    it('returns empty string for empty array', () => {
      const arr = new SnapArray()
      expect(arr.join()).toBe('')
    })
  })

  describe('first', () => {
    it('returns first element', () => {
      const arr = new SnapArray([10, 20, 30])
      expect(arr.first()).toBe(10)
    })

    it('throws on empty array', () => {
      const arr = new SnapArray()
      expect(() => arr.first()).toThrow(RangeError)
    })
  })

  describe('last', () => {
    it('returns last element', () => {
      const arr = new SnapArray([10, 20, 30])
      expect(arr.last()).toBe(30)
    })

    it('throws on empty array', () => {
      const arr = new SnapArray()
      expect(() => arr.last()).toThrow(RangeError)
    })
  })

  describe('static fromArray', () => {
    it('creates SnapArray from array', () => {
      const arr = SnapArray.fromArray([1, 2, 3])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates independent copy', () => {
      const input = [1, 2, 3]
      const arr = SnapArray.fromArray(input)
      input.push(4)
      expect(arr.length).toBe(3)
    })

    it('creates from empty array', () => {
      const arr = SnapArray.fromArray([])
      expect(arr.isEmpty).toBe(true)
    })
  })

  describe('persistence and immutability', () => {
    it('set does not affect snapshot taken before set', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const arr2 = arr.set(0, 99)
      expect(arr.get(0)).toBe(1)
      expect(arr2.get(0)).toBe(99)
      expect(arr.restore(snap).toArray()).toEqual([1, 2, 3])
    })

    it('multiple modifications create independent versions', () => {
      const v0 = new SnapArray([1, 2, 3])
      const v1 = v0.push(4)
      const v2 = v1.set(0, 99)
      const v3 = v2.remove(1)
      expect(v0.toArray()).toEqual([1, 2, 3])
      expect(v1.toArray()).toEqual([1, 2, 3, 4])
      expect(v2.toArray()).toEqual([99, 2, 3, 4])
      expect(v3.toArray()).toEqual([99, 3, 4])
    })

    it('snapshot taken at different points are independent', () => {
      const arr = new SnapArray([1])
      const snap0 = arr.snapshot()
      const arr2 = arr.push(2)
      const snap1 = arr2.snapshot()
      const arr3 = arr2.push(3)
      const snap2 = arr3.snapshot()
      expect(arr3.restore(snap0).toArray()).toEqual([1])
      expect(arr3.restore(snap1).toArray()).toEqual([1, 2])
      expect(arr3.restore(snap2).toArray()).toEqual([1, 2, 3])
    })

    it('complex chain of operations preserves snapshots', () => {
      const arr = new SnapArray<number>([0, 1, 2, 3, 4])
      const snap = arr.snapshot()
      let current = arr
      for (let i = 0; i < 5; i++) {
        current = current.push(i + 5)
      }
      expect(current.length).toBe(10)
      const restored = current.restore(snap)
      expect(restored.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('map does not affect original snapshots', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const mapped = arr.map(x => x * 10)
      const restored = mapped.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('filter does not affect original snapshots', () => {
      const arr = new SnapArray([1, 2, 3, 4])
      const snap = arr.snapshot()
      const filtered = arr.filter(x => x > 2)
      const restored = filtered.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3, 4])
    })

    it('reverse does not affect original snapshots', () => {
      const arr = new SnapArray([1, 2, 3])
      const snap = arr.snapshot()
      const reversed = arr.reverse()
      const restored = reversed.restore(snap)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('sort does not affect original snapshots', () => {
      const arr = new SnapArray([3, 1, 2])
      const snap = arr.snapshot()
      const sorted = arr.sort((a, b) => a - b)
      const restored = sorted.restore(snap)
      expect(restored.toArray()).toEqual([3, 1, 2])
    })
  })
})
