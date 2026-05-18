import { describe, it, expect } from 'vitest'
import { CuckooSet2 } from '../../src/core/cuckoo-set-2/index.js'

describe('CuckooSet2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates set with default capacity', () => {
      const set = new CuckooSet2<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates set with custom capacity', () => {
      const set = new CuckooSet2<number>(32)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('enforces minimum capacity', () => {
      const set = new CuckooSet2<number>(2)
      expect(set.size).toBe(0)
    })

    it('creates with zero capacity uses minimum', () => {
      const set = new CuckooSet2<number>(0)
      expect(set.size).toBe(0)
    })
  })

  // ─── add / has ───

  describe('add and has', () => {
    it('adds a single element', () => {
      const set = new CuckooSet2<number>()
      expect(set.add(1)).toBe(true)
      expect(set.has(1)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('rejects duplicate element', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      expect(set.add(1)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('adds multiple unique elements', () => {
      const set = new CuckooSet2<number>()
      expect(set.add(1)).toBe(true)
      expect(set.add(2)).toBe(true)
      expect(set.add(3)).toBe(true)
      expect(set.size).toBe(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(3)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      expect(set.has(99)).toBe(false)
    })

    it('handles string elements', () => {
      const set = new CuckooSet2<string>()
      set.add('hello')
      set.add('world')
      expect(set.has('hello')).toBe(true)
      expect(set.has('world')).toBe(true)
      expect(set.has('foo')).toBe(false)
    })

    it('handles many insertions with resizing', () => {
      const set = new CuckooSet2<number>(8)
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
      expect(set.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('handles zero', () => {
      const set = new CuckooSet2<number>()
      expect(set.add(0)).toBe(true)
      expect(set.has(0)).toBe(true)
    })

    it('handles negative numbers', () => {
      const set = new CuckooSet2<number>()
      expect(set.add(-1)).toBe(true)
      expect(set.add(-5)).toBe(true)
      expect(set.has(-1)).toBe(true)
      expect(set.has(-5)).toBe(true)
      expect(set.has(-10)).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing element', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.size).toBe(0)
    })

    it('returns false for non-existent element', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      expect(set.delete(99)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('returns false on empty set', () => {
      const set = new CuckooSet2<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('can delete all elements', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.delete(1)).toBe(true)
      expect(set.delete(2)).toBe(true)
      expect(set.delete(3)).toBe(true)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('does not affect other elements', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      expect(set.has(1)).toBe(true)
      expect(set.has(3)).toBe(true)
      expect(set.has(2)).toBe(false)
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const set = new CuckooSet2<number>()
      expect(set.size).toBe(0)
      set.add(1)
      expect(set.size).toBe(1)
      set.add(2)
      expect(set.size).toBe(2)
    })

    it('isEmpty tracks state', () => {
      const set = new CuckooSet2<number>()
      expect(set.isEmpty()).toBe(true)
      set.add(1)
      expect(set.isEmpty()).toBe(false)
      set.delete(1)
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.has(2)).toBe(false)
      expect(set.has(3)).toBe(false)
    })

    it('clear on empty set is no-op', () => {
      const set = new CuckooSet2<number>()
      set.clear()
      expect(set.size).toBe(0)
    })

    it('can add after clear', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.clear()
      expect(set.add(2)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.size).toBe(1)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty for empty set', () => {
      const set = new CuckooSet2<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const arr = set.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('reflects deletions', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.delete(2)
      const arr = set.toArray()
      expect(arr.length).toBe(2)
      expect(arr).toContain(1)
      expect(arr).toContain(3)
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates all elements', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected.length).toBe(3)
      expect(collected).toContain(1)
      expect(collected).toContain(2)
      expect(collected).toContain(3)
    })

    it('does nothing on empty set', () => {
      const set = new CuckooSet2<number>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates string values', () => {
      const set = new CuckooSet2<string>()
      set.add('a')
      set.add('b')
      const collected: string[] = []
      set.forEach((v) => collected.push(v))
      expect(collected.length).toBe(2)
    })
  })

  // ─── resize ───

  describe('resize', () => {
    it('can resize manually', () => {
      const set = new CuckooSet2<number>(8)
      set.add(1)
      set.add(2)
      set.resize(32)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.size).toBe(2)
    })

    it('can resize to larger capacity', () => {
      const set = new CuckooSet2<number>(8)
      for (let i = 0; i < 5; i++) {
        set.add(i)
      }
      set.resize(64)
      expect(set.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(set.has(i)).toBe(true)
      }
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const set = new CuckooSet2<number>()
      expect(set.add(42)).toBe(true)
      expect(set.has(42)).toBe(true)
      expect(set.delete(42)).toBe(true)
      expect(set.has(42)).toBe(false)
      expect(set.add(42)).toBe(true)
      expect(set.has(42)).toBe(true)
    })

    it('handles add-delete-add pattern', () => {
      const set = new CuckooSet2<number>()
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.add(1)).toBe(true)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
    })

    it('handles mixed strings and numbers separately (generic)', () => {
      const numSet = new CuckooSet2<number>()
      numSet.add(1)
      numSet.add(2)
      const strSet = new CuckooSet2<string>()
      strSet.add('1')
      strSet.add('2')
      expect(numSet.has(1)).toBe(true)
      expect(strSet.has('1')).toBe(true)
    })
  })
})
