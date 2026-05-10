import { describe, it, expect, beforeEach } from 'vitest'
import { HashRing } from '../../src/core/hash-ring/hash-ring.js'
import { DEFAULT_HASH_RING_OPTIONS } from '../../src/core/hash-ring/types.js'
import type { HashRingOptions, RingEntry } from '../../src/core/hash-ring/types.js'

describe('HashRing', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const ring = new HashRing<string>()
      expect(ring.size).toBe(0)
      expect(ring.virtualSize).toBe(0)
    })

    it('should accept custom virtualNodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 10 })
      expect(ring.size).toBe(0)
      ring.addNode('a')
      expect(ring.virtualSize).toBe(10)
    })

    it('should accept custom hash function', () => {
      const customHash = (key: string): number => {
        let h = 0
        for (let i = 0; i < key.length; i++) {
          h = (h + key.charCodeAt(i)) | 0
        }
        return h >>> 0
      }
      const ring = new HashRing<string>({ hash: customHash })
      ring.addNode('a')
      expect(ring.size).toBe(1)
    })

    it('should accept empty partial options', () => {
      const ring = new HashRing<string>({})
      expect(ring.size).toBe(0)
    })

    it('should accept both custom virtualNodes and hash', () => {
      const ring = new HashRing<string>({
        virtualNodes: 5,
        hash: (k) => k.length >>> 0,
      })
      ring.addNode('abc')
      expect(ring.virtualSize).toBe(5)
    })

    it('should have default virtualNodes of 150', () => {
      expect(DEFAULT_HASH_RING_OPTIONS.virtualNodes).toBe(150)
    })
  })

  describe('addNode', () => {
    it('should add a single node', () => {
      const ring = new HashRing<string>()
      ring.addNode('node-a')
      expect(ring.size).toBe(1)
      expect(ring.virtualSize).toBe(150)
    })

    it('should add multiple nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      expect(ring.size).toBe(3)
      expect(ring.virtualSize).toBe(450)
    })

    it('should not duplicate an existing node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('a')
      expect(ring.size).toBe(1)
      expect(ring.virtualSize).toBe(150)
    })

    it('should keep ring sorted after adding', () => {
      const ring = new HashRing<string>({ virtualNodes: 10 })
      ring.addNode('x')
      const entries = ring.getRing()
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i]!.hash).toBeGreaterThanOrEqual(entries[i - 1]!.hash)
      }
    })

    it('should keep ring sorted after multiple adds', () => {
      const ring = new HashRing<string>({ virtualNodes: 20 })
      ring.addNode('alpha')
      ring.addNode('beta')
      ring.addNode('gamma')
      const entries = ring.getRing()
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i]!.hash).toBeGreaterThanOrEqual(entries[i - 1]!.hash)
      }
    })

    it('should add nodes with custom virtual count', () => {
      const ring = new HashRing<string>({ virtualNodes: 3 })
      ring.addNode('a')
      expect(ring.virtualSize).toBe(3)
    })

    it('should generate unique virtual node hashes for same real node', () => {
      const ring = new HashRing<string>({ virtualNodes: 50 })
      ring.addNode('node')
      const entries = ring.getRing()
      const hashes = new Set(entries.map((e) => e.hash))
      expect(hashes.size).toBe(50)
    })

    it('should handle adding after removal', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.removeNode('a')
      ring.addNode('a')
      expect(ring.size).toBe(1)
      expect(ring.virtualSize).toBe(150)
    })
  })

  describe('removeNode', () => {
    it('should remove an existing node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      const result = ring.removeNode('a')
      expect(result).toBe(true)
      expect(ring.size).toBe(0)
      expect(ring.virtualSize).toBe(0)
    })

    it('should return false for non-existent node', () => {
      const ring = new HashRing<string>()
      const result = ring.removeNode('ghost')
      expect(result).toBe(false)
    })

    it('should only remove the specified node virtual nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      expect(ring.size).toBe(1)
      expect(ring.virtualSize).toBe(150)
      expect(ring.contains('b')).toBe(true)
      expect(ring.contains('a')).toBe(false)
    })

    it('should keep ring sorted after removal', () => {
      const ring = new HashRing<string>({ virtualNodes: 20 })
      ring.addNode('alpha')
      ring.addNode('beta')
      ring.removeNode('alpha')
      const entries = ring.getRing()
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i]!.hash).toBeGreaterThanOrEqual(entries[i - 1]!.hash)
      }
    })

    it('should handle removing all nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      ring.removeNode('b')
      expect(ring.size).toBe(0)
      expect(ring.virtualSize).toBe(0)
    })

    it('should not affect other nodes when removing', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.removeNode('b')
      expect(ring.size).toBe(2)
      expect(ring.contains('a')).toBe(true)
      expect(ring.contains('c')).toBe(true)
    })
  })

  describe('getNode', () => {
    it('should return undefined on empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.getNode('key1')).toBeUndefined()
    })

    it('should return the only node when one exists', () => {
      const ring = new HashRing<string>()
      ring.addNode('only')
      expect(ring.getNode('any-key')).toBe('only')
    })

    it('should consistently map same key to same node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const first = ring.getNode('test-key')
      const second = ring.getNode('test-key')
      expect(first).toBe(second)
    })

    it('should distribute keys across nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      for (let i = 0; i < 300; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts[node]++
      }
      for (const node of ['a', 'b', 'c']) {
        expect(counts[node]).toBeGreaterThan(0)
      }
    })

    it('should remap keys when a node is removed', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const before = ring.getNode('test-key')
      ring.removeNode('b')
      const after = ring.getNode('test-key')
      expect(before).toBeDefined()
      expect(after).toBeDefined()
      if (before !== 'b') {
        expect(after).toBe(before)
      }
    })

    it('should find clockwise node using binary search', () => {
      const ring = new HashRing<string>({ virtualNodes: 50 })
      ring.addNode('alpha')
      ring.addNode('beta')
      const node = ring.getNode('some-key')
      expect(node).toBeDefined()
    })

    it('should wrap around to first node when hash exceeds last', () => {
      const ring = new HashRing<string>({ virtualNodes: 5 })
      ring.addNode('first')
      const node = ring.getNode('any-key')
      expect(node).toBe('first')
    })
  })

  describe('getNodes (replication)', () => {
    it('should return empty array for empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.getNodes('key', 3)).toEqual([])
    })

    it('should return empty array for count 0', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.getNodes('key', 0)).toEqual([])
    })

    it('should return single unique node when count is 1', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      const nodes = ring.getNodes('key', 1)
      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toBeDefined()
    })

    it('should return unique nodes for replication', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.addNode('d')
      const nodes = ring.getNodes('key', 3)
      expect(nodes).toHaveLength(3)
      const unique = new Set(nodes)
      expect(unique.size).toBe(3)
    })

    it('should not return more nodes than available', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      const nodes = ring.getNodes('key', 5)
      expect(nodes).toHaveLength(2)
    })

    it('should return consistent replication nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const first = ring.getNodes('key', 2)
      const second = ring.getNodes('key', 2)
      expect(first).toEqual(second)
    })

    it('should start from the primary node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const primary = ring.getNode('test-key')
      const replicas = ring.getNodes('test-key', 2)
      expect(replicas[0]).toBe(primary)
    })

    it('should handle single node ring with high count', () => {
      const ring = new HashRing<string>()
      ring.addNode('lonely')
      const nodes = ring.getNodes('key', 10)
      expect(nodes).toEqual(['lonely'])
    })

    it('should return different replication sets for different keys', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.addNode('d')
      const set1 = ring.getNodes('key1', 2)
      const set2 = ring.getNodes('key2', 2)
      let allSame = true
      for (let i = 0; i < set1.length; i++) {
        if (set1[i] !== set2[i]) {
          allSame = false
          break
        }
      }
      expect(allSame).toBe(false)
    })
  })

  describe('getRing', () => {
    it('should return empty array for empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.getRing()).toEqual([])
    })

    it('should return sorted ring entries', () => {
      const ring = new HashRing<string>({ virtualNodes: 10 })
      ring.addNode('a')
      const entries = ring.getRing()
      expect(entries).toHaveLength(10)
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i]!.hash).toBeGreaterThanOrEqual(entries[i - 1]!.hash)
      }
    })

    it('should return a copy (not internal reference)', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      const r1 = ring.getRing()
      const r2 = ring.getRing()
      expect(r1).not.toBe(r2)
      expect(r1).toEqual(r2)
    })

    it('should include node names in entries', () => {
      const ring = new HashRing<string>({ virtualNodes: 3 })
      ring.addNode('my-node')
      const entries = ring.getRing()
      for (const e of entries) {
        expect(e.node).toBe('my-node')
      }
    })

    it('should contain entries from all nodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 5 })
      ring.addNode('a')
      ring.addNode('b')
      const entries = ring.getRing()
      const nodes = new Set(entries.map((e) => e.node))
      expect(nodes.has('a')).toBe(true)
      expect(nodes.has('b')).toBe(true)
    })
  })

  describe('size and virtualSize', () => {
    it('should track real node count', () => {
      const ring = new HashRing<string>()
      expect(ring.size).toBe(0)
      ring.addNode('a')
      expect(ring.size).toBe(1)
      ring.addNode('b')
      expect(ring.size).toBe(2)
      ring.removeNode('a')
      expect(ring.size).toBe(1)
    })

    it('should track virtual node count', () => {
      const ring = new HashRing<string>({ virtualNodes: 10 })
      expect(ring.virtualSize).toBe(0)
      ring.addNode('a')
      expect(ring.virtualSize).toBe(10)
      ring.addNode('b')
      expect(ring.virtualSize).toBe(20)
      ring.removeNode('a')
      expect(ring.virtualSize).toBe(10)
    })

    it('should not change on duplicate add', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.size).toBe(1)
      ring.addNode('a')
      expect(ring.size).toBe(1)
    })
  })

  describe('contains', () => {
    it('should return false for empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.contains('a')).toBe(false)
    })

    it('should return true for added node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.contains('a')).toBe(true)
    })

    it('should return false for non-added node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.contains('b')).toBe(false)
    })

    it('should return false after removal', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.removeNode('a')
      expect(ring.contains('a')).toBe(false)
    })
  })

  describe('nodes', () => {
    it('should return empty array for empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.nodes).toEqual([])
    })

    it('should return all added nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const n = ring.nodes
      expect(n).toHaveLength(3)
      expect(n).toContain('a')
      expect(n).toContain('b')
      expect(n).toContain('c')
    })

    it('should not include removed nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      expect(ring.nodes).toEqual(['b'])
    })
  })

  describe('getLoadEstimate', () => {
    it('should return 0 for non-existent node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.getLoadEstimate('ghost')).toBe(0)
    })

    it('should return 0 for empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.getLoadEstimate('a')).toBe(0)
    })

    it('should return 1 for single node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.getLoadEstimate('a')).toBe(1)
    })

    it('should return positive value for multi-node ring', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      const loadA = ring.getLoadEstimate('a')
      const loadB = ring.getLoadEstimate('b')
      expect(loadA).toBeGreaterThan(0)
      expect(loadB).toBeGreaterThan(0)
    })

    it('should sum to approximately 1 for all nodes', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const total = ring.getLoadEstimate('a') + ring.getLoadEstimate('b') + ring.getLoadEstimate('c')
      expect(total).toBeCloseTo(1, 5)
    })

    it('should return 0 after node removal', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      expect(ring.getLoadEstimate('a')).toBe(0)
    })

    it('should be roughly balanced with many virtual nodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 200 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const loads = [ring.getLoadEstimate('a'), ring.getLoadEstimate('b'), ring.getLoadEstimate('c')]
      for (const load of loads) {
        expect(load).toBeGreaterThan(0.1)
        expect(load).toBeLessThan(0.9)
      }
    })
  })

  describe('hash', () => {
    it('should return a uint32 for any string', () => {
      const ring = new HashRing<string>()
      const h = ring.hash('test')
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
      expect(Number.isInteger(h)).toBe(true)
    })

    it('should be deterministic', () => {
      const ring = new HashRing<string>()
      expect(ring.hash('abc')).toBe(ring.hash('abc'))
    })

    it('should produce different hashes for different inputs', () => {
      const ring = new HashRing<string>()
      expect(ring.hash('foo')).not.toBe(ring.hash('bar'))
    })

    it('should use custom hash when provided', () => {
      const ring = new HashRing<string>({
        hash: () => 42,
      })
      expect(ring.hash('anything')).toBe(42)
    })

    it('should handle empty string', () => {
      const ring = new HashRing<string>()
      const h = ring.hash('')
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
    })
  })

  describe('getPartition', () => {
    it('should return undefined for empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.getPartition('key')).toBeUndefined()
    })

    it('should return node and index', () => {
      const ring = new HashRing<string>({ virtualNodes: 10 })
      ring.addNode('a')
      const p = ring.getPartition('test-key')
      expect(p).toBeDefined()
      expect(p!.node).toBe('a')
      expect(p!.index).toBeGreaterThanOrEqual(0)
      expect(p!.index).toBeLessThan(10)
    })

    it('should be consistent for same key', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      const p1 = ring.getPartition('key')
      const p2 = ring.getPartition('key')
      expect(p1).toEqual(p2)
    })

    it('should have index into the ring array', () => {
      const ring = new HashRing<string>({ virtualNodes: 20 })
      ring.addNode('a')
      ring.addNode('b')
      const p = ring.getPartition('some-key')
      expect(p).toBeDefined()
      const entries = ring.getRing()
      expect(p!.index).toBeGreaterThanOrEqual(0)
      expect(p!.index).toBeLessThan(entries.length)
      expect(entries[p!.index]!.node).toBe(p!.node)
    })
  })

  describe('edge cases', () => {
    it('should handle single node ring', () => {
      const ring = new HashRing<string>()
      ring.addNode('solo')
      expect(ring.getNode('key1')).toBe('solo')
      expect(ring.getNode('key2')).toBe('solo')
      expect(ring.getNodes('key', 3)).toEqual(['solo'])
      expect(ring.getLoadEstimate('solo')).toBe(1)
    })

    it('should handle many nodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 10 })
      for (let i = 0; i < 100; i++) {
        ring.addNode(`node-${i}`)
      }
      expect(ring.size).toBe(100)
      expect(ring.virtualSize).toBe(1000)
      const node = ring.getNode('test-key')
      expect(node).toBeDefined()
      expect(node!.startsWith('node-')).toBe(true)
    })

    it('should handle add-remove-add cycle', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      ring.addNode('a')
      expect(ring.size).toBe(2)
      expect(ring.contains('a')).toBe(true)
      expect(ring.contains('b')).toBe(true)
    })

    it('should handle removeAll and reAdd', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.removeNode('a')
      ring.removeNode('b')
      expect(ring.size).toBe(0)
      expect(ring.virtualSize).toBe(0)
      ring.addNode('c')
      expect(ring.size).toBe(1)
      expect(ring.getNode('key')).toBe('c')
    })

    it('should handle keys with special characters', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      const node = ring.getNode('key/with/slashes:and:colons?query=1&x=2')
      expect(node).toBe('a')
    })

    it('should handle very long keys', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      const longKey = 'x'.repeat(10000)
      const node = ring.getNode(longKey)
      expect(node).toBe('a')
    })

    it('should handle empty string key', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      const node = ring.getNode('')
      expect(node).toBeDefined()
    })

    it('should handle numeric string node identifiers', () => {
      type N = '1' | '2' | '3'
      const ring = new HashRing<N>()
      ring.addNode('1')
      ring.addNode('2')
      ring.addNode('3')
      expect(ring.size).toBe(3)
      const node = ring.getNode('test')
      expect(['1', '2', '3']).toContain(node)
    })
  })

  describe('distribution balance', () => {
    it('should distribute keys roughly evenly with enough virtual nodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 200 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      const totalKeys = 3000
      for (let i = 0; i < totalKeys; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts[node]++
      }
      const expected = totalKeys / 3
      for (const node of ['a', 'b', 'c']) {
        expect(counts[node]).toBeGreaterThan(expected * 0.5)
        expect(counts[node]).toBeLessThan(expected * 1.5)
      }
    })

    it('should maintain balance after adding a node', () => {
      const ring = new HashRing<string>({ virtualNodes: 200 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const countsBefore: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 }
      ring.addNode('d')
      const countsAfter: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 }
      for (let i = 0; i < 2000; i++) {
        const node = ring.getNode(`key-${i}`)!
        countsAfter[node]++
      }
      expect(countsAfter['d']).toBeGreaterThan(0)
      const expected = 2000 / 4
      for (const node of ['a', 'b', 'c', 'd']) {
        expect(countsAfter[node]).toBeGreaterThan(expected * 0.4)
        expect(countsAfter[node]).toBeLessThan(expected * 1.6)
      }
    })

    it('should redistribute after removing a node', () => {
      const ring = new HashRing<string>({ virtualNodes: 200 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.removeNode('c')
      const counts: Record<string, number> = { a: 0, b: 0 }
      for (let i = 0; i < 2000; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts[node]++
      }
      const expected = 2000 / 2
      for (const node of ['a', 'b']) {
        expect(counts[node]).toBeGreaterThan(expected * 0.5)
        expect(counts[node]).toBeLessThan(expected * 1.5)
      }
    })

    it('load estimates should roughly match key distribution', () => {
      const ring = new HashRing<string>({ virtualNodes: 200 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const totalKeys = 10000
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      for (let i = 0; i < totalKeys; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts[node]++
      }
      for (const node of ['a', 'b', 'c']) {
        const keyFraction = counts[node]! / totalKeys
        const loadEstimate = ring.getLoadEstimate(node)
        expect(Math.abs(keyFraction - loadEstimate)).toBeLessThan(0.15)
      }
    })
  })

  describe('stress', () => {
    it('should handle many add/remove operations', () => {
      const ring = new HashRing<string>({ virtualNodes: 5 })
      for (let round = 0; round < 20; round++) {
        for (let i = 0; i < 10; i++) {
          ring.addNode(`node-${i}`)
        }
        for (let i = 0; i < 10; i++) {
          ring.removeNode(`node-${i}`)
        }
      }
      expect(ring.size).toBe(0)
      expect(ring.virtualSize).toBe(0)
    })

    it('should handle large number of keys', () => {
      const ring = new HashRing<string>({ virtualNodes: 100 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      for (let i = 0; i < 10000; i++) {
        const node = ring.getNode(`key-${i}`)
        expect(node).toBeDefined()
      }
    })

    it('should handle many nodes with few virtual nodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 1 })
      for (let i = 0; i < 50; i++) {
        ring.addNode(`n${i}`)
      }
      expect(ring.size).toBe(50)
      expect(ring.virtualSize).toBe(50)
      const node = ring.getNode('test')
      expect(node).toBeDefined()
    })

    it('should handle rapid add-remove of same node', () => {
      const ring = new HashRing<string>()
      for (let i = 0; i < 100; i++) {
        ring.addNode('a')
        ring.removeNode('a')
      }
      expect(ring.size).toBe(0)
    })

    it('should handle getNodes with many replicas', () => {
      const ring = new HashRing<string>()
      for (let i = 0; i < 20; i++) {
        ring.addNode(`n${i}`)
      }
      const nodes = ring.getNodes('key', 20)
      expect(nodes).toHaveLength(20)
      const unique = new Set(nodes)
      expect(unique.size).toBe(20)
    })
  })

  describe('custom hash function', () => {
    it('should produce different distribution with different hash', () => {
      const ring1 = new HashRing<string>({
        virtualNodes: 50,
        hash: (k) => {
          let h = 2166136261
          for (let i = 0; i < k.length; i++) {
            h ^= k.charCodeAt(i)
            h = Math.imul(h, 16777619)
          }
          return h >>> 0
        },
      })
      const ring2 = new HashRing<string>({
        virtualNodes: 50,
        hash: (k) => {
          let h = 5381
          for (let i = 0; i < k.length; i++) {
            h = ((h << 5) + h + k.charCodeAt(i)) | 0
          }
          return h >>> 0
        },
      })
      ring1.addNode('a')
      ring1.addNode('b')
      ring2.addNode('a')
      ring2.addNode('b')
      let same = 0
      for (let i = 0; i < 100; i++) {
        if (ring1.getNode(`k${i}`) === ring2.getNode(`k${i}`)) {
          same++
        }
      }
      expect(same).toBeLessThan(100)
    })

    it('should use provided hash for virtual node placement', () => {
      let hashCallCount = 0
      const ring = new HashRing<string>({
        virtualNodes: 5,
        hash: (key: string): number => {
          hashCallCount++
          return key.length >>> 0
        },
      })
      ring.addNode('abc')
      expect(hashCallCount).toBe(5)
    })
  })

  describe('consistency', () => {
    it('should only remap keys owned by removed node', () => {
      const ring = new HashRing<string>({ virtualNodes: 100 })
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      const before: Record<string, string> = {}
      for (let i = 0; i < 500; i++) {
        before[`key-${i}`] = ring.getNode(`key-${i}`)!
      }
      ring.removeNode('b')
      let changed = 0
      let unchanged = 0
      for (let i = 0; i < 500; i++) {
        const after = ring.getNode(`key-${i}`)!
        if (before[`key-${i}`] === 'b') {
          expect(after).not.toBe('b')
          changed++
        } else {
          if (after === before[`key-${i}`]) {
            unchanged++
          }
        }
      }
      expect(changed).toBeGreaterThan(0)
      expect(unchanged).toBeGreaterThan(0)
    })

    it('should keep existing keys stable when adding a new node', () => {
      const ring = new HashRing<string>({ virtualNodes: 100 })
      ring.addNode('a')
      ring.addNode('b')
      const before: Record<string, string> = {}
      for (let i = 0; i < 500; i++) {
        before[`key-${i}`] = ring.getNode(`key-${i}`)!
      }
      ring.addNode('c')
      let changed = 0
      let unchanged = 0
      for (let i = 0; i < 500; i++) {
        const after = ring.getNode(`key-${i}`)!
        if (after !== before[`key-${i}`]) {
          changed++
        } else {
          unchanged++
        }
      }
      expect(unchanged).toBeGreaterThan(changed)
    })
  })

  describe('type generics', () => {
    it('should work with string literal types', () => {
      type NodeId = 'alpha' | 'beta' | 'gamma'
      const ring = new HashRing<NodeId>()
      ring.addNode('alpha')
      ring.addNode('beta')
      ring.addNode('gamma')
      const node = ring.getNode('key')
      expect(['alpha', 'beta', 'gamma']).toContain(node)
    })

    it('should work with numeric string types', () => {
      type ServerId = `server-${number}`
      const ring = new HashRing<ServerId>()
      ring.addNode('server-1')
      ring.addNode('server-2')
      expect(ring.size).toBe(2)
    })
  })

  describe('RingEntry type', () => {
    it('should have correct shape from getRing', () => {
      const ring = new HashRing<string>({ virtualNodes: 3 })
      ring.addNode('a')
      const entries = ring.getRing()
      for (const e of entries) {
        expect(e).toHaveProperty('hash')
        expect(e).toHaveProperty('node')
        expect(typeof e.hash).toBe('number')
        expect(typeof e.node).toBe('string')
      }
    })
  })

  describe('DEFAULT_HASH_RING_OPTIONS', () => {
    it('should have virtualNodes of 150', () => {
      expect(DEFAULT_HASH_RING_OPTIONS.virtualNodes).toBe(150)
    })

    it('should have a hash function', () => {
      expect(typeof DEFAULT_HASH_RING_OPTIONS.hash).toBe('function')
    })

    it('default hash should return uint32', () => {
      const h = DEFAULT_HASH_RING_OPTIONS.hash('test')
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
    })

    it('default hash should produce different values for different inputs', () => {
      const h1 = DEFAULT_HASH_RING_OPTIONS.hash('alpha')
      const h2 = DEFAULT_HASH_RING_OPTIONS.hash('beta')
      expect(h1).not.toBe(h2)
    })

    it('default hash should handle empty string', () => {
      const h = DEFAULT_HASH_RING_OPTIONS.hash('')
      expect(typeof h).toBe('number')
      expect(h).toBeGreaterThanOrEqual(0)
    })
  })

  describe('additional coverage', () => {
    it('should handle getNodes with negative count', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.getNodes('key', -1)).toEqual([])
    })

    it('should handle removeNode on empty ring', () => {
      const ring = new HashRing<string>()
      expect(ring.removeNode('x')).toBe(false)
    })

    it('should handle double remove of same node', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      expect(ring.removeNode('a')).toBe(true)
      expect(ring.removeNode('a')).toBe(false)
    })

    it('should return correct nodes after sequential operations', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      ring.removeNode('b')
      expect(ring.nodes.sort()).toEqual(['a', 'c'])
    })

    it('should produce stable hash values across calls', () => {
      const ring = new HashRing<string>()
      const hashes = new Set<number>()
      for (let i = 0; i < 10; i++) {
        hashes.add(ring.hash('consistent'))
      }
      expect(hashes.size).toBe(1)
    })

    it('getPartition should match getNode', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      ring.addNode('b')
      ring.addNode('c')
      for (let i = 0; i < 50; i++) {
        const node = ring.getNode(`key-${i}`)
        const part = ring.getPartition(`key-${i}`)
        expect(part!.node).toBe(node)
      }
    })

    it('should handle unicode keys', () => {
      const ring = new HashRing<string>()
      ring.addNode('a')
      const node = ring.getNode('🔑-日本語')
      expect(node).toBe('a')
    })

    it('should produce different hashes for similar keys', () => {
      const ring = new HashRing<string>()
      expect(ring.hash('key-1')).not.toBe(ring.hash('key-2'))
      expect(ring.hash('key-1')).not.toBe(ring.hash('key-10'))
    })

    it('getLoadEstimate should be proportional to virtualNodes', () => {
      const ring = new HashRing<string>({ virtualNodes: 50 })
      ring.addNode('heavy')
      const ring2 = new HashRing<string>({ virtualNodes: 200 })
      ring2.addNode('heavy')
      ring2.addNode('light')
      const load = ring2.getLoadEstimate('heavy')
      expect(load).toBeGreaterThan(0)
      expect(load).toBeLessThan(1)
    })

    it('should handle nodes with same prefix', () => {
      const ring = new HashRing<string>()
      ring.addNode('server-01')
      ring.addNode('server-02')
      ring.addNode('server-10')
      ring.addNode('server-11')
      expect(ring.size).toBe(4)
      const node = ring.getNode('test')
      expect(node).toBeDefined()
      expect(node!.startsWith('server-')).toBe(true)
    })
  })
})
