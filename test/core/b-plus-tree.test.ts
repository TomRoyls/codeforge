import { describe, it, expect, beforeEach } from 'vitest'
import { BPlusTree } from '../../src/core/b-plus-tree/b-plus-tree.js'
import { DEFAULT_BPLUSTREE_OPTIONS } from '../../src/core/b-plus-tree/types.js'
import type { BPlusNode, BPlusTreeOptions } from '../../src/core/b-plus-tree/types.js'

describe('BPlusTree', () => {
  let tree: BPlusTree<number>

  beforeEach(() => {
    tree = new BPlusTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new BPlusTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom order', () => {
      const t = new BPlusTree<number>({ order: 5 })
      expect(t.size()).toBe(0)
    })

    it('should use default order of 3', () => {
      expect(DEFAULT_BPLUSTREE_OPTIONS.order).toBe(3)
    })

    it('should throw for order less than 2', () => {
      expect(() => new BPlusTree<number>({ order: 1 })).toThrow()
    })

    it('should accept order of 2', () => {
      const t = new BPlusTree<number>({ order: 2 })
      expect(t.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const t = new BPlusTree<number>({})
      expect(t.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single key-value pair', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toEqual([100])
    })

    it('should insert multiple keys in order', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.size()).toBe(3)
    })

    it('should insert multiple keys in reverse order', () => {
      tree.insert(30, 300)
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.size()).toBe(3)
    })

    it('should append value for duplicate key', () => {
      tree.insert(10, 100)
      tree.insert(10, 200)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toEqual([100, 200])
    })

    it('should handle negative keys', () => {
      tree.insert(-5, 50)
      tree.insert(-10, 100)
      tree.insert(5, 500)
      expect(tree.size()).toBe(3)
      expect(tree.search(-5)).toEqual([50])
    })

    it('should handle zero key', () => {
      tree.insert(0, 42)
      expect(tree.search(0)).toEqual([42])
    })

    it('should return void', () => {
      const result = tree.insert(1, 1)
      expect(result).toBeUndefined()
    })

    it('should cause node splits when order exceeded', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(t.search(i)).toEqual([i * 10])
      }
    })

    it('should maintain sorted order after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      const result = tree.toArray()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!.key).toBeLessThan(result[i + 1]!.key)
      }
    })

    it('should handle large number of insertions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(100)
    })

    it('should handle multiple values for the same key', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      tree.insert(5, 30)
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toEqual([10, 20, 30])
    })

    it('should handle floating point keys', () => {
      tree.insert(1.5, 15)
      tree.insert(2.5, 25)
      expect(tree.search(1.5)).toEqual([15])
    })
  })

  describe('search', () => {
    it('should find values for existing key', () => {
      tree.insert(10, 100)
      expect(tree.search(10)).toEqual([100])
    })

    it('should return empty array for non-existent key', () => {
      expect(tree.search(999)).toEqual([])
    })

    it('should return empty array when searching empty tree', () => {
      expect(tree.search(1)).toEqual([])
    })

    it('should find values after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.search(25)).toEqual([250])
      expect(tree.search(49)).toEqual([490])
      expect(tree.search(0)).toEqual([0])
    })

    it('should find all values for key with multiple values', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      tree.insert(5, 30)
      expect(tree.search(5)).toEqual([10, 20, 30])
    })

    it('should find keys in tree with higher order', () => {
      const t = new BPlusTree<number>({ order: 5 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      expect(t.search(25)).toEqual([25])
      expect(t.search(0)).toEqual([0])
      expect(t.search(49)).toEqual([49])
    })

    it('should return array of values', () => {
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      const result = tree.search(1)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return copy of values array', () => {
      tree.insert(1, 10)
      const result = tree.search(1)
      result.push(999)
      expect(tree.search(1)).toEqual([10])
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      tree.insert(10, 100)
      expect(tree.has(10)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(tree.has(999)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.insert(10, 100)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
    })

    it('should return true for negative keys', () => {
      tree.insert(-5, 50)
      expect(tree.has(-5)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete all values for existing key', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.search(10)).toEqual([])
    })

    it('should return false for non-existent key', () => {
      expect(tree.delete(999)).toBe(false)
    })

    it('should return false when deleting from empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should delete specific value from key with multiple values', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      tree.insert(5, 30)
      expect(tree.delete(5, 20)).toBe(true)
      expect(tree.search(5)).toEqual([10, 30])
      expect(tree.size()).toBe(1)
    })

    it('should delete key when last value removed with specific value', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      expect(tree.delete(5, 10)).toBe(true)
      expect(tree.search(5)).toEqual([20])
      expect(tree.delete(5, 20)).toBe(true)
      expect(tree.search(5)).toEqual([])
      expect(tree.size()).toBe(0)
    })

    it('should return false when specific value not found', () => {
      tree.insert(5, 10)
      expect(tree.delete(5, 999)).toBe(false)
    })

    it('should maintain correct size after multiple deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      tree.delete(5)
      tree.delete(3)
      tree.delete(7)
      expect(tree.size()).toBe(7)
    })

    it('should handle deleting and re-inserting', () => {
      tree.insert(10, 100)
      tree.delete(10)
      tree.insert(10, 200)
      expect(tree.search(10)).toEqual([200])
      expect(tree.size()).toBe(1)
    })

    it('should maintain sorted order after deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      const result = tree.toArray()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!.key).toBeLessThan(result[i + 1]!.key)
      }
    })

    it('should handle many sequential deletions', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 0; i < 50; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deleting all keys in reverse order', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 19; i >= 0; i--) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deleting from tree with multiple levels', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      expect(t.delete(5)).toBe(true)
      expect(t.search(5)).toEqual([])
      expect(t.size()).toBe(9)
    })

    it('should return true when deleting without value', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      tree.insert(5, 30)
      expect(tree.delete(5)).toBe(true)
      expect(tree.search(5)).toEqual([])
      expect(tree.size()).toBe(0)
    })
  })

  describe('range', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.range(0, 10)).toEqual([])
    })

    it('should return matching entries', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(15, 25)
      expect(result).toEqual([{ key: 20, values: [200] }])
    })

    it('should return all entries in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(10, 30)
      expect(result.length).toBe(3)
      expect(result[0]).toEqual({ key: 10, values: [100] })
      expect(result[1]).toEqual({ key: 20, values: [200] })
      expect(result[2]).toEqual({ key: 30, values: [300] })
    })

    it('should return empty when no keys in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(30, 40)).toEqual([])
    })

    it('should handle single key range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(20, 20)
      expect(result).toEqual([{ key: 20, values: [200] }])
    })

    it('should handle inverted range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(30, 5)).toEqual([])
    })

    it('should return boundary elements', () => {
      for (let i = 0; i <= 10; i++) tree.insert(i, i)
      const result = tree.range(3, 7)
      expect(result.map(r => r.key)).toEqual([3, 4, 5, 6, 7])
    })

    it('should handle range spanning multiple leaves', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 20; i++) {
        t.insert(i, i * 10)
      }
      const result = t.range(5, 15)
      expect(result.length).toBe(11)
      expect(result[0]).toEqual({ key: 5, values: [50] })
      expect(result[10]).toEqual({ key: 15, values: [150] })
    })

    it('should include all values for keys with multiple values', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      tree.insert(10, 100)
      const result = tree.range(5, 10)
      expect(result[0]).toEqual({ key: 5, values: [10, 20] })
    })

    it('should use linked leaves for range query', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 30; i++) {
        t.insert(i, i)
      }
      const result = t.range(0, 29)
      expect(result.length).toBe(30)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return key and values of single node', () => {
      tree.insert(10, 100)
      expect(tree.min()).toEqual({ key: 10, values: [100] })
    })

    it('should return minimum after many insertions', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.min()).toEqual({ key: 10, values: [100] })
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      expect(tree.min()).toEqual({ key: 10, values: [100] })
    })

    it('should handle negative keys', () => {
      tree.insert(5, 50)
      tree.insert(-10, -100)
      expect(tree.min()).toEqual({ key: -10, values: [-100] })
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return key and values of single node', () => {
      tree.insert(10, 100)
      expect(tree.max()).toEqual({ key: 10, values: [100] })
    })

    it('should return maximum after many insertions', () => {
      tree.insert(10, 100)
      tree.insert(50, 500)
      tree.insert(30, 300)
      expect(tree.max()).toEqual({ key: 50, values: [500] })
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(20)
      expect(tree.max()).toEqual({ key: 10, values: [100] })
    })

    it('should handle negative keys', () => {
      tree.insert(-5, -50)
      tree.insert(-10, -100)
      expect(tree.max()).toEqual({ key: -5, values: [-50] })
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      tree.insert(20, 200)
      expect(tree.size()).toBe(2)
    })

    it('should not increase on duplicate key insert', () => {
      tree.insert(10, 100)
      tree.insert(10, 200)
      expect(tree.size()).toBe(1)
    })

    it('should decrease after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.delete(10)
      expect(tree.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.insert(1, 1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      tree.insert(1, 1)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after deleting all nodes', () => {
      tree.insert(1, 1)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all nodes', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(10, 100)
      tree.clear()
      tree.insert(20, 200)
      expect(tree.size()).toBe(1)
      expect(tree.search(20)).toEqual([200])
    })

    it('should return void', () => {
      expect(tree.clear()).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      let called = false
      tree.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should iterate over single element', () => {
      tree.insert(10, 100)
      const results: Array<{ key: number, values: number[] }> = []
      tree.forEach((key, values) => results.push({ key, values }))
      expect(results).toEqual([{ key: 10, values: [100] }])
    })

    it('should iterate in sorted order', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      const keys: number[] = []
      tree.forEach((key) => keys.push(key))
      expect(keys).toEqual([10, 20, 30])
    })

    it('should iterate over all keys', () => {
      for (let i = 0; i < 10; i++) tree.insert(i, i)
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(10)
    })

    it('should provide correct values for each key', () => {
      tree.insert(1, 10)
      tree.insert(1, 20)
      tree.insert(2, 30)
      const results: Array<{ key: number, values: number[] }> = []
      tree.forEach((key, values) => results.push({ key, values }))
      expect(results[0]).toEqual({ key: 1, values: [10, 20] })
      expect(results[1]).toEqual({ key: 2, values: [30] })
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(10, 100)
      expect(tree.toArray()).toEqual([{ key: 10, values: [100] }])
    })

    it('should return sorted array', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      const result = tree.toArray()
      expect(result.map(r => r.key)).toEqual([10, 20, 30])
    })

    it('should return correct format', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      const result = tree.toArray()
      expect(result[0]).toEqual({ key: 1, values: [10] })
      expect(result[1]).toEqual({ key: 2, values: [20] })
    })

    it('should return all elements after modifications', () => {
      for (let i = 0; i < 5; i++) tree.insert(i, i * 10)
      tree.delete(2)
      const result = tree.toArray()
      expect(result.map(r => r.key)).toEqual([0, 1, 3, 4])
    })
  })

  describe('linked leaves', () => {
    it('should maintain linked list after splits', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      const arr = t.toArray()
      expect(arr.length).toBe(10)
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]!.key).toBeLessThan(arr[i + 1]!.key)
      }
    })

    it('should traverse linked leaves in forEach', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 20; i++) {
        t.insert(i, i)
      }
      const keys: number[] = []
      t.forEach((key) => keys.push(key))
      expect(keys.length).toBe(20)
      for (let i = 0; i < keys.length - 1; i++) {
        expect(keys[i]).toBeLessThan(keys[i + 1])
      }
    })

    it('should maintain linked list after clear and re-insert', () => {
      tree.insert(1, 1)
      tree.insert(2, 2)
      tree.clear()
      tree.insert(3, 3)
      tree.insert(4, 4)
      expect(tree.toArray().map(r => r.key)).toEqual([3, 4])
    })

    it('should maintain linked list with order 2 and many splits', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      const arr = t.toArray()
      expect(arr.length).toBe(50)
    })

    it('should handle range across multiple leaf nodes', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 30; i++) {
        t.insert(i, i)
      }
      const result = t.range(10, 20)
      expect(result.length).toBe(11)
      expect(result[0]!.key).toBe(10)
      expect(result[10]!.key).toBe(20)
    })
  })

  describe('node splitting', () => {
    it('should split leaf when full', () => {
      const t = new BPlusTree<number>({ order: 2 })
      t.insert(1, 10)
      t.insert(2, 20)
      t.insert(3, 30)
      expect(t.size()).toBe(3)
      expect(t.search(1)).toEqual([10])
      expect(t.search(2)).toEqual([20])
      expect(t.search(3)).toEqual([30])
    })

    it('should handle multiple splits', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 1; i <= 7; i++) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(7)
      const arr = t.toArray()
      expect(arr.map(r => r.key)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle splits with reverse insertions', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 7; i >= 1; i--) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(7)
      const arr = t.toArray()
      expect(arr.map(r => r.key)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle internal node splits', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 20; i++) {
        t.insert(i, i)
      }
      expect(t.size()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(t.has(i)).toBe(true)
      }
    })

    it('should handle split with order 2 causing deep tree', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 30; i++) {
        t.insert(i, i)
      }
      expect(t.size()).toBe(30)
      expect(t.min()!.key).toBe(0)
      expect(t.max()!.key).toBe(29)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new BPlusTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toEqual(['hello'])
      expect(t.search(2)).toEqual(['world'])
    })

    it('should store multiple string values for same key', () => {
      const t = new BPlusTree<string>()
      t.insert(1, 'hello')
      t.insert(1, 'world')
      expect(t.search(1)).toEqual(['hello', 'world'])
    })

    it('should delete specific string value', () => {
      const t = new BPlusTree<string>()
      t.insert(1, 'hello')
      t.insert(1, 'world')
      t.delete(1, 'hello')
      expect(t.search(1)).toEqual(['world'])
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new BPlusTree<{ name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)![0]!.name).toBe('a')
      expect(t.search(2)![0]!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new BPlusTree<null>()
      t.insert(1, null)
      expect(t.search(1)).toEqual([null])
      expect(t.has(1)).toBe(true)
    })

    it('should handle multiple object values for same key', () => {
      const t = new BPlusTree<{ id: number }>()
      t.insert(1, { id: 1 })
      t.insert(1, { id: 2 })
      expect(t.search(1).length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle large keys', () => {
      tree.insert(Number.MAX_SAFE_INTEGER, 1)
      tree.insert(Number.MIN_SAFE_INTEGER, 2)
      expect(tree.search(Number.MAX_SAFE_INTEGER)).toEqual([1])
      expect(tree.search(Number.MIN_SAFE_INTEGER)).toEqual([2])
    })

    it('should handle alternating insertions and deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
        if (i > 5) tree.delete(i - 5)
      }
      const result = tree.toArray()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!.key).toBeLessThan(result[i + 1]!.key)
      }
    })

    it('should handle re-inserting deleted keys', () => {
      tree.insert(5, 50)
      tree.delete(5)
      tree.insert(5, 51)
      expect(tree.search(5)).toEqual([51])
    })

    it('should handle many operations in sequence', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      for (let i = 10; i < 40; i++) {
        tree.delete(i)
      }
      const result = tree.toArray()
      expect(result.length).toBe(20)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!.key).toBeLessThan(result[i + 1]!.key)
      }
    })

    it('should handle deleting separator keys', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      t.delete(3)
      t.delete(7)
      expect(t.size()).toBe(8)
      for (let i = 0; i < 10; i++) {
        if (i === 3 || i === 7) {
          expect(t.has(i)).toBe(false)
        } else {
          expect(t.has(i)).toBe(true)
        }
      }
    })
  })

  describe('large tree', () => {
    it('should handle 1000 insertions', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i, i)
      expect(tree.size()).toBe(1000)
    })

    it('should handle 1000 mixed operations', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i)
      for (let i = 0; i < 250; i++) tree.delete(i)
      expect(tree.size()).toBe(250)
    })

    it('should find all elements in large tree', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 500; i++) {
        expect(tree.search(i)).toEqual([i * 2])
      }
    })

    it('should handle range query on large tree', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i)
      const result = tree.range(100, 200)
      expect(result.length).toBe(101)
      expect(result[0]!.key).toBe(100)
      expect(result[100]!.key).toBe(200)
    })

    it('should handle toArray on large tree', () => {
      for (let i = 0; i < 200; i++) tree.insert(i, i)
      const arr = tree.toArray()
      expect(arr.length).toBe(200)
      expect(arr[0]!.key).toBe(0)
      expect(arr[199]!.key).toBe(199)
    })
  })

  describe('different orders', () => {
    it('should work with order 2', () => {
      const t = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) t.insert(i, i)
      expect(t.size()).toBe(50)
      expect(t.search(25)).toEqual([25])
    })

    it('should work with order 4', () => {
      const t = new BPlusTree<number>({ order: 4 })
      for (let i = 0; i < 50; i++) t.insert(i, i)
      expect(t.size()).toBe(50)
      const arr = t.toArray()
      expect(arr.map(r => r.key)).toEqual(
        Array.from({ length: 50 }, (_, i) => i)
      )
    })

    it('should work with order 10', () => {
      const t = new BPlusTree<number>({ order: 10 })
      for (let i = 0; i < 100; i++) t.insert(i, i)
      expect(t.size()).toBe(100)
    })

    it('should work with order 50', () => {
      const t = new BPlusTree<number>({ order: 50 })
      for (let i = 0; i < 200; i++) t.insert(i, i)
      expect(t.size()).toBe(200)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BPLUSTREE_OPTIONS', () => {
      expect(DEFAULT_BPLUSTREE_OPTIONS.order).toBe(3)
    })

    it('should support BPlusTreeOptions interface', () => {
      const opts: BPlusTreeOptions = { order: 5 }
      expect(opts.order).toBe(5)
    })

    it('should support BPlusNode interface', () => {
      const node: BPlusNode<string> = {
        keys: [1, 2],
        children: [],
        values: new Map([[1, ['a']], [2, ['b']]]),
        isLeaf: true,
        next: null,
      }
      expect(node.keys.length).toBe(2)
      expect(node.values.get(1)).toEqual(['a'])
    })

    it('should support BPlusNode with children for internal nodes', () => {
      const leaf: BPlusNode<number> = {
        keys: [1],
        children: [],
        values: new Map([[1, [10]]]),
        isLeaf: true,
        next: null,
      }
      const internal: BPlusNode<number> = {
        keys: [5],
        children: [leaf],
        values: new Map(),
        isLeaf: false,
        next: null,
      }
      expect(internal.isLeaf).toBe(false)
      expect(internal.children.length).toBe(1)
    })
  })
})
