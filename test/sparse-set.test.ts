import { describe, it, expect } from 'vitest'
import { SparseSet } from '../src/utils/sparse-set.js'

describe('SparseSet', () => {
  describe('constructor', () => {
    it('creates empty set with given universe size', () => {
      const s = new SparseSet(10)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.universeSize).toBe(10)
    })

    it('creates set with zero universe', () => {
      const s = new SparseSet(0)
      expect(s.size).toBe(0)
      expect(s.universeSize).toBe(0)
    })

    it('throws on negative universe size', () => {
      expect(() => new SparseSet(-1)).toThrow(RangeError)
    })

    it('throws on non-integer universe size', () => {
      expect(() => new SparseSet(3.5)).toThrow(RangeError)
    })

    it('handles large universe size', () => {
      const s = new SparseSet(100000)
      expect(s.universeSize).toBe(100000)
    })
  })

  describe('add', () => {
    it('adds a value', () => {
      const s = new SparseSet(10)
      expect(s.add(5)).toBe(true)
      expect(s.has(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('returns false for duplicate', () => {
      const s = new SparseSet(10)
      s.add(5)
      expect(s.add(5)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('returns false for negative value', () => {
      const s = new SparseSet(10)
      expect(s.add(-1)).toBe(false)
    })

    it('returns false for value >= universeSize', () => {
      const s = new SparseSet(10)
      expect(s.add(10)).toBe(false)
      expect(s.add(100)).toBe(false)
    })

    it('returns false for non-integer', () => {
      const s = new SparseSet(10)
      expect(s.add(3.5)).toBe(false)
    })

    it('adds zero', () => {
      const s = new SparseSet(10)
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('adds max valid value', () => {
      const s = new SparseSet(10)
      expect(s.add(9)).toBe(true)
      expect(s.has(9)).toBe(true)
    })

    it('adds multiple values', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(3)
      s.add(7)
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(7)).toBe(true)
    })
  })

  describe('has', () => {
    it('returns false for missing value', () => {
      const s = new SparseSet(10)
      expect(s.has(5)).toBe(false)
    })

    it('returns false for out-of-range value', () => {
      const s = new SparseSet(5)
      expect(s.has(10)).toBe(false)
      expect(s.has(-1)).toBe(false)
    })

    it('returns false for non-integer', () => {
      const s = new SparseSet(10)
      expect(s.has(3.5)).toBe(false)
    })

    it('finds value after add', () => {
      const s = new SparseSet(10)
      s.add(3)
      expect(s.has(3)).toBe(true)
    })

    it('does not find value after remove', () => {
      const s = new SparseSet(10)
      s.add(3)
      s.remove(3)
      expect(s.has(3)).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes existing value', () => {
      const s = new SparseSet(10)
      s.add(5)
      expect(s.remove(5)).toBe(true)
      expect(s.has(5)).toBe(false)
      expect(s.size).toBe(0)
    })

    it('returns false for missing value', () => {
      const s = new SparseSet(10)
      expect(s.remove(5)).toBe(false)
    })

    it('returns false for out-of-range', () => {
      const s = new SparseSet(5)
      expect(s.remove(10)).toBe(false)
    })

    it('maintains other elements after remove', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.remove(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('handles remove then re-add', () => {
      const s = new SparseSet(10)
      s.add(5)
      s.remove(5)
      expect(s.add(5)).toBe(true)
      expect(s.has(5)).toBe(true)
    })

    it('removes last element (swap-with-last edge case)', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.remove(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('removes first element (swap-with-last)', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.remove(1)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(false)
    })

    it('allows adding after clear', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.clear()
      expect(s.add(1)).toBe(true)
      expect(s.has(1)).toBe(true)
    })

    it('clear on empty set is no-op', () => {
      const s = new SparseSet(10)
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  describe('values / toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new SparseSet(10)
      expect(s.values()).toEqual([])
      expect(s.toArray()).toEqual([])
    })

    it('returns all added values', () => {
      const s = new SparseSet(10)
      s.add(3)
      s.add(1)
      s.add(7)
      const vals = s.values()
      expect(vals.sort()).toEqual([1, 3, 7])
    })

    it('toArray matches values', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      expect(s.toArray()).toEqual(s.values())
    })
  })

  describe('forEach', () => {
    it('iterates over all values', () => {
      const s = new SparseSet(10)
      s.add(2)
      s.add(4)
      s.add(6)
      const collected: number[] = []
      s.forEach((v) => collected.push(v))
      expect(collected.sort()).toEqual([2, 4, 6])
    })

    it('provides correct indices', () => {
      const s = new SparseSet(10)
      s.add(5)
      s.add(7)
      const pairs: [number, number][] = []
      s.forEach((v, i) => pairs.push([v, i]))
      expect(pairs.length).toBe(2)
      expect(pairs[0]![1]).toBe(0)
      expect(pairs[1]![1]).toBe(1)
    })

    it('does not iterate on empty set', () => {
      const s = new SparseSet(10)
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(3)
      const collected = [...s]
      expect(collected.sort()).toEqual([1, 3])
    })

    it('works with empty set', () => {
      const s = new SparseSet(10)
      expect([...s]).toEqual([])
    })
  })

  describe('union', () => {
    it('combines two sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(2)
      b.add(3)
      const u = a.union(b)
      expect(u.toArray().sort()).toEqual([1, 2, 3])
    })

    it('does not modify originals', () => {
      const a = new SparseSet(10)
      a.add(1)
      const b = new SparseSet(10)
      b.add(2)
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('handles disjoint sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      const b = new SparseSet(10)
      b.add(5)
      const u = a.union(b)
      expect(u.toArray().sort()).toEqual([1, 5])
    })

    it('handles identical sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      const u = a.union(b)
      expect(u.toArray().sort()).toEqual([1, 2])
    })
  })

  describe('intersection', () => {
    it('finds common elements', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SparseSet(10)
      b.add(2)
      b.add(3)
      b.add(4)
      const i = a.intersection(b)
      expect(i.toArray().sort()).toEqual([2, 3])
    })

    it('returns empty for disjoint sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      const b = new SparseSet(10)
      b.add(2)
      const i = a.intersection(b)
      expect(i.size).toBe(0)
    })

    it('handles identical sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      expect(a.intersection(b).toArray().sort()).toEqual([1, 2])
    })
  })

  describe('difference', () => {
    it('finds elements in a but not b', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SparseSet(10)
      b.add(2)
      const d = a.difference(b)
      expect(d.toArray().sort()).toEqual([1, 3])
    })

    it('returns full set when b is empty', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      expect(a.difference(b).toArray().sort()).toEqual([1, 2])
    })

    it('returns empty when a is subset of b', () => {
      const a = new SparseSet(10)
      a.add(1)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      expect(a.difference(b).size).toBe(0)
    })
  })

  describe('isSubsetOf', () => {
    it('true when all elements in other', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('false when element missing from other', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('empty set is subset of anything', () => {
      const a = new SparseSet(10)
      const b = new SparseSet(10)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('set is subset of itself', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      expect(a.isSubsetOf(a)).toBe(true)
    })
  })

  describe('isSupersetOf', () => {
    it('true when other is subset', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('false when other has extra element', () => {
      const a = new SparseSet(10)
      a.add(1)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })
  })

  describe('equals', () => {
    it('true for identical sets', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      expect(a.equals(b)).toBe(true)
    })

    it('false for different sizes', () => {
      const a = new SparseSet(10)
      a.add(1)
      const b = new SparseSet(10)
      b.add(1)
      b.add(2)
      expect(a.equals(b)).toBe(false)
    })

    it('false for same size different elements', () => {
      const a = new SparseSet(10)
      a.add(1)
      a.add(2)
      const b = new SparseSet(10)
      b.add(1)
      b.add(3)
      expect(a.equals(b)).toBe(false)
    })

    it('true for two empty sets', () => {
      expect(new SparseSet(10).equals(new SparseSet(10))).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const s = new SparseSet(10)
      s.add(1)
      s.add(2)
      const c = s.clone()
      expect(c.toArray().sort()).toEqual([1, 2])
      c.remove(1)
      expect(s.has(1)).toBe(true)
      expect(c.has(1)).toBe(false)
    })

    it('preserves universeSize', () => {
      const s = new SparseSet(20)
      const c = s.clone()
      expect(c.universeSize).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('handles add/remove/add cycle', () => {
      const s = new SparseSet(10)
      s.add(5)
      s.remove(5)
      expect(s.add(5)).toBe(true)
      expect(s.has(5)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles bulk operations', () => {
      const s = new SparseSet(1000)
      for (let i = 0; i < 1000; i++) {
        s.add(i)
      }
      expect(s.size).toBe(1000)
      for (let i = 0; i < 500; i++) {
        s.remove(i)
      }
      expect(s.size).toBe(500)
      expect(s.has(499)).toBe(false)
      expect(s.has(500)).toBe(true)
    })

    it('zero universe size rejects all adds', () => {
      const s = new SparseSet(0)
      expect(s.add(0)).toBe(false)
      expect(s.size).toBe(0)
    })

    it('stress test: alternating add/remove', () => {
      const s = new SparseSet(10)
      for (let i = 0; i < 50; i++) {
        s.add(i % 10)
        s.remove(i % 10)
      }
      expect(s.size).toBe(0)
    })
  })
})
