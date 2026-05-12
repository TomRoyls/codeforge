import { describe, it, expect } from 'vitest'
import { ConcurrentSet } from '../../src/core/concurrent-set/index.js'

describe('ConcurrentSet', () => {
  describe('constructor', () => {
    it('creates empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('creates set with initial values', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('deduplicates initial values', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 2, 3, 3, 3])
      expect(s.size).toBe(3)
    })

    it('accepts custom hash function', () => {
      const s = new ConcurrentSet<{ id: number }>({
        hash: (v) => String(v.id),
      })
      s.add({ id: 1 })
      s.add({ id: 2 })
      expect(s.size).toBe(2)
    })

    it('accepts custom comparator', () => {
      const s = new ConcurrentSet<number>({
        compare: (a, b) => b - a,
      })
      s.add(1)
      s.add(2)
      expect(s.size).toBe(2)
    })

    it('accepts both hash and comparator', () => {
      const s = new ConcurrentSet<{ id: number }>({
        hash: (v) => String(v.id),
        compare: (a, b) => a.id - b.id,
      })
      s.add({ id: 1 })
      expect(s.size).toBe(1)
    })

    it('works with string values', () => {
      const s = new ConcurrentSet<string>(undefined, ['a', 'b', 'c'])
      expect(s.size).toBe(3)
    })

    it('works with empty iterable', () => {
      const s = new ConcurrentSet<number>(undefined, [])
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('add', () => {
    it('adds a value', () => {
      const s = new ConcurrentSet<number>()
      const result = s.add(1)
      expect(result).toBe(true)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(true)
    })

    it('returns false for duplicate', () => {
      const s = new ConcurrentSet<number>()
      s.add(1)
      const result = s.add(1)
      expect(result).toBe(false)
      expect(s.size).toBe(1)
    })

    it('adds multiple distinct values', () => {
      const s = new ConcurrentSet<number>()
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('handles string values', () => {
      const s = new ConcurrentSet<string>()
      s.add('hello')
      s.add('world')
      expect(s.size).toBe(2)
      expect(s.has('hello')).toBe(true)
      expect(s.has('world')).toBe(true)
    })

    it('handles object values with custom hash', () => {
      const s = new ConcurrentSet<{ id: number }>({
        hash: (v) => String(v.id),
      })
      s.add({ id: 1 })
      s.add({ id: 2 })
      expect(s.size).toBe(2)
      expect(s.has({ id: 1 })).toBe(true)
      expect(s.has({ id: 2 })).toBe(true)
    })

    it('prevents duplicate objects with same hash', () => {
      const s = new ConcurrentSet<{ id: number }>({
        hash: (v) => String(v.id),
      })
      s.add({ id: 1 })
      expect(s.add({ id: 1 })).toBe(false)
      expect(s.size).toBe(1)
    })

    it('returns true when adding to empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.add(42)).toBe(true)
    })

    it('queues operations when locked', () => {
      const s = new ConcurrentSet<number>()
      s.lock()
      s.add(1)
      s.add(2)
      s.unlock()
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes an existing value', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const result = s.delete(2)
      expect(result).toBe(true)
      expect(s.size).toBe(2)
      expect(s.has(2)).toBe(false)
    })

    it('returns false for non-existent value', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const result = s.delete(99)
      expect(result).toBe(false)
      expect(s.size).toBe(3)
    })

    it('deletes from single-element set', () => {
      const s = new ConcurrentSet<number>(undefined, [1])
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('deletes all elements one by one', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.delete(1)
      s.delete(2)
      s.delete(3)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('handles deleting from empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.delete(1)).toBe(false)
    })

    it('queues delete when locked', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.lock()
      s.delete(1)
      s.unlock()
      expect(s.has(1)).toBe(false)
      expect(s.size).toBe(2)
    })
  })

  describe('has', () => {
    it('returns true for existing value', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('returns false for non-existent value', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(s.has(4)).toBe(false)
      expect(s.has(0)).toBe(false)
      expect(s.has(99)).toBe(false)
    })

    it('returns false for empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.has(1)).toBe(false)
    })

    it('uses custom hash for lookup', () => {
      const s = new ConcurrentSet<{ id: number }>({
        hash: (v) => String(v.id),
      })
      s.add({ id: 42 })
      expect(s.has({ id: 42 })).toBe(true)
      expect(s.has({ id: 99 })).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.size).toBe(0)
    })

    it('returns correct size after adds', () => {
      const s = new ConcurrentSet<number>()
      s.add(1)
      expect(s.size).toBe(1)
      s.add(2)
      expect(s.size).toBe(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('returns correct size after deletes', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3, 4, 5])
      s.delete(3)
      expect(s.size).toBe(4)
      s.delete(1)
      expect(s.size).toBe(3)
    })

    it('stays same after duplicate add', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.add(1)
      expect(s.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const s = new ConcurrentSet<number>()
      s.add(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2])
      s.delete(1)
      s.delete(2)
      expect(s.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('clears empty set without error', () => {
      const s = new ConcurrentSet<number>()
      s.clear()
      expect(s.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.clear()
      s.add(4)
      expect(s.size).toBe(1)
      expect(s.has(4)).toBe(true)
    })
  })

  describe('values', () => {
    it('returns empty array for empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.values()).toEqual([])
    })

    it('returns all values', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const vals = s.values()
      expect(vals.length).toBe(3)
      expect(vals).toContain(1)
      expect(vals).toContain(2)
      expect(vals).toContain(3)
    })

    it('returns new array each call', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2])
      const a = s.values()
      const b = s.values()
      expect(a).not.toBe(b)
    })
  })

  describe('toArray', () => {
    it('returns same as values', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(s.toArray()).toEqual(s.values())
    })

    it('returns empty for empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.toArray()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates over all values', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const collected: number[] = []
      s.forEach((v) => collected.push(v))
      expect(collected.length).toBe(3)
      expect(collected).toContain(1)
      expect(collected).toContain(2)
      expect(collected).toContain(3)
    })

    it('provides correct index', () => {
      const s = new ConcurrentSet<number>(undefined, [10, 20, 30])
      const indices: number[] = []
      s.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate empty set', () => {
      const s = new ConcurrentSet<number>()
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const collected: number[] = []
      for (const v of s) {
        collected.push(v)
      }
      expect(collected.length).toBe(3)
    })

    it('works with spread', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const arr = [...s]
      expect(arr.length).toBe(3)
    })

    it('works with Array.from', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const arr = Array.from(s)
      expect(arr.length).toBe(3)
    })

    it('empty set iterator returns nothing', () => {
      const s = new ConcurrentSet<number>()
      const arr = [...s]
      expect(arr).toEqual([])
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [3, 4, 5])
      const result = a.union(b)
      expect(result.size).toBe(5)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(4)).toBe(true)
      expect(result.has(5)).toBe(true)
    })

    it('returns copy when other is empty', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>()
      const result = a.union(b)
      expect(result.size).toBe(3)
    })

    it('returns copy when self is empty', () => {
      const a = new ConcurrentSet<number>()
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const result = a.union(b)
      expect(result.size).toBe(3)
    })

    it('returns new set without modifying originals', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [3, 4])
      const result = a.union(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
      expect(result.size).toBe(4)
    })

    it('handles identical sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.union(b).size).toBe(3)
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [2, 3, 4])
      const result = a.intersection(b)
      expect(result.size).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('returns empty when no overlap', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [3, 4])
      expect(a.intersection(b).size).toBe(0)
    })

    it('returns full set when identical', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.intersection(b).size).toBe(3)
    })

    it('returns empty when one is empty', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('returns new set', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [2, 3])
      const result = a.intersection(b)
      result.add(99)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })
  })

  describe('difference', () => {
    it('returns difference of two sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3, 4])
      const b = new ConcurrentSet<number>(undefined, [3, 4, 5])
      const result = a.difference(b)
      expect(result.size).toBe(2)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
    })

    it('returns copy when no overlap', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [3, 4])
      expect(a.difference(b).size).toBe(2)
    })

    it('returns empty when fully overlapping', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3, 4])
      expect(a.difference(b).size).toBe(0)
    })

    it('returns full when other is empty', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>()
      expect(a.difference(b).size).toBe(3)
    })
  })

  describe('symmetricDifference', () => {
    it('returns symmetric difference', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [2, 3, 4])
      const result = a.symmetricDifference(b)
      expect(result.size).toBe(2)
      expect(result.has(1)).toBe(true)
      expect(result.has(4)).toBe(true)
    })

    it('returns union when no overlap', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [3, 4])
      expect(a.symmetricDifference(b).size).toBe(4)
    })

    it('returns empty when identical', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.symmetricDifference(b).size).toBe(0)
    })

    it('handles one empty set', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>()
      expect(a.symmetricDifference(b).size).toBe(3)
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for equal sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 4])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for empty set', () => {
      const a = new ConcurrentSet<number>()
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when self larger', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3, 4])
      const b = new ConcurrentSet<number>(undefined, [1, 2])
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true for equal sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('empty set is superset of empty set', () => {
      const a = new ConcurrentSet<number>()
      const b = new ConcurrentSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for equal sets', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for same size different elements', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [4, 5, 6])
      expect(a.equals(b)).toBe(false)
    })

    it('empty sets are equal', () => {
      const a = new ConcurrentSet<number>()
      const b = new ConcurrentSet<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('returns false when one element differs', () => {
      const a = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const b = new ConcurrentSet<number>(undefined, [1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const c = s.clone()
      expect(c.size).toBe(3)
      expect(c.equals(s)).toBe(true)
      c.add(4)
      expect(s.size).toBe(3)
      expect(c.size).toBe(4)
    })

    it('clones empty set', () => {
      const s = new ConcurrentSet<number>()
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('preserves custom hash', () => {
      const hash = (v: { id: number }) => String(v.id)
      const s = new ConcurrentSet<{ id: number }>({ hash })
      s.add({ id: 1 })
      const c = s.clone()
      c.add({ id: 2 })
      expect(s.size).toBe(1)
      expect(c.size).toBe(2)
    })
  })

  describe('fromArray', () => {
    it('creates set from array', () => {
      const s = ConcurrentSet.fromArray([1, 2, 3])
      expect(s.size).toBe(3)
    })

    it('deduplicates', () => {
      const s = ConcurrentSet.fromArray([1, 1, 2, 2, 3])
      expect(s.size).toBe(3)
    })

    it('creates empty from empty array', () => {
      const s = ConcurrentSet.fromArray<number>([])
      expect(s.size).toBe(0)
    })

    it('accepts options', () => {
      const s = ConcurrentSet.fromArray(
        [{ id: 1 }, { id: 2 }],
        { hash: (v: { id: number }) => String(v.id) },
      )
      expect(s.size).toBe(2)
    })
  })

  describe('snapshot', () => {
    it('returns point-in-time copy', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const snap = s.snapshot()
      expect(snap).toEqual([1, 2, 3])
    })

    it('snapshot is independent of set', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const snap = s.snapshot()
      s.add(4)
      s.delete(1)
      expect(snap).toEqual([1, 2, 3])
      expect(snap.length).toBe(3)
    })

    it('returns empty array for empty set', () => {
      const s = new ConcurrentSet<number>()
      expect(s.snapshot()).toEqual([])
    })
  })

  describe('lock/unlock', () => {
    it('lock sets locked state', () => {
      const s = new ConcurrentSet<number>()
      s.lock()
      s.add(1)
      s.unlock()
      expect(s.has(1)).toBe(true)
    })

    it('unlock processes pending ops', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      s.lock()
      s.delete(1)
      s.add(4)
      s.clear()
      s.unlock()
      expect(s.size).toBe(0)
    })

    it('multiple lock/unlock cycles', () => {
      const s = new ConcurrentSet<number>()
      s.lock()
      s.add(1)
      s.unlock()
      expect(s.has(1)).toBe(true)
      s.lock()
      s.add(2)
      s.unlock()
      expect(s.has(2)).toBe(true)
      expect(s.size).toBe(2)
    })
  })

  describe('tryLock', () => {
    it('returns true when unlocked', () => {
      const s = new ConcurrentSet<number>()
      expect(s.tryLock()).toBe(true)
      s.unlock()
    })

    it('returns false when already locked', () => {
      const s = new ConcurrentSet<number>()
      s.lock()
      expect(s.tryLock()).toBe(false)
      s.unlock()
    })

    it('locks the set on success', () => {
      const s = new ConcurrentSet<number>()
      s.tryLock()
      expect(s.tryLock()).toBe(false)
      s.unlock()
    })
  })

  describe('withLock', () => {
    it('executes callback under lock', () => {
      const s = new ConcurrentSet<number>()
      const result = s.withLock(() => {
        s.add(1)
        s.add(2)
        return s.size
      })
      expect(result).toBe(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
    })

    it('unlocks after callback', () => {
      const s = new ConcurrentSet<number>()
      s.withLock(() => {
        s.add(1)
      })
      expect(s.tryLock()).toBe(true)
      s.unlock()
    })

    it('unlocks even on throw', () => {
      const s = new ConcurrentSet<number>()
      expect(() =>
        s.withLock(() => {
          throw new Error('test')
        }),
      ).toThrow('test')
      expect(s.tryLock()).toBe(true)
      s.unlock()
    })

    it('returns callback result', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const result = s.withLock(() => s.toArray())
      expect(result.length).toBe(3)
    })
  })

  describe('transaction', () => {
    it('commits on success', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      const result = s.transaction((tx) => {
        tx.add(4)
        tx.delete(1)
        return tx.size
      })
      expect(result).toBe(3)
      expect(s.has(4)).toBe(true)
      expect(s.has(1)).toBe(false)
    })

    it('rolls back on throw', () => {
      const s = new ConcurrentSet<number>(undefined, [1, 2, 3])
      expect(() =>
        s.transaction((tx) => {
          tx.add(4)
          tx.delete(1)
          throw new Error('rollback')
        }),
      ).toThrow('rollback')
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(4)).toBe(false)
    })

    it('unlocks after successful transaction', () => {
      const s = new ConcurrentSet<number>()
      s.transaction(() => {})
      expect(s.tryLock()).toBe(true)
      s.unlock()
    })

    it('unlocks after failed transaction', () => {
      const s = new ConcurrentSet<number>()
      try {
        s.transaction(() => {
          throw new Error('fail')
        })
      } catch {
        // expected
      }
      expect(s.tryLock()).toBe(true)
      s.unlock()
    })

    it('preserves state on rollback', () => {
      const s = new ConcurrentSet<number>(undefined, [10, 20, 30])
      try {
        s.transaction((tx) => {
          tx.clear()
          tx.add(99)
          throw new Error('abort')
        })
      } catch {
        // expected
      }
      expect(s.size).toBe(3)
      expect(s.has(10)).toBe(true)
      expect(s.has(20)).toBe(true)
      expect(s.has(30)).toBe(true)
    })
  })

  describe('custom hash function', () => {
    it('uses custom hash for dedup', () => {
      const s = new ConcurrentSet<string>({
        hash: (v) => v.toLowerCase(),
      })
      s.add('Hello')
      expect(s.add('hello')).toBe(false)
      expect(s.size).toBe(1)
    })

    it('uses custom hash for has', () => {
      const s = new ConcurrentSet<string>({
        hash: (v) => v.toLowerCase(),
      })
      s.add('Hello')
      expect(s.has('hello')).toBe(true)
      expect(s.has('HELLO')).toBe(true)
    })

    it('uses custom hash for delete', () => {
      const s = new ConcurrentSet<string>({
        hash: (v) => v.toLowerCase(),
      })
      s.add('Hello')
      expect(s.delete('hello')).toBe(true)
      expect(s.size).toBe(0)
    })

    it('works with complex object hash', () => {
      type Point = { x: number; y: number }
      const s = new ConcurrentSet<Point>({
        hash: (p) => `${p.x},${p.y}`,
      })
      s.add({ x: 1, y: 2 })
      s.add({ x: 3, y: 4 })
      expect(s.size).toBe(2)
      expect(s.has({ x: 1, y: 2 })).toBe(true)
      expect(s.has({ x: 5, y: 6 })).toBe(false)
    })
  })

  describe('set operations with custom hash', () => {
    it('union preserves custom hash', () => {
      const hash = (v: { id: number }) => String(v.id)
      const a = new ConcurrentSet<{ id: number }>({ hash })
      a.add({ id: 1 })
      a.add({ id: 2 })
      const b = new ConcurrentSet<{ id: number }>({ hash })
      b.add({ id: 2 })
      b.add({ id: 3 })
      const result = a.union(b)
      expect(result.size).toBe(3)
      expect(result.has({ id: 1 })).toBe(true)
      expect(result.has({ id: 2 })).toBe(true)
      expect(result.has({ id: 3 })).toBe(true)
    })

    it('intersection with custom hash', () => {
      const hash = (v: { id: number }) => String(v.id)
      const a = new ConcurrentSet<{ id: number }>({ hash })
      a.add({ id: 1 })
      a.add({ id: 2 })
      const b = new ConcurrentSet<{ id: number }>({ hash })
      b.add({ id: 2 })
      b.add({ id: 3 })
      const result = a.intersection(b)
      expect(result.size).toBe(1)
      expect(result.has({ id: 2 })).toBe(true)
    })

    it('equals with custom hash', () => {
      const hash = (v: { id: number }) => String(v.id)
      const a = new ConcurrentSet<{ id: number }>({ hash })
      a.add({ id: 1 })
      a.add({ id: 2 })
      const b = new ConcurrentSet<{ id: number }>({ hash })
      b.add({ id: 1 })
      b.add({ id: 2 })
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles null-like hash values', () => {
      const s = new ConcurrentSet<number | null>({
        hash: (v) => String(v),
      })
      s.add(0)
      s.add(null)
      expect(s.size).toBe(2)
    })

    it('handles undefined-like hash values', () => {
      const s = new ConcurrentSet<number | undefined>({
        hash: (v) => String(v),
      })
      s.add(0)
      s.add(undefined)
      expect(s.size).toBe(2)
    })

    it('handles boolean values', () => {
      const s = new ConcurrentSet<boolean>(undefined, [true, false])
      expect(s.size).toBe(2)
      expect(s.has(true)).toBe(true)
      expect(s.has(false)).toBe(true)
    })

    it('handles zero correctly', () => {
      const s = new ConcurrentSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('handles empty string', () => {
      const s = new ConcurrentSet<string>()
      s.add('')
      expect(s.has('')).toBe(true)
      expect(s.size).toBe(1)
    })

    it('large number of elements', () => {
      const s = new ConcurrentSet<number>()
      for (let i = 0; i < 1000; i++) {
        s.add(i)
      }
      expect(s.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(s.has(i)).toBe(true)
      }
      expect(s.has(1000)).toBe(false)
    })

    it('adding then deleting large set', () => {
      const s = new ConcurrentSet<number>()
      for (let i = 0; i < 500; i++) {
        s.add(i)
      }
      for (let i = 0; i < 500; i++) {
        s.delete(i)
      }
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })
  })
})
