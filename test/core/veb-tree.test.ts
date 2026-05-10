import { describe, it, expect, beforeEach } from 'vitest'
import { VebTree } from '../../src/core/veb-tree/veb-tree.js'
import { DEFAULT_VEB_TREE_OPTIONS } from '../../src/core/veb-tree/types.js'
import type { VebTreeOptions, VebTreeStatistics, VebTreeJSON, VebTreeNodeJSON } from '../../src/core/veb-tree/types.js'

describe('VebTree', () => {
  let tree: VebTree

  beforeEach(() => {
    tree = new VebTree(16)
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const t = new VebTree()
      expect(t.isEmpty).toBe(true)
      expect(t.size).toBe(0)
    })

    it('should create with universe size number', () => {
      const t = new VebTree(64)
      expect(t.isEmpty).toBe(true)
    })

    it('should create with options object', () => {
      const t = new VebTree({ universeSize: 128 })
      expect(t.isEmpty).toBe(true)
    })

    it('should round up universe size to next power of 2', () => {
      const t = new VebTree(10)
      const stats = t.getStatistics()
      expect(stats.universeSize).toBe(16)
    })

    it('should handle universe size 2', () => {
      const t = new VebTree(2)
      t.insert(0)
      t.insert(1)
      expect(t.size).toBe(2)
    })

    it('should handle universe size 1 by rounding to 2', () => {
      const t = new VebTree(1)
      expect(t.getStatistics().universeSize).toBe(2)
    })

    it('should handle large universe size', () => {
      const t = new VebTree(1024)
      t.insert(500)
      expect(t.has(500)).toBe(true)
    })

    it('should handle universe size exactly a power of 2', () => {
      const t = new VebTree(64)
      expect(t.getStatistics().universeSize).toBe(64)
    })

    it('should use DEFAULT_VEB_TREE_OPTIONS when no args', () => {
      const t = new VebTree()
      expect(t.getStatistics().universeSize).toBe(DEFAULT_VEB_TREE_OPTIONS.universeSize)
    })
  })

  describe('insert', () => {
    it('should insert a single value', () => {
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.has(5)).toBe(true)
    })

    it('should insert multiple values', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.size).toBe(3)
    })

    it('should handle inserting 0', () => {
      tree.insert(0)
      expect(tree.has(0)).toBe(true)
      expect(tree.min()).toBe(0)
    })

    it('should handle inserting max value', () => {
      tree.insert(15)
      expect(tree.has(15)).toBe(true)
      expect(tree.max()).toBe(15)
    })

    it('should ignore duplicate insert', () => {
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('should throw on negative value', () => {
      expect(() => tree.insert(-1)).toThrow(RangeError)
    })

    it('should throw on value >= universe size', () => {
      expect(() => tree.insert(16)).toThrow(RangeError)
    })

    it('should track insert statistics', () => {
      tree.insert(1)
      tree.insert(2)
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it('should track insert stat even for duplicate', () => {
      tree.insert(5)
      tree.insert(5)
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it('should insert all values in range for universe 2', () => {
      const t = new VebTree(2)
      t.insert(0)
      t.insert(1)
      expect(t.size).toBe(2)
      expect(t.min()).toBe(0)
      expect(t.max()).toBe(1)
    })

    it('should handle dense insertion', () => {
      for (let i = 0; i < 16; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(16)
    })

    it('should handle sparse insertion', () => {
      tree.insert(0)
      tree.insert(15)
      expect(tree.size).toBe(2)
    })

    it('should insert value at universe boundary', () => {
      tree.insert(0)
      tree.insert(15)
      expect(tree.has(0)).toBe(true)
      expect(tree.has(15)).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an existing value', () => {
      tree.insert(5)
      expect(tree.remove(5)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should return false for non-existing value', () => {
      expect(tree.remove(5)).toBe(false)
    })

    it('should return false for value out of range', () => {
      expect(tree.remove(-1)).toBe(false)
      expect(tree.remove(16)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.remove(0)).toBe(false)
    })

    it('should handle removing min', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(1)
      expect(tree.min()).toBe(5)
      expect(tree.size).toBe(2)
    })

    it('should handle removing max', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(10)
      expect(tree.max()).toBe(5)
    })

    it('should handle removing only element', () => {
      tree.insert(5)
      tree.remove(5)
      expect(tree.isEmpty).toBe(true)
      expect(tree.min()).toBe(undefined)
      expect(tree.max()).toBe(undefined)
    })

    it('should track remove statistics', () => {
      tree.insert(1)
      tree.remove(1)
      expect(tree.getStatistics().removes).toBe(1)
    })

    it('should not track remove stat on failed removal', () => {
      tree.remove(999)
      expect(tree.getStatistics().removes).toBe(0)
    })

    it('should handle remove and reinsert', () => {
      tree.insert(5)
      tree.remove(5)
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle removing from dense tree', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      for (let i = 0; i < 16; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('should handle removing alternating values', () => {
      for (let i = 0; i < 16; i += 2) tree.insert(i)
      expect(tree.remove(0)).toBe(true)
      expect(tree.remove(2)).toBe(true)
      expect(tree.has(4)).toBe(true)
      expect(tree.size).toBe(6)
    })
  })

  describe('has', () => {
    it('should return false on empty tree', () => {
      expect(tree.has(0)).toBe(false)
      expect(tree.has(5)).toBe(false)
    })

    it('should return true for inserted value', () => {
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('should return false for non-inserted value', () => {
      tree.insert(5)
      expect(tree.has(3)).toBe(false)
    })

    it('should return false for value out of range', () => {
      expect(tree.has(-1)).toBe(false)
      expect(tree.has(16)).toBe(false)
    })

    it('should return false after removal', () => {
      tree.insert(5)
      tree.remove(5)
      expect(tree.has(5)).toBe(false)
    })

    it('should handle boundary values', () => {
      tree.insert(0)
      tree.insert(15)
      expect(tree.has(0)).toBe(true)
      expect(tree.has(15)).toBe(true)
      expect(tree.has(8)).toBe(false)
    })
  })

  describe('min', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.min()).toBe(undefined)
    })

    it('should return the only value', () => {
      tree.insert(5)
      expect(tree.min()).toBe(5)
    })

    it('should return smallest value', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.min()).toBe(5)
    })

    it('should update after removing min', () => {
      tree.insert(1)
      tree.insert(5)
      tree.remove(1)
      expect(tree.min()).toBe(5)
    })

    it('should handle 0 as min', () => {
      tree.insert(0)
      expect(tree.min()).toBe(0)
    })
  })

  describe('max', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.max()).toBe(undefined)
    })

    it('should return the only value', () => {
      tree.insert(5)
      expect(tree.max()).toBe(5)
    })

    it('should return largest value', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })

    it('should update after removing max', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(10)
      expect(tree.max()).toBe(5)
    })

    it('should handle universe-1 as max', () => {
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })
  })

  describe('successor', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.successor(0)).toBe(undefined)
    })

    it('should return next value', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.successor(5)).toBe(10)
    })

    it('should return undefined when no successor exists', () => {
      tree.insert(10)
      expect(tree.successor(10)).toBe(undefined)
    })

    it('should return min for value below all elements', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.successor(0)).toBe(5)
    })

    it('should find successor across clusters', () => {
      for (let i = 0; i < 16; i += 4) tree.insert(i)
      expect(tree.successor(0)).toBe(4)
      expect(tree.successor(4)).toBe(8)
      expect(tree.successor(8)).toBe(12)
    })

    it('should handle successor of non-member', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.successor(7)).toBe(10)
    })

    it('should track successor query statistics', () => {
      tree.insert(5)
      tree.successor(0)
      tree.successor(5)
      expect(tree.getStatistics().successorQueries).toBe(2)
    })

    it('should handle universe size 2', () => {
      const t = new VebTree(2)
      t.insert(0)
      t.insert(1)
      expect(t.successor(0)).toBe(1)
      expect(t.successor(1)).toBe(undefined)
    })
  })

  describe('predecessor', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.predecessor(5)).toBe(undefined)
    })

    it('should return previous value', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(10)).toBe(5)
    })

    it('should return undefined when no predecessor exists', () => {
      tree.insert(5)
      expect(tree.predecessor(5)).toBe(undefined)
    })

    it('should return max for value above all elements', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(15)).toBe(10)
    })

    it('should find predecessor across clusters', () => {
      for (let i = 0; i < 16; i += 4) tree.insert(i)
      expect(tree.predecessor(12)).toBe(8)
      expect(tree.predecessor(8)).toBe(4)
      expect(tree.predecessor(4)).toBe(0)
    })

    it('should handle predecessor of non-member', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(7)).toBe(5)
    })

    it('should track predecessor query statistics', () => {
      tree.insert(5)
      tree.predecessor(10)
      tree.predecessor(5)
      expect(tree.getStatistics().predecessorQueries).toBe(2)
    })

    it('should handle universe size 2', () => {
      const t = new VebTree(2)
      t.insert(0)
      t.insert(1)
      expect(t.predecessor(1)).toBe(0)
      expect(t.predecessor(0)).toBe(undefined)
    })
  })

  describe('next and prev aliases', () => {
    it('next should return same as successor', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.next(5)).toBe(tree.successor(5))
    })

    it('prev should return same as predecessor', () => {
      tree.insert(5)
      tree.insert(10)
      expect(tree.prev(10)).toBe(tree.predecessor(10))
    })
  })

  describe('size', () => {
    it('should be 0 on new tree', () => {
      expect(tree.size).toBe(0)
    })

    it('should increment with insert', () => {
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      expect(tree.size).toBe(2)
    })

    it('should decrement with remove', () => {
      tree.insert(1)
      tree.insert(2)
      tree.remove(1)
      expect(tree.size).toBe(1)
    })

    it('should not change on duplicate insert', () => {
      tree.insert(1)
      tree.insert(1)
      expect(tree.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new tree', () => {
      expect(tree.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      tree.insert(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should be true after removing all', () => {
      tree.insert(1)
      tree.remove(1)
      expect(tree.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      tree.insert(1)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should set isEmpty to true', () => {
      tree.insert(1)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })

    it('should reset min and max', () => {
      tree.insert(5)
      tree.clear()
      expect(tree.min()).toBe(undefined)
      expect(tree.max()).toBe(undefined)
    })

    it('should reset statistics', () => {
      tree.insert(1)
      tree.remove(1)
      tree.successor(0)
      tree.clear()
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.successorQueries).toBe(0)
      expect(stats.predecessorQueries).toBe(0)
    })

    it('should allow operations after clear', () => {
      tree.insert(5)
      tree.clear()
      tree.insert(3)
      expect(tree.has(3)).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('should return sorted array', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.toArray()).toEqual([5, 10, 15])
    })

    it('should handle full tree', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })

    it('should reflect removals', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(5)
      expect(tree.toArray()).toEqual([1, 10])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate in sorted order', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([5, 10, 15])
    })

    it('should pass correct index', () => {
      tree.insert(5)
      tree.insert(10)
      const indices: number[] = []
      tree.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should return empty iterator for empty tree', () => {
      expect([...tree]).toEqual([])
    })

    it('should iterate in sorted order', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect([...tree]).toEqual([5, 10, 15])
    })

    it('should work with for-of', () => {
      tree.insert(1)
      tree.insert(3)
      const result: number[] = []
      for (const v of tree) {
        result.push(v)
      }
      expect(result).toEqual([1, 3])
    })
  })

  describe('containsRange', () => {
    it('should return true for empty range with member present', () => {
      tree.insert(5)
      expect(tree.containsRange(5, 5)).toBe(true)
    })

    it('should return false for empty range without member', () => {
      tree.insert(5)
      expect(tree.containsRange(3, 3)).toBe(false)
    })

    it('should return true for full range in dense tree', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      expect(tree.containsRange(0, 15)).toBe(true)
    })

    it('should return false for range with missing value', () => {
      for (let i = 0; i < 16; i += 2) tree.insert(i)
      expect(tree.containsRange(0, 3)).toBe(false)
    })

    it('should return false for inverted range', () => {
      tree.insert(5)
      expect(tree.containsRange(5, 3)).toBe(false)
    })

    it('should return false for out of range', () => {
      tree.insert(5)
      expect(tree.containsRange(-1, 5)).toBe(false)
      expect(tree.containsRange(5, 16)).toBe(false)
    })

    it('should return true for subset of present values', () => {
      for (let i = 2; i <= 8; i++) tree.insert(i)
      expect(tree.containsRange(3, 7)).toBe(true)
    })

    it('should return false on empty tree', () => {
      expect(tree.containsRange(0, 0)).toBe(false)
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats on new tree', () => {
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.successorQueries).toBe(0)
      expect(stats.predecessorQueries).toBe(0)
      expect(stats.clusterCount).toBe(0)
    })

    it('should track universe size', () => {
      const stats = tree.getStatistics()
      expect(stats.universeSize).toBe(16)
    })

    it('should track cluster count after inserts', () => {
      tree.insert(0)
      tree.insert(8)
      const stats = tree.getStatistics()
      expect(stats.clusterCount).toBeGreaterThan(0)
    })

    it('should return a copy', () => {
      tree.insert(1)
      const s1 = tree.getStatistics()
      tree.insert(2)
      const s2 = tree.getStatistics()
      expect(s1.inserts).toBe(1)
      expect(s2.inserts).toBe(2)
    })

    it('should track all operation types', () => {
      tree.insert(1)
      tree.insert(2)
      tree.remove(1)
      tree.successor(0)
      tree.successor(1)
      tree.predecessor(2)
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(stats.removes).toBe(1)
      expect(stats.successorQueries).toBe(2)
      expect(stats.predecessorQueries).toBe(1)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      tree.insert(5)
      const json = tree.toJSON()
      expect(json).toHaveProperty('universeSize')
      expect(json).toHaveProperty('size')
      expect(json).toHaveProperty('root')
      expect(json).toHaveProperty('statistics')
    })

    it('should reflect current size', () => {
      tree.insert(1)
      tree.insert(2)
      expect(tree.toJSON().size).toBe(2)
    })

    it('should include statistics', () => {
      tree.insert(1)
      const json = tree.toJSON()
      expect(json.statistics.inserts).toBe(1)
    })

    it('should serialize node structure', () => {
      tree.insert(5)
      const json = tree.toJSON()
      expect(json.root.min).toBe(5)
      expect(json.root.max).toBe(5)
      expect(json.root.universeSize).toBe(16)
    })

    it('should serialize clusters', () => {
      tree.insert(0)
      tree.insert(8)
      const json = tree.toJSON()
      expect(json.root.clusters).not.toBeNull()
      expect(json.root.clusters!.length).toBeGreaterThan(0)
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized tree', () => {
      tree.insert(5)
      tree.insert(10)
      const json = tree.toJSON()
      const restored = VebTree.fromJSON(json)
      expect(restored.size).toBe(2)
      expect(restored.has(5)).toBe(true)
      expect(restored.has(10)).toBe(true)
    })

    it('should round-trip correctly', () => {
      for (let i = 0; i < 16; i += 2) tree.insert(i)
      const json = tree.toJSON()
      const restored = VebTree.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.size).toBe(json2.size)
      expect(json.root.min).toBe(json2.root.min)
      expect(json.root.max).toBe(json2.root.max)
    })

    it('should preserve statistics', () => {
      tree.insert(5)
      tree.successor(0)
      const json = tree.toJSON()
      const restored = VebTree.fromJSON(json)
      expect(restored.getStatistics().inserts).toBe(1)
      expect(restored.getStatistics().successorQueries).toBe(1)
    })

    it('should allow operations after restoration', () => {
      tree.insert(5)
      const restored = VebTree.fromJSON(tree.toJSON())
      restored.insert(10)
      expect(restored.has(10)).toBe(true)
      expect(restored.size).toBe(2)
    })

    it('should handle empty tree serialization', () => {
      const json = tree.toJSON()
      const restored = VebTree.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should preserve min and max after restore', () => {
      tree.insert(3)
      tree.insert(7)
      tree.insert(12)
      const restored = VebTree.fromJSON(tree.toJSON())
      expect(restored.min()).toBe(3)
      expect(restored.max()).toBe(12)
    })
  })

  describe('successor/predecessor consistency', () => {
    it('should be inverse of each other', () => {
      tree.insert(5)
      tree.insert(10)
      tree.insert(15)
      const s = tree.successor(5)!
      expect(tree.predecessor(s)).toBe(5)
    })

    it('should traverse entire tree via successor', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      const result: number[] = []
      let cur = tree.min()!
      while (cur !== undefined) {
        result.push(cur)
        const next = tree.successor(cur)
        if (next === undefined) break
        cur = next
      }
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })

    it('should traverse entire tree via predecessor', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      const result: number[] = []
      let cur = tree.max()!
      while (cur !== undefined) {
        result.push(cur)
        const prev = tree.predecessor(cur)
        if (prev === undefined) break
        cur = prev
      }
      expect(result).toEqual([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    })
  })

  describe('edge cases', () => {
    it('should handle single element tree', () => {
      tree.insert(7)
      expect(tree.min()).toBe(7)
      expect(tree.max()).toBe(7)
      expect(tree.successor(7)).toBe(undefined)
      expect(tree.predecessor(7)).toBe(undefined)
      expect(tree.toArray()).toEqual([7])
    })

    it('should handle insert-remove-insert cycle', () => {
      tree.insert(5)
      tree.remove(5)
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle rapid insert and clear', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        tree.insert(cycle)
        tree.clear()
      }
      expect(tree.size).toBe(0)
    })

    it('should handle universe 2 with all operations', () => {
      const t = new VebTree(2)
      t.insert(0)
      t.insert(1)
      expect(t.size).toBe(2)
      expect(t.has(0)).toBe(true)
      expect(t.has(1)).toBe(true)
      expect(t.successor(0)).toBe(1)
      expect(t.predecessor(1)).toBe(0)
      t.remove(0)
      expect(t.size).toBe(1)
      expect(t.min()).toBe(1)
      expect(t.max()).toBe(1)
    })

    it('should handle universe 4 with all operations', () => {
      const t = new VebTree(4)
      t.insert(0)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.size).toBe(4)
      expect(t.successor(1)).toBe(2)
      expect(t.predecessor(2)).toBe(1)
      t.remove(2)
      expect(t.has(2)).toBe(false)
      expect(t.successor(1)).toBe(3)
    })

    it('should handle removing in reverse order', () => {
      for (let i = 0; i < 8; i++) tree.insert(i)
      for (let i = 7; i >= 0; i--) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('should handle large sparse dataset', () => {
      const t = new VebTree(256)
      t.insert(0)
      t.insert(128)
      t.insert(255)
      expect(t.size).toBe(3)
      expect(t.successor(0)).toBe(128)
      expect(t.successor(128)).toBe(255)
      expect(t.predecessor(255)).toBe(128)
      expect(t.predecessor(128)).toBe(0)
    })

    it('should handle removing middle of three elements', () => {
      tree.insert(1)
      tree.insert(8)
      tree.insert(15)
      tree.remove(8)
      expect(tree.toArray()).toEqual([1, 15])
      expect(tree.successor(1)).toBe(15)
      expect(tree.predecessor(15)).toBe(1)
    })
  })

  describe('dense dataset', () => {
    it('should handle full tree', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      expect(tree.size).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(tree.has(i)).toBe(true)
      }
    })

    it('should handle full tree removal', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      for (let i = 0; i < 16; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('should handle full tree successor chain', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      for (let i = 0; i < 15; i++) {
        expect(tree.successor(i)).toBe(i + 1)
      }
    })

    it('should handle full tree predecessor chain', () => {
      for (let i = 0; i < 16; i++) tree.insert(i)
      for (let i = 15; i > 0; i--) {
        expect(tree.predecessor(i)).toBe(i - 1)
      }
    })
  })

  describe('DEFAULT_VEB_TREE_OPTIONS', () => {
    it('should have universeSize of 256', () => {
      expect(DEFAULT_VEB_TREE_OPTIONS.universeSize).toBe(256)
    })
  })

  describe('exports', () => {
    it('should export VebTree class', () => {
      expect(VebTree).toBeDefined()
      expect(typeof VebTree).toBe('function')
    })

    it('should export DEFAULT_VEB_TREE_OPTIONS', () => {
      expect(DEFAULT_VEB_TREE_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports', () => {
      const opts: VebTreeOptions = { universeSize: 64 }
      const t = new VebTree(opts)
      expect(t.getStatistics().universeSize).toBe(64)
    })

    it('should allow type import for VebTreeStatistics', () => {
      const stats: VebTreeStatistics = tree.getStatistics()
      expect(stats.inserts).toBe(0)
    })

    it('should allow type import for VebTreeJSON', () => {
      const json: VebTreeJSON = tree.toJSON()
      expect(json.universeSize).toBe(16)
    })

    it('should allow type import for VebTreeNodeJSON', () => {
      const json: VebTreeJSON = tree.toJSON()
      const node: VebTreeNodeJSON = json.root
      expect(node.universeSize).toBe(16)
    })
  })

  describe('large universe', () => {
    it('should handle 1024 universe', () => {
      const t = new VebTree(1024)
      t.insert(0)
      t.insert(512)
      t.insert(1023)
      expect(t.size).toBe(3)
      expect(t.successor(0)).toBe(512)
      expect(t.successor(512)).toBe(1023)
    })

    it('should handle 64 universe dense', () => {
      const t = new VebTree(64)
      for (let i = 0; i < 64; i++) t.insert(i)
      expect(t.size).toBe(64)
      expect(t.toArray().length).toBe(64)
    })
  })
})
