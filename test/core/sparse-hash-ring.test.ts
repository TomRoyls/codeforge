import { describe, it, expect, beforeEach } from 'vitest'
import { SparseHashRing } from '../../src/core/sparse-hash-ring/sparse-hash-ring.js'
import { DEFAULT_SPARSE_HASH_RING_OPTIONS } from '../../src/core/sparse-hash-ring/types.js'
import type { SparseHashRingOptions, SparseHashRingStatistics, SparseRingEntry } from '../../src/core/sparse-hash-ring/types.js'

describe('SparseHashRing', () => {
  let ring: SparseHashRing<string>

  beforeEach(() => {
    ring = new SparseHashRing<string>()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const r = new SparseHashRing<string>()
      expect(r.size).toBe(0)
      expect(r.isEmpty).toBe(true)
    })

    it('should create with empty options', () => {
      const r = new SparseHashRing<string>({})
      expect(r.size).toBe(0)
    })

    it('should accept custom virtualNodesPerUnit', () => {
      const r = new SparseHashRing<string>({ virtualNodesPerUnit: 50 })
      r.addNode('a')
      const stats = r.getStatistics()
      expect(stats.virtualNodes).toBe(50)
    })

    it('should accept custom hashFunction', () => {
      const customHash = (key: string): number => {
        let h = 0
        for (let i = 0; i < key.length; i++) {
          h = (h + key.charCodeAt(i)) | 0
        }
        return h >>> 0
      }
      const r = new SparseHashRing<string>({ hashFunction: customHash })
      r.addNode('a')
      expect(r.size).toBe(1)
    })

    it('should accept both options', () => {
      const r = new SparseHashRing<string>({
        virtualNodesPerUnit: 10,
        hashFunction: (k) => k.length >>> 0,
      })
      r.addNode('abc')
      expect(r.size).toBe(1)
      const stats = r.getStatistics()
      expect(stats.virtualNodes).toBe(10)
    })

    it('should have default virtualNodesPerUnit of 100', () => {
      expect(DEFAULT_SPARSE_HASH_RING_OPTIONS.virtualNodesPerUnit).toBe(100)
    })

    it('should have a default hashFunction', () => {
      const h = DEFAULT_SPARSE_HASH_RING_OPTIONS.hashFunction('test')
      expect(typeof h).toBe('number')
      expect(h).toBeGreaterThanOrEqual(0)
    })
  })

  describe('addNode', () => {
    it('should add a single node with default weight', () => {
      ring.addNode('node-a')
      expect(ring.size).toBe(1)
      expect(ring.containsNode('node-a')).toBe(true)
    })

    it('should create virtualNodesPerUnit virtual nodes for weight 1', () => {
      ring.addNode('node-a')
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(100)
    })

    it('should add node with explicit weight', () => {
      ring.addNode('node-a', 2)
      expect(ring.getWeight('node-a')).toBe(2)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(200)
    })

    it('should add node with weight 3', () => {
      ring.addNode('node-a', 3)
      expect(ring.getWeight('node-a')).toBe(3)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(300)
    })

    it('should add multiple nodes', () => {
      ring.addNode('node-a')
      ring.addNode('node-b')
      ring.addNode('node-c')
      expect(ring.size).toBe(3)
    })

    it('should ignore adding duplicate node with same weight', () => {
      ring.addNode('node-a')
      const statsBefore = ring.getStatistics()
      ring.addNode('node-a', 1)
      const statsAfter = ring.getStatistics()
      expect(ring.size).toBe(1)
      expect(statsAfter.adds).toBe(statsBefore.adds)
      expect(statsAfter.virtualNodes).toBe(statsBefore.virtualNodes)
    })

    it('should update weight when re-adding with different weight', () => {
      ring.addNode('node-a', 1)
      expect(ring.getWeight('node-a')).toBe(1)
      ring.addNode('node-a', 3)
      expect(ring.getWeight('node-a')).toBe(3)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(300)
    })

    it('should not add node with weight 0', () => {
      ring.addNode('node-a', 0)
      expect(ring.size).toBe(0)
      expect(ring.containsNode('node-a')).toBe(false)
    })

    it('should not add node with negative weight', () => {
      ring.addNode('node-a', -1)
      expect(ring.size).toBe(0)
    })

    it('should increment adds counter', () => {
      ring.addNode('a')
      ring.addNode('b')
      expect(ring.getStatistics().adds).toBe(2)
    })

    it('should update totalWeight stat', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 3)
      expect(ring.getStatistics().totalWeight).toBe(5)
    })

    it('should update virtualNodes stat', () => {
      ring.addNode('a', 2)
      expect(ring.getStatistics().virtualNodes).toBe(200)
    })

    it('should default weight to 1 when omitted', () => {
      ring.addNode('a')
      expect(ring.getWeight('a')).toBe(1)
    })

    it('should handle fractional weight', () => {
      ring.addNode('a', 1.5)
      expect(ring.getWeight('a')).toBe(1.5)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(Math.round(1.5 * 100))
    })

    it('should add node with very large weight', () => {
      ring.addNode('a', 100)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(10000)
    })
  })

  describe('removeNode', () => {
    it('should remove an existing node', () => {
      ring.addNode('node-a')
      const result = ring.removeNode('node-a')
      expect(result).toBe(true)
      expect(ring.size).toBe(0)
    })

    it('should return false for non-existent node', () => {
      const result = ring.removeNode('nonexistent')
      expect(result).toBe(false)
    })

    it('should remove all virtual nodes for the removed node', () => {
      ring.addNode('node-a')
      expect(ring.getStatistics().virtualNodes).toBe(100)
      ring.removeNode('node-a')
      expect(ring.getStatistics().virtualNodes).toBe(0)
    })

    it('should increment removes counter', () => {
      ring.addNode('a')
      ring.removeNode('a')
      expect(ring.getStatistics().removes).toBe(1)
    })

    it('should not increment removes counter for non-existent node', () => {
      ring.removeNode('nonexistent')
      expect(ring.getStatistics().removes).toBe(0)
    })

    it('should update totalWeight after removal', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 3)
      ring.removeNode('a')
      expect(ring.getStatistics().totalWeight).toBe(3)
    })

    it('should handle removal of last node', () => {
      ring.addNode('a')
      ring.removeNode('a')
      expect(ring.isEmpty).toBe(true)
      expect(ring.size).toBe(0)
    })

    it('should maintain other nodes after removal', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      expect(ring.size).toBe(1)
      expect(ring.containsNode('b')).toBe(true)
    })

    it('should remove weighted node correctly', () => {
      ring.addNode('a', 5)
      ring.removeNode('a')
      expect(ring.getStatistics().virtualNodes).toBe(0)
    })
  })

  describe('getNode', () => {
    it('should return undefined for empty ring', () => {
      expect(ring.getNode('key1')).toBeUndefined()
    })

    it('should return a node for a key', () => {
      ring.addNode('node-a')
      const result = ring.getNode('key1')
      expect(result).toBe('node-a')
    })

    it('should return a node when multiple nodes exist', () => {
      ring.addNode('node-a')
      ring.addNode('node-b')
      ring.addNode('node-c')
      const result = ring.getNode('key1')
      expect(['node-a', 'node-b', 'node-c']).toContain(result)
    })

    it('should return consistent results for the same key', () => {
      ring.addNode('node-a')
      ring.addNode('node-b')
      const first = ring.getNode('key1')
      const second = ring.getNode('key1')
      expect(first).toBe(second)
    })

    it('should increment lookups counter', () => {
      ring.addNode('a')
      ring.getNode('key1')
      ring.getNode('key2')
      expect(ring.getStatistics().lookups).toBe(2)
    })

    it('should not increment lookups for empty ring', () => {
      ring.getNode('key1')
      expect(ring.getStatistics().lookups).toBe(0)
    })

    it('should distribute keys across nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const counts = new Map<string, number>()
      for (let i = 0; i < 300; i++) {
        const node = ring.getNode(`key-${i}`)
        counts.set(node!, (counts.get(node!) ?? 0) + 1)
      }
      expect(counts.size).toBeGreaterThan(1)
    })

    it('should handle single node ring', () => {
      ring.addNode('only')
      for (let i = 0; i < 10; i++) {
        expect(ring.getNode(`key-${i}`)).toBe('only')
      }
    })
  })

  describe('getNodes', () => {
    it('should return empty array for empty ring', () => {
      expect(ring.getNodes('key1', 3)).toEqual([])
    })

    it('should return empty array for count 0', () => {
      ring.addNode('a')
      expect(ring.getNodes('key1', 0)).toEqual([])
    })

    it('should return empty array for negative count', () => {
      ring.addNode('a')
      expect(ring.getNodes('key1', -1)).toEqual([])
    })

    it('should return unique nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const result = ring.getNodes('key1', 3)
      const unique = new Set(result)
      expect(unique.size).toBe(result.length)
    })

    it('should return at most size nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      const result = ring.getNodes('key1', 5)
      expect(result.length).toBe(2)
    })

    it('should return requested number of nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const result = ring.getNodes('key1', 2)
      expect(result.length).toBe(2)
    })

    it('should return consistent results', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const first = ring.getNodes('key1', 2)
      const second = ring.getNodes('key1', 2)
      expect(first).toEqual(second)
    })

    it('should increment lookups counter', () => {
      ring.addNode('a')
      ring.getNodes('key1', 2)
      expect(ring.getStatistics().lookups).toBe(1)
    })

    it('should return all nodes when count equals size', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const result = ring.getNodes('key1', 3)
      expect(result.length).toBe(3)
      expect(new Set(result).size).toBe(3)
    })

    it('should handle count of 1', () => {
      ring.addNode('a')
      ring.addNode('b')
      const result = ring.getNodes('key1', 1)
      expect(result.length).toBe(1)
    })
  })

  describe('nodes', () => {
    it('should return empty array for empty ring', () => {
      expect(ring.nodes).toEqual([])
    })

    it('should return all added nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const n = ring.nodes
      expect(n.length).toBe(3)
      expect(n).toContain('a')
      expect(n).toContain('b')
      expect(n).toContain('c')
    })

    it('should reflect removals', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      expect(ring.nodes).toEqual(['b'])
    })
  })

  describe('size', () => {
    it('should be 0 for empty ring', () => {
      expect(ring.size).toBe(0)
    })

    it('should reflect number of nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      expect(ring.size).toBe(2)
    })

    it('should not count duplicate adds', () => {
      ring.addNode('a')
      ring.addNode('a', 1)
      expect(ring.size).toBe(1)
    })

    it('should decrease after removal', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      expect(ring.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new ring', () => {
      expect(ring.isEmpty).toBe(true)
    })

    it('should be false after adding node', () => {
      ring.addNode('a')
      expect(ring.isEmpty).toBe(false)
    })

    it('should be true after removing all nodes', () => {
      ring.addNode('a')
      ring.removeNode('a')
      expect(ring.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      ring.addNode('a')
      ring.clear()
      expect(ring.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all nodes', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.clear()
      expect(ring.size).toBe(0)
      expect(ring.isEmpty).toBe(true)
    })

    it('should clear virtual nodes', () => {
      ring.addNode('a', 5)
      ring.clear()
      expect(ring.getStatistics().virtualNodes).toBe(0)
    })

    it('should reset totalWeight', () => {
      ring.addNode('a', 10)
      ring.clear()
      expect(ring.getStatistics().totalWeight).toBe(0)
    })

    it('should work on already empty ring', () => {
      ring.clear()
      expect(ring.size).toBe(0)
    })

    it('should not affect statistics counters', () => {
      ring.addNode('a')
      ring.clear()
      const stats = ring.getStatistics()
      expect(stats.adds).toBe(1)
    })
  })

  describe('getWeight', () => {
    it('should return 0 for non-existent node', () => {
      expect(ring.getWeight('nonexistent')).toBe(0)
    })

    it('should return default weight of 1', () => {
      ring.addNode('a')
      expect(ring.getWeight('a')).toBe(1)
    })

    it('should return custom weight', () => {
      ring.addNode('a', 5)
      expect(ring.getWeight('a')).toBe(5)
    })

    it('should reflect weight updates', () => {
      ring.addNode('a', 1)
      ring.addNode('a', 3)
      expect(ring.getWeight('a')).toBe(3)
    })

    it('should return 0 after removal', () => {
      ring.addNode('a', 5)
      ring.removeNode('a')
      expect(ring.getWeight('a')).toBe(0)
    })
  })

  describe('getTotalWeight', () => {
    it('should return 0 for empty ring', () => {
      expect(ring.getTotalWeight()).toBe(0)
    })

    it('should return sum of all weights', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 3)
      ring.addNode('c', 5)
      expect(ring.getTotalWeight()).toBe(10)
    })

    it('should update after removal', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 3)
      ring.removeNode('a')
      expect(ring.getTotalWeight()).toBe(3)
    })

    it('should handle default weights', () => {
      ring.addNode('a')
      ring.addNode('b')
      expect(ring.getTotalWeight()).toBe(2)
    })
  })

  describe('containsNode', () => {
    it('should return false for non-existent node', () => {
      expect(ring.containsNode('a')).toBe(false)
    })

    it('should return true for added node', () => {
      ring.addNode('a')
      expect(ring.containsNode('a')).toBe(true)
    })

    it('should return false after removal', () => {
      ring.addNode('a')
      ring.removeNode('a')
      expect(ring.containsNode('a')).toBe(false)
    })

    it('should return true for weighted node', () => {
      ring.addNode('a', 5)
      expect(ring.containsNode('a')).toBe(true)
    })
  })

  describe('rebalance', () => {
    it('should maintain same nodes after rebalance', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.rebalance()
      expect(ring.size).toBe(3)
      expect(ring.containsNode('a')).toBe(true)
      expect(ring.containsNode('b')).toBe(true)
      expect(ring.containsNode('c')).toBe(true)
    })

    it('should maintain same weights after rebalance', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 3)
      ring.rebalance()
      expect(ring.getWeight('a')).toBe(2)
      expect(ring.getWeight('b')).toBe(3)
    })

    it('should maintain same virtual node count', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 1)
      const before = ring.getStatistics().virtualNodes
      ring.rebalance()
      expect(ring.getStatistics().virtualNodes).toBe(before)
    })

    it('should increment rebalances counter', () => {
      ring.addNode('a')
      ring.rebalance()
      expect(ring.getStatistics().rebalances).toBe(1)
    })

    it('should work on empty ring', () => {
      ring.rebalance()
      expect(ring.size).toBe(0)
    })

    it('should produce consistent lookups after rebalance', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.rebalance()
      const first = ring.getNode('key1')
      const second = ring.getNode('key1')
      expect(first).toBe(second)
    })

    it('should update totalWeight stat', () => {
      ring.addNode('a', 3)
      ring.rebalance()
      expect(ring.getStatistics().totalWeight).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should iterate over all ring entries', () => {
      ring.addNode('a')
      const entries: SparseRingEntry<string>[] = []
      ring.forEach((entry) => entries.push(entry))
      expect(entries.length).toBe(100)
    })

    it('should provide correct index', () => {
      ring.addNode('a')
      const indices: number[] = []
      ring.forEach((_, idx) => indices.push(idx))
      expect(indices[0]).toBe(0)
      expect(indices[indices.length - 1]).toBe(99)
    })

    it('should not iterate on empty ring', () => {
      let count = 0
      ring.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate weighted nodes correctly', () => {
      const r = new SparseHashRing<string>({ virtualNodesPerUnit: 10 })
      r.addNode('a', 2)
      let count = 0
      r.forEach(() => count++)
      expect(count).toBe(20)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty ring', () => {
      expect(ring.toArray()).toEqual([])
    })

    it('should return all virtual node entries', () => {
      ring.addNode('a')
      const arr = ring.toArray()
      expect(arr.length).toBe(100)
    })

    it('should return a copy', () => {
      ring.addNode('a')
      const arr1 = ring.toArray()
      const arr2 = ring.toArray()
      expect(arr1).not.toBe(arr2)
      expect(arr1.length).toBe(arr2.length)
    })

    it('should contain entries with hash and node', () => {
      ring.addNode('a')
      const arr = ring.toArray()
      for (const entry of arr) {
        expect(entry).toHaveProperty('hash')
        expect(entry).toHaveProperty('node')
        expect(typeof entry.hash).toBe('number')
        expect(entry.node).toBe('a')
      }
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = ring.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.rebalances).toBe(0)
      expect(stats.virtualNodes).toBe(0)
      expect(stats.totalWeight).toBe(0)
    })

    it('should track adds', () => {
      ring.addNode('a')
      ring.addNode('b')
      expect(ring.getStatistics().adds).toBe(2)
    })

    it('should track removes', () => {
      ring.addNode('a')
      ring.removeNode('a')
      expect(ring.getStatistics().removes).toBe(1)
    })

    it('should track lookups', () => {
      ring.addNode('a')
      ring.getNode('k1')
      ring.getNode('k2')
      ring.getNode('k3')
      expect(ring.getStatistics().lookups).toBe(3)
    })

    it('should track rebalances', () => {
      ring.addNode('a')
      ring.rebalance()
      ring.rebalance()
      expect(ring.getStatistics().rebalances).toBe(2)
    })

    it('should track virtualNodes', () => {
      ring.addNode('a', 2)
      expect(ring.getStatistics().virtualNodes).toBe(200)
    })

    it('should track totalWeight', () => {
      ring.addNode('a', 3)
      ring.addNode('b', 2)
      expect(ring.getStatistics().totalWeight).toBe(5)
    })

    it('should return a copy', () => {
      ring.addNode('a')
      const s1 = ring.getStatistics()
      const s2 = ring.getStatistics()
      expect(s1).not.toBe(s2)
      expect(s1).toEqual(s2)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      ring.addNode('a')
      const entries = [...ring]
      expect(entries.length).toBe(100)
    })

    it('should work with for...of', () => {
      ring.addNode('a')
      let count = 0
      for (const _entry of ring) {
        count++
      }
      expect(count).toBe(100)
    })

    it('should yield SparseRingEntry objects', () => {
      ring.addNode('a')
      for (const entry of ring) {
        expect(entry).toHaveProperty('hash')
        expect(entry).toHaveProperty('node')
        break
      }
    })

    it('should work on empty ring', () => {
      const entries = [...ring]
      expect(entries).toEqual([])
    })
  })

  describe('weight distribution', () => {
    it('should give heavier nodes more keys', () => {
      ring.addNode('light', 1)
      ring.addNode('heavy', 9)
      let lightCount = 0
      let heavyCount = 0
      for (let i = 0; i < 1000; i++) {
        const node = ring.getNode(`key-${i}`)
        if (node === 'light') lightCount++
        if (node === 'heavy') heavyCount++
      }
      expect(heavyCount).toBeGreaterThan(lightCount)
    })

    it('should distribute evenly with equal weights', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const counts = new Map<string, number>()
      for (let i = 0; i < 900; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts.set(node, (counts.get(node) ?? 0) + 1)
      }
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(100)
      }
    })

    it('should maintain distribution after node removal', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.removeNode('b')
      const counts = new Map<string, number>()
      for (let i = 0; i < 500; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts.set(node, (counts.get(node) ?? 0) + 1)
      }
      expect(counts.has('a')).toBe(true)
      expect(counts.has('c')).toBe(true)
      expect(counts.has('b')).toBe(false)
    })
  })

  describe('consistency', () => {
    it('should return same node after multiple operations', () => {
      ring.addNode('a')
      ring.addNode('b')
      const node = ring.getNode('stable-key')
      ring.addNode('c')
      expect(node).toBeDefined()
      expect(ring.getNode('stable-key')).toBeDefined()
    })

    it('should be consistent across rebalance for same key', () => {
      ring.addNode('a')
      ring.addNode('b')
      const before = ring.getNode('key1')
      ring.rebalance()
      const after = ring.getNode('key1')
      expect(before).toBe(after)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string node name', () => {
      ring.addNode('')
      expect(ring.size).toBe(1)
      expect(ring.containsNode('')).toBe(true)
    })

    it('should handle special characters in node name', () => {
      ring.addNode('node:with:colons')
      expect(ring.size).toBe(1)
    })

    it('should handle unicode node names', () => {
      ring.addNode('ノード')
      expect(ring.size).toBe(1)
    })

    it('should handle very long node names', () => {
      const longName = 'a'.repeat(1000)
      ring.addNode(longName)
      expect(ring.size).toBe(1)
    })

    it('should handle weight update from high to low', () => {
      ring.addNode('a', 10)
      expect(ring.getStatistics().virtualNodes).toBe(1000)
      ring.addNode('a', 1)
      expect(ring.getStatistics().virtualNodes).toBe(100)
    })

    it('should handle weight update from low to high', () => {
      ring.addNode('a', 1)
      expect(ring.getStatistics().virtualNodes).toBe(100)
      ring.addNode('a', 10)
      expect(ring.getStatistics().virtualNodes).toBe(1000)
    })

    it('should handle clear then re-add', () => {
      ring.addNode('a')
      ring.clear()
      ring.addNode('b')
      expect(ring.size).toBe(1)
      expect(ring.containsNode('b')).toBe(true)
      expect(ring.containsNode('a')).toBe(false)
    })

    it('should handle many nodes', () => {
      for (let i = 0; i < 100; i++) {
        ring.addNode(`node-${i}`)
      }
      expect(ring.size).toBe(100)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(100 * 100)
    })

    it('should handle getNodes with count larger than ring size', () => {
      ring.addNode('a')
      ring.addNode('b')
      const result = ring.getNodes('key1', 100)
      expect(result.length).toBe(2)
    })

    it('should handle small virtualNodesPerUnit', () => {
      const r = new SparseHashRing<string>({ virtualNodesPerUnit: 1 })
      r.addNode('a')
      expect(r.getStatistics().virtualNodes).toBe(1)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_SPARSE_HASH_RING_OPTIONS', () => {
      expect(DEFAULT_SPARSE_HASH_RING_OPTIONS).toBeDefined()
      expect(DEFAULT_SPARSE_HASH_RING_OPTIONS.virtualNodesPerUnit).toBe(100)
    })

    it('should export SparseHashRing class', () => {
      expect(SparseHashRing).toBeDefined()
    })

    it('should allow type usage for SparseHashRingOptions', () => {
      const opts: SparseHashRingOptions = { virtualNodesPerUnit: 50 }
      expect(opts.virtualNodesPerUnit).toBe(50)
    })

    it('should allow type usage for SparseHashRingStatistics', () => {
      const stats: SparseHashRingStatistics = {
        adds: 0,
        removes: 0,
        lookups: 0,
        rebalances: 0,
        virtualNodes: 0,
        totalWeight: 0,
      }
      expect(stats.adds).toBe(0)
    })

    it('should allow type usage for SparseRingEntry', () => {
      const entry: SparseRingEntry<string> = { hash: 123, node: 'a' }
      expect(entry.hash).toBe(123)
    })
  })

  describe('ring ordering', () => {
    it('should keep ring entries sorted by hash', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const arr = ring.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect((arr[i]!.hash >>> 0)).toBeGreaterThanOrEqual((arr[i - 1]!.hash >>> 0))
      }
    })

    it('should maintain sort after removal', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.removeNode('b')
      const arr = ring.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect((arr[i]!.hash >>> 0)).toBeGreaterThanOrEqual((arr[i - 1]!.hash >>> 0))
      }
    })
  })

  describe('getNodes comprehensive', () => {
    it('should return distinct nodes in order', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.addNode('d')
      const result = ring.getNodes('key1', 3)
      const unique = new Set(result)
      expect(unique.size).toBe(result.length)
      expect(result.length).toBe(3)
    })

    it('should wrap around the ring', () => {
      ring.addNode('a')
      ring.addNode('b')
      const result = ring.getNodes('key1', 2)
      expect(result.length).toBe(2)
      expect(new Set(result).size).toBe(2)
    })

    it('should not increment lookups for empty ring', () => {
      ring.getNodes('key1', 3)
      expect(ring.getStatistics().lookups).toBe(0)
    })
  })

  describe('getNode with weighted nodes', () => {
    it('should work with all weighted nodes', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 3)
      const result = ring.getNode('key1')
      expect(['a', 'b']).toContain(result)
    })

    it('should consistently map same key to same node', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 2)
      const results = new Set<string>()
      for (let i = 0; i < 10; i++) {
        results.add(ring.getNode('fixed-key')!)
      }
      expect(results.size).toBe(1)
    })
  })

  describe('addNode weight edge cases', () => {
    it('should handle weight 0.5', () => {
      ring.addNode('a', 0.5)
      expect(ring.getWeight('a')).toBe(0.5)
      const stats = ring.getStatistics()
      expect(stats.virtualNodes).toBe(Math.round(0.5 * 100))
    })

    it('should handle very small weight', () => {
      ring.addNode('a', 0.01)
      expect(ring.getWeight('a')).toBe(0.01)
    })

    it('should handle mixed weights', () => {
      ring.addNode('a', 1)
      ring.addNode('b', 2)
      ring.addNode('c', 3)
      expect(ring.getTotalWeight()).toBe(6)
    })
  })

  describe('rebalance comprehensive', () => {
    it('should preserve getNode behavior with weighted nodes', () => {
      ring.addNode('a', 2)
      ring.addNode('b', 1)
      const before = ring.getNode('test-key')
      ring.rebalance()
      const after = ring.getNode('test-key')
      expect(before).toBe(after)
    })

    it('should work with single node', () => {
      ring.addNode('a')
      ring.rebalance()
      expect(ring.size).toBe(1)
      expect(ring.getStatistics().virtualNodes).toBe(100)
    })

    it('should handle rebalance on empty ring', () => {
      ring.rebalance()
      expect(ring.getStatistics().rebalances).toBe(1)
      expect(ring.size).toBe(0)
    })
  })

  describe('forEach comprehensive', () => {
    it('should provide correct entries', () => {
      ring.addNode('a')
      let hasA = false
      ring.forEach((entry) => {
        if (entry.node === 'a') hasA = true
      })
      expect(hasA).toBe(true)
    })

    it('should iterate in ring order', () => {
      ring.addNode('a')
      const hashes: number[] = []
      ring.forEach((entry) => hashes.push(entry.hash >>> 0))
      for (let i = 1; i < hashes.length; i++) {
        expect(hashes[i]!).toBeGreaterThanOrEqual(hashes[i - 1]!)
      }
    })
  })

  describe('multiple operations sequence', () => {
    it('should handle add-remove-add sequence', () => {
      ring.addNode('a')
      ring.removeNode('a')
      ring.addNode('a')
      expect(ring.size).toBe(1)
      expect(ring.containsNode('a')).toBe(true)
    })

    it('should handle clear-add sequence', () => {
      ring.addNode('a')
      ring.addNode('b')
      ring.clear()
      ring.addNode('c')
      expect(ring.size).toBe(1)
      expect(ring.nodes).toEqual(['c'])
    })

    it('should handle weight-change-remove-add sequence', () => {
      ring.addNode('a', 1)
      ring.addNode('a', 5)
      ring.removeNode('a')
      ring.addNode('a', 2)
      expect(ring.getWeight('a')).toBe(2)
    })

    it('should maintain correct stats through operations', () => {
      ring.addNode('a')
      ring.addNode('b', 2)
      ring.getNode('key1')
      ring.removeNode('a')
      ring.rebalance()
      const stats = ring.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.removes).toBe(1)
      expect(stats.lookups).toBe(1)
      expect(stats.rebalances).toBe(1)
      expect(stats.totalWeight).toBe(2)
    })
  })
})
