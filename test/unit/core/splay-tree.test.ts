import { describe, expect, it } from 'vitest'
import { SplayTree } from '../../../src/core/splay-tree/splay-tree.js'

describe('SplayTree', () => {
  describe('insert', () => {
    it('should insert single element into empty tree', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should insert multiple elements in sequential order', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.size()).toBe(3)
    })

    it('should insert elements in reverse order', () => {
      const tree = new SplayTree<string>()
      tree.insert(3, 'three')
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      expect(tree.size()).toBe(3)
    })

    it('should insert elements in random order', () => {
      const tree = new SplayTree<number>()
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.size()).toBe(5)
    })

    it('should update value for duplicate key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(5, 'FIVE')
      expect(tree.search(5)).toBe('FIVE')
      expect(tree.size()).toBe(1)
    })

    it('should handle negative keys', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      tree.insert(0, 'zero')
      tree.insert(5, 'positive')
      expect(tree.size()).toBe(3)
    })

    it('should handle large sequential dataset', () => {
      const tree = new SplayTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(100)
    })
  })

  describe('search', () => {
    it('should find existing key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.search(5)).toBe('five')
    })

    it('should return undefined for non-existent key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.search(10)).toBe(undefined)
    })

    it('should return undefined for empty tree', () => {
      const tree = new SplayTree<string>()
      expect(tree.search(5)).toBe(undefined)
    })

    it('should search after multiple operations', () => {
      const tree = new SplayTree<number>()
      tree.insert(5, 500)
      tree.insert(10, 1000)
      tree.delete(5)
      expect(tree.search(10)).toBe(1000)
      expect(tree.search(5)).toBe(undefined)
    })

    it('should search for negative key', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      expect(tree.search(-5)).toBe('negative')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.has(5)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.has(10)).toBe(false)
    })

    it('should return false for empty tree', () => {
      const tree = new SplayTree<string>()
      expect(tree.has(5)).toBe(false)
    })

    it('should return false after deletion', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.delete(5)
      expect(tree.has(5)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      const result = tree.delete(5)
      expect(result).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.has(5)).toBe(false)
    })

    it('should return false for non-existent key', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      const result = tree.delete(10)
      expect(result).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should delete from tree with multiple elements', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(15, 'fifteen')
      tree.delete(10)
      expect(tree.size()).toBe(2)
      expect(tree.has(10)).toBe(false)
    })

    it('should delete root element', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(3, 'three')
      tree.search(5)
      tree.delete(5)
      expect(tree.size()).toBe(2)
      expect(tree.has(5)).toBe(false)
    })

    it('should delete all elements one by one', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.delete(2)
      tree.delete(1)
      tree.delete(3)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle delete on empty tree', () => {
      const tree = new SplayTree<string>()
      const result = tree.delete(5)
      expect(result).toBe(false)
    })

    it('should delete leaf node', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.delete(3)
      expect(tree.size()).toBe(2)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(7)).toBe(true)
    })

    it('should delete node with one child', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.delete(3)
      expect(tree.size()).toBe(2)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(1)).toBe(true)
    })

    it('should delete node with two children', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(4, 'four')
      tree.delete(3)
      expect(tree.size()).toBe(4)
      expect(tree.has(3)).toBe(false)
    })
  })

  describe('min', () => {
    it('should return minimum key-value pair', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(3, 'three')
      const min = tree.min()
      expect(min).toEqual({ key: 3, value: 'three' })
    })

    it('should return undefined for empty tree', () => {
      const tree = new SplayTree<string>()
      const min = tree.min()
      expect(min).toBe(undefined)
    })

    it('should return single element', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      const min = tree.min()
      expect(min).toEqual({ key: 5, value: 'five' })
    })

    it('should handle negative numbers', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      tree.insert(0, 'zero')
      tree.insert(5, 'positive')
      const min = tree.min()
      expect(min).toEqual({ key: -5, value: 'negative' })
    })

    it('should splay min element to root', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.min()
      expect(tree.search(3)).toBe('three')
    })
  })

  describe('max', () => {
    it('should return maximum key-value pair', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(3, 'three')
      const max = tree.max()
      expect(max).toEqual({ key: 10, value: 'ten' })
    })

    it('should return undefined for empty tree', () => {
      const tree = new SplayTree<string>()
      const max = tree.max()
      expect(max).toBe(undefined)
    })

    it('should return single element', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      const max = tree.max()
      expect(max).toEqual({ key: 5, value: 'five' })
    })

    it('should handle negative numbers', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      tree.insert(0, 'zero')
      tree.insert(5, 'positive')
      const max = tree.max()
      expect(max).toEqual({ key: 5, value: 'positive' })
    })

    it('should splay max element to root', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.max()
      expect(tree.search(10)).toBe('ten')
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new SplayTree<string>()
      expect(tree.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.size()).toBe(3)
    })

    it('should decrease size after deletion', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('should not increase size on duplicate insert', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(5, 'FIVE')
      expect(tree.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should track size through many operations', () => {
      const tree = new SplayTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 25; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(25)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new SplayTree<string>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after deleting all elements', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.delete(5)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty tree', () => {
      const tree = new SplayTree<string>()
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should clear tree with elements', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.search(1)).toBe(undefined)
      expect(tree.search(2)).toBe(undefined)
      expect(tree.search(3)).toBe(undefined)
    })

    it('should allow insertion after clear', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.clear()
      tree.insert(5, 'five')
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toBe('five')
    })
  })

  describe('inOrderTraversal via toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new SplayTree<string>()
      const result = tree.toArray()
      expect(result).toEqual([])
    })

    it('should return single element', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      const result = tree.toArray()
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should return elements in sorted order', () => {
      const tree = new SplayTree<string>()
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const result = tree.toArray()
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' }
      ])
    })

    it('should return elements after deletion', () => {
      const tree = new SplayTree<string>()
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(2)
      const result = tree.toArray()
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 3, value: 'three' }
      ])
    })

    it('should handle negative numbers', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      tree.insert(0, 'zero')
      tree.insert(5, 'positive')
      const result = tree.toArray()
      expect(result).toEqual([
        { key: -5, value: 'negative' },
        { key: 0, value: 'zero' },
        { key: 5, value: 'positive' }
      ])
    })

    it('should maintain order after duplicates', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(5, 'FIVE')
      const result = tree.toArray()
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 5, value: 'FIVE' }
      ])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty tree', () => {
      const tree = new SplayTree<string>()
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate over all elements', () => {
      const tree = new SplayTree<number>()
      tree.insert(3, 300)
      tree.insert(1, 100)
      tree.insert(2, 200)
      let sum = 0
      tree.forEach((key, value) => { sum += value })
      expect(sum).toBe(600)
    })

    it('should iterate in sorted order', () => {
      const tree = new SplayTree<string>()
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const keys: number[] = []
      tree.forEach((key) => { keys.push(key) })
      expect(keys).toEqual([1, 2, 3])
    })

    it('should pass correct key and value', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const results: Array<{ key: number; value: string }> = []
      tree.forEach((key, value) => { results.push({ key, value }) })
      expect(results).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' }
      ])
    })
  })

  describe('containsRange', () => {
    it('should return false for empty tree', () => {
      const tree = new SplayTree<string>()
      expect(tree.containsRange(1, 10)).toBe(false)
    })

    it('should return true when key in range exists', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.containsRange(1, 10)).toBe(true)
    })

    it('should return false when no key in range exists', () => {
      const tree = new SplayTree<string>()
      tree.insert(15, 'fifteen')
      expect(tree.containsRange(1, 10)).toBe(false)
    })

    it('should work with single element range', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      expect(tree.containsRange(5, 5)).toBe(true)
      expect(tree.containsRange(4, 4)).toBe(false)
    })

    it('should check exact range boundaries', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      expect(tree.containsRange(5, 10)).toBe(true)
      expect(tree.containsRange(6, 9)).toBe(false)
    })

    it('should work with negative ranges', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      tree.insert(5, 'positive')
      expect(tree.containsRange(-10, 0)).toBe(true)
      expect(tree.containsRange(0, 10)).toBe(true)
    })
  })

  describe('range', () => {
    it('should return empty array for empty tree', () => {
      const tree = new SplayTree<string>()
      const result = tree.range(1, 10)
      expect(result).toEqual([])
    })

    it('should return elements in range', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      const result = tree.range(2, 8)
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should return all elements when range covers all', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      const result = tree.range(0, 10)
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' }
      ])
    })

    it('should return empty when no elements in range', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const result = tree.range(5, 10)
      expect(result).toEqual([])
    })

    it('should return elements at range boundaries', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      const result = tree.range(1, 10)
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 5, value: 'five' },
        { key: 10, value: 'ten' }
      ])
    })

    it('should handle range with single element', () => {
      const tree = new SplayTree<string>()
      tree.insert(5, 'five')
      const result = tree.range(5, 5)
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should work with negative numbers', () => {
      const tree = new SplayTree<string>()
      tree.insert(-5, 'negative')
      tree.insert(0, 'zero')
      tree.insert(5, 'positive')
      const result = tree.range(-5, 0)
      expect(result).toEqual([
        { key: -5, value: 'negative' },
        { key: 0, value: 'zero' }
      ])
    })

    it('should maintain sorted order in range result', () => {
      const tree = new SplayTree<string>()
      tree.insert(10, 'ten')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.insert(15, 'fifteen')
      const result = tree.range(3, 12)
      expect(result).toEqual([
        { key: 5, value: 'five' },
        { key: 10, value: 'ten' }
      ])
    })

    it('should return correct range after deletion', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      tree.insert(15, 'fifteen')
      tree.delete(5)
      const result = tree.range(1, 10)
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 10, value: 'ten' }
      ])
    })

    it('should handle range after clear and reinsert', () => {
      const tree = new SplayTree<string>()
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.clear()
      tree.insert(10, 'ten')
      tree.insert(20, 'twenty')
      const result = tree.range(5, 15)
      expect(result).toEqual([{ key: 10, value: 'ten' }])
    })
  })
})