import { describe, it, expect, beforeEach } from 'vitest'
import { HopscotchSet2 } from '../../src/core/hopscotch-set-2/index.js'

describe('HopscotchSet2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates empty set with default capacity', () => {
      const set = new HopscotchSet2()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates set with custom capacity', () => {
      const set = new HopscotchSet2(64)
      expect(set.size).toBe(0)
    })
  })

  // ─── add ───
  describe('add', () => {
    it('adds an item and returns true', () => {
      const set = new HopscotchSet2()
      expect(set.add('hello')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('returns false for duplicate item', () => {
      const set = new HopscotchSet2()
      set.add('hello')
      expect(set.add('hello')).toBe(false)
      expect(set.size).toBe(1)
    })

    it('adds multiple distinct items', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size).toBe(3)
    })

    it('handles empty string', () => {
      const set = new HopscotchSet2()
      set.add('')
      expect(set.has('')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles items that resize the internal table', () => {
      const set = new HopscotchSet2(4)
      for (let i = 0; i < 20; i++) {
        set.add(`item-${i}`)
      }
      expect(set.size).toBe(20)
    })
  })

  // ─── has ───
  describe('has', () => {
    it('returns true for existing item', () => {
      const set = new HopscotchSet2()
      set.add('test')
      expect(set.has('test')).toBe(true)
    })

    it('returns false for missing item', () => {
      const set = new HopscotchSet2()
      expect(set.has('missing')).toBe(false)
    })

    it('returns false after item is deleted', () => {
      const set = new HopscotchSet2()
      set.add('test')
      set.delete('test')
      expect(set.has('test')).toBe(false)
    })

    it('returns false on empty set', () => {
      const set = new HopscotchSet2()
      expect(set.has('anything')).toBe(false)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('deletes existing item and returns true', () => {
      const set = new HopscotchSet2()
      set.add('test')
      expect(set.delete('test')).toBe(true)
      expect(set.size).toBe(0)
    })

    it('returns false for missing item', () => {
      const set = new HopscotchSet2()
      expect(set.delete('missing')).toBe(false)
    })

    it('can re-add after delete', () => {
      const set = new HopscotchSet2()
      set.add('test')
      set.delete('test')
      set.add('test')
      expect(set.has('test')).toBe(true)
      expect(set.size).toBe(1)
    })
  })

  // ─── isEmpty / size ───
  describe('isEmpty and size', () => {
    it('isEmpty returns true for new set', () => {
      const set = new HopscotchSet2()
      expect(set.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after adding', () => {
      const set = new HopscotchSet2()
      set.add('x')
      expect(set.isEmpty()).toBe(false)
    })

    it('size tracks count correctly', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size).toBe(3)
      set.delete('b')
      expect(set.size).toBe(2)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all items', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.add('b')
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.has('a')).toBe(false)
    })

    it('allows reuse after clear', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.has('b')).toBe(true)
      expect(set.size).toBe(1)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new HopscotchSet2()
      expect(set.toArray()).toEqual([])
    })

    it('returns all items', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.add('b')
      set.add('c')
      const arr = set.toArray()
      expect(arr.sort()).toEqual(['a', 'b', 'c'])
    })

    it('does not include deleted items', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.toArray()).toEqual(['b'])
    })
  })

  // ─── forEach ───
  describe('forEach', () => {
    it('iterates all items', () => {
      const set = new HopscotchSet2()
      set.add('x')
      set.add('y')
      const collected: string[] = []
      set.forEach((item) => collected.push(item))
      expect(collected.sort()).toEqual(['x', 'y'])
    })

    it('does not call callback on empty set', () => {
      const set = new HopscotchSet2()
      let called = false
      set.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── resize ───
  describe('resize', () => {
    it('preserves items after resize', () => {
      const set = new HopscotchSet2(16)
      set.add('a')
      set.add('b')
      set.add('c')
      set.resize(64)
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles single character strings', () => {
      const set = new HopscotchSet2()
      set.add('a')
      set.add('b')
      expect(set.has('a')).toBe(true)
      expect(set.has('c')).toBe(false)
    })

    it('handles long strings', () => {
      const set = new HopscotchSet2()
      const long = 'a'.repeat(1000)
      set.add(long)
      expect(set.has(long)).toBe(true)
    })

    it('handles special characters', () => {
      const set = new HopscotchSet2()
      set.add('hello world!')
      set.add('日本語')
      set.add('🎉')
      expect(set.has('hello world!')).toBe(true)
      expect(set.has('日本語')).toBe(true)
      expect(set.has('🎉')).toBe(true)
    })
  })
})
