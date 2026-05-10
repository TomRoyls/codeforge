import { describe, it, expect, beforeEach } from 'vitest'
import { PartitionedSet } from '../../src/core/partitioned-set/partitioned-set.js'
import { DEFAULT_PARTITIONED_SET_OPTIONS } from '../../src/core/partitioned-set/types.js'
import type { PartitionedSetOptions, PartitionedSetJSON, PartitionedSetStatistics } from '../../src/core/partitioned-set/types.js'

describe('PartitionedSet', () => {
  let ds: PartitionedSet<string>

  beforeEach(() => {
    ds = new PartitionedSet()
  })

  describe('constructor', () => {
    it('should create with no arguments', () => {
      const s = new PartitionedSet()
      expect(s.size).toBe(0)
      expect(s.partitionCount).toBe(0)
    })

    it('should accept empty options object', () => {
      const s = new PartitionedSet({})
      expect(s.size).toBe(0)
    })

    it('should accept options with trackStatistics false', () => {
      const s = new PartitionedSet({ trackStatistics: false })
      s.makeSet('a')
      expect(s.getStatistics().makeSetCalls).toBe(0)
    })

    it('should accept options with trackStatistics true', () => {
      const s = new PartitionedSet({ trackStatistics: true })
      s.makeSet('a')
      expect(s.getStatistics().makeSetCalls).toBe(1)
    })

    it('should default trackStatistics to true', () => {
      expect(DEFAULT_PARTITIONED_SET_OPTIONS.trackStatistics).toBe(true)
    })

    it('should work with number type', () => {
      const s = new PartitionedSet<number>()
      s.makeSet(1)
      s.makeSet(2)
      expect(s.size).toBe(2)
    })

    it('should work with object type', () => {
      const obj = { id: 1 }
      const s = new PartitionedSet<object>()
      s.makeSet(obj)
      expect(s.has(obj)).toBe(true)
    })
  })

  describe('makeSet', () => {
    it('should add a single element', () => {
      ds.makeSet('a')
      expect(ds.size).toBe(1)
      expect(ds.partitionCount).toBe(1)
    })

    it('should add multiple distinct elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.size).toBe(3)
      expect(ds.partitionCount).toBe(3)
    })

    it('should ignore duplicate makeSet calls', () => {
      ds.makeSet('a')
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.size).toBe(1)
      expect(ds.partitionCount).toBe(1)
    })

    it('should make element its own parent', () => {
      ds.makeSet('a')
      expect(ds.find('a')).toBe('a')
    })

    it('should track makeSetCalls in statistics', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getStatistics().makeSetCalls).toBe(3)
    })

    it('should not count duplicate makeSet in statistics', () => {
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.getStatistics().makeSetCalls).toBe(1)
    })

    it('should initialize rank to 0', () => {
      ds.makeSet('x')
      const json = ds.toJSON()
      expect(json.rank).toEqual([0])
    })
  })

  describe('find', () => {
    it('should return undefined for non-existent element', () => {
      expect(ds.find('missing')).toBeUndefined()
    })

    it('should return the element itself for a singleton set', () => {
      ds.makeSet('a')
      expect(ds.find('a')).toBe('a')
    })

    it('should return root after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const root = ds.find('a')
      expect(root).toBe(ds.find('b'))
    })

    it('should track findCalls in statistics', () => {
      ds.makeSet('a')
      ds.find('a')
      ds.find('a')
      expect(ds.getStatistics().findCalls).toBe(2)
    })

    it('should not count find for missing element in statistics', () => {
      ds.find('missing')
      expect(ds.getStatistics().findCalls).toBe(0)
    })

    it('should return the same root for connected elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      expect(ds.find('a')).toBe(ds.find('c'))
    })

    it('should compress paths', () => {
      for (let i = 0; i < 8; i++) ds.makeSet(`e${i}`)
      ds.union('e0', 'e1')
      ds.union('e2', 'e3')
      ds.union('e4', 'e5')
      ds.union('e6', 'e7')
      ds.union('e0', 'e2')
      ds.union('e4', 'e6')
      ds.union('e0', 'e4')
      ds.find('e7')
      expect(ds.getStatistics().pathCompressions).toBeGreaterThan(0)
    })
  })

  describe('union', () => {
    it('should return true for successful union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.union('a', 'b')).toBe(true)
    })

    it('should return false if either element missing', () => {
      ds.makeSet('a')
      expect(ds.union('a', 'missing')).toBe(false)
      expect(ds.union('missing', 'a')).toBe(false)
    })

    it('should return false for self-union', () => {
      ds.makeSet('a')
      expect(ds.union('a', 'a')).toBe(false)
    })

    it('should return false for already connected elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.union('a', 'b')).toBe(false)
    })

    it('should decrement partition count on successful union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.partitionCount).toBe(2)
      ds.union('a', 'b')
      expect(ds.partitionCount).toBe(1)
    })

    it('should not change partition count on failed union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.union('a', 'b')
      expect(ds.partitionCount).toBe(1)
    })

    it('should track unionCalls', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.union('a', 'b')
      expect(ds.getStatistics().unionCalls).toBe(2)
    })

    it('should track successfulUnions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getStatistics().successfulUnions).toBe(1)
      ds.union('a', 'b')
      expect(ds.getStatistics().successfulUnions).toBe(1)
    })

    it('should handle chain of unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('b', 'c')
      ds.union('c', 'd')
      expect(ds.partitionCount).toBe(1)
      expect(ds.connected('a', 'd')).toBe(true)
    })

    it('should use union by rank', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('c', 'd')
      ds.union('a', 'c')
      expect(ds.getStatistics().maxRank).toBeGreaterThanOrEqual(1)
    })

    it('should return false when both elements missing', () => {
      expect(ds.union('x', 'y')).toBe(false)
    })
  })

  describe('connected', () => {
    it('should return false for non-existent elements', () => {
      expect(ds.connected('x', 'y')).toBe(false)
    })

    it('should return false when one element missing', () => {
      ds.makeSet('a')
      expect(ds.connected('a', 'missing')).toBe(false)
      expect(ds.connected('missing', 'a')).toBe(false)
    })

    it('should return false for elements in different partitions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.connected('a', 'b')).toBe(false)
    })

    it('should return true for elements in same partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.connected('a', 'b')).toBe(true)
    })

    it('should return true for self-connection', () => {
      ds.makeSet('a')
      expect(ds.connected('a', 'a')).toBe(true)
    })

    it('should be transitive', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      expect(ds.connected('a', 'c')).toBe(true)
    })
  })

  describe('has', () => {
    it('should return false for non-existent element', () => {
      expect(ds.has('missing')).toBe(false)
    })

    it('should return true for existing element', () => {
      ds.makeSet('a')
      expect(ds.has('a')).toBe(true)
    })

    it('should return false after clear', () => {
      ds.makeSet('a')
      ds.clear()
      expect(ds.has('a')).toBe(false)
    })

    it('should return true for element still in set after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.has('a')).toBe(true)
      expect(ds.has('b')).toBe(true)
    })
  })

  describe('size', () => {
    it('should be 0 for empty set', () => {
      expect(ds.size).toBe(0)
    })

    it('should increase with makeSet', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.size).toBe(2)
    })

    it('should not increase with duplicate makeSet', () => {
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.size).toBe(1)
    })

    it('should decrease with remove', () => {
      ds.makeSet('a')
      ds.remove('a')
      expect(ds.size).toBe(0)
    })
  })

  describe('partitionCount', () => {
    it('should be 0 for empty set', () => {
      expect(ds.partitionCount).toBe(0)
    })

    it('should equal size when no unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.partitionCount).toBe(3)
    })

    it('should decrease with each successful union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      expect(ds.partitionCount).toBe(2)
      ds.union('b', 'c')
      expect(ds.partitionCount).toBe(1)
    })

    it('should be 1 when all elements unioned', () => {
      for (let i = 0; i < 10; i++) ds.makeSet(`e${i}`)
      for (let i = 1; i < 10; i++) ds.union('e0', `e${i}`)
      expect(ds.partitionCount).toBe(1)
    })
  })

  describe('getPartition', () => {
    it('should return empty array for non-existent element', () => {
      expect(ds.getPartition('missing')).toEqual([])
    })

    it('should return singleton array for isolated element', () => {
      ds.makeSet('a')
      expect(ds.getPartition('a')).toEqual(['a'])
    })

    it('should return all elements in same partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      const part = ds.getPartition('a')
      expect(part).toHaveLength(3)
      expect(part).toContain('a')
      expect(part).toContain('b')
      expect(part).toContain('c')
    })

    it('should not include elements from other partitions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const part = ds.getPartition('a')
      expect(part).toHaveLength(2)
      expect(part).not.toContain('c')
    })

    it('should work when called from any element in partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getPartition('a')).toHaveLength(2)
      expect(ds.getPartition('b')).toHaveLength(2)
    })
  })

  describe('getPartitions', () => {
    it('should return empty array for empty set', () => {
      expect(ds.getPartitions()).toEqual([])
    })

    it('should return single partition for singleton', () => {
      ds.makeSet('a')
      const parts = ds.getPartitions()
      expect(parts).toHaveLength(1)
      expect(parts[0]).toEqual(['a'])
    })

    it('should return separate partitions without unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      const parts = ds.getPartitions()
      expect(parts).toHaveLength(3)
    })

    it('should return merged partitions after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const parts = ds.getPartitions()
      expect(parts).toHaveLength(2)
    })

    it('should return one partition when all unioned', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      const parts = ds.getPartitions()
      expect(parts).toHaveLength(1)
      expect(parts[0]).toHaveLength(3)
    })
  })

  describe('getPartitionSize', () => {
    it('should return 0 for non-existent element', () => {
      expect(ds.getPartitionSize('missing')).toBe(0)
    })

    it('should return 1 for singleton', () => {
      ds.makeSet('a')
      expect(ds.getPartitionSize('a')).toBe(1)
    })

    it('should return correct size after unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      expect(ds.getPartitionSize('a')).toBe(2)
      ds.union('b', 'c')
      expect(ds.getPartitionSize('a')).toBe(3)
    })

    it('should return same size from any element in partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      expect(ds.getPartitionSize('a')).toBe(ds.getPartitionSize('c'))
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.clear()
      expect(ds.size).toBe(0)
    })

    it('should reset partitionCount to 0', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.clear()
      expect(ds.partitionCount).toBe(0)
    })

    it('should reset statistics', () => {
      ds.makeSet('a')
      ds.find('a')
      ds.clear()
      const stats = ds.getStatistics()
      expect(stats.makeSetCalls).toBe(0)
      expect(stats.findCalls).toBe(0)
      expect(stats.unionCalls).toBe(0)
      expect(stats.successfulUnions).toBe(0)
      expect(stats.pathCompressions).toBe(0)
      expect(stats.maxRank).toBe(0)
    })

    it('should allow operations after clear', () => {
      ds.makeSet('a')
      ds.clear()
      ds.makeSet('b')
      expect(ds.size).toBe(1)
      expect(ds.has('b')).toBe(true)
      expect(ds.has('a')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(ds.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      const arr = ds.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain('a')
      expect(arr).toContain('b')
      expect(arr).toContain('c')
    })

    it('should not include removed elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.remove('a')
      const arr = ds.toArray()
      expect(arr).toHaveLength(1)
      expect(arr).toContain('b')
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      let count = 0
      ds.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      const collected: string[] = []
      ds.forEach((el) => collected.push(el))
      expect(collected).toHaveLength(3)
    })

    it('should provide correct index', () => {
      ds.makeSet('x')
      ds.makeSet('y')
      const indices: number[] = []
      ds.forEach((_, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should yield nothing for empty set', () => {
      expect([...ds]).toEqual([])
    })

    it('should yield all elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      const arr = [...ds]
      expect(arr).toHaveLength(2)
    })

    it('should be usable with for-of', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      const collected: string[] = []
      for (const el of ds) {
        collected.push(el)
      }
      expect(collected).toHaveLength(2)
    })
  })

  describe('remove', () => {
    it('should return false for non-existent element', () => {
      expect(ds.remove('missing')).toBe(false)
    })

    it('should return true for existing element', () => {
      ds.makeSet('a')
      expect(ds.remove('a')).toBe(true)
    })

    it('should decrease size', () => {
      ds.makeSet('a')
      ds.remove('a')
      expect(ds.size).toBe(0)
    })

    it('should remove element from its partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.remove('a')
      expect(ds.has('a')).toBe(false)
      expect(ds.has('b')).toBe(true)
    })

    it('should decrease partitionCount', () => {
      ds.makeSet('a')
      ds.remove('a')
      expect(ds.partitionCount).toBe(0)
    })

    it('should split partition when removing non-root from multi-element partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      ds.remove('b')
      expect(ds.has('b')).toBe(false)
      expect(ds.has('a')).toBe(true)
      expect(ds.has('c')).toBe(true)
    })

    it('should work when removing root of partition', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      ds.remove('a')
      expect(ds.has('a')).toBe(false)
      expect(ds.connected('b', 'c')).toBe(true)
    })

    it('should handle removing only element', () => {
      ds.makeSet('a')
      ds.remove('a')
      expect(ds.size).toBe(0)
      expect(ds.partitionCount).toBe(0)
    })

    it('should handle remove followed by re-add', () => {
      ds.makeSet('a')
      ds.remove('a')
      ds.makeSet('a')
      expect(ds.has('a')).toBe(true)
      expect(ds.size).toBe(1)
    })
  })

  describe('path compression', () => {
    it('should compress paths on find', () => {
      for (let i = 0; i < 16; i++) ds.makeSet(`e${i}`)
      for (let i = 0; i < 16; i += 2) ds.union(`e${i}`, `e${i + 1}`)
      for (let i = 0; i < 16; i += 4) ds.union(`e${i}`, `e${i + 2}`)
      for (let i = 0; i < 16; i += 8) ds.union(`e${i}`, `e${i + 4}`)
      ds.union('e0', 'e8')
      ds.find('e15')
      expect(ds.getStatistics().pathCompressions).toBeGreaterThan(0)
    })

    it('should make subsequent finds faster (all point to root)', () => {
      for (let i = 0; i < 8; i++) ds.makeSet(`e${i}`)
      ds.union('e0', 'e1')
      ds.union('e2', 'e3')
      ds.union('e4', 'e5')
      ds.union('e6', 'e7')
      ds.union('e0', 'e2')
      ds.union('e4', 'e6')
      ds.union('e0', 'e4')
      ds.find('e7')
      const stats = ds.getStatistics()
      expect(stats.pathCompressions).toBeGreaterThan(0)
    })

    it('should not increment compressions for direct child', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.find('b')
      expect(ds.getStatistics().pathCompressions).toBe(0)
    })
  })

  describe('union by rank', () => {
    it('should attach smaller tree under larger tree', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('c', 'd')
      ds.union('a', 'c')
      expect(ds.getStatistics().maxRank).toBeGreaterThanOrEqual(1)
    })

    it('should increment rank when equal ranks merged', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getStatistics().maxRank).toBeGreaterThanOrEqual(1)
    })

    it('should keep rank 0 when only one element', () => {
      ds.makeSet('a')
      expect(ds.getStatistics().maxRank).toBe(0)
    })

    it('should track increasing max rank', () => {
      for (let i = 0; i < 8; i++) ds.makeSet(`e${i}`)
      ds.union('e0', 'e1')
      ds.union('e2', 'e3')
      ds.union('e4', 'e5')
      ds.union('e6', 'e7')
      ds.union('e0', 'e2')
      ds.union('e4', 'e6')
      ds.union('e0', 'e4')
      expect(ds.getStatistics().maxRank).toBeGreaterThanOrEqual(2)
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new set', () => {
      const stats = ds.getStatistics()
      expect(stats.makeSetCalls).toBe(0)
      expect(stats.findCalls).toBe(0)
      expect(stats.unionCalls).toBe(0)
      expect(stats.successfulUnions).toBe(0)
      expect(stats.pathCompressions).toBe(0)
      expect(stats.maxRank).toBe(0)
    })

    it('should return a copy', () => {
      ds.makeSet('a')
      const s1 = ds.getStatistics()
      ds.makeSet('b')
      const s2 = ds.getStatistics()
      expect(s1.makeSetCalls).toBe(1)
      expect(s2.makeSetCalls).toBe(2)
    })

    it('should track all operation types', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.find('a')
      ds.union('a', 'b')
      const stats = ds.getStatistics()
      expect(stats.makeSetCalls).toBe(2)
      expect(stats.findCalls).toBe(1)
      expect(stats.unionCalls).toBe(1)
      expect(stats.successfulUnions).toBe(1)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure for empty set', () => {
      const json = ds.toJSON()
      expect(json.elements).toEqual([])
      expect(json.parent).toEqual([])
      expect(json.rank).toEqual([])
      expect(json.partitionCount).toBe(0)
      expect(json.statistics).toBeDefined()
    })

    it('should produce correct structure with elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const json = ds.toJSON()
      expect(json.elements).toHaveLength(2)
      expect(json.parent).toHaveLength(2)
      expect(json.rank).toHaveLength(2)
      expect(json.partitionCount).toBe(1)
    })

    it('should include statistics', () => {
      ds.makeSet('a')
      const json = ds.toJSON()
      expect(json.statistics.makeSetCalls).toBe(1)
    })

    it('should serialize parent indices correctly', () => {
      ds.makeSet('a')
      const json = ds.toJSON()
      expect(json.parent[0]).toBe(0)
    })

    it('should serialize rank values correctly', () => {
      ds.makeSet('a')
      const json = ds.toJSON()
      expect(json.rank[0]).toBe(0)
    })
  })

  describe('fromJSON', () => {
    it('should restore empty set', () => {
      const json = ds.toJSON()
      const restored = PartitionedSet.fromJSON(json)
      expect(restored.size).toBe(0)
      expect(restored.partitionCount).toBe(0)
    })

    it('should restore elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      const json = ds.toJSON()
      const restored = PartitionedSet.fromJSON(json)
      expect(restored.size).toBe(3)
      expect(restored.has('a')).toBe(true)
      expect(restored.has('b')).toBe(true)
      expect(restored.has('c')).toBe(true)
    })

    it('should restore partition structure', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const json = ds.toJSON()
      const restored = PartitionedSet.fromJSON(json)
      expect(restored.partitionCount).toBe(2)
      expect(restored.connected('a', 'b')).toBe(true)
      expect(restored.connected('a', 'c')).toBe(false)
    })

    it('should restore statistics', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const json = ds.toJSON()
      const restored = PartitionedSet.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.makeSetCalls).toBe(2)
      expect(stats.successfulUnions).toBe(1)
    })

    it('should allow operations after restoration', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      const json = ds.toJSON()
      const restored = PartitionedSet.fromJSON(json)
      restored.makeSet('c')
      restored.union('a', 'c')
      expect(restored.connected('a', 'c')).toBe(true)
    })

    it('should round-trip correctly', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const json1 = ds.toJSON()
      const restored = PartitionedSet.fromJSON(json1)
      const json2 = restored.toJSON()
      expect(json1.elements).toEqual(json2.elements)
      expect(json1.parent).toEqual(json2.parent)
      expect(json1.rank).toEqual(json2.rank)
    })

    it('should work with number elements', () => {
      const ns = new PartitionedSet<number>()
      ns.makeSet(1)
      ns.makeSet(2)
      ns.union(1, 2)
      const json = ns.toJSON()
      const restored = PartitionedSet.fromJSON(json)
      expect(restored.connected(1, 2)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      ds.makeSet('a')
      expect(ds.size).toBe(1)
      expect(ds.partitionCount).toBe(1)
      expect(ds.find('a')).toBe('a')
      expect(ds.getPartition('a')).toEqual(['a'])
      expect(ds.getPartitions()).toEqual([['a']])
      expect(ds.getPartitionSize('a')).toBe(1)
    })

    it('should handle all elements unioned into one', () => {
      for (let i = 0; i < 5; i++) ds.makeSet(`e${i}`)
      for (let i = 1; i < 5; i++) ds.union('e0', `e${i}`)
      expect(ds.partitionCount).toBe(1)
      expect(ds.getPartition('e0')).toHaveLength(5)
    })

    it('should handle no elements', () => {
      expect(ds.size).toBe(0)
      expect(ds.partitionCount).toBe(0)
      expect(ds.toArray()).toEqual([])
      expect(ds.getPartitions()).toEqual([])
    })

    it('should handle self-union', () => {
      ds.makeSet('a')
      expect(ds.union('a', 'a')).toBe(false)
      expect(ds.partitionCount).toBe(1)
    })

    it('should handle duplicate makeSet', () => {
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.size).toBe(1)
    })

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) ds.makeSet(`e${i}`)
      expect(ds.size).toBe(100)
      expect(ds.partitionCount).toBe(100)
    })

    it('should handle union of chains', () => {
      for (let i = 0; i < 10; i++) ds.makeSet(`e${i}`)
      for (let i = 0; i < 5; i++) ds.union(`e${i}`, `e${i + 1}`)
      for (let i = 5; i < 9; i++) ds.union(`e${i}`, `e${i + 1}`)
      ds.union('e4', 'e5')
      expect(ds.partitionCount).toBe(1)
      expect(ds.connected('e0', 'e9')).toBe(true)
    })

    it('should handle clear after operations', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.clear()
      expect(ds.size).toBe(0)
      expect(ds.has('a')).toBe(false)
    })

    it('should handle remove from single-element partition', () => {
      ds.makeSet('a')
      ds.remove('a')
      expect(ds.has('a')).toBe(false)
      expect(ds.find('a')).toBeUndefined()
    })

    it('should handle find after complex unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('c', 'd')
      ds.union('a', 'c')
      expect(ds.find('a')).toBe(ds.find('d'))
    })

    it('should handle empty string element', () => {
      ds.makeSet('')
      expect(ds.has('')).toBe(true)
      expect(ds.find('')).toBe('')
    })

    it('should handle null element', () => {
      const ns = new PartitionedSet<null>()
      ns.makeSet(null)
      expect(ns.has(null)).toBe(true)
    })

    it('should handle undefined element', () => {
      const ns = new PartitionedSet<undefined>()
      ns.makeSet(undefined)
      expect(ns.has(undefined)).toBe(true)
    })

    it('should handle numeric element 0', () => {
      const ns = new PartitionedSet<number>()
      ns.makeSet(0)
      expect(ns.has(0)).toBe(true)
    })

    it('should handle false element', () => {
      const ns = new PartitionedSet<boolean>()
      ns.makeSet(false)
      expect(ns.has(false)).toBe(true)
    })
  })

  describe('DEFAULT_PARTITIONED_SET_OPTIONS', () => {
    it('should have trackStatistics true', () => {
      expect(DEFAULT_PARTITIONED_SET_OPTIONS.trackStatistics).toBe(true)
    })
  })

  describe('exports', () => {
    it('should export PartitionedSet class', () => {
      expect(PartitionedSet).toBeDefined()
      expect(typeof PartitionedSet).toBe('function')
    })

    it('should export DEFAULT_PARTITIONED_SET_OPTIONS', () => {
      expect(DEFAULT_PARTITIONED_SET_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports', () => {
      const opts: PartitionedSetOptions = { trackStatistics: true }
      const s = new PartitionedSet(opts)
      expect(s.size).toBe(0)
    })

    it('should allow type import for PartitionedSetJSON', () => {
      ds.makeSet('a')
      const json: PartitionedSetJSON<string> = ds.toJSON()
      expect(json.elements).toHaveLength(1)
    })

    it('should allow type import for PartitionedSetStatistics', () => {
      const stats: PartitionedSetStatistics = ds.getStatistics()
      expect(stats.makeSetCalls).toBe(0)
    })
  })

  describe('integration', () => {
    it('should model graph connectivity', () => {
      const edges: [string, string][] = [['a', 'b'], ['c', 'd'], ['b', 'c']]
      const nodes = new Set(edges.flat())
      for (const n of nodes) ds.makeSet(n)
      for (const [u, v] of edges) ds.union(u, v)
      expect(ds.connected('a', 'd')).toBe(true)
      expect(ds.partitionCount).toBe(1)
    })

    it('should detect disconnected components', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      expect(ds.partitionCount).toBe(3)
      expect(ds.connected('a', 'c')).toBe(false)
      expect(ds.connected('c', 'd')).toBe(false)
    })

    it('should handle Kruskal-like MST building', () => {
      const edges: [number, number][] = [[0, 1], [2, 3], [1, 2], [3, 4]]
      for (let i = 0; i < 5; i++) ds.makeSet(`n${i}`)
      let merged = 0
      for (const [u, v] of edges) {
        if (ds.union(`n${u}`, `n${v}`)) merged++
      }
      expect(merged).toBe(4)
      expect(ds.partitionCount).toBe(1)
    })

    it('should support serialize-modify-serialize cycle', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      const json = ds.toJSON()
      const r = PartitionedSet.fromJSON<string>(json)
      r.makeSet('c')
      r.union('a', 'c')
      expect(r.connected('a', 'c')).toBe(true)
      expect(r.connected('b', 'c')).toBe(false)
    })
  })
})
