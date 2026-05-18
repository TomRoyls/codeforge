import { describe, it, expect, beforeEach } from 'vitest'
import { AtomicSet2 } from '../../src/core/atomic-set-2/index.js'

describe('AtomicSet2', () => {
  // ─── add / has ───
  describe('add and has', () => {
    let set: AtomicSet2<string>

    beforeEach(() => {
      set = new AtomicSet2<string>()
    })

    it('adds an item and reports it present', () => {
      expect(set.add('a')).toBe(true)
      expect(set.has('a')).toBe(true)
    })

    it('returns false when adding duplicate', () => {
      set.add('a')
      expect(set.add('a')).toBe(false)
    })

    it('has returns false for missing item', () => {
      expect(set.has('missing')).toBe(false)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    let set: AtomicSet2<number>

    beforeEach(() => {
      set = new AtomicSet2<number>()
      set.add(1)
      set.add(2)
    })

    it('deletes existing item and returns true', () => {
      expect(set.delete(1)).toBe(true)
      expect(set.has(1)).toBe(false)
    })

    it('returns false for missing item', () => {
      expect(set.delete(99)).toBe(false)
    })

    it('size decreases after delete', () => {
      set.delete(1)
      expect(set.size).toBe(1)
    })
  })

  // ─── compareAndSwap ───
  describe('compareAndSwap', () => {
    let set: AtomicSet2<string>

    beforeEach(() => {
      set = new AtomicSet2<string>()
      set.add('old')
    })

    it('swaps existing value for new value', () => {
      expect(set.compareAndSwap('old', 'new')).toBe(true)
      expect(set.has('old')).toBe(false)
      expect(set.has('new')).toBe(true)
    })

    it('returns false if expected value not present', () => {
      expect(set.compareAndSwap('missing', 'new')).toBe(false)
    })

    it('returns false if expected equals newValue', () => {
      expect(set.compareAndSwap('old', 'old')).toBe(false)
    })

    it('size stays the same after successful swap', () => {
      set.compareAndSwap('old', 'new')
      expect(set.size).toBe(1)
    })
  })

  // ─── size / isEmpty ───
  describe('size and isEmpty', () => {
    it('size is 0 for new set', () => {
      const set = new AtomicSet2<number>()
      expect(set.size).toBe(0)
    })

    it('isEmpty returns true for new set', () => {
      const set = new AtomicSet2<number>()
      expect(set.isEmpty()).toBe(true)
    })

    it('size tracks additions and deletions', () => {
      const set = new AtomicSet2<string>()
      set.add('a')
      set.add('b')
      expect(set.size).toBe(2)
      set.delete('a')
      expect(set.size).toBe(1)
    })
  })

  // ─── toArray / clear ───
  describe('toArray and clear', () => {
    it('toArray returns array of all items', () => {
      const set = new AtomicSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const arr = set.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
    })

    it('clear removes all items', () => {
      const set = new AtomicSet2<string>()
      set.add('a')
      set.add('b')
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('clear allows reuse', () => {
      const set = new AtomicSet2<string>()
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.has('b')).toBe(true)
      expect(set.has('a')).toBe(false)
    })
  })

  // ─── forEach ───
  describe('forEach', () => {
    it('iterates over all items', () => {
      const set = new AtomicSet2<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      const collected: number[] = []
      set.forEach((item) => collected.push(item))
      expect(collected.sort()).toEqual([10, 20, 30])
    })

    it('does not iterate on empty set', () => {
      const set = new AtomicSet2<number>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── Set operations ───
  describe('set operations', () => {
    let setA: AtomicSet2<number>
    let setB: AtomicSet2<number>

    beforeEach(() => {
      setA = new AtomicSet2<number>()
      setB = new AtomicSet2<number>()
      setA.add(1)
      setA.add(2)
      setA.add(3)
      setB.add(2)
      setB.add(3)
      setB.add(4)
    })

    it('union returns all items from both sets', () => {
      const result = setA.union(setB)
      expect(result.toArray().sort()).toEqual([1, 2, 3, 4])
    })

    it('intersection returns common items', () => {
      const result = setA.intersection(setB)
      expect(result.toArray().sort()).toEqual([2, 3])
    })

    it('difference returns items in A not in B', () => {
      const result = setA.difference(setB)
      expect(result.toArray().sort()).toEqual([1])
    })

    it('union does not modify original sets', () => {
      setA.union(setB)
      expect(setA.size).toBe(3)
      expect(setB.size).toBe(3)
    })

    it('intersection of disjoint sets is empty', () => {
      const setC = new AtomicSet2<number>()
      setC.add(10)
      const result = setA.intersection(setC)
      expect(result.isEmpty()).toBe(true)
    })

    it('difference with empty set returns original', () => {
      const empty = new AtomicSet2<number>()
      const result = setA.difference(empty)
      expect(result.toArray().sort()).toEqual([1, 2, 3])
    })
  })
})
