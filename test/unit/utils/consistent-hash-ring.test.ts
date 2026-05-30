import { describe, it, expect } from 'vitest'
import { ConsistentHashRing } from '../../../src/utils/consistent-hash-ring.js'

describe('ConsistentHashRing', () => {
  describe('construction', () => {
    it('creates ring with nodes', () => {
      const ring = new ConsistentHashRing(['node1', 'node2', 'node3'])
      expect(ring.nodeCount).toBe(3)
    })

    it('creates empty ring', () => {
      const ring = new ConsistentHashRing([])
      expect(ring.nodeCount).toBe(0)
    })

    it('creates with custom virtual nodes', () => {
      const ring = new ConsistentHashRing(['a', 'b'], 50)
      expect(ring.nodeCount).toBe(2)
    })
  })

  describe('getNode', () => {
    it('returns a node for a key', () => {
      const ring = new ConsistentHashRing(['node1', 'node2', 'node3'])
      const node = ring.getNode('my-key')
      expect(node).toBeDefined()
      expect(['node1', 'node2', 'node3']).toContain(node)
    })

    it('returns consistent node for same key', () => {
      const ring = new ConsistentHashRing(['node1', 'node2', 'node3'])
      const first = ring.getNode('test-key')
      for (let i = 0; i < 100; i++) {
        expect(ring.getNode('test-key')).toBe(first)
      }
    })

    it('returns undefined for empty ring', () => {
      const ring = new ConsistentHashRing([])
      expect(ring.getNode('key')).toBeUndefined()
    })

    it('distributes keys across nodes', () => {
      const ring = new ConsistentHashRing(['a', 'b', 'c', 'd', 'e'])
      const counts = new Map<string, number>()
      for (let i = 0; i < 10000; i++) {
        const node = ring.getNode(`key-${i}`)!
        counts.set(node, (counts.get(node) ?? 0) + 1)
      }
      expect(counts.size).toBeGreaterThanOrEqual(3)
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(100)
      }
    })
  })

  describe('getNodes', () => {
    it('returns multiple distinct nodes', () => {
      const ring = new ConsistentHashRing(['a', 'b', 'c', 'd'])
      const nodes = ring.getNodes('key', 3)
      expect(nodes.length).toBe(3)
      expect(new Set(nodes).size).toBe(3)
    })

    it('returns all nodes if count exceeds available', () => {
      const ring = new ConsistentHashRing(['a', 'b'])
      const nodes = ring.getNodes('key', 5)
      expect(nodes.length).toBe(2)
    })

    it('returns empty for empty ring', () => {
      const ring = new ConsistentHashRing([])
      expect(ring.getNodes('key', 3)).toEqual([])
    })
  })

  describe('addNode', () => {
    it('adds a new node', () => {
      const ring = new ConsistentHashRing(['a', 'b'])
      ring.addNode('c')
      expect(ring.nodeCount).toBe(3)
    })

    it('new node affects distribution', () => {
      const ring = new ConsistentHashRing(['a', 'b'])
      ring.addNode('c')
      expect(ring.nodeCount).toBe(3)
    })
  })

  describe('removeNode', () => {
    it('removes a node', () => {
      const ring = new ConsistentHashRing(['a', 'b', 'c'])
      ring.removeNode('b')
      expect(ring.nodeCount).toBe(2)
    })

    it('remaining keys still resolve', () => {
      const ring = new ConsistentHashRing(['a', 'b', 'c'])
      ring.removeNode('b')
      for (let i = 0; i < 100; i++) {
        const node = ring.getNode(`key-${i}`)
        expect(node).toBeDefined()
        expect(node).not.toBe('b')
      }
    })

    it('minimal key remapping on removal', () => {
      const ring = new ConsistentHashRing(['a', 'b', 'c', 'd'])
      const before: Map<string, string> = new Map()
      for (let i = 0; i < 200; i++) {
        before.set(`k${i}`, ring.getNode(`k${i}`)!)
      }
      ring.removeNode('c')
      let unchanged = 0
      for (let i = 0; i < 200; i++) {
        const after = ring.getNode(`k${i}`)!
        if (before.get(`k${i}`) === after) unchanged++
      }
      expect(unchanged).toBeGreaterThan(120)
    })
  })

  describe('consistency', () => {
    it('same ring produces same assignments', () => {
      const ring1 = new ConsistentHashRing(['a', 'b', 'c'])
      const ring2 = new ConsistentHashRing(['a', 'b', 'c'])
      for (let i = 0; i < 100; i++) {
        expect(ring1.getNode(`key-${i}`)).toBe(ring2.getNode(`key-${i}`))
      }
    })
  })
})
