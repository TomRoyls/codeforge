import { describe, it, expect } from 'vitest'
import { CountedBTree2 } from '../../src/core/counted-b-tree-2/index.js'

describe('CountedBTree2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty tree with default order', () => {
      const tree = new CountedBTree2<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with custom order', () => {
      const tree = new CountedBTree2<number>(3)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new CountedBTree2<string>(4, (a, b) => a.localeCompare(b))
      expect(tree.size).toBe(0)
    })

    it('creates tree with order and comparator', () => {
      const tree = new CountedBTree2<number>(5, (a, b) => a - b)
      expect(tree.size).toBe(0)
    })
  })

  // ─── insert / has ───

  describe('insert and has', () => {
    it('inserts a single element', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.has(10)).toBe(true)
      expect(tree.has(5)).toBe(false)
    })

    it('inserts multiple elements', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
      expect(tree.has(1)).toBe(false)
    })

    it('handles duplicate insertions', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(3)
      expect(tree.has(5)).toBe(true)
    })

    it('inserts elements in reverse order', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(9)
      tree.insert(7)
      tree.insert(5)
      tree.insert(3)
      tree.insert(1)
      expect(tree.size).toBe(5)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(9)).toBe(true)
    })

    it('works with strings', () => {
      const tree = new CountedBTree2<string>()
      tree.insert('banana')
      tree.insert('apple')
      tree.insert('cherry')
      expect(tree.size).toBe(3)
      expect(tree.has('apple')).toBe(true)
      expect(tree.has('grape')).toBe(false)
    })

    it('handles many insertions causing splits', () => {
      const tree = new CountedBTree2<number>(3)
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(tree.has(i)).toBe(true)
      }
      expect(tree.has(50)).toBe(false)
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('reports size correctly after operations', () => {
      const tree = new CountedBTree2<number>()
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('tracks size across many insertions', () => {
      const tree = new CountedBTree2<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('deletes a leaf key', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.has(5)).toBe(false)
    })

    it('returns false for non-existent key', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(5)
      expect(tree.delete(99)).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('returns false on empty tree', () => {
      const tree = new CountedBTree2<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('deletes from tree with multiple elements', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.insert(7)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(3)
      expect(tree.has(5)).toBe(false)
      expect(tree.has(3)).toBe(true)
    })

    it('deletes all elements', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(2)).toBe(true)
      expect(tree.delete(1)).toBe(true)
      expect(tree.delete(3)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles deletion with internal node key', () => {
      const tree = new CountedBTree2<number>(3)
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.delete(10)).toBe(true)
      expect(tree.has(10)).toBe(false)
      expect(tree.size).toBe(19)
    })
  })

  // ─── at ───

  describe('at', () => {
    it('returns element at index', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      expect(tree.at(0)).toBe(1)
      expect(tree.at(1)).toBe(3)
      expect(tree.at(2)).toBe(5)
    })

    it('returns undefined for out of bounds', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(1)
      expect(tree.at(-1)).toBeUndefined()
      expect(tree.at(1)).toBeUndefined()
      expect(tree.at(100)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      const tree = new CountedBTree2<number>()
      expect(tree.at(0)).toBeUndefined()
    })

    it('works after many insertions', () => {
      const tree = new CountedBTree2<number>(3)
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.at(0)).toBe(0)
      expect(tree.at(19)).toBe(19)
    })
  })

  // ─── indexOf ───

  describe('indexOf', () => {
    it('returns index of existing element', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      expect(tree.indexOf(1)).toBe(0)
      expect(tree.indexOf(3)).toBe(1)
      expect(tree.indexOf(5)).toBe(2)
    })

    it('returns -1 for non-existent element', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(1)
      expect(tree.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty tree', () => {
      const tree = new CountedBTree2<number>()
      expect(tree.indexOf(1)).toBe(-1)
    })

    it('handles indexOf with duplicates', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.indexOf(5)).toBe(0)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.has(1)).toBe(false)
    })

    it('clear on empty tree is no-op', () => {
      const tree = new CountedBTree2<number>()
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns sorted array', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.insert(2)
      tree.insert(4)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns empty array for empty tree', () => {
      const tree = new CountedBTree2<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('includes duplicates', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(3)
      tree.insert(3)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 3, 3])
    })

    it('returns sorted array after deletions', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.delete(3)
      expect(tree.toArray()).toEqual([1, 5, 7])
    })
  })

  // ─── negative numbers and edge cases ───

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(0)
      tree.insert(10)
      expect(tree.toArray()).toEqual([-10, -5, 0, 10])
    })

    it('handles single element operations', () => {
      const tree = new CountedBTree2<number>()
      tree.insert(42)
      expect(tree.at(0)).toBe(42)
      expect(tree.indexOf(42)).toBe(0)
      expect(tree.has(42)).toBe(true)
      tree.delete(42)
      expect(tree.isEmpty()).toBe(true)
    })
  })
})
