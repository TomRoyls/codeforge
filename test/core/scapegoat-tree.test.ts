import { describe, it, expect, beforeEach } from 'vitest'
import { ScapegoatTree } from '../../src/core/scapegoat-tree/scapegoat-tree.js'
import { DEFAULT_SCAPEGOAT_OPTIONS } from '../../src/core/scapegoat-tree/types.js'
import type { ScapegoatNode, ScapegoatTreeOptions } from '../../src/core/scapegoat-tree/types.js'

describe('ScapegoatTree', () => {
  let tree: ScapegoatTree<number>

  beforeEach(() => {
    tree = new ScapegoatTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new ScapegoatTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom alpha option', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.6 })
      t.insert(1, 10)
      expect(t.size()).toBe(1)
    })

    it('should use default alpha of 0.75', () => {
      expect(DEFAULT_SCAPEGOAT_OPTIONS.alpha).toBe(0.75)
    })

    it('should accept partial options', () => {
      const t = new ScapegoatTree<number>({})
      t.insert(1, 1)
      expect(t.size()).toBe(1)
    })
  })

  describe('insert', () => {
    it('should insert a single node', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(100)
    })

    it('should insert multiple nodes in order', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.size()).toBe(3)
    })

    it('should insert multiple nodes in reverse order', () => {
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

    it('should handle string values', () => {
      const t = new ScapegoatTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should handle object values', () => {
      const t = new ScapegoatTree<{ name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)).toEqual({ name: 'a' })
    })

    it('should handle null values', () => {
      const t = new ScapegoatTree<null>()
      t.insert(1, null)
      expect(t.search(1)).toBe(null)
    })

    it('should handle undefined values', () => {
      const t = new ScapegoatTree<undefined>()
      t.insert(1, undefined)
      expect(t.has(1)).toBe(true)
    })

    it('should maintain balance after many sequential inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(100)
      expect(tree.isBalanced()).toBe(true)
    })

    it('should maintain balance after reverse sequential inserts', () => {
      for (let i = 99; i >= 0; i--) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(100)
      expect(tree.isBalanced()).toBe(true)
    })

    it('should maintain all values after balancing', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 100)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.search(i)).toBe(i * 100)
      }
    })

    it('should handle large number of inserts', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(1000)
    })

    it('should handle inserting same key multiple times', () => {
      tree.insert(5, 1)
      tree.insert(5, 2)
      tree.insert(5, 3)
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toBe(3)
    })
  })

  describe('search', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.search(1)).toBeUndefined()
    })

    it('should find inserted node', () => {
      tree.insert(10, 100)
      expect(tree.search(10)).toBe(100)
    })

    it('should return undefined for non-existent key', () => {
      tree.insert(10, 100)
      expect(tree.search(20)).toBeUndefined()
    })

    it('should find nodes in a larger tree', () => {
      tree.insert(50, 500)
      tree.insert(25, 250)
      tree.insert(75, 750)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.search(25)).toBe(250)
      expect(tree.search(10)).toBe(100)
      expect(tree.search(75)).toBe(750)
    })

    it('should find node after deletion and reinsertion', () => {
      tree.insert(10, 100)
      tree.delete(10)
      tree.insert(10, 200)
      expect(tree.search(10)).toBe(200)
    })
  })

  describe('has', () => {
    it('should return false for empty tree', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      tree.insert(10, 100)
      expect(tree.has(10)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      tree.insert(10, 100)
      expect(tree.has(20)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.insert(10, 100)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should return false for empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should return false for non-existent key', () => {
      tree.insert(10, 100)
      expect(tree.delete(20)).toBe(false)
    })

    it('should delete leaf node', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.search(10)).toBeUndefined()
    })

    it('should delete node with only left child', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.delete(20)).toBe(true)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(100)
    })

    it('should delete node with only right child', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(1)
      expect(tree.search(20)).toBe(200)
    })

    it('should delete node with two children', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.delete(20)).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.search(20)).toBeUndefined()
    })

    it('should maintain tree integrity after deletion', () => {
      tree.insert(50, 500)
      tree.insert(25, 250)
      tree.insert(75, 750)
      tree.insert(10, 100)
      tree.insert(30, 300)
      tree.delete(25)
      expect(tree.search(10)).toBe(100)
      expect(tree.search(30)).toBe(300)
      expect(tree.search(50)).toBe(500)
      expect(tree.search(75)).toBe(750)
    })

    it('should delete all nodes one by one', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.delete(10)
      tree.delete(20)
      tree.delete(30)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deletion and rebalancing', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10)
      }
      for (let i = 0; i < 25; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(tree.search(i)).toBe(i * 10)
      }
    })

    it('should handle delete root node with two children', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(15)).toBe(true)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return the minimum key and value', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.min()).toEqual({ key: 5, value: 50 })
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.delete(5)
      expect(tree.min()).toEqual({ key: 10, value: 100 })
    })

    it('should return single node as min', () => {
      tree.insert(42, 420)
      expect(tree.min()).toEqual({ key: 42, value: 420 })
    })

    it('should handle negative keys for min', () => {
      tree.insert(-10, -100)
      tree.insert(0, 0)
      tree.insert(10, 100)
      expect(tree.min()).toEqual({ key: -10, value: -100 })
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return the maximum key and value', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.max()).toEqual({ key: 15, value: 150 })
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.delete(15)
      expect(tree.max()).toEqual({ key: 10, value: 100 })
    })

    it('should return single node as max', () => {
      tree.insert(42, 420)
      expect(tree.max()).toEqual({ key: 42, value: 420 })
    })

    it('should handle negative keys for max', () => {
      tree.insert(-10, -100)
      tree.insert(0, 0)
      tree.insert(10, 100)
      expect(tree.max()).toEqual({ key: 10, value: 100 })
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct size after inserts', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.insert(3, 30)
      expect(tree.size()).toBe(3)
    })

    it('should not increase size on duplicate key insert', () => {
      tree.insert(1, 10)
      tree.insert(1, 20)
      expect(tree.size()).toBe(1)
    })

    it('should decrease size after deletion', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('should return 0 after clearing', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      tree.insert(1, 10)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after deleting all nodes', () => {
      tree.insert(1, 10)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty tree without error', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should clear tree with nodes', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.insert(3, 30)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.search(1)).toBeUndefined()
      expect(tree.search(2)).toBeUndefined()
      expect(tree.search(3)).toBeUndefined()
    })

    it('should allow inserts after clear', () => {
      tree.insert(1, 10)
      tree.clear()
      tree.insert(2, 20)
      expect(tree.size()).toBe(1)
      expect(tree.search(2)).toBe(20)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      const items: Array<{ key: number; value: number }> = []
      tree.forEach((key, value) => {
        items.push({ key, value })
      })
      expect(items).toEqual([])
    })

    it('should iterate over single node', () => {
      const items: Array<{ key: number; value: number }> = []
      tree.insert(10, 100)
      tree.forEach((key, value) => {
        items.push({ key, value })
      })
      expect(items).toEqual([{ key: 10, value: 100 }])
    })

    it('should iterate in-order', () => {
      const items: Array<{ key: number; value: number }> = []
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.forEach((key, value) => {
        items.push({ key, value })
      })
      expect(items).toEqual([
        { key: 10, value: 100 },
        { key: 20, value: 200 },
        { key: 30, value: 300 },
      ])
    })

    it('should iterate many elements in-order', () => {
      const keys: number[] = []
      for (let i = 50; i >= 0; i--) {
        tree.insert(i, i)
      }
      tree.forEach((key) => {
        keys.push(key)
      })
      for (let i = 0; i < 50; i++) {
        expect(keys[i]).toBeLessThanOrEqual(keys[i + 1]!)
      }
    })

    it('should iterate after deletions', () => {
      const items: Array<{ key: number; value: number }> = []
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.delete(20)
      tree.forEach((key, value) => {
        items.push({ key, value })
      })
      expect(items).toEqual([
        { key: 10, value: 100 },
        { key: 30, value: 300 },
      ])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return single element array', () => {
      tree.insert(10, 100)
      expect(tree.toArray()).toEqual([{ key: 10, value: 100 }])
    })

    it('should return sorted array', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.toArray()).toEqual([
        { key: 10, value: 100 },
        { key: 20, value: 200 },
        { key: 30, value: 300 },
      ])
    })

    it('should return all elements', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.toArray().length).toBe(20)
    })
  })

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single node', () => {
      tree.insert(10, 100)
      expect(tree.height()).toBe(1)
    })

    it('should return correct height for balanced tree', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.height()).toBe(2)
    })

    it('should have logarithmic height after many inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      const h = tree.height()
      expect(h).toBeLessThanOrEqual(Math.ceil(Math.log2(100) / Math.log2(1 / 0.75) + 1))
    })

    it('should return 0 after clear', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.clear()
      expect(tree.height()).toBe(0)
    })
  })

  describe('isBalanced', () => {
    it('should return true for empty tree', () => {
      expect(tree.isBalanced()).toBe(true)
    })

    it('should return true for single node', () => {
      tree.insert(10, 100)
      expect(tree.isBalanced()).toBe(true)
    })

    it('should return true after many inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.isBalanced()).toBe(true)
    })

    it('should have reasonable height after many deletions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 50; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(50)
      expect(tree.height()).toBeLessThanOrEqual(Math.ceil(2 * Math.log2(50)))
    })

    it('should return true after sequential inserts with low alpha', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.6 })
      for (let i = 0; i < 100; i++) {
        t.insert(i, i)
      }
      expect(t.isBalanced()).toBe(true)
    })
  })

  describe('rebalancing behavior', () => {
    it('should trigger rebalance on sequential inserts', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.6 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      expect(t.isBalanced()).toBe(true)
      expect(t.height()).toBeLessThan(50)
    })

    it('should trigger rebalance on reverse sequential inserts', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.6 })
      for (let i = 49; i >= 0; i--) {
        t.insert(i, i)
      }
      expect(t.isBalanced()).toBe(true)
      expect(t.height()).toBeLessThan(50)
    })

    it('should handle alternating insert pattern', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i % 2 === 0 ? i : 100 - i, i)
      }
      expect(tree.isBalanced()).toBe(true)
    })

    it('should handle high alpha value', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.95 })
      for (let i = 0; i < 100; i++) {
        t.insert(i, i)
      }
      expect(t.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.search(i)).toBe(i)
      }
    })

    it('should handle low alpha value', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.51 })
      for (let i = 0; i < 100; i++) {
        t.insert(i, i)
      }
      expect(t.size()).toBe(100)
      expect(t.isBalanced()).toBe(true)
    })

    it('should handle alpha of 0.5', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.5 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      expect(t.size()).toBe(50)
    })

    it('should handle alpha of 1.0', () => {
      const t = new ScapegoatTree<number>({ alpha: 1.0 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      expect(t.size()).toBe(50)
    })
  })

  describe('type exports', () => {
    it('should export ScapegoatNode type', () => {
      const node: ScapegoatNode<number> = { key: 1, value: 10, left: null, right: null }
      expect(node.key).toBe(1)
      expect(node.value).toBe(10)
    })

    it('should export ScapegoatTreeOptions type', () => {
      const opts: ScapegoatTreeOptions = { alpha: 0.7 }
      expect(opts.alpha).toBe(0.7)
    })

    it('should export DEFAULT_SCAPEGOAT_OPTIONS', () => {
      expect(DEFAULT_SCAPEGOAT_OPTIONS).toEqual({ alpha: 0.75 })
    })
  })

  describe('edge cases', () => {
    it('should handle inserting floating point keys', () => {
      tree.insert(1.5, 15)
      tree.insert(2.5, 25)
      expect(tree.search(1.5)).toBe(15)
      expect(tree.search(2.5)).toBe(25)
    })

    it('should handle very large keys', () => {
      tree.insert(Number.MAX_SAFE_INTEGER, 1)
      tree.insert(Number.MIN_SAFE_INTEGER, 2)
      expect(tree.search(Number.MAX_SAFE_INTEGER)).toBe(1)
      expect(tree.search(Number.MIN_SAFE_INTEGER)).toBe(2)
    })

    it('should handle mixed insert and delete operations', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.delete(10)
      tree.insert(30, 300)
      tree.insert(10, 1000)
      tree.delete(20)
      expect(tree.size()).toBe(2)
      expect(tree.search(10)).toBe(1000)
      expect(tree.search(30)).toBe(300)
    })

    it('should handle repeated insert delete cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) {
          tree.insert(i, i * cycle)
        }
        for (let i = 0; i < 20; i++) {
          tree.delete(i)
        }
      }
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle stress test with many operations', () => {
      const keys = Array.from({ length: 200 }, (_, i) => i)
      for (const k of keys) {
        tree.insert(k, k * 10)
      }
      expect(tree.size()).toBe(200)
      for (const k of keys) {
        expect(tree.has(k)).toBe(true)
      }
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!.key).toBeGreaterThan(arr[i - 1]!.key)
      }
    })

    it('should handle random insert order', () => {
      const keys = Array.from({ length: 100 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = keys[i]!
        keys[i] = keys[j]!
        keys[j] = temp
      }
      for (const k of keys) {
        tree.insert(k, k)
      }
      expect(tree.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(tree.search(i)).toBe(i)
      }
    })

    it('should handle deleting all elements in random order', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      const keys = Array.from({ length: 50 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = keys[i]!
        keys[i] = keys[j]!
        keys[j] = temp
      }
      for (const k of keys) {
        expect(tree.delete(k)).toBe(true)
      }
      expect(tree.size()).toBe(0)
    })

    it('should handle min and max with single element', () => {
      tree.insert(42, 420)
      expect(tree.min()).toEqual(tree.max())
    })

    it('should maintain correct min after multiple inserts', () => {
      tree.insert(50, 500)
      expect(tree.min()?.key).toBe(50)
      tree.insert(25, 250)
      expect(tree.min()?.key).toBe(25)
      tree.insert(75, 750)
      expect(tree.min()?.key).toBe(25)
      tree.insert(10, 100)
      expect(tree.min()?.key).toBe(10)
    })

    it('should maintain correct max after multiple inserts', () => {
      tree.insert(50, 500)
      expect(tree.max()?.key).toBe(50)
      tree.insert(25, 250)
      expect(tree.max()?.key).toBe(50)
      tree.insert(75, 750)
      expect(tree.max()?.key).toBe(75)
      tree.insert(100, 1000)
      expect(tree.max()?.key).toBe(100)
    })

    it('should handle clear and reinsert', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      for (let i = 50; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(50)
      expect(tree.min()?.key).toBe(50)
      expect(tree.max()?.key).toBe(99)
    })

    it('should handle deletion of root repeatedly', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.delete(10)
      tree.delete(tree.min()!.key)
      tree.delete(tree.max()!.key)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle array values', () => {
      const t = new ScapegoatTree<number[]>()
      t.insert(1, [1, 2, 3])
      t.insert(2, [4, 5, 6])
      expect(t.search(1)).toEqual([1, 2, 3])
      expect(t.search(2)).toEqual([4, 5, 6])
    })

    it('should handle boolean values', () => {
      const t = new ScapegoatTree<boolean>()
      t.insert(1, true)
      t.insert(2, false)
      expect(t.search(1)).toBe(true)
      expect(t.search(2)).toBe(false)
    })

    it('should handle Map values', () => {
      const t = new ScapegoatTree<Map<string, number>>()
      t.insert(1, new Map([['a', 1]]))
      const result = t.search(1)
      expect(result).toBeInstanceOf(Map)
      expect(result?.get('a')).toBe(1)
    })
  })
})
