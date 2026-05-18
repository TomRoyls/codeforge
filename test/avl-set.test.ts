import { AVLSet } from '../src/core/avl-set/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('AVLSet', () => {
  describe('constructor', () => {
    it('creates an empty set with default number comparator', () => {
      const set = new AVLSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates a set with a custom string comparator', () => {
      const set = new AVLSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      set.add('banana')
      set.add('apple')
      set.add('cherry')
      expect(set.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('creates a set with reverse order comparator', () => {
      const set = new AVLSet<number>({ comparator: (a, b) => b - a })
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── add ─────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a value to an empty set and returns true', () => {
      const set = new AVLSet<number>()
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.has(5)).toBe(true)
    })

    it('returns false when adding a duplicate value', () => {
      const set = new AVLSet<number>()
      expect(set.add(5)).toBe(true)
      expect(set.add(5)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('adds multiple values and maintains sorted order', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(1)
      set.add(4)
      set.add(1)
      set.add(5)
      set.add(9)
      set.add(2)
      set.add(6)
      expect(set.size).toBe(7)
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('maintains sorted order after descending insertions', () => {
      const set = new AVLSet<number>()
      for (let i = 20; i >= 0; i--) {
        set.add(i)
      }
      expect(set.toArray()).toEqual(Array.from({ length: 21 }, (_, i) => i))
    })

    it('handles adding negative numbers', () => {
      const set = new AVLSet<number>()
      set.add(-5)
      set.add(-10)
      set.add(0)
      set.add(5)
      set.add(10)
      expect(set.toArray()).toEqual([-10, -5, 0, 5, 10])
    })

    it('handles adding zero', () => {
      const set = new AVLSet<number>()
      set.add(0)
      expect(set.has(0)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('does not increase size on duplicate adds', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })
  })

  // ─── has ─────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for a value in the set', () => {
      const set = new AVLSet<number>()
      set.add(42)
      expect(set.has(42)).toBe(true)
    })

    it('returns false for a value not in the set', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.has(99)).toBe(false)
    })

    it('returns false on an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.has(1)).toBe(false)
    })

    it('finds values after many insertions', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      expect(set.has(0)).toBe(true)
      expect(set.has(50)).toBe(true)
      expect(set.has(99)).toBe(true)
      expect(set.has(100)).toBe(false)
    })

    it('still finds values after deletions', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(false)
      expect(set.has(3)).toBe(true)
    })
  })

  // ─── delete ──────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes a value and returns true', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.delete(5)).toBe(true)
      expect(set.size).toBe(0)
      expect(set.has(5)).toBe(false)
    })

    it('returns false when deleting a value not in the set', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.delete(99)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('returns false when deleting from an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('removes the root node', () => {
      const set = new AVLSet<number>()
      set.add(2)
      set.add(1)
      set.add(3)
      expect(set.delete(2)).toBe(true)
      expect(set.toArray()).toEqual([1, 3])
    })

    it('removes a leaf node', () => {
      const set = new AVLSet<number>()
      set.add(2)
      set.add(1)
      set.add(3)
      expect(set.delete(1)).toBe(true)
      expect(set.toArray()).toEqual([2, 3])
    })

    it('removes all elements one by one', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.delete(2)).toBe(true)
      expect(set.delete(1)).toBe(true)
      expect(set.delete(3)).toBe(true)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('maintains sorted order after deletions', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 10; i++) set.add(i)
      set.delete(3)
      set.delete(7)
      set.delete(0)
      set.delete(9)
      expect(set.toArray()).toEqual([1, 2, 4, 5, 6, 8])
    })

    it('handles deleting a node with one child', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(6)
      expect(set.delete(7)).toBe(true)
      expect(set.toArray()).toEqual([3, 5, 6])
    })

    it('double delete returns false second time', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.delete(1)).toBe(false)
    })
  })

  // ─── size ────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.size).toBe(0)
    })

    it('returns 1 after a single add', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('tracks size incrementally', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
        expect(set.size).toBe(i + 1)
      }
    })

    it('decreases after deletions', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
      set.delete(2)
      expect(set.size).toBe(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })

    it('reports zero after clear', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 10; i++) set.add(i)
      set.clear()
      expect(set.size).toBe(0)
    })
  })

  // ─── isEmpty ─────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for a new set', () => {
      expect(new AVLSet<number>().isEmpty()).toBe(true)
    })

    it('returns false after adding an element', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('returns true after clearing all elements', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('returns true after all elements are deleted', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements from the set', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('does nothing on an already empty set', () => {
      const set = new AVLSet<number>()
      set.clear()
      expect(set.size).toBe(0)
    })

    it('allows adding elements after clearing', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.clear()
      set.add(2)
      expect(set.size).toBe(1)
      expect(set.has(2)).toBe(true)
      expect(set.has(1)).toBe(false)
    })

    it('clear and rebuild', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      set.add(10)
      set.add(20)
      expect(set.size).toBe(2)
      expect(set.toArray()).toEqual([10, 20])
    })
  })

  // ─── min ─────────────────────────────────────────────────────────────

  describe('min', () => {
    it('returns undefined on an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.min()).toBeUndefined()
    })

    it('returns the single element', () => {
      const set = new AVLSet<number>()
      set.add(42)
      expect(set.min()).toBe(42)
    })

    it('returns the smallest element', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(8)
      set.add(1)
      set.add(9)
      expect(set.min()).toBe(1)
    })

    it('updates after deletions', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(1)
      expect(set.min()).toBe(2)
    })
  })

  // ─── max ─────────────────────────────────────────────────────────────

  describe('max', () => {
    it('returns undefined on an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.max()).toBeUndefined()
    })

    it('returns the single element', () => {
      const set = new AVLSet<number>()
      set.add(42)
      expect(set.max()).toBe(42)
    })

    it('returns the largest element', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(8)
      set.add(1)
      set.add(9)
      expect(set.max()).toBe(9)
    })

    it('updates after deletions', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(3)
      expect(set.max()).toBe(2)
    })
  })

  // ─── floor ───────────────────────────────────────────────────────────

  describe('floor', () => {
    it('returns undefined on empty set', () => {
      const set = new AVLSet<number>()
      expect(set.floor(5)).toBeUndefined()
    })

    it('returns the value itself if it exists', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.floor(5)).toBe(5)
    })

    it('returns the largest value <= given value', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      set.add(7)
      expect(set.floor(4)).toBe(3)
    })

    it('returns undefined if all values are greater', () => {
      const set = new AVLSet<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      expect(set.floor(5)).toBeUndefined()
    })

    it('returns the exact match over a lower value', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect(set.floor(5)).toBe(5)
    })

    it('returns max for floor above max', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.floor(10)).toBe(5)
    })
  })

  // ─── ceiling ─────────────────────────────────────────────────────────

  describe('ceiling', () => {
    it('returns undefined on empty set', () => {
      const set = new AVLSet<number>()
      expect(set.ceiling(5)).toBeUndefined()
    })

    it('returns the value itself if it exists', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.ceiling(5)).toBe(5)
    })

    it('returns the smallest value >= given value', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      set.add(7)
      expect(set.ceiling(4)).toBe(5)
    })

    it('returns undefined if all values are smaller', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.ceiling(10)).toBeUndefined()
    })

    it('returns min for ceiling below min', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(5)
      expect(set.ceiling(2)).toBe(3)
    })
  })

  // ─── lower ───────────────────────────────────────────────────────────

  describe('lower', () => {
    it('returns undefined on empty set', () => {
      const set = new AVLSet<number>()
      expect(set.lower(5)).toBeUndefined()
    })

    it('returns the largest value strictly less than given value', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.lower(5)).toBe(3)
    })

    it('returns undefined if no value is strictly less', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(10)
      expect(set.lower(5)).toBeUndefined()
    })

    it('works with values not in the set', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect(set.lower(7)).toBe(5)
    })

    it('returns undefined for lower below min', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(5)
      expect(set.lower(2)).toBeUndefined()
    })
  })

  // ─── higher ──────────────────────────────────────────────────────────

  describe('higher', () => {
    it('returns undefined on empty set', () => {
      const set = new AVLSet<number>()
      expect(set.higher(5)).toBeUndefined()
    })

    it('returns the smallest value strictly greater than given value', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(3)
      set.add(5)
      expect(set.higher(3)).toBe(5)
    })

    it('returns undefined if no value is strictly greater', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(10)
      expect(set.higher(10)).toBeUndefined()
    })

    it('works with values not in the set', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect(set.higher(3)).toBe(5)
    })

    it('returns undefined for higher above max', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(3)
      expect(set.higher(4)).toBeUndefined()
    })
  })

  // ─── range ───────────────────────────────────────────────────────────

  describe('range', () => {
    it('yields values within the inclusive range', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.add(4)
      set.add(5)
      expect([...set.range(2, 4)]).toEqual([2, 3, 4])
    })

    it('yields nothing on an empty set', () => {
      const set = new AVLSet<number>()
      expect([...set.range(1, 10)]).toEqual([])
    })

    it('yields a single value when lo equals hi and value exists', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect([...set.range(2, 2)]).toEqual([2])
    })

    it('yields nothing when no values fall in range', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect([...set.range(10, 20)]).toEqual([])
    })

    it('yields values at the boundaries', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect([...set.range(1, 10)]).toEqual([1, 5, 10])
    })

    it('works as a generator with lazy iteration', () => {
      const set = new AVLSet<number>()
      for (let i = 1; i <= 100; i++) set.add(i)
      const gen = set.range(1, 3)
      expect(gen.next().value).toBe(1)
      expect(gen.next().value).toBe(2)
      expect(gen.next().value).toBe(3)
      expect(gen.next().done).toBe(true)
    })

    it('returns all values when range covers all elements', () => {
      const set = new AVLSet<number>()
      for (let i = 1; i <= 5; i++) set.add(i)
      expect([...set.range(1, 5)]).toEqual([1, 2, 3, 4, 5])
    })
  })

  // ─── indexOf ─────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns the index of a value in sorted order', () => {
      const set = new AVLSet<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      expect(set.indexOf(10)).toBe(0)
      expect(set.indexOf(20)).toBe(1)
      expect(set.indexOf(30)).toBe(2)
    })

    it('returns -1 for a value not in the set', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      expect(set.indexOf(99)).toBe(-1)
    })

    it('returns -1 on an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.indexOf(1)).toBe(-1)
    })

    it('returns correct index after deletions', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.add(4)
      set.add(5)
      set.delete(3)
      expect(set.indexOf(4)).toBe(2)
      expect(set.indexOf(5)).toBe(3)
    })

    it('returns correct indices for unsorted insertion order', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(1)
      set.add(5)
      set.add(2)
      set.add(4)
      expect(set.indexOf(1)).toBe(0)
      expect(set.indexOf(2)).toBe(1)
      expect(set.indexOf(3)).toBe(2)
      expect(set.indexOf(4)).toBe(3)
      expect(set.indexOf(5)).toBe(4)
    })
  })

  // ─── at ──────────────────────────────────────────────────────────────

  describe('at', () => {
    it('returns the value at the given index', () => {
      const set = new AVLSet<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      expect(set.at(0)).toBe(10)
      expect(set.at(1)).toBe(20)
      expect(set.at(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds index', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.at(1)).toBeUndefined()
      expect(set.at(100)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const set = new AVLSet<number>()
      set.add(1)
      expect(set.at(-1)).toBeUndefined()
    })

    it('returns undefined on an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.at(0)).toBeUndefined()
    })

    it('returns correct values after insertions and deletions', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
      set.delete(5)
      expect(set.at(0)).toBe(1)
      expect(set.at(1)).toBe(3)
      expect(set.at(2)).toBe(7)
      expect(set.at(3)).toBe(9)
    })
  })

  // ─── toArray ─────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns an empty array for an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('returns a new array each time', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      const a1 = set.toArray()
      const a2 = set.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('returns correct array after mixed operations', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(8)
      set.add(1)
      set.delete(3)
      expect(set.toArray()).toEqual([1, 5, 8])
    })

    it('handles many elements in sorted order', () => {
      const set = new AVLSet<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) set.add(v)
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── forEach ─────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements in sorted order', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      const results: Array<{ value: number; index: number }> = []
      set.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 1, index: 0 },
        { value: 2, index: 1 },
        { value: 3, index: 2 },
      ])
    })

    it('does not call callback on an empty set', () => {
      const set = new AVLSet<number>()
      let callCount = 0
      set.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('provides correct indices', () => {
      const set = new AVLSet<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      const indices: number[] = []
      set.forEach((_value, index) => {
        indices.push(index)
      })
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── Symbol.iterator ─────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over elements in sorted order', () => {
      const set = new AVLSet<number>()
      set.add(3)
      set.add(1)
      set.add(2)
      expect([...set]).toEqual([1, 2, 3])
    })

    it('yields nothing for an empty set', () => {
      const set = new AVLSet<number>()
      expect([...set]).toEqual([])
    })

    it('works with for-of loop', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      const result: number[] = []
      for (const v of set) {
        result.push(v)
      }
      expect(result).toEqual([3, 5, 7])
    })

    it('supports Array.from', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(Array.from(set)).toEqual([1, 2, 3])
    })
  })

  // ─── union ───────────────────────────────────────────────────────────

  describe('union', () => {
    it('returns a new set with all elements from both sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(2)
      b.add(3)
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify the original sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      b.add(2)
      a.union(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('returns a copy when unioned with an empty set', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('returns a copy when empty set is unioned with non-empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('union of two empty sets is empty', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      expect(a.union(b).size).toBe(0)
    })

    it('handles identical sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      const result = a.union(b)
      expect(result.toArray()).toEqual([1, 2, 3])
      expect(result.size).toBe(3)
    })

    it('returns a new independent set', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      b.add(2)
      const u = a.union(b)
      u.add(3)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
      expect(u.size).toBe(3)
    })
  })

  // ─── intersection ────────────────────────────────────────────────────

  describe('intersection', () => {
    it('returns common elements', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const result = a.intersection(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('returns empty set when no common elements', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(3)
      b.add(4)
      const result = a.intersection(b)
      expect(result.size).toBe(0)
    })

    it('returns empty set when intersecting with empty set', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('returns identical set when both sets are the same', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.intersection(b).toArray()).toEqual([1, 2, 3])
    })

    it('does not modify the original sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      a.intersection(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([1, 2])
    })
  })

  // ─── difference ──────────────────────────────────────────────────────

  describe('difference', () => {
    it('returns elements in self but not in other', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(2)
      b.add(3)
      b.add(4)
      const result = a.difference(b)
      expect(result.toArray()).toEqual([1])
    })

    it('returns a copy when sets are disjoint', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(3)
      b.add(4)
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('returns empty set when self is a subset of other', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.difference(b).size).toBe(0)
    })

    it('returns full set when other is empty', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      expect(a.difference(b).toArray()).toEqual([1, 2])
    })

    it('does not modify the original sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(2)
      b.add(3)
      a.difference(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2, 3])
    })
  })

  // ─── isSubsetOf ──────────────────────────────────────────────────────

  describe('isSubsetOf', () => {
    it('returns true when all elements are contained', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      b.add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for identical sets', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when some elements are not in other', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns true for empty set (empty is subset of anything)', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for two empty sets', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false when self has elements and other is empty', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  // ─── isSupersetOf ────────────────────────────────────────────────────

  describe('isSupersetOf', () => {
    it('returns true when self contains all elements of other', () => {
      const a = new AVLSet<number>()
      a.add(1)
      a.add(2)
      a.add(3)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false when self is missing elements', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      b.add(1)
      b.add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('returns true for empty other set', () => {
      const a = new AVLSet<number>()
      a.add(1)
      const b = new AVLSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true for two empty sets', () => {
      const a = new AVLSet<number>()
      const b = new AVLSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  // ─── isAVLBalanced ───────────────────────────────────────────────────

  describe('isAVLBalanced', () => {
    it('returns true for an empty set', () => {
      const set = new AVLSet<number>()
      expect(set.isAVLBalanced).toBe(true)
    })

    it('returns true for a single element', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('returns true after sequential insertions', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 100; i++) set.add(i)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('returns true after reverse sequential insertions', () => {
      const set = new AVLSet<number>()
      for (let i = 100; i >= 0; i--) set.add(i)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('returns true after mixed insertions and deletions', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 50; i++) set.add(i)
      for (let i = 10; i < 40; i++) set.delete(i)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('returns true while deleting all elements one by one', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 20; i++) set.add(i)
      for (let i = 0; i < 20; i++) {
        set.delete(i)
        expect(set.isAVLBalanced).toBe(true)
      }
    })
  })

  // ─── Custom Comparator ───────────────────────────────────────────────

  describe('custom comparator', () => {
    it('works with string values', () => {
      const set = new AVLSet<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      set.add('cherry')
      set.add('apple')
      set.add('banana')
      expect(set.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object values by key', () => {
      interface Item {
        id: number
        name: string
      }
      const set = new AVLSet<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      set.add({ id: 3, name: 'c' })
      set.add({ id: 1, name: 'a' })
      set.add({ id: 2, name: 'b' })
      expect(set.toArray().map((item) => item.name)).toEqual(['a', 'b', 'c'])
    })

    it('set operations preserve custom comparator', () => {
      const a = new AVLSet<string>({
        comparator: (x, y) => x.localeCompare(y),
      })
      a.add('b')
      a.add('a')
      const b = new AVLSet<string>({
        comparator: (x, y) => x.localeCompare(y),
      })
      b.add('c')
      b.add('a')
      const result = a.union(b)
      expect(result.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── Large Datasets ──────────────────────────────────────────────────

  describe('large datasets', () => {
    it('handles inserting 1000 elements', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      expect(set.size).toBe(1000)
      expect(set.min()).toBe(0)
      expect(set.max()).toBe(999)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('handles inserting elements in reverse order', () => {
      const set = new AVLSet<number>()
      for (let i = 999; i >= 0; i--) {
        set.add(i)
      }
      expect(set.size).toBe(1000)
      expect(set.toArray()[0]).toBe(0)
      expect(set.toArray()[999]).toBe(999)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('handles deleting many elements', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 500; i++) set.add(i)
      for (let i = 0; i < 250; i++) set.delete(i)
      expect(set.size).toBe(250)
      expect(set.min()).toBe(250)
      expect(set.max()).toBe(499)
      expect(set.isAVLBalanced).toBe(true)
    })

    it('handles random-looking insert pattern', () => {
      const set = new AVLSet<number>()
      const values = [7, 3, 9, 1, 5, 8, 10, 0, 2, 4, 6]
      for (const v of values) set.add(v)
      expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('range iteration over large dataset', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 100; i++) set.add(i)
      const ranged = [...set.range(20, 30)]
      expect(ranged).toEqual(Array.from({ length: 11 }, (_, i) => i + 20))
    })

    it('finds all elements in large set', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 100; i++) set.add(i)
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(true)
      }
      expect(set.has(100)).toBe(false)
    })

    it('deletes all elements from large set', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 50; i++) set.add(i)
      for (let i = 0; i < 50; i++) {
        expect(set.delete(i)).toBe(true)
      }
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── Edge Cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('add, delete, add same value', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.delete(5)).toBe(true)
      expect(set.add(5)).toBe(true)
      expect(set.has(5)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('floor and ceiling on a single-element set', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.floor(5)).toBe(5)
      expect(set.floor(10)).toBe(5)
      expect(set.floor(0)).toBeUndefined()
      expect(set.ceiling(5)).toBe(5)
      expect(set.ceiling(0)).toBe(5)
      expect(set.ceiling(10)).toBeUndefined()
    })

    it('lower and higher on a single-element set', () => {
      const set = new AVLSet<number>()
      set.add(5)
      expect(set.lower(5)).toBeUndefined()
      expect(set.lower(10)).toBe(5)
      expect(set.higher(5)).toBeUndefined()
      expect(set.higher(0)).toBe(5)
    })

    it('indexOf and at are consistent', () => {
      const set = new AVLSet<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      for (let i = 0; i < set.size; i++) {
        const value = set.at(i)!
        expect(set.indexOf(value)).toBe(i)
      }
    })

    it('toArray matches forEach order', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(8)
      set.add(1)
      set.add(9)
      const fromToArray = set.toArray()
      const fromForEach: number[] = []
      set.forEach((v) => fromForEach.push(v))
      expect(fromForEach).toEqual(fromToArray)
    })

    it('toArray matches iterator order', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(8)
      set.add(1)
      set.add(9)
      expect([...set]).toEqual(set.toArray())
    })

    it('handles negative numbers', () => {
      const set = new AVLSet<number>()
      set.add(-3)
      set.add(-1)
      set.add(-2)
      expect(set.toArray()).toEqual([-3, -2, -1])
      expect(set.min()).toBe(-3)
      expect(set.max()).toBe(-1)
    })

    it('handles mixed positive and negative numbers', () => {
      const set = new AVLSet<number>()
      set.add(-2)
      set.add(0)
      set.add(2)
      set.add(-1)
      set.add(1)
      expect(set.toArray()).toEqual([-2, -1, 0, 1, 2])
    })

    it('handles mixed operations', () => {
      const set = new AVLSet<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.delete(5)
      set.add(1)
      set.add(9)
      set.delete(3)
      expect(set.toArray()).toEqual([1, 7, 9])
    })

    it('handles repeated add and delete cycles', () => {
      const set = new AVLSet<number>()
      for (let i = 0; i < 10; i++) {
        expect(set.add(i)).toBe(true)
      }
      for (let i = 0; i < 10; i++) {
        expect(set.delete(i)).toBe(true)
      }
      for (let i = 0; i < 10; i++) {
        expect(set.add(i)).toBe(true)
      }
      expect(set.size).toBe(10)
    })

    it('consecutive floor and ceiling queries', () => {
      const set = new AVLSet<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      set.add(40)
      set.add(50)
      expect(set.floor(25)).toBe(20)
      expect(set.ceiling(25)).toBe(30)
      expect(set.lower(30)).toBe(20)
      expect(set.higher(30)).toBe(40)
    })

    it('floor and ceiling with exact match', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect(set.floor(5)).toBe(5)
      expect(set.ceiling(5)).toBe(5)
    })

    it('lower and higher with exact match', () => {
      const set = new AVLSet<number>()
      set.add(1)
      set.add(5)
      set.add(10)
      expect(set.lower(5)).toBe(1)
      expect(set.higher(5)).toBe(10)
    })
  })
})
