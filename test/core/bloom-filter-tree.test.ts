import { describe, it, expect, beforeEach } from 'vitest'
import { BloomFilterTree } from '../../src/core/bloom-filter-tree/bloom-filter-tree.js'
import { DEFAULT_BLOOM_FILTER_TREE_OPTIONS } from '../../src/core/bloom-filter-tree/types.js'
import type { BloomFilterTreeOptions, BloomFilterTreeJSON, BloomFilterTreeStatistics } from '../../src/core/bloom-filter-tree/types.js'

describe('BloomFilterTree', () => {
  let tree: BloomFilterTree

  beforeEach(() => {
    tree = new BloomFilterTree()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const t = new BloomFilterTree()
      expect(t.isEmpty).toBe(true)
      expect(t.size).toBe(0)
      expect(t.leafCount).toBe(1)
    })

    it('should accept options object', () => {
      const t = new BloomFilterTree({ branchingFactor: 8, expectedItemsPerLeaf: 500, falsePositiveRate: 0.001 })
      expect(t.isEmpty).toBe(true)
    })

    it('should accept partial options', () => {
      const t = new BloomFilterTree({ branchingFactor: 2 })
      expect(t.isEmpty).toBe(true)
    })

    it('should accept empty options', () => {
      const t = new BloomFilterTree({})
      expect(t.isEmpty).toBe(true)
    })

    it('should use DEFAULT_BLOOM_FILTER_TREE_OPTIONS when no args', () => {
      const t = new BloomFilterTree()
      const stats = t.getStatistics()
      expect(stats.leafCount).toBe(1)
    })

    it('should set branchingFactor from options', () => {
      const t = new BloomFilterTree({ branchingFactor: 16 })
      const json = t.toJSON()
      expect(json.options.branchingFactor).toBe(16)
    })

    it('should set expectedItemsPerLeaf from options', () => {
      const t = new BloomFilterTree({ expectedItemsPerLeaf: 50 })
      const json = t.toJSON()
      expect(json.options.expectedItemsPerLeaf).toBe(50)
    })

    it('should set falsePositiveRate from options', () => {
      const t = new BloomFilterTree({ falsePositiveRate: 0.001 })
      const json = t.toJSON()
      expect(json.options.falsePositiveRate).toBe(0.001)
    })

    it('should initialize with single leaf', () => {
      expect(tree.leafCount).toBe(1)
    })

    it('should initialize statistics with zeros', () => {
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.queries).toBe(0)
    })
  })

  describe('DEFAULT_BLOOM_FILTER_TREE_OPTIONS', () => {
    it('should have branchingFactor of 4', () => {
      expect(DEFAULT_BLOOM_FILTER_TREE_OPTIONS.branchingFactor).toBe(4)
    })

    it('should have expectedItemsPerLeaf of 1000', () => {
      expect(DEFAULT_BLOOM_FILTER_TREE_OPTIONS.expectedItemsPerLeaf).toBe(1000)
    })

    it('should have falsePositiveRate of 0.01', () => {
      expect(DEFAULT_BLOOM_FILTER_TREE_OPTIONS.falsePositiveRate).toBe(0.01)
    })
  })

  describe('insert', () => {
    it('should insert a single item', () => {
      tree.insert('hello')
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should insert multiple items', () => {
      tree.insert('a')
      tree.insert('b')
      tree.insert('c')
      expect(tree.size).toBe(3)
    })

    it('should insert numeric items', () => {
      const t = new BloomFilterTree<number>()
      t.insert(42)
      t.insert(100)
      expect(t.size).toBe(2)
    })

    it('should insert object items', () => {
      const t = new BloomFilterTree<{ id: number }>()
      t.insert({ id: 1 })
      t.insert({ id: 2 })
      expect(t.size).toBe(2)
    })

    it('should increment inserts statistic', () => {
      tree.insert('x')
      tree.insert('y')
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it('should handle duplicate inserts', () => {
      tree.insert('dup')
      tree.insert('dup')
      tree.insert('dup')
      expect(tree.size).toBe(3)
    })

    it('should handle empty string insert', () => {
      tree.insert('')
      expect(tree.size).toBe(1)
    })

    it('should handle special characters', () => {
      tree.insert('hello\nworld')
      tree.insert('\t\r\n')
      expect(tree.size).toBe(2)
    })

    it('should handle unicode strings', () => {
      tree.insert('こんにちは')
      tree.insert('🎉🎊')
      expect(tree.size).toBe(2)
    })

    it('should handle null values via JSON', () => {
      const t = new BloomFilterTree<null>()
      t.insert(null)
      expect(t.size).toBe(1)
    })

    it('should handle boolean values', () => {
      const t = new BloomFilterTree<boolean>()
      t.insert(true)
      t.insert(false)
      expect(t.size).toBe(2)
    })

    it('should update estimatedMemory on insert', () => {
      const before = tree.getStatistics().estimatedMemory
      tree.insert('test')
      const after = tree.getStatistics().estimatedMemory
      expect(after).toBeGreaterThanOrEqual(before)
    })
  })

  describe('has', () => {
    it('should return true for inserted item', () => {
      tree.insert('hello')
      expect(tree.has('hello')).toBe(true)
    })

    it('should return false for non-inserted item', () => {
      tree.insert('hello')
      expect(tree.has('world')).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.has('anything')).toBe(false)
    })

    it('should increment queries statistic', () => {
      tree.has('x')
      tree.has('y')
      expect(tree.getStatistics().queries).toBe(2)
    })

    it('should find items after multiple inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(`item-${i}`)
      }
      expect(tree.has('item-0')).toBe(true)
      expect(tree.has('item-50')).toBe(true)
      expect(tree.has('item-99')).toBe(true)
    })

    it('should handle numeric items in has', () => {
      const t = new BloomFilterTree<number>()
      t.insert(42)
      expect(t.has(42)).toBe(true)
      expect(t.has(43)).toBe(false)
    })

    it('should handle object items in has', () => {
      const t = new BloomFilterTree<{ id: number }>()
      t.insert({ id: 1 })
      expect(t.has({ id: 1 })).toBe(true)
    })

    it('should handle empty string in has', () => {
      tree.insert('')
      expect(tree.has('')).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an inserted item', () => {
      tree.insert('hello')
      const result = tree.remove('hello')
      expect(result).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should return false for non-existent item', () => {
      const result = tree.remove('nonexistent')
      expect(result).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.remove('anything')).toBe(false)
    })

    it('should increment removes statistic on success', () => {
      tree.insert('x')
      tree.remove('x')
      expect(tree.getStatistics().removes).toBe(1)
    })

    it('should increment removes statistic on failure', () => {
      tree.remove('nonexistent')
      expect(tree.getStatistics().removes).toBe(1)
    })

    it('should handle remove after multiple inserts', () => {
      tree.insert('a')
      tree.insert('b')
      tree.insert('c')
      expect(tree.remove('b')).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should handle removing same item twice', () => {
      tree.insert('dup')
      expect(tree.remove('dup')).toBe(true)
      expect(tree.remove('dup')).toBe(false)
    })

    it('should handle numeric items in remove', () => {
      const t = new BloomFilterTree<number>()
      t.insert(42)
      expect(t.remove(42)).toBe(true)
    })
  })

  describe('containsAll', () => {
    it('should return true when all items are present', () => {
      tree.insert('a')
      tree.insert('b')
      tree.insert('c')
      expect(tree.containsAll(['a', 'b', 'c'])).toBe(true)
    })

    it('should return false when some items are missing', () => {
      tree.insert('a')
      tree.insert('b')
      expect(tree.containsAll(['a', 'b', 'c'])).toBe(false)
    })

    it('should return true for empty array', () => {
      expect(tree.containsAll([])).toBe(true)
    })

    it('should return false for empty tree with non-empty items', () => {
      expect(tree.containsAll(['a'])).toBe(false)
    })

    it('should return true for single item that exists', () => {
      tree.insert('only')
      expect(tree.containsAll(['only'])).toBe(true)
    })

    it('should handle containsAll with numeric items', () => {
      const t = new BloomFilterTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.containsAll([1, 2, 3])).toBe(true)
    })

    it('should increment queries for each item', () => {
      tree.insert('a')
      tree.insert('b')
      tree.containsAll(['a', 'b', 'c'])
      expect(tree.getStatistics().queries).toBe(3)
    })

    it('should short-circuit on first missing item', () => {
      tree.insert('a')
      tree.containsAll(['missing', 'a'])
      expect(tree.getStatistics().queries).toBe(1)
    })
  })

  describe('containsAny', () => {
    it('should return true when at least one item is present', () => {
      tree.insert('a')
      expect(tree.containsAny(['a', 'b', 'c'])).toBe(true)
    })

    it('should return false when no items are present', () => {
      tree.insert('a')
      expect(tree.containsAny(['b', 'c'])).toBe(false)
    })

    it('should return false for empty array', () => {
      tree.insert('a')
      expect(tree.containsAny([])).toBe(false)
    })

    it('should return false for empty tree with items', () => {
      expect(tree.containsAny(['a'])).toBe(false)
    })

    it('should return true when all items are present', () => {
      tree.insert('a')
      tree.insert('b')
      expect(tree.containsAny(['a', 'b'])).toBe(true)
    })

    it('should short-circuit on first found item', () => {
      tree.insert('a')
      tree.insert('b')
      tree.containsAny(['a', 'b'])
      expect(tree.getStatistics().queries).toBe(1)
    })

    it('should handle containsAny with numeric items', () => {
      const t = new BloomFilterTree<number>()
      t.insert(1)
      t.insert(2)
      expect(t.containsAny([2, 3, 4])).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0)
    })

    it('should return correct size after inserts', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(`item-${i}`)
      }
      expect(tree.size).toBe(50)
    })

    it('should decrease after remove', () => {
      tree.insert('a')
      tree.insert('b')
      tree.remove('a')
      expect(tree.size).toBe(1)
    })
  })

  describe('leafCount', () => {
    it('should return 1 for new tree', () => {
      expect(tree.leafCount).toBe(1)
    })

    it('should be tracked in statistics', () => {
      const stats = tree.getStatistics()
      expect(stats.leafCount).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      tree.insert('x')
      expect(tree.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      tree.insert('x')
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      tree.insert('a')
      tree.insert('b')
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should reset isEmpty to true', () => {
      tree.insert('a')
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })

    it('should reset leafCount to 1', () => {
      tree.clear()
      expect(tree.leafCount).toBe(1)
    })

    it('should reset statistics', () => {
      tree.insert('a')
      tree.has('a')
      tree.clear()
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.queries).toBe(0)
    })

    it('should allow operations after clear', () => {
      tree.insert('before')
      tree.clear()
      tree.insert('after')
      expect(tree.has('after')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle multiple clears', () => {
      tree.clear()
      tree.clear()
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('getLeaf', () => {
    it('should return leaf at valid index', () => {
      tree.insert('test')
      const leaf = tree.getLeaf(0)
      expect(leaf).toBeDefined()
      expect(typeof leaf.has).toBe('function')
    })

    it('should throw RangeError for negative index', () => {
      expect(() => tree.getLeaf(-1)).toThrow(RangeError)
    })

    it('should throw RangeError for out of range index', () => {
      expect(() => tree.getLeaf(999)).toThrow(RangeError)
    })

    it('should return leaf with has method', () => {
      tree.insert('hello')
      const leaf = tree.getLeaf(0)
      expect(leaf.has('hello')).toBe(true)
    })

    it('should return leaf with size property', () => {
      tree.insert('a')
      tree.insert('b')
      const leaf = tree.getLeaf(0)
      expect(leaf.size).toBe(2)
    })

    it('should return leaf with isEmpty property', () => {
      const leaf = tree.getLeaf(0)
      expect(leaf.isEmpty).toBe(true)
    })

    it('should reflect non-empty after inserts', () => {
      tree.insert('x')
      const leaf = tree.getLeaf(0)
      expect(leaf.isEmpty).toBe(false)
    })
  })

  describe('forEachLeaf', () => {
    it('should iterate over single leaf', () => {
      let count = 0
      tree.forEachLeaf((_leaf, index) => {
        count++
        expect(index).toBe(0)
      })
      expect(count).toBe(1)
    })

    it('should provide leaf object with correct interface', () => {
      tree.insert('test')
      tree.forEachLeaf((leaf) => {
        expect(typeof leaf.has).toBe('function')
        expect(typeof leaf.size).toBe('number')
        expect(typeof leaf.isEmpty).toBe('boolean')
      })
    })

    it('should pass correct index', () => {
      const indices: number[] = []
      tree.forEachLeaf((_leaf, index) => {
        indices.push(index)
      })
      expect(indices).toEqual([0])
    })

    it('should not iterate on empty callback', () => {
      let count = 0
      tree.forEachLeaf(() => { count++ })
      expect(count).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return copy of statistics', () => {
      const stats1 = tree.getStatistics()
      const stats2 = tree.getStatistics()
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2)
    })

    it('should track inserts', () => {
      tree.insert('a')
      tree.insert('b')
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it('should track removes', () => {
      tree.insert('a')
      tree.remove('a')
      expect(tree.getStatistics().removes).toBe(1)
    })

    it('should track queries', () => {
      tree.has('a')
      tree.has('b')
      tree.has('c')
      expect(tree.getStatistics().queries).toBe(3)
    })

    it('should track leafCount', () => {
      expect(tree.getStatistics().leafCount).toBe(1)
    })

    it('should track estimatedMemory', () => {
      const stats = tree.getStatistics()
      expect(stats.estimatedMemory).toBeGreaterThan(0)
    })

    it('should have all required fields', () => {
      const stats = tree.getStatistics()
      expect(stats).toHaveProperty('inserts')
      expect(stats).toHaveProperty('removes')
      expect(stats).toHaveProperty('queries')
      expect(stats).toHaveProperty('leafCount')
      expect(stats).toHaveProperty('estimatedMemory')
    })
  })

  describe('toJSON', () => {
    it('should return valid JSON object', () => {
      tree.insert('test')
      const json = tree.toJSON()
      expect(json).toBeDefined()
      expect(typeof json).toBe('object')
    })

    it('should include options', () => {
      const json = tree.toJSON()
      expect(json.options).toBeDefined()
      expect(json.options.branchingFactor).toBe(DEFAULT_BLOOM_FILTER_TREE_OPTIONS.branchingFactor)
      expect(json.options.expectedItemsPerLeaf).toBe(DEFAULT_BLOOM_FILTER_TREE_OPTIONS.expectedItemsPerLeaf)
      expect(json.options.falsePositiveRate).toBe(DEFAULT_BLOOM_FILTER_TREE_OPTIONS.falsePositiveRate)
    })

    it('should include size', () => {
      tree.insert('a')
      tree.insert('b')
      const json = tree.toJSON()
      expect(json.size).toBe(2)
    })

    it('should include root node', () => {
      const json = tree.toJSON()
      expect(json.root).toBeDefined()
      expect(json.root.isLeaf).toBe(true)
    })

    it('should include leaves array', () => {
      const json = tree.toJSON()
      expect(Array.isArray(json.leaves)).toBe(true)
      expect(json.leaves.length).toBe(1)
    })

    it('should include statistics', () => {
      const json = tree.toJSON()
      expect(json.statistics).toBeDefined()
      expect(json.statistics.inserts).toBe(0)
    })

    it('should reflect inserted data', () => {
      tree.insert('hello')
      const json = tree.toJSON()
      expect(json.size).toBe(1)
      expect(json.statistics.inserts).toBe(1)
    })

    it('should be serializable to string', () => {
      tree.insert('test')
      const json = tree.toJSON()
      const str = JSON.stringify(json)
      expect(typeof str).toBe('string')
      expect(str.length).toBeGreaterThan(0)
    })
  })

  describe('static fromJSON', () => {
    it('should reconstruct tree from JSON', () => {
      tree.insert('hello')
      tree.insert('world')
      const json = tree.toJSON()
      const restored = BloomFilterTree.fromJSON(json)
      expect(restored.size).toBe(2)
    })

    it('should preserve options', () => {
      const custom = new BloomFilterTree({ branchingFactor: 8, expectedItemsPerLeaf: 200, falsePositiveRate: 0.005 })
      custom.insert('test')
      const json = custom.toJSON()
      const restored = BloomFilterTree.fromJSON(json)
      const restoredJson = restored.toJSON()
      expect(restoredJson.options.branchingFactor).toBe(8)
      expect(restoredJson.options.expectedItemsPerLeaf).toBe(200)
      expect(restoredJson.options.falsePositiveRate).toBe(0.005)
    })

    it('should preserve statistics', () => {
      tree.insert('a')
      tree.has('a')
      const json = tree.toJSON()
      const restored = BloomFilterTree.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.inserts).toBe(1)
      expect(stats.queries).toBe(1)
    })

    it('should preserve size', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(`item-${i}`)
      }
      const json = tree.toJSON()
      const restored = BloomFilterTree.fromJSON(json)
      expect(restored.size).toBe(20)
    })

    it('should handle empty tree round-trip', () => {
      const json = tree.toJSON()
      const restored = BloomFilterTree.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should support typed reconstruction', () => {
      const numTree = new BloomFilterTree<number>()
      numTree.insert(42)
      const json = numTree.toJSON()
      const restored = BloomFilterTree.fromJSON<number>(json)
      expect(restored.size).toBe(1)
    })

    it('should preserve leafCount', () => {
      const json = tree.toJSON()
      const restored = BloomFilterTree.fromJSON(json)
      expect(restored.leafCount).toBe(1)
    })
  })

  describe('integration', () => {
    it('should handle insert-has-remove cycle', () => {
      tree.insert('cycle')
      expect(tree.has('cycle')).toBe(true)
      expect(tree.remove('cycle')).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should handle many sequential operations', () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(`item-${i}`)
      }
      expect(tree.size).toBe(200)
      for (let i = 0; i < 50; i++) {
        tree.remove(`item-${i}`)
      }
      expect(tree.size).toBeLessThanOrEqual(200)
      expect(tree.size).toBeGreaterThan(100)
    })

    it('should maintain consistency after clear and reuse', () => {
      tree.insert('first')
      tree.clear()
      tree.insert('second')
      expect(tree.has('second')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle mixed types', () => {
      const mixedTree = new BloomFilterTree<string | number>()
      mixedTree.insert('hello')
      mixedTree.insert(42)
      expect(mixedTree.has('hello')).toBe(true)
      expect(mixedTree.has(42)).toBe(true)
      expect(mixedTree.size).toBe(2)
    })

    it('should work with small expectedItemsPerLeaf', () => {
      const small = new BloomFilterTree({ expectedItemsPerLeaf: 5, branchingFactor: 2 })
      for (let i = 0; i < 20; i++) {
        small.insert(`s-${i}`)
      }
      expect(small.size).toBe(20)
      expect(small.has('s-0')).toBe(true)
      expect(small.has('s-19')).toBe(true)
    })

    it('should work with very low falsePositiveRate', () => {
      const precise = new BloomFilterTree({ falsePositiveRate: 0.0001 })
      for (let i = 0; i < 100; i++) {
        precise.insert(`p-${i}`)
      }
      expect(precise.has('p-0')).toBe(true)
      expect(precise.has('p-99')).toBe(true)
    })

    it('should work with high falsePositiveRate', () => {
      const loose = new BloomFilterTree({ falsePositiveRate: 0.5 })
      for (let i = 0; i < 100; i++) {
        loose.insert(`l-${i}`)
      }
      expect(loose.has('l-0')).toBe(true)
      expect(loose.has('l-99')).toBe(true)
    })

    it('should handle round-trip with data', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(`rt-${i}`)
      }
      const json = tree.toJSON()
      const restored = BloomFilterTree.fromJSON<string>(json)
      expect(restored.size).toBe(50)
      expect(restored.has('rt-0')).toBe(true)
      expect(restored.has('rt-49')).toBe(true)
    })

    it('should track all statistics through operations', () => {
      tree.insert('a')
      tree.insert('b')
      tree.has('a')
      tree.has('b')
      tree.has('c')
      tree.remove('a')
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(stats.queries).toBe(4)
      expect(stats.removes).toBe(1)
    })

    it('should handle forEachLeaf after inserts', () => {
      tree.insert('x')
      tree.insert('y')
      let totalSize = 0
      tree.forEachLeaf((leaf) => {
        totalSize += leaf.size
      })
      expect(totalSize).toBe(2)
    })

    it('should handle getLeaf after inserts', () => {
      tree.insert('leaf-item')
      const leaf = tree.getLeaf(0)
      expect(leaf.has('leaf-item')).toBe(true)
      expect(leaf.size).toBe(1)
      expect(leaf.isEmpty).toBe(false)
    })

    it('should handle containsAll with partial matches', () => {
      tree.insert('a')
      tree.insert('b')
      expect(tree.containsAll(['a'])).toBe(true)
      expect(tree.containsAll(['a', 'b'])).toBe(true)
      expect(tree.containsAll(['a', 'b', 'c'])).toBe(false)
    })

    it('should handle containsAny with partial matches', () => {
      tree.insert('a')
      expect(tree.containsAny(['a', 'b'])).toBe(true)
      expect(tree.containsAny(['b', 'c'])).toBe(false)
    })

    it('should handle large number of inserts without errors', () => {
      const big = new BloomFilterTree({ expectedItemsPerLeaf: 100 })
      for (let i = 0; i < 500; i++) {
        big.insert(`big-${i}`)
      }
      expect(big.size).toBe(500)
    })

    it('should handle toJSON and fromJSON with custom options', () => {
      const custom = new BloomFilterTree({ branchingFactor: 2, expectedItemsPerLeaf: 10, falsePositiveRate: 0.01 })
      for (let i = 0; i < 5; i++) {
        custom.insert(`custom-${i}`)
      }
      const json = custom.toJSON()
      expect(json.options.branchingFactor).toBe(2)
      const restored = BloomFilterTree.fromJSON(json)
      expect(restored.size).toBe(5)
    })

    it('should handle boolean type correctly', () => {
      const boolTree = new BloomFilterTree<boolean>()
      boolTree.insert(true)
      boolTree.insert(false)
      expect(boolTree.has(true)).toBe(true)
      expect(boolTree.has(false)).toBe(true)
    })

    it('should handle array items', () => {
      const arrTree = new BloomFilterTree<number[]>()
      arrTree.insert([1, 2, 3])
      expect(arrTree.has([1, 2, 3])).toBe(true)
    })

    it('should handle null type', () => {
      const nullTree = new BloomFilterTree<null>()
      nullTree.insert(null)
      expect(nullTree.has(null)).toBe(true)
    })

    it('should produce non-zero estimatedMemory after inserts', () => {
      tree.insert('mem-test')
      expect(tree.getStatistics().estimatedMemory).toBeGreaterThan(0)
    })
  })
})
