import { describe, it, expect } from 'vitest'
import { PersistentSet } from '../../src/core/persistent-set/persistent-set.js'

function createSet<T>(): PersistentSet<T> {
  return new PersistentSet<T>()
}

function createReverseSet<T>(): PersistentSet<T> {
  return new PersistentSet<T>({ comparator: (a: T, b: T) => (a < b ? 1 : a > b ? -1 : 0) })
}

describe('PersistentSet', () => {
  describe('construction', () => {
    it('creates an empty set with default comparator', () => {
      const set = new PersistentSet<string>()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('creates a set with custom comparator', () => {
      const set = new PersistentSet<number>({
        comparator: (a, b) => b - a,
      })
      const s2 = set.add(1).add(2).add(3)
      expect(s2.min).toBe(3)
      expect(s2.max).toBe(1)
    })

    it('handles no options argument', () => {
      const set = new PersistentSet<number>(undefined)
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('creates independent instances', () => {
      const s1 = new PersistentSet<number>()
      const s2 = new PersistentSet<number>()
      expect(s1.size).toBe(0)
      expect(s2.size).toBe(0)
    })
  })

  describe('add', () => {
    it('adds a single value', () => {
      const set = createSet<string>().add('a')
      expect(set.size).toBe(1)
      expect(set.has('a')).toBe(true)
    })

    it('returns a new set, leaving original unchanged', () => {
      const original = createSet<string>()
      const modified = original.add('a')
      expect(original.size).toBe(0)
      expect(original.isEmpty).toBe(true)
      expect(modified.size).toBe(1)
      expect(modified.has('a')).toBe(true)
    })

    it('adds multiple values', () => {
      const set = createSet<string>().add('a').add('b').add('c')
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('rejects duplicate values', () => {
      const set = createSet<string>().add('a').add('a')
      expect(set.size).toBe(1)
      expect(set.has('a')).toBe(true)
    })

    it('returns same reference on duplicate add', () => {
      const s1 = createSet<string>().add('a')
      const s2 = s1.add('a')
      expect(s1).toBe(s2)
    })

    it('add with numeric keys', () => {
      const set = createSet<number>().add(10).add(5).add(20)
      expect(set.size).toBe(3)
      expect(set.has(10)).toBe(true)
      expect(set.has(5)).toBe(true)
      expect(set.has(20)).toBe(true)
    })

    it('add with negative numbers', () => {
      const set = createSet<number>().add(-5).add(-10).add(0).add(5)
      expect(set.size).toBe(4)
      expect(set.has(-5)).toBe(true)
      expect(set.has(-10)).toBe(true)
      expect(set.has(0)).toBe(true)
      expect(set.has(5)).toBe(true)
    })

    it('add with zero', () => {
      const set = createSet<number>().add(0)
      expect(set.size).toBe(1)
      expect(set.has(0)).toBe(true)
    })

    it('add with string keys', () => {
      const set = createSet<string>().add('hello').add('world')
      expect(set.size).toBe(2)
      expect(set.has('hello')).toBe(true)
      expect(set.has('world')).toBe(true)
    })

    it('add preserves persistence across chain', () => {
      const s0 = createSet<number>()
      const s1 = s0.add(1)
      const s2 = s1.add(2)
      const s3 = s2.add(3)
      expect(s0.size).toBe(0)
      expect(s1.size).toBe(1)
      expect(s2.size).toBe(2)
      expect(s3.size).toBe(3)
      expect(s1.has(1)).toBe(true)
      expect(s1.has(2)).toBe(false)
      expect(s2.has(1)).toBe(true)
      expect(s2.has(2)).toBe(true)
      expect(s3.has(1)).toBe(true)
      expect(s3.has(2)).toBe(true)
      expect(s3.has(3)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes a value', () => {
      const set = createSet<string>().add('a').add('b').delete('a')
      expect(set.size).toBe(1)
      expect(set.has('a')).toBe(false)
      expect(set.has('b')).toBe(true)
    })

    it('returns a new set, leaving original unchanged', () => {
      const original = createSet<string>().add('a').add('b')
      const modified = original.delete('a')
      expect(original.size).toBe(2)
      expect(original.has('a')).toBe(true)
      expect(modified.size).toBe(1)
      expect(modified.has('a')).toBe(false)
    })

    it('returns same reference when deleting non-existent value', () => {
      const set = createSet<string>().add('a')
      const result = set.delete('z')
      expect(result).toBe(set)
    })

    it('delete from single-element set results in empty', () => {
      const set = createSet<string>().add('a').delete('a')
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('delete all elements results in empty set', () => {
      const set = createSet<number>().add(1).add(2).add(3).delete(1).delete(2).delete(3)
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('delete preserves other elements', () => {
      const set = createSet<number>().add(1).add(2).add(3).add(4).add(5).delete(3)
      expect(set.size).toBe(4)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(3)).toBe(false)
      expect(set.has(4)).toBe(true)
      expect(set.has(5)).toBe(true)
    })

    it('delete from empty set returns same reference', () => {
      const empty = createSet<number>()
      const result = empty.delete(1)
      expect(result).toBe(empty)
    })
  })

  describe('has', () => {
    it('returns false for empty set', () => {
      const set = createSet<string>()
      expect(set.has('a')).toBe(false)
    })

    it('returns true for existing value', () => {
      const set = createSet<string>().add('a')
      expect(set.has('a')).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const set = createSet<string>().add('a')
      expect(set.has('b')).toBe(false)
    })

    it('returns correct results after multiple adds', () => {
      const set = createSet<number>().add(1).add(2).add(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(3)).toBe(true)
      expect(set.has(4)).toBe(false)
    })

    it('returns correct results after delete', () => {
      const set = createSet<number>().add(1).add(2).add(3).delete(2)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(false)
      expect(set.has(3)).toBe(true)
    })
  })

  describe('min/max', () => {
    it('min returns undefined for empty set', () => {
      const set = createSet<number>()
      expect(set.min).toBeUndefined()
    })

    it('max returns undefined for empty set', () => {
      const set = createSet<number>()
      expect(set.max).toBeUndefined()
    })

    it('min returns single element', () => {
      const set = createSet<number>().add(5)
      expect(set.min).toBe(5)
    })

    it('max returns single element', () => {
      const set = createSet<number>().add(5)
      expect(set.max).toBe(5)
    })

    it('min returns smallest element', () => {
      const set = createSet<number>().add(5).add(3).add(8).add(1).add(9)
      expect(set.min).toBe(1)
    })

    it('max returns largest element', () => {
      const set = createSet<number>().add(5).add(3).add(8).add(1).add(9)
      expect(set.max).toBe(9)
    })

    it('min and max work with strings', () => {
      const set = createSet<string>().add('cherry').add('apple').add('banana')
      expect(set.min).toBe('apple')
      expect(set.max).toBe('cherry')
    })

    it('min/max update after delete', () => {
      const set = createSet<number>().add(1).add(5).add(10).delete(1)
      expect(set.min).toBe(5)
      expect(set.max).toBe(10)
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty set', () => {
      const set = createSet<number>()
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates over single element', () => {
      const set = createSet<number>().add(42)
      const result: number[] = []
      set.forEach((v) => { result.push(v) })
      expect(result).toEqual([42])
    })

    it('iterates in sorted order', () => {
      const set = createSet<number>().add(3).add(1).add(2)
      const result: number[] = []
      set.forEach((v) => { result.push(v) })
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const set = createSet<string>().add('c').add('a').add('b')
      const indices: number[] = []
      set.forEach((_v, idx) => { indices.push(idx) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides the set as third argument', () => {
      const set = createSet<number>().add(1)
      let ref: PersistentSet<number> | undefined
      set.forEach((_v, _i, s) => { ref = s })
      expect(ref).toBe(set)
    })

    it('iterates over many elements', () => {
      const set = createSet<number>()
      let s = set
      for (let i = 20; i >= 1; i--) {
        s = s.add(i)
      }
      const result: number[] = []
      s.forEach((v) => { result.push(v) })
      expect(result).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = createSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const set = createSet<number>().add(1)
      expect(set.toArray()).toEqual([1])
    })

    it('returns sorted array', () => {
      const set = createSet<number>().add(3).add(1).add(2)
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('returns new array each time', () => {
      const set = createSet<number>().add(1)
      const arr1 = set.toArray()
      const arr2 = set.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('size/isEmpty', () => {
    it('empty set has size 0', () => {
      expect(createSet<number>().size).toBe(0)
    })

    it('empty set isEmpty is true', () => {
      expect(createSet<number>().isEmpty).toBe(true)
    })

    it('non-empty set isEmpty is false', () => {
      expect(createSet<number>().add(1).isEmpty).toBe(false)
    })

    it('size reflects number of unique elements', () => {
      const set = createSet<number>().add(1).add(2).add(3)
      expect(set.size).toBe(3)
    })

    it('size does not count duplicates', () => {
      const set = createSet<number>().add(1).add(1).add(1)
      expect(set.size).toBe(1)
    })

    it('size decreases after delete', () => {
      const set = createSet<number>().add(1).add(2).add(3).delete(2)
      expect(set.size).toBe(2)
    })
  })

  describe('from factory', () => {
    it('creates set from array', () => {
      const set = PersistentSet.from([1, 2, 3])
      expect(set.size).toBe(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(3)).toBe(true)
    })

    it('creates set from empty array', () => {
      const set = PersistentSet.from<number>([])
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('deduplicates input array', () => {
      const set = PersistentSet.from([1, 2, 2, 3, 3, 3])
      expect(set.size).toBe(3)
    })

    it('creates set with custom comparator', () => {
      const set = PersistentSet.from([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(set.toArray()).toEqual([3, 2, 1])
    })

    it('creates set from iterable', () => {
      function* gen() {
        yield 'a'
        yield 'b'
        yield 'c'
      }
      const set = PersistentSet.from(gen())
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('creates set from Set', () => {
      const native = new Set([1, 2, 3])
      const set = PersistentSet.from(native)
      expect(set.size).toBe(3)
    })
  })

  describe('set operations', () => {
    describe('union', () => {
      it('union of two empty sets is empty', () => {
        const s1 = createSet<number>()
        const s2 = createSet<number>()
        const result = s1.union(s2)
        expect(result.size).toBe(0)
        expect(result.isEmpty).toBe(true)
      })

      it('union of empty and non-empty set', () => {
        const s1 = createSet<number>()
        const s2 = createSet<number>().add(1).add(2)
        const result = s1.union(s2)
        expect(result.size).toBe(2)
        expect(result.has(1)).toBe(true)
        expect(result.has(2)).toBe(true)
      })

      it('union of non-empty and empty set', () => {
        const s1 = createSet<number>().add(1).add(2)
        const s2 = createSet<number>()
        const result = s1.union(s2)
        expect(result.size).toBe(2)
      })

      it('union of two sets with no overlap', () => {
        const s1 = createSet<number>().add(1).add(2)
        const s2 = createSet<number>().add(3).add(4)
        const result = s1.union(s2)
        expect(result.size).toBe(4)
        expect(result.toArray()).toEqual([1, 2, 3, 4])
      })

      it('union of two sets with overlap', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(2).add(3).add(4)
        const result = s1.union(s2)
        expect(result.size).toBe(4)
        expect(result.toArray()).toEqual([1, 2, 3, 4])
      })

      it('union of identical sets', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(1).add(2).add(3)
        const result = s1.union(s2)
        expect(result.size).toBe(3)
      })

      it('union does not modify original sets', () => {
        const s1 = createSet<number>().add(1).add(2)
        const s2 = createSet<number>().add(3).add(4)
        const result = s1.union(s2)
        expect(s1.size).toBe(2)
        expect(s2.size).toBe(2)
        expect(result.size).toBe(4)
      })
    })

    describe('intersection', () => {
      it('intersection of two empty sets is empty', () => {
        const s1 = createSet<number>()
        const s2 = createSet<number>()
        const result = s1.intersection(s2)
        expect(result.size).toBe(0)
      })

      it('intersection of empty and non-empty set', () => {
        const s1 = createSet<number>()
        const s2 = createSet<number>().add(1).add(2)
        const result = s1.intersection(s2)
        expect(result.size).toBe(0)
      })

      it('intersection of non-empty and empty set', () => {
        const s1 = createSet<number>().add(1).add(2)
        const s2 = createSet<number>()
        const result = s1.intersection(s2)
        expect(result.size).toBe(0)
      })

      it('intersection of two sets with overlap', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(2).add(3).add(4)
        const result = s1.intersection(s2)
        expect(result.size).toBe(2)
        expect(result.has(2)).toBe(true)
        expect(result.has(3)).toBe(true)
      })

      it('intersection of two sets with no overlap', () => {
        const s1 = createSet<number>().add(1).add(2)
        const s2 = createSet<number>().add(3).add(4)
        const result = s1.intersection(s2)
        expect(result.size).toBe(0)
      })

      it('intersection of identical sets', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(1).add(2).add(3)
        const result = s1.intersection(s2)
        expect(result.size).toBe(3)
      })

      it('intersection does not modify original sets', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(2).add(3).add(4)
        const result = s1.intersection(s2)
        expect(s1.size).toBe(3)
        expect(s2.size).toBe(3)
        expect(result.size).toBe(2)
      })
    })

    describe('difference', () => {
      it('difference of two empty sets is empty', () => {
        const s1 = createSet<number>()
        const s2 = createSet<number>()
        const result = s1.difference(s2)
        expect(result.size).toBe(0)
      })

      it('difference of empty and non-empty set', () => {
        const s1 = createSet<number>()
        const s2 = createSet<number>().add(1).add(2)
        const result = s1.difference(s2)
        expect(result.size).toBe(0)
      })

      it('difference of non-empty and empty set', () => {
        const s1 = createSet<number>().add(1).add(2)
        const s2 = createSet<number>()
        const result = s1.difference(s2)
        expect(result.size).toBe(2)
      })

      it('difference of two sets', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(2).add(3).add(4)
        const result = s1.difference(s2)
        expect(result.size).toBe(1)
        expect(result.has(1)).toBe(true)
        expect(result.has(2)).toBe(false)
      })

      it('difference of identical sets is empty', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(1).add(2).add(3)
        const result = s1.difference(s2)
        expect(result.size).toBe(0)
      })

      it('difference does not modify original sets', () => {
        const s1 = createSet<number>().add(1).add(2).add(3)
        const s2 = createSet<number>().add(2).add(3)
        const result = s1.difference(s2)
        expect(s1.size).toBe(3)
        expect(s2.size).toBe(2)
        expect(result.size).toBe(1)
      })
    })
  })

  describe('persistence verification', () => {
    it('add does not modify original', () => {
      const s0 = createSet<number>().add(1).add(2)
      const s1 = s0.add(3)
      expect(s0.size).toBe(2)
      expect(s0.has(3)).toBe(false)
      expect(s1.size).toBe(3)
      expect(s1.has(3)).toBe(true)
    })

    it('delete does not modify original', () => {
      const s0 = createSet<number>().add(1).add(2).add(3)
      const s1 = s0.delete(2)
      expect(s0.size).toBe(3)
      expect(s0.has(2)).toBe(true)
      expect(s1.size).toBe(2)
      expect(s1.has(2)).toBe(false)
    })

    it('multiple versions are independent', () => {
      const v0 = createSet<number>()
      const v1 = v0.add(1)
      const v2 = v1.add(2)
      const v3 = v2.add(3)
      expect(v0.size).toBe(0)
      expect(v1.size).toBe(1)
      expect(v2.size).toBe(2)
      expect(v3.size).toBe(3)
      expect(v0.has(1)).toBe(false)
      expect(v1.has(2)).toBe(false)
      expect(v2.has(3)).toBe(false)
    })

    it('deleted elements persist in older versions', () => {
      const v0 = createSet<number>().add(1).add(2).add(3)
      const v1 = v0.delete(2)
      expect(v0.has(2)).toBe(true)
      expect(v1.has(2)).toBe(false)
      expect(v0.toArray()).toEqual([1, 2, 3])
      expect(v1.toArray()).toEqual([1, 3])
    })

    it('branching history from same base', () => {
      const base = createSet<number>().add(1).add(2).add(3)
      const branchA = base.add(10).add(20)
      const branchB = base.delete(2).add(30)
      expect(base.size).toBe(3)
      expect(base.toArray()).toEqual([1, 2, 3])
      expect(branchA.size).toBe(5)
      expect(branchA.has(10)).toBe(true)
      expect(branchA.has(20)).toBe(true)
      expect(branchA.has(30)).toBe(false)
      expect(branchB.size).toBe(3)
      expect(branchB.has(2)).toBe(false)
      expect(branchB.has(30)).toBe(true)
      expect(branchB.has(10)).toBe(false)
    })

    it('diamond pattern: merge from two branches', () => {
      const base = createSet<number>().add(1).add(2)
      const left = base.add(3)
      const right = base.add(4)
      const merged = left.union(right)
      expect(merged.size).toBe(4)
      expect(merged.has(1)).toBe(true)
      expect(merged.has(2)).toBe(true)
      expect(merged.has(3)).toBe(true)
      expect(merged.has(4)).toBe(true)
      expect(base.size).toBe(2)
      expect(left.size).toBe(3)
      expect(right.size).toBe(3)
    })

    it('triple branch from single point', () => {
      const base = createSet<string>().add('root')
      const b1 = base.add('a')
      const b2 = base.add('b')
      const b3 = base.add('c')
      expect(base.size).toBe(1)
      expect(b1.size).toBe(2)
      expect(b2.size).toBe(2)
      expect(b3.size).toBe(2)
      expect(b1.has('a')).toBe(true)
      expect(b1.has('b')).toBe(false)
      expect(b2.has('b')).toBe(true)
      expect(b2.has('a')).toBe(false)
      expect(b3.has('c')).toBe(true)
      expect(b3.has('a')).toBe(false)
    })

    it('version chain with interleaved deletes', () => {
      const v0 = createSet<number>().add(1).add(2).add(3).add(4).add(5)
      const v1 = v0.add(6)
      const v2 = v1.delete(3)
      const v3 = v2.add(7)
      const v4 = v3.delete(1)
      expect(v0.size).toBe(5)
      expect(v0.has(6)).toBe(false)
      expect(v1.size).toBe(6)
      expect(v1.has(3)).toBe(true)
      expect(v2.size).toBe(5)
      expect(v2.has(3)).toBe(false)
      expect(v2.has(6)).toBe(true)
      expect(v3.size).toBe(6)
      expect(v3.has(7)).toBe(true)
      expect(v3.has(3)).toBe(false)
      expect(v4.size).toBe(5)
      expect(v4.has(1)).toBe(false)
      expect(v4.has(7)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('empty set', () => {
      const set = createSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
      expect(set.toArray()).toEqual([])
      expect(set.min).toBeUndefined()
      expect(set.max).toBeUndefined()
      expect(set.has(1)).toBe(false)
    })

    it('single element', () => {
      const set = createSet<number>().add(42)
      expect(set.size).toBe(1)
      expect(set.isEmpty).toBe(false)
      expect(set.toArray()).toEqual([42])
      expect(set.min).toBe(42)
      expect(set.max).toBe(42)
    })

    it('duplicate rejection maintains size', () => {
      const set = createSet<number>().add(1).add(1).add(1).add(1)
      expect(set.size).toBe(1)
    })

    it('add after delete', () => {
      const set = createSet<number>().add(1).add(2).delete(1).add(1)
      expect(set.size).toBe(2)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
    })

    it('delete after add same value', () => {
      const set = createSet<number>().add(1).delete(1)
      expect(set.size).toBe(0)
      expect(set.isEmpty).toBe(true)
    })

    it('handles string values', () => {
      const set = createSet<string>()
        .add('alpha').add('beta').add('gamma').add('delta')
      expect(set.size).toBe(4)
      expect(set.min).toBe('alpha')
      expect(set.max).toBe('gamma')
    })

    it('handles zero correctly', () => {
      const set = createSet<number>().add(0)
      expect(set.has(0)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles negative numbers', () => {
      const set = createSet<number>().add(-100).add(-1).add(0).add(1).add(100)
      expect(set.min).toBe(-100)
      expect(set.max).toBe(100)
      expect(set.size).toBe(5)
    })

    it('handles fractional numbers', () => {
      const set = createSet<number>().add(0.5).add(1.5).add(-0.5)
      expect(set.size).toBe(3)
      expect(set.has(0.5)).toBe(true)
      expect(set.has(1.5)).toBe(true)
      expect(set.has(-0.5)).toBe(true)
    })
  })

  describe('large sets', () => {
    it('handles 10000 sequential inserts', () => {
      let set = createSet<number>()
      for (let i = 0; i < 10000; i++) {
        set = set.add(i)
      }
      expect(set.size).toBe(10000)
      expect(set.has(0)).toBe(true)
      expect(set.has(9999)).toBe(true)
      expect(set.has(5000)).toBe(true)
      expect(set.min).toBe(0)
      expect(set.max).toBe(9999)
    })

    it('handles 10000 reverse sequential inserts', () => {
      let set = createSet<number>()
      for (let i = 9999; i >= 0; i--) {
        set = set.add(i)
      }
      expect(set.size).toBe(10000)
      expect(set.min).toBe(0)
      expect(set.max).toBe(9999)
    })

    it('handles 10000 random-like inserts', () => {
      let set = createSet<number>()
      const values: number[] = []
      for (let i = 0; i < 10000; i++) {
        const v = (i * 7919) % 10000
        values.push(v)
        set = set.add(v)
      }
      expect(set.size).toBeLessThanOrEqual(10000)
      for (const v of values) {
        expect(set.has(v)).toBe(true)
      }
    })

    it('handles 10000 deletes', () => {
      let set = createSet<number>()
      for (let i = 0; i < 10000; i++) {
        set = set.add(i)
      }
      expect(set.size).toBe(10000)
      for (let i = 0; i < 5000; i++) {
        set = set.delete(i)
      }
      expect(set.size).toBe(5000)
      expect(set.has(0)).toBe(false)
      expect(set.has(4999)).toBe(false)
      expect(set.has(5000)).toBe(true)
      expect(set.has(9999)).toBe(true)
    })

    it('persists through large operations', () => {
      let set = createSet<number>()
      for (let i = 0; i < 1000; i++) {
        set = set.add(i)
      }
      const snapshot = set
      for (let i = 1000; i < 2000; i++) {
        set = set.add(i)
      }
      expect(snapshot.size).toBe(1000)
      expect(snapshot.has(999)).toBe(true)
      expect(snapshot.has(1000)).toBe(false)
      expect(set.size).toBe(2000)
    })

    it('toArray returns sorted for large set', () => {
      let set = createSet<number>()
      for (let i = 1000; i >= 1; i--) {
        set = set.add(i)
      }
      const arr = set.toArray()
      expect(arr).toEqual(Array.from({ length: 1000 }, (_, i) => i + 1))
    })

    it('set operations on large sets', () => {
      let s1 = createSet<number>()
      let s2 = createSet<number>()
      for (let i = 0; i < 5000; i++) {
        s1 = s1.add(i)
        s2 = s2.add(i + 3000)
      }
      const unionResult = s1.union(s2)
      expect(unionResult.size).toBe(8000)
      const intersectionResult = s1.intersection(s2)
      expect(intersectionResult.size).toBe(2000)
      const diffResult = s1.difference(s2)
      expect(diffResult.size).toBe(3000)
    })
  })

  describe('stats', () => {
    it('returns stats for empty set', () => {
      const set = createSet<number>()
      const stats = set.stats()
      expect(stats.size).toBe(0)
      expect(stats.height).toBe(0)
    })

    it('returns stats for single element', () => {
      const set = createSet<number>().add(1)
      const stats = set.stats()
      expect(stats.size).toBe(1)
      expect(stats.height).toBe(1)
    })

    it('returns stats for multiple elements', () => {
      const set = createSet<number>().add(1).add(2).add(3).add(4).add(5)
      const stats = set.stats()
      expect(stats.size).toBe(5)
      expect(stats.height).toBeGreaterThan(0)
      expect(stats.height).toBeLessThanOrEqual(5)
    })

    it('height is balanced for large sets', () => {
      let set = createSet<number>()
      for (let i = 0; i < 10000; i++) {
        set = set.add(i)
      }
      const stats = set.stats()
      expect(stats.size).toBe(10000)
      expect(stats.height).toBeLessThanOrEqual(20)
    })

    it('stats are independent per version', () => {
      const s0 = createSet<number>()
      const s1 = s0.add(1)
      const s2 = s1.add(2).add(3)
      expect(s0.stats().size).toBe(0)
      expect(s1.stats().size).toBe(1)
      expect(s2.stats().size).toBe(3)
    })
  })

  describe('iterator', () => {
    it('iterates over empty set', () => {
      const set = createSet<number>()
      const result: number[] = []
      for (const v of set) {
        result.push(v)
      }
      expect(result).toEqual([])
    })

    it('iterates in sorted order', () => {
      const set = createSet<number>().add(3).add(1).add(2)
      const result: number[] = []
      for (const v of set) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('spread operator works', () => {
      const set = createSet<number>().add(1).add(2).add(3)
      expect([...set]).toEqual([1, 2, 3])
    })
  })

  describe('custom comparator', () => {
    it('reverse comparator orders elements descending', () => {
      const set = createReverseSet<number>().add(1).add(2).add(3)
      expect(set.toArray()).toEqual([3, 2, 1])
    })

    it('reverse comparator min/max', () => {
      const set = createReverseSet<number>().add(1).add(2).add(3)
      expect(set.min).toBe(3)
      expect(set.max).toBe(1)
    })

    it('case-insensitive string comparator', () => {
      const set = new PersistentSet<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      const s1 = set.add('Hello').add('hello')
      expect(s1.size).toBe(1)
    })

    it('custom object comparator', () => {
      interface Point { x: number; y: number }
      const set = new PersistentSet<Point>({
        comparator: (a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y,
      })
      const p1: Point = { x: 1, y: 2 }
      const p2: Point = { x: 3, y: 4 }
      const s1 = set.add(p1).add(p2)
      expect(s1.size).toBe(2)
      expect(s1.has(p1)).toBe(true)
      expect(s1.has(p2)).toBe(true)
    })

    it('comparator is preserved across operations', () => {
      const set = createReverseSet<number>()
      const s1 = set.add(1).add(2).add(3)
      const s2 = s1.delete(2)
      const s3 = s2.add(0)
      expect(s3.toArray()).toEqual([3, 1, 0])
    })
  })

  describe('additional edge cases', () => {
    it('add and delete same value multiple times', () => {
      let set = createSet<number>()
      set = set.add(1)
      expect(set.size).toBe(1)
      set = set.add(1)
      expect(set.size).toBe(1)
      set = set.delete(1)
      expect(set.size).toBe(0)
      set = set.delete(1)
      expect(set.size).toBe(0)
      set = set.add(1)
      expect(set.size).toBe(1)
    })

    it('large set forEach counts correctly', () => {
      let set = createSet<number>()
      for (let i = 0; i < 1000; i++) {
        set = set.add(i)
      }
      let count = 0
      set.forEach(() => { count++ })
      expect(count).toBe(1000)
    })

    it('from with duplicates preserves order of first occurrence', () => {
      const set = PersistentSet.from([5, 3, 1, 3, 5, 1])
      expect(set.size).toBe(3)
      expect(set.toArray()).toEqual([1, 3, 5])
    })

    it('empty string as value', () => {
      const set = createSet<string>().add('')
      expect(set.has('')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('NaN handling with default comparator', () => {
      const set = createSet<number>().add(NaN)
      expect(set.size).toBe(1)
      expect(set.has(NaN)).toBe(true)
    })

    it('forEach on set from factory', () => {
      const set = PersistentSet.from([3, 1, 4, 1, 5, 9, 2, 6])
      const result: number[] = []
      set.forEach((v) => { result.push(v) })
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('min/max after re-adding deleted element', () => {
      const set = createSet<number>().add(1).add(5).add(10).delete(1).add(1)
      expect(set.min).toBe(1)
      expect(set.max).toBe(10)
    })

    it('stats height is 0 for empty, 1 for single', () => {
      const empty = createSet<number>()
      expect(empty.stats().height).toBe(0)
      const single = empty.add(42)
      expect(single.stats().height).toBe(1)
    })
  })

  describe('persistence stress test', () => {
    it('all intermediate versions remain valid', () => {
      const versions: PersistentSet<number>[] = []
      let current = createSet<number>()
      versions.push(current)
      for (let i = 0; i < 100; i++) {
        current = current.add(i)
        versions.push(current)
      }
      for (let i = 0; i <= 100; i++) {
        expect(versions[i]!.size).toBe(i)
        for (let j = 0; j < i; j++) {
          expect(versions[i]!.has(j)).toBe(true)
        }
        for (let j = i; j < 100; j++) {
          expect(versions[i]!.has(j)).toBe(false)
        }
      }
    })

    it('branching with deletes preserves all versions', () => {
      const base = createSet<number>()
      let set = base
      for (let i = 0; i < 50; i++) {
        set = set.add(i)
      }
      const branch1 = set
      const branch2 = set.delete(25)
      const branch3 = set.delete(10).delete(20).delete(30)
      expect(branch1.size).toBe(50)
      expect(branch2.size).toBe(49)
      expect(branch3.size).toBe(47)
      expect(branch1.has(25)).toBe(true)
      expect(branch2.has(25)).toBe(false)
      expect(branch3.has(10)).toBe(false)
      expect(branch3.has(20)).toBe(false)
      expect(branch3.has(30)).toBe(false)
    })
  })
})
