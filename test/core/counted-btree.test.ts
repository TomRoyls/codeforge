import { describe, it, expect, beforeEach } from 'vitest'
import { CountedBTree, DEFAULT_COUNTEDBTREE_OPTIONS } from '../../src/core/counted-btree/counted-btree.js'
import type { CountedBNode, CountedBTreeOptions } from '../../src/core/counted-btree/types.js'

describe('CountedBTree', () => {
  let tree: CountedBTree<number>

  beforeEach(() => {
    tree = new CountedBTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new CountedBTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom order', () => {
      const t = new CountedBTree<number>({ order: 3 })
      expect(t.size()).toBe(0)
    })

    it('should use default order of 5', () => {
      expect(DEFAULT_COUNTEDBTREE_OPTIONS.order).toBe(5)
    })

    it('should throw for order less than 2', () => {
      expect(() => new CountedBTree<number>({ order: 1 })).toThrow()
    })

    it('should accept order of 2', () => {
      const t = new CountedBTree<number>({ order: 2 })
      expect(t.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const t = new CountedBTree<number>({})
      expect(t.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single key', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(100)
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

    it('should update value for duplicate key', () => {
      tree.insert(10, 100)
      tree.insert(10, 999)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(999)
    })

    it('should handle negative keys', () => {
      tree.insert(-5, 50)
      tree.insert(-10, 100)
      tree.insert(5, 500)
      expect(tree.size()).toBe(3)
      expect(tree.search(-5)).toBe(50)
    })

    it('should handle zero key', () => {
      tree.insert(0, 42)
      expect(tree.search(0)).toBe(42)
    })

    it('should return void', () => {
      const result = tree.insert(1, 1)
      expect(result).toBeUndefined()
    })

    it('should cause node splits when order exceeded', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(10)
    })

    it('should maintain sorted order after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      const entries: number[] = []
      tree.forEach((_k, _v, _i) => { entries.push(_k) })
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]).toBeLessThan(entries[i + 1]!)
      }
    })

    it('should handle large number of insertions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(100)
    })
  })

  describe('search', () => {
    it('should find an existing key', () => {
      tree.insert(10, 100)
      expect(tree.search(10)).toBe(100)
    })

    it('should return undefined for non-existent key', () => {
      expect(tree.search(999)).toBeUndefined()
    })

    it('should return undefined when searching empty tree', () => {
      expect(tree.search(1)).toBeUndefined()
    })

    it('should find keys after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.search(25)).toBe(250)
      expect(tree.search(49)).toBe(490)
      expect(tree.search(0)).toBe(0)
    })

    it('should find updated value after duplicate insert', () => {
      tree.insert(5, 50)
      tree.insert(5, 99)
      expect(tree.search(5)).toBe(99)
    })

    it('should find keys in tree with higher order', () => {
      const t = new CountedBTree<number>({ order: 7 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      expect(t.search(25)).toBe(25)
      expect(t.search(0)).toBe(0)
      expect(t.search(49)).toBe(49)
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
    it('should delete an existing key', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.search(10)).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      expect(tree.delete(999)).toBe(false)
    })

    it('should return false when deleting from empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should delete from leaf node', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('should delete root when it is the only node', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
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
      expect(tree.search(10)).toBe(200)
      expect(tree.size()).toBe(1)
    })

    it('should handle deleting from internal node', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      expect(t.delete(5)).toBe(true)
      expect(t.search(5)).toBeUndefined()
      expect(t.size()).toBe(9)
    })

    it('should maintain sorted order after deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      const entries: number[] = []
      tree.forEach((k) => { entries.push(k) })
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]).toBeLessThan(entries[i + 1]!)
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

    it('should handle alternating insertions and deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
        if (i > 5) tree.delete(i - 5)
      }
      const entries: number[] = []
      tree.forEach((k) => { entries.push(k) })
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]).toBeLessThan(entries[i + 1]!)
      }
    })
  })

  describe('at', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.at(0)).toBeUndefined()
    })

    it('should return value at index 0', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.at(0)).toBe(50)
    })

    it('should return value at last index', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.at(2)).toBe(200)
    })

    it('should return value at middle index', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.at(1)).toBe(100)
    })

    it('should return undefined for negative index', () => {
      tree.insert(10, 100)
      expect(tree.at(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds index', () => {
      tree.insert(10, 100)
      expect(tree.at(1)).toBeUndefined()
    })

    it('should return correct values after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i * 2, i * 10)
      }
      expect(tree.at(0)).toBe(0)
      expect(tree.at(25)).toBe(250)
      expect(tree.at(49)).toBe(490)
    })

    it('should return correct values after deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i * 100)
      }
      tree.delete(3)
      tree.delete(7)
      expect(tree.at(0)).toBe(0)
      expect(tree.at(3)).toBe(400)
      expect(tree.at(7)).toBe(900)
    })

    it('should work with order 2 tree with many splits', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i * 5)
      }
      for (let i = 0; i < 50; i++) {
        expect(t.at(i)).toBe(i * 5)
      }
    })

    it('should maintain at() correctness after mixed operations', () => {
      const t = new CountedBTree<number>({ order: 3 })
      for (let i = 0; i < 30; i++) t.insert(i, i)
      for (let i = 10; i < 20; i++) t.delete(i)
      for (let i = 0; i < t.size(); i++) {
        expect(t.at(i)).toBeDefined()
      }
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty tree', () => {
      expect(tree.indexOf(1)).toBe(-1)
    })

    it('should return 0 for first key', () => {
      tree.insert(5, 50)
      tree.insert(10, 100)
      tree.insert(15, 150)
      expect(tree.indexOf(5)).toBe(0)
    })

    it('should return last index for last key', () => {
      tree.insert(5, 50)
      tree.insert(10, 100)
      tree.insert(15, 150)
      expect(tree.indexOf(15)).toBe(2)
    })

    it('should return correct index for middle key', () => {
      tree.insert(5, 50)
      tree.insert(10, 100)
      tree.insert(15, 150)
      expect(tree.indexOf(10)).toBe(1)
    })

    it('should return -1 for non-existent key', () => {
      tree.insert(5, 50)
      expect(tree.indexOf(99)).toBe(-1)
    })

    it('should return correct indices after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.indexOf(i)).toBe(i)
      }
    })

    it('should return correct indices after deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      tree.delete(3)
      tree.delete(7)
      expect(tree.indexOf(0)).toBe(0)
      expect(tree.indexOf(4)).toBe(3)
      expect(tree.indexOf(9)).toBe(7)
    })

    it('should be inverse of at() for all keys', () => {
      for (let i = 0; i < 30; i++) {
        tree.insert(i * 3, i * 7)
      }
      for (let i = 0; i < tree.size(); i++) {
        const val = tree.at(i)
        const key = i * 3
        expect(tree.indexOf(key)).toBe(i)
        expect(val).toBe(i * 7)
      }
    })

    it('should work with order 2 tree', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 20; i++) {
        t.insert(i, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(t.indexOf(i)).toBe(i)
      }
    })

    it('should return -1 for key not in tree but within range', () => {
      tree.insert(1, 10)
      tree.insert(3, 30)
      tree.insert(5, 50)
      expect(tree.indexOf(2)).toBe(-1)
      expect(tree.indexOf(4)).toBe(-1)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return key and value of single node', () => {
      tree.insert(10, 100)
      expect(tree.min()).toEqual({ key: 10, value: 100 })
    })

    it('should return minimum after many insertions', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.min()).toEqual({ key: 10, value: 100 })
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      expect(tree.min()).toEqual({ key: 10, value: 100 })
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return key and value of single node', () => {
      tree.insert(10, 100)
      expect(tree.max()).toEqual({ key: 10, value: 100 })
    })

    it('should return maximum after many insertions', () => {
      tree.insert(10, 100)
      tree.insert(50, 500)
      tree.insert(30, 300)
      expect(tree.max()).toEqual({ key: 50, value: 500 })
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(20)
      expect(tree.max()).toEqual({ key: 10, value: 100 })
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate single element', () => {
      tree.insert(10, 100)
      const result: Array<{ key: number, value: number, index: number }> = []
      tree.forEach((k, v, i) => { result.push({ key: k, value: v, index: i }) })
      expect(result).toEqual([{ key: 10, value: 100, index: 0 }])
    })

    it('should iterate in order with correct indices', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      const result: Array<{ key: number, value: number, index: number }> = []
      tree.forEach((k, v, i) => { result.push({ key: k, value: v, index: i }) })
      expect(result).toEqual([
        { key: 10, value: 100, index: 0 },
        { key: 20, value: 200, index: 1 },
        { key: 30, value: 300, index: 2 },
      ])
    })

    it('should iterate many elements with correct indices', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i * 10)
      }
      const result: number[] = []
      tree.forEach((_k, _v, i) => { result.push(i) })
      expect(result).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('should iterate after deletions with correct indices', () => {
      for (let i = 0; i < 10; i++) tree.insert(i, i)
      tree.delete(3)
      tree.delete(7)
      const result: Array<{ key: number, index: number }> = []
      tree.forEach((k, _v, i) => { result.push({ key: k, index: i }) })
      expect(result[0]).toEqual({ key: 0, index: 0 })
      expect(result[3]).toEqual({ key: 4, index: 3 })
      expect(result[7]).toEqual({ key: 9, index: 7 })
    })
  })

  describe('range', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.range(0, 10)).toEqual([])
    })

    it('should return matching entries as objects', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.range(15, 25)).toEqual([{ key: 20, value: 200 }])
    })

    it('should return all entries in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(10, 30)
      expect(result).toEqual([
        { key: 10, value: 100 },
        { key: 20, value: 200 },
        { key: 30, value: 300 },
      ])
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
      expect(tree.range(20, 20)).toEqual([{ key: 20, value: 200 }])
    })

    it('should handle inverted range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(30, 5)).toEqual([])
    })

    it('should return boundary elements', () => {
      for (let i = 0; i <= 10; i++) tree.insert(i, i)
      const result = tree.range(3, 7)
      expect(result.map(e => e.key)).toEqual([3, 4, 5, 6, 7])
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

    it('should not increase on duplicate insert', () => {
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
      expect(tree.search(20)).toBe(200)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_COUNTEDBTREE_OPTIONS', () => {
      expect(DEFAULT_COUNTEDBTREE_OPTIONS.order).toBe(5)
    })

    it('should support CountedBTreeOptions interface', () => {
      const opts: CountedBTreeOptions = { order: 5 }
      expect(opts.order).toBe(5)
    })

    it('should support CountedBNode interface', () => {
      const node: CountedBNode<string> = {
        keys: [1, 2],
        values: ['a', 'b'],
        children: [],
        counts: [],
      }
      expect(node.keys.length).toBe(2)
      expect(node.values[0]).toBe('a')
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new CountedBTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should update string values', () => {
      const t = new CountedBTree<string>()
      t.insert(1, 'old')
      t.insert(1, 'new')
      expect(t.search(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new CountedBTree<{ name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)!.name).toBe('a')
      expect(t.search(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new CountedBTree<null>()
      t.insert(1, null)
      expect(t.search(1)).toBeNull()
      expect(t.has(1)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle large keys', () => {
      tree.insert(Number.MAX_SAFE_INTEGER, 1)
      tree.insert(Number.MIN_SAFE_INTEGER, 2)
      expect(tree.search(Number.MAX_SAFE_INTEGER)).toBe(1)
      expect(tree.search(Number.MIN_SAFE_INTEGER)).toBe(2)
      expect(tree.indexOf(Number.MIN_SAFE_INTEGER)).toBe(0)
      expect(tree.indexOf(Number.MAX_SAFE_INTEGER)).toBe(1)
    })

    it('should handle floating point keys', () => {
      tree.insert(1.5, 15)
      tree.insert(2.5, 25)
      expect(tree.search(1.5)).toBe(15)
    })
  })

  describe('node splitting and merging', () => {
    it('should split root when full', () => {
      const t = new CountedBTree<number>({ order: 2 })
      t.insert(1, 10)
      t.insert(2, 20)
      t.insert(3, 30)
      expect(t.size()).toBe(3)
      expect(t.search(1)).toBe(10)
      expect(t.search(2)).toBe(20)
      expect(t.search(3)).toBe(30)
    })

    it('should handle multiple splits', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 1; i <= 7; i++) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(7)
      const entries: number[] = []
      t.forEach((k) => { entries.push(k) })
      expect(entries).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle merges during deletion', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      for (let i = 0; i < 10; i++) {
        expect(t.delete(i)).toBe(true)
      }
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle borrowing from sibling during deletion', () => {
      const t = new CountedBTree<number>({ order: 3 })
      for (let i = 0; i < 20; i++) {
        t.insert(i, i)
      }
      t.delete(0)
      t.delete(19)
      expect(t.size()).toBe(18)
      expect(t.search(1)).toBe(1)
      expect(t.search(18)).toBe(18)
    })

    it('should maintain invariants after many operations', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      for (let i = 10; i < 40; i++) {
        t.delete(i)
      }
      const entries: number[] = []
      t.forEach((k) => { entries.push(k) })
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i]).toBeLessThan(entries[i + 1]!)
      }
      expect(t.size()).toBe(20)
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

    it('should maintain at() correctness with 500 elements', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 500; i++) {
        expect(tree.at(i)).toBe(i * 2)
      }
    })

    it('should maintain indexOf() correctness with 500 elements', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 500; i++) {
        expect(tree.indexOf(i)).toBe(i)
      }
    })
  })

  describe('different orders', () => {
    it('should work with order 2', () => {
      const t = new CountedBTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) t.insert(i, i)
      expect(t.size()).toBe(50)
      expect(t.search(25)).toBe(25)
      expect(t.at(25)).toBe(25)
      expect(t.indexOf(25)).toBe(25)
    })

    it('should work with order 4', () => {
      const t = new CountedBTree<number>({ order: 4 })
      for (let i = 0; i < 50; i++) t.insert(i, i)
      expect(t.size()).toBe(50)
      const entries: number[] = []
      t.forEach((k) => { entries.push(k) })
      expect(entries).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('should work with order 10', () => {
      const t = new CountedBTree<number>({ order: 10 })
      for (let i = 0; i < 100; i++) t.insert(i, i)
      expect(t.size()).toBe(100)
    })

    it('should work with order 50', () => {
      const t = new CountedBTree<number>({ order: 50 })
      for (let i = 0; i < 200; i++) t.insert(i, i)
      expect(t.size()).toBe(200)
    })
  })

  describe('counted operations consistency', () => {
    it('should have consistent at/indexOf for random order insertions', () => {
      const keys = [15, 3, 22, 8, 1, 19, 27, 5, 12, 30]
      for (const k of keys) tree.insert(k, k * 10)
      const sorted = [...keys].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(tree.indexOf(sorted[i]!)).toBe(i)
        expect(tree.at(i)).toBe(sorted[i]! * 10)
      }
    })

    it('should have consistent at/indexOf after complex operations', () => {
      const t = new CountedBTree<number>({ order: 3 })
      for (let i = 0; i < 40; i++) t.insert(i, i)
      for (let i = 5; i < 35; i += 3) t.delete(i)
      const entries: Array<{ key: number, value: number }> = []
      t.forEach((k, v) => { entries.push({ key: k, value: v }) })
      for (let i = 0; i < entries.length; i++) {
        expect(t.indexOf(entries[i]!.key)).toBe(i)
        expect(t.at(i)).toBe(entries[i]!.value)
      }
    })

    it('should have forEach indices match indexOf for all keys', () => {
      for (let i = 0; i < 20; i++) tree.insert(i * 2, i)
      tree.forEach((key, _value, index) => {
        expect(tree.indexOf(key)).toBe(index)
      })
    })
  })
})
