import { describe, it, expect } from 'vitest'
import { ScapegoatTree } from '../src/utils/scapegoat-tree.js'

describe('ScapegoatTree', () => {
  describe('constructor', () => {
    it('creates empty tree with default alpha', () => {
      const tree = new ScapegoatTree<number, string>()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('throws for invalid alpha', () => {
      expect(() => new ScapegoatTree(0.5)).toThrow(RangeError)
      expect(() => new ScapegoatTree(1)).toThrow(RangeError)
      expect(() => new ScapegoatTree(0)).toThrow(RangeError)
    })

    it('accepts custom comparator', () => {
      const tree = new ScapegoatTree<string, number>(0.6, (a, b) => b.localeCompare(a))
      tree.insert('a', 1)
      tree.insert('b', 2)
      expect(tree.min()).toBe('b')
    })
  })

  describe('insert and get', () => {
    it('inserts and retrieves values', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.get(5)).toBe('five')
      expect(tree.get(3)).toBe('three')
      expect(tree.get(7)).toBe('seven')
    })

    it('returns undefined for missing key', () => {
      expect(new ScapegoatTree<number, string>().get(1)).toBeUndefined()
    })

    it('updates existing key', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'old')
      tree.insert(5, 'new')
      expect(tree.get(5)).toBe('new')
      expect(tree.size).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      expect(tree.has(5)).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(new ScapegoatTree<number, string>().has(5)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a leaf node', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(new ScapegoatTree<number, string>().delete(5)).toBe(false)
    })

    it('deletes internal nodes', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size).toBe(4)
    })
  })

  describe('min / max', () => {
    it('returns min key', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.min()).toBe(3)
    })

    it('returns max key', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.max()).toBe(7)
    })

    it('returns undefined for empty tree', () => {
      const tree = new ScapegoatTree<number, string>()
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })
  })

  describe('inOrderTraversal / keys / values', () => {
    it('returns sorted keys', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      expect(tree.keys()).toEqual([1, 3, 5, 7, 9])
    })

    it('returns values in key order', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.values()).toEqual(['three', 'five', 'seven'])
    })

    it('returns in-order entries', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(2, 'b')
      tree.insert(1, 'a')
      tree.insert(3, 'c')
      const entries = tree.inOrderTraversal()
      expect(entries.map((e) => e.key)).toEqual([1, 2, 3])
    })

    it('returns empty for empty tree', () => {
      const tree = new ScapegoatTree<number, string>()
      expect(tree.keys()).toEqual([])
      expect(tree.values()).toEqual([])
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })
  })

  describe('height', () => {
    it('returns 0 for empty tree', () => {
      expect(new ScapegoatTree<number, string>().height()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const tree = new ScapegoatTree<number, string>()
      tree.insert(1, 'a')
      expect(tree.height()).toBe(1)
    })

    it('height stays balanced for sorted inserts', () => {
      const tree = new ScapegoatTree<number, number>()
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      expect(tree.height()).toBeLessThan(20)
    })
  })

  describe('self-balancing', () => {
    it('maintains sorted order after many inserts', () => {
      const tree = new ScapegoatTree<number, number>()
      for (let i = 0; i < 50; i++) {
        tree.insert((i * 37) % 50, i)
      }
      const keys = tree.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]!).toBeGreaterThan(keys[i - 1]!)
      }
    })

    it('maintains sorted order after deletes', () => {
      const tree = new ScapegoatTree<number, number>()
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      const keys = tree.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]!).toBeGreaterThan(keys[i - 1]!)
      }
    })
  })
})
